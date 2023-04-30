/*
	roblox/games.js [03/18/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Games = class extends Extension.BackgroundService {
  constructor() {
    super('Roblox.games');

    this.register([
      this.getVipServerById,
      this.getVipServers,
      this.getGroupGames,
      this.hasJoinedServer,
      this.trackJoinedServer,
    ]);
  }

  getIdFromUrl(url) {
    return (
      Number(
        (url.match(/\/games\/(\d+)\//i) ||
          url.match(/place\.aspx.*id=(\d+)/i) ||
          url.match(/place\?.*id=(\d+)/i) || ['', 0])[1]
      ) || 0
    );
  }

  getGameUrl(placeId, placeName) {
    if (typeof placeName != 'string' || !placeName) {
      placeName = 'redirect';
    } else {
      placeName =
        placeName.replace(/\W+/g, '-').replace(/^-+/, '').replace(/-+$/, '') ||
        'redirect';
    }

    return `https://www.roblox.com/games/${placeId}/${placeName}`;
  }

  getVipServerById(vipServerId) {
    return CachedPromise(
      `${this.serviceId}.getVipServers`,
      (resolve, reject) => {
        $.get(`https://games.roblox.com/v1/vip-servers/${vipServerId}`)
          .done((r) => {
            const expirationDate = new Date(r.subscription.expirationDate);
            resolve({
              id: r.id,
              name: r.name,
              expirationDate: expirationDate.getTime(),
            });
          })
          .fail(Roblox.api.$reject(reject));
      },
      [vipServerId],
      {
        queued: true,
        resolveExpiry: 15 * 1000,
        rejectExpiry: 10 * 1000,
      }
    );
  }

  getVipServers(placeId, cursor) {
    return CachedPromise(
      `${this.serviceId}.getVipServers`,
      (resolve, reject) => {
        Roblox.users
          .getAuthenticatedUser()
          .then((authenticatedUser) => {
            $.get(
              `https://games.roblox.com/v1/games/${placeId}/private-servers`,
              {
                limit: 100,
                cursor: cursor || '',
              }
            )
              .done((r) => {
                const vipServers = [];
                const vipServerPromises = [];

                r.data.forEach((server) => {
                  if (server.owner.id === authenticatedUser.id) {
                    vipServerPromises.push(
                      this.getVipServerById(server.vipServerId).then(
                        (vipServer) => {
                          vipServer.owner = server.owner;
                          vipServers.push(vipServer);
                        }
                      )
                    );
                  } else {
                    vipServers.push({
                      id: server.vipServerId,
                      name: server.name,
                      owner: server.owner,
                    });
                  }
                });

                Promise.all(vipServerPromises)
                  .then(() => {
                    if (r.nextPageCursor) {
                      this.getVipServers(placeId, r.nextPageCursor)
                        .then((moreVipServers) => {
                          resolve(vipServers.concat(moreVipServers));
                        })
                        .catch(reject);
                    } else {
                      resolve(vipServers);
                    }
                  })
                  .catch(reject);
              })
              .fail(Roblox.api.$reject(reject));
          })
          .catch(reject);
      },
      [placeId, cursor],
      {
        resolveExpiry: 15 * 1000,
        rejectExpiry: 10 * 1000,
      }
    );
  }

  getGroupGames(groupId) {
    return CachedPromise(
      `${this.serviceId}.getGroupGames`,
      (resolve, reject) => {
        $.get(`https://games.roblox.com/v2/groups/${groupId}/games`, {
          limit: 100,
          sortOrder: 'Asc',
          accessFilter: 'Public',
        })
          .done((games) => {
            resolve(
              games.data.map((game) => {
                return {
                  id: game.id,
                  name: game.name,
                };
              })
            );
          })
          .fail(Roblox.api.$reject(reject));
      },
      [groupId],
      {
        resolveExpiry: 60 * 1000,
        rejectExpiry: 5 * 1000,
        queued: true,
      }
    );
  }

  isGameServerTrackingEnabled() {
    return new Promise((resolve, reject) => {
      Extension.Storage.Singleton.get('gameServerTracker')
        .then((gameServerTrackerSettings) => {
          if (gameServerTrackerSettings && gameServerTrackerSettings.on) {
            Roblox.users
              .getAuthenticatedUser()
              .then((authenticatedUser) => {
                if (authenticatedUser) {
                  RPlus.premium
                    .isPremium(authenticatedUser.id)
                    .then(resolve)
                    .catch(reject);
                } else {
                  resolve(false);
                }
              })
              .catch(reject);
          } else {
            resolve(false);
          }
        })
        .catch(reject);
    });
  }

  hasJoinedServer(gameServerId) {
    return new Promise((resolve, reject) => {
      var cache = RPlus.notifiers.gameServerTracker.getCache();
      resolve(cache.hasOwnProperty(gameServerId));
    });
  }

  trackJoinedServer(gameServerId) {
    return new Promise((resolve, reject) => {
      var cache = RPlus.notifiers.gameServerTracker.getCache();
      cache[gameServerId] = +new Date();
      resolve({});
    });
  }
};

Roblox.games = new Roblox.Services.Games();

// WebGL3D
