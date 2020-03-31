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

    if (req.file.mimetype == "image/gif") {
        const { filename, path, mimetype, size } = req.file;

        s3.putObject({
            Bucket: "fruitybucket",
            ACL: "public-read",
            Key: filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size
        })
            .promise()
            .then(() => {
                next();
                fs.unlink(path, () => {});
            })
            .catch(err => {
                console.log(err, "failure :(");
                res.sendStatus(500);
            });
    } else {
        let contents = fs.readFileSync(`./uploads/${req.file.filename}`);

        sharp(contents)
            .rotate()
            .resize(null, 2000)
            .toFile(`./uploads/lol${req.file.filename}`)
            .then(result => {
                console.log("result: ", result);
                ////////////////////////////////////////////////////////////////////
                //COMPRESSED FILE
                const compressedFilePath =
                    __dirname + "/uploads/lol" + filename;
                const compressedFileSize = result.size;

                ////////////////////////////////////////////////////////////////////
                //No compressor code
                // s3.putObject({
                //     Bucket: "fruitybucket",
                //     ACL: "public-read",
                //     Key: filename,
                //     Body: fs.createReadStream(path),
                //     ContentType: mimetype,
                //     ContentLength: size
                // })

                s3.putObject({
                    Bucket: "fruitybucket",
                    ACL: "public-read",
                    Key: "lol" + filename,
                    Body: fs.createReadStream(compressedFilePath),
                    ContentType: mimetype,
                    ContentLength: compressedFileSize
                })
                    .promise()
                    .then(() => {
                        next();
                        fs.unlink(path, () => {});
                        fs.unlink(
                            `./uploads/lol${req.file.filename}`,
                            () => {}
                        );
                    })
                    .catch(err => {
                        console.log(err, "failure :(");
                        res.sendStatus(500);
                    });
            })
            .catch(err => {
                console.log(err);
            });
    }
};

////////////////////////////////////////////////////////////////////////////////
// GIFS COMPRESSOR
// if (req.file.mimetype == "image/gif") {
//     console.log("gif file");
// }
//
// const INPUT_path_to_your_images =
//     "src/img/**/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}";
// const OUTPUT_path = "build/img/";
//
// compress_images(
//     INPUT_path_to_your_images,
//     OUTPUT_path,
//     { compress_force: false, statistic: true, autoupdate: true },
//     false,
//     { jpg: { engine: "mozjpeg", command: ["-quality", "60"] } },
//     { png: { engine: "pngquant", command: ["--quality=20-50"] } },
//     { svg: { engine: "svgo", command: "--multipass" } },
//     {
//         gif: {
//             engine: "gifsicle",
//             command: ["--colors", "64", "--use-col=web"]
//         }
//     },
//     function() {
//         console.log("in compte");
//     }
// );
