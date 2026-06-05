import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { tools } from "../tools/registry";

export default function Layout() {
  const location = useLocation();
  const active = tools.find((t) => t.path === location.pathname);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="px-8 py-5 border-b border-white/10">
          <h2 className="text-xl font-semibold">{active?.name ?? "dev-box"}</h2>
          {active && (
            <p className="text-sm text-white/40">{active.description}</p>
          )}
        </header>
        <div className="p-8 max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
