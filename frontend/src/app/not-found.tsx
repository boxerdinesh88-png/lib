import Link from "next/link";
import { BookOpen } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-20 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-800 text-white shadow-glow">
        <BookOpen className="h-9 w-9" />
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-6xl font-bold text-foreground">404</h1>
        <p className="text-muted-foreground">
          This page seems to have been checked out and never returned.
        </p>
      </div>
      <Link href="/" className={buttonVariants({ variant: "primary", size: "lg" })}>
        Back to the library
      </Link>
    </main>
  );
}
