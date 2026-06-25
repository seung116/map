import { useEffect, useMemo, useState } from 'react';
import { subscribeAuthState } from '../services/authStore';

export function useAuthState() {
  const [state, setState] = useState({ loading: true, user: null, profile: null });

  useEffect(() => {
    const unsubscribe = subscribeAuthState(({ user, profile }) => {
      setState({ loading: false, user, profile });
    });

    return unsubscribe;
  }, []);

  return useMemo(() => {
    const isAdmin = state.profile?.role === 'admin';
    const isApproved = Boolean(state.profile?.approved) || isAdmin;

    return {
      ...state,
      isAdmin,
      isApproved,
    };
  }, [state]);
}
