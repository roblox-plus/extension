import { Divider, Paper, Switch, Typography } from '@mui/material';
import { LoadingState } from '@tix-factory/extension-utils';
import { useCallback, useEffect, useState } from 'react';
import {
  getSettingValue,
  getToggleSettingValue,
  setSettingValue,
} from '../../../services/settings';

type ToggleCardInput = {
  // The name of the setting, as displayed on the screen.
  label: string;

  // The description for the setting.
  description: JSX.Element | string;

  // The name of the setting this card belongs to.
  settingName?: string;

  // The default value for the card.
  // Ignored if settingName is specified - except for the dumb legacy setting case.
  defaultValue?: boolean;

  // Whether or not the card is disabled.
  disabled?: boolean;

  // If the setting name is not specified, and the value needs to be loaded, this will be used.
  loadValue?: () => Promise<boolean>;

  // A custom handler for modifying the setting.
  setValue?: (value: boolean) => Promise<void>;

  // A handler for when the setting value changes.
  onChange?: (value: boolean) => void;
};

export default function ToggleCard({
  label,
  description,
  settingName,
  defaultValue,
  disabled,
  loadValue,
  setValue,
  onChange,
}: ToggleCardInput) {
  const [value, setValueState] = useState<boolean>(defaultValue || false);
  const [state, setState] = useState<LoadingState>(
    defaultValue === undefined ? LoadingState.Loading : LoadingState.Success
  );

  const update = useCallback(
    (newValue: boolean): void => {
      setValueState(newValue);

      if (onChange) {
        onChange(newValue);
      }
    },
    [setValueState, onChange]
  );

  useEffect(() => {
    if (!settingName) {
      if (loadValue) {
        loadValue()
          .then((v) => {
            update(v);
            setState(LoadingState.Success);
          })
          .catch((err) => {
            console.error('Failed to load custom setting value', label, err);
            setState(LoadingState.Error);
          });
      }

      return;
    }

    const settingNameSplit = settingName.split('.');
    if (settingNameSplit.length === 2) {
      // Dumb legacy settings..
      getSettingValue(settingNameSplit[0])
        .then((data) => {
          if (typeof data === 'object') {
            if (data.hasOwnProperty(settingNameSplit[1])) {
              update(!!data[settingNameSplit[1]]);
            } else {
              update(!!defaultValue);
            }
          }

          setState(LoadingState.Success);
        })
        .catch((err) => {
          console.error('Failed to load split setting value', settingName, err);
          setState(LoadingState.Error);
        });
    } else {
      getToggleSettingValue(settingName)
        .then((loadedValue) => {
          update(loadedValue);
          setState(LoadingState.Success);
        })
        .catch((err) => {
          console.error('Failed to load setting value', settingName, err);
          setState(LoadingState.Error);
        });
    }
  }, [settingName, defaultValue, update]);

  const changeSetting = async (newValue: boolean): Promise<void> => {
    setState(LoadingState.Loading);

    try {
      if (settingName) {
        const settingNameSplit = settingName.split('.');
        if (settingNameSplit.length === 2) {
          // Dumb legacy settings..
          const container = await getSettingValue(settingNameSplit[0]);
          const updatedContainer = Object.assign({}, container || {}, {
            [settingNameSplit[1]]: newValue,
          });

          await setSettingValue(settingNameSplit[0], updatedContainer);
        } else {
          await setSettingValue(settingName, newValue);
        }

        update(newValue);
      } else if (setValue) {
        await setValue(newValue);
        update(newValue);
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
        disabled={
          !document.body.dataset.extensionId ||
          state !== LoadingState.Success ||
          disabled
        }
        onChange={async (e) => {
          await changeSetting(e.target.checked);
        }}
      />
      <Typography variant="body1">{label}</Typography>
      <Divider sx={{ mt: 1, mb: 1 }} />
      <Typography variant="body2">{description}</Typography>
    </Paper>
  );
}
