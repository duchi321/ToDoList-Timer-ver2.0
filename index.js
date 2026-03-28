const displayCards = document.querySelector(".display-cards");
const cardsNone = document.querySelector(".cards-none");
const openBoxBtn = document.querySelector(".openbox");
const searchInput = document.querySelector(".search-input");
const modeChangeSwitch = document.querySelector(".change-mode");
const delAllBtn = document.querySelector(".delete-all-btn");

const model = {
  cardsData: JSON.parse(localStorage.getItem("cards")) || [],
  doneData: JSON.parse(localStorage.getItem("doneCards")) || [],
  currentFilter: "",
  createCard(title, content) {
    this.cardsData.push({
      id: Date.now(),
      title,
      content,
      startTime: Date.now(),
    });
  },
  saveLocalStorage() {
    localStorage.setItem("cards", JSON.stringify(this.cardsData));
  },
  saveLocalStorageDone() {
    localStorage.setItem("doneCards", JSON.stringify(this.doneData));
  },
};

const view = {
  cardTimerDom() {
    const timersDom = document.querySelectorAll(".timer[data-id]");
    return timersDom;
  },
  renderModal(title, opts) {
    const modalOverlay = document.createElement("div");
    modalOverlay.classList.add("message-box");

    const modal = document.createElement("div");
    modal.classList.add("modal", "add-modal", "animate-zoom-out");
    modal.innerHTML = `
    <h3 class="modal-title">${title}</h3>
    <input type="text" class="modal-input modal-title-input" placeholder="輸入標題" value="${opts.title}" />
    <textarea class="custom-scrollbar modal-content-input modal-input" placeholder="輸入內容">${opts.content}</textarea>
    <div class="modal-btns">
      <button class="confirm-btn">確認</button>
      <button class="cancel-btn">取消</button>
    </div>
  `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
    return {
      modalOverlay,
      modal,
      titleInput: modal.querySelector(".modal-title-input"),
      contentInput: modal.querySelector(".modal-content-input"),
      confirmBtn: modal.querySelector(".confirm-btn"),
      cancelBtn: modal.querySelector(".cancel-btn"),
    };
  },
  closeModal(modalOverlay) {
    document.body.removeChild(modalOverlay);
  },
  renderConfirmBox(message) {
    const messageBox = document.createElement("div");
    messageBox.classList.add("message-box");
    const modal = document.createElement("div");
    modal.classList.add("confirm-modal");
    modal.innerHTML = `
    <div class="confirm-box">
      <p class="confirm-message">${message}</p>
      <div class="modal-btns">
        <button class="confirm-btn">確定</button>
        <button class="cancel-btn">取消</button>
      </div>
    </div>
  `;
    messageBox.appendChild(modal);
    document.body.appendChild(messageBox);

    return messageBox;
  },
  renderPreviewModal(cardData, formattedTime) {
    const modalOverlay = document.createElement("div");
    modalOverlay.classList.add("message-box");
    const modal = document.createElement("div");
    modal.classList.add("modal", "add-modal", "animate-zoom-out");
    modal.innerHTML = `
      <h2 class="modal-input preview-title">${escapeHtml(cardData.title)}</h2>
      <div class="custom-scrollbar modal-input preview-content">${escapeHtml(
        cardData.content,
      )}</div>
      <div class="timer">${formattedTime}</div>
      <button class="close-preview-btn confirm-btn">確認</button>
  `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
    return {
      modalOverlay,
      modal,
      closeBtn: modal.querySelector(".close-preview-btn"),
      timerEl: modal.querySelector(".timer"),
    };
  },
  renderCardNone() {
    const warning = document.createElement("div");
    warning.classList.add("cardsCloseNone", "nonetext");
    warning.textContent = "none...";
    return warning;
  },
  renderRemoveNone(removeclass) {
    if (removeclass) removeclass.remove();
  },
  cardTemplate(data, formattedTime) {
    return `
   <div class="card-body">
      <h3 class="card-title card-text-show show-one">${escapeHtml(
        data.title,
      )}</h3>
      <div class="card-content">
        <div class="card-text card-text-show show-four">${escapeHtml(
          data.content,
        )}</div>
        <div class="timer" data-id="${data.id}">${formattedTime}</div>
      </div>
    </div>
    <ul class="card-setting">
        <li><i class="fa-solid fa-pen-to-square edit-btn card-setting-button"></i></li>
        <li><i class="fa-solid fa-circle-check card-done card-setting-button"></i></li>
        <li><i class="fa-solid fa-circle-xmark delete-btn card-setting-button"></i></li>
    </ul>
  `;
  },
  listTemplate(data, formattedTime) {
    return `
    <li class="list-item">
      <div class="list-title-group">
        <div class="timer list-timer-style" data-id="${data.id}">${formattedTime}</div>
        <h3 class="list-title card-text-show show-one">${escapeHtml(
          data.title,
        )}</h3>
      </div>
      <div class="list-content card-text-show show-three">${escapeHtml(
        data.content,
      )}</div>
      <div class="list-setting">
        <i class="fa-solid fa-pen-to-square edit-btn card-setting-button list-button"></i>
        <i class="fa-solid fa-circle-check card-done card-setting-button list-button"></i>
        <i class="fa-solid fa-circle-xmark delete-btn card-setting-button list-button"></i>
      </div>
    </li>
  `;
  },
  renderCards(data) {
    displayCards.innerHTML = "";
    const mode = displayCards.dataset.mode;
    const isCardMode = mode === "card-mode";
    // ⭐ 模式設定集中管理
    const modeConfig = {
      tag: isCardMode ? "div" : "ul",
      wrapperClass: isCardMode ? "card" : "list-group",
      animationClass: isCardMode ? "animate-fade-down" : "animate-fade-right",
      containerClass: isCardMode ? "card-mode" : "list-mode",
      removeClass: isCardMode ? "list-mode" : "card-mode",
    };

    displayCards.classList.add(modeConfig.containerClass);
    displayCards.classList.remove(modeConfig.removeClass);
    const now = Date.now();
    data.forEach((card) => {
      const elapsed = Math.floor((now - (card.startTime || now)) / 1000);
      const formattedTime = controller.formatTime(elapsed);
      const cardDiv = document.createElement(modeConfig.tag);
      cardDiv.classList.add(modeConfig.wrapperClass, modeConfig.animationClass);

      cardDiv.dataset.id = card.id;

      cardDiv.innerHTML = isCardMode
        ? this.cardTemplate(card, formattedTime)
        : this.listTemplate(card, formattedTime);

      displayCards.appendChild(cardDiv);
    });
  },
  renderCardsTimer(timerItem, elapsed) {
    timerItem.textContent = controller.formatTime(elapsed);
  },
  renderSearchString() {
    displayCards.innerHTML = "";
    const noneEl = cardsNone.firstElementChild;
    if (noneEl) noneEl.remove();
    const stringDiv = document.createElement("div");
    stringDiv.textContent = "查無符合結果 !";
    displayCards.appendChild(stringDiv);
  },
};

