console.log("Testing Script");
const fs = require("fs");
const path = require("path");
// let { render } = require("./render_worker.js");
let filepath = path.join(__dirname, "Example", "test.html");
// render(filepath).then(data => {
//     console.log("FinnishedResult");
//     console.log(data);

//     fs.writeFileSync("outputs", data);
// }).catch(error => console.error("Error : ", error));

const { Render } = require("./index.js");

// Render(filepath).then(data => {
// }).catch(error => {
// })

async function main () {
    try {
        console.log("Running Main")
        let data = await Render(path.join(__dirname,"Example", "test.html"));
        fs.writeFileSync("output.html", data);
    } catch (error) {
        fs.writeFileSync("error", JSON.stringify(error));
    }
}
main();