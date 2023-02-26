import { getIdFromUrl } from '../../utils/linkify';

const userId = getIdFromUrl(new URL(location.href));

export { userId };
