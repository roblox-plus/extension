import emailTransactions from './email-transactions';

// Sends an email to the authenticated user with the group's transactions (sales).
const emailGroupTransactionSales = (
  groupId: number,
  startDate: Date,
  endDate: Date
) => emailTransactions('Group', groupId, 'Sale', startDate, endDate);

// Sends an email to the authenticated user with their personally transactions (sales).
const emailUserTransactionSales = (
  userId: number,
  startDate: Date,
  endDate: Date
) => emailTransactions('User', userId, 'Sale', startDate, endDate);

export { emailGroupTransactionSales, emailUserTransactionSales };
