import { MongoClient } from 'mongodb';

// Conexão com MongoDB
const client = new MongoClient(process.env.MONGODB_URI);
const dbName = 'businesspro';

/**
 * @param {Request} req 
 * @param {Response} res 
 */
export default async function handler(req, res) {
  const { nome, email, senha, empresa, funcao, data_criacao } = req.body;

  await client.connect();

  try {
    if (!nome || !empresa || !email || !senha || !funcao || !data_criacao) {
      return res.status(400).json({ errorMessage: 'Nome, empresa, email, função, data de criação e senha são obrigatórios' });
    }

    const usersCollection = client.db(dbName).collection('funcionarios');

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
  } finally {
    await client.close();
  }
}
