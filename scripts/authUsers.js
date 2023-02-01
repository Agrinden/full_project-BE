const { ObjectID } = require("bson");

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
let dbase;

function insertAuthMockedUsers() {
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
      authUsers = dbase.collection("auth-users");
      authUsers.insertMany([
        {
          _id: ObjectID("123456789012"),
          name: "Petrov",
          password: "12345678",
        },
        {
          _id: ObjectID("123456789013"),
          name: "Ivanov",
          password: "000222333",
        },
      ]);
    }
  );
}

// insertAuthMockedUsers();
module.exports = { insertAuthMockedUsers };
