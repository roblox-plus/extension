const wait = (time: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
};

export default wait;
