import {
  Bell,
  ChevronDown,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { Logo } from "./Logo";
import { useAuth } from "../lib/auth";
const links = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/devices", label: "Family devices", icon: Smartphone },
  { to: "/safety", label: "Safety center", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
];
export function Shell() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const sidebar = (
    <>
      <div className="mb-10 flex items-center justify-between">
        <Logo light />
        <button
          className="btn btn-ghost btn-sm text-white lg:hidden"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
      </div>
      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-white text-neutral shadow-xl" : "text-white/65 hover:bg-white/10 hover:text-white"}`
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl bg-white/8 p-4 text-white">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-secondary">
          Family tip
        </p>
        <p className="mt-2 text-sm leading-6 text-white/75">
          Talk about limits together. Clear rules work better than hidden
          monitoring.
        </p>
      </div>
    </>
  );
  return (
    <div className="min-h-screen bg-base-200/50 lg:pl-[264px]">
      <aside className="noise fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col bg-[#071f1a] p-6 lg:flex">
        {sidebar}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="noise flex w-[280px] flex-col bg-[#071f1a] p-6">
            {sidebar}
          </div>
          <button
            className="flex-1 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
        </div>
      )}
      <main className="min-w-0">
        <header className="glass sticky top-0 z-30 flex h-20 items-center justify-between border-b border-base-300 px-4 md:px-8">
          <button
            className="btn btn-ghost btn-square lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>
          <div className="hidden lg:block">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
              Family command center
            </p>
            <p className="font-semibold text-neutral">
              Everything important, at a glance
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn btn-ghost btn-circle" aria-label="Help">
              <HelpCircle size={19} />
            </button>
            <button
              className="btn btn-ghost btn-circle"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="absolute mt-[-18px] ml-[16px] size-2 rounded-full bg-secondary ring-2 ring-base-100" />
            </button>
            <div className="mx-1 h-8 w-px bg-base-300" />
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-base-200"
              >
                <div className="avatar placeholder">
                  <div className="w-9 rounded-xl bg-primary text-white">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" />
                    ) : (
                      <span>{user?.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-bold leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-xs text-base-content/55">Parent account</p>
                </div>
                <ChevronDown
                  className="hidden text-base-content/40 sm:block"
                  size={15}
                />
              </button>
              <ul
                tabIndex={0}
                className="menu dropdown-content z-50 mt-3 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
              >
                <li>
                  <NavLink to="/settings">
                    <Settings size={16} />
                    Account settings
                  </NavLink>
                </li>
                <li>
                  <button onClick={signOut} className="text-error">
                    <LogOut size={16} />
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>
        <div className="soft-grid min-h-[calc(100vh-5rem)] overflow-x-hidden p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
