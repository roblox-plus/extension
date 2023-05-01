import { useEffect, useState } from 'react';

const parseDate = (
  container: HTMLElement,
  selector: string
): Date | undefined => {
  const input = container.querySelector(selector) as HTMLInputElement;

  if (input.value) {
    return new Date(input.value);
  }
};

// A hook for parsing an input date from an input found in the container.
export default function useDate(
  container: HTMLElement,
  selector: string
): Date | undefined {
  const [date, setDate] = useState<Date | undefined>(
    parseDate(container, selector)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const parsedDate = parseDate(container, selector);
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
