import express from "express"; // Framework for database
import cors from "cors"; // Så vi slipper headers
import mysql from "mysql2/promise"; // Database (await)

console.log("Host:", process.env.DB_HOST);
console.log("Name:", process.env.DB_NAME);
console.log("User:", process.env.DB_USER);
console.log("Password:", process.env.DB_PASSWORD);
console.log("Port", process.env.DB_PORT);
const app = express();
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/users", async (req, res) => {
  const [result, fields] = await connection.query("SELECT * FROM user");
  res.json({
    result,
  });
});

app.get("/user/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!isNaN(id)) {
    try {
      const [result] = await connection.execute(
        "SELECT * FROM user WHERE id=?",
        [id]
      );
      if (result.length) {
        res.json(result);
      } else {
        res.json("No user found");
      }
    } catch (e) {
      res.status(500).send("Something went wrong");
    }
  } else {
    res.status(400).send("ID is not a valid number");
  }
});

app.post("/post", async (req, res) => {
  const { id, title, content } = req.body;

  const [result] = await connection.query(`
    INSERT INTO post(title, content, user_id)
    VALUES('${title}','${content}', ${id})
    `);

  res.json(result);
});

app.get("/query", (req, res) => {
  res.send(req.query);
});

app._router.get("/test", async (req, res) => {
  const [result] = await connection.query("SELECT * FROM test");
  res.json(result);
});

app.get("/sort", async (req, res) => {
  // const { sortOrder, sort} = req.query;
  const sortOrder = req.query.sortOrder || "DESC";
  const sort = req.query.sort || "id";
  // http://localhost:1337/sort?sort=id&sortOrder=DESC
  const [result] = await connection.query(
    `SELECT * FROM test ORDER BY ${sort} ${sortOrder}`
  );
  res.json(result);
});

app.get("/test/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!isNaN(id)) {
    try {
      const [result] = await connection.execute(
        "SELECT * FROM test WHERE id=?",
        [id]
      );
      if (result.length) {
        res.json(result);
      } else {
        res.json("No user found");
      }
    } catch (e) {
      res.status(500).send("Something went wrong");
    }
  } else {
    res.status(400).send("ID is not a valid number");
  }
});

app.post("/test", async (req, res) => {
  const { content } = req.body;

  const [result] = await connection.query(`
    INSERT INTO test(content)
    VALUES('${content}')
    `);

  res.json(result);
});

app.listen(port, () => {
  console.log("Server started on port:", port);
});
