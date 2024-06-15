/*
//import { BotContext } from "@bot-whatsapp/bot";
//import('module').then(module => module);

//const chatWithAssistant = require('./mensajes/Assistant')
//const { chatWithAssistant } = require('./mensajes/Assistant');
//const chatWithAssistant = require('./Assistant');
const openai = require('openai');


const apiKey = process.env.OPENAI_API_KEY;
const assistantId = process.env.ASSISTANCE_ID;
// Crea una instancia del cliente de OpenAI
const client = new openai(apiKey);

async function chatWithAssistant(prompt) {
    try {
      const response = await client.chatCompletion.create({
        model: 'gpt-3.5-turbo', // Puedes usar otro modelo si lo prefieres
        messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: prompt }],
      });
  
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error al interactuar con el asistente:', error);
      return 'Ocurrió un error al procesar la solicitud.';
    }
  }
  

async function query(data) {
    const response = await fetch(
        //Flowise - LLM Chain - Conversational Chain
        //    "http://localhost:3001/api/v1/prediction/df9d26ed-a9b3-4a7f-948d-812d5e57dd9d",
        //Flowise - MarIADono
        "http://localhost:3001/api/v1/prediction/1acd8aeb-0679-41be-958b-08d87dc763cf",

        {
            headers: {
                Authorization: "Bearer UuOQOV2vjlpmg8aNgMtF6BvZpXrAxznGmwmxrJ113o0=",
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}

/*
const run =  async (ctx, history) => {
    
    const queryResponse = await query({
        "question": history[history.length - 1].content,
        "context": history,
        "overrideConfig": {
            "sessionId": ctx.from,
            "returnSourceDocuments": true
        }
    });
    
        
        return queryResponse.text;
    }

const run = async (ctx, history) => {
    const response = "Hola"
    
    chatWithAssistant(ctx.body).then(response => {
        console.log('Respuesta del asistente:', response);
    });
    return response;
}


module.exports = run;*/