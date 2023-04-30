import { getAbbreviateAtValue, parseNumber, setText } from './utils';
import { parseAuthenticatedUser } from '../../../utils/authenticatedUser';
import { getRobuxBalance } from '../../../services/currency';
import abbreviateNumber from '../../../utils/abbreviateNumber';
import { getSettingValue } from '../../../services/settings';

const devexRate = 0.0035;

// Checks whether or not the DevEx rate is visible.
const devexRateEnabled = async (): Promise<boolean> => {
  try {
    const setting = await getSettingValue('navigation');
    return setting?.showDevexRate === true;
  } catch (err) {
    console.warn('Failed to check if DevEx rate is visible.', err);
    return false;
  }
};

// Gets the element containing the DevEx rate for the current Robux.
const getDevExRateElement = (
  robuxValueElement: HTMLElement
): HTMLAnchorElement => {
  let devexContainer = document.getElementById('rplus-devex-rate');
  if (!devexContainer) {
    // We don't have a container, create it.
    devexContainer = document.createElement('li');
    devexContainer.setAttribute('id', 'rplus-devex-rate');
    robuxValueElement.parentElement?.after(devexContainer);
  }

  let devexElement = devexContainer.querySelector('a');
  if (!devexElement) {
    devexElement = document.createElement('a');
    devexElement.setAttribute('href', 'https://create.roblox.com/devex');
    devexElement.classList.add('rbx-menu-item');
    devexContainer.append(devexElement);
  }

  return devexElement;
};

// Fetches the Robux from the navigation bar, if possible.
// Otherwise, fetches the Robux from the API.
const getRobux = async (): Promise<number> => {
  const authenticatedUser = parseAuthenticatedUser();
  if (!authenticatedUser) {
    return 0;
  }

  // Adding a count attribute on the element to cache the value.
  const countElement = document.getElementById('navbar-robux');
  const count = Number(countElement?.getAttribute('count') || NaN);
  if (!isNaN(count)) {
    return count;
  }

  const element = document.getElementById('nav-robux-balance');
  if (element) {
    const textCount = parseNumber(element?.innerText);
    countElement?.setAttribute('count', `${textCount}`);

    return textCount;
  }

  const loadedCount = await getRobuxBalance(authenticatedUser.id);
  countElement?.setAttribute('count', `${loadedCount}`);

  return loadedCount;
};

// Updates the Robux count in the navigation bar.
const setRobux = async (value: number): Promise<void> => {
  const authenticatedUser = parseAuthenticatedUser();
  if (!authenticatedUser) {
    // Can't update the Robux count yet because there is no authenticated user.
    // Page probably isn't loaded, or we're logged out.
    return;
  }

  const countElement = document.getElementById('navbar-robux');
  countElement?.setAttribute('count', `${value}`);

  try {
    const abbreviatedAt = await getAbbreviateAtValue();
    const abbreviatedElement = document.getElementById('nav-robux-amount');
    if (abbreviatedElement) {
      setText(abbreviatedElement, abbreviateNumber(value, abbreviatedAt));
    }

    const fullValueElement = document.getElementById('nav-robux-balance');
    if (fullValueElement) {
      setText(fullValueElement, `${value.toLocaleString()} Robux`);

      if (await devexRateEnabled()) {
        const devexBalance = value * devexRate;
        const devexElement = getDevExRateElement(fullValueElement);
        const formattedValue = Number(devexBalance.toFixed(2))
          .toLocaleString()
          .replace(/\.(\d)$/, `.$10`);

        setText(devexElement, `$${formattedValue} USD`);
      }
    }
  } catch (err) {
    console.warn('Failed to update Robux in navigation bar', err);
  }
};

export { getRobux, setRobux };
