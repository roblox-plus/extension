import { openDB } from 'idb';
import { parseCsv } from './read-csv';
import AgentType from '../../enums/agentType';

const tableName = 'transactions';

type TransactionColumn = {
  // The name as determined by the CSV.
  csvName: string;

  // The name of the column as should be specified in the database.
  // If empty, column will not be put into the database.
  columnName: string;

  // Translates the value from the CSV into its expected format.
  translate?: (value: string) => any;
};

const expectedColumns: TransactionColumn[] = [
  // Id,Buyer User Id,Date and Time,Location,Location Id,Universe Id,Universe,Asset Id,Asset Name,Asset Type,Hold Status,Revenue,Price
  {
    csvName: 'Id',
    columnName: 'id',
  },
  {
    csvName: 'Buyer User Id',
    columnName: 'buyer_user_id',
    translate: (value) => Number(value),
  },
  {
    csvName: 'Date and Time',
    columnName: 'created',
    translate: (value) => new Date(value),
  },
  {
    csvName: 'Location',
    columnName: '',
  },
  {
    csvName: 'Location Id',
    // TODO: Is this universe ID, or place ID?
    columnName: 'seller_place_id',
    translate: (value) => Number(value),
  },
  {
    csvName: 'Universe Id',
    columnName: 'universe_id',
    translate: (value) => Number(value),
  },
  {
    csvName: 'Universe',
    columnName: 'universe_name',
  },
  {
    csvName: 'Asset Id',
    columnName: 'item_id',
    translate: (value) => Number(value),
  },
  {
    csvName: 'Asset Name',
    columnName: 'item_name',
  },
  {
    csvName: 'Asset Type',
    columnName: 'item_type',
  },
  {
    csvName: 'Hold Status',
    columnName: 'hold_status',
  },
  {
    csvName: 'Revenue',
    columnName: 'net_revenue',
    translate: (value) => Number(value),
  },
  {
    csvName: 'Price',
    columnName: 'gross_revenue',
    translate: (value) => Number(value),
  },
];

const transactionDatabase = openDB('transactions', 1, {
  upgrade: (db) => {
    const store = db.createObjectStore(tableName, {
      autoIncrement: false,
      keyPath: 'id',
    });

    store.createIndex('transaction_type', 'transaction_type', {
      unique: false,
    });

    store.createIndex('owner', ['owner_type', 'owner_id'], {
      unique: false,
    });

    store.createIndex('item', ['item_type', 'item_id'], {
      unique: false,
    });

    store.createIndex('created', 'created', {
      unique: false,
    });

    store.createIndex('hold_status', 'hold_status', {
      unique: false,
    });
  },
});

const importTransactions = (csv: File): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (csv.type !== 'text/csv') {
      reject('Only CSV files are accepted.');
      return;
    }

    if (!csv.name.startsWith('Sales_')) {
      reject('Only sales transaction csv files are supported.');
      return;
    }

    const match = csv.name.match(/^(\w+)_(User|Group)(\d+)_/i);
    if (!match) {
      reject('Transactions CSV expected to contain user/group ID.');
      return;
    }

    const transactionType = match[1];
    const ownerType = match[2];
    const ownerId = Number(match[3]);
    if (isNaN(ownerId)) {
      reject('Failed to determine transaction owner');
      return;
    }

    try {
      const csvResults = await parseCsv(csv);
      const database = await transactionDatabase;
      const transactions: any[] = [];

      for (let i = 1; i < csvResults.length; i++) {
        const record = csvResults[i];
        if (Object.keys(record).length !== expectedColumns.length) {
          reject(
            `Line ${i + 1} contains invalid number of columns - aborting.`
          );
          return;
        }

        const transaction: any = {
          transaction_type: transactionType,
          owner_id: ownerId,
          owner_type: ownerType,
        };

        expectedColumns.forEach((c) => {
          if (c.columnName) {
            transaction[c.columnName] = c.translate
              ? c.translate(record[c.csvName])
              : record[c.csvName];
          }
        });

        transactions.push(transaction);
      }

      const databaseTransaction = await database.transaction(
        tableName,
        'readwrite'
      );
      await Promise.all(
        transactions.map((transaction) => {
          return databaseTransaction.store.put(transaction);
        })
      );

      await databaseTransaction.done;

      resolve();
    } catch (err) {
      console.warn('oof', err);
      reject(err);
    }
  });
};

const getTransactionCountByOwner = async (
  ownerType: AgentType,
  ownerId: number
): Promise<number> => {
  if (isNaN(ownerId)) {
    return 0;
  }

  const database = await transactionDatabase;
  try {
    return await database.countFromIndex(
      tableName,
      'owner',
      IDBKeyRange.only([ownerType, ownerId])
    );
  } catch (e) {
    console.error('Failed to load transaction count', ownerType, ownerId, e);
    return 0;
  }
};

export { importTransactions, getTransactionCountByOwner };
