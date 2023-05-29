import { CalendarMonth } from '@mui/icons-material';
import { Button, Dialog } from '@mui/material';
import { Fragment, useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  LocalizationProvider,
  StaticDateTimePicker,
} from '@mui/x-date-pickers';

type TransactionDatePickerInput = {
  date: Date;
  setDate: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
};

export default function TransactionDatePicker({
  date,
  setDate,
  minDate,
  maxDate,
}: TransactionDatePickerInput) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <Fragment>
      <Button onClick={() => setDialogOpen(true)}>
        <CalendarMonth sx={{ mr: 1 }} />
        {date.toLocaleDateString()}
      </Button>
      <Dialog
        className="date-picker-dialog"
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <StaticDateTimePicker
            minDate={minDate}
            maxDate={maxDate}
            defaultValue={date}
            showDaysOutsideCurrentMonth={true}
            displayStaticWrapperAs="desktop"
            onChange={(newValue: any) => {
              setDate(newValue);
              setDialogOpen(false);
            }}
            openTo="day"
            views={['day', 'month']}
          />
        </LocalizationProvider>
      </Dialog>
    </Fragment>
  );
}
