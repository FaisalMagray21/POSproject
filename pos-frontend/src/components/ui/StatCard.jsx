import clsx from "clsx";

const tones = {
  brand: "bg-brand-500 text-white",
  gold: "bg-gold-500 text-white",
  ink: "bg-ink-900 text-white",
  white: "bg-white text-ink-900 border border-ink-100",
};

export default function StatCard({ icon: Icon, label, value, tone = "white", sub }) {
  const dark = tone !== "white";
  return (
    <div
      className={clsx(
        "rounded-2xl p-4 sm:p-5 shadow-card relative overflow-hidden",
        tones[tone]
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p
          className={clsx(
            "text-xs font-mono uppercase tracking-wider",
            dark ? "text-white/70" : "text-ink-400"
          )}
        >
          {label}
        </p>
        {Icon && (
          <div
            className={clsx(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              dark ? "bg-white/15" : "bg-brand-50"
            )}
          >
            <Icon size={16} className={dark ? "text-white" : "text-brand-500"} />
          </div>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-display font-semibold leading-none">{value}</p>
      {sub && (
        <p className={clsx("text-xs mt-2", dark ? "text-white/70" : "text-ink-400")}>{sub}</p>
      )}
    </div>
  );
}
