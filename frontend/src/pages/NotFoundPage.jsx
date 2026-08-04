import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-20">
      <div className="glass-panel p-8 text-center space-y-4">
        <p className="pill inline-flex bg-white/80">404</p>
        <h1 className="text-3xl font-bold text-[#0f1a0f]">Page not found</h1>
        <p className="text-gray-700">The page you requested does not exist or has moved.</p>
        <Link to="/" className="inline-flex rounded-full bg-[#2fb3d5] px-5 py-2.5 font-semibold text-white">
          Return home
        </Link>
      </div>
    </section>
  );
}
