const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Entrada escalonada dos blocos
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}, { rootMargin: "0px 0px -10% 0px" });
document.querySelectorAll(".reveal").forEach((el) => {
  const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.setProperty("--i", sibs.indexOf(el));
  io.observe(el);
});

// "Quem sou": palavras acendem conforme o scroll
const statement = document.querySelector(".js-words");
const words = [];
if (statement) {
  const text = statement.textContent.trim();
  statement.setAttribute("aria-label", text);
  statement.innerHTML = text.split(/\s+/).map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(" ");
  words.push(...statement.querySelectorAll(".w"));
}

// Hero: as 3 peças do K chegam espalhadas e se montam conforme o scroll
const hero = document.querySelector(".js-hero");
const pieces = [...document.querySelectorAll(".k-piece")].map((el) => ({ el, from: el.dataset.from.split(" ").map(Number) }));
const caption = document.querySelector(".hero-caption");
let kTarget = 0, kNow = 0, kRaf = 0;
function drawK() {
  kNow += (kTarget - kNow) * 0.12; // suaviza como o scrub do GSAP
  if (Math.abs(kTarget - kNow) < 0.001) kNow = kTarget;
  const q = 1 - kNow;
  for (const { el, from: [x, y, r] } of pieces) {
    el.style.transform = `translate(${x * q}px, ${y * q}px) rotate(${r * q}deg)`;
    el.style.opacity = 0.25 + 0.75 * kNow;
  }
  const c = Math.min(1, Math.max(0, (kNow - 0.7) / 0.3));
  caption.style.opacity = c;
  caption.style.transform = `translateY(${12 * (1 - c)}px)`;
  kRaf = kNow === kTarget ? 0 : requestAnimationFrame(drawK);
}

const header = document.querySelector(".topbar");
const waFloat = document.querySelector(".wa-float");
const bar = document.querySelector(".js-progress");
const timeline = document.querySelector(".timeline");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const sections = navLinks.map((a) => document.querySelector(a.hash));

let ticking = false;
function update() {
  ticking = false;
  const vh = innerHeight;
  header.classList.toggle("is-scrolled", scrollY > 8);

  if (hero && !reduce) {
    const r = hero.getBoundingClientRect();
    kTarget = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
    if (!kRaf) kRaf = requestAnimationFrame(drawK);
  }

  if (hero) waFloat.classList.toggle("is-on", hero.getBoundingClientRect().bottom < vh * 0.5);

  if (words.length && !reduce) {
    const r = statement.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.4)));
    const lit = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < lit));
  }

  if (bar && !reduce) {
    const r = timeline.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
    bar.style.setProperty("--p", p.toFixed(3));
  }

  let current = -1;
  sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < vh * 0.4) current = i; });
  navLinks.forEach((a, i) => a.classList.toggle("is-active", i === current));
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
addEventListener("resize", update);
update();

document.querySelector(".js-year").textContent = new Date().getFullYear();
