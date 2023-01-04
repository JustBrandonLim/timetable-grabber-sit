document.getElementById("grab-timetable").addEventListener("click", () => {
  const email = <HTMLInputElement>document.getElementById("email");
  const password = <HTMLInputElement>document.getElementById("password");

  const electron = window["electron" as keyof Window];

  electron.grabTimetable(email.value, password.value);
});
