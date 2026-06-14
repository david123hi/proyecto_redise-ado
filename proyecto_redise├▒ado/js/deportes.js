protectAdminPage();
loadLayout();
setupLogout();

const sportsTableBody = document.getElementById("sportsTableBody");
const sportFormCard = document.getElementById("sportFormCard");
const sportForm = document.getElementById("sportForm");
const newSportBtn = document.getElementById("newSportBtn");
const cancelSportBtn = document.getElementById("cancelSportBtn");
const sportFormTitle = document.getElementById("sportFormTitle");

let sports = [];

document.addEventListener("DOMContentLoaded", loadSports);

newSportBtn.addEventListener("click", openCreateSportForm);
cancelSportBtn.addEventListener("click", closeSportForm);

sportForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("sportId").value;

    if (id) {
        updateSport(id);
    } else {
        createSport();
    }
});

function loadSports() {
    sports = getSports();
    renderSports();
}

function renderSports() {
    sportsTableBody.innerHTML = "";

    if (sports.length === 0) {
        sportsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">No hay deportes registrados</td>
            </tr>
        `;
        return;
    }

    sports.forEach(sport => {
        sportsTableBody.innerHTML += `
            <tr>
                <td>${sport.id}</td>
                <td>${sport.name}</td>
                <td>${sport.category}</td>
                <td>${sport.status === "active" ? '<span class="badge badge-success">activo</span>' : '<span class="badge badge-danger">inactivo</span>'}</td>
                <td>${formatDate(sport.created_at)}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-primary btn-sm" onclick="openEditSportForm('${sport.id}')">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteSport('${sport.id}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function openCreateSportForm() {
    clearMessage("sportsMessage");
    sportForm.reset();
    document.getElementById("sportId").value = "";
    sportFormTitle.textContent = "Nuevo Deporte";
    sportFormCard.classList.remove("hidden");
}

function openEditSportForm(id) {
    const sport = sports.find(item => item.id === id);

    if (!sport) return;

    document.getElementById("sportId").value = sport.id;
    document.getElementById("sportName").value = sport.name;
    document.getElementById("sportCategory").value = sport.category;
    document.getElementById("sportStatus").value = sport.status;

    sportFormTitle.textContent = "Editar Deporte";
    sportFormCard.classList.remove("hidden");
}

function closeSportForm() {
    sportForm.reset();
    sportFormCard.classList.add("hidden");
}

function createSport() {
    const name = document.getElementById("sportName").value.trim();
    const category = document.getElementById("sportCategory").value;
    const status = document.getElementById("sportStatus").value;

    if (!name) {
        showMessage("sportsMessage", "El nombre del deporte es obligatorio", "error");
        return;
    }

    const newSport = {
        id: generateId(),
        name,
        category,
        status,
        created_at: new Date().toISOString()
    };

    sports.push(newSport);
    saveSports(sports);

    showMessage("sportsMessage", "Deporte creado correctamente", "success");
    closeSportForm();
    renderSports();
}

function updateSport(id) {
    const name = document.getElementById("sportName").value.trim();
    const category = document.getElementById("sportCategory").value;
    const status = document.getElementById("sportStatus").value;

    if (!name) {
        showMessage("sportsMessage", "El nombre del deporte es obligatorio", "error");
        return;
    }

    sports = sports.map(sport => {
        if (sport.id === id) {
            return {
                ...sport,
                name,
                category,
                status
            };
        }

        return sport;
    });

    saveSports(sports);

    showMessage("sportsMessage", "Deporte actualizado correctamente", "success");
    closeSportForm();
    renderSports();
}

function deleteSport(id) {
    sports = sports.filter(sport => sport.id !== id);
    saveSports(sports);

    showMessage("sportsMessage", "Deporte eliminado correctamente", "success");
    renderSports();
}