import { useEffect, useState } from 'react';

const getSelectedDays = (): number => {
  let days = [1, 7, 30, 366];
  let li = document.querySelectorAll('.transaction-date-dropdown ul>li');
  for (let i = 0; i < li.length; i++) {
    if (li[i].classList.contains('active')) {
      return days[i];
    }
  }

  return days[2];
};

export default function useSelectedDates(): [Date, Date] {
  const [selectedDays, setSelectedDays] = useState<number>(30);

  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = getSelectedDays();
      if (selectedDays !== newValue) {
        setSelectedDays(newValue);
      }
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [selectedDays, setSelectedDays]);

  const now = new Date();
  return [new Date(now.getTime() - selectedDays * 24 * 60 * 60 * 1000), now];
}
