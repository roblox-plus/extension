const manifest = chrome.runtime.getManifest() as chrome.runtime.ManifestV3;

const isBackgroundServiceWorker =
  chrome.runtime.getURL(manifest.background?.service_worker || '') ===
  location.href;

const isBrowserAction =
  chrome.runtime.getURL(manifest.action?.default_popup || '') === location.href;

if (!globalThis.manifest) {
  globalThis.manifest = manifest;

  console.log(
    manifest.name,
    manifest.version,
    `started ${isBackgroundServiceWorker ? 'in the background' : ''}`
  );
}

declare global {
  var manifest: any;
}

export { manifest, isBackgroundServiceWorker, isBrowserAction };
