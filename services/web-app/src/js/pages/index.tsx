import { Fragment } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Login from './login';
import { loginPath } from '../constants';

export default function Pages() {
  const location = useLocation();

  if (location.pathname === loginPath) {
    // We're logging in, this page has its own loading logic.
    return (
      <Routes>
        <Route path={loginPath} element={<Login />} />
      </Routes>
    );
  }

  return <Fragment />;
}
