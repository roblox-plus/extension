import { Divider, MenuItem, Paper, Select, Typography } from '@mui/material';
import { LoadingState } from '@tix-factory/extension-utils';
import { useEffect, useState } from 'react';
import {
  getSettingValue,
  setSettingValue,
} from '../../../../services/settings';

const counterRoundAtOptions = [
  10_000, 100_000, 1_000_000, 10_000_000, 100_000_000,
];

export default function NavigationCounterRoundingSetting() {
  const [countersRoundAt, setCountersRoundAt] = useState<number>(10000);
  const [state, setState] = useState<LoadingState>(LoadingState.Loading);

  const update = (newValue: number) => {
    setState(LoadingState.Loading);

    getSettingValue('navigation')
      .then(async (data) => {
        try {
          await setSettingValue(
            'navigation',
            Object.assign({}, data || {}, {
              counterCommas: newValue,
            })
          );

          setCountersRoundAt(newValue);
          setState(LoadingState.Success);
        } catch (err) {
          console.error('Failed to update navigation setting');
          setState(LoadingState.Error);
        }
      })
      .catch((err) => {
        console.error('Failed to load navigation setting', err);
        setState(LoadingState.Error);
      });
  };

  useEffect(() => {
    getSettingValue('navigation')
      .then((data) => {
        if (data?.counterCommas) {
          setCountersRoundAt(data.counterCommas);
        }

        setState(LoadingState.Success);
      })
      .catch((err) => {
        console.error('Failed to load navigation setting', err);
        setState(LoadingState.Error);
      });
  }, []);

  return (
    <Paper sx={{ p: 1, minWidth: 600, mt: 1 }}>
      <Select
        value={countersRoundAt}
        variant="standard"
        sx={{ float: 'right', pl: 1 }}
        onChange={(e) => {
          update(Number(e.target.value) || counterRoundAtOptions[0]);
        }}
        disabled={
          !document.body.dataset.extensionId || state !== LoadingState.Success
        }
      >
        {counterRoundAtOptions.map((roundAt) => {
          return (
            <MenuItem key={roundAt} value={roundAt}>
              {roundAt.toLocaleString()}
            </MenuItem>
          );
        })}
      </Select>
      <Typography variant="h6">Navigation Counter Rounding</Typography>
      <Divider sx={{ mt: 1, mb: 1 }} />
      <Typography variant="body1">
        This is where Robux, private messages, friend requests, and trade
        request counts will stop displaying the full number.
      </Typography>
    </Paper>
  );
}
