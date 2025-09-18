import { GoogleGenAI } from "@google/genai";

/**
 * @param {Request} req 
 * @param {Response} res 
 */
export default async function handler(req, res) {
  const { mensagem, empresa, data_envio } = req.body;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `Você é um assistente virtual de IA especializado em ajudar empresas no Hermes, um site para microempreendedores gerenciarem suas empresas. Ajude os usuários com suas dúvidas e tarefas. Você deve responder de forma clara, objetiva e amigável. Você não deve fazer perguntas desnecessárias ou fornecer informações irrelevantes. Você deve sempre tentar ajudar o usuário da melhor forma possível. Você está se comunicando com o usuário dono da empresa ${empresa}. São exatamente ${data_envio} agora. O usuário te fez a seguinte pergunta: ${mensagem}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    res.status(201).json({ resposta: response.text });
  } catch (error) {
    console.error('Erro ao perguntar ao Gemini:', error);
    return res.status(500).json({ errorMessage: 'Erro ao perguntar ao Gemini.' });
  }

}
