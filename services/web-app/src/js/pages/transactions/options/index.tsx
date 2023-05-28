import { Box } from '@mui/material';
import UploadTransactionsButton from './upload-transactions-button';
import EmailTransactionsButton from './email-transactions-button';

type TransactionOptionsInput = {
  setFiles: (files: File[]) => void;
};

export default function TransactionOptions({
  setFiles,
}: TransactionOptionsInput) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <UploadTransactionsButton setFiles={setFiles} />
      <EmailTransactionsButton />
    </Box>
  );
}
