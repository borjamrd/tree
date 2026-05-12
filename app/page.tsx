import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[var(--parchment)]">

      {/* Grain overlay */}
      <svg className="pointer-events-none fixed inset-0 w-full h-full z-50 opacity-[0.03]" aria-hidden>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* ── Top rule ─────────────────────────────────────────── */}
      <div className="w-full px-8 pt-8">
        <div className="border-t border-[var(--rule)]" />
      </div>

      {/* ── Header ───────────────────────────────────────────── */}
      <header
        className="animate-fade-up flex justify-between items-center px-10 py-5 border-b border-[var(--rule)]"
        style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
      >
        <span className="font-[family-name:var(--font-display)] text-xs tracking-[0.4em] uppercase text-[var(--sepia)]">
          TRE
        </span>
        <nav className="flex items-center gap-8">
          <Link
            href="#features"
            className="font-[family-name:var(--font-body)] text-xs tracking-widest uppercase text-[var(--rule)] hover:text-[var(--sepia)] transition-colors duration-300 hidden sm:block"
          >
            Features
          </Link>
          <Link
            href="/login"
            className="font-[family-name:var(--font-body)] text-xs tracking-widest uppercase text-[var(--sepia)] hover:text-[var(--ink)] transition-colors duration-300"
          >
            Sign in
          </Link>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-8 py-24 text-center overflow-hidden min-h-[90vh]">

        {/* Background tree watermark */}
        <div
          className="animate-fade-in absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ opacity: 0, animationDelay: "0.2s", animationFillMode: "forwards" }}
          aria-hidden
        >
          <TreeWatermark />
        </div>

        {/* Genealogy label */}
        <div
          className="animate-fade-up flex items-center gap-5 mb-12 relative z-10"
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
          className="animate-scale-in font-[family-name:var(--font-display)] leading-none font-light tracking-tight text-[var(--ink)] mb-6 relative z-10"
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
          className="animate-fade-up font-[family-name:var(--font-display)] text-xl tracking-[0.18em] uppercase font-light italic text-[var(--sepia)] mb-10 relative z-10"
          style={{ animationDelay: "0.55s", animationFillMode: "forwards" }}
        >
          Your Family History, Preserved
        </p>

        {/* Mid divider */}
        <div
          className="animate-fade-up flex items-center gap-3 mb-10 relative z-10"
          style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}
        >
          <div className="h-px w-10 bg-[var(--rule)]" />
          <OrnamentDiamond />
          <div className="h-px w-10 bg-[var(--rule)]" />
        </div>

        {/* Description */}
        <p
          className="animate-fade-up font-[family-name:var(--font-body)] text-lg leading-relaxed max-w-sm text-[var(--sepia)] mb-16 relative z-10"
          style={{ animationDelay: "0.75s", animationFillMode: "forwards" }}
        >
          Map the generations. Preserve the stories.{" "}
          <em>Connect who you are to where you came from.</em>
        </p>

        {/* CTAs */}
        <div
          className="animate-fade-up flex flex-col sm:flex-row items-center gap-4 relative z-10"
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

        {/* Scroll cue */}
        <div
          className="animate-fade-up absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          style={{ animationDelay: "1.3s", animationFillMode: "forwards" }}
        >
          <div className="h-8 w-px bg-[var(--rule)] animate-pulse" />
        </div>
      </section>

      {/* ── Ornamental rule ───────────────────────────────────── */}
      <OrnamentalRule />

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="px-8 py-24 max-w-5xl mx-auto w-full">
        <div className="flex flex-col items-center mb-20">
          <span className="font-[family-name:var(--font-body)] text-xs tracking-[0.45em] uppercase text-[var(--gold)] mb-4">
            What TRE offers
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-light text-[var(--ink)] text-center leading-tight">
            Everything your heritage deserves
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            {
              num: "I",
              title: "Visual Tree Builder",
              body: "Drag and drop to place ancestors, partners, and descendants. Every relationship rendered with clarity on an infinite canvas.",
              icon: <TreeIcon />,
            },
            {
              num: "II",
              title: "Portraits & Stories",
              body: "Attach photographs, birth places, and life narratives to each person. Preserve what documents cannot: the texture of a life.",
              icon: <PortraitIcon />,
            },
            {
              num: "III",
              title: "Export & Share",
              body: "Download portrait cards as high-resolution prints. Share your completed tree with family across generations.",
              icon: <ShareIcon />,
            },
          ].map(({ num, title, body, icon }) => (
            <div key={num} className="flex flex-col items-center text-center gap-6 group">
              <div className="relative">
                <span
                  className="font-[family-name:var(--font-display)] text-[5rem] font-light text-[var(--parchment-mid)] leading-none select-none absolute -top-6 -left-4 z-0 group-hover:text-[var(--gold-light)] transition-colors duration-500"
                  aria-hidden
                >
                  {num}
                </span>
                <div className="relative z-10 w-14 h-14 flex items-center justify-center text-[var(--sepia)] group-hover:text-[var(--gold)] transition-colors duration-300">
                  {icon}
                </div>
              </div>
              <div className="h-px w-8 bg-[var(--rule)] group-hover:bg-[var(--gold)] transition-colors duration-300" />
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-light text-[var(--ink)] mb-3">
                  {title}
                </h3>
                <p className="font-[family-name:var(--font-body)] text-base leading-relaxed text-[var(--sepia)]">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ornamental rule ───────────────────────────────────── */}
      <OrnamentalRule />

      {/* ── Tree preview ─────────────────────────────────────── */}
      <section className="px-8 py-24 max-w-5xl mx-auto w-full">
        <div className="flex flex-col items-center mb-16">
          <span className="font-[family-name:var(--font-body)] text-xs tracking-[0.45em] uppercase text-[var(--gold)] mb-4">
            The canvas
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-light text-[var(--ink)] text-center leading-tight">
            See your roots take shape
          </h2>
        </div>

        {/* Mock tree canvas */}
        <div className="relative rounded-sm border border-[var(--rule)] overflow-hidden bg-[var(--parchment)] shadow-[0_4px_40px_rgba(28,21,16,0.08)]">
          {/* Toolbar mock */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--rule)] bg-[var(--parchment-mid)]">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--rule)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--rule)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--rule)]" />
            <div className="ml-auto font-[family-name:var(--font-body)] text-xs text-[var(--rule)] tracking-widest uppercase">
              Müller Family Tree
            </div>
          </div>

          {/* SVG Tree */}
          <div className="flex items-center justify-center py-16 px-8 overflow-x-auto">
            <FamilyTreePreview />
          </div>
        </div>
      </section>

      {/* ── Ornamental rule ───────────────────────────────────── */}
      <OrnamentalRule />

      {/* ── Quote ────────────────────────────────────────────── */}
      <section className="px-8 py-28 max-w-3xl mx-auto w-full text-center">
        <div className="flex items-center justify-center mb-10">
          <QuoteMark />
        </div>
        <blockquote className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-light italic text-[var(--ink)] leading-relaxed mb-10">
          In every conceivable manner, the family is link to our past, bridge to our future.
        </blockquote>
        <div className="flex items-center justify-center gap-5 mb-4">
          <div className="h-px w-10 bg-[var(--rule)]" />
          <span className="font-[family-name:var(--font-body)] text-xs tracking-[0.35em] uppercase text-[var(--sepia)]">
            Alex Haley
          </span>
          <div className="h-px w-10 bg-[var(--rule)]" />
        </div>
      </section>

      {/* ── Ornamental rule ───────────────────────────────────── */}
      <OrnamentalRule />

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="px-8 py-24 max-w-4xl mx-auto w-full">
        <div className="flex flex-col items-center mb-20">
          <span className="font-[family-name:var(--font-body)] text-xs tracking-[0.45em] uppercase text-[var(--gold)] mb-4">
            Getting started
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-light text-[var(--ink)] text-center leading-tight">
            Three steps to your heritage
          </h2>
        </div>

        <div className="flex flex-col gap-0">
          {[
            {
              num: "01",
              title: "Create your tree",
              body: "Name your family tree and place yourself at the center. Your story begins with a single person.",
            },
            {
              num: "02",
              title: "Add relatives",
              body: "Drag handles to add parents, siblings, partners, and children. Fill in dates, places, and photographs.",
            },
            {
              num: "03",
              title: "Share & preserve",
              body: "Export beautiful portrait cards for print, or share your tree link with family members worldwide.",
            },
          ].map(({ num, title, body }, i) => (
            <div key={num} className="flex gap-10 items-start group">
              <div className="flex flex-col items-center">
                <span className="font-[family-name:var(--font-display)] text-4xl font-light text-[var(--gold)] w-16 text-right shrink-0 pt-1">
                  {num}
                </span>
                {i < 2 && <div className="w-px h-20 bg-[var(--parchment-mid)] mt-3" />}
              </div>
              <div className="pb-14">
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-light text-[var(--ink)] mb-3">
                  {title}
                </h3>
                <p className="font-[family-name:var(--font-body)] text-base leading-relaxed text-[var(--sepia)] max-w-md">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="relative mx-8 mb-24 overflow-hidden border border-[var(--rule)]">
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center" aria-hidden>
          <svg width="900" height="400" viewBox="0 0 900 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--ink)] opacity-[0.025]">
            <line x1="450" y1="400" x2="450" y2="220" stroke="currentColor" strokeWidth="3"/>
            <line x1="450" y1="220" x2="250" y2="100" stroke="currentColor" strokeWidth="2.5"/>
            <line x1="450" y1="220" x2="650" y2="100" stroke="currentColor" strokeWidth="2.5"/>
            <line x1="450" y1="290" x2="300" y2="175" stroke="currentColor" strokeWidth="2"/>
            <line x1="450" y1="290" x2="600" y2="175" stroke="currentColor" strokeWidth="2"/>
            <line x1="250" y1="100" x2="150" y2="20" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="250" y1="100" x2="310" y2="20" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="650" y1="100" x2="590" y2="20" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="650" y1="100" x2="750" y2="20" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="150" cy="20" r="6" fill="currentColor"/>
            <circle cx="310" cy="20" r="6" fill="currentColor"/>
            <circle cx="590" cy="20" r="6" fill="currentColor"/>
            <circle cx="750" cy="20" r="6" fill="currentColor"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center py-28 px-8 text-center">
          <span className="font-[family-name:var(--font-body)] text-xs tracking-[0.45em] uppercase text-[var(--gold)] mb-6">
            Begin today
          </span>
          <h2
            className="font-[family-name:var(--font-display)] font-light text-[var(--ink)] leading-none mb-6"
            style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}
          >
            Your story
            <br />
            <em>awaits.</em>
          </h2>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px w-10 bg-[var(--rule)]" />
            <OrnamentDiamond />
            <div className="h-px w-10 bg-[var(--rule)]" />
          </div>
          <p className="font-[family-name:var(--font-body)] text-base leading-relaxed text-[var(--sepia)] max-w-xs mb-12">
            Thousands of ancestors wait to be remembered. Your tree begins with a single name.
          </p>
          <Link
            href="/register"
            className="px-12 py-4 font-[family-name:var(--font-body)] text-sm tracking-[0.2em] uppercase bg-[var(--ink)] text-[var(--parchment)] hover:bg-[var(--gold)] hover:text-[var(--ink)] transition-colors duration-300"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
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

/* ─── Sub-components ────────────────────────────────────────────────────────── */

function OrnamentalRule() {
  return (
    <div className="flex items-center px-10 py-2">
      <div className="flex-1 h-px bg-[var(--rule)]" />
      <div className="mx-5">
        <svg width="28" height="12" viewBox="0 0 28 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 6 L0 0 L0 12 Z" fill="var(--rule)" opacity="0.4" />
          <path d="M14 6 L28 0 L28 12 Z" fill="var(--rule)" opacity="0.4" />
          <circle cx="14" cy="6" r="2" fill="var(--gold)" />
        </svg>
      </div>
      <div className="flex-1 h-px bg-[var(--rule)]" />
    </div>
  );
}

function OrnamentDiamond() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="0.5" width="6.36" height="6.36" rx="0.5" transform="rotate(45 5 0.5)" fill="var(--rule)" />
    </svg>
  );
}

