import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pages, total, onChange }) {
  if (!pages || pages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1 py-3 flex-wrap gap-3">
      <p className="text-xs text-ink-400">
        Page <span className="font-medium text-ink-700">{page}</span> of{" "}
        <span className="font-medium text-ink-700">{pages}</span>
        {typeof total === "number" && <> &middot; {total} total</>}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="p-2 rounded-lg border border-ink-100 text-ink-600 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className="p-2 rounded-lg border border-ink-100 text-ink-600 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
