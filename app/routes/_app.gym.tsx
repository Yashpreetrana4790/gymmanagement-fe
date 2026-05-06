import { Form, useNavigation, redirect } from "react-router";
import type { Route } from "./+types/_app.gym";
import { gymProfileSchema, parseErrors, type FieldErrors } from "~/lib/validations";

type GymProfile = {
  gymName: string;
  strength: number;
  city: string;
  state?: string;
  address?: string;
  pincode?: string;
  phone?: string;
  email?: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);

  if (session.get("role") !== "admin") throw redirect("/");

  const token = session.get("token")!;
  const result = await api.get<{ data: GymProfile }>("/api/gym-profile", token);

  if (!result.success) throw redirect("/");

  return { gym: result.data };
}

export async function action({ request }: Route.ActionArgs) {
  const { requireSession } = await import("~/lib/session.server");
  const { api } = await import("~/lib/api.server");
  const session = await requireSession(request);

  if (session.get("role") !== "admin") throw redirect("/");

  const token = session.get("token")!;
  const form = await request.formData();

  const raw = {
    gymName:  (form.get("gymName")  as string) ?? "",
    strength: (form.get("strength") as string) ?? "",
    city:     (form.get("city")     as string) ?? "",
    state:    (form.get("state")    as string) ?? "",
    address:  (form.get("address")  as string) ?? "",
    pincode:  (form.get("pincode")  as string) ?? "",
    phone:    (form.get("phone")    as string) ?? "",
    email:    (form.get("email")    as string) ?? "",
  };

  const parsed = gymProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { fields: parseErrors(parsed.error) as FieldErrors, error: null, success: false };
  }

  const result = await api.put<{ data: unknown }>("/api/gym-profile", parsed.data, token);

  if (!result.success) {
    return { error: result.message ?? "Failed to update gym profile.", fields: null, success: false };
  }

  return { error: null, fields: null, success: true };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ManageGym({ loaderData, actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { gym } = loaderData;

  const fields  = (actionData as any)?.fields  as FieldErrors | null;
  const error   = (actionData as any)?.error   as string | null;
  const success = (actionData as any)?.success as boolean | undefined;

  const err     = (name: string) => fields?.[name];
  const invalid = (name: string) => (err(name) ? "border-red-400 focus:border-red-400" : "");

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-card border-b border-border px-8 py-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Manage Gym</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Update your gym profile and contact details</p>
        </div>
      </div>

      <div className="p-8 max-w-2xl">
        {error && (
          <div className="mb-5 p-3 rounded-xl text-sm flex items-center gap-2 bg-red-50 border border-red-200 text-red-600">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 rounded-xl text-sm flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Gym profile updated successfully.
          </div>
        )}

        <Form method="post" className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label={<>Gym Name<span className="text-red-500 ml-0.5">*</span></>}>
              <input
                name="gymName"
                type="text"
                defaultValue={gym.gymName}
                className={`w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${invalid("gymName")}`}
              />
              <FieldError msg={err("gymName")} />
            </Field>
            <Field label={<>Capacity<span className="text-red-500 ml-0.5">*</span></>}>
              <input
                name="strength"
                type="number"
                min={1}
                defaultValue={gym.strength}
                className={`w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${invalid("strength")}`}
              />
              <FieldError msg={err("strength")} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label={<>City<span className="text-red-500 ml-0.5">*</span></>}>
              <input
                name="city"
                type="text"
                defaultValue={gym.city}
                className={`w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${invalid("city")}`}
              />
              <FieldError msg={err("city")} />
            </Field>
            <Field label="State">
              <input
                name="state"
                type="text"
                defaultValue={gym.state ?? ""}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </Field>
          </div>

          <Field label="Full Address">
            <input
              name="address"
              type="text"
              defaultValue={gym.address ?? ""}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Pincode">
              <input
                name="pincode"
                type="text"
                defaultValue={gym.pincode ?? ""}
                className={`w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${invalid("pincode")}`}
              />
              <FieldError msg={err("pincode")} />
            </Field>
            <Field label="Gym Contact">
              <input
                name="phone"
                type="tel"
                defaultValue={gym.phone ?? ""}
                className={`w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${invalid("phone")}`}
              />
              <FieldError msg={err("phone")} />
            </Field>
          </div>

          <Field label="Gym Email">
            <input
              name="email"
              type="email"
              defaultValue={gym.email ?? ""}
              className={`w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${invalid("email")}`}
            />
            <FieldError msg={err("email")} />
          </Field>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save changes
                </>
              )}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
