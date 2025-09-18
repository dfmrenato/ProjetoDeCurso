// Página acessível apenas para usuários logados
if(!sessionStorage.getItem('UsuarioLogado')) {
    location.replace('./.');
}

// Abrir aba
document.getElementById('BotaoBarraLateralAbrir').addEventListener('click', () => {
    document.getElementById('BarraLateral').classList.toggle('aberta')
});
document.getElementById('BarraLateral').addEventListener('mouseenter', () => {
    document.getElementById('BarraLateral').classList.add('aberta')
});
document.getElementById('BarraLateral').addEventListener('mouseleave', () => {
    document.getElementById('BarraLateral').classList.remove('aberta')
});

// Selecionar uma aba
const Abas = Array.from(document.getElementsByClassName('BarraLateralItem')).filter(aba => aba.onclick == null);
const CorpoAbas = Array.from(document.getElementsByClassName('CorpoAba'));
Abas.forEach(aba => {
    aba.addEventListener('click', () => {

        Abas.forEach((aba2) => {
            if (aba2.classList.contains('ativo')) {
                aba2.classList.remove('ativo');
            };
        });

        CorpoAbas.forEach((aba2) => {
            if (aba2.classList.contains('ativo')) {
                aba2.classList.remove('ativo');
            };
        });

        aba.classList.add('ativo');
        CorpoAbas.find(caba => caba.id.replace("Corpo","Lateral") == aba.children.namedItem('span').id).classList.add('ativo');

    });
});

// Aba pelo link
let AbaPadrao = Abas.find(aba => window.location.hash.replace("#","").startsWith(aba.children.namedItem('span').id.replace("LateralAba","")));
if(AbaPadrao) {
    let aba = AbaPadrao;
    aba.classList.add('ativo');
    CorpoAbas.find(caba => caba.id.replace("Corpo","Lateral") == aba.children.namedItem('span').id).classList.add('ativo');
} else {
    let aba = Abas.find(aba => aba.children.namedItem('span').id == "LateralAbaInicio");
    aba.classList.add('ativo');
    CorpoAbas.find(caba => caba.id.replace("Corpo","Lateral") == aba.children.namedItem('span').id).classList.add('ativo');
}

/// Funcionários 

// Abrir caixa de adição de funcionário
document.getElementById("BotaoAdicionarFuncionario").addEventListener('click', (event) => {
    document.getElementById("DashboardFormularioFuncionario").classList.add("ativo");
});
document.getElementById("CancelarFuncionarioBotao").addEventListener('click', (event) => {
    document.getElementById("DashboardFormularioFuncionario").classList.remove("ativo");
});

// Adicionar funcionários 
document.getElementById('AdicionarFuncionario').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const nome = document.getElementById('AdicionarFuncionario').elements["nome"].value;
    const funcao = document.getElementById('AdicionarFuncionario').elements["funcao"].value;
    const empresa = sessionStorage.getItem('UsuarioLogadoEmpresa');
    const email = document.getElementById('AdicionarFuncionario').elements["email"].value;
    const senha = document.getElementById('AdicionarFuncionario').elements["senha"].value;
    const data_criacao = new Date();
    const tipo = "funcionario";

    // Criar funcionário
    try {
        // Comunicação com o backend
        const response = await fetch('https://evolved-legible-spider.ngrok-free.app/add-funcionario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha, empresa, funcao, data_criacao })
        });

        const data = await response.json();
        
        if(data.errorMessage) return Notificar(`Erro de cadastro`, `${data.errorMessage}`, 'OK');

        if (!response.ok) {
            throw new Error('Falha na solicitação');
        }

        // Código específico
        console.log('Funcionário adicionado:', data);
        window.location.reload();
        
    } catch (error) {
        console.error(error);
        Notificar('Erro ao realizar cadastro', error, 'OK');
    }

});

