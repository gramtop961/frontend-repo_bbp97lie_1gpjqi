import { useEffect, useMemo, useState } from "react";
import { Map, Save, Share2, Download, Mountain, Leaf, Users, Landmark, Compass } from "lucide-react";

// Simple helpers
const deg2rad = (deg) => (deg * Math.PI) / 180;
const haversineKm = (a, b) => {
  const R = 6371; // km
  const dLat = deg2rad(b.lat - a.lat);
  const dLon = deg2rad(b.lon - a.lon);
  const lat1 = deg2rad(a.lat);
  const lat2 = deg2rad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(h));
};

const REGION_CENTERS = {
  europe: { lat: 47.5, lon: 9.0, label: "Europe" },
  asia: { lat: 21.0, lon: 105.0, label: "Asia" },
  "south america": { lat: -15.6, lon: -56.1, label: "South America" },
  "north america": { lat: 40.0, lon: -105.0, label: "North America" },
  africa: { lat: 2.0, lon: 21.0, label: "Africa" },
  oceania: { lat: -25.0, lon: 133.0, label: "Oceania" },
};

const DEFAULT_CENTER = { lat: 46.8, lon: 8.3, label: "Alps" };

function randomAround(center, radiusKm = 40) {
  // Random small offset around center within radiusKm
  const r = radiusKm / 111; // approx degrees
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const lat = center.lat + w * Math.cos(t);
  const lon = center.lon + w * Math.sin(t) / Math.cos(deg2rad(center.lat));
  return { lat, lon };
}

function buildOSMIframe(points) {
  if (!points || points.length === 0) return null;
  // Compute bbox
  let minLat = points[0].lat,
    maxLat = points[0].lat,
    minLon = points[0].lon,
    maxLon = points[0].lon;
  points.forEach((p) => {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLon = Math.min(minLon, p.lon);
    maxLon = Math.max(maxLon, p.lon);
  });
  // padding
  const pad = 0.2;
  minLat -= pad;
  maxLat += pad;
  minLon -= pad;
  maxLon += pad;
  const bbox = `${minLon.toFixed(4)},${minLat.toFixed(4)},${maxLon.toFixed(4)},${maxLat.toFixed(4)}`;
  const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
  return url;
}

function preferenceIcon(key) {
  switch (key) {
    case "nature":
      return Leaf;
    case "culture":
      return Landmark;
    case "people":
      return Users;
    case "remote":
      return Compass;
    case "challenge":
      return Mountain;
    default:
      return Leaf;
  }
}

