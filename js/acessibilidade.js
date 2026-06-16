const entrar = document.getElementById("entrarLink");
const home = document.getElementById("homeLink");

entrar.addEventListener("keydown", function (event) {

    if (event.key === "Tab" && !event.shiftKey) {
        event.preventDefault();
        home.focus();
    }

});

const userAgent = navigator.userAgent.toLowerCase();

const isMac = /mac|iphone|ipad/.test(userAgent);
const isFirefox = userAgent.includes("firefox");

document.addEventListener("keydown", function (event) {

    let atalhoValido = false;

    if (isMac) {
        atalhoValido =
            event.ctrlKey &&
            event.altKey;
    }

    else if (isFirefox) {
        atalhoValido =
            event.altKey &&
            event.shiftKey;
    }

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

        destino.setAttribute("tabindex", "-1");
        destino.focus();
    }

});

let shortcutText = "";

if (isMac) {
    shortcutText = "Ctrl + Option + ";
}
else if (isFirefox) {
    shortcutText = "Alt + Shift + ";
}
else {
    shortcutText = "Alt + ";
}

document.querySelectorAll(".shortcut").forEach(span => {
    const key = span.getAttribute("data-key");
    span.textContent = `${shortcutText}${key}`;
});
document.addEventListener('DOMContentLoaded', () => {
    const btnProjetos = document.querySelector('.dropdown > a');
    const menuDropdown = document.querySelector('.dropdown-content');

    if (btnProjetos && menuDropdown) {
        btnProjetos.addEventListener('click', function(event) {
            event.preventDefault();
            menuDropdown.classList.toggle('mostrar');
        });

        window.addEventListener('click', function(event) {
            if (!event.target.matches('.dropdown > a')) {
                if (menuDropdown.classList.contains('mostrar')) {
                    menuDropdown.classList.remove('mostrar');
                }
            }
        });
    }
});