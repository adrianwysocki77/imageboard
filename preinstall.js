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

fs.writeFile("google-credentials-heroku.json", credentials, function(err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }

    console.log("JSON file has been saved.");
});

const credentials2 = require("./google-credentials-heroku.json");

console.log(credentials2);
