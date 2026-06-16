import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const btnEditarPagina = document.getElementById('btnEditarPagina');
    const adminBanner = document.getElementById('adminBanner');
    const adminFormSection = document.getElementById('adminFormSection');
    const conteudoMain = document.getElementById('conteudo');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    const formAdminEdit = document.getElementById('formAdminEdit');
    const rodape = document.getElementById('rodape') || document.querySelector('.footer');

    // Elementos da página
    const elTituloHero = document.getElementById('edit-titulo-hero');
    const elTextoHero = document.getElementById('edit-texto-hero');
    const elTituloMercado = document.getElementById('edit-titulo-mercado');
    const elTextoMercado = document.getElementById('edit-texto-mercado');
    const elTituloAreas = document.getElementById('edit-titulo-areas');
    const elTextoAreas = document.getElementById('edit-texto-areas');
    const elTituloCaracteristicas = document.getElementById('edit-titulo-caracteristicas');
    const elTextoCaracteristicas = document.getElementById('edit-texto-caracteristicas');

    const elTituloInfo = document.getElementById('edit-titulo-info');
    const elInfoModalidade = document.getElementById('edit-info-modalidade');
    const elInfoDuracao = document.getElementById('edit-info-duracao');
    const elInfoTurno = document.getElementById('edit-info-turno');
    const elInfoCampus = document.getElementById('edit-info-campus');
    const elInfoVagas = document.getElementById('edit-info-vagas');
    const elInfoIngresso = document.getElementById('edit-info-ingresso');

    const elTituloServicos = document.getElementById('edit-titulo-servicos');
    const elTextoServicos = document.getElementById('edit-texto-servicos');

    // Campos do formulário
    const inTituloHero = document.getElementById('input-titulo-hero');
    const inTextoHero = document.getElementById('input-texto-hero');
    const inTituloMercado = document.getElementById('input-titulo-mercado');
    const inTextoMercado = document.getElementById('input-texto-mercado');
    const inTituloAreas = document.getElementById('input-titulo-areas');
    const inTextoAreas = document.getElementById('input-texto-areas');
    const inTituloCaracteristicas = document.getElementById('input-titulo-caracteristicas');
    const inTextoCaracteristicas = document.getElementById('input-texto-caracteristicas');

    const inTituloInfo = document.getElementById('input-titulo-info');
    const inInfoModalidade = document.getElementById('input-info-modalidade');
    const inInfoDuracao = document.getElementById('input-info-duracao');
    const inInfoTurno = document.getElementById('input-info-turno');
    const inInfoCampus = document.getElementById('input-info-campus');
    const inInfoVagas = document.getElementById('input-info-vagas');
    const inInfoIngresso = document.getElementById('input-info-ingresso');

    const inTituloServicos = document.getElementById('input-titulo-servicos');
    const inTextoServicos = document.getElementById('input-texto-servicos');

    // Carregar conteúdo do Supabase (para todos os usuários)
    async function carregarConteudo() {
        const { data, error } = await supabase
            .from('page_content')
            .select('content')
            .eq('page', 'index')
            .single();

        if (error) {
            console.log("Aviso: Nenhum conteúdo personalizado encontrado ou tabela ausente. Usando conteúdo padrão.");
            return;
        }

        if (data && data.content) {
            const c = data.content;
            if (c.tituloHero) elTituloHero.textContent = c.tituloHero;
            if (c.textoHero) elTextoHero.textContent = c.textoHero;
            if (c.tituloMercado) elTituloMercado.textContent = c.tituloMercado;
            if (c.textoMercado) elTextoMercado.textContent = c.textoMercado;
            if (c.tituloAreas) elTituloAreas.textContent = c.tituloAreas;
            if (c.textoAreas) elTextoAreas.textContent = c.textoAreas;
            if (c.tituloCaracteristicas) elTituloCaracteristicas.textContent = c.tituloCaracteristicas;
            if (c.textoCaracteristicas) elTextoCaracteristicas.textContent = c.textoCaracteristicas;

            if (c.tituloInfo) elTituloInfo.textContent = c.tituloInfo;
            if (c.infoModalidade) elInfoModalidade.textContent = c.infoModalidade;
            if (c.infoDuracao) elInfoDuracao.textContent = c.infoDuracao;
            if (c.infoTurno) elInfoTurno.textContent = c.infoTurno;
            if (c.infoCampus) elInfoCampus.textContent = c.infoCampus;
            if (c.infoVagas) elInfoVagas.textContent = c.infoVagas;
            if (c.infoIngresso) elInfoIngresso.textContent = c.infoIngresso;

            if (c.tituloServicos) elTituloServicos.textContent = c.tituloServicos;
            if (c.textoServicos) elTextoServicos.textContent = c.textoServicos;
        }
    }

    await carregarConteudo();

    // Verificar se o usuário está logado (Administrador)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // Mostra a barra do admin se logado
        adminBanner.style.display = 'block';
    }

    // Lógica do Formulário (Alternar visibilidade)
    btnEditarPagina.addEventListener('click', () => {
        // Preenche o formulário com o conteúdo atual da tela
        inTituloHero.value = elTituloHero.textContent.trim();
        inTextoHero.value = elTextoHero.textContent.trim();
        inTituloMercado.value = elTituloMercado.textContent.trim();
        inTextoMercado.value = elTextoMercado.textContent.trim();
        inTituloAreas.value = elTituloAreas.textContent.trim();
        inTextoAreas.value = elTextoAreas.textContent.trim();
        inTituloCaracteristicas.value = elTituloCaracteristicas.textContent.trim();
        inTextoCaracteristicas.value = elTextoCaracteristicas.textContent.trim();

        inTituloInfo.value = elTituloInfo.textContent.trim();
        inInfoModalidade.value = elInfoModalidade.textContent.trim();
        inInfoDuracao.value = elInfoDuracao.textContent.trim();
        inInfoTurno.value = elInfoTurno.textContent.trim();
        inInfoCampus.value = elInfoCampus.textContent.trim();
        inInfoVagas.value = elInfoVagas.textContent.trim();
        inInfoIngresso.value = elInfoIngresso.textContent.trim();

        inTituloServicos.value = elTituloServicos.textContent.trim();
        inTextoServicos.value = elTextoServicos.textContent.trim();

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

    // Salvar Alterações
    formAdminEdit.addEventListener('submit', async (e) => {
        e.preventDefault();

        const novoConteudo = {
            tituloHero: inTituloHero.value,
            textoHero: inTextoHero.value,
            tituloMercado: inTituloMercado.value,
            textoMercado: inTextoMercado.value,
            tituloAreas: inTituloAreas.value,
            textoAreas: inTextoAreas.value,
            tituloCaracteristicas: inTituloCaracteristicas.value,
            textoCaracteristicas: inTextoCaracteristicas.value,
            tituloInfo: inTituloInfo.value,
            infoModalidade: inInfoModalidade.value,
            infoDuracao: inInfoDuracao.value,
            infoTurno: inInfoTurno.value,
            infoCampus: inInfoCampus.value,
            infoVagas: inInfoVagas.value,
            infoIngresso: inInfoIngresso.value,
            tituloServicos: inTituloServicos.value,
            textoServicos: inTextoServicos.value
        };

        // Salva no Supabase
        const { error } = await supabase
            .from('page_content')
            .upsert({ page: 'index', content: novoConteudo });

        if (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar alterações. Verifique se a tabela 'page_content' existe no Supabase.");
            return;
        }

        // Atualiza a tela imediatamente
        elTituloHero.textContent = novoConteudo.tituloHero;
        elTextoHero.textContent = novoConteudo.textoHero;
        elTituloMercado.textContent = novoConteudo.tituloMercado;
        elTextoMercado.textContent = novoConteudo.textoMercado;
        elTituloAreas.textContent = novoConteudo.tituloAreas;
        elTextoAreas.textContent = novoConteudo.textoAreas;
        elTituloCaracteristicas.textContent = novoConteudo.tituloCaracteristicas;
        elTextoCaracteristicas.textContent = novoConteudo.textoCaracteristicas;

        elTituloInfo.textContent = novoConteudo.tituloInfo;
        elInfoModalidade.textContent = novoConteudo.infoModalidade;
        elInfoDuracao.textContent = novoConteudo.infoDuracao;
        elInfoTurno.textContent = novoConteudo.infoTurno;
        elInfoCampus.textContent = novoConteudo.infoCampus;
        elInfoVagas.textContent = novoConteudo.infoVagas;
        elInfoIngresso.textContent = novoConteudo.infoIngresso;

        elTituloServicos.textContent = novoConteudo.tituloServicos;
        elTextoServicos.textContent = novoConteudo.textoServicos;

        // Volta para a visualização normal
        adminFormSection.style.display = 'none';
        conteudoMain.style.display = 'block';
        adminBanner.style.display = 'block';
        if (rodape) rodape.style.display = '';
        alert("Página atualizada com sucesso!");
    });
});
