import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from "react-router";
import { ToastProvider } from "~/components/Toast";
import "./tailwind.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-gray-50 text-gray-900 antialiased" suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Outlet />
      <ToastProvider />
    </>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let status = 500;
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    status  = error.status;
    message = typeof error.data === "string" ? error.data : error.statusText;
  } else if (error instanceof Error) {
    message = error.message;
  }

  const is404 = status === 404;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{ background: is404 ? "linear-gradient(135deg,#fff7ed,#fffbeb)" : "#f9fafb" }}>
      {is404 ? (
        <>
          <span style={{ fontSize: 72, filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.15))", animation: "float 4s ease-in-out infinite" }}>🏝️</span>
          <p className="text-7xl font-black mt-4 mb-2" style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>404</p>
          <h1 className="text-xl font-bold text-gray-900">Lost at sea</h1>
          <p className="text-sm text-gray-400 mt-1">{message}</p>
        </>
      ) : (
        <>
          <p className="text-6xl font-black text-orange-500 mb-3">{status}</p>
          <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
          <p className="text-sm text-gray-400 mt-1">{message}</p>
        </>
      )}
      <a href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition">
        ← Go home
      </a>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>
  );
}
