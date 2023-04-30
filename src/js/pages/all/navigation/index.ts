import { getToggleSettingValue } from '../../../services/settings';
import { getBubbleValue, setBubbleValue } from './bubble';
import { getRobux, setRobux } from './robux';

// Check if we should be refreshing the counter values.
const refreshEnabled = async (): Promise<boolean> => {
  try {
    return await getToggleSettingValue('navcounter');
  } catch (err) {
    console.warn(
      'Failed to check if live navigation counters are enabled',
      err
    );
    return false;
  }
};

// Update the navigation bar, periodically.
setInterval(async () => {
  const shouldRefresh = await refreshEnabled();

  // Update the Robux count.
  const robux = await getRobux(shouldRefresh);
  setRobux(robux);
}, 500);

// Export to window, for debugging purposes.
declare global {
  var navigationBar: object;
}

window.navigationBar = {
  getRobux,
  setRobux,
  getBubbleValue,
  setBubbleValue,
};
