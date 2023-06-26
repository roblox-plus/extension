import { addListener } from '@tix-factory/extension-messaging';
import { manifest } from '@tix-factory/extension-utils';
export * from './notifiers';

chrome.action.setTitle({
  title: `${manifest.name} ${manifest.version}`,
});

chrome.action.onClicked.addListener(() => {
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

console.log(
  manifest.name,
  manifest.version,
  'started',
  chrome.extension.inIncognitoContext ? ' in icognito' : ''
);
