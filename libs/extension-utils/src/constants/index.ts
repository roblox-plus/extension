const manifest =
  globalThis.chrome?.runtime?.getManifest() as chrome.runtime.ManifestV3;

const isServiceWorker = !globalThis.window;

export { isServiceWorker, manifest };
