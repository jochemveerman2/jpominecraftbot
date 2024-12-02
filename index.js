const mineflayer = require('mineflayer');
const fs = require('fs');

function createBot() {
  const bot = mineflayer.createBot({
    host: 'geocraft.nl',
    port: 25565,
    username: "_JPO_",
    auth: "microsoft",
  });

  bot.on('spawn', () => {
    console.log('Bot is verbonden met de server!');
  });

  bot.on('error', (err) => {
    console.log('Er is een fout opgetreden:', err);
  });

  bot.on('end', () => {
    console.log('Bot is gedisconnect van de server.');
  });

  bot.on("message", (message) => {
    const msg = message.toString();
    console.log(`${msg}`); 

    if (msg.includes("wants teleport to you!")) {
      bot.chat("/tpaccept");
    }

    if (msg.includes("-> you] withdraw")) {
      const withdrawMatch = msg.match(/\[([^\]]+)\s->\syou\] withdraw (\d+(\.\d+)?)/);
      if (withdrawMatch) {
        const sender = withdrawMatch[1];
        const withdrawAmount = parseFloat(withdrawMatch[2]);

        fs.readFile('../../gebruikers.json', 'utf8', (err, data) => {
          if (err) {
            return;
          }

          let gebruikers = [];
          try {
            gebruikers = JSON.parse(data);
          } catch (parseError) {
            return;
          }

          const user = gebruikers.find(user => user.name === sender);

          if (user) {
            if (user.geo >= withdrawAmount) {
              user.geo -= withdrawAmount;
              fs.writeFile('../../gebruikers.json', JSON.stringify(gebruikers, null, 2), (err) => {
                if (err) {
                  return;
                }

                bot.chat(`/pay ${sender} ${withdrawAmount}`);
                bot.chat(`/msg ${sender} ${sender}, u heeft ${withdrawAmount} Geo van uw JPO account af gehaald.`);
              });
            } else {
              bot.chat(`/msg ${sender} ${sender}, u heeft niet genoeg saldo, u heeft maar ${user.geo} Geo op uw JPO account.`);
            }
          } else {
            bot.chat(`/msg ${sender} ${sender}, geen account herkend op de JPO website.`);
          }
        });
      } else {
      }
    }

if (msg.includes("-> you] deposit")) {
  const depositMatch = msg.match(/\[([^\]]+)\s->\syou\] deposit (\d+(\.\d+)?)/);
  if (depositMatch) {
    const sender = depositMatch[1];
    const depositAmount = parseFloat(depositMatch[2]);

    bot.chat(`/betaalverzoek ${sender} ${depositAmount}`);

  }
}

if (msg.includes("-> you] balance")) {
  const balMatch = msg.match(/\[([^\]]+)\s->\syou\] (balance)(\s+([^\s]+))?/);
  if (balMatch) {
    const sender = balMatch[1]; 
    const targetName = balMatch[4];  

    const nameToCheck = targetName ? targetName : sender;

    fs.readFile('../../gebruikers.json', 'utf8', (err, data) => {
      if (err) {
        return;
      }

      let gebruikers = [];
      try {
        gebruikers = JSON.parse(data);
      } catch (parseError) {
        return;
      }

      const user = gebruikers.find(user => user.name.toLowerCase() === nameToCheck.toLowerCase());

      if (user) {
        const totalAmount = user.geo;

        bot.chat(`/msg ${sender} ${nameToCheck}, heeft ${totalAmount} Geo op zijn/haar JPO account staan.`);
      } else {
        bot.chat(`/msg ${sender} Geen gebruiker op de JPO website gevonden met de naam ${nameToCheck}.`);
      }
    });
  }
}

    if (msg.includes("-> you] login")) {
      const nameMatch = msg.match(/\[([^\]]+)\s->/);
      const tokenMatch = msg.match(/login (\d+)/);

      if (nameMatch && tokenMatch) {
        const name = nameMatch[1].toLowerCase();
        const token = tokenMatch[1];

        fs.readFile('../../login-tokens.json', 'utf8', (err, data) => {
          if (err) {
            return;
          }

          let loginTokens = [];
          try {
            loginTokens = JSON.parse(data);
          } catch (parseError) {
            return;
          }

          const tokenOwner = loginTokens.find(tokenData =>
            String(tokenData.token) === token && tokenData.name.toLowerCase() === name
          );
          if (tokenOwner) {

            const successfulLogin = {
              name: tokenOwner.name,
              token: token
            };

            loginTokens = loginTokens.filter(tokenData => tokenData.name.toLowerCase() !== name);

            fs.readFile('../../login-succes.json', 'utf8', (err, successData) => {
              if (err) {
              }

              let successLog = [];
              try {
                if (successData) {
                  successLog = JSON.parse(successData);
                }
              } catch (parseError) {
                successLog = [];
              }

              successLog.push(successfulLogin);

              fs.writeFile('../../login-succes.json', JSON.stringify(successLog, null, 2), (err) => {
                if (err) {
                } else {
                  bot.chat(`/msg ${tokenOwner.name} ${tokenOwner.name}, succesvol ingelogd op de JPO website.`);
                }
              });
            });

            fs.writeFile('../../login-tokens.json', JSON.stringify(loginTokens, null, 2), (err) => {
              if (err) {
              } else {
              }
            });
          } else {
            bot.chat(`/msg ${name} ${name}, onjuist token, probeer het opnieuw.`);
          }
        });
      } else {
        console.log("Onjuiste berichtindeling, kon naam of token niet extraheren.");
      }
    }

	if (msg.startsWith("[XConomy]") && msg.includes("You receive") && msg.includes("Geo from")) {
  		const geoMatch = msg.match(/You receive (\d+\.\d+) Geo from ([^\s]+)/);

      if (geoMatch) {
        const geoAmount = parseFloat(geoMatch[1]);
        const sender = geoMatch[2];

        console.log(`Betaling ontvangen van ${sender}: ${geoAmount} Geo`);

        fs.readFile('../../gebruikers.json', 'utf8', (err, data) => {
          if (err) {
            console.log('Fout bij het lezen van gebruikers.json:', err);
            return;
          }

          let gebruikers = [];
          try {
            gebruikers = JSON.parse(data);
          } catch (parseError) {
            console.log('Fout bij het parsen van gebruikers.json:', parseError);
            return;
          }

          const userIndex = gebruikers.findIndex(user => user.name === sender);

          if (userIndex !== -1) {
            gebruikers[userIndex].geo += geoAmount;
            const totaalGeo = gebruikers[userIndex].geo;

            fs.writeFile('../../gebruikers.json', JSON.stringify(gebruikers, null, 2), (err) => {
              if (err) {
                console.log('Fout bij het opslaan van gebruikers.json:', err);
              } else {
                console.log(`${geoAmount} Geo toegevoegd aan ${sender}. Nieuw totaal: ${totaalGeo} Geo.`);
                bot.chat(`/msg ${sender} ${sender}, u heeft ${geoAmount} gestort op uw JPO account, u heeft nu ${totaalGeo} Geo op uw JPO account.`);
              }
            });
          } else {
            console.log(`Gebruiker ${sender} niet gevonden, Geo wordt teruggestort.`);

            bot.chat(`/pay ${sender} ${geoAmount}`);
            bot.chat(`/msg ${sender} ${sender}, Geo teruggestort, geen account herkend op de JPO website.`);
          }
        });
      }
    }
  });
}

createBot();
