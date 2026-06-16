import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const btnEditarPagina = document.getElementById('btnEditarPagina');
    const adminBanner = document.getElementById('adminBanner');
    const adminFormSection = document.getElementById('adminFormSection');
    const conteudoMain = document.getElementById('conteudo');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    const formAdminEdit = document.getElementById('formAdminEdit');
    const rodape = document.getElementById('rodape') || document.querySelector('footer');

    const elTituloOque = document.getElementById('edit-titulo-oque');
    const elTextoOque = document.getElementById('edit-texto-oque');
    const elTituloEstrutura = document.getElementById('edit-titulo-estrutura');
    const elTextoEstrutura = document.getElementById('edit-texto-estrutura');
    const elTituloPerfil = document.getElementById('edit-titulo-perfil');
    const elTextoPerfil = document.getElementById('edit-texto-perfil');
    const elTituloDocumentos = document.getElementById('edit-titulo-documentos');
    const elTextoDocumentos = document.getElementById('edit-texto-documentos');

    const listaDocsPerfil = document.getElementById('lista-docs-perfil');
    const listaDocsBasicos = document.getElementById('lista-docs-basicos');

    const inTituloOque = document.getElementById('input-titulo-oque');
    const inTextoOque = document.getElementById('input-texto-oque');
    const inTituloEstrutura = document.getElementById('input-titulo-estrutura');
    const inTextoEstrutura = document.getElementById('input-texto-estrutura');
    const inTituloPerfil = document.getElementById('input-titulo-perfil');
    const inTextoPerfil = document.getElementById('input-texto-perfil');
    const inTituloDocumentos = document.getElementById('input-titulo-documentos');
    const inTextoDocumentos = document.getElementById('input-texto-documentos');

    const inDocSecao = document.getElementById('input-doc-secao');
    const inDocTitulo = document.getElementById('input-doc-titulo');
    const inDocPdf = document.getElementById('input-doc-pdf');
    const btnAddDoc = document.getElementById('btnAddDoc');
    const adminListaPerfil = document.getElementById('admin-lista-perfil');
    const adminListaBasicos = document.getElementById('admin-lista-basicos');

    let documentosPerfil = [];
    let documentosBasicos = [];

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

            documentosPerfil = c.documentosPerfil || [];
            documentosBasicos = c.documentosBasicos || [];
            renderizarDocumentosPublicos();
        }
    }

    function renderizarDocumentosPublicos() {
        renderizarListaPublica(listaDocsPerfil, documentosPerfil);
        renderizarListaPublica(listaDocsBasicos, documentosBasicos);
    }

    function renderizarListaPublica(container, lista) {
        container.innerHTML = '';
        if (lista.length === 0) {
            container.innerHTML = '<p style="font-style: italic; color: #666;">Nenhum documento cadastrado.</p>';
            return;
        }
        lista.forEach(doc => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${doc.url}" download target="_blank"><img src="assets/icones/icone_pdf.png" alt="PDF"> ${doc.titulo}</a>`;
            container.appendChild(li);
        });
    }

    await carregarConteudo();

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        adminBanner.style.display = 'block';
    }

    btnEditarPagina.addEventListener('click', () => {
        inTituloOque.value = elTituloOque.textContent.trim();
        inTextoOque.value = elTextoOque.textContent.trim();
        inTituloEstrutura.value = elTituloEstrutura.textContent.trim();
        inTextoEstrutura.value = elTextoEstrutura.textContent.trim();
        inTituloPerfil.value = elTituloPerfil.textContent.trim();
        inTextoPerfil.value = elTextoPerfil.textContent.trim();
        inTituloDocumentos.value = elTituloDocumentos.textContent.trim();
        inTextoDocumentos.value = elTextoDocumentos.textContent.trim();

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

    function renderizarListasAdmin() {
        renderizarListaAdmin(adminListaPerfil, documentosPerfil, 'perfil');
        renderizarListaAdmin(adminListaBasicos, documentosBasicos, 'basicos');
    }

    function renderizarListaAdmin(container, lista, secao) {
        container.innerHTML = '';
        if (lista.length === 0) {
            container.innerHTML = '<li><small style="color: #666;">Nenhum documento adicionado.</small></li>';
            return;
        }
        lista.forEach((doc, index) => {
            const li = document.createElement('li');
            li.style.marginBottom = '8px';
            li.innerHTML = `
                <a href="${doc.url}" target="_blank" style="color: #252b73; text-decoration: none; font-weight: bold; margin-right: 15px;">📄 ${doc.titulo}</a>
                <button type="button" class="btn-remover-doc" data-secao="${secao}" data-index="${index}" style="background-color: #c0392b; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px;">Remover</button>
            `;
            container.appendChild(li);
        });

        container.querySelectorAll('.btn-remover-doc').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const s = e.target.getAttribute('data-secao');
                const idx = parseInt(e.target.getAttribute('data-index'));
                if (s === 'perfil') {
                    documentosPerfil.splice(idx, 1);
                } else {
                    documentosBasicos.splice(idx, 1);
                }
                renderizarListasAdmin();
            });
        });
    }

    btnAddDoc.addEventListener('click', async () => {
        const titulo = inDocTitulo.value.trim();
        const secao = inDocSecao.value;
        const fileInput = inDocPdf.files;

        if (!titulo) {
            alert('Por favor, informe o título do documento.');
            return;
        }

        if (!fileInput || fileInput.length === 0) {
            alert('Por favor, selecione um arquivo PDF.');
            return;
        }

        const file = fileInput[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `sobre_${Date.now()}.${fileExt}`;

        btnAddDoc.textContent = 'Enviando PDF...';
        btnAddDoc.disabled = true;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('sobre_pdfs')
            .upload(fileName, file);

        if (uploadError) {
            console.error("Erro no upload do PDF:", uploadError);
            alert("Erro ao enviar o arquivo PDF. Verifique se o bucket 'sobre_pdfs' público foi criado no Supabase.\n" + uploadError.message);
            btnAddDoc.textContent = 'Upload e Adicionar Documento';
            btnAddDoc.disabled = false;
            return;
        }

        const { data: publicUrlData } = supabase.storage
            .from('sobre_pdfs')
            .getPublicUrl(fileName);

        if (publicUrlData) {
            const novoDoc = { titulo: titulo, url: publicUrlData.publicUrl };
            if (secao === 'perfil') {
                documentosPerfil.push(novoDoc);
            } else {
                documentosBasicos.push(novoDoc);
            }
            
            inDocTitulo.value = '';
            inDocPdf.value = '';
            renderizarListasAdmin();
        }

        btnAddDoc.textContent = 'Upload e Adicionar Documento';
        btnAddDoc.disabled = false;
    });

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
            textoDocumentos: inTextoDocumentos.value,
            documentosPerfil: documentosPerfil,
            documentosBasicos: documentosBasicos
        };

        const { error } = await supabase
            .from('page_content')
            .upsert({ page: 'sobre', content: novoConteudo });

        if (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar alterações. Verifique a conexão com o Supabase.\n" + error.message);
            return;
        }

        elTituloOque.textContent = novoConteudo.tituloOque;
        elTextoOque.textContent = novoConteudo.textoOque;
        elTituloEstrutura.textContent = novoConteudo.tituloEstrutura;
        elTextoEstrutura.textContent = novoConteudo.textoEstrutura;
        elTituloPerfil.textContent = novoConteudo.tituloPerfil;
        elTextoPerfil.textContent = novoConteudo.textoPerfil;
        elTituloDocumentos.textContent = novoConteudo.tituloDocumentos;
        elTextoDocumentos.textContent = novoConteudo.textoDocumentos;

        renderizarDocumentosPublicos();

        adminFormSection.style.display = 'none';
        conteudoMain.style.display = 'block';
        adminBanner.style.display = 'block';
        if (rodape) rodape.style.display = '';
        alert("Página salva com sucesso!");
    });
});