function QuoteMark() {
  return (
    <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 32V18.667C0 8.533 5.333 2.133 16 0L18.667 4C13.6 5.333 10.667 8.8 10.667 12.8H18.667V32H0ZM21.333 32V18.667C21.333 8.533 26.667 2.133 37.333 0L40 4C34.933 5.333 32 8.8 32 12.8H40V32H21.333Z" fill="var(--rule)" />
    </svg>
  );
}

/* ─── Icons ─────────────────────────────────────────────────────────────────── */

function TreeIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="22" y1="44" x2="22" y2="28" />
      <line x1="22" y1="28" x2="11" y2="18" />
      <line x1="22" y1="28" x2="33" y2="18" />
      <line x1="22" y1="34" x2="14" y2="24" />
      <line x1="22" y1="34" x2="30" y2="24" />
      <circle cx="22" cy="10" r="8" />
      <circle cx="8" cy="10" r="7" />
      <circle cx="36" cy="10" r="7" />
    </svg>
  );
}

function PortraitIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="32" height="36" rx="2" />
      <circle cx="22" cy="18" r="6" />
      <path d="M10 40c0-6.627 5.373-12 12-12s12 5.373 12 12" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="34" cy="10" r="6" />
      <circle cx="10" cy="22" r="6" />
      <circle cx="34" cy="34" r="6" />
      <line x1="16" y1="19" x2="28" y2="13" />
      <line x1="16" y1="25" x2="28" y2="31" />
    </svg>
  );
}

