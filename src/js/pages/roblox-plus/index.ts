import {
  load as loadUserInfo,
  populate as populateUserInfo,
} from './user-info';
export * from './transactions';

const load = async () => {
  if (!document.body) {
    // No body yet... try again.
    setTimeout(load, 1);
    return;
  }

  document.body.setAttribute('data-extension-id', chrome.runtime.id);

  const userInfo = await loadUserInfo();
  populateUserInfo(userInfo);
};

load();
