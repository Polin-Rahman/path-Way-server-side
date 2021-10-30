const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xtq5r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        console.log('Database connected successfully!');

        const database = client.db('travel_Site');
        const serviceCollection = database.collection('services');
        const orderCollection = database.collection('orders');

        //GET API
        //GET Services API
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        //GET single service API using dynamic id
        app.get('/orderplace/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        //GET all orders
        app.get('/allorders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        //POST API
        // Add Orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });

        //Add new service API
        app.post('/addservice', async (req, res) => {
            const order = req.body;
            const result = await serviceCollection.insertOne(order);
            res.json(result);
        });

        //DELETE API
        app.delete('/allorders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        });

        //UPDATE API
        app.put('/allorders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'Approved'
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })



    }
    finally {
        //await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Travel Server is running...!!!');
});

app.listen(port, () => {
    console.log('Server is running at port:', port);
})