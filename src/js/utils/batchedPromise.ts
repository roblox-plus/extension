type BatchConfiguration = {
  // The max number of items to include in a batch.
  maxBatchSize?: number;

  // The max time to wait for a full batch.
  maxWaitTime?: number;

  // The minimum time to wait between sending batches.
  minWaitTime?: number;

  // How long to cache the results for for each input.
  cacheDuration?: number;

  // How long to wait before retrying a failed input.
  retryDelay?: number;
};

type InputType = string | number;

const BatchedPromise = <OutputType>(
  configuration: BatchConfiguration,
  process: (inputs: InputType[]) => Promise<OutputType[]>
): ((input: InputType) => Promise<OutputType>) => {
  type Resolve = (value: OutputType | PromiseLike<OutputType>) => void;
  type Reject = (reason: any) => void;

  type QueuedPromise = {
    // The input to be processed.
    input: InputType;

    // Promise resolves for the queued promised input.
    resolve: Resolve[];

    // Promise rejects for the queued promised input.
    reject: Reject[];
  };

  const maxBatchSize = configuration.maxBatchSize || 100;
  const minWaitTime = configuration.minWaitTime || 250;
  const maxWaitTime = Math.max(
    configuration.maxWaitTime || 1000,
    minWaitTime + 1
  );
  const cacheDuration = configuration.cacheDuration || 5000;
  const retryDelay = configuration.retryDelay || 5000;

  let running = false;
  let lastProcess = 0;

  const queue: QueuedPromise[] = [];
  const cache: { [i: InputType]: OutputType } = {};
  const cachedRejections: { [i: InputType]: any } = {};

  const tryProcessQueue = (): void => {
    if (running) {
      return;
    }

    if (queue.length < 1) {
      // Nothing to process.
      return;
    }

    const currentTime = +new Date();
    if (currentTime < lastProcess + minWaitTime) {
      // Minimum amount of time hasn't passed yet.
      return;
    }

    if (queue.length < maxBatchSize) {
      // We don't have a full batch of items in the queue.
      if (currentTime < lastProcess + maxWaitTime) {
        // And we haven't hit our maximum waiting time yet, so let's keep waiting.
        return;
      }

      // But we've waited long enough, continue...
    }

    running = true;

    try {
      const queuedItems = queue.slice(0, maxBatchSize);
      const inputs = queuedItems.map((i) => i.input);

      const rejectAll = (error: any) => {
        for (let i = 0; i < queuedItems.length; i++) {
          const queuedItem = queue.shift();
          if (!queuedItem) {
            // This should actually never happen, because we only got here because we know the size of the queue array.
            throw new Error(
              'The queue of promises did not have a queued item to resolve for. This is a critical problem.'
            );
          }

          if (retryDelay > 0) {
            cachedRejections[queuedItem.input] = error;
            setTimeout(() => {
              delete cachedRejections[queuedItem.input];
            }, retryDelay);
          }

          while (queuedItem.reject.length > 0) {
            const reject = queuedItem.reject.shift();
            if (!reject) {
              continue;
            }

            try {
              reject(error);
            } catch (e) {
              console.error(
                'Failed to process the reject for a batched promise (during reject all).',
                e
              );
            }
          }
        }
      };

      process(inputs)
        .then((outputs) => {
          if (outputs.length !== inputs.length) {
            rejectAll(
              new Error(
                `Promise outputs expected to match length of promise inputs (expected: ${inputs.length}, got ${outputs.length})`
              )
            );
            return;
          }

          for (let i = 0; i < queuedItems.length; i++) {
            const queuedItem = queue.shift();
            if (!queuedItem) {
              // This should actually never happen, because we only got here because we know the size of the queue array.
              throw new Error(
                'The queue of promises did not have a queued item to resolve for. This is a critical problem.'
              );
            }

            if (cacheDuration > 0) {
              cache[queuedItem.input] = outputs[i];
              setTimeout(() => {
                delete cache[queuedItem.input];
              }, retryDelay);
            }

            // Make sure we resolve all the promises that are waiting for this item.
            while (queuedItem.resolve.length > 0) {
              const resolve = queuedItem.resolve.shift();
              const reject = queuedItem.reject.shift();

              if (!resolve || !reject) {
                throw new Error(
                  'The queued item did not have a valid resolve or reject option. This should never happen.'
                );
              }

              try {
                resolve(outputs[i]);
              } catch (e) {
                try {
                  reject(e);
                } catch (e2) {
                  console.error(
                    'Failed to process the reject for a promise (during failed resolve).',
                    e2
                  );
                }
              }
            }
          }
        })
        .catch(rejectAll);
    } catch (e) {
      // This is technically possible if the process call fails to create the promise.
      console.error('Failed to create processing promise.', e);
    } finally {
      running = false;
    }
  };

  setInterval(tryProcessQueue, minWaitTime);

  return (input: InputType) => {
    const cachedRejection = cachedRejections[input];
    if (cachedRejection || cachedRejections.hasOwnProperty(input)) {
      return Promise.reject(cachedRejection);
    }

    const cachedOutput = cache[input];
    if (cachedOutput || cache.hasOwnProperty(input)) {
      return Promise.resolve(cachedOutput);
    }

    return new Promise<OutputType>((resolve, reject) => {
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].input === input) {
          queue[i].resolve.push(resolve);
          queue[i].reject.push(reject);
          return;
        }
      }

      queue.push({
        input: input,
        resolve: [resolve],
        reject: [reject],
      });
    });
  };
};

const translateOutput = <ItemType, OutputType>(
  inputs: InputType[],
  items: ItemType[],
  getInput: (item: ItemType) => InputType,
  translate: (item: ItemType) => OutputType
): OutputType[] => {
  const outputs: OutputType[] = [];
  const indexes: { [i: InputType]: number } = {};

  items.forEach((item, index) => {
    // Keep track of where all the items are, keyed by the input.
    const input = getInput(item);
    indexes[input] = index;
  });

  inputs.forEach((input) => {
    // Fetch the item for this input
    const item = items[indexes[input]];
    outputs.push(translate(item));
  });

  return outputs;
};

export { BatchedPromise, translateOutput };
