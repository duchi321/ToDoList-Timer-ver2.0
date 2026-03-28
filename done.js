const displayCards = document.querySelector(".display-cards");
const cardsNone = document.querySelector(".cards-none");
const searchInput = document.querySelector(".search-input");
const modeChangeSwitch = document.querySelector(".change-mode");
const delAllBtn = document.querySelector(".delete-all-btn");

const model = {
  doneData: JSON.parse(localStorage.getItem("doneCards")) || [],
  currentFilter: "",
  saveLocalStorageDone() {
    localStorage.setItem("doneCards", JSON.stringify(this.doneData));
  },
};

const view = {
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
  renderPreviewModal(cardData, formattedTime, formattedCompleted) {
    const modalOverlay = document.createElement("div");
    modalOverlay.classList.add("message-box");
    const modal = document.createElement("div");
    modal.classList.add("modal", "add-modal", "animate-zoom-out");
    modal.innerHTML = `
      <h2 class="modal-input preview-title">${escapeHtml(cardData.title)}</h2>
      <div class="modal-input preview-content">${escapeHtml(
        cardData.content,
      )}</div>
      <div class="card-timer">耗時：${formattedTime}</div>
      <div class="card-completed-time">完成於：${formattedCompleted}</div>
      <button class="close-preview-btn confirm-btn">確認</button>
  `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
    return {
      modalOverlay,
      modal,
      closeBtn: modal.querySelector(".close-preview-btn"),
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
        <div class="timer" data-id="${data.id}">耗時: ${formattedTime}</div>
      </div>
    </div>
    <ul class="card-setting">
        <li><i class="fa-solid fa-circle-xmark delete-btn card-setting-button"></i></li>
    </ul>
  `;
  },
  listTemplate(data, formattedTime) {
    return `
    <li class="list-item">
      <div class="list-title-group">
        <div class="timer list-timer-style" data-id="${data.id}">耗時: ${formattedTime}</div>
        <h3 class="list-title card-text-show show-one">${escapeHtml(
          data.title,
        )}</h3>
      </div>
      <div class="list-content card-text-show show-three">${escapeHtml(
        data.content,
      )}</div>
      <div class="list-setting">
        <i class="fa-solid fa-circle-xmark delete-btn card-setting-button list-button"></i>
      </div>
    </li>
  `;
  },
  renderCards(data) {
    displayCards.innerHTML = "";
    const mode = displayCards.dataset.mode;
    const isCardMode = mode === "card-mode";

    const modeConfig = {
      tag: isCardMode ? "div" : "ul",
      wrapperClass: isCardMode ? "card" : "list-group",
      animationClass: isCardMode ? "animate-fade-down" : "animate-fade-right",
      containerClass: isCardMode ? "card-mode" : "list-mode",
      removeClass: isCardMode ? "list-mode" : "card-mode",
    };

    displayCards.classList.add(modeConfig.containerClass);
    displayCards.classList.remove(modeConfig.removeClass);
    data.forEach((card) => {
      const formattedTime = controller.formatTime(card.elapsedTime, true);

      const cardDiv = document.createElement(modeConfig.tag);
      cardDiv.classList.add(modeConfig.wrapperClass, modeConfig.animationClass);

      cardDiv.dataset.id = card.id;

      cardDiv.innerHTML = isCardMode
        ? this.cardTemplate(card, formattedTime)
        : this.listTemplate(card, formattedTime);

      displayCards.appendChild(cardDiv);
    });
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
      this.refreshCards(model.doneData);
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
  // 卡片事件委派
  bindCardsDelegation() {
    displayCards.addEventListener("click", (e) => {
      const cardEl = e.target.closest("[data-id]");
      if (!cardEl) return;

      const id = Number(cardEl.dataset.id);
      const cardData = model.doneData.find((item) => item.id === id);

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
      this.refreshCards(model.doneData);
      return;
    }

    const filtered = model.doneData.filter((card) => {
      const titleMatch = (card.title || "").toLowerCase().includes(keyword);
      const contentMatch = (card.content || "").toLowerCase().includes(keyword);
      return titleMatch || contentMatch;
    });

    if (filtered.length === 0) {
      view.renderSearchString();
      return;
    }

    this.refreshCards(filtered);
  },
  // 預覽卡片
  openPreviewModal(cardData) {
    const formattedTime = controller.formatTime(cardData.elapsedTime || 0);
    const formattedCompleted = this.formatCompletedTime(cardData.completedTime);
    const previewModal = view.renderPreviewModal(
      cardData,
      formattedTime,
      formattedCompleted,
    );
    // 點背景關閉
    previewModal.modalOverlay.addEventListener("click", (e) => {
      if (e.target === previewModal.modalOverlay) {
        view.closeModal(previewModal.modalOverlay);
      }
    });
    // 點按鈕關閉
    previewModal.closeBtn.addEventListener("click", () => {
      view.closeModal(previewModal.modalOverlay);
    });
  },
  // 刪除卡片
  deleteCard(id) {
    this.showConfirmBox("確定刪除此項目？", () => {
      model.doneData = model.doneData.filter((item) => item.id !== id);
      model.saveLocalStorageDone();
      if (model.currentFilter) {
        this.searchFilters(model.currentFilter);
      } else {
        this.refreshCards(model.doneData);
      }
    });
  },
  deleteAllCard() {
    delAllBtn.addEventListener("click", () => {
      this.showConfirmBox("確定刪除所有項目？", () => {
        model.doneData = [];
        model.currentFilter = "";
        searchInput.value = "";
        model.saveLocalStorageDone();
        this.refreshCards(model.doneData);
      });
    });
  },
  formatCompletedTime(timestamp) {
    if (!timestamp) return "未知";
    const d = new Date(timestamp);
    const y = d.getFullYear();
    const m = ("0" + (d.getMonth() + 1)).slice(-2);
    const day = ("0" + d.getDate()).slice(-2);
    const h = ("0" + d.getHours()).slice(-2);
    const min = ("0" + d.getMinutes()).slice(-2);
    return `${y}/${m}/${day} ${h}:${min}`;
  },
  // 時間格式化（根據秒數顯示對應單位）
  formatTime(seconds, hideSecondsWhenDays = false) {
    seconds = Number(seconds) || 0;
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (days > 0) {
      if (hideSecondsWhenDays) {
        return `${days}天 - ${this.pad(hours)} : ${this.pad(minutes)}`;
      }
      return `${days}天 - ${this.pad(hours)} : ${this.pad(minutes)} : ${this.pad(secs)}`;
    }
    if (hours > 0) {
      return `${this.pad(hours)} : ${this.pad(minutes)} : ${this.pad(secs)}`;
    }
    if (minutes > 0) {
      return `${this.pad(minutes)} : ${this.pad(secs)}`;
    }
    return `${secs}秒`;
  },
  pad(num) {
    return String(num).padStart(2, "0");
  },
  start() {
    this.refreshCards(model.doneData);
    this.changeModeBtn();
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
