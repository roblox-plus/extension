# Privacy Policy

If you're going to use Roblox+ you should be informed of everything it does. Safety first!

## Website Access

Any extension that has permission to roblox.com has just as much access to the website as you do! Roblox+ is no exception to that. Any extension that has access to roblox.com has access to anything you can do, including but not limited to:

- Your Robux
- Your inventory
- The games you play
- The groups you're in
- Your friends list
- Roblox Authentication
- Everything.

Why does Roblox+ need access to all of this?
For the most part it doesn't. None of this data is stored. However - some of it used by the extension.
For example: The extension gets your Robux count every few seconds when you turn on the live navigation counters feature.
Another example: The extension loads your friends list every few seconds when you turn on the friend notifications so it knows who to notify you for.
Final example: Roblox authentication tokens are accessed by this extension to launch you into games when you click buttons like the follow button on notifications when your friends play a game.
This extension heavily utilizes your Roblox account data to improve your Roblox experience. That's the entire point of the extension. If you do not trust me as a developer to use this data securely and with good judgement to not expose you to any harm please do not use this extension.

Roblox+ needs access to the roblox.com website to be able to modify the website. Without access to the website there is no way to add these features to website.
Roblox+ has access to two other domains:

- rbxcdn.com
- roblox.plus

What are these domains?
rbxcdn.com is Roblox's content delivery domain. Any time the extension plays a sound (like when you get a notification) or you view asset contents on an item details page the data is loaded from an rbxcdn.com domain.
What about roblox.plus?
roblox.plus is a domain owned by me ([WebGL3D](https://www.roblox.com/users/48103520/profile?rbxp=48103520)). This domain is used for two features of the extension:

- Roblox+ Premium
- Roblox Catalog Notifier

To check whether or not you are a subscriber of Roblox+ Premium a request is sent to roblox.plus which includes your user Id so the Roblox+ servers can check your Roblox+ Premium subscription status. This is only done if it cannot find a subscription by checking VIP servers for the Roblox+ Hub.
There is another time your user Id will be sent to the Roblox+ servers: Roblox Catalog Notifier notifications. Your user Id and cloud messaging token are sent to the Roblox+ servers to subscribe you to the cloud notification topics that are responsible for sending you notifications about Roblox catalog items.
Why does the Roblox Catalog Notifier need your user Id?
There is a process for deciding which notifications to send to you based on whether or not you're a subscriber of Roblox+ Premium. If you have Roblox+ Premium and the catalog item that gets released is limited there will be an additional purchase option directly on the popup notification. The user id is sent to the backend to know which notification topic to subscribe you to.

## Data

For the most part all data for the extension remains in the extension. All personal and Roblox data is kept inside the extension and is not sent outside of Roblox.
There is one exception to this... your user Id. When you use the Roblox Catalog Notifier your user Id is paired with your cloud messaging token from the extension to the Roblox+ servers to send you notifications based on whether or not you have Roblox+ Premium. See above section on website access for slightly more information on this. This is the only Roblox account information that is sent to a non-Roblox server.

## Web Request Interception

Some requests to roblox.com are intercepted!
Yup. This extension uses `webRequest` and `webRequestBlocking` permissions to intercept and modify some requests that go to Roblox. For example: To load the authentication token for game launch additional headers are needed that are not typically accessible via `XMLHttpRequest`. `webRequest` is needed for this to add the additional request parameters necessary to launch you into game as... you!
There are other requests being intercepted (like knowing when you visit Roblox for the first time for the extension start notification when enabled) and I could list them all out but imagine being me for a second... what if I missed one? What if I add a new feature and forget to update the privacy policy? I don't know what's legally required or not. How much do I need to specify or forget to specify before Google pulls me off the chrome web store? Instead of me trying to go into the implementation details of every feature this extension has I invite you to the extensions source.

## Permissions

The extension [manifest](https://github.com/Roblox-Plus/Chrome/blob/master/src/manifest.json) has the following permissions listed

- `gcm` (Google cloud messaging)
  - Used to send notifications for the catalog notifier.
- `contextMenus`
  - Used to add context menu items when right clicking on Roblox users. Mainly, to be able to open a trade window without going to their profile.
- `webRequest` (and `webRequestBlocking`)
  - See [Web Request Interception](#web-request-interception)
- `tts` (text to speach)
  - Used in some notifications that do not have specific sounds associated with them.
- `notifications`
  - Used to be able to display all notifications.
- `*://*.roblox.com/*`
- `*://*.rbxcdn.com/*`
- `*://*.roblox.plus/*`
  - See [Website Access](#website-access)
