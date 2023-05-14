const express = require("express");
const cors = require("cors");
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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //!----------------------------------------

    //! services
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
    // data send to  "/services" > from "/bookings"

    //! bookings
    // step 0: declared (bookingCollection) in mongodb database
    const bookingCollection = client
      .db("car-doctor-database")
      .collection("bookings");

    // [(create) "/bookings" data from (client site to server site) and inset in mongodb] => post => insert a document
    app.post("/bookings", async (req, res) => {
      // In client site (body) hold data & in server site use (req.body) to get data from client site
      const booking = req.body;
      //   console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    // [(read) (find some data) form "/bookings"] => get => req.query
    app.get("/bookings", async (req, res) => {
      console.log(req.query.email);
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

    //[ (update) one data 'dynamically' form client site to server site "/bookings"] => put/patch => update a document
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
