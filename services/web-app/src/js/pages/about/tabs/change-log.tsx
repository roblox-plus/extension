import { MenuItem, Select } from '@mui/material';
import { Fragment, useMemo } from 'react';
import markdown from '../../../../markdown.json';
import Markdown from '../../../components/markdown';
import useQuery from '../../../hooks/useQuery';

type ChangeLogVersion = {
  version: string;
  content: string;
};

const splitChangeLog = (changeLog: string): ChangeLogVersion[] => {
  const changes: ChangeLogVersion[] = [];

  changeLog.split('\n').forEach((line) => {
    if (line.startsWith('# ')) {
      changes.push({
        version: line.substring(1).trim(),
        content: '',
      });
    } else if (changes.length > 0) {
      changes[changes.length - 1].content += `\n` + line;
    }
  });

  return changes;
};

const changes = splitChangeLog(markdown.changes);

export default function ChangeLog() {
  const [{ version }, setQueryParameter] = useQuery();
  const changeLog = useMemo(() => {
    for (let i = 0; i < changes.length; i++) {
      if (version === changes[i].version) {
        return changes[i].content;
      }
    }

    return changes[0].content;
  }, [version]);
  const selectedVersion = useMemo(() => {
    for (let i = 0; i < changes.length; i++) {
      if (changes[i].version === version) {
        return version;
      }
    }

    return changes[0].version;
  }, [version]);

  return (
    <Fragment>
      <Select
        value={selectedVersion}
        onChange={(e) => {
          if (e.target.value === 'latest') {
            setQueryParameter('version', '');
          } else {
            setQueryParameter('version', e.target.value);
          }
        }}
        sx={{ float: 'right', m: 1 }}
      >
        {changes.map((changeLogVersion) => {
          return (
            <MenuItem
              value={changeLogVersion.version}
              key={changeLogVersion.version}
            >
              {changeLogVersion.version}
            </MenuItem>
          );
        })}
      </Select>
      <Markdown>{changeLog}</Markdown>
    </Fragment>
  );
}
