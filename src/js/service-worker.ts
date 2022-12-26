import { getAuthenticatedUser } from './services/usersService';
import { getSettingValue } from './services/settingsService';

getAuthenticatedUser()
  .then((user) => {
    console.log(user);
  })
  .catch((err) => console.error('boop', err));

getSettingValue('startup-notification-enabled')
  .then((startupNotificationEnabled) => {
    console.log('hoopla', startupNotificationEnabled);
  })
  .catch(console.error);
