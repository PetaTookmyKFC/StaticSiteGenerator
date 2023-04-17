const fs = require("fs");
const { Worker } = require("worker_threads");
const path = require("path");

exports.Render = function (filepath) {
    console.log("Rendering File ", filepath);

    let directory = path.join(__dirname, "render_worker.js");

    return new Promise((resolve, reject) => {
        try {
            let render = new Worker(directory);

            render.on("message", (message) => {
                // console.log("Get Message from Worker! ", message);
                resolve(message);
                render.terminate();
            });

            render.on("exit", (data) => {
                console.log("Thread Exited with ", data);
            });

            render.on("error", (message) => {
                console.log("Error in thread!", message);
                reject(message);
                render.terminate();
            });
            render.postMessage(filepath);
        } catch (error) {
            reject(error);
        }
    })
}
