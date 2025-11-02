import { Compass, Map, Info } from "lucide-react";

export default function Navbar() {
  return (
    <header className="w-full sticky top-0 z-50 bg-white/70 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-sky-500 grid place-items-center text-white">
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Nomadia</span>
        </a>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
          <a href="#generate" className="hover:text-gray-900 inline-flex items-center gap-1">
            <Map className="h-4 w-4" /> Generate
          </a>
          <a href="#about" className="hover:text-gray-900 inline-flex items-center gap-1">
            <Info className="h-4 w-4" /> About
          </a>
          <a href="#support" className="hover:text-gray-900">Support</a>
        </nav>
      </div>
    </header>
  );
}
