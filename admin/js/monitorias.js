/**
 * monitorias.js
 * CRUD completo para Monitorias.
 *
 * Tabela Supabase: monitorias
 * Campos: id, disciplina, periodo, professor, tipo_monitoria,
 *         status, aluno_monitor
 */

import { supabase } from '../supabase.js';
import { mostrarToast, validarFormulario, limparErrosAoDigitar,
         truncar, confirmarExclusao } from './admin-utils.js';

// ── Estado ────────────────────────────────────────────────────────────────────

let todasMonitorias = [];
let modalAtual = null;

// ── Inicialização ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    carregarMonitorias();
    document.getElementById('btnNovaMonitoria').addEventListener('click', abrirModalNova);
    document.getElementById('filtroBusca').addEventListener('input', filtrarTabela);
    document.getElementById('filtroStatus').addEventListener('change', filtrarTabela);
    document.getElementById('filtroTipo').addEventListener('change', filtrarTabela);
});

// ── Leitura (Read) ────────────────────────────────────────────────────────────

async function carregarMonitorias() {
    const tbody = document.getElementById('corpoTabelaMonitorias');
    tbody.innerHTML = '<tr><td colspan="7" class="tabela-loading">Carregando monitorias...</td></tr>';

    const { data, error } = await supabase
        .from('monitorias')
        .select('*')
        .order('disciplina', { ascending: true });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="tabela-vazia">Erro ao carregar dados.</td></tr>';
        mostrarToast('Erro ao carregar monitorias: ' + error.message, 'erro');
        return;
    }

    todasMonitorias = data || [];
    filtrarTabela();
}

function filtrarTabela() {
    const busca = document.getElementById('filtroBusca').value.toLowerCase();
    const status = document.getElementById('filtroStatus').value;
    const tipo = document.getElementById('filtroTipo').value;

    const filtradas = todasMonitorias.filter(m => {
        const bateBusca = !busca ||
            m.disciplina?.toLowerCase().includes(busca) ||
            m.professor?.toLowerCase().includes(busca) ||
            m.aluno_monitor?.toLowerCase().includes(busca);
        const bateStatus = !status || m.status === status;
        const bateTipo = !tipo || m.tipo_monitoria === tipo;
        return bateBusca && bateStatus && bateTipo;
    });

    renderizarTabela(filtradas);
}

