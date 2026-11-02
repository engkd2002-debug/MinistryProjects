import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MapViewport } from '../../../domain/geography/models';
import type { CountThresholds } from '../../../domain/geography/aggregation';
import { nationalViewport } from '../../../domain/geography/viewport';
import type { DemoRole } from '../../../domain/research/models';
import geometry from '../../../data/demo/geometry.json';
interface Layers {
  heat: boolean;
  gaps: boolean;
  collaboration: boolean;
}
interface Session {
  viewport: MapViewport;
  animate: boolean;
  move: (v: MapViewport, animate?: boolean) => void;
  layers: Layers;
  toggleLayer: (key: keyof Layers) => void;
  thresholds: CountThresholds | null;
  setThresholds: (v: CountThresholds | null) => void;
  role: DemoRole;
  setRole: (v: DemoRole) => void;
  roleStorageError: boolean;
}
const Context = createContext<Session | null>(null);
export function ExplorerSessionProvider({ children }: { children: ReactNode }) {
  const [viewport, setViewport] = useState(() => nationalViewport(geometry));
  const [animate, setAnimate] = useState(false);
  const [layers, setLayers] = useState<Layers>({ heat: false, gaps: false, collaboration: false });
  const [thresholds, setThresholds] = useState<CountThresholds | null>(null);
  const [role, setRoleValue] = useState<DemoRole>(() => {
    try {
      const r = localStorage.getItem('snrp.demo-role.v1');
      return ['viewer', 'editor', 'reviewer', 'admin'].includes(r || '')
        ? (r as DemoRole)
        : 'viewer';
    } catch {
      return 'viewer';
    }
  });
  const [roleStorageError, setRoleStorageError] = useState(false);
  const setRole = (value: DemoRole) => {
    setRoleValue(value);
    try {
      localStorage.setItem('snrp.demo-role.v1', value);
      setRoleStorageError(false);
    } catch {
      setRoleStorageError(true);
    }
  };
  return (
    <Context.Provider
      value={{
        viewport,
        animate,
        move: (v, a = true) => {
          setViewport(v);
          setAnimate(a);
        },
        layers,
        toggleLayer: (key) => setLayers((l) => ({ ...l, [key]: !l[key] })),
        thresholds,
        setThresholds,
        role,
        setRole,
        roleStorageError,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useExplorerSession() {
  const value = useContext(Context);
  if (!value) throw new Error('ExplorerSessionProvider required');
  return value;
}
