// ダークモード切替

// ダークモード切替
function toggleDarkMode() {
  const isDark = document.body.getAttribute("data-theme") === "dark";
  const nextTheme = isDark ? "light" : "dark";
  document.body.setAttribute("data-theme", nextTheme);
  localStorage.setItem("theme", nextTheme);
  setDarkModeIcon(nextTheme === "dark");
}

function setDarkModeIcon(isDark) {
  const sun = document.getElementById("icon-sun");
  const moon = document.getElementById("icon-moon");
  if (!sun || !moon) return;
  sun.style.display = isDark ? "inline" : "none";
  moon.style.display = isDark ? "none" : "inline";
}

// ページ読み込み時にテーマを適用
window.addEventListener("DOMContentLoaded", function () {
  let theme = localStorage.getItem("theme");
  if (!theme) {
    // OSのカラースキームを取得
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    localStorage.setItem("theme", theme);
  }
  const isDark = theme === "dark";
  document.body.setAttribute("data-theme", isDark ? "dark" : "light");
  setDarkModeIcon(isDark);
});
