import { NavLink } from "react-router-dom";
import { tools } from "../tools/registry";
import { useTheme } from "../context/ThemeContext";

function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" />
      <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" />
      <line x1="16.95" y1="7.05" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 shrink-0 border-r border-black/10 dark:border-white/10 bg-[var(--bg-sidebar)] flex flex-col">
      <div className="px-5 py-4 border-b border-black/10 dark:border-white/10">
        <h1 className="text-lg font-semibold tracking-tight">
          <span className="text-sky-500 dark:text-sky-400">dev</span>-box
        </h1>
        <p className="text-xs text-black/40 dark:text-white/40">developer utilities</p>
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
                  ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                  : "text-black/70 hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white",
              ].join(" ")
            }
          >
            <div className="font-medium">{tool.name}</div>
            <div className="text-xs text-black/40 dark:text-white/40 truncate">
              {tool.description}
            </div>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-black/10 dark:border-white/10 px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-black/50 dark:text-white/50 font-medium uppercase tracking-wider">
          Settings
        </span>
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium bg-black/5 hover:bg-black/10 text-black/70 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white/80 transition-colors"
        >
          {theme === "dark" ? (
            <>
              <SunIcon />
              Light
            </>
          ) : (
            <>
              <MoonIcon />
              Dark
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
