import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const gridEventos = document.getElementById('gridEventos');
    const adminBanner = document.getElementById('adminBanner');
    const btnEditarPagina = document.getElementById('btnEditarPagina');
    const adminFormSection = document.getElementById('adminFormSection');
    const conteudoMain = document.getElementById('conteudo');
    
    const selectEvento = document.getElementById('selectEvento');
    const formAdminEdit = document.getElementById('formAdminEdit');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    const btnRemoverEvento = document.getElementById('btnRemoverEvento');
    const rodape = document.getElementById('rodape') || document.querySelector('footer');

    const inTitulo = document.getElementById('input-titulo');
    const inFoto = document.getElementById('input-foto');
    const inData = document.getElementById('input-data');
    const inHora = document.getElementById('input-hora');
    const inPublico = document.getElementById('input-publico');
    const inModalidade = document.getElementById('input-modalidade');
    const inLocal = document.getElementById('input-local');
    const inDescricao = document.getElementById('input-descricao');
    const inLink = document.getElementById('input-link');

    let listaEventos = [];

    async function carregarEventos() {
        const { data, error } = await supabase
            .from('eventos')
            .select('*');

        if (error) {
            console.error("Erro ao carregar eventos:", error);
            gridEventos.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1;">Erro ao carregar eventos.</p>';
            return;
        }

        listaEventos = data || [];
        renderizarGrid();
        atualizarDropdown();
    }

    function renderizarGrid() {
        gridEventos.innerHTML = '';
        
        if (listaEventos.length === 0) {
            gridEventos.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1;">Nenhum evento cadastrado.</p>';
            return;
        }

        listaEventos.forEach(evento => {
            const card = document.createElement('div');
            card.className = 'card-evento';
            
            const fotoUrl = evento.imagem || 'assets/logo_EngenhariaSoftware.png'; 

            card.innerHTML = `
                <img src="${fotoUrl}" alt="${evento.titulo}" class="img-evento">
                <div class="info-evento">
                    <h3 class="titulo-evento">${evento.titulo}</h3>
                    <p><strong>Data:</strong> ${evento.data}</p>
                    <p><strong>Hora:</strong> ${evento.hora}</p>
                    <p><strong>Público:</strong> ${evento.publico}</p>
                    <p><strong>Modalidade:</strong> ${evento.modalidade}</p>
                    <p><strong>Local:</strong> ${evento.local}</p>
                    <div class="descricao-evento">
                        <p><strong>Descrição:</strong> 
                            <span class="desc-curta">${evento.descricao.length > 150 ? evento.descricao.substring(0, 150) + '...' : evento.descricao}</span>
                            <span class="desc-completa" style="display:none;">${evento.descricao}</span>
                        </p>
                        ${evento.descricao.length > 150 ? `<button class="btn-ver-mais" style="background:none;border:none;color:#ff6b6b;cursor:pointer;padding:0;font-size:0.9em;text-decoration:underline;margin-top:5px;">Ver mais</button>` : ''}
                    </div>
                    ${evento.link ? `<p style="margin-top: 10px;"><strong>Link:</strong> <a href="${evento.link}" target="_blank" style="color: #ff6b6b; font-weight: bold; text-decoration: none;">Acessar Evento</a></p>` : ''}
                </div>
            `;
            gridEventos.appendChild(card);
        });
    }

    function atualizarDropdown() {
        selectEvento.innerHTML = '<option value="novo">-- Adicionar Novo Evento --</option>';
        listaEventos.forEach(evento => {
            const option = document.createElement('option');
            option.value = evento.id;
            option.textContent = evento.titulo;
            selectEvento.appendChild(option);
        });
    }

    await carregarEventos();

    gridEventos.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-ver-mais')) {
            const btn = e.target;
            const container = btn.closest('.descricao-evento');
            const descCurta = container.querySelector('.desc-curta');
            const descCompleta = container.querySelector('.desc-completa');

            if (descCompleta.style.display === 'none') {
                descCompleta.style.display = 'inline';
                descCurta.style.display = 'none';
                btn.textContent = 'Ver menos';
            } else {
                descCompleta.style.display = 'none';
                descCurta.style.display = 'inline';
                btn.textContent = 'Ver mais';
            }
        }
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        adminBanner.style.display = 'block';
    }

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

    selectEvento.addEventListener('change', () => {
        const selecionado = selectEvento.value;
        if (selecionado === 'novo') {
            limparFormulario();
            btnRemoverEvento.style.display = 'none';
        } else {
            const evento = listaEventos.find(e => String(e.id) === selecionado);
            if (evento) {
                inTitulo.value = evento.titulo || '';
                
                const textoFoto = document.getElementById('foto-atual-texto');
                if (evento.imagem) {
                    if (textoFoto) textoFoto.innerHTML = `Imagem atual: <a href="${evento.imagem}" target="_blank">Ver imagem</a>`;
                    inFoto.dataset.existingUrl = evento.imagem;
                } else {
                    if (textoFoto) textoFoto.innerHTML = 'Nenhuma imagem atual.';
                    inFoto.dataset.existingUrl = '';
                }
                inFoto.value = '';

                inData.value = evento.data || '';
                inHora.value = evento.hora || '';
                inPublico.value = evento.publico || '';
                inModalidade.value = evento.modalidade || '';
                inLocal.value = evento.local || '';
                inDescricao.value = evento.descricao || '';
                inLink.value = evento.link || '';
                
                btnRemoverEvento.style.display = 'inline-block';
            }
        }
    });

    function limparFormulario() {
        formAdminEdit.reset();
        selectEvento.value = 'novo';
        const textoFoto = document.getElementById('foto-atual-texto');
        if (textoFoto) textoFoto.innerHTML = 'Nenhuma imagem atual.';
        inFoto.dataset.existingUrl = '';
        inLink.value = '';
        btnRemoverEvento.style.display = 'none';
    }

    formAdminEdit.addEventListener('submit', async (e) => {
        e.preventDefault();

        let urlFoto = inFoto.dataset.existingUrl || '';

        if (inFoto.files && inFoto.files.length > 0) {
            const file = inFoto.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `evento_${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('eventos_fotos')
                .upload(fileName, file);

            if (uploadError) {
                console.error("Erro no upload da foto:", uploadError);
                alert("Erro ao enviar a imagem. Verifique se o bucket 'eventos_fotos' público foi criado no Supabase.");
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from('eventos_fotos')
                .getPublicUrl(fileName);

            if (publicUrlData) {
                urlFoto = publicUrlData.publicUrl;
            }
        }

        const novoEvento = {
            titulo: inTitulo.value,
            imagem: urlFoto,
            data: inData.value,
            hora: inHora.value,
            publico: inPublico.value,
            modalidade: inModalidade.value,
            local: inLocal.value,
            descricao: inDescricao.value,
            link: inLink.value || null
        };

        const selecionado = selectEvento.value;
        let erroDb = null;

        if (selecionado === 'novo') {
            const { error } = await supabase.from('eventos').insert([novoEvento]);
            erroDb = error;
        } else {
            const { error } = await supabase.from('eventos').update(novoEvento).eq('id', selecionado);
            erroDb = error;
        }

        if (erroDb) {
            console.error("Erro ao salvar:", erroDb);
            alert("Erro ao salvar no banco de dados:\n\n" + erroDb.message + "\n\nVerifique se todas as colunas (inclusive a nova coluna 'link') foram criadas corretamente no Supabase.");
            return;
        }

        alert("Evento salvo com sucesso!");
        await carregarEventos();
        btnCancelarEdicao.click();
    });

    btnRemoverEvento.addEventListener('click', async () => {
        const selecionado = selectEvento.value;
        if (selecionado === 'novo') return;

        if (!confirm("Tem certeza que deseja remover este evento?")) {
            return;
        }

        const { error } = await supabase.from('eventos').delete().eq('id', selecionado);

        if (error) {
            console.error("Erro ao remover:", error);
            alert("Erro ao remover evento.");
            return;
        }

        alert("Evento removido com sucesso!");
        await carregarEventos();
        btnCancelarEdicao.click();
    });
});
