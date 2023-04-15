import { getToggleSettingValue } from '../../services/settingsService';
import twemoji from 'twemoji';

// twemojis
getToggleSettingValue('twemoji')
  .then((enabled) => {
    if (!enabled) {
      return;
    }

    setInterval(twemoji.parse, 500, document.body);
    twemoji.parse(document.body);
  })
  .catch((err) => {
    console.warn('Failed to load twemoji setting preference', err);
  });
