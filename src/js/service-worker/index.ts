import { addListener } from '@tix-factory/extension-messaging';
import { manifest } from '@tix-factory/extension-utils';
export * from './notifiers';

chrome.browserAction.setTitle({
  title: `${manifest.name} ${manifest.version}`,
});

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({
    url: manifest.homepage_url,
    active: true,
  });
});

addListener(
  'extension.reload',
  async () => {
    setTimeout(() => {
      chrome.runtime.reload();
    }, 250);
  },
  {
    levelOfParallelism: 1,
    allowExternalConnections: true,
  }
);
