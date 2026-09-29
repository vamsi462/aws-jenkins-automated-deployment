const axios = require("axios");
const express = require("express");
const path = require("path")

const app = express();


app.use(express.urlencoded({ extended: true }));

const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5000/api/data';
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.post('/submit', async (req, res) => {
    try {
        const response = await axios.post(backendUrl, {
            itemName: req.body.itemName,
            itemDescription: req.body.itemDescription,
            itemId: req.body.itemId,
            itemUuid: req.body.itemUuid,
            itemHash: req.body.itemHash
        })
        console.log("submitted the form data", response)
        res.send(`<h3>${response.data.message}</h3><br><a href="/">Return Home</a>`);
    } catch (error) {
        console.log("Tried to send to Flask, but connection was refused.");
        res.send("<h3>Frontend works and request was sent! (Flask is offline).</h3><br><a href='/'>Go Back</a>");
    }

})

app.listen(3000, () => {
    console.log("Front end is listening on port 3000");
});
