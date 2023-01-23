/*добавление моковых юзеров, если юзеров нет*/
const { ObjectID } = require("bson");
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
const index = require("../index");
let dbase;
let users;

function insertMockedUsers() {
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
      users = dbase.collection("users2");
      users.insertMany([
        {
          _id: ObjectID("123456789012"),
          surName: "Pupkin",
        },
        {
          _id: ObjectID("123456789013"),
          surName: "Gavrikov",
        },
      ]);
      authUsers = dbase.collection("auth-users");
      authUsers.insertMany([
        {
          id: "0",
          name: "Petrov",
          password: "12345678",
        },
        {
          id: "01",
          name: "Ivanov",
          password: "000222333",
        },
      ]);
    }
  );
}

insertMockedUsers();
// module.exports = { insertMockedUsers };
