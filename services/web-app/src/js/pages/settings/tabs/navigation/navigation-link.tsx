import { Box, Divider, TextField, Typography } from '@mui/material';
import { LoadingState } from '@tix-factory/extension-utils';
import { useEffect, useState } from 'react';
import {
  getSettingValue,
  setSettingValue,
} from '../../../../services/settings';
import SettingPaper from '../../components/setting-paper';

type NavigationLinkSettingInput = {
  index: 0 | 1;

  defaultText: string;

  defaultLink: string;
};

const loadSetting = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    getSettingValue('navigation')
      .then((data) => {
        if (typeof data !== 'object') {
          return {};
        }

        resolve(data);
      })
      .catch(reject);
  });
};

export default function NavigationLinkSetting({
  index,
  defaultText,
  defaultLink,
}: NavigationLinkSettingInput) {
  const [link, setLink] = useState<string>(defaultLink);
  const [text, setText] = useState<string>(defaultText);
  const [state, setState] = useState<LoadingState>(LoadingState.Loading);
  const [linkValid, setLinkValid] = useState<boolean>(true);

  useEffect(() => {
    loadSetting()
      .then((data) => {
        const button = Array.isArray(data.buttons) && data.buttons[index];
        if (button?.href && button?.text) {
          setLink(button.href);
          setText(button.text);
        }

        setState(LoadingState.Success);
      })
      .catch((err) => {
        console.error('Failed to load navigation link override setting', err);
        setState(LoadingState.Error);
      });
  }, [index]);

  const update = async (property: string, value: string) => {
    setState(LoadingState.Loading);

    try {
      const navigationSetting = await loadSetting();
      if (
        !Array.isArray(navigationSetting.buttons) ||
        !navigationSetting.buttons[index]
      ) {
        navigationSetting.buttons = [
          { text: '', href: '' },
          { text: '', href: '' },
        ];
      }

      navigationSetting.buttons[index][property] = value;
      await setSettingValue('navigation', navigationSetting);
      setState(LoadingState.Success);
    } catch (err) {
      console.error('Failed to save navigation link override', err);
      setState(LoadingState.Error);
    }
  };

  return (
    <SettingPaper>
      <Typography variant="body1">Override Navigation Bar Link</Typography>
      <Divider sx={{ mt: 1, mb: 1 }} />
      <Box sx={{ display: 'flex' }}>
        <TextField
          label="Text"
          variant="standard"
          defaultValue={text}
          sx={{ flexGrow: 1, ml: 1, mr: 1 }}
          inputProps={{ maxLength: 20 }}
          disabled={state !== LoadingState.Success}
          onKeyUp={(e) => {
            if (
              e.key === 'Enter' &&
              e.target instanceof HTMLInputElement &&
              e.target.value.trim()
            ) {
              update('text', e.target.value);
            }
          }}
        />
        <TextField
          label="Link"
          variant="standard"
          defaultValue={link}
          sx={{ flexGrow: 1, ml: 1, mr: 1 }}
          inputProps={{ maxLength: 256 }}
          disabled={state !== LoadingState.Success}
          helperText={linkValid ? '' : 'Links must start with a single /'}
          error={!linkValid}
          onKeyUp={(e) => {
            if (
              e.key === 'Enter' &&
              e.target instanceof HTMLInputElement &&
              linkValid
            ) {
              update('href', e.target.value);
            }
          }}
          onChange={(e) => {
            const value = e.currentTarget.value;
            if (!value || !value.startsWith('/') || value.startsWith('//')) {
              if (linkValid) {
                setLinkValid(false);
              }
            } else if (!linkValid) {
              setLinkValid(true);
            }
          }}
        />
      </Box>
    </SettingPaper>
  );
}
