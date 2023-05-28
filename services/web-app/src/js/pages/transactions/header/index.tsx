import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import TransactionsPieChart from './pie-chart';
import TransactionOptions from '../options';

export default function TransactionsHeader() {
  const [files, setFiles] = useState<File[]>([]);
  const [draggerEnabled, setDraggerEnabled] = useState<boolean>(false);

  const getFiles = (event: React.DragEvent) => {
    return Array.from(event.dataTransfer.files).filter(
      (f) => f.type === 'text/csv'
    );
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
    <Box
      sx={{ display: 'flex', flexDirection: 'row' }}
      onDragOver={allowDragAndDrop}
      onDragEnd={() => setDraggerEnabled(false)}
      onDragLeave={() => setDraggerEnabled(false)}
      onDrop={dropFiles}
    >
      <TransactionsPieChart files={files} setFiles={setFiles} />
      <TransactionOptions setFiles={setFiles} draggerEnabled={draggerEnabled} />
    </Box>
  );
}
