import { MembershipApp } from "@/components/membership/membership-app";
import { RequireAuth } from "@/components/auth/require-auth";

export const metadata = {
  title: "Membership",
};

export default function MembershipPage() {
  return (
    <RequireAuth>
      <MembershipApp />
    </RequireAuth>
  );
}
