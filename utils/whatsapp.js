import "dotenv/config";
import fs from "fs";
import axios from "axios";



// Função para construir URLs dinâmicos
const buildApiUrl = (endpoint) => {
    return `${process.env.API_EVOLUTION_URL}/${endpoint}`;
  };
  
export const getBase64FromMediaMessage = async (payload) => {
    try {
      const apiUrl = buildApiUrl("chat/getBase64FromMediaMessage");
      const response = await axios.post(apiUrl, payload, axiosConfig);
  
      if (response.data.base64) {
        console.log(`Base64 da mídia recebido com sucesso.`);
        return response.data.base64;
      } else {
        console.log(`Base64 não encontrado para o payload informado.`);
        return null;
      }
    } catch (error) {
      console.error(`Erro ao buscar a mídia:`, error.response?.data || error.message);
      return null;
    }
}; 

  // Função para configurar autenticação padrão
const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.GLOBAL_API_KEY,
    },
  };

const sender = async (url, payload) => {
    // console.log("payload", payload);
     try {
       const response = await axios.post(url, payload, axiosConfig);
      // console.log("response", response.data);
       return {
         success: true,
         data: response.data,
         number: payload.number,
         text: payload.text,
         timestamp: Date.now(), // Adiciona um timestamp do envio
       };
     } catch (error) {
       console.error("Erro ao enviar mensagem:", error.response?.data || error.message);
       console.log(payload)
       return {
         success: false,
         error: error.response?.data || error.message,
       };
     }
   };
   
   // Função para enviar mensagens
  export const sendMsg = async (payload) => {
     
     try {
       //console.log("payload do sendMsg", payload);
       let messageData = null;

       //{{baseUrl}}/message/sendMedia/{{instance}}
   
       switch (payload.type) {
         case "text":
           var apiUrl = buildApiUrl(`message/sendText/${payload.instance}`);
           // Enviar mensagem de texto e aguardar retorno
           messageData = await sender(apiUrl, {
             number: payload.from,
             text: payload.message,
             delay: 1200,
           });
           case "document":
           // console.log("payload do sendMsg", payload);
            var apiUrl = buildApiUrl(`message/sendMedia/${payload.instance}`);
            // Enviar mensagem de texto e aguardar retorno
            messageData = await sender(apiUrl, {
              number: payload.from,
              text: payload.message,
              mediatype: payload.media.type, // image, video or document
              mimetype: payload.media.mimetype,
              caption: payload.media.caption,
              media: payload.media.base64,
              fileName: payload.media.fileName,
              delay: 1200,
            });
           break;
   
         default:
           console.error("Tipo de mensagem não suportado:", payload.type);
           return { success: false, error: "Tipo de mensagem não suportado" };
       }
   
       //console.log("messageData", messageData);
   
     /*  if (messageData.success) {
         const {
           key: { remoteJid, id: messageId, fromMe },
           pushName,
           status,
           message: { conversation },
           messageType,
           messageTimestamp,
         } = messageData.data;
   
         const phoneNumber = remoteJid.split("@")[0];
        // console.log("NUMERO", phoneNumber);
   
         const { saveMessage, getContactByPhoneNumber, saveOrUpdateContact } = require("../services/whatsapp_db");  
       
         // Verifica ou cria o contato no banco de dados
         let contact = await getContactByPhoneNumber(phoneNumber);
         
         //console.log("contact", contact);
         if (!contact) {
           await saveOrUpdateContact(phoneNumber, pushName || phoneNumber, messageData.data.profilePicUrl);
           contact = await getContactByPhoneNumber(phoneNumber); // Recarrega o contato
         } else {
           // Atualiza o contato se necessário
           await saveOrUpdateContact(phoneNumber, pushName || phoneNumber, messageData.data.profilePicUrl);
         }
   
         let isForwarded = false
         // Salva a mensagem no banco de dados
         await saveMessage(
           contact.id,
           fromMe ? 1 : 0,
           messageId,
           remoteJid,
           payload.from, // Ajuste conforme necessário
           isForwarded,
           conversation,
           messageType,
           messageTimestamp * 1000 // Converte para milissegundos
         );
       }*/
   
       return messageData; // Retorna os dados da mensagem
     } catch (error) {
       console.error("Erro ao enviar mensagem:", error);
       
       return { success: false, error: error.message };
     }
   };

   
