/**
 * docentes.js
 * CRUD completo para gerenciamento de Docentes.
 *
 * Tabela Supabase: docentes
 * Campos: id, nome, titulacao, disciplinas, email_institucional,
 *         foto, lattes, area_atuacao, descricao_profissional,
 *         created_at, updated_at
 *
 * Padrão de código: idêntico aos demais módulos admin (eventos.js,
 * monitorias.js etc.) para manter consistência total do projeto.
 */

import { supabase } from './supabase.js';
import {
    mostrarToast,
    validarFormulario,
    limparErrosAoDigitar,
    truncar,
    confirmarExclusao,
} from './admin-utils.js';

// ── Estado local ──────────────────────────────────────────────────────────────

let todosDocentes = [];   // Cache dos docentes carregados do banco
let modalAtual = null;    // Referência ao overlay do modal aberto

// ── Inicialização da página ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    carregarDocentes();

    // Botão "Novo Docente"
    document.getElementById('btnNovoDocente')
        .addEventListener('click', () => abrirModal('Novo Docente', {}, null));

    // Filtros em tempo real
    document.getElementById('filtroBusca')
        .addEventListener('input', filtrarTabela);
    document.getElementById('filtroTitulacao')
        .addEventListener('change', filtrarTabela);
});

// ══════════════════════════════════════════════════════════════════════════════
// READ — Carregamento e renderização
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Busca todos os docentes do Supabase e popula a tabela.
 */
async function carregarDocentes() {
    const tbody = document.getElementById('corpoTabelaDocentes');
    tbody.innerHTML = '<tr><td colspan="7" class="tabela-loading">Carregando docentes...</td></tr>';

    const { data, error } = await supabase
        .from('docentes')
        .select('*')
        .order('nome', { ascending: true });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="tabela-vazia">Erro ao carregar docentes.</td></tr>';
        mostrarToast('Erro ao carregar docentes: ' + error.message, 'erro');
        return;
    }

    todosDocentes = data || [];
    filtrarTabela(); // Renderiza respeitando os filtros ativos
}

/**
 * Renderiza a lista de docentes na tabela.
 * @param {Array} docentes - Array de objetos docente
 */
