import getAssetContentsUrl from './get-asset-contents-url';
import getAssetSalesCount from './get-asset-sales-count';

// To ensure the webpack service loader can discover the methods: import it, then export it again.
export { getAssetContentsUrl, getAssetSalesCount };
