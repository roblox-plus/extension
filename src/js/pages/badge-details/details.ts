import { getIdFromUrl } from 'roblox';

const badgeId = getIdFromUrl(new URL(location.href));

export { badgeId };
