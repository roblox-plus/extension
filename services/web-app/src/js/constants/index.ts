// The Roblox OAuth2 client ID.
const clientId = '2147861207470534820';

// The Roblox+ extension ID, if it's running.
const extensionId = document.body.dataset.extensionId;

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

// The path for the login page.
const loginPath = '/login';

export { clientId, extensionId, requestedScopes, apiBaseUrl, loginPath };
