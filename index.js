const express = require('express');
const axios = require('axios');
require('dotenv').config()
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = process.env.HUBSPOT_PRIVATE_APP_KEY;
const BASE_URI = "https://api.hubspot.com/crm/v3";
const ObjectType = "2-26350164";

const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    "Content-Type": "application/json",
};

app.get("/", async (req, res) => {
    try {
        const resp = await axios.get(`${BASE_URI}/objects/${ObjectType}?properties=regstration_number,type,features`, { headers });
        const data = resp.data.results;
        res.render("index", { title: "Add Vehicle", data });
    } catch (e) {
        res.render("error", { code: 404, message: "something went wrong" });
    }
});

app.get("/add-cobj", async (req, res) => {
    try {
        res.render("add");
    } catch (e) {
        res.render("error", { code: 404, message: "something went wrong" });
    }
});

app.post("/add-cobj", async (req, res) => {
    try {
        features = req.body.features
        if (Array.isArray(features)) {
            features = features.join(';')
        }
        const addObj = {
            properties: {
                regstration_number: req.body.regstration_number,
                type: req.body.type,
                features: features ?? '',
            },
        };

        var resp = await axios.post(`${BASE_URI}/objects/${ObjectType}`, addObj, { headers });
        res.redirect("/update-cobj")
    } catch (e) {
        res.render("error", { code: 500, message: e?.response?.data?.message ?? e.message });
    }
});

app.get("/update-cobj/:id", async (req, res) => {
    try {
        const resp = await axios.get(`${BASE_URI}/objects/${ObjectType}/${req.params.id}?properties=regstration_number,type,features`, { headers });
        const data = resp.data.properties;
        data['features'] = data['features'] ? data['features'].split(';') : []
        res.render("update", { data });
    } catch (e) {
        res.render("error", { code: 500, message: e?.response?.data?.message ?? e.message });
    }
});

app.post("/update-cobj/:id", async (req, res) => {
    try {
        features = req.body.features
        if (Array.isArray(features)) {
            features = features.join(';')
        }
        const updateObj = {
            properties: {
                regstration_number: req.body.regstration_number,
                type: req.body.type,
                features: features ?? '',
            },
        };
        await axios.patch(`${BASE_URI}/objects/${ObjectType}/${req.params.id}`, updateObj, { headers });
        res.redirect(`/update-cobj/${req.params.id}`,)
    } catch (e) {
        res.render("error", { code: 500, message: e?.response?.data?.message ?? e.message });
    }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));