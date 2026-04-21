"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import data from "@/data.json";
import { motion, AnimatePresence } from "framer-motion";
import {
  pageVariants,
  staggerContainer,
  staggerItem,
  overlayVariants,
  modalVariants,
  dropdownVariants,
  cardHover,
  buttonTap,
} from "@/app/lib/motion";


type Budget = { category: string; maximum: number; theme: string };

const initialBudgets: Budget[] = data.budgets;
const allTransactions = data.transactions;

const themeColors = [
  { name: "Green", hex: "#277C78" },
  { name: "Yellow", hex: "#F2CDAC" },
  { name: "Cyan", hex: "#82C9D7" },
  { name: "Navy", hex: "#626070" },
  { name: "Red", hex: "#C94736" },
  { name: "Purple", hex: "#826CB0" },
  { name: "Turquoise", hex: "#597C7C" },
  { name: "Brown", hex: "#93674F" },
  { name: "Magenta", hex: "#934F6F" },
  { name: "Blue", hex: "#3F82B2" },
  { name: "Navy Grey", hex: "#97A0AC" },
  { name: "Army Green", hex: "#7F9161" },
  { name: "Gold", hex: "#CAB361" },
  { name: "Orange", hex: "#BE6C49" },
];

const categoryOptions = [
  "Entertainment",
  "Bills",
  "Groceries",
  "Dining Out",
  "Transportation",
  "Personal Care",
  "Education",
  "Lifestyle",
  "Shopping",
  "General",
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

function getSpent(category: string) {
  return allTransactions
    .filter((t) => t.category === category && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

function getLatestSpending(category: string) {
  return allTransactions
    .filter((t) => t.category === category && t.amount < 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
}

// Modal component with animations
function Modal({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/50"
            aria-hidden="true"
            onClick={onClose}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="relative bg-white rounded-xl p-400 w-full max-w-[560px] mx-200"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [deleteBudget, setDeleteBudget] = useState<Budget | null>(null);
  const [menuIndex, setMenuIndex] = useState(-1);

  // Form state
  const [formCategory, setFormCategory] = useState(categoryOptions[0]);
  const [formMaximum, setFormMaximum] = useState("");
  const [formTheme, setFormTheme] = useState(themeColors[0].hex);
  const [formErrors, setFormErrors] = useState<{ maximum?: string }>({});

  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const totalLimit = budgets.reduce((s, b) => s + b.maximum, 0);
  const totalSpent = budgets.reduce((s, b) => s + getSpent(b.category), 0);

  // Click outside to close ellipsis menu
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      const ref = menuRefs.current[menuOpen!];
      if (ref && !ref.contains(e.target as Node)) {
        setMenuOpen(null);
        setMenuIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  function openAdd() {
    setFormCategory(categoryOptions.find((c) => !budgets.some((b) => b.category === c)) || categoryOptions[0]);
    setFormMaximum("");
    setFormTheme(themeColors[0].hex);
    setFormErrors({});
    setAddOpen(true);
  }

  function openEdit(b: Budget) {
    setFormCategory(b.category);
    setFormMaximum(b.maximum.toString());
    setFormTheme(b.theme);
    setFormErrors({});
    setEditBudget(b);
    setMenuOpen(null);
    setMenuIndex(-1);
  }

  function handleAdd() {
    const errs: typeof formErrors = {};
    if (!formMaximum || parseFloat(formMaximum) <= 0) errs.maximum = "Enter a valid amount";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setBudgets([...budgets, { category: formCategory, maximum: parseFloat(formMaximum), theme: formTheme }]);
    setAddOpen(false);
  }

  function handleEdit() {
    if (!editBudget) return;
    const errs: typeof formErrors = {};
    if (!formMaximum || parseFloat(formMaximum) <= 0) errs.maximum = "Enter a valid amount";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setBudgets(budgets.map((b) => (b === editBudget ? { category: formCategory, maximum: parseFloat(formMaximum), theme: formTheme } : b)));
    setEditBudget(null);
  }

  function handleDelete() {
    if (!deleteBudget) return;
    setBudgets(budgets.filter((b) => b !== deleteBudget));
    setDeleteBudget(null);
  }

    const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent, b: Budget) => {
      const items = 2; // Edit + Delete
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setMenuIndex((prev) => Math.min(prev + 1, items - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setMenuIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (menuIndex === 0) openEdit(b);
          else if (menuIndex === 1) {
            setDeleteBudget(b);
            setMenuOpen(null);
            setMenuIndex(-1);
          }
          break;
        case "Escape":
          e.preventDefault();
          setMenuOpen(null);
          setMenuIndex(-1);
          triggerRefs.current[b.category]?.focus();
          break;
      }
    },
    [menuIndex]
  );

  const usedThemes = budgets.map((b) => b.theme);

  const inputBase = "w-full border rounded-lg py-150 text-[length:var(--text-preset-4)] text-grey-900 leading-[var(--text-preset-4--line-height)] outline-none transition-colors";
  const inputOk = "border-beige-500 hover:border-grey-500 focus:border-grey-900 focus:ring-1 focus:ring-grey-900";
  const inputErr = "border-red focus:border-red focus:ring-1 focus:ring-red";

  // Donut chart segments
  const donutSegments = budgets.reduce<{ offset: number; segments: { category: string; dashLength: number; dashOffset: number; theme: string; circumference: number }[] }>(
    (acc, b) => {
      const radius = 95;
      const circumference = 2 * Math.PI * radius;
      const ratio = b.maximum / totalLimit;
      const dashLength = ratio * circumference;
      return {
        offset: acc.offset + dashLength,
        segments: [...acc.segments, { category: b.category, dashLength, dashOffset: acc.offset, theme: b.theme, circumference }],
      };
    },
    { offset: 0, segments: [] }
  );

  return (
    <motion.div
      className="space-y-400"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] text-grey-900">
          Budgets
        </h1>
        <motion.button
          onClick={openAdd}
          {...buttonTap}
          className="bg-grey-900 text-white rounded-lg py-200 px-200 text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] hover:bg-grey-500 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors"
        >
          + Add New Budget
        </motion.button>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-300 items-start">
        {/* Left: Chart + Summary */}
        <div className="bg-white rounded-xl p-400 lg:sticky lg:top-400">
          {/* Donut chart */}
          <div className="flex justify-center mb-400">
            <div className="relative">
              <svg width="240" height="240" viewBox="0 0 240 240">
                {donutSegments.segments.map((seg) => (
                  <motion.circle
                    key={seg.category}
                    cx={120}
                    cy={120}
                    r={95}
                    fill="none"
                    stroke={seg.theme}
                    strokeWidth={32}
                    strokeDasharray={`${seg.dashLength} ${seg.circumference - seg.dashLength}`}
                    initial={{ strokeDashoffset: seg.circumference }}
                    animate={{ strokeDashoffset: -seg.dashOffset }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    transform="rotate(-90 120 120)"
                  />
                ))}
                <circle cx="120" cy="120" r="79" fill="white" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[length:var(--text-preset-1)] font-bold text-grey-900 leading-[var(--text-preset-1--line-height)]">
                  ${Math.round(totalSpent)}
                </p>
                <p className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
                  of ${totalLimit} limit
                </p>
              </div>
            </div>
          </div>

          {/* Spending Summary */}
          <h3 className="text-[length:var(--text-preset-3)] font-bold text-grey-900 leading-[var(--text-preset-3--line-height)] mb-300">
            Spending Summary
          </h3>
          <motion.div
            className="divide-y divide-grey-100"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {budgets.map((b) => (
              <motion.div key={b.category} variants={staggerItem} className="flex items-center justify-between py-200 first:pt-0 last:pb-0">
                <div className="flex items-center gap-200">
                  <span className="w-[4px] h-[21px] rounded-full" style={{ backgroundColor: b.theme }} />
                  <span className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)]">
                    {b.category}
                  </span>
                </div>
                <div className="flex items-center gap-100">
                  <span className="text-[length:var(--text-preset-3)] font-bold text-grey-900 leading-[var(--text-preset-3--line-height)]">
                    {formatCurrency(getSpent(b.category))}
                  </span>
                  <span className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
                    of {formatCurrency(b.maximum)}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right: Budget cards */}
        <motion.div
          className="flex flex-col gap-300"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {budgets.map((b) => {
            const spent = getSpent(b.category);
            const remaining = Math.max(0, b.maximum - spent);
            const pct = Math.min(100, (spent / b.maximum) * 100);
            const latest = getLatestSpending(b.category);

            return (
              <motion.div key={b.category} variants={staggerItem} {...cardHover} className="bg-white rounded-xl p-400">
                {/* Budget header */}
                <div className="flex items-center justify-between mb-250">
                  <div className="flex items-center gap-200">
                    <span className="w-[16px] h-[16px] rounded-full" style={{ backgroundColor: b.theme }} />
                    <h2 className="text-[length:var(--text-preset-2)] font-bold leading-[var(--text-preset-2--line-height)] text-grey-900">
                      {b.category}
                    </h2>
                  </div>
                  <div className="relative" ref={(el) => { menuRefs.current[b.category] = el; }}>
                    <button
                      ref={(el) => { triggerRefs.current[b.category] = el; }}
                      onClick={() => {
                        const opening = menuOpen !== b.category;
                        setMenuOpen(opening ? b.category : null);
                        setMenuIndex(opening ? 0 : -1);
                      }}
                      aria-haspopup="true"
                      aria-expanded={menuOpen === b.category}
                      className="p-100 rounded hover:bg-grey-100 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900"
                    >
                      <Image src="/icon-ellipsis.svg" alt="Options" width={14} height={4} />
                    </button>
                    <AnimatePresence>
                      {menuOpen === b.category && (
                        <motion.div
                          role="menu"
                          onKeyDown={(e) => handleMenuKeyDown(e, b)}
                          className="absolute right-0 top-full mt-50 bg-white border border-grey-100 rounded-lg shadow-lg z-10 min-w-[134px] origin-top"
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <button
                            role="menuitem"
                            tabIndex={menuIndex === 0 ? 0 : -1}
                            ref={(el) => { if (menuIndex === 0 && el) el.focus(); }}
                            onClick={() => openEdit(b)}
                            className="block w-full text-left px-200 py-150 text-[length:var(--text-preset-4)] text-grey-900 hover:bg-grey-100 focus:bg-grey-100 outline-none rounded-t-lg"
                          >
                            Edit Budget
                          </button>
                          <button
                            role="menuitem"
                            tabIndex={menuIndex === 1 ? 0 : -1}
                            ref={(el) => { if (menuIndex === 1 && el) el.focus(); }}
                            onClick={() => {
                              setDeleteBudget(b);
                              setMenuOpen(null);
                              setMenuIndex(-1);
                            }}
                            className="block w-full text-left px-200 py-150 text-[length:var(--text-preset-4)] text-red hover:bg-grey-100 focus:bg-grey-100 outline-none rounded-b-lg"
                          >
                            Delete Budget
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <p className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)] mb-200">
                  Maximum of {formatCurrency(b.maximum)}
                </p>

                {/* Progress bar */}
                <div className="h-[32px] bg-beige-100 rounded-sm overflow-hidden mb-200">
                  <motion.div
                    className="h-full rounded-sm"
                    style={{ backgroundColor: b.theme }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  />
                </div>

                {/* Spent / Remaining */}
                <div className="grid grid-cols-2 gap-200 mb-250">
                  <div className="flex items-center gap-200">
                    <span className="w-[4px] h-full rounded-full self-stretch" style={{ backgroundColor: b.theme }} />
                    <div>
                      <p className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
                        Spent
                      </p>
                      <p className="text-[length:var(--text-preset-4)] font-bold text-grey-900 leading-[var(--text-preset-4--line-height)]">
                        {formatCurrency(spent)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-200">
                    <span className="w-[4px] h-full rounded-full self-stretch bg-beige-100" />
                    <div>
                      <p className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
                        Remaining
                      </p>
                      <p className="text-[length:var(--text-preset-4)] font-bold text-grey-900 leading-[var(--text-preset-4--line-height)]">
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Latest Spending */}
                <div className="bg-beige-100 rounded-xl p-200">
                  <div className="flex items-center justify-between mb-200">
                    <h3 className="text-[length:var(--text-preset-3)] font-bold text-grey-900 leading-[var(--text-preset-3--line-height)]">
                      Latest Spending
                    </h3>
                    <Link
                      href="/transactions"
                      className="flex items-center gap-150 text-[length:var(--text-preset-4)] text-grey-500 rounded hover:text-grey-900 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900"
                    >
                      See All
                      <Image src="/icon-caret-right.svg" alt="" width={6} height={11} />
                    </Link>
                  </div>
                  <div className="divide-y divide-grey-300/20">
                    {latest.map((t, i) => (
                      <div key={i} className="flex items-center justify-between py-150 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-200">
                          <Image
                            src={avatarSrc(t.avatar)}
                            alt={t.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <span className="text-[length:var(--text-preset-5)] font-bold text-grey-900 leading-[var(--text-preset-5--line-height)]">
                            {t.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[length:var(--text-preset-5)] font-bold text-grey-900 leading-[var(--text-preset-5--line-height)]">
                            -{formatCurrency(t.amount)}
                          </p>
                          <p className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
                            {formatDate(t.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Add Budget Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} label="Add New Budget">
        <div className="flex items-center justify-between mb-250">
          <h2 className="text-[length:var(--text-preset-2)] font-bold leading-[var(--text-preset-2--line-height)] text-grey-900">
            Add New Budget
          </h2>
          <button onClick={() => setAddOpen(false)} className="rounded hover:bg-grey-100 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900">
            <Image src="/icon-close-modal.svg" alt="Close" width={26} height={26} />
          </button>
        </div>
        <p className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)] mb-300">
          Choose a category to set a spending budget. These categories can help you monitor spending.
        </p>

        {/* Category */}
        <label className="block mb-250">
          <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-100 block">
            Budget Category
          </span>
          <div className="relative">
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full border border-beige-500 rounded-lg py-150 px-200 pr-[40px] text-[length:var(--text-preset-4)] text-grey-900 leading-[var(--text-preset-4--line-height)] bg-white appearance-none outline-none hover:border-grey-500 focus:border-grey-900 focus:ring-1 focus:ring-grey-900 transition-colors"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Image src="/icon-caret-down.svg" alt="" width={12} height={6} className="absolute right-200 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </label>

        {/* Maximum */}
        <label className="block mb-250">
          <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-100 block">
            Maximum Spend
          </span>
          <div className="relative">
            <span className="absolute left-200 top-1/2 -translate-y-1/2 text-beige-500 text-[length:var(--text-preset-4)]">$</span>
            <input
              type="number"
              placeholder="e.g. 2000"
              value={formMaximum}
              onChange={(e) => {
                setFormMaximum(e.target.value);
                if (formErrors.maximum) setFormErrors({});
              }}
              aria-invalid={!!formErrors.maximum}
              aria-describedby={formErrors.maximum ? "budget-add-max-error" : undefined}
              className={`${inputBase} pl-[36px] pr-200 ${formErrors.maximum ? inputErr : inputOk}`}
            />
          </div>
          {formErrors.maximum && (
            <p id="budget-add-max-error" role="alert" className="text-[length:var(--text-preset-5)] text-red leading-[var(--text-preset-5--line-height)] mt-50">
              {formErrors.maximum}
            </p>
          )}
        </label>

        {/* Theme */}
        <label className="block mb-300">
          <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-100 block">
            Theme
          </span>
          <div className="relative">
            <span
              className="absolute left-200 top-1/2 -translate-y-1/2 w-[16px] h-[16px] rounded-full"
              style={{ backgroundColor: formTheme }}
            />
            <select
              value={formTheme}
              onChange={(e) => setFormTheme(e.target.value)}
              className="w-full border border-beige-500 rounded-lg py-150 pl-[44px] pr-[40px] text-[length:var(--text-preset-4)] text-grey-900 leading-[var(--text-preset-4--line-height)] bg-white appearance-none outline-none hover:border-grey-500 focus:border-grey-900 focus:ring-1 focus:ring-grey-900 transition-colors"
            >
              {themeColors.map((tc) => (
                <option key={tc.hex} value={tc.hex} disabled={usedThemes.includes(tc.hex) && tc.hex !== formTheme}>
                  {tc.name}{usedThemes.includes(tc.hex) && tc.hex !== formTheme ? " (Already used)" : ""}
                </option>
              ))}
            </select>
            <Image src="/icon-caret-down.svg" alt="" width={12} height={6} className="absolute right-200 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </label>

        <motion.button
          onClick={handleAdd}
          {...buttonTap}
          className="w-full bg-grey-900 text-white rounded-lg py-200 text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] hover:bg-grey-500 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors"
        >
          Add Budget
        </motion.button>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal open={!!editBudget} onClose={() => setEditBudget(null)} label="Edit Budget">
        <div className="flex items-center justify-between mb-250">
          <h2 className="text-[length:var(--text-preset-2)] font-bold leading-[var(--text-preset-2--line-height)] text-grey-900">
            Edit Budget
          </h2>
          <button onClick={() => setEditBudget(null)} className="rounded hover:bg-grey-100 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900">
            <Image src="/icon-close-modal.svg" alt="Close" width={26} height={26} />
          </button>
        </div>
        <p className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)] mb-300">
          As your budgets change, feel free to update your spending limits.
        </p>

        <label className="block mb-250">
          <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-100 block">
            Budget Category
          </span>
          <div className="relative">
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full border border-beige-500 rounded-lg py-150 px-200 pr-[40px] text-[length:var(--text-preset-4)] text-grey-900 leading-[var(--text-preset-4--line-height)] bg-white appearance-none outline-none hover:border-grey-500 focus:border-grey-900 focus:ring-1 focus:ring-grey-900 transition-colors"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Image src="/icon-caret-down.svg" alt="" width={12} height={6} className="absolute right-200 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </label>

        <label className="block mb-250">
          <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-100 block">
            Maximum Spend
          </span>
          <div className="relative">
            <span className="absolute left-200 top-1/2 -translate-y-1/2 text-beige-500 text-[length:var(--text-preset-4)]">$</span>
            <input
              type="number"
              value={formMaximum}
              onChange={(e) => {
                setFormMaximum(e.target.value);
                if (formErrors.maximum) setFormErrors({});
              }}
              aria-invalid={!!formErrors.maximum}
              aria-describedby={formErrors.maximum ? "budget-edit-max-error" : undefined}
              className={`${inputBase} pl-[36px] pr-200 ${formErrors.maximum ? inputErr : inputOk}`}
            />
          </div>
          {formErrors.maximum && (
            <p id="budget-edit-max-error" role="alert" className="text-[length:var(--text-preset-5)] text-red leading-[var(--text-preset-5--line-height)] mt-50">
              {formErrors.maximum}
            </p>
          )}
        </label>

        <label className="block mb-300">
          <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-100 block">
            Theme
          </span>
          <div className="relative">
            <span
              className="absolute left-200 top-1/2 -translate-y-1/2 w-[16px] h-[16px] rounded-full"
              style={{ backgroundColor: formTheme }}
            />
            <select
              value={formTheme}
              onChange={(e) => setFormTheme(e.target.value)}
              className="w-full border border-beige-500 rounded-lg py-150 pl-[44px] pr-[40px] text-[length:var(--text-preset-4)] text-grey-900 leading-[var(--text-preset-4--line-height)] bg-white appearance-none outline-none hover:border-grey-500 focus:border-grey-900 focus:ring-1 focus:ring-grey-900 transition-colors"
            >
              {themeColors.map((tc) => (
                <option key={tc.hex} value={tc.hex} disabled={usedThemes.includes(tc.hex) && tc.hex !== formTheme}>
                  {tc.name}{usedThemes.includes(tc.hex) && tc.hex !== formTheme ? " (Already used)" : ""}
                </option>
              ))}
            </select>
            <Image src="/icon-caret-down.svg" alt="" width={12} height={6} className="absolute right-200 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </label>

        <motion.button
          onClick={handleEdit}
          {...buttonTap}
          className="w-full bg-grey-900 text-white rounded-lg py-200 text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] hover:bg-grey-500 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors"
        >
          Save Changes
        </motion.button>
      </Modal>

      {/* Delete Budget Modal */}
      <Modal open={!!deleteBudget} onClose={() => setDeleteBudget(null)} label={`Delete ${deleteBudget?.category}`}>
        <div className="flex items-center justify-between mb-250">
          <h2 className="text-[length:var(--text-preset-2)] font-bold leading-[var(--text-preset-2--line-height)] text-grey-900">
            Delete &apos;{deleteBudget?.category}&apos;?
          </h2>
          <button onClick={() => setDeleteBudget(null)} className="rounded hover:bg-grey-100 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900">
            <Image src="/icon-close-modal.svg" alt="Close" width={26} height={26} />
          </button>
        </div>
        <p className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)] mb-300">
          Are you sure you want to delete this budget? This action cannot be reversed, and all the data inside it will be removed forever.
        </p>
        <motion.button
          onClick={handleDelete}
          {...buttonTap}
          className="w-full bg-red text-white rounded-lg py-200 text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] mb-150 hover:opacity-80 focus:outline-2 focus:outline-offset-2 focus:outline-red transition-colors"
        >
          Yes, Confirm Deletion
        </motion.button>
        <motion.button
          onClick={() => setDeleteBudget(null)}
          {...buttonTap}
          className="w-full text-grey-500 text-[length:var(--text-preset-4)] leading-[var(--text-preset-4--line-height)] py-150 rounded-lg hover:bg-beige-500/20 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors"
        >
          No, Go Back
        </motion.button>
      </Modal>
    </motion.div>
  );
}
