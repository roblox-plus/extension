const delay = (delayInMilliseconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delayInMilliseconds);
  });
};

// Requests a lock which will not be released for a minimum amount of time, even if the callback completes.
const requestTimedLocked = (
  name: string,
  minimumTimeInMilliseconds: number,
  callback: () => Promise<void>
): Promise<void> => {
  return navigator.locks.request(name, async () => {
    const result = callback();
    const d = delay(minimumTimeInMilliseconds);
    await Promise.all([result, d]);
  });
};

export { requestTimedLocked };
