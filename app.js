const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require('dotenv/config');

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const JsonFileAdapter = require('@bot-whatsapp/database/json')
const run = require('./mensajes/index.js')
const { chatWithAssistant } = require('./mensajes/Assistant.js');


const flowWelcome = addKeyword(EVENTS.WELCOME)
//    .addAnswer('🙌 Hola bienvenido a este *Chatbot*')


const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { flowDynamic, state }) => {
        try {
            const newHistory = (state.getMyState()?.history ?? [])
            console.log('Estado actual antes de procesar el mensaje:', state.getMyState());


            newHistory.push({
                role: 'user',
                content: ctx.body,
                threadId: "thread321321"
            })
     
            const largeResponse = await chatWithAssistant(ctx, newHistory)
            const chunks = largeResponse.split(/(?<!\d)\.\s+/g);
            for (const chunk of chunks) {
                await flowDynamic(chunk)
            }

            newHistory.push({
                role: 'assistant',
                content: largeResponse
            })
        //    console.log('Nuevo historial:', newHistory);
            await state.update({ history: newHistory })
      //      console.log('Estado actualizado después de procesar el mensaje:', state.getMyState());


        } catch (err) {
            console.log(`[ERROR]:`, err)
        }
    })

    


const main = async () => {
    //const adapterDB = new JsonFileAdapter()
    const adapterDB = new JsonFileAdapter({ pathFile: './db.json' })
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
