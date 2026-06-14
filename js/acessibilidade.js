// =========================
// Loop do menu
// Entrar -> Home
// =========================
const entrar = document.getElementById("entrarLink");
const home = document.getElementById("homeLink");

entrar.addEventListener("keydown", function (event) {

    if (event.key === "Tab" && !event.shiftKey) {
        event.preventDefault();
        home.focus();
    }

});


// =========================
// Identificação do ambiente
// =========================
const userAgent = navigator.userAgent.toLowerCase();

const isMac = /mac|iphone|ipad/.test(userAgent);
const isFirefox = userAgent.includes("firefox");


// =========================
// Atalhos de acessibilidade
// =========================
document.addEventListener("keydown", function (event) {

    let atalhoValido = false;

    // macOS → Control + Option + número
    if (isMac) {
        atalhoValido =
            event.ctrlKey &&
            event.altKey;
    }

    // Firefox Windows/Linux → Alt + Shift + número
    else if (isFirefox) {
        atalhoValido =
            event.altKey &&
            event.shiftKey;
    }

    // Chrome / Edge / outros → Alt + número
    else {
        atalhoValido =
            event.altKey &&
            !event.shiftKey;
    }

    if (!atalhoValido) return;

    let destino = null;

    switch (event.key) {

        case "1":
            destino = document.getElementById("conteudo");
            break;

        case "2":
            destino = document.getElementById("menu");
            break;

        case "3":
            destino = document.getElementById("rodape");
            break;
    }

    if (destino) {
        event.preventDefault();

        destino.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        // move o foco para acessibilidade
        destino.setAttribute("tabindex", "-1");
        destino.focus();
    }

});

// =========================
// Mostrar atalhos dinamicamente
// =========================

let shortcutText = "";

// macOS → Control + Option + número
if (isMac) {
    shortcutText = "Ctrl + Option + ";
}
// Firefox Windows/Linux → Alt + Shift + número
else if (isFirefox) {
    shortcutText = "Alt + Shift + ";
}
// Chrome / Edge / outros → Alt + número
else {
    shortcutText = "Alt + ";
}

// Preenche os spans
document.querySelectorAll(".shortcut").forEach(span => {
    const key = span.getAttribute("data-key");
    span.textContent = `${shortcutText}${key}`;
});
/* Lógica para abrir/fechar o Dropdown de Projetos no clique */
document.addEventListener('DOMContentLoaded', () => {
    const btnProjetos = document.querySelector('.dropdown > a');
    const menuDropdown = document.querySelector('.dropdown-content');

    if (btnProjetos && menuDropdown) {
        btnProjetos.addEventListener('click', function(event) {
            event.preventDefault(); // Impede o link de recarregar a página
            menuDropdown.classList.toggle('mostrar');
        });

        // Fecha o menu se o usuário clicar em qualquer outro lugar da página
        window.addEventListener('click', function(event) {
            if (!event.target.matches('.dropdown > a')) {
                if (menuDropdown.classList.contains('mostrar')) {
                    menuDropdown.classList.remove('mostrar');
                }
            }
        });
    }
});