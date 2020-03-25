const fs = require("fs");

// fs.writeFile(
//     "process.env.GOOGLE_APPLICATION_CREDENTIALS",
//     process.env.GOOGLE_CONFIG,
//     err => {
//         console.log(err);
//     }
// );

fs.writeFile("./ala.txt", process.env.GOOGLE_CONFIG, err => {
    console.log(err);
});

process.env.alejaja = {
    alejaja: "alejaja"
};

console.log("process.env.alejaja: ", process.env.alejaja);
