const { OpenAI } = require("openai");
const { chatWithAssistant } = require("./Assistant");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
   
});

/**
 * 
 * @param name 
 * @param history 
 */
const run = async (name, history) => {

    const response1 = await chatWithAssistant(name, 'Hola, ¿cómo estás?');
    return response1;

}
module.exports = run;


