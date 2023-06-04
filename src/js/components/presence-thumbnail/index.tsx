import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  PresenceType,
  ThumbnailType,
  UserPresence,
  getPlaceLink,
} from 'roblox';
import { getUserPresence } from '../../services/presence';
import Thumbnail from '../thumbnail';

type PresenceThumbnailInput = {
  userId: number;
};

export default function PresenceThumbnail({ userId }: PresenceThumbnailInput) {
  const [userPresence, setUserPresence] = useState<UserPresence>({
    type: PresenceType.Offline,
  });

  const iconClassName = useMemo(() => {
    switch (userPresence.type) {
      case PresenceType.Studio:
        return 'icon-studio';
      case PresenceType.Experience:
        return 'icon-game';
      case PresenceType.Online:
        return 'icon-online';
      default:
        return '';
    }
  }, [userPresence.type]);

  const iconLink = useMemo(() => {
    if (!userPresence.location) {
      return '';
    }

    return getPlaceLink(
      userPresence.location.placeId,
      userPresence.location.name
    ).href;
  }, [userPresence.location]);

  useEffect(() => {
    setUserPresence({ type: PresenceType.Offline });

    let cancelled = false;

    getUserPresence(userId)
      .then((p) => {
        if (cancelled) {
          return;
        }

        setUserPresence(p);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.warn('Failed to load user presence', userId, err);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <Fragment>
      <Thumbnail type={ThumbnailType.AvatarHeadShot} targetId={userId} />
      {iconClassName ? (
        iconLink ? (
          <a
            className="avatar-status"
            href={iconLink}
            title={userPresence.location?.name}
          >
            <span className={iconClassName}></span>
          </a>
        ) : (
          <div className="avatar-status">
            <span className={iconClassName}></span>
          </div>
        )
      ) : null}
    </Fragment>
  );
}