export default function AdventureGenerator() {
  const [days, setDays] = useState(5);
  const [region, setRegion] = useState("");
  const [style, setStyle] = useState("backpack");
  const [prefs, setPrefs] = useState({
    nature: 80,
    culture: 60,
    people: 50,
    remote: 50,
    challenge: 40,
  });
  const [route, setRoute] = useState(null);

  useEffect(() => {
    // Load last saved
    const saved = localStorage.getItem("nomadia_last_route");
    if (saved) {
      try {
        setRoute(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const center = useMemo(() => {
    if (!region) return DEFAULT_CENTER;
    const key = region.toLowerCase();
    return REGION_CENTERS[key] || DEFAULT_CENTER;
  }, [region]);

  function generate() {
    const n = Math.max(2, Math.min(30, Number(days) || 5));
    // generate points forming a loop-ish path
    const points = Array.from({ length: n }, (_, i) => {
      const base = randomAround(center, 30 + (prefs.challenge / 100) * 50);
      return { ...base, name: `Day ${i + 1}` };
    });

    // distances per day
    const legs = points.map((p, i) => {
      const prev = i === 0 ? points[0] : points[i - 1];
      const d = i === 0 ? 0 : haversineKm(prev, p);
      return Math.max(6, Math.min(28, d + 8 + (prefs.challenge - 50) / 10));
    });

    const totalDistance = Math.round(legs.reduce((a, b) => a + b, 0));
    const totalTimeHrs = Math.round(totalDistance / 4.5); // walking pace
    const costPerDay = style === "public" ? 25 : style === "mixed" ? 30 : 20;
    const totalCost = totalDistance ? n * costPerDay : n * 25;

    const sleepOptions = [
      "Wild camping near a lake",
      "Forest campsite",
      "Friendly hostel dorm",
      "Volunteering at an eco-farm",
      "Community homestay",
    ];

    const daysPlan = points.map((p, i) => ({
      day: i + 1,
      coord: { lat: p.lat, lon: p.lon },
      distanceKm: Math.round(legs[i]),
      timeHrs: Math.max(3, Math.round(legs[i] / 4.5)),
      description:
        prefs.nature > 60
          ? "Forest paths, lakes and viewpoints with small village stops."
          : "Local markets, heritage streets, and scenic countryside walks.",
      sleep: sleepOptions[(i + (style === "mixed" ? 1 : 0)) % sleepOptions.length],
    }));

    const result = {
      title: `${n}-day ${center.label} ${style} adventure`,
      meta: {
        days: n,
        region: center.label,
        style,
        prefs,
      },
      points,
      summary: {
        totalDistanceKm: totalDistance,
        totalTimeHrs,
        estimatedCostUSD: totalCost,
      },
      days: daysPlan,
    };

    setRoute(result);
  }

  function saveRoute() {
    if (!route) return;
    localStorage.setItem("nomadia_last_route", JSON.stringify(route));
  }

  function shareRoute() {
    if (!route) return;
    const text = `Nomadia Adventure: ${route.title}\nDistance: ${route.summary.totalDistanceKm} km\nDays: ${route.meta.days}`;
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({ title: route.title, text, url })
        .catch(() => {});
    } else {
      navigator.clipboard
        .writeText(`${text}\n${url}`)
        .then(() => alert("Share text copied to clipboard"))
        .catch(() => alert("Copy failed"));
    }
  }

  function exportItinerary() {
    if (!route) return;
    const lines = [];
    lines.push(`# ${route.title}`);
    lines.push(`Region: ${route.meta.region}`);
    lines.push(`Style: ${route.meta.style}`);
    lines.push(
      `Summary: ${route.summary.totalDistanceKm} km • ${route.summary.totalTimeHrs} hrs • ~$${route.summary.estimatedCostUSD}`
    );
    lines.push("");
    route.days.forEach((d) => {
      lines.push(`Day ${d.day} - ${d.distanceKm} km (~${d.timeHrs} hrs)`);
      lines.push(`  ${d.description}`);
      lines.push(`  Sleep: ${d.sleep}`);
      lines.push(`  Coords: ${d.coord.lat.toFixed(4)}, ${d.coord.lon.toFixed(4)}`);
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${route.title.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const mapUrl = useMemo(() => (route ? buildOSMIframe(route.points) : null), [route]);

  return (
    <section id="generate" className="relative">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white">
              <div className="flex items-center gap-2 mb-4">
                <Map className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold">Adventure Generator</h2>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm text-gray-700">Number of days</span>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="mt-1 w-full rounded-lg border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-gray-700">Region or country</span>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Europe, Asia, South America..."
                    className="mt-1 w-full rounded-lg border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-gray-700">Travel style</span>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="mt-1 w-full rounded-lg border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="backpack">Backpack-only</option>
                    <option value="mixed">Mixed</option>
                    <option value="public">Public Transport</option>
                  </select>
                </label>

                <div className="pt-2 space-y-4">
                  {Object.entries(prefs).map(([key, val]) => {
                    const Icon = preferenceIcon(key);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm capitalize text-gray-700 inline-flex items-center gap-2">
                            <Icon className="h-4 w-4 text-emerald-600" /> {key}
                          </span>
                          <span className="text-sm text-gray-500">{val}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={val}
                          onChange={(e) => setPrefs((p) => ({ ...p, [key]: Number(e.target.value) }))}
                          className="w-full accent-emerald-600"
                        />
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={generate}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2.5 font-medium shadow hover:bg-emerald-700"
                >
                  <Compass className="h-5 w-5" /> Generate Route
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
              <div className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{route ? route.title : "Your adventure awaits"}</h3>
                  {route && (
                    <p className="text-sm text-gray-600 mt-1">
                      {route.summary.totalDistanceKm} km • {route.summary.totalTimeHrs} hrs • ~${route.summary.estimatedCostUSD}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveRoute}
                    className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                    disabled={!route}
                    title="Save locally"
                  >
                    <Save className="h-4 w-4" /> Save
                  </button>
                  <button
                    onClick={shareRoute}
                    className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                    disabled={!route}
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                  <button
                    onClick={exportItinerary}
                    className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                    disabled={!route}
                  >
                    <Download className="h-4 w-4" /> Export
                  </button>
                </div>
              </div>

              <div className="h-72 bg-gray-50 border-t border-b border-gray-200">
                {route && mapUrl ? (
                  <iframe
                    title="map"
                    src={mapUrl}
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-gray-500">
                    <div className="text-center">
                      <div className="text-5xl mb-2">🧭</div>
                      <p>Generate a route to preview the map</p>
                    </div>
                  </div>
                )}
              </div>

              {route && (
                <div className="p-5 space-y-3">
                  {route.days.map((d) => (
                    <details key={d.day} className="rounded-lg border border-gray-200">
                      <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
                        <div className="font-medium">Day {d.day}</div>
                        <div className="text-sm text-gray-600">
                          {d.distanceKm} km • ~{d.timeHrs} hrs • {d.coord.lat.toFixed(2)}, {d.coord.lon.toFixed(2)}
                        </div>
                      </summary>
                      <div className="px-4 pb-4 text-sm text-gray-700">
                        <p className="mb-2">{d.description}</p>
                        <p className="text-gray-600">Suggested sleep: {d.sleep}</p>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div id="about" className="mt-16 rounded-2xl border border-gray-200 p-8 bg-white">
          <h3 className="text-xl font-semibold mb-2">About Nomadia</h3>
          <p className="text-gray-700">
            Our mission is to make solo backpacking accessible and free. This MVP generates
            nature-forward, culturally rich routes using lightweight randomization around a region.
            Coming soon: deeper place data, transit integrations, and smarter trails.
          </p>
        </div>

        <div id="support" className="mt-6 text-center text-sm text-gray-600">
          Built with love for explorers. If you like it, share it with a friend.
        </div>
      </div>
    </section>
  );
}
