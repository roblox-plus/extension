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
import {
  LocalizationProvider,
  StaticDateTimePicker,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sendMessage } from '@tix-factory/extension-messaging';
import { LoadingState } from '@tix-factory/extension-utils';
import { Fragment, useMemo, useState } from 'react';
import AgentType from '../../../enums/agentType';
import useSelectedCreator from '../hooks/useSelectedCreator';

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

  const downloadTransactions = async () => {
    console.log(
      'Download transactions for',
      selectedCreator,
      startDate,
      endDate
    );

    setDownloadState(LoadingState.Loading);

    try {
      await sendMessage('transactionsService.emailTransactions', {
        targetType: selectedCreator.type,
        targetId: selectedCreator.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      setDownloadState(LoadingState.Success);
      setDownloadMessage(
        'Please check your email for your transactions, then come back to this page to upload the CSV.'
      );
    } catch (e) {
      console.log('Failed to send transactions email', e);
      setDownloadState(LoadingState.Error);
      setDownloadMessage(
        'An unexpected error occurred while attempting to email your transactions. Please try again.'
      );
    }
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
        return (
          <Alert severity="error">
            {downloadMessage}
            <br />
            <br />
            If this issue is consistent, try downloading your transactions from
            the{' '}
            <Link
              href={
                selectedCreator.type === AgentType.User
                  ? 'https://www.roblox.com/transactions'
                  : `https://www.roblox.com/groups/configure?id=${selectedCreator.id}#!/revenue/sales`
              }
            >
              transactions page
            </Link>
            {' directly.'}
          </Alert>
        );
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
