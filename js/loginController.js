// Impotar o cliente Supabase
import {supabase} from './supabase';

// Função login
// identificador é o e-mail ou o SIAPE do servidor

async function fazerLogin(identificador, senha) {
    try{
        // verifica se tá preenchido
        if (!identificador || !senha){
            alert("Preencha o e-mail/SIAPE e a senha.");
            return;
        }

        let emailParaAutenticacao = identificador;

        // Identificar SIAPE
        const isSiape = /^\d+$/.test(identificador);

        if(isSiape){
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
            // window.location.href...
            return;
        }

        // Login normal
        alert("Login realizado com sucesso!");

        // Redireciona para a tela de adm
        //window.location.href = "";
    }
    catch (erro) {
        console.error("Erro no login: ", erro);
        alert("Erro no login. Tente novamente.");
    }
}