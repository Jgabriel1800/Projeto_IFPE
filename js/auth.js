import { supabase } from './supabase.js';

/**
 * @param {string} email
 * @param {string} password
 * @param {string} nome
 */
async function cadastrarAdmin(email, password, nome) {
    try {
        console.log("Iniciando o processo de cadastro do administrador...")
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    nome_completo: nome,
                    role: 'admin'
                }
            }
        });

        if (authError) {
            console.error("Erro no Supabase Auth:" , authError.message);
            alert("Erro na autenticação: " + authError.message);
            return;
        }

        const uuidUsuario = authData.user?.id;
        console.log("Usuário criado no Auth! UUID gerado:" , uuidUsuario)

        const { error: dbError } = await supabase
        .from('administradores')
        .insert([
            {
                id: uuidUsuario,
                nome: nome,
                email: email,
                primeiro_acesso: true
            }
        ]);

        if (dbError) {
            console.error("Error ao salvar na tabela administradores:" , dbError.message);
            alert("Conta criada no Auth, mas falhou ao salvar os dados na tebela.");
            return;
        }

        alert(`Administrador "${nome}" cadastrado com sucesso`);
        console.log("Cadastro concuido. Um e-mail com o código de 6 digitos foi criado")
    }
    catch (error) {
        console.error("Desculpe, falha crítica inesperada no sistema")
    }
}

window.cadastrarAdmin = cadastrarAdmin;
