import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const entrarLink = document.getElementById('entrarLink');
    
    if (!entrarLink) return;

    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
        entrarLink.textContent = 'Sair';
        entrarLink.href = '#';
        
        entrarLink.addEventListener('click', async (event) => {
            event.preventDefault();
            const { error: signOutError } = await supabase.auth.signOut();
            
            if (signOutError) {
                console.error("Erro ao fazer logout:", signOutError);
                alert("Erro ao sair. Tente novamente.");
            } else {
                window.location.href = 'index.html';
            }
        });
    }
});