const controller = {
  // 切換模式
  updateMode(mode) {
    if (displayCards.dataset.mode === mode) return;
    displayCards.dataset.mode = mode;
    if (model.currentFilter) {
      this.searchFilters(model.currentFilter);
    } else {
      this.refreshCards(model.cardsData);
    }
  },
  // 切換模式按鈕
  changeModeBtn() {
    modeChangeSwitch.addEventListener("click", (e) => {
      if (e.target.matches(".card-mode-button")) {
        this.updateMode("card-mode");
      } else if (e.target.matches(".list-mode-button")) {
        this.updateMode("list-mode");
      }
    });
  },
  syncNoneState() {
    const hasCards = displayCards.children.length > 0;
    const noneEl = cardsNone.firstElementChild;

    if (hasCards && noneEl) {
      view.renderRemoveNone(noneEl);
    }

    if (!hasCards && !noneEl) {
      cardsNone.appendChild(view.renderCardNone());
    }
  },
  refreshCards(data) {
    view.renderCards(data);
    this.syncNoneState();
  },
  showConfirmBox(message, onConfirm) {
    const messageBox = view.renderConfirmBox(message);
    const confirmBtn = messageBox.querySelector(".confirm-btn");
    const cancelBtn = messageBox.querySelector(".cancel-btn");
    confirmBtn.addEventListener("click", () => {
      document.body.removeChild(messageBox);
      if (typeof onConfirm === "function") onConfirm();
    });
    cancelBtn.addEventListener("click", () => {
      document.body.removeChild(messageBox);
    });
  },
  // 新增按鈕
  createInfoBtn() {
    openBoxBtn.addEventListener("click", () => {
      this.createModal("新增項目", {
        onConfirm: (title, content) => {
          model.createCard(title, content);
          model.saveLocalStorage();
          this.refreshCards(model.cardsData);
        },
      });
    });
  },
  // 建立互動視窗 (Modal)
  createModal(title, options = {}) {
    const opts = {
      editId: options.editId || null,
      title: options.title || "",
      content: options.content || "",
      onConfirm: options.onConfirm || function () {},
    };

    const modal = view.renderModal(title, opts);

    modal.confirmBtn.addEventListener("click", () => {
      const titleValue = modal.titleInput.value.trim();
      const contentValue = modal.contentInput.value.trim();
      if (!titleValue) {
        alert("請輸入標題！");
        return;
      }
      if (titleValue.length > 22) {
        alert("標題過長！請重新輸入");
        return;
      }
      opts.onConfirm(titleValue, contentValue, opts.editId);
      view.closeModal(modal.modalOverlay);
    });

    modal.cancelBtn.addEventListener("click", () => {
      view.closeModal(modal.modalOverlay);
    });
  },
  // 卡片事件委派
  bindCardsDelegation() {
    displayCards.addEventListener("click", (e) => {
      const cardEl = e.target.closest("[data-id]");
      if (!cardEl) return;

      const id = Number(cardEl.dataset.id);
      const cardData = model.cardsData.find((item) => item.id === id);

      // 編輯
      if (e.target.closest(".edit-btn")) {
        this.editModal(id);
        return;
      }

      // 完成
      if (e.target.closest(".card-done")) {
        this.doneCard(id);
        return;
      }

      // 刪除
      if (e.target.closest(".delete-btn")) {
        this.deleteCard(id);
        return;
      }

      // 預覽（點卡片其他地方）
      if (cardData) {
        this.openPreviewModal(cardData);
      }
    });
  },
  // 搜尋功能
  searchCard() {
    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.trim().toLowerCase();
      this.searchFilters(keyword);
    });
  },
  searchFilters(keyword) {
    model.currentFilter = keyword;
    if (!keyword) {
      this.refreshCards(model.cardsData);
      return;
    }

    const filtered = model.cardsData.filter((card) => {
      const titleMatch = (card.title || "").toLowerCase().includes(keyword);
      const contentMatch = (card.content || "").toLowerCase().includes(keyword);
      return titleMatch || contentMatch;
    });

    if (filtered.length === 0) {
      view.renderSearchString();
      this.syncNoneState();
      return;
    }

    this.refreshCards(filtered);
  },
  // 預覽卡片
  openPreviewModal(cardData) {
    const now = Date.now();
    const elapsed = Math.floor((now - (cardData.startTime || now)) / 1000);

    const formattedTime = controller.formatTime(elapsed);
    const previewModal = view.renderPreviewModal(cardData, formattedTime);
    const timerId = this.startPreviewTimer(cardData, previewModal.timerEl);

    // 點背景關閉
    previewModal.modalOverlay.addEventListener("click", (e) => {
      if (e.target === previewModal.modalOverlay) {
        this.closePreview(previewModal.modalOverlay, timerId);
      }
    });

    // 點按鈕關閉
    previewModal.closeBtn.addEventListener("click", () => {
      this.closePreview(previewModal.modalOverlay, timerId);
    });
  },
  startPreviewTimer(cardData, timerEl) {
    return setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - (cardData.startTime || now)) / 1000);
      timerEl.textContent = this.formatTime(elapsed);
    }, 1000);
  },
  closePreview(overlay, timerId) {
    clearInterval(timerId);
    view.closeModal(overlay);
  },

  // 編輯卡片
  editModal(id) {
    const editCard = model.cardsData.find((item) => item.id === id);
    if (!editCard) return;
    controller.createModal("編輯項目", {
      editId: id,
      title: editCard.title,
      content: editCard.content,
      onConfirm: (newTitle, newContent, editId) => {
        const index = model.cardsData.findIndex((item) => item.id === editId);
        if (index !== -1) {
          model.cardsData[index].title = newTitle;
          model.cardsData[index].content = newContent;
          model.saveLocalStorage();
          this.refreshCards(model.cardsData);
        }
      },
    });
  },
  // 確認完成卡片
  doneCard(id) {
    this.showConfirmBox("確定此項目已完成？", () => {
      const card = model.cardsData.find((item) => item.id === id);
      if (!card) return;
      // 記錄當下停止時間
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - (card.startTime || now)) / 1000);
      // 封裝成完成資料
      const saveData = {
        ...card,
        completedTime: now, // 完成時間
        elapsedTime: elapsedSeconds, // 停止時的經過秒數
      };
      model.cardsData = model.cardsData.filter((item) => item.id !== id);
      model.doneData.push(saveData);
      model.saveLocalStorage();
      model.saveLocalStorageDone();
      this.refreshCards(model.cardsData);
    });
  },
  // 刪除卡片
  deleteCard(id) {
    this.showConfirmBox("確定刪除此項目？", () => {
      model.cardsData = model.cardsData.filter((item) => item.id !== id);
      model.saveLocalStorage();
      if (model.currentFilter) {
        this.searchFilters(model.currentFilter);
      } else {
        this.refreshCards(model.cardsData);
      }
    });
  },
  deleteAllCard() {
    delAllBtn.addEventListener("click", () => {
      this.showConfirmBox("確定刪除所有項目？", () => {
        model.cardsData = [];
        model.currentFilter = "";
        searchInput.value = "";
        model.saveLocalStorage();
        this.refreshCards(model.cardsData);
      });
    });
  },
  startCardTimer() {
    if (this.cardTimerInterval) clearInterval(this.cardTimerInterval);

    this.cardTimerInterval = setInterval(() => {
      this.updateCardsTimers();
    }, 1000);
  },
  updateCardsTimers() {
    const timers = view.cardTimerDom();
    const now = Date.now();
    timers.forEach((timerItem) => {
      const id = Number(timerItem.dataset.id);
      const card = model.cardsData.find((item) => item.id === id);
      if (!card) return;

      const elapsed = Math.floor((now - (card.startTime || now)) / 1000);
      view.renderCardsTimer(timerItem, elapsed);
    });
  },
  // 時間格式化（根據秒數顯示對應單位）
  formatTime(seconds) {
    seconds = Number(seconds) || 0;
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}天 - ${this.pad(hours)} : ${this.pad(minutes)} : ${this.pad(secs)}`;
    } else if (hours > 0) {
      return `${this.pad(hours)} : ${this.pad(minutes)} : ${this.pad(secs)}`;
    } else if (minutes > 0) {
      return `${this.pad(minutes)} : ${this.pad(secs)}`;
    } else {
      return `${secs}秒`;
    }
  },
  pad(num) {
    return String(num).padStart(2, "0");
  },
  start() {
    this.startCardTimer();
    this.refreshCards(model.cardsData);
    this.changeModeBtn();
    this.createInfoBtn();
    this.bindCardsDelegation();
    this.searchCard();
    this.deleteAllCard();
  },
};

// 初始載入
window.addEventListener("DOMContentLoaded", () => {
  controller.start();
});

/* 小工具：簡單防 XSS 的 escape（可選） */
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
