import { Form, useNavigation } from "react-router";
import { useState, useRef } from "react";
import type { Route } from "./+types/_app.plans";
import { planSchema, parseErrors, type FieldErrors } from "~/lib/validations";

type Plan = {
  _id: string;
  name: string;
  durationDays: number;
  price: number;
  features: string[];
  isActive: boolean;
};

// ─── Duration helpers ─────────────────────────────────────────────────────────

const MONTH_OPTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const YEAR_OPTS: { label: string; days: number }[] = [
  { label: "1 Year",   days: 365 },
  { label: "1.5 Yrs",  days: 548 },
  { label: "2 Years",  days: 730 },
  { label: "3 Years",  days: 1095 },
];

function formatDuration(days: number): string {
  if (days === 365)  return "1 year";
  if (days === 548)  return "1.5 years";
  if (days === 730)  return "2 years";
  if (days === 1095) return "3 years";
  if (days % 365 === 0) return `${days / 365} year${days / 365 > 1 ? "s" : ""}`;
  if (days % 30 === 0)  return `${days / 30} month${days / 30 > 1 ? "s" : ""}`;
  return `${days} day${days !== 1 ? "s" : ""}`;
}

// ─── Features Input ───────────────────────────────────────────────────────────

const FEATURE_SUGGESTIONS = [
  "Unlimited classes", "Locker room", "Personal trainer", "Cardio area",
  "Weight training", "Group classes", "Yoga sessions", "Steam room",
  "Sauna", "Swimming pool", "Diet consultation", "Parking", "Towel service",
  "Supplement bar", "Fitness assessment",
];

