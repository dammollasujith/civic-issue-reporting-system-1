"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { ArrowRight, MapPin, ClipboardList, CheckCircle2, Clock, Users, Activity, FileText } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const WorldMap = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const cities = [
      { name: "New York", coords: [-74.006, 40.7128] },
      { name: "London", coords: [-0.1278, 51.5074] },
      { name: "Tokyo", coords: [139.6917, 35.6895] },
      { name: "Paris", coords: [2.3522, 48.8566] },
      { name: "Sydney", coords: [151.2093, -33.8688] },
      { name: "Sao Paulo", coords: [-46.6333, -23.5505] }
    ] as const;

    let topology: any = null;

    const draw = () => {
      const width = window.innerWidth;
      const height = Math.max(window.innerHeight, 820);
      const projection = d3.geoMercator().scale(width / 8.25).translate([width / 2, height / 1.52]);
      const path = d3.geoPath().projection(projection);

      svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);
      svg.selectAll("*").remove();

      if (!topology) return;

      const countries = topojson.feature(topology, topology.objects.countries) as any;

      svg
        .append("g")
        .selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "rgba(255,255,255,0.3)")
        .attr("stroke", "#abc4e8")
        .attr("stroke-width", 2.2);

      cities.forEach((city) => {
        const [x, y] = projection(city.coords as [number, number]) || [0, 0];

        svg.append("circle").attr("cx", x).attr("cy", y).attr("r", 4).attr("fill", "#78a8ff").attr("opacity", 0.95);

        const ringGroup = svg.append("g");
        [12, 22, 32].forEach((radius, index) => {
          const ring = ringGroup
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", radius)
            .attr("fill", "none")
            .attr("stroke", "#9abfff")
            .attr("stroke-width", 1)
            .attr("opacity", 0.32);

          ring
            .append("animate")
            .attr("attributeName", "r")
            .attr("from", radius)
            .attr("to", radius + 14)
            .attr("dur", "3.4s")
            .attr("begin", `${index * 0.65}s`)
            .attr("repeatCount", "indefinite");

          ring
            .append("animate")
            .attr("attributeName", "opacity")
            .attr("from", 0.36)
            .attr("to", 0)
            .attr("dur", "3.4s")
            .attr("begin", `${index * 0.65}s`)
            .attr("repeatCount", "indefinite");
        });
      });
    };

    d3.json("/world-110m.json")
      .then((data) => {
        topology = data;
        draw();
      })
      .catch(() => {
        topology = null;
      });

    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="hero-map-sheen absolute inset-0" />
      <div className="hero-gridlines absolute inset-0 opacity-80" />
      <div className="hero-glow absolute left-[10%] top-[18%] size-[24rem]" />
      <div className="hero-glow absolute bottom-[6%] right-[12%] size-[28rem]" />
      <svg ref={svgRef} className="h-full w-full opacity-[0.82]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.14),rgba(255,255,255,0.9)_72%,rgba(255,255,255,1)_100%)] dark:bg-[radial-gradient(circle_at_50%_45%,rgba(15,23,42,0.08),rgba(2,6,23,0.8)_72%,rgba(2,6,23,1)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95" />
    </div>
  );
};

