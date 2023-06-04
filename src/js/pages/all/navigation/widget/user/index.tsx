import { Fragment } from 'react';
import { User } from 'roblox';
import UserCard from './card';
import UserInventory from './inventory';

type UserInfoInput = {
  user: User;
};

export default function UserInfo({ user }: UserInfoInput) {
  return (
    <Fragment>
      <UserCard user={user} />
      <UserInventory user={user} />
    </Fragment>
  );
}
