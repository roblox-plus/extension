import { Navigate, useLocation } from 'react-router-dom';
import { loginPath } from '../../constants';

export default function LoginRedirect() {
  const location = useLocation();
  return (
    <Navigate
      to={`${loginPath}?returnUrl=${encodeURIComponent(location.pathname)}`}
    />
  );
}
