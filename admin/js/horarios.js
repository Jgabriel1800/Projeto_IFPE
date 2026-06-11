/**
 * horarios.js
 * CRUD para Horários de Turmas e Horários de Laboratórios.
 *
 * Tabelas Supabase:
 *   - horarios_turmas  (id, periodo, qtd_alunos, pdf_url)
 *   - horarios_laboratorios (id, nome, pdf_url)
 */

import { supabase } from './supabase.js';
import { mostrarToast, validarFormulario, limparErrosAoDigitar,
         truncar, confirmarExclusao } from './admin-utils.js';

// ── Estado ────────────────────────────────────────────────────────────────────

let turmas = [];
let labs = [];
let modalAtual = null;

// ── Inicialização ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    inicializarTabs();
    carregarTurmas();
    carregarLabs();

    document.getElementById('btnNovaTurma').addEventListener('click', abrirModalNovaTurma);
    document.getElementById('btnNovoLab').addEventListener('click', abrirModalNovoLab);

    document.getElementById('filtroPeriodo').addEventListener('input', filtrarTurmas);
    document.getElementById('filtroLab').addEventListener('input', filtrarLabs);
});

// ── Sistema de abas ───────────────────────────────────────────────────────────

function inicializarTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const aba = btn.dataset.tab;

            // Desativa todas as abas
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('ativo');
                b.setAttribute('aria-selected', 'false');
            });
            document.querySelectorAll('.tab-conteudo').forEach(c => c.classList.remove('ativo'));

            // Ativa a aba clicada
            btn.classList.add('ativo');
            btn.setAttribute('aria-selected', 'true');
            document.getElementById(`tab-${aba}`).classList.add('ativo');
        });
    });
}

// ════════════════════════════════════════════════════════════
// HORÁRIOS DE TURMAS
// ════════════════════════════════════════════════════════════

async function carregarTurmas() {
    const tbody = document.getElementById('corpoTabelaTurmas');
    tbody.innerHTML = '<tr><td colspan="4" class="tabela-loading">Carregando...</td></tr>';

    const { data, error } = await supabase
        .from('horarios_turmas')
        .select('*')
        .order('periodo', { ascending: true });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="4" class="tabela-vazia">Erro ao carregar dados.</td></tr>';
        mostrarToast('Erro ao carregar horários de turmas: ' + error.message, 'erro');
        return;
    }

    turmas = data || [];
    renderizarTurmas(turmas);
}

