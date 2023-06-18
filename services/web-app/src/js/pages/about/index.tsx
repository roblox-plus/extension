import { Box, Tab, Tabs } from '@mui/material';
import { Fragment, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import markdown from '../../../markdown.json';
import Markdown from '../../components/markdown';
import { aboutPath } from '../../constants';
import ChangeLog from './tabs/change-log';
import AboutPremium from './tabs/premium';
import AboutSupport from './tabs/support';

const AboutTabs: { [path: string]: string } = {
  '': 'About',
  changes: 'Update Log',
  premium: 'Premium',
  support: 'Support',
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
};

const aboutTabPaths = Object.keys(AboutTabs);

export default function About() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const tabIndex = useMemo(() => {
    const index = aboutTabPaths.indexOf(tab || '');
    return index >= 0 ? index : 0;
  }, [tab]);

  const isTabVisible = (path: string) => {
    if (path === 'about') {
      // Default path should be visible if no tab is selected
      return !tab;
    }

    // Otherwise, the tab in the URL should match the tab we're checking.
    return path === tab;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Tabs
        value={tabIndex}
        orientation="vertical"
        sx={{
          minWidth: 200,
        }}
        onChange={(_, i) => {
          if (i > 0) {
            navigate(`${aboutPath}/${aboutTabPaths[i]}`);
          } else {
            navigate(aboutPath);
          }
        }}
      >
        {aboutTabPaths.map((path, i) => {
          return (
            <Tab
              key={path}
              tabIndex={i}
              label={AboutTabs[path]}
              sx={{
                flexDirection: 'row',
                justifyContent: 'left',
                textAlign: 'left',
                borderRight: 1,
              }}
            />
          );
        })}
      </Tabs>
      <Box sx={{ p: 1, ml: 1, flexGrow: 1 }}>
        {Object.entries(markdown).map(([markdownKey, markdownText]) => {
          if (!isTabVisible(markdownKey)) {
            return <Fragment key={markdownKey} />;
          }

          switch (markdownKey) {
            case 'changes':
              return <ChangeLog key={markdownKey} />;
            case 'premium':
              return <AboutPremium key={markdownKey} />;
            case 'support':
              return <AboutSupport key={markdownKey} />;
            default:
              return <Markdown key={markdownKey}>{markdownText}</Markdown>;
          }
        })}
      </Box>
    </Box>
  );
}