/* ─── Tree watermark ─────────────────────────────────────────────────────────── */

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
      style={{ opacity: 0.06 }}
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

/* ─── Family tree preview ─────────────────────────────────────────────────────── */

type PersonCardProps = {
  x: number;
  y: number;
  name: string;
  years: string;
  gender?: "m" | "f";
};

function PersonCard({ x, y, name, years, gender = "m" }: PersonCardProps) {
  const accent = gender === "f" ? "#C4A252" : "#7D6545";
  return (
    <g>
      <rect x={x} y={y} width="120" height="58" rx="3" fill="#F2EDE3" stroke="#D4C9B5" strokeWidth="1" />
      <rect x={x} y={y} width="3" height="58" rx="1" fill={accent} />
      <circle cx={x + 22} cy={y + 20} r="10" fill="#E8E0D0" stroke="#D4C9B5" strokeWidth="0.75" />
      <line x1={x + 22} y1={y + 13} x2={x + 22} y2={y + 27} stroke={accent} strokeWidth="0.75" opacity="0.4" />
      <line x1={x + 15} y1={y + 20} x2={x + 29} y2={y + 20} stroke={accent} strokeWidth="0.75" opacity="0.4" />
      <text x={x + 38} y={y + 22} fontFamily="Georgia, serif" fontSize="9.5" fill="#1C1510" fontWeight="300">{name.split(" ")[0]}</text>
      <text x={x + 38} y={y + 33} fontFamily="Georgia, serif" fontSize="9.5" fill="#1C1510" fontWeight="300">{name.split(" ").slice(1).join(" ")}</text>
      <text x={x + 38} y={y + 46} fontFamily="Georgia, serif" fontSize="7.5" fill="#7D6545">{years}</text>
    </g>
  );
}

