import { Box, LinearProgress, Typography } from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import LoadingState from '../../enums/loadingState';
import { importTransactions } from '../../services/transactions';

type TransactionUploaderInput = {
  files: File[];
};

export default function TransactionUploader({
  files,
}: TransactionUploaderInput) {
  const [loadingState, setLoadingState] = useState<LoadingState | undefined>();
  const [message, setMessage] = useState<string>('');
  const [filesImported, setFilesImported] = useState<number>(NaN);

  useEffect(() => {
    let cancelled = false;

    const upload = async (): Promise<void> => {
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            await importTransactions(file);
          } catch (err) {
            if (typeof err === 'string') {
              setMessage(err);
            } else {
              console.warn('Failed to import file', files[i], err);
              setMessage(`Failed to import transactions from ${file.name}`);
            }
          }

          setFilesImported(i + 1);
        }
      } catch (e) {
        console.error(
          'An unhandled exception happened while uploading transaction files',
          e
        );

        if (!cancelled) {
          setMessage('An unknown error occurred, please try again.');
          setLoadingState(LoadingState.Error);
        }
      }
    };

    setMessage('');
    setFilesImported(NaN);

    if (files.length > 0) {
      setLoadingState(LoadingState.Loading);
      upload().then(() => {
        setMessage(`${files.length} transaction files uploaded successfully`);

        setTimeout(() => {
          if (cancelled) {
            return;
          }

          setMessage('');
          setLoadingState(undefined);
        }, 10 * 1000);
      });
    } else {
      setLoadingState(undefined);
    }

    return () => {
      cancelled = true;
    };
  }, [files]);

  if (files.length < 1 || !loadingState) {
    return <Fragment />;
  }

  return (
    <Box>
      {message ? (
        <Typography
          color={loadingState === LoadingState.Error ? 'error' : 'success'}
          variant="body2"
        >
          {message}
        </Typography>
      ) : null}
      <LinearProgress
        value={(filesImported / files.length) * 100}
        variant={isNaN(filesImported) ? 'indeterminate' : 'determinate'}
        color={loadingState === LoadingState.Error ? 'error' : 'success'}
      />
    </Box>
  );
}
