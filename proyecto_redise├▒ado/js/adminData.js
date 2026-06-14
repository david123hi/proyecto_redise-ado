function getLocalData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveLocalData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
    return Date.now().toString();
}

/* ============================= */
/* DEPORTES */
/* ============================= */

function getSports() {
    let sports = getLocalData("sportclub_sports");

    if (sports.length === 0) {
        sports = [
            {
                id: "1",
                name: "Fútbol",
                category: "Colectivo",
                status: "active",
                created_at: new Date().toISOString()
            },
            {
                id: "2",
                name: "Básquetbol",
                category: "Colectivo",
                status: "active",
                created_at: new Date().toISOString()
            },
            {
                id: "3",
                name: "Natación",
                category: "Individual",
                status: "active",
                created_at: new Date().toISOString()
            }
        ];

        saveLocalData("sportclub_sports", sports);
    }

    return sports;
}

function saveSports(sports) {
    saveLocalData("sportclub_sports", sports);
}

/* ============================= */
/* EQUIPOS */
/* ============================= */

function getTeams() {
    let teams = getLocalData("sportclub_teams");

    if (teams.length === 0) {
        teams = [
            {
                id: "1",
                name: "Equipo Azul",
                sport: "Fútbol",
                coach: "Juan Pérez",
                members: 12,
                status: "active",
                created_at: new Date().toISOString()
            },
            {
                id: "2",
                name: "Equipo Rojo",
                sport: "Básquetbol",
                coach: "María Gómez",
                members: 8,
                status: "active",
                created_at: new Date().toISOString()
            }
        ];

        saveLocalData("sportclub_teams", teams);
    }

    return teams;
}

function saveTeams(teams) {
    saveLocalData("sportclub_teams", teams);
}

/* ============================= */
/* ENTRENAMIENTOS */
/* ============================= */

function getTrainings() {
    let trainings = getLocalData("sportclub_trainings");

    if (trainings.length === 0) {
        trainings = [
            {
                id: "1",
                title: "Entrenamiento físico",
                team: "Equipo Azul",
                sport: "Fútbol",
                date: new Date().toISOString().split("T")[0],
                hour: "10:00",
                duration: 90,
                status: "scheduled",
                created_at: new Date().toISOString()
            },
            {
                id: "2",
                title: "Técnica y táctica",
                team: "Equipo Rojo",
                sport: "Básquetbol",
                date: new Date().toISOString().split("T")[0],
                hour: "15:00",
                duration: 60,
                status: "scheduled",
                created_at: new Date().toISOString()
            }
        ];

        saveLocalData("sportclub_trainings", trainings);
    }

    return trainings;
}

function saveTrainings(trainings) {
    saveLocalData("sportclub_trainings", trainings);
}

function getMonthName(monthValue) {
    const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    ];

    const monthIndex = Number(monthValue) - 1;
    return months[monthIndex] || "Mes";
}

function getCurrentYearMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
}