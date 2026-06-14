protectPage();
loadLayout();
setupLogout();

document.addEventListener("DOMContentLoaded", loadDashboardData);

async function loadDashboardData() {
    loadLocalStats();
    await loadUserStats();
}

function loadLocalStats() {
    const sports = getSports();
    const teams = getTeams();
    const trainings = getTrainings();

    document.getElementById("sportsCount").textContent = sports.length;
    document.getElementById("teamsCount").textContent = teams.length;
    document.getElementById("trainingsCount").textContent = trainings.length;
}

async function loadUserStats() {
    const usersCount = document.getElementById("usersCount");

    try {
        const response = await apiRequest("/users", {
            method: "GET",
            headers: authHeaders()
        });

        const users = extractUsers(response);
        usersCount.textContent = users.length;

    } catch (error) {
        usersCount.textContent = "0";
    }
}