import type { Metadata } from "next";
import { getCurrentUser } from "@/server/auth";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

// The panel is public in read-only mode, but has nothing to do in search results
export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };

/**
 * Visitors get a read-only view; only a valid admin session unlocks editing.
 * The session is checked here on the server (deleted users included), never trusted from the client.
 */
export default async function AdminPage() {
  const user = await getCurrentUser();
  return <AdminDashboard readOnly={!user} />;
}
