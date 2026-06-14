document.addEventListener("DOMContentLoaded", () => {
    
    const botoesVerMais = document.querySelectorAll(".btn-ver-mais");

    botoesVerMais.forEach(botao => {
        botao.addEventListener("click", function() {
          
            const cardInfo = this.parentElement;
            const descricao = cardInfo.querySelector(".descricao-evento");
            
           
            descricao.classList.toggle("expandido");

           
            if (descricao.classList.contains("expandido")) {
                this.textContent = "Ver menos";
            } else {
                this.textContent = "Veja Mais";
            }
        });
    });
});