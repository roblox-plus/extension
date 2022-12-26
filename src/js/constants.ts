const manifest = chrome.runtime.getManifest() as chrome.runtime.ManifestV3;

const isBackgroundServiceWorker =
  chrome.runtime.getURL(manifest.background?.service_worker || '') ===
  location.href;

console.log(
  manifest.name,
  manifest.version,
  `started ${isBackgroundServiceWorker ? 'in the background' : ''}`
);

export { isBackgroundServiceWorker };
