import { Divider, Paper, Switch, Typography } from '@mui/material';
import { sendMessage } from '@tix-factory/extension-messaging';
import { LoadingState } from '@tix-factory/extension-utils';
import { useEffect, useState } from 'react';

type ToggleCardInput = {
  // The name of the setting, as displayed on the screen.
  label: string;

  // The description for the setting.
  description: JSX.Element | string;

  // The name of the setting this card belongs to.
  settingName?: string;

  // The default value for the card.
  // Ignored if settingName is specified.
  defaultValue?: boolean;

  // Whether or not the card is disabled.
  disabled?: boolean;

  // A custom handler for modifying the setting.
  onChange?: (value: boolean) => Promise<void>;
};

export default function ToggleCard({
  label,
  description,
  settingName,
  defaultValue,
  disabled,
  onChange,
}: ToggleCardInput) {
  const [value, setValue] = useState<boolean>(defaultValue || false);
  const [state, setState] = useState<LoadingState>(LoadingState.Loading);

  useEffect(() => {
    if (!settingName) {
      return;
    }

    sendMessage('settingsService.getSettingValue', {
      key: settingName,
    })
      .then((rawValue) => {
        setValue(!!rawValue);
        setState(LoadingState.Success);
      })
      .catch((err) => {
        console.error('Failed to load setting value', settingName, err);
        setState(LoadingState.Error);
      });
  }, [settingName]);

  const changeSetting = async (newValue: boolean): Promise<void> => {
    setState(LoadingState.Loading);

    try {
      if (settingName) {
        await sendMessage('settingsService.setSettingValue', {
          key: settingName,
          value: newValue,
        });

        setValue(newValue);
      } else if (onChange) {
        await onChange(newValue);
      } else {
        console.error('No settings handler', label);
        setState(LoadingState.Error);
        return;
      }

      setState(LoadingState.Success);
    } catch (e) {
      console.error('Failed to change setting value', label, settingName, e);
      setState(LoadingState.Error);
    }
  };

  return (
    <Paper sx={{ p: 1, minWidth: 600, mt: 1 }}>
      <Switch
        sx={{ float: 'right' }}
        checked={value}
        disabled={state !== LoadingState.Success || disabled}
        onChange={async (e) => {
          await changeSetting(e.target.checked);
        }}
      />
      <Typography variant="h6">{label}</Typography>
      <Divider sx={{ mt: 1, mb: 1 }} />
      <Typography variant="body1">{description}</Typography>
    </Paper>
  );
}
