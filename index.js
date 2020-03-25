const express = require("express");
const app = express();
const db = require("./db");
const s3 = require("./s3");
const { s3Url } = require("./config");
const fs = require("fs");
let secrets; // in dev they are in secrets.json which is listed in .gitignore

app.use(express.static("./public"));
/////////////////////////////////////////////////////////////////////////////
// COOKIES
const cookieSession = require("cookie-session");

if (process.env.NODE_ENV === "production") {
    secrets = process.env;
} else {
    secrets = require("./secrets.json");
}

app.use(
    cookieSession({
        secret: secrets.SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);
///////////////////////////////////////////////////////////////////////////////
//BASIC AUTH
const basicAuth = require("basic-auth");

const auth = function(req, res, next) {
    console.log("secrets.adi: ", secrets.adi);
    console.log("secrets.adipass: ", secrets.adipass);

    const creds = basicAuth(req);

    function checkCred(creds) {
        let trueCreds =
            !creds ||
            creds.name != secrets.adi ||
            creds.pass != secrets.adipass;

        return trueCreds;
    }

    if (checkCred(creds)) {
        res.setHeader(
            "WWW-Authenticate",
            'Basic realm="Enter your credentials to see this stuff."'
        );
        res.sendStatus(401);
    } else {
        if (creds.name == secrets.adi && creds.pass == secrets.adipass) {
            req.session.admin = true;
        }
        console.log("req.session.admin: ", req.session.admin);
        next();
    }
};

app.use(auth);

///////////////////////////////////////////////////////////////////////////////
// ALL FRESH FRUITS!!!
const arrFruits = `Açaí
Akee
Superfruit
Citrus
Apple
Apricot
Avocado
fruit
Banana
Bilberry
Blackberry
Blackcurrant
Black sapote
sapote
Blueberry
Boysenberry
Buddha's hand
fingered citron
Cactus pear
Crab apple
Currant
Cherry
Cherimoya
Custard Apple
Custard
Chico fruit
Chico
Cloudberry
Coconut
Cranberry
Damson
Date
dactyli
Dragonfruit
Pitaya
Durian
Elderberry
Feijoa
Fig
Goji berry
Goji
berry
Gooseberry
Grape
Raisin
Grapefruit
Guava
Honeyberry
Huckleberry
Jabuticaba
Jackfruit
Jambul
Japanese plum
Jostaberry
Jujube
Juniper berry
Kiwano (horned melon)
Kiwano
Kiwifruit
Kumquat
Lemon
Lime
Loganberry
Loquat
Longan
Lychee
Mango
Mangosteen
Marionberry
Melon
Cantaloupe
Honeydew
Watermelon
Miracle fruit
Mulberry
Nectarine
Nance
Orange
Blood orange
Clementine
Mandarina
Mandarine
Tangerine
Papaya
Passionfruit
Peach
Pear
Persimmon
Plantain
Plum
Prune
Prune
Pineapple
Pineberry
Plumcot
Plumcot
Pomegranate
Pomelo
mangosteen
mangosteen
Quince
Raspberry
Salmonberry
Rambutan
Mamin Chino
Chino
Mamin
Rambutan
Redcurrant
Salal berry
Salak
Satsuma
Soursop
Star apple
Star fruit
Strawberry
Surinam cherry
Tamarillo
Tamarind
Tangelo
Tayberry
Ugli fruit
White currant
White sapote
Yuzu`;
const arrFruitsLower = arrFruits.toLowerCase();
const allFruits = arrFruitsLower.split("\n");
// console.log("allFruits: ", allFruits);
///////////////////////////////////////////////////////////////////////////////
//GOOGLE CLOUD VISION

const googleVision = async function(url) {
    try {
        // Imports the Google Cloud client library
        const vision = require("@google-cloud/vision");
        // Creates a client

        // const client = new vision.ImageAnnotatorClient({
        //     keyFilename: "./secrets.json"
        // });

        let client;
        if (process.env.NODE_ENV === "production") {
            // console.log("in production");
            client = new vision.ImageAnnotatorClient({
                // keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
                keyFilename: "google-credentials.json"
            });
        } else {
            client = new vision.ImageAnnotatorClient({
                keyFilename: "google-credentials.json"
            });
        }

        ///////////////////////////////////////////////////////////////////////////////
        // api for text!!!!
        // // Performs text detection on the local file
        // const [result] = await client.textDetection(url);
        // const detections = result.textAnnotations;
        // console.log("Text:");
        // detections.forEach(text => console.log(text));
        ///////////////////////////////////////////////////////////////////////////////
        // Performs label detection on the image file
        const [result] = await client.labelDetection(url);
        // console.log("result from google API:", result);
        const labels = result.labelAnnotations;
        let fruits = [];
        labels.forEach(label => {
            //        console.log(label.description);
            fruits.push(label.description);
        });
        console.log("fruits: ", fruits);
        return fruits;
    } catch (e) {
        console.log("error: ", e);
    }
};

///////////////////////////////////////////////////////////////////////////////
// UPLOAD CODE
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage
    // limits: {
    //     fileSize: 2097152
    // }
});

///////////////////////////////////////////////////////////////////////////////
app.use(express.json());

