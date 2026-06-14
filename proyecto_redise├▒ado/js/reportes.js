protectAdminPage();
loadLayout();
setupLogout();

const reportMonth = document.getElementById("reportMonth");
const generateReportBtn = document.getElementById("generateReportBtn");

const reportUsers = document.getElementById("reportUsers");
const reportActiveUsers = document.getElementById("reportActiveUsers");
const reportTeams = document.getElementById("reportTeams");
const reportTrainings = document.getElementById("reportTrainings");

const reportTitle = document.getElementById("reportTitle");
const summaryList = document.getElementById("summaryList");
const rolesList = document.getElementById("rolesList");
const monthlyTrainingsTable = document.getElementById("monthlyTrainingsTable");

document.addEventListener("DOMContentLoaded", function () {
    reportMonth.value = getCurrentYearMonth();
    generateReport();
});

generateReportBtn.addEventListener("click", generateReport);

async function generateReport() {
    clearMessage("reportsMessage");

    const selectedMonth = reportMonth.value;

    if (!selectedMonth) {
        showMessage("reportsMessage", "Selecciona un mes para generar el reporte", "error");
        return;
    }

    try {
        const users = await getUsersFromAPI();
        const sports = getSports();
        const teams = getTeams();
        const trainings = getTrainings();

        const monthlyTrainings = trainings.filter(training => {
            return training.date && training.date.startsWith(selectedMonth);
        });

        const activeUsers = users.filter(user => isUserActive(user));
        const adminUsers = users.filter(user => getRole(user) === "admin");
        const coachUsers = users.filter(user => getRole(user) === "coach");
        const normalUsers = users.filter(user => getRole(user) === "user");

        reportUsers.textContent = users.length;
        reportActiveUsers.textContent = activeUsers.length;
        reportTeams.textContent = teams.length;
        reportTrainings.textContent = monthlyTrainings.length;

        const [year, month] = selectedMonth.split("-");
        reportTitle.textContent = `Reporte de ${getMonthName(month)} ${year}`;

        summaryList.innerHTML = `
            <li>Total de usuarios registrados: <strong>${users.length}</strong></li>
            <li>Cuentas activas: <strong>${activeUsers.length}</strong></li>
            <li>Cuentas desactivadas: <strong>${users.length - activeUsers.length}</strong></li>
            <li>Deportes registrados: <strong>${sports.length}</strong></li>
            <li>Equipos registrados: <strong>${teams.length}</strong></li>
            <li>Entrenamientos del mes: <strong>${monthlyTrainings.length}</strong></li>
        `;

        rolesList.innerHTML = `
            <li>Administradores: <strong>${adminUsers.length}</strong></li>
            <li>Entrenadores: <strong>${coachUsers.length}</strong></li>
            <li>Usuarios normales: <strong>${normalUsers.length}</strong></li>
        `;

        renderMonthlyTrainings(monthlyTrainings);

        showMessage("reportsMessage", "Reporte generado correctamente", "success");

    } catch (error) {
        showMessage("reportsMessage", error.message, "error");
    }
}

async function getUsersFromAPI() {
    try {
        const response = await apiRequest("/users", {
            method: "GET",
            headers: authHeaders()
        });

        return extractUsers(response);

    } catch (error) {
        return [];
    }
}

function renderMonthlyTrainings(trainings) {
    monthlyTrainingsTable.innerHTML = "";

    if (trainings.length === 0) {
        monthlyTrainingsTable.innerHTML = `
            <tr>
                <td colspan="4">No hay entrenamientos registrados en este mes</td>
            </tr>
        `;
        return;
    }

    trainings.forEach(training => {
        monthlyTrainingsTable.innerHTML += `
            <tr>
                <td>${training.title}</td>
                <td>${training.team}</td>
                <td>${formatDate(training.date)}</td>
                <td>${getTrainingBadge(training.status)}</td>
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