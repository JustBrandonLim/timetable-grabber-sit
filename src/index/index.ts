document.getElementById("grab-timetable").addEventListener("click", async (event) => {
  const grabTimetable = <HTMLButtonElement>event.target;
  const message = <HTMLParagraphElement>document.getElementById("message");
  const email = <HTMLInputElement>document.getElementById("email");
  const password = <HTMLInputElement>document.getElementById("password");
  const electronAPI = window["electronAPI" as keyof Window];

  grabTimetable.disabled = true;
  email.disabled = true;
  password.disabled = true;

  message.innerHTML = "Running...";

  if (email.value && password.value) await electronAPI.grabTimetable(email.value, password.value);

  grabTimetable.disabled = false;
  email.disabled = false;
  password.disabled = false;

  message.innerHTML = "Waiting...";
});
