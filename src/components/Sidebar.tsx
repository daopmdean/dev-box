import { NavLink } from "react-router-dom";
import { tools } from "../tools/registry";

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-[#0b0d11] flex flex-col">
      <div className="px-5 py-4 border-b border-white/10">
        <h1 className="text-lg font-semibold tracking-tight">
          <span className="text-sky-400">dev</span>-box
        </h1>
        <p className="text-xs text-white/40">developer utilities</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {tools.map((tool) => (
          <NavLink
            key={tool.id}
            to={tool.path}
            className={({ isActive }) =>
              [
                "block rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sky-500/15 text-sky-300"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              ].join(" ")
            }
          >
            <div className="font-medium">{tool.name}</div>
            <div className="text-xs text-white/40 truncate">
              {tool.description}
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
