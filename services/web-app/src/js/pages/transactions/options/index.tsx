import { Box } from '@mui/material';
import UploadTransactionsButton from './upload-transactions-button';
import EmailTransactionsButton from './email-transactions-button';

type TransactionOptionsInput = {
  setFiles: (files: File[]) => void;
  draggerEnabled: boolean;
};

export default function TransactionOptions({
  setFiles,
  draggerEnabled,
}: TransactionOptionsInput) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: draggerEnabled ? 'dotted' : 'none',
      }}
    >
      <UploadTransactionsButton setFiles={setFiles} />
      <EmailTransactionsButton />
    </Box>
  );
}
