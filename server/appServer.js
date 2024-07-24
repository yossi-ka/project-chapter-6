const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
const port = process.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

let localPath = "folders";
// let cmd = path.join(__dirname, localPath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, localPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

//  landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

/*   ---  FILE METHODS  ---   */

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

/*   ---  FOLDER METHODS  ---   */

app.get("/:user/folder/enter/:foldername", (req, res) => {
  localPath += `/${req.params.foldername}`;
  res.send(localPath);
});

app.get("/:user/folder/info/:foldername", (req, res) => {
  const states = fs.statSync(`${localPath}/${req.params.foldername}`);
  res.send(states);
});

app.get("/:user/folder/show/:foldername", (req, res) => {
  // const folder = req.params.foldername;
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

app.put("/:user/folder/rename/:foldername", (req, res) => {
  fs.renameSync(
    `${localPath}/${req.params.foldername}`,
    `${localPath}/${req.body.newname}`
  );
  res.send("the folder has been successfully renamed!");
});

app.delete("/:user/folder/delete/:foldername", (req, res) => {
  fs.rmdir(`${localPath}/${req.params.foldername}`, (err, success) => {
    if (err) {
      res.send("cannot delete this folder, please delete its contents first");
    } else {
      res.send("the folder waz been deleted successfully!");
    }
  });
});

app.get("/:user/folder/up/:foldername", (req, res) => {
  localPath = localPath.substring(0, localPath.lastIndexOf("/"));
  res.send(localPath);
});

/*   ---   DEFERENCE METHODS   ---   */

app.post("/:user/file/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded..");
  }
  res.send("File uploaded successfully!");
});

/*   ---   LOG IN/OUT   ---   */

async function readUsers() {
  const users = await JSON.parse(fs.readFileSync("users.json", "utf-8"));
  return users;
}

app.post("/login", async (req, res) => {
  const users = await readUsers();
  const foundUser = users.find((u) => {
    return req.body.username === u.username && req.body.password === u.password;
  });

  if (foundUser) {
    res.send(foundUser);
  } else res.status(401).send("user not exist");
});

app.get("/:user/logout", (req, res) => {
  localPath = "folders";
  res.send("good bay!");
});

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

