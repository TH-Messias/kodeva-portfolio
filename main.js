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

const header = document.querySelector(".topbar");
const bar = document.querySelector(".js-progress");
const timeline = document.querySelector(".timeline");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const sections = navLinks.map((a) => document.querySelector(a.hash));

let ticking = false;
function update() {
  ticking = false;
  const vh = innerHeight;
  header.classList.toggle("is-scrolled", scrollY > 8);

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
