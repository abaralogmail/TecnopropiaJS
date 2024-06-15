const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require('dotenv/config');



const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/json')

const run = require('./mensajes/index.js')
//import { chatWithAssistant } from './mensajes/Assistant';
//const chatWithAssistant = require('./mensajes/Assistant')
const { chatWithAssistant } = require('./mensajes/Assistant.js');

//const { chatWithAssistant } = require('./mensajes/Assistant.js');

const flowWelcome = addKeyword(EVENTS.WELCOME)
//    .addAnswer('🙌 Hola bienvenido a este *Chatbot*')


const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { flowDynamic, state }) => {
        try {
            const newHistory = (state.getMyState()?.history ?? [])
            const name = ctx?.pushName ?? ''

            newHistory.push({
                role: 'user',
                content: ctx.body
            })
     
            const largeResponse = await chatWithAssistant(ctx)
            
            const chunks = largeResponse.split(/(?<!\d)\.\s+/g);
            for (const chunk of chunks) {
                await flowDynamic(chunk)
            }

            newHistory.push({
                role: 'assistant',
                content: largeResponse
            })

            await state.update({ history: newHistory })

        } catch (err) {
            console.log(`[ERROR]:`, err)
        }
    })

    


const main = async () => {
    const adapterDB = new MockAdapter()
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
