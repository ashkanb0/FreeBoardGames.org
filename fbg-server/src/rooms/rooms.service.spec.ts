import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { UsersService } from '../users/users.service';
import { FakeDbModule, closeDbConnection } from '../testing/dbUtil';
import { RoomsModule } from '../rooms/rooms.module';
import { UsersModule } from '../users/users.module';
import { Room } from '../dto/rooms/Room';
import { Connection } from 'typeorm';

describe('RoomsService', () => {
  let module: TestingModule;
  let service: RoomsService;
  let usersService: UsersService;
  let connection: Connection;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [FakeDbModule, UsersModule, RoomsModule],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    service = module.get<RoomsService>(RoomsService);
    connection = module.get<Connection>(Connection);
  });

  afterAll(async () => {
    closeDbConnection(module);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a room successfully', async () => {
    const room: Room = { capacity: 2, gameCode: 'checkers', isPublic: false };
    const id = await service.newRooom(room);
    const newRoom = await service.getRoom(id);
    expect(newRoom).toEqual({ id, users: [], ...room });
  });

  it('should join room successfully', async () => {
    console.log('=== SUCCESS ===');
    const roomId = await service.newRooom({ capacity: 2, gameCode: 'checkers', isPublic: false });
    const userId = await usersService.newUser({ nickname: 'foo' });
    console.log('JOIN ROOM 1');
    await service.joinRoom(userId, roomId);
    const newRoom = await service.getRoom(roomId);
    expect(newRoom.users).toEqual([{ id: userId, nickname: 'foo' }]);
  });

  async function roomTwice() {
    //it('should not allow joining the same room twice', async () => {
    console.log('=== ROOM TWICE ===');
    const roomId = await service.newRooom({ capacity: 2, gameCode: 'checkers', isPublic: false });
    const userId = await usersService.newUser({ nickname: 'foo' });
    console.log('JOIN ROOM 2');
    await service.joinRoom(userId, roomId);
    console.log('JOIN ROOM 3');
    const secondJoin = service.joinRoom(userId, roomId);
    expect(secondJoin).rejects.toThrow();
    //});
  }

  async function aboveCapacity() {
    //it('should not allow room going above capacity', async () => {
    console.log('=== ABOVE CAPACITY ===');
    const roomId = await service.newRooom({ capacity: 2, gameCode: 'checkers', isPublic: false });
    const fooUserId = await usersService.newUser({ nickname: 'foo' });
    const barUserId = await usersService.newUser({ nickname: 'bar' });
    const bazUserId = await usersService.newUser({ nickname: 'baz' });
    console.log('JOIN ROOM 4');
    await service.joinRoom(fooUserId, roomId);
    console.log('JOIN ROOM 5');
    await service.joinRoom(barUserId, roomId);
    console.log('JOIN ROOM 6');
    const bazJoins = service.joinRoom(bazUserId, roomId);
    expect(bazJoins).rejects.toThrow();
    //});
  }

  it('roomTwice and aboveCapacity', async () => {
    await roomTwice();
    await aboveCapacity();
  });
});