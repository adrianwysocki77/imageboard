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

    let contents = fs.readFileSync(`./uploads/${req.file.filename}`);

    if (req.file.mimetype == "gif") {
        console.log("gif file");
    }

    sharp(contents)
        .rotate()
        .resize(null, 2000)
        .toFile(`./uploads/lol${req.file.filename}`)
        .then(result => {
            console.log("result: ", result);
            const { filename, mimetype, path, size, originalname } = req.file;
            ////////////////////////////////////////////////////////////////////
            //COMPRESSED FILE
            const compressedFilePath = __dirname + "/uploads/lol" + filename;
            const compressedFileSize = result.size;

            // console.log("filename: ", filename);
            // console.log("path", path);
            // console.log("compressedFilePath", compressedFilePath);
            // console.log("size: ", size);
            // console.log("compressedFileSize: ", compressedFileSize);

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
                    fs.unlink(`./uploads/lol${req.file.filename}`, () => {});
                })
                .catch(err => {
                    console.log(err, "failure :(");
                    res.sendStatus(500);
                });
        })
        .catch(err => {
            console.log(err);
        });
};
