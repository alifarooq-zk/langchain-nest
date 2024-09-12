export enum TEMPLATES {
  BASIC_CHAT_TEMPLATE = `You are an expert software engineer, give concise response.
   User: {input}
   AI:`,
  CONTEXT_AWARE_CHAT_TEMPLATE = `You are an expert software engineer, give concise response.
  
   Current conversation:
   {chat_history}
   
   User: {input}
   AI:`,
}
