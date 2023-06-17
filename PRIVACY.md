# Privacy Policy

If you're going to use Roblox+ you should be informed of everything it does. Safety first!

## :door: Website Access

When you install a Google Chrome extension, if that extension has access to a website, that extension has just as much access to that website as you do. [Roblox+](https://chrome.google.com/webstore/detail/roblox%20/jfbnmfgkohlfclfnplnlenbalpppohkm) is no exception to that. This means the extension can access:

- Your Robux
- Your inventory (even if it's private)
- The games you play
- The groups you're in
- Who your friends are
- Roblox authentication
- Everything on [roblox.com](https://www.roblox.com)

The extension does not need access to all of these things, but it is what happens when you install an extension and give it access to [roblox.com](https://www.roblox.com) - it can access _all_ of Roblox.

With this access, the extension modifies the website, seemlessly injecting in features. This is why the extension exists, it's what it does. For example: If you've enabled the feature to show your Robux DevEx rate, it accesses your Robux, and modifies the website by adding in the DevEx rate right into the Robux popover.

For Roblox+ to add all the features you see, as advertised, it needs access to the following domains (and their subdomains):

- [roblox.com](https://www.roblox.com) - This so content can be loaded from and injected into the website.
- `rbxcdn.com` - To be able to load asset contents, and thumbnails.
- `roblox.plus` - This is the domain you're on right now, and the extension interacts with it.

You should have a strong degree of trust in the creator of any extension you install in your browser. By installing [Roblox+](https://chrome.google.com/webstore/detail/roblox%20/jfbnmfgkohlfclfnplnlenbalpppohkm), you are trusting me, [WebGL3D](https://www.roblox.com/users/48103520/profile), with essentially full access to your account. If you are not okay with this, you should not install the extension.

## :books: Data

Your information, and your data privacy protection is very important to me. In fact, I don't want it. However, when you use [Roblox+](https://chrome.google.com/webstore/detail/roblox%20/jfbnmfgkohlfclfnplnlenbalpppohkm), or [roblox.plus](https://roblox.plus/login), some information about your account leaves your device, and is sent to the backend servers this extension/website uses. When you logged into [roblox.plus](https://roblox.plus/login), your username + user ID were sent to the backend server that runs the website. This is necessary to be able to know who is logged in, to render pages on the website. Additionally, we load your avatar thumbnail on the backend server, and then render into this website.

When you log into [roblox.plus](https://roblox.plus/login), your user information is stored in a cookie on your device, and is not stored on any Roblox+ backend database.

These are the cases where we currently store your user ID in a backend database:

- When you use the catalog item notifier. This feature keeps track of a token, which is associated with your device, which can be used to send push notifications. We keep track of which user ID that token belongs to, to better personalize the notifications. For example: To be able to only show you notifications for creators you follow - we need to know _who_ you are following.
- When you purchase a Roblox+ Premium subscription, we keep track of it, and when it expires.

Your extension settings/preferences are saved to your browser, and not saved on any Roblox+ backend server. In the future, this may change for the features which don't require you to use the extension, but for now they are all stored in the extension.

In the future we reserve the right to expand this to all notification types. There are future plans for being able to send notifications without having the extension installed, and when that happens, the backend server needs to know who you are. It will also need to know more information about you to be able to send you notifications. For example: If we update the friend notifier to be based on a backend server, so you don't need to have the extension installed, the backend server would need access to your friends list, so it can notify you about what your friends are doing. Which it will need, because it won't have access to your account through the extension.

**When you use Roblox+, because of how the internet works, your IP address is also visible to the Roblox+ backend server.**

### :moneybag: Revenue Data

When you use the [transactions page](https://roblox.plus/transactions) page, your revenue data is stored on your device only, and is never sent to a backend server. I absolutely do not want revenue data on the Roblox+ backend servers, no thank you.

### :roll_eyes: tl;dr

This information is accessed by the Roblox+ backend servers:

- Your user ID
- Your username
- Your avatar thumbnail
- Your IP address

## :electric_plug: Web Request Interception

Sometimes the extension will intercept requests going to [roblox.com](https://www.roblox.com). This use to be necessary for things like launching games, to generate authentication sessions to open Roblox with. Following the release of [Developer Deeplinking](https://devforum.roblox.com/t/developer-deeplinking-beta/1904069), this is no longer necessary. But we still intercept some web traffic for more minor features. For example: We send a notification when Roblox+ starts, and you can configure that notification to only be sent after you visit [roblox.com](https://www.roblox.com). We listen for web traffic going to the [roblox.com](https://www.roblox.com), but we **never** save or record it.

## :white_check_mark: Permissions

The [extension manifest](https://github.com/roblox-plus/extension/blob/master/src/manifest.json) a list of permissions that the extension has access to. Not including the websites, which are mentioned above, these are the browser APIs the extension has permission for:

- [alarms](https://developer.chrome.com/docs/extensions/reference/alarms/): This one is used for the notifier features which execute in the background
- [gcm](https://developer.chrome.com/docs/extensions/reference/gcm/), [notifications](https://developer.chrome.com/docs/extensions/reference/notifications/): These are used to send notifications to the browser extension
- [webRequest](https://developer.chrome.com/docs/extensions/reference/webRequest/), [webRequestBlocking](https://developer.chrome.com/docs/extensions/reference/webRequest/), [declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/): These are used for the web request interception mentioned above
- [tts](https://developer.chrome.com/docs/extensions/reference/tts/): Sometimes the notifications this extension sends speak when they are sent, and this permission is required for that
- [storage](https://developer.chrome.com/docs/extensions/reference/storage/): The extension uses this one to store things like settings preferences
