import { createContext, useContext, type ReactNode } from 'react';

interface ScopeIntent {
  openScope: () => void;
}
const ScopeContext = createContext<ScopeIntent | null>(null);

/** The shell owns the surface state; descendants express only an open intent.
 * Keeping that intent in shared context avoids feature → application imports
 * and global DOM events, while leaving focus/overlay behavior with the shell.
 */
export function ScopeProvider({ onOpen, children }: { onOpen: () => void; children: ReactNode }) {
  return <ScopeContext.Provider value={{ openScope: onOpen }}>{children}</ScopeContext.Provider>;
}

export function useScope(): ScopeIntent {
  const context = useContext(ScopeContext);
  if (!context) throw new Error('useScope must be used within ScopeProvider');
  return context;
}
