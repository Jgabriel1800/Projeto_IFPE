/**
 * eventos.js
 * CRUD completo para gerenciamento de Eventos.
 * Tabela Supabase: eventos
 * Campos: titulo, data, horario, publico_alvo, modalidade, local, descricao, imagem_url
 */

import { supabase } from './supabase.js';
import { mostrarToast, validarFormulario, limparErrosAoDigitar,
         formatarData, truncar, confirmarExclusao } from './admin-utils.js';

// ── Estado ────────────────────────────────────────────────────────────────────

let todosEventos = [];       // Cache local dos eventos carregados
let modalAtual = null;       // Referência ao modal aberto

// ── Inicialização ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    carregarEventos();
    document.getElementById('btnNovoEvento').addEventListener('click', abrirModalNovo);
    document.getElementById('filtroBusca').addEventListener('input', filtrarTabela);
    document.getElementById('filtroModalidade').addEventListener('change', filtrarTabela);
});

// ── Leitura (Read) ────────────────────────────────────────────────────────────

async function carregarEventos() {
    const tbody = document.getElementById('corpoTabelaEventos');
    tbody.innerHTML = '<tr><td colspan="7" class="tabela-loading">Carregando eventos...</td></tr>';

    const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('data', { ascending: false });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="tabela-vazia">Erro ao carregar eventos.</td></tr>';
        mostrarToast('Erro ao carregar eventos: ' + error.message, 'erro');
        return;
    }

    todosEventos = data || [];
    renderizarTabela(todosEventos);
}