function renderizarTabela(docentes) {
    const tbody = document.getElementById('corpoTabelaDocentes');

    if (!docentes.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="tabela-vazia">Nenhum docente encontrado.</td></tr>';
        return;
    }

    tbody.innerHTML = docentes.map(d => {
        // Foto: exibe miniatura circular ou ícone placeholder
        const fotoHtml = d.foto
            ? `<img src="${escapar(d.foto)}" alt="Foto de ${escapar(d.nome)}" class="foto-tabela"
                    onerror="this.outerHTML='<div class=\\"avatar-placeholder\\">👤</div>'">`
            : `<div class="avatar-placeholder">👤</div>`;

        return `
            <tr>
                <td>${fotoHtml}</td>
                <td><strong>${d.nome || '—'}</strong></td>
                <td>${d.titulacao || '—'}</td>
                <td>${truncar(d.area_atuacao, 35)}</td>
                <td>${truncar(d.disciplinas, 40)}</td>
                <td>
                    ${d.email_institucional
                        ? `<a href="mailto:${escapar(d.email_institucional)}"
                              style="color:#252b73;font-size:0.85rem">
                               ${d.email_institucional}
                           </a>`
                        : '—'}
                </td>
                <td>
                    <div class="acoes-celula">
                        <button class="btn-edit"
                                onclick="editarDocente(${d.id})">✏️ Editar</button>
                        <button class="btn-danger"
                                onclick="excluirDocente(${d.id}, '${escapar(d.nome)}')">🗑️ Excluir</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ── Filtros ───────────────────────────────────────────────────────────────────

/**
 * Filtra o array em cache e re-renderiza a tabela.
 * Aplica busca textual + filtro de titulação simultaneamente.
 */
function filtrarTabela() {
    const busca      = document.getElementById('filtroBusca').value.toLowerCase();
    const titulacao  = document.getElementById('filtroTitulacao').value;

    const filtrados = todosDocentes.filter(d => {
        const bateBusca = !busca
            || d.nome?.toLowerCase().includes(busca)
            || d.disciplinas?.toLowerCase().includes(busca)
            || d.area_atuacao?.toLowerCase().includes(busca);

        const bateTitulacao = !titulacao || d.titulacao === titulacao;

        return bateBusca && bateTitulacao;
    });

    renderizarTabela(filtrados);
}

// ══════════════════════════════════════════════════════════════════════════════
// FORMULÁRIO — HTML do modal de cadastro/edição
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Gera o HTML interno do formulário de docente.
 * Preenche os campos quando chamado no modo edição.
 * @param {Object} d - Dados do docente (vazio para novo)
 * @returns {string} HTML do formulário
 */
function htmlFormulario(d = {}) {
    // Determina quais elementos de preview mostrar na abertura
    const temFoto = !!d.foto;

    return `
        <form id="formDocente" novalidate>
            <div class="form-grid">

                <!-- Nome -->
                <div class="form-group full">
                    <label for="nome" class="required">Nome completo</label>
                    <input type="text" id="nome" name="nome" required
                           maxlength="200"
                           value="${escapar(d.nome || '')}"
                           placeholder="Ex: Prof. Dr. João da Silva">
                    <span class="msg-erro">Campo obrigatório.</span>
                </div>

                <!-- Titulação -->
                <div class="form-group">
                    <label for="titulacao" class="required">Titulação</label>
                    <select id="titulacao" name="titulacao" required>
                        <option value="">Selecione...</option>
                        <option value="Especialista"  ${d.titulacao === 'Especialista'  ? 'selected' : ''}>Especialista</option>
                        <option value="Mestre"        ${d.titulacao === 'Mestre'        ? 'selected' : ''}>Mestre</option>
                        <option value="Doutor"        ${d.titulacao === 'Doutor'        ? 'selected' : ''}>Doutor</option>
                        <option value="Pós-Doutor"    ${d.titulacao === 'Pós-Doutor'    ? 'selected' : ''}>Pós-Doutor</option>
                    </select>
                    <span class="msg-erro">Selecione a titulação.</span>
                </div>

                <!-- Área de atuação -->
                <div class="form-group">
                    <label for="area_atuacao">Área de atuação</label>
                    <input type="text" id="area_atuacao" name="area_atuacao"
                           value="${escapar(d.area_atuacao || '')}"
                           placeholder="Ex: Engenharia de Software">
                </div>

                <!-- Disciplinas -->
                <div class="form-group full">
                    <label for="disciplinas" class="required">Disciplinas</label>
                    <input type="text" id="disciplinas" name="disciplinas" required
                           value="${escapar(d.disciplinas || '')}"
                           placeholder="Ex: Programação Web, Banco de Dados">
                    <span class="msg-erro">Campo obrigatório.</span>
                    <span class="file-note">Separe as disciplinas por vírgula.</span>
                </div>

                <!-- E-mail institucional -->
                <div class="form-group full">
                    <label for="email_institucional">E-mail institucional</label>
                    <input type="email" id="email_institucional" name="email_institucional"
                           value="${escapar(d.email_institucional || '')}"
                           placeholder="professor@ifpe.edu.br">
                </div>

                <!-- Lattes -->
                <div class="form-group full">
                    <label for="lattes">Currículo Lattes (URL)</label>
                    <input type="url" id="lattes" name="lattes"
                           value="${escapar(d.lattes || '')}"
                           placeholder="http://lattes.cnpq.br/...">
                </div>

                <!-- Foto (URL) com preview -->
                <div class="form-group full">
                    <label for="foto">URL da Foto</label>
                    <input type="url" id="foto" name="foto"
                           value="${escapar(d.foto || '')}"
                           placeholder="https://...">
                    <span class="file-note">Cole a URL pública da foto (JPG ou PNG). Deixe em branco para usar avatar padrão.</span>

                    <!-- Preview de foto em tempo real -->
                    <div class="foto-preview-container">
                        <img id="fotoPreviewImg"
                             src="${escapar(d.foto || '')}"
                             alt="Preview da foto"
                             class="foto-preview${temFoto ? '' : ' oculto'}"
                             onerror="this.classList.add('oculto'); document.getElementById('avatarPreviewPlaceholder').classList.remove('oculto');">
                        <div id="avatarPreviewPlaceholder"
                             class="avatar-preview-placeholder${temFoto ? ' oculto' : ''}">👤</div>
                        <span style="font-size:0.82rem;color:#64748b">
                            ${temFoto ? 'Foto atual' : 'Sem foto cadastrada'}
                        </span>
                    </div>
                </div>

                <!-- Descrição profissional -->
                <div class="form-group full">
                    <label for="descricao_profissional">Descrição profissional</label>
                    <textarea id="descricao_profissional" name="descricao_profissional"
                              rows="4"
                              placeholder="Breve descrição sobre a atuação, pesquisas e experiência do docente...">${d.descricao_profissional || ''}</textarea>
                </div>

            </div>
        </form>
    `;
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL — abertura, construção e fechamento
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Abre o modal de cadastro ou edição de docente.
 * @param {string} titulo  - Título exibido no cabeçalho do modal
 * @param {Object} dados   - Dados pré-preenchidos (vazio para novo)
 * @param {number|null} id - ID do docente para edição; null para novo
 */
function abrirModal(titulo, dados, id) {
    const overlay = construirModal(titulo, htmlFormulario(dados));
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    modalAtual = overlay;

    // Ativa remoção de erro ao digitar
    limparErrosAoDigitar(overlay.querySelector('#formDocente'));

    // Preview de foto ao alterar a URL
    overlay.querySelector('#foto')
        .addEventListener('input', atualizarPreviewFoto);

    // Botão salvar
    overlay.querySelector('#btnSalvar')
        .addEventListener('click', () => salvarDocente(id));
}

/**
 * Constrói o overlay + modal com cabeçalho azul e rodapé de ações.
 * Mesmo padrão dos outros módulos (criarModalLocal).
 * @param {string} titulo
 * @param {string} corpoHTML
 * @returns {HTMLElement} overlay
 */
function construirModal(titulo, corpoHTML) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal modal-docente" role="dialog" aria-modal="true" aria-label="${titulo}">
            <div class="modal-header">
                <h3>${titulo}</h3>
                <button class="modal-fechar" aria-label="Fechar modal">&times;</button>
            </div>
            <div class="modal-body">${corpoHTML}</div>
            <div class="modal-footer">
                <button class="btn-secondary" id="btnCancelar">Cancelar</button>
                <button class="btn-primary"   id="btnSalvar">💾 Salvar</button>
            </div>
        </div>
    `;

    // Fecha ao clicar fora do modal
    overlay.addEventListener('click', e => {
        if (e.target === overlay) fecharModalAtual();
    });

    overlay.querySelector('.modal-fechar')
        .addEventListener('click', fecharModalAtual);
    overlay.querySelector('#btnCancelar')
        .addEventListener('click', fecharModalAtual);

    return overlay;
}

/** Remove o modal do DOM e restaura o scroll da página. */
function fecharModalAtual() {
    if (modalAtual) {
        modalAtual.remove();
        modalAtual = null;
        document.body.style.overflow = '';
    }
}

/**
 * Atualiza o preview de foto quando o usuário altera a URL no campo.
 */
function atualizarPreviewFoto() {
    const url = document.getElementById('foto').value.trim();
    const img = document.getElementById('fotoPreviewImg');
    const placeholder = document.getElementById('avatarPreviewPlaceholder');

    if (url) {
        img.src = url;
        img.classList.remove('oculto');
        placeholder.classList.add('oculto');
    } else {
        img.classList.add('oculto');
        placeholder.classList.remove('oculto');
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// CREATE / UPDATE — Salvar docente
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Coleta os dados do formulário, valida e persiste no Supabase.
 * Decide entre INSERT (id === null) e UPDATE (id !== null).
 * @param {number|null} id - ID do docente a atualizar; null para criar
 */
async function salvarDocente(id) {
    const form = document.getElementById('formDocente');

    // Validação de campos obrigatórios
    if (!validarFormulario(form)) {
        mostrarToast('Preencha os campos obrigatórios antes de salvar.', 'erro');
        return;
    }

    // Desabilita o botão durante a requisição
    const btn = document.getElementById('btnSalvar');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    // Monta o payload com todos os campos do formulário
    const payload = {
        nome:                   form.nome.value.trim(),
        titulacao:              form.titulacao.value,
        disciplinas:            form.disciplinas.value.trim(),
        area_atuacao:           form.area_atuacao.value.trim()           || null,
        email_institucional:    form.email_institucional.value.trim()    || null,
        lattes:                 form.lattes.value.trim()                 || null,
        foto:                   form.foto.value.trim()                   || null,
        descricao_profissional: form.descricao_profissional.value.trim() || null,
    };

    let error;

    if (id) {
        // ── UPDATE ──
        ({ error } = await supabase
            .from('docentes')
            .update(payload)
            .eq('id', id));
    } else {
        // ── INSERT ──
        ({ error } = await supabase
            .from('docentes')
            .insert([payload]));
    }

    // Restaura o botão
    btn.disabled = false;
    btn.textContent = '💾 Salvar';

    if (error) {
        mostrarToast('Erro ao salvar: ' + error.message, 'erro');
        return;
    }

    mostrarToast(
        id ? 'Docente atualizado com sucesso!' : 'Docente cadastrado com sucesso!',
        'sucesso'
    );
    fecharModalAtual();
    carregarDocentes(); // Recarrega a tabela com os dados atualizados
}

// ══════════════════════════════════════════════════════════════════════════════
// UPDATE — Abrir modal preenchido para edição
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Busca o docente no cache local e abre o modal de edição.
 * Exposto globalmente para uso nos botões gerados via innerHTML.
 * @param {number} id
 */
window.editarDocente = function (id) {
    const docente = todosDocentes.find(d => d.id === id);
    if (!docente) {
        mostrarToast('Docente não encontrado. Recarregue a página.', 'erro');
        return;
    }
    abrirModal('Editar Docente', docente, id);
};

// ══════════════════════════════════════════════════════════════════════════════
// DELETE — Excluir docente
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Exibe a confirmação e, se aceito, exclui o docente do Supabase.
 * Exposto globalmente para uso nos botões gerados via innerHTML.
 * @param {number} id
 * @param {string} nome - Nome do docente (exibido na confirmação)
 */
window.excluirDocente = async function (id, nome) {
    const confirmado = await confirmarExclusao(nome);
    if (!confirmado) return;

    const { error } = await supabase
        .from('docentes')
        .delete()
        .eq('id', id);

    if (error) {
        mostrarToast('Erro ao excluir: ' + error.message, 'erro');
        return;
    }

    mostrarToast('Docente excluído com sucesso.', 'sucesso');
    carregarDocentes();
};

// ══════════════════════════════════════════════════════════════════════════════
// UTILITÁRIO LOCAL
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Escapa caracteres especiais para uso seguro em atributos HTML inline.
 * Evita quebra de template string ao inserir dados do banco no HTML.
 * @param {*} str
 * @returns {string}
 */
function escapar(str) {
    return String(str || '')
        .replace(/&/g,  '&amp;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#39;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;');
}