function renderizarTurmas(lista) {
    const tbody = document.getElementById('corpoTabelaTurmas');

    if (!lista.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="tabela-vazia">Nenhum horário de turma cadastrado.</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map(t => `
        <tr>
            <td><strong>${t.periodo || '—'}</strong></td>
            <td>${t.qtd_alunos ?? '—'}</td>
            <td>
                ${t.pdf_url
                    ? `<a href="${t.pdf_url}" target="_blank" class="btn-secondary" style="font-size:0.82rem">📄 Ver PDF</a>`
                    : '<span style="color:#94a3b8">Sem PDF</span>'}
            </td>
            <td>
                <div class="acoes-celula">
                    <button class="btn-edit" onclick="editarTurma(${t.id})">✏️ Editar</button>
                    <button class="btn-danger" onclick="excluirTurma(${t.id}, '${escapar(t.periodo)}')">🗑️ Excluir</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filtrarTurmas() {
    const busca = document.getElementById('filtroPeriodo').value.toLowerCase();
    renderizarTurmas(turmas.filter(t => !busca || t.periodo?.toLowerCase().includes(busca)));
}

// Modal turma
function htmlFormTurma(t = {}) {
    return `
        <form id="formTurma" novalidate>
            <div class="form-grid">
                <div class="form-group full">
                    <label for="periodo" class="required">Período</label>
                    <input type="text" id="periodo" name="periodo" required
                           value="${escapar(t.periodo || '')}"
                           placeholder="Ex: 1º Período 2025.1">
                    <span class="msg-erro">Campo obrigatório.</span>
                </div>

                <div class="form-group full">
                    <label for="qtd_alunos">Quantidade de Alunos</label>
                    <input type="number" id="qtd_alunos" name="qtd_alunos"
                           min="0" value="${t.qtd_alunos ?? ''}">
                </div>

                <div class="form-group full">
                    <label for="pdf_url">URL do PDF do Horário</label>
                    <input type="url" id="pdf_url" name="pdf_url"
                           value="${escapar(t.pdf_url || '')}"
                           placeholder="https://...">
                    <span class="file-note">Cole a URL pública do PDF hospedado (Storage do Supabase ou Drive).</span>
                </div>
            </div>
        </form>
    `;
}

function abrirModalNovaTurma() {
    abrirModalTurma('Nova Turma', {}, null);
}

window.editarTurma = function(id) {
    const t = turmas.find(x => x.id === id);
    if (t) abrirModalTurma('Editar Turma', t, id);
};

function abrirModalTurma(titulo, dados, id) {
    const overlay = criarModal(titulo, htmlFormTurma(dados));
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    modalAtual = overlay;
    limparErrosAoDigitar(overlay.querySelector('#formTurma'));

    overlay.querySelector('#btnSalvar').addEventListener('click', () => salvarTurma(id));
}

async function salvarTurma(id) {
    const form = document.getElementById('formTurma');
    if (!validarFormulario(form)) {
        mostrarToast('Preencha os campos obrigatórios.', 'erro');
        return;
    }

    const btn = document.getElementById('btnSalvar');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    const payload = {
        periodo: form.periodo.value.trim(),
        qtd_alunos: form.qtd_alunos.value ? parseInt(form.qtd_alunos.value) : null,
        pdf_url: form.pdf_url.value.trim() || null,
    };

    const { error } = id
        ? await supabase.from('horarios_turmas').update(payload).eq('id', id)
        : await supabase.from('horarios_turmas').insert([payload]);

    btn.disabled = false;
    btn.textContent = '💾 Salvar';

    if (error) { mostrarToast('Erro: ' + error.message, 'erro'); return; }

    mostrarToast(id ? 'Turma atualizada!' : 'Turma cadastrada!', 'sucesso');
    fecharModalAtual();
    carregarTurmas();
}

window.excluirTurma = async function(id, periodo) {
    if (!await confirmarExclusao(periodo)) return;
    const { error } = await supabase.from('horarios_turmas').delete().eq('id', id);
    if (error) { mostrarToast('Erro: ' + error.message, 'erro'); return; }
    mostrarToast('Turma excluída.', 'sucesso');
    carregarTurmas();
};

// ════════════════════════════════════════════════════════════
// LABORATÓRIOS
// ════════════════════════════════════════════════════════════

async function carregarLabs() {
    const tbody = document.getElementById('corpoTabelaLabs');
    tbody.innerHTML = '<tr><td colspan="3" class="tabela-loading">Carregando...</td></tr>';

    const { data, error } = await supabase
        .from('horarios_laboratorios')
        .select('*')
        .order('nome', { ascending: true });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="3" class="tabela-vazia">Erro ao carregar dados.</td></tr>';
        mostrarToast('Erro ao carregar laboratórios: ' + error.message, 'erro');
        return;
    }

    labs = data || [];
    renderizarLabs(labs);
}

function renderizarLabs(lista) {
    const tbody = document.getElementById('corpoTabelaLabs');

    if (!lista.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="tabela-vazia">Nenhum laboratório cadastrado.</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map(l => `
        <tr>
            <td><strong>${l.nome || '—'}</strong></td>
            <td>
                ${l.pdf_url
                    ? `<a href="${l.pdf_url}" target="_blank" class="btn-secondary" style="font-size:0.82rem">📄 Ver PDF</a>`
                    : '<span style="color:#94a3b8">Sem PDF</span>'}
            </td>
            <td>
                <div class="acoes-celula">
                    <button class="btn-edit" onclick="editarLab(${l.id})">✏️ Editar</button>
                    <button class="btn-danger" onclick="excluirLab(${l.id}, '${escapar(l.nome)}')">🗑️ Excluir</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filtrarLabs() {
    const busca = document.getElementById('filtroLab').value.toLowerCase();
    renderizarLabs(labs.filter(l => !busca || l.nome?.toLowerCase().includes(busca)));
}

// Modal lab
function htmlFormLab(l = {}) {
    return `
        <form id="formLab" novalidate>
            <div class="form-grid">
                <div class="form-group full">
                    <label for="nome" class="required">Nome do Laboratório</label>
                    <input type="text" id="nome" name="nome" required
                           value="${escapar(l.nome || '')}"
                           placeholder="Ex: Laboratório de Redes">
                    <span class="msg-erro">Campo obrigatório.</span>
                </div>

                <div class="form-group full">
                    <label for="pdf_url_lab">URL do PDF do Horário</label>
                    <input type="url" id="pdf_url_lab" name="pdf_url_lab"
                           value="${escapar(l.pdf_url || '')}"
                           placeholder="https://...">
                    <span class="file-note">Cole a URL pública do PDF (Storage do Supabase ou Drive).</span>
                </div>
            </div>
        </form>
    `;
}

function abrirModalNovoLab() {
    abrirModalLab('Novo Laboratório', {}, null);
}

window.editarLab = function(id) {
    const l = labs.find(x => x.id === id);
    if (l) abrirModalLab('Editar Laboratório', l, id);
};

function abrirModalLab(titulo, dados, id) {
    const overlay = criarModal(titulo, htmlFormLab(dados));
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    modalAtual = overlay;
    limparErrosAoDigitar(overlay.querySelector('#formLab'));

    overlay.querySelector('#btnSalvar').addEventListener('click', () => salvarLab(id));
}

async function salvarLab(id) {
    const form = document.getElementById('formLab');
    if (!validarFormulario(form)) {
        mostrarToast('Preencha os campos obrigatórios.', 'erro');
        return;
    }

    const btn = document.getElementById('btnSalvar');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    const payload = {
        nome: form.nome.value.trim(),
        pdf_url: form.pdf_url_lab.value.trim() || null,
    };

    const { error } = id
        ? await supabase.from('horarios_laboratorios').update(payload).eq('id', id)
        : await supabase.from('horarios_laboratorios').insert([payload]);

    btn.disabled = false;
    btn.textContent = '💾 Salvar';

    if (error) { mostrarToast('Erro: ' + error.message, 'erro'); return; }

    mostrarToast(id ? 'Laboratório atualizado!' : 'Laboratório cadastrado!', 'sucesso');
    fecharModalAtual();
    carregarLabs();
}

window.excluirLab = async function(id, nome) {
    if (!await confirmarExclusao(nome)) return;
    const { error } = await supabase.from('horarios_laboratorios').delete().eq('id', id);
    if (error) { mostrarToast('Erro: ' + error.message, 'erro'); return; }
    mostrarToast('Laboratório excluído.', 'sucesso');
    carregarLabs();
};

// ── Utilitários locais ────────────────────────────────────────────────────────

function fecharModalAtual() {
    if (modalAtual) { modalAtual.remove(); modalAtual = null; document.body.style.overflow = ''; }
}

function escapar(str) {
    return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Constrói um modal padrão com cabeçalho azul e rodapé com botões.
 * @param {string} titulo
 * @param {string} corpo - HTML interno
 * @returns {HTMLElement} overlay
 */
function criarModal(titulo, corpo) {
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
