import { Batch, BatchItem } from '@tix-factory/batch';
import Thumbnail from '../../types/thumbnail';
import ThumbnailType from '../../enums/thumbnailType';
import ThumbnailState from '../../enums/thumbnailState';

type ThumbnailBatchItem = {
  type: ThumbnailType;
  targetId: number;
  size: '150x150' | '256x256' | '420x420';
};

class ThumbnailBatchProcessor extends Batch<ThumbnailBatchItem, Thumbnail> {
  constructor() {
    super({
      levelOfParallelism: 1,
      maxSize: 100,
      minimumDelay: 1 * 1000,
      enqueueDeferDelay: 10,
    });
  }

  async process(items: BatchItem<ThumbnailBatchItem, Thumbnail>[]) {
    const response = await fetch('https://thumbnails.roblox.com/v1/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        items.map(({ value }) => {
          return {
            requestId: `${value.type}_${value.targetId}_${value.size}`,
            type: value.type,
            targetId: value.targetId,
            size: value.size,
          };
        })
      ),
    });

    if (!response.ok) {
      throw new Error('Failed to load thumbnails');
    }

    const result = await response.json();
    items.forEach((item) => {
      const thumbnail = result.data.find(
        (t: any) =>
          t.requestId ===
          `${item.value.type}_${item.value.targetId}_${item.value.size}`
      );

      if (thumbnail) {
        const thumbnailState = thumbnail.state as ThumbnailState;
        item.resolve({
          state: thumbnailState,
          imageUrl:
            thumbnailState === ThumbnailState.Completed
              ? thumbnail.imageUrl
              : '',
        });
      } else {
        item.resolve({
          state: ThumbnailState.Error,
          imageUrl: '',
        });
      }
    });
  }
}

const thumbnailBatchProcessor = new ThumbnailBatchProcessor();
export type { ThumbnailBatchItem };
export default thumbnailBatchProcessor;
