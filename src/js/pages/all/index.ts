import { getToggleSettingValue } from '../../services/settings';
import twemoji from 'twemoji';
import '../../../css/pages/all.scss';

// twemojis
getToggleSettingValue('twemoji')
  .then((enabled) => {
    if (!enabled) {
      return;
    }

    setInterval(() => twemoji.parse(document.body), 500);

    if (document.body) {
      twemoji.parse(document.body);
    }
  })
  .catch((err) => {
    console.warn('Failed to load twemoji setting preference', err);
  });
