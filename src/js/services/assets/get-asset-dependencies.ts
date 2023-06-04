import { addListener, sendMessage } from '@tix-factory/messaging';
import ExpirableDictionary from '../../utils/expireableDictionary';
import getAssetContentsUrl from './get-asset-contents-url';

const messageDestination = 'assetsService.getAssetDependencies';
const cache = new ExpirableDictionary<number[]>(messageDestination, 30 * 1000);

const contentRegexes = [
  /"TextureI?d?".*=\s*(\d+)/gi,
  /"TextureI?d?".*rbxassetid:\/\/(\d+)/gi,
  /"MeshId".*=\s*(\d+)/gi,
  /MeshId.*rbxassetid:\/\/(\d+)/gi,
  /asset\/?\?\s*id\s*=\s*(\d+)/gi,
  /rbxassetid:\/\/(\d+)/gi,
  /:LoadAsset\((\d+)\)/gi,
  /require\((\d+)\)/gi,
];

// The type for the message being passed to the background.
type BackgroundMessage = {
  assetId: number;
};

const getAssetDependencies = async (assetId: number): Promise<number[]> => {
  return sendMessage(messageDestination, { assetId } as BackgroundMessage);
};

const loadAssetDependencies = async (assetId: number): Promise<number[]> => {
  const assetIds: number[] = [];

  const assetContentsUrl = await getAssetContentsUrl(assetId);
  if (!assetContentsUrl) {
    return [];
  }

  const assetContentsResponse = await fetch(assetContentsUrl);
  const assetContents = await assetContentsResponse.text();

  contentRegexes.forEach((regex) => {
    let match = assetContents.match(regex) || [];
    match.forEach((m) => {
      let id = Number((m.match(/(\d+)/) || [])[1]);
      if (id && !isNaN(id) && !assetIds.includes(id)) {
        assetIds.push(id);
      }
    });
  });

  return assetIds;
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return cache.getOrAdd(`${message.assetId}`, () =>
      // Queue up the fetch request, when not in the cache
      loadAssetDependencies(message.assetId)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getAssetDependencies;
