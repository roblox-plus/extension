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
