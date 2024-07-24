const form = document.querySelector(".form");
const content = document.querySelector(".content");
const router = document.querySelector(".router");
const mainFolder = document.querySelector(".mainFolder");
const popup = document.querySelector(".popup");
const x = document.querySelector("span");
const h1 = document.querySelector("h1");
const baseURL = "http://localhost:3000";
let currentURL = "folders";
let currentUser;
let selectedItem;
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const inputs = form.querySelectorAll("input");
  const username = inputs[0].value;
  const password = inputs[1].value;
  login(username, password);
});

async function login(username, password) {
  const res = await fetch(`${baseURL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username, password: password }),
  });
  if (res.ok) {
    form.style.display = "none";
    mainFolder.style.display = "block";
    const user = await res.json();
    currentUser = user.username;
    const path = await fetch(
      `http://localhost:3000/${currentUser}/folder/enter/${user.username}`
    );
    currentURL = await path.text();
    h1.textContent = currentURL;
    dirDisplay(user.username);
  }
}

async function dirDisplay(folder) {
  //  shows folder content
  document.querySelectorAll(".unit").forEach((el) => el.remove());
  const dir = await fetch(
    `http://localhost:3000/${currentUser}/folder/show/${folder}`
  );
  const dirArr = await dir.json();
  for (let i = 0; i < dirArr.length; i += 2) {
    const temp = document.querySelector("template").content.cloneNode(true);
    const tempDiv = temp.querySelector("div");
    const tempImg = temp.querySelector("img");
    const tempP = temp.querySelector("p");
    tempP.textContent = dirArr[i];
    tempImg.setAttribute("src", dirArr[i + 1] ? "./file.png" : "./folder.png");
    tempImg.setAttribute("data-type", dirArr[i + 1] ? "file" : "folder");
    // tempImg.setAttribute("data-name", tempP);
    tempImg.addEventListener("click", () => {
      selectedItem = tempP.textContent;
      document.querySelector(
        `.${tempImg.getAttribute("data-type")}_actions`
      ).style.display = "block";
    });
    content.append(temp);
  }
}

const btns = document.querySelectorAll(".action");
btns.forEach((btn) => {
  btn.addEventListener("click", (ev) => {
    if (ev.target.classList.value.includes("file")) {
      switch (btn.textContent) {
        case "show":
          showFile();
          break;
        case "copy":
          copyFile();
          break;
        case "rename":
          renameFile();
          break;
        case "move":
          moveFile();
          break;
        case "delete":
          deleteFile();
          break;
        case "info":
          infoFile();
          break;
      }
    } else if (ev.target.classList.value.includes("folder")) {
      switch (btn.textContent) {
        case "rename":
          renameFolder();
          break;
        case "delete":
          deleteFolder();
          break;
        case "info":
          infoFolder();
          break;
        case "show":
          showFolder();
          break;
      }
    }
  });
});

async function showFile() {
  const res = await fetch(`${currentUser}/file/show/${selectedItem}`);
  if (res.ok) popup.textContent = await res.text();
}

async function infoFile() {
  const res = await fetch(`${currentUser}/file/info/${selectedItem}`);
  if (res.ok) popup.textContent = await res.text();
}

async function copyFile() {
  const res = await fetch(`${currentUser}/file/copy/${selectedItem}`);
  if (res.ok) popup.textContent = await res.text();
}

async function renameFile() {
  const newname = prompt("enter new name:");
  console.log(`${currentUser}/file/rename/${selectedItem}`);
  const res = await fetch(`${currentUser}/file/rename/${selectedItem}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      newname: newname,
    }),
  });
  if (res.ok) popup.textContent = await res.text();
}

async function moveFile() {
  const newpath = prompt("enter the new path:");
  const res = await fetch(`${currentUser}/file/move/${selectedItem}`, {
    method: "PUT",
    body: {
      newpath: newpath,
    },
  });
  if (res.ok) popup.textContent = await res.text();
}

async function deleteFile() {
  const res = await fetch(`${currentUser}/file/delete/${selectedItem}`, {
    method: "DELETE",
  });
  if (res.ok) popup.textContent = await res.text();
}

async function showFolder() {
  const path = await fetch(
    `http://localhost:3000/${currentUser}/folder/enter/${selectedItem}`
  );
  currentURL = await path.text();
  h1.textContent = currentURL;
  document.querySelector(".folder_actions").style.display = "none";
  document.querySelector(".file_actions").style.display = "none";
  dirDisplay(selectedItem);
}

async function infoFolder() {
  const res = await fetch(`${currentUser}/folder/info/${selectedItem}`);
  if (res.ok) popup.textContent = await res.text();
}

async function renameFolder() {
  const newname = prompt("enter new name:");
  const res = await fetch(`${currentUser}/folder/rename/${selectedItem}`, {
    method: "PUT",
    body: {
      newname: newname,
    },
  });
  if (res.ok) popup.textContent = await res.text();
}

async function deleteFolder() {
  const res = await fetch(`${currentUser}/folder/delete/${selectedItem}`, {
    method: "DELETE",
  });
  if (res.ok) popup.textContent = await res.text();
}

document.body.addEventListener("click", () => {
  popup.textContent = "";
});

document.querySelector(".logout").addEventListener("click", async () => {
  const res = await fetch(`${baseURL}/${currentUser}/logout`);
  if (res.ok) window.location.reload();
});

document.querySelectorAll(".x").forEach((el) => {
  el.addEventListener("click", () => {
    document.querySelector(".file_actions").style.display = "none";
    document.querySelector(".folder_actions").style.display = "none";
  });
});
