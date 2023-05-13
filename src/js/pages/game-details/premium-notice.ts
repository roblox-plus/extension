import { placeId } from './details';

if (placeId === 258257446) {
  const privateServerBanner = document.querySelector(
    '.create-server-banner-text'
  );

  if (privateServerBanner instanceof HTMLElement) {
    privateServerBanner.innerText =
      'Purchasing a private server for this place will unlock additional features for this extension. Support not guaranteed, just enjoy the features while they work.';
  }
}
