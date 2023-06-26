# latest

:boom: Anotha one

## :tada: Updates

### :see_no_evil: Restored Navigation Link Overrides

okay I put the setting back to allow the navigation links to be overridden because you asked

I was too lazy to add the setting yesterday, but today I... did it, enjoyyyyy

### :arrow_double_up: Remaining Notifiers -> TypeScript

As mentioned in the previous update log, we're slowly moving the extension to be compatible with [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/). As part of that, the catalog item notifier and group notifier have been upgraded in this update. There aren't really any functional changes in how these work in this update, minor stuff you wouldn't notice anyway.

See [roblox-plus/extension#108](https://github.com/roblox-plus/extension/pull/108/files) + [roblox-plus/extension#109](https://github.com/roblox-plus/extension/pull/109/files) if interested.

# 2.4.210

Good morning :sweat_smile:

See what I did there? That's an emoji.. and whoa.. where are we? Welcome to [roblox.plus](https://roblox.plus/about/changes)! This is the new domain where some parts of the extension will exist going forward. At the end of last year, Roblox launched their beta OAuth2 project, and I was invited to join it. Since October 2022 I have been working every weekend to make the extension compatible with both [Roblox OAuth2](https://create.roblox.com/docs/cloud/open-cloud/oauth2-overview), and [Google Chrome - Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/). It has been... a motivational struggle, as I'm sure you've seen in the update logs, if you've been paying attention. But here we are I guess. We're getting close enough to finishing up more than half a years worth of work, enough so that I'm finally ready to start sending you all to this page.

Going forward, this page is where you will get information about what has updated in the extension. This page will also be based on the [CHANGELOG.md](https://github.com/roblox-plus/extension/blob/master/CHANGELOG.md), where you can then find information about previous versions and stuffs.. assuming I populate it. I have all the data about previous versions somewhere, I promise.

Also also, there's a little selector in the top right, in case you didn't notice it - and you can view the update logs for the other versions.

## :tada: Updates

### :new: roblox.plus/about

god, I can use emojis now, this feels soooo good
yes, this is just to say that we actually have an about page now, with a bunch of information. Look on the left navigation there, click around, and read the stuffs.

okay fine, I put in absolute minimal effort into each of those tabs _except for_ the [privacy policy](https://roblox.plus/about/privacy-policy)

but whatever man

### :gear: roblox.plus/settings

For as long as this extension has been around, there have been settings. This page has seen many iterations over the years, and it's onto the next. For a long time the settings page has existed in the [Roblox account settings page](https://www.roblox.com/my/account) as its own tab. But no longer - welcome to [roblox.plus/settings](https://roblox.plus/settings).

The settings for this extension now live under this domain. And in the future, as a result, we may be able to have settings that can be enabled for Roblox without having the extension installed. But for now that is only a dream. For now it's the same settings we had before, just with more emojis, in a new home.

### :arrows_counterclockwise: Trade Notifier Updated

This thing has been updated to better support that manifest V3 thing I was talking about. Pretty much works the same as it did before, except you can't pick a sound for it anymore. Sorry.

### :axe: Removed chrome.webRequest

This update removed the remaining usages of one of the older chrome APIs that was being used by this extension: [chrome.webRequest](https://developer.chrome.com/docs/extensions/reference/webRequest). The remaining usages were replaced with [chrome.declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest), which is compatible with manifest V3.

### :knife: Removed Navigation Overrides

I have decided to remove the feature that let you override the right two navigation links. Mainly because I didn't feel like adding them to the new settings page, and I don't use this feature myself. If I am in the wrong.. voice your concerns on [GitHub](https://github.com/roblox-plus/extension/issues), make an argument for why it should stay.

### :mute: Notification Sounds Removed

What you may have also noticed... is that you can no longer pick a custom sound to play when you get a notification. This is in preparation for maybe notifications working without having the extension installed, and then being in line with what browsers support by default, without extensions. Sorry.

# 2.4.157

good morning good morning good morning<br/>
i bet some of you were like "where was our update last week bro, you said an update every week"<br/>
well i was cookin up somethin big<br/>
somethin fierce<br/>
somethin that took two weekends worth of time to put together<br/>
and you're like "omg what could this update be, what is he about to drop omg"<br/>
ladies and gentlemen, I bring to you the update that applies only to the 1%ers out there<br/>

may i present to you.... roblox.plus/transactions<br/>
this page will start working once the extension updates to 2.4.157<br/>

no update next week, i'm takin next weekend off<br/>
duces
