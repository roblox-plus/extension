import { useState } from 'react';
import { Box } from '@mui/material';
import TransactionsPieChart from './pie-chart';
import TransactionOptions from './options';

export default function TransactionsHeader() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      <TransactionsPieChart files={files} setFiles={setFiles} />
      <TransactionOptions setFiles={setFiles} />
    </Box>
  );
}
