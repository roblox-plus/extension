import { manifest } from '../../../constants';
import TradeStatusType from '../../../enums/tradeStatusType';
import { getFriendRequestCount } from '../../../services/friends';
import { getUnreadMessageCount } from '../../../services/private-messages';
import { getToggleSettingValue } from '../../../services/settings';
import { getTradeCount } from '../../../services/trades';
import { parseAuthenticatedUser } from '../../../utils/authenticatedUser';
import { getBubbleValue, setBubbleValue } from './bubble';
import { getLinkOverrides, updateNavigationLink } from './links';
import { getRobux, setRobux } from './robux';
import { button as widgetButton, render as renderWidget } from './widget';

// Check if we should be refreshing the counter values.
const refreshEnabled = async (): Promise<boolean> => {
  try {
    return await getToggleSettingValue('navcounter');
  } catch (err) {
    console.warn(
      'Failed to check if live navigation counters are enabled',
      err
    );
    return false;
  }
};

// Fetches the count of friend requests
const getFriendRequestBubbleCount = async (
  refresh: boolean
): Promise<number> => {
  const authenticatedUser = parseAuthenticatedUser();
  if (refresh && authenticatedUser) {
    return await getFriendRequestCount(authenticatedUser.id);
  }

  return getBubbleValue('nav-friends');
};

// Fetches the count of unread private messages
const getPrivateMessageBubbleCount = async (
  refresh: boolean
): Promise<number> => {
  const authenticatedUser = parseAuthenticatedUser();
  if (refresh && authenticatedUser) {
    return await getUnreadMessageCount(authenticatedUser.id);
  }

  return getBubbleValue('nav-message');
};

// Fetches the count of inbound trades
const getTradeBubbleCount = async (refresh: boolean): Promise<number> => {
  const authenticatedUser = parseAuthenticatedUser();
  if (refresh && authenticatedUser) {
    return await getTradeCount(TradeStatusType.Inbound);
  }

  return getBubbleValue('nav-trade');
};

// Update the navigation bar, periodically.
setInterval(async () => {
  const shouldRefresh = await refreshEnabled();

  // Update the Robux count.
  const robux = await getRobux(shouldRefresh);
  setRobux(robux);

  // Update the friend request count.
  const friendRequests = await getFriendRequestBubbleCount(shouldRefresh);
  setBubbleValue('nav-friends', friendRequests);

  // Update the private message count.
  const unreadPrivateMessages = await getPrivateMessageBubbleCount(
    shouldRefresh
  );
  setBubbleValue('nav-message', unreadPrivateMessages);

  // Update the trade count.
  const trades = await getTradeBubbleCount(shouldRefresh);
  setBubbleValue('nav-trade', trades);

  // Update navigation links.
  const links = await getLinkOverrides();
  if (links.length === 2) {
    // First element in the array is the third link in the navigation bar.
    // Which is also the link that is second to last.
    if (links[0].override) {
      updateNavigationLink(-2, links[0].text, links[0].href);
    }

    // Second element in the array is the fourth link in the navigation bar.
    // Which is also the link that is also the last link in the navigation bar.
    if (links[1].override) {
      updateNavigationLink(-1, links[1].text, links[1].href);
    }
  }

  // Control panel link.
  let controlPanelLink = document.querySelector(
    'a#nav-rplus'
  ) as HTMLAnchorElement;
  if (!controlPanelLink && manifest.homepage_url) {
    const upgradeButton = document.querySelector('li.rbx-upgrade-now');
    if (!upgradeButton) {
      // Couldn't find the element we use to prepend before... :coffin:
      return;
    }

    const container = document.createElement('li');

    // The link itself
    controlPanelLink = document.createElement('a');
    controlPanelLink.setAttribute('id', 'nav-rplus');
    controlPanelLink.setAttribute('href', manifest.homepage_url);
    controlPanelLink.setAttribute(
      'class',
      'dynamic-overflow-container text-nav'
    );
    container.appendChild(controlPanelLink);

    // The icon
    const controlPanelIcon = document.createElement('span');
    controlPanelIcon.setAttribute('class', 'rplus-icon');
    const controlPanelIconContainer = document.createElement('div');
    controlPanelIconContainer.appendChild(controlPanelIcon);
    controlPanelLink.appendChild(controlPanelIconContainer);

    // The text
    const controlPanelText = document.createElement('span');
    controlPanelText.setAttribute(
      'class',
      'font-header-2 dynamic-ellipsis-item'
    );
    controlPanelText.innerText = 'Control Panel';
    controlPanelLink.appendChild(controlPanelText);

    // The finale
    upgradeButton.before(container);
  }

  const header = document.getElementById('header');
  const settingsButton = document.getElementById('navbar-settings');
  let widgetButtonContainer = document.getElementById(widgetButton.id);
  if (!widgetButtonContainer && settingsButton && header) {
    settingsButton.append(widgetButton);
    renderWidget(header);
  }
}, 500);

// Export to window, for debugging purposes.
declare global {
  var navigationBar: object;
}

window.navigationBar = {
  getRobux,
  setRobux,
  getBubbleValue,
  setBubbleValue,
  updateNavigationLink,
};
