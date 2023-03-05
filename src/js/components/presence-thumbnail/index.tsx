import { Link } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import PresenceType from '../../enums/presenceType';
import ThumbnailType from '../../enums/thumbnailType';
import { getUserPresence } from '../../services/presenceService';
import UserPresence from '../../types/userPresence';
import { getPlaceLink } from '../../utils/linkify';
import Thumbnail from '../thumbnail';

type PresenceThumbnailInput = {
  userId: number;
};

export default function ({ userId }: PresenceThumbnailInput) {
  const [presence, setPresence] = useState<UserPresence>({
    type: PresenceType.Offline,
  });

  useEffect(() => {
    let cancel = false;
    getUserPresence(userId)
      .then((p) => {
        if (cancel) {
          return;
        }

        setPresence(p);
      })
      .catch((err) => {
        console.error('Failed to load presence for user', userId, err);
      });

    return () => {
      cancel = true;
    };
  }, [userId]);

  const renderPresenceIcon = () => {
    if (presence.type === PresenceType.Offline) {
      return <Fragment />;
    }

    const className = `roblox-plus-presence roblox-plus-presence-${presence.type.toLowerCase()}`;

    if (presence.location) {
      // target _blank so it works in the popover
      return (
        <Link
          className={className}
          href={getPlaceLink(presence.location.id, presence.location.name).href}
          title={presence.location.name}
          target="_blank"
        />
      );
    }

    return <span className={className}></span>;
  };

  return (
    <div className="roblox-plus-presence-thumbnail">
      <Thumbnail targetId={userId} type={ThumbnailType.AvatarHeadShot} />
      {renderPresenceIcon()}
    </div>
  );
}
