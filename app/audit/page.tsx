import { Metadata } from 'next';
import ObsidianEagleDashboard from '@/components/audit/obsidian-eagle-dashboard';

export const metadata: Metadata = {
  title: 'Eagle Obsidian | Blade Audit System',
  description: 'Industrial Performance Intelligence - Análisis de desgaste y costos ocultos de cuchillas',
};

export default function AuditPage() {
  return <ObsidianEagleDashboard />;
}
