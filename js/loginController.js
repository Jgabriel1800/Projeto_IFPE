import { supabase } from './supabase.js';

async function fazerLogin(identificador, senha) {
    try {
        if (!identificador || !senha) {
            alert("Preencha o e-mail/SIAPE e a senha.");
            return;
        }

        let emailParaAutenticacao = identificador;

        const isSiape = /^\d+$/.test(identificador);

        if (isSiape) {
            const { data: docente, error: erroBusca } = await supabase
                .from('docentes')
                .select('email_institucional')
                .eq('siape', identificador)
                .single();

            if (erroBusca || !docente) {
                alert("Usuário não encontrado com este SIAPE.");
                return;
            }

            emailParaAutenticacao = docente.email_institucional;
        }

        const { data: dadosLogin, error: erroLogin } = await supabase.auth.signInWithPassword({
            email: emailParaAutenticacao,
            password: senha,
        });

        if (erroLogin) {
            alert("Credenciais inválidas. Verifique sua senha.");
            return;
        }

        const { data: dadosUsuario } = await supabase
            .from('docentes')
            .select('primeiro_acesso')
            .eq('email_institucional', emailParaAutenticacao)
            .single();

        if (dadosUsuario && dadosUsuario.primeiro_acesso) {
            alert("Primeiro acesso detectado! Redirecionando para redefinir sua senha.");

            window.location.href = "redefinir-senha.html";
            return;
        }

        alert("Login realizado com sucesso!");

        window.location.href = "index.html";
    }
    catch (erro) {
        console.error("Erro no login: ", erro);
        alert("Erro no login. Tente novamente.");
    }
}

async function recuperarSenha(email) {
    try {
        if (!email) {
            alert("Preencha o e-mail.");
            return;
        }

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.href.replace('login.html', 'redefinir-senha.html')
        });

        if (error) {
            alert("Erro ao enviar o link de recuperação. Verifique se o e-mail está cadastrado.");
            console.error("Erro na recuperação: ", error);
            return;
        }

        alert("Link de recuperação enviado com sucesso! Verifique sua caixa de entrada.");

        document.getElementById('recovery-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');

    } catch (erro) {
        console.error("Erro inesperado na recuperação: ", erro);
        alert("Erro inesperado. Tente novamente.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const emailInput = document.getElementById('login-email').value;
            const senhaInput = document.getElementById('login-senha').value;

            fazerLogin(emailInput, senhaInput);
        });
    }

    const recoveryForm = document.getElementById('recovery-form');

    if (recoveryForm) {
        recoveryForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const emailRecoveryInput = document.getElementById('recovery-email').value;

            recuperarSenha(emailRecoveryInput);
        });
    }
});