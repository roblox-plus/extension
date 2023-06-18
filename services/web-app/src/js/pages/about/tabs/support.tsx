import { Button, Typography } from '@mui/material';
import { sendMessage } from '@tix-factory/extension-messaging';
import { Fragment } from 'react';
import markdown from '../../../../markdown.json';
import Markdown from '../../../components/markdown';

export default function AboutSupport() {
  const reload = async () => {
    await sendMessage('extension.reload', {});
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <Fragment>
      <Markdown>{markdown.support}</Markdown>
      {document.body.dataset.extensionId ? (
        <Fragment>
          <Typography variant="h4">Disaster Recovery</Typography>
          <Typography variant="body1">
            If your extension appears to be completely broken, click this button
            to reload it.
          </Typography>
          <Button
            color="warning"
            sx={{ mt: 1 }}
            variant="outlined"
            onClick={reload}
          >
            Reload Extension
          </Button>
        </Fragment>
      ) : (
        <Fragment />
      )}
    </Fragment>
  );
}
