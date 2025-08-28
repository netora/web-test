// モバイルメニューの制御
document.addEventListener("DOMContentLoaded", function () {
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mainNav = document.getElementById("main-nav");

  // ハンバーガーボタンクリック
  hamburgerBtn.addEventListener("click", function () {
    if (hamburgerBtn.classList.contains("active")) {
      // ×状態でクリック → メニューを閉じる
      mainNav.classList.remove("show");
      hamburgerBtn.classList.remove("active");
      if (typeof resetDropdowns === "function") resetDropdowns();
    } else {
      // 通常状態でクリック → メニューを開く
      mainNav.classList.add("show");
      hamburgerBtn.classList.add("active");
    }
  });

  // ×印クリックでメニューを閉じる
  if (closeSymbol) {
    closeSymbol.style.cursor = "pointer";
    closeSymbol.addEventListener("click", function (e) {
      e.stopPropagation();
      mainNav.classList.remove("show");
      hamburgerBtn.classList.remove("active");
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
          dropdownMenu.classList.toggle("open");
          this.classList.toggle("expanded");
        }
      }
    });
  });

  // メニュー外をクリックして閉じる
  document.addEventListener("click", function (e) {
    if (!mainNav.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      mainNav.classList.remove("show");
      hamburgerBtn.classList.remove("active");
      resetDropdowns();
    }
  });

  // ESCキーで閉じる
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      mainNav.classList.remove("show");
      hamburgerBtn.classList.remove("active");
      resetDropdowns();
    }
  });

  // ウィンドウリサイズ時の処理
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      mainNav.classList.remove("show");
      hamburgerBtn.classList.remove("active");
      resetDropdowns();
    }
  });

  // ドロップダウンをリセットする関数
  function resetDropdowns() {
    const dropdownMenus = mainNav.querySelectorAll(".dropdown-menu");
    const dropdownLinks = mainNav.querySelectorAll(".dropdown > a");

    dropdownMenus.forEach((menu) => {
      menu.classList.remove("open");
    });

    dropdownLinks.forEach((link) => {
      link.classList.remove("expanded");
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
