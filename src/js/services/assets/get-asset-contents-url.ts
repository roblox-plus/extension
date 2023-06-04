import { Batch, BatchItem } from '@tix-factory/batch';
import { manifest } from '@tix-factory/extension-utils';
import ExpirableDictionary from '../../utils/expireableDictionary';
import xsrfFetch from '../../utils/xsrfFetch';
import { addListener, sendMessage } from '../message';

const messageDestination = 'assetsService.getAssetContentsUrl';

// The type for the message being passed to the background.
type BackgroundMessage = {
  assetId: number;
};

class AssetContentsBatchProcessor extends Batch<number, string> {
  constructor() {
    super({
      levelOfParallelism: 1,
      maxSize: 100,
      minimumDelay: 1000,
      enqueueDeferDelay: 10,
    });
  }

  async process(items: BatchItem<number, string>[]) {
    const requestHeaders = new Headers();
    requestHeaders.append('Roblox-Place-Id', '258257446');
    requestHeaders.append('Roblox-Browser-Asset-Request', manifest.name);

    const response = await xsrfFetch(
      new URL(`https://assetdelivery.roblox.com/v2/assets/batch`),
      {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(
          items.map((batchItem) => {
            return {
              assetId: batchItem.value,
              requestId: batchItem.key,
            };
          })
        ),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to load asset contents URL');
    }

    const result = await response.json();
    items.forEach((item) => {
      const asset = result.find((a: any) => a.requestId === item.key);

      const location = asset?.locations[0];
      if (location?.location) {
        item.resolve(location.location);
      } else {
        item.resolve('');
      }
    });
  }

  getKey(item: number): string {
    return item.toString();
  }
}

const assetContentsProcessor = new AssetContentsBatchProcessor();
const assetContentsCache = new ExpirableDictionary<string>(
  messageDestination,
  10 * 60 * 1000
);

// Fetches the date when a badge was awarded to the specified user.
const getAssetContentsUrl = async (
  assetId: number
): Promise<URL | undefined> => {
  const url = await sendMessage(messageDestination, {
    assetId,
  } as BackgroundMessage);

  return url ? new URL(url) : undefined;
};

// Listen for messages sent to the service worker.
addListener(messageDestination, (message: BackgroundMessage) => {
  // Check the cache
  return assetContentsCache.getOrAdd(
    assetContentsProcessor.getKey(message.assetId),
    () => {
      // Queue up the fetch request, when not in the cache
      return assetContentsProcessor.enqueue(message.assetId);
    }
  );
});

export default getAssetContentsUrl;
