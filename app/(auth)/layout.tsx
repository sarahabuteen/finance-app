import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col lg:flex-row bg-beige-100 overflow-hidden">
      {/* ── Mobile/Tablet header ── */}
      <div className="lg:hidden bg-grey-900 rounded-b-xl py-300 flex justify-center">
        <Image src="/logo-large.svg" alt="finance" width={122} height={22} />
      </div>

      {/* ── Desktop sidebar illustration ── */}
      <div className="hidden lg:flex lg:w-[560px] lg:flex-shrink-0 lg:m-250">
        <div className="relative w-full rounded-xl overflow-hidden bg-grey-900 flex flex-col justify-between">
          <div className="absolute inset-0 z-0">
            <Image
              src="/illustration-authentication.svg"
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Logo */}
          <div className="relative z-10 p-400">
            <Image src="/logo-large.svg" alt="finance" width={122} height={22} />
          </div>

          {/* Text overlay */}
          <div className="relative z-10 px-400 pb-400 pt-300">
            <h2 className="text-[length:var(--text-preset-1)] font-bold leading-[var(--text-preset-1--line-height)] text-white mb-300">
              Keep track of your money and save for your future
            </h2>
            <p className="text-[length:var(--text-preset-4)] text-grey-300 leading-[var(--text-preset-4--line-height)]">
              Personal finance app puts you in control of your spending. Track transactions, set budgets, and add to savings pots easily.
            </p>
          </div>
        </div>
      </div>

      {/* ── Form area ── */}
      <div className="flex-1 flex items-center justify-center p-300 lg:p-400">
        <div className="w-full max-w-[560px]">
          {children}
        </div>
      </div>
    </div>
  );
}
