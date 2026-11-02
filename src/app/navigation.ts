import {
  Map,
  BookOpen,
  ChartNoAxesCombined,
  ShieldCheck,
  Files,
  ScanSearch,
  ListChecks,
  Users,
  Languages,
  Library,
  PackageOpen,
  Upload,
  Download,
  type LucideIcon,
} from 'lucide-react';
export interface Destination {
  path: string;
  label: string;
  icon: LucideIcon;
}
export const workspaces: Destination[] = [
  { path: '/explorer', label: 'explorer', icon: Map },
  { path: '/research', label: 'research', icon: BookOpen },
  { path: '/insights', label: 'insights', icon: ChartNoAxesCombined },
];
export const operations: Destination[] = [
  { path: '/governance/quality', label: 'quality', icon: ShieldCheck },
  { path: '/governance/duplicates', label: 'duplicates', icon: ScanSearch },
  { path: '/governance/queue', label: 'queue', icon: ListChecks },
  { path: '/governance/roles', label: 'roles', icon: Users },
  { path: '/governance/synonyms', label: 'synonyms', icon: Languages },
  { path: '/governance/dictionary', label: 'dictionary', icon: Library },
  { path: '/governance/handoff', label: 'handoff', icon: PackageOpen },
  { path: '/research/import', label: 'import', icon: Upload },
  { path: '/research/export', label: 'export', icon: Download },
];
export const supportIcon = Files;
