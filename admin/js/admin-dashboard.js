/**
 * admin-dashboard.js
 * Carrega os totais de cada entidade para exibir no painel inicial.
 */

import { supabase } from './supabase.js';

// ── Funções de contagem ───────────────────────────────────────────────────────

async function carregarEstatisticas() {
    try {
        // Contagem paralela de todas as tabelas
        const [eventos, horariosTurmas, labs, projetos, monitorias, docentes] = await Promise.all([
            supabase.from('eventos').select('id', { count: 'exact', head: true }),
            supabase.from('horarios_turmas').select('id', { count: 'exact', head: true }),
            supabase.from('horarios_laboratorios').select('id', { count: 'exact', head: true }),
            supabase.from('projetos').select('id', { count: 'exact', head: true }),
            supabase.from('monitorias').select('id', { count: 'exact', head: true }),
            supabase.from('docentes').select('id', { count: 'exact', head: true }),
        ]);

        definirContador('totalEventos', eventos.count);
        definirContador('totalHorariosTurmas', horariosTurmas.count);
        definirContador('totalLabs', labs.count);
        definirContador('totalProjetos', projetos.count);
        definirContador('totalMonitorias', monitorias.count);
        definirContador('totalDocentes', docentes.count);

    } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
        // Mostra "?" em caso de falha para não deixar "--" indefinidamente
        ['totalEventos', 'totalHorariosTurmas', 'totalLabs', 'totalProjetos', 'totalMonitorias', 'totalDocentes']
            .forEach(id => definirContador(id, '?'));
    }
}

/**
 * Define o texto de um elemento de contador.
 * @param {string} elementId
 * @param {number|string} valor
 */
function definirContador(elementId, valor) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = valor ?? '0';
}

// ── Inicialização ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', carregarEstatisticas);
