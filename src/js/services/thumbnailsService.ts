import ThumbnailState from '../enums/thumbnailState';
import ThumbnailType from '../enums/thumbnailType';
import Thumbnail from '../types/thumbnail';
import { BatchedPromise, translateOutput } from '../utils/batchedPromise';

const _getThumbnail = BatchedPromise<Thumbnail>(
  {
    maxBatchSize: 100,
    cacheDuration: 60 * 1000,
    backgroundServiceKey: 'thumbnailsService.getThumbnail',
  },
  async (thumbnailDatas) => {
    const thumbnailRequests = thumbnailDatas
      .map((d) => JSON.parse(d as string))
      .map((thumb: any) => ({
        requestId: `${thumb.type}_${thumb.targetId}_${thumb.size}`,
        type: thumb.type,
        targetId: thumb.targetId,
        size: thumb.size,
      }));

    const response = await fetch('https://thumbnails.roblox.com/v1/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(thumbnailRequests),
    });

    if (!response.ok) {
      throw new Error('Failed to load thumbnails');
    }

    const result = await response.json();
    return translateOutput(
      thumbnailRequests.map((r) => r.requestId),
      result.data,
      (thumbnailResponse: any) => thumbnailResponse.requestId,
      (thumbnailResponse: any) => {
        const thumbnailState = thumbnailResponse.state as ThumbnailState;
        return {
          state: thumbnailState,
          imageUrl:
            thumbnailState === ThumbnailState.Completed
              ? thumbnailResponse.imageUrl
              : '',
        };
      }
    );
  }
);

const getAssetThumbnail = (assetId: number) =>
  _getThumbnail(
    JSON.stringify({
      type: ThumbnailType.Asset,
      targetId: assetId,
      size: '420x420',
    })
  );

const getAvatarHeadshotThumbnail = (userId: number) =>
  _getThumbnail(
    JSON.stringify({
      type: ThumbnailType.AvatarHeadShot,
      targetId: userId,
      size: '420x420',
    })
  );

export { getAssetThumbnail, getAvatarHeadshotThumbnail };
