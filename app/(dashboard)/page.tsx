import Image from "next/image";
import Link from "next/link";
import data from "@/data.json";

const { balance, transactions, budgets, pots } = data;

// Get the 5 most recent transactions
const recentTransactions = [...transactions]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 5);

// Calculate total spent per budget category
function getBudgetSpent(category: string) {
  return transactions
    .filter((t) => t.category === category && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.maximum, 0);
const totalBudgetSpent = budgets.reduce(
  (sum, b) => sum + getBudgetSpent(b.category),
  0
);

// Recurring bills summary
const recurringBills = transactions.filter((t) => t.recurring && t.amount < 0);
const paidBills = recurringBills.filter((t) => {
  const d = new Date(t.date);
  return d.getMonth() === 7 && d.getDate() <= 19; // Aug, paid by 19th
});
const totalPaid = paidBills.reduce((sum, t) => sum + Math.abs(t.amount), 0);
const totalUpcoming = recurringBills
  .filter((t) => !paidBills.includes(t))
  .reduce((sum, t) => sum + Math.abs(t.amount), 0);
const dueSoon = recurringBills
  .filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === 7 && d.getDate() > 19 && d.getDate() <= 26;
  })
  .reduce((sum, t) => sum + Math.abs(t.amount), 0);

function formatCurrency(amount: number) {
  return `$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function avatarSrc(path: string) {
  return path.replace("./assets/images/", "/");
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OverviewPage() {
  return (
    <div className="space-y-400">
      {/* Page title */}
      <h1 className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] text-grey-900">
        Overview
      </h1>

      {/* ── Balance cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-300">
        <div className="bg-grey-900 text-white rounded-xl p-300">
          <p className="text-[length:var(--text-preset-4)] leading-[var(--text-preset-4--line-height)]">
            Current Balance
          </p>
          <p className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] mt-150">
            {formatCurrency(balance.current)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-300">
          <p className="text-[length:var(--text-preset-4)] leading-[var(--text-preset-4--line-height)] text-grey-500">
            Income
          </p>
          <p className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] text-grey-900 mt-150">
            {formatCurrency(balance.income)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-300">
          <p className="text-[length:var(--text-preset-4)] leading-[var(--text-preset-4--line-height)] text-grey-500">
            Expenses
          </p>
          <p className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] text-grey-900 mt-150">
            {formatCurrency(balance.expenses)}
          </p>
        </div>
      </div>

      {/* ── Main content layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-300 items-start">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-300">
          {/* Pots */}
          <div className="bg-white rounded-xl p-400">
            <div className="flex items-center justify-between mb-250">
              <h2 className="text-[length:var(--text-preset-2)] font-bold leading-[var(--text-preset-2--line-height)] text-grey-900">
                Pots
              </h2>
              <Link href="/pots" className="flex items-center gap-150 text-[length:var(--text-preset-4)] text-grey-500">
                See Details
                <Image src="/icon-caret-right.svg" alt="" width={6} height={11} />
              </Link>
            </div>
            <div className="flex flex-col md:flex-row gap-250">
              {/* Total saved */}
              <div className="flex items-center gap-200 bg-beige-100 rounded-xl p-200 flex-shrink-0">
                <Image src="/icon-pot.svg" alt="" width={28} height={36} />
                <div>
                  <p className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)]">
                    Total Saved
                  </p>
                  <p className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] text-grey-900">
                    {formatCurrency(pots.reduce((sum, p) => sum + p.total, 0))}
                  </p>
                </div>
              </div>
              {/* Individual pots grid */}
              <div className="grid grid-cols-2 gap-200 flex-1">
                {pots.slice(0, 4).map((pot) => (
                  <div key={pot.name} className="flex items-center gap-200">
                    <span className="w-[4px] h-full rounded-full self-stretch" style={{ backgroundColor: pot.theme }} />
                    <div>
                      <p className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
                        {pot.name}
                      </p>
                      <p className="text-[length:var(--text-preset-4)] font-bold text-grey-900 leading-[var(--text-preset-4--line-height)]">
                        {formatCurrency(pot.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-xl p-400">
            <div className="flex items-center justify-between mb-250">
              <h2 className="text-[length:var(--text-preset-2)] font-bold leading-[var(--text-preset-2--line-height)] text-grey-900">
                Transactions
              </h2>
              <Link href="/transactions" className="flex items-center gap-150 text-[length:var(--text-preset-4)] text-grey-500">
                View All
                <Image src="/icon-caret-right.svg" alt="" width={6} height={11} />
              </Link>
            </div>
            <div className="divide-y divide-grey-100">
              {recentTransactions.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-200 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-200">
                    <Image src={avatarSrc(t.avatar)} alt={t.name} width={40} height={40} className="rounded-full" />
                    <span className="text-[length:var(--text-preset-4)] font-bold text-grey-900 leading-[var(--text-preset-4--line-height)]">
                      {t.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`text-[length:var(--text-preset-4)] font-bold leading-[var(--text-preset-4--line-height)] ${t.amount > 0 ? "text-green" : "text-grey-900"}`}>
                      {t.amount > 0 ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </p>
                    <p className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
                      {formatDate(t.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 flex flex-col gap-300">
          {/* Budgets */}
          <div className="bg-white rounded-xl p-400">
            <div className="flex items-center justify-between mb-250">
              <h2 className="text-[length:var(--text-preset-2)] font-bold leading-[var(--text-preset-2--line-height)] text-grey-900">
                Budgets
              </h2>
              <Link href="/budgets" className="flex items-center gap-150 text-[length:var(--text-preset-4)] text-grey-500">
                See Details
                <Image src="/icon-caret-right.svg" alt="" width={6} height={11} />
              </Link>
            </div>
            <div className="flex flex-col md:flex-row gap-400 items-center">
              {/* Donut chart */}
              <div className="relative flex-shrink-0">
                <svg width="180" height="180" viewBox="0 0 180 180">
                  {budgets.reduce(
                    (acc: { offset: number; elements: React.ReactElement[] }, b) => {
                      const radius = 70;
                      const circumference = 2 * Math.PI * radius;
                      const ratio = b.maximum / totalBudgetLimit;
                      const dashLength = ratio * circumference;
                      const el = (
                        <circle
                          key={b.category}
                          cx={90}
                          cy={90}
                          r={radius}
                          fill="none"
                          stroke={b.theme}
                          strokeWidth={28}
                          strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                          strokeDashoffset={-acc.offset}
                          transform="rotate(-90 90 90)"
                        />
                      );
                      return {
                        offset: acc.offset + dashLength,
                        elements: [...acc.elements, el],
                      };
                    },
                    { offset: 0, elements: [] }
                  ).elements}
                  <circle cx="90" cy="90" r="56" fill="white" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[length:var(--text-preset-1)] font-bold text-grey-900 leading-[var(--text-preset-1--line-height)]">
                    ${Math.round(totalBudgetSpent)}
                  </p>
                  <p className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
                    of ${totalBudgetLimit} limit
                  </p>
                </div>
              </div>
              {/* Budget list */}
              <div className="flex flex-col gap-200 flex-1 w-full md:w-auto">
                {budgets.map((b) => (
                  <div key={b.category} className="flex items-center gap-200">
                    <span className="w-[4px] h-full rounded-full self-stretch" style={{ backgroundColor: b.theme }} />
                    <div>
                      <p className="text-[length:var(--text-preset-5)] text-grey-500 leading-[var(--text-preset-5--line-height)]">
                        {b.category}
                      </p>
                      <p className="text-[length:var(--text-preset-4)] font-bold text-grey-900 leading-[var(--text-preset-4--line-height)]">
                        {formatCurrency(b.maximum)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recurring Bills */}
          <div className="bg-white rounded-xl p-400">
            <div className="flex items-center justify-between mb-250">
              <h2 className="text-[length:var(--text-preset-2)] font-bold leading-[var(--text-preset-2--line-height)] text-grey-900">
                Recurring Bills
              </h2>
              <Link href="/recurring-bills" className="flex items-center gap-150 text-[length:var(--text-preset-4)] text-grey-500">
                See Details
                <Image src="/icon-caret-right.svg" alt="" width={6} height={11} />
              </Link>
            </div>
            <div className="flex flex-col gap-150">
              <div className="flex items-center justify-between bg-beige-100 rounded-xl px-200 py-250 border-l-4 border-green">
                <span className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)]">
                  Paid Bills
                </span>
                <span className="text-[length:var(--text-preset-4)] font-bold text-grey-900 leading-[var(--text-preset-4--line-height)]">
                  {formatCurrency(totalPaid)}
                </span>
              </div>
              <div className="flex items-center justify-between bg-beige-100 rounded-xl px-200 py-250 border-l-4 border-yellow">
                <span className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)]">
                  Total Upcoming
                </span>
                <span className="text-[length:var(--text-preset-4)] font-bold text-grey-900 leading-[var(--text-preset-4--line-height)]">
                  {formatCurrency(totalUpcoming)}
                </span>
              </div>
              <div className="flex items-center justify-between bg-beige-100 rounded-xl px-200 py-250 border-l-4 border-cyan">
                <span className="text-[length:var(--text-preset-4)] text-grey-500 leading-[var(--text-preset-4--line-height)]">
                  Due Soon
                </span>
                <span className="text-[length:var(--text-preset-4)] font-bold text-grey-900 leading-[var(--text-preset-4--line-height)]">
                  {formatCurrency(dueSoon)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
