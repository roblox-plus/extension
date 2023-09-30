import { useEffect, useState } from 'react';

const parseDate = (
  selector: () => HTMLInputElement | null
): Date | undefined => {
  const input = selector();
  if (input?.value) {
    return new Date(input.value);
  }
};

// A hook for parsing an input date from an input found in the container.
export default function useDate(
  selector: () => HTMLInputElement | null
): Date | undefined {
  const [date, setDate] = useState<Date | undefined>(parseDate(selector));

  useEffect(() => {
    const interval = setInterval(() => {
      const parsedDate = parseDate(selector);
      if (parsedDate?.getTime() !== date?.getTime()) {
        setDate(parsedDate);
      }
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [date, setDate]);

  return date;
}
