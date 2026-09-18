import { providerRegistry } from '../src/search/providers/registry';

export default function handler(req: any, res: any) {
  const statuses = providerRegistry.getStatuses();
  res.status(200).json({
    providers: statuses,
    activeCount: statuses.filter((s: any) => s.active).length,
    timestamp: new Date().toISOString()
  });
}
