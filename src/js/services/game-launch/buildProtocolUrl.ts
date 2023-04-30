import { isBackgroundPage } from '../../constants';
import xsrfFetch from '../../utils/xsrfFetch';

// The generated authentication ticket URL, to prevent other extensions from getting the special headers included.
const authTicketUrl = new URL(
  `https://auth.roblox.com/v1/authentication-ticket?roblox-plus-security-token=${crypto.randomUUID()}`
);

type GameLaunchInfo = {
  followUserId?: number;
};

// Fetches the authentication ticket, to launch the experience with.
const getAuthenticationTicket = async () => {
  const response = await xsrfFetch(authTicketUrl, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch authentication ticket for game launch`);
  }

  return response.headers.get('rbx-authentication-ticket');
};

// Builds the place launcher URL, used to craft the protocol launcher URL.
const buildPlaceLauncherUrl = (info: GameLaunchInfo) => {
  const prefix = `https://assetgame.roblox.com/game/PlaceLauncher.ashx?request=`;

  if (info.followUserId) {
    return `${prefix}RequestFollowUser&userId=${info.followUserId}`;
  }

  throw new Error('Unable to determine place launcher URL');
};

// Builds the protocol launcher URL, to launch the experience with.
const buildProtocolUrl = async (info: GameLaunchInfo) => {
  const authenticationTicket = await getAuthenticationTicket();
  const placeLauncherUrl = encodeURIComponent(buildPlaceLauncherUrl(info));
  const currentTime = +new Date();
  return `roblox-player:1+launchmode:play+launchTime:${currentTime}+placelauncherurl:${placeLauncherUrl}+gameinfo:${authenticationTicket}`;
};

if (isBackgroundPage) {
  // Set the Referer header, so that we can access the authentication ticket, for the protocol launcher URL.
  chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [1],
    addRules: [
      {
        id: 1,
        condition: {
          urlFilter: authTicketUrl.href,
          requestMethods: [chrome.declarativeNetRequest.RequestMethod.POST],
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
          ],
        },
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              header: 'Referer',
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value:
                'https://www.roblox.com/groups/2518656/Roblox-Plus?extension-game-launch=true',
            },
          ],
        },
      },
    ],
  });
}

export type { GameLaunchInfo };
export default buildProtocolUrl;
