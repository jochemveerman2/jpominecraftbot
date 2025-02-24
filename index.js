const mineflayer = require('mineflayer');
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const config = require('./config.json');

let closestPlayer = null;
let closestDistance = Infinity;  
let lastSneakState = false; 
let isFreeze = false;
let botStatus = {
  online: false
};

const app = express();
const port = 3001;

app.get('/status', (req, res) => {
  res.json(botStatus);
});

function createBot() {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    auth: config.auth,
    keepAlive: config.keepAlive,
    checkTimeoutInterval: config.checkTimeoutInterval,
    version: config.version  
  });

  bot.on('spawn', () => {
    botStatus = {
      online: true
    };
  });

  bot.on('entityMoved', (entity) => {
    if (isFreeze) return; 
  
    if (entity.type === 'player' && entity !== bot.entity) {
      const distance = bot.entity.position.distanceTo(entity.position);
      if (distance < 10) { 
        bot.lookAt(entity.position.offset(0, 1, 0), true); 
  
        const isSneaking = entity.metadata && entity.metadata[0] && (entity.metadata[0] & 0x02) !== 0;
       const shouldSneak = Boolean(isSneaking);  
  
        if (shouldSneak !== lastSneakState) {
          lastSneakState = shouldSneak;
          bot.setControlState('sneak', shouldSneak);
        }
  
        bot.setControlState('sneak', shouldSneak);
      }
    }
  });

  bot.on('error', (err) => {
    console.log('Er is een fout opgetreden:', err);
  });

  bot.on('end', () => {
    botStatus = {
      online: false
    };
    setTimeout(createBot, 1000);
  });

  bot.on("message", (message) => {
    const msg = message.toString();
    console.log(`${msg}`); 

    if (msg.includes("wants teleport to you!")) {
      bot.chat("/tpaccept");
    }
    
    if (msg.includes("[EarlierMussel4 -> you] sit") || msg.includes("[EarlierMussel4 -> you] zit") || msg.includes("[EarlierMussel4 -> you] zitten")) {
      bot.chat("/sit");
      bot.chat("/msg EarlierMussel4 Ik zit.");
      isFreeze = true;
    }
    
    if (msg.includes("[EarlierMussel4 -> you] sta") || msg.includes("[EarlierMussel4 -> you] staan")) {
      bot.chat("/msg EarlierMussel4 Ik sta.");
      bot.setControlState('sneak', true);
      setTimeout(() => bot.setControlState('sneak', false), 300);
      isFreeze = false;
   }
    
    if (msg.includes("[EarlierMussel4 -> you] freeze")) {
      bot.chat("/msg EarlierMussel4 Ik ben bevroren.");
      isFreeze = true;
   }
    
    if (msg.includes("[EarlierMussel4 -> you] unfreeze")) {
      bot.chat("/msg EarlierMussel4 Ik ben ontdooit.");
      isFreeze = false;
   }
    
    if (msg.includes("[EarlierMussel4 -> you] shift") || msg.includes("[EarlierMussel4 -> you] sneak")) {
      bot.chat("/msg EarlierMussel4 Ik shift.");
      bot.setControlState('sneak', true);
      isFreeze = true;
   }
    
    if (msg.includes("[EarlierMussel4 -> you] unshift") || msg.includes("[EarlierMussel4 -> you] unsneak")) {
      bot.chat("/msg EarlierMussel4 Ik stop met shiften.");
      bot.setControlState('sneak', false);
      isFreeze = false;
   }
    
    if (msg.includes("EarlierMussel4 wants you to teleport to them!")) {
      bot.chat("/tpaccept");
    }
    
if (msg.startsWith("✉ [") && msg.includes("-> you] website")) {
  const senderMatch = msg.match(/\[([^\]]+)\s->\syou\] website/);
  
  if (senderMatch) {
    const sender = senderMatch[1];
    
    bot.chat(`/msg ${sender} U kunt onze website bezoeken op jpo-geocraft.nl.`);
  }
}
    
if (msg.startsWith("✉ [") && msg.includes("-> you] info")) {
  const senderMatch = msg.match(/\[([^\]]+)\s->\syou\] info/);
  
  if (senderMatch) {
    const sender = senderMatch[1];
    
    bot.chat(`/msg ${sender} U kunt meer informatie over JPO vinden op jpo-geocraft.nl/over-ons, om meer informatie te vinden over de JPO minecraft bot kunt u kijken op jpo-geocraft.nl/_JPO_.`);
  }
}


