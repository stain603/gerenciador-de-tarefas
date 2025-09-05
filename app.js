const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const db = new sqlite3.Database("./database.sqlite");

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));


db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    inicio TEXT,
    conclusao TEXT,
    custo TEXT,
    status TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tarefa_id INTEGER,
    texto TEXT
  )`);
});


app.get("/", (req, res) => {
  db.all("SELECT * FROM tarefas", (err, tarefas) => {
    db.all("SELECT * FROM comentarios", (err, comentarios) => {
      res.render("index", { tarefas, comentarios });
    });
  });
});


app.post("/tarefas", (req, res) => {
  const { nome, inicio, conclusao, custo, status } = req.body;
  db.run(
    "INSERT INTO tarefas (nome, inicio, conclusao, custo, status) VALUES (?, ?, ?, ?, ?)",
    [nome, inicio, conclusao, custo, status],
    () => res.redirect("/")
  );
});

app.post("/tarefas/:id/editar", (req, res) => {
  const { id } = req.params;
  const { nome, inicio, conclusao, custo, status } = req.body;
  db.run(
    "UPDATE tarefas SET nome=?, inicio=?, conclusao=?, custo=?, status=? WHERE id=?",
    [nome, inicio, conclusao, custo, status, id],
    () => res.redirect("/")
  );
});


app.post("/tarefas/:id/excluir", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM tarefas WHERE id=?", id, () => {
    db.run("DELETE FROM comentarios WHERE tarefa_id=?", id, () => res.redirect("/"));
  });
});

app.post("/tarefas/:id/comentarios", (req, res) => {
  const { id } = req.params;
  const { texto } = req.body;
  db.run("INSERT INTO comentarios (tarefa_id, texto) VALUES (?, ?)", [id, texto], () =>
    res.redirect("/")
  );
});
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


