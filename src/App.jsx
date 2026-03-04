import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════════════════ */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@200;300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --black:#0a0908; --charcoal:#141210; --dark:#1c1916; --mid:#2e2a25;
    --cream:#f5f0e8; --warm:#e8dfd0; --muted:#9a8f82;
    --rust:#c4622d; --gold:#c9a84c; --terracotta:#d4845a;
  }
  html { scroll-behavior:smooth; }
  body { background:var(--black); color:var(--cream); font-family:'Outfit',sans-serif; overflow-x:hidden; cursor:none; }

  /* ── CURSOR ── */
  #cursor { position:fixed; width:10px; height:10px; background:var(--rust); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition:width .3s,height .3s,background .3s; mix-blend-mode:screen; }
  #cursor-ring { position:fixed; width:36px; height:36px; border:1px solid rgba(196,98,45,.5); border-radius:50%; pointer-events:none; z-index:9998; transform:translate(-50%,-50%); transition:all .15s ease-out; }
  body:has(a:hover) #cursor, body:has(button:hover) #cursor { width:20px; height:20px; background:var(--gold); }
  body:has(a:hover) #cursor-ring, body:has(button:hover) #cursor-ring { width:54px; height:54px; border-color:var(--gold); }

  /* ── SCROLL PATH RAIL ── */
  #scroll-rail {
    position:fixed; left:22px; top:0; width:44px; height:100vh;
    z-index:50; pointer-events:none;
    opacity:0; transition:opacity 1s ease;
  }
  #scroll-rail.visible { opacity:1; }
  #scroll-rail svg { width:100%; height:100%; overflow:visible; }
  .rail-glow {
    filter:drop-shadow(0 0 6px rgba(196,98,45,.7));
  }
  .rail-dot {
    fill:var(--rust);
    filter:drop-shadow(0 0 8px rgba(196,98,45,1));
    transition:opacity .3s;
  }
  .rail-dot-ring {
    fill:none; stroke:rgba(196,98,45,.4); stroke-width:1;
  }
  @keyframes dotPulse { 0%,100%{r:3px} 50%{r:5px} }
  @keyframes ringPulse { 0%,100%{r:7px;opacity:.6} 50%{r:10px;opacity:0} }

  /* ── NAV ── */
  nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:28px 60px; transition:background .5s,padding .4s; }
  nav.scrolled { background:rgba(10,9,8,.92); backdrop-filter:blur(16px); padding:18px 60px; border-bottom:1px solid rgba(196,98,45,.15); }
  .nav-logo { font-family:'Cormorant Garamond',serif; font-size:1.1rem; font-weight:300; letter-spacing:.35em; text-transform:uppercase; color:var(--cream); text-decoration:none; }
  .nav-links { display:flex; gap:40px; list-style:none; }
  .nav-links a { font-size:.72rem; letter-spacing:.18em; text-transform:uppercase; color:var(--muted); text-decoration:none; position:relative; transition:color .3s; }
  .nav-links a::after { content:''; position:absolute; bottom:-4px; left:0; width:0; height:1px; background:var(--rust); transition:width .35s ease; }
  .nav-links a:hover { color:var(--cream); }
  .nav-links a:hover::after { width:100%; }

  /* ── HERO ── */
  #hero { min-height:100vh; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; background:radial-gradient(ellipse 120% 80% at 60% 40%,#1e1510 0%,#0a0908 70%); }
  #particle-canvas { position:absolute; inset:0; pointer-events:none; opacity:.5; }
  .sculpture-container { position:absolute; right:-80px; top:50%; transform:translateY(-50%); width:min(600px,55vw); opacity:0; animation:fadeIn 1.4s .4s forwards; }
  .sculpture-container svg { width:100%; height:auto; filter:drop-shadow(0 0 60px rgba(196,98,45,.2)); }
  .hero-content { position:relative; z-index:2; text-align:center; padding:0 40px; max-width:900px; }
  .hero-eyebrow { font-size:.68rem; letter-spacing:.4em; text-transform:uppercase; color:var(--rust); margin-bottom:28px; opacity:0; animation:fadeUp .9s .3s forwards; }
  .hero-h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(3.2rem,8vw,7.5rem); font-weight:300; line-height:1.0; color:var(--cream); opacity:0; animation:fadeUp 1s .6s forwards; }
  .hero-h1 em { font-style:italic; color:var(--terracotta); }
  .hero-subtitle { margin-top:32px; font-size:.9rem; font-weight:200; letter-spacing:.12em; color:var(--muted); opacity:0; animation:fadeUp .9s .9s forwards; }
  .hero-cta { margin-top:56px; display:inline-flex; align-items:center; gap:14px; padding:16px 40px; border:1px solid rgba(196,98,45,.5); color:var(--cream); text-decoration:none; font-size:.72rem; letter-spacing:.25em; text-transform:uppercase; opacity:0; animation:fadeUp .9s 1.2s forwards; transition:background .35s,border-color .35s; cursor:none; }
  .hero-cta:hover { background:rgba(196,98,45,.15); border-color:var(--rust); }
  .hero-cta svg { transition:transform .3s; }
  .hero-cta:hover svg { transform:translateX(6px); }
  .scroll-indicator { position:absolute; bottom:48px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:8px; opacity:0; animation:fadeIn 1s 1.8s forwards; }
  .scroll-indicator span { font-size:.6rem; letter-spacing:.3em; text-transform:uppercase; color:var(--muted); }
  .scroll-line { width:1px; height:60px; background:linear-gradient(to bottom,var(--rust),transparent); animation:scrollPulse 2s infinite; }

  /* ── ANIMATED DIVIDER ── */
  .anim-divider { display:block; width:100%; overflow:visible; margin:0; padding:0; }
  .anim-divider path { stroke-dasharray:var(--path-len,2000); stroke-dashoffset:var(--path-len,2000); transition:stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1); }
  .anim-divider.drawn path { stroke-dashoffset:0; }

  /* ── DRAW PATH (section decorations) ── */
  .draw-path-wrap { position:absolute; pointer-events:none; }
  .draw-path-wrap path, .draw-path-wrap polyline, .draw-path-wrap ellipse {
    stroke-dasharray:var(--L,3000);
    stroke-dashoffset:var(--L,3000);
  }
  .draw-path-wrap.drawn path,
  .draw-path-wrap.drawn polyline,
  .draw-path-wrap.drawn ellipse {
    stroke-dashoffset:0;
  }
  /* Each child can have its own duration + delay via inline style */

  /* ── CONTACT SIGNATURE ── */
  .signature-wrap { display:flex; justify-content:center; margin-top:28px; }
  .signature-wrap svg path {
    stroke-dasharray:var(--L,800);
    stroke-dashoffset:var(--L,800);
  }
  .signature-wrap.drawn svg path { stroke-dashoffset:0; }

  /* ── SECTION / REVEAL ── */
  section { padding:140px 60px; }
  .section-label { font-size:.65rem; letter-spacing:.4em; text-transform:uppercase; color:var(--rust); margin-bottom:20px; display:flex; align-items:center; gap:16px; }
  .section-label::before { content:''; width:40px; height:1px; background:var(--rust); }
  .section-h2 { font-family:'Cormorant Garamond',serif; font-size:clamp(2.8rem,5vw,5rem); font-weight:300; line-height:1.1; color:var(--cream); margin-bottom:24px; }
  .section-h2 em { font-style:italic; color:var(--terracotta); }
  .reveal { opacity:0; transform:translateY(50px); transition:opacity .9s ease,transform .9s ease; }
  .reveal.visible { opacity:1; transform:none; }
  .reveal-left { opacity:0; transform:translateX(-60px); transition:opacity .9s ease,transform .9s ease; }
  .reveal-left.visible { opacity:1; transform:none; }
  .reveal-right { opacity:0; transform:translateX(60px); transition:opacity .9s ease,transform .9s ease; }
  .reveal-right.visible { opacity:1; transform:none; }
  .stagger > * { opacity:0; transform:translateY(30px); transition:opacity .7s ease,transform .7s ease; }
  .stagger.visible > *:nth-child(1) { opacity:1; transform:none; transition-delay:.1s; }
  .stagger.visible > *:nth-child(2) { opacity:1; transform:none; transition-delay:.25s; }
  .stagger.visible > *:nth-child(3) { opacity:1; transform:none; transition-delay:.4s; }
  .stagger.visible > *:nth-child(4) { opacity:1; transform:none; transition-delay:.55s; }
  .stagger.visible > *:nth-child(5) { opacity:1; transform:none; transition-delay:.7s; }
  .stagger.visible > *:nth-child(6) { opacity:1; transform:none; transition-delay:.85s; }

  /* ── ABOUT ── */
  .about-text { font-size:1.05rem; font-weight:300; line-height:1.9; color:var(--warm); opacity:.85; margin-bottom:24px; }
  .about-stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:2px; margin-top:60px; }
  .about-stat { background:var(--mid); padding:32px 28px; }
  .about-stat-num { font-family:'Cormorant Garamond',serif; font-size:3.5rem; font-weight:300; color:var(--rust); line-height:1; }
  .about-stat-label { font-size:.65rem; letter-spacing:.2em; text-transform:uppercase; color:var(--muted); margin-top:6px; }
  .statement-block { padding:48px; border-left:2px solid var(--rust); background:rgba(196,98,45,.05); margin-bottom:40px; }
  .statement-text { font-family:'Cormorant Garamond',serif; font-size:1.5rem; font-weight:300; font-style:italic; line-height:1.6; color:var(--cream); }

  /* ── HORIZONTAL GALLERY ── */
  .hg-outer { position:relative; overflow:hidden; }
  .hg-header { padding:100px 60px 50px; display:flex; justify-content:space-between; align-items:flex-end; }
  .hg-hint { display:flex; align-items:center; gap:12px; font-size:.68rem; letter-spacing:.22em; text-transform:uppercase; color:var(--muted); }
  .hg-hint-arrow { animation:hintBounce 2s ease-in-out infinite; }
  .hg-sticky { position:sticky; top:0; height:100vh; overflow:hidden; display:flex; align-items:center; }
  .hg-track { display:flex; gap:20px; padding:0 60px; will-change:transform; }
  .hg-card { flex-shrink:0; width:clamp(300px,36vw,540px); height:66vh; position:relative; overflow:hidden; background:var(--mid); }
  .hg-card-visual { width:100%; height:100%; transition:transform .8s cubic-bezier(.25,.46,.45,.94); }
  .hg-card:hover .hg-card-visual { transform:scale(1.06); }
  .hg-card-info { position:absolute; bottom:0; left:0; right:0; padding:32px 28px; background:linear-gradient(to top,rgba(10,9,8,.92) 0%,transparent 100%); transform:translateY(8px); transition:transform .4s ease; }
  .hg-card:hover .hg-card-info { transform:none; }
  .hg-card-num { font-family:'Cormorant Garamond',serif; font-size:.8rem; color:var(--rust); letter-spacing:.3em; margin-bottom:8px; }
  .hg-card-title { font-family:'Cormorant Garamond',serif; font-size:1.55rem; font-weight:300; color:var(--cream); line-height:1.2; margin-bottom:5px; }
  .hg-card-sub { font-size:.7rem; color:var(--muted); letter-spacing:.1em; text-transform:uppercase; }
  .hg-bar-track { position:absolute; bottom:0; left:0; right:0; height:2px; background:rgba(255,255,255,.07); }
  .hg-bar { height:100%; width:0%; }

  /* ── PORTFOLIO ── */
  #portfolio { background:var(--black); }
  .portfolio-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:70px; }
  .portfolio-filter { display:flex; gap:2px; }
  .filter-btn { background:var(--mid); border:none; color:var(--muted); font-family:'Outfit',sans-serif; font-size:.65rem; letter-spacing:.22em; text-transform:uppercase; padding:12px 22px; cursor:none; transition:background .3s,color .3s; }
  .filter-btn.active,.filter-btn:hover { background:var(--rust); color:var(--cream); }
  .portfolio-masonry { columns:3; column-gap:3px; }
  .portfolio-item { break-inside:avoid; margin-bottom:3px; overflow:hidden; position:relative; cursor:none; }
  .art-placeholder { width:100%; height:300px; background:var(--mid); display:flex; align-items:center; justify-content:center; transition:transform .7s cubic-bezier(.25,.46,.45,.94); }
  .portfolio-item:nth-child(2) .art-placeholder { height:420px; }
  .portfolio-item:nth-child(4) .art-placeholder { height:360px; }
  .portfolio-item:nth-child(5) .art-placeholder { height:280px; }
  .portfolio-item:nth-child(6) .art-placeholder { height:460px; }
  .portfolio-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(10,9,8,.9) 0%,transparent 60%); opacity:0; transition:opacity .4s ease; display:flex; align-items:flex-end; padding:28px; }
  .portfolio-item:hover .portfolio-overlay { opacity:1; }
  .portfolio-item:hover .art-placeholder { transform:scale(1.04); }
  .overlay-title { font-family:'Cormorant Garamond',serif; font-size:1.3rem; font-weight:300; color:var(--cream); }
  .overlay-year { font-size:.7rem; color:var(--rust); letter-spacing:.15em; margin-top:4px; }
  .portfolio-expand { position:absolute; top:20px; right:20px; width:40px; height:40px; background:rgba(196,98,45,.9); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .4s; cursor:none; }
  .portfolio-item:hover .portfolio-expand { opacity:1; }

  /* ── MODAL ── */
  .modal-bg { position:fixed; inset:0; background:rgba(10,9,8,.96); z-index:200; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity .4s; backdrop-filter:blur(12px); }
  .modal-bg.open { opacity:1; pointer-events:all; }
  .modal-inner { max-width:800px; width:90%; transform:scale(.92) translateY(30px); transition:transform .45s cubic-bezier(.22,.68,0,1.2); }
  .modal-bg.open .modal-inner { transform:none; }
  .modal-art { width:100%; background:var(--mid); display:flex; align-items:center; justify-content:center; aspect-ratio:4/3; overflow:hidden; }
  .modal-meta { padding:28px 0; display:flex; justify-content:space-between; align-items:center; }
  .modal-title { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:300; color:var(--cream); }
  .modal-close { background:none; border:1px solid var(--mid); color:var(--muted); font-family:'Outfit',sans-serif; font-size:.7rem; letter-spacing:.2em; text-transform:uppercase; padding:10px 20px; cursor:none; transition:border-color .3s,color .3s; }
  .modal-close:hover { border-color:var(--rust); color:var(--cream); }

  /* ── TIMELINE ── */
  .timeline-header { max-width:700px; margin-bottom:80px; }
  .timeline-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:2px; }
  .timeline-card { background:var(--mid); padding:44px 36px; position:relative; overflow:hidden; transition:transform .4s ease; cursor:none; }
  .timeline-card::before { content:''; position:absolute; bottom:0; left:0; width:100%; height:2px; background:linear-gradient(90deg,var(--rust),var(--gold)); transform:scaleX(0); transform-origin:left; transition:transform .5s ease; }
  .timeline-card:hover { transform:translateY(-6px); }
  .timeline-card:hover::before { transform:scaleX(1); }
  .card-year { font-family:'Cormorant Garamond',serif; font-size:3rem; font-weight:300; color:rgba(196,98,45,.25); position:absolute; top:24px; right:28px; line-height:1; }
  .card-tag { font-size:.6rem; letter-spacing:.28em; text-transform:uppercase; color:var(--rust); margin-bottom:16px; }
  .card-title { font-family:'Cormorant Garamond',serif; font-size:1.4rem; font-weight:400; color:var(--cream); margin-bottom:12px; line-height:1.3; }
  .card-desc { font-size:.82rem; font-weight:300; color:var(--muted); line-height:1.7; }

  /* ── COLLECTIONS ── */
  .collections-marquee { overflow:hidden; margin-top:70px; padding:24px 0; border-top:1px solid rgba(255,255,255,.06); border-bottom:1px solid rgba(255,255,255,.06); }
  .marquee-track { display:flex; gap:80px; animation:marquee 22s linear infinite; white-space:nowrap; }
  .marquee-item { font-family:'Cormorant Garamond',serif; font-size:1.1rem; font-style:italic; color:var(--muted); flex-shrink:0; display:flex; align-items:center; gap:80px; }
  .marquee-item::after { content:'◆'; font-style:normal; font-size:.5rem; color:var(--rust); }
  .collections-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; margin-top:80px; }
  .collection-card { background:var(--dark); padding:48px 40px; border-top:2px solid transparent; transition:border-color .3s,background .3s; cursor:none; }
  .collection-card:hover { border-color:var(--rust); background:var(--mid); }
  .collection-icon { margin-bottom:24px; font-size:2rem; }
  .collection-name { font-family:'Cormorant Garamond',serif; font-size:1.35rem; font-weight:400; color:var(--cream); margin-bottom:12px; }
  .collection-loc { font-size:.75rem; letter-spacing:.15em; text-transform:uppercase; color:var(--muted); }

  /* ── CONTACT ── */
  #contact { background:var(--dark); text-align:center; padding:160px 60px; }
  .contact-h2 { font-family:'Cormorant Garamond',serif; font-size:clamp(3rem,7vw,7rem); font-weight:300; line-height:1; color:var(--cream); margin-bottom:40px; }
  .contact-h2 em { font-style:italic; color:var(--terracotta); }
  .contact-sub { font-size:.9rem; color:var(--muted); font-weight:200; margin-bottom:60px; letter-spacing:.05em; }
  .contact-email { display:inline-block; font-family:'Cormorant Garamond',serif; font-size:clamp(1.3rem,3vw,2.2rem); font-weight:300; color:var(--cream); text-decoration:none; border-bottom:1px solid rgba(196,98,45,.5); padding-bottom:8px; transition:color .3s,border-color .3s; cursor:none; }
  .contact-email:hover { color:var(--terracotta); border-color:var(--terracotta); }

  /* ── FOOTER ── */
  footer { background:var(--black); padding:60px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,.06); }
  .footer-logo { font-family:'Cormorant Garamond',serif; font-size:.95rem; font-weight:300; letter-spacing:.3em; text-transform:uppercase; color:var(--muted); }
  .footer-copy { font-size:.65rem; color:rgba(154,143,130,.5); letter-spacing:.1em; }
  .footer-socials { display:flex; gap:20px; }
  .social-link { width:42px; height:42px; border:1px solid rgba(255,255,255,.1); display:flex; align-items:center; justify-content:center; color:var(--muted); text-decoration:none; transition:border-color .3s,color .3s,transform .3s; cursor:none; }
  .social-link:hover { border-color:var(--rust); color:var(--rust); transform:translateY(-4px); }

  /* ── KEYFRAMES ── */
  @keyframes fadeUp   { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes scrollPulse { 0%,100%{opacity:.3} 50%{opacity:1} }
  @keyframes marquee  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
  @keyframes hintBounce { 0%,100%{transform:translateX(0)} 50%{transform:translateX(10px)} }

  @media(max-width:900px){
    nav{padding:20px 28px} nav.scrolled{padding:14px 28px}
    section{padding:90px 28px}
    .portfolio-masonry{columns:2}
    .collections-grid{grid-template-columns:1fr 1fr}
    .portfolio-header{flex-direction:column;align-items:flex-start;gap:24px}
    footer{flex-direction:column;gap:28px;text-align:center}
    .sculpture-container{opacity:.15;right:-120px}
    .hg-header{padding:60px 28px 36px;flex-direction:column;align-items:flex-start;gap:16px}
    .hg-track{padding:0 28px}
    .hg-card{width:clamp(260px,80vw,400px)}
    #scroll-rail{display:none}
  }
  @media(max-width:600px){
    .portfolio-masonry{columns:1}
    .collections-grid{grid-template-columns:1fr}
    .nav-links{display:none}
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════════════════ */
const EXHIBITIONS = [
  { year:"2023", tag:"Solo Exhibition",  title:"Living Forms",         desc:"Gallery Nina Menocal, Mexico City — organic steel sculptures exploring the boundary between nature and abstraction." },
  { year:"2022", tag:"Art Fair",         title:"Art Basel Miami Beach", desc:"International showcase with LA NOUE Fine Art presenting large-scale outdoor installations." },
  { year:"2021", tag:"Solo Exhibition",  title:"Fragments of Time",    desc:"Museum of Contemporary Art, Buenos Aires — a retrospective spanning two decades of practice." },
  { year:"2020", tag:"Group Exhibition", title:"New Geometries",       desc:"Coral Gables Museum, Florida — exploring geometry as a universal language in contemporary sculpture." },
  { year:"2019", tag:"Art Fair",         title:"Scope Art Show",       desc:"New York — large-scale painted steel sculptures reflecting themes of migration and memory." },
  { year:"2018", tag:"Solo Exhibition",  title:"Balancing Acts",       desc:"LA NOUE Fine Art, New York — bold primary-colored forms in dialogue with architectural space." },
];
const COLLECTIONS = [
  { name:"Miami-Dade Public Library",     loc:"Miami, Florida",            icon:"🏛" },
  { name:"Museo de Arte Moderno",         loc:"Buenos Aires, Argentina",   icon:"🎨" },
  { name:"Coral Gables Museum",           loc:"Coral Gables, Florida",     icon:"🏛" },
  { name:"Museum of Art Fort Lauderdale", loc:"Fort Lauderdale, FL",       icon:"🏺" },
  { name:"Private Collections",          loc:"USA, Europe, Latin America", icon:"✦"  },
  { name:"LA NOUE Fine Art",             loc:"New York, USA",              icon:"🗽" },
];
const PORTFOLIO_ITEMS = [
  { title:"Biomorphic Forms I", year:"2023", color1:"#2a1f18", color2:"#c4622d", shape:"morph"    },
  { title:"Equilibrium in Red", year:"2022", color1:"#1a1018", color2:"#8b2020", shape:"circle"   },
  { title:"Blue Fragment",      year:"2021", color1:"#131a25", color2:"#2d6b8b", shape:"triangle" },
  { title:"Copper Spiral",      year:"2023", color1:"#1e1a10", color2:"#c9a84c", shape:"spiral"   },
  { title:"Geometric Tension",  year:"2020", color1:"#181818", color2:"#8b8b2d", shape:"rect"     },
  { title:"Metallic Harmony",   year:"2022", color1:"#1a1010", color2:"#d4845a", shape:"wave"     },
];
const GALLERY_STUDIO = [
  { title:"Studio Visit — Miami",     year:"2023", medium:"Steel & Paint",       shape:"morph",    color1:"#1a1210", color2:"#c4622d" },
  { title:"Casting Process",          year:"2022", medium:"Behind the Scenes",   shape:"circle",   color1:"#10181a", color2:"#2d6b8b" },
  { title:"Surface & Texture",        year:"2023", medium:"Detail Study",        shape:"wave",     color1:"#1a1a10", color2:"#c9a84c" },
  { title:"Form in Progress",         year:"2021", medium:"Work in Progress",    shape:"triangle", color1:"#1a1018", color2:"#8b2020" },
  { title:"Light & Shadow",           year:"2022", medium:"Studio Photography",  shape:"spiral",   color1:"#101a18", color2:"#3d8b6b" },
  { title:"Installation View",        year:"2023", medium:"Exhibition",          shape:"rect",     color1:"#181810", color2:"#8b8b2d" },
  { title:"Outdoor Sculpture Garden", year:"2021", medium:"Public Installation", shape:"morph",    color1:"#180f0a", color2:"#d4845a" },
];
const GALLERY_EXHIBITIONS = [
  { title:"Art Basel Miami 2022",      year:"2022", medium:"Art Fair",              shape:"circle",   color1:"#0e1018", color2:"#4a6b9b" },
  { title:"MOCA Buenos Aires",         year:"2021", medium:"Museum Exhibition",     shape:"morph",    color1:"#1a0e0e", color2:"#c4622d" },
  { title:"Scope New York 2019",       year:"2019", medium:"Art Fair",              shape:"spiral",   color1:"#101a10", color2:"#4a9b6b" },
  { title:"Nina Menocal Gallery",      year:"2023", medium:"Solo Exhibition",       shape:"wave",     color1:"#1a1a0e", color2:"#b89b3c" },
  { title:"Coral Gables Museum",       year:"2020", medium:"Group Show",            shape:"rect",     color1:"#180e18", color2:"#9b4a8b" },
  { title:"Public Commission — Miami", year:"2022", medium:"Permanent Installation",shape:"triangle", color1:"#0e180e", color2:"#6b9b4a" },
  { title:"LA NOUE Fine Art, NY",      year:"2018", medium:"Solo Exhibition",       shape:"morph",    color1:"#181010", color2:"#d4845a" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   ① SCROLL PATH RAIL
   Fixed left‑side organic spine. Draws itself 0→100% as you scroll the page.
   A glowing orb rides the leading edge of the drawn stroke.
═══════════════════════════════════════════════════════════════════════════ */
// The SVG viewBox is "0 0 44 1000". The path weaves left/right within it.
const RAIL_PATH = "M22,0 C36,55 8,115 28,185 C44,240 6,310 26,380 C44,440 7,510 24,575 C40,635 5,700 22,760 C38,818 6,880 20,940 C30,970 18,990 22,1000";

function ScrollPathRail() {
  const railRef = useRef(null);
  const pathRef = useRef(null);
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    const rail = railRef.current;
    if (!path || !rail) return;

    // Wait one tick so SVG is painted and getTotalLength() is accurate
    const init = () => {
      const len = path.getTotalLength();
      path.style.strokeDasharray  = len;
      path.style.strokeDashoffset = len;   // fully hidden initially

      const onScroll = () => {
        const scrolled  = window.scrollY;
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const progress  = Math.min(1, scrolled / maxScroll);
        const drawn     = len * progress;

        // Draw the path
        path.style.strokeDashoffset = len - drawn;

        // Show rail only after first scroll
        if (scrolled > 80) rail.classList.add("visible");

        // Move glowing orb to the tip of the drawn stroke
        if (drawn > 1) {
          try {
            const pt = path.getPointAtLength(Math.min(drawn, len - 0.5));
            if (dotRef.current)  { dotRef.current.setAttribute("cx",  pt.x); dotRef.current.setAttribute("cy",  pt.y); }
            if (ringRef.current) { ringRef.current.setAttribute("cx", pt.x); ringRef.current.setAttribute("cy", pt.y); }
          } catch (_) {}
        }
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    };

    // Small delay to let SVG render
    const t = setTimeout(init, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div id="scroll-rail" ref={railRef}>
      <svg viewBox="0 0 44 1000" preserveAspectRatio="none" fill="none">
        {/* Faint ghost path — always visible */}
        <path d={RAIL_PATH} stroke="rgba(196,98,45,0.08)" strokeWidth="1" strokeLinecap="round"/>

        {/* The drawing path */}
        <path
          ref={pathRef}
          d={RAIL_PATH}
          className="rail-glow"
          stroke="rgba(196,98,45,0.55)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Pulsing ring at the orb */}
        <circle ref={ringRef} cx="22" cy="0" r="7" className="rail-dot-ring">
          <animate attributeName="r"       values="6;11;6"   dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".5;0;.5"  dur="2s" repeatCount="indefinite"/>
        </circle>

        {/* Solid dot — leading edge */}
        <circle ref={dotRef} cx="22" cy="0" r="3.5" className="rail-dot">
          <animate attributeName="r" values="3;4.5;3" dur="1.6s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ② DRAW PATH
   Generic component. Measures its path with getTotalLength(), then draws
   it in via strokeDashoffset when it scrolls into view.
   Props: d, viewBox, width, height, stroke, strokeWidth, style, duration, delay
═══════════════════════════════════════════════════════════════════════════ */
function DrawPath({ d, viewBox = "0 0 800 200", width = "100%", height = "auto",
                    stroke = "rgba(196,98,45,0.35)", strokeWidth = 1.2,
                    duration = 2.2, delay = 0, style = {}, className = "" }) {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path) return;

    const setup = () => {
      const len = path.getTotalLength();
      path.style.strokeDasharray  = len;
      path.style.strokeDashoffset = len;
      path.style.transition = `stroke-dashoffset ${duration}s cubic-bezier(.4,0,.2,1) ${delay}s`;

      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          path.style.strokeDashoffset = "0";
          obs.disconnect();
        }
      }, { threshold: 0.25 });
      obs.observe(wrap);
      return () => obs.disconnect();
    };

    const t = setTimeout(setup, 80);
    return () => clearTimeout(t);
  }, [duration, delay]);

  return (
    <div ref={wrapRef} className={`draw-path-wrap ${className}`} style={style}>
      <svg viewBox={viewBox} width={width} height={height} fill="none" overflow="visible">
        <path ref={pathRef} d={d} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ③ ANIMATED DIVIDER
   Replaces the plain <hr>. A wavy SVG line that draws left→right on scroll.
   accent: "rust" | "gold"
═══════════════════════════════════════════════════════════════════════════ */
const WAVE_D = "M0,8 C90,1 180,15 270,8 C360,1 450,15 540,8 C630,1 720,15 810,8 C900,1 990,15 1080,8 C1170,1 1260,15 1350,8 C1440,1 1530,15 1620,8";

function AnimatedDivider({ accent = "rust" }) {
  const svgRef  = useRef(null);
  const pathRef = useRef(null);
  const color   = accent === "gold" ? "rgba(201,168,76,0.45)" : "rgba(196,98,45,0.45)";

  useEffect(() => {
    const svg  = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path) return;

    const setup = () => {
      const len = path.getTotalLength();
      path.style.strokeDasharray  = len;
      path.style.strokeDashoffset = len;
      path.style.transition = `stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1)`;

      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { path.style.strokeDashoffset = "0"; obs.disconnect(); }
      }, { threshold: 0.5 });
      obs.observe(svg);
      return () => obs.disconnect();
    };

    const t = setTimeout(setup, 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 1620 16" preserveAspectRatio="none"
      style={{ display:"block", width:"100%", height:"16px", overflow:"visible" }}>
      <path ref={pathRef} d={WAVE_D} fill="none" stroke={color} strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ART SVG  (inline artwork for portfolio / galleries)
═══════════════════════════════════════════════════════════════════════════ */
function ArtSVG({ shape, color1, color2 }) {
  const id = `g${shape}${color2.replace(/[^a-z0-9]/gi,"")}`;
  const s  = { background:color1, width:"100%", height:"100%" };
  switch (shape) {
    case "morph": return (
      <svg viewBox="0 0 400 400" style={s}>
        <defs><radialGradient id={id} cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor={color2} stopOpacity=".9"/><stop offset="100%" stopColor={color2} stopOpacity=".15"/></radialGradient></defs>
        <path fill={`url(#${id})`} opacity=".75"><animate attributeName="d" dur="9s" repeatCount="indefinite" values="M200,100 C260,60 320,80 340,140 C360,200 330,260 280,290 C230,320 160,310 120,270 C80,230 70,160 100,120 C130,80 140,140 200,100Z;M210,90 C275,50 335,85 345,150 C355,215 315,275 260,295 C205,315 145,295 110,250 C75,205 80,145 115,110 C150,75 145,130 210,90Z;M200,100 C260,60 320,80 340,140 C360,200 330,260 280,290 C230,320 160,310 120,270 C80,230 70,160 100,120 C130,80 140,140 200,100Z"/></path>
        <circle cx="200" cy="200" r="40" fill={color2} opacity=".3"/>
      </svg>);
    case "circle": return (
      <svg viewBox="0 0 400 400" style={s}>
        <circle cx="200" cy="200" r="130" fill="none" stroke={color2} strokeWidth="1.5" opacity=".35"/>
        <circle cx="200" cy="200" r="85" fill={color2} opacity=".5"/>
        <circle cx="200" cy="200" r="38" fill={color2} opacity=".9"/>
        <circle cx="285" cy="125" r="18" fill={color2} opacity=".5"/>
        <line x1="70" y1="200" x2="330" y2="200" stroke={color2} strokeWidth=".8" opacity=".25"/>
        <line x1="200" y1="70" x2="200" y2="330" stroke={color2} strokeWidth=".8" opacity=".25"/>
      </svg>);
    case "triangle": return (
      <svg viewBox="0 0 400 400" style={s}>
        <polygon points="200,55 345,325 55,325" fill="none" stroke={color2} strokeWidth="1.2" opacity=".45"/>
        <polygon points="200,100 310,305 90,305" fill={color2} opacity=".22"/>
        <polygon points="200,145 275,285 125,285" fill={color2} opacity=".4"/>
        <polygon points="200,185 248,265 152,265" fill={color2} opacity=".8"/>
        {[[200,55],[345,325],[55,325]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="6" fill={color2}/>)}
      </svg>);
    case "spiral": return (
      <svg viewBox="0 0 400 400" style={s}>
        <path d="M200,200 Q220,180 240,200 Q260,220 240,240 Q220,260 190,250 Q150,240 140,200 Q130,150 160,120 Q200,80 260,90 Q330,100 350,170 Q370,250 320,300 Q260,360 180,350 Q80,340 50,260 Q20,170 80,100" fill="none" stroke={color2} strokeWidth="2" opacity=".8"/>
        <circle cx="200" cy="200" r="8" fill={color2}/>
      </svg>);
    case "rect": return (
      <svg viewBox="0 0 400 400" style={s}>
        {[15,30,45,60].map((rot,i)=>(
          <rect key={i} x={80+i*20} y={80+i*20} width={240-i*40} height={240-i*40}
            fill={i===3?color2:"none"} stroke={color2} strokeWidth="1"
            opacity={i===3?.7:.25+i*.05} transform={`rotate(${rot} 200 200)`}/>
        ))}
      </svg>);
    case "wave": return (
      <svg viewBox="0 0 400 400" style={s}>
        {[0,20,-20].map((dy,i)=>(
          <path key={i} d={`M40,${200+dy} Q80,${140+dy} 120,${200+dy} Q160,${260+dy} 200,${200+dy} Q240,${140+dy} 280,${200+dy} Q320,${260+dy} 360,${200+dy}`} fill="none" stroke={color2} strokeWidth={2.5-i*.7} opacity={.8-i*.25}/>
        ))}
        {[80,160,240,320].map(x=><circle key={x} cx={x} cy="200" r="5" fill={color2} opacity=".7"/>)}
      </svg>);
    default: return <svg viewBox="0 0 400 400" style={s}/>;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO SCULPTURE SVG
═══════════════════════════════════════════════════════════════════════════ */
function SculptureSVG() {
  return (
    <svg viewBox="0 0 500 700">
      <defs><radialGradient id="sg1" cx="50%" cy="40%" r="60%"><stop offset="0%" stopColor="#c4622d" stopOpacity=".6"/><stop offset="100%" stopColor="#c4622d" stopOpacity="0"/></radialGradient></defs>
      <ellipse cx="250" cy="580" rx="140" ry="30" fill="url(#sg1)" opacity=".5"/>
      <g style={{animation:"float 6s ease-in-out infinite",transformOrigin:"250px 350px"}}>
        <path opacity=".18" fill="#c4622d"><animate attributeName="d" dur="10s" repeatCount="indefinite" values="M250,80 C310,50 390,90 410,170 C430,250 400,340 360,400 C320,460 270,490 220,480 C170,470 120,440 95,390 C70,340 75,270 100,210 C125,150 190,110 250,80Z;M255,75 C320,45 400,88 415,175 C430,262 395,355 350,410 C305,465 255,492 205,478 C155,464 108,432 87,378 C66,324 74,252 102,192 C130,132 190,105 255,75Z;M250,80 C310,50 390,90 410,170 C430,250 400,340 360,400 C320,460 270,490 220,480 C170,470 120,440 95,390 C70,340 75,270 100,210 C125,150 190,110 250,80Z"/></path>
        <path opacity=".38" fill="#c4622d"><animate attributeName="d" dur="8s" repeatCount="indefinite" values="M250,120 C295,95 355,120 375,185 C395,250 370,320 335,370 C300,420 255,445 210,430 C165,415 130,380 115,335 C100,290 108,240 135,195 C162,150 205,145 250,120Z;M255,115 C302,88 365,116 382,184 C399,252 372,324 334,372 C296,420 250,447 204,430 C158,413 124,376 110,328 C96,280 107,228 136,185 C165,142 208,142 255,115Z;M250,120 C295,95 355,120 375,185 C395,250 370,320 335,370 C300,420 255,445 210,430 C165,415 130,380 115,335 C100,290 108,240 135,195 C162,150 205,145 250,120Z"/></path>
        <path opacity=".72" fill="#c4622d"><animate attributeName="d" dur="7s" repeatCount="indefinite" values="M250,160 C282,140 318,158 332,200 C346,242 328,288 300,314 C272,340 235,348 205,330 C175,312 158,278 162,244 C166,210 185,180 250,160Z;M253,155 C287,134 324,154 336,198 C348,242 328,290 299,316 C270,342 232,350 202,330 C172,310 156,274 161,239 C166,204 187,176 253,155Z;M250,160 C282,140 318,158 332,200 C346,242 328,288 300,314 C272,340 235,348 205,330 C175,312 158,278 162,244 C166,210 185,180 250,160Z"/></path>
        <ellipse cx="225" cy="210" rx="30" ry="45" fill="white" opacity=".07" transform="rotate(-20 225 210)"/>
        {[[150,200,12,"#c9a84c",.6,4],[360,300,8,"#d4845a",.5,5],[180,420,15,"#c4622d",.4,6]].map(([cx,cy,r,fill,op,dur],i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill={fill} opacity={op}>
            <animate attributeName="cy" values={`${cy};${cy-16};${cy}`} dur={`${dur}s`} repeatCount="indefinite"/>
          </circle>
        ))}
      </g>
      <ellipse cx="250" cy="560" rx="100" ry="15" fill="#0a0908" opacity=".6"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PARTICLE CANVAS
═══════════════════════════════════════════════════════════════════════════ */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if(!c) return;
    const ctx = c.getContext("2d");
    let W,H,pts,raf;
    const N=60;
    const resize=()=>{W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;};
    const init=()=>{pts=Array.from({length:N},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*1.5+.5}));};
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      for(let i=0;i<N;i++) for(let j=i+1;j<N;j++){
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<120){ctx.strokeStyle=`rgba(196,98,45,${(1-d/120)*.25})`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();}
      }
      pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle="rgba(196,98,45,0.5)";ctx.fill();p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;});
      raf=requestAnimationFrame(draw);
    };
    resize();init();draw();
    window.addEventListener("resize",()=>{resize();init();});
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} id="particle-canvas"/>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COUNTER
═══════════════════════════════════════════════════════════════════════════ */
function Counter({target,suffix=""}) {
  const [v,setV]=useState(0);
  const ref=useRef(null);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(!e.isIntersecting)return;
      let cur=0;const step=target/50;
      const t=setInterval(()=>{cur+=step;if(cur>=target){setV(target);clearInterval(t);}else setV(Math.floor(cur));},30);
      obs.disconnect();
    },{threshold:.5});
    if(ref.current)obs.observe(ref.current);
    return()=>obs.disconnect();
  },[target]);
  return <span ref={ref}>{v}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HORIZONTAL GALLERY (mouse-wheel scroll → horizontal track)
