const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
const port = process.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

/* ---  GET METHODS --- */

let localPath = "folders/yossi-ka";
let cmd = path.join(__dirname, localPath);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

app.get("/enter/:folder", (req, res) => {
  const folder = req.params.folder;
  localPath += `/${folder}`;
  cmd = path.join(__dirname, localPath);
  const dir = fs.readdir(localPath, "utf-8", (err, dir) => {
    if (err) {
      res.send(err);
    } else {
      const dirSend = [];
      for (let i = 0; i < dir.length; i++) {
        dirSend.push(dir[i], fs.statSync(`${localPath}/${dir[i]}`).isFile());
      }
      res.send(dirSend);
    }
  });
});

app.get("/:user/file/info/:filename", (req, res) => {
  const states = fs.statSync(`${localPath}/${req.params.filename}`);
  res.send(states);
});
app.get("/:user/file/show/:filename", (req, res) => {
  const data = fs.readFileSync(`${localPath}/${req.params.filename}`, "utf-8");
  res.send(data);
});
app.put("/:user/file/rename/:filename", (req, res) => {
  fs.renameSync(
    `${localPath}/${req.params.filename}`,
    `${localPath}/${req.body.newname}`
  );
  res.send("Successfully renamed!");
});
app.get("/:user/file/copy/:filename", (req, res) => {
  fs.copyFileSync(
    `${localPath}/${req.params.filename}`,
    `${localPath}/copy_${req.params.filename}`
  );
  res.send("Successfully copied!");
});
app.put("/:user/file/move/:filename", (req, res) => {
  fs.renameSync(
    `${localPath}/${req.params.filename}`,
    `folders/${req.params.user}/${req.body.newpath}`
  );
  res.send("File was transferred successfully!");
});
app.delete("/:user/file/delete/:filename", (req, res) => {
  fs.unlinkSync(`${localPath}/${req.params.filename}`);
  res.send("the file was successfully deleted!");
});

// app.get("/folders/:user/:file/:method", (req, res) => {
//   const user = req.params.user;
//   const file = req.params.file;
//   const method = req.params.method;
//   switch (method) {
//     case "show": {
//       const data = fs.readFileSync(`folders/${user}/${file}`, "utf-8");
//       res.send(data);
//       break;
//     }
//     case "info": {
//       const stats = fs.statSync(`folders/${user}/${file}`);
//       res.send(stats);
//       break;
//     }
//     case "copy": {
//       fs.copyFileSync(
//         `folders/${user}/${file}`,
//         `folders/${user}/copy_${file}`
//       );
//       res.send("Successfully copied!");
//       break;
//     }
//   }
// });
// app.get("/folders/:user/:file/rename/:newname", (req, res) => {
//   const user = req.params.user;
//   const oldName = req.params.file;
//   const newName = req.params.newname;
//   fs.renameSync(`folders/${user}/${oldName}`, `folders/${user}/${newName}`);
//   res.send("Success");
// });

/* ---  POST METHODS --- */
function readUsers() {
  const users = JSON.parse(fs.readFileSync("users.json", "utf-8"));
  return users;
}
app.post("/login", (req, res) => {
  const users = readUsers();
  const foundUser = users.find((u) => {
    return req.body.username === u.username && req.body.password === u.password;
  });

  if (foundUser) {
    res.send(foundUser);
  } else res.status(401).send("user not exist");
});

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
