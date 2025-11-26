import { Link, Paper, Typography } from '@mui/material';
import { Fragment } from 'react';
export const extensionUrl =
  'https://chrome.google.com/webstore/detail/roblox%20/jfbnmfgkohlfclfnplnlenbalpppohkm';

export default function ShutdownPage() {
  return (
    <Fragment>
      <Paper sx={{ margin: 'auto', maxWidth: 550, p: 2, mt: 2 }}>
        <Typography variant="h4" component="h1" textAlign="center">
          🎣 Thanks for everything!
        </Typography>
        <Typography>
          Good morning everyone, long time no see. 😅
          <br />
          <br />
          You are reading this now because{' '}
          <b>
            I am officially unlisting <Link href={extensionUrl}>Roblox+</Link>{' '}
            from the Google Chrome store.
          </b>{' '}
          It may still be available for install for a little while, but no more
          work will be done on this extension.
          <br />
          <br />I started Roblox+ back in December 2013, and published it to the
          Google Chrome webstore in May 2014. I created this extension because I
          wanted more out of Roblox. It started with adding "signature lines" on
          the Roblox forums, and to see someone's inventory value under their
          forum post count. Then went on to receive notifications when Roblox
          released new limited items, and took off from there, eventually adding
          dozens of features to the Roblox website.
          <br />
          <br />I absolutely loved working on this extension, it led to some of
          my favorite experiences, and meeting some of who are now my closest
          friends. I loved updating the extension every week, and making "update
          log" forum posts, collecting feedback from all of you, and then
          creating what you all wanted to see. It was a different time on
          Roblox, and a different time for me, and it was worth every second of
          it.
          <br />
          <br />
          In 2016 the creation of this extension is what led to my internship,
          and then job at Roblox. I've been working at Roblox, and intend to
          continue working at Roblox for as long as they will have me. And while
          for several years I did continue updating the extension, and adding
          new content, over time this translated to me just adding what I wanted
          to see directly into Roblox. And then things started to reverse, the
          extension had features for showing which game servers your friends
          were in, or searching/sorting game servers. We turned these features
          into intern projects, and shipped them for everyone to use. I've had a
          very exciting career that wouldn't be possible without this extension.
          Eventually Roblox+ become more of a test grounds to try and integrate
          Roblox in a way that was more third party friendly, like becoming one
          of the first third party OAuth apps on Roblox - which stemmed from a
          "hackweek project" of mine in 2019.
          <br />
          <br /> But as you've seen, over the past 3 years, the extension has
          very much been in "keep the lights on" mode. More making sure it
          doesn't break Roblox, more than existing to improve Roblox. One of the
          main reasons I didn't shut it down sooner is to help keep users safe.
          The name of the extension alone is what people searched for, and if I
          shut it down it would leave the door open for someone to publish their
          own "Roblox+", and use it to steal accounts.
          <br />
          <br />
          Starting in 2021, I started going outside more, and exploring what
          else life has to offer. Previous to this I was primarily, chronically,
          online. Which, while it was great for the extension, wasn't so great
          for me after so many years. In the past 3 years I've taken on new
          hobbies (🧗), gotten married, and while I still work at Roblox, I have
          other priorities in my life now. Something has to give here, and
          really, it already has. The last update for Roblox+ was published in
          June 2024, and while I didn't know it at the time, this would be my
          last update.
          <br />
          <br />
          Please feel free to fork the code at{' '}
          <Link href="https://github.com/roblox-plus/extension">
            github.com/roblox-plus/extension
          </Link>
          , my only ask is that you cannot use the name. No accreditation
          requested.
          <br />
          <br />
          <b>⚠️ Please remember, all browser extensions can be dangerous.</b>
          <br />
          While many of you trusted me to create a browser extension for you,
          please always remember that any browser extension has just as much
          access to your Roblox account as you do. However, if you are looking
          for some active browser extensions that I have personally read the
          source code for, and can vouch for <i>at this time</i>, I encourage
          you to check out{' '}
          <Link href="https://chromewebstore.google.com/detail/btroblox-making-roblox-be/hbkpclpemjeibhioopcebchdmohaieln?hl=en-US">
            BTRoblox
          </Link>
          , or{' '}
          <Link href="https://chromewebstore.google.com/detail/roseal-augmented-roblox-e/hfjngafpndganmdggnapblamgbfjhnof">
            RoSeal
          </Link>
          . While there are other (very popular) Roblox extensions out there, I
          have personally vetted these two, and as of the time of writing this,
          they are safe, and very cool.
          <br />
          <br />I can keep rambling forever, but I fear it is time to end this
          post. And while I may be leaving the Google Chrome extension scene, I
          always plan on active software development, so maybe you'll see me in
          a future project (
          <Link href="https://caltrain.app">caltrain.app</Link> 🚅).
          <br />
          <br />
          Thank you everyone for all of the support over the years, it's been
          fantastic.
          <br />-{' '}
          <Link href="https://www.roblox.com/users/48103520/profile">
            WebGL3D
          </Link>
        </Typography>
      </Paper>
    </Fragment>
  );
}
