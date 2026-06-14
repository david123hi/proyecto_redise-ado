const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearMessage("loginMessage");
    clearErrors(["email", "password"]);

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    let isValid = true;

    if (!email) {
        setError("email", "El email es obligatorio");
        isValid = false;
    } else if (!isValidEmail(email)) {
        setError("email", "Email inválido");
        isValid = false;
    }

    if (!password) {
        setError("password", "La contraseña es obligatoria");
        isValid = false;
    }

    if (!isValid) return;

    try {
        const response = await apiRequest("/auth/login", {
            method: "POST",
            headers: normalHeaders(),
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const token = extractToken(response);
        const user = extractUser(response);

        if (!token || !user || !getEmail(user)) {
            console.log("Respuesta completa del backend:", response);
            throw new Error("La API no devolvió token o usuario");
        }

        saveSession(token, user);

        const role = getRole(user);

        if (role === "admin") {
            window.location.href = "./dashboard.html";
        } else {
            window.location.href = "./perfil.html";
        }

    } catch (error) {
        showMessage("loginMessage", error.message, "error");
    }
});