app.get("/images", (req, res) => {
    console.log("**************************************GET/images");
    db.getAll()
        .then(result => {
            // console.log("result.rows!!!!!!!!: ", result.rows);
            res.json(result.rows);
        })
        .catch(err => {
            console.log("err in get all: ", err);
        });
});

// to tworzy plik
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("**************************************POST/upload");
    // console.log("req.wrongFormat: ", res.wrongFormat);

    console.log("upload big picture");
    const imageUrl = s3Url + req.file.filename;
    const title = req.body.title;
    const description = req.body.description;
    const username = req.body.username;
    const tags = req.body.tags;
    const arrTags = tags.replace(" ", "").split(",");
    let fruitInside = false;
    // console.log("arrTags: ", arrTags);
    // console.log("JUST REEEEEQQ!!!!!: ", req.body);
    // console.log("imageUrl: ", imageUrl);
    // console.log("title: ", title);
    // console.log("description: ", description);
    // console.log("username: ", username);
    // console.log("tags: ", tags);
    // console.log("tags.lenght: ", tags.length);
    // console.log("imageUrl: ", imageUrl);
    ///////////////////////////////////////////////////////////////////////////////
    googleVision(imageUrl)
        .then(result => {
            // console.log("possible fruit in arr: ", result);
            let possibleFruitInside = [];
            for (let i = 0; i < result.length; i++) {
                // changing letters in results to toLowerCase
                // console.log(
                //     "result[i].toLowerCase(): ",
                //     result[i].toLowerCase()
                // );
                possibleFruitInside.push(result[i].toLowerCase());
            }
            // console.log("possibleFruitInside: ", possibleFruitInside);

            for (let i = 0; i < possibleFruitInside.length; i++) {
                for (let u = 0; u < allFruits.length; u++) {
                    if (possibleFruitInside[i] == allFruits[u]) {
                        console.log("fruit inside true!!!!!");
                        fruitInside = true;
                        break;
                    }
                }
            }
            ///////////////////////////////////////////////////////////////////////////////
            if (fruitInside) {
                db.addImage(imageUrl, username, title, description)
                    .then(addedImage => {
                        // console.log("inserted images: ", addedImage);
                        // console.log("result.id: ", addedImage[0].id);
                        if (tags !== "") {
                            // console.log("arrTags.length > 0");
                            for (let i = 0; i < arrTags.length; i++) {
                                // console.log("tags [i]: ", i);
                                db.insertTag(arrTags[i], addedImage[0].id)
                                    .then(insertedTags => {
                                        console.log(
                                            "insertedTags:",
                                            insertedTags
                                        );
                                        // console.log("i:", i);
                                        if (i == arrTags.length - 1) {
                                            // console.log("last tag???");
                                            // console.log("addedImage: ", addedImage);

                                            res.json(addedImage);
                                        }
                                    })
                                    .catch(err => {
                                        console.log(
                                            "err in inserting tag: ",
                                            err
                                        );
                                    });
                            }
                        } else {
                            res.json(addedImage);
                        }
                    })
                    .catch(err => {
                        console.log("error in addImage: ", err);
                    });
            } else {
                res.json({
                    success: false
                });
            }
            ///////////////////////////////////////////////////////////////////////////////
            //
        })
        .catch(err => {
            console.log("err in googleVision: ", err);
        });
    ////////////////////////////////////////////////////////////////////////////////
    //after query is successful, send a response
});
///////////////////////////////////////////////////////////////////////////////
// GET/selectedimage
app.get("/selectedimage/:id", (req, res) => {
    console.log("************************************GET/selected/:id");
    console.log("id: ", req.params.id);

    let admin = req.session.admin;

    Promise.all([
        db.selectImage(req.params.id),
        db.selectAllComments(req.params.id),
        db.selectAllTags(req.params.id),
        [{ admin: admin }]
    ])
        .then(data => {
            // console.log("picture: ", data);
            res.json(data);
        })
        .catch(err => {
            console.log(
                "err in getting pictures or select all coments or select all tags: ",
                err
            );
        });
});

app.get("/tags/:tag", (req, res) => {
    console.log("************************************/tag/:tag");
    console.log("tag: ", req.params.tag);
    let tag = req.params.tag;
    db.getImagesByTags(tag)
        .then(tagImages => {
            console.log("tagImages: ", tagImages);
            res.json(tagImages);
        })
        .catch(err => {
            console.log("err in getImagesByTags: ", err);
        });
});

app.post("/comment", (req, res) => {
    console.log("*******************************POST/comment");
    // console.log("pic id: ", req.body.id);
    // console.log("user comment: ", req.body.comment);
    // console.log("username: ", req.body.username);
    // console.log(req.body);

    db.insertComment(req.body.username, req.body.id, req.body.comment)
        .then(data => {
            // console.log("data from insertComment: ", data);
            res.json(data);
        })
        .catch(err => console.log("err in insertComment: ", err));
});

app.get("/showmore/:lastId", (req, res) => {
    console.log("**************************************GET/showmore");
    var lastId = req.params.lastId;
    // console.log("lastId: ", lastId);

    db.showMore(lastId).then(result => {
        // console.log("result from showMore: ", result);
        // console.log("result[0].lastId from showMore: ", result[0].lowestId);
        res.json(result);
    });
});

app.listen(process.env.PORT || 8080, () => console.log(`I'm listening.`));
