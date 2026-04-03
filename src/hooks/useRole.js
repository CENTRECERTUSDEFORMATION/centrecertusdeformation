import { useAuth } from '../context/AuthContext';

export const useRole = () => {
  const { user, loading } = useAuth();

  const role = user?.role || null;
  const isAdmin = role === 'admin';
  const isUser = role === 'utilisateur';
  const isNotApproved = !user?.isApproved;

  return {
    role,
    isAdmin,
    isUser,
    isNotApproved,
    isLoading: loading,
  };
};
