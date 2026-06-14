protectPage();
loadLayout();
setupLogout();

const editProfileBtn = document.getElementById("editProfileBtn");
const cancelProfileBtn = document.getElementById("cancelProfileBtn");
const profileActions = document.getElementById("profileActions");
const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");

let currentUser = null;

document.addEventListener("DOMContentLoaded", loadProfile);

editProfileBtn.addEventListener("click", enableEditMode);
cancelProfileBtn.addEventListener("click", cancelEditMode);

profileForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    await updateProfile();
});

passwordForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    await changePassword();
});

/* ============================= */
/* CARGAR PERFIL */
/* ============================= */

async function loadProfile() {
    clearMessage("profileMessage");

    try {
        const response = await apiRequest("/auth/me", {
            method: "GET",
            headers: authHeaders()
        });

        currentUser = extractUser(response);

        localStorage.setItem("user", JSON.stringify(currentUser));

        renderProfile(currentUser);
        fillProfileForm(currentUser);
        loadLayout();

    } catch (error) {
        showMessage("profileMessage", error.message, "error");
    }
}

/* ============================= */
/* MOSTRAR DATOS DEL PERFIL */
/* ============================= */

function renderProfile(user) {
    const name = capitalizeName(getName(user));
    const email = getEmail(user);
    const role = getRole(user);

    document.getElementById("profileInitial").textContent = name.charAt(0).toUpperCase();
    document.getElementById("profileName").textContent = name;
    document.getElementById("profileEmail").textContent = email;
    document.getElementById("profileBirthDate").textContent = formatDate(getBirthDate(user));
    document.getElementById("profileRole").textContent = role;
    document.getElementById("profileCreatedAt").textContent = formatDate(getCreatedAt(user));
    document.getElementById("profileRoleBadge").innerHTML = roleBadge(role);

    const profileStatus = document.getElementById("profileStatus");

    if (profileStatus) {
        profileStatus.innerHTML = statusBadge(user);
    }
}

/* ============================= */
/* LLENAR FORMULARIO */
/* ============================= */

function fillProfileForm(user) {
    document.getElementById("fullName").value = getName(user);
    document.getElementById("email").value = getEmail(user);
    document.getElementById("birthDate").value = formatDateInput(getBirthDate(user));
    document.getElementById("favoriteSport").value = getFavoriteSport(user);
    document.getElementById("metadata").value = getMetadataText(user);
}

/* ============================= */
/* MODO EDICIÓN */
/* ============================= */

function enableEditMode() {
    clearMessage("profileMessage");
    clearProfileErrors();

    document.getElementById("fullName").disabled = false;
    document.getElementById("birthDate").disabled = false;
    document.getElementById("favoriteSport").disabled = false;
    document.getElementById("metadata").disabled = false;

    /*
        El email queda bloqueado por seguridad.
        El admin sí puede editar emails desde users.html.
    */
    document.getElementById("email").disabled = true;

    profileActions.classList.remove("hidden");
    editProfileBtn.classList.add("hidden");
}

function cancelEditMode() {
    fillProfileForm(currentUser);
    disableEditMode();
}

function disableEditMode() {
    document.getElementById("fullName").disabled = true;
    document.getElementById("email").disabled = true;
    document.getElementById("birthDate").disabled = true;
    document.getElementById("favoriteSport").disabled = true;
    document.getElementById("metadata").disabled = true;

    profileActions.classList.add("hidden");
    editProfileBtn.classList.remove("hidden");

    clearProfileErrors();
}

/* ============================= */
/* ACTUALIZAR PERFIL */
/* ============================= */

