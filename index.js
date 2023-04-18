const fs = require("fs");
const path = require("path");
const { Render } = require("./ServerRenderer");
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

    function ScanDirectory(DirectoryLocation) {
        return new Promise(async (resolve, reject) => {
            try {
                // console.log("Scanning directory : ", DirectoryLocation);
                let directoryScan = await fs.promises.readdir(DirectoryLocation);
                directoryScan.forEach(async (item) => {
                    if (item != ".git") {
                        if (fs.statSync(path.join(DirectoryLocation, item)).isDirectory()) {
                            let curPath = path.join(DirectoryLocation, item);
                            let nwPath = curPath.replace(watcherDirectory, "");
                            nwPath = path.join(outputDirectory, nwPath);

                            console.log("Scanning Directory ", curPath);

                            if (!fs.existsSync(nwPath)) {
                                fs.mkdirSync(nwPath);
                            }

                            await ScanDirectory(path.join(DirectoryLocation, item));
                        } else {

                            console.log("Rendering File ", path.join(DirectoryLocation, item));

                            await RenderFile(path.join(DirectoryLocation, item));
                        }
                    }
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        })


    }
    function RenderFile(RenderFile) {
        return new Promise(async (resolve, reject) => {
            let rendResult;
            try {
                if (path.extname(RenderFile) == ".html") {
                    rendResult = await Render(RenderFile);
                } else {
                    rendResult = await fs.readFileSync(RenderFile).toString();
                }

                let nwPath = RenderFile.replace(watcherDirectory, "");
                nwPath = path.join(outputDirectory, nwPath);
                fs.writeFileSync(nwPath, rendResult);
            } catch (error) {
                // console.log("DUBUGGER _TRIGGERED", error);
                let nwPath = RenderFile.replace(watcherDirectory, "");
                nwPath = path.join(outputDirectory, nwPath);
                fs.writeFileSync(nwPath, error.toString());
            }
            resolve();
        })
    }
    watcher
        .on('add', async (filepath) => {
            // console.log(" - Add Triggered");
            TriggerReload();
        })
        .on('change', async (filepath) => {
            // console.log(" - Change Triggered");
            TriggerReload();
        })
        .on('unlink', async (filepath) => {
            // console.log(" - Unlink Triggered");

            let nwPath = filepath.replace(watcherDirectory, "");
            nwPath = path.join(outputDirectory, nwPath);
            if (fs.existsSync(nwPath)) {
                fs.rmSync(nwPath);
            }
            TriggerReload();
        });

    // Handle Directorys

    watcher
        .on('addDir', async (filepath) => {
            // console.log(" - AddDir Triggered");

            // path.replace
            let nwPath = filepath.replace(watcherDirectory, "");
            // New Directory Location
            nwPath = path.join(outputDirectory, nwPath);
            if (!fs.existsSync(nwPath)) {
                fs.mkdirSync(nwPath);
            }
            // await ScanDirectory(watcherDirectory);
            // bs.reload();
        })
        .on('unlinkDir', async (filepath) => {
            // console.log(" - RemDir Triggered");


            let nwPath = filepath.replace(watcherDirectory, "");
            nwPath = path.join(outputDirectory, nwPath);
            if (fs.existsSync(nwPath)) {
                fs.rmdirSync(nwPath, { recursive: true, force: true });
            }
            TriggerReload();
        });
    // ScanDirectory(watcherDirectory);

    let ReloadScheduled = false;
    async function TriggerReload() {
        if (ReloadScheduled == false) {
            ReloadScheduled = true;
            console.clear();
            console.log("Reloading");
            await Delay();
            await ScanDirectory(watcherDirectory);
            bs.reload();
            ReloadScheduled = false;
        }
    }
    function Delay() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });
    }
    TriggerReload();
}