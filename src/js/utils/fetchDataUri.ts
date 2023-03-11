// Converts a URL to a data URI of its loaded contents.
// TODO: Cache?
export default async (url: URL): Promise<string> => {
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
};
