import { Batch, BatchItem } from '@tix-factory/batch';
import { PresenceType } from 'roblox';
import UserPresence from '../../types/userPresence';

const getPresenceType = (presenceType: number) => {
  switch (presenceType) {
    case 1:
      return PresenceType.Online;
    case 2:
      return PresenceType.Experience;
    case 3:
      return PresenceType.Studio;
    default:
      return PresenceType.Offline;
  }
};

const getLocationName = (presenceType: PresenceType, name: string) => {
  if (!name) {
    return '';
  }

  if (presenceType === PresenceType.Studio) {
    return name.replace(/^Studio\s+-\s*/, '');
  }

  return name;
};

class PresenceBatchProcessor extends Batch<number, UserPresence> {
  constructor() {
    super({
      levelOfParallelism: 1,
      maxSize: 100,
      minimumDelay: 3 * 1000,
      enqueueDeferDelay: 10,
    });
  }

  async process(items: BatchItem<number, UserPresence>[]) {
    const response = await fetch(
      'https://presence.roblox.com/v1/presence/users',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: items.map((i) => i.value),
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to load user presence');
    }

    const result = await response.json();
    items.forEach((item) => {
      const presence = result.userPresences.find(
        (p: any) => p.userId === item.value
      );

      if (presence) {
        const presenceType = getPresenceType(presence.userPresenceType);
        if (
          presence.placeId &&
          (presenceType === PresenceType.Experience ||
            presenceType === PresenceType.Studio)
        ) {
          item.resolve({
            type: presenceType,
            location: {
              placeId: presence.placeId || undefined,
              universeId: presence.universeId || undefined,
              name: getLocationName(presenceType, presence.lastLocation),
              serverId: presence.gameId,
            },
          });
        } else {
          item.resolve({
            type: presenceType,
          });
        }
      } else {
        item.resolve({
          type: PresenceType.Offline,
        });
      }
    });
  }
}

export default PresenceBatchProcessor;
