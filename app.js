const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require('dotenv/config');

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const JsonFileAdapter = require('@bot-whatsapp/database/json')
const run = require('./mensajes/index.js')
const { chatWithAssistant } = require('./mensajes/Assistant.js');

const flowTuto = addKeyword(['tutorial', 'tuto']).addAnswer(
    [
        '🙌 Aquí encontras un ejemplo rapido',
        'https://bot-whatsapp.netlify.app/docs/example/',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowGracias = addKeyword(['gracias', 'grac']).addAnswer(
    [
        '🚀 Puedes aportar tu granito de arena a este proyecto',
        '[*opencollective*] https://opencollective.com/bot-whatsapp',
        '[*buymeacoffee*] https://www.buymeacoffee.com/leifermendez',
        '[*patreon*] https://www.patreon.com/leifermendez',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowDiscord = addKeyword(['discord']).addAnswer(
    ['🤪 Únete al discord', 'https://link.codigoencasa.com/DISCORD', '\n*2* Para siguiente paso.'],
    null,
    null,
    [flowSecundario]
)

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
