import { getSettingValue } from '../../../services/settings';
import { setText } from './utils';

// Gets the values to use to override the links in the navigation bar.
type NavigationLink = {
  text: string;
  href: string;
  override: boolean;
};

const getLinkOverrides = async (): Promise<NavigationLink[]> => {
  try {
    const setting = await getSettingValue('navigation');
    if (setting.buttons) {
      return setting.buttons.map((button: any) => {
        if (
          (button.href === '/develop' && button.text === 'Create') ||
          (button.href.startsWith('/robux') && button.text === 'Robux')
        ) {
          // default value, do not override
          return {
            href: '',
            text: '',
            override: false,
          } as NavigationLink;
        }

        // Value has been set explicitly, use that.
        return {
          href: button.href,
          text: button.text,
          override: true,
        } as NavigationLink;
      });
    }
  } catch (err) {
    console.warn('Failed to fetch navigation link overrides', err);
  }

  return [];
};

// Updates a navigation link item by its index.
const updateNavigationLink = (index: number, text: string, href: string) => {
  document
    .querySelectorAll('#header ul.rbx-navbar')
    .forEach((navigationBar) => {
      const navigationLinks = Array.from(
        navigationBar.querySelectorAll('li>a.nav-menu-title:first-child')
      ) as HTMLAnchorElement[];

      const link =
        navigationLinks[index >= 0 ? index : navigationLinks.length + index];

      if (link) {
        setText(link, text);
        link.setAttribute('href', href);
      }
    });
};

export { updateNavigationLink, getLinkOverrides };
