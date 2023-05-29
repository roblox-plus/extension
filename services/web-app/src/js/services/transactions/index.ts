import { openDB } from 'idb';
import { parseCsv } from './read-csv';
import AgentType from '../../enums/agentType';
import Transaction from '../../types/transaction';

// The first line from the Roblox transactions download.
// If this changes.. the database may need to be updated.
const expectedColumns =
  'Id,Buyer User Id,Date and Time,Location,Location Id,Universe Id,Universe,Asset Id,Asset Name,Asset Type,Hold Status,Revenue,Price'.split(
    ','
  );

// Opens the actual database connection.
const tableName = 'transactions';
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

// Imports a CSV file of transactions into the database.
const importTransactions = (csv: File): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (csv.type !== 'text/csv' && !csv.type.includes('zip')) {
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
      const transactions: Transaction[] = [];

      for (let i = 1; i < csvResults.length; i++) {
        const record = csvResults[i];
        if (Object.keys(record).length !== expectedColumns.length) {
          reject(
            `Line ${i + 1} contains invalid number of columns - aborting.`
          );
          return;
        }

        const universeId = Number(record['Universe Id']);
        transactions.push({
          id: record['Id'],
          transaction_type: transactionType,
          buyer_user_id: Number(record['Buyer User Id']),
          owner_id: ownerId,
          owner_type: ownerType,
          item_id: Number(record['Asset Id']),
          item_name: record['Asset Name'],
          item_type: record['Asset Type'],
          created: new Date(record['Date and Time']),
          net_revenue: Number(record['Revenue']),
          gross_revenue: Number(record['Price']),
          hold_status: record['Hold Status'],
          universe_id: universeId,
          universe_name: universeId ? record['Universe'] : '',
          seller_place_id: Number(record['Location Id']),
        });
      }

      const databaseTransaction = await database.transaction(
        tableName,
        'readwrite'
      );
      await Promise.all(
        transactions.map((transaction) =>
          databaseTransaction.store.put(transaction)
        )
      );

      await databaseTransaction.done;

      resolve();
    } catch (err) {
      console.warn('oof', err);
      reject(err);
    }
  });
};

// Pulls transactions from the database, by owner.
// Filtering down to transactions within a specified start and end date.
const getTransactionsByOwner = async (
  ownerType: AgentType,
  ownerId: number,
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> => {
  const database = await transactionDatabase;
  const rows = await database.getAllFromIndex(
    tableName,
    'owner',
    IDBKeyRange.only([ownerType, ownerId])
  );
  return rows.filter(
    (row: Transaction) => row.created >= startDate && row.created <= endDate
  );
};

export { importTransactions, getTransactionsByOwner };
