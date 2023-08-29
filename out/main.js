"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const puppeteer_core_1 = __importStar(require("puppeteer-core"));
const ics = __importStar(require("ics"));
const fs = __importStar(require("fs"));
const ws_1 = __importDefault(require("ws"));
// Setup websocket for feedback on frontend.
// const WebSocket = require('ws');
const wss = new ws_1.default.Server({ port: 8080 });
wss.on('connection', (ws) => {
    // Send data to the connected client
    ws.send('Connected to WebSocket');
    // Replace this with your actual logging mechanism
    console.log = (...args) => {
        ws.send(JSON.stringify({ type: 'log', message: args.join(' ') }));
    };
});
let mainWindow = null;
function createMainWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 450,
        height: 450,
        resizable: false,
        maximizable: false,
        autoHideMenuBar: true,
        center: true,
        webPreferences: {
            preload: path.join(__dirname, "../out/index/index-preload.js"),
        },
    });
    mainWindow.loadFile(path.join(__dirname, "../src/index/index.html"));
}
async function grabTimetable(email, password) {
    const browserFetcher = new puppeteer_core_1.BrowserFetcher({ path: path.join(__dirname, "../puppeteer") });
    const revisionInfo = await browserFetcher.download("1069273");
    const browser = await puppeteer_core_1.default.launch({
        executablePath: revisionInfo.executablePath,
        headless: true,
        args: ["--start-maximized", "--window-size=1920,1080"],
        defaultViewport: null,
    });
    const pages = await browser.pages();
    const page = pages[0];
    try {
        await page.goto("https://in4sit.singaporetech.edu.sg", { waitUntil: "networkidle0", timeout: 30000 });
        console.log("Running... Page Loaded");
        const emailInput = await page.waitForSelector("#userNameInput", { visible: true });
        await emailInput.type(email);
        console.log("Running... Email Inputed");
        const passwordInput = await page.waitForSelector("#passwordInput", { visible: true });
        await passwordInput.type(password);
        console.log("Running... Password Inputed");
        const loginButton = await page.waitForSelector("#submitButton", { visible: true });
        await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), loginButton.click()]);
        console.log("Running... Logged In");
        // const courseManagementLink = (await page.waitForXPath('//span[text()="Course Management"]', {
        //   visible: true,
        // })) as ElementHandle<HTMLElement>;
        // await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), courseManagementLink.click()]);
        // console.log("Running... Navigated to Course Management")
        // const myWeeklyScheduleLink = (await page.waitForXPath('//span[text()="My Weekly Schedule"]', {
        //   visible: true,
        //   timeout: 60000
        // })) as ElementHandle<HTMLElement>;
        // console.log("Running... Found My Weekly Schedule.")
        // await myWeeklyScheduleLink.click();
        // console.log("Running... Clicked My Weekly Schedule")
        // // Get Content of Iframe
        // const mainContentFrame = await page.waitForFrame(
        //   "https://in4sit.singaporetech.edu.sg/psc/CSSISSTD/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.SSR_SSENRL_SCHD_W.GBL?NavColl=true&ICAGTarget=start&ICAJAXTrf=true"
        // );
        // console.log("Running... Navigated to My Weekly Schedule")
        await new Promise(function (resolve) {
            setTimeout(resolve, 4000);
        });
        // Go to source of Iframe
        await page.goto("https://in4sit.singaporetech.edu.sg/psc/CSSISSTD/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.SSR_SSENRL_SCHD_W.GBL?NavColl=true&ICAGTarget=start&ICAJAXTrf=true");
        await page.waitForSelector("xpath/" + '//div[@id="WAIT_win0" and not(@class)]', { hidden: true });
        console.log("Running... Naviagated to source of URL");
        // Swap to list 
        const listViewRadioButton = (await page.waitForSelector("xpath/" + '//label[text()="List View"]', {
            visible: true,
        }));
        console.log("Running... Found List View Radio");
        await listViewRadioButton.click();
        await page.waitForSelector("xpath/" + '//div[@id="WAIT_win0" and not(@class)]', { hidden: true });
        console.log("Running... Clicked List View");
        // Ensure all Filters are correct (remove dropped and waitlist)
        const showDroppedClassesCheckBox = (await page.waitForSelector("xpath/" + '//label[text()="Show Dropped Classes"]', {
            visible: true,
        }));
        await showDroppedClassesCheckBox.click();
        console.log("Running... Unchecked Dropped Classes checkbox");
        const showWaitlistedClassesCheckBox = (await page.waitForSelector("xpath/" + '//label[text()="Show Waitlisted Classes"]', {
            visible: true,
        }));
        await showWaitlistedClassesCheckBox.click();
        console.log("Running... Unchecked Waitlisted Classes checkbox");
        const filterButton = (await page.waitForSelector("xpath/" + '//input[@value="Filter"]', {
            visible: true,
        }));
        await filterButton.click();
        await page.waitForSelector("xpath/" + '//div[@id="WAIT_win0" and not(@class)]', { hidden: true });
        console.log("Running... Triggered Filter");
        // Go to Printer Friendly Page
        const printerFriendlyPageLink = (await page.waitForSelector("xpath/" + '//a[text()="Printer Friendly Page"]', {
            visible: true,
        }));
        await printerFriendlyPageLink.click();
        await page.waitForSelector("xpath/" + '//div[@id="WAIT_win0" and not(@class)]', { hidden: true });
        console.log("Running... Navigated to Printer Friendly Page");
        // Debugger setting to see console log items
        page.on('console', async (message) => {
            if (message.type() === 'log') {
                const args = await Promise.all(message.args().map(arg => arg.jsonValue()));
                console.log('Browser Console:', ...args);
            }
        });
        //Extract the courses
        // Note: Evaluate cannot return complex objects. Testing extraction of courses
        console.log("Running... Printer Page Scrap / eval starts");
        const scrapedCourses = await page.evaluate(() => {
            // Helper function to convert time format
            function convertTo24HourFormat(timeString) {
                const [time, ampm] = timeString.split(/(?<=[0-9])(?=[APMapm]+)/i);
                const [hours, minutes] = time.split(':');
                let hours24 = parseInt(hours);
                if (ampm.toLowerCase() === 'pm' && hours24 !== 12) {
                    hours24 += 12;
                }
                else if (ampm.toLowerCase() === 'am' && hours24 === 12) {
                    hours24 = 0;
                }
                return `${hours24.toString().padStart(2, '0')}:${minutes}`;
            }
            // Select all the table of classes
            const elementHandlers = Array.from(document.querySelectorAll(".PABACKGROUNDINVISIBLEWBO")).slice(1);
            // Declare var to be used 
            const courses = [];
            let name = "";
            let group = "";
            let type = "";
            // Extract relevant data from each table
            elementHandlers.forEach((course) => {
                // Extract the name of the module
                name = course.querySelector(".PAGROUPDIVIDER").innerHTML.replace("&amp;", "&");
                //Extract the classes of the module
                Array.from(course.querySelectorAll('tr[valign="center"]'))
                    .slice(1) //Ignore header
                    .forEach((row) => {
                    const columns = row.querySelectorAll("td");
                    const groupElement = columns[1].querySelector("div span");
                    if (groupElement != null && groupElement.innerHTML != "&nbsp;")
                        group = groupElement.innerHTML;
                    const typeElement = columns[2].querySelector("div span");
                    if (typeElement != null && typeElement.innerHTML != "&nbsp;")
                        type = typeElement.innerHTML;
                    const timeElement = columns[3].querySelector("div span");
                    const timeRegexMatch = timeElement.innerHTML.match(".. ([0-9]+:[0-9]{2}[APMapm]+) - ([0-9]+:[0-9]{2}[APMapm]+)");
                    const startTimeString = timeRegexMatch[1];
                    const endTimeString = timeRegexMatch[2];
                    // Convert AM/PM format to 24-hour format
                    const startTime = convertTo24HourFormat(startTimeString);
                    const endTime = convertTo24HourFormat(endTimeString);
                    // console.log(startTime)
                    // console.log(endTime)
                    const dateElement = columns[6].querySelector("div span");
                    const dateRegexMatch = dateElement.innerHTML.match("([0-9]{2})/([0-9]{2})/([0-9]{4}) - ([0-9]{2})/([0-9]{2})/([0-9]{4})");
                    // console.log(dateRegexMatch)
                    const startYear = dateRegexMatch[3];
                    const startMonth = dateRegexMatch[2];
                    const startDay = dateRegexMatch[1];
                    const endYear = dateRegexMatch[6];
                    const endMonth = dateRegexMatch[5];
                    const endDay = dateRegexMatch[4];
                    const start = `${startYear}-${startMonth}-${startDay}T${startTime}`;
                    const end = `${endYear}-${endMonth}-${endDay}T${endTime}`;
                    const locationElement = columns[4].querySelector("div span");
                    const location = locationElement.innerHTML;
                    // console.log(location)
                    if (name == null || group == null || type == null || start == null || end == null || location == null) {
                        console.log("Warning: Null found in one of the course entries.");
                    }
                    else {
                        courses.push({
                            Name: name,
                            Group: group,
                            Type: type,
                            Start: start,
                            End: end,
                            Location: location,
                        });
                    }
                });
            });
            return courses;
        });
        console.log("Running... Scrapping Success");
        // console.log(scrapedCourses)
        if (scrapedCourses.length == 0) {
            console.log("Running... No Courses Scrapped!");
        }
        const events = scrapedCourses.map((scrapedCourse) => {
            const startDateTime = new Date(scrapedCourse.Start);
            const endDateTime = new Date(scrapedCourse.End);
            return {
                title: `${scrapedCourse.Name} - ${scrapedCourse.Group} - ${scrapedCourse.Type}`,
                start: [
                    startDateTime.getFullYear(),
                    startDateTime.getMonth() + 1,
                    startDateTime.getDate(),
                    startDateTime.getHours(),
                    startDateTime.getMinutes(),
                ],
                end: [endDateTime.getFullYear(), endDateTime.getMonth() + 1, endDateTime.getDate(), endDateTime.getHours(), endDateTime.getMinutes()],
                location: scrapedCourse.Location,
            };
        });
        const { error, value } = ics.createEvents(events);
        if (error)
            electron_1.dialog.showErrorBox("Timetable Grabber - SIT", "Something went wrong while generating the timetable!");
        else
            await electron_1.dialog
                .showSaveDialog(mainWindow, {
                title: "Save Timetable",
                nameFieldLabel: "timetable",
                filters: [
                    {
                        name: "Calendar File",
                        extensions: ["ics"],
                    },
                ],
                buttonLabel: "Save Timetable",
            })
                .then((result) => {
                if (result.canceled == false) {
                    try {
                        fs.writeFileSync(result.filePath, value);
                        electron_1.dialog.showMessageBox(mainWindow, { message: "Your timetable has been successfully grabbed!\nPlease consider donating!" });
                    }
                    catch (error) {
                        electron_1.dialog.showErrorBox("Timetable Grabber - SIT", "Something went wrong while saving your timetable!");
                    }
                }
                else
                    electron_1.dialog.showErrorBox("Timetable Grabber - SIT", "You cancelled the exporting of your timetable!");
            });
    }
    catch (error) {
        await page.screenshot({ fullPage: true, path: path.join(__dirname, "error.png") });
        electron_1.dialog.showErrorBox("Timetable Grabber - SIT", "Something went wrong while navigating IN4SIT! " + error.toString());
    }
    finally {
        await browser.close();
    }
}
electron_1.app.whenReady().then(() => {
    electron_1.ipcMain.handle("grab-timetable", (_event, email, password) => grabTimetable(email, password));
    createMainWindow();
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: "deny" };
    });
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createMainWindow();
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=main.js.map