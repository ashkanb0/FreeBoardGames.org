import { Client } from '@freeboardgame.org/boardgame.io/client';
import { TakeSixGame, IG, selectCard, selectDeck } from './game';
import Player from './player';
import Card from './card';

// https://github.com/nicolodavis/boardgame.io/blob/master/docs/testing.md
it('should move player\'s card from his hand to selectedCard', () => {
  const card = new Card(1, 1, 0);
  let G: IG = {
    players: [new Player([card], null)],
    cardOrder: [],
    decks: [],
    end: false,
  };
  G = selectCard(G, { playerID: '0' } as any, 0);
  expect(G.players[0].cards).toEqual([]);
  expect(G.players[0].selectedCard).toEqual(card);
});

it('should move whole deck to player\'s hand as penaltyCards', () => {
  const card = new Card(104, 1, 0);
  let G: IG = {
    players: [new Player([], card)],
    cardOrder: [],
    decks: [
      [new Card(4, 1, 0),
      new Card(5, 1, 0),
      new Card(6, 1, 0),
      new Card(7, 1, 0),
      new Card(8, 1, 0)],
      [new Card(3, 1, 0)],
      [new Card(2, 1, 0)],
      [new Card(1, 1, 0)]],
    end: false,
  };
  G = selectDeck(G, { playerID: '0' } as any, 0);
  expect(G.decks[0]).toEqual([card]);
  expect(G.players[0].penaltyCards).toHaveLength(5);
});
