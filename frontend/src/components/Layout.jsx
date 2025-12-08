import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => (
  <div className="min-h-screen flex flex-col text-[#0f1a0f]">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <footer className="border-t border-white/40 bg-white/80 backdrop-blur text-center py-5 text-sm text-gray-700">
      (c) {new Date().getFullYear()} Campbell Consulting Services of Tallahassee LLC (SDVOSB). All rights reserved.
    </footer>
  </div>
);

export default Layout;
