Extension.Storage = class extends Extension.BackgroundService {
  constructor() {
    super('Extension.Storage');

    this.register([this.get, this.set]);
  }

  get(key) {
    return new Promise((resolve, reject) => {
      let value = null;
      try {
        settingsService
          .getSettingValue(key)
          .then((value) => {
            if (value === undefined) {
              resolve(null);
            } else {
              resolve(value);
            }
          })
          .catch((err) => {
            reject(err);
          });
      } catch (e) {
        reject(e);
        return;
      }

      resolve(value);
    });
  }

  set(key, value) {
    return settingsService.setSettingValue(key, value);
  }

  blindSet(key, value) {
    this.set(key, value)
      .then(() => {
        // set successful yay
      })
      .catch((err) => {
        console.warn(
          `Failed to set value (Extension.Storage) for key (${key}):`,
          err
        );
      });
  }
};

Extension.Storage.Singleton = new Extension.Storage();
