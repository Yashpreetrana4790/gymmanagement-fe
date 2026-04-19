import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/_app.gallery";

type Transformation = {
  _id: string;
  memberName?: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  caption?: string;
  weightBefore?: number;
  weightAfter?: number;
  achievedAt: string;
  isPublic: boolean;
};

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;

  const [transformRes, membersRes] = await Promise.all([
    api.get<{ data: Transformation[] }>("/api/transformations", token),
    api.get<{ data: { _id: string; user: { firstName: string; lastName: string } }[] }>("/api/members", token),
  ]);

  return {
    transformations: transformRes.data ?? [],
    members: (membersRes.data ?? []).map((m) => ({
      _id: m._id,
      name: `${m.user.firstName} ${m.user.lastName}`.trim(),
    })),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;
  const form = await request.formData();
  const intent = form.get("intent") as string;

  if (intent === "create") {
    await api.post("/api/transformations", {
      memberId: form.get("memberId") || undefined,
      memberName: form.get("memberName") || undefined,
      beforeImageUrl: form.get("beforeImageUrl"),
      afterImageUrl: form.get("afterImageUrl"),
      caption: form.get("caption") || undefined,
      weightBefore: form.get("weightBefore") || undefined,
      weightAfter: form.get("weightAfter") || undefined,
      achievedAt: form.get("achievedAt") || undefined,
    }, token);
  }

  if (intent === "delete") {
    await api.delete(`/api/transformations/${form.get("id")}`, token);
  }

  return null;
}

function AddTransformationModal({
  members,
  onClose,
}: {
  members: { _id: string; name: string }[];
  onClose: () => void;
}) {
  const fetcher = useFetcher();
  const busy = fetcher.state !== "idle";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Add transformation</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <fetcher.Form method="post" className="p-6 space-y-4" onSubmit={() => setTimeout(onClose, 300)}>
          <input type="hidden" name="intent" value="create" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Member</label>
              <select name="memberId"
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                <option value="">Select member…</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Display name</label>
              <input name="memberName" type="text" placeholder="e.g. Rahul S."
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Before image URL <span className="text-red-400">*</span></label>
            <input name="beforeImageUrl" type="url" required placeholder="https://…"
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">After image URL <span className="text-red-400">*</span></label>
            <input name="afterImageUrl" type="url" required placeholder="https://…"
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Weight before (kg)</label>
              <input name="weightBefore" type="number" step="0.1" placeholder="80"
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Weight after (kg)</label>
              <input name="weightAfter" type="number" step="0.1" placeholder="65"
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Achieved on</label>
            <input name="achievedAt" type="date"
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Caption</label>
            <textarea name="caption" rows={2} placeholder="Amazing 3-month journey…"
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={busy}
              className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold transition">
              {busy ? "Saving…" : "Add transformation"}
            </button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}

function TransformationCard({ t }: { t: Transformation }) {
  const fetcher = useFetcher();
  const weightDiff = t.weightBefore && t.weightAfter
    ? Math.round((t.weightBefore - t.weightAfter) * 10) / 10
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
      {/* Before / After images */}
      <div className="grid grid-cols-2 gap-0.5 bg-gray-100">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img src={t.beforeImageUrl} alt="Before"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/300x400?text=Before"; }} />
          <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white">BEFORE</span>
        </div>
        <div className="relative aspect-[3/4] overflow-hidden">
          <img src={t.afterImageUrl} alt="After"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/300x400?text=After"; }} />
          <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/90 text-white">AFTER</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {t.memberName && (
              <p className="text-sm font-semibold text-gray-800 truncate">{t.memberName}</p>
            )}
            {t.caption && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.caption}</p>
            )}
          </div>
          {weightDiff !== null && weightDiff > 0 && (
            <div className="shrink-0 text-center px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-sm font-black text-emerald-600">−{weightDiff}</p>
              <p className="text-[9px] text-emerald-500 font-medium">kg lost</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-gray-400">
            {new Date(t.achievedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="id" value={t._id} />
            <button
              className="text-xs text-red-400 hover:text-red-600 font-medium opacity-0 group-hover:opacity-100 transition"
            >
              Remove
            </button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage({ loaderData }: Route.ComponentProps) {
  const { transformations, members } = loaderData;
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Transformation Gallery</h1>
          <p className="text-sm text-gray-400 mt-0.5">Before & after journeys of your members</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add transformation
        </button>
      </div>

      <div className="p-8">
        {transformations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-600">No transformations yet</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              Showcase your members' incredible journeys by adding before & after photos.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition"
            >
              Add first transformation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {transformations.map((t) => (
              <TransformationCard key={t._id} t={t} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddTransformationModal members={members} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
