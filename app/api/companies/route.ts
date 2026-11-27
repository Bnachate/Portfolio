import { handler, ok } from '@/server/http';
import { listCompaniesWithUsage } from '@/server/services/companies';

// Public: companies and their context are shown on the "Expérience" pages.
// No POST: a company is created by typing its name on a position (see createExperience).
export const GET = handler(async () => ok(await listCompaniesWithUsage()));
