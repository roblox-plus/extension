import { LoadingState } from '@tix-factory/extension-utils';
import { useEffect, useMemo, useState } from 'react';
import { User } from 'roblox';
import Thumbnail from '../../../../../components/thumbnail';
import ThumbnailType from '../../../../../enums/thumbnailType';
import { getLimitedInventory } from '../../../../../services/inventory';
import OwnedLimitedAsset from '../../../../../types/ownedLimitedAsset';
import { getCatalogLink } from '../../../../../utils/linkify';

type UserInventoryInput = {
  user: User;
};

type CountedOwnedLimitedAsset = {
  item: OwnedLimitedAsset;
  serialNumbers: number[];
};

export default function UserInventory({ user }: UserInventoryInput) {
  const [inventory, setInventory] = useState<OwnedLimitedAsset[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.Success
  );

  const items = useMemo<CountedOwnedLimitedAsset[]>(() => {
    const uniqueItems: CountedOwnedLimitedAsset[] = [];

    inventory.forEach((item) => {
      const existingItem = uniqueItems.find((i) => i.item.id === item.id);
      if (existingItem) {
        existingItem.serialNumbers.push(item.serialNumber);
      } else {
        uniqueItems.push({
          item,
          serialNumbers: [item.serialNumber],
        });
      }
    });

    return uniqueItems.sort((a, b) => {
      if (!a.item.recentAveragePrice) {
        return -1;
      }

      if (!b.item.recentAveragePrice) {
        return 1;
      }

      return a.item.recentAveragePrice < b.item.recentAveragePrice ? 1 : -1;
    });
  }, [inventory]);

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
        setLoadingState(LoadingState.Success);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        setLoadingState(LoadingState.Error);
        console.warn('Failed to load user inventory', err);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loadingState === LoadingState.Loading) {
    return <div className="spinner spinner-default" />;
  }

  if (loadingState === LoadingState.Error) {
    return (
      <div className="section-content-off">
        Failed to load user inventory.
        <br />
        The inventory may be private.
      </div>
    );
  }

  return (
    <ul className="hlist item-cards">
      {items.map(({ item, serialNumbers }) => {
        return (
          <li key={item.id}>
            <div className="list-item item-card">
              <div className="item-card-container">
                <a href={getCatalogLink(item.id, item.name).href}>
                  <div className="item-card-link">
                    <div className="item-card-thumb-container">
                      <span className="thumbnail-2d-container">
                        <Thumbnail
                          type={ThumbnailType.Asset}
                          targetId={item.id}
                        />
                      </span>
                      <span className="limited-icon-container">
                        <span className="icon-shop-limited"></span>
                        {serialNumbers.length > 1 ? (
                          <span
                            className="font-caption-header text-subheader limited-number"
                            title={serialNumbers
                              .filter((s) => s)
                              .map((s) => `#${s}`)
                              .join(', ')}
                          >
                            x{serialNumbers.length.toLocaleString()}
                          </span>
                        ) : item.serialNumber ? (
                          <span className="font-caption-header text-subheader limited-number">
                            #{item.serialNumber}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                  <div className="item-card-caption">
                    <div className="item-card-name-link">
                      <div className="item-card-name" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-overflow item-card-price">
                        <span className="icon icon-robux-16x16"></span>
                        <span className="text-robux ng-binding">
                          {item.recentAveragePrice
                            ? item.recentAveragePrice.toLocaleString()
                            : 'Priceless'}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