const stats = [
  {
    label: "Active User",
    value: "3,450",
    trend: "+12.5%",
    icon: Users,
    accent: "text-blue-600",
    iconShell: "bg-blue-50 text-blue-600 border-blue-100",
    offset: "md:translate-y-[-1.75rem]"
  },
  {
    label: "Issue Solved",
    value: "980",
    trend: "+8.2%",
    icon: CheckCircle2,
    accent: "text-emerald-600",
    iconShell: "bg-emerald-50 text-emerald-600 border-emerald-100",
    offset: "md:translate-y-[-0.5rem]"
  },
  {
    label: "Reports Generated",
    value: "1,245",
    trend: "+15.3%",
    icon: FileText,
    accent: "text-amber-600",
    iconShell: "bg-amber-50 text-amber-600 border-amber-100",
    offset: "md:translate-y-[-0.75rem]"
  },
  {
    label: "Resolution Rate",
    value: "82%",
    trend: "+4.1%",
    icon: Activity,
    accent: "text-violet-600",
    iconShell: "bg-violet-50 text-violet-600 border-violet-100",
    offset: "md:translate-y-[0.4rem]"
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-black selection:text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded bg-black dark:bg-white">
              <Activity className="size-4 text-white dark:text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Smart Civic</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex dark:text-gray-300">
            <a className="transition-colors hover:text-black dark:hover:text-white" href="#features">Features</a>
            <Link className="transition-colors hover:text-black dark:hover:text-white" href="/how-it-works">Docs</Link>
            <a className="transition-colors hover:text-black dark:hover:text-white" href="#contact">Contact</a>
          </nav>

          <div className="flex items-center gap-5">
            <ThemeToggle compact />
            <Link
              href="/auth/citizen/login"
              className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-black sm:inline dark:text-gray-300 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/auth/citizen/signup"
              className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
          <WorldMap />

          <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-6 py-12 lg:py-16">
            <div className="grid w-full items-center gap-14 lg:grid-cols-12 lg:gap-10 xl:gap-16">
              <div className="space-y-5 lg:col-span-6 lg:space-y-6">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-gray-50/80 px-4 py-1.5 text-sm font-medium text-gray-600 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-gray-300">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-green-500"></span>
                  </span>
                  Live Platform Status
                </div>

                <h1 className="max-w-[10ch] font-syne text-[2.5rem] font-bold leading-[0.95] tracking-[-0.04em] text-[#121a2d] sm:text-[3.2rem] md:text-[3.6rem] xl:text-[4rem] dark:text-white">
                  <span className="block">Empowering</span>
                  <span className="bg-gradient-to-b from-[#3f7cff] to-[#2456dc] bg-clip-text text-transparent italic">Civic</span> Brilliance
                  <br className="hidden sm:block" />
                  Together.
                </h1>

                <p className="max-w-xl pr-0 text-lg leading-relaxed text-gray-500 dark:text-gray-400">
                  Connect with your city, report issues instantly, and track progress in real-time. Join thousands of citizens making cities smarter.
                </p>

                <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                  <Link
                    href="/report"
                    className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-full bg-black px-8 text-[1.05rem] font-medium text-white transition-all hover:bg-gray-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  >
                    <span>Report Issue</span>
                  </Link>
                  <Link
                    href="/auth/admin/login"
                    className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 text-[1.05rem] font-medium text-gray-900 transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
                  >
                    <span>Admin Access</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-[43rem] pt-4 lg:col-span-6 lg:max-w-none lg:pt-8">
                <div className="absolute inset-x-10 top-1/2 h-[42%] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.16),rgba(255,255,255,0))] blur-3xl" />
                <div className="relative grid gap-4 sm:grid-cols-2 sm:gap-5">
                  {stats.map((it) => (
                    <article
                      key={it.label}
                      className={`relative overflow-hidden flex flex-col justify-between rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.84),rgba(255,255,255,0.56))] p-6 shadow-[0_26px_70px_rgba(148,163,184,0.18)] backdrop-blur-[22px] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(148,163,184,0.24)] sm:min-h-[11.5rem] sm:p-7 dark:border-slate-700/60 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.74),rgba(15,23,42,0.42))] ${it.offset}`}
                    >
                      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),rgba(255,255,255,0))] opacity-70 dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(255,255,255,0))]" />
                      <div className="relative z-10 flex flex-col gap-5">
                        <div className={`flex size-12 shrink-0 items-center justify-center rounded-full border ${it.iconShell} dark:border-transparent dark:bg-white/5`}>
                          <it.icon className="size-5" />
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            {it.label}
                          </h3>
                          <div className="font-syne text-[2.5rem] leading-none font-bold tracking-[-0.04em] text-gray-900 dark:text-white">
                            {it.value}
                          </div>
                          <div className="flex items-center gap-1.5 pt-1 text-sm font-medium text-green-600 dark:text-green-500">
                            <span>{it.trend}</span>
                            <span className="font-normal text-gray-500 dark:text-gray-400">from last month</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="relative z-10 bg-transparent py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-syne font-bold text-slate-950 dark:text-white">Smart Architecture</h2>
              <p className="text-lg text-slate-500 dark:text-slate-400">Built with cutting-edge technology to ensure seamless civic interaction and rapid issue resolution.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                { title: "Smart Reporting", desc: "AI-powered issue categorization and precise GPS tagging for instant reporting.", icon: MapPin, color: "blue" },
                { title: "Real-time Tracking", desc: "Live updates and push notifications on your issue's progress from start to finish.", icon: Clock, color: "emerald" },
                { title: "Community Driven", desc: "Collaborate with neighbors to prioritize local issues and amplify community voices.", icon: Users, color: "orange" },
              ].map((f) => (
                <div key={f.title} className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-xl transition-all">
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl inline-block mb-8">
                    <f.icon className="size-8 text-black dark:text-white" />
                  </div>
                  <h3 className="text-2xl font-syne font-bold text-slate-950 dark:text-white mb-4">{f.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section id="contact" className="py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="relative overflow-hidden rounded-[60px] bg-black p-16 md:p-24 text-center">
              {/* Decorative shapes */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-48 -mt-48" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -ml-48 -mb-48" />
              
              <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                <h2 className="text-5xl md:text-6xl font-syne font-bold text-white leading-tight">Ready to build a <span className="text-blue-500">better</span> city?</h2>
                <p className="text-xl text-slate-400">Join our growing network of civic heroes and start making an impact today.</p>
                <div className="flex flex-wrap justify-center gap-6 pt-6">
                  <Link href="/auth/citizen/signup" className="px-10 py-5 bg-white text-black font-bold rounded-2xl text-lg hover:scale-105 transition-all">
                    Create Citizen Account
                  </Link>
                  <Link href="/auth/admin/login" className="px-10 py-5 bg-white/10 text-white border border-white/20 font-bold rounded-2xl text-lg hover:bg-white/20 transition-all">
                    Authority Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-slate-950 py-20 border-t border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-black dark:bg-white p-1 rounded-md">
                <Activity className="size-4 text-white dark:text-black" />
              </div>
              <span className="font-syne font-bold text-lg text-slate-950 dark:text-white">Smart Civic</span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs">The future of urban management is collaborative and transparent.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <Link href="/docs" className="hover:text-black dark:hover:text-white transition-colors">Documentation</Link>
            <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">Terms</Link>
          </div>
          
          <div className="text-sm font-medium text-slate-400 italic">
            © {new Date().getFullYear()} Smart Civic Lab.
          </div>
        </div>
      </footer>
    </div>
  );
}
