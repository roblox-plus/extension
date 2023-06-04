// Possible states for a thumbnail to be in.
enum ThumbnailState {
  // The thumbnail had an unexpected error trying to load.
  Error = 'Error',

  // The thumbnailed loaded successfully.
  Completed = 'Completed',

  // The thumbnail is currently in review.
  InReview = 'InReview',

  // The thumbnail is pending, and should be retried.
  Pending = 'Pending',

  // The thumbnail is blocked.
  Blocked = 'Blocked',

  // The thumbnail is temporarily unavailable.
  TemporarilyUnavailable = 'TemporarilyUnavailable',
}

export default ThumbnailState;
