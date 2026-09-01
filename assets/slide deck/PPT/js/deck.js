(() => {
  const stage = document.getElementById("stage");
  const slides = Array.from(document.querySelectorAll('.slide:not([data-hidden="true"])'));
  const progress = document.getElementById("progress");
  const current = document.getElementById("current");
  const total = document.getElementById("total");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const fullscreen = document.getElementById("fullscreen");
  let index = 0;
  let touchStartX = null;

  const slideFromHash = () => {
    const match = location.hash.match(/slide-(\d+)/);
    if (!match) return 0;
    return Math.min(slides.length - 1, Math.max(0, Number(match[1]) - 1));
  };

  const resize = () => {
    const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
    document.documentElement.style.setProperty("--deck-scale", String(scale));
  };

  const show = (nextIndex, updateHash = true) => {
    index = Math.min(slides.length - 1, Math.max(0, nextIndex));
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      if (!active) slide.querySelectorAll("video").forEach((video) => video.pause());
    });
    current.textContent = String(index + 1);
    total.textContent = String(slides.length);
    progress.style.width = String(((index + 1) / slides.length) * 100) + "%";
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    document.title = String(index + 1) + "/" + String(slides.length) + " · " + slides[index].dataset.title;
    if (updateHash) history.replaceState(null, "", "#slide-" + String(index + 1));
  };

  const step = (amount) => show(index + amount);

  prev.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));
  fullscreen.addEventListener("click", async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  });

  document.addEventListener("keydown", (event) => {
    const interactive = event.target.closest("video, a, button");
    if (interactive && (event.key === " " || event.key === "Enter")) return;
    if (["ArrowRight", "PageDown", " ", "Enter"].includes(event.key)) {
      event.preventDefault();
      step(1);
    } else if (["ArrowLeft", "PageUp", "Backspace"].includes(event.key)) {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      show(0);
    } else if (event.key === "End") {
      show(slides.length - 1);
    } else if (event.key.toLowerCase() === "f") {
      fullscreen.click();
    }
  });

  stage.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  stage.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 60) step(delta < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });

  window.addEventListener("resize", resize);
  window.addEventListener("hashchange", () => show(slideFromHash(), false));
  resize();
  show(slideFromHash(), false);
})();
