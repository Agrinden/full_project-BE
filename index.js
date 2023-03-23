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
    dbase = client.db("Onset_app");
    console.log(`MongoDB connected: ${url}`);
  }
);

app.get("/", (req, res) => {
  res.send({ status: "Server is running" });
});

app.get("/users", auth, async (req, res) => {
  dbase
    .collection("collection_001")
    .find({})
    .toArray((err, result) => {
      res.send(result);
    });
});

app.post("/registration", async (req, res) => {
  const data = await dbase.collection("registered-users");
  const createdUser = await data.findOne({
    name: req.body.name,
  });
  if (createdUser) {
    res.status(409).json({
      status: "Error",
      message:
        "A user with this name already exists. Please choose another one UserName",
    });
  } else if (!createdUser) {
    data.insertOne({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    res.send({
      status: "Success",
      message: "Registration success",
    });
  } else {
    res.status(404).json({
      status: "Error",
      message: "Something goes wrong. Try one more time!",
    });
  }
});

app.post("/login", async (req, res) => {
  const data = await dbase.collection("registered-users");
  const authUser = await data.findOne({
    name: req.body.name,
    password: req.body.password,
  });
  if (authUser) {
    const token = jwt.sign(
      {
        name: authUser.name,
        _id: authUser._id,
      },
      "dev-jwt",
      { expiresIn: 60 * 60 }
    );
    res.send({
      _id: authUser._id,
      name: req.body.name,
      status: "Success",
      jwtToken: token,
    });
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

app.delete("/:id", auth, async (req, res) => {
  const data = await dbase.collection("registered-users");
  const deleteUser = await data.findOne({
    _id: ObjectID(req.params.id),
  });
  if (!deleteUser) {
    res
      .send(404)
      .json({ status: "Error", message: "The user with this id didn't find." });
  } else {
    data.deleteOne({
      _id: ObjectID(req.params.id),
    });
    res
      .status(200)
      .json({ status: "Success", message: "The user have been deleted!" });
  }
});

app.post("/users", auth, async (req, resp) => {
  const data = await dbase.collection("collection_001");
  const candidate = await data.findOne({ surName: req.body.surName });
  if (candidate) {
    resp.status(400).json({ status: "Error", message: "User already exsist" });
  } else {
    const result = await data.insertOne(req.body);
    resp.send({ _id: result.insertedId, surName: req.body.surName });
  }
});

app.put("/users", auth, async (req, resp) => {
  const data = await dbase.collection("collection_001");
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
    .collection("collection_001")
    .deleteOne({ _id: ObjectID(req.params.id) });
  resp.send(deletedUser);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
