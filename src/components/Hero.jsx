import { Rocket, Trees } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-sky-50 to-white pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Discover hidden routes around the world — free.
            </h1>
            <p className="mt-4 text-gray-600 text-lg">
              Nomadia generates low-cost, nature-first backpacking adventures tailored to your days, region, and style.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#generate"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-6 py-3 font-medium shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
              >
                <Rocket className="h-5 w-5" /> Generate My Adventure
              </a>
              <a
                href="#about"
                className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-6 py-3 font-medium border border-gray-200 shadow-sm hover:bg-gray-50"
              >
                <Trees className="h-5 w-5" /> Learn more
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl border border-emerald-100 bg-gradient-to-tr from-emerald-100 via-sky-100 to-white shadow-inner overflow-hidden">
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center p-6">
                  <div className="text-6xl">🗺️</div>
                  <p className="mt-2 text-gray-700 font-medium">Map-first adventures, generated for you</p>
                  <p className="mt-1 text-gray-500 text-sm">Nature • Culture • People • Remote • Challenge</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
