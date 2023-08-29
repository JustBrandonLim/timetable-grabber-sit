import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import * as path from "path";
import puppeteer, { BrowserFetcher, ElementHandle } from "puppeteer-core";
import * as ics from "ics";
import * as fs from "fs";
import WebSocket from 'ws';

// Setup websocket for feedback on frontend.
// const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws: WebSocket) => {
  // Send data to the connected client
  ws.send('Connected to WebSocket');
  
  // Replace this with your actual logging mechanism
  console.log = (...args) => {
    ws.send(JSON.stringify({ type: 'log', message: args.join(' ') }));
  };
});


let mainWindow: BrowserWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
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

async function grabTimetable(email: string, password: string) {
  const browserFetcher = new BrowserFetcher({ path: path.join(__dirname, "../puppeteer") });
  const revisionInfo = await browserFetcher.download("1069273");

  const browser = await puppeteer.launch({
    executablePath: revisionInfo.executablePath,
    headless: true,
    args: ["--start-maximized", "--window-size=1920,1080"],
    defaultViewport: null,
  });

  const pages = await browser.pages();
  const page = pages[0];

  try {
    await page.goto("https://in4sit.singaporetech.edu.sg", { waitUntil: "networkidle0", timeout: 30000 });
    console.log("Running... Page Loaded")

    const emailInput = await page.waitForSelector("#userNameInput", { visible: true });
    await emailInput.type(email);
    console.log("Running... Email Inputed")

    const passwordInput = await page.waitForSelector("#passwordInput", { visible: true });
    await passwordInput.type(password);
    console.log("Running... Password Inputed")

    const loginButton = await page.waitForSelector("#submitButton", { visible: true });
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), loginButton.click()]);
    console.log("Running... Logged In")

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
    await page.goto("https://in4sit.singaporetech.edu.sg/psc/CSSISSTD/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.SSR_SSENRL_SCHD_W.GBL?NavColl=true&ICAGTarget=start&ICAJAXTrf=true")
    await page.waitForSelector("xpath/" + '//div[@id="WAIT_win0" and not(@class)]', { hidden: true });
    console.log("Running... Naviagated to source of URL")

    // Swap to list 
    const listViewRadioButton = (await page.waitForSelector("xpath/" + '//label[text()="List View"]', {
      visible: true,
    })) as ElementHandle<HTMLElement>;
    console.log("Running... Found List View Radio")
    await listViewRadioButton.click();
    await page.waitForSelector("xpath/" + '//div[@id="WAIT_win0" and not(@class)]', { hidden: true });
    console.log("Running... Clicked List View")

    // Ensure all Filters are correct (remove dropped and waitlist)
    const showDroppedClassesCheckBox = (await page.waitForSelector("xpath/" + '//label[text()="Show Dropped Classes"]', {
      visible: true,
    })) as ElementHandle<HTMLElement>;
    await showDroppedClassesCheckBox.click();
    console.log("Running... Unchecked Dropped Classes checkbox")
    const showWaitlistedClassesCheckBox = (await page.waitForSelector("xpath/" + '//label[text()="Show Waitlisted Classes"]', {
      visible: true,
    })) as ElementHandle<HTMLElement>;
    await showWaitlistedClassesCheckBox.click();
    console.log("Running... Unchecked Waitlisted Classes checkbox")
    const filterButton = (await page.waitForSelector("xpath/" + '//input[@value="Filter"]', {
      visible: true,
    })) as ElementHandle<HTMLElement>;
    await filterButton.click();
    await page.waitForSelector("xpath/" + '//div[@id="WAIT_win0" and not(@class)]', { hidden: true });
    console.log("Running... Triggered Filter")

    // Go to Printer Friendly Page
    const printerFriendlyPageLink = (await page.waitForSelector("xpath/" + '//a[text()="Printer Friendly Page"]', {
      visible: true,
    })) as ElementHandle<HTMLElement>;
    await printerFriendlyPageLink.click();
    await page.waitForSelector("xpath/" + '//div[@id="WAIT_win0" and not(@class)]', { hidden: true });
    console.log("Running... Navigated to Printer Friendly Page")

    // Debugger setting to see console log items
    page.on('console', async (message) => {
      if (message.type() === 'log') {
        const args = await Promise.all(message.args().map(arg => arg.jsonValue()));
        console.log('Browser Console:', ...args);
      }
    });
    
    //Extract the courses
    // Note: Evaluate cannot return complex objects. Testing extraction of courses
    console.log("Running... Printer Page Scrap / eval starts")
    const scrapedCourses: Course[] = await page.evaluate(() => {
      // Helper function to convert time format
      function convertTo24HourFormat(timeString: string): string {
        const [time, ampm] = timeString.split(/(?<=[0-9])(?=[APMapm]+)/i);
        const [hours, minutes] = time.split(':');
        let hours24 = parseInt(hours);

        if (ampm.toLowerCase() === 'pm' && hours24 !== 12) {
          hours24 += 12;
        } else if (ampm.toLowerCase() === 'am' && hours24 === 12) {
          hours24 = 0;
        }

        return `${hours24.toString().padStart(2, '0')}:${minutes}`;
      }

      // Select all the table of classes
      const elementHandlers = Array.from(document.querySelectorAll(".PABACKGROUNDINVISIBLEWBO")).slice(1)

      // Declare var to be used 
      const courses: Course[] = [];

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
              if (groupElement != null && groupElement.innerHTML != "&nbsp;") group = groupElement.innerHTML;

              const typeElement = columns[2].querySelector("div span");
              if (typeElement != null && typeElement.innerHTML != "&nbsp;") type = typeElement.innerHTML;

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

              if (name == null || group == null || type == null || start == null || end == null || location == null){
                console.log("Warning: Null found in one of the course entries.")
              }
              else{
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
      })
      return courses
    });
    console.log("Running... Scrapping Success")
    // console.log(scrapedCourses)
    
    if (scrapedCourses.length == 0){
      console.log("Running... No Courses Scrapped!")
    }
    
    const events: ics.EventAttributes[] = scrapedCourses.map((scrapedCourse) => {
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

    if (error) dialog.showErrorBox("Timetable Grabber - SIT", "Something went wrong while generating the timetable!");
    else
      await dialog
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
              dialog.showMessageBox(mainWindow, { message: "Your timetable has been successfully grabbed!\nPlease consider donating!" });
            } catch (error) {
              dialog.showErrorBox("Timetable Grabber - SIT", "Something went wrong while saving your timetable!");
            }
          } else dialog.showErrorBox("Timetable Grabber - SIT", "You cancelled the exporting of your timetable!");
        });
  } catch (error) {
    await page.screenshot({ fullPage: true, path: path.join(__dirname, "error.png") });
    dialog.showErrorBox("Timetable Grabber - SIT", "Something went wrong while navigating IN4SIT! " + error.toString());
  } finally {
    await browser.close();
  }
}

app.whenReady().then(() => {
  ipcMain.handle("grab-timetable", (_event, email: string, password: string) => grabTimetable(email, password));

  createMainWindow();

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
