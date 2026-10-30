/* Alternância claro/escuro. Independente da lógica do jogo: só troca data-theme no <html>. */
(() => {
  const KEY = "forca-tema";
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stored = () => { try { const t = localStorage.getItem(KEY); return t === "dark" || t === "light" ? t : null; } catch (e) { return null; } };

  // estado próprio: com View Transitions o DOM só muda no callback assíncrono,
  // então cliques rápidos não podem ler o tema do <html>
  let current = root.dataset.theme || stored() || (mq.matches ? "dark" : "light");
  function apply(theme) { root.dataset.theme = theme; }

  function toggle() {
    const next = current = current === "dark" ? "light" : "dark";
    btn.setAttribute("aria-pressed", String(next === "dark"));
    try { localStorage.setItem(KEY, next); } catch (e) {}
    if (reduced()) { apply(next); return; }
    if (document.startViewTransition) {
      // revelação circular a partir do botão, ecoando a tela de resultado
      const r = btn.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const vt = document.startViewTransition(() => apply(current)); // aplica o estado mais recente, não o capturado
      vt.ready.then(() => {
        root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
          { duration: 650, easing: "cubic-bezier(.75,0,.2,1)", pseudoElement: "::view-transition-new(root)" });
      }).catch(() => {});
      return;
    }
    root.classList.add("theme-fade");
    apply(next);
    setTimeout(() => root.classList.remove("theme-fade"), 400);
  }

  apply(current);
  btn.setAttribute("aria-pressed", String(current === "dark"));
  btn.addEventListener("click", toggle);
  // segue o sistema enquanto o usuário não escolher manualmente
  mq.addEventListener?.("change", e => { if (stored()) return;
    current = e.matches ? "dark" : "light"; apply(current); btn.setAttribute("aria-pressed", String(current === "dark")); });
})();
