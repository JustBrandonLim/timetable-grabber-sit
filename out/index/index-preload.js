"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    grabTimetable: (email, password) => electron_1.ipcRenderer.invoke("grab-timetable", email, password),
});
//# sourceMappingURL=index-preload.js.map