async function updateProfile() {
    clearMessage("profileMessage");
    clearProfileErrors();

    const fullName = document.getElementById("fullName").value.trim();
    const birthDate = document.getElementById("birthDate").value;
    const favoriteSport = document.getElementById("favoriteSport").value.trim();
    const metadataText = document.getElementById("metadata").value.trim();

    let isValid = true;

    if (!fullName) {
        setError("fullName", "El nombre es obligatorio");
        isValid = false;
    } else if (fullName.length < 3) {
        setError("fullName", "El nombre debe tener al menos 3 caracteres");
        isValid = false;
    }

    if (!isValid) return;

    const metadata = buildMetadata(currentUser, {
        note: metadataText,
        favorite_sport: favoriteSport
    });

    try {
        const response = await apiRequest("/auth/me", {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({
                full_name: fullName,
                name: fullName,
                birth_date: birthDate || null,
                favorite_sport: favoriteSport,
                metadata: metadata
            })
        });

        const updatedUser = extractUser(response);

        currentUser = {
            ...currentUser,
            ...updatedUser,
            full_name: updatedUser.full_name || updatedUser.name || fullName,
            name: updatedUser.name || updatedUser.full_name || fullName,
            birth_date: updatedUser.birth_date || birthDate,
            favorite_sport: updatedUser.favorite_sport || favoriteSport,
            metadata: updatedUser.metadata || metadata
        };

        localStorage.setItem("user", JSON.stringify(currentUser));

        renderProfile(currentUser);
        fillProfileForm(currentUser);
        loadLayout();
        disableEditMode();

        showMessage("profileMessage", "Perfil actualizado correctamente", "success");

    } catch (error) {
        showMessage("profileMessage", error.message, "error");
    }
}

/* ============================= */
/* CAMBIAR CONTRASEÑA */
/* ============================= */

async function changePassword() {
    clearMessage("profileMessage");
    clearErrors(["currentPassword", "newPassword", "confirmNewPassword"]);

    const currentPassword = document.getElementById("currentPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmNewPassword = document.getElementById("confirmNewPassword").value.trim();

    let isValid = true;

    if (!currentPassword) {
        setError("currentPassword", "La contraseña actual es obligatoria");
        isValid = false;
    }

    if (!newPassword) {
        setError("newPassword", "La nueva contraseña es obligatoria");
        isValid = false;
    } else if (newPassword.length < 8) {
        setError("newPassword", "Contraseña mínima 8 caracteres");
        isValid = false;
    }

    if (!confirmNewPassword) {
        setError("confirmNewPassword", "Debes confirmar la nueva contraseña");
        isValid = false;
    } else if (newPassword !== confirmNewPassword) {
        setError("confirmNewPassword", "Las contraseñas no coinciden");
        isValid = false;
    }

    if (!isValid) return;

    const passwordPayloads = [
        {
            currentPassword: currentPassword,
            newPassword: newPassword,
            confirmPassword: confirmNewPassword
        },
        {
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmNewPassword
        },
        {
            password_actual: currentPassword,
            password_nueva: newPassword,
            confirmar_password: confirmNewPassword
        }
    ];

    const possibleRoutes = [
        "/auth/me/password",
        "/auth/change-password",
        "/auth/password",
        "/users/me/password",
        "/profile/password",
        "/me/password"
    ];

    try {
        await tryPasswordRoutes(possibleRoutes, passwordPayloads);

        passwordForm.reset();

        showMessage(
            "profileMessage",
            "Contraseña actualizada correctamente",
            "success"
        );

    } catch (error) {
        showMessage(
            "profileMessage",
            "No se pudo actualizar la contraseña. Revisa en el README del backend cuál es la ruta correcta para cambiar contraseña.",
            "error"
        );

        console.error("Error cambio contraseña:", error.message);
    }
}

/* ============================= */
/* PROBAR RUTAS DE CONTRASEÑA */
/* ============================= */

async function tryPasswordRoutes(routes, payloads) {
    let lastError = null;

    for (const route of routes) {
        for (const payload of payloads) {
            try {
                const response = await fetch(`${API_URL}${route}`, {
                    method: "PUT",
                    headers: authHeaders(),
                    body: JSON.stringify(payload)
                });

                let data = {};

                try {
                    data = await response.json();
                } catch (error) {
                    data = {};
                }

                if (response.ok) {
                    return data;
                }

                lastError = new Error(
                    data.message ||
                    data.error ||
                    `Error en ruta ${route}`
                );

            } catch (error) {
                lastError = error;
            }
        }
    }

    throw lastError || new Error("No existe ruta para cambiar contraseña");
}

/* ============================= */
/* LIMPIAR ERRORES PERFIL */
/* ============================= */

function clearProfileErrors() {
    clearErrors([
        "fullName",
        "email",
        "birthDate",
        "favoriteSport",
        "metadata"
    ]);
}