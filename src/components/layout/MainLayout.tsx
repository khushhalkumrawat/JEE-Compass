import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-200">
      <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      ```
      <main className="min-h-screen lg:ml-[255px]">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <div className="mx-auto max-w-[1450px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
