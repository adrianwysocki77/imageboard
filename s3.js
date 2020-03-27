const aws = require("aws-sdk");
const fs = require("fs");
const sharp = require("sharp");

let secrets;

if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET
});

exports.upload = (req, res, next) => {
    if (!req.file) {
        console.log(`req.file ain't there`);
        return res.sendStatus(500);
    }

    // fs.readFile("./uploads/fruit.jpg", function(err, data) {
    //     if (err) throw err;
    //     console.log("data in readfile!!!: ", data);
    //     image = data;
    // });
    // console.log("data out of readFile: ", image);
    // console.log("filename");
    //
    ///////////////////////////////////////////////////////////////////////////////
    // let contents = fs.readFileSync(`./uploads/${req.file.filename}`);
    //
    // sharp(contents)
    //     .toFile("output.gif")
    //     .then(info => {
    //         console.log("something: ", info);
    //         next();
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     });

    ////////////////////////////////////////////////////////////////////////////////
    // var stats = fs.statSync(`./uploads/${req.file.filename}`);
    // var fileSizeInBytes = stats["size"];
    //
    // console.log("req.file: ", req.file);
    //
    // let g = sharp(contents)
    //     .rotate()
    //     .resize(300)
    //     .toBuffer()
    //     .then(data => {
    //         console.log("data sharp compression: ", data);
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     });
    // console.log("g!!!!: ", g);
    //
    // var stats = fs.statSync(`./uploads/${req.file.filename}`);
    // var fileSizeInBytes = stats["size"];
    // console.log("fileSizeInBytes: ", fileSizeInBytes);
    //
    // console.log("req.file: ", req.file);
    ///////////////////////////////////////////////////////////////////////////////
    //Stary s3
    const { filename, mimetype, path, size, originalname } = req.file;

    console.log("orginalname: ", originalname);

    s3.putObject({
        Bucket: "spicedling",
        ACL: "public-read",
        Key: filename,
        Body: fs.createReadStream(path),
        ContentType: mimetype,
        ContentLength: size
    })
        .promise()
        .then(() => {
            console.log("it worked!");
            next();
            fs.unlink(path, () => {});
        })
        .catch(err => {
            console.log(err, "failure :(");
            res.sendStatus(500);
        });
};
/////////////////////////////////////////////////////////////////////////////////
//Nowy s3

// /////////////////////////////////////////////////////////////////////////////////
// //FIRST BAD COMPRESSOR
// const imagemin = require("imagemin");
// const imageminMozjpeg = require("imagemin-mozjpeg");
//
// exports.upload = (req, res, next) => {
//     if (!req.file) {
//         console.log(`req.file ain't there`);
//         return res.sendStatus(500);
//     }
//
//     console.log("req.file.mimetype: ", req.file.mimetype);
//     if (req.file.mimetype != "image/jpeg") {
//         console.log(`req.file.mimetype != "image/jpeg": `, req.file.mimetype);
//         return res.sendStatus(500);
//     }
//     ///////////////////////////////////////////////////////////////////////////////
//     console.log("req.file.size: ", req.file.size);
//     (async () => {
//         console.log("in compressing!!");
//         const files = await imagemin([`./uploads/${req.file.filename}`], {
//             // const files = await imagemin([`./uploads/fruit.jpg`], {
//             destination: "./uploads",
//             plugins: [imageminMozjpeg({ quality: 40 })]
//         });
//         await console.log("!!!!!!!!!!!files in compression: ", files);
//
//         console.log("req.file.size: ", req.file.size);
//         console.log("after compression");
//
//         let size;
//         await setTimeout(function() {
//             console.log("SETTIMEOUT 1");
//             let path1 = `./uploads/${req.file.filename}`;
//             let stats = fs.statSync(path1);
//             console.log("stats: ", stats);
//             size = stats.size;
//         }, 2000);
//
//         ///////////////////////////////////////////////////////////////////////////////
//
//         ///////////////////////////////////////////////////////////////////////////////
//         const { filename, mimetype, path } = req.file;
//
//         console.log("req.file: ", req.file);
//
//         await setTimeout(function() {
//             console.log("setTimeout START!!!");
//             s3.putObject({
//                 Bucket: "spicedling",
//                 ACL: "public-read",
//                 Key: filename,
//                 Body: fs.createReadStream(path),
//                 ContentType: mimetype,
//                 ContentLength: size
//             })
//                 .promise()
//                 .then(() => {
//                     console.log("it worked!");
//                     next();
//                     fs.unlink(path, () => {});
//                 })
//                 .catch(err => {
//                     console.log(err, "failure :(");
//                     res.sendStatus(500);
//                 });
//         }, 3000);
//     })();
// };
