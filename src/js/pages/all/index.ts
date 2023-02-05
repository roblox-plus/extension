import { manifest } from '../../constants';
import { addSideNavigationBarItem } from './navigationBar';
import '../../../css/pages/all.scss';

if (manifest.homepage_url) {
  addSideNavigationBarItem(
    manifest.name,
    'nav-rplus',
    'icon-nav-rplus',
    new URL(manifest.homepage_url)
  );
}
