import { Fragment } from 'react';
import User from '../../../../../types/user';

type UserInfoInput = {
  user: User;
};

export default function UserInfo({ user }: UserInfoInput) {
  return (
    <Fragment>
      user: {user.name} ({user.id})
    </Fragment>
  );
}
