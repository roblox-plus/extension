import ExpirableDictionary from './expireableDictionary';

const cache = new ExpirableDictionary<string>('fetchDataUri', 5 * 60 * 1000);

// Converts a URL to a data URI of its loaded contents.
export default (url: URL): Promise<string> => {
  return cache.getOrAdd(url.href, () => {
    return new Promise((resolve, reject) => {
      fetch(url.href)
        .then((result) => {
          const reader = new FileReader();

          reader.onerror = (err) => {
            reject(err);
          };

          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(
                new Error(
                  `fetchDataUri: Unexpected result type (${typeof reader.result})`
                )
              );
            }
          };

          result
            .blob()
            .then((blob) => {
              reader.readAsDataURL(blob);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  });
};
