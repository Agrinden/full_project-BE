const express = require("express");
const app = express();
const port = 8000;
const MongoClient = require("mongodb").MongoClient;
const { ObjectID } = require("bson");
const url = "mongodb://localhost:27017";
const jwt = require("jsonwebtoken");
const auth = require("./scripts/auth");

session = require("express-session");

let dbase;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use(express.json());
app.use(
  session({
    secret: "dev-jwt",
    saveUninitialized: true,
    resave: false,
  })
);

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

app.get("/users", auth, async (req, res) => {
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
    const token = jwt.sign(
      {
        name: authUser.name,
        id: authUser.id,
      },
      "dev-jwt",
      { expiresIn: 60 * 60 }
    );
    res.send({ status: "Success", jwtToken: token });
  } else {
    res
      .status(404)
      .json({ status: "Error", message: "You're not registered user" });
  }
});

app.post("/logout", (req, res) => {
  // очистить сессию
  req.session.destroy();
  res.send({ status: "Success" });
});

app.post("/users", auth, async (req, resp) => {
  const data = await dbase.collection("users2");
  const candidate = await data.findOne({ surName: req.body.surName });
  if (candidate) {
    resp.status(400).json({ status: "Error", message: "User already exsist" });
  } else {
    const result = await data.insertOne(req.body);
    resp.send({ _id: result.insertedId, surName: req.body.surName });
  }
});

app.put("/users", auth, async (req, resp) => {
  const data = await dbase.collection("users2");
  const updatedUser = {
    _id: ObjectID(req.body._id),
    surName: req.body.surName,
  };

  const result = await data.replaceOne(
    { _id: ObjectID(req.body._id) },
    updatedUser
  );
  resp.send(updatedUser);
});

app.delete("/users/:id", auth, (req, resp) => {
  const deletedUser = {
    _id: ObjectID(req.params.id),
    surName: req.body.surName,
  };
  result = dbase
    .collection("users2")
    .deleteOne({ _id: ObjectID(req.params.id) });
  resp.send(deletedUser);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
