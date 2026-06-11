// Impotar o cliente Supabase
import { supabase } from '../admin/js/supabase.js';

// Função login
// identificador é o e-mail ou o SIAPE do servidor

async function fazerLogin(identificador, senha) {
    try {
        // verifica se tá preenchido
        if (!identificador || !senha) {
            alert("Preencha o e-mail/SIAPE e a senha.");
            return;
        }

        let emailParaAutenticacao = identificador;

        // Identificar SIAPE
        const isSiape = /^\d+$/.test(identificador);

        if (isSiape) {
            const { data: docente, error: erroBusca } = await supabase
                .from('docentes')
                .select('email')
                .eq('siape', identificador)
                .single();

            // se nao tiver no banco de dados
            if (erroBusca || !docente) {
                alert("Usuário não encontrado com este SIAPE.");
                return;
            }

            // atualiza a variavel com o email do bd
            emailParaAutenticacao = docente.email;
        }

        // Autenticação com o Supabase Auth
        const { data: dadosLogin, error: erroLogin } = await supabase.auth.signInWithPassword({
            email: emailParaAutenticacao,
            password: senha,
        });

        if (erroLogin) {
            alert("Credenciais inválidas. Verifique sua senha.");
            return;
        }

        // Primeiro acesso
        const { data: dadosUsuario } = await supabase
            .from('docentes')
            .select('primeiro_acesso')
            .eq('email', emailParaAutenticacao)
            .single();

        // se for primeiro acesso
        if (dadosUsuario && dadosUsuario.primeiro_acesso) {
            alert("Primeiro acesso detectado! Redirecionando para redefinir sua senha.");

            // Redireciona o usuário para trocar a senha
            window.location.href = "redefinir-senha.html";
            return;
        }

        // Login normal
        alert("Login realizado com sucesso!");

        // Redireciona para a tela inicial
        window.location.href = "index.html";
    }
    catch (erro) {
        console.error("Erro no login: ", erro);
        alert("Erro no login. Tente novamente.");
    }
}

// Função para recuperar a senha
async function recuperarSenha(email) {
    try {
        if (!email) {
            alert("Preencha o e-mail.");
            return;
        }

        // Envia o e-mail de recuperação usando o Supabase
        // Define para onde o usuário será redirecionado após clicar no link do e-mail
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.href.replace('login.html', 'redefinir-senha.html')
        });

        if (error) {
            alert("Erro ao enviar o link de recuperação. Verifique se o e-mail está cadastrado.");
            console.error("Erro na recuperação: ", error);
            return;
        }

        alert("Link de recuperação enviado com sucesso! Verifique sua caixa de entrada.");

        // Retornar à tela de login automaticamente após o envio (opcional)
        document.getElementById('recovery-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');

    } catch (erro) {
        console.error("Erro inesperado na recuperação: ", erro);
        alert("Erro inesperado. Tente novamente.");
    }
}

// Conecta a tela de login.html com o javascript
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Previne o envio padrão do formulário

            // Pega os valores dos inputs do HTML
            const emailInput = document.getElementById('login-email').value;
            const senhaInput = document.getElementById('login-senha').value;

            // Chama a função de login com os dados capturados
            fazerLogin(emailInput, senhaInput);
        });
    }

    const recoveryForm = document.getElementById('recovery-form');

    if (recoveryForm) {
        recoveryForm.addEventListener('submit', (event) => {
            event.preventDefault();

            // Pega o valor do input de e-mail da recuperação
            const emailRecoveryInput = document.getElementById('recovery-email').value;

            // Chama a função de recuperação
            recuperarSenha(emailRecoveryInput);
        });
    }
});