const currentYear = document.querySelectorAll(".current-year");
const currentDate = document.querySelectorAll(".current-date");
const currentTime = document.querySelectorAll(".current-time");
const currentSec = document.querySelectorAll(".current-sec");
const paletteButton = document.querySelector(".palette-button");
const palettelist = document.querySelector(".palette-list");
const howToUse = document.querySelector(".how-to-use");
const root = document.documentElement;

const publicModel = {
  theme: localStorage.getItem("todo-theme") || "default",
  getdataDate() {
    return new Date();
  },
  saveLocalStorageTheme() {
    localStorage.setItem("todo-theme", this.theme);
  },
};

const publicView = {
  renderCurrentTime() {
    const now = publicModel.getdataDate();
    const year = now.getFullYear();
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    const day = ("0" + now.getDate()).slice(-2);
    const hours = ("0" + now.getHours()).slice(-2);
    const minutes = ("0" + now.getMinutes()).slice(-2);
    const seconds = ("0" + now.getSeconds()).slice(-2);
    currentYear.forEach((el) => (el.textContent = year));
    currentDate.forEach(
      (el) => (el.innerHTML = ` ${month} <span>/</span> ${day}`),
    );
    currentTime.forEach((el) => (el.textContent = `${hours} : ${minutes}`));
    currentSec.forEach((el) => (el.textContent = seconds));
  },
  renderOpenPalette() {
    palettelist.classList.add("show");
  },
  renderClosePalette() {
    palettelist.classList.remove("show");
  },
  renderTheme(theme) {
    root.className = "";
    if (theme !== "default") {
      root.classList.add(`theme-${theme}`);
    }
  },
  renderHowToUse() {
    const modalOverlay = document.createElement("div");
    modalOverlay.classList.add("message-box");
    const modal = document.createElement("div");
    modal.classList.add("modal", "use-modal", "animate-zoom-out");
    modal.innerHTML = `
    <h2 class="use-modal-title">How To Use</h2>
    <div class="modal-input use-preview-content custom-scrollbar">
      <div class="use-container">
        <h3>這是個賦予時間功能的待辦事項清單(To-Do List)。</h3>
        <div class="section-one">
          <h3>特色</h3>
          <ol>
            <li>增加了時間功能:
              <ul>
                <li><span>◆</span>新增事件會顯示事件進行的時間。</li>
                <li><span>◆</span>完成事件後，將會記載完成的時間點。</li>
                <li><span>◆</span>完成事件後，將會記載耗時總時數。</li>
              </ul>
            </li>
            <li>有事件完成的獨立頁面</li>
            <li>可搜尋事件，快速尋找想要的事件。</li>
            <li>點擊事件卡片，將顯示更完整的事件敘述。</li>
            <li>切換顯示模式，卡片模式/橫向標籤模式。</li>
          </ol>
        </div>
        <div class="section-two">
          <ul>
            <li><i class="fa-solid fa-square-plus use-icon"></i>
              <p>新增事件按鈕</p>
            </li>
            <li><i class="fa-solid fa-house use-icon"></i>
              <p>事件狀態儀表板</p>
            </li>
            <li><i class="fa-solid fa-circle-check use-icon"></i>
              <p>事件完成儀表板</p>
            </li>
            <li><i class="fa-solid fa-palette use-icon"></i>
              <p>更換介面顏色按鈕</p>
            </li>
            <li>
              <div class="use-toggle-box change-mode" role="group" aria-label="View mode selection">
                <i class="fa fa-th use-icon" aria-label="Card view"></i>
                <i class="fa fa-bars use-icon" aria-label="List view"></i>
              </div>
              <p>更換顯示模式</p>
            </li>
            <li><i class="fa-solid fa-circle-xmark use-delete-all-btn"></i>
              <p>刪除全部資料</p>
            </li>
          </ul>
        </div>
        <div class="section-three">
          <div class="use-card-left">
            <div class="use-card-body">
              <h3 class="card-title">title</h3>
              <div class="card-content">
                <div class="card-text">content</div>
                <div class="timer">66天 - 66:66:66</div>
              </div>
            </div>
            <ul class="card-setting">
              <li><i class="fa-solid fa-pen-to-square edit-btn card-setting-button"></i></li>
              <li><i class="fa-solid fa-circle-check card-done card-setting-button"></i></li>
              <li><i class="fa-solid fa-circle-xmark delete-btn card-setting-button"></i></li>
            </ul>
          </div>
          <div class="section-three-right">
            <li>
              <i class="fa-solid fa-pen-to-square edit-btn card-setting-button"></i>
              <p>編輯 - 編輯這張卡片內容</p>
            </li>
            <li>
              <i class="fa-solid fa-circle-check card-done card-setting-button"></i>
              <p>完成 - 該項目加入完成頁面</p>
            </li>
            <li>
              <i class="fa-solid fa-circle-xmark delete-btn card-setting-button"></i>
              <p>刪除這張卡片</p>
            </li>
          </div>
        </div>
      </div>
    </div>
    <button class="close-preview-btn confirm-btn">確認</button>
  `;
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    return {
      modalOverlay,
      closeBtn: modal.querySelector(".confirm-btn"),
    };
  },
  closeModal(modalOverlay) {
    document.body.removeChild(modalOverlay);
  },
};

const publicController = {
  getCurrentTime() {
    setInterval(() => publicView.renderCurrentTime(), 1000);
    publicView.renderCurrentTime();
  },
  // palette
  paletteController() {
    paletteButton.addEventListener("click", (e) => {
      e.stopPropagation();
      palettelist.classList.toggle("show");
    });
    // === 套用主題 ===
    palettelist.addEventListener("click", (e) => {
      e.stopPropagation();
      const btn = e.target.closest("[data-theme]");
      if (!btn) {
        publicView.renderClosePalette();
        return;
      }
      const theme = btn.dataset.theme;
      publicModel.theme = theme;
      publicView.renderTheme(theme);
      publicModel.saveLocalStorageTheme();
      publicView.renderClosePalette();
    });
    /* 點外面自動關閉 */
    document.addEventListener("click", (e) => {
      if (
        !paletteButton.contains(e.target) &&
        !palettelist.contains(e.target)
      ) {
        publicView.renderClosePalette();
      }
    });
  },
  localTheme() {
    publicView.renderTheme(publicModel.theme);
  },
  openHowToUseModal() {
    // 點背景關閉
    howToUse.addEventListener("click", () => {
      const messageBox = publicView.renderHowToUse();
      const modalOverlay = messageBox.modalOverlay;
      // 點按鈕關閉
      messageBox.closeBtn.addEventListener("click", () => {
        view.closeModal(modalOverlay);
      });
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
          view.closeModal(modalOverlay);
        }
      });
    });
  },
  start() {
    this.getCurrentTime();
    this.localTheme();
    this.paletteController();
    this.openHowToUseModal();
  },
};

// 初始載入
window.addEventListener("DOMContentLoaded", () => {
  publicController.start();
});
