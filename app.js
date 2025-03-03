import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

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
        contextInfo
      },
      sender
    } = webhookData;

    // Evitar processamento de mensagens de grupos
    const phoneNumber = remoteJid.split("@")[0];

    if (remoteJid.includes("-") || phoneNumber.length > 14) {
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
   
    const formattedData = {
      fromMe,
      name: phoneNumber,
      messageId,
      messageType,
      mediaDetails,
      message: conversation || "",
      isForwarded,
      timestamp: messageTimestamp * 1000,
      time: new Date(messageTimestamp * 1000).toLocaleTimeString(),
    
    };

    return { status: "success", message: formattedData };
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return { status: "error", message: "Erro ao processar dados." };
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

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


console.log(processUpsert({"event": "messages.upsert", "instance": "aecio", "data": {"key": {"remoteJid": "553788555554@s.whatsapp.net", "fromMe": true, "id": "3EB0684B7CB79F82C524CA"}, "pushName": "Aecio Oliveira", "status": "SERVER_ACK", "message": {"audioMessage": {"url": "https://mmg.whatsapp.net/v/t62.7117-24/40941814_656307850238363_8872862670587143479_n.enc?ccb=11-4&oh=01_Q5AaIJmz1g7DDYJHbUqvHvitvFXAXRIQJPG-Msof7lvsTkbc&oe=67EB00BA&_nc_sid=5e03e0&mms3=true", "mimetype": "audio/ogg; codecs=opus", "fileSha256": "9qTRU5ImhsKoP13oC5+I3yoF67CdMKXGvzBr5VGRFBQ=", "fileLength": "4844", "seconds": 2, "ptt": true, "mediaKey": "8+ufpSyc/lpYTag4/qHKsZHISblx0fOiyvlJkrVPQB4=", "fileEncSha256": "pFP9mdB6sd7lC0Klr3hQC56dRMIeW30w72ZZG95bjtE=", "directPath": "/v/t62.7117-24/40941814_656307850238363_8872862670587143479_n.enc?ccb=11-4&oh=01_Q5AaIJmz1g7DDYJHbUqvHvitvFXAXRIQJPG-Msof7lvsTkbc&oe=67EB00BA&_nc_sid=5e03e0", "mediaKeyTimestamp": "1740862636", "contextInfo": {"disappearingMode": {"initiator": "CHANGED_IN_CHAT"}}, "waveform": "GRkYFxkfJSstLi8vKiQeGBEKAwACBAYNFRwkKzI4PDk3NDg/Rk1MSkhHR0dHRkNAPT09PT07Ojg2MzAtMDY8Qg==", "viewOnce": false}, "base64": "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"}, "contextInfo": {"disappearingMode": {"initiator": "CHANGED_IN_CHAT"}}, "messageType": "audioMessage", "messageTimestamp": 1740862638, "instanceId": "22098a5e-e694-4772-a679-aa99746440d7", "source": "web"}, "destination": "https://automation.pmlp.com.br/webhook-test/cf6b0b8d-017a-47f1-95da-9a28480bc715", "date_time": "2025-03-01T17:57:19.214Z", "sender": "553788555554@s.whatsapp.net", "server_url": "https://evolution.pmlp.com.br", "apikey": "BCD3009F38AE-491E-AD1B-D44AAB51C922"}));