import { Box, Link, Typography } from '@mui/material';
import emojilib from 'emojilib';
import ReactMarkdown from 'markdown-to-jsx';
import twemoji from 'twemoji';

type MarkdownInput = {
  children: string;
};

// Sometimes emojis exist, and their aliases don't match between GitHub and emojilib.
const emojiOverrides: { [markdownName: string]: string } = {
  roll_eyes: 'eyeroll',
  white_check_mark: 'check_mark_button',
};

const uncleanAlias = (name: string): string => {
  return name.replace(/_/g, '');
};

const getEmoji = (name: string) => {
  const entries = Object.entries(emojilib);

  if (emojiOverrides.hasOwnProperty(name)) {
    name = emojiOverrides[name];
  }

  // If it's the first in the list, prefer it.
  for (let i = 0; i < entries.length; i++) {
    if (
      entries[i][1][0] === name ||
      uncleanAlias(entries[i][1][0]) === uncleanAlias(name)
    ) {
      return entries[i][0];
    }
  }

  // Otherwise.. it has to be in there at all.
  for (let i = 0; i < entries.length; i++) {
    if (
      entries[i][1].includes(name) ||
      entries[i][1].map(uncleanAlias).includes(uncleanAlias(name))
    ) {
      return entries[i][0];
    }
  }

  return name;
};

export default function Markdown({ children }: MarkdownInput) {
  return (
    <ReactMarkdown
      options={{
        overrides: {
          h1: {
            component: Typography,
            props: {
              variant: 'h3',
            },
          },
          h2: {
            component: Typography,
            props: {
              variant: 'h4',
            },
          },
          h3: {
            component: Typography,
            props: {
              variant: 'h5',
            },
          },
          a: {
            component: Link,
          },
          p: {
            component: Typography,
            props: {
              paragraph: true,
            },
          },
          code: {
            component: Typography,
            props: {
              component: 'code',
              sx: { background: 'rgba(127,127,127,0.25)' },
            },
          },
          li: {
            component: (props: any) => (
              <Box component="li" sx={{ mt: 1 }}>
                <Typography component="span" {...props} />
              </Box>
            ),
          },
        },
      }}
    >
      {twemoji
        .parse(
          children.replace(/:\w+:/g, (str) =>
            getEmoji(str.substring(1, str.length - 1))
          )
        )
        .replace(/class=/g, 'className=')}
    </ReactMarkdown>
  );
}
