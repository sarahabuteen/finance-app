"use client";

import Image from "next/image";
import { useState, useMemo, useRef, useEffect } from "react";
import data from "@/data.json";
import { motion, AnimatePresence } from "framer-motion";
import {
  pageVariants,
  staggerContainer,
  staggerItem,
  dropdownVariants,
  cardHover,
} from "@/app/lib/motion";

const allTransactions = data.transactions;

// Get unique recurring bills (one per name, most recent)
const recurringBills = Object.values(
  allTransactions
    .filter((t) => t.recurring && t.amount < 0)
    .reduce(
      (acc, t) => {
        if (!acc[t.name] || new Date(t.date) > new Date(acc[t.name].date)) {
          acc[t.name] = t;
        }
        return acc;
      },
      {} as Record<string, (typeof allTransactions)[0]>
    )
);

const totalBills = recurringBills.reduce((s, t) => s + Math.abs(t.amount), 0);

// Determine paid/upcoming/due soon based on day of month
const paidBills = recurringBills.filter((t) => {
  const day = new Date(t.date).getDate();
  return day <= 19;
});
const dueSoonBills = recurringBills.filter((t) => {
  const day = new Date(t.date).getDate();
  return day > 19 && day <= 26;
});
const upcomingBills = recurringBills.filter((t) => {
  const day = new Date(t.date).getDate();
  return day > 19;
});

const totalPaid = paidBills.reduce((s, t) => s + Math.abs(t.amount), 0);
const totalUpcoming = upcomingBills.reduce((s, t) => s + Math.abs(t.amount), 0);
const totalDueSoon = dueSoonBills.reduce((s, t) => s + Math.abs(t.amount), 0);

const sortOptions = ["Latest", "Oldest", "A to Z", "Z to A", "Highest", "Lowest"] as const;
type SortOption = (typeof sortOptions)[number];

function avatarSrc(path: string) {
  return path.replace("./assets/images/", "/");
}

