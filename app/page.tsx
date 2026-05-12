import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[var(--parchment)]">

      {/* Background tree watermark */}
      <div
        className="animate-fade-in absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ opacity: 0, animationDelay: "0.2s", animationFillMode: "forwards" }}
        aria-hidden
      >
        <TreeWatermark />
      </div>

      {/* Top ornamental rule */}
      <div className="w-full px-8 pt-8">
        <div className="border-t border-[var(--rule)]" />
      </div>

      {/* Header */}
      <header
        className="animate-fade-up flex justify-between items-center px-10 py-5 border-b border-[var(--rule)]"
        style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
      >
        <span className="font-[family-name:var(--font-display)] text-xs tracking-[0.35em] uppercase text-[var(--sepia)]">
          TRE
        </span>
        <nav>
          <Link
            href="/login"
            className="font-[family-name:var(--font-body)] text-sm tracking-widest uppercase text-[var(--sepia)] hover:text-[var(--ink)] transition-colors duration-300"
          >
            Sign in
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">

        {/* Ornamental header line */}
        <div
          className="animate-fade-up flex items-center gap-5 mb-12"
          style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
        >
          <div className="h-px w-14 bg-[var(--gold)]" />
          <span className="font-[family-name:var(--font-body)] text-xs tracking-[0.45em] uppercase text-[var(--gold)]">
            Genealogy
          </span>
          <div className="h-px w-14 bg-[var(--gold)]" />
        </div>

        {/* Main title */}
        <h1
          className="animate-scale-in font-[family-name:var(--font-display)] leading-none font-light tracking-tight text-[var(--ink)] mb-4"
          style={{
            fontSize: "clamp(6rem, 20vw, 16rem)",
            animationDelay: "0.35s",
            animationFillMode: "forwards",
          }}
        >
          TRE
        </h1>

        {/* Tagline */}
        <p
          className="animate-fade-up font-[family-name:var(--font-display)] text-xl tracking-[0.18em] uppercase font-light italic text-[var(--sepia)] mb-14"
          style={{ animationDelay: "0.55s", animationFillMode: "forwards" }}
        >
          Your Family History, Preserved
        </p>

        {/* Mid divider */}
        <div
          className="animate-fade-up flex items-center gap-3 mb-14"
          style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}
        >
          <div className="h-px w-10 bg-[var(--rule)]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--rule)]" />
          <div className="h-px w-10 bg-[var(--rule)]" />
        </div>

        {/* Description */}
        <p
          className="animate-fade-up font-[family-name:var(--font-body)] text-lg leading-relaxed max-w-sm text-[var(--sepia)] mb-20"
          style={{ animationDelay: "0.75s", animationFillMode: "forwards" }}
        >
          Map the generations. Preserve the stories.{" "}
          <em>Connect who you are to where you came from.</em>
        </p>

        {/* CTAs */}
        <div
          className="animate-fade-up flex flex-col sm:flex-row items-center gap-4 mb-24"
          style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}
        >
          <Link
            href="/register"
            className="px-10 py-4 font-[family-name:var(--font-body)] text-sm tracking-[0.18em] uppercase bg-[var(--ink)] text-[var(--parchment)] hover:bg-[var(--gold)] hover:text-[var(--ink)] transition-colors duration-300"
          >
            Begin Your Tree
          </Link>
          <Link
            href="/login"
            className="px-10 py-4 font-[family-name:var(--font-body)] text-sm tracking-[0.18em] uppercase border border-[var(--rule)] text-[var(--sepia)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors duration-300"
          >
            Sign In
          </Link>
        </div>

        {/* Features */}
        <div
          className="animate-fade-up grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-xl w-full"
          style={{ animationDelay: "1.05s", animationFillMode: "forwards" }}
        >
          {[
            { num: "I", text: "Build your tree visually" },
            { num: "II", text: "Add portraits & life stories" },
            { num: "III", text: "Export & share your heritage" },
          ].map(({ num, text }) => (
            <div key={num} className="flex flex-col items-center gap-3">
              <span className="font-[family-name:var(--font-display)] text-3xl font-light text-[var(--gold)]">
                {num}
              </span>
              <div className="h-px w-8 bg-[var(--rule)]" />
              <span className="font-[family-name:var(--font-body)] text-sm text-[var(--sepia)] leading-snug">
                {text}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center px-10 py-6 border-t border-[var(--rule)]">
        <span className="font-[family-name:var(--font-body)] text-xs tracking-widest text-[var(--rule)]">
          TRE — Genealogy
        </span>
        <div className="flex-1 mx-8 h-px bg-[var(--parchment-mid)]" />
        <span className="font-[family-name:var(--font-body)] text-xs tracking-widest text-[var(--rule)]">
          {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}

function TreeWatermark() {
  const tips: [number, number][] = [
    [50, 80], [100, 70], [175, 60], [230, 55],
    [75, 155], [130, 155], [195, 175], [250, 175],
    [370, 55], [425, 60], [495, 70], [550, 80],
    [350, 175], [405, 175], [465, 155], [525, 155],
  ];

  return (
    <svg
      width="640"
      height="720"
      viewBox="0 0 640 720"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[var(--ink)]"
      style={{ opacity: 0.07 }}
    >
      <line x1="320" y1="720" x2="320" y2="420" stroke="currentColor" strokeWidth="3" />
      <line x1="320" y1="420" x2="160" y2="260" stroke="currentColor" strokeWidth="2.5" />
      <line x1="320" y1="420" x2="480" y2="260" stroke="currentColor" strokeWidth="2.5" />
      <line x1="320" y1="500" x2="190" y2="365" stroke="currentColor" strokeWidth="2" />
      <line x1="320" y1="500" x2="450" y2="365" stroke="currentColor" strokeWidth="2" />
      <line x1="160" y1="260" x2="85" y2="155" stroke="currentColor" strokeWidth="1.5" />
      <line x1="160" y1="260" x2="215" y2="138" stroke="currentColor" strokeWidth="1.5" />
      <line x1="190" y1="365" x2="115" y2="242" stroke="currentColor" strokeWidth="1.5" />
      <line x1="190" y1="365" x2="235" y2="262" stroke="currentColor" strokeWidth="1.5" />
      <line x1="480" y1="260" x2="425" y2="138" stroke="currentColor" strokeWidth="1.5" />
      <line x1="480" y1="260" x2="555" y2="155" stroke="currentColor" strokeWidth="1.5" />
      <line x1="450" y1="365" x2="405" y2="262" stroke="currentColor" strokeWidth="1.5" />
      <line x1="450" y1="365" x2="525" y2="242" stroke="currentColor" strokeWidth="1.5" />
      <line x1="85" y1="155" x2="50" y2="80" stroke="currentColor" strokeWidth="1" />
      <line x1="85" y1="155" x2="100" y2="70" stroke="currentColor" strokeWidth="1" />
      <line x1="215" y1="138" x2="175" y2="60" stroke="currentColor" strokeWidth="1" />
      <line x1="215" y1="138" x2="230" y2="55" stroke="currentColor" strokeWidth="1" />
      <line x1="115" y1="242" x2="75" y2="155" stroke="currentColor" strokeWidth="1" />
      <line x1="115" y1="242" x2="130" y2="155" stroke="currentColor" strokeWidth="1" />
      <line x1="235" y1="262" x2="195" y2="175" stroke="currentColor" strokeWidth="1" />
      <line x1="235" y1="262" x2="250" y2="175" stroke="currentColor" strokeWidth="1" />
      <line x1="425" y1="138" x2="370" y2="55" stroke="currentColor" strokeWidth="1" />
      <line x1="425" y1="138" x2="425" y2="60" stroke="currentColor" strokeWidth="1" />
      <line x1="555" y1="155" x2="495" y2="70" stroke="currentColor" strokeWidth="1" />
      <line x1="555" y1="155" x2="550" y2="80" stroke="currentColor" strokeWidth="1" />
      <line x1="405" y1="262" x2="350" y2="175" stroke="currentColor" strokeWidth="1" />
      <line x1="405" y1="262" x2="405" y2="175" stroke="currentColor" strokeWidth="1" />
      <line x1="525" y1="242" x2="465" y2="155" stroke="currentColor" strokeWidth="1" />
      <line x1="525" y1="242" x2="525" y2="155" stroke="currentColor" strokeWidth="1" />
      {tips.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="currentColor" />
      ))}
    </svg>
  );
}
