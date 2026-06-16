import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const btnEditarPagina = document.getElementById('btnEditarPagina');
    const adminBanner = document.getElementById('adminBanner');
    const adminFormSection = document.getElementById('adminFormSection');
    const conteudoMain = document.getElementById('conteudo');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    const formAdminEdit = document.getElementById('formAdminEdit');
    const rodape = document.getElementById('rodape') || document.querySelector('footer');

    const viewMonitoriaIntro = document.getElementById('view-monitoria-intro');
    const viewMonitoriasTbody = document.getElementById('view-monitorias-tbody');
    const viewMonitoriaRodape = document.getElementById('view-monitoria-rodape');

    const inputMonStatus = document.getElementById('input-mon-status');
    const containerMonPdf = document.getElementById('container-mon-pdf');

    let dadosMonitoria = {
        intro: "Nesta seção, você encontrará uma tabela contendo informações essenciais sobre as monitorias.",
        rodape: "Caso uma monitoria esteja aberta à inscrição e não possua edital disponível, por favor, procure informações na secretaria do bloco de engenharia.",
        monitorias: [
            { disciplina: "Projeto de Software", periodo: "4º Período", professor: "Guilherme", tipo: "Bolsista", duracao: "6 meses", status: "Ativa", aluno: "David Almeida", pdfUrl: null },
            { disciplina: "SO - Sistemas Operacionais", periodo: "3º Período", professor: "João Almeida", tipo: "Bolsista", duracao: "24 meses", status: "Ativa", aluno: "Luiz Carlos", pdfUrl: null },
            { disciplina: "Estatística e Probabilidade", periodo: "3º Período", professor: "Priscila", tipo: "Voluntária", duracao: "6 meses", status: "Ativa", aluno: "João Bosco", pdfUrl: null },
            { disciplina: "Matemática Discreta", periodo: "1º período", professor: "Sidmar", tipo: "Bolsista", duracao: "6 meses", status: "Ativa", aluno: "Netinho", pdfUrl: null },
            { disciplina: "IHC", periodo: "4º Período", professor: "Sionise", tipo: "Bolsista", duracao: "6 meses", status: "Ativa", aluno: "Mariana", pdfUrl: null }
        ]
    };

    async function carregarConteudo() {
        const { data, error } = await supabase
            .from('page_content')
            .select('content')
            .eq('page', 'monitoria')
            .single();

        if (data && data.content) {
            dadosMonitoria = { ...dadosMonitoria, ...data.content };
        }
        renderizarPublico();
    }

    function renderizarPublico() {
        viewMonitoriaIntro.innerHTML = `<p>${dadosMonitoria.intro.replace(/\\n/g, '<br>')}</p>`;
        viewMonitoriaRodape.innerHTML = dadosMonitoria.rodape ? `<p>${dadosMonitoria.rodape.replace(/\\n/g, '<br>')}</p>` : '';

        viewMonitoriasTbody.innerHTML = '';
        if (dadosMonitoria.monitorias.length === 0) {
            viewMonitoriasTbody.innerHTML = '<tr><td colspan="7">Nenhuma monitoria cadastrada.</td></tr>';
            return;
        }

        dadosMonitoria.monitorias.forEach(m => {
            let discHtml = m.disciplina;
            
            if (m.status === 'Aberto à inscrição' && m.pdfUrl) {
                discHtml = `<a href="${m.pdfUrl}" download target="_blank" class="link-destaque"><img src="assets/icones/icone_pdf.png" alt="PDF" style="vertical-align:middle; width:20px; margin-right:5px;">${m.disciplina}</a>`;
            }

            viewMonitoriasTbody.innerHTML += `
                <tr>
                    <td>${discHtml}</td>
                    <td>${m.periodo}</td>
                    <td>${m.professor}</td>
                    <td>${m.tipo}</td>
                    <td>${m.duracao}</td>
                    <td style="${m.status === 'Aberto à inscrição' ? 'color:#2ecc71; font-weight:bold;' : ''}">${m.status}</td>
                    <td>${m.aluno || '-'}</td>
                </tr>
            `;
        });
    }

    await carregarConteudo();

    const { data: { session } } = await supabase.auth.getSession();
    if (session) adminBanner.style.display = 'block';

    btnEditarPagina.addEventListener('click', () => {
        document.getElementById('input-monitoria-intro').value = dadosMonitoria.intro || '';
        document.getElementById('input-monitoria-rodape').value = dadosMonitoria.rodape || '';
        
        renderizarListaAdmin();

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

    inputMonStatus.addEventListener('change', (e) => {
        if(e.target.value === 'Aberto à inscrição') {
            containerMonPdf.style.display = 'block';
        } else {
            containerMonPdf.style.display = 'none';
            document.getElementById('input-mon-pdf').value = '';
        }
    });

    function renderizarListaAdmin() {
        const tbodyAdmin = document.getElementById('admin-lista-monitorias');
        tbodyAdmin.innerHTML = '';
        if(dadosMonitoria.monitorias.length === 0) {
            tbodyAdmin.innerHTML = '<tr><td colspan="5">Nenhuma cadastrada.</td></tr>';
            return;
        }

        dadosMonitoria.monitorias.forEach((m, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${m.disciplina} ${m.pdfUrl ? '<small style="color:blue;">(C/ PDF)</small>' : ''}</td>
                <td>${m.periodo}</td>
                <td>${m.status}</td>
                <td>${m.aluno || '-'}</td>
                <td>
                    <button type="button" data-index="${index}" class="btn-remover-mon" style="background-color: #c0392b; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px;">Remover</button>
                </td>
            `;
            tbodyAdmin.appendChild(row);
        });

        tbodyAdmin.querySelectorAll('.btn-remover-mon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                dadosMonitoria.monitorias.splice(idx, 1);
                renderizarListaAdmin();
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
        const fileName = `mon_${Date.now()}_${file.name.replace(/\\s+/g, '_')}`;

        const textoOriginal = btnObj.textContent;
        btnObj.textContent = 'Enviando...';
        btnObj.disabled = true;

        const { data, error } = await supabase.storage.from('monitoria_pdfs').upload(fileName, file);
        if (error) {
            alert("Erro no upload do PDF: " + error.message);
            btnObj.textContent = textoOriginal;
            btnObj.disabled = false;
            return;
        }

        const { data: publicData } = supabase.storage.from('monitoria_pdfs').getPublicUrl(fileName);
        if(publicData) {
            callbackSucesso(publicData.publicUrl);
            fileInput.value = '';
        }
        btnObj.textContent = textoOriginal;
        btnObj.disabled = false;
    }

    document.getElementById('btnAddMonitoria').addEventListener('click', () => {
        const disciplina = document.getElementById('input-mon-disc').value.trim();
        const periodo = document.getElementById('input-mon-periodo').value.trim();
        const professor = document.getElementById('input-mon-prof').value.trim();
        const tipo = document.getElementById('input-mon-tipo').value;
        const duracao = document.getElementById('input-mon-duracao').value.trim();
        const status = document.getElementById('input-mon-status').value;
        const aluno = document.getElementById('input-mon-aluno').value.trim();
        const btn = document.getElementById('btnAddMonitoria');
        
        if(!disciplina || !periodo || !professor || !duracao) {
            alert("Por favor, preencha disciplina, período, professor e duração.");
            return;
        }

        if(status === 'Aberto à inscrição') {
            uploadPdf('input-mon-pdf', btn, (url) => {
                adicionarAoArray(url);
            });
        } else {
            adicionarAoArray(null);
        }

        function adicionarAoArray(pdfUrl) {
            dadosMonitoria.monitorias.push({
                disciplina, periodo, professor, tipo, duracao, status, aluno, pdfUrl
            });
            
            document.getElementById('input-mon-disc').value = '';
            document.getElementById('input-mon-periodo').value = '';
            document.getElementById('input-mon-prof').value = '';
            document.getElementById('input-mon-duracao').value = '';
            document.getElementById('input-mon-aluno').value = '';
            document.getElementById('input-mon-pdf').value = '';
            
            renderizarListaAdmin();
        }
    });

    formAdminEdit.addEventListener('submit', async (e) => {
        e.preventDefault();

        dadosMonitoria.intro = document.getElementById('input-monitoria-intro').value;
        dadosMonitoria.rodape = document.getElementById('input-monitoria-rodape').value;

        const { error } = await supabase
            .from('page_content')
            .upsert({ page: 'monitoria', content: dadosMonitoria });

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
        alert("Página salva com sucesso!");
    });
});
