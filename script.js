const PASSWORD = "001a581zds";

const screens = {
  boot: document.getElementById("bootScreen"),
  login: document.getElementById("loginScreen"),
  desktop: document.getElementById("desktop"),
  shutdown: document.getElementById("shutdownScreen"),
};

const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("passwordInput");
const loginMessage = document.getElementById("loginMessage");
const powerButton = document.getElementById("powerButton");
const restartButton = document.getElementById("restartButton");
const startButton = document.getElementById("startButton");
const startMenu = document.getElementById("startMenu");
const logoutButton = document.getElementById("logoutButton");
const taskButtons = document.getElementById("taskButtons");
const clock = document.getElementById("clock");
const diagnoseButton = document.getElementById("diagnoseButton");
const diagnoseResult = document.getElementById("diagnoseResult");
const emptyTrashButton = document.getElementById("emptyTrashButton");
const trashFile = document.getElementById("trashFile");
const trashMessage = document.getElementById("trashMessage");

let topZIndex = 40;

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-visible"));
  screens[screenName].classList.add("is-visible");
}

function startBootSequence() {
  showScreen("boot");
  setTimeout(() => {
    showScreen("login");
    passwordInput.value = "";
    loginMessage.textContent = "힌트는 없습니다.";
    loginMessage.classList.remove("error");
    setTimeout(() => passwordInput.focus(), 120);
  }, 2200);
}

function unlockDesktop() {
  loginMessage.textContent = "잠금 해제 중...";
  loginMessage.classList.remove("error");

  setTimeout(() => {
    showScreen("desktop");
    updateClock();
  }, 650);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (passwordInput.value === PASSWORD) {
    unlockDesktop();
    return;
  }

  loginMessage.textContent = "암호가 올바르지 않습니다. 다시 입력하세요.";
  loginMessage.classList.add("error");
  passwordInput.select();
});

powerButton.addEventListener("click", () => showScreen("shutdown"));
restartButton.addEventListener("click", startBootSequence);
logoutButton.addEventListener("click", () => {
  closeStartMenu();
  document.querySelectorAll("[data-window]").forEach(closeWindow);
  showScreen("login");
  passwordInput.value = "";
  loginMessage.textContent = "힌트는 없습니다.";
  passwordInput.focus();
});

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

setInterval(updateClock, 1000);

function closeStartMenu() {
  startMenu.classList.remove("is-open");
  startMenu.setAttribute("aria-hidden", "true");
}

startButton.addEventListener("click", (event) => {
  event.stopPropagation();
  const willOpen = !startMenu.classList.contains("is-open");
  startMenu.classList.toggle("is-open", willOpen);
  startMenu.setAttribute("aria-hidden", String(!willOpen));
});

document.addEventListener("click", (event) => {
  if (!startMenu.contains(event.target) && event.target !== startButton) {
    closeStartMenu();
  }
});

function getWindowTitle(windowElement) {
  return windowElement.querySelector(".window-title")?.textContent.trim() || "창";
}

function focusWindow(windowElement) {
  topZIndex += 1;
  document.querySelectorAll("[data-window]").forEach((item) => item.classList.remove("is-active"));
  windowElement.classList.add("is-active");
  windowElement.style.zIndex = String(topZIndex);

  document.querySelectorAll(".task-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.target === windowElement.id);
  });
}

function createTaskButton(windowElement) {
  if (taskButtons.querySelector(`[data-target="${windowElement.id}"]`)) return;

  const taskButton = document.createElement("button");
  taskButton.type = "button";
  taskButton.className = "task-button is-active";
  taskButton.dataset.target = windowElement.id;
  taskButton.textContent = getWindowTitle(windowElement);
  taskButton.addEventListener("click", () => {
    if (!windowElement.classList.contains("is-open")) {
      windowElement.classList.add("is-open");
      focusWindow(windowElement);
      return;
    }

    if (windowElement.classList.contains("is-active")) {
      minimizeWindow(windowElement);
    } else {
      focusWindow(windowElement);
    }
  });

  taskButtons.appendChild(taskButton);
}

function openWindow(windowElement) {
  windowElement.classList.add("is-open");
  createTaskButton(windowElement);
  focusWindow(windowElement);
  closeStartMenu();
}

function closeWindow(windowElement) {
  windowElement.classList.remove("is-open", "is-active");
  taskButtons.querySelector(`[data-target="${windowElement.id}"]`)?.remove();
}

function minimizeWindow(windowElement) {
  windowElement.classList.remove("is-open", "is-active");
  taskButtons.querySelector(`[data-target="${windowElement.id}"]`)?.classList.remove("is-active");
}

document.querySelectorAll("[data-open]").forEach((trigger) => {
  trigger.addEventListener("dblclick", () => {
    const target = document.getElementById(trigger.dataset.open);
    if (target) openWindow(target);
  });

  trigger.addEventListener("click", () => {
    if (trigger.closest(".start-menu")) {
      const target = document.getElementById(trigger.dataset.open);
      if (target) openWindow(target);
    }
  });
});

document.querySelectorAll("[data-window]").forEach((windowElement) => {
  windowElement.addEventListener("mousedown", () => focusWindow(windowElement));

  windowElement.querySelector("[data-close]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    closeWindow(windowElement);
  });

  windowElement.querySelector("[data-minimize]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    minimizeWindow(windowElement);
  });

  makeDraggable(windowElement);
});

function makeDraggable(windowElement) {
  const handle = windowElement.querySelector("[data-drag-handle]");
  if (!handle) return;

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  handle.addEventListener("mousedown", (event) => {
    if (event.target.closest("button")) return;

    dragging = true;
    const rect = windowElement.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    focusWindow(windowElement);
    document.body.style.cursor = "move";
  });

  document.addEventListener("mousemove", (event) => {
    if (!dragging) return;

    const maxLeft = window.innerWidth - Math.min(windowElement.offsetWidth, 150);
    const maxTop = window.innerHeight - 80;
    const left = Math.max(0, Math.min(event.clientX - offsetX, maxLeft));
    const top = Math.max(0, Math.min(event.clientY - offsetY, maxTop));

    windowElement.style.left = `${left}px`;
    windowElement.style.top = `${top}px`;
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
    document.body.style.cursor = "";
  });
}

diagnoseButton.addEventListener("click", () => {
  diagnoseResult.textContent = "네트워크 케이블이 연결되어 있지 않습니다.";
});

document.getElementById("searchButton").addEventListener("click", () => {
  diagnoseResult.textContent = "검색할 수 없습니다. 인터넷 연결을 확인하세요.";
});

emptyTrashButton.addEventListener("click", () => {
  if (!trashFile.hidden) {
    trashFile.hidden = true;
    trashMessage.textContent = "휴지통이 비었습니다.";
  } else {
    trashMessage.textContent = "삭제할 항목이 없습니다.";
  }
});

window.addEventListener("resize", () => {
  document.querySelectorAll("[data-window]").forEach((windowElement) => {
    const rect = windowElement.getBoundingClientRect();
    if (rect.left > window.innerWidth - 120) windowElement.style.left = "20px";
    if (rect.top > window.innerHeight - 80) windowElement.style.top = "20px";
  });
});

startBootSequence();
