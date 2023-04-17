const fs = require("fs");
const path = require("path");
const {Render} = require("./ServerRenderer");
const chokidar = require("chokidar");

exports.DevServer = (source, outputDirectory) => {
    var bs = require("browser-sync").create();
    
    // .init starts the server
    bs.init({
        server: outputDirectory
    });
    
    const watcherDirectory = source;

// AutoreloadServer

let watcher = chokidar.watch(watcherDirectory);
const log = console.log.bind(console);

watcher
    .on('add', async (filepath) => {
        let rendFile;
        if (path.extname(filepath) == ".html") {
            rendFile = await Render(filepath);
        } else {
            rendFile = fs.readFileSync(filepath).toString();
        }
        let nwPath = filepath.replace(watcherDirectory, "");
        nwPath = path.join(outputDirectory, nwPath);
        fs.writeFileSync(nwPath, rendFile);
        console.log("Writing File ", nwPath);
    })
    .on('change', async (filepath) => {
        let rendFile;

        if (path.extname(filepath) == ".html") {
            console.log("renderingFile");
            rendFile = await Render(filepath);
        } else {
            rendFile = fs.readFileSync(filepath).toString();
        }
        console.log("UPDATED MENU");
        let nwPath = filepath.replace(watcherDirectory, "");
        nwPath = path.join(outputDirectory, nwPath);
        if (fs.existsSync(nwPath)) {
            fs.rmSync(nwPath);
        }
        fs.writeFileSync(nwPath, rendFile);
        console.log("Writing File ", nwPath);
    })
    .on('unlink', async (filepath) => {

        let nwPath = filepath.replace(watcherDirectory, "");
        nwPath = path.join(outputDirectory, nwPath);

        if (fs.existsSync(nwPath)) {
            fs.rmSync(nwPath);
        }
    });

// Handle Directorys

watcher
    .on('addDir', filepath => {
        // path.replace
        let nwPath = filepath.replace(watcherDirectory, "");
        // New Directory Location
        nwPath = path.join(outputDirectory, nwPath);
        if (!fs.existsSync(nwPath)) {
            fs.mkdirSync(nwPath);
        }
    })
    .on('unlinkDir', filepath => {
        let nwPath = filepath.replace(watcherDirectory, "");
        nwPath = path.join(outputDirectory, nwPath);

        if (fs.existsSync(nwPath)) {
            fs.rmdirSync(nwPath);
        }
    });


}
