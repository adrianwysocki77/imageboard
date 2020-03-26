const fs = require("fs");
//
// fs.writeFile(
//     "process.env.GOOGLE_APPLICATION_CREDENTIALS",
//     process.env.GOOGLE_CONFIG,
//     err => {
//         console.log(err);
//     }
// );

// fs.writeFile("./ala.txt", process.env.GOOGLE_APPLICATION_CREDENTIALS, err => {
//     console.log(err);
// });

const credentials = JSON.stringify(process.env.GOOGLE_CONFIG);

fs.writeFile("config/google-credentials-heroku.json", credentials, function(
    err
) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }

    console.log("JSON file has been saved.");
});

const credentials2 = require("config/google-credentials-heroku.json");

console.log(credentials2);

// file system module to perform file operations

// json data
// var jsonData =
//     '{"persons":[{"name":"John","city":"New York"},{"name":"Phil","city":"Ohio"}]}';
//
// // parse json
// var jsonObj = JSON.parse(jsonData);
// console.log(jsonObj);
//
// // stringify JSON Object
// var jsonContent = JSON.stringify(jsonObj);
// console.log(jsonContent);
//
// fs.writeFile("output.json", jsonContent, "utf8", function(err) {
//     if (err) {
//         console.log("An error occured while writing JSON Object to File.");
//         return console.log(err);
//     }
//
//     console.log("JSON file has been saved.");
// });
