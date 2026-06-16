import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const gridAulas = document.getElementById('gridAulas');
    const gridLaboratorios = document.getElementById('gridLaboratorios');
    
    const adminBanner = document.getElementById('adminBanner');
    const btnEditarPagina = document.getElementById('btnEditarPagina');
    const adminFormSection = document.getElementById('adminFormSection');
    const conteudoMain = document.getElementById('conteudo');
    
    const selectHorario = document.getElementById('selectHorario');
    const formAdminEdit = document.getElementById('formAdminEdit');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    const btnRemoverHorario = document.getElementById('btnRemoverHorario');
    const rodape = document.getElementById('rodape') || document.querySelector('footer');

    // Inputs
    const inTipo = document.getElementById('input-tipo');
    const inIdentificacao = document.getElementById('input-identificacao');
    const labelIdentificacao = document.getElementById('label-identificacao');
    const inQtd = document.getElementById('input-qtd');
    const containerQtd = document.getElementById('container-qtd');
    const inPdf = document.getElementById('input-pdf');

    let listaTurmas = [];
    let listaLaboratorios = [];

    // 1. Carregar e Renderizar Horários
    async function carregarHorarios() {
        const [turmasRes, labsRes] = await Promise.all([
            supabase.from('horarios_turmas').select('*').order('periodo', { ascending: true }),
            supabase.from('horarios_laboratorios').select('*').order('nome', { ascending: true })
        ]);

        if (turmasRes.error) console.error("Erro ao carregar turmas:", turmasRes.error);
        if (labsRes.error) console.error("Erro ao carregar laboratorios:", labsRes.error);

        listaTurmas = turmasRes.data || [];
        listaLaboratorios = labsRes.data || [];
        
        renderizarGrids();
        atualizarDropdown();
    }

    function renderizarGrids() {
        // Grid Aulas
        gridAulas.innerHTML = ''; 
        if (listaTurmas.length === 0) {
            gridAulas.innerHTML = '<p style="text-align: center; width: 100%;">Nenhuma aula cadastrada.</p>';
        } else {
            listaTurmas.forEach(turma => {
                const item = document.createElement('div');
                item.className = 'horario-item';
                
                // Exemplo: se periodo for "1º Período", separa "1º" e "Período"
                const partes = turma.periodo.split(' ');
                const badgeStr = partes.shift() || '-';
                const nomeStr = partes.join(' ') || 'Turma';

                item.innerHTML = `
                    <span class="badge">${badgeStr}</span>
                    <span class="nome">${nomeStr}</span>
                    <span class="qtd">${turma.qtd_alunos || 0}</span>
                    <a href="${turma.pdf_url || '#'}" download target="_blank" class="pdf-card">
                        <img src="assets/icones/icone_pdf.png" alt="PDF">
                        <div>
                            <strong>Horário</strong>
                            <small>Baixar PDF</small>
                        </div>
                    </a>
                `;
                gridAulas.appendChild(item);
            });
        }

        // Grid Laboratórios
        gridLaboratorios.innerHTML = '';
        if (listaLaboratorios.length === 0) {
            gridLaboratorios.innerHTML = '<p style="text-align: center; width: 100%;">Nenhum laboratório cadastrado.</p>';
        } else {
            listaLaboratorios.forEach(lab => {
                const item = document.createElement('div');
                item.className = 'horario-item';
                
                // Exemplo: se nome for "Laboratório 3", tenta pegar o numero para o badge
                const match = lab.nome.match(/(\d+)/);
                const badgeStr = match ? match[1] : 'L';

                item.innerHTML = `
                    <span class="badge">${badgeStr}</span>
                    <span class="nome">${lab.nome}</span>
                    <a href="${lab.pdf_url || '#'}" download target="_blank" class="pdf-card">
                        <img src="assets/icones/icone_pdf.png" alt="PDF">
                        <div>
                            <strong>Horário</strong>
                            <small>Baixar PDF</small>
                        </div>
                    </a>
                `;
                gridLaboratorios.appendChild(item);
            });
        }
    }

    function atualizarDropdown() {
        selectHorario.innerHTML = '<option value="novo">-- Adicionar Novo Horário --</option>';
        
        if(listaTurmas.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = 'Aulas (Turmas)';
            listaTurmas.forEach(turma => {
                const option = document.createElement('option');
                option.value = `turma_${turma.id}`;
                option.textContent = turma.periodo;
                optgroup.appendChild(option);
            });
            selectHorario.appendChild(optgroup);
        }

        if(listaLaboratorios.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = 'Laboratórios';
            listaLaboratorios.forEach(lab => {
                const option = document.createElement('option');
                option.value = `lab_${lab.id}`;
                option.textContent = lab.nome;
                optgroup.appendChild(option);
            });
            selectHorario.appendChild(optgroup);
        }
    }

    // Inicialização
    await carregarHorarios();

    // 2. Verificar Admin
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        adminBanner.style.display = 'block';
    }

    // Lógica para alternar formulário dependendo do Tipo (Turma vs Laboratorio)
    inTipo.addEventListener('change', () => {
        if (inTipo.value === 'Turma') {
            labelIdentificacao.textContent = 'Período (ex: 1º Período):';
            containerQtd.style.display = 'block';
        } else {
            labelIdentificacao.textContent = 'Nome do Laboratório (ex: Laboratório 3):';
            containerQtd.style.display = 'none';
        }
    });

    // 3. Interações do Formulário Administrativo
    btnEditarPagina.addEventListener('click', () => {
        conteudoMain.style.display = 'none';
        adminBanner.style.display = 'none';
        if (rodape) rodape.style.display = 'none';
        adminFormSection.style.display = 'block';
        limparFormulario();
    });

    btnCancelarEdicao.addEventListener('click', () => {
        adminFormSection.style.display = 'none';
        conteudoMain.style.display = 'block';
        adminBanner.style.display = 'block';
        if (rodape) rodape.style.display = '';
    });

    selectHorario.addEventListener('change', () => {
        const selecionado = selectHorario.value;
        if (selecionado === 'novo') {
            limparFormulario();
            btnRemoverHorario.style.display = 'none';
            inTipo.disabled = false;
        } else {
            const [tipoRef, idStr] = selecionado.split('_');
            const id = parseInt(idStr);

            if (tipoRef === 'turma') {
                const turma = listaTurmas.find(t => t.id === id);
                inTipo.value = 'Turma';
                inIdentificacao.value = turma.periodo || '';
                inQtd.value = turma.qtd_alunos || '';
                configurarPreviewPdf(turma.pdf_url);
            } else {
                const lab = listaLaboratorios.find(l => l.id === id);
                inTipo.value = 'Laboratório';
                inIdentificacao.value = lab.nome || '';
                configurarPreviewPdf(lab.pdf_url);
            }
            
            inTipo.dispatchEvent(new Event('change')); // dispara a alteração visual
            inTipo.disabled = true; // não deixa mudar o tipo ao editar
            btnRemoverHorario.style.display = 'inline-block';
        }
    });

    function configurarPreviewPdf(pdfUrl) {
        const textoPdf = document.getElementById('pdf-atual-texto');
        if (pdfUrl) {
            if (textoPdf) textoPdf.innerHTML = `PDF atual: <a href="${pdfUrl}" target="_blank">Ver Arquivo</a>`;
            inPdf.dataset.existingUrl = pdfUrl;
        } else {
            if (textoPdf) textoPdf.innerHTML = 'Nenhum arquivo atual.';
            inPdf.dataset.existingUrl = '';
        }
        inPdf.value = ''; // Sempre limpa a seleção de arquivo do input ao carregar
    }

    function limparFormulario() {
        formAdminEdit.reset();
        selectHorario.value = 'novo';
        configurarPreviewPdf('');
        inTipo.disabled = false;
        inTipo.dispatchEvent(new Event('change'));
        btnRemoverHorario.style.display = 'none';
    }

    // 4. Salvar / Atualizar
    formAdminEdit.addEventListener('submit', async (e) => {
        e.preventDefault();

        let urlPdf = inPdf.dataset.existingUrl || '';

        // Se um novo arquivo foi selecionado
        if (inPdf.files && inPdf.files.length > 0) {
            const file = inPdf.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `horario_${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('horarios_pdfs')
                .upload(fileName, file);

            if (uploadError) {
                console.error("Erro no upload do PDF:", uploadError);
                alert("Erro ao enviar o arquivo PDF. Verifique se o bucket 'horarios_pdfs' público foi criado no Supabase.");
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from('horarios_pdfs')
                .getPublicUrl(fileName);

            if (publicUrlData) {
                urlPdf = publicUrlData.publicUrl;
            }
        }

        const tipoSalvar = inTipo.value;
        const selecionado = selectHorario.value;
        let erroDb = null;

        if (tipoSalvar === 'Turma') {
            const novoHorarioTurma = {
                periodo: inIdentificacao.value,
                qtd_alunos: inQtd.value ? parseInt(inQtd.value) : 0,
                pdf_url: urlPdf
            };

            if (selecionado === 'novo') {
                const { error } = await supabase.from('horarios_turmas').insert([novoHorarioTurma]);
                erroDb = error;
            } else {
                const id = parseInt(selecionado.split('_')[1]);
                const { error } = await supabase.from('horarios_turmas').update(novoHorarioTurma).eq('id', id);
                erroDb = error;
            }
        } else {
            const novoHorarioLab = {
                nome: inIdentificacao.value,
                pdf_url: urlPdf
            };

            if (selecionado === 'novo') {
                const { error } = await supabase.from('horarios_laboratorios').insert([novoHorarioLab]);
                erroDb = error;
            } else {
                const id = parseInt(selecionado.split('_')[1]);
                const { error } = await supabase.from('horarios_laboratorios').update(novoHorarioLab).eq('id', id);
                erroDb = error;
            }
        }

        if (erroDb) {
            console.error("Erro ao salvar:", erroDb);
            alert("Erro ao salvar no banco de dados:\n" + erroDb.message);
            return;
        }

        alert("Horário salvo com sucesso!");
        await carregarHorarios(); // Recarrega listas
        btnCancelarEdicao.click(); // Volta pra tela principal
    });

    // 5. Remover
    btnRemoverHorario.addEventListener('click', async () => {
        const selecionado = selectHorario.value;
        if (selecionado === 'novo') return;

        if (!confirm("Tem certeza que deseja remover este horário?")) {
            return;
        }

        const [tipoRef, idStr] = selecionado.split('_');
        const id = parseInt(idStr);
        let erroDb = null;

        if (tipoRef === 'turma') {
            const { error } = await supabase.from('horarios_turmas').delete().eq('id', id);
            erroDb = error;
        } else {
            const { error } = await supabase.from('horarios_laboratorios').delete().eq('id', id);
            erroDb = error;
        }

        if (erroDb) {
            console.error("Erro ao remover:", erroDb);
            alert("Erro ao remover horário.");
            return;
        }

        alert("Horário removido com sucesso!");
        await carregarHorarios();
        btnCancelarEdicao.click();
    });
});
