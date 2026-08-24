import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { RequireAuth } from "@/components/auth/require-auth";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardApp />
    </RequireAuth>
  );
}
