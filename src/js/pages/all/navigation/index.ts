import { getBubbleValue, setBubbleValue } from './bubble';
import { getRobux, setRobux } from './robux';

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
