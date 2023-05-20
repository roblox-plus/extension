import { useEffect, useMemo, useState } from 'react';
import User from '../../../../../types/user';
import { getUserProfileLink } from '../../../../../utils/linkify';
import LoadingState from '../../../../../enums/loadingState';
import { getLimitedInventory } from '../../../../../services/inventory';
import OwnedLimitedAsset from '../../../../../types/ownedLimitedAsset';
import PresenceThumbnail from '../../../../../components/presence-thumbnail';
import UserActions from './actions';
import { getPremiumExpirationDate } from '../../../../../services/premium';

type UserCardInput = {
  user: User;
};

export default function UserCard({ user }: UserCardInput) {
  const [premiumExpiration, setPremiumExpiration] = useState<
    Date | null | undefined
  >(undefined);
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
    setPremiumExpiration(undefined);
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

    getPremiumExpirationDate(user.id)
      .then((expiration) => {
        if (cancelled) {
          return;
        }

        setPremiumExpiration(expiration);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.warn('Failed to check premium status', user, err);
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
              <PresenceThumbnail userId={user.id} />
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
        {premiumExpiration !== undefined ? (
          <div
            className="rplus-premium-indicator rplus-icon-32x32"
            title={`Expiration: ${
              premiumExpiration?.toLocaleDateString() || 'never'
            }`}
          />
        ) : null}
      </div>
      <UserActions user={user} />
    </div>
  );
}
