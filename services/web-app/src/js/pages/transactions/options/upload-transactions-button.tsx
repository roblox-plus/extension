import { FolderOpenTwoTone } from '@mui/icons-material';
import { Button, Input } from '@mui/material';
import { Fragment, useRef } from 'react';

type UploadTransactionsButtonInput = {
  setFiles: (files: File[]) => void;
};

export default function UploadTransactionsButton({
  setFiles,
}: UploadTransactionsButtonInput) {
  const fileInputRef = useRef<HTMLElement>();

  return (
    <Fragment>
      <Button
        onClick={() => {
          const input =
            fileInputRef.current && fileInputRef.current.querySelector('input');
          if (input) {
            input.click();
          }
        }}
      >
        <FolderOpenTwoTone sx={{ marginRight: 1 }} />
        Upload Transactions CSV
      </Button>
      <Input
        id="transactions-csv"
        type="file"
        sx={{ display: 'none' }}
        inputProps={{ accept: 'text/csv', multiple: true }}
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target instanceof HTMLInputElement && e.target.files) {
            setFiles(Array.from(e.target.files));
          }
        }}
      />
    </Fragment>
  );
}