function renderizarTabela(monitorias) {
    const tbody = document.getElementById('corpoTabelaMonitorias');

    if (!monitorias.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="tabela-vazia">Nenhuma monitoria encontrada.</td></tr>';
        return;
    }

    tbody.innerHTML = monitorias.map(m => {
        const badgeStatus = {
            ativa: 'badge-ativo',
            inativa: 'badge-inativo',
            encerrada: 'badge-encerrada',
        }[m.status] || '';

        const labelStatus = {
            ativa: 'Ativa',
            inativa: 'Inativa',
            encerrada: 'Encerrada',
        }[m.status] || m.status || '—';

        const labelTipo = {
            voluntaria: 'Voluntária',
            bolsista: 'Bolsista',
        }[m.tipo_monitoria] || m.tipo_monitoria || '—';

        return `
            <tr>
                <td><strong>${m.disciplina || '—'}</strong></td>
                <td>${m.periodo || '—'}</td>
                <td>${m.professor || '—'}</td>
                <td>${m.aluno_monitor || '—'}</td>
                <td>${labelTipo}</td>
                <td><span class="badge ${badgeStatus}">${labelStatus}</span></td>
                <td>
                    <div class="acoes-celula">
                        <button class="btn-edit" onclick="editarMonitoria(${m.id})">✏️ Editar</button>
                        <button class="btn-danger" onclick="excluirMonitoria(${m.id}, '${escapar(m.disciplina)}')">🗑️ Excluir</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ── Formulário ────────────────────────────────────────────────────────────────

function htmlFormulario(m = {}) {
    return `
        <form id="formMonitoria" novalidate>
            <div class="form-grid">
                <div class="form-group full">
                    <label for="disciplina" class="required">Disciplina</label>
                    <input type="text" id="disciplina" name="disciplina" required
                           value="${escapar(m.disciplina || '')}"
                           placeholder="Nome da disciplina">
                    <span class="msg-erro">Campo obrigatório.</span>
                </div>

                <div class="form-group">
                    <label for="periodo">Período</label>
                    <input type="text" id="periodo" name="periodo"
                           value="${escapar(m.periodo || '')}"
                           placeholder="Ex: 2025.1">
                </div>

                <div class="form-group">
                    <label for="professor">Professor</label>
                    <input type="text" id="professor" name="professor"
                           value="${escapar(m.professor || '')}"
                           placeholder="Nome do professor">
                </div>

                <div class="form-group">
                    <label for="tipo_monitoria">Tipo de Monitoria</label>
                    <select id="tipo_monitoria" name="tipo_monitoria">
                        <option value="">Selecione...</option>
                        <option value="voluntaria" ${m.tipo_monitoria === 'voluntaria' ? 'selected' : ''}>Voluntária</option>
                        <option value="bolsista" ${m.tipo_monitoria === 'bolsista' ? 'selected' : ''}>Bolsista</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="status" class="required">Status</label>
                    <select id="status" name="status" required>
                        <option value="">Selecione...</option>
                        <option value="ativa" ${m.status === 'ativa' ? 'selected' : ''}>Ativa</option>
                        <option value="inativa" ${m.status === 'inativa' ? 'selected' : ''}>Inativa</option>
                        <option value="encerrada" ${m.status === 'encerrada' ? 'selected' : ''}>Encerrada</option>
                    </select>
                    <span class="msg-erro">Selecione o status.</span>
                </div>

                <div class="form-group full">
                    <label for="aluno_monitor">Aluno Monitor</label>
                    <input type="text" id="aluno_monitor" name="aluno_monitor"
                           value="${escapar(m.aluno_monitor || '')}"
                           placeholder="Nome do aluno monitor">
                </div>
            </div>
        </form>
    `;
}

function abrirModalNova() {
    abrirModal('Nova Monitoria', {}, null);
}

window.editarMonitoria = function(id) {
    const m = todasMonitorias.find(x => x.id === id);
    if (m) abrirModal('Editar Monitoria', m, id);
};

function abrirModal(titulo, dados, id) {
    const overlay = criarModalLocal(titulo, htmlFormulario(dados));
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    modalAtual = overlay;
    limparErrosAoDigitar(overlay.querySelector('#formMonitoria'));

    overlay.querySelector('#btnSalvar').addEventListener('click', () => salvarMonitoria(id));
}

// ── Salvar (Create / Update) ──────────────────────────────────────────────────

async function salvarMonitoria(id) {
    const form = document.getElementById('formMonitoria');
    if (!validarFormulario(form)) {
        mostrarToast('Preencha os campos obrigatórios.', 'erro');
        return;
    }

    const btn = document.getElementById('btnSalvar');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    const payload = {
        disciplina: form.disciplina.value.trim(),
        periodo: form.periodo.value.trim() || null,
        professor: form.professor.value.trim() || null,
        tipo_monitoria: form.tipo_monitoria.value || null,
        status: form.status.value,
        aluno_monitor: form.aluno_monitor.value.trim() || null,
    };

    const { error } = id
        ? await supabase.from('monitorias').update(payload).eq('id', id)
        : await supabase.from('monitorias').insert([payload]);

    btn.disabled = false;
    btn.textContent = '💾 Salvar';

    if (error) { mostrarToast('Erro: ' + error.message, 'erro'); return; }

    mostrarToast(id ? 'Monitoria atualizada!' : 'Monitoria cadastrada!', 'sucesso');
    fecharModalAtual();
    carregarMonitorias();
}

// ── Excluir (Delete) ──────────────────────────────────────────────────────────

window.excluirMonitoria = async function(id, disciplina) {
    if (!await confirmarExclusao(disciplina)) return;
    const { error } = await supabase.from('monitorias').delete().eq('id', id);
    if (error) { mostrarToast('Erro: ' + error.message, 'erro'); return; }
    mostrarToast('Monitoria excluída.', 'sucesso');
    carregarMonitorias();
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
