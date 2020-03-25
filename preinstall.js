const fs = require("fs");

console.log("super preinstall!!!");
console.log("in production log credentials: ", process.env.GOOGLE_CONFIG);

// const credentials = require("./google-credentials.json");
//
// console.log("credeentials");

createCredentials();

async function createCredentials() {
    try {
        await fs.writeFile(
            "./google-credentials.json",
            process.env.GOOGLE_CONFIG,
            err => {
                console.log(err);
            }
        );

        const credentials = require("./google-credentials.json");
        console.log("credentials!!!! ", credentials);
    } catch (e) {
        console.log("error: ", e);
    }
}
