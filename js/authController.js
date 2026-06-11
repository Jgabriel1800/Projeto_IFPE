import { supabase } from '../admin/js/supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const entrarLink = document.getElementById('entrarLink');
    
    if (!entrarLink) return;

    // Verifica se há uma sessão ativa
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
        // Usuário está logado, muda o botão para "Sair"
        entrarLink.textContent = 'Sair';
        entrarLink.href = '#'; // Remove o link direto
        
        entrarLink.addEventListener('click', async (event) => {
            event.preventDefault(); // Previne que o link suba a página
            
            // Fazer logout
            const { error: signOutError } = await supabase.auth.signOut();
            
            if (signOutError) {
                console.error("Erro ao fazer logout:", signOutError);
                alert("Erro ao sair. Tente novamente.");
            } else {
                // Redireciona para a tela inicial após o logout
                window.location.href = 'index.html';
            }
        });
    }
});