function FeaturesInput() {
  const [features, setFeatures] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = (val: string) => {
    const trimmed = val.trim().replace(/,+$/, "");
    if (trimmed && !features.includes(trimmed)) {
      setFeatures((f) => [...f, trimmed]);
    }
    setDraft("");
  };

  const remove = (idx: number) => setFeatures((f) => f.filter((_, i) => i !== idx));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    }
    if (e.key === "Backspace" && draft === "" && features.length > 0) {
      remove(features.length - 1);
    }
  };

  const toggleSuggestion = (s: string) => {
    if (features.includes(s)) {
      setFeatures((f) => f.filter((x) => x !== s));
    } else {
      setFeatures((f) => [...f, s]);
    }
    inputRef.current?.focus();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Features</label>
        {features.length > 0 && (
          <button
            type="button"
            onClick={() => setFeatures([])}
            className="text-xs text-gray-400 hover:text-red-500 transition"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Hidden field — joined for the action */}
      <input type="hidden" name="features" value={features.join(",")} />

      {/* Tag box */}
      <div
        className="min-h-13 w-full flex flex-wrap gap-1.5 items-center px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {features.map((f, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold"
          >
            {f}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(i); }}
              className="text-primary/60 hover:text-primary transition leading-none"
              aria-label={`Remove ${f}`}
            >
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                <path d="M9.5 2.5l-7 7M2.5 2.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(draft)}
          placeholder={features.length === 0 ? "Type a feature, press Enter or comma to add…" : "Add more…"}
          className="flex-1 min-w-32 outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent"
        />
      </div>

      {/* Hint */}
      <p className="text-[11px] text-gray-400 mt-1.5 ml-0.5">
        Press <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono text-[10px]">Enter</kbd> or{" "}
        <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono text-[10px]">,</kbd> to add · Backspace to remove last
      </p>

      {/* Quick-add suggestions */}
      <div className="mt-3">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick add</p>
        <div className="flex flex-wrap gap-1.5">
          {FEATURE_SUGGESTIONS.map((s) => {
            const active = features.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSuggestion(s)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                  active
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-white"
                }`}
              >
                {active ? (
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                ) : (
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
                )}
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type Unit = "months" | "years" | "custom";

// ─── Duration Picker ──────────────────────────────────────────────────────────

function DurationPicker() {
  const [unit, setUnit]         = useState<Unit>("months");
  const [months, setMonths]     = useState(1);
  const [yearDays, setYearDays] = useState(365);
  const [customDays, setCustomDays] = useState("");

  const effectiveDays =
    unit === "months" ? months * 30
    : unit === "years" ? yearDays
    : Number(customDays) || "";

  const UNIT_TABS: { key: Unit; label: string }[] = [
    { key: "months", label: "Months" },
    { key: "years",  label: "Years"  },
    { key: "custom", label: "Custom" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 space-y-4">
      <input type="hidden" name="durationDays" value={effectiveDays} />

      {/* Unit tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl w-fit">
        {UNIT_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setUnit(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
              unit === t.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Month grid */}
      {unit === "months" && (
        <div className="grid grid-cols-6 gap-2">
          {MONTH_OPTS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonths(m)}
              className={`py-2.5 rounded-xl text-sm font-semibold border transition flex flex-col items-center gap-0.5 ${
                months === m
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              <span>{m}</span>
              <span className={`text-[10px] font-medium ${months === m ? "text-primary-foreground/70" : "text-gray-400"}`}>
                {m === 1 ? "mo" : "mos"}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Year options */}
      {unit === "years" && (
        <div className="grid grid-cols-4 gap-2">
          {YEAR_OPTS.map((y) => (
            <button
              key={y.days}
              type="button"
              onClick={() => setYearDays(y.days)}
              className={`py-3 rounded-xl text-sm font-semibold border transition ${
                yearDays === y.days
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              {y.label}
            </button>
          ))}
        </div>
      )}

      {/* Custom days */}
      {unit === "custom" && (
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            placeholder="e.g. 45"
            value={customDays}
            onChange={(e) => setCustomDays(e.target.value)}
            className="w-36 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition text-sm"
          />
          <span className="text-sm text-gray-400">days</span>
          {Number(customDays) > 0 && (
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
              ≈ {formatDuration(Number(customDays))}
            </span>
          )}
        </div>
      )}

      {/* Selected summary */}
      {effectiveDays !== "" && (
        <p className="text-xs text-gray-400">
          Duration:{" "}
          <span className="font-semibold text-gray-700">
            {formatDuration(Number(effectiveDays))}
          </span>
          <span className="ml-1 text-gray-300">({effectiveDays} days)</span>
        </p>
      )}
    </div>
  );
}

// ─── Loader / Action ──────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;
  const result = await api.get<{ data: Plan[] }>("/api/plans", token);
  return { plans: result.data ?? [] };
}

export async function action({ request }: Route.ActionArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);
  const token = session.get("token")!;
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "create") {
    const raw = {
      name:         (form.get("name")         as string) ?? "",
      durationDays: (form.get("durationDays") as string) ?? "",
      price:        (form.get("price")        as string) ?? "",
      features:     (form.get("features")     as string) ?? "",
    };

    const parsed = planSchema.safeParse(raw);
    if (!parsed.success) {
      return { intent: "create", fields: parseErrors(parsed.error) as FieldErrors, error: null };
    }

    const result = await api.post<{ data: Plan }>("/api/plans", parsed.data, token);
    return {
      intent: "create",
      fields: null,
      error: result.success ? null : (result.message ?? "Failed to create plan."),
    };
  }

  if (intent === "delete") {
    const id = form.get("id") as string;
    const result = await api.delete(`/api/plans/${id}`, token);
    return { intent: "delete", fields: null, error: result.success ? null : (result.message ?? "Failed to deactivate plan.") };
  }

  return null;
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Plans({ loaderData, actionData }: Route.ComponentProps) {
  const { plans } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const fields = (actionData as any)?.intent === "create"
    ? ((actionData as any)?.fields as FieldErrors | null)
    : null;

  return (
    <div className="min-h-full">
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Plans</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage membership plans for your gym.</p>
      </div>

      <div className="p-8">
        {(actionData as any)?.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {(actionData as any).error}
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {plans.length === 0 ? (
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
              <svg className="w-14 h-14 mb-4 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="font-medium">No plans yet</p>
              <p className="text-sm mt-1">Create your first membership plan below.</p>
            </div>
          ) : (
            plans.map((plan) => (
              <div key={plan._id} className="rounded-2xl border-2 border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-2xl font-bold text-gray-900">₹{plan.price.toLocaleString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-500 capitalize">{formatDuration(plan.durationDays)}</span>
                  <span className="text-xs text-gray-300">· {plan.durationDays}d</span>
                </div>
                {plan.features.length > 0 && (
                  <ul className="space-y-1 mb-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                <Form method="post" onSubmit={(e) => { if (!confirm(`Deactivate "${plan.name}"?`)) e.preventDefault(); }}>
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="id" value={plan._id} />
                  <button type="submit" className="text-xs text-gray-400 hover:text-red-600 transition font-medium mt-1">
                    Deactivate
                  </button>
                </Form>
              </div>
            ))
          )}
        </div>

        {/* Create plan form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Create new plan</h2>
          <Form method="post" className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <input type="hidden" name="intent" value="create" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan name <span className="text-red-400">*</span></label>
              <input name="name" type="text" placeholder="e.g. Monthly Basic"
                className={`w-full px-4 py-3 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition ${fields?.name ? "border-red-400" : "border-gray-200"}`} />
              <FieldError msg={fields?.name} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹) <span className="text-red-400">*</span></label>
              <input name="price" type="text" inputMode="numeric" placeholder="999"
                className={`w-full px-4 py-3 rounded-xl border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition ${fields?.price ? "border-red-400" : "border-gray-200"}`} />
              <FieldError msg={fields?.price} />
            </div>

            <div className="sm:col-span-2">
              <DurationPicker />
              <FieldError msg={fields?.durationDays} />
            </div>

            <div className="sm:col-span-2">
              <FeaturesInput />
            </div>

            <div className="sm:col-span-2">
              <button type="submit" disabled={isSubmitting}
                className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                {isSubmitting ? "Creating…" : "Create plan"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
