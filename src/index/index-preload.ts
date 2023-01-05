import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  grabTimetable: (email: string, password: string) => ipcRenderer.invoke("grab-timetable", email, password),
});
