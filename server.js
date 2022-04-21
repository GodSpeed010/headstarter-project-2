if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load()
}

// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
require('firebase/auth');
require('firebase/database');
const firebaseApiKey = process.env.FIREBASE_API_KEY

// var getAnalytics = require("firebase/analytics");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: "car-parts-store.firebaseapp.com",
    databaseURL: "https://car-parts-store-default-rtdb.firebaseio.com",
    projectId: "car-parts-store",
    storageBucket: "car-parts-store.appspot.com",
    messagingSenderId: "948222478403",
    appId: "1:948222478403:web:51cee3491cdf5e7de22cf6",
    measurementId: "G-L8ZPP6CGLP"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
// const analytics = getAnalytics.getAnalytics(firebaseApp);

const dbRef = firebaseApp.database().ref();
const itemsRef = dbRef.child('items')

function fetchAllItems() {
    return new Promise(function (resolve, reject) {
        itemsRef.once('value').then(snapshot => {
            resolve(snapshot.val())
        }, error => {
            console.log('firebase ERROR')
            reject(error)
        })
    })
}
// fetchAllItems().then(data => console.log(data)) //! example code

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

const express = require('express')
const app = express()
const fs = require('fs')
const stripe = require('stripe')(stripeSecretKey)

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public'))

app.get('/store', function (req, res) {
    fetchAllItems()
        .then(data => {
            if (data == null) {
                console.log('No Data Found')
                res.status(500).end()
            } else {
                res.render('store.ejs', {
                    stripePublicKey: stripePublicKey,
                    items: data
                })
            }
        })
        .catch(error => {
            res.status(500).end()
        })
})

app.post('/purchase', function (req, res) {
    fetchAllItems()
        .then(data => {
            if (data == null) {
                console.log('No Data Found')
                res.status(500).end()
            } else {
                const itemsJson = data
                const itemsArray = Object.values(itemsJson).flat() // flattened array of all values in itemsJson

                let total = 0
                req.body.items.forEach(function (item) {
                    const itemJson = itemsArray.find(function (i) {
                        return i.id == item.id
                    })
                    total = total + itemJson.price * item.quantity
                })

                stripe.charges.create({
                    amount: total,
                    source: req.body.stripeTokenId,
                    currency: 'usd'
                }).then(function () {
                    console.log('CHARGE SUCCESSFUL')
                    res.json({ message: 'Successfully purchased items' })
                }).catch(function () {
                    console.log("CHARGE FAILED")
                    res.status(500).end()
                })
            }
        })
        .catch(error => {
            res.status(500).end()
        })
})


app.listen(3000)