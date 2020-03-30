const fs = require("fs");
const credentials = process.env.GOOGLE_CONFIG;

console.log("credentials: ", credentials);

fs.writeFile("./google-credentials-heroku.json", credentials, function(err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }

    console.log("JSON file has been saved.");
});

setTimeout(function() {
    let credentials2 = require("./google-credentials-heroku.json");
    console.log("credentials2", credentials2);
    console.log("credentials2.client_email", credentials2.client_email);
}, 2000);