function UnionDot({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="5" fill="#D4C9B5" stroke="#F2EDE3" strokeWidth="1.5" />
    </g>
  );
}

function FamilyTreePreview() {
  const W = 760;
  const H = 360;

  const grandpa1 = { x: 40, y: 20, name: "Karl Müller", years: "1891 – 1968" };
  const grandma1 = { x: 40, y: 100, name: "Maria Bauer", years: "1895 – 1972", gender: "f" as const };
  const grandpa2 = { x: 600, y: 20, name: "Hans Weber", years: "1888 – 1961" };
  const grandma2 = { x: 600, y: 100, name: "Anna Klein", years: "1892 – 1975", gender: "f" as const };

  const father = { x: 220, y: 160, name: "Wilhelm Müller", years: "1920 – 1990" };
  const mother = { x: 420, y: 160, name: "Else Weber", years: "1924 – 2003", gender: "f" as const };

  const child1 = { x: 100, y: 275, name: "Ernst Müller", years: "1948 – " };
  const child2 = { x: 300, y: 275, name: "Lotte Müller", years: "1951 – ", gender: "f" as const };
  const child3 = { x: 500, y: 275, name: "Franz Müller", years: "1955 – " };

  const g1UnionX = 160;
  const g1UnionY = 58;
  const g2UnionX = 600;
  const g2UnionY = 58;
  const parentUnionX = 380;
  const parentUnionY = 218;

  const nodeW = 120;
  const nodeH = 58;
  const midX = (n: { x: number }) => n.x + nodeW / 2;
  const botY = (n: { y: number }) => n.y + nodeH;
  const topY = (n: { y: number }) => n.y;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: "100%" }}
    >
      {/* G1 union lines */}
      <line x1={midX(grandpa1)} y1={botY(grandpa1)} x2={g1UnionX} y2={g1UnionY} stroke="#D4C9B5" strokeWidth="1" />
      <line x1={midX(grandma1)} y1={topY(grandma1)} x2={g1UnionX} y2={g1UnionY} stroke="#D4C9B5" strokeWidth="1" />
      {/* G1 union → father */}
      <line x1={g1UnionX} y1={g1UnionY} x2={midX(father)} y2={topY(father)} stroke="#D4C9B5" strokeWidth="1" />

      {/* G2 union lines */}
      <line x1={midX(grandpa2)} y1={botY(grandpa2)} x2={g2UnionX} y2={g2UnionY} stroke="#D4C9B5" strokeWidth="1" />
      <line x1={midX(grandma2)} y1={topY(grandma2)} x2={g2UnionX} y2={g2UnionY} stroke="#D4C9B5" strokeWidth="1" />
      {/* G2 union → mother */}
      <line x1={g2UnionX} y1={g2UnionY} x2={midX(mother)} y2={topY(mother)} stroke="#D4C9B5" strokeWidth="1" />

      {/* Parent union lines */}
      <line x1={midX(father)} y1={botY(father)} x2={parentUnionX} y2={parentUnionY} stroke="#D4C9B5" strokeWidth="1" />
      <line x1={midX(mother)} y1={botY(mother)} x2={parentUnionX} y2={parentUnionY} stroke="#D4C9B5" strokeWidth="1" />

      {/* Parent union → children */}
      <line x1={parentUnionX} y1={parentUnionY} x2={midX(child1)} y2={topY(child1)} stroke="#D4C9B5" strokeWidth="1" />
      <line x1={parentUnionX} y1={parentUnionY} x2={midX(child2)} y2={topY(child2)} stroke="#D4C9B5" strokeWidth="1" />
      <line x1={parentUnionX} y1={parentUnionY} x2={midX(child3)} y2={topY(child3)} stroke="#D4C9B5" strokeWidth="1" />

      {/* Grandparent generation */}
      <PersonCard {...grandpa1} />
      <PersonCard {...grandma1} />
      <PersonCard {...grandpa2} />
      <PersonCard {...grandma2} />

      {/* Union dots */}
      <UnionDot x={g1UnionX} y={g1UnionY} />
      <UnionDot x={g2UnionX} y={g2UnionY} />

      {/* Parent generation */}
      <PersonCard {...father} />
      <PersonCard {...mother} />

      <UnionDot x={parentUnionX} y={parentUnionY} />

      {/* Children generation */}
      <PersonCard {...child1} />
      <PersonCard {...child2} />
      <PersonCard {...child3} />

      {/* Generation labels */}
      <text x="8" y={grandpa1.y + 30} fontFamily="Georgia, serif" fontSize="7" fill="#D4C9B5" transform="rotate(-90, 8, 40)">Grandparents</text>
      <text x="8" y={father.y + 30} fontFamily="Georgia, serif" fontSize="7" fill="#D4C9B5" transform="rotate(-90, 8, 180)">Parents</text>
      <text x="8" y={child1.y + 30} fontFamily="Georgia, serif" fontSize="7" fill="#D4C9B5" transform="rotate(-90, 8, 295)">Children</text>
    </svg>
  );
}
