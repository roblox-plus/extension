// The Roblox OAuth2 client ID.
const clientId = '2147861207470534820';

// The scopes to request when logging in.
const requestedScopes = ['openid', 'profile'];

// The base URL to send the API calls to.
const apiBaseUrl = new URL(
  `https://${
    window.location.hostname === 'localhost'
      ? 'roblox.plus'
      : window.location.hostname
  }/api/`
);

// Page paths
const loginPath = '/login';
const settingsPath = '/settings';
const transactionsPath = '/transactions';

export {
  clientId,
  requestedScopes,
  apiBaseUrl,
  loginPath,
  settingsPath,
  transactionsPath,
};
