"use client";

import { Activity, CarFront, LayoutGrid, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: LayoutGrid },
  { label: "Activity", icon: Activity },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const isDriver = pathname.startsWith("/driver");
  const isActivity = pathname.endsWith("/activity");
  const dashboardUrl = isDriver ? "/driver" : "/";
  const activityUrl = isDriver ? "/driver/activity" : "/activity";

  return (
    <header className="border-b border-line bg-white">
      <div className="page-width flex flex-wrap items-center gap-y-2 py-3 sm:h-[76px] sm:flex-nowrap sm:py-0">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="Rove home"
        >
          <Image src="/icon.svg" width={38} height={38} alt="" unoptimized />
          <span className="brand-wordmark">rove</span>
        </Link>
        <span
          aria-hidden="true"
          className="mx-6 hidden h-6 w-px bg-line lg:block"
        />
        <nav
          aria-label="Workspace"
          className="order-3 flex w-full gap-1 sm:order-none sm:ml-5 sm:w-auto lg:ml-0"
        >
          {navItems.map(({ label, icon: Icon }) => {
            const active = label === "Activity" ? isActivity : !isActivity;
            return (
              <Link
                key={label}
                href={label === "Activity" ? activityUrl : dashboardUrl}
                aria-current={active ? "page" : undefined}
                className={`nav-link ${active ? "nav-link-active" : ""}`}
              >
                <Icon size={16} strokeWidth={1.9} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-5">
          <span className="hidden items-center gap-2 text-xs font-medium text-muted lg:flex">
            <span className="size-2 rounded-full bg-[#54846c]" />
            Demo mode
          </span>
          <nav
            aria-label="Workspace role"
            className="flex gap-0.5 rounded-full border border-line bg-canvas p-1"
          >
            {[
              { label: "Rider", href: "/", icon: UserRound, active: !isDriver },
              {
                label: "Driver",
                href: "/driver",
                icon: CarFront,
                active: isDriver,
              },
            ].map(({ label, href, icon: Icon, active }) => (
              <Link
                key={label}
                href={href}
                aria-current={active ? "true" : undefined}
                className={`role-link ${active ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
