function abrirAba(evt, nomeAba) {
    let i;
    let tabconteudo = document.getElementsByClassName("tab-conteudo");
    let tabbtns = document.getElementsByClassName("tab-btn");

    for (i = 0; i < tabconteudo.length; i++) {
        tabconteudo[i].style.display = "none";
    }

    for (i = 0; i < tabbtns.length; i++) {
        tabbtns[i].classList.remove("ativo");
    }

    document.getElementById(nomeAba).style.display = "block";
    evt.currentTarget.classList.add("ativo");
}