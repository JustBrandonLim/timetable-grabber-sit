document.getElementById("grab-timetable").addEventListener("click", async (event) => {
  const grabTimetable = <HTMLButtonElement>event.target;
  const message = <HTMLParagraphElement>document.getElementById("message");
  const email = <HTMLInputElement>document.getElementById("email");
  const password = <HTMLInputElement>document.getElementById("password");
  const electronAPI = window["electronAPI" as keyof Window];

  // For feedback from backend
  const logsElement = document.getElementById('logs');
  const socket = new WebSocket('ws://localhost:8080');
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'log') {
      const logMessage = data.message;
      message.innerHTML = logMessage
      // const logElement = document.createElement('p');
      // logElement.textContent = logMessage;
      // logsElement.appendChild(logElement);
    }
  };
  
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
