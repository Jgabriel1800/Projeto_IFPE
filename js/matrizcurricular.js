const botoes = document.querySelectorAll(".accordion-btn");

botoes.forEach(botao => {

    botao.addEventListener("click", () => {

        const conteudo = botao.nextElementSibling;

        if (conteudo.style.display === "block") {
            conteudo.style.display = "none";
        } else {
            conteudo.style.display = "block";
        }

    });

});