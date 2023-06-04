import { Fragment, useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.location.href =
      'https://github.com/roblox-plus/extension/blob/master/PrivacyPolicy.md';
  }, []);

  return <Fragment />;
}
