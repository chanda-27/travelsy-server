// Main (required)
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const { MongoClient, ObjectID } = require('mongodb');
require('dotenv').config()

// dotENV (required)
const { DB_NAME, DB_USERNAME, DB_PASS, PKGCOL, ORDCOL } = process.env;
const port = process.env.PORT || 3344;
console.log(DB_NAME, DB_USERNAME, DB_PASS, PKGCOL, ORDCOL);

// Middlewares
app.use(cors())
app.use(bodyParser.json())


const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASS}@cluster0.lq9rh.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  // Package Collection
  const packagesCollection = client.db(DB_NAME).collection(PKGCOL);
  console.log("DB Connected on", port);

  // Add Package API
  app.post('/addPackage', (req, res) => {
    const newPackage = req.body;
    console.log('adding new package', newPackage);
    packagesCollection.insertOne(newPackage)
    .then(result => {
      console.log('inserted count:', result.insertedCount);
      res.send(result)
    })
  })

  // All Packages List API
  app.get('/packages', (req, res) => {
    packagesCollection.find()
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  // Load Single Package
  app.get('/package/:id', (req, res) => {
    console.log(req.params);
    const id = ObjectID(req.params.id);
    packagesCollection.find({_id: id})
    .toArray((err, documents) => {
      res.send(documents[0]);
    })
  })

  // Order Collection
  const ordersCollection = client.db(DB_NAME).collection(ORDCOL);

  // Order Collections Setup
  app.post('/addOrder', (req, res) => {
    const newOrder = req.body;
    console.log(newOrder);
    ordersCollection.insertOne(newOrder)
    .then(result => {
      console.log('inserted count:', result);
      res.send(result)
    })
  })

  app.get('/orders', (req, res) => {
    console.log(req.query.email);
    ordersCollection.find({ownerEmail: req.query.email})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })
  
  app.get('/allOrders', (req, res) => {
    ordersCollection.find()
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  app.patch('/updateOrder/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    ordersCollection.updateOne(
      {_id: id},
      {
        $set: {status: req.body.status}
      }
    )
    .then(result => {
      res.send(result);
    })
  })

  app.delete('/deleteOrder/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    ordersCollection.deleteOne({_id: id})
    .then(result => {
      res.send(result);
    })
  })

  // Root Path
  app.get('/', (req, res) => {
    res.send("Hello, Viewers! This URL from Heroku is available now!")
  })
});




app.listen(port)