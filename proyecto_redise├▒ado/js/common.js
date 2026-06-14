const API_URL = "http://localhost:3000/api";

/* ============================= */
/* SESIÓN Y TOKEN */
/* ============================= */

function getToken() {
    return localStorage.getItem("token");
}

function getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

function saveSession(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

function logout() {
    clearSession();
    window.location.href = "./login.html";
}

/* ============================= */
/* PROTECCIÓN DE PÁGINAS */
/* ============================= */

function protectPage() {
    if (!getToken()) {
        window.location.href = "./login.html";
    }
}

function protectAdminPage() {
    protectPage();

    const user = getUser();

    if (!user || getRole(user) !== "admin") {
        window.location.href = "./perfil.html";
    }
}

/* ============================= */
/* HEADERS PARA API */
/* ============================= */

function normalHeaders() {
    return {
        "Content-Type": "application/json"
    };
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}

/* ============================= */
/* PETICIONES A LA API */
/* ============================= */

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, options);

    let data = {};

    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        if (data.errors) {
            const firstError = Object.values(data.errors)[0];
            throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
        }

        throw new Error(data.message || data.error || "Error en la solicitud");
    }

    return data;
}

/* ============================= */
/* EXTRAER DATOS DEL BACKEND */
/* ============================= */

function unwrapData(response) {
    if (response && response.data !== undefined) {
        return response.data;
    }

    return response;
}

function extractToken(response) {
    const data = unwrapData(response);

    return response.token ||
        response.accessToken ||
        data.token ||
        data.accessToken ||
        null;
}

function extractUser(response) {
    const data = unwrapData(response);

    return response.user ||
        response.usuario ||
        data.user ||
        data.usuario ||
        data;
}

function extractUsers(response) {
    const data = unwrapData(response);

    if (Array.isArray(response)) return response;
    if (Array.isArray(data)) return data;
    if (Array.isArray(response.users)) return response.users;
    if (Array.isArray(data.users)) return data.users;
    if (Array.isArray(response.usuarios)) return response.usuarios;
    if (Array.isArray(data.usuarios)) return data.usuarios;

    return [];
}

/* ============================= */
/* MENSAJES Y VALIDACIONES */
/* ============================= */

function showMessage(id, text, type) {
    const box = document.getElementById(id);

    if (!box) return;

    box.className = `message ${type}`;
    box.textContent = text;
}

function clearMessage(id) {
    const box = document.getElementById(id);

    if (!box) return;

    box.className = "message";
    box.textContent = "";
}

function setError(inputId, text) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(`${inputId}Error`);

    if (input) {
        input.classList.add("is-invalid");
    }

    if (error) {
        error.textContent = text;
    }
}

function clearError(inputId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(`${inputId}Error`);

    if (input) {
        input.classList.remove("is-invalid");
    }

    if (error) {
        error.textContent = "";
    }
}

