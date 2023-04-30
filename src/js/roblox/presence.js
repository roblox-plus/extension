var Roblox = Roblox || {};
Roblox.Services = Roblox.Services || {};

Roblox.Services.Presence = class extends Extension.BackgroundService {
  constructor() {
    super('Roblox.presence');

    this.register([]);
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
    // The mapping the consumers of this method expect.
    const presenceMap = {
      Offline: 0,
      Online: 2,
      Studio: 3,
      Experience: 4,
    };

    return new Promise((resolve, reject) => {
      presenceService
        .getUserPresence(userId)
        .then((presence) => {
          resolve({
            game: presence.location
              ? {
                  name: presence.location.name,
                  placeId: presence.location.placeId,
                  serverId: presence.location.serverId,
                }
              : null,
            locationName: presence.location?.name,
            locationType: presenceMap[presence.type],
          });
        })
        .catch(reject);
    });
  }
};

Roblox.presence = new Roblox.Services.Presence();
// WebGL3D
