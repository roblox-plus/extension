// The type for representing a listener that can be attached by any service.
type MessageListener = (message: any) => Promise<any>;

export default MessageListener;
