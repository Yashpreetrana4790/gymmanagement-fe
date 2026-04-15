import { type RouteConfig, layout, route, index } from "@react-router/dev/routes";

export default [
  // Sign out (no layout)
  route("logout", "routes/logout.tsx"),

  // Auth screens (no sidebar)
  layout("routes/_auth.tsx", [
    route("signup", "routes/_auth.signup.tsx"),
    route("login", "routes/_auth.login.tsx"),
    route("verify", "routes/_auth.verify.tsx"),
    route("onboarding", "routes/_auth.onboarding.tsx"),
  ]),

  // Protected app (with sidebar)
  layout("routes/_app.tsx", [
    index("routes/_app._index.tsx"),
    route("members", "routes/_app.members.tsx"),
    route("staff", "routes/_app.staff.tsx"),
    route("plans", "routes/_app.plans.tsx"),
    route("payments", "routes/_app.payments.tsx"),
  ]),
] satisfies RouteConfig;
