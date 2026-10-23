const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

// Hero: divide o título em palavras para cada uma subir de dentro de uma máscara
const title = document.querySelector(".js-split");
if (title) {
  let d = 0;
  const wrap = (text) => text.split(/(\s+)/).map((t) => {
    if (!t.trim()) return document.createTextNode(t);
    const outer = document.createElement("span");
    outer.className = "wd";
    outer.innerHTML = `<span style="--d:${d++}">${t}</span>`;
    return outer;
  });
  title.setAttribute("aria-label", title.textContent.replace(/\s+/g, " ").trim());
  for (const node of [...title.childNodes]) {
    const parts = wrap(node.textContent);
    parts.forEach((p) => { if (p.nodeType === 1) p.setAttribute("aria-hidden", "true"); });
    if (node.nodeType === 3) node.replaceWith(...parts);
    else { node.textContent = ""; node.append(...parts); }
  }
  requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector(".hero").classList.add("hero-ready")));
}

// Entrada escalonada dos blocos
document.querySelectorAll(".checks li").forEach((li) => li.classList.add("reveal"));
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
  const c = clamp01((kNow - 0.7) / 0.3);
  caption.style.opacity = c;
  caption.style.transform = `translateY(${12 * (1 - c)}px)`;
  kRaf = kNow === kTarget ? 0 : requestAnimationFrame(drawK);
}

const header = document.querySelector(".topbar");
const waFloat = document.querySelector(".wa-float");
const bar = document.querySelector(".js-progress");
const timeline = document.querySelector(".timeline");
const steps = timeline ? [...timeline.querySelectorAll("li")] : [];
const shot = document.querySelector(".project-shot img");
const photo = document.querySelector(".about-photo");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const sections = navLinks.map((a) => document.querySelector(a.hash));

let ticking = false;
let lastY = scrollY;
function update() {
  ticking = false;
  const vh = innerHeight;
  const y = scrollY;
  header.classList.toggle("is-scrolled", y > 8);
  // esconde o header ao descer e mostra ao subir
  if (Math.abs(y - lastY) > 6) {
    header.classList.toggle("is-hidden", y > lastY && y > vh * 0.6 && !header.contains(document.activeElement));
    lastY = y;
  }

  if (hero && !reduce) {
    const r = hero.getBoundingClientRect();
    kTarget = clamp01(-r.top / Math.max(1, r.height - vh));
    if (!kRaf) kRaf = requestAnimationFrame(drawK);
  }

  if (hero) waFloat.classList.toggle("is-on", hero.getBoundingClientRect().bottom < vh * 0.5);

  if (words.length && !reduce) {
    const r = statement.getBoundingClientRect();
    const lit = Math.round(clamp01((vh * 0.85 - r.top) / (r.height + vh * 0.4)) * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < lit));
  }

  if (bar && !reduce) {
    const r = timeline.getBoundingClientRect();
    const p = clamp01((vh * 0.6 - r.top) / r.height);
    bar.style.setProperty("--p", p.toFixed(3));
    const lineY = r.top + p * r.height;
    steps.forEach((li) => li.classList.toggle("is-reached", li.getBoundingClientRect().top + 16 <= lineY));
  }

  if (!reduce) {
    if (shot) {
      const r = shot.parentElement.getBoundingClientRect();
      shot.style.setProperty("--zoom", (1.12 - 0.12 * clamp01((vh - r.top) / (vh * 0.8))).toFixed(4));
    }
    if (photo) {
      const r = photo.getBoundingClientRect();
      const p = clamp01((vh - r.top) / (vh + r.height));
      photo.style.setProperty("--py", `${((0.5 - p) * 40).toFixed(1)}px`);
    }
  }

  let current = -1;
  sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < vh * 0.4) current = i; });
  navLinks.forEach((a, i) => a.classList.toggle("is-active", i === current));
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
addEventListener("resize", update);
update();

// Brilho que segue o cursor e botões levemente magnéticos (só com mouse)
if (finePointer && !reduce) {
  document.querySelectorAll(".spot").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--sx", `${e.clientX - r.left}px`);
      el.style.setProperty("--sy", `${e.clientY - r.top}px`);
    });
  });
  document.querySelectorAll(".btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.setProperty("--mx-btn", `${((e.clientX - r.left) / r.width - 0.5) * 8}px`);
      b.style.setProperty("--my-btn", `${((e.clientY - r.top) / r.height - 0.5) * 6}px`);
    });
    b.addEventListener("pointerleave", () => { b.style.removeProperty("--mx-btn"); b.style.removeProperty("--my-btn"); });
  });
}

// Caixa de dúvidas: monta a mensagem e abre o WhatsApp
const ask = document.querySelector(".js-ask");
if (ask) {
  const field = ask.querySelector("textarea");
  const error = ask.querySelector(".ask-error");
  const chips = [...ask.querySelectorAll(".chip")];
  const setError = (on) => { error.hidden = !on; field.setAttribute("aria-invalid", on); };
  chips.forEach((chip) => {
    chip.setAttribute("aria-pressed", "false");
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      field.value = chip.textContent.trim();
      setError(false);
      field.focus();
    });
  });
  field.addEventListener("input", () => {
    if (field.value.trim()) setError(false);
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.textContent.trim() === field.value.trim())));
  });
  ask.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = field.value.trim();
    if (!msg) { setError(true); field.focus(); return; }
    const text = `Olá Matheus, vim pelo portfólio e tenho uma dúvida: ${msg}`;
    window.open(`https://wa.me/5511941066262?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });
}

document.querySelector(".js-year").textContent = new Date().getFullYear();
