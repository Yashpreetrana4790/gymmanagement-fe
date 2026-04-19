import { createCookieSessionStorage, redirect } from "react-router";

type SessionData = {
  token: string;
  stage: "registered" | "verified" | "onboarded";
  email: string;
  firstName: string;
  role: "admin" | "staff" | "member";
  staffRole: string; // trainer | receptionist | manager | cleaner
};

const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    name: "__gym_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET ?? "gym-dev-secret-change-in-prod"],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
});

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export const commitSession = sessionStorage.commitSession;
export const destroySession = sessionStorage.destroySession;

/** Redirect to login if no token in session */
export async function requireSession(request: Request) {
  const session = await getSession(request);
  if (!session.get("token")) throw redirect("/login");
  return session;
}

/** Redirect authenticated users away from auth pages based on their stage */
export async function redirectIfAuthenticated(request: Request) {
  const session = await getSession(request);
  const token = session.get("token");
  const stage = session.get("stage");
  if (!token) return null;
  if (stage === "registered") throw redirect("/verify");
  if (stage === "verified") throw redirect("/onboarding");
  if (stage === "onboarded") throw redirect("/");
  return null;
}
