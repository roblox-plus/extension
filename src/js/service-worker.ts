// We must import or export these values to ensure the content isn't thrown out.
import { getSettingValue } from './services/settingsService';

export { getRobuxBalance } from './services/currencyService';
export { getAuthenticatedUser } from './services/usersService';

getSettingValue('startup-notification-enabled')
  .then((startupNotificationEnabled) => {
    console.log('hoopla', startupNotificationEnabled);
  })
  .catch(console.error);
