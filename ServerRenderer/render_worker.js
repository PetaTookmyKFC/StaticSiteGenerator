const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
const { parentPort } = require("worker_threads");
const fs = require("fs");
const path = require("path");

console.log = () => {}

let veriables = {};
let Responce = "";

const write = (Message) => {
    console.log("Writting");
    Responce = Responce + Message;
}

parentPort.on("message", async (msg) => {
    
    console.log("Got file" , msg);

    // Make Everything inside server tag
    await ParceFile(msg);
    parentPort.postMessage(Responce);
    console.log(Responce);
});
function ParceFile(filepath) {
    return new Promise(async (resolve, reject) => {
        try {
            let code = fs.readFileSync(filepath).toString();
            let codeArray = code.split(/(<ser>(\s|\S)*?\<\/ser>)/gi);



            if (codeArray.length > 1) {
                while (codeArray.length > 0) {
                    write(codeArray[0]);
                    codeArray.shift();
                    if (codeArray.length > 0) {
                        let handleCode = codeArray[0];
                        handleCode = handleCode.replace(/(<ser>)/gi, "");
                        handleCode = handleCode.replace(/(<\/ser>)/gi, "");
                        codeArray.shift();
                        await EvalCode(filepath, handleCode)
                        // await new AsyncFunction("write", "component", handleCode).call(this, write, Component);
                        codeArray.shift();
                    }
                }
            } else {
                write(codeArray[0]);
                codeArray.shift();
            }

            resolve();
        } catch (error) {
            reject(error);
        }
    })
}
async function EvalCode(parentFilePath, code) {
    return new Promise(async (resolve, reject) => {
        try {
            const Component = (filepath, params) => {
                return new Promise(async (resolve, reject) => {
                    await ParceFile(path.join(path.dirname(parentFilePath), filepath));
                    // let nwComp = 
                    // fs.readFileSync(path.join(path.dirname(parentFilePath), filepath)).toString();
                    // await EvalCode(nwComp);
                    resolve();
                })
            }

            await new AsyncFunction("write", "component", code).call(this, write, Component);

            resolve(Responce);
        } catch (error) {
            reject(error);
        }
        
    })
}

function TestRenderer(filename) {
    console.log("Checking!");
    return new Promise(async (resolve, reject) => {
        try {
            await ParceFile(filename);
            resolve(Responce);
        } catch (error) {
            reject(error);
        }
    })
}

// exports.render = TestRenderer;