function formatCurrency(amount: number) {
  return `$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getBillStatus(t: (typeof allTransactions)[0]) {
  const day = new Date(t.date).getDate();
  if (day <= 19) return "paid";
  if (day <= 26) return "due-soon";
  return "upcoming";
}

function getOrdinalDay(t: (typeof allTransactions)[0]) {
  const day = new Date(t.date).getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? "st" : day === 2 || day === 22 ? "nd" : day === 3 || day === 23 ? "rd" : "th";
  return `Monthly - ${day}${suffix}`;
}

export default function RecurringBillsPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("Latest");
  const [sortOpen, setSortOpen] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortOpen && sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [sortOpen]);

  const filtered = useMemo(() => {
    let list = [...recurringBills];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }

    switch (sort) {
      case "Latest":
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "Oldest":
        list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case "A to Z":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Z to A":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Highest":
        list.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        break;
      case "Lowest":
        list.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
        break;
    }

    return list;
  }, [search, sort]);

  return (
    <motion.div
      className="space-y-400"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] text-grey-900">
        Recurring Bills
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-300 items-start">
        {/* Left sidebar */}
        <div className="flex flex-col gap-300 md:flex-row lg:flex-col">
          {/* Total bills card */}
          <motion.div {...cardHover} className="bg-grey-900 text-white rounded-xl p-300 flex items-center gap-250 md:flex-1 lg:flex-none">
            <Image src="/icon-recurring-bills.svg" alt="" width={32} height={32} />
            <div>
              <p className="text-[length:var(--text-preset-4)] leading-[var(--text-preset-4--line-height)]">
                Total Bills
              </p>
              <p className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] mt-100">
                {formatCurrency(totalBills)}
              </p>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div {...cardHover} className="bg-white rounded-xl p-300 md:flex-1 lg:flex-none">
            <h2 className="text-[length:var(--text-preset-3)] font-bold text-grey-900 leading-[var(--text-preset-3--line-height)] mb-250">
              Summary
            </h2>
            <motion.div
              className="divide-y divide-grey-100"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={staggerItem} className="flex items-center justify-between py-200 first:pt-0">
                <span className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)]">
                  Paid Bills
                </span>
                <span className="text-[length:var(--text-preset-4)] font-bold text-grey-900 leading-[var(--text-preset-4--line-height)]">
                  {paidBills.length} ({formatCurrency(totalPaid)})
                </span>
              </motion.div>
              <motion.div variants={staggerItem} className="flex items-center justify-between py-200">
                <span className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)]">
                  Total Upcoming
                </span>
                <span className="text-[length:var(--text-preset-4)] font-bold text-grey-900 leading-[var(--text-preset-4--line-height)]">
                  {upcomingBills.length} ({formatCurrency(totalUpcoming)})
                </span>
              </motion.div>
              <motion.div variants={staggerItem} className="flex items-center justify-between py-200 last:pb-0">
                <span className="text-[length:var(--text-preset-4)] text-red leading-[var(--text-preset-4--line-height)]">
                  Due Soon
                </span>
                <span className="text-[length:var(--text-preset-4)] font-bold text-red leading-[var(--text-preset-4--line-height)]">
                  {dueSoonBills.length} ({formatCurrency(totalDueSoon)})
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bills table */}
        <div className="bg-white rounded-xl p-400">
          {/* Search + Sort */}
          <div className="flex items-center gap-300 mb-300">
            <div className="relative flex-1 max-w-[320px]">
              <input
                type="text"
                placeholder="Search bills"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-beige-500 rounded-lg py-150 pl-200 pr-[44px] text-[length:var(--text-preset-4)] leading-[var(--text-preset-4--line-height)] text-grey-900 placeholder:text-beige-500 outline-none hover:border-grey-500 focus:border-grey-900 focus:ring-1 focus:ring-grey-900 transition-colors"
              />
              <Image
                src="/icon-search.svg"
                alt="Search"
                width={16}
                height={16}
                className="absolute right-200 top-1/2 -translate-y-1/2"
              />
            </div>

            <div className="flex items-center gap-100 ml-auto">
              <span className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)] hidden md:inline">
                Sort by
              </span>
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  className="flex items-center gap-200 border border-beige-500 rounded-lg py-150 px-200 text-[length:var(--text-preset-4)] leading-[var(--text-preset-4--line-height)] text-grey-900 outline-none hover:border-grey-500 focus:border-grey-900 focus:ring-1 focus:ring-grey-900 transition-colors"
                >
                  <span className="hidden md:inline">{sort}</span>
                  <Image src="/icon-sort-mobile.svg" alt="Sort" width={16} height={16} className="md:hidden" />
                  <Image src="/icon-caret-down.svg" alt="" width={12} height={6} className="hidden md:block" />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      role="listbox"
                      aria-label="Sort options"
                      className="absolute top-full mt-100 right-0 bg-white border border-grey-100 rounded-lg shadow-lg z-10 min-w-[114px] origin-top"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {sortOptions.map((opt) => (
                        <button
                          key={opt}
                          role="option"
                          aria-selected={sort === opt}
                          onClick={() => {
                            setSort(opt);
                            setSortOpen(false);
                          }}
                          className={`block w-full text-left px-200 py-150 text-[length:var(--text-preset-4)] leading-[var(--text-preset-4--line-height)] hover:bg-grey-100 first:rounded-t-lg last:rounded-b-lg outline-none ${
                            sort === opt ? "font-bold text-grey-900" : "text-grey-500"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Table header (desktop) */}
          <div className="hidden md:grid grid-cols-[1fr_auto_auto] gap-200 pb-150 border-b border-grey-100">
            <span className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
              Bill Title
            </span>
            <span className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)] w-[120px]">
              Due Date
            </span>
            <span className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)] w-[100px] text-right">
              Amount
            </span>
          </div>

          {/* Bill rows */}
          <motion.div
            className="divide-y divide-grey-100"
            key={`${sort}-${search}`}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((t, i) => {
              const status = getBillStatus(t);
              return (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="flex items-center justify-between py-200 md:grid md:grid-cols-[1fr_auto_auto] md:gap-200"
                >
                  {/* Name + avatar */}
                  <div className="flex items-center gap-200">
                    <Image
                      src={avatarSrc(t.avatar)}
                      alt={t.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <span className="text-[length:var(--text-preset-4)] font-bold text-grey-900 leading-[var(--text-preset-4--line-height)]">
                        {t.name}
                      </span>
                      <p className="md:hidden text-[length:var(--text-preset-5)] text-green leading-[var(--text-preset-5--line-height)]">
                        {getOrdinalDay(t)}
                      </p>
                    </div>
                  </div>

                  {/* Desktop: due date */}
                  <span className="hidden md:flex md:items-center md:gap-100 text-[length:var(--text-preset-5)] text-green leading-[var(--text-preset-5--line-height)] w-[120px]">
                    {getOrdinalDay(t)}
                    {status === "paid" && (
                      <Image src="/icon-bill-paid.svg" alt="Paid" width={14} height={14} />
                    )}
                    {status === "due-soon" && (
                      <Image src="/icon-bill-due.svg" alt="Due soon" width={14} height={14} />
                    )}
                  </span>

                  {/* Amount */}
                  <div className="text-right md:w-[100px]">
                    <p
                      className={`text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] ${
                        status === "due-soon" ? "text-red" : "text-grey-900"
                      }`}
                    >
                      {formatCurrency(t.amount)}
                    </p>
                    <div className="md:hidden flex items-center gap-50 justify-end">
                      {status === "paid" && (
                        <Image src="/icon-bill-paid.svg" alt="Paid" width={14} height={14} />
                      )}
                      {status === "due-soon" && (
                        <Image src="/icon-bill-due.svg" alt="Due soon" width={14} height={14} />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
