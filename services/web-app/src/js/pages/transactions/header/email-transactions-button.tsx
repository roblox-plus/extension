import { Email } from '@mui/icons-material';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography,
} from '@mui/material';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  LocalizationProvider,
  StaticDateTimePicker,
} from '@mui/x-date-pickers';
import useSelectedCreator from '../hooks/useSelectedCreator';
import AgentType from '../../../enums/agentType';
import LoadingState from '../../../enums/loadingState';

export default function EmailTransactionsButton() {
  const [selectedCreator] = useSelectedCreator();
  const [dialogOpen, setDiaglogOpen] = useState<boolean>(false);
  const [dateSelected, setDateSelected] = useState<boolean>(false);
  const [downloadState, setDownloadState] = useState<LoadingState | undefined>(
    undefined
  );
  const [downloadMessage, setDownloadMessage] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [startDate, endDate] = useMemo(() => {
    return [
      new Date(date.getFullYear(), date.getMonth()),
      new Date(date.getFullYear(), date.getMonth() + 1),
    ];
  }, [date]);

  const downloadTransactions = () => {
    console.log(
      'Download transactions for',
      selectedCreator,
      startDate,
      endDate
    );

    setDownloadState(LoadingState.Loading);

    window.postMessage({
      type: 'download-transactions',
      targetType: selectedCreator.type,
      targetId: selectedCreator.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  };

  const reset = () => {
    setDateSelected(false);
    setDownloadState(undefined);
    setDownloadMessage('');
  };

  const close = () => {
    setDiaglogOpen(false);
    reset();
  };

  const open = () => {
    reset();
    setDiaglogOpen(true);
  };

  useEffect(() => {
    const listener = (event: MessageEvent<any>) => {
      if (event.data?.type !== 'download-transactions' || !event.data.message) {
        return;
      }

      if (event.data.success) {
        setDownloadState(LoadingState.Success);
      } else {
        setDownloadState(LoadingState.Error);
      }

      setDownloadMessage(event.data.message);
    };

    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  const renderDialogContent = () => {
    switch (downloadState) {
      case undefined:
        return (
          <Fragment>
            <Typography>
              By clicking the download button below, the transactions for{' '}
              <Link
                href={
                  selectedCreator.type === AgentType.User
                    ? 'https://www.roblox.com/transactions'
                    : `https://www.roblox.com/groups/configure?id=${selectedCreator.id}#!/revenue/sales`
                }
              >
                {selectedCreator.name}
              </Link>
              <br />
              Transaction Dates:{' '}
              {`${startDate.toLocaleDateString()} -> ${endDate.toLocaleDateString()}`}
            </Typography>
            <br />
            <Typography>
              Once you receive the email, download the file, and upload it to
              this page - to visualize the transactions.
            </Typography>
          </Fragment>
        );
      case LoadingState.Loading:
        return <CircularProgress />;
      case LoadingState.Error:
        return <Alert severity="error">{downloadMessage}</Alert>;
      case LoadingState.Success:
        return <Typography>{downloadMessage}</Typography>;
      default:
        return <Fragment />;
    }
  };

  return (
    <Fragment>
      <Button sx={{ justifyContent: 'left' }} onClick={open}>
        <Email sx={{ marginRight: 1 }} />
        Email transactions
      </Button>
      <Dialog className="date-picker-dialog" open={dialogOpen} onClose={close}>
        {dateSelected ? (
          <Fragment>
            <DialogTitle>Email Transactions</DialogTitle>
            <DialogContent>{renderDialogContent()}</DialogContent>
            {downloadState === undefined ? (
              <DialogActions>
                <Button onClick={downloadTransactions} color="primary">
                  <Email sx={{ mr: 1 }} />
                  Download
                </Button>
                <Button onClick={close} color="warning">
                  Cancel
                </Button>
              </DialogActions>
            ) : null}
          </Fragment>
        ) : (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <StaticDateTimePicker
              // unfortunately, transactions can't be downloaded before this date
              minDate={new Date('1/1/2021')}
              maxDate={new Date()}
              displayStaticWrapperAs="desktop"
              onMonthChange={(newValue: any) => {
                setDate(newValue);
                setDateSelected(true);
              }}
              openTo="month"
              views={['month', 'year']}
            />
          </LocalizationProvider>
        )}
      </Dialog>
    </Fragment>
  );
}
