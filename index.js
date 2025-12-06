const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB
async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db("Scholarship-Management-System");
    const userCollection = db.collection("user");
    const universityCollection = db.collection("university");

    // user related Api
    app.post("/users", async (req, res) => {
      const user = req.body;
      user.role = "student";
      user.createdAt = new Date();
      const email = user.email;
      const userExists = await userCollection.findOne({ email });

      if (userExists) {
        return res.send({ message: "user exists" });
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // university related Api
    // GET: All Scholarships with simple filters (তোমার স্টাইলে)
    app.get("/scholarshipUniversity", async (req, res) => {
      let query = {};

      const {
        email,
        universityName,
        universityCountry,
        universityWorldRank,
        subjectCategory,
        scholarshipCategory,
        degree,
        search,
      } = req.query;

      if (email) query.postedUserEmail = email;
      if (universityName) query.universityName = universityName;
      if (universityCountry) query.universityCountry = universityCountry;
      if (subjectCategory) query.subjectCategory = subjectCategory;
      if (scholarshipCategory) query.scholarshipCategory = scholarshipCategory;
      if (degree) query.degree = degree;

      if (universityWorldRank) {
        query.universityWorldRank = { $lte: Number(universityWorldRank) };
      }

      if (search) {
        query.$or = [
          { scholarshipName: { $regex: search, $options: "i" } },
          { universityName: { $regex: search, $options: "i" } },
        ];
      }

      const result = await universityCollection
        .find(query)
        .sort({ scholarshipPostDate: -1 })
        .toArray();

      res.send(result); // এখন আর এরর আসবে না
    });
  } catch (err) {
    console.error(err);
  }
}

run();

// Default route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