if (msg.startsWith("✉ [") && msg.includes("-> you] withdraw")) {
  const withdrawMatch = msg.match(/\[([^\]]+)\s->\syou\]\s+\[([^\]]+)\s->\syou\]\swithdraw\s(\d+(\.\d+)?)/);
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
            const discordUrl = `http://${config.discord_api_ip}:${config.discord_api_port}/send`;
            const titleParam = "Transactie";
            const textParam = `De JPO gebruiker **${sender}** heeft **${withdrawAmount}** van zijn/haar account af gehaalt..`;
            axios.get(discordUrl, { params: { titel: titleParam, tekst: textParam } })
          });
        } else {
          bot.chat(`/msg ${sender} ${sender}, u heeft niet genoeg saldo, u heeft maar ${user.geo} Geo op uw JPO account.`);
        }
      } else {
        bot.chat(`/msg ${sender} ${sender}, geen account herkend op de JPO website.`);
      }
    });
  } else {
    const sender = msg.match(/\[([^\]]+)\s->\syou\] withdraw/)[1];
    bot.chat(`/msg ${sender} ${sender}, gebruik /msg _JPO_ withdraw <aantal Geo>.`);
  }
}

if (msg.startsWith("✉ [") && msg.includes("-> you] deposit")) {
  const depositMatch = msg.match(/\[([^\]]+)\s->\syou\]\s+\[([^\]]+)\s->\syou\]\sdeposit\s(\d+(\.\d+)?)/);
  if (depositMatch) {
    const sender = depositMatch[1];
    const depositAmount = parseFloat(depositMatch[2]);

    bot.chat(`/betaalverzoek ${sender} ${depositAmount}`);
  } else {
    const sender = msg.match(/\[([^\]]+)\s->\syou\] deposit/)[1];
    bot.chat(`/msg ${sender} ${sender}, gebruik /msg _JPO_ deposit <aantal Geo>.`);
  }
}

if (msg.startsWith("✉ [") && msg.includes("-> you] balance")) {
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

        bot.chat(`/msg ${sender} ${nameToCheck} heeft ${totalAmount} Geo op zijn/haar JPO account staan.`);
      } else {
        bot.chat(`/msg ${sender} Geen gebruiker op de JPO website gevonden met de naam ${nameToCheck}.`);
      }
    });
  }
}

if (msg.startsWith("✉ [") && msg.includes("-> you] login")) {
  const nameMatch = msg.match(/\[([^\]]+)\s->/);
  const tokenMatch = msg.match(/login (\d+)/);

  if (nameMatch && tokenMatch) {
    const name = nameMatch[1].toLowerCase();
    const token = tokenMatch[1];

    fs.readFile('tokens.json', 'utf8', (err, data) => {
      if (err) {
        return;
      }

      let tokens;
      try {
        tokens = JSON.parse(data);
      } catch (parseError) {
        return;
      }

      const apiToken = tokens.jpo; 

      if (!apiToken) {
        bot.chat(`/msg ${name} De API-token voor JPO is niet gevonden, neem contact op in het JPO kanaal in de GeoCraft discord.`);
        return;
      }

      const url = `https://jpo-geocraft.nl/api/v1/login/login?apitoken=${apiToken}&token=${token}&minecraftnaam=${name}`;

      axios.get(url)
        .then(response => {
          const data = response.data;

          if (data.error) {
            bot.chat(`/msg ${name} ${name}, ${data.error}`);
          } else {
            bot.chat(`/msg ${data.name} ${data.name}, succesvol ingelogd op de JPO website.`);
            const discordUrl = `http://${config.discord_api_ip}:${config.discord_api_port}/send`;
            const titleParam = "Login";
            const textParam = `Succevolle login door de gebruiken **${name}** op de JPO website.`;
            axios.get(discordUrl, { params: { titel: titleParam, tekst: textParam } })
          }
        })
        .catch(error => {
          bot.chat(`/msg ${name} ${name}, er is een fout opgetreden tijdens het inloggen. Probeer het opnieuw.`);
        });
    });
  } else {
    const name = nameMatch ? nameMatch[1] : 'Onbekende gebruiker';
    bot.chat(`/msg ${name} ${name}, gebruik /msg _JPO_ login <login-token>. U kunt uw login token vinden op jpo-geocraft.nl/login.`);
  }
}
    
