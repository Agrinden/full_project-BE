const { ObjectID } = require("bson");
const express = require("express");
const authUsers = require("./scripts/authUsers");
const { MongoAPIError } = require("mongodb");
const app = express();
const port = 8000;
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
let dbase;
let jwtToken = "";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.json());

MongoClient.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, client) => {
    if (err) {
      return console.log(err);
    }
    dbase = client.db("Test2");
    console.log(`MongoDB connected: ${url}`);
  }
);

app.get("/", (req, res) => {
  res.send({ status: "Server is running" });
});

app.get("/users", async (req, res) => {
  dbase
    .collection("users2")
    .find({})
    .toArray((err, result) => {
      res.send(result);
    });
});

app.post("/login", async (req, res) => {
  const data = await dbase.collection("auth-users");
  const authUser = await data.findOne({
    name: req.body.name,
    password: req.body.password,
  });
  if (authUser) {
    res.send({ status: "Success" });
  } else {
    res
      .status(404)
      .json({ status: "Error", message: "You're not registered user" });
  }
});

app.post("/users", async (req, resp) => {
  const data = await dbase.collection("users2");
  const candidate = await data.findOne({ surName: req.body.surName });
  if (candidate) {
    resp.status(400).json({ status: "Error", message: "User already exsist" });
  } else {
    const result = await data.insertOne(req.body);
    resp.send({ _id: result.insertedId, surName: req.body.surName });
  }
});

app.put("/users", async (req, resp) => {
  const data = await dbase.collection("users2");
  const result = await data.replaceOne(
    { _id: ObjectID(req.body._id) },
    {
      _id: ObjectID(req.body._id),
      surName: req.body.surName,
    }
  );
  resp.send(result);
});

app.delete("/users/:id", (req, resp) => {
  result = dbase
    .collection("users2")
    .deleteOne({ _id: ObjectID(req.params.id) });
  resp.send(result);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
