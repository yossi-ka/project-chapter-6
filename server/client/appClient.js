const form = document.querySelector(".form");
const content = document.querySelector(".content");
const router = document.querySelector(".router");
const mainFolder = document.querySelector(".mainFolder");
const h1 = document.querySelector("h1");
const baseURL = "http://localhost:3000";
let currentURL = "folders";
let currentUser;
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
    dirDisplay(user.username);
  }
}

async function dirDisplay(folder) {
  //  shows folder content
  document.querySelectorAll(".unit").forEach((el) => el.remove());
  currentURL = await fetch(
    `http://localhost:3000/${currentUser}/folder/enter/${folder}`
  );
  h1.textContent = currentURL;
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
    tempImg.addEventListener("click", () => {
      document.querySelector(
        `.${tempImg.getAttribute("data-type")}_actions`
      ).style.display = "block";
    });
    // tempDiv.setAttribute("data-url", `${baseURL}/${currentURL}/${dirArr[i]}`);
    content.append(temp);
  }
}

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