if (msg.startsWith("✉ [") && msg.includes("-> you] todoparati-login")) {
  const nameMatch = msg.match(/\[([^\]]+)\s->/);
  const tokenMatch = msg.match(/login (\d+)/);

  if (nameMatch && tokenMatch) {
    const name = nameMatch[1].toLowerCase();
    const token = tokenMatch[1];

    fs.readFile('tokens.json', 'utf8', (err, data) => {
      if (err) {
        return;
      }

      let tokens;
      try {
        tokens = JSON.parse(data);
      } catch (parseError) {
        return;
      }

      const apiToken = tokens.todoparati; 

      if (!apiToken) {
        bot.chat(`/msg ${name} De API-token voor TodoParati is niet gevonden, neem contact op in het TodoParati kanaal in de GeoCraft discord.`);
        return;
      }

      const url = `https://todoparati.nl/api/v1/login/login?apitoken=${apiToken}&token=${token}&minecraftnaam=${name}`;

      axios.get(url)
        .then(response => {
          const data = response.data;

          if (data.error) {
            bot.chat(`/msg ${name} ${name}, ${data.error}`);
          } else {
            bot.chat(`/msg ${data.name} ${data.name}, succesvol ingelogd op de TodoParati website.`);
            const discordUrl = `http://${config.discord_api_ip}:${config.discord_api_port}/send`;
            const titleParam = "Login";
            const textParam = `Succevolle login door de gebruiken **${name}** op de TodoParati website.`;
            axios.get(discordUrl, { params: { titel: titleParam, tekst: textParam } })
          }
        })
        .catch(error => {
          bot.chat(`/msg ${name} ${name}, er is een fout opgetreden tijdens het inloggen. Probeer het opnieuw.`);
        });
    });
  } else {
    const name = nameMatch ? nameMatch[1] : 'Onbekende gebruiker';
    bot.chat(`/msg ${name} ${name}, gebruik /msg _JPO_ todoparati-login <login-token>. U kunt uw login token vinden op todoparati.nl/login.`);
  }
}
    
if (msg.toLowerCase().startsWith("[xconomy]") && msg.toLowerCase().includes("you receive") && msg.toLowerCase().includes("geo from")) {
  	const geoMatch = msg.match(/You receive ([\d,.]+) Geo from ([^\s]+)/i);

  	if (geoMatch) {
    	let geoAmountStr = geoMatch[1];
    	
    	geoAmountStr = geoAmountStr.replace(/\.(?=\d{3}\.)/g, ''); 

    	geoAmountStr = geoAmountStr.replace(/\.(?=\d{2}$)/, ',');

    	const geoAmount = parseFloat(geoAmountStr);

    	const sender = geoMatch[2];

    	console.log(`Betaling ontvangen van ${sender}: ${geoAmount} Geo`);

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

      	const userIndex = gebruikers.findIndex(user => user.name.toLowerCase() === sender.toLowerCase());

      	if (userIndex !== -1) {
        	gebruikers[userIndex].geo += geoAmount;
        	const totaalGeo = gebruikers[userIndex].geo;

        	const geoTotaalFormatted = (totaalGeo % 1 === 0) ? totaalGeo.toFixed(0) : totaalGeo.toFixed(2);

        	fs.writeFile('../../gebruikers.json', JSON.stringify(gebruikers, null, 2), (err) => {
          	if (err) {
            	console.log('Fout bij het opslaan van gebruikers.json:', err);
          	} else {
            	bot.chat(`/msg ${sender} ${sender}, u heeft ${geoAmount} gestort op uw JPO account, u heeft nu ${geoTotaalFormatted} Geo op uw JPO account.`);
                const discordUrl = `http://${config.discord_api_ip}:${config.discord_api_port}/send`;
                const titleParam = "Transactie";
                const textParam = `De JPO gebruiker **${name}** heeft **${geoAmmount} op zijn/haar account gestord en heeft nu totaal **${geoTotaalFormatted} op zijn/haar account.`;
                axios.get(discordUrl, { params: { titel: titleParam, tekst: textParam } })
          	}
        	});
      	} else {
        	console.log(`Gebruiker ${sender} niet gevonden, Geo wordt teruggestort.`);

        	bot.chat(`/pay ${sender} ${geoAmount}`);
        	bot.chat(`/msg ${sender} ${sender}, Geo teruggestort, geen account herkend op de JPO website, log in op jpo-geocraft.nl/login om Geo te kunnen storten op uw account.`);
      	}
    	});
  	   }
     }
  });
}

createBot();
