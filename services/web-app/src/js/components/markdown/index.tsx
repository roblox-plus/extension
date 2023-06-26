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
  new: 'new_button',
  arrows_counterclockwise: 'counterclockwise_arrows_button',
  sweat_smile: 'grinning_face_with_sweat',
};

const bogusOverrides: { [name: string]: string } = {
  arrow_double_up: '⏫',
};

const uncleanAlias = (name: string): string => {
  return name.replace(/_/g, '');
};

const getEmoji = (name: string): string => {
  const overrideValue: string = bogusOverrides[name];
  if (overrideValue) {
    return overrideValue;
  }

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

  // And if we still can't find it... look for partial matches?
  for (let i = 0; i < entries.length; i++) {
    for (let x = 0; x < entries[i][1].length; x++) {
      if (
        entries[i][1][x].includes(name) ||
        uncleanAlias(entries[i][1][x]).includes(uncleanAlias(name))
      ) {
        return entries[i][0];
      }
    }
  }

  return `:${name}:`;
};

export default function Markdown({ children }: MarkdownInput) {
  return (
    <ReactMarkdown
      options={{
        overrides: {
          h1: {
            component: Typography,
            props: {
              component: 'h1',
              variant: 'h3',
              sx: { mb: 1 },
            },
          },
          h2: {
            component: Typography,
            props: {
              component: 'h2',
              variant: 'h4',
              sx: { mb: 1, mt: 2 },
            },
          },
          h3: {
            component: Typography,
            props: {
              component: 'h3',
              variant: 'h5',
              sx: { mb: 1, mt: 2 },
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
