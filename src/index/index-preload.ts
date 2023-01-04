import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  grabTimetable: (email: string, password: string) => {
    ipcRenderer.send("grab-timetable", email, password);
  },
});
