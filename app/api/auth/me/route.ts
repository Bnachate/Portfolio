import { handler, ok, requireAdmin } from '@/server/http';

export const GET = handler(async () => ok(await requireAdmin()));
