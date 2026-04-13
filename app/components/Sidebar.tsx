"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Overview", href: "/", icon: "/icon-nav-overview.svg" },
  {
    label: "Transactions",
    href: "/transactions",
    icon: "/icon-nav-transactions.svg",
  },
  { label: "Budgets", href: "/budgets", icon: "/icon-nav-budgets.svg" },
  { label: "Pots", href: "/pots", icon: "/icon-nav-pots.svg" },
  {
    label: "Recurring Bills",
    href: "/recurring-bills",
    icon: "/icon-nav-recurring-bills.svg",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [minimized, setMinimized] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col bg-grey-900 rounded-r-2xl h-screen sticky top-0 transition-all duration-300 ${
          minimized ? "w-[88px]" : "w-[300px]"
        }`}
      >
        {/* Logo */}
        <div className={`pt-500 pb-300 ${minimized ? "px-250" : "px-400"}`}>
          {minimized ? (
            <Image
              src="/logo-small.svg"
              alt="finance"
              width={14}
              height={22}
            />
          ) : (
            <Image
              src="/logo-large.svg"
              alt="finance"
              width={122}
              height={22}
            />
          )}
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-50 flex-1 pr-300">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group flex items-center gap-200 py-200 rounded-r-xl transition-colors ${
                  minimized ? "px-250 justify-center" : "pl-400 pr-200"
                } ${
                  isActive
                    ? "bg-beige-100 text-grey-900"
                    : "text-grey-300 hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 bottom-0 left-0 w-[4px] bg-green" />
                )}
                <Image
                  src={item.icon}
                  alt=""
                  width={24}
                  height={24}
                  className={`transition-all ${
                    isActive
                      ? "[filter:brightness(0)_saturate(100%)_invert(40%)_sepia(15%)_saturate(1500%)_hue-rotate(131deg)_brightness(95%)]"
                      : "opacity-70 group-hover:opacity-100"
                  }`}
                />
                {!minimized && (
                  <span className="text-[length:var(--text-preset-3)] font-bold leading-[var(--text-preset-3--line-height)]">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Minimize toggle */}
        <button
          onClick={() => setMinimized(!minimized)}
          className={`flex items-center gap-200 text-grey-300 hover:text-white transition-colors py-300 ${
            minimized ? "px-250 justify-center" : "px-400"
          }`}
        >
          <Image
            src="/icon-minimize-menu.svg"
            alt=""
            width={24}
            height={24}
            className={`opacity-70 transition-transform ${minimized ? "rotate-180" : ""}`}
          />
          {!minimized && (
            <span className="text-[length:var(--text-preset-3)] font-bold leading-[var(--text-preset-3--line-height)]">
              Minimize Menu
            </span>
          )}
        </button>
      </aside>

      {/* ── Tablet bottom bar (icons + labels) ── */}
      <nav className="hidden md:flex lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-grey-900 px-400 pt-150 justify-around rounded-t-xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-50 pt-200 pb-150 px-300 rounded-t-xl overflow-hidden transition-colors ${
                isActive
                  ? "bg-beige-100 text-grey-900"
                  : "text-grey-300 hover:text-white"
              }`}
            >
              <Image
                src={item.icon}
                alt=""
                width={24}
                height={24}
                className={
                  isActive
                    ? "[filter:brightness(0)_saturate(100%)_invert(40%)_sepia(15%)_saturate(1500%)_hue-rotate(131deg)_brightness(95%)]"
                    : "opacity-60"
                }
              />
              <span className="text-[length:var(--text-preset-5)] font-bold leading-[var(--text-preset-5--line-height)]">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[4px] bg-green" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Mobile bottom bar (icons only) ── */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-grey-900 px-200 pt-150 justify-around rounded-t-xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center justify-center pt-150 pb-200 px-300 rounded-t-xl overflow-hidden transition-colors ${
                isActive
                  ? "bg-beige-100"
                  : "text-grey-300 hover:text-white"
              }`}
            >
              <Image
                src={item.icon}
                alt=""
                width={24}
                height={24}
                className={
                  isActive
                    ? "[filter:brightness(0)_saturate(100%)_invert(40%)_sepia(15%)_saturate(1500%)_hue-rotate(131deg)_brightness(95%)]"
                    : "opacity-60"
                }
              />
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[4px] bg-green" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
