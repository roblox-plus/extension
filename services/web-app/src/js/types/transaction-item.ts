import Transaction from './transaction';

type TransactionItem = {
  // The ID of the item involved in the transaction.
  id: number;

  // The name of the item involved in the transaction.
  name: string;

  // The type of item involved in the transaction.
  type: string;

  // The link to the item details page.
  link?: URL;

  // Net revenue from this item.
  revenue: number;

  // Transactions relating to when this item sold (excluding resales).
  saleTransactions: Transaction[];

  // Transactions relating to when this item was resold.
  resaleTransactions: Transaction[];
};

export default TransactionItem;
