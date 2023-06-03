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

/* Startup Notification */
Extension.Storage.Singleton.get('startupNotification')
  .then((startnote) => {
    if (!startnote || typeof startnote !== 'object') {
      startnote = {
        on: !Extension.Singleton.isIncognito,
        visit: false,
        names: {},
      };

      Extension.Storage.Singleton.blindSet('startupNotification', startnote);
    }

    const makenote = function () {
      Roblox.users.getAuthenticatedUser().then(function (user) {
        var username = user ? user.username : '';
        for (var n in startnote.names) {
          if (n.toLowerCase() === username.toLowerCase()) {
            username = startnote.names[n];
            break;
          }
        }

        let startNotificationId = `${Extension.Singleton.id}.startNotification`;
        RPlus.settings
          .get()
          .then(function (ul) {
            Extension.NotificationService.Singleton.createNotification({
              id: startNotificationId,
              title: user
                ? `Hello, ${user.username}!`
                : "You're currently signed out",
              message: 'Made by WebGL3D',
              context: `${Extension.Singleton.manifest.name} ${Extension.Singleton.manifest.version} started`,
              expiration: 15 * 1000,
              buttons: [
                {
                  text: 'Problems? Suggestions? Post here!',
                  url: 'https://www.roblox.com/groups/2518656/ROBLOX-Fan-Group?rbxp=48103520',
                },
              ],
              metadata: {
                url:
                  ul.updateLog ||
                  'https://www.roblox.com/users/48103520/profile?rbxp=48103520',
              },
            });
          })
          .catch(function (e) {
            console.warn('no startup notification', e);
          });
      });
    };

    startnote.names = type(startnote.names) == 'object' ? startnote.names : {};
    if (startnote.on && !startnote.visit) {
      makenote();
    } else if (startnote.on) {
      var listener;
      listener = function () {
        chrome.webRequest.onCompleted.removeListener(listener);
        makenote();
      };
      chrome.webRequest.onCompleted.addListener(listener, {
        types: ['main_frame'],
        urls: ['*://*.roblox.com/*'],
      });
    }
  })
  .catch((e) => {
    console.warn('could not read startupNotification', e);
  });

// WebGL3D
