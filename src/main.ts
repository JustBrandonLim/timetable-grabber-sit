import { app, BrowserWindow, ipcMain, IpcMainEvent } from "electron";
import * as path from "path";

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 450,
    height: 450,
    //resizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, "../dist/index/index-preload.js"),
      //devTools: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../src/index/index.html"));
}

function grabTimetable(email: string, password: string) {
  const scraperWindow: BrowserWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    center: true,
    show: true,
  });

  scraperWindow.loadURL("https://in4sit.singaporetech.edu.sg");

  scraperWindow.webContents.once("dom-ready", function () {
    scraperWindow.webContents.executeJavaScript(`document.getElementById("userNameInput").value = "${email}"`).then(function () {
      scraperWindow.webContents.executeJavaScript(`document.getElementById("passwordInput").value = "${password}"`).then(function () {
        scraperWindow.webContents.executeJavaScript(`document.getElementById("submitButton").click()`).then(function () {
          scraperWindow.webContents.on("dom-ready", function () {
            scraperWindow.webContents.executeJavaScript(`document.getElementById("win0divPTNUI_LAND_REC_GROUPLET$1").click()`).then(function () {
              scraperWindow.webContents.executeJavaScript(`document.getElementById("PTGP_STEP_DVW_PTGP_STEP_LABEL$1").click()`).then(function () {
                const contentFrame = scraperWindow.webContents.mainFrame.frames[0];
                contentFrame.once("dom-ready", function () {
                  contentFrame.executeJavaScript(`document.getElementById("DERIVED_REGFRM1_SSR_SCHED_FORMAT$258$").click()`).then(function () {
                    console.log("DONE!");
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

app.whenReady().then(function () {
  ipcMain.on("grab-timetable", function (_event, email: string, password: string) {
    grabTimetable(email, password);
  });

  createMainWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
