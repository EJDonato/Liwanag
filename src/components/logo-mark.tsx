import Image from "next/image";
import { cn } from "@/lib/utils";

// The Liwanag emblem (sun over hills), cropped from "Liwanag Wellness Logo.png".
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={80}
      height={80}
      className={cn("size-10", className)}
    />
  );
}
