//import OpenAI from "openai";
//import { ChatCompletionMessageParam } from "openai/resources";
//const { ChatCompletionMessageParam } = require("openai/resources");
const { OpenAI } = require("openai");
const { chatWithAssistant } = require("./Assistant");

//import { generatePrompt, generatePromptDetermine } from "./promptInmo";


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
   
});

/**
 * 
 * @param name 
 * @param history 
 */
const run = async (name, history) => {

    
    //const promtp = generatePrompt(name)
/*    const assistant = await openai.beta.assistants.retrieve(process.env.ASSISTANT_ID)
    console.log(assistant);*/

    const response1 = await chatWithAssistant(name, 'Hola, ¿cómo estás?');
    /*
    const promtp = "Hola, soy Flowise, ¿qué puedo hacer por ti?"
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "system",
                "content": promtp
            },
            ...history
        ],
        temperature: 1,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        options: {
            assistantId: process.env.ASSISTANCE_ID,
          }
        
    });*/
    
    return response1;

}
/*
const runDetermine = async (history) => {

    //const promtp = generatePromptDetermine()
    const promtp = "Hola, soy Flowise, ¿qué puedo hacer por ti?"
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "system",
                "content": promtp
            },
            ...history
        ],
        temperature: 1,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content
}*/

module.exports = run;


