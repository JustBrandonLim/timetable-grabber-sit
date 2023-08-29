document.getElementById("grab-timetable").addEventListener("click", async (event) => {
    const grabTimetable = event.target;
    const message = document.getElementById("message");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const electronAPI = window["electronAPI"];
    // For feedback from backend
    const logsElement = document.getElementById('logs');
    const socket = new WebSocket('ws://localhost:8080');
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'log') {
            const logMessage = data.message;
            message.innerHTML = logMessage;
            // const logElement = document.createElement('p');
            // logElement.textContent = logMessage;
            // logsElement.appendChild(logElement);
        }
    };
    grabTimetable.disabled = true;
    email.disabled = true;
    password.disabled = true;
    message.innerHTML = "Running...";
    if (email.value && password.value)
        await electronAPI.grabTimetable(email.value, password.value);
    grabTimetable.disabled = false;
    email.disabled = false;
    password.disabled = false;
    message.innerHTML = "Waiting...";
});
//# sourceMappingURL=index.js.map