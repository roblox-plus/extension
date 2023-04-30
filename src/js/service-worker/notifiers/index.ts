import FriendPresenceNotifier from './friend-presence';

// Registry of all the notifiers
const notifiers: { [name: string]: (state: any) => Promise<any> } = {};
notifiers['notifiers/friend-presence'] = FriendPresenceNotifier;

// Execute a notifier by name.
const executeNotifier = async (name: string) => {
  const notifier = notifiers[name];
  if (!notifier) {
    return;
  }

  try {
    // Fetch the state from the last time the notifier ran.
    const notifierStates = await chrome.storage.session.get(name);

    // Run the notifier.
    const newState = await notifier(notifierStates[name]);

    // Save the state for the next time the notifier runs.
    if (newState) {
      await chrome.storage.session.set({ [name]: newState });
    } else {
      await chrome.storage.session.remove(name);
    }
  } catch (err) {
    console.error(name, 'failed to run', err);
  }
};

// Listener for the chrome.alarms API, to process the notification checks
chrome.alarms.onAlarm.addListener(async ({ name }) => {
  await executeNotifier(name);
});

for (let name in notifiers) {
  chrome.alarms.create(name, {
    periodInMinutes: 1,
  });
}

// Attach it to the global context, so we can access it for testing.
declare global {
  var notifiers: any;

  var executeNotifier: any;
}

globalThis.notifiers = notifiers;
globalThis.executeNotifier = executeNotifier;

export { executeNotifier };
export default notifiers;
