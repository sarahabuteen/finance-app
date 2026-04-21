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
  buttonTap,
} from "@/app/lib/motion";

const allTransactions = data.transactions;
const ITEMS_PER_PAGE = 10;

const sortOptions = ["Latest", "Oldest", "A to Z", "Z to A", "Highest", "Lowest"] as const;
type SortOption = (typeof sortOptions)[number];

const categories = [
  "All Transactions",
  ...Array.from(new Set(allTransactions.map((t) => t.category))).sort(),
];

function avatarSrc(path: string) {
  return path.replace("./assets/images/", "/");
}

function formatCurrency(amount: number) {
  return `$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("Latest");
  const [category, setCategory] = useState("All Transactions");
  const [page, setPage] = useState(1);
  const [sortOpen, setSortOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortOpen && sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
      if (categoryOpen && catRef.current && !catRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [sortOpen, categoryOpen]);

  const filtered = useMemo(() => {
    let list = [...allTransactions];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }

    if (category !== "All Transactions") {
      list = list.filter((t) => t.category === category);
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
  }, [search, sort, category]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <motion.div
      className="space-y-400"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] text-grey-900">
        Transactions
      </h1>

      <div className="bg-white rounded-xl p-400">
        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-300 mb-300">
          {/* Search */}
          <div className="relative w-full md:w-[320px]">
            <input
              type="text"
              placeholder="Search transaction"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
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

          <div className="flex items-center gap-200 ml-auto">
            {/* Sort dropdown */}
            <div className="flex items-center gap-100">
              <span className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)] hidden md:inline">
                Sort by
              </span>
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => { setSortOpen(!sortOpen); setCategoryOpen(false); }}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  className="flex items-center gap-200 border border-beige-500 rounded-lg py-150 px-200 text-[length:var(--text-preset-4)] leading-[var(--text-preset-4--line-height)] text-grey-900 outline-none hover:border-grey-500 focus:border-grey-900 focus:ring-1 focus:ring-grey-900 transition-colors"
                >
                  <span className="hidden md:inline">{sort}</span>
                  <Image
                    src="/icon-sort-mobile.svg"
                    alt="Sort"
                    width={16}
                    height={16}
                    className="md:hidden"
                  />
                  <Image
                    src="/icon-caret-down.svg"
                    alt=""
                    width={12}
                    height={6}
                    className="hidden md:block"
                  />
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
                            setPage(1);
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

            {/* Category dropdown */}
            <div className="flex items-center gap-100">
              <span className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)] hidden md:inline">
                Category
              </span>
              <div className="relative" ref={catRef}>
                <button
                  onClick={() => { setCategoryOpen(!categoryOpen); setSortOpen(false); }}
                  aria-haspopup="listbox"
                  aria-expanded={categoryOpen}
                  className="flex items-center gap-200 border border-beige-500 rounded-lg py-150 px-200 text-[length:var(--text-preset-4)] leading-[var(--text-preset-4--line-height)] text-grey-900 outline-none hover:border-grey-500 focus:border-grey-900 focus:ring-1 focus:ring-grey-900 transition-colors"
                >
                  <span className="hidden md:inline">{category}</span>
                  <Image
                    src="/icon-filter-mobile.svg"
                    alt="Filter"
                    width={16}
                    height={16}
                    className="md:hidden"
                  />
                  <Image
                    src="/icon-caret-down.svg"
                    alt=""
                    width={12}
                    height={6}
                    className="hidden md:block"
                  />
                </button>
                <AnimatePresence>
                  {categoryOpen && (
                    <motion.div
                      role="listbox"
                      aria-label="Category filter"
                      className="absolute top-full mt-100 right-0 bg-white border border-grey-100 rounded-lg shadow-lg z-10 min-w-[177px] max-h-[300px] overflow-y-auto origin-top"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          role="option"
                          aria-selected={category === cat}
                          onClick={() => {
                            setCategory(cat);
                            setCategoryOpen(false);
                            setPage(1);
                          }}
                          className={`block w-full text-left px-200 py-150 text-[length:var(--text-preset-4)] leading-[var(--text-preset-4--line-height)] hover:bg-grey-100 first:rounded-t-lg last:rounded-b-lg outline-none ${
                            category === cat ? "font-bold text-grey-900" : "text-grey-500"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Table header (desktop) */}
        <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-200 pb-150 border-b border-grey-100">
          <span className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
            Recipient / Sender
          </span>
          <span className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)] w-[120px]">
            Category
          </span>
          <span className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)] w-[120px]">
            Transaction Date
          </span>
          <span className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)] w-[100px] text-right">
            Amount
          </span>
        </div>

        {/* Transaction rows */}
        <motion.div
          className="divide-y divide-grey-100"
          key={`${page}-${sort}-${category}`}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {paginated.map((t, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="flex items-center justify-between py-200 md:grid md:grid-cols-[1fr_auto_auto_auto] md:gap-200"
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
                  <p className="md:hidden text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
                    {t.category}
                  </p>
                </div>
              </div>

              {/* Desktop: category */}
              <span className="hidden md:block text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)] w-[120px]">
                {t.category}
              </span>

              {/* Desktop: date */}
              <span className="hidden md:block text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)] w-[120px]">
                {formatDate(t.date)}
              </span>

              {/* Amount + mobile date */}
              <div className="text-right md:w-[100px]">
                <p
                  className={`text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] ${
                    t.amount > 0 ? "text-green" : "text-grey-900"
                  }`}
                >
                  {t.amount > 0 ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </p>
                <p className="md:hidden text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
                  {formatDate(t.date)}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-300 pt-300 border-t border-grey-100">
            <motion.button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              {...buttonTap}
              className="flex items-center gap-100 border border-beige-500 rounded-lg py-150 px-200 text-[length:var(--text-preset-4)] text-grey-900 leading-[var(--text-preset-4--line-height)] disabled:opacity-40 hover:bg-grey-100 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors"
            >
              <Image src="/icon-caret-left.svg" alt="" width={6} height={11} />
              <span className="hidden md:inline">Prev</span>
            </motion.button>

            <div className="flex items-center gap-100">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-[40px] h-[40px] flex items-center justify-center rounded-lg text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] border focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors ${
                    page === n
                      ? "bg-grey-900 text-white border-grey-900"
                      : "border-beige-500 text-grey-900 hover:bg-grey-100"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <motion.button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              {...buttonTap}
              className="flex items-center gap-100 border border-beige-500 rounded-lg py-150 px-200 text-[length:var(--text-preset-4)] text-grey-900 leading-[var(--text-preset-4--line-height)] disabled:opacity-40 hover:bg-grey-100 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors"
            >
              <span className="hidden md:inline">Next</span>
              <Image src="/icon-caret-right.svg" alt="" width={6} height={11} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
