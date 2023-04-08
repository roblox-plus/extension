const manifest = chrome.runtime.getManifest() as chrome.runtime.ManifestV2;

const isBackgroundPage =
  chrome.runtime.getURL(manifest.background?.page || '') === location.href;

export { manifest, isBackgroundPage };
