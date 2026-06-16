import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const btnEditarPagina = document.getElementById('btnEditarPagina');
    const adminBanner = document.getElementById('adminBanner');
    const adminFormSection = document.getElementById('adminFormSection');
    const conteudoMain = document.getElementById('conteudo');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    const formAdminEdit = document.getElementById('formAdminEdit');
    const rodape = document.getElementById('rodape') || document.querySelector('footer');

    const viewCoordNome = document.getElementById('view-coord-nome');
    const viewCoordEmail = document.getElementById('view-coord-email');
    const viewCoordTelefone = document.getElementById('view-coord-telefone');
    const viewSiecNome = document.getElementById('view-siec-nome');
    const viewSiecEmail = document.getElementById('view-siec-email');
    const viewSiecTelefone = document.getElementById('view-siec-telefone');
    
    const viewSecoesContainer = document.getElementById('view-secoes-container');
    const viewSubmenuLista = document.getElementById('view-submenu-lista');

    let dadosInovacao = {
        coordNome: "Pedro José da Silva Júnior",
        coordEmail: "extensao@belojardim.ifpe.edu.br",
        coordTelefone: "(81) 3411 3204",
        siecNome: "Flávia Moreira Correia",
        siecEmail: "siec@belojardim.ifpe.edu.br",
        siecTelefone: "(81) 3411 3222",
        secoes: [
            {
                titulo: "Pronatec",
                desc: "O Programa Nacional de Acesso ao Ensino Técnico e Emprego (Pronatec) é um programa do Ministério da Educação que tem como objetivo expandir, interiorizar e democratizar a oferta de cursos técnicos e profissionais de nível médio e de cursos de formação inicial e continuada para trabalhadores. Essa ação contribui com a expansão da Rede Federal de Educação Profissional e Tecnológica, da qual o IFPE faz parte. Atualmente, não há cursos ou seleções para o Pronatec em andamento no Campus Belo Jardim.",
                contato: 'Interessados podem contatar a Coordenação do Pronatec no IFPE-Campus Belo Jardim pelo e-mail <a href="mailto:pronatec@belojardim.ifpe.edu.br" class="link-destaque">pronatec@belojardim.ifpe.edu.br</a>',
                url: null
            }
        ]
    };

    function gerarIdBaseadoNoTitulo(titulo) {
        return "secao-" + titulo.toLowerCase()
            .replace(/[áàãâä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[íìîï]/g, 'i')
            .replace(/[óòõôö]/g, 'o')
            .replace(/[úùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/\\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }

    async function carregarConteudo() {
        const { data, error } = await supabase
            .from('page_content')
            .select('content')
            .eq('page', 'inovacao')
            .single();

        if (data && data.content) {
            dadosInovacao = { ...dadosInovacao, ...data.content };
        }
        renderizarPublico();
    }

    function renderizarPublico() {
        viewCoordNome.textContent = dadosInovacao.coordNome;
        viewCoordEmail.textContent = dadosInovacao.coordEmail;
        viewCoordTelefone.textContent = dadosInovacao.coordTelefone;
        viewSiecNome.textContent = dadosInovacao.siecNome;
        viewSiecEmail.textContent = dadosInovacao.siecEmail;
        viewSiecTelefone.textContent = dadosInovacao.siecTelefone;

        viewSecoesContainer.innerHTML = '';
        viewSubmenuLista.innerHTML = '';

        if (dadosInovacao.secoes.length === 0) {
            viewSecoesContainer.innerHTML = '<p style="color:#666; font-style:italic;">Nenhuma seção cadastrada.</p>';
            viewSubmenuLista.innerHTML = '<li><a href="#">Sem seções</a></li>';
            return;
        }

        dadosInovacao.secoes.forEach(secao => {
            const anchorId = gerarIdBaseadoNoTitulo(secao.titulo);
            
            viewSubmenuLista.innerHTML += `<li><a href="#${anchorId}">${secao.titulo}</a></li>`;

            let htmlSecao = `<section id="${anchorId}" class="secao-projeto">
                <h4>${secao.titulo}</h4>
                <div style="margin-bottom: 20px;">${secao.desc.replace(/\\n/g, '<br>')}</div>
            `;

            if (secao.contato) {
                htmlSecao += `<h5 class="subtitulo">Contato</h5>
                <p>${secao.contato}</p>`;
            }

            if (secao.url) {
                htmlSecao += `<p style="margin-top: 15px;">
                    <a href="${secao.url}" download target="_blank" class="link-destaque">
                        <img src="assets/icones/icone_pdf.png" alt="PDF" style="vertical-align:middle; width:20px; margin-right:5px;">
                        Acessar Documento da Seção
                    </a>
                </p>`;
            }

            htmlSecao += `</section>`;
            viewSecoesContainer.innerHTML += htmlSecao;
        });
    }

    await carregarConteudo();

    const { data: { session } } = await supabase.auth.getSession();
    if (session) adminBanner.style.display = 'block';

    btnEditarPagina.addEventListener('click', () => {
        document.getElementById('input-coord-nome').value = dadosInovacao.coordNome || '';
        document.getElementById('input-coord-email').value = dadosInovacao.coordEmail || '';
        document.getElementById('input-coord-telefone').value = dadosInovacao.coordTelefone || '';
        document.getElementById('input-siec-nome').value = dadosInovacao.siecNome || '';
        document.getElementById('input-siec-email').value = dadosInovacao.siecEmail || '';
        document.getElementById('input-siec-telefone').value = dadosInovacao.siecTelefone || '';
        
        renderizarListaSecoesAdmin();

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

    function renderizarListaSecoesAdmin() {
        const container = document.getElementById('admin-lista-secoes');
        container.innerHTML = '';
        if(dadosInovacao.secoes.length === 0) {
            container.innerHTML = '<li><small style="color:#666;">Nenhuma seção adicionada.</small></li>';
            return;
        }

        dadosInovacao.secoes.forEach((secao, index) => {
            const li = document.createElement('li');
            li.style.marginBottom = '12px';
            li.style.padding = '10px';
            li.style.border = '1px solid #ccc';
            li.style.borderRadius = '5px';
            
            li.innerHTML = `<strong>${secao.titulo}</strong> 
                <br><span style="font-size:0.9em; color:#555;">${secao.url ? 'Com Anexo PDF' : 'Sem Anexo PDF'} | Contato: ${secao.contato ? 'Sim' : 'Não'}</span>
                <br>
                <button type="button" data-index="${index}" class="btn-remover-secao" style="background-color: #c0392b; color: white; border: none; border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 12px; margin-top:5px;">Remover Seção</button>`;
            container.appendChild(li);
        });

        container.querySelectorAll('.btn-remover-secao').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                dadosInovacao.secoes.splice(idx, 1);
                renderizarListaSecoesAdmin();
            });
        });
    }

    async function uploadPdf(fileInputId, btnObj, callbackSucesso) {
        const fileInput = document.getElementById(fileInputId);
        if (!fileInput.files || fileInput.files.length === 0) {
            callbackSucesso(null);
            return;
        }

        const file = fileInput.files[0];
        const fileName = `inov_${Date.now()}_${file.name.replace(/\\s+/g, '_')}`;

        const textoOriginal = btnObj.textContent;
        btnObj.textContent = 'Enviando...';
        btnObj.disabled = true;

        const { data, error } = await supabase.storage.from('inovacao_pdfs').upload(fileName, file);
        if (error) {
            alert("Erro no upload do PDF: " + error.message);
            btnObj.textContent = textoOriginal;
            btnObj.disabled = false;
            return;
        }

        const { data: publicData } = supabase.storage.from('inovacao_pdfs').getPublicUrl(fileName);
        if(publicData) {
            callbackSucesso(publicData.publicUrl);
            fileInput.value = '';
        }
        btnObj.textContent = textoOriginal;
        btnObj.disabled = false;
    }

    document.getElementById('btnAddSecao').addEventListener('click', () => {
        const titulo = document.getElementById('input-secao-titulo').value.trim();
        const desc = document.getElementById('input-secao-desc').value.trim();
        const contato = document.getElementById('input-secao-contato').value.trim();
        const btn = document.getElementById('btnAddSecao');
        
        if(!titulo || !desc) {
            alert("Por favor, preencha pelo menos o Título e a Descrição da seção.");
            return;
        }

        uploadPdf('input-secao-pdf', btn, (url) => {
            dadosInovacao.secoes.push({
                titulo: titulo,
                desc: desc,
                contato: contato,
                url: url
            });
            
            document.getElementById('input-secao-titulo').value = '';
            document.getElementById('input-secao-desc').value = '';
            document.getElementById('input-secao-contato').value = '';
            
            renderizarListaSecoesAdmin();
        });
    });

    formAdminEdit.addEventListener('submit', async (e) => {
        e.preventDefault();

        dadosInovacao.coordNome = document.getElementById('input-coord-nome').value;
        dadosInovacao.coordEmail = document.getElementById('input-coord-email').value;
        dadosInovacao.coordTelefone = document.getElementById('input-coord-telefone').value;
        dadosInovacao.siecNome = document.getElementById('input-siec-nome').value;
        dadosInovacao.siecEmail = document.getElementById('input-siec-email').value;
        dadosInovacao.siecTelefone = document.getElementById('input-siec-telefone').value;

        const { error } = await supabase
            .from('page_content')
            .upsert({ page: 'inovacao', content: dadosInovacao });

        if (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar alterações no banco de dados.");
            return;
        }

        renderizarPublico();

        adminFormSection.style.display = 'none';
        conteudoMain.style.display = 'block';
        adminBanner.style.display = 'block';
        if (rodape) rodape.style.display = '';
        alert("Página atualizada com sucesso!");
    });
});
