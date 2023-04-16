var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};

Roblox.Services.Presence = class extends Extension.BackgroundService {
  constructor() {
    super('Roblox.presence');

    this.presenceCache = new TimedCache(10 * 1000);
    this.presenceProcessor = new BatchItemProcessor(
      {
        retryCooldownInMilliseconds: 5 * 1000,
        processDelay: 250,
      },
      this.processPresence.bind(this),
      console.error.bind(console, 'Roblox.presence')
    );

    this.register([this.getPresence, this.getPresenceByUserId]);
  }

  getPresence(userIds) {
    return new Promise((resolve, reject) => {
      let presences = {};
      let presenceCount = 0;

      if (userIds.length <= 0) {
        resolve(presences);
        return;
      }

      const addPresence = (userId, presence) => {
        presences[userId] = presence;
        if (++presenceCount === userIds.length) {
          resolve(presences);
        }
      };

      userIds.forEach((userId) => {
        this.getPresenceByUserId(userId)
          .then((presence) => {
            addPresence(userId, presence);
          })
          .catch((err) => {
            console.warn(
              `Roblox.presence.getPresenceByUserId(${userId}):`,
              err
            );
            addPresence(userId, null);
          });
      });
    });
  }

  getPresenceByUserId(userId) {
    /*
			locationTypes:
				2 - Online
				3 - Studio
				4 - Game
		*/

    return new Promise((resolve, reject) => {
      let presence = this.presenceCache.get(userId);
      if (presence.exists) {
        resolve(presence.item);
        return;
      }

      this.presenceProcessor.push(userId).then(resolve).catch(reject);
    });
  }

  processPresence(userIds) {
    return new Promise((resolve, reject) => {
      let result = [];
      let remainingUserIds = [];

      userIds.forEach((userId) => {
        if (userId > 0) {
          remainingUserIds.push(userId);
        } else {
          result.push({
            success: true,
            item: userId,
            value: null,
          });
        }
      });

      if (remainingUserIds.length <= 0) {
        resolve(result);
        return;
      }

      // Mappings from location types from Api -> comment types mentioned above
      let locationTypeTranslations = {
        3: 3,
        2: 4,
        1: 2,
      };

      $.post('https://presence.roblox.com/v1/presence/users', {
        userIds: remainingUserIds,
      })
        .done((presences) => {
          let presenceMap = {};
          presences.userPresences.forEach((report) => {
            presenceMap[report.userId] = {
              game: report.gameId
                ? {
                    placeId: report.placeId,
                    serverId: report.gameId,
                    name: report.lastLocation,
                  }
                : null,
              locationName: report.lastLocation,
              locationType:
                locationTypeTranslations[report.userPresenceType] || 0,
            };
          });

          remainingUserIds.forEach((userId) => {
            let presence = presenceMap[userId];
            if (presence) {
              this.presenceCache.set(userId, presence);
            }

            result.push({
              success: true,
              item: userId,
              value: presence,
            });
          });

          resolve(result);
        })
        .fail((jxhr, errors) => {
          reject(errors);
        });
    });
  }
};

Roblox.presence = new Roblox.Services.Presence();
// WebGL3D
