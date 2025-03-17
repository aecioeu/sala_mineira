import express from "express";
import bodyParser from "body-parser";

import qs from "qs"
import axios from "axios";
import https from "https";
import fs from "fs";
import { emissaoDAS, emissaoDAS_test } from "./utils/serpro.js";
import { sendMsg } from "./utils/whatsapp.js";
import { validate } from 'node-cnpj';


const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));


// Função processUpsert
const processUpsert = async (webhookData) => {
 // console.log("processWebhook called with data:", webhookData);

  try {
    const {
      event,
      instance,
      data: {
        key: { remoteJid, id: messageId, fromMe },
        pushName,
        status,
        message,
        messageType,
        messageTimestamp,
        contextInfo,
        source,
      },
      sender
    } = webhookData;

    // Evitar processamento de mensagens de grupos
    const to = remoteJid.split("@")[0];
    const from = sender.split("@")[0];

    if (remoteJid.includes("-") || to.length > 14) {
      console.log("Mensagem ignorada.");
      return { status: "ignored", message: "Mensagem ignorada, possivelmente de grupo." };
    }

    const isForwarded = contextInfo?.isForwarded ?? false;

    let conversation = "";
    let mediaDetails = [];

    if (messageType === "conversation") {
      conversation = message.conversation;
    } else if (["imageMessage", "audioMessage", "documentMessage", "videoMessage"].includes(messageType)) {
     // console.log(`${messageType}:`, message[messageType]);

      try {
       /* let base64 = await getBase64FromMediaMessage({
          message: { key: { id: messageId } },
          convertToMp4: messageType === "audioMessage" || messageType === "videoMessage"
        });*/

        const mediaData = message[messageType] || {};
       // console.log("MEDIA DATA", mediaData)

        const mediaInfo = {
          messageId: messageId,
          mediaType: messageType,
          //fileName: mediaData.fileName || `${messageId}.${messageType === "audioMessage" ? "mp4" : messageType === "documentMessage" ? "pdf" : messageType === "videoMessage" ? "mp4" : "jpeg"}`,
          mimeType: messageType === "audioMessage" ? "audio/mp4" :
                    messageType === "documentMessage" ? "application/pdf" :
                    messageType === "videoMessage" ? "video/mp4" : "image/jpeg",
          resolution: messageType === "imageMessage" || messageType === "videoMessage" ? `${mediaData?.width}x${mediaData?.height}` : null,
          base64: message.base64 || null,
          title: mediaData.title || null,
          fileLength: mediaData.fileLength || null,
          pageCount: mediaData.pageCount || null,
          duration: mediaData.seconds || null,
          //thumbnailBase64: mediaData.jpegThumbnail ? `data:image/jpeg;base64,${mediaData.jpegThumbnail}` : null
        };

        mediaDetails.push(mediaInfo);
       console.log("mediaDetails:", mediaDetails);
 

        conversation = message.caption;
      } catch (err) {
        console.error("Erro ao processar a mídia:", err);
      }
    }
   
    const messageData  = {
      messageType,
      fromMe,
      to,
      from,
      messageId,
      mediaDetails,
      message: conversation || "",
      isForwarded,
      timestamp: messageTimestamp * 1000,
      time: new Date(messageTimestamp * 1000).toLocaleTimeString(),
      source
    
    };

    return { status: "success", message: messageData };
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return { status: "error", message: "Erro ao processar dados.", error: error };
  }
};

// Rota para receber webhook
app.post("/webhook", async (req, res) => {
  try {
    const result = await processUpsert(req.body);
    res.json(result);
  } catch (error) {
    console.error("Erro na requisição:", error);
    res.status(500).json({ status: "error", message: "Erro interno do servidor." });
  }
});

app.get("/", (req, res) => {
    res.json({ status: "success", message: "API está rodando corretamente!" });
});


