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

## Hvězdičky, krámek a pokojíček

Hvězdičky jsou peníze ve hře. Za správnou odpověď přibude 1. Za každých 20 sebraných hvězd na cestě přibude 1. Nikdy se neztratí.
Počet je nahoře uprostřed. Nad 10 hvězd je tam jedna hvězda s číslem.

Asi jednou za 2 minuty stojí u cesty krámek. Každé místo má svůj: ovoce, lesní stánek, zmrzlinárna, zimní stánek, hračkářství, noční stánek.
1. Dítě ťukne na věc. Hlas řekne cenu (1, 2 nebo 3 hvězdičky).
2. Dítě ťuká na hvězdičky dole. Hlas počítá: „Jedna. Dvě.“
3. Když je hvězdiček dost, prodavač poděkuje a dá věc.
Šipka vpravo nahoře krámek přeskočí. Krámek se neukáže, když nejsou žádné hvězdičky.

Věc do ruky drží postavička do konce hry. Věc do pokojíčku je na poličce u postýlky při Dobrou noc.
Knížka vpravo dole při Dobrou noc otevře album samolepek: každý naučený pojem je jedna samolepka.
Krámky vypneš v Pro rodiče (Krámky). Věty krámku nahraješ ve skupině Krámek.

## Hlas Rosinky

V Pro rodiče, v části Hlas Rosinky, nahraj krátké zvuky: skok („hop!“), náraz („bum!“ nebo „au!“) a dárek („jé!“).
Hra je pak přehraje ve hře. Skok zazní nejvýš jednou za 2 sekundy. Co nenahraješ, zní jako dřív.
Tyto nahrávky jsou jen v iPadu. Nejdou do stažených nahrávek, do ElevenLabs ani na GitHub.

## Hlas z ElevenLabs (aby nebylo nutné nahrávat vše)

ElevenLabs udělá z vašich nahrávek klon hlasu. Skript pak namluví všechny věty česky i anglicky.
Pořadí ve hře: vaše nahrávka, potom hlas z ElevenLabs, nakonec hlas tabletu.
Čisté hlasy jsou jen v iPadu a v Macu ve složce `voices/`. Na GitHub jdou jen zamčené heslem.

1. Na iPadu: Pro rodiče, Stáhnout nahrávky maminky (a tatínka). Pošli ZIP přes AirDrop do Macu. ZIP nech ve Stažených a nerozbaluj ho.
2. Na elevenlabs.io: založ účet a zaplať tarif Starter (klonování hlasu je jen v placeném tarifu).
3. V profilu vytvoř API klíč. Klíč musí mít právo Text to Speech a Voices (čtení i zápis). Právo User (čtení) je volitelné, ukáže tarif. Ulož ho do Macu:

```bash
cd "/Users/sebastianhlava/Rosinka Hra" && node tools/make-voices.mjs --key
```

Klíč při psaní není vidět. Uloží se jen do Klíčenky na Macu (Keychain), ne do souborů hry. Skript ukáže tarif.

4. V Terminálu na Macu spusť:

```bash
cd "/Users/sebastianhlava/Rosinka Hra" && node tools/make-voices.mjs --go
```

Skript sám udělá klon hlasu z vašich nahrávek a potom namluví chybějící věty.
Bez `--go` skript jen ukáže, co udělá a kolik znaků to stojí.

5. Skript hlasy zamkne heslem a uloží je do repa jako `voices.enc`. Nahraj změny na GitHub.
6. Jen poprvé: ukaž si heslo a zadej ho do iPadu (Pro rodiče, Heslo k hlasům, Stáhnout hlasy):

```bash
cd "/Users/sebastianhlava/Rosinka Hra" && node tools/make-voices.mjs --password
```

Potom si iPad nové hlasy stáhne sám při každém spuštění hry. AirDrop už není potřeba.

Bezpečnost: `voices.enc` je na webu veřejně, ale zamčený heslem (AES-256). Bez hesla je to jen šum.
Heslo je jen v Klíčence na Macu a v iPadu. Nikomu ho neposílej. Čisté hlasy (`voices/`) na GitHub nikdy nejdou.
Bez internetu jde pořád postaru: v Pro rodiče otevři „Bez internetu nebo bez hesla“ a načti `voices/rosinka-hlasy.zip`.

Smazat hlasy z ElevenLabs jde tlačítkem v Pro rodiče. Vaše vlastní nahrávky zůstanou.
Když přibudou nové věty, spusť skript znovu s `--go`. Udělá jen chybějící věty.

## Aby dítě neodešlo ze hry

1. V Nastavení otevři Zpřístupnění a Řízený přístup a zapni ho.
2. Ve hře třikrát stiskni horní tlačítko iPadu.
3. Ťukni na Spustit.
