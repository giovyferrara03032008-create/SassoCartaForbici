import express from "express";
import path from "path";

const port =  3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("img"));
app.use(express.static("pagina"));
app.use(express.static("suoni"));

app.set("view engine", "ejs");
app.set("views", "views");

// Variabili globali
let puntiGiocatore = 0;
let puntiMacchina = 0;
let vittoriaGiocatore = 0;
let vittoriaMacchina = 0;
let numeroPartita = 1;
let gioco = null;
let nomeGiocatore = "";

app.listen(port, () => {
    console.log("Server in ascolto sulla porta " + port);
});



app.get("/", (req, res) => {
    puntiGiocatore = 0;
    puntiMacchina = 0;
    vittoriaGiocatore = 0;
    vittoriaMacchina = 0;
    numeroPartita = 1;
    gioco = null;
    res.render("pagina1");
});



// Rotta per ricevere il nome all'inizio
app.post("/inizia", (req, res) => {
    // Salvataggio nella variabile globale
    if (req.body.nome) {
        nomeGiocatore = req.body.nome;
    }
    // Dopo aver salvato, andiamo alla pagina del gioco
    res.redirect("/pagina2");
});

app.get("/pagina2", (req, res) => {
    // Ora nomeGiocatore è già salvato nella globale
    res.render("pagina2", {
        gioco, 
        puntiGiocatore, 
        puntiMacchina,
        numeroPartita, 
        vittoriaGiocatore, 
        vittoriaMacchina, 
        nomeGiocatore 
    });
});


app.get("/pagina3", (req, res) => {
    // Determiniamo l'audio PRIMA del reset
    const audioFile = (puntiGiocatore >= 3) ? "vittoria.mp3" : "perdita.mp3";

    res.render("pagina3", {
        gioco, puntiGiocatore, puntiMacchina,
        numeroPartita, vittoriaGiocatore, vittoriaMacchina, nomeGiocatore, audioFile
    });

    // Reset post-visualizzazione per la prossima sfida
    puntiGiocatore = 0;
    puntiMacchina = 0;
    gioco = null;
});

app.post("/gioco", (req, res) => {
    const scelta = req.body.scelta;
    if (!scelta) return res.redirect("/pagina2");

    const scelte = ["sasso", "carta", "forbici"];
    const sceltaComputer = scelte[Math.floor(Math.random() * 3)];

    // Logica Punteggio
    if (scelta === sceltaComputer) {
        // Pareggio
    } else if (
        (scelta === "sasso" && sceltaComputer === "forbici") ||
        (scelta === "carta" && sceltaComputer === "sasso") ||
        (scelta === "forbici" && sceltaComputer === "carta")
    ) {
        puntiGiocatore++;
    } else {
        puntiMacchina++;
    }

    gioco = {
        giocatore: { nomeGiocatore, scelta, punti: puntiGiocatore },
        computer: { scelta: sceltaComputer, punti: puntiMacchina }
    };

    // Controllo fine match
    if (puntiGiocatore === 3) {
        vittoriaGiocatore++;
        numeroPartita++; 
        return res.redirect("/pagina3");
    } 
    
    if (puntiMacchina === 3) {
        vittoriaMacchina++;
        numeroPartita++;
        return res.redirect("/pagina3");
    }

    res.redirect("/pagina2");
});