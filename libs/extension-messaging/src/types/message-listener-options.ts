// Message listener options about how to handle messages.
type MessageListenerOptions = {
  // How many messages can be processed in parallel.
  // When set to -1, all messages can processed in parallel.
  levelOfParallelism: -1 | 1;
};

export default MessageListenerOptions;
