import { createClient } from 'http://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { supabase, supabaseUrl, supabaseKey } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const gridDocentes = document.getElementById('gridDocentes');
    const adminBanner = document.getElementById('adminBanner');
    const btnEditarPagina = document.getElementById('btnEditarPagina');
    const adminFormSection = document.getElementById('adminFormSection');
    const conteudoMain = document.getElementById('conteudo');
    
    const selectDocente = document.getElementById('selectDocente');
    const formAdminEdit = document.getElementById('formAdminEdit');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    const btnRemoverDocente = document.getElementById('btnRemoverDocente');
    const rodape = document.getElementById('rodape') || document.querySelector('footer');

    const inNome = document.getElementById('input-nome');
    const inFoto = document.getElementById('input-foto');
    const inFormacao = document.getElementById('input-formacao');
    const inTitulacao = document.getElementById('input-titulacao');
    const inComponentes = document.getElementById('input-componentes');
    const inExperiencia = document.getElementById('input-experiencia');
    const inLattes = document.getElementById('input-lattes');
    const inEmail = document.getElementById('input-email');
    const inSiape = document.getElementById('input-siape');
    const inIsAdmin = document.getElementById('input-isadmin');

    let listaDocentes = [];

    async function carregarDocentes() {
        const { data, error } = await supabase
            .from('docentes')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            console.error("Erro ao carregar docentes:", error);
            gridDocentes.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1;">Erro ao carregar docentes.</p>';
            return;
        }

        listaDocentes = data || [];
        renderizarGrid();
        atualizarDropdown();
    }

    function renderizarGrid() {
        gridDocentes.innerHTML = '';
        
        if (listaDocentes.length === 0) {
            gridDocentes.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1;">Nenhum docente cadastrado.</p>';
            return;
        }

        listaDocentes.forEach(docente => {
            const card = document.createElement('div');
            card.className = 'docente-card';
            
            const fotoUrl = docente.foto || 'assets/icones/icone_usuario.png';
            
            const componentesHtml = (docente.componentes || '').split(/[\n,]+/).map(c => c.trim()).filter(c => c).join('<br>');

            card.innerHTML = `
                <div class="docente-resumo">
                    <img src="${fotoUrl}" alt="Foto de ${docente.nome}">
                    <h3>${docente.nome}</h3>
                    <p><strong>Titulação:</strong> ${docente.titulacao || 'Não informada'}</p>
                    <button class="btn-docente btn-abrir">Ver mais</button>
                </div>
                <div class="docente-detalhes">
                    <p><strong>Componentes Curriculares:</strong><br>${componentesHtml}</p>
                    <p><strong>Formação:</strong><br>${docente.formacao || 'Não informada'}</p>
                    <p><strong>Experiência:</strong> ${docente.experiencia || 'Não informada'}</p>
                    <p><strong>Currículo:</strong>
                        ${docente.lattes ? `<a href="${docente.lattes}" target="_blank">Acesse Aqui</a>` : 'Não informado'}
                    </p>
                    <button class="btn-docente fechar">Ver menos</button>
                </div>
            `;
            gridDocentes.appendChild(card);
        });

        document.querySelectorAll(".btn-docente").forEach(botao => {
            botao.addEventListener("click", function () {
                const card = this.closest(".docente-card");
                if (this.classList.contains("fechar")) {
                    card.classList.remove("ativo");
                } else {
                    card.classList.add("ativo");
                }
            });
        });
    }

    function atualizarDropdown() {
        selectDocente.innerHTML = '<option value="novo">-- Adicionar Novo Docente --</option>';
        listaDocentes.forEach(docente => {
            const option = document.createElement('option');
            option.value = docente.id || docente.siape;
            option.textContent = docente.nome;
            selectDocente.appendChild(option);
        });
    }

    await carregarDocentes();

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

    selectDocente.addEventListener('change', () => {
        const selecionado = selectDocente.value;
        if (selecionado === 'novo') {
            limparFormulario();
            btnRemoverDocente.style.display = 'none';
        } else {
            const docente = listaDocentes.find(d => String(d.id || d.siape) === selecionado);
            if (docente) {
                inNome.value = docente.nome || '';
                const textoFoto = document.getElementById('foto-atual-texto');
                if (docente.foto) {
                    if (textoFoto) textoFoto.innerHTML = `Foto atual: <a href="${docente.foto}" target="_blank">Ver foto</a>`;
                    inFoto.dataset.existingUrl = docente.foto;
                } else {
                    if (textoFoto) textoFoto.innerHTML = 'Nenhuma foto atual.';
                    inFoto.dataset.existingUrl = '';
                }
                inFoto.value = '';
                inFormacao.value = docente.formacao || '';
                inTitulacao.value = docente.titulacao || '';
                inComponentes.value = docente.componentes || '';
                inExperiencia.value = docente.experiencia || '';
                inLattes.value = docente.lattes || '';
                inEmail.value = docente.email_institucional || docente.email || '';
                inSiape.value = docente.siape || '';
                inIsAdmin.checked = docente.is_admin || false;
                
                btnRemoverDocente.style.display = 'inline-block';
            }
        }
    });

    function limparFormulario() {
        formAdminEdit.reset();
        selectDocente.value = 'novo';
        const textoFoto = document.getElementById('foto-atual-texto');
        if (textoFoto) textoFoto.innerHTML = 'Nenhuma foto atual.';
        inFoto.dataset.existingUrl = '';
        btnRemoverDocente.style.display = 'none';
    }

    formAdminEdit.addEventListener('submit', async (e) => {
        e.preventDefault();

        let tit = inTitulacao.value;
        const titulacoesPermitidas = ['Especialista', 'Mestre', 'Doutor', 'Pós-Doutor'];
        if (!titulacoesPermitidas.includes(tit)) {
            alert(`A titulação deve ser uma destas: ${titulacoesPermitidas.join(', ')}`);
            return;
        }

        let urlFoto = inFoto.dataset.existingUrl || '';

        if (inFoto.files && inFoto.files.length > 0) {
            const file = inFoto.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `docente_${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('docentes_fotos')
                .upload(fileName, file);

            if (uploadError) {
                console.error("Erro no upload da foto:", uploadError);
                alert("Erro ao enviar a imagem. Crie o storage bucket 'docentes_fotos' público no Supabase.");
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from('docentes_fotos')
                .getPublicUrl(fileName);

            if (publicUrlData) {
                urlFoto = publicUrlData.publicUrl;
            }
        }

        const novoDocente = {
            nome: inNome.value,
            foto: urlFoto,
            formacao: inFormacao.value,
            titulacao: tit,
            disciplinas: inComponentes.value || 'Não informada',
            componentes: inComponentes.value,
            experiencia: inExperiencia.value,
            lattes: inLattes.value,
            email_institucional: inEmail.value,
            is_admin: inIsAdmin.checked
        };

        if (inSiape.value) {
            novoDocente.siape = inSiape.value;
        }

        const selecionado = selectDocente.value;
        let erroDb = null;

        if (selecionado === 'novo') {
            if (inIsAdmin.checked) {
                const supabaseAuthSecundario = createClient(supabaseUrl, supabaseKey, {
                    auth: { persistSession: false, autoRefreshToken: false }
                });

                const { data: authData, error: authError } = await supabaseAuthSecundario.auth.signUp({
                    email: inEmail.value,
                    password: 'SenhaPadrao123!'
                });

                if (authError) {
                    console.error("Erro ao criar login auth:", authError);
                    alert("Erro ao criar usuário de login no sistema. O docente não foi salvo no banco.");
                    return;
                }
            }

            const { error } = await supabase.from('docentes').insert([novoDocente]);
            erroDb = error;
        } else {
            const docenteExistente = listaDocentes.find(d => String(d.id || d.siape) === selecionado);
            if(docenteExistente && docenteExistente.id) {
                 const { error } = await supabase.from('docentes').update(novoDocente).eq('id', selecionado);
                 erroDb = error;
            } else {
                 const { error } = await supabase.from('docentes').update(novoDocente).eq('siape', selecionado);
                 erroDb = error;
            }
        }

        if (erroDb) {
            console.error("Erro ao salvar:", erroDb);
            alert("Erro ao salvar. Verifique se todas as colunas existem na tabela 'docentes' no Supabase.");
            return;
        }

        alert("Docente salvo com sucesso!");
        await carregarDocentes();
        btnCancelarEdicao.click();
    });

    btnRemoverDocente.addEventListener('click', async () => {
        const selecionado = selectDocente.value;
        if (selecionado === 'novo') return;

        if (!confirm("Tem certeza que deseja remover este docente?")) {
            return;
        }

        let erroDb = null;
        const docenteExistente = listaDocentes.find(d => String(d.id || d.siape) === selecionado);
        
        if(docenteExistente && docenteExistente.id) {
            const { error } = await supabase.from('docentes').delete().eq('id', selecionado);
            erroDb = error;
        } else {
            const { error } = await supabase.from('docentes').delete().eq('siape', selecionado);
            erroDb = error;
        }

        if (erroDb) {
            console.error("Erro ao remover:", erroDb);
            alert("Erro ao remover docente.");
            return;
        }

        alert("Docente removido com sucesso!");

        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email === docenteExistente.email_institucional) {
            alert("Como você apagou o seu próprio perfil de administrador, você será deslogado.");
            await supabase.auth.signOut();
            window.location.href = "login.html";
            return;
        }

        await carregarDocentes();
        btnCancelarEdicao.click();
    });
});
