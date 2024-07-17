const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require('dotenv/config');

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const JsonFileAdapter = require('@bot-whatsapp/database/json')
const run = require('./mensajes/index.js')
const { chatWithAssistant } = require('./mensajes/Assistant.js')
const fs = require('fs')
const { NotionDBLoader } = require('./mensajes/NotiondbCody.js')



let stateByUser = {}

const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer('🙌 Hola bienvenido a este *Chatbot*')

const flowOperador = addKeyword(['operador'])
    .addAnswer('El asistente virtual ha sido desactivado. Para reactivarlo, escribe "asistente".')
    .addAction(async (ctx, { state }) => {
        const userId = ctx.from
        stateByUser[userId] = stateByUser[userId] || { assistantEnabled: true }
        stateByUser[userId].assistantEnabled = false
        saveState()
    })

const flowAsistente = addKeyword(['asistente'])
    .addAnswer('El asistente virtual ha sido reactivado.')
    .addAction(async (ctx, { state }) => {
        const userId = ctx.from
        stateByUser[userId] = stateByUser[userId] || { assistantEnabled: true }
        stateByUser[userId].assistantEnabled = true
        saveState()
    })


    const flowNotion = addKeyword(['notion'])
    .addAnswer('Notion addAction')
    .addAction(async (ctx, { state }) => {
        const userId = ctx.from
        //const notion = new Client({ auth: process.env.NOTION_API_KEY });

        const loader = new NotionDBLoader({
            //https://www.notion.so/3cc27d7003604ce6888f27c690eb99d2?v=f7b9409a99d44051aa362959e3d08cf4&pvs=4
         //   databaseId: 'd2b1f3b5231b4580a08004e989e5a123',
            databaseId: "c57138e0-21dd-478d-8be8-23e453b0dc4d",
            notionIntegrationToken: process.env.NOTION_API_KEY,
            pageSizeLimit: 50 // opcional, por defecto es 50
          });
         // let databaseId= "c57138e0-21dd-478d-8be8-23e453b0dc4d";

          const databases = await loader.listDatabases();

           
          let message = 'Available databases:\n\n';
          databases.forEach(db => {
            message += `- ${db.title} (ID: ${db.id})\n`;
            console.log(message); 
          });
        
          let documents = await loader.load();
          documents.forEach(db => {     
            //const name = db.properties[0]?.plain_text || 'Untitled';
            const name = db.properties.Descripción.id ;
            const description = db.properties?.ID?.rich_text?.[0]?.plain_text || 'No description';

            message += `- ${name} (ID: ${db.id})\n`;
            console.log(description); 
          });
          /*documents.forEach(doc => {
            message += `- ${doc.properties.Name.title[0].plain_text} (ID: ${doc.id})\n`;
            console.log(message);*/
          //await flowDynamic(message);
    })


    
const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { flowDynamic, state }) => {
        try {
            const userId = ctx.from
            const newHistory = (stateByUser[userId]?.history ?? [])
            console.log('Estado actual antes de procesar el mensaje:', stateByUser[userId]);

            newHistory.push({
                role: 'user',
                content: ctx.body,
            })

            const currentState = stateByUser[userId] || { assistantEnabled: true };

            if (currentState.assistantEnabled) {
                const largeResponse = await chatWithAssistant(ctx, newHistory)
                const chunks = largeResponse.split(/(?<!\d)\.\s+/g);
                for (const chunk of chunks) {
                    await flowDynamic(chunk)
                }

                newHistory.push({
                    role: 'assistant',
                    content: largeResponse
                })
                stateByUser[userId] = { ...stateByUser[userId], history: newHistory }
            } else {
               // await flowDynamic('El asistente virtual está desactivado. Para reactivarlo, escribe "asistente".')
            }

            console.log('Estado actualizado después de procesar el mensaje:', stateByUser[userId]);
            saveState()

        } catch (err) {
            console.log(`[ERROR]:`, err)
        }
    })

const saveState = () => {
    fs.writeFileSync('state.json', JSON.stringify(stateByUser))
}

const loadState = () => {
    try {
        stateByUser = JSON.parse(fs.readFileSync('state.json', 'utf-8'))
    } catch (err) {
        stateByUser = {}
    }
}

const main = async () => {
    const adapterDB = new JsonFileAdapter({ pathFile: './db.json' })
    const adapterFlow = createFlow([flowPrincipal, flowOperador, flowAsistente, flowNotion])
    const adapterProvider = createProvider(BaileysProvider)

    loadState()

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
