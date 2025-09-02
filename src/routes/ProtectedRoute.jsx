import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from 'js-cookie';
import { setIsUserLoggedIn, setLoggedInUserDataToNull } from "../common/commonSlice";

const ProtectedRoute = ({ children, publicOnly = false }) => {
  const dispatch=useDispatch();
  const { isUserLoggedIn } = useSelector(state => state.common);
  const token = Cookies.get("access_token");
  const isLoggedIn = isUserLoggedIn && !!token;

  // public route::: redirect to / means home page
  if (publicOnly && isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // proctected route:::: redirect  /login
  if (!publicOnly && !isLoggedIn) {
    dispatch(setIsUserLoggedIn(false));
    dispatch(setLoggedInUserDataToNull());
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');

    return <Navigate to="/login" replace />;
  }

  // all checks passed then render the children
  return children;
};

export default ProtectedRoute;
