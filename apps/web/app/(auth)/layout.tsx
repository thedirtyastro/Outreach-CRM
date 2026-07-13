import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
