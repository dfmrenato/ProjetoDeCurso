import { MongoClient } from 'mongodb';

// Conexão com MongoDB
const client = new MongoClient(process.env.MONGODB_URI);
const dbName = 'businesspro';

/**
 * @param {Request} req 
 * @param {Response} res 
 */
export default async function handler(req, res) {
  const { email, codigo } = req.body;
  const temporario_tipo = "conta";

  await client.connect();

  try {
    let user = await client.db(dbName).collection('temporario').findOne({ temporario_tipo, email, codigo });

    if (user != null) {

      try {

        const usersCollection = client.db(dbName).collection('users');

        // Verifica se o e-mail ou empresa já existe no banco de dados
        if (await client.db(dbName).collection('funcionarios').findOne({ email }) || await usersCollection.findOne({ email }) || await usersCollection.findOne({ empresa: user.empresa })) {
          return res.status(409).json({ errorMessage: 'Já existe uma conta com este e-mail ou empresa. Tente fazer login ou alterá-los.' }); // Código 409 = Conflito
        }

        const newUser = {
          nome: user.nome,
          empresa: user.empresa,
          email: user.email,
          senha: user.senha,
          data_criacao: user.data_criacao
        };
        const result = await usersCollection.insertOne(newUser);

        console.log('Usuário inserido:', result);
        res.status(201).json({ email: user.email, nome: user.nome, empresa: user.empresa });

        // Cadastrar empresa
        client.db(dbName).collection('empresas').insertOne({
          nome: user.empresa,
          proprietario: (await client.db(dbName).collection('users').findOne({ empresa: user.empresa }))._id,
          data_criacao: user.data_criacao,
        })

        client.db(dbName).collection('temporario').deleteOne({ _id: user._id });

      } catch (error) {
        console.error('Erro ao adicionar usuário:', error);
        res.status(500).json({ errorMessage: error.message });
      }

    } else {
      return res.status(404).json({ errorMessage: 'Código de verificação incorreto ou expirado.' });
    };
  } catch (error) {
    console.error('Erro ao verificar email com sucesso:', error);
    res.status(500).json({ errorMessage: error.message });
  } finally {
    await client.close();
  }

}
