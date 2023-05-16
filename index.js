const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cq67mcy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//--------------------------
const verifyJWT = (req, res, next) => {
  // console.log("hitting verify jwt");
  // console.log(req.headers.authorization);
  const authorization = req.headers.authorization;
  console.log(authorization);

  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, massage: "unauthorized access" });
  }

  const token = authorization.split(" ")[1];
  console.log(token);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res
        .status(401)
        .send({ error: true, massage: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //!----------------------------------------

    // ! jwt server
    // [ (create) user data from client site to server site "/jwt" ]
    app.post("/jwt", (req, res) => {
      const user = req.body;

      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5h",
      });

      res.send({ token });

      console.log(user);
    });

    //--------------------------------------------------------------------------

    //! services server
    // step 0: declared (servicesCollection) in mongodb database
    const servicesCollection = client
      .db("car-doctor-database")
      .collection("services");

    // [(read) (all data) from  servicesCollections ] => get => find multiple operation
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // [(read) (one id) 'dynamically' from "/services"] => get => find a document
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const options = {
        // Include only the `title` fields in the returned document
        projection: { title: 1, price: 1, service_id: 1, img: 1 },
      };
      const result = await servicesCollection.findOne(query, options);
      res.send(result);
    });
    //------------------------------------------------------------------

    //todo  ==> make another server "/bookings" ==> from  "/services" ==>

    //! bookings server
    // step 0: declared (bookingCollection) in mongodb database
    const bookingCollection = client
      .db("car-doctor-database")
      .collection("bookings");

    //* [(create) "/bookings" data from (client site to server site) and inset in mongodb] => post => insert a document

    app.post("/bookings", async (req, res) => {
      // In client site (body) hold data & in server site use (req.body) to get data from client site
      const booking = req.body;
      //   console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    // crated booking data convert to read method (post => find)

    //* [(read) (find some data) form "/bookings"] => get => req.query

    app.get("/bookings", verifyJWT, async (req, res) => {
      console.log(req.headers.authorization);

      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        return res.status(403).send({ error: 1, massage: "invalid user" });
      }
      // find some data only email related data form /"bookings"
      let query = {};
      if (req.query?.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = bookingCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // * [ (update) one data 'dynamically' form client site to server site "/bookings"] => put/patch => update a document

    app.patch("/bookings/:id", async (req, res) => {
      const updatedBooking = req.body;
      console.log(updatedBooking);
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: updatedBooking.status,
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //[(delete) one data 'dynamically' form  "/bookings"] => delete => delete a document
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    //!----------------------------------------

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running on: ${port}`);
});
