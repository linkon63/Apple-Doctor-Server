
// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://admin123:admin123@cluster0.q8ydv.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });



const express = require('express');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser')
const cors = require('cors');
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config();

const app = express()
app.use(bodyParser.json()); // for parsing application/json
app.use(cors());

//Root Of Apple Doctor Server Site
app.get('/', (req, res) => {
    res.send('Root Of Server Site Apple Doctor')
});

const uri = "mongodb+srv://admin123:admin123@cluster0.q8ydv.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    if (err) {
        console.log("❌❌Error in Connection ❌❌", err)
    }
    const servicesCollection = client.db("apple-doctor").collection("services");
    const serviceOrders = client.db("apple-doctor").collection("serviceOrders");
    const reviewsData = client.db("apple-doctor").collection("reviewsData");
    const addAdmin = client.db("apple-doctor").collection("admin");
    const contactUs = client.db("apple-doctor").collection("contactUs");
    // perform actions on the collection object
    
    console.log("✅✅Connected✅✅")
    console.log("PORT:", port)

    //Getting Services Info to Show the home page or admin page to all services available
    app.get('/allServices', (req, res) => {
        servicesCollection.find().toArray((err, documents) => {
            res.send(documents);
            console.log('Error : ', err)
            console.log('From DataBase : ', documents);
        })
    });
    //Delete Services From Admin Page
    app.delete('/deleteService/:id', (req, res) => {
        console.log('Data Delete')
        const id = ObjectID(req.params.id);
        console.log('Delete This', id);
        servicesCollection.findOneAndDelete({ _id: id })
            .then(data => res.json({ success: !!data.value }));
    });

    //Reading Single Service Data from DB
    app.get('/orderService/:id', (req, res) => {
        console.log(req.params.id);
        servicesCollection.find({ _id: ObjectID(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })
    // Uploading Client site Service Data to the mongoDB
    app.post('/addServices', (req, res) => {
        const serviceData = req.body;
        console.log('Adding Service', req.body);
        servicesCollection.insertOne(serviceData)
            .then(result => {
                console.log('Inserted Count', result.insertedCount)
                res.send(result.insertedCount > 0)
            })
    })

    // Getting ReviewsData from Data
    app.get('/reviewsData', (req, res) => {
        console.log('Review Data')
        reviewsData.find().toArray((err, documents) => {
            res.send(documents);
            console.log(err);
        })
    })
    // Delete ReviewsData of user from Data
    app.delete('/reviewsData/:id', (req, res) => {
        console.log('Data Review Delete');
        const id = ObjectID(req.params.id);
        console.log('Delete This', id);
        reviewsData.findOneAndDelete({ _id: id })
            .then(data => res.json({ success: !!data.value }));
    })

    //Insert Review Data of user to  MongoDb
    app.post('/addReview', (req, res) => {
        const addReview = req.body;
        console.log(addReview);
        reviewsData.insertOne(addReview)
            .then(result => {
                console.log('addReview Confirm')
                console.log(result);
                res.send(result.insertedCount > 0);
            })
    })

    //Showing Admin Details to Client Admin Page for manage Admin
    app.get('/showAdmin', (req, res) => {
        console.log('Show Admin Data')
        addAdmin.find()
            .toArray((err, documents) => {
                res.send(documents);
                console.log(err);
            })
    })

    //Insert Admin Data  to  MongoDb
    app.post('/admin', (req, res) => {
        const adminData = req.body;
        console.log(adminData);
        addAdmin.insertOne(adminData)
            .then(result => {
                console.log('adminData Inserted Confirm')
                console.log(result);
                res.send(result.insertedCount > 0);
            })
    })

    //Is Admin LoggedIn
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        // console.log(email);
        addAdmin.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })

    //Delete Admin
    app.delete('/deleteAdmin/:id', (req, res) => {
        console.log('Data Delete');
        const id = ObjectID(req.params.id);
        console.log('Delete This', id);

        addAdmin.findOneAndDelete({ _id: id })
            .then(data => res.json({ success: !!data.value }));
    })

    //Specific User Service Order in MongoDB
    app.get('/serviceOrder', (req, res) => {
        console.log(req.query.email)
        serviceOrders.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    //All Service Order in MongoDB for Admin
    app.get('/allServiceOrder', (req, res) => {
        console.log('Requested')
        serviceOrders.find()
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    //Update Service Order from Admin
    app.patch('/updateOrderStatus/:id', (req, res) => {
        console.log(req.body.params);
        console.log(req.params.dbStatus);
        console.log('Patch');
        serviceOrders.updateOne({ _id: ObjectID(req.params.id) },
            {
                $set: { orderStatus: req.body.dbStatus }
            })
            .then(result => {
                console.log(result.modifiedCount);
                res.send(result.modifiedCount > 0);
            })
    })

    //All Service Order Delete in MongoDB for Admin
    app.delete('/allServiceOrderDelete/:id', (req, res) => {
        console.log('Data Delete');
        const id = ObjectID(req.params.id);
        console.log('Delete This', id);
        serviceOrders.findOneAndDelete({ _id: id })
            .then(data => res.json({ success: !!data.value }));
    })

    //Insert Service Order Place Data in Mongo
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        console.log(order);
        serviceOrders.insertOne(order)
            .then(result => {
                console.log('OrderConfirm')
                console.log(result);
                res.send(result.insertedCount > 0);
            })
    })

    //Delete Service data from DataBase
    app.delete('/deleteService/:id', (req, res) => {
        console.log('Data Delete');
        const id = ObjectID(req.params.id);
        console.log('Delete This', id);

        serviceOrders.findOneAndDelete({ _id: id })
            .then(data => res.json({ success: !!data.value }));
    })



    //Insert contactWithUs Data  to  MongoDb
    app.post('/contactWithUs', (req, res) => {
        const contactData = req.body;
        console.log(contactData);
        contactUs.insertOne(contactData)
            .then(result => {
                console.log('contactData Inserted Confirm')
                console.log(result);
                res.send(result.insertedCount > 0);
            })
    })

    //All contactWithUs data in MongoDB for Admin
    app.get('/showContactUsData', (req, res) => {
        console.log('Requested')
        contactUs.find()
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // client.close();
});
app.listen(port)

//Connection of mongoDB Database
// const uri = `mongodb + srv://<admin123>:<admin123>@cluster0.q8ydv.mongodb.net/admin123?retryWrites=true&w=majority`
// // const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q8ydv.mongodb.net/${process.env.DB_USER}?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//     const servicesCollection = client.db("apple-doctor").collection("services");
//     const serviceOrders = client.db("apple-doctor").collection("serviceOrders");
//     const reviewsData = client.db("apple-doctor").collection("reviewsData");
//     const addAdmin = client.db("apple-doctor").collection("admin");
//     const contactUs = client.db("apple-doctor").collection("contactUs");
//     // perform actions on the collection object
//     console.log('Connected to the MongoDB')
//     if (err) {
//         console.log("err : ", err);
//     }
//     //Getting Services Info to Show the home page or admin page to all services available
//     app.get('/allServices', (req, res) => {
//         servicesCollection.find().toArray((err, documents) => {
//             res.send(documents);
//             console.log('Error : ', err)
//             console.log('From DataBase : ', documents);
//         })
//     });
//     //Delete Services From Admin Page
//     app.delete('/deleteService/:id', (req, res) => {
//         console.log('Data Delete')
//         const id = ObjectID(req.params.id);
//         console.log('Delete This', id);
//         servicesCollection.findOneAndDelete({ _id: id })
//             .then(data => res.json({ success: !!data.value }));
//     });

//     //Reading Single Service Data from DB
//     app.get('/orderService/:id', (req, res) => {
//         console.log(req.params.id);
//         servicesCollection.find({ _id: ObjectID(req.params.id) })
//             .toArray((err, documents) => {
//                 res.send(documents[0]);
//             })
//     })
//     // Uploading Client site Service Data to the mongoDB
//     app.post('/addServices', (req, res) => {
//         const serviceData = req.body;
//         console.log('Adding Service', req.body);
//         servicesCollection.insertOne(serviceData)
//             .then(result => {
//                 console.log('Inserted Count', result.insertedCount)
//                 res.send(result.insertedCount > 0)
//             })
//     })

//     // Getting ReviewsData from Data
//     app.get('/reviewsData', (req, res) => {
//         console.log('Review Data')
//         reviewsData.find().toArray((err, documents) => {
//             res.send(documents);
//             console.log(err);
//         })
//     })
//     // Delete ReviewsData of user from Data
//     app.delete('/reviewsData/:id', (req, res) => {
//         console.log('Data Review Delete');
//         const id = ObjectID(req.params.id);
//         console.log('Delete This', id);
//         reviewsData.findOneAndDelete({ _id: id })
//             .then(data => res.json({ success: !!data.value }));
//     })

//     //Insert Review Data of user to  MongoDb
//     app.post('/addReview', (req, res) => {
//         const addReview = req.body;
//         console.log(addReview);
//         reviewsData.insertOne(addReview)
//             .then(result => {
//                 console.log('addReview Confirm')
//                 console.log(result);
//                 res.send(result.insertedCount > 0);
//             })
//     })

//     //Showing Admin Details to Client Admin Page for manage Admin
//     app.get('/showAdmin', (req, res) => {
//         console.log('Show Admin Data')
//         addAdmin.find()
//             .toArray((err, documents) => {
//                 res.send(documents);
//                 console.log(err);
//             })
//     })

//     //Insert Admin Data  to  MongoDb
//     app.post('/admin', (req, res) => {
//         const adminData = req.body;
//         console.log(adminData);
//         addAdmin.insertOne(adminData)
//             .then(result => {
//                 console.log('adminData Inserted Confirm')
//                 console.log(result);
//                 res.send(result.insertedCount > 0);
//             })
//     })

//     //Is Admin LoggedIn
//     app.post('/isAdmin', (req, res) => {
//         const email = req.body.email;
//         // console.log(email);
//         addAdmin.find({ email: email })
//             .toArray((err, doctors) => {
//                 res.send(doctors.length > 0);
//             })
//     })

//     //Delete Admin
//     app.delete('/deleteAdmin/:id', (req, res) => {
//         console.log('Data Delete');
//         const id = ObjectID(req.params.id);
//         console.log('Delete This', id);

//         addAdmin.findOneAndDelete({ _id: id })
//             .then(data => res.json({ success: !!data.value }));
//     })

//     //Specific User Service Order in MongoDB
//     app.get('/serviceOrder', (req, res) => {
//         console.log(req.query.email)
//         serviceOrders.find({ email: req.query.email })
//             .toArray((err, documents) => {
//                 res.send(documents);
//             })
//     })

//     //All Service Order in MongoDB for Admin
//     app.get('/allServiceOrder', (req, res) => {
//         console.log('Requested')
//         serviceOrders.find()
//             .toArray((err, documents) => {
//                 res.send(documents);
//             })
//     })

//     //Update Service Order from Admin
//     app.patch('/updateOrderStatus/:id', (req, res) => {
//         console.log(req.body.params);
//         console.log(req.params.dbStatus);
//         console.log('Patch');
//         serviceOrders.updateOne({ _id: ObjectID(req.params.id) },
//             {
//                 $set: { orderStatus: req.body.dbStatus }
//             })
//             .then(result => {
//                 console.log(result.modifiedCount);
//                 res.send(result.modifiedCount > 0);
//             })
//     })

//     //All Service Order Delete in MongoDB for Admin
//     app.delete('/allServiceOrderDelete/:id', (req, res) => {
//         console.log('Data Delete');
//         const id = ObjectID(req.params.id);
//         console.log('Delete This', id);
//         serviceOrders.findOneAndDelete({ _id: id })
//             .then(data => res.json({ success: !!data.value }));
//     })

//     //Insert Service Order Place Data in Mongo
//     app.post('/addOrder', (req, res) => {
//         const order = req.body;
//         console.log(order);
//         serviceOrders.insertOne(order)
//             .then(result => {
//                 console.log('OrderConfirm')
//                 console.log(result);
//                 res.send(result.insertedCount > 0);
//             })
//     })

//     //Delete Service data from DataBase
//     app.delete('/deleteService/:id', (req, res) => {
//         console.log('Data Delete');
//         const id = ObjectID(req.params.id);
//         console.log('Delete This', id);

//         serviceOrders.findOneAndDelete({ _id: id })
//             .then(data => res.json({ success: !!data.value }));
//     })



//     //Insert contactWithUs Data  to  MongoDb
//     app.post('/contactWithUs', (req, res) => {
//         const contactData = req.body;
//         console.log(contactData);
//         contactUs.insertOne(contactData)
//             .then(result => {
//                 console.log('contactData Inserted Confirm')
//                 console.log(result);
//                 res.send(result.insertedCount > 0);
//             })
//     })

//     //All contactWithUs data in MongoDB for Admin
//     app.get('/showContactUsData', (req, res) => {
//         console.log('Requested')
//         contactUs.find()
//             .toArray((err, documents) => {
//                 res.send(documents);
//             })
//     })




// });


// app.listen(port)