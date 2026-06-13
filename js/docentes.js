document.querySelectorAll(".btn-docente").forEach(botao => {

    botao.addEventListener("click", function () {

        const card = this.closest(".docente-card");

        if (this.classList.contains("fechar")) {
            card.classList.remove("ativo");
        } else {
            card.classList.add("ativo");
        }

    });

});