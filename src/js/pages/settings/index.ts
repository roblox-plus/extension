import {
  getSettingValue,
  setSettingValue,
} from '../../services/settingsService';

const postMessage = (id: string, data: any) => {
  data.type = 'FROM_EXTENSION';
  data.id = id;
  window.postMessage(data, location.origin);
};

window.addEventListener('message', (event) => {
  const message = event.data?.data;
  if (
    event.origin !== location.origin ||
    event.data?.type !== 'FROM_PAGE' ||
    !event.data.id ||
    message?.serviceName !== 'extensionSettingsService'
  ) {
    // Not from us, ignore.
    return;
  }

  postMessage(event.data.id, { received: true });

  switch (message.method) {
    case 'getSetting':
      getSettingValue(message.name)
        .then((value) => {
          postMessage(event.data.id, { resolve: value });
        })
        .catch((err) => {
          postMessage(event.data.id, { reject: err });
        });

      return;
    case 'setSetting':
      setSettingValue(message.name, message.value)
        .then((value) => {
          postMessage(event.data.id, { resolve: value });
        })
        .catch((err) => {
          postMessage(event.data.id, { reject: err });
        });

      return;
    case 'ping':
      postMessage(event.data.id, { resolve: true });
      return;
    default:
      postMessage(event.data.id, {
        reject: `Invalid method: ${message.method}`,
      });
      return;
  }
});
