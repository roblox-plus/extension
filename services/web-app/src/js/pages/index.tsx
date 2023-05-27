import { Fragment } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Login from './login';

function Pages() {
  const location = useLocation();

  if (location.pathname === '/login') {
    // We're logging in, this page has its own loading logic.
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return <Fragment />;
}

export default Pages;
