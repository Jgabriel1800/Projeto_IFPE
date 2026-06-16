import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const btnEditarPagina = document.getElementById('btnEditarPagina');
    const adminBanner = document.getElementById('adminBanner');
    const adminFormSection = document.getElementById('adminFormSection');
    const conteudoMain = document.getElementById('conteudo');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    const formAdminEdit = document.getElementById('formAdminEdit');
    const rodape = document.getElementById('rodape') || document.querySelector('.footer');

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
    
    const viewProjetosContainer = document.getElementById('view-projetos-alunos-container');

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

    let projetosAlunos = [];

    async function carregarConteudo() {
        const { data, error } = await supabase
            .from('page_content')
            .select('content')
            .eq('page', 'index')
            .single();

        if (error) {
            console.log("Aviso: Nenhum conteúdo personalizado encontrado ou tabela ausente. Usando conteúdo padrão.");
            viewProjetosContainer.innerHTML = '<p>Nenhum site cadastrado.</p>';
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

            if (c.projetosAlunos) {
                projetosAlunos = c.projetosAlunos;
            }
            renderizarProjetosPublicos();
        }
    }

    function renderizarProjetosPublicos() {
        viewProjetosContainer.innerHTML = '';
        if (projetosAlunos.length === 0) {
            viewProjetosContainer.innerHTML = '<p style="text-align:center; color:#555; width:100%;">Nenhum site ou projeto cadastrado no momento.</p>';
            return;
        }

        projetosAlunos.forEach(proj => {
            const imgSrc = proj.imgUrl ? proj.imgUrl : 'assets/icones/icone_espera.png';
            viewProjetosContainer.innerHTML += `
                <a href="${proj.url}" target="_blank" class="card-projeto-aluno">
                    <img src="${imgSrc}" alt="${proj.titulo}">
                    <div class="card-projeto-conteudo">
                        <h3>${proj.titulo}</h3>
                        <p>${proj.desc}</p>
                    </div>
                </a>
            `;
        });
    }

    await carregarConteudo();

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        adminBanner.style.display = 'block';
    }

    btnEditarPagina.addEventListener('click', () => {
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

        renderizarListaProjetosAdmin();

        conteudoMain.style.display = 'none';
        adminBanner.style.display = 'none';
        if (rodape) rodape.style.display = 'none';
        adminFormSection.style.display = 'block';
    });

    btnCancelarEdicao.addEventListener('click', () => {
        adminFormSection.style.display = 'none';
        conteudoMain.style.display = 'block';
        adminBanner.style.display = 'block';
        if (rodape) rodape.style.display = '';
        carregarConteudo();
    });

    function renderizarListaProjetosAdmin() {
        const ul = document.getElementById('admin-lista-projetos-alunos');
        ul.innerHTML = '';
        if (projetosAlunos.length === 0) {
            ul.innerHTML = '<li style="color:#666;">Nenhum site cadastrado.</li>';
            return;
        }

        projetosAlunos.forEach((proj, index) => {
            const li = document.createElement('li');
            li.style.marginBottom = '10px';
            li.style.padding = '10px';
            li.style.border = '1px solid #ddd';
            li.style.borderRadius = '4px';

            li.innerHTML = `
                <strong>${proj.titulo}</strong> <br>
                <a href="${proj.url}" target="_blank" style="font-size:0.85em; color:#2980b9;">${proj.url}</a><br>
                <button type="button" class="btn-remover-proj" data-index="${index}" style="margin-top:8px; background-color: #c0392b; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px;">Remover</button>
            `;
            ul.appendChild(li);
        });

        ul.querySelectorAll('.btn-remover-proj').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                projetosAlunos.splice(idx, 1);
                renderizarListaProjetosAdmin();
            });
        });
    }

    async function uploadImagemProj(fileInputId, btnObj, callbackSucesso) {
        const fileInput = document.getElementById(fileInputId);
        if (!fileInput.files || fileInput.files.length === 0) {
            callbackSucesso(null);
            return;
        }

        const file = fileInput.files[0];
        const fileName = `proj_${Date.now()}_${file.name.replace(/\\s+/g, '_')}`;

        const textoOriginal = btnObj.textContent;
        btnObj.textContent = 'Enviando Imagem...';
        btnObj.disabled = true;

        const { data, error } = await supabase.storage.from('projetos_alunos_imagens').upload(fileName, file);
        if (error) {
            alert("Erro no upload da imagem: " + error.message);
            btnObj.textContent = textoOriginal;
            btnObj.disabled = false;
            return;
        }

        const { data: publicData } = supabase.storage.from('projetos_alunos_imagens').getPublicUrl(fileName);
        if (publicData) {
            callbackSucesso(publicData.publicUrl);
            fileInput.value = '';
        }
        btnObj.textContent = textoOriginal;
        btnObj.disabled = false;
    }

    document.getElementById('btnAddProjetoAluno').addEventListener('click', () => {
        const titulo = document.getElementById('input-proj-titulo').value.trim();
        const desc = document.getElementById('input-proj-desc').value.trim();
        const url = document.getElementById('input-proj-url').value.trim();
        const btn = document.getElementById('btnAddProjetoAluno');

        if (!titulo || !url) {
            alert("Título e URL são obrigatórios para o site.");
            return;
        }

        uploadImagemProj('input-proj-img', btn, (imgUrl) => {
            projetosAlunos.push({
                titulo, desc, url, imgUrl
            });
            document.getElementById('input-proj-titulo').value = '';
            document.getElementById('input-proj-desc').value = '';
            document.getElementById('input-proj-url').value = '';
            renderizarListaProjetosAdmin();
        });
    });

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
            textoServicos: inTextoServicos.value,
            projetosAlunos: projetosAlunos
        };

        const { error } = await supabase
            .from('page_content')
            .upsert({ page: 'index', content: novoConteudo });

        if (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar alterações. Verifique se a tabela 'page_content' existe no Supabase.");
            return;
        }

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

        renderizarProjetosPublicos();

        adminFormSection.style.display = 'none';
        conteudoMain.style.display = 'block';
        adminBanner.style.display = 'block';
        if (rodape) rodape.style.display = '';
        alert("Página atualizada com sucesso!");
    });
});
