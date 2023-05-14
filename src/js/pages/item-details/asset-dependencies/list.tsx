import AssetItemCard from '../../../components/asset-item-card';

type ListInput = {
  assetIds: number[];
};

export default function List({ assetIds }: ListInput) {
  return (
    <div className="container-list">
      <div className="container-header">
        <h2>Dependencies</h2>
      </div>
      <div className="recommended-items-slider">
        <ul className="hlist item-cards recommended-items">
          {assetIds.map((assetId) => {
            return (
              <li key={assetId}>
                <AssetItemCard assetId={assetId} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
