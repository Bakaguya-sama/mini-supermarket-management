import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Custom hook to use authentication context
 * Must be used inside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};

export default useAuth;
