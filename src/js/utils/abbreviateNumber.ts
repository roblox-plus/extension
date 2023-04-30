// All the values to abbreviate a number at.
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

export { abbreviations };

// Abbreviates a number, for human readability, after it surpasses a given value (or after 1,000 if not provided).
export default (value: number, abbreviateAt?: number): string => {
  if (!abbreviateAt) {
    abbreviateAt = abbreviations[0].value;
  }

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
