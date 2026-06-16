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
    const viewAssessoriaContainer = document.getElementById('view-assessoria-container');
    
    const viewIniciacaoIntro = document.getElementById('view-iniciacao-intro');
    const viewIniciacaoProgramas = document.getElementById('view-iniciacao-programas');
    const viewIniciacaoDocs = document.getElementById('view-iniciacao-docs');
    
    const viewEditaisAndamento = document.getElementById('view-editais-andamento');
    const viewEditaisEncerrados = document.getElementById('view-editais-encerrados');
    
    const viewIfpesquisandoIntro = document.getElementById('view-ifpesquisando-intro');
    const viewBoletinsGrid = document.getElementById('view-boletins-grid');
    const viewProjetosTbody = document.getElementById('view-projetos-tbody');

    let dadosPesquisa = {
        coordNome: "Luciana Uchôa Barbosa",
        coordEmail: "cpesqpi@belojardim.ifpe.edu.br",
        coordTelefone: "(81) 3411 3239",
        assessores: [],
        iniciacaoIntro: "Os programas de iniciação científica...",
        programas: [],
        docsIniciacao: [],
        editaisAndamento: [],
        editaisEncerrados: [],
        ifpesquisandoIntro: "Trata-se de boletim digital...",
        boletins: [],
        projetos: []
    };

    async function carregarConteudo() {
        const { data, error } = await supabase
            .from('page_content')
            .select('content')
            .eq('page', 'pesquisa')
            .single();

        if (data && data.content) {
            dadosPesquisa = { ...dadosPesquisa, ...data.content };
        }
        renderizarPublico();
    }

    function renderizarPublico() {
        viewCoordNome.textContent = dadosPesquisa.coordNome;
        viewCoordEmail.textContent = dadosPesquisa.coordEmail;
        viewCoordTelefone.textContent = dadosPesquisa.coordTelefone;
        
        viewAssessoriaContainer.innerHTML = '';
        if (dadosPesquisa.assessores.length === 0) {
            viewAssessoriaContainer.innerHTML = '<p style="color:#666; font-style:italic;">Sem assessores cadastrados.</p>';
        } else {
            dadosPesquisa.assessores.forEach(a => {
                viewAssessoriaContainer.innerHTML += `<p><strong>Responsável:</strong> ${a.nome}</p><p><strong>E-mail:</strong> ${a.email}</p>`;
            });
        }

        viewIniciacaoIntro.innerHTML = dadosPesquisa.iniciacaoIntro.replace(/\n/g, '<br>');
        
        viewIniciacaoProgramas.innerHTML = '';
        if (dadosPesquisa.programas.length === 0) {
            viewIniciacaoProgramas.innerHTML = '<li>Nenhum programa cadastrado.</li>';
        } else {
            dadosPesquisa.programas.forEach(p => {
                viewIniciacaoProgramas.innerHTML += `<li><strong>${p.nome}:</strong> ${p.desc}</li>`;
            });
        }

        viewIniciacaoDocs.innerHTML = '';
        if (dadosPesquisa.docsIniciacao.length === 0) {
            viewIniciacaoDocs.innerHTML = '<p>Nenhum documento.</p>';
        } else {
            dadosPesquisa.docsIniciacao.forEach(d => {
                viewIniciacaoDocs.innerHTML += `<p><a href="${d.url}" download target="_blank" class="link-destaque"><img src="assets/icones/icone_pdf.png" alt="PDF" style="vertical-align:middle; width:20px; margin-right:5px;">${d.titulo}</a></p>`;
            });
        }

        const renderLinks = (container, lista) => {
            container.innerHTML = '';
            if (lista.length === 0) {
                container.innerHTML = '<li>Nenhum edital cadastrado.</li>';
            } else {
                lista.forEach(item => {
                    container.innerHTML += `<li><a href="${item.url}" download target="_blank"><img src="assets/icones/icone_pdf.png" alt="PDF" style="vertical-align:middle; width:20px; margin-right:5px;">${item.titulo}</a></li>`;
                });
            }
        };
        renderLinks(viewEditaisAndamento, dadosPesquisa.editaisAndamento);
        renderLinks(viewEditaisEncerrados, dadosPesquisa.editaisEncerrados);

        viewIfpesquisandoIntro.innerHTML = dadosPesquisa.ifpesquisandoIntro.replace(/\n/g, '<br>');
        viewBoletinsGrid.innerHTML = '';
        
        if (dadosPesquisa.boletins.length === 0) {
            viewBoletinsGrid.innerHTML = '<p>Nenhum boletim cadastrado.</p>';
        } else {
            const grupos = {};
            dadosPesquisa.boletins.forEach(b => {
                if (!grupos[b.ano]) grupos[b.ano] = [];
                grupos[b.ano].push(b);
            });
            Object.keys(grupos).forEach(ano => {
                const col = document.createElement('div');
                col.className = 'ano-col';
                let html = `<strong>${ano}</strong>`;
                grupos[ano].forEach(b => {
                    html += `<a href="${b.url}" download target="_blank">${b.titulo}</a>`;
                });
                col.innerHTML = html;
                viewBoletinsGrid.appendChild(col);
            });
        }

        viewProjetosTbody.innerHTML = '';
        if (dadosPesquisa.projetos.length === 0) {
            viewProjetosTbody.innerHTML = '<tr><td colspan="3">Nenhum projeto cadastrado.</td></tr>';
        } else {
            dadosPesquisa.projetos.forEach(p => {
                viewProjetosTbody.innerHTML += `<tr><td>${p.nome}</td><td>${p.coord}</td><td>${p.status}</td></tr>`;
            });
        }
    }

    await carregarConteudo();

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        adminBanner.style.display = 'block';
    }

    btnEditarPagina.addEventListener('click', () => {
        document.getElementById('input-coord-nome').value = dadosPesquisa.coordNome || '';
        document.getElementById('input-coord-email').value = dadosPesquisa.coordEmail || '';
        document.getElementById('input-coord-telefone').value = dadosPesquisa.coordTelefone || '';
        document.getElementById('input-iniciacao-intro').value = dadosPesquisa.iniciacaoIntro || '';
        document.getElementById('input-ifpesquisando-intro').value = dadosPesquisa.ifpesquisandoIntro || '';

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
        renderListaAdminBasica('admin-lista-assessoria', dadosPesquisa.assessores, 
            a => `<strong>${a.nome}</strong> (${a.email})`, 
            idx => dadosPesquisa.assessores.splice(idx, 1)
        );
        renderListaAdminBasica('admin-lista-programas', dadosPesquisa.programas, 
            p => `<strong>${p.nome}:</strong> ${p.desc}`, 
            idx => dadosPesquisa.programas.splice(idx, 1)
        );
        renderListaAdminBasica('admin-lista-docs-iniciacao', dadosPesquisa.docsIniciacao, 
            d => `📄 <a href="${d.url}" target="_blank">${d.titulo}</a>`, 
            idx => dadosPesquisa.docsIniciacao.splice(idx, 1)
        );
        renderListaAdminBasica('admin-lista-editais-andamento', dadosPesquisa.editaisAndamento, 
            d => `📄 <a href="${d.url}" target="_blank">${d.titulo}</a>`, 
            idx => dadosPesquisa.editaisAndamento.splice(idx, 1)
        );
        renderListaAdminBasica('admin-lista-editais-encerrados', dadosPesquisa.editaisEncerrados, 
            d => `📄 <a href="${d.url}" target="_blank">${d.titulo}</a>`, 
            idx => dadosPesquisa.editaisEncerrados.splice(idx, 1)
        );
        renderListaAdminBasica('admin-lista-boletins', dadosPesquisa.boletins, 
            b => `<strong>${b.ano}</strong> - 📄 <a href="${b.url}" target="_blank">${b.titulo}</a>`, 
            idx => dadosPesquisa.boletins.splice(idx, 1)
        );

        const tbodyProj = document.getElementById('admin-lista-projetos');
        tbodyProj.innerHTML = '';
        dadosPesquisa.projetos.forEach((p, index) => {
            tbodyProj.innerHTML += `<tr>
                <td>${p.nome}</td><td>${p.coord}</td><td>${p.status}</td>
                <td><button type="button" data-index="${index}" class="btn-remover-proj" style="background-color: #c0392b; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px;">Remover</button></td>
            </tr>`;
        });
        tbodyProj.querySelectorAll('.btn-remover-proj').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                dadosPesquisa.projetos.splice(idx, 1);
                renderizarListasAdmin();
            });
        });
    }

    document.getElementById('btnAddAssessor').addEventListener('click', () => {
        const nome = document.getElementById('input-assessor-nome').value.trim();
        const email = document.getElementById('input-assessor-email').value.trim();
        if(nome) { dadosPesquisa.assessores.push({nome, email}); renderizarListasAdmin(); document.getElementById('input-assessor-nome').value=''; document.getElementById('input-assessor-email').value=''; }
    });

    document.getElementById('btnAddPrograma').addEventListener('click', () => {
        const nome = document.getElementById('input-programa-nome').value.trim();
        const desc = document.getElementById('input-programa-desc').value.trim();
        if(nome) { dadosPesquisa.programas.push({nome, desc}); renderizarListasAdmin(); document.getElementById('input-programa-nome').value=''; document.getElementById('input-programa-desc').value=''; }
    });

    document.getElementById('btnAddProjeto').addEventListener('click', () => {
        const nome = document.getElementById('input-projeto-nome').value.trim();
        const coord = document.getElementById('input-projeto-coord').value.trim();
        const status = document.getElementById('input-projeto-status').value.trim();
        if(nome) { dadosPesquisa.projetos.push({nome, coord, status}); renderizarListasAdmin(); document.getElementById('input-projeto-nome').value=''; document.getElementById('input-projeto-coord').value=''; }
    });

    async function uploadPdf(fileInputId, btnId, callbackSucesso) {
        const fileInput = document.getElementById(fileInputId);
        const btn = document.getElementById(btnId);
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Por favor, selecione um arquivo PDF.');
            return;
        }

        const file = fileInput.files[0];
        const fileName = `pesq_${Date.now()}_${file.name.replace(/\\s+/g, '_')}`;

        const textoOriginal = btn.textContent;
        btn.textContent = 'Enviando...';
        btn.disabled = true;

        const { data, error } = await supabase.storage.from('pesquisa_pdfs').upload(fileName, file);
        if (error) {
            alert("Erro no upload do PDF: " + error.message);
            btn.textContent = textoOriginal;
            btn.disabled = false;
            return;
        }

        const { data: publicData } = supabase.storage.from('pesquisa_pdfs').getPublicUrl(fileName);
        if(publicData) {
            callbackSucesso(publicData.publicUrl);
            fileInput.value = '';
            renderizarListasAdmin();
        }
        btn.textContent = textoOriginal;
        btn.disabled = false;
    }

    document.getElementById('btnAddDocIniciacao').addEventListener('click', () => {
        const titulo = document.getElementById('input-doc-iniciacao-titulo').value.trim();
        if(!titulo) { alert("Informe o título do documento."); return; }
        uploadPdf('input-doc-iniciacao-pdf', 'btnAddDocIniciacao', (url) => {
            dadosPesquisa.docsIniciacao.push({titulo, url});
            document.getElementById('input-doc-iniciacao-titulo').value='';
        });
    });

    document.getElementById('btnAddEdital').addEventListener('click', () => {
        const titulo = document.getElementById('input-edital-titulo').value.trim();
        const status = document.getElementById('input-edital-status').value;
        if(!titulo) { alert("Informe o título do edital."); return; }
        uploadPdf('input-edital-pdf', 'btnAddEdital', (url) => {
            if(status === 'andamento') dadosPesquisa.editaisAndamento.push({titulo, url});
            else dadosPesquisa.editaisEncerrados.push({titulo, url});
            document.getElementById('input-edital-titulo').value='';
        });
    });

    document.getElementById('btnAddBoletim').addEventListener('click', () => {
        const ano = document.getElementById('input-boletim-ano').value.trim();
        const titulo = document.getElementById('input-boletim-titulo').value.trim();
        if(!ano || !titulo) { alert("Informe o Ano e o Título da edição."); return; }
        uploadPdf('input-boletim-pdf', 'btnAddBoletim', (url) => {
            dadosPesquisa.boletins.push({ano, titulo, url});
            document.getElementById('input-boletim-titulo').value='';
        });
    });

    formAdminEdit.addEventListener('submit', async (e) => {
        e.preventDefault();

        dadosPesquisa.coordNome = document.getElementById('input-coord-nome').value;
        dadosPesquisa.coordEmail = document.getElementById('input-coord-email').value;
        dadosPesquisa.coordTelefone = document.getElementById('input-coord-telefone').value;
        dadosPesquisa.iniciacaoIntro = document.getElementById('input-iniciacao-intro').value;
        dadosPesquisa.ifpesquisandoIntro = document.getElementById('input-ifpesquisando-intro').value;

        const { error } = await supabase
            .from('page_content')
            .upsert({ page: 'pesquisa', content: dadosPesquisa });

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
