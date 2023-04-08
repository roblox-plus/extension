function QueuedPromise(id, func, configuration) {
	if (typeof(configuration) !== "object") {
		configuration = {};
	}

	if (typeof(configuration.NumberOfThreads) !== "number") {
		configuration.NumberOfThreads = 1;
	}

	return new Promise((originalResolve, originalReject) => {
		let queue = QueuedPromise.Queues[id];
		if (!queue) {
			queue = QueuedPromise.Queues[id] = {
				Queue: [],
				Running: 0,
				Configuration: configuration
			};
		}

		let reject = (err) => {
			try {
				originalReject(err);
			} catch(e) {
				console.error(e);
			}

			queue.Running--;
			QueuedPromise.Process(id);
		};

		let resolve = (data) => {
			try { 
				originalResolve(data);
				queue.Running--;
			} catch(e) {
				reject(e);
			}

			QueuedPromise.Process(id);
		};

		queue.Queue.push({
			resolve: resolve,
			reject: reject,
			run: func
		});

		QueuedPromise.Process(id);
	});
}

QueuedPromise.Process = function(id) {
	let queue = QueuedPromise.Queues[id];
	if (!queue) {
		return;
	}

	if (queue.Queue.length <= 0 || queue.Running >= queue.Configuration.NumberOfThreads) {
		return;
	}

	let queueItem = queue.Queue.shift();
	if (queueItem) {
		queue.Running++;

		try {
			queueItem.run(queueItem.resolve, queueItem.reject);
		} catch(e) {
			queueItem.reject(e);
		}
	}
}

QueuedPromise.Queues = {};
