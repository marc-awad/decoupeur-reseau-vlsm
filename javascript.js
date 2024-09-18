document.addEventListener("DOMContentLoaded", () => {
  //Initialisation du bouton de départ, du nombre de réseau et de l'adresse de réseau "repère"
  let startingButton = document.getElementById("startingButton");
  var nombreDeReseau = 0;
  var adresseReseauFinale;
  var nombreHoteMax = 0;
  let adresseOrigine;

  tempButton = document.getElementById("tempButton");
  tempButton.style.display = "none";
  tempButton.addEventListener("click", () => {
    tempButton.style.display = "none";
    divAllInput.style.display = "none";
    divAllInput.innerHTML = "";
    document.getElementById("result").innerHTML = "";
    document.getElementById("result").style.display = "none";
    nombreDeReseau = 0;
    adresseReseauFinale = null;
  });

  //Fonction pour déterminer le masque du réseau a partir du nombre d'hote du réseau
  function masque(nombreHote) {
    let bitZero = 0;
    let puissance = 1;
    do {
      bitZero++;
      puissance *= 2;
    } while (puissance < nombreHote + 2);

    let bitUn = 32 - bitZero;

    let octet;
    if (bitUn <= 8) {
      octet = 1;
    } else if (bitUn <= 16) {
      octet = 2;
    } else if (bitUn <= 24) {
      octet = 3;
    } else {
      octet = 4;
    }

    let masqueBinaire = new Array(32).fill(1, 0, bitUn).fill(0, bitUn);

    let octet1 = masqueBinaire.slice(0, 8);
    let octet2 = masqueBinaire.slice(8, 16);
    let octet3 = masqueBinaire.slice(16, 24);
    let octet4 = masqueBinaire.slice(24, 32);

    let masqueDecimal = [octet1, octet2, octet3, octet4].map((octet) =>
      parseInt(octet.join(""), 2)
    );

    let pas = 256 - masqueDecimal[octet - 1];

    return {
      masqueDecimal: masqueDecimal,
      octet: octet,
      pas: pas,
    };
  }

  //Fonction pour afficher l'adresse, le masque et le nom du réseau lorsque toutes les valeurs ont été calculées
  function affichage(
    adresseReseauFinale,
    masque,
    nomReseau,
    adresseProchainReseau
  ) {
    let divResult = document.getElementById("result");
    let divNetwork = document.createElement("div");
    let nameReseau = document.createElement("h3");

    nameReseau.textContent = "Nom du réseau : " + nomReseau;
    const adresseText =
      "<p> Adresse du réseau : " + adresseReseauFinale.join(".") + "</p>";
    const masqueText = "<p>Masque du réseau  : " + masque.join(".") + "</p>";
    const prochainReseau =
      "<p> Adresse du prochain réseau : " +
      adresseProchainReseau.join(".") +
      "</p>";
    const premierAdresse = [...adresseOrigine];
    premierAdresse[3] += 1;
    let textPremierAdresse =
      "<p>Première adresse disponible : " + premierAdresse.join(".") + "</p>";
    const dernierAdresse = [...adresseProchainReseau];
    if (dernierAdresse[3] == 0) {
      dernierAdresse[2] -= 1;
      dernierAdresse[3] = 254;
    } else {
      dernierAdresse[3] -= 2;
    }
    let textDernierAdresse =
      "<p>Dernière adresse disponible : " + dernierAdresse.join(".") + "</p>";
    const broadCast = dernierAdresse;
    broadCast[3] += 1;

    let textBroadcast = "<p>BroadCast : " + broadCast.join(".") + "</p>";

    let firstStyleDiv = document.createElement("div");
    let secondStyleDiv = document.createElement("div");
    let downDiv = document.createElement("div");
    downDiv.setAttribute("class", "down-div");
    downDiv.appendChild(firstStyleDiv);
    downDiv.appendChild(secondStyleDiv);
    firstStyleDiv.innerHTML = adresseText + masqueText + prochainReseau;
    secondStyleDiv.innerHTML =
      textPremierAdresse + textDernierAdresse + textBroadcast;
    divNetwork.appendChild(nameReseau);
    divNetwork.appendChild(downDiv);
    divNetwork.setAttribute("class", "network-div");
    divResult.appendChild(divNetwork);
  }

  startingButton.addEventListener("click", () => {
    CIDR = document.getElementById("masqueSR").value.split("/")[1];
    nombreHoteMax = 2 ** (32 - CIDR);
    console.log("CIDR : " + CIDR);
    console.log("Nombre d'hote maximum : " + nombreHoteMax);
    console.log(nombreHoteMax);
    document.getElementById("tempButton").style.display = "block";
    $("#startingDiv").slideToggle();
    let divAllInput = document.getElementById("divAllInput");
    divAllInput.style.display = "block";
    divAllInput.innerHTML = "";
    document.getElementById("result").innerHTML = "";
    let nbReseauTotal = document.getElementById("nb_reseau_total").value;
    let listeAllInput = [];

    for (let i = 0; i < nbReseauTotal; i++) {
      let divInput = document.createElement("div");

      let inputName = document.createElement("input");
      inputName.setAttribute("placeholder", "Nom du réseau " + (i + 1));
      inputName.setAttribute("id", "inputName_" + i);

      let inputHost = document.createElement("input");
      inputHost.setAttribute("placeholder", "Nombre d'hôtes");
      inputHost.setAttribute("id", "inputHost_" + i);
      inputHost.setAttribute("type", "number");

      divInput.appendChild(inputName);
      divInput.appendChild(inputHost);
      divAllInput.appendChild(divInput);

      listeAllInput.push({ inputName, inputHost }); // Stockage des références des champs dans une liste
    }

    let validateButton = document.createElement("button");
    validateButton.setAttribute("id", "validateButton");
    validateButton.textContent = "Valider";
    divAllInput.appendChild(validateButton);

    // Ajouter un événement pour le bouton valider
    validateButton.addEventListener("click", () => {
      nombreDeReseau++;
      listeAllInput.sort((a, b) => {
        let nombreHoteA = parseInt(a.inputHost.value);
        let nombreHoteB = parseInt(b.inputHost.value);

        return nombreHoteB - nombreHoteA; // Trie du plus grand au plus petit
      });
      let nombreHoteTotal = 0;
      for (let i = 0; i < listeAllInput.length; i++) {
        let adresseReseau;
        if (adresseReseauFinale) {
          adresseReseau = adresseReseauFinale;
        } else {
          adresseReseau = document
            .getElementById("adresseReseau")
            .value.split(".")
            .map((octet) => parseInt(octet));
        }

        let nombreHote = parseInt(listeAllInput[i].inputHost.value) + 2; // Récupération du nombre d'hôtes
        nombreHoteTotal += nombreHote;
        let { masqueDecimal, octet, pas } = masque(nombreHote);
        adresseOrigine = [...adresseReseau];
        console.log(adresseOrigine);
        // Traitement de l'adresse réseau avec gestion du dépassement
        adresseReseau[octet - 1] += pas;
        if (adresseReseau[octet - 1] >= 256) {
          adresseReseau[octet - 1] -= 256;
          adresseReseau[octet - 2]++;
        }

        adresseReseauFinale = [...adresseReseau]; // Mise à jour de l'adresse réseau finale
        affichage(
          adresseOrigine,
          masqueDecimal,
          listeAllInput[i].inputName.value,
          adresseReseauFinale
        ); // Affichage des résultats
      }
      if (nombreHoteTotal > nombreHoteMax) {
        console.log("TROP DHOTE");
        document.getElementById("tempButton").click();
        document.getElementById("divAllInput").style.display = "none";
        document.getElementById("result").style.display = "none";
        const dialog = document.getElementById("myDialog");
        dialog.showModal();
        const closeBtn = document.getElementById("closeDialog");
        closeBtn.addEventListener("click", function () {
          dialog.close();
        });
      } else {
        $("#divAllInput").slideToggle();
        setTimeout(() => {
          $("#result").slideToggle();
        }, 600);
      }
    });
  });
});
