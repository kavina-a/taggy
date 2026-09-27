"use client";

import React, { useState } from "react";
import { User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function UserAvatar({
  src,
  name,
  className,
  size = "md",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const displayName = name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClasses = {
    sm: "size-8 text-xs",
    md: "size-10 text-xs",
    lg: "size-11 text-xs",
    xl: "size-28 sm:size-32 text-2xl sm:text-3xl",
  }[size];

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center select-none shadow-xs",
        size === "xl" && "border-4 border-white shadow-md bg-gradient-to-br from-neutral-700 to-neutral-900 text-white",
        sizeClasses,
        className,
      )}
    >
      <span
        className={cn(
          "font-bold select-none",
          size === "xl" ? "text-white font-extrabold" : "text-neutral-800",
        )}
      >
        {initials || <UserIcon className={size === "xl" ? "size-12 text-white/70" : "size-4 text-neutral-500"} />}
      </span>
      {src && !hasError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={displayName}
          className="absolute inset-0 size-full object-cover rounded-full"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}

export default UserAvatar;
