import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const resetForm = document.getElementById('reset-form');
    
    if (resetForm) {
        resetForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (newPassword !== confirmPassword) {
                alert("As senhas não coincidem. Tente novamente.");
                return;
            }
            
            if (newPassword.length < 6) {
                alert("A senha deve ter no mínimo 6 caracteres.");
                return;
            }
            
            try {
                const { data, error } = await supabase.auth.updateUser({
                    password: newPassword
                });
                
                if (error) {
                    console.error("Erro ao redefinir a senha:", error);
                    alert("Ocorreu um erro ao redefinir a senha. Tente enviar um novo link para o seu e-mail.");
                    return;
                }
                
                if (data && data.user && data.user.email) {
                    const email = data.user.email;
                    
                    await supabase
                        .from('docentes')
                        .update({ primeiro_acesso: false })
                        .eq('email_institucional', email);
                        
                    await supabase
                        .from('administradores')
                        .update({ primeiro_acesso: false })
                        .eq('email', email);
                }
                
                alert("Senha redefinida com sucesso! Você já pode fazer login com a nova senha.");
                window.location.href = "login.html";
                
            } catch (erro) {
                console.error("Erro inesperado:", erro);
                alert("Erro inesperado. Tente novamente.");
            }
        });
    }
});

supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
        console.log("Fluxo de recuperação de senha iniciado. Sessão temporária estabelecida.");
    }
});
