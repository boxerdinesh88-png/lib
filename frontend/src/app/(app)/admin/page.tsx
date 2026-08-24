import { AdminApp } from "@/components/admin/admin-app";
import { RequireAuth } from "@/components/auth/require-auth";

export const metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <RequireAuth role="admin">
      <AdminApp />
    </RequireAuth>
  );
}
