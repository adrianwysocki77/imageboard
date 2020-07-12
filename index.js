const express = require("express");
const app = express();
const db = require("./db");
const s3 = require("./s3");
const { s3Url } = require("./config");
const fs = require("fs");
let secrets;

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
// const basicAuth = require("basic-auth");
// const auth = function(req, res, next) {
//     const creds = basicAuth(req);
//
//     function checkCred(creds) {
//         let trueCreds;
//         if (!creds) {
//             console.log("no creds!!!");
//             trueCreds = true;
//             req.session.admin = false;
//         } else if (creds.name == secrets.adi && creds.pass == secrets.adipass) {
//             console.log("logged as an admin");
//             trueCreds = false;
//             req.session.admin = true;
//         } else if (
//             creds.name == secrets.tomon &&
//             creds.pass == secrets.tomonpass
//         ) {
//             console.log("logged as tomon");
//             trueCreds = false;
//         } else if (
//             creds.name == secrets.wysoccy &&
//             creds.pass == secrets.wysoccypass
//         ) {
//             console.log("logged as wysoccy");
//             trueCreds = false;
//         } else if (
//             creds.name == secrets.peppermint &&
//             creds.pass == secrets.peppermintpass
//         ) {
//             console.log("logged as wysoccy");
//             trueCreds = false;
//         } else if (
//             creds.name == secrets.lesna &&
//             creds.pass == secrets.lesnapass
//         ) {
//             console.log("logged as wysoccy");
//             trueCreds = false;
//         } else {
//             console.log("wrong login or password");
//             trueCreds = true;
//         }
//
//         return trueCreds;
//     }
//
//     if (checkCred(creds)) {
//         res.setHeader(
//             "WWW-Authenticate",
//             'Basic realm="Enter your credentials to see this stuff."'
//         );
//         res.sendStatus(401);
//     } else {
//         next();
//     }
// };
//
// app.use(auth);

app.use(express.json());
app.use(express.static("./public"));
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
///////////////////////////////////////////////////////////////////////////////
//GOOGLE CLOUD VISION
const googleVision = async function(url) {
    try {
        // Imports the Google Cloud client library
        const vision = await require("@google-cloud/vision");
        // Creates a client
        let client;
        if (process.env.NODE_ENV === "production") {
            // console.log("in production");
            client = await new vision.ImageAnnotatorClient({
                keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
            });
        } else {
            client = await new vision.ImageAnnotatorClient({
                keyFilename: "./google-credentials.json"
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
            fruits.push(label.description);
        });
        return fruits;
    } catch (e) {
        console.log("err in googleVision!!!");
        console.log("error: ", e);
    }
};

///////////////////////////////////////////////////////////////////////////////
//POST/UPLOAD
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

// CREATING FILE
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    let imageUrl;

    console.log("req.file.mimetype: ", req.file.mimetype);

    if (req.file.mimetype == "image/gif") {
        console.log("req.file.mimetype: ", req.file.mimetype);
        imageUrl = s3Url + req.file.filename;
    } else {
        imageUrl = s3Url + "lol" + req.file.filename;
    }

    const title = req.body.title;
    const description = req.body.description;
    const username = req.body.username;
    const tags = req.body.tags;
    const arrTags = tags.replace(" ", "").split(",");
    let fruitInside = false;

    googleVision(imageUrl)
        .then(result => {
            let possibleFruitInside = [];
            for (let i = 0; i < result.length; i++) {
                possibleFruitInside.push(result[i].toLowerCase());
            }

            for (let i = 0; i < possibleFruitInside.length; i++) {
                for (let u = 0; u < allFruits.length; u++) {
                    if (possibleFruitInside[i] == allFruits[u]) {
                        console.log("fruit inside true!!!!!");
                        fruitInside = true;
                        break;
                    }
                }
            }

            if (fruitInside) {
                db.addImage(imageUrl, username, title, description)
                    .then(addedImage => {
                        if (tags !== "") {
                            for (let i = 0; i < arrTags.length; i++) {
                                db.insertTag(arrTags[i], addedImage[0].id)
                                    .then(insertedTags => {
                                        console.log(
                                            "insertedTags:",
                                            insertedTags
                                        );
                                        if (i == arrTags.length - 1) {
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
                console.log("no fruit");
                res.json({
                    success: false
                });
            }
        })
        .catch(err => {
            console.log("err in googleVision: ", err);
        });
});
///////////////////////////////////////////////////////////////////////////////
// GET/IMAGES
app.get("/images", (req, res) => {
    db.getAll()
        .then(result => {
            // console.log("result.rows!!!!!!!!: ", result.rows);
            res.json(result.rows);
        })
        .catch(err => {
            console.log("err in get all: ", err);
        });
});

///////////////////////////////////////////////////////////////////////////////
// GET/SELECTEDIMAGE
app.get("/selectedimage/:id", (req, res) => {
    let admin = req.session.admin;
    Promise.all([
        db.selectImage(req.params.id),
        db.selectAllComments(req.params.id),
        db.selectAllTags(req.params.id),
        [{ admin: admin }]
    ])
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            console.log(
                "err in getting pictures or select all coments or select all tags: ",
                err
            );
        });
});
///////////////////////////////////////////////////////////////////////////////
//GET/TAGS
app.get("/tags/:tag", (req, res) => {
    let tag = req.params.tag;
    db.getImagesByTags(tag)
        .then(tagImages => {
            res.json(tagImages);
        })
        .catch(err => {
            console.log("err in getImagesByTags: ", err);
        });
});
///////////////////////////////////////////////////////////////////////////////
//POST/COMMENT
app.post("/comment", (req, res) => {
    db.insertComment(req.body.username, req.body.id, req.body.comment)
        .then(data => {
            res.json(data);
        })
        .catch(err => console.log("err in insertComment: ", err));
});
////////////////////////////////////////////////////////////////////////////////
//GET/SHOWMORE
app.get("/showmore/:lastId", (req, res) => {
    var lastId = req.params.lastId;
    db.showMore(lastId).then(result => {
        res.json(result);
    });
});
///////////////////////////////////////////////////////////////////////////////
//GET/DELETE
app.get("/delete/:imageId", (req, res) => {
    var imageId = req.params.imageId;
    Promise.all([
        db.deleteTags(imageId),
        db.deleteComments(imageId),
        db.deleteImage(imageId)
    ])
        .then(data => {
            res.json({
                delete: "success"
            });
        })
        .catch(err => {
            console.log("err in deleteImage: ", err);
        });
});
///////////////////////////////////////////////////////////////////////////////
app.listen(process.env.PORT || 8080, () => console.log(`I'm listening.`));
