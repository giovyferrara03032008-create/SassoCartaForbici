import express from "express";
import path from "path";

const port = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("img"));
app.use(express.static("pagina"));
app.use(express.static("suoni"));

app.set("view engine", "ejs");
app.set("views", "views");

// Dizionario delle traduzioni
const traduzioni = {
    it: {
        titolo: "Sasso, Carta, Forbici",
        scopo: "Lo scopo del gioco è sconfiggere l'avversario scegliendo un segno che possa battere quello dell'altro, secondo le regole seguenti:",
        regola1: "Il sasso spezza le forbici (vince il sasso)",
        regola2: "Le forbici tagliano la carta (vincono le forbici)",
        regola3: "La carta avvolge il sasso (vince la carta)",
        regola4: "Se i due giocatori scelgono la stessa arma, il gioco è pari e si gioca di nuovo",
        placeholderNome: "Inserisci il tuo nome",
        btnGioca: "Gioca online",
        autore: "Autore:",
        scontro: "Scontro n.",
        guerriero: "Guerriero:",
        nemico: "Nemico:",
        punti: "Punti",
        vittorieTotali: "Vittorie Totali:",
        scegliArma: "Scegli la tua arma,",
        mossaAvversario: "Mossa dell'Avversario",
        haiScelto: "Hai scelto:",
        avversarioScelto: "L'avversario ha scelto:",
        pareggio: "Pareggio!",
        vittoria: "Vittoria!",
        perso: "Hai perso!",
        complimenti: "Complimenti %nome%! Hai raggiunto per primo 3 punti!!",
        dispiace: "Mi dispiace %nome%, l'utente online ha raggiunto per prima 3 punti... Riprova!",
        arrivederci: "Arrivederci",
        btnRound: "Clicca per giocare un altro Round online",
        btnHome: "Clicca Qui per tornare alla Home",
        // Traduzioni per le armi
        sasso: "Sasso",
        carta: "Carta",
        forbici: "Forbici",
        // Testi per la sintesi vocale (Napoletano rimane tale, cambiamo l'inglese)
        ttsItSasso: "'o sasso", ttsItCarta: "'a carta", ttsItForbici: "'e forbice",
        ttsEnSasso: "rock", ttsEnCarta: "paper", ttsEnForbici: "scissors"
    },
    en: {
        titolo: "Rock, Paper, Scissors",
        scopo: "The core of the game is to defeat the opponent by choosing a sign that beats theirs, according to the following rules:",
        regola1: "Rock crushes scissors (rock wins)",
        regola2: "Scissors cut paper (scissors win)",
        regola3: "Paper covers rock (paper wins)",
        regola4: "If both players choose the same weapon, it's a tie and you play again",
        placeholderNome: "Enter your name",
        btnGioca: "Play online",
        autore: "Author:",
        scontro: "Match n.",
        guerriero: "Warrior:",
        nemico: "Enemy:",
        punti: "Points",
        vittorieTotali: "Total Wins:",
        scegliArma: "Choose your weapon,",
        mossaAvversario: "Opponent's Move",
        haiScelto: "You chose:",
        avversarioScelto: "The opponent chose:",
        pareggio: "Tie!",
        vittoria: "Victory!",
        perso: "You lost!",
        complimenti: "Congratulations %nome%! You reached 3 points first!!",
        dispiace: "I'm sorry %nome%, the online user reached 3 points first... Try again!",
        arrivederci: "Goodbye",
        btnRound: "Click to play another Round online",
        btnHome: "Click Here to go back Home",
        // Traduzioni per le armi
        sasso: "Rock",
        carta: "Paper",
        forbici: "Scissors",
        ttsItSasso: "rock", ttsItCarta: "paper", ttsItForbici: "scissors",
        ttsEnSasso: "rock", ttsEnCarta: "paper", ttsEnForbici: "scissors"
    }
};

// Variabili globali
let puntiGiocatore = 0;
let puntiMacchina = 0;
let vittoriaGiocatore = 0;
let vittoriaMacchina = 0;
let numeroPartita = 1;
let gioco = null;
let nomeGiocatore = "";
let lingua = "it"; // Lingua predefinita

app.listen(port, () => {
    console.log("Server in ascolto sulla porta " + port);
});

// Nuova rotta per cambiare lingua
app.post("/cambia-lingua", (req, res) => {
    if (req.body.lingua === "it" || req.body.lingua === "en") {
        lingua = req.body.lingua;
    }
    // Ritorna alla pagina da cui proveniva l'utente
    const backURL = req.header('Referer') || '/';
    res.redirect(backURL);
});

app.get("/", (req, res) => {
    puntiGiocatore = 0;
    puntiMacchina = 0;
    vittoriaGiocatore = 0;
    vittoriaMacchina = 0;
    numeroPartita = 1;
    gioco = null;
    res.render("pagina1", { t: traduzioni[lingua], lingua });
});

app.post("/inizia", (req, res) => {
    if (req.body.nome) {
        nomeGiocatore = req.body.nome;
    }
    res.redirect("/pagina2");
});

app.get("/pagina2", (req, res) => {
    res.render("pagina2", {
        gioco, 
        puntiGiocatore, 
        puntiMacchina,
        numeroPartita, 
        vittoriaGiocatore, 
        vittoriaMacchina, 
        nomeGiocatore,
        t: traduzioni[lingua], // Passiamo il dizionario corretto
        lingua
    });
});

app.get("/pagina3", (req, res) => {
    const audioFile = (puntiGiocatore >= 3) ? "vittoria.mp3" : "perdita.mp3";

    res.render("pagina3", {
        gioco, puntiGiocatore, puntiMacchina,
        numeroPartita, vittoriaGiocatore, vittoriaMacchina, nomeGiocatore, audioFile,
        t: traduzioni[lingua], // Passiamo il dizionario corretto
        lingua
    });

    puntiGiocatore = 0;
    puntiMacchina = 0;
    gioco = null;
});

app.post("/gioco", (req, res) => {
    const scelta = req.body.scelta;
    if (!scelta) return res.redirect("/pagina2");

    const scelte = ["sasso", "carta", "forbici"];
    const sceltaComputer = scelte[Math.floor(Math.random() * 3)];

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