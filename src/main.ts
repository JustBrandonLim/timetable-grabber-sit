import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import puppeteer, { ElementHandle } from "puppeteer";
import * as ics from "ics";

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
      preload: path.join(__dirname, "../dist/index/index-preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../src/index/index.html"));
}

async function grabTimetable(email: string, password: string) {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--start-maximized"],
    defaultViewport: null,
  });

  const pages = await browser.pages();
  const page = pages[0];

  try {
    /*await page.goto("https://in4sit.singaporetech.edu.sg", { waitUntil: "networkidle0" });

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

    const courses = await mainContentFrame.evaluate((courseSelector) => {
      [...document.querySelectorAll(courseSelector)].slice(1).map((course) => {
        const moduleName = course.querySelector('.PAGROUPDIVIDER[align="left"]').innerHTML;

        const detailsRows = course.querySelectorAll('tr[valign="center"');

        let currentSection: string, currentComponent: string;

        const rowData = [...detailsRows].map((detailRow, index) => {
          const detailsColumns = detailRow.querySelectorAll("td");

          const section = detailsColumns[1].querySelector("div span");
          if (section != null) currentSection = section.innerHTML;

          const component = detailsColumns[2].querySelector("div span");
          if (component.innerHTML.length > 1) currentComponent = component.innerHTML;

          const location = detailsColumns[4].querySelector("div span").innerHTML;

          const startDate = new Date(detailsColumns[6].querySelector("div span").innerHTML.split(" - ")[0]);

          return { section: currentSection, component: currentComponent, location: location, startDate: startDate, duration: "" };
        });

        return rowData.map((data) => {
          return {
            title: `${moduleName} - ${data.section} - ${data.component}`,
            location: data.location,
            startDate: data.startDate,
            duration: data.duration,
          };
        });
      });
    }, ".PABACKGROUNDINVISIBLEWBO");*/

    await page.goto("file:///C:/Users/Brandon%20Lim/Desktop/printer%20friendly.html");

    const courses = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".PABACKGROUNDINVISIBLEWBO"))
        .slice(1)
        .map((course) => {
          const moduleCode = course.querySelector(".PAGROUPDIVIDER").innerHTML;

          //return Array.from(course.querySelectorAll('tr[valign="center"')).map((row) => {
          return { title: moduleCode };
          //});
        });
    });

    console.log(courses);

    //ics.createEvents();

    /*
      start: [2018, 5, 30, 6, 30],
      duration: { hours: 6, minutes: 30 },
      title: 'Bolder Boulder',
      description: 'Annual 10-kilometer run in Boulder, Colorado',
      location: 'Folsom Field, University of Colorado (finish line)',
     */

    /*await new Promise(function (r) {
      setTimeout(r, 5000);
    });*/
  } catch (error) {
    console.log(error);
    await page.screenshot({ fullPage: true, path: path.join(__dirname, "error.png") });
  } finally {
    await browser.close();
  }

  /*const saveFileDialog = await dialog.showSaveDialog(mainWindow, {
    title: "Timetable Grabber - SIT",
    defaultPath: path.join(__dirname, "timetable.ics"),
  });*/
}

app.whenReady().then(() => {
  ipcMain.on("grab-timetable", async (_event, email: string, password: string) => {
    await grabTimetable(email, password);
  });

  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
