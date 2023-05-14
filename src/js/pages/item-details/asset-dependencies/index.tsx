import ReactDOM from 'react-dom/client';
import App from './app';
import AssetType from '../../../enums/assetType';

// These don't have dependencies, don't even try.
const disabledAssetTypes = [AssetType.Image, AssetType.Mesh, AssetType.Audio];

const render = (container: HTMLElement, assetId: number) => {
  const root = ReactDOM.createRoot(container);
  root.render(<App assetId={assetId} />);
};

export { render, disabledAssetTypes };
