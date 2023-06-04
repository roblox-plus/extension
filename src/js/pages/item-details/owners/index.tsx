import { Fragment, useEffect, useState } from 'react';
import { getAssetOwners } from '../../../services/inventory';
import AssetOwnershipRecord from '../../../types/asset-ownership-record';
import { LoadingState } from '@tix-factory/extension-utils';
import { getUserProfileLink } from '../../../utils/linkify';
import Thumbnail from '../../../components/thumbnail';
import ThumbnailType from '../../../enums/thumbnailType';
import {
  getTranslationResource,
  getTranslationResourceWithFallback,
} from '../../../services/localization';

type AssetOwnersInput = {
  assetId: number;
};

export default function AssetOwners({ assetId }: AssetOwnersInput) {
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.Loading
  );
  const [isAscending, setIsAscending] = useState<boolean>(true);
  const [hidePrivateInventories, setHidePrivateInventories] =
    useState<boolean>(true);
  const [ownershipRecords, setOwnershipRecords] = useState<
    AssetOwnershipRecord[]
  >([]);
  const [cursor, setCursor] = useState<string>('');
  const [nextCursor, setNextCursor] = useState<string>('');
  const [seeMoreText, setSeeMoreText] = useState<string>('See More');

  useEffect(() => {
    getTranslationResource('Feature.PrivateSales', 'Label.SeeMore')
      .then(setSeeMoreText)
      .catch((err) => {
        console.warn(
          'Failed to load translated text for see more owners button.',
          err
        );
      });
  }, []);

  useEffect(() => {
    setLoadingState(LoadingState.Loading);
    setNextCursor('');

    getAssetOwners(assetId, cursor, isAscending)
      .then((r) => {
        setOwnershipRecords(ownershipRecords.concat(r.data));
        setNextCursor(r.nextPageCursor);
        setLoadingState(LoadingState.Success);
      })
      .catch((err) => {
        console.error('Failed to load asset ownership records', err);
        setLoadingState(LoadingState.Error);
      });
  }, [assetId, isAscending, cursor, setLoadingState]);

  return (
    <div className="container-list rplus-owners-list">
      <div className="container-header">
        <h2>Owners</h2>
        <div className="rplus-hide-private-inventories">
          <input
            id="rplus-hide-private-inventories"
            type="checkbox"
            checked={hidePrivateInventories}
            onChange={(e) => setHidePrivateInventories(e.target.checked)}
          />
          <label htmlFor="rplus-hide-private-inventories">
            Hide private inventories
          </label>
        </div>
        <div>
          <button
            className="btn-control-sm"
            onClick={() => {
              setOwnershipRecords([]);
              setCursor('');
              setIsAscending(!isAscending);
            }}
          >
            <span className="icon-nav-trade"></span>
          </button>
        </div>
      </div>
      <ul className="vlist">
        {ownershipRecords
          .filter((r) => r.user || !hidePrivateInventories)
          .map((r) => {
            const profileLink = r.user
              ? getUserProfileLink(r.user.id).href
              : '';
            return (
              <li key={r.id} className="list-item">
                {r.user ? (
                  <a href={profileLink} className="list-header">
                    <span className="thumbnail-2d-container avatar-headshot-md">
                      <Thumbnail
                        type={ThumbnailType.AvatarHeadShot}
                        targetId={r.user.id}
                      />
                    </span>
                  </a>
                ) : (
                  <div className="list-header">
                    <span className="thumbnail-2d-container avatar-headshot-md">
                      <div className="icon-broken"></div>
                    </span>
                  </div>
                )}
                <div>
                  {r.user ? (
                    <a href={profileLink} className="text-name username">
                      {r.user.displayName}
                    </a>
                  ) : (
                    <span>Private Inventory</span>
                  )}
                  <span className="separator">-</span>
                  <span className="font-caption-body serial-number">
                    Serial{' '}
                    {r.serialNumber
                      ? `#${r.serialNumber.toLocaleString()}`
                      : 'N/A'}
                  </span>
                  <br />
                  <span className="font-caption-body">
                    Owner since {r.updated.toLocaleString()}
                  </span>
                </div>
              </li>
            );
          })}
      </ul>
      {loadingState === LoadingState.Error ? (
        <div className="section-content-off">
          Failed to load ownership records.
        </div>
      ) : null}
      {loadingState === LoadingState.Loading ? (
        <div className="spinner spinner-default" />
      ) : null}
      {nextCursor ? (
        <button
          className="btn-control-md"
          onClick={() => setCursor(nextCursor)}
        >
          {seeMoreText}
        </button>
      ) : null}
    </div>
  );
}