function clearErrors(ids) {
    ids.forEach(id => clearError(id));
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================= */
/* FORMATO */
/* ============================= */

function capitalizeName(name) {
    if (!name) return "Sin nombre";

    return name
        .trim()
        .toLowerCase()
        .split(" ")
        .filter(word => word !== "")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function formatDate(value) {
    if (!value) return "Sin fecha";

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function formatDateInput(value) {
    if (!value) return "";

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return "";
    }

    return date.toISOString().split("T")[0];
}

/* ============================= */
/* NORMALIZAR ROL */
/* ============================= */

function normalizeRole(role) {
    if (!role) return "user";

    const cleanRole = String(role).trim().toLowerCase();

    if (cleanRole === "admin" || cleanRole === "administrador") {
        return "admin";
    }

    if (cleanRole === "coach" || cleanRole === "entrenador") {
        return "coach";
    }

    return "user";
}

/* ============================= */
/* GETTERS DE USUARIO */
/* ============================= */

function getId(user) {
    return user.id || user._id;
}

function getName(user) {
    return user.full_name ||
        user.fullName ||
        user.name ||
        user.nombre ||
        "Sin nombre";
}

function getEmail(user) {
    return (user.email || user.correo || "").toLowerCase();
}

function getRole(user) {
    const role = user.role || user.rol || "user";
    return normalizeRole(role);
}

function getBirthDate(user) {
    return user.birth_date ||
        user.birthDate ||
        user.fecha_nacimiento ||
        user.fechaNacimiento ||
        "";
}

function getCreatedAt(user) {
    return user.created_at ||
        user.createdAt ||
        user.fecha_registro ||
        user.fechaRegistro ||
        "";
}

/* ============================= */
/* METADATA Y ESTADO DE CUENTA */
/* ============================= */

function getMetadataObject(user) {
    if (!user || !user.metadata) {
        return {
            sports: [],
            is_active: true,
            note: "",
            favorite_sport: ""
        };
    }

    if (typeof user.metadata === "string") {
        try {
            const parsed = JSON.parse(user.metadata);

            return {
                ...parsed,
                sports: Array.isArray(parsed.sports) ? parsed.sports : []
            };

        } catch (error) {
            return {
                sports: [],
                is_active: true,
                note: user.metadata,
                favorite_sport: ""
            };
        }
    }

    if (typeof user.metadata === "object" && !Array.isArray(user.metadata)) {
        return {
            ...user.metadata,
            sports: Array.isArray(user.metadata.sports) ? user.metadata.sports : []
        };
    }

    return {
        sports: [],
        is_active: true,
        note: "",
        favorite_sport: ""
    };
}

function isUserActive(user) {
    const metadata = getMetadataObject(user);

    return metadata.is_active !== false;
}

function getStatus(user) {
    return isUserActive(user) ? "active" : "inactive";
}

function getMetadataText(user) {
    const metadata = getMetadataObject(user);

    return metadata.note ||
        metadata.description ||
        metadata.descripcion ||
        "";
}

function getFavoriteSport(user) {
    const metadata = getMetadataObject(user);

    return user.favorite_sport ||
        user.favoriteSport ||
        user.deporte ||
        metadata.favorite_sport ||
        "";
}

function buildMetadata(user, extraData = {}) {
    const currentMetadata = getMetadataObject(user);

    return {
        ...currentMetadata,
        ...extraData,
        sports: Array.isArray(currentMetadata.sports) ? currentMetadata.sports : []
    };
}

/* ============================= */
/* BADGES DE ROLES */
/* user → verde */
/* coach → azul */
/* admin → rojo */
/* ============================= */

function roleBadge(role) {
    const cleanRole = normalizeRole(role);

    if (cleanRole === "admin") {
        return `<span class="badge badge-admin">admin</span>`;
    }

    if (cleanRole === "coach") {
        return `<span class="badge badge-coach">coach</span>`;
    }

    return `<span class="badge badge-user">user</span>`;
}

/* ============================= */
/* BADGES DE ESTADO */
/* ============================= */

function statusBadge(user) {
    if (isUserActive(user)) {
        return `<span class="badge badge-active">activa</span>`;
    }

    return `<span class="badge badge-inactive">desactivada</span>`;
}

/* ============================= */
/* COLOR DEL AVATAR SEGÚN ROL */
/* ============================= */

function applyAvatarRoleColor(avatarElement, role) {
    if (!avatarElement) return;

    const cleanRole = normalizeRole(role);

    if (cleanRole === "admin") {
        avatarElement.style.background = "#fee2e2";
        avatarElement.style.color = "#991b1b";
        avatarElement.style.border = "1px solid #fca5a5";
        return;
    }

    if (cleanRole === "coach") {
        avatarElement.style.background = "#dbeafe";
        avatarElement.style.color = "#1d4ed8";
        avatarElement.style.border = "1px solid #93c5fd";
        return;
    }

    avatarElement.style.background = "#dcfce7";
    avatarElement.style.color = "#166534";
    avatarElement.style.border = "1px solid #86efac";
}

/* ============================= */
/* CARGAR DATOS EN LAYOUT */
/* ============================= */

function loadLayout() {
    const user = getUser();

    if (!user) return;

    const name = capitalizeName(getName(user));
    const role = getRole(user);
    const email = getEmail(user);

    const sidebarName = document.getElementById("sidebarName");
    const sidebarRole = document.getElementById("sidebarRole");
    const topbarUser = document.getElementById("topbarUser");
    const avatarText = document.getElementById("avatarText");

    if (sidebarName) {
        sidebarName.textContent = name;
    }

    if (sidebarRole) {
        sidebarRole.innerHTML = roleBadge(role);
    }

    if (topbarUser) {
        topbarUser.textContent = `${name} - ${email}`;
    }

    if (avatarText) {
        avatarText.textContent = name.charAt(0).toUpperCase();
        applyAvatarRoleColor(avatarText, role);
    }

    const adminLinks = document.querySelectorAll(".admin-only");

    if (role !== "admin") {
        adminLinks.forEach(link => link.classList.add("hidden"));
    }
}

/* ============================= */
/* CERRAR SESIÓN */
/* ============================= */

function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
}