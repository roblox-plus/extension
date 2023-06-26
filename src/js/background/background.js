// background.js [3/30/2016]
/*
	For any questions message WebGL3D https://www.roblox.com/messages/compose?recipientId=48103520
	My messages will always be open for all, if you can't PM me check your settings.
*/
foreach(
  {
    friendNotifier: {
      on: false,
      online: false,
      offline: false,
      game: true,
    },
    notificationVolume: 0.5,
    notifierSounds: {
      item: 205318910,
      tradeInbound: 0,
      tradeOutbound: 0,
      tradeCompleted: 0,
      tradeDeclined: 0,
      friend: 0,
      messages: 0,
      groupShout: 0,
    },
    groupShoutNotifierList: { 2518656: 'Roblox+ Fan Group' },
    navigation: {
      sideOpen: false,
      counterCommas: 100000000,
      buttons: [
        { text: 'Create', href: '/develop' },
        { text: 'Robux', href: '/robux?ctx-nav' },
      ],
    },
    userSince: getMil(),
  },
  function (n, o) {
    Extension.Storage.Singleton.get(n)
      .then((v) => {
        if (type(v) != type(o)) {
          Extension.Storage.Singleton.blindSet(n, o);
        }
      })
      .catch((e) => {
        console.warn('Could not get default value', n, e);
      });
  }
);

// WebGL3D
