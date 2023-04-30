import { getBubbleValue, setBubbleValue } from './bubble';

// Export to window, for debugging purposes.
declare global {
  var navigationBar: object;
}

window.navigationBar = {
  getBubbleValue,
  setBubbleValue,
};
