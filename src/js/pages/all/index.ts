import { manifest } from '../../constants';
import { addSideNavigationBarItem } from './navigationBar';
import { getSettingValue } from '../../services/settingsService';
import twemoji from 'twemoji';
import '../../../css/pages/all.scss';

// navigation bar item
if (manifest.homepage_url) {
  addSideNavigationBarItem(
    manifest.name,
    'nav-rplus',
    'icon-nav-rplus',
    new URL(manifest.homepage_url)
  );
}

// twemojis
getSettingValue('twemoji')
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
