import twemoji from 'twemoji';

type EmojiInput = {
  emoji: string;
};

export default function Emoji({ emoji }: EmojiInput) {
  return <span dangerouslySetInnerHTML={{ __html: twemoji.parse(emoji) }} />;
}
