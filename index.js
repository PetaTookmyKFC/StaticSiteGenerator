const fs = require("fs");
const path = require("path");
const {Render} = require("./ServerRenderer");
const chokidar = require("chokidar");

// AutoreloadServer
var bs = require("browser-sync").create();

// .init starts the server
bs.init({
    server: "./Dist"
});

const watcherDirectory = path.join(__dirname, "src");

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
        nwPath = path.join(__dirname, "Dist", nwPath);
        fs.writeFileSync(nwPath, rendFile);

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
        nwPath = path.join(__dirname, "Dist", nwPath);
        if (fs.existsSync(nwPath)) {
            fs.rmSync(nwPath);
        }
        fs.writeFileSync(nwPath, rendFile);

    })
    .on('unlink', async (filepath) => {

        let nwPath = filepath.replace(watcherDirectory, "");
        nwPath = path.join(__dirname, "Dist", nwPath);

        if (fs.existsSync(nwPath)) {
            fs.rmSync(nwPath);
        }

        bs.reload("*.html");
    });

// Handle Directorys

watcher
    .on('addDir', filepath => {
        // path.replace
        let nwPath = filepath.replace(watcherDirectory, "");
        // New Directory Location
        nwPath = path.join(__dirname, "Dist", nwPath);
        if (!fs.existsSync(nwPath)) {
            fs.mkdirSync(nwPath);
        }
    })
    .on('unlinkDir', filepath => {
        let nwPath = filepath.replace(watcherDirectory, "");
        nwPath = path.join(__dirname, "Dist", nwPath);

        if (fs.existsSync(nwPath)) {
            fs.rmdirSync(nwPath);
        }

        bs.reload("*.html");
    });

