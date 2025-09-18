// Importações
const { GoogleGenAI } = require('@google/genai');
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ngrok = require("@ngrok/ngrok");
const emailjs = require('@emailjs/nodejs');
require('dotenv').config();

// Função enviar email
function EnviarEmail(assunto="Assunto", mensagem="Mensagem", remetente="Business PRO", destinatario="undefined", template="template_8qj7bar") {
    if(destinatario=="undefined") return false;
    return emailjs.send('service_mr1z653', template, {
        subject: assunto,
        message: mensagem,
        email: destinatario,
        name: remetente
    }, {
        publicKey: process.env.EMAILJS_PUBLICKEY,
        privateKey: process.env.EMAILJS_PRIVATEKEY
    }).then(
        (response) => {
            console.log('Envio de email SUCESSO!', response.status, response.text);
        },
        (error) => {
            console.log('Envio de email FALHOU...', error);
        },
    );
};

// Definições
const app = express();
const port = process.env.BACKEND_PORTA; 

// Configuração do CORS para permitir o frontend específico
const corsOptions = {
    origin: 'https://dfmrenato.github.io', // Permite requisições apenas deste site
    methods: 'GET,POST', // Métodos permitidos
    allowedHeaders: 'Content-Type',
};

app.use(cors(corsOptions)); // Middleware principal de CORS

// Permite requisições preflight (importante para o navegador validar permissões antes da requisição real)
app.options('*', cors(corsOptions));

// Middleware para aceitar JSON
app.use(express.json());

// Conectar ao MongoDB usando o link de conexão fornecido
const uri = process.env.MONGODB_URI;

// Conectar ao MongoDB
const client = MongoClient.connect(uri);
client.then((client) => {
    db = client.db('businesspro');  // Acessa o banco de dados padrão
    console.log('Conectado ao MongoDB');
}).catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error);
});

// Rota de exemplo
app.get('/', (req, res) => {
    res.send('Olá, mundo! Conectado ao MongoDB!');
});

// Rota para adicionar um usuário (início da verificação do email)
app.post('/register-email', async (req, res) => {
    const { nome, empresa, email, senha, data_criacao } = req.body;

    try {
        if (!nome || !empresa || !email || !senha || !data_criacao) {
            return res.status(400).json({ errorMessage: 'Nome, empresa, email e senha são obrigatórios' });
        }

        const usersCollection = db.collection('temporario');

        // Verifica se o e-mail ou empresa já existe no banco de dados
        if (await db.collection('funcionarios').findOne({ email }) || await db.collection('usuarios').findOne({ email }) || await db.collection('usuarios').findOne({ empresa })) {
            return res.status(409).json({ errorMessage: 'Já existe uma conta com este e-mail ou empresa. Tente fazer login ou alterá-los.' }); // Código 409 = Conflito
        }

        // Verifica se o e-mail ou empresa já existe aguardando
        if (await usersCollection.findOne({ email })) {
            db.collection('temporario').deleteOne({ temporario_tipo: "conta", email });
        } else if (await usersCollection.findOne({ empresa })) {
            db.collection('temporario').deleteOne({ temporario_tipo: "conta", empresa });
        }

        const temporario_tipo = "conta";
        const codigo = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

        const newUser = { temporario_tipo, email, codigo, nome, empresa, senha, data_criacao };
        const result = await usersCollection.insertOne(newUser);

        console.log('Usuário inserido para verificar:', result);
        res.status(201).json({ codigo: true });

        EnviarEmail(`Verificação de e-mail`, `${codigo}`, "Business PRO", email, 'template_blamdz5');

        setTimeout(() => {
            if(usersCollection.findOne({newUser})) {
                usersCollection.deleteOne(newUser);
            };
        }, 10*60*1000);

    } catch (error) {
        console.error('Erro ao adicionar usuário:', error);
        res.status(500).json({ errorMessage: error.message });
    }
});

