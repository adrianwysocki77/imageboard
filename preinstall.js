const fs = require("fs");

console.log("super preinstall!!!");
console.log("in production log credentials: ", process.env.GOOGLE_CONFIG);

fs.writeFile("./google-credentials.json", process.env.GOOGLE_CONFIG, err => {
    console.log(err);
});

const credentials = require("./google-credentials.json");

console.log("credeentials");
