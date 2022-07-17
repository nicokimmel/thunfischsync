

# Thunfisch Sync

> Schau dir Youtube Videos mit deinen Freunden an. 🐟

Dieses kleine Projekt entstand ursprünglich beim Prokrastinieren während einer Klausurenphase. Nun bin ich dabei es zu refaktorisieren und stelle es der Öffentlichkeit zur Verfügung.  
Es handelt sich um eine simple Watch2Gether Alternative, das bedeutet man kann sich YouTube Videos synchron mit seinen Freunden anschauen. W2G finde ich persönlich zu altgebacken und zu unübersichtlich.

## Installation

 1. Git Repository klonen
 2. Node Dependencies mit `npm install` installieren
 3. Adresse in `src/public/js/connection.js` (Zeile 2) anpassen
 4. Grunt mithilfe von `npm run build` ausführen um einen `dist/` Ordner zu erhalten
 5. In den Ordner `dist/` wechseln und eine Datei `.env` erstellen, die einen [YouTube API Key](https://console.developers.google.com/projectcreate) und optional eine Liste geblockter YouTube Kanäle (Channel ID mit Komma getrennt) enthält:
 ```Bash
 YOUTUBE_API_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
 CHANNEL_FILTER="XXXXXXXXXXXXXXXXXXXXXXXX,XXXXXXXXXXXXXXXXXXXXXXXX"
 ```
 
 6. Den Server mit `node sync.js` ausführen

Der Server öffnet einen Webserver unter dem Port `3000`. Falls ein Reverse-Proxy zum Einsatz kommen soll, muss man dort die Schnittstelle zu `Socket.IO` durchreichen. Hier ein (SSL) Beispiel für NGINX:
```Bash
server {
    listen      192.168.2.100:443 ssl http2;
    server_name sync.example.org;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /socket.io/ {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass "http://192.168.2.100:3000/socket.io/";
    }

    location / {
        proxy_pass http://192.168.2.100:3000;
    }
}
```

## Verwendung
Zu Beginn wird immer ein Raum `#DEBUG123` erstellt. Eine Raum ID besteht immer aus einem `#` und einer Kombination aus Buchstaben und Zahlen, die eine Länge von 8 ergeben. Räume können via CLI oder auf der Hauptseite erstellt werden.  
In einem Raum kann man rechts nach YouTube Videos suchen. Akzeptiert werden auch Links zu Videos oder Playlist, wobei Playlists auf 300 Videos begrenzt sind, um die API Quota zu schonen.  
Temporäre Räume werden nach 5 Minuten Inaktivität gelöscht, "sticky" Räume nur pausiert.
