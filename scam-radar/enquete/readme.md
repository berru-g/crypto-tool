# Enquete ENZO :
Il s'agit d'une arnaque basé sur une promesse d'investissement, ou la victime doit envoyer des fonds à depuis une url. 

    Process :
        - Identifié tout les wallet relié par des transactions Entrante ou Sortante
        - Dessiner la roadmap via diagramme
        - Chercher un wallet avec un KYC pour trouver l'identité de l'arnaqueur.

    Outils utilisé : 
        - blockchain.com
        - blockstream  
        - Mempool
        - https://www.crypto-free-tools.netlify.app/scam-radar/ (fait maison pour l'occas)
        - https://www.crypto-free-tools.netlify.app/scam-radar/enquete/ 



## Voici l'url que l'arnaqueur à fournie à la victime :

	
    ht->tps://app.rampnetwork.com/account?enabledCryptoAssets=BTC_BTC&hostApiKey=n695b47tmp8k2hyn37mvhtsnz2pfmoe64qxc4z56&inAsset=USD&inAssetValue=20000&outAsset=BTC_BTC&paymentMethodType=CARD&userAddress=bc1qujeavxy7wu4tdr45rfph590h4u6ayt45n827yp&enabledFlows=ONRAMP&defaultFlow=ONRAMP

<img src="premier_element.png">
        screen* 
<img src="arnaqueur.png">
        l'arnaqueur

#### On distingue clairement l'adress d'un wallet bitcoin dans l'url = 
        bc1qujeavxy7wu4tdr45rfph590h4u6ayt45n827yp

#### Et une clef API = 
        n695b47tmp8k2hyn37mvhtsnz2pfmoe64qxc4z56

##### Premiere déduction
    L'api key sert certainement à automatiser le transfert d'un wallet vers plusieurs, en divisant le montant, pour compliquer la track.  L'achat de bitcoin en euro s'effectue le réseaux décentralisé https://rampnetwork.com/ comme nous pouvons le constater sur les screen* partagé par la victime. 
    Ramp Network est une plateforme légitime dans le domaine, elle permet notamment de simplifier l'achat de crypto avec une CB avec la possibilité d'envoyer ces tokens sur un wallet décentralisé (anonyme), c'est ce process qu'a suivi l'arnaqueur, en demandant à la victime de s'inscrire sur la plateforme, acheter du btc puis de le transferer sur le wallet bc1qu...27yp.
<img src="ramp.png">

#### On commence la quête depuis l'adresse :
Premier wallet. 
    - 3 wallet sont relié via des transaction entrante ou sortante [Voir json](./bitcoin-investigation-step1.json)


**NB :** *on constate que le wallet originel n'as reçu que le montant de l'arnaque et à était divisé puis envoyé sur le wallet bc1q69lrvcrwnv7sqjxyuq2rtu7e5st8z39kphfhsj. On peut en déduire qu'un wallet est créer pour chaque arnaque et qu'il ne sert qu'une fois. One shot using*


#### Suivi des plus gros montant :
Liste des wallets identifié dans l'arnaque :
    - bc1qujeavxy7wu4tdr45rfph590h4u6ayt45n827yp
    - bc1q69lrvcrwnv7sqjxyuq2rtu7e5st8z39kphfhsj
    - bc1qzjv5s09zuepsaj808jlxcjcvhw7nprr9kytwej
    - bc1q202lj4yklsyz5m4krtt95qfnlppuha5rydueyc  [à ce wallet 27 BTC et 26 wallet relié, Voir le json](./bitcoin-investigation-step4.json)
    - bc1qy3896n4zy8jh62scnag6482e4khep0xsr3hn8w
    - 1B5hVExEx5DjAMueQGESP2b6jzBu5UfTkP
    - 3HaVwfq3hYxVaqZUSEJnUajYe6iyDydfz2
    - bc1q9wvygkq7h9xgcp59mc6ghzczrqlgrj9k3ey9tz [à ce wallet 267 BTC plus de 21 million € et 50 wallet relié, Voir le json](./bitcoin-investigation-step8.json)

<img src="./Wallet_4.png">
        Wallet 4

<img src="./Wallet_8.png">
        Wallet 8


#### Rechercher un wallet KYC 03/12/2025
Identifié un KYC dans la liste des 8 wallets ou depuis la liste de chaque wallet relié entre eux dans le process par des transactions entrante ou sortante, ce qui représente environ 400 wallets...



