import { GraduationCap, ChevronRight, X, Zap } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navigationItems } from "../../data/dashboard";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}
      ```
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[255px] flex-col border-r border-white/[0.07] bg-[#0b1120] transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-[82px] items-center justify-between border-b border-white/[0.07] px-6">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
              <GraduationCap size={23} className="text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                JEE Compass
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Your AI Study Coach
              </p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="text-slate-400 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-8">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigationItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/20"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
                <ChevronRight size={15} className="ml-auto opacity-60" />
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-indigo-400/15 bg-gradient-to-br from-indigo-500/15 to-violet-500/[0.04] p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
              <Zap size={19} />
            </div>

            <p className="text-sm font-semibold text-white">
              Small steps. Big results.
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Your preparation journey starts one question at a time.
            </p>
          </div>

          <p className="mt-5 text-center text-[10px] text-slate-600">
            Built for JEE aspirants
          </p>
        </div>
      </aside>
    </>
  );
}
