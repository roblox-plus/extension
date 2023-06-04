import { getIdFromUrl } from 'roblox';

const gamePassId = Number(getIdFromUrl(new URL(location.href)));
const isOwnCreatedItem = !!document.querySelector('#configure-item');

export { gamePassId, isOwnCreatedItem };
