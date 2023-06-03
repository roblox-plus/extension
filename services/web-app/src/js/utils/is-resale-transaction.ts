import Transaction from '../types/transaction';

const isResaleTransaction = (transaction: Transaction): boolean => {
  if (transaction.gross_revenue === 0) {
    // The gross price was free, must not be a resale... right?
    return false;
  }

  if (transaction.gross_revenue < 8 && transaction.net_revenue > 0) {
    // HACK: Anything less than 8 Robux should net zero Robux if it was a resale.
    return false;
  }

  // HACK: Determine if the transaction is from a resale, by checking if the creator
  // received only 10% of the revenue for this transaction.
  return transaction.net_revenue <= Math.ceil(transaction.gross_revenue * 0.1);
};

export default isResaleTransaction;
