import { getRobuxBalance } from '../../services/currencyService';
import {
  getSettingValue,
  getSettingValueAndListenForChanges,
} from '../../services/settingsService';
import authenticatedUser from '../../utils/authenticatedUser';

const devexRate = 0.0035;
const abbreviations = [
  {
    value: 1000,
    abbreviation: 'K',
  },
  {
    value: 1_000_000,
    abbreviation: 'M',
  },
  {
    value: 1_000_000_000,
    abbreviation: 'B',
  },
  {
    value: 1_000_000_000_000,
    abbreviation: 'T',
  },
];

const parseNumber = (input?: string) => {
  const match = input?.match(/\d+/g) || [];
  if (match.length < 1) {
    return NaN;
  }

  return Number(match.join(''));
};

const setText = (element: HTMLElement, text: string) => {
  if (element.innerText === text) {
    return;
  }

  element.innerText = text;
};

const getAbbreviateAtValue = async (): Promise<number> => {
  let abbreviation: number | null = null;
  try {
    abbreviation = await getSettingValue('navigation-counter-abbreviation');
  } catch (err) {
    console.warn('Failed to fetch navigation-counter-abbreviation', err);
  }

  return abbreviation || abbreviations[0].value;
};

const abbreviate = (value: number, abbreviateAt: number): string => {
  if (value >= abbreviateAt) {
    for (let i = abbreviations.length - 1; i >= 0; i--) {
      if (value >= abbreviations[i].value) {
        return `${Math.floor(value / abbreviations[i].value).toLocaleString()}${
          abbreviations[i].abbreviation
        }+`;
      }
    }
  }

  return value.toLocaleString();
};

const getRobux = (): number => {
  const countElement = document.getElementById('nav-robux-amount');
  const count = Number(countElement?.getAttribute('count') || NaN);
  if (!isNaN(count)) {
    return count;
  }

  const element = document.getElementById('nav-robux-balance');
  const textCount = parseNumber(element?.innerText);
  if (!isNaN(textCount)) {
    countElement?.setAttribute('count', textCount.toString());
  }

  return textCount;
};

const setAbbreviatedRobux = (count: number, abbreviateAt: number) => {
  const navbarElement = document.getElementById('nav-robux-amount');
  if (navbarElement) {
    navbarElement?.setAttribute('count', count.toString());
    setText(navbarElement, abbreviate(count, abbreviateAt));
  }

  const fullBalanceElement = document.getElementById('nav-robux-balance');
  if (fullBalanceElement) {
    fullBalanceElement.innerText = count.toLocaleString() + ' Robux';

    let devexElement = document.getElementById('rplus-devex-rate');
    if (!devexElement) {
      const devexContainer = document.createElement('li');

      devexElement = document.createElement('a');
      devexElement.setAttribute('id', 'rplus-devex-rate');
      devexElement.setAttribute('href', 'https://create.roblox.com/devex');
      devexElement.classList.add('rbx-menu-item');
      devexContainer.append(devexElement);

      fullBalanceElement.parentElement?.after(devexContainer);
    }

    const devexBalance = count * devexRate;
    setText(
      devexElement,
      `$${Number(devexBalance.toFixed(2)).toLocaleString()} USD`
    );
  }
};

const setRobux = async (count: number) => {
  const abbreviation = await getAbbreviateAtValue();
  setAbbreviatedRobux(count, abbreviation || abbreviations[0].value);
};

const getPrivateMessageCount = (): number => {
  const element = document.querySelector<HTMLElement>(
    '#nav-message .notification'
  );
  return parseNumber(element?.getAttribute('title') || '');
};

const setPrivateMessageCount = async (count: number) => {
  const element = document.querySelector<HTMLElement>(
    '#nav-message .notification'
  );

  if (!element) {
    return;
  }

  element.setAttribute('title', count.toLocaleString());
  element.classList.toggle('hidden', count < 1);

  const abbreviation = await getAbbreviateAtValue();
  setText(element, abbreviate(count, abbreviation));
};

const getTradeCount = (): number => {
  const element = document.querySelector<HTMLElement>(
    '#nav-trade .notification'
  );
  return parseNumber(element?.getAttribute('title') || '');
};

const setTradeCount = async (count: number) => {
  const element = document.querySelector<HTMLElement>(
    '#nav-trade .notification'
  );

  if (!element) {
    return;
  }

  element.setAttribute('title', count.toLocaleString());
  element.classList.toggle('hidden', count < 1);

  const abbreviation = await getAbbreviateAtValue();
  setText(element, abbreviate(count, abbreviation));
};

const updateRobux = async () => {
  if (!authenticatedUser) {
    return;
  }

  try {
    const robuxBalance = await getRobuxBalance(authenticatedUser.id);
    await setRobux(robuxBalance);
  } catch (e) {
    console.warn('Failed to update Robux balance', e);
  }
};

const addSideNavigationBarItem = (
  label: string,
  id: string,
  iconClassName: string,
  link: URL
) => {
  const upgradeButton = document.querySelector(
    '#left-navigation-container li.rbx-upgrade-now'
  );
  if (!upgradeButton) {
    return;
  }

  const listItem = document.createElement('li');

  const linkElement = document.createElement('a');
  linkElement.setAttribute('id', id);
  linkElement.setAttribute('href', link.href);
  linkElement.setAttribute('class', 'dynamic-overflow-container text-nav');
  listItem.appendChild(linkElement);

  const imgDiv = document.createElement('div');
  linkElement.appendChild(imgDiv);

  // It feels wrong... but it's consistent.
  const img = document.createElement('span');
  img.setAttribute('class', iconClassName);
  imgDiv.appendChild(img);

  const labelSpan = document.createElement('span');
  labelSpan.innerText = label;
  labelSpan.setAttribute('class', 'font-header-2 dynamic-ellipsis-item');
  linkElement.appendChild(labelSpan);

  upgradeButton.before(listItem);
};

getSettingValueAndListenForChanges(
  'navigation-counter-abbreviation',
  async (abbreviation) => {
    if (!authenticatedUser || !abbreviation) {
      return;
    }

    await setPrivateMessageCount(getPrivateMessageCount());
    await setTradeCount(getTradeCount());

    const robuxBalance = await getRobuxBalance(authenticatedUser.id);
    setAbbreviatedRobux(robuxBalance, abbreviation);
  }
);

getSettingValueAndListenForChanges('show-devex-rate', async (enabled) => {
  const navbarRobux = document.getElementById('navbar-robux');
  navbarRobux?.classList.toggle('devex-rate-visible', !!enabled);
});

setInterval(async () => {
  const liveRobux = await getSettingValue('navigation-robux-live');
  if (liveRobux) {
    await updateRobux();
  }

  const showDevexRate = await getSettingValue('show-devex-rate');
  if (showDevexRate && !document.getElementById('rplus-devex-rate')) {
    const robux = getRobux();
    if (!isNaN(robux)) {
      // The user is expecting to see their USD balance, but the element doesn't exist.
      // Set the Robux, which will create the element.
      await setRobux(robux);
    }
  }
}, 250);

export { addSideNavigationBarItem };
