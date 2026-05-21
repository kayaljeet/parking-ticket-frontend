import React, { createContext, useContext, useState } from 'react';

/**
 * AppContext provides:
 *  - role: 'admin' | 'reportee'
 *  - setRole: toggle between roles
 *  - demoMode: boolean — when true, anyone can switch roles freely;
 *                         when false, switching requires authentication.
 *
 * To disable demo mode and require auth, set DEMO_MODE to false below.
 */
const DEMO_MODE = true; // <-- flip to false to enforce auth-gated role switching

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [role, setRoleState] = useState(
    () => localStorage.getItem('app_role') || 'admin'
  );

  const setRole = (newRole) => {
    if (!DEMO_MODE) {
      // TODO: replace with real auth check when demoMode is false
      const authed = window.confirm(
        `Switching to ${newRole} mode requires authentication. Proceed?`
      );
      if (!authed) return;
    }
    localStorage.setItem('app_role', newRole);
    setRoleState(newRole);
  };

  return (
    <AppContext.Provider value={{ role, setRole, demoMode: DEMO_MODE }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
