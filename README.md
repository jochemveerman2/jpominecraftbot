# JPO Minecraft Bot

Dit is een **JPO Minecraft bot** die verbinding maakt met de Minecraft server van **geocraft.nl** en automatisch verschillende functies uitvoert op basis van chatberichten. De bot maakt gebruik van de `mineflayer` bibliotheek en is geschreven in **Node.js**.

## Functies

De bot biedt verschillende functionaliteiten om te interageren met de server en gebruikersaccounts. De belangrijkste functionaliteiten zijn:

- **Teleportatie-aanvragen**: De bot accepteert teleportatie-aanvragen van andere spelers.
- **Opname en Storting**: De bot verwerkt opname- en stortingsverzoeken van gebruikers met behulp van hun `geo` saldo.
- **Saldo-informatie**: De bot kan het saldo van gebruikers opvragen en weergeven.
- **Inlogverwerking**: De bot verwerkt inlogverzoeken op basis van een token en logt succesvolle inlogpogingen.
- **Betalingen**: De bot verwerkt Geo-betalingen van andere spelers en voegt het saldo van gebruikers aan.

## Installatie

Volg deze stappen om de bot op je systeem te draaien:

### 1. Vereisten

- **Node.js** (minimaal versie 14)
- **npm** (Node Package Manager)
- **Mijnflayer bibliotheek** voor Minecraft bots

### 2. Installatie van de afhankelijkheden

1. Zorg ervoor dat Node.js is geïnstalleerd op je systeem. Je kunt de installatiehandleiding volgen op de officiële Node.js website: https://nodejs.org
2. Download of kloon dit project naar je lokale machine.
3. Navigeer naar de map van het project in je terminal.
4. Installeer de benodigde afhankelijkheden door het volgende commando uit te voeren:

   ```bash
   npm install mineflayer
