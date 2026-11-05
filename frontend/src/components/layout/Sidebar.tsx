import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { label: "Dashboard", path: "/" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <aside className="w-64 border-r border-neutral-800 bg-neutral-950 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white text-sm">
            VJ
          </div>
          <span className="font-semibold text-lg text-white tracking-wide">VJEditor</span>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-neutral-400">
        <div className="font-medium text-white mb-1">Local Studio</div>
        <div>v1.0.0 — Ready</div>
      </div>
    </aside>
  );
}
