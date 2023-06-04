// Message listener options about how to handle messages.
type MessageListenerOptions = {
  // How many messages can be processed in parallel.
  // When set to -1, all messages can processed in parallel.
  levelOfParallelism: -1 | 1;

  // Whether or not the message listener allows calls from external connections.
  // e.g. A browser tab.
  allowExternalConnections?: boolean;
};

export default MessageListenerOptions;
