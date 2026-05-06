import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/_app.feedback";

type Feedback = {
  _id: string;
  submitterName: string;
  submitterEmail?: string;
  category: "complaint" | "suggestion" | "compliment" | "general";
  rating?: number;
  message: string;
  status: "open" | "in-progress" | "resolved";
  adminResponse?: string;
  createdAt: string;
  resolvedAt?: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "";
  const category = url.searchParams.get("category") ?? "";

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (category) params.set("category", category);

  const res = await api.get<{ data: Feedback[]; total: number; openCount: number; resolvedCount: number }>(
    `/api/feedback?${params}`,
    token
  );

  return {
    feedback: res.data ?? [],
    total: res.total ?? 0,
    openCount: res.openCount ?? 0,
    resolvedCount: res.resolvedCount ?? 0,
    filterStatus: status,
    filterCategory: category,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;
  const form = await request.formData();
  const intent = form.get("intent") as string;
  const id = form.get("id") as string;

  if (intent === "update") {
    await api.patch(`/api/feedback/${id}`, {
      status: form.get("status") || undefined,
      adminResponse: form.get("adminResponse") || undefined,
    }, token);
  }
  if (intent === "delete") {
    await api.delete(`/api/feedback/${id}`, token);
  }
  return null;
}

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  complaint:   { label: "Complaint",   color: "#ef4444", bg: "#fef2f2", icon: "M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" },
  suggestion:  { label: "Suggestion",  color: "#3b82f6", bg: "#eff6ff", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  compliment:  { label: "Compliment",  color: "#10b981", bg: "#f0fdf4", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  general:     { label: "General",     color: "#6b7280", bg: "#f9fafb", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: "Open",        color: "#f59e0b", bg: "#fffbeb" },
  "in-progress": { label: "In progress", color: "#3b82f6", bg: "#eff6ff" },
  resolved:    { label: "Resolved",    color: "#10b981", bg: "#f0fdf4" },
};

function Stars({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill={s <= rating ? "#f59e0b" : "#e5e7eb"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function FeedbackCard({ fb }: { fb: Feedback }) {
  const [expanded, setExpanded] = useState(false);
  const fetcher = useFetcher();
  const cat = CATEGORY_META[fb.category] ?? CATEGORY_META.general;
  const st = STATUS_META[fb.status] ?? STATUS_META.open;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: cat.bg }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                style={{ color: cat.color }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cat.icon} />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{fb.submitterName}</p>
              {fb.submitterEmail && (
                <p className="text-xs text-gray-400">{fb.submitterEmail}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ color: st.color, background: st.bg }}>
              {st.label}
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full"
              style={{ color: cat.color, background: cat.bg }}>
              {cat.label}
            </span>
          </div>
        </div>

        <Stars rating={fb.rating} />

        <p className="text-sm text-gray-700 mt-2 leading-relaxed">{fb.message}</p>

        {fb.adminResponse && (
          <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-[10px] font-bold uppercase tracking-wide text-blue-400 mb-1">Admin response</p>
            <p className="text-xs text-blue-800">{fb.adminResponse}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <span className="text-[11px] text-gray-400">
            {new Date(fb.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-medium text-blue-500 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
            >
              {expanded ? "Cancel" : "Respond"}
            </button>
            <fetcher.Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={fb._id} />
              <button className="text-xs font-medium text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                Delete
              </button>
            </fetcher.Form>
          </div>
        </div>
      </div>

      {/* Respond panel */}
      {expanded && (
        <fetcher.Form method="post" className="border-t border-gray-100 bg-gray-50 p-5 space-y-3">
          <input type="hidden" name="intent" value="update" />
          <input type="hidden" name="id" value={fb._id} />
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
            <select name="status" defaultValue={fb.status}
              className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="open">Open</option>
              <option value="in-progress">In progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Response</label>
            <textarea name="adminResponse" defaultValue={fb.adminResponse ?? ""} rows={3}
              placeholder="Write a response…"
              className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <button type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition">
            Save
          </button>
        </fetcher.Form>
      )}
    </div>
  );
}

export default function FeedbackPage({ loaderData }: Route.ComponentProps) {
  const { feedback, openCount, resolvedCount, total, filterStatus, filterCategory } = loaderData;
  const pendingCount = total - resolvedCount;

  const summaryCards = [
    { label: "Total", value: total, color: "#6b7280", bg: "#f9fafb" },
    { label: "Open", value: openCount, color: "#f59e0b", bg: "#fffbeb" },
    { label: "Pending", value: pendingCount, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Resolved", value: resolvedCount, color: "#10b981", bg: "#f0fdf4" },
  ];

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Feedback & Complaints</h1>
        <p className="text-sm text-gray-400 mt-0.5">Member feedback, suggestions, and complaints</p>
      </div>

      <div className="p-8 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {summaryCards.map((c) => (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1">
              <span className="text-2xl font-black" style={{ color: c.color }}>{c.value}</span>
              <span className="text-xs font-medium text-gray-500">{c.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <form method="get" className="flex flex-wrap gap-3">
          <select name="status" defaultValue={filterStatus}
            className="text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select name="category" defaultValue={filterCategory}
            className="text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All categories</option>
            <option value="complaint">Complaint</option>
            <option value="suggestion">Suggestion</option>
            <option value="compliment">Compliment</option>
            <option value="general">General</option>
          </select>
          <button type="submit"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition">
            Filter
          </button>
        </form>

        {/* Cards */}
        {feedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">No feedback yet</p>
            <p className="text-xs text-gray-400 mt-1">Feedback submitted by members will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {feedback.map((fb) => (
              <FeedbackCard key={fb._id} fb={fb} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
