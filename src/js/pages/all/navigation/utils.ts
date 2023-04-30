import { getSettingValue } from '../../../services/settings';
import { abbreviations } from '../../../utils/abbreviateNumber';

// Parses a whole number out of a string, which could be locale-formatted.
const parseNumber = (input?: string | null) => {
  const match = input?.match(/\d+/g) || [];
  if (match.length < 1) {
    return NaN;
  }

  return Number(match.join(''));
};

// Sets the text on an element, or ignores it.
const setText = (element: HTMLElement, text: string): boolean => {
  if (element.innerText === text) {
    return false;
  }

  element.innerText = text;
  return true;
};

// Fetches the value where we should start abbreviating navigation counters.
const getAbbreviateAtValue = async (): Promise<number> => {
  let abbreviation: number | null = null;
  try {
    const setting = await getSettingValue('navigation');
    if (typeof setting?.counterCommas === 'number') {
      abbreviation = setting.counterCommas;
    }
  } catch (err) {
    console.warn('Failed to determine abbreviation value', err);
  }

  return abbreviation || abbreviations[0].value;
};

export { parseNumber, setText, getAbbreviateAtValue };
