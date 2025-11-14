import express, { request, response } from "express";
import { Database } from "bun:sqlite";
import cors from "cors";

const db = new Database("leader-board.sqlite");
const app = express();
app.use(cors);
const port = 3004;

app.use(express.json()); // <- WICHTIG

function generateId() {
  return Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
}

function userExists(id: string) {
  const data = db.query("SELECT id FROM Users WHERE id = ?").get(id);
  console.log("selectd id: " + data);
  if (data !== null && data.id === id) {
    return true;
  } else {
    return false;
  }
}

db.query(
  "CREATE TABLE IF NOT EXISTS Users (name TEXT, score INTEGER  DEFAULT 0, id TEXT PRIMARY KEY)"
).run();
app.get("/", (request, response) => {
  const data = db.query("SELECT name, score FROM USERS").get();
  response.send(data);
});

app.get("/test", (request, response) => {
  response.send("get Works!");
});
app.get("/score", (request, response) => {
  if (userExists(request.body.id)) {
    const data = db
      .query("SELECT score FROM Users WHERE id = ?")
      .get(request.body.id);
    if (data) {
      response.send(data);
    } else {
      response.status(404).send();
    }
  } else {
    response.status(401).send();
  }
});
app.post("/score", (request, response) => {
  if (userExists(request.body.id)) {
    db.query("UPDATE Users SET score = score + 1 WHERE id = ?;").run(
      request.body.id
    );
    const data = db
      .query("SELECT score FROM Users WHERE id = ?")
      .get(request.body.id);
    response.status(200).send(data);
  } else {
    response.status(401).send();
  }
});

app.post("/users", (request, response) => {
  const id = generateId();

  db.query("INSERT INTO users (name, id) VALUES (?, ?)").run(
    request.body.name,
    id
  );

  response.send({ id });
});

app.listen(port, "0.0.0.0", () => console.log(`listening on port: ${port}`));
