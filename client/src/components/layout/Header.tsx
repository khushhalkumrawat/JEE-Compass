import { LogOut, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { navigationItems } from "../../data/dashboard";
import { getStudent, logout } from "../../services/auth";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const student = getStudent();

  const currentPage =
    navigationItems.find((item) => item.path === location.pathname)?.label ??
    "PrepZen";

  const initials =
    student?.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() ?? "J";

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-white/[0.07] bg-[#080d19]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-slate-300 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={23} />
        </button>

        <div>
          <p className="text-xs text-slate-500">Your preparation space</p>
          <h2 className="mt-1 text-base font-semibold text-white">
            {currentPage}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-slate-400">JEE Main 2027</span>
        </div>

        <div className="hidden text-right sm:block">
          <p className="max-w-40 truncate text-sm font-medium text-white">
            {student?.name ?? "Student"}
          </p>
          <p className="text-xs text-slate-500">Student account</p>
        </div>

        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-indigo-400/30 bg-indigo-500/15 text-sm font-bold text-indigo-200"
          title={student?.name ?? "Student"}
        >
          {initials}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
          title="Log out"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
