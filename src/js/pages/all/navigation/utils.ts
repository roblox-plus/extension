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

export { parseNumber, setText };
