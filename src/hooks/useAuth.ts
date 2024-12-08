import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { loginUser, logout } from '../store/slices/authSlice';
import type { LoginCredentials } from '../store/slices/authSlice';
import type { AppDispatch } from '../store/store';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading, error } = useSelector((state: RootState) => state.auth);

  const isAuthenticated = !!token;

  const login = async (credentials: LoginCredentials) => {
    return dispatch(loginUser(credentials));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: logoutUser,
  };
};

export default useAuth; 