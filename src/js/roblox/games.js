/*
	roblox/games.js [03/18/2017]
*/
var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};
Roblox.Services.Games = class extends Extension.BackgroundService {
  constructor() {
    super('Roblox.games');

    this.register([
      this.getGroupGames,
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
};

Roblox.games = new Roblox.Services.Games();

// WebGL3D
