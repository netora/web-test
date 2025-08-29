// モバイルメニューの制御
document.addEventListener("DOMContentLoaded", function () {
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mainNav = document.getElementById("main-nav");
  const closeSymbol = document.querySelector("#menu-close-btn .close-symbol");

  // ARIA 初期設定
  if (hamburgerBtn && mainNav) {
    hamburgerBtn.setAttribute("aria-controls", "main-nav");
    hamburgerBtn.setAttribute("aria-expanded", "false");
    mainNav.setAttribute("aria-hidden", "true");
    mainNav.setAttribute("role", "navigation");
    if (!mainNav.getAttribute("aria-label")) {
      mainNav.setAttribute("aria-label", "メインナビゲーション");
    }
  }

  // =============================
  // メニューアクセシビリティ強化
  // - role="menubar" / role="menuitem" 付与
  // - aria-haspopup / aria-expanded 管理
  // - 矢印キー/ESC キーボード操作
  // =============================
  function enhanceMenuAccessibility() {
    if (!mainNav) return;
    const menuRoot = mainNav.querySelector(".menu");
    if (!menuRoot) return;
    menuRoot.setAttribute("role", "menubar");

    const topLevelLis = Array.from(menuRoot.children);
    const topLevelLinks = [];
    topLevelLis.forEach((li) => {
      li.setAttribute("role", "none"); // プレゼンテーション用
      const link = li.querySelector(":scope > a");
      if (link) {
        link.setAttribute("role", "menuitem");
        link.setAttribute("tabindex", "0");
        topLevelLinks.push(link);
        const submenu = li.querySelector(":scope > .dropdown-menu");
        if (submenu) {
          submenu.setAttribute("role", "menu");
          submenu.setAttribute("aria-hidden", "true");
          link.setAttribute("aria-haspopup", "true");
          link.setAttribute("aria-expanded", "false");
          // サブメニュー内
          const subLis = Array.from(submenu.children);
          subLis.forEach((sli) => {
            sli.setAttribute("role", "none");
            const sLink = sli.querySelector(":scope > a");
            if (sLink) {
              sLink.setAttribute("role", "menuitem");
              sLink.setAttribute("tabindex", "-1");
            }
          });
        }
      }
    });

    function openSubmenu(link) {
      const submenu =
        link && link.parentElement.querySelector(":scope > .dropdown-menu");
      if (!submenu) return;
      submenu.classList.add("open");
      submenu.setAttribute("aria-hidden", "false");
      link.classList.add("expanded");
      link.setAttribute("aria-expanded", "true");
    }
    function closeSubmenu(link, focusParent = false) {
      const submenu =
        link &&
        link.parentElement.querySelector(":scope > .dropdown-menu.open");
      if (!submenu) return;
      submenu.classList.remove("open");
      submenu.setAttribute("aria-hidden", "true");
      link.classList.remove("expanded");
      link.setAttribute("aria-expanded", "false");
      if (focusParent) link.focus();
    }
    function closeAllSubmenus() {
      topLevelLinks.forEach((l) => closeSubmenu(l));
    }

    // トップレベルメニュー矢印ナビゲーション
    topLevelLinks.forEach((link, index) => {
      link.addEventListener("keydown", (e) => {
        const key = e.key;
        const hasSub = !!link.parentElement.querySelector(
          ":scope > .dropdown-menu"
        );
        if (key === "ArrowRight") {
          e.preventDefault();
          const next = topLevelLinks[(index + 1) % topLevelLinks.length];
          next.focus();
        } else if (key === "ArrowLeft") {
          e.preventDefault();
          const prev =
            topLevelLinks[
              (index - 1 + topLevelLinks.length) % topLevelLinks.length
            ];
          prev.focus();
        } else if (key === "ArrowDown") {
          if (hasSub) {
            e.preventDefault();
            if (!link.classList.contains("expanded")) {
              openSubmenu(link);
            }
            const firstItem =
              link.parentElement.querySelector(".dropdown-menu a");
            if (firstItem) firstItem.focus();
          }
        } else if (key === "Escape") {
          if (link.classList.contains("expanded")) {
            e.preventDefault();
            closeSubmenu(link, true);
          }
        } else if (key === "Enter" || key === " ") {
          if (hasSub) {
            // サブメニュー展開/閉じ
            e.preventDefault();
            if (link.classList.contains("expanded")) {
              closeSubmenu(link, true);
            } else {
              openSubmenu(link);
              const firstItem =
                link.parentElement.querySelector(".dropdown-menu a");
              if (firstItem) firstItem.focus();
            }
          }
        }
      });
    });

    // サブメニュー内のキーボード操作
    menuRoot.querySelectorAll(".dropdown-menu").forEach((submenu) => {
      const items = Array.from(submenu.querySelectorAll("a"));
      items.forEach((a, idx) => {
        a.addEventListener("keydown", (e) => {
          const key = e.key;
          const parentTrigger =
            submenu.parentElement.querySelector(":scope > a");
          if (key === "ArrowDown") {
            e.preventDefault();
            const next = items[(idx + 1) % items.length];
            next.focus();
          } else if (key === "ArrowUp") {
            e.preventDefault();
            const prev = items[(idx - 1 + items.length) % items.length];
            prev.focus();
          } else if (key === "Home") {
            e.preventDefault();
            items[0].focus();
          } else if (key === "End") {
            e.preventDefault();
            items[items.length - 1].focus();
          } else if (key === "Escape") {
            e.preventDefault();
            closeSubmenu(parentTrigger, true);
          } else if (key === "ArrowLeft") {
            // サブメニューを閉じて前のトップレベルへ
            e.preventDefault();
            closeSubmenu(parentTrigger);
            const idxTop = topLevelLinks.indexOf(parentTrigger);
            if (idxTop > -1) {
              const prevTop =
                topLevelLinks[
                  (idxTop - 1 + topLevelLinks.length) % topLevelLinks.length
                ];
              prevTop.focus();
            }
          } else if (key === "ArrowRight") {
            e.preventDefault();
            closeSubmenu(parentTrigger);
            const idxTop = topLevelLinks.indexOf(parentTrigger);
            if (idxTop > -1) {
              const nextTop =
                topLevelLinks[(idxTop + 1) % topLevelLinks.length];
              nextTop.focus();
            }
          }
        });
      });
    });

    // フォーカス外れでサブメニュー全閉 (遅延で次要素へのフォーカス移動を許可)
    mainNav.addEventListener("focusout", (e) => {
      // 50ms 後に nav 内にフォーカスが残っているか判定
      setTimeout(() => {
        if (!mainNav.contains(document.activeElement)) {
          closeAllSubmenus();
        }
      }, 50);
    });
  }

  enhanceMenuAccessibility();

  // ハンバーガーボタンクリック
  hamburgerBtn.addEventListener("click", function () {
    const opening = !hamburgerBtn.classList.contains("active");
    hamburgerBtn.classList.toggle("active", opening);
    mainNav.classList.toggle("show", opening);
    hamburgerBtn.setAttribute("aria-expanded", opening ? "true" : "false");
    mainNav.setAttribute("aria-hidden", opening ? "false" : "true");
    if (!opening && typeof resetDropdowns === "function") resetDropdowns();
  });

  // ×印クリックでメニューを閉じる
  if (closeSymbol) {
    closeSymbol.style.cursor = "pointer";
    closeSymbol.addEventListener("click", function (e) {
      e.stopPropagation();
      mainNav.classList.remove("show");
      hamburgerBtn.classList.remove("active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
      mainNav.setAttribute("aria-hidden", "true");
      if (typeof resetDropdowns === "function") resetDropdowns();
    });
  }

  // メニューアイテムクリック時にメニューを閉じる（ドロップダウン親要素は除く）
  const menuLinks = mainNav.querySelectorAll(".menu a");
  menuLinks.forEach((link) => {
    link.addEventListener("click", function () {
      // ドロップダウンの親要素でなく、モバイル表示時でない場合のみメニューを閉じる
      const isDropdownParent =
        this.parentElement.classList.contains("dropdown");
      if (!isDropdownParent || window.innerWidth > 768) {
        mainNav.classList.remove("show");
        hamburgerBtn.classList.remove("active");
        hamburgerBtn.setAttribute("aria-expanded", "false");
        mainNav.setAttribute("aria-hidden", "true");
      }
    });
  });

  // モバイルでのドロップダウンメニュー制御
  const dropdownItems = mainNav.querySelectorAll(".dropdown > a");
  dropdownItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      // モバイル表示時のみドロップダウン制御
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const dropdownMenu = this.nextElementSibling;
        if (dropdownMenu && dropdownMenu.classList.contains("dropdown-menu")) {
          const nowOpen = !dropdownMenu.classList.contains("open");
          dropdownMenu.classList.toggle("open", nowOpen);
          this.classList.toggle("expanded", nowOpen);
          this.setAttribute("aria-expanded", nowOpen ? "true" : "false");
          dropdownMenu.setAttribute("aria-hidden", nowOpen ? "false" : "true");
          dropdownMenu.setAttribute("role", "menu");
          this.setAttribute("role", "button");
        }
      }
    });
  });

  // メニュー外をクリックして閉じる
  document.addEventListener("click", function (e) {
    if (!mainNav.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      mainNav.classList.remove("show");
      hamburgerBtn.classList.remove("active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
      mainNav.setAttribute("aria-hidden", "true");
      resetDropdowns();
    }
  });

  // ESCキーで閉じる
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      mainNav.classList.remove("show");
      hamburgerBtn.classList.remove("active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
      mainNav.setAttribute("aria-hidden", "true");
      resetDropdowns();
    }
  });

  // ウィンドウリサイズ時の処理
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      mainNav.classList.remove("show");
      hamburgerBtn.classList.remove("active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
      mainNav.setAttribute("aria-hidden", "true");
      resetDropdowns();
    }
  });

  // ドロップダウンをリセットする関数
  function resetDropdowns() {
    const dropdownMenus = mainNav.querySelectorAll(".dropdown-menu");
    const dropdownLinks = mainNav.querySelectorAll(".dropdown > a");

    dropdownMenus.forEach((menu) => {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
    });

    dropdownLinks.forEach((link) => {
      link.classList.remove("expanded");
      link.setAttribute("aria-expanded", "false");
      // サブメニュー aria-hidden 再設定
    });
  }

  // レスポンシブ画像の処理
  function makeImagesResponsive() {
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.hasAttribute("width") && !img.hasAttribute("height")) {
        img.style.maxWidth = "100%";
        img.style.height = "auto";
      }
    });
  }

  // 画像のレスポンシブ化を実行
  makeImagesResponsive();

  // 動的に追加される画像にも対応
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            // 要素ノード
            if (node.tagName === "IMG") {
              if (!node.hasAttribute("width") && !node.hasAttribute("height")) {
                node.style.maxWidth = "100%";
                node.style.height = "auto";
              }
            }
            // 子要素の画像もチェック
            const childImages = node.querySelectorAll
              ? node.querySelectorAll("img")
              : [];
            childImages.forEach((img) => {
              if (!img.hasAttribute("width") && !img.hasAttribute("height")) {
                img.style.maxWidth = "100%";
                img.style.height = "auto";
              }
            });
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
