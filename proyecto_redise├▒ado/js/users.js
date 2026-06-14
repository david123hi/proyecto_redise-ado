protectAdminPage();
loadLayout();
setupLogout();

const usersTableBody = document.getElementById("usersTableBody");
const userFormCard = document.getElementById("userFormCard");
const userForm = document.getElementById("userForm");
const newUserBtn = document.getElementById("newUserBtn");
const cancelUserBtn = document.getElementById("cancelUserBtn");
const formTitle = document.getElementById("formTitle");

const deleteBox = document.getElementById("deleteBox");
const deleteText = document.getElementById("deleteText");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

const totalUsersCount = document.getElementById("totalUsersCount");
const activeUsersCount = document.getElementById("activeUsersCount");
const inactiveUsersCount = document.getElementById("inactiveUsersCount");

let users = [];
let userIdToDelete = null;

document.addEventListener("DOMContentLoaded", loadUsers);

newUserBtn.addEventListener("click", openCreateForm);
cancelUserBtn.addEventListener("click", closeForm);
confirmDeleteBtn.addEventListener("click", confirmDeleteUser);
cancelDeleteBtn.addEventListener("click", hideDeleteBox);

userForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = document.getElementById("userId").value;

    if (id) {
        await updateUser(id);
    } else {
        await createUser();
    }
});

async function loadUsers() {
    clearMessage("usersMessage");

    try {
        const response = await apiRequest("/users", {
            method: "GET",
            headers: authHeaders()
        });

        users = extractUsers(response);

        renderUsers();
        renderStats();

    } catch (error) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="7">No se pudieron cargar los usuarios</td>
            </tr>
        `;

        showMessage("usersMessage", error.message, "error");
    }
}

function renderStats() {
    const total = users.length;
    const active = users.filter(user => isUserActive(user)).length;
    const inactive = total - active;

    totalUsersCount.textContent = total;
    activeUsersCount.textContent = active;
    inactiveUsersCount.textContent = inactive;
}

function renderUsers() {
    usersTableBody.innerHTML = "";

    if (users.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="7">No hay usuarios registrados</td>
            </tr>
        `;
        return;
    }

    users.forEach(user => {
        const id = getId(user);
        const name = capitalizeName(getName(user));
        const email = getEmail(user);
        const role = getRole(user);
        const createdAt = formatDate(getCreatedAt(user));

        usersTableBody.innerHTML += `
            <tr>
                <td>${id}</td>
                <td>${name}</td>
                <td>${email}</td>
                <td>${roleBadge(role)}</td>
                <td>${statusBadge(user)}</td>
                <td>${createdAt}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-primary btn-sm" onclick="openEditForm('${id}')">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="showDeleteBox('${id}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function openCreateForm() {
    clearMessage("usersMessage");
    clearUserErrors();
    hideDeleteBox();

    userForm.reset();
    document.getElementById("userId").value = "";

    document.getElementById("password").disabled = false;
    document.getElementById("confirmPassword").disabled = false;
    document.getElementById("accountStatus").value = "active";

    formTitle.textContent = "Nuevo Usuario";
    userFormCard.classList.remove("hidden");
}

async function openEditForm(id) {
    clearMessage("usersMessage");
    clearUserErrors();
    hideDeleteBox();

    try {
        let user = users.find(item => String(getId(item)) === String(id));

        if (!user) {
            const response = await apiRequest(`/users/${id}`, {
                method: "GET",
                headers: authHeaders()
            });

            user = extractUser(response);
        }

        document.getElementById("userId").value = getId(user);
        document.getElementById("fullName").value = getName(user);
        document.getElementById("email").value = getEmail(user);
        document.getElementById("role").value = getRole(user);
        document.getElementById("birthDate").value = formatDateInput(getBirthDate(user));
        document.getElementById("accountStatus").value = getStatus(user);

        document.getElementById("password").value = "";
        document.getElementById("confirmPassword").value = "";

        document.getElementById("password").disabled = true;
        document.getElementById("confirmPassword").disabled = true;

        formTitle.textContent = "Editar Usuario";
        userFormCard.classList.remove("hidden");

    } catch (error) {
        showMessage("usersMessage", error.message, "error");
    }
}

function closeForm() {
    userForm.reset();
    clearUserErrors();
    userFormCard.classList.add("hidden");
}

async function createUser() {
    clearMessage("usersMessage");
    clearUserErrors();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const role = document.getElementById("role").value;
    const birthDate = document.getElementById("birthDate").value;
    const accountStatus = document.getElementById("accountStatus").value;
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    const valid = validateUserForm({
        fullName,
        email,
        role,
        birthDate,
        accountStatus,
        password,
        confirmPassword,
        isEdit: false
    });

    if (!valid) return;

    const metadata = {
        sports: [],
        is_active: accountStatus === "active",
        note: "",
        favorite_sport: ""
    };

    try {
        await apiRequest("/users", {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
                full_name: fullName,
                email: email,
                role: role,
                birth_date: birthDate || null,
                password: password,
                metadata: metadata
            })
        });

        showMessage("usersMessage", "Usuario creado correctamente", "success");
        closeForm();
        await loadUsers();

    } catch (error) {
        showMessage("usersMessage", error.message, "error");
    }
}

async function updateUser(id) {
    clearMessage("usersMessage");
    clearUserErrors();

    const currentUser = users.find(item => String(getId(item)) === String(id));

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const role = document.getElementById("role").value;
    const birthDate = document.getElementById("birthDate").value;
    const accountStatus = document.getElementById("accountStatus").value;

    const valid = validateUserForm({
        fullName,
        email,
        role,
        birthDate,
        accountStatus,
        password: "",
        confirmPassword: "",
        isEdit: true
    });

    if (!valid) return;

    const metadata = buildMetadata(currentUser, {
        is_active: accountStatus === "active"
    });

    try {
        const response = await apiRequest(`/users/${id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({
                full_name: fullName,
                email: email,
                role: role,
                birth_date: birthDate || null,
                metadata: metadata
            })
        });

        console.log("Usuario actualizado:", response);

        showMessage("usersMessage", "Usuario actualizado correctamente", "success");
        closeForm();
        await loadUsers();

    } catch (error) {
        showMessage("usersMessage", error.message, "error");
    }
}

