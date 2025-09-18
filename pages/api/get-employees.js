import { MongoClient } from 'mongodb';

// Conexão com MongoDB
const client = new MongoClient(process.env.MONGODB_URI);
const dbName = 'businesspro';

/**
 * @param {Request} req 
 * @param {Response} res 
 */
export default async function handler(req, res) {
  const { empresa } = req.body;

  await client.connect();

  try {
    const retorno = client.db(dbName).collection('funcionarios').find({ empresa });
    return res.status(201).json({ funcionarios: (await retorno.toArray()) });
  } catch (error) {
    console.error('Erro ao obter funcionários:', error);
    res.status(500).json({ errorMessage: error.message });
  } finally {
    await client.close();
  }
}
