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
                let directoryScan = await fs.promises.readdir(DirectoryLocation);
                directoryScan.forEach(async (item) => {
                    if (item != ".git") {
                        if (fs.statSync(path.join(DirectoryLocation, item)).isDirectory()) {
                            await ScanDirectory(path.join(DirectoryLocation, item));
                        } else {
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
            if (path.extname(RenderFile) == ".html") {
                rendResult = await Render(RenderFile);
            } else {
                rendResult = await fs.readFileSync(RenderFile).toString();
            }

            let nwPath = RenderFile.replace(watcherDirectory, "");
            nwPath = path.join(outputDirectory, nwPath);
            fs.writeFileSync(nwPath, rendResult);

            resolve();
        })
    }

    watcher
        .on('add', async (filepath) => {
            await ScanDirectory(watcherDirectory);
            bs.reload();
        })
        .on('change', async (filepath) => {
            await ScanDirectory(watcherDirectory);
            bs.reload();
        })
        .on('unlink', async (filepath) => {
            let nwPath = filepath.replace(watcherDirectory, "");
            nwPath = path.join(outputDirectory, nwPath);
            if (fs.existsSync(nwPath)) {
                fs.rmSync(nwPath);
            }
            await ScanDirectory(watcherDirectory);
            bs.reload();
        });

    // Handle Directorys

    watcher
        .on('addDir', async ( filepath ) => {
            // path.replace
            let nwPath = filepath.replace(watcherDirectory, "");
            // New Directory Location
            nwPath = path.join(outputDirectory, nwPath);
            if (!fs.existsSync(nwPath)) {
                fs.mkdirSync(nwPath);
            }
            await ScanDirectory(watcherDirectory);
            bs.reload();
        })
        .on('unlinkDir', async ( filepath ) => {
            let nwPath = filepath.replace(watcherDirectory, "");
            nwPath = path.join(outputDirectory, nwPath);
            if (fs.existsSync(nwPath)) {
                fs.rmdirSync(nwPath);
            }
            await ScanDirectory(watcherDirectory);
            bs.reload();
        });
    ScanDirectory(watcherDirectory);
}