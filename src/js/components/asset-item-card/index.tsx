import { Fragment, useEffect, useState } from 'react';
import { getLibraryLink } from '../../utils/linkify';
import AssetDetails from '../../types/asset-details';
import { getAssetDetails } from '../../services/assets';
import Thumbnail from '../thumbnail';
import ThumbnailType from '../../enums/thumbnailType';

type AssetItemCardInput = {
  assetId: number;
};

export default function AssetItemCard({ assetId }: AssetItemCardInput) {
  const [assetDetails, setAssetDetails] = useState<
    AssetDetails | null | undefined
  >();

  useEffect(() => {
    getAssetDetails(assetId)
      .then(setAssetDetails)
      .catch((err) => {
        console.error('Failed to load asset for card', assetId, err);
      });
  }, [assetId]);

  if (assetDetails === undefined) {
    return (
      <div className="list-item item-card">
        <div className="spinner spinner-default" />
      </div>
    );
  }

  if (!assetDetails) {
    return <Fragment />;
  }

  return (
    <div className="list-item item-card">
      <div className="item-card-container">
        <a href={getLibraryLink(assetDetails.id, assetDetails.name).href}>
          <div className="item-card-link">
            <div className="item-card-thumb-container">
              <span className="thumbnail-2d-container">
                <Thumbnail
                  type={ThumbnailType.Asset}
                  targetId={assetDetails.id}
                />
              </span>
            </div>
          </div>
          <div className="item-card-caption">
            <div className="item-card-name-link">
              <div className="item-card-name" title={assetDetails.name}>
                {assetDetails.name}
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
