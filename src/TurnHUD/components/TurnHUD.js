import React from 'react'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function askPermission() {
  return new Promise((resolve, reject) => {
    const permissionResult = Notification.requestPermission((result) => {
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  });
}

function subscribeUserToPush() {
  navigator.serviceWorker.register('/sw2.js');
  return navigator.serviceWorker.ready
  .then((registration) => {
    if (!registration) {
      console.log('FAILED TO GET SERVICE WORKER REGISTRATION');
      return;
    }
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'BAN72E3hbQ14KDaYyr9tSTXewOB9CvN-sSyQuk0vPq-V755kPnoCivqUZvP8ib1p_MFgIiLgNYb_eT6N0uYYIuo'
      )
    };

    return registration.pushManager.subscribe(subscribeOptions);
  })
}


class TurnHUD extends React.Component {
  componentDidMount() {
    askPermission()
    .then((permissionResult) => {
      if (permissionResult !== 'granted') {
        console.log('We weren\'t granted permission.');
      }
      subscribeUserToPush()
      .then((pushSubscription) => {
        if (!pushSubscription) {
          console.log('FAILED TO PUSH SUBSCRIBE');
          return;
        }
        this.props.savePushSubscription(pushSubscription);
        console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
        return pushSubscription;
      });
    });
  }

  render() {
    let promptText = () => {
      var text = prompt('Say something');
      if (text) {
        this.props.sendMessage(this.props.match_code, this.props.player, text);
        console.log(text);
      }
    }
    let messages_els = [];
    for (var i =0; i<this.props.messages.length; i++) {
      let m = this.props.messages[i];
      messages_els.push(
        (<p style={{color: "white"}}>
          <span style={{color: this.props.playersSecondaryColors[m.player]}}>
            <b>{this.props.players[m.player]}</b>
          </span>: {m.text}
         </p>));
    }
    let winLayer = null;
    if (this.props.winner != null) {
      winLayer = (<div style={{position: 'absolute', left: 0, top: 0,
        right:0, height: '100%', background: 'rgba(255,255,255,.85)',
        zIndex: 9000, display: 'block', textAlign: 'center'}}>
        <div style={{transform: 'translateX(-50%) translateY(-50%)',
          left: '50%', top: '50%', position: 'absolute'}}>
          <h1>{this.props.players[this.props.winner]} WON!!!
          </h1>
          <a href="/">Go Back</a>
        </div>
      </div>)
    }
    messages_els.reverse();
    return (
    <div>
    <div style={{width: "100%", position: "fixed",
    left: "0px", right:"0px", top: "0px",
    maxWidth: "500px", marginLeft: "auto", marginRight: "auto", zIndex: 999,
    pointerEvents: "none"}}>
    <svg viewBox="0 0 80 10">
     <g>
       <rect height="10" width="80" y="0" x="0" fill="white"></rect>
       <rect height="10" width="13.9" y="0" x="0" fill="white"
        onClick={promptText} style={{pointerEvents:'all'}}></rect>
       <rect fillOpacity=".1" height="8.5" width=".1" y=".75" x="14"></rect>
       <g transform="matrix(.4 0 0 .4 69 .5)">
        <path d="m9 16.2-4.2-4.2-1.4 1.4 5.6 5.6 12-12-1.4-1.4-10.6 10.6z" fillOpacity={1}></path>
       </g>

       <g transform="matrix(.4 0 0 .4 2 .5)" onClick={promptText} style={{pointerEvents:'all'}}>
        <path d="m21.99 4c0-1.1-0.89-2-1.99-2h-16c-1.1 0-2 0.9-2 2v12c0 1.1 0.9 2 2 2h14l4 4-0.01-18zm-3.99 10h-12v-2h12v2zm0-3h-12v-2h12v2zm0-3h-12v-2h12v2z"></path>
       </g>
      <rect fillOpacity=".1" height="8.5" width=".1" y=".75" x="67"></rect>
      <text fontFamily="sans-serif"
            style={{textAnchor: "middle", textAlign: "center"}}>
        <tspan fontSize="4px" x="40" y="9">
          {(this.props.currentPlayer == this.props.player) ?
              'PLAY' : 'WAIT'}
        </tspan>
      </text>
      <text x="40" fill={this.props.playersPrimaryColors[this.props.currentPlayer]}
            fontFamily="sans-serif"
            style={{textAnchor: "middle", textAlign: "center"}}>
        <tspan fontSize="4px" y="4px" x="40">
          {this.props.players[this.props.currentPlayer]}
        </tspan>
      </text>
    </g>
    </svg>
    {messages_els}
    </div>
    {winLayer}
    </div>);
  };
};

TurnHUD.defaultProps = {
  match_code: '',
  players: [],
  player: 0,
  playersPrimaryColors: ['black', 'grey'], // Light background
  playersSecondaryColors: ['grey', 'white'], // Dark background
  currentPlayer: 0,
  winner: null,
  messages: [],
  sendMessage: () => {},
  savePushSubscription: () => {}
};
export default TurnHUD
