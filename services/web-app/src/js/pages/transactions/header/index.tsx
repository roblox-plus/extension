import { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import TransactionUploader from './transaction-uploader';
import UploadTransactionsButton from './upload-transactions-button';
import EmailTransactionsButton from './email-transactions-button';

export default function TransactionsHeader() {
  const [files, setFiles] = useState<File[]>([]);
  const [draggerEnabled, setDraggerEnabled] = useState<boolean>(false);

  const getFiles = (event: React.DragEvent) => {
    return Array.from(event.dataTransfer.files).filter((f) => {
      return f.type === 'text/csv' || f.type.includes('zip');
    });
  };

  const allowDragAndDrop = (event: React.DragEvent) => {
    // Allow files to be dragged and dropped into the header area.
    event.preventDefault();
    setDraggerEnabled(true);
  };

  const dropFiles = (event: React.DragEvent) => {
    // Prevent the file from being opened in a new tab.
    event.preventDefault();

    const files = getFiles(event);
    console.log('Files dropped on header', files, event);

    setFiles(files);
    setDraggerEnabled(false);
  };

  return (
    <Paper
      className="transactions-panel"
      onDragOver={allowDragAndDrop}
      onDragEnd={() => setDraggerEnabled(false)}
      onDragLeave={() => setDraggerEnabled(false)}
      onDrop={dropFiles}
      sx={{
        margin: 1,
        padding: 1,
        border: draggerEnabled ? 'dotted' : 'none',
        flexDirection: 'column',
        maxWidth: '600px',
      }}
    >
      <Typography variant="h4">Transactions</Typography>
      <Typography variant="body2">
        This page will visualize your transactions from your user, or groups.
        Drag and drop transaction CSV files from that Roblox emails you here, to
        visualize your revenue data.
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          background: 'transparent',
          marginTop: 2,
        }}
      >
        <UploadTransactionsButton setFiles={setFiles} />
        <EmailTransactionsButton />
      </Box>
      <TransactionUploader files={files} setFiles={setFiles} />
    </Paper>
  );
}
