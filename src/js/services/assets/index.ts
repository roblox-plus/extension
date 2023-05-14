import getAssetContentsUrl from './get-asset-contents-url';
import getAssetSalesCount from './get-asset-sales-count';
import getAssetDependencies from './get-asset-dependencies';
import getAssetDetails from './get-asset-details';

// To ensure the webpack service loader can discover the methods: import it, then export it again.
export {
  getAssetContentsUrl,
  getAssetSalesCount,
  getAssetDependencies,
  getAssetDetails,
};