function renderizarTabela(eventos) {
    const tbody = document.getElementById('corpoTabelaEventos');

    if (!eventos.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="tabela-vazia">Nenhum evento cadastrado.</td></tr>';
        return;
    }

    tbody.innerHTML = eventos.map(ev => `
        <tr>
            <td><strong>${ev.titulo || '—'}</strong></td>
            <td>${formatarData(ev.data)}</td>
            <td>${ev.horario || '—'}</td>
            <td>${ev.publico_alvo || '—'}</td>
            <td>${ev.modalidade || '—'}</td>
            <td>${truncar(ev.local, 30)}</td>
            <td>
                <div class="acoes-celula">
                    <button class="btn-edit" onclick="editarEvento(${ev.id})">✏️ Editar</button>
                    <button class="btn-danger" onclick="excluirEvento(${ev.id}, '${escapar(ev.titulo)}')">🗑️ Excluir</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ── Filtros ───────────────────────────────────────────────────────────────────

function filtrarTabela() {
    const busca = document.getElementById('filtroBusca').value.toLowerCase();
    const modalidade = document.getElementById('filtroModalidade').value;

    const filtrados = todosEventos.filter(ev => {
        const bateBusca = !busca || ev.titulo?.toLowerCase().includes(busca);
        const bateModalidade = !modalidade || ev.modalidade === modalidade;
        return bateBusca && bateModalidade;
    });

    renderizarTabela(filtrados);
}

// ── Modal de formulário ───────────────────────────────────────────────────────

function htmlFormulario(ev = {}) {
    return `
        <form id="formEvento" novalidate>
            <div class="form-grid">
                <div class="form-group full">
                    <label for="titulo" class="required">Título</label>
                    <input type="text" id="titulo" name="titulo" required
                           maxlength="200" value="${escapar(ev.titulo || '')}"
                           placeholder="Título do evento">
                    <span class="msg-erro">Campo obrigatório.</span>
                </div>

                <div class="form-group">
                    <label for="data" class="required">Data</label>
                    <input type="date" id="data" name="data" required value="${ev.data || ''}">
                    <span class="msg-erro">Campo obrigatório.</span>
                </div>

                <div class="form-group">
                    <label for="horario">Horário</label>
                    <input type="time" id="horario" name="horario" value="${ev.horario || ''}">
                </div>

                <div class="form-group">
                    <label for="publico_alvo">Público-alvo</label>
                    <input type="text" id="publico_alvo" name="publico_alvo"
                           value="${escapar(ev.publico_alvo || '')}"
                           placeholder="Ex: Alunos do curso">
                </div>

                <div class="form-group">
                    <label for="modalidade">Modalidade</label>
                    <select id="modalidade" name="modalidade">
                        <option value="">Selecione...</option>
                        <option value="Presencial" ${ev.modalidade === 'Presencial' ? 'selected' : ''}>Presencial</option>
                        <option value="Online" ${ev.modalidade === 'Online' ? 'selected' : ''}>Online</option>
                        <option value="Híbrido" ${ev.modalidade === 'Híbrido' ? 'selected' : ''}>Híbrido</option>
                    </select>
                </div>

                <div class="form-group full">
                    <label for="local">Local</label>
                    <input type="text" id="local" name="local"
                           value="${escapar(ev.local || '')}"
                           placeholder="Local do evento">
                </div>

                <div class="form-group full">
                    <label for="descricao">Descrição</label>
                    <textarea id="descricao" name="descricao"
                              placeholder="Descreva o evento..."
                              rows="4">${ev.descricao || ''}</textarea>
                </div>

                <div class="form-group full">
                    <label for="imagem_url">URL da Imagem</label>
                    <input type="url" id="imagem_url" name="imagem_url"
                           value="${escapar(ev.imagem_url || '')}"
                           placeholder="https://...">
                    <span class="file-note">Cole a URL pública da imagem do evento (opcional).</span>
                </div>
            </div>
        </form>
    `;
}

function abrirModalNovo() {
    const overlay = criarModalEvento('Novo Evento');
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    modalAtual = overlay;

    const form = overlay.querySelector('#formEvento');
    limparErrosAoDigitar(form);

    overlay.querySelector('#btnSalvar').addEventListener('click', () => salvarEvento(null));
}

window.editarEvento = function(id) {
    const ev = todosEventos.find(e => e.id === id);
    if (!ev) return;

    const overlay = criarModalEvento('Editar Evento', ev);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    modalAtual = overlay;

    const form = overlay.querySelector('#formEvento');
    limparErrosAoDigitar(form);

    overlay.querySelector('#btnSalvar').addEventListener('click', () => salvarEvento(id));
};

function criarModalEvento(titulo, ev = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-label="${titulo}">
            <div class="modal-header">
                <h3>${titulo}</h3>
                <button class="modal-fechar" aria-label="Fechar">&times;</button>
            </div>
            <div class="modal-body">${htmlFormulario(ev)}</div>
            <div class="modal-footer">
                <button class="btn-secondary" id="btnCancelar">Cancelar</button>
                <button class="btn-primary" id="btnSalvar">💾 Salvar</button>
            </div>
        </div>
    `;

    // Fechar ao clicar fora ou no X / Cancelar
    overlay.addEventListener('click', e => { if (e.target === overlay) fecharModalAtual(); });
    overlay.querySelector('.modal-fechar').addEventListener('click', fecharModalAtual);
    overlay.querySelector('#btnCancelar').addEventListener('click', fecharModalAtual);

    return overlay;
}

function fecharModalAtual() {
    if (modalAtual) {
        modalAtual.remove();
        modalAtual = null;
        document.body.style.overflow = '';
    }
}

// ── Criação / Atualização (Create / Update) ───────────────────────────────────

async function salvarEvento(id) {
    const form = document.getElementById('formEvento');
    if (!validarFormulario(form)) {
        mostrarToast('Preencha os campos obrigatórios.', 'erro');
        return;
    }

    const btn = document.getElementById('btnSalvar');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    // Coleta os dados do formulário
    const payload = {
        titulo: form.titulo.value.trim(),
        data: form.data.value || null,
        horario: form.horario.value || null,
        publico_alvo: form.publico_alvo.value.trim() || null,
        modalidade: form.modalidade.value || null,
        local: form.local.value.trim() || null,
        descricao: form.descricao.value.trim() || null,
        imagem_url: form.imagem_url.value.trim() || null,
    };

    let error;

    if (id) {
        // Atualizar registro existente
        ({ error } = await supabase.from('eventos').update(payload).eq('id', id));
    } else {
        // Criar novo registro
        ({ error } = await supabase.from('eventos').insert([payload]));
    }

    btn.disabled = false;
    btn.textContent = '💾 Salvar';

    if (error) {
        mostrarToast('Erro ao salvar evento: ' + error.message, 'erro');
        return;
    }

    mostrarToast(id ? 'Evento atualizado com sucesso!' : 'Evento cadastrado com sucesso!', 'sucesso');
    fecharModalAtual();
    carregarEventos(); // Recarrega a tabela
}

// ── Exclusão (Delete) ─────────────────────────────────────────────────────────

window.excluirEvento = async function(id, titulo) {
    const confirmado = await confirmarExclusao(titulo);
    if (!confirmado) return;

    const { error } = await supabase.from('eventos').delete().eq('id', id);

    if (error) {
        mostrarToast('Erro ao excluir evento: ' + error.message, 'erro');
        return;
    }

    mostrarToast('Evento excluído com sucesso.', 'sucesso');
    carregarEventos();
};

// ── Utilitário local ──────────────────────────────────────────────────────────

/** Escapa caracteres especiais para uso seguro em atributos HTML */
function escapar(str) {
    return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
