const manifest =
  globalThis.chrome?.runtime?.getManifest() as chrome.runtime.ManifestV2;

const isBackgroundPage =
  globalThis.chrome?.runtime?.getURL(manifest?.background?.page || '') ===
  location.href;

export { isBackgroundPage, manifest };
