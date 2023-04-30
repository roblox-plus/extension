import User from '../../types/user';
import { getIdFromUrl } from '../../utils/linkify';

const displayNameElement = document.querySelector(
  '.header-title>h1:first-of-type'
) as HTMLElement;
const usernameElement = document.querySelector(
  '.profile-display-name'
) as HTMLElement;
const displayName = displayNameElement?.innerText?.trim() || '';

const user: User = {
  id: getIdFromUrl(new URL(location.href)),
  name: usernameElement?.innerText?.trim().substring(1) || displayName,
  displayName,
};

export { user };