// Pegar funcionários
async function obterFuncionarios(filtrar=false, filtro_tipo="", filtro_valor="") {
    let empresa = sessionStorage.getItem('UsuarioLogadoEmpresa');
    try {
        // Comunicação com o backend
        const response = await fetch('https://evolved-legible-spider.ngrok-free.app/obter-funcionarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ empresa })
        });

        const data = await response.json();

        if(data.errorMessage) Notificar(`Erro de requisição de funcionários`, `${data.errorMessage}`, 'OK');

        if (!response.ok) {
            throw new Error('Falha na solicitação');
        }

        let funcionarios_local = data.funcionarios.sort((a, b) => a.nome.localeCompare(b.nome));

        if(filtrar) {
            switch (filtro_tipo) {
                case "nome":
                    funcionarios_local = funcionarios_local.sort((a, b) => a.nome.localeCompare(b.nome)).filter(func => func.nome.toUpperCase().includes(filtro_valor.toUpperCase()));
                    break;

                case "funcao":
                    funcionarios_local = funcionarios_local.sort((a, b) => a.funcao.localeCompare(b.funcao)).filter(func => func.funcao.toUpperCase().includes(filtro_valor.toUpperCase()));
                    break;

                case "data":
                    funcionarios_local = funcionarios_local.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));
                    break;
            
                default:
                    funcionarios_local = funcionarios_local.sort((a, b) => a.nome.localeCompare(b.nome));
                    break;
            };
        };

        document.getElementById('FuncionariosLista').innerHTML = "";

        funcionarios_local.forEach(funcionario => {

            let datafunc = new Date(funcionario.data_criacao);

            document.getElementById('FuncionariosLista').innerHTML +=
            `<div>
            <h2>${funcionario.nome}</h2>
            <h4>${funcionario.funcao}</h4>
            ${funcionario.email}
            <h4>Funcionário desde ${datafunc.getDate()}/${datafunc.getMonth()+1}/${datafunc.getFullYear()}</h4>
            </div>`;

        })

    } catch (error) {
        console.error(error);
        Notificar('Erro ao obter funcionários', error, 'OK');
    }
}
obterFuncionarios();

// Pesquisar funcionários
document.getElementById('FuncionariosPesquisa').addEventListener('submit', async (event) => {
    event.preventDefault();

    obterFuncionarios(true, document.getElementById('FuncionariosPesquisa').elements["classificar"].value, document.getElementById('FuncionariosPesquisa').elements["pesquisa"].value);

})

/// Produtos

// Abrir caixa de adição de produtos
document.getElementById("BotaoAdicionarProduto").addEventListener('click', (event) => {
    document.getElementById("DashboardFormularioProduto").classList.add("ativo");
});
document.getElementById("CancelarProdutoBotao").addEventListener('click', (event) => {
    document.getElementById("DashboardFormularioProduto").classList.remove("ativo");
});

/// Gemini

// Mensagem inicial
(async () => {

    const empresa = sessionStorage.getItem('UsuarioLogadoEmpresa');
    const data_envio = new Date().toLocaleDateString('pt-BR');
    const mensagem = "Você é um assistente virtual de IA especializado em ajudar usuários com suas dúvidas e tarefas. Você deve responder de forma clara, objetiva e amigável. Você não deve fazer perguntas desnecessárias ou fornecer informações irrelevantes. Você deve sempre tentar ajudar o usuário da melhor forma possível. Faça uma breve mensagem de boas vindas se introduzindo para o usuário dono da empresa "+empresa+". São exatamente "+data_envio+" agora.";

    try {

        // Comunicação com o backend
        const response = await fetch('https://evolved-legible-spider.ngrok-free.app/gemini-perguntar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mensagem, empresa, data_envio })
        });

        const data = await response.json();

        if(data.errorMessage) return;

        if (!response.ok) {
            throw new Error('Falha na solicitação');
        }

        // Código específico
        document.getElementById('GeminiFormulario').elements["mensagem"].value = "";
        document.getElementById('GeminiResposta').innerHTML = data.resposta;

    } catch (error) {
        console.error(error);
        Notificar('Erro ao enviar mensagem', error, 'OK');
    };
})();

// Enviar mensagem para o Gemini
document.getElementById('GeminiFormulario').addEventListener('submit', async (event) => {
    event.preventDefault();

    const mensagem = document.getElementById('GeminiFormulario').elements["mensagem"].value;
    const empresa = sessionStorage.getItem('UsuarioLogadoEmpresa');
    const data_envio = new Date().toLocaleDateString('pt-BR');

    // Enviar mensagem
    try {
        // Comunicação com o backend
        const response = await fetch('https://evolved-legible-spider.ngrok-free.app/gemini-perguntar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mensagem, empresa, data_envio })
        });

        const data = await response.json();

        if(data.errorMessage) return Notificar(`Erro ao enviar mensagem`, `${data.errorMessage}`, 'OK');

        if (!response.ok) {
            throw new Error('Falha na solicitação');
        }

        // Código específico
        document.getElementById('GeminiFormulario').elements["mensagem"].value = "";
        document.getElementById('GeminiResposta').innerHTML = data.resposta;

    } catch (error) {
        console.error(error);
        Notificar('Erro ao enviar mensagem', error, 'OK');
    };
});