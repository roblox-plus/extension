import { Fragment, useEffect, useState } from 'react';
import { PresenceType, User } from 'roblox';
import { followUser } from '../../../../../services/game-launch';
import { getTranslationResource } from '../../../../../services/localization';
import { getUserPresence } from '../../../../../services/presence';
import UserPresence from '../../../../../types/userPresence';

type UserActionsInput = {
  user: User;
};

export default function UserActions({ user }: UserActionsInput) {
  const [userPresence, setUserPresence] = useState<UserPresence>({
    type: PresenceType.Offline,
  });

  const [joinGameText, setJoinGameText] = useState<string>('Join');

  useEffect(() => {
    setUserPresence({ type: PresenceType.Offline });

    let cancelled = false;

    getUserPresence(user.id)
      .then((p) => {
        if (cancelled) {
          return;
        }

        setUserPresence(p);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.warn(
          'Failed to load user presence for card actions',
          user.id,
          err
        );
      });

    return () => {
      cancelled = true;
    };
  }, [user.id]);

  useEffect(() => {
    getTranslationResource('Feature.PeopleList', 'Action.Join')
      .then(setJoinGameText)
      .catch((err) => {
        console.warn(
          'Failed to fetch translated resource for join game button',
          err
        );
      });
  }, []);

  const joinGame = () => {
    followUser(user.id).catch((err) => {
      console.error('Failed to follow user into game', err);
    });
  };

  if (!userPresence.location || userPresence.type !== PresenceType.Experience) {
    return <Fragment />;
  }

  return (
    <div className="avatar-card-btns">
      <button className="btn-growth-md" onClick={joinGame}>
        {joinGameText}
      </button>
    </div>
  );
}
