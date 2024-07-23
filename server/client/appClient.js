const form = document.querySelector(".form");
const dirContent = document.querySelector(".dir");
const baseURL = "http://localhost:3000";
const router = document.querySelector(".router");
const mainFolder = document.querySelector(".mainFolder");
const h1 = document.querySelector("h1");
let currentURL = "folders";

async function login(username, password) {
  const res = await fetch(`${baseURL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username, password: password }),
  });
  if (res.ok) {
    const user = await res.json();
    dirDisplay(user.username);
  }
}

async function dirDisplay(folder) {
  document.querySelectorAll(".unit").forEach((el) => el.remove());
  const dir = await fetch(`http://localhost:3000/enter/${folder}`);
  const dirArr = await dir.json();
  currentURL += `/${folder}`;
  h1.textContent = currentURL;
  form.style.display = "none";

  for (let i = 0; i < dirArr.length; i += 2) {
    const temp = document.querySelector("template").content.cloneNode(true);
    const tempDiv = temp.querySelector("div");
    const tempImg = temp.querySelector("img");
    const tempP = temp.querySelector("p");
    tempP.textContent = dirArr[i];
    if (dirArr[i + 1]) {
      tempImg.setAttribute("data-type", "file");
      tempImg.setAttribute("src", "./file.png");
      tempImg.addEventListener("click", (ev) => {
        document.querySelector(".options").style.display = "flex";
        currentURL += `/${dirArr[i]}`;
      });
    } else {
      tempImg.setAttribute("data-type", "folder");
      tempImg.setAttribute("src", "./folder.png");
      tempImg.addEventListener("click", () => {
        dirDisplay(dirArr[i]);
      });
    }

    tempDiv.setAttribute("data-url", `${baseURL}/${currentURL}/${dirArr[i]}`);
    dirContent.append(temp);
  }
  mainFolder.style.display = "block";
}

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const inputs = form.querySelectorAll("input");
  const username = inputs[0].value;
  const password = inputs[1].value;
  login(username, password);
});

const opt = document.querySelectorAll(".option");
opt.forEach(async (el) => {
  el.addEventListener("click", async (ev) => {
    let res;
    if (ev.target.textContent === "rename") {
      let newname = prompt("new name");
      let r = await fetch(
        `${baseURL}${currentURL}/${ev.target.textContent}/${newname}`
      );
      res = await r.text();
    } else {
      let r = await fetch(`${baseURL}${currentURL}/${ev.target.textContent}`);
      res = await r.text();
    }
    console.log(res);
  });
});
