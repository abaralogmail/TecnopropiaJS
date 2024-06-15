const { Configuration, OpenAIApi, OpenAI } = require('openai');
require('dotenv/config');

// Reemplaza 'your-api-key' con tu clave API de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
 
});

// Mapeo para almacenar los hilos de conversación de los usuarios
const userThreads = {};

// Function to create a new thread
async function createThread() {
  try {
    const thread = await openai.beta.threads.create();
    return thread.id; // Return the new thread ID
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
}

// Function to get or create a thread for a user
async function getOrCreateThread(userId) {

  const thread = await openai.beta.threads.retrieve();

  if (!userThreads[userId]) {
    // Create a new thread if it doesn't exist
    userThreads[userId] = await createThread();
  }
  return userThreads[userId];
}

async function chatWithAssistant(ctx) {
  // Verificar si el usuario ya tiene un hilo de conversación

  try {
    const userId = ctx.from;
    const threadId = await getOrCreateThread(userId);
    console.log(`Using thread ${threadId} for user ${userId}`);
    // Continue with your chat logic using the threadId
  
 
    const response = await openai.beta.threads.messages.create(threadId, 
      {role: 'user', content: ctx.body});
    
      const messagesResponse = await openai.beta.threads.messages.list(threadId);
   //   const messages = messagesResponse.data;
  
      // Obtener la respuesta del asistente
      //const assistantMessage = messages.find(msg => msg.role === 'assistant')?.content || 'No response from assistant';
      //const run = await openai.beta.threads.runs.create(threadId, assistant_id: process.env.ASSISTANT_ID, "Intruccions");
      let respuesta ="sin respuesta";
      const run = await openai.beta.threads.runs.create(threadId, 
                { assistant_id: process.env.ASSISTANT_ID});
                

                // Polling mechanism to see if runStatus is completed
         // Imediately fetch run-status, which will be "in_progress"
         let runStatus = await openai.beta.threads.runs.retrieve(
          threadId,
          run.id
        );

        // Polling mechanism to see if runStatus is completed
        while (runStatus.status !== "completed") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(
            threadId,
            run.id
          );

          // Check for failed, cancelled, or expired status
          if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
            console.log(
              `Run status is '${runStatus.status}'. Unable to complete the request.`
            );
            break; // Exit the loop if the status indicates a failure or cancellation
          }
        }

        // Get the last assistant message from the messages array
        const messages = await openai.beta.threads.messages.list(threadId);

        // Find the last message for the current run
        const lastMessageForRun = messages.data
          .filter(
            (message) =>
              message.run_id === run.id && message.role === "assistant"
          )
          .pop();

        // If an assistant message is found, console.log() it
        if (lastMessageForRun) {
          respuesta = lastMessageForRun.content[0].text.value;
          console.log(`${lastMessageForRun.content[0].text.value} \n`);
        } else if (
          !["failed", "cancelled", "expired"].includes(runStatus.status)
        ) {
          console.log("No response received from the assistant.");
        }
                /*
                const checkStatusAndPrintMessages = async (threadId, runId) => {
                  let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
                  if(runStatus.status === "completed"){
                      let messages = await openai.beta.threads.messages.list(threadId);
                      messages.data.forEach((msg) => {
                          const role = msg.role;
                          if(role === "assistant"){
                              respuesta = msg.content[0].text.value;
                              //return msg.content[0].text.value; ;
                          }
                          const content = msg.content[0].text.value; 
                          console.log(
                              `${role.charAt(0).toUpperCase() + role.slice(1)}: ${content}`
                          );
                      });
                  } else {
                      console.log("Run is not completed yet.");
                  }  
              };
              
              setTimeout(() => {
                  checkStatusAndPrintMessages(threadId, run.id)
              }, 10000 );*/
              

      return respuesta;
  } catch (error) {
    console.error('Error:', error);
     throw error;
  }
}

module.exports = { chatWithAssistant };
