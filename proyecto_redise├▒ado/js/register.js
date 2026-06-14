const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearMessage("registerMessage");
    clearErrors(["fullName", "email", "birthDate", "password", "confirmPassword"]);

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const birthDate = document.getElementById("birthDate").value;
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    let isValid = true;

    if (!fullName) {
        setError("fullName", "El nombre es obligatorio");
        isValid = false;
    }

    if (!email) {
        setError("email", "El email es obligatorio");
        isValid = false;
    } else if (!isValidEmail(email)) {
        setError("email", "Email inválido");
        isValid = false;
    }

    if (!birthDate) {
        setError("birthDate", "La fecha de nacimiento es obligatoria");
        isValid = false;
    }

    if (!password) {
        setError("password", "La contraseña es obligatoria");
        isValid = false;
    } else if (password.length < 8) {
        setError("password", "Contraseña mínima 8 caracteres");
        isValid = false;
    }

    if (!confirmPassword) {
        setError("confirmPassword", "Debes confirmar la contraseña");
        isValid = false;
    } else if (password !== confirmPassword) {
        setError("confirmPassword", "Las contraseñas no coinciden");
        isValid = false;
    }

    if (!isValid) return;

    try {
        await apiRequest("/auth/register", {
            method: "POST",
            headers: normalHeaders(),
            body: JSON.stringify({
                full_name: fullName,
                name: fullName,
                email: email,
                birth_date: birthDate,
                password: password,
                confirmPassword: confirmPassword,
                role: "user"
            })
        });

        showMessage(
            "registerMessage",
            "Usuario registrado correctamente. Ahora puedes iniciar sesión.",
            "success"
        );

        registerForm.reset();

        setTimeout(() => {
            window.location.href = "./login.html";
        }, 1500);

    } catch (error) {
        showMessage("registerMessage", error.message, "error");
    }
});