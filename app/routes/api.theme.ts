import { createCookie } from "react-router";
import type { Route } from "./+types/api.theme";

export const themeCookie = createCookie("gym-theme", {
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
  sameSite: "lax",
  httpOnly: false,
});

export async function action({ request }: Route.ActionArgs) {
  const form   = await request.formData();
  const accent = (form.get("accent") as string) || "orange";

  const cookie = await themeCookie.serialize({ accent });
  return new Response(null, {
    status: 200,
    headers: { "Set-Cookie": cookie },
  });
}