function showDeleteBox(id) {
    const user = users.find(item => String(getId(item)) === String(id));
    const name = user ? capitalizeName(getName(user)) : "este usuario";

    userIdToDelete = id;
    deleteText.textContent = `¿Seguro que deseas eliminar a ${name}?`;
    deleteBox.classList.add("show");
}

function hideDeleteBox() {
    userIdToDelete = null;
    deleteBox.classList.remove("show");
}

async function confirmDeleteUser() {
    if (!userIdToDelete) return;

    clearMessage("usersMessage");

    try {
        await apiRequest(`/users/${userIdToDelete}`, {
            method: "DELETE",
            headers: authHeaders()
        });

        showMessage("usersMessage", "Usuario eliminado correctamente", "success");
        hideDeleteBox();
        await loadUsers();

    } catch (error) {
        showMessage("usersMessage", error.message, "error");
    }
}

function validateUserForm(data) {
    let isValid = true;

    if (!data.fullName) {
        setError("fullName", "El nombre es obligatorio");
        isValid = false;
    } else if (data.fullName.length < 3) {
        setError("fullName", "El nombre debe tener al menos 3 caracteres");
        isValid = false;
    }

    if (!data.email) {
        setError("email", "El email es obligatorio");
        isValid = false;
    } else if (!isValidEmail(data.email)) {
        setError("email", "Email inválido");
        isValid = false;
    }

    if (!data.role) {
        setError("role", "El rol es obligatorio");
        isValid = false;
    }

    if (!data.accountStatus) {
        setError("accountStatus", "El estado es obligatorio");
        isValid = false;
    }

    if (!data.isEdit) {
        if (!data.password) {
            setError("password", "La contraseña es obligatoria");
            isValid = false;
        } else if (data.password.length < 8) {
            setError("password", "Contraseña mínima 8 caracteres");
            isValid = false;
        }

        if (!data.confirmPassword) {
            setError("confirmPassword", "Debes confirmar la contraseña");
            isValid = false;
        } else if (data.password !== data.confirmPassword) {
            setError("confirmPassword", "Las contraseñas no coinciden");
            isValid = false;
        }
    }

    return isValid;
}

function clearUserErrors() {
    clearErrors([
        "fullName",
        "email",
        "role",
        "birthDate",
        "accountStatus",
        "password",
        "confirmPassword"
    ]);
}