import { Batch, BatchItem } from '@tix-factory/batch';
import xsrfFetch from '../../utils/xsrfFetch';

class AuthenticatedUserFollowingProcessor extends Batch<number, boolean> {
  constructor() {
    super({
      levelOfParallelism: 1,
      maxSize: 100,
      minimumDelay: 1 * 1000,
      enqueueDeferDelay: 10,
    });
  }

  async process(items: BatchItem<number, boolean>[]) {
    const response = await xsrfFetch(
      new URL('https://friends.roblox.com/v1/user/following-exists'),
      {
        method: 'POST',
        body: JSON.stringify({
          targetUserIds: items.map((i) => i.value),
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to load authenticated user following statuses');
    }

    const result = await response.json();
    items.forEach((item) => {
      const following = result.followings.find(
        (f: any) => f.userId === item.value
      );

      item.resolve(following?.isFollowing === true);
    });
  }

  getKey(userId: number): string {
    return `${userId}`;
  }
}

export default AuthenticatedUserFollowingProcessor;
