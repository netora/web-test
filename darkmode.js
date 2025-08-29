// ダークモード切替（スムーズ化対応版）
// 初回ロード時の不要なフェードを防ぐため一時的にtransitionを無効化する
(function () {
  // 初期化関数（body生成後に実行）
  function init() {
    const BODY = document.body;
    if (!BODY) return; // 念のため
    BODY.classList.add("theme-no-transition");

    function setDarkModeIcon(isDark) {
      const sun = document.getElementById("icon-sun");
      const moon = document.getElementById("icon-moon");
      if (!sun || !moon) return;
      sun.style.display = isDark ? "inline" : "none";
      moon.style.display = isDark ? "none" : "inline";
    }

    function applyTheme(theme) {
      BODY.setAttribute("data-theme", theme);
      setDarkModeIcon(theme === "dark");
    }

    // グローバルに公開（既存onclick対応）
    window.toggleDarkMode = function toggleDarkMode() {
      const current =
        BODY.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      BODY.classList.add("theme-no-transition");
      void BODY.offsetWidth;
      BODY.classList.remove("theme-no-transition");
      applyTheme(next);
      localStorage.setItem("theme", next);
    };

    let theme = localStorage.getItem("theme");
    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      localStorage.setItem("theme", theme);
    }
    applyTheme(theme);
    requestAnimationFrame(() => BODY.classList.remove("theme-no-transition"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
