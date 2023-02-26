import { manifest } from '../constants';

chrome.action.setTitle({
  title: `${manifest.name} ${manifest.version}`,
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    active: true,
    url: manifest.homepage_url,
  });
});

export {};
