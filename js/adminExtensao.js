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
    
    const viewProgramasContainer = document.getElementById('view-programas-container');
    
    const viewEstagioIntro = document.getElementById('view-estagio-intro');
    const viewEstagioAtribuicoes = document.getElementById('view-estagio-atribuicoes');
    
    const viewBolsasIntro = document.getElementById('view-bolsas-intro');
    const viewBolsasContainer = document.getElementById('view-bolsas-container');

    let dadosExtensao = {
        coordNome: "Pedro José da Silva Júnior",
        coordEmail: "extensao@belojardim.ifpe.edu.br",
        coordTelefone: "(81) 3411 3204",
        siecNome: "Flávia Moreira Correia",
        siecEmail: "siec@belojardim.ifpe.edu.br",
        siecTelefone: "(81) 3411 3222",
        estagioIntro: "O SIEC - Setor de Integração Escola Comunidade - tem a função de viabilizar o intercâmbio entre a escola, comunidade e as instituições públicas e privadas...",
        bolsasIntro: "O Programa Institucional para Concessão de Bolsas de Extensão (Pibex) tem como objetivo implementar, fortalecer e apoiar programas e projetos de extensão...",
        programas: [
            { titulo: "Programa Mulheres Mil", desc: "O Programa possibilita, através da formação profissional e tecnológica, a inclusão social de mulheres que se encontram em situação de vulnerabilidade social...", url: null },
            { titulo: "Programa Nacional de Acesso ao Ensino Técnico e Emprego - PRONATEC", desc: "O Programa Nacional de Acesso ao Ensino Técnico e Emprego – Pronatec – foi criado pelo Governo Federal em 2011, com o objetivo de ampliar a oferta de cursos de educação profissional...", url: null }
        ],
        estagioAtribuicoes: [
            "Contatar com o Setor de Integração Escola Comunidade (SIEC) para receber as informações do Estágio;",
            "Requerer documentação necessária para iniciar o estágio;",
            "Firmar Termo de Compromisso de Estágio com a empresa e respeitar o cumprimento de suas cláusulas;",
            "Acatar as normas do IFPE e da Empresa na realização do estágio;",
            "Elaborar Relatório sobre o estágio obedecendo as normas da ABNT."
        ],
        bolsas: [
            { titulo: "PIBEX 2018", desc: "", url: null }
        ]
    };

    async function carregarConteudo() {
        const { data, error } = await supabase
            .from('page_content')
            .select('content')
            .eq('page', 'extensao')
            .single();

        if (data && data.content) {
            dadosExtensao = { ...dadosExtensao, ...data.content };
        }
        renderizarPublico();
    }

    function renderizarPublico() {
        viewCoordNome.textContent = dadosExtensao.coordNome;
        viewCoordEmail.textContent = dadosExtensao.coordEmail;
        viewCoordTelefone.textContent = dadosExtensao.coordTelefone;
        viewSiecNome.textContent = dadosExtensao.siecNome;
        viewSiecEmail.textContent = dadosExtensao.siecEmail;
        viewSiecTelefone.textContent = dadosExtensao.siecTelefone;
        
        viewProgramasContainer.innerHTML = '';
        if (dadosExtensao.programas.length === 0) {
            viewProgramasContainer.innerHTML = '<p style="color:#666; font-style:italic;">Nenhum programa cadastrado.</p>';
        } else {
            dadosExtensao.programas.forEach(p => {
                let html = `<h5 class="subtitulo">${p.titulo}</h5><p>${p.desc}</p>`;
                if (p.url) {
                    html += `<p><a href="${p.url}" download target="_blank" class="link-destaque"><img src="assets/icones/icone_pdf.png" alt="PDF" style="vertical-align:middle; width:20px; margin-right:5px;">Acessar Documento</a></p>`;
                }
                viewProgramasContainer.innerHTML += html;
            });
        }

        viewEstagioIntro.innerHTML = dadosExtensao.estagioIntro.replace(/\n/g, '<br>');
        viewEstagioAtribuicoes.innerHTML = '';
        if(dadosExtensao.estagioAtribuicoes.length === 0) {
            viewEstagioAtribuicoes.innerHTML = '<li>Nenhuma atribuição cadastrada.</li>';
        } else {
            dadosExtensao.estagioAtribuicoes.forEach(t => {
                viewEstagioAtribuicoes.innerHTML += `<li>${t}</li>`;
            });
        }

        viewBolsasIntro.innerHTML = dadosExtensao.bolsasIntro.replace(/\n/g, '<br>');
        viewBolsasContainer.innerHTML = '';
        if (dadosExtensao.bolsas.length === 0) {
            viewBolsasContainer.innerHTML = '<p style="color:#666; font-style:italic;">Nenhum edital cadastrado.</p>';
        } else {
            dadosExtensao.bolsas.forEach(b => {
                let html = `<h5 class="subtitulo">${b.titulo}</h5>`;
                if(b.desc) html += `<p>${b.desc}</p>`;
                if(b.url) html += `<p><a href="${b.url}" download target="_blank" class="link-destaque"><img src="assets/icones/icone_pdf.png" alt="PDF" style="vertical-align:middle; width:20px; margin-right:5px;">Acessar Edital/Documento</a></p>`;
                viewBolsasContainer.innerHTML += html;
            });
        }
    }

    await carregarConteudo();

    const { data: { session } } = await supabase.auth.getSession();
    if (session) adminBanner.style.display = 'block';

    btnEditarPagina.addEventListener('click', () => {
        document.getElementById('input-coord-nome').value = dadosExtensao.coordNome || '';
        document.getElementById('input-coord-email').value = dadosExtensao.coordEmail || '';
        document.getElementById('input-coord-telefone').value = dadosExtensao.coordTelefone || '';
        document.getElementById('input-siec-nome').value = dadosExtensao.siecNome || '';
        document.getElementById('input-siec-email').value = dadosExtensao.siecEmail || '';
        document.getElementById('input-siec-telefone').value = dadosExtensao.siecTelefone || '';
        
        document.getElementById('input-estagio-intro').value = dadosExtensao.estagioIntro || '';
        document.getElementById('input-bolsas-intro').value = dadosExtensao.bolsasIntro || '';

        renderizarListasAdmin();

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

    function renderListaAdminBasica(containerId, lista, fnHtml, onClickRemover) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        if(lista.length === 0) {
            container.innerHTML = '<li><small style="color:#666;">Nenhum item adicionado.</small></li>';
            return;
        }
        lista.forEach((item, index) => {
            const li = document.createElement('li');
            li.style.marginBottom = '8px';
            li.innerHTML = fnHtml(item) + ` <button type="button" data-index="${index}" class="btn-remover-item" style="background-color: #c0392b; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px; margin-left:10px;">Remover</button>`;
            container.appendChild(li);
        });
        container.querySelectorAll('.btn-remover-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                onClickRemover(idx);
                renderizarListasAdmin();
            });
        });
    }

    function renderizarListasAdmin() {
        renderListaAdminBasica('admin-lista-programas', dadosExtensao.programas, 
            p => `<strong>${p.titulo}</strong> ${p.url ? '(C/ PDF)' : ''}`, 
            idx => dadosExtensao.programas.splice(idx, 1)
        );
        renderListaAdminBasica('admin-lista-atribuicoes', dadosExtensao.estagioAtribuicoes, 
            a => `<span>${a}</span>`, 
            idx => dadosExtensao.estagioAtribuicoes.splice(idx, 1)
        );
        renderListaAdminBasica('admin-lista-bolsas', dadosExtensao.bolsas, 
            b => `<strong>${b.titulo}</strong> ${b.url ? '(C/ PDF)' : ''}`, 
            idx => dadosExtensao.bolsas.splice(idx, 1)
        );
    }

    async function uploadPdf(fileInputId, btnOriginalText, btnObj, callbackSucesso) {
        const fileInput = document.getElementById(fileInputId);
        if (!fileInput.files || fileInput.files.length === 0) {
            callbackSucesso(null);
            return;
        }

        const file = fileInput.files[0];
        const fileName = `ext_${Date.now()}_${file.name.replace(/\\s+/g, '_')}`;

        btnObj.textContent = 'Enviando...';
        btnObj.disabled = true;

        const { data, error } = await supabase.storage.from('extensao_pdfs').upload(fileName, file);
        if (error) {
            alert("Erro no upload: " + error.message);
            btnObj.textContent = btnOriginalText;
            btnObj.disabled = false;
            return;
        }

        const { data: pData } = supabase.storage.from('extensao_pdfs').getPublicUrl(fileName);
        if(pData) {
            callbackSucesso(pData.publicUrl);
            fileInput.value = '';
        }
        btnObj.textContent = btnOriginalText;
        btnObj.disabled = false;
    }

    document.getElementById('btnAddAtribuicao').addEventListener('click', () => {
        const val = document.getElementById('input-estagio-atribuicao').value.trim();
        if(val) { dadosExtensao.estagioAtribuicoes.push(val); document.getElementById('input-estagio-atribuicao').value = ''; renderizarListasAdmin(); }
    });

    document.getElementById('btnAddPrograma').addEventListener('click', () => {
        const titulo = document.getElementById('input-programa-titulo').value.trim();
        const desc = document.getElementById('input-programa-desc').value.trim();
        const btn = document.getElementById('btnAddPrograma');
        if(!titulo || !desc) { alert("Informe título e descrição."); return; }
        
        uploadPdf('input-programa-pdf', 'Adicionar Programa', btn, (url) => {
            dadosExtensao.programas.push({titulo, desc, url});
            document.getElementById('input-programa-titulo').value = '';
            document.getElementById('input-programa-desc').value = '';
            renderizarListasAdmin();
        });
    });

    document.getElementById('btnAddBolsa').addEventListener('click', () => {
        const titulo = document.getElementById('input-bolsa-titulo').value.trim();
        const desc = document.getElementById('input-bolsa-desc').value.trim();
        const btn = document.getElementById('btnAddBolsa');
        if(!titulo) { alert("Informe pelo menos o título do edital."); return; }
        
        uploadPdf('input-bolsa-pdf', 'Adicionar Edital de Bolsa', btn, (url) => {
            dadosExtensao.bolsas.push({titulo, desc, url});
            document.getElementById('input-bolsa-titulo').value = '';
            document.getElementById('input-bolsa-desc').value = '';
            renderizarListasAdmin();
        });
    });

    formAdminEdit.addEventListener('submit', async (e) => {
        e.preventDefault();

        dadosExtensao.coordNome = document.getElementById('input-coord-nome').value;
        dadosExtensao.coordEmail = document.getElementById('input-coord-email').value;
        dadosExtensao.coordTelefone = document.getElementById('input-coord-telefone').value;
        dadosExtensao.siecNome = document.getElementById('input-siec-nome').value;
        dadosExtensao.siecEmail = document.getElementById('input-siec-email').value;
        dadosExtensao.siecTelefone = document.getElementById('input-siec-telefone').value;
        dadosExtensao.estagioIntro = document.getElementById('input-estagio-intro').value;
        dadosExtensao.bolsasIntro = document.getElementById('input-bolsas-intro').value;

        const { error } = await supabase
            .from('page_content')
            .upsert({ page: 'extensao', content: dadosExtensao });

        if (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar alterações no banco.");
            return;
        }

        renderizarPublico();

        adminFormSection.style.display = 'none';
        conteudoMain.style.display = 'block';
        adminBanner.style.display = 'block';
        if (rodape) rodape.style.display = '';
        alert("Página salva com sucesso!");
    });
});