// Rota para adicionar um usuário (verificação bem sucedida)
app.post('/verify-email', async (req, res) => {
    const { email, codigo } = req.body;
    const temporario_tipo = "conta";

    let usuario = db.collection('temporario').findOne({ temporario_tipo, email, codigo });

    if((await usuario) != null) {

        try {
    
            const usersCollection = db.collection('usuarios');
    
            // Verifica se o e-mail ou empresa já existe no banco de dados
            if (await db.collection('funcionarios').findOne({ email }) || await usersCollection.findOne({ email }) || await usersCollection.findOne({ empresa: (await usuario).empresa })) {
                return res.status(409).json({ errorMessage: 'Já existe uma conta com este e-mail ou empresa. Tente fazer login ou alterá-los.' }); // Código 409 = Conflito
            }
            
            const newUser = {
                nome: (await usuario).nome,
                empresa: (await usuario).empresa,
                email: (await usuario).email,
                senha: (await usuario).senha,
                data_criacao: (await usuario).data_criacao
            };
            const result = await usersCollection.insertOne(newUser);
    
            console.log('Usuário inserido:', result);
            res.status(201).json({ email: (await usuario).email, nome: (await usuario).nome, empresa: (await usuario).empresa});
    
            // Cadastrar empresa
            db.collection('empresas').insertOne({
                nome: (await usuario).empresa,
                proprietario: (await db.collection('usuarios').findOne({ empresa: (await usuario).empresa }))._id,
                data_criacao: (await usuario).data_criacao,
            })

            db.collection('temporario').deleteOne({ _id: (await usuario)._id });
    
        } catch (error) {
            console.error('Erro ao adicionar usuário:', error);
            res.status(500).json({ errorMessage: error.message });
        }

    } else {
        return res.status(404).json({ errorMessage: 'Código de verificação incorreto ou expirado.' });
    };

});

// Rota para login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        if (!email || !senha) {
            return res.status(400).json({ errorMessage: 'Email e senha são obrigatórios' });
        }

        const usersCollection = db.collection('usuarios');
        const existingUser = await usersCollection.findOne({ email });

        if(existingUser) {

            if(existingUser.senha == senha) {
                console.log('Usuário logado:', email);
                return res.status(201).json({ email: email, nome: existingUser.nome, empresa: existingUser.empresa});
            } else {
                return res.status(409).json({ errorMessage: 'Senha incorreta para o e-mail informado.' });
            }

        } else {
            return res.status(404).json({ errorMessage: 'E-mail incorreto ou conta não cadastrada.' });
        }
        
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ errorMessage: error.message });
    }
});

// Rota para informar funcionários
app.post('/obter-funcionarios', async (req, res) => {
    const { empresa } = req.body;

    try {
        
        const retorno = db.collection('funcionarios').find({ empresa });
        return res.status(201).json({ funcionarios: (await retorno.toArray())});

    } catch (error) {

        console.error('Erro ao obter funcionários:', error);
        res.status(500).json({ errorMessage: error.message });

    };

});

// Rota para adicionar um funcionário
app.post('/add-funcionario', async (req, res) => {
    const { nome, email, senha, empresa, funcao, data_criacao } = req.body;

    try {
        if (!nome || !empresa || !email || !senha || !funcao || !data_criacao) {
            return res.status(400).json({ errorMessage: 'Nome, empresa, email, função, data de criação e senha são obrigatórios' });
        }

        const usersCollection = db.collection('funcionarios');

        // Verifica se o e-mail ou empresa já existe no banco de dados
        if (await usersCollection.findOne({ email, empresa })) {
            return res.status(409).json({ errorMessage: 'Já existe um funcionário com esse e-mail na sua empresa.' }); // Código 409 = Conflito
        }

        const newUser = { nome, email, senha, empresa, funcao, data_criacao };
        const result = await usersCollection.insertOne(newUser);

        console.log('Funcionário inserido:', result);
        res.status(201).json(result);

    } catch (error) {
        console.error('Erro ao adicionar funcionário:', error);
        res.status(500).json({ errorMessage: error.message });
    }
});

// Perguntar para o Gemini
app.post('/gemini-perguntar', async (req, res) => {
    const { mensagem, empresa, data_envio } = req.body;

    try {
        const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

        const prompt = `Você é um assistente virtual de IA especializado em ajudar empresas no Business PRO, um site para microempreendedores gerenciarem suas empresas. Ajude os usuários com suas dúvidas e tarefas. Você deve responder de forma clara, objetiva e amigável. Você não deve fazer perguntas desnecessárias ou fornecer informações irrelevantes. Você deve sempre tentar ajudar o usuário da melhor forma possível. Você está se comunicando com o usuário dono da empresa ${empresa}. São exatamente ${data_envio} agora. O usuário te fez a seguinte pergunta: ${mensagem}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        res.status(201).json({resposta: response.text});
    } catch (error) {
        console.error('Erro ao perguntar ao Gemini:', error);
        return res.status(500).json({ errorMessage: 'Erro ao perguntar ao Gemini.' });
    }

});

// Ngrok
(async () => {
    // Conectar
    const listener = await ngrok.forward({
        addr: port,
        authtoken: process.env.NGROK_AUTHTOKEN,
        domain: process.env.NGROK_DOMAIN
    });
  
    // Avisar
    console.log(`Ngrok conectado`);
})();

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
process.on('uncaughtException', (error) => {
    return console.error(`Exceção não capturada: `+error);
});