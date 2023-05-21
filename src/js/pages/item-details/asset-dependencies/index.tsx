import { Fragment, useEffect, useState } from 'react';
import LoadingState from '../../../enums/loadingState';
import { getAssetDependencies } from '../../../services/assets';
import List from './list';
import AssetType from '../../../enums/assetType';

// These don't have dependencies, don't even try.
const disabledAssetTypes = [AssetType.Image, AssetType.Mesh, AssetType.Audio];

type AppInput = {
  assetId: number;
};

export { disabledAssetTypes };

export default function AssetDependencies({ assetId }: AppInput) {
  const [assetDependencies, setAssetDependencies] = useState<number[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.Loading
  );

  useEffect(() => {
    setLoadingState(LoadingState.Loading);

    getAssetDependencies(assetId)
      .then((dependencies) => {
        setAssetDependencies(dependencies);
        setLoadingState(LoadingState.Success);
      })
      .catch((err) => {
        console.error('Failed to load asset dependencies', err);
        setLoadingState(LoadingState.Error);
      });
  }, [assetId]);

  if (loadingState === LoadingState.Loading) {
    return <div className="spinner spinner-default" />;
  }

  if (loadingState === LoadingState.Error) {
    return (
      <div className="section-content-off">
        Failed to load asset dependencies, please refresh to try again.
      </div>
    );
  }

  if (assetDependencies.length < 1) {
    return <Fragment />;
  }

  return <List assetIds={assetDependencies} />;
}
