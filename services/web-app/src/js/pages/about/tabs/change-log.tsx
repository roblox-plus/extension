import { useMemo } from 'react';
import markdown from '../../../../markdown.json';
import Markdown from '../../../components/markdown';
import useQuery from '../../../hooks/useQuery';

type VersionChangeLog = {
  version: string;
  content: string;
};

const splitChangeLog = (changeLog: string): VersionChangeLog[] => {
  const changes: VersionChangeLog[] = [];

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

const changes = splitChangeLog(markdown.changes);

export default function ChangeLog() {
  const { version } = useQuery();
  const changeLog = useMemo(() => {
    for (let i = 0; i < changes.length; i++) {
      if (version === changes[i].version) {
        return changes[i].content;
      }
    }

    return changes[0].content;
  }, [version]);

  return <Markdown>{changeLog}</Markdown>;
}
