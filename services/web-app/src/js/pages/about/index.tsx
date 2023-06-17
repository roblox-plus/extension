import { Box, Tab, Tabs } from '@mui/material';
import { Fragment, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import markdown from '../../../markdown.json';
import Markdown from '../../components/markdown';
import { aboutPath } from '../../constants';
import useQuery from '../../hooks/useQuery';

const AboutTabs: { [path: string]: string } = {
  '': 'About',
  changes: 'Update Log',
  premium: 'Premium',
  support: 'Support',
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
};

const aboutTabPaths = Object.keys(AboutTabs);

type ChangeLog = {
  version: string;
  content: string;
};

const splitChangeLog = (changeLog: string): ChangeLog[] => {
  const changes: ChangeLog[] = [];

  changeLog.split('\n').forEach((line) => {
    if (line.startsWith('# ')) {
      changes.push({
        version: line.substring(1).trim(),
        content: line,
      });
    } else if (changes.length > 0) {
      changes[changes.length - 1].content += `\n` + line;
    }
  });

  return changes;
};

export default function About() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { version } = useQuery();
  const tabIndex = useMemo(() => {
    const index = aboutTabPaths.indexOf(tab || '');
    return index >= 0 ? index : 0;
  }, [tab]);

  const getChangeLog = (fullChangeLog: string): string => {
    const changes = splitChangeLog(fullChangeLog);
    for (let i = 0; i < changes.length; i++) {
      if (version === changes[i].version) {
        return changes[i].content;
      }
    }

    return changes[0].content;
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
      <Box sx={{ p: 1, ml: 1 }}>
        {Object.entries(markdown).map(([markdownKey, markdownText]) => {
          if (
            (!tab && markdownKey === 'about') ||
            tab === markdownKey.replace(/([A-Z])/g, '-$1').toLowerCase()
          ) {
            if (tab === 'changes') {
              return (
                <Markdown key={markdownKey}>
                  {getChangeLog(markdownText)}
                </Markdown>
              );
            }

            return <Markdown key={markdownKey}>{markdownText}</Markdown>;
          }

          return <Fragment key={markdownKey} />;
        })}
      </Box>
    </Box>
  );
}
