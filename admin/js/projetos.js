/**
 * projetos.js
 * CRUD para Projetos (Pesquisa, Extensão e Inovação).
 *
 * Tabela Supabase: projetos
 * Campos: id, titulo, subtitulo, texto, pdf_url, tipo (pesquisa | extensao | inovacao)
 */

import { supabase } from '../supabase.js';
import { mostrarToast, validarFormulario, limparErrosAoDigitar,
         truncar, confirmarExclusao } from './admin-utils.js';

// ── Estado ────────────────────────────────────────────────────────────────────

let todosProjetos = [];
let filtroTipoAtual = 'todos';
let modalAtual = null;

// ── Inicialização ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    carregarProjetos();
    inicializarTabs();
    document.getElementById('btnNovoProjeto').addEventListener('click', abrirModalNovo);
    document.getElementById('filtroBusca').addEventListener('input', filtrarTabela);
});

// ── Sistema de abas ───────────────────────────────────────────────────────────

function inicializarTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('ativo');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('ativo');
            btn.setAttribute('aria-selected', 'true');

            filtroTipoAtual = btn.dataset.tab;
            filtrarTabela();
        });
    });
}

// ── Leitura (Read) ────────────────────────────────────────────────────────────

async function carregarProjetos() {
    const tbody = document.getElementById('corpoTabelaProjetos');
    tbody.innerHTML = '<tr><td colspan="5" class="tabela-loading">Carregando projetos...</td></tr>';

    const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .order('titulo', { ascending: true });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="tabela-vazia">Erro ao carregar projetos.</td></tr>';
        mostrarToast('Erro ao carregar projetos: ' + error.message, 'erro');
        return;
    }

    todosProjetos = data || [];
    filtrarTabela();
}

function filtrarTabela() {
    const busca = document.getElementById('filtroBusca').value.toLowerCase();

    const filtrados = todosProjetos.filter(p => {
        const bateTipo = filtroTipoAtual === 'todos' || p.tipo === filtroTipoAtual;
        const bateBusca = !busca ||
            p.titulo?.toLowerCase().includes(busca) ||
            p.subtitulo?.toLowerCase().includes(busca);
        return bateTipo && bateBusca;
    });

    renderizarTabela(filtrados);
}

