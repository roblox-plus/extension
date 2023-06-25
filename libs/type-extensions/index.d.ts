////////////////////
// InstanceID
// THIS IS NEW, BASED ON https://developer.chrome.com/docs/extensions/reference/instanceID
////////////////////
/**
 * The chrome.instanceID namespace exists to access the instance ID service, in chrome.
 * Availability: Since Chrome 44.
 */
declare namespace chrome.instanceID {
  export interface TokenRefreshEvent
    extends chrome.events.Event<(token: string) => void> {}

  /**
   * Return a token that allows the authorized entity to access the service defined by scope.
   * @param getTokenParams Parameters for getToken.
   * @param callback The callback parameter looks like:
   * function(token: string) {...};
   * Parameter token: A token assigned by the requested service.
   */
  export function getToken(
    getTokenParams: {
      authorizedEntity: string;
      scope: string;
    },
    callback: (token: string) => void
  ): void;

  /**
   * Fired when all the granted tokens need to be refreshed.
   */
  export var onTokenRefresh: TokenRefreshEvent;
}
