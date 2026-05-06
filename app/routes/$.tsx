import { Link } from "react-router";

function IslandIllustration() {
  return (
    <svg viewBox="0 0 560 480" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 560, height: "auto" }}>
      <defs>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#fbbf24" stopOpacity="0.55"/>
          <stop offset="50%" stopColor="#f97316" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="wg" cx="42%" cy="30%" r="70%">
          <stop offset="0%"  stopColor="#2dd4bf"/>
          <stop offset="55%" stopColor="#0d9488"/>
          <stop offset="100%" stopColor="#0f766e"/>
        </radialGradient>
        <linearGradient id="ig" x1=".5" y1="0" x2=".5" y2="1">
          <stop offset="0%"   stopColor="#86efac"/>
          <stop offset="45%"  stopColor="#22c55e"/>
          <stop offset="100%" stopColor="#14532d"/>
        </linearGradient>
        <linearGradient id="tg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#fde68a"/>
          <stop offset="45%"  stopColor="#d97706"/>
          <stop offset="100%" stopColor="#92400e"/>
        </linearGradient>
        <linearGradient id="la" x1="0" y1=".5" x2="1" y2=".5">
          <stop offset="0%"   stopColor="#d1fae5"/>
          <stop offset="55%"  stopColor="#22c55e"/>
          <stop offset="100%" stopColor="#14532d"/>
        </linearGradient>
        <linearGradient id="lb" x1="0" y1=".5" x2="1" y2=".5">
          <stop offset="0%"   stopColor="#bbf7d0"/>
          <stop offset="55%"  stopColor="#16a34a"/>
          <stop offset="100%" stopColor="#14532d"/>
        </linearGradient>
        <linearGradient id="wdv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fde68a"/>
          <stop offset="100%" stopColor="#b45309"/>
        </linearGradient>
        <linearGradient id="wdh" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#fde68a"/>
          <stop offset="100%" stopColor="#b45309"/>
        </linearGradient>
        <radialGradient id="coc" cx="35%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#a16207"/>
          <stop offset="100%" stopColor="#3b1a00"/>
        </radialGradient>
        <pattern id="sp" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="5" fill="#ef4444"/>
          <rect y="5" width="10" height="5" fill="#fef9c3"/>
        </pattern>
        <filter id="ds">
          <feDropShadow dx="0" dy="14" stdDeviation="20" floodColor="#00000035"/>
        </filter>
        <filter id="dsm">
          <feDropShadow dx="0" dy="7"  stdDeviation="10" floodColor="#00000025"/>
        </filter>
        <filter id="dss">
          <feDropShadow dx="0" dy="3"  stdDeviation="5"  floodColor="#00000018"/>
        </filter>
      </defs>

      {/* Sun glow */}
      <circle cx="400" cy="130" r="110" fill="url(#sun)"/>
      <circle cx="400" cy="130" r="50"  fill="#fbbf24" opacity="0.08"/>

      {/* Stars */}
      {([[55,55],[130,30],[225,52],[315,38],[430,25],[480,62],[78,105],[438,88],[42,148],[168,118],[350,78],[500,110]] as [number,number][]).map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%4===0?2.2:i%3===0?1.6:1.1}
          fill="white" opacity={0.35+((i*37)%10)*0.05}/>
      ))}

      {/* Birds */}
      <path d="M348,82 Q355,76 362,82 Q369,76 376,82" stroke="rgba(255,255,255,0.38)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M380,62 Q386,57 392,62 Q398,57 404,62" stroke="rgba(255,255,255,0.28)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M430,90 Q434,86 438,90 Q442,86 446,90" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" fill="none" strokeLinecap="round"/>

      {/* Water — deep layer */}
      <ellipse cx="270" cy="432" rx="228" ry="58" fill="#0c6e68" opacity="0.45"/>
      {/* Water — main */}
      <ellipse cx="268" cy="420" rx="222" ry="55" fill="url(#wg)" filter="url(#ds)"/>
      {/* Water highlights */}
      <ellipse cx="224" cy="395" rx="110" ry="26" fill="rgba(255,255,255,0.20)"/>
      <ellipse cx="315" cy="428" rx="70"  ry="12" fill="rgba(255,255,255,0.12)"/>
      <ellipse cx="168" cy="420" rx="42"  ry="7"  fill="rgba(255,255,255,0.09)"/>
      <ellipse cx="360" cy="415" rx="30"  ry="5"  fill="rgba(255,255,255,0.07)"/>

      {/* Island — shadow cast on water */}
      <ellipse cx="268" cy="386" rx="155" ry="16" fill="#0a5c57" opacity="0.30"/>
      {/* Island */}
      <ellipse cx="268" cy="372" rx="155" ry="50" fill="url(#ig)" filter="url(#dsm)"/>
      {/* Island top highlight */}
      <ellipse cx="236" cy="344" rx="85"  ry="24" fill="rgba(255,255,255,0.28)"/>
      {/* Island lower shadow */}
      <ellipse cx="274" cy="408" rx="142" ry="16" fill="#15803d" opacity="0.18"/>

      {/* Palm trunk */}
      <path
        d="M208,378 C203,340 206,298 203,264
           C202,238 193,208 197,180
           L212,175 C210,204 218,234 220,260
           C223,294 220,338 226,375 Z"
        fill="url(#tg)" filter="url(#dss)"
      />
      <path
        d="M210,378 C206,340 208,298 206,264
           C205,239 197,210 200,181
           L205,178 C203,207 211,237 212,262
           C215,296 212,340 218,376 Z"
        fill="rgba(255,255,255,0.22)"
      />
      {/* Trunk rings */}
      {[196,220,246,274,306,336,360].map((y,i)=>(
        <line key={y} x1={200+i*0.4} y1={y} x2={215+i*0.5} y2={y-1}
          stroke="#92400e" strokeWidth="2.5" opacity="0.38" strokeLinecap="round"/>
      ))}

      {/* Coconuts */}
      <circle cx="213" cy="188" r="10"  fill="url(#coc)" filter="url(#dss)"/>
      <circle cx="200" cy="182" r="9"   fill="url(#coc)" filter="url(#dss)"/>
      <circle cx="207" cy="178" r="8.5" fill="url(#coc)" filter="url(#dss)"/>
      {/* Coconut highlights */}
      <circle cx="210" cy="185" r="3"   fill="rgba(255,255,255,0.22)"/>
      <circle cx="197" cy="179" r="2.5" fill="rgba(255,255,255,0.22)"/>

      {/* Palm leaves — 7 */}
      {([
        { r:-172, g:"la", o:0.86, w:118 },
        { r:-136, g:"lb", o:0.90, w:125 },
        { r: -98, g:"la", o:0.96, w:128 },
        { r: -60, g:"lb", o:0.93, w:124 },
        { r: -24, g:"la", o:0.97, w:120 },
        { r:  14, g:"lb", o:0.84, w:110 },
        { r:-210, g:"la", o:0.70, w: 96 },
      ] as {r:number;g:string;o:number;w:number}[]).map(({r,g,o,w})=>(
        <g key={r} transform={`translate(205,176) rotate(${r})`}>
          <path d={`M0,0 Q${w*.52},-${w*.27} ${w},-${w*.13} Q${w*.82},${w*.18} 0,0Z`}
            fill={`url(#${g})`} opacity={o}/>
          <line x1="2" y1="-1" x2={w-12} y2={-(w*.08)}
            stroke="#14532d" strokeWidth="1.4" opacity="0.24" strokeLinecap="round"/>
          <line x1={w*.3} y1={-(w*.13)} x2={w*.32} y2={-(w*.25)}
            stroke="#14532d" strokeWidth="0.9" opacity="0.18" strokeLinecap="round"/>
          <line x1={w*.6} y1={-(w*.12)} x2={w*.63} y2={-(w*.24)}
            stroke="#14532d" strokeWidth="0.9" opacity="0.18" strokeLinecap="round"/>
        </g>
      ))}

      {/* Beach chair — legs */}
      <line x1="300" y1="370" x2="285" y2="388" stroke="url(#wdv)" strokeWidth="7.5" strokeLinecap="round"/>
      <line x1="340" y1="370" x2="325" y2="388" stroke="url(#wdv)" strokeWidth="7.5" strokeLinecap="round"/>
      <line x1="300" y1="370" x2="310" y2="388" stroke="url(#wdh)" strokeWidth="7.5" strokeLinecap="round"/>
      <line x1="340" y1="370" x2="350" y2="388" stroke="url(#wdh)" strokeWidth="7.5" strokeLinecap="round"/>
      {/* Cross brace */}
      <line x1="288" y1="382" x2="310" y2="376" stroke="#b45309" strokeWidth="4" opacity="0.55" strokeLinecap="round"/>
      <line x1="328" y1="382" x2="350" y2="376" stroke="#b45309" strokeWidth="4" opacity="0.55" strokeLinecap="round"/>

      {/* Seat */}
      <polygon points="294,358 358,360 361,372 294,370" fill="url(#sp)" filter="url(#dss)"/>
      <polygon points="294,358 358,360 361,372 294,370"
        fill="none" stroke="#c2651a" strokeWidth="2.5" strokeLinejoin="round"/>
      <line x1="296" y1="360" x2="356" y2="362" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Back */}
      <polygon points="288,326 336,326 340,358 294,358" fill="url(#sp)" filter="url(#dss)"/>
      <polygon points="288,326 336,326 340,358 294,358"
        fill="none" stroke="#c2651a" strokeWidth="2.5" strokeLinejoin="round"/>
      <line x1="290" y1="328" x2="334" y2="328" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="288" y1="326" x2="294" y2="358" stroke="url(#wdv)" strokeWidth="6" strokeLinecap="round"/>
      <line x1="336" y1="326" x2="340" y2="358" stroke="url(#wdv)" strokeWidth="6" strokeLinecap="round"/>
      <line x1="288" y1="326" x2="336" y2="326" stroke="url(#wdh)" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-gray-50 text-gray-900">

      {/* ── Ambient glows ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle,var(--primary),transparent)" }}/>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-8"
          style={{ background: "radial-gradient(circle,#0d9488,transparent)" }}/>
        <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full blur-3xl opacity-6"
          style={{ background: "radial-gradient(circle,#6366f1,transparent)" }}/>
      </div>

      {/* ── Left — text panel ── */}
      <div className="relative z-10 flex flex-col justify-center px-10 py-16 lg:px-20 lg:py-0 lg:w-[46%]">

        {/* Brand */}
        <div className="mb-12 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-500 tracking-widest uppercase">Gravity Gym</span>
        </div>

        {/* 404 */}
        <div className="relative mb-6">
          <p
            className="text-[clamp(96px,14vw,160px)] font-black leading-none tracking-tighter"
            style={{
              background: "linear-gradient(135deg,#fbbf24 0%,#f97316 45%,#ef4444 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 40px rgba(249,115,22,0.35))",
            }}
          >
            404
          </p>
          {/* Glow behind number */}
          <div className="absolute inset-0 pointer-events-none blur-3xl opacity-20"
            style={{ background: "linear-gradient(135deg,#fbbf24,#f97316,#ef4444)" }}/>
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(26px,4vw,42px)] font-black text-gray-900 leading-tight tracking-tight mb-4">
          Stranded on a<br/>
          <span style={{
            background: "linear-gradient(90deg,#f59e0b,#f97316)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            desert island
          </span>
        </h1>

        {/* Description */}
        <p className="text-gray-500 text-base leading-relaxed max-w-sm mb-10">
          The page you're looking for doesn't exist or has been moved. Let's get you back to dry land.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/"
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg,#f59e0b,#f97316,#ef4444)",
              boxShadow: "0 8px 28px rgba(249,115,22,0.40), 0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Back to home
          </Link>

          <Link to="/members"
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            View members
          </Link>
        </div>

        {/* Divider + nav hint */}
        <div className="mt-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200"/>
          <span className="text-xs text-gray-400 tracking-widest uppercase">Error 404</span>
          <div className="h-px flex-1 bg-gray-200"/>
        </div>
      </div>

      {/* ── Right — illustration panel ── */}
      <div className="relative z-10 flex items-center justify-center lg:w-[54%] py-8 lg:py-0 lg:min-h-screen">
        {/* Island orange glow */}
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle,#f97316,#fbbf24,transparent)" }}/>
        {/* Teal glow from water */}
        <div className="absolute bottom-24 w-80 h-48 rounded-full blur-3xl opacity-12 pointer-events-none"
          style={{ background: "radial-gradient(ellipse,#0d9488,transparent)" }}/>

        {/* The SVG — floating */}
        <div className="w-full max-w-xl px-6 lg:px-10"
          style={{ animation: "float 6s ease-in-out infinite" }}>
          <IslandIllustration />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-18px) rotate(0.4deg); }
          66%      { transform: translateY(-10px) rotate(-0.3deg); }
        }
      `}</style>
    </div>
  );
}
