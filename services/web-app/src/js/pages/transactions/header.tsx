import { useState } from 'react';
import { Box } from '@mui/material';
import UploadTransactionsButton from './upload-transactions-button';
import TransactionsPieChart from './pie-chart';
import TransactionOwner from '../../types/transaction-owner';

type TransactionHeaderInput = {
  transactionOwners: TransactionOwner[];
};

export default function TransactionsHeader({
  transactionOwners,
}: TransactionHeaderInput) {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      <TransactionsPieChart
        files={files}
        setFiles={setFiles}
        transactionOwners={transactionOwners}
      />
      <Box>
        <UploadTransactionsButton setFiles={setFiles} />
      </Box>
    </Box>
  );
}
