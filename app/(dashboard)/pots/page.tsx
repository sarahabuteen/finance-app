"use client";

import Image from "next/image";
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


type Pot = { name: string; target: number; total: number; theme: string };

const initialPots: Pot[] = data.pots;

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

function formatCurrency(amount: number) {
  return `$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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

export default function PotsPage() {
  const [pots, setPots] = useState<Pot[]>(initialPots);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [menuIndex, setMenuIndex] = useState(-1);

  // Modal states
  const [addOpen, setAddOpen] = useState(false);
  const [editPot, setEditPot] = useState<Pot | null>(null);
  const [deletePot, setDeletePot] = useState<Pot | null>(null);
  const [addMoneyPot, setAddMoneyPot] = useState<Pot | null>(null);
  const [withdrawPot, setWithdrawPot] = useState<Pot | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [formTheme, setFormTheme] = useState(themeColors[0].hex);
  const [moneyAmount, setMoneyAmount] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string; target?: string; amount?: string }>({});

  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const usedThemes = pots.map((p) => p.theme);

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
    setFormName("");
    setFormTarget("");
    setFormTheme(themeColors.find((tc) => !usedThemes.includes(tc.hex))?.hex || themeColors[0].hex);
    setFormErrors({});
    setAddOpen(true);
  }

  function openEdit(p: Pot) {
    setFormName(p.name);
    setFormTarget(p.target.toString());
    setFormTheme(p.theme);
    setFormErrors({});
    setEditPot(p);
    setMenuOpen(null);
    setMenuIndex(-1);
  }

  function handleAdd() {
    const errs: typeof formErrors = {};
    if (!formName.trim()) errs.name = "Name is required";
    if (!formTarget || parseFloat(formTarget) <= 0) errs.target = "Enter a valid target amount";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setPots([...pots, { name: formName, target: parseFloat(formTarget), total: 0, theme: formTheme }]);
    setAddOpen(false);
  }

  function handleEdit() {
    if (!editPot) return;
    const errs: typeof formErrors = {};
    if (!formName.trim()) errs.name = "Name is required";
    if (!formTarget || parseFloat(formTarget) <= 0) errs.target = "Enter a valid target amount";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setPots(pots.map((p) => (p === editPot ? { ...p, name: formName, target: parseFloat(formTarget), theme: formTheme } : p)));
    setEditPot(null);
  }

  function handleDelete() {
    if (!deletePot) return;
    setPots(pots.filter((p) => p !== deletePot));
    setDeletePot(null);
  }

  function handleAddMoney() {
    if (!addMoneyPot) return;
    const errs: typeof formErrors = {};
    const amount = parseFloat(moneyAmount);
    if (!moneyAmount || isNaN(amount) || amount <= 0) errs.amount = "Enter an amount greater than 0";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setPots(pots.map((p) => (p === addMoneyPot ? { ...p, total: Math.min(p.target, p.total + amount) } : p)));
    setAddMoneyPot(null);
    setMoneyAmount("");
  }

  function handleWithdraw() {
    if (!withdrawPot) return;
    const errs: typeof formErrors = {};
    const amount = parseFloat(moneyAmount);
    if (!moneyAmount || isNaN(amount) || amount <= 0) errs.amount = "Enter an amount greater than 0";
    else if (amount > withdrawPot.total) errs.amount = `Cannot withdraw more than ${formatCurrency(withdrawPot.total)}`;
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setPots(pots.map((p) => (p === withdrawPot ? { ...p, total: Math.max(0, p.total - amount) } : p)));
    setWithdrawPot(null);
    setMoneyAmount("");
  }

    const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent, pot: Pot) => {
      const items = 2;
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
          if (menuIndex === 0) openEdit(pot);
          else if (menuIndex === 1) {
            setDeletePot(pot);
            setMenuOpen(null);
            setMenuIndex(-1);
          }
          break;
        case "Escape":
          e.preventDefault();
          setMenuOpen(null);
          setMenuIndex(-1);
          triggerRefs.current[pot.name]?.focus();
          break;
      }
    },
    [menuIndex]
  );

  // For Add/Withdraw modals: compute preview values
  const activeMoneyPot = addMoneyPot || withdrawPot;
  const previewAmount = parseFloat(moneyAmount) || 0;
  const previewTotal = activeMoneyPot
    ? addMoneyPot
      ? Math.min(activeMoneyPot.target, activeMoneyPot.total + previewAmount)
      : Math.max(0, activeMoneyPot.total - previewAmount)
    : 0;
  const previewPct = activeMoneyPot ? (previewTotal / activeMoneyPot.target) * 100 : 0;

  const inputBase = "w-full border rounded-lg py-150 text-[length:var(--text-preset-4)] text-grey-900 leading-[var(--text-preset-4--line-height)] outline-none transition-colors";
  const inputOk = "border-beige-500 hover:border-grey-500 focus:border-grey-900 focus:ring-1 focus:ring-grey-900";
  const inputErr = "border-red focus:border-red focus:ring-1 focus:ring-red";

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
          Pots
        </h1>
        <motion.button
          onClick={openAdd}
          {...buttonTap}
          className="bg-grey-900 text-white rounded-lg py-200 px-200 text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] hover:bg-grey-500 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors"
        >
          + Add New Pot
        </motion.button>
      </div>

      {/* Pot cards grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-300"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {pots.map((pot) => {
          const pct = pot.target > 0 ? (pot.total / pot.target) * 100 : 0;

          return (
            <motion.div key={pot.name} variants={staggerItem} {...cardHover} className="bg-white rounded-xl p-400">
              {/* Header */}
              <div className="flex items-center justify-between mb-300">
                <div className="flex items-center gap-200">
                  <span className="w-[16px] h-[16px] rounded-full" style={{ backgroundColor: pot.theme }} />
                  <h2 className="text-[length:var(--text-preset-2)] font-bold leading-[var(--text-preset-2--line-height)] text-grey-900">
                    {pot.name}
                  </h2>
                </div>
                <div className="relative" ref={(el) => { menuRefs.current[pot.name] = el; }}>
                  <button
                    ref={(el) => { triggerRefs.current[pot.name] = el; }}
                    onClick={() => {
                      const opening = menuOpen !== pot.name;
                      setMenuOpen(opening ? pot.name : null);
                      setMenuIndex(opening ? 0 : -1);
                    }}
                    aria-haspopup="true"
                    aria-expanded={menuOpen === pot.name}
                    className="p-100 rounded hover:bg-grey-100 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900"
                  >
                    <Image src="/icon-ellipsis.svg" alt="Options" width={14} height={4} />
                  </button>
                  <AnimatePresence>
                    {menuOpen === pot.name && (
                      <motion.div
                        role="menu"
                        onKeyDown={(e) => handleMenuKeyDown(e, pot)}
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
                          onClick={() => openEdit(pot)}
                          className="block w-full text-left px-200 py-150 text-[length:var(--text-preset-4)] text-grey-900 hover:bg-grey-100 focus:bg-grey-100 outline-none rounded-t-lg"
                        >
                          Edit Pot
                        </button>
                        <button
                          role="menuitem"
                          tabIndex={menuIndex === 1 ? 0 : -1}
                          ref={(el) => { if (menuIndex === 1 && el) el.focus(); }}
                          onClick={() => {
                            setDeletePot(pot);
                            setMenuOpen(null);
                            setMenuIndex(-1);
                          }}
                          className="block w-full text-left px-200 py-150 text-[length:var(--text-preset-4)] text-red hover:bg-grey-100 focus:bg-grey-100 outline-none rounded-b-lg"
                        >
                          Delete Pot
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Total saved */}
              <div className="flex items-center justify-between mb-200">
                <span className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)]">
                  Total Saved
                </span>
                <span className="text-[length:var(--text-preset-1)] font-bold text-grey-900 leading-[var(--text-preset-1--line-height)]">
                  {formatCurrency(pot.total)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-[8px] bg-beige-100 rounded-full overflow-hidden mb-150">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: pot.theme }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, pct)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                />
              </div>

              {/* Percentage + Target */}
              <div className="flex items-center justify-between mb-400">
                <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)]">
                  {pct.toFixed(1)}%
                </span>
                <span className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
                  Target of {formatCurrency(pot.target)}
                </span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-200">
                <motion.button
                  onClick={() => {
                    setAddMoneyPot(pot);
                    setMoneyAmount("");
                    setFormErrors({});
                  }}
                  {...buttonTap}
                  className="bg-beige-100 text-grey-900 rounded-lg py-200 text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] hover:bg-beige-500/20 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors"
                >
                  + Add Money
                </motion.button>
                <motion.button
                  onClick={() => {
                    setWithdrawPot(pot);
                    setMoneyAmount("");
                    setFormErrors({});
                  }}
                  {...buttonTap}
                  className="bg-beige-100 text-grey-900 rounded-lg py-200 text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] hover:bg-beige-500/20 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors"
                >
                  Withdraw
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Add New Pot Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} label="Add New Pot">
        <div className="flex items-center justify-between mb-250">
          <h2 className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] text-grey-900">
            Add New Pot
          </h2>
          <button onClick={() => setAddOpen(false)} className="rounded hover:bg-grey-100 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900">
            <Image src="/icon-close-modal.svg" alt="Close" width={26} height={26} />
          </button>
        </div>
        <p className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)] mb-250">
          Create a pot to set savings targets. These can help keep you on track as you save for special purchases.
        </p>

        <label className="block mb-200">
          <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-50 block">
            Pot Name
          </span>
          <input
            type="text"
            placeholder="e.g. Rainy Days"
            value={formName}
            onChange={(e) => {
              setFormName(e.target.value.slice(0, 30));
              if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
            }}
            aria-invalid={!!formErrors.name}
            aria-describedby={formErrors.name ? "pot-add-name-error" : undefined}
            className={`${inputBase} px-200 ${formErrors.name ? inputErr : inputOk}`}
          />
          {formErrors.name && (
            <p id="pot-add-name-error" role="alert" className="text-[length:var(--text-preset-5)] text-red leading-[var(--text-preset-5--line-height)] mt-50">
              {formErrors.name}
            </p>
          )}
          <span className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)] mt-50 block text-right">
            {30 - formName.length} characters left
          </span>
        </label>

        <label className="block mb-200">
          <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-50 block">
            Target
          </span>
          <div className="relative">
            <span className="absolute left-200 top-1/2 -translate-y-1/2 text-beige-500 text-[length:var(--text-preset-4)]">$</span>
            <input
              type="number"
              placeholder="e.g. 2000"
              value={formTarget}
              onChange={(e) => {
                setFormTarget(e.target.value);
                if (formErrors.target) setFormErrors((prev) => ({ ...prev, target: undefined }));
              }}
              aria-invalid={!!formErrors.target}
              aria-describedby={formErrors.target ? "pot-add-target-error" : undefined}
              className={`${inputBase} pl-[36px] pr-200 ${formErrors.target ? inputErr : inputOk}`}
            />
          </div>
          {formErrors.target && (
            <p id="pot-add-target-error" role="alert" className="text-[length:var(--text-preset-5)] text-red leading-[var(--text-preset-5--line-height)] mt-50">
              {formErrors.target}
            </p>
          )}
        </label>

        <label className="block mb-250">
          <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-50 block">
            Theme
          </span>
          <div className="relative">
            <span className="absolute left-200 top-1/2 -translate-y-1/2 w-[16px] h-[16px] rounded-full" style={{ backgroundColor: formTheme }} />
            <select
              value={formTheme}
              onChange={(e) => setFormTheme(e.target.value)}
              className="w-full border border-beige-500 rounded-lg py-150 pl-[44px] pr-200 text-[length:var(--text-preset-4)] text-grey-900 leading-[var(--text-preset-4--line-height)] bg-white appearance-none outline-none hover:border-grey-500 focus:border-grey-900 focus:ring-1 focus:ring-grey-900 transition-colors"
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

        <motion.button onClick={handleAdd} {...buttonTap} className="w-full bg-grey-900 text-white rounded-lg py-200 text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] hover:bg-grey-500 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors">
          Add Pot
        </motion.button>
      </Modal>

      {/* Edit Pot Modal */}
      <Modal open={!!editPot} onClose={() => setEditPot(null)} label="Edit Pot">
        <div className="flex items-center justify-between mb-250">
          <h2 className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] text-grey-900">
            Edit Pot
          </h2>
          <button onClick={() => setEditPot(null)} className="rounded hover:bg-grey-100 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900">
            <Image src="/icon-close-modal.svg" alt="Close" width={26} height={26} />
          </button>
        </div>
        <p className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)] mb-250">
          If your saving targets change, feel free to update your pots.
        </p>

        <label className="block mb-200">
          <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-50 block">
            Pot Name
          </span>
          <input
            type="text"
            value={formName}
            onChange={(e) => {
              setFormName(e.target.value.slice(0, 30));
              if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
            }}
            aria-invalid={!!formErrors.name}
            aria-describedby={formErrors.name ? "pot-edit-name-error" : undefined}
            className={`${inputBase} px-200 ${formErrors.name ? inputErr : inputOk}`}
          />
          {formErrors.name && (
            <p id="pot-edit-name-error" role="alert" className="text-[length:var(--text-preset-5)] text-red leading-[var(--text-preset-5--line-height)] mt-50">
              {formErrors.name}
            </p>
          )}
          <span className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)] mt-50 block text-right">
            {30 - formName.length} characters left
          </span>
        </label>

        <label className="block mb-200">
          <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-50 block">
            Target
          </span>
          <div className="relative">
            <span className="absolute left-200 top-1/2 -translate-y-1/2 text-beige-500 text-[length:var(--text-preset-4)]">$</span>
            <input
              type="number"
              value={formTarget}
              onChange={(e) => {
                setFormTarget(e.target.value);
                if (formErrors.target) setFormErrors((prev) => ({ ...prev, target: undefined }));
              }}
              aria-invalid={!!formErrors.target}
              aria-describedby={formErrors.target ? "pot-edit-target-error" : undefined}
              className={`${inputBase} pl-[36px] pr-200 ${formErrors.target ? inputErr : inputOk}`}
            />
          </div>
          {formErrors.target && (
            <p id="pot-edit-target-error" role="alert" className="text-[length:var(--text-preset-5)] text-red leading-[var(--text-preset-5--line-height)] mt-50">
              {formErrors.target}
            </p>
          )}
        </label>

        <label className="block mb-250">
          <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-50 block">
            Theme
          </span>
          <div className="relative">
            <span className="absolute left-200 top-1/2 -translate-y-1/2 w-[16px] h-[16px] rounded-full" style={{ backgroundColor: formTheme }} />
            <select
              value={formTheme}
              onChange={(e) => setFormTheme(e.target.value)}
              className="w-full border border-beige-500 rounded-lg py-150 pl-[44px] pr-200 text-[length:var(--text-preset-4)] text-grey-900 leading-[var(--text-preset-4--line-height)] bg-white appearance-none outline-none hover:border-grey-500 focus:border-grey-900 focus:ring-1 focus:ring-grey-900 transition-colors"
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

        <motion.button onClick={handleEdit} {...buttonTap} className="w-full bg-grey-900 text-white rounded-lg py-200 text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] hover:bg-grey-500 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors">
          Save Changes
        </motion.button>
      </Modal>

      {/* Delete Pot Modal */}
      <Modal open={!!deletePot} onClose={() => setDeletePot(null)} label={`Delete ${deletePot?.name}`}>
        <div className="flex items-center justify-between mb-250">
          <h2 className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] text-grey-900">
            Delete &apos;{deletePot?.name}&apos;?
          </h2>
          <button onClick={() => setDeletePot(null)} className="rounded hover:bg-grey-100 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900">
            <Image src="/icon-close-modal.svg" alt="Close" width={26} height={26} />
          </button>
        </div>
        <p className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)] mb-250">
          Are you sure you want to delete this pot? This action cannot be reversed, and all the data inside it will be removed forever.
        </p>
        <motion.button onClick={handleDelete} {...buttonTap} className="w-full bg-red text-white rounded-lg py-200 text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] mb-200 hover:opacity-80 focus:outline-2 focus:outline-offset-2 focus:outline-red transition-colors">
          Yes, Confirm Deletion
        </motion.button>
        <motion.button onClick={() => setDeletePot(null)} {...buttonTap} className="w-full text-grey-500 text-[length:var(--text-preset-4)] leading-[var(--text-preset-4--line-height)] py-100 rounded-lg hover:bg-beige-500/20 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors">
          No, Go Back
        </motion.button>
      </Modal>

      {/* Add Money Modal */}
      <Modal open={!!addMoneyPot} onClose={() => setAddMoneyPot(null)} label={`Add to ${addMoneyPot?.name}`}>
        <div className="flex items-center justify-between mb-250">
          <h2 className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] text-grey-900">
            Add to &apos;{addMoneyPot?.name}&apos;
          </h2>
          <button onClick={() => setAddMoneyPot(null)} className="rounded hover:bg-grey-100 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900">
            <Image src="/icon-close-modal.svg" alt="Close" width={26} height={26} />
          </button>
        </div>
        <p className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)] mb-250">
          Add money to your pot to keep it on track with your savings goals. You can add as much as you like.
        </p>

        {addMoneyPot && (
          <>
            {/* New Amount */}
            <div className="flex items-center justify-between mb-200">
              <span className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)]">
                New Amount
              </span>
              <span className="text-[length:var(--text-preset-1)] font-bold text-grey-900 leading-[var(--text-preset-1--line-height)]">
                {formatCurrency(previewTotal)}
              </span>
            </div>

            {/* Progress bar preview */}
            <div className="h-[8px] bg-beige-100 rounded-full overflow-hidden mb-150">
              <div className="h-full rounded-full flex">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: addMoneyPot.theme }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(addMoneyPot.total / addMoneyPot.target) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                {previewAmount > 0 && (
                  <div
                    className="h-full bg-green"
                    style={{
                      width: `${Math.min(100 - (addMoneyPot.total / addMoneyPot.target) * 100, (previewAmount / addMoneyPot.target) * 100)}%`,
                    }}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-300">
              <span className="text-[length:var(--text-preset-5)] font-bold text-green leading-[var(--text-preset-5--line-height)]">
                {previewPct.toFixed(2)}%
              </span>
              <span className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
                Target of {formatCurrency(addMoneyPot.target)}
              </span>
            </div>

            <label className="block mb-250">
              <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-50 block">
                Amount to Add
              </span>
              <div className="relative">
                <span className="absolute left-200 top-1/2 -translate-y-1/2 text-beige-500 text-[length:var(--text-preset-4)]">$</span>
                <input
                  type="number"
                  value={moneyAmount}
                  onChange={(e) => {
                    setMoneyAmount(e.target.value);
                    if (formErrors.amount) setFormErrors((prev) => ({ ...prev, amount: undefined }));
                  }}
                  aria-invalid={!!formErrors.amount}
                  aria-describedby={formErrors.amount ? "pot-add-money-error" : undefined}
                  className={`${inputBase} pl-[36px] pr-200 ${formErrors.amount ? inputErr : inputOk}`}
                />
              </div>
              {formErrors.amount && (
                <p id="pot-add-money-error" role="alert" className="text-[length:var(--text-preset-5)] text-red leading-[var(--text-preset-5--line-height)] mt-50">
                  {formErrors.amount}
                </p>
              )}
            </label>

            <motion.button onClick={handleAddMoney} {...buttonTap} className="w-full bg-grey-900 text-white rounded-lg py-200 text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] hover:bg-grey-500 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors">
              Confirm Addition
            </motion.button>
          </>
        )}
      </Modal>

      {/* Withdraw Money Modal */}
      <Modal open={!!withdrawPot} onClose={() => setWithdrawPot(null)} label={`Withdraw from ${withdrawPot?.name}`}>
        <div className="flex items-center justify-between mb-250">
          <h2 className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] text-grey-900">
            Withdraw from &apos;{withdrawPot?.name}&apos;
          </h2>
          <button onClick={() => setWithdrawPot(null)} className="rounded hover:bg-grey-100 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900">
            <Image src="/icon-close-modal.svg" alt="Close" width={26} height={26} />
          </button>
        </div>
        <p className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)] mb-250">
          Withdraw from your pot to put money back in your main balance. This will reduce the amount in your pot.
        </p>

        {withdrawPot && (
          <>
            <div className="flex items-center justify-between mb-200">
              <span className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)]">
                New Amount
              </span>
              <span className="text-[length:var(--text-preset-1)] font-bold text-grey-900 leading-[var(--text-preset-1--line-height)]">
                {formatCurrency(previewTotal)}
              </span>
            </div>

            {/* Progress bar preview */}
            <div className="h-[8px] bg-beige-100 rounded-full overflow-hidden mb-150">
              <div className="h-full rounded-full flex">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: withdrawPot.theme }}
                  initial={{ width: `${(withdrawPot.total / withdrawPot.target) * 100}%` }}
                  animate={{ width: `${Math.max(0, previewPct)}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
                {previewAmount > 0 && (
                  <div
                    className="h-full bg-red"
                    style={{
                      width: `${Math.min((withdrawPot.total / withdrawPot.target) * 100 - previewPct, (previewAmount / withdrawPot.target) * 100)}%`,
                    }}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-300">
              <span className="text-[length:var(--text-preset-5)] font-bold text-red leading-[var(--text-preset-5--line-height)]">
                {previewPct.toFixed(2)}%
              </span>
              <span className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
                Target of {formatCurrency(withdrawPot.target)}
              </span>
            </div>

            <label className="block mb-250">
              <span className="text-[length:var(--text-preset-5)] font-bold text-grey-500 leading-[var(--text-preset-5--line-height)] mb-50 block">
                Amount to Withdraw
              </span>
              <div className="relative">
                <span className="absolute left-200 top-1/2 -translate-y-1/2 text-beige-500 text-[length:var(--text-preset-4)]">$</span>
                <input
                  type="number"
                  value={moneyAmount}
                  onChange={(e) => {
                    setMoneyAmount(e.target.value);
                    if (formErrors.amount) setFormErrors((prev) => ({ ...prev, amount: undefined }));
                  }}
                  aria-invalid={!!formErrors.amount}
                  aria-describedby={formErrors.amount ? "pot-withdraw-error" : undefined}
                  className={`${inputBase} pl-[36px] pr-200 ${formErrors.amount ? inputErr : inputOk}`}
                />
              </div>
              {formErrors.amount && (
                <p id="pot-withdraw-error" role="alert" className="text-[length:var(--text-preset-5)] text-red leading-[var(--text-preset-5--line-height)] mt-50">
                  {formErrors.amount}
                </p>
              )}
            </label>

            <motion.button onClick={handleWithdraw} {...buttonTap} className="w-full bg-grey-900 text-white rounded-lg py-200 text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] hover:bg-grey-500 focus:outline-2 focus:outline-offset-2 focus:outline-grey-900 transition-colors">
              Confirm Withdrawal
            </motion.button>
          </>
        )}
      </Modal>
    </motion.div>
  );
}
