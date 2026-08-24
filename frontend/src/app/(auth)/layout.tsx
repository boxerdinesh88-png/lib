import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = {
  title: "Account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
