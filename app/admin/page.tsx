import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

/**
 * The proxy already redirects visitors without a session cookie.
 * This check also covers a valid token whose user has been deleted.
 */
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return <AdminDashboard />;
}
