import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const btnEditarPagina = document.getElementById('btnEditarPagina');
    const adminBanner = document.getElementById('adminBanner');
    const adminFormSection = document.getElementById('adminFormSection');
    const conteudoMain = document.getElementById('conteudo');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    const formAdminEdit = document.getElementById('formAdminEdit');
    const rodape = document.getElementById('rodape') || document.querySelector('footer');

    const viewFaqContainer = document.getElementById('view-faq-container');
    const viewFaqRodapeLinks = document.getElementById('view-faq-rodape-links');

    let passosTemporarios = [];

    let dadosFaq = {
        faqs: [
            {
                titulo: "Como renovar a matrícula?",
                desc: "A renovação da matrícula é realizada por meio do sistema acadêmico do IFPE durante o período definido no calendário acadêmico.",
                passos: [
                    "Acesse o sistema acadêmico institucional.",
                    "Faça login com suas credenciais.",
                    "Selecione as disciplinas desejadas.",
                    "Confirme sua solicitação de matrícula.",
                    "Acompanhe o resultado da homologação."
                ]
            },
            {
                titulo: "Aproveitamento de Disciplinas",
                desc: "O aproveitamento de disciplinas permite que componentes curriculares cursados anteriormente sejam analisados para possível equivalência no curso atual.",
                passos: [
                    "Solicite o processo junto à coordenação do curso.",
                    "Apresente histórico escolar atualizado.",
                    "Entregue as ementas das disciplinas cursadas.",
                    "Aguarde a análise da coordenação e dos docentes responsáveis.",
                    "Consulte o resultado do pedido."
                ]
            },
            {
                titulo: "Transferência Interna",
                desc: "A transferência interna permite ao estudante solicitar mudança entre cursos ou campi do IFPE, conforme a disponibilidade de vagas e os critérios definidos em edital.",
                passos: [
                    "Verifique a publicação dos editais vigentes.",
                    "Realize a inscrição dentro do prazo estabelecido.",
                    "Envie toda a documentação exigida.",
                    "Aguarde a análise da solicitação.",
                    "Consulte o resultado final do processo."
                ]
            }
        ]
    };

    function gerarIdBaseadoNoTitulo(titulo) {
        return "faq-" + titulo.toLowerCase()
            .replace(/[áàãâä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[íìîï]/g, 'i')
            .replace(/[óòõôö]/g, 'o')
            .replace(/[úùûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/\\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }

    async function carregarConteudo() {
        const { data, error } = await supabase
            .from('page_content')
            .select('content')
            .eq('page', 'faq')
            .single();

        if (data && data.content) {
            dadosFaq = { ...dadosFaq, ...data.content };
        }
        renderizarPublico();
    }

    function renderizarPublico() {
        viewFaqContainer.innerHTML = '';
        viewFaqRodapeLinks.innerHTML = '';

        if (dadosFaq.faqs.length === 0) {
            viewFaqContainer.innerHTML = '<p style="text-align:center; color:#666;">Nenhuma pergunta frequente cadastrada.</p>';
            viewFaqRodapeLinks.innerHTML = '<p>Nenhum atalho.</p>';
            return;
        }

        dadosFaq.faqs.forEach(f => {
            const idTag = gerarIdBaseadoNoTitulo(f.titulo);

            let htmlCard = `
            <article id="${idTag}" class="faq-card" style="background-color:#fff; padding:20px; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.05); margin-bottom:20px;">
                <h3 style="color:#252b73; margin-top:0;">${f.titulo}</h3>
                <p style="color:#555; line-height:1.6;">${f.desc.replace(/\\n/g, '<br>')}</p>
            `;

            if (f.passos && f.passos.length > 0) {
                htmlCard += `<ol style="color:#444; margin-left:20px; line-height:1.6;">`;
                f.passos.forEach(p => {
                    htmlCard += `<li>${p}</li>`;
                });
                htmlCard += `</ol>`;
            }

            htmlCard += `</article>`;
            viewFaqContainer.innerHTML += htmlCard;

            viewFaqRodapeLinks.innerHTML += `<a href="faq.html#${idTag}">${f.titulo}</a>`;
        });
    }

    await carregarConteudo();

    const { data: { session } } = await supabase.auth.getSession();
    if (session) adminBanner.style.display = 'block';

    btnEditarPagina.addEventListener('click', () => {
        passosTemporarios = [];
        renderizarListaPassosTemp();
        renderizarListaAdmin();

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


    document.getElementById('btnAddPasso').addEventListener('click', () => {
        const val = document.getElementById('input-faq-passo').value.trim();
        if (val) {
            passosTemporarios.push(val);
            document.getElementById('input-faq-passo').value = '';
            renderizarListaPassosTemp();
        }
    });

    function renderizarListaPassosTemp() {
        const ul = document.getElementById('admin-lista-passos-temp');
        ul.innerHTML = '';
        passosTemporarios.forEach((p, index) => {
            ul.innerHTML += `<li style="margin-bottom:5px;">
                ${p}
                <button type="button" class="btn-remover-passo" data-index="${index}" style="margin-left:10px; color:red; border:none; background:none; cursor:pointer;">(x)</button>
            </li>`;
        });
        ul.querySelectorAll('.btn-remover-passo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                passosTemporarios.splice(idx, 1);
                renderizarListaPassosTemp();
            });
        });
    }

    document.getElementById('btnAddFaq').addEventListener('click', () => {
        const titulo = document.getElementById('input-faq-titulo').value.trim();
        const desc = document.getElementById('input-faq-desc').value.trim();

        if (!titulo || !desc) {
            alert("Preencha ao menos a Pergunta e a Resposta base.");
            return;
        }

        dadosFaq.faqs.push({
            titulo: titulo,
            desc: desc,
            passos: [...passosTemporarios]
        });

        document.getElementById('input-faq-titulo').value = '';
        document.getElementById('input-faq-desc').value = '';
        passosTemporarios = [];
        renderizarListaPassosTemp();
        renderizarListaAdmin();
    });

    function renderizarListaAdmin() {
        const ul = document.getElementById('admin-lista-faqs');
        ul.innerHTML = '';
        
        if (dadosFaq.faqs.length === 0) {
            ul.innerHTML = '<li style="color:#666; font-size:0.9em;">Nenhuma pergunta cadastrada.</li>';
            return;
        }

        dadosFaq.faqs.forEach((f, index) => {
            const li = document.createElement('li');
            li.style.marginBottom = '10px';
            li.style.padding = '10px';
            li.style.border = '1px solid #ddd';
            li.style.borderRadius = '4px';

            li.innerHTML = `
                <strong>${f.titulo}</strong> <br>
                <span style="font-size:0.85em; color:#555;">Passos: ${f.passos ? f.passos.length : 0}</span><br>
                <button type="button" class="btn-remover-faq" data-index="${index}" style="margin-top:8px; background-color: #c0392b; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px;">Remover FAQ</button>
            `;
            ul.appendChild(li);
        });

        ul.querySelectorAll('.btn-remover-faq').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                dadosFaq.faqs.splice(idx, 1);
                renderizarListaAdmin();
            });
        });
    }

    formAdminEdit.addEventListener('submit', async (e) => {
        e.preventDefault();

        const { error } = await supabase
            .from('page_content')
            .upsert({ page: 'faq', content: dadosFaq });

        if (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar no banco de dados.");
            return;
        }

        renderizarPublico();

        adminFormSection.style.display = 'none';
        conteudoMain.style.display = 'block';
        adminBanner.style.display = 'block';
        if (rodape) rodape.style.display = '';
        alert("FAQ atualizado com sucesso!");
    });
});
