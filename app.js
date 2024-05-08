const fs = require('fs');
const wppconnect = require('@wppconnect-team/wppconnect');

wppconnect
  .create({
    session: 'sessionName',
    catchQR: (base64Qr, asciiQR) => {
      console.log(asciiQR); // Optional to log the QR in the terminal
      var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }
      response.type = matches[1];
      response.data = new Buffer.from(matches[2], 'base64');

      var imageBuffer = response;
      require('fs').writeFile(
        'out.png',
        imageBuffer['data'],
        'binary',
        function (err) {
          if (err != null) {
            console.log(err);
          }
        }
      );
    },
    logQR: false,
  })
  .then((client) => start(client))
  .catch((error) => console.log(error));


  function start(client) {
    const sentMessages = new Set(); // Conjunto para armazenar números de telefone que já foram mencionados
  
    client.onAck(ack => {
      const { from, to, body } = ack;
  
      // Verifica se a mensagem foi enviada para um grupo e se contém menções
      if (to.includes('@g.us') && body.toLowerCase().includes('@')) {
        const mentions = body.match(/@[0-9]+/g);
  
        if (mentions) {
          // Itera sobre cada menção
          for (const mention of mentions) {
            // Extrai o número de telefone mencionado da menção
            const mentionedNumber = mention.split('@')[1];
            
            // Verifica se o número de telefone já foi mencionado anteriormente
            if (!sentMessages.has(mentionedNumber)) {
              // Adiciona o número de telefone ao conjunto de mensagens enviadas
              sentMessages.add(mentionedNumber);
  
              // Envia uma mensagem 'hi' para o número mencionado
              client.sendText(mentionedNumber, 'Você tem uma pendencia de aprovação, por favor conferir no grupo aprovação GMUD!');
            }
          }
        }
      }
    });
  }