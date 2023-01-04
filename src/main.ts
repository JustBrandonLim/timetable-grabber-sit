import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import * as path from "path";
import puppeteer, { BrowserFetcher, ElementHandle } from "puppeteer-core";
import * as ics from "ics";
import * as fs from "fs";

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
    await page.goto("https://in4sit.singaporetech.edu.sg", { waitUntil: "networkidle0" });

    const emailInput = await page.waitForSelector("#userNameInput", { visible: true });
    await emailInput.type(email);

    const passwordInput = await page.waitForSelector("#passwordInput", { visible: true });
    await passwordInput.type(password);

    const loginButton = await page.waitForSelector("#submitButton", { visible: true });
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), loginButton.click()]);

    const courseManagementLink = (await page.waitForXPath('//span[text()="Course Management"]', {
      visible: true,
    })) as ElementHandle<HTMLElement>;
    await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), courseManagementLink.click()]);

    const myWeeklyScheduleLink = (await page.waitForXPath('//span[text()="My Weekly Schedule"]', {
      visible: true,
    })) as ElementHandle<HTMLElement>;
    await myWeeklyScheduleLink.click();

    const mainContentFrame = await page.waitForFrame(
      "https://in4sit.singaporetech.edu.sg/psc/CSSISSTD/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.SSR_SSENRL_SCHD_W.GBL?&ICAGTarget=start&ICAJAXTrf=true"
    );

    await new Promise(function (resolve) {
      setTimeout(resolve, 3000);
    });

    const listViewRadioButton = (await mainContentFrame.waitForSelector("xpath/" + '//label[text()="List View"]', {
      visible: true,
    })) as ElementHandle<HTMLElement>;
    await listViewRadioButton.click();

    await mainContentFrame.waitForSelector("xpath/" + '//div[@id="WAIT_win0" and not(@class)]', { hidden: true });

    const showDroppedClassesCheckBox = (await mainContentFrame.waitForSelector("xpath/" + '//label[text()="Show Dropped Classes"]', {
      visible: true,
    })) as ElementHandle<HTMLElement>;
    await showDroppedClassesCheckBox.click();

    const showWaitlistedClassesCheckBox = (await mainContentFrame.waitForSelector("xpath/" + '//label[text()="Show Waitlisted Classes"]', {
      visible: true,
    })) as ElementHandle<HTMLElement>;
    await showWaitlistedClassesCheckBox.click();

    const filterButton = (await mainContentFrame.waitForSelector("xpath/" + '//input[@value="Filter"]', {
      visible: true,
    })) as ElementHandle<HTMLElement>;
    await filterButton.click();

    await mainContentFrame.waitForSelector("xpath/" + '//div[@id="WAIT_win0" and not(@class)]', { hidden: true });

    const printerFriendlyPageLink = (await mainContentFrame.waitForSelector("xpath/" + '//a[text()="Printer Friendly Page"]', {
      visible: true,
    })) as ElementHandle<HTMLElement>;
    await printerFriendlyPageLink.click();

    await mainContentFrame.waitForSelector("xpath/" + '//div[@id="WAIT_win0" and not(@class)]', { hidden: true });

    const scrapedCourses: Course[] = await mainContentFrame.evaluate(() => {
      const courses: Course[] = [];

      let name = "";
      let group = "";
      let type = "";

      Array.from(document.querySelectorAll(".PABACKGROUNDINVISIBLEWBO"))
        .slice(1)
        .forEach((course) => {
          name = course.querySelector(".PAGROUPDIVIDER").innerHTML.replace("&amp;", "&");

          Array.from(course.querySelectorAll('tr[valign="center"]'))
            .slice(1)
            .forEach((row) => {
              const columns = row.querySelectorAll("td");

              const groupElement = columns[1].querySelector("div span");
              if (groupElement != null && groupElement.innerHTML != "&nbsp;") group = groupElement.innerHTML;

              const typeElement = columns[2].querySelector("div span");
              if (typeElement != null && typeElement.innerHTML != "&nbsp;") type = typeElement.innerHTML;

              const timeElement = columns[3].querySelector("div span");
              const timeRegexMatch = timeElement.innerHTML.match(".. ([0-9]+):([0-9]{2}) - ([0-9]+):([0-9]{2})");

              const startHour = timeRegexMatch[1];
              const startMinute = timeRegexMatch[2];

              const startTime = `${startHour}:${startMinute}:00`;

              const endHour = timeRegexMatch[3];
              const endMinute = timeRegexMatch[4];

              const endTime = `${endHour}:${endMinute}:00`;

              /*const timeRegexMatch = timeElement.innerHTML.match(".. ([0-9]+):([0-9]{2})([A-Z]*) - ([0-9]+):([0-9]{2})([A-Z]*)");

              let startHour = timeRegexMatch[1];
              const startHourNumber = parseInt(startHour, 10);
              const startHourIdentifier = timeRegexMatch[3];

              if (startHourIdentifier == "PM") {
                if (startHourNumber == 12) startHour = "12";
                else startHour = (startHourNumber + 12).toString();
              } else {
                if (startHourNumber == 12) startHour = "00";
                else if (startHourNumber < 10) startHour = "0" + startHour;
              }

              const startMinute = timeRegexMatch[2];
              const startTime = `${startHour}:${startMinute}:00`;

              let endHour = timeRegexMatch[4];
              const endHourNumber = parseInt(endHour, 10);
              const endHourIdentifier = timeRegexMatch[6];

              if (endHourIdentifier == "PM") {
                if (endHourNumber == 12) endHour = "12";
                else endHour = (endHourNumber + 12).toString();
              } else {
                if (endHourNumber == 12) endHour = "00";
                else if (endHourNumber < 10) endHour = "0" + endHour;
              }

              const endMinute = timeRegexMatch[5];
              const endTime = `${endHour}:${endMinute}:00`;*/

              const dateElement = columns[6].querySelector("div span");
              const dateRegexMatch = dateElement.innerHTML.match("([0-9]{2})/([0-9]{2})/([0-9]{4}) - ([0-9]{2})/([0-9]{2})/([0-9]{4})");

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

              courses.push({
                Name: name,
                Group: group,
                Type: type,
                Start: start,
                End: end,
                Location: location,
              });
            });
        });

      return courses;
    });

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
    dialog.showErrorBox("Timetable Grabber - SIT", "Something went wrong while navigating IN4SIT!");
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
