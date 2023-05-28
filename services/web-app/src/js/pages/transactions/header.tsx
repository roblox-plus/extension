import { useState } from 'react';
import { Box } from '@mui/material';
import UploadTransactionsButton from './upload-transactions-button';
import TransactionsPieChart from './pie-chart';

export default function TransactionsHeader() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      <TransactionsPieChart files={files} />
      <Box>
        <UploadTransactionsButton setFiles={setFiles} />
      </Box>
    </Box>
  );
}
