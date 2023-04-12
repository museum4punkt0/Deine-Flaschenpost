# Deine Flaschenpost
## Inhaltsverzeichnis
* [Kurzbeschreibung](#Kurzbeschreibung)
* [Förderhinweis](#Förderhinweis)
* [Installation](#Installation)
* [Benutzung](#Benutzung)
* [Credits](#Credits)
* [Lizenz](#Lizenz)

## Kurzbeschreibung
,,Deine Flaschenpost" ist eine Web-App zur Schnitzeljagd im Deutschen Meeresmuseum. Nutzer:innen können Objekte im Museum fotografieren, mit einer Nachricht verzieren, und als Flaschenpost an Freunde und Familie verschicken. Diese suchen dann im Museum nach den fotografierten Objekten, und können wiederum ihre eigene Flaschenpost zurückschicken. So wird spielerisch die soziale Komponente des Museums gefördert, und Nutzer:innen werden ermutigt, einen genaueren Blick auf die Museumsobjekte zu werfen.

## Förderhinweis
Diese Web-App ist entstanden im Verbundprojekt museum4punkt0 – Digitale Strategien für das Museum der Zukunft, Teilprojekt (Digital) MEER erleben. Das Projekt museum4punkt0 wird gefördert durch die Beauftragte der Bundesregierung für Kultur und Medien aufgrund eines Beschlusses des Deutschen Bundestages. Weitere Informationen: www.museum4punkt0.de

![BKM-Logo](https://github.com/museum4punkt0/Object-by-Object/blob/77bba25aa5a7f9948d4fd6f0b59f5bfb56ae89e2/04%20Logos/BKM_Fz_2017_Web_de.gif)
![NeustartKultur](https://github.com/museum4punkt0/Object-by-Object/blob/22f4e86d4d213c87afdba45454bf62f4253cada1/04%20Logos/BKM_Neustart_Kultur_Wortmarke_pos_RGB_RZ_web.jpg)

## Ursprung
Ursprung des Projekts ist die Web-App "The Gift". "The Gift" wurde von der Künstlergruppe [Blast Theory](https://www.blasttheory.co.uk/) im Rahmen einer dreijährigen Forschungsinitiative entwickelt, die durch das EU-Programm Horizon 2020 für Forschung und Innovation unter der Fördervereinbarungsnummer 727040 unterstützt wird. Beteiligte Partner sind die IT-Universität Kopenhagen, Universität Nottingham, Universität Uppsala, Blast Theory, Next Game, die Europeana Foundation und Culture24.

Weitere Informationen finden Sie hier:
- [Das GIFT-Projekt](https://gifting.digital/)
- [Die GIFT App](https://www.blasttheory.co.uk/projects/gift/)

Das Badische Landesmuseum hat die Anwendung mit Hilfe des Projektteams Creative Collections weiterentwickelt, das aus Johannes Bernhardt, Tilmann Bruhn und Christiane Lindner besteht, sowie der erweiterten Creative-Familie Leilah Jätzold, Danica Schlosser und Tim Weiland. Weitere Details finden Sie [hier.](https://www.landesmuseum.de/creative)

Das Projekt ,,Deine Flaschenpost" entstand wiederum als Weiterentwicklung der Anwendung des Badischen Landesmuseums. Die grundlegendste Neuerung ist das CMS, welches es Museen erlaubt, Designelemente anzupassen, ohne Änderungen am Code vornehmen zu müssen. Um dies zu ermöglichen, wurde das Frontend mit next.js neu implementiert.

## Installation
### Einleitung

   Diese App besteht aus:

   - Einem Frontend, entwickelt mit next.js und React in TypeScript
   - Einem Backend, entwickelt mit Koa.js in TypeScript unter Benutzung von einer PostgreSQL DB

### Anforderungen
- Hardware: Hardware für einen Web-Server. 2-4GB RAM, Speicher 50GB aufwärts (Achtung: Die Benutzer können eigene Medien hochladen. Der Speicher sollte dem erwarteten Nutzerverhalten genügen.)
- Linux (z.B. Ubuntu LTS)
- NodeJS 12+ / Yarn
- PostgreSQL
    (zum Speichern Benutzer-generierter Flaschenposten)
- MinIO
    (zum Speichern Benutzer-generierter Medien)
- FFmpeg 3.4+
    (um Benutzer-generierte Medien in ein einheitliches Format zu konvertieren)



### PostgreSQL Database Setup
Zunächst führen wir psql aus:
```bash
sudo su - postgres
psql
```
Jetzt gibt es drei Sachen, die wir machen müssen.

#### Eine Datenbank erstellen
Wir erstellen die Datenbank und stellen sicher, dass sie in der Liste aller Datenbanken erscheint:
```bash
create database gift;
\l
```
#### Einen Benutzer erstellen
Wir erstellen den Benutzer, stellen sicher, dass er in der Liste aller Benutzer erscheint, und setzen dann ein Passwort:
```bash
create user gift;
\du
\password gift;
```
#### Dem Benutzer Datenbank-Priviligien zuteilen
Wir setzen unseren neuen Benutzer als Besitzer unserer Datenbank und teilen ihm alle Privilegien zu:
```bash
grant all privileges on database gift to gift;
alter database gift owner to gift;
```
### Nginx Setup
Wenn wir die App, das API, das CMS und MinIO alle auf dem gleichen Server laufen lassen wollen, brauchen wir Nginx. Im Quellverzeichnis dieses Repositories befindet sich eine Beispiel-Config namens `example_nginx.conf`.
Wir kümmern uns um die TODO's in der Config (insbesondere holen wir uns mit Certbot Zertifikate), speichern die Datei unter `/etc/nginx/nginx.conf` und führen nginx aus.

### MinIO Setup
- Wir navigieren in den `minio`-Ordner und installieren die MinIO-Binary:
    ```bash
    wget https://dl.min.io/server/minio/release/linux-amd64/minio
    chmod +x minio
    ```
- Wir kopieren die mit Certbot erstellten Zertifikate nach `/root/.minio/certs/public.crt` und `/root/.minio/certs/private.key`
- Wir kopieren die Datei `deployment_example.env` zu `.env` und kümmern uns um die TODO's.
- Wir führen `run.sh` aus und öffnen die MinIO-Konsole. Die Daten vom Root-User haben Sie (**hoffentlich!!**) zuvor in der `.env` angepasst.
- Wir erstellen einen neuen Benutzer unter Identity -> Users und geben ihm die Policies `readwrite` und `consoleAdmin`. Den Standard-Benutzer löschen wir.
- Wir erstellen einen neuen Bucket und geben ihm die Access Policy public. Bei Access rules erstellen wir eine Regel mit Access readwrite und leerem Prefix.

### Domain für Bilder ändern
In der Datei `app/next.config.js` ändern wir
```
images: {
    domains: ["localhost"],
}
```
so ab, dass statt `localhost` unsere eigene Domain verwendet wird - z.B. `flaschenpost.deutsches-meeresmuseum.de`.

### Deployment
1. Wir installieren alle Anforderungen
    - Wir stellen sicher, dass wir NodeJS version 12 benutzen
    - Wir folgen den Schritten im PostgreSQL-Setup
    - Wir folgen den Schritten im Minio-Setup
2. Abhängigkeiten installieren
    ```bash
    cd api
    yarn install
    cd ../app
    npm install
    cd ../cms
    npm install
    ```
3. Wir konfigurieren die Environment-Variablen:
    In den Unterordnern `api`, `app` und `cms` befindet sich jeweils eine Datei `deployment_example.env`. Wir kopieren diese Datei zu `.env` und kümmern uns um die TODO's, die selbsterklärend sein sollten.
4. Wir konfigurieren Nginx wie oben beschrieben.
5. Wir starten MinIO, das CMS, die API und die App
    - Ich empfehle die Benutzung vom Prozessmanager `pm2` (installierbar via `npm install pm2 -g`)
    - Wir starten MinIO
        ```bash
        cd minio
        pm2 start run.sh --name "minio"
        ```
    - Wir starten das CMS
        ```bash
        cd cms
        npm run build
        pm2 start npm --name "cms" -- run start
        ```
    - Wir starten das API
        ```bash
        cd api
        pm2 start npm --name "api" -- run start
        ```
    - Wir starten die App. Achtung: Damit der Build funktioniert, muss das CMS laufen! (Weil hier bereits die CMS-Assets verwendet werden.)
        ```bash
        cd app
        npm run build
        pm2 start npm --name "app" -- run start
        ```
    - Ein paar praktische `pm2` Kommandos: `pm2 list`, `pm2 logs`, `pm2 monit`
7. Fertig!
    - Jetzt überprüfen wir, dass auf unserer Domain alles läuft.
    - Wenn etwas in dieser Anleitung nicht funktioniert hat, geben Sie uns bitte Bescheid.


## Benutzung
- Die Web-App befindet sich unter `domain.de`. Sie ist responsive und kann sowohl von Smartphones als auch von Desktop-PCs, Tablets o.ä. verwendet werden. Ein Mikrofon sollte zur Aufnahme von Sprachnachrichten vorhanden sein.
- Unter `domain.de/cms/admin` befindet sich der Admin-Bereich des CMS. Hier können Sie das Design der Web-App anpassen, sowie ,,Museums-Flaschenposten" erstellen.
- Unter `minio.domain.de` befindet sich die MinIO-Konsole.

## Credits
In Auftrag gegeben vom Deutschen Meeresmuseum; entwickelt von Tim Weiland. Projektgrundlage von [Blast Theory](https://www.blasttheory.co.uk/).

## Lizenz
Der Quellcode steht komplett unter der MIT-Lizenz. Sowohl der ursprüngliche Quellcode von Blast Theory ([LICENSE](LICENSE)), als auch der angepasste Quellcode von Tim Weiland ([LICENSE-MODIFIED](LICENSE-MODIFIED)).