"use client";

import { useRouter } from "next/navigation";

export function ClickableRow({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <tr
      className={`${className} cursor-pointer`}
      role="link"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => { if (e.key === "Enter") router.push(href); }}
    >
      {children}
    </tr>
  );
}
