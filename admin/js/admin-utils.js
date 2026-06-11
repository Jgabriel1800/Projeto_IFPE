/**
 * admin-utils.js
 * Funções utilitárias compartilhadas por todas as páginas administrativas.
 * Inclui: toasts, validação de formulários, formatação de datas.
 */

// ── Sistema de Toast (mensagens de feedback) ──────────────────────────────────

/**
 * Exibe uma mensagem toast na tela.
 * @param {string} mensagem - Texto da mensagem
 * @param {'sucesso'|'erro'|'info'} tipo - Tipo de toast
 * @param {number} duracao - Duração em ms (padrão: 4000)
 */
export function mostrarToast(mensagem, tipo = 'info', duracao = 4000) {
    // Garante que o container existe
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icones = {
        sucesso: '✅',
        erro: '❌',
        info: 'ℹ️',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <span class="toast-icone">${icones[tipo] || 'ℹ️'}</span>
        <span>${mensagem}</span>
    `;

    container.appendChild(toast);

    // Remove após a duração configurada
    setTimeout(() => {
        toast.style.animation = 'none';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(60px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duracao);
}

// ── Validação de formulários ──────────────────────────────────────────────────

/**
 * Valida os campos obrigatórios de um formulário.
 * Marca os campos inválidos com a classe CSS 'invalido'.
 * @param {HTMLFormElement} form - Formulário a validar
 * @returns {boolean} true se o formulário é válido
 */
export function validarFormulario(form) {
    let valido = true;

    // Limpa estados anteriores
    form.querySelectorAll('.invalido').forEach(el => el.classList.remove('invalido'));

    // Valida campos obrigatórios
    form.querySelectorAll('[required]').forEach(campo => {
        if (!campo.value.trim()) {
            campo.classList.add('invalido');
            valido = false;
        }
    });

    return valido;
}

/**
 * Remove a marcação de erro de um campo ao começar a digitar.
 * @param {HTMLFormElement} form
 */
export function limparErrosAoDigitar(form) {
    form.querySelectorAll('input, select, textarea').forEach(campo => {
        campo.addEventListener('input', () => campo.classList.remove('invalido'));
        campo.addEventListener('change', () => campo.classList.remove('invalido'));
    });
}

// ── Formatação ────────────────────────────────────────────────────────────────

/**
 * Formata uma string de data ISO para o formato brasileiro DD/MM/AAAA.
 * @param {string} dataISO - Data no formato ISO (YYYY-MM-DD)
 * @returns {string}
 */
export function formatarData(dataISO) {
    if (!dataISO) return '—';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

/**
 * Trunca um texto longo para exibição em tabelas.
 * @param {string} texto
 * @param {number} maxLen
 * @returns {string}
 */
export function truncar(texto, maxLen = 60) {
    if (!texto) return '—';
    return texto.length > maxLen ? texto.substring(0, maxLen) + '…' : texto;
}

// ── Modal ────────────────────────────────────────────────────────────────────

/**
 * Abre um modal adicionando-o ao DOM e travando o scroll.
 * @param {HTMLElement} modalEl
 */
export function abrirModal(modalEl) {
    document.body.appendChild(modalEl);
    document.body.style.overflow = 'hidden';
}

/**
 * Fecha e remove um modal do DOM, restaurando o scroll.
 * @param {HTMLElement} modalEl
 */
export function fecharModal(modalEl) {
    modalEl.remove();
    document.body.style.overflow = '';
}

/**
 * Cria a estrutura base de um modal.
 * @param {string} titulo - Título do modal
 * @param {string} conteudoHTML - HTML interno do body do modal
 * @returns {HTMLElement} overlay com o modal
 */
export function criarModal(titulo, conteudoHTML) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-label="${titulo}">
            <div class="modal-header">
                <h3>${titulo}</h3>
                <button class="modal-fechar" aria-label="Fechar modal">&times;</button>
            </div>
            <div class="modal-body">
                ${conteudoHTML}
            </div>
            <div class="modal-footer" id="modalFooter"></div>
        </div>
    `;

    // Fechar ao clicar no overlay
    overlay.addEventListener('click', e => {
        if (e.target === overlay) fecharModal(overlay);
    });

    // Fechar ao clicar no X
    overlay.querySelector('.modal-fechar').addEventListener('click', () => fecharModal(overlay));

    return overlay;
}

// ── Confirmação de exclusão ───────────────────────────────────────────────────

/**
 * Exibe um modal de confirmação antes de excluir.
 * @param {string} nomeItem - Nome do item a ser excluído
 * @returns {Promise<boolean>} true se o usuário confirmou
 */
export function confirmarExclusao(nomeItem) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" style="max-width:420px">
                <div class="modal-header" style="background:#ef4444">
                    <h3>Confirmar Exclusão</h3>
                    <button class="modal-fechar">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="font-size:1rem;color:#374151">
                        Deseja realmente excluir <strong>${nomeItem}</strong>?
                        <br><span style="color:#ef4444;font-size:0.85rem">Esta ação não pode ser desfeita.</span>
                    </p>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="btnCancelar">Cancelar</button>
                    <button class="btn-danger" id="btnConfirmar">Excluir</button>
                </div>
            </div>
        `;

        overlay.querySelector('.modal-fechar').addEventListener('click', () => {
            overlay.remove();
            resolve(false);
        });
        overlay.querySelector('#btnCancelar').addEventListener('click', () => {
            overlay.remove();
            resolve(false);
        });
        overlay.querySelector('#btnConfirmar').addEventListener('click', () => {
            overlay.remove();
            resolve(true);
        });

        document.body.appendChild(overlay);
    });
}
