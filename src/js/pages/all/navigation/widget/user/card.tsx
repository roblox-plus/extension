import { useEffect, useMemo, useState } from 'react';
import Thumbnail from '../../../../../components/thumbnail';
import ThumbnailType from '../../../../../enums/thumbnailType';
import User from '../../../../../types/user';
import { getUserProfileLink } from '../../../../../utils/linkify';
import LoadingState from '../../../../../enums/loadingState';
import { getLimitedInventory } from '../../../../../services/inventory';
import OwnedLimitedAsset from '../../../../../types/ownedLimitedAsset';

type UserCardInput = {
  user: User;
};

export default function UserCard({ user }: UserCardInput) {
  const [inventory, setInventory] = useState<OwnedLimitedAsset[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.Success
  );
  const inventoryValue = useMemo(() => {
    let value = 0;

    inventory.forEach((i) => {
      if (i.recentAveragePrice) {
        value += i.recentAveragePrice;
      }
    });

    return value;
  }, [inventory]);

  const profileUrl = getUserProfileLink(user.id).href;

  useEffect(() => {
    setLoadingState(LoadingState.Loading);
    setInventory([]);

    let cancelled = false;

    getLimitedInventory(user.id)
      .then((limiteds) => {
        if (cancelled) {
          return;
        }

        setInventory(limiteds);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        // do nothing, the inventory widget will log this
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="avatar-card-container">
      <div className="avatar-card-content">
        <div className="avatar avatar-card-fullbody">
          <a href={profileUrl} className="avatar-card-link">
            <div className="avatar-card-image">
              <Thumbnail
                type={ThumbnailType.AvatarHeadShot}
                targetId={user.id}
              />
            </div>
          </a>
        </div>
        <div className="avatar-card-caption">
          <span>
            <div className="avatar-name-container">
              <a href={profileUrl} className="text-overflow avatar-name">
                {user.displayName}
              </a>
            </div>
            <div className="avatar-card-label">{`@${user.name}`}</div>
            {inventory.length > 0 && (
              <div className="avatar-card-label rplus-stat-label">
                <span className="text-subheader">Limiteds</span>
                <span className="rplus-value-label">
                  {inventory.length.toLocaleString()}
                </span>
              </div>
            )}
            {inventoryValue > 0 && (
              <div className="avatar-card-label rplus-stat-label">
                <span className="text-subheader">Inventory Value</span>
                <span className="rplus-value-label">
                  {inventoryValue.toLocaleString()}
                </span>
              </div>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
