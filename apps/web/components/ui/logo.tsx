import { cn } from "@/lib/utils";
import Image from "next/image";
import AppLogo from "@/public/Logo.svg";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const dimensions = {
    sm: { width: 28, height: 28, className: "w-7 h-7" },
    md: { width: 32, height: 32, className: "w-8 h-8" },
    lg: { width: 40, height: 40, className: "w-10 h-10" },
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const currentSize = dimensions[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src={AppLogo}
        width={currentSize.width}
        height={currentSize.height}
        className={currentSize.className}
        alt="Outreach CRM Logo"
      />
      {showText && (
        <span className={cn("font-bold tracking-tight", textSizes[size])}>
          OutReach CRM
        </span>
      )}
    </div>
  );
}
