import { Batch, BatchItem } from '@tix-factory/batch';

type BadgeAwardBatchItem = {
  userId: number;
  badgeId: number;
};

class BadgeAwardBatchProcessor extends Batch<
  BadgeAwardBatchItem,
  Date | undefined
> {
  constructor() {
    super({
      levelOfParallelism: 1,
      maxSize: 100,
      minimumDelay: 1 * 1000,
      enqueueDeferDelay: 10,
    });
  }

  async process(items: BatchItem<BadgeAwardBatchItem, Date | undefined>[]) {
    const response = await fetch(
      `https://badges.roblox.com/v1/users/${
        items[0].value.userId
      }/badges/awarded-dates?badgeIds=${items
        .map((i) => i.value.badgeId)
        .join(',')}`
    );

    if (!response.ok) {
      throw new Error('Failed to load badge award statuses');
    }

    const result = await response.json();
    items.forEach((item) => {
      const badgeAward = result.data.find(
        (b: any) => b.badgeId === item.value.badgeId
      );

      if (badgeAward?.awardedDate) {
        item.resolve(new Date(badgeAward.awardedDate));
      } else {
        item.resolve(undefined);
      }
    });
  }

  getBatch(): BatchItem<BadgeAwardBatchItem, Date | undefined>[] {
    const now = performance.now();
    const batch: BatchItem<BadgeAwardBatchItem, Date | undefined>[] = [];

    for (let i = 0; i < this.queueArray.length; i++) {
      const batchItem = this.queueArray[i];
      if (batchItem.retryAfter > now) {
        // retryAfter is set at Infinity while the item is being processed
        // so we should always check it, even if we're not retrying items
        continue;
      }

      if (
        batch.length < 1 ||
        batch[0].value.userId === batchItem.value.userId
      ) {
        // We group all the requests for badge award dates together by user ID.
        batch.push(batchItem);
      }

      if (batch.length >= this.config.maxSize) {
        // We have all the items we need, break.
        break;
      }
    }

    return batch;
  }

  getKey(item: BadgeAwardBatchItem): string {
    return `${item.userId}:${item.badgeId}`;
  }
}

export type { BadgeAwardBatchItem };
export default BadgeAwardBatchProcessor;
