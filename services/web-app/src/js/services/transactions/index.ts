const importTransactions = (csv: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (csv.type !== 'text/csv') {
      reject('Only CSV files are accepted.');
      return;
    }

    if (!csv.name.startsWith('Sales_')) {
      reject('Only sales transaction csv files are supported.');
      return;
    }

    const match = csv.name.match(/^\w+_(User|Group)(\d+)_/);
    if (!match) {
      reject('Transactions CSV expected to contain user/group ID.');
      return;
    }

    const ownerType = match[1];
    const ownerId = Number(match[2]);
    if (isNaN(ownerId)) {
      reject('Failed to determine transaction owner');
      return;
    }

    console.log(ownerType, ownerId);

    setTimeout(() => {
      resolve();
    }, 100);
  });
};

export { importTransactions };