function renderizarTabela(projetos) {
    const tbody = document.getElementById('corpoTabelaProjetos');

    if (!projetos.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="tabela-vazia">Nenhum projeto encontrado.</td></tr>';
        return;
    }

    tbody.innerHTML = projetos.map(p => {
        const badgeClass = {
            pesquisa: 'badge-pesquisa',
            extensao: 'badge-extensao',
            inovacao: 'badge-inovacao',
        }[p.tipo] || '';

        const tipoLabel = {
            pesquisa: 'Pesquisa',
            extensao: 'Extensão',
            inovacao: 'Inovação',
        }[p.tipo] || p.tipo || '—';

        return `
            <tr>
                <td><strong>${truncar(p.titulo, 50)}</strong></td>
                <td>${truncar(p.subtitulo, 45)}</td>
                <td><span class="badge ${badgeClass}">${tipoLabel}</span></td>
                <td>
                    ${p.pdf_url
                        ? `<a href="${p.pdf_url}" target="_blank" class="btn-secondary" style="font-size:0.82rem">📄 Ver PDF</a>`
                        : '<span style="color:#94a3b8">Sem PDF</span>'}
                </td>
                <td>
                    <div class="acoes-celula">
                        <button class="btn-edit" onclick="editarProjeto(${p.id})">✏️ Editar</button>
                        <button class="btn-danger" onclick="excluirProjeto(${p.id}, '${escapar(p.titulo)}')">🗑️ Excluir</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ── Formulário ────────────────────────────────────────────────────────────────

function htmlFormulario(p = {}) {
    return `
        <form id="formProjeto" novalidate>
            <div class="form-grid">
                <div class="form-group full">
                    <label for="titulo" class="required">Título</label>
                    <input type="text" id="titulo" name="titulo" required
                           value="${escapar(p.titulo || '')}"
                           placeholder="Título do projeto">
                    <span class="msg-erro">Campo obrigatório.</span>
                </div>

                <div class="form-group full">
                    <label for="subtitulo">Subtítulo</label>
                    <input type="text" id="subtitulo" name="subtitulo"
                           value="${escapar(p.subtitulo || '')}"
                           placeholder="Subtítulo ou descrição curta">
                </div>

                <div class="form-group full">
                    <label for="tipo" class="required">Tipo do Projeto</label>
                    <select id="tipo" name="tipo" required>
                        <option value="">Selecione o tipo...</option>
                        <option value="pesquisa" ${p.tipo === 'pesquisa' ? 'selected' : ''}>Pesquisa</option>
                        <option value="extensao" ${p.tipo === 'extensao' ? 'selected' : ''}>Extensão</option>
                        <option value="inovacao" ${p.tipo === 'inovacao' ? 'selected' : ''}>Inovação</option>
                    </select>
                    <span class="msg-erro">Selecione o tipo.</span>
                </div>

                <div class="form-group full">
                    <label for="texto">Texto / Descrição</label>
                    <textarea id="texto" name="texto" rows="5"
                              placeholder="Descreva o projeto em detalhes...">${p.texto || ''}</textarea>
                </div>

                <div class="form-group full">
                    <label for="pdf_url">URL do PDF</label>
                    <input type="url" id="pdf_url" name="pdf_url"
                           value="${escapar(p.pdf_url || '')}"
                           placeholder="https://...">
                    <span class="file-note">Cole a URL pública do PDF do projeto (opcional).</span>
                </div>
            </div>
        </form>
    `;
}

function abrirModalNovo() {
    abrirModal('Novo Projeto', {}, null);
}

window.editarProjeto = function(id) {
    const p = todosProjetos.find(x => x.id === id);
    if (p) abrirModal('Editar Projeto', p, id);
};

function abrirModal(titulo, dados, id) {
    const overlay = criarModalLocal(titulo, htmlFormulario(dados));
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    modalAtual = overlay;
    limparErrosAoDigitar(overlay.querySelector('#formProjeto'));

    overlay.querySelector('#btnSalvar').addEventListener('click', () => salvarProjeto(id));
}

// ── Salvar (Create / Update) ──────────────────────────────────────────────────

async function salvarProjeto(id) {
    const form = document.getElementById('formProjeto');
    if (!validarFormulario(form)) {
        mostrarToast('Preencha os campos obrigatórios.', 'erro');
        return;
    }

    const btn = document.getElementById('btnSalvar');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    const payload = {
        titulo: form.titulo.value.trim(),
        subtitulo: form.subtitulo.value.trim() || null,
        tipo: form.tipo.value,
        texto: form.texto.value.trim() || null,
        pdf_url: form.pdf_url.value.trim() || null,
    };

    const { error } = id
        ? await supabase.from('projetos').update(payload).eq('id', id)
        : await supabase.from('projetos').insert([payload]);

    btn.disabled = false;
    btn.textContent = '💾 Salvar';

    if (error) { mostrarToast('Erro: ' + error.message, 'erro'); return; }

    mostrarToast(id ? 'Projeto atualizado!' : 'Projeto cadastrado!', 'sucesso');
    fecharModalAtual();
    carregarProjetos();
}

// ── Excluir (Delete) ──────────────────────────────────────────────────────────

window.excluirProjeto = async function(id, titulo) {
    if (!await confirmarExclusao(titulo)) return;
    const { error } = await supabase.from('projetos').delete().eq('id', id);
    if (error) { mostrarToast('Erro: ' + error.message, 'erro'); return; }
    mostrarToast('Projeto excluído.', 'sucesso');
    carregarProjetos();
};

// ── Utilitários locais ────────────────────────────────────────────────────────

function fecharModalAtual() {
    if (modalAtual) { modalAtual.remove(); modalAtual = null; document.body.style.overflow = ''; }
}

function escapar(str) {
    return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function criarModalLocal(titulo, corpo) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
            <div class="modal-header">
                <h3>${titulo}</h3>
                <button class="modal-fechar">&times;</button>
            </div>
            <div class="modal-body">${corpo}</div>
            <div class="modal-footer">
                <button class="btn-secondary" id="btnCancelar">Cancelar</button>
                <button class="btn-primary" id="btnSalvar">💾 Salvar</button>
            </div>
        </div>
    `;
    overlay.addEventListener('click', e => { if (e.target === overlay) fecharModalAtual(); });
    overlay.querySelector('.modal-fechar').addEventListener('click', fecharModalAtual);
    overlay.querySelector('#btnCancelar').addEventListener('click', fecharModalAtual);
    return overlay;
}
