# Návod pro rodiče

## Spuštění na iPadu

1. V Safari otevři adresu hry.
2. Ťukni na Sdílet a zvol Přidat na plochu.
3. Otevři hru z plochy. Všechno další dělej jen odtud. Safari a ikona na ploše mají oddělenou paměť.
4. Otoč iPad na šířku.

## První spuštění

Vytvoř postavičku Rosinky, potom maminku a tatínka. Zelené tlačítko potvrdí volbu.

## Rodičovská část

Na úvodní obrazovce ťukni vlevo nahoře na Pro rodiče a vyřeš příklad.
Během hry podrž prst 3 sekundy v pravém horním rohu.

Tady je Začít znovu, změna postav, délka hry, obtížnost, jazyk, průvodce, zvuky a přehled, co už dcera umí.

Učení má stopy: Barvy, Zvířata, Věci, Tvary, Velký a malý, Počítání. Každá stopa se posouvá sama. V části Co už umí můžeš stopu posunout nebo vypnout.

Jazyk: Čeština, English, nebo Čeština + anglická slovíčka (otázka česky, po správné odpovědi zazní slovo anglicky).

Po „Dobrou noc“ se hra zamkne. Odemkne ji tlačítko Začít znovu.
U Dobrou noc po zvol Bez konce, když hra nemá končit.
Vypni Po Dobrou noc zamknout, když hra nemá zůstat zamčená.

## Nahrání hlasu

1. Otevři Pro rodiče.
2. Ťukni na Nahrává maminka nebo Nahrává tatínek.
3. Ťukni na Nahrát, řekni větu a ťukni na Stop.
4. Hra větu přehraje. Ťukni na Dobré, další, nebo na Znovu.

Hra ukáže jen věty, které chybí. Můžeš kdykoli skončit a později pokračovat.
Každý má svoje věty. Česky je 82 vět na osobu, anglicky 131. Jazyk vět vybereš v poli Věty. Co chybí, řekne hlas tabletu.
Když věta chybí, hraje nahrávka druhého rodiče, potom hlas tabletu.
Nahrávky jsou jen v tomto iPadu a nemají zálohu. Když smažeš ikonu hry, nahrávky zmizí.

## Hlas z ElevenLabs (aby nebylo nutné nahrávat vše)

ElevenLabs udělá z vašich nahrávek klon hlasu. Skript pak namluví všechny věty česky i anglicky.
Pořadí ve hře: vaše nahrávka, potom hlas z ElevenLabs, nakonec hlas tabletu.
Hlasy jsou jen v iPadu a v Macu ve složce `voices/`. Na GitHub nikdy nejdou.

1. Na iPadu: Pro rodiče, Stáhnout nahrávky maminky (a tatínka). Pošli ZIP přes AirDrop do Macu a rozbal ho.
2. Na elevenlabs.io: Voices, přidat hlas, Instant Voice Clone. Nahraj soubory ze ZIP. Klonování potřebuje placený tarif (Starter).
3. Zkopíruj Voice ID maminky a tatínka. V profilu vytvoř API klíč.
4. V Terminálu na Macu (místo tří teček vlož svoje hodnoty):

```bash
cd "/Users/sebastianhlava/Rosinka Hra"
export ELEVENLABS_API_KEY=...
export ELEVEN_VOICE_MOM=...
export ELEVEN_VOICE_DAD=...
node tools/make-voices.mjs
```

Skript ukáže, kolik vět chybí a kolik znaků to stojí. Nic nevytvoří. Když souhlasíš, spusť:

```bash
node tools/make-voices.mjs --go
```

5. Pošli soubor `voices/rosinka-hlasy.zip` přes AirDrop do iPadu a ulož ho do Souborů.
6. Na iPadu: Pro rodiče, Načíst hlasy, vyber ZIP.

Smazat hlasy z ElevenLabs jde tlačítkem v Pro rodiče. Vaše vlastní nahrávky zůstanou.
Když přibudou nové věty, spusť skript znovu. Udělá jen chybějící věty.

## Aby dítě neodešlo ze hry

1. V Nastavení otevři Zpřístupnění a Řízený přístup a zapni ho.
2. Ve hře třikrát stiskni horní tlačítko iPadu.
3. Ťukni na Spustit.
