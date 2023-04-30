import abbreviateNumber from '../../../utils/abbreviateNumber';
import { getAbbreviateAtValue, parseNumber, setText } from './utils';

type NavigationBarItem = 'nav-trade' | 'nav-friends' | 'nav-message';

// Gets or creates a bubble in the side navigation bar.
const getOrCreateBubble = (
  navigationBarItem: NavigationBarItem,
  allowCreate: boolean
): HTMLSpanElement | undefined => {
  let bubble = document.querySelector(
    `#${navigationBarItem} .notification-blue`
  ) as HTMLSpanElement;
  if (bubble) {
    return bubble;
  }

  if (allowCreate) {
    const navigationItem = document.getElementById(navigationBarItem);
    if (!navigationItem) {
      return undefined;
    }

    let container = navigationItem?.querySelector(
      '.dynamic-width-item.align-right'
    );
    if (!container) {
      container = document.createElement('div');
      container.setAttribute('class', 'dynamic-width-item align-right');
      navigationItem?.appendChild(container);
    }

    bubble = document.createElement('span');
    bubble.setAttribute('class', 'notification-blue notification hidden');
    bubble.setAttribute('title', '0');
    bubble.setAttribute('count', '0');
    bubble.innerHTML = '0';
    container.appendChild(bubble);

    return bubble;
  }

  return undefined;
};

// Gets the value from a navigation bar bubble.
const getBubbleValue = (navigationBarItem: NavigationBarItem): number => {
  const bubble = getOrCreateBubble(navigationBarItem, false);
  if (!bubble) {
    return 0;
  }

  return parseNumber(bubble.getAttribute('title'));
};

// Attempts to set the value in a navigation bar bubble.
const setBubbleValue = async (
  navigationBarItem: NavigationBarItem,
  value: number
): Promise<void> => {
  const bubble = getOrCreateBubble(navigationBarItem, true);
  if (!bubble) {
    console.warn(
      'Failed to set the value to a navigation bubble - create failed.',
      navigationBarItem,
      value
    );
    return;
  }

  const abbreviatedAt = await getAbbreviateAtValue();
  if (setText(bubble, abbreviateNumber(value, abbreviatedAt))) {
    bubble.setAttribute('title', value.toLocaleString());
    bubble.classList.toggle('hidden', value <= 0);
  }
};

export type { NavigationBarItem };
export { getBubbleValue, setBubbleValue };
