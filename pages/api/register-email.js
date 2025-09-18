import { MongoClient } from 'mongodb';
import { send } from '@emailjs/nodejs';

// Conexão com MongoDB
const client = new MongoClient(process.env.MONGODB_URI);
const dbName = 'businesspro';

/**
 * Envie um e-mail remotamente
 * @param {string} email - E-mail do destinatário
 * @param {string} [subject] - Assunto do e-mail
 * @param {string} [message] - Conteúdo principal
 * @param {string} [name] - Nome do remetente
 * @param {string} [template] - Template EmailJS
 */
async function sendEmail(email="undefined", subject="Assunto", message="Mensagem", name="Hermes", template="template_8qj7bar") {
    if(email=="undefined") return false;
    return await send('service_mr1z653', template, {
        subject,
        message,
        email,
        name
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

/**
 * @param {Request} req 
 * @param {Response} res 
 */
export default async function handler(req, res) {
  const { nome, empresa, email, senha, data_criacao } = req.body;

  await client.connect();

  try {
    if (!nome || !empresa || !email || !senha || !data_criacao) {
      return res.status(400).json({ errorMessage: 'Nome, empresa, email e senha são obrigatórios' });
    }

    const usersCollection = client.db(dbName).collection('temporario');

    // Verifica se o e-mail ou empresa já existe no banco de dados
    if (await client.db(dbName).collection('funcionarios').findOne({ email }) || await client.db(dbName).collection('usuarios').findOne({ email }) || await client.db(dbName).collection('usuarios').findOne({ empresa })) {
      return res.status(409).json({ errorMessage: 'Já existe uma conta com este e-mail ou empresa. Tente fazer login ou alterá-los.' }); // Código 409 = Conflito
    }

    // Verifica se o e-mail ou empresa já existe aguardando
    if (await usersCollection.findOne({ email })) {
      client.db(dbName).collection('temporario').deleteOne({ temporario_tipo: "conta", email });
    } else if (await usersCollection.findOne({ empresa })) {
      client.db(dbName).collection('temporario').deleteOne({ temporario_tipo: "conta", empresa });
    }

    const temporario_tipo = "conta";
    const codigo = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    const newUser = { temporario_tipo, email, codigo, nome, empresa, senha, data_criacao };
    const result = await usersCollection.insertOne(newUser);

    console.log('Usuário inserido para verificar:', result);
    res.status(201).json({ codigo: true });

    sendEmail(email, `Verificação de e-mail`, `${codigo}`, "Hermes", 'template_blamdz5');

    setTimeout(() => {
      if (usersCollection.findOne({ newUser })) {
        usersCollection.deleteOne(newUser);
      };
    }, 10 * 60 * 1000);

  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    res.status(500).json({ errorMessage: error.message });
  } finally {
    await client.close();
  }
}
