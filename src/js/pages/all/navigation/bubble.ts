import { parseNumber, setText } from './utils';

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
const setBubbleValue = (
  navigationBarItem: NavigationBarItem,
  value: number
): void => {
  const bubble = getOrCreateBubble(navigationBarItem, true);
  if (!bubble) {
    console.warn(
      'Failed to set the value to a navigation bubble - create failed.',
      navigationBarItem,
      value
    );
    return;
  }

  if (setText(bubble, value.toLocaleString())) {
    bubble.setAttribute('count', `${value}`);
    bubble.setAttribute('title', value.toLocaleString());
  }
};

export type { NavigationBarItem };
export { getBubbleValue, setBubbleValue };
