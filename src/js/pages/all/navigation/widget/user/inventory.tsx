import { Fragment, useEffect, useState } from 'react';
import User from '../../../../../types/user';
import { getLimitedInventory } from '../../../../../services/inventory';
import OwnedLimitedAsset from '../../../../../types/ownedLimitedAsset';
import LoadingState from '../../../../../enums/loadingState';

type UserInventoryInput = {
  user: User;
};

export default function UserInventory({ user }: UserInventoryInput) {
  const [inventory, setInventory] = useState<OwnedLimitedAsset[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.Success
  );

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
        Failed to load user inventory. The inventory may be private.
      </div>
    );
  }

  return <Fragment />;
}
