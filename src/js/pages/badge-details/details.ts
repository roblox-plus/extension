import { getIdFromUrl } from '../../utils/linkify';

const badgeId = getIdFromUrl(new URL(location.href));

export { badgeId };