═══════════════════════════════════════════════════════════════════════════ */
function HorizontalGallery({ label, heading, sub, items, bg, accent }) {
  const outerRef = useRef(null);
  const trackRef = useRef(null);
  const barRef   = useRef(null);
  const xCur     = useRef(0);
  const xTarget  = useRef(0);
  const raf      = useRef(null);

  useEffect(() => {
    const outer = outerRef.current;
    const track = trackRef.current;
    if (!outer || !track) return;
    const getMax = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth);

    const loop = () => {
      xCur.current += (xTarget.current - xCur.current) * 0.085;
      track.style.transform = `translateX(${-xCur.current}px)`;
      const max = getMax();
      if (barRef.current && max > 0) barRef.current.style.width = `${Math.min(100,(xCur.current/max)*100)}%`;
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    const onWheel = (e) => {
      const rect = outer.getBoundingClientRect();
      if (rect.top > 80 || rect.bottom < window.innerHeight - 80) return;
      const max = getMax();
      if ((xTarget.current <= 2 && e.deltaY < 0) || (xTarget.current >= max - 2 && e.deltaY > 0)) return;
      e.preventDefault();
      xTarget.current = Math.max(0, Math.min(max, xTarget.current + e.deltaY * 1.5));
    };

    window.addEventListener("wheel", onWheel, { passive:false });
    return () => { window.removeEventListener("wheel", onWheel); cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <div ref={outerRef} className="hg-outer" style={{background:bg}}>
      <div className="hg-header">
        <div>
          <p className="section-label reveal">{label}</p>
          <h2 className="section-h2 reveal" dangerouslySetInnerHTML={{__html:heading}}/>
          {sub && <p className="reveal" style={{fontSize:".88rem",color:"var(--muted)",fontWeight:200,marginTop:6}}>{sub}</p>}
        </div>
        <div className="hg-hint reveal">
          <span>Scroll to explore</span>
          <div className="hg-hint-arrow">
            <svg width="30" height="12" viewBox="0 0 30 12" fill="none">
              <path d="M0 6h26M21 2l5 4-5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="hg-sticky">
        <div ref={trackRef} className="hg-track">
          {items.map((item,i)=>(
            <div key={i} className="hg-card">
              <div className="hg-card-visual"><ArtSVG shape={item.shape} color1={item.color1} color2={item.color2}/></div>
              <div className="hg-card-info">
                <div className="hg-card-num">{String(i+1).padStart(2,"0")}</div>
                <div className="hg-card-title">{item.title}</div>
                <div className="hg-card-sub">{item.year} &nbsp;·&nbsp; {item.medium}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="hg-bar-track"><div ref={barRef} className="hg-bar" style={{background:accent}}/></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════════════════════ */
export default function CarolinaSardi() {
  const [scrolled,setScrolled] = useState(false);
  const [modal,   setModal]    = useState(null);
  const [cursor,  setCursor]   = useState({x:0,y:0});
  const [ring,    setRing]     = useState({x:0,y:0});
  const ringPos = useRef({x:0,y:0});

  /* cursor */
  useEffect(()=>{
    const mv=e=>setCursor({x:e.clientX,y:e.clientY});
    window.addEventListener("mousemove",mv);
    let r;
    const L=(a,b,t)=>a+(b-a)*t;
    const run=()=>{ringPos.current.x=L(ringPos.current.x,cursor.x||0,.12);ringPos.current.y=L(ringPos.current.y,cursor.y||0,.12);setRing({x:ringPos.current.x,y:ringPos.current.y});r=requestAnimationFrame(run);};
    r=requestAnimationFrame(run);
    return()=>{window.removeEventListener("mousemove",mv);cancelAnimationFrame(r);};
  },[cursor.x,cursor.y]);

  /* nav scroll */
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>60);
    window.addEventListener("scroll",fn);
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  /* reveal observer */
  useEffect(()=>{
    const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible");});},{threshold:.12});
    document.querySelectorAll(".reveal,.reveal-left,.reveal-right,.stagger").forEach(el=>obs.observe(el));
    return()=>obs.disconnect();
  },[]);

  /* escape modal */
  useEffect(()=>{
    const fn=e=>{if(e.key==="Escape")setModal(null);};
    window.addEventListener("keydown",fn);
    return()=>window.removeEventListener("keydown",fn);
  },[]);

  const marquee = ["Living Forms","Free Spirit","Tension & Balance","Matter & Time","Biomorphism","Contemporary Sculpture"];

  /* ── SVG PATH DATA ───────────────────────────────────────────────────── */

  // Biomorphic sculpture silhouette behind About right column
  const ABOUT_SILHOUETTE =
    "M260,55 C315,22 400,35 445,88 C490,141 498,228 472,302 " +
    "C446,376 394,428 325,448 C256,468 178,455 128,408 " +
    "C78,361 58,290 68,220 C78,150 112,92 168,65 C200,50 228,58 260,55 Z";

  const ABOUT_INNER =
    "M262,115 C300,95 348,110 368,152 C388,194 375,248 348,274 " +
    "C321,300 278,305 248,285 C218,265 202,228 210,195 " +
    "C218,162 232,132 262,115 Z";

  // Geometric / architectural line path for Timeline section
  const TIMELINE_PATH =
    "M0,30 L80,30 L80,0 L180,0 L180,50 L280,50 L280,10 " +
    "L380,10 L380,40 L480,40 L480,5 L580,5 L580,35 L680,35 L680,0 L780,0";

  // Flowing "signature" underline for Contact section
  const SIGNATURE_PATH =
    "M40,40 C80,18 140,55 200,30 C255,8 310,48 368,28 " +
    "C418,10 464,42 520,25 C568,10 610,38 650,30";

  // Hero brushstroke that draws on mount
  const HERO_BRUSHSTROKE =
    "M60,12 C180,2 360,22 540,8 C720,-4 900,18 1080,6 " +
    "C1200,-2 1320,14 1440,8";

  return (
    <>
      <style>{STYLE}</style>

      {/* ── CURSOR ── */}
      <div id="cursor" style={{left:cursor.x,top:cursor.y}}/>
      <div id="cursor-ring" style={{left:ring.x,top:ring.y}}/>

      {/* ① SCROLL PATH RAIL ── fixed, draws with page scroll */}
      <ScrollPathRail/>

      {/* ── NAV ── */}
      <nav className={scrolled?"scrolled":""}>
        <a href="#hero" className="nav-logo">Carolina Sardi</a>
        <ul className="nav-links">
          {["About","Works","Exhibitions","Collections","Contact"].map((l,i)=>(
            <li key={i}><a href={`#${["about","portfolio","timeline","collections","contact"][i]}`}>{l}</a></li>
          ))}
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section id="hero">
        <ParticleCanvas/>
        {/* grid lines */}
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.06,pointerEvents:"none"}}>
          {Array.from({length:12},(_,i)=><line key={i} x1={`${i*9}%`} y1="0" x2={`${i*9}%`} y2="100%" stroke="#c4622d" strokeWidth=".5"/>)}
          {Array.from({length:8}, (_,i)=><line key={i} x1="0" y1={`${i*14}%`} x2="100%" y2={`${i*14}%`} stroke="#c4622d" strokeWidth=".5"/>)}
        </svg>

        {/* Hero brushstroke — draws on page load */}
        <DrawPath
          d={HERO_BRUSHSTROKE}
          viewBox="0 0 1440 20"
          width="100%" height="20px"
          stroke="rgba(196,98,45,0.25)"
          strokeWidth="1.5"
          duration={2.4} delay={1.5}
          style={{ position:"absolute", bottom:"22%", left:0, right:0, width:"100%" }}
        />

        <div className="sculpture-container"><SculptureSVG/></div>
        <div className="hero-content">
          <p className="hero-eyebrow">Contemporary Sculptor · Buenos Aires</p>
          <h1 className="hero-h1">Carolina<br/><em>Sardi</em></h1>
          <p className="hero-subtitle">Sculpture · Installation · Public Art</p>
          <a href="#portfolio" className="hero-cta">
            Explore Works
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none"><path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </a>
        </div>
        <div className="scroll-indicator"><span>Scroll</span><div className="scroll-line"/></div>
      </section>

      {/* ③ ANIMATED DIVIDER */}
      <AnimatedDivider/>

      {/* ── ABOUT ── */}
      <section id="about" style={{background:"var(--charcoal)",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"100px",alignItems:"start",position:"relative",overflow:"hidden"}}>

        {/* ② DRAW PATH — biomorphic sculpture outline (right bg) */}
        <DrawPath
          d={ABOUT_SILHOUETTE}
          viewBox="0 0 520 510"
          width="520px" height="510px"
          stroke="rgba(196,98,45,0.12)"
          strokeWidth="1.5"
          duration={3.2} delay={0.3}
          style={{ position:"absolute", right:"-20px", top:"80px", zIndex:0 }}
        />
        <DrawPath
          d={ABOUT_INNER}
          viewBox="0 0 520 510"
          width="520px" height="510px"
          stroke="rgba(201,168,76,0.10)"
          strokeWidth="1"
          duration={2.8} delay={0.9}
          style={{ position:"absolute", right:"-20px", top:"80px", zIndex:0 }}
        />

        <div style={{position:"relative",zIndex:1}}>
          <p className="section-label reveal">About the Artist</p>
          <h2 className="section-h2 reveal">Form,<br/><em>Matter</em><br/>& Memory</h2>
          <p className="about-text reveal">Carolina Sardi is an Argentine contemporary sculptor based in Miami. Her work explores the relationship between organic form and geometric language, creating painted steel sculptures that dialogue with architecture and public space.</p>
          <p className="about-text reveal">Trained at the Escuela Nacional de Bellas Artes in Buenos Aires, Sardi develops a practice rooted in biomorphic abstraction — forms that evoke the body, nature, and movement — translated into metal, color, and light.</p>
          <div className="about-stat-grid stagger">
            {[["30","Years of Career"],["25","Solo Exhibitions"],["15","Countries"],["40","Public Collections"]].map(([n,l],i)=>(
              <div key={i} className="about-stat">
                <div className="about-stat-num"><Counter target={parseInt(n)} suffix="+"/></div>
                <div className="about-stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{paddingTop:80,position:"relative",zIndex:1}}>
          <div className="statement-block reveal-right">
            <p className="statement-text">"My sculpture is born from a desire to capture what exists between states — between solid and fluid, between the natural and the constructed."</p>
          </div>
          <h3 className="reveal-right" style={{fontFamily:"Cormorant Garamond,serif",fontSize:"1.1rem",fontWeight:400,letterSpacing:".1em",textTransform:"uppercase",color:"var(--muted)",marginBottom:20,marginTop:40}}>Education</h3>
          {["Escuela Nacional de Bellas Artes, Buenos Aires","Advanced sculpture studies with Roberto Capurro","Artist-in-Residence in New York and Miami"].map((edu,i)=>(
            <div key={i} className="reveal-right" style={{display:"flex",gap:16,marginBottom:14,alignItems:"flex-start",transitionDelay:`${i*.12}s`}}>
              <span style={{color:"var(--rust)",marginTop:4,flexShrink:0}}>◆</span>
              <span style={{fontSize:".9rem",color:"var(--warm)",fontWeight:300,lineHeight:1.6}}>{edu}</span>
            </div>
          ))}
        </div>
      </section>

      <AnimatedDivider/>

      {/* ── HORIZONTAL GALLERY 1 ── */}
      <HorizontalGallery
        label="Studio & Process"
        heading="Behind the <em>Work</em>"
        sub="An intimate look at the creative process — from raw steel to finished form."
        items={GALLERY_STUDIO}
        bg="var(--dark)"
        accent="var(--rust)"
      />

      <AnimatedDivider/>

      {/* ── PORTFOLIO ── */}
      <section id="portfolio">
        <div className="portfolio-header reveal">
          <div>
            <p className="section-label">Portfolio</p>
            <h2 className="section-h2">Selected <em>Works</em></h2>
          </div>
          <div className="portfolio-filter">
            {["All","Sculpture","Installation","Public"].map((f,i)=>(
              <button key={i} className={`filter-btn${i===0?" active":""}`}
                onClick={e=>{document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));e.target.classList.add("active");}}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="portfolio-masonry">
          {PORTFOLIO_ITEMS.map((item,i)=>(
            <div key={i} className="portfolio-item reveal" style={{transitionDelay:`${i*.1}s`}} onClick={()=>setModal(item)}>
              <div className="art-placeholder"><ArtSVG shape={item.shape} color1={item.color1} color2={item.color2}/></div>
              <div className="portfolio-overlay">
                <div>
                  <div className="overlay-title">{item.title}</div>
                  <div className="overlay-year">{item.year} · Painted Steel</div>
                </div>
              </div>
              <div className="portfolio-expand">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3h4M3 3v4M13 13h-4M13 13v-4M3 13v-4M3 13h4M13 3v4M13 3h-4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AnimatedDivider accent="gold"/>

      {/* ── HORIZONTAL GALLERY 2 ── */}
      <HorizontalGallery
        label="Exhibitions & Public Art"
        heading="On View <em>Worldwide</em>"
        sub="From art fairs to museum retrospectives — Sardi's work across the globe."
        items={GALLERY_EXHIBITIONS}
        bg="var(--charcoal)"
        accent="var(--gold)"
      />

      <AnimatedDivider/>

      {/* ── TIMELINE — with geometric draw path ── */}
      <section id="timeline" style={{background:"var(--dark)",position:"relative",overflow:"hidden"}}>

        {/* ② DRAW PATH — architectural / structural lines */}
        <DrawPath
          d={TIMELINE_PATH}
          viewBox="0 0 780 60"
          width="780px" height="60px"
          stroke="rgba(196,98,45,0.18)"
          strokeWidth="1.5"
          duration={2.8} delay={0.4}
          style={{ position:"absolute", bottom:"60px", left:"60px", zIndex:0 }}
        />

        <div className="timeline-header" style={{position:"relative",zIndex:1}}>
          <p className="section-label reveal">Career</p>
          <h2 className="section-h2 reveal">Exhibitions &<br/><em>Highlights</em></h2>
        </div>
        <div className="timeline-grid stagger" style={{position:"relative",zIndex:1}}>
          {EXHIBITIONS.map((ex,i)=>(
            <div key={i} className="timeline-card">
              <div className="card-year">{ex.year}</div>
              <div className="card-tag">{ex.tag}</div>
              <div className="card-title">{ex.title}</div>
              <div className="card-desc">{ex.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <AnimatedDivider/>

      {/* ── COLLECTIONS ── */}
      <section id="collections" style={{background:"var(--charcoal)"}}>
        <p className="section-label reveal">Collections</p>
        <h2 className="section-h2 reveal">Works in<br/><em>Museums</em> & Collections</h2>
        <div className="collections-marquee">
          <div className="marquee-track">
            {[...marquee,...marquee].map((item,i)=><div key={i} className="marquee-item">{item}</div>)}
          </div>
        </div>
        <div className="collections-grid stagger" style={{marginTop:80}}>
          {COLLECTIONS.map((col,i)=>(
            <div key={i} className="collection-card">
              <div className="collection-icon">{col.icon}</div>
              <div className="collection-name">{col.name}</div>
              <div className="collection-loc">{col.loc}</div>
            </div>
          ))}
        </div>
      </section>

      <AnimatedDivider accent="gold"/>

      {/* ── CONTACT — with flowing signature path ── */}
      <section id="contact" style={{position:"relative",overflow:"hidden"}}>

        {/* ② DRAW PATH — large decorative background orbit */}
        <DrawPath
          d="M400,260 C500,180 620,160 700,220 C780,280 800,400 730,470 C660,540 530,550 440,490 C350,430 320,320 400,260 Z"
          viewBox="0 0 900 600"
          width="900px" height="600px"
          stroke="rgba(196,98,45,0.07)"
          strokeWidth="2"
          duration={4} delay={0.2}
          style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", zIndex:0 }}
        />

        <p className="section-label reveal" style={{justifyContent:"center",position:"relative",zIndex:1}}>Contact</p>
        <h2 className="contact-h2 reveal" style={{position:"relative",zIndex:1}}>Let's<br/><em>Connect</em></h2>

        {/* ② DRAW PATH — flowing signature underline */}
        <DrawPath
          d={SIGNATURE_PATH}
          viewBox="0 0 690 70"
          width="460px" height="46px"
          stroke="rgba(196,98,45,0.55)"
          strokeWidth="1.5"
          duration={2.2} delay={0.5}
          style={{ display:"block", margin:"0 auto 48px", position:"relative", zIndex:1 }}
        />

        <p className="contact-sub reveal" style={{position:"relative",zIndex:1}}>Inquiries for acquisitions, exhibitions & public art commissions</p>
        <a href="mailto:studio@carolinasardi.com" className="contact-email reveal" style={{position:"relative",zIndex:1}}>studio@carolinasardi.com</a>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-logo">Carolina Sardi</div>
        <div className="footer-copy">© 2025 Carolina Sardi. All rights reserved.</div>
        <div className="footer-socials">
          {[
            {href:"https://instagram.com/carolinasardi",label:"Instagram",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>},
            {href:"https://facebook.com/carolinasardi",label:"Facebook",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>},
            {href:"mailto:studio@carolinasardi.com",label:"Email",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>},
            {href:"https://carolinasardi.com",label:"Website",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>},
          ].map(({href,label,icon})=>(
            <a key={label} href={href} target="_blank" rel="noopener" className="social-link" title={label}>{icon}</a>
          ))}
        </div>
      </footer>

      {/* ── MODAL ── */}
      <div className={`modal-bg${modal?" open":""}`} onClick={()=>setModal(null)}>
        {modal&&(
          <div className="modal-inner" onClick={e=>e.stopPropagation()}>
            <div className="modal-art"><ArtSVG shape={modal.shape} color1={modal.color1} color2={modal.color2}/></div>
            <div className="modal-meta">
              <div>
                <div className="modal-title">{modal.title}</div>
                <div style={{fontSize:".75rem",color:"var(--muted)",marginTop:6,letterSpacing:".12em"}}>{modal.year} · Painted Steel · Carolina Sardi</div>
              </div>
              <button className="modal-close" onClick={()=>setModal(null)}>Close ✕</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
