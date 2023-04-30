import abbreviateNumber from '../../../utils/abbreviateNumber';
import { getAbbreviateAtValue, parseNumber, setText } from './utils';

type NavigationBarItem = 'nav-trade' | 'nav-friends' | 'nav-message';

// Gets or creates a bubble in the side navigation bar.
const getOrCreateBubble = (
  navigationBarItem: NavigationBarItem,
  allowCreate: boolean
): HTMLSpanElement | undefined => {
  const selector = `#${navigationBarItem} .notification-blue`;
  let bubble = document.querySelector(selector) as HTMLSpanElement;
  if (bubble) {
    // it's possible that Roblox could have created a bubble after we did
    // validate that, and if they did, prefer theirs.
    const allBubbles = document.querySelectorAll(selector);
    if (allBubbles.length > 1) {
      const ourBubble = document.querySelector(
        `#${navigationBarItem} div[rplus] .notification-blue`
      );
      if (ourBubble) {
        ourBubble.parentElement?.remove();
      }

      bubble = document.querySelector(selector) as HTMLSpanElement;
    }

    if (bubble) {
      return bubble;
    }
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
      container.setAttribute('rplus', `${+new Date()}`);
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
    // It's possible the navigation bar item doesn't exist yet.
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
