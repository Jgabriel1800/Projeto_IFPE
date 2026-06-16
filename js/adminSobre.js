import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const btnEditarPagina = document.getElementById('btnEditarPagina');
    const adminBanner = document.getElementById('adminBanner');
    const adminFormSection = document.getElementById('adminFormSection');
    const conteudoMain = document.getElementById('conteudo');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    const formAdminEdit = document.getElementById('formAdminEdit');
    const rodape = document.getElementById('rodape') || document.querySelector('footer');

    // Elementos da página
    const elTituloOque = document.getElementById('edit-titulo-oque');
    const elTextoOque = document.getElementById('edit-texto-oque');
    const elTituloEstrutura = document.getElementById('edit-titulo-estrutura');
    const elTextoEstrutura = document.getElementById('edit-texto-estrutura');
    const elTituloPerfil = document.getElementById('edit-titulo-perfil');
    const elTextoPerfil = document.getElementById('edit-texto-perfil');
    const elTituloDocumentos = document.getElementById('edit-titulo-documentos');
    const elTextoDocumentos = document.getElementById('edit-texto-documentos');

    // Campos do formulário
    const inTituloOque = document.getElementById('input-titulo-oque');
    const inTextoOque = document.getElementById('input-texto-oque');
    const inTituloEstrutura = document.getElementById('input-titulo-estrutura');
    const inTextoEstrutura = document.getElementById('input-texto-estrutura');
    const inTituloPerfil = document.getElementById('input-titulo-perfil');
    const inTextoPerfil = document.getElementById('input-texto-perfil');
    const inTituloDocumentos = document.getElementById('input-titulo-documentos');
    const inTextoDocumentos = document.getElementById('input-texto-documentos');

    // 1. Carregar conteúdo do Supabase (para todos os usuários)
    async function carregarConteudo() {
        const { data, error } = await supabase
            .from('page_content')
            .select('content')
            .eq('page', 'sobre')
            .single();

        if (error) {
            console.log("Aviso: Nenhum conteúdo personalizado encontrado ou tabela ausente. Usando conteúdo padrão.");
            return;
        }

        if (data && data.content) {
            const c = data.content;
            if (c.tituloOque) elTituloOque.textContent = c.tituloOque;
            if (c.textoOque) elTextoOque.textContent = c.textoOque;
            if (c.tituloEstrutura) elTituloEstrutura.textContent = c.tituloEstrutura;
            if (c.textoEstrutura) elTextoEstrutura.textContent = c.textoEstrutura;
            if (c.tituloPerfil) elTituloPerfil.textContent = c.tituloPerfil;
            if (c.textoPerfil) elTextoPerfil.textContent = c.textoPerfil;
            if (c.tituloDocumentos) elTituloDocumentos.textContent = c.tituloDocumentos;
            if (c.textoDocumentos) elTextoDocumentos.textContent = c.textoDocumentos;
        }
    }

    await carregarConteudo();

    // 2. Verificar se o usuário está logado (Administrador)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // Mostra a barra do admin se logado
        adminBanner.style.display = 'block';
    }

    // 3. Lógica do Formulário (Alternar visibilidade)
    btnEditarPagina.addEventListener('click', () => {
        // Preenche o formulário com o conteúdo atual da tela
        inTituloOque.value = elTituloOque.textContent.trim();
        inTextoOque.value = elTextoOque.textContent.trim();
        inTituloEstrutura.value = elTituloEstrutura.textContent.trim();
        inTextoEstrutura.value = elTextoEstrutura.textContent.trim();
        inTituloPerfil.value = elTituloPerfil.textContent.trim();
        inTextoPerfil.value = elTextoPerfil.textContent.trim();
        inTituloDocumentos.value = elTituloDocumentos.textContent.trim();
        inTextoDocumentos.value = elTextoDocumentos.textContent.trim();

        // Esconde o conteúdo principal e mostra o formulário
        conteudoMain.style.display = 'none';
        adminBanner.style.display = 'none';
        if (rodape) rodape.style.display = 'none';
        adminFormSection.style.display = 'block';
    });

    btnCancelarEdicao.addEventListener('click', () => {
        // Volta para a visualização normal
        adminFormSection.style.display = 'none';
        conteudoMain.style.display = 'block';
        adminBanner.style.display = 'block';
        if (rodape) rodape.style.display = '';
    });

    // 4. Salvar Alterações
    formAdminEdit.addEventListener('submit', async (e) => {
        e.preventDefault();

        const novoConteudo = {
            tituloOque: inTituloOque.value,
            textoOque: inTextoOque.value,
            tituloEstrutura: inTituloEstrutura.value,
            textoEstrutura: inTextoEstrutura.value,
            tituloPerfil: inTituloPerfil.value,
            textoPerfil: inTextoPerfil.value,
            tituloDocumentos: inTituloDocumentos.value,
            textoDocumentos: inTextoDocumentos.value
        };

        // Salva no Supabase
        const { error } = await supabase
            .from('page_content')
            .upsert({ page: 'sobre', content: novoConteudo });

        if (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar alterações. Verifique se a tabela 'page_content' existe no Supabase.");
            return;
        }

        // Atualiza a tela imediatamente
        elTituloOque.textContent = novoConteudo.tituloOque;
        elTextoOque.textContent = novoConteudo.textoOque;
        elTituloEstrutura.textContent = novoConteudo.tituloEstrutura;
        elTextoEstrutura.textContent = novoConteudo.textoEstrutura;
        elTituloPerfil.textContent = novoConteudo.tituloPerfil;
        elTextoPerfil.textContent = novoConteudo.textoPerfil;
        elTituloDocumentos.textContent = novoConteudo.tituloDocumentos;
        elTextoDocumentos.textContent = novoConteudo.textoDocumentos;

        // Volta para a visualização normal
        adminFormSection.style.display = 'none';
        conteudoMain.style.display = 'block';
        adminBanner.style.display = 'block';
        if (rodape) rodape.style.display = '';
        alert("Página atualizada com sucesso!");
    });
});
