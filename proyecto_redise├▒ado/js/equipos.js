protectAdminPage();
loadLayout();
setupLogout();

const teamsTableBody = document.getElementById("teamsTableBody");
const teamFormCard = document.getElementById("teamFormCard");
const teamForm = document.getElementById("teamForm");
const newTeamBtn = document.getElementById("newTeamBtn");
const cancelTeamBtn = document.getElementById("cancelTeamBtn");
const teamFormTitle = document.getElementById("teamFormTitle");
const teamSport = document.getElementById("teamSport");

let teams = [];
let sports = [];

document.addEventListener("DOMContentLoaded", function () {
    loadTeams();
    loadSportsOptions();
});

newTeamBtn.addEventListener("click", openCreateTeamForm);
cancelTeamBtn.addEventListener("click", closeTeamForm);

teamForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("teamId").value;

    if (id) {
        updateTeam(id);
    } else {
        createTeam();
    }
});

function loadTeams() {
    teams = getTeams();
    renderTeams();
}

function loadSportsOptions() {
    sports = getSports().filter(sport => sport.status === "active");
    teamSport.innerHTML = "";

    sports.forEach(sport => {
        teamSport.innerHTML += `<option value="${sport.name}">${sport.name}</option>`;
    });
}

function renderTeams() {
    teamsTableBody.innerHTML = "";

    if (teams.length === 0) {
        teamsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">No hay equipos registrados</td>
            </tr>
        `;
        return;
    }

    teams.forEach(team => {
        teamsTableBody.innerHTML += `
            <tr>
                <td>${team.id}</td>
                <td>${team.name}</td>
                <td>${team.sport}</td>
                <td>${team.coach}</td>
                <td>${team.members}</td>
                <td>${team.status === "active" ? '<span class="badge badge-success">activo</span>' : '<span class="badge badge-danger">inactivo</span>'}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-primary btn-sm" onclick="openEditTeamForm('${team.id}')">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteTeam('${team.id}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function openCreateTeamForm() {
    clearMessage("teamsMessage");
    teamForm.reset();
    document.getElementById("teamId").value = "";
    teamFormTitle.textContent = "Nuevo Equipo";
    teamFormCard.classList.remove("hidden");
}

function openEditTeamForm(id) {
    const team = teams.find(item => item.id === id);

    if (!team) return;

    document.getElementById("teamId").value = team.id;
    document.getElementById("teamName").value = team.name;
    document.getElementById("teamSport").value = team.sport;
    document.getElementById("teamCoach").value = team.coach;
    document.getElementById("teamMembers").value = team.members;
    document.getElementById("teamStatus").value = team.status;

    teamFormTitle.textContent = "Editar Equipo";
    teamFormCard.classList.remove("hidden");
}

function closeTeamForm() {
    teamForm.reset();
    teamFormCard.classList.add("hidden");
}

function createTeam() {
    const name = document.getElementById("teamName").value.trim();
    const sport = document.getElementById("teamSport").value;
    const coach = document.getElementById("teamCoach").value.trim();
    const members = document.getElementById("teamMembers").value;
    const status = document.getElementById("teamStatus").value;

    if (!name || !sport || !coach || !members) {
        showMessage("teamsMessage", "Todos los campos son obligatorios", "error");
        return;
    }

    const newTeam = {
        id: generateId(),
        name,
        sport,
        coach,
        members: Number(members),
        status,
        created_at: new Date().toISOString()
    };

    teams.push(newTeam);
    saveTeams(teams);

    showMessage("teamsMessage", "Equipo creado correctamente", "success");
    closeTeamForm();
    renderTeams();
}

function updateTeam(id) {
    const name = document.getElementById("teamName").value.trim();
    const sport = document.getElementById("teamSport").value;
    const coach = document.getElementById("teamCoach").value.trim();
    const members = document.getElementById("teamMembers").value;
    const status = document.getElementById("teamStatus").value;

    if (!name || !sport || !coach || !members) {
        showMessage("teamsMessage", "Todos los campos son obligatorios", "error");
        return;
    }

    teams = teams.map(team => {
        if (team.id === id) {
            return {
                ...team,
                name,
                sport,
                coach,
                members: Number(members),
                status
            };
        }

        return team;
    });

    saveTeams(teams);

    showMessage("teamsMessage", "Equipo actualizado correctamente", "success");
    closeTeamForm();
    renderTeams();
}

function deleteTeam(id) {
    teams = teams.filter(team => team.id !== id);
    saveTeams(teams);

    showMessage("teamsMessage", "Equipo eliminado correctamente", "success");
    renderTeams();
}