app.post("/emitir-das", async (req, res) => {
  try {

    // 🔹 Extração de parâmetros (poderiam vir do `req.body`)
    const { cnpj, mes, ano, from, instance } = req.body;

    console.log("🔹 Extração de parâmetros (poderiam vir do `req.body`)", { cnpj, mes, ano, from, instance });

    // para fins de teste
   /* const from = "5537988555554",
      instance = "aecio",
      cnpj = "02725874000130",
      mes = "01",
      ano = "2023";*/



    // 🔹 Validação dos parâmetros
    if (!validate(cnpj)) {
      return res.status(400).json({ status: "error", message: "CNPJ invalido, peça que insira novamente o CNPJ." });
    }

    // 🔹 Gera o DAS
    const infoDAS = await gerarDAS(cnpj, mes, ano);
    if (!infoDAS) {
      return res.status(500).json({ status: "error", message: "Falha ao obter o DAS" });
    }

    // 🔹 Enviar mensagem com o arquivo para o destinatário
    const message = await enviarDAS(from, instance, infoDAS);


    if (message?.success) {
      return res.json({
        status: "success",
        message: `DAS gerado e enviado com sucesso para o CNPJ ${cnpj} no mês ${mes} de ${ano}`,
      });
    }

    // 🔹 Se chegou aqui, houve falha no envio da mensagem
    throw new Error("Falha ao enviar o DAS via mensagem", message);

  } catch (error) {
    console.error("Erro ao processar DAS:", error);
    res.status(500).json({ status: "error", message: error.message || "Erro ao processar o DAS, peça para o usuario tentar novamente mais tarde, houve algum problema." });
  }
});

// 🔹 Função para gerar DAS
async function gerarDAS(cnpj, mes, ano) {
  try {
    const response = await emissaoDAS_test(cnpj, mes, ano);
    const [dadosItem] = JSON.parse(response.dados); // Pega o primeiro item diretamente

    if (!dadosItem || !dadosItem.pdf) {
      throw new Error("DAS não retornou um PDF válido");
    }

    const { cnpjCompleto, razaoSocial, pdf: pdfBase64 } = dadosItem;
    return { cnpjCompleto, razaoSocial, pdfBase64, mes, ano };

  } catch (error) {
    console.error("Erro ao gerar DAS:", error);
    return null;
  }
}

// 🔹 Função para enviar DAS via mensagem
async function enviarDAS(from, instance, { razaoSocial, mes, ano, pdfBase64 }) {
  try {
    return await sendMsg({
      type: "document",
      from,
      instance,
      media: {
        type: "document",
        base64: pdfBase64,
        mimeType: "application/pdf",
        fileName: `${razaoSocial}-${mes}-${ano}.pdf`,
        caption: `DAS ${mes}/${ano}`,
      },
    });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return null;
  }
}


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


//console.log(processUpsert({"event": "messages.upsert", "instance": "aecio", "data": {"key": {"remoteJid": "553799564996@s.whatsapp.net", "fromMe": true, "id": "3EB02313173A5079614EAA"}, "pushName": "Aecio Oliveira", "status": "SERVER_ACK", "message": {"conversation": "opa tudo bem ?"}, "contextInfo": {"expiration": 604800, "ephemeralSettingTimestamp": "1730203049", "disappearingMode": {"initiator": "CHANGED_IN_CHAT", "trigger": "ACCOUNT_SETTING", "initiatedByMe": true}}, "messageType": "conversation", "messageTimestamp": 1741001371, "instanceId": "22098a5e-e694-4772-a679-aa99746440d7", "source": "web"}, "destination": "https://automation.pmlp.com.br/webhook-test/cf6b0b8d-017a-47f1-95da-9a28480bc715", "date_time": "2025-03-03T08:29:31.505Z", "sender": "553788555554@s.whatsapp.net", "server_url": "https://evolution.pmlp.com.br", "apikey": "BCD3009F38AE-491E-AD1B-D44AAB51C922"}));