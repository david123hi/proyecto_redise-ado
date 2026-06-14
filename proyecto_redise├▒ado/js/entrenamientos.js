protectAdminPage();
loadLayout();
setupLogout();

const trainingsTableBody = document.getElementById("trainingsTableBody");
const trainingFormCard = document.getElementById("trainingFormCard");
const trainingForm = document.getElementById("trainingForm");
const newTrainingBtn = document.getElementById("newTrainingBtn");
const cancelTrainingBtn = document.getElementById("cancelTrainingBtn");
const trainingFormTitle = document.getElementById("trainingFormTitle");
const trainingTeam = document.getElementById("trainingTeam");

let trainings = [];
let teams = [];

document.addEventListener("DOMContentLoaded", function () {
    loadTrainings();
    loadTeamOptions();
});

newTrainingBtn.addEventListener("click", openCreateTrainingForm);
cancelTrainingBtn.addEventListener("click", closeTrainingForm);

trainingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("trainingId").value;

    if (id) {
        updateTraining(id);
    } else {
        createTraining();
    }
});

function loadTrainings() {
    trainings = getTrainings();
    renderTrainings();
}

function loadTeamOptions() {
    teams = getTeams().filter(team => team.status === "active");
    trainingTeam.innerHTML = "";

    teams.forEach(team => {
        trainingTeam.innerHTML += `<option value="${team.id}">${team.name} - ${team.sport}</option>`;
    });
}

function renderTrainings() {
    trainingsTableBody.innerHTML = "";

    if (trainings.length === 0) {
        trainingsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">No hay entrenamientos registrados</td>
            </tr>
        `;
        return;
    }

    trainings.forEach(training => {
        trainingsTableBody.innerHTML += `
            <tr>
                <td>${training.id}</td>
                <td>${training.title}</td>
                <td>${training.team}</td>
                <td>${training.sport}</td>
                <td>${formatDate(training.date)}</td>
                <td>${training.hour}</td>
                <td>${getTrainingBadge(training.status)}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-primary btn-sm" onclick="openEditTrainingForm('${training.id}')">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteTraining('${training.id}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function getTrainingBadge(status) {
    if (status === "completed") {
        return `<span class="badge badge-success">realizado</span>`;
    }

    if (status === "cancelled") {
        return `<span class="badge badge-danger">cancelado</span>`;
    }

    return `<span class="badge badge-warning">programado</span>`;
}

function openCreateTrainingForm() {
    clearMessage("trainingsMessage");
    trainingForm.reset();
    document.getElementById("trainingId").value = "";
    trainingFormTitle.textContent = "Nuevo Entrenamiento";
    trainingFormCard.classList.remove("hidden");
}

function openEditTrainingForm(id) {
    const training = trainings.find(item => item.id === id);

    if (!training) return;

    const team = teams.find(item => item.name === training.team);

    document.getElementById("trainingId").value = training.id;
    document.getElementById("trainingTitle").value = training.title;
    document.getElementById("trainingTeam").value = team ? team.id : "";
    document.getElementById("trainingDate").value = training.date;
    document.getElementById("trainingHour").value = training.hour;
    document.getElementById("trainingDuration").value = training.duration;
    document.getElementById("trainingStatus").value = training.status;

    trainingFormTitle.textContent = "Editar Entrenamiento";
    trainingFormCard.classList.remove("hidden");
}

function closeTrainingForm() {
    trainingForm.reset();
    trainingFormCard.classList.add("hidden");
}

function createTraining() {
    const title = document.getElementById("trainingTitle").value.trim();
    const teamId = document.getElementById("trainingTeam").value;
    const date = document.getElementById("trainingDate").value;
    const hour = document.getElementById("trainingHour").value;
    const duration = document.getElementById("trainingDuration").value;
    const status = document.getElementById("trainingStatus").value;

    const team = teams.find(item => item.id === teamId);

    if (!title || !team || !date || !hour || !duration) {
        showMessage("trainingsMessage", "Todos los campos son obligatorios", "error");
        return;
    }

    const newTraining = {
        id: generateId(),
        title,
        team: team.name,
        sport: team.sport,
        date,
        hour,
        duration: Number(duration),
        status,
        created_at: new Date().toISOString()
    };

    trainings.push(newTraining);
    saveTrainings(trainings);

    showMessage("trainingsMessage", "Entrenamiento creado correctamente", "success");
    closeTrainingForm();
    renderTrainings();
}

function updateTraining(id) {
    const title = document.getElementById("trainingTitle").value.trim();
    const teamId = document.getElementById("trainingTeam").value;
    const date = document.getElementById("trainingDate").value;
    const hour = document.getElementById("trainingHour").value;
    const duration = document.getElementById("trainingDuration").value;
    const status = document.getElementById("trainingStatus").value;

    const team = teams.find(item => item.id === teamId);

    if (!title || !team || !date || !hour || !duration) {
        showMessage("trainingsMessage", "Todos los campos son obligatorios", "error");
        return;
    }

    trainings = trainings.map(training => {
        if (training.id === id) {
            return {
                ...training,
                title,
                team: team.name,
                sport: team.sport,
                date,
                hour,
                duration: Number(duration),
                status
            };
        }

        return training;
    });

    saveTrainings(trainings);

    showMessage("trainingsMessage", "Entrenamiento actualizado correctamente", "success");
    closeTrainingForm();
    renderTrainings();
}

function deleteTraining(id) {
    trainings = trainings.filter(training => training.id !== id);
    saveTrainings(trainings);

    showMessage("trainingsMessage", "Entrenamiento eliminado correctamente", "success");
    renderTrainings();
}