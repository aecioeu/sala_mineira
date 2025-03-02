import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// Função processUpsert
const processUpsert = async (webhookData) => {
  console.log("processWebhook called with data:", webhookData);

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
      console.log(`${messageType}:`, message[messageType]);

      try {
        let base64 = await getBase64FromMediaMessage({
          message: { key: { id: messageId } },
          convertToMp4: messageType === "audioMessage" || messageType === "videoMessage"
        });

        const mediaData = message[messageType] || {};

        const mediaInfo = {
          messageId: messageId,
          mediaType: messageType,
          fileName: mediaData.fileName || `${messageId}.${messageType === "audioMessage" ? "mp4" : messageType === "documentMessage" ? "pdf" : messageType === "videoMessage" ? "mp4" : "jpeg"}`,
          mimeType: messageType === "audioMessage" ? "audio/mp4" :
                    messageType === "documentMessage" ? "application/pdf" :
                    messageType === "videoMessage" ? "video/mp4" : "image/jpeg",
          resolution: messageType === "imageMessage" || messageType === "videoMessage" ? `${mediaData?.width}x${mediaData?.height}` : null,
          base64: base64 || null,
          title: mediaData.title || null,
          fileLength: mediaData.fileLength || null,
          pageCount: mediaData.pageCount || null,
          duration: mediaData.seconds || null,
          thumbnailBase64: mediaData.jpegThumbnail ? `data:image/jpeg;base64,${mediaData.jpegThumbnail}` : null
        };

        mediaDetails.push(mediaInfo);
        console.log("mediaDetails:", mediaDetails);
        await saveMediaToDatabase(mediaInfo);

        conversation = message.caption;
      } catch (err) {
        console.error("Erro ao processar a mídia:", err);
      }
    }

   
    const formattedData = {
      id: contact.id,
      fromMe: fromMe,
      messageId: messageId,
      name: phoneNumber,
      img: contact.photo,
      message: conversation,
      media: mediaDetails,
      timestamp: messageTimestamp * 1000,
      time: new Date(messageTimestamp * 1000).toLocaleTimeString(),
      phone: phoneNumber,
      count: fromMe ? 0 : unreadMessages.count + 1,
      status: 1,
      isForwarded
    };

    return { status: "success", message: "Dados processados e salvos!", data: formattedData };
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

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
