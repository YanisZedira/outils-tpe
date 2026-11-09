# Outils en ligne pour TPE et indépendants

Dix outils du quotidien, chacun dans une page HTML, sans dépendance, sans compte et sans envoi de données : tout se calcule dans le navigateur.

**Les utiliser : [yz-automation.fr/outils](https://yz-automation.fr/outils)**

| Outil | À quoi il sert |
|---|---|
| [Générateur de QR code](https://yz-automation.fr/outils/qr-code) | Lien, Wi-Fi ou carte de contact, en PNG et SVG, sans expiration |
| [Calculateur de TVA](https://yz-automation.fr/outils/calcul-tva) | HT vers TTC et TTC vers HT, aux taux français |
| [Calculateur de marge](https://yz-automation.fr/outils/calcul-marge) | Taux de marge, taux de marque, coefficient, prix de vente à viser |
| [Signature e-mail](https://yz-automation.fr/outils/signature-email) | Une signature propre pour Gmail, Outlook et Apple Mail |
| [Données structurées locales](https://yz-automation.fr/outils/donnees-structurees-entreprise-locale) | Le code JSON-LD LocalBusiness d'une entreprise |
| [Aperçu Google](https://yz-automation.fr/outils/apercu-google) | Titre et description tels que Google les affiche, mesurés en pixels |
| [Lien WhatsApp](https://yz-automation.fr/outils/lien-whatsapp) | Un lien et un QR code qui ouvrent une discussion |
| [Pénalités de retard](https://yz-automation.fr/outils/penalites-retard-facture) | Intérêts et indemnité de 40 € sur une facture impayée |
| [Compresseur d'images](https://yz-automation.fr/outils/compresser-image) | WebP ou JPEG, redimensionné, sans quitter l'appareil |
| [Mot de passe](https://yz-automation.fr/outils/mot-de-passe) | Tirage aléatoire cryptographique, solidité affichée |

## Comment c'est fait

- `scripts/outils/tools.mjs` : la liste des outils. Pour chacun, le formulaire, le script, l'aide, les questions fréquentes.
- `scripts/outils/build.mjs` : assemble les pages (en-tête, données structurées, liens) et les écrit dans `public/outils/`.
- `public/outils/outils.css` : la feuille de style commune.

```bash
node scripts/outils/build.mjs
```

Aucune installation : Node 18 ou plus suffit. Ouvrez ensuite `public/outils/index.html` derrière n'importe quel serveur statique.

Chaque script est écrit en JavaScript simple, sans cadre ni outil de construction. Vous pouvez copier une page, retirer l'en-tête et l'intégrer à votre site.

## Choix de conception

- **Rien ne quitte le navigateur.** Pas de serveur, pas de statistiques par outil, pas de cookie. Les images compressées et les mots de passe générés restent sur l'appareil.
- **Les règles sont citées.** Les formules et les textes de loi (TVA, pénalités de retard) sont donnés sous l'outil. Les taux qui changent, comme le taux d'intérêt légal, sont à saisir.
- **Des QR codes statiques.** Le lien est inscrit dans l'image : pas de redirection, donc pas d'expiration.

## Crédits et licence

Code sous licence MIT. Les QR codes utilisent [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) de Kazuhiko Arase (licence MIT), inclus dans `public/outils/qrcode.js`.

Écrit par Yanis Zedira, fondateur de [YZ Automation](https://yz-automation.fr) : sites internet, agents IA et automatisations pour les entreprises. Autres dépôts : [checklist SEO local](https://github.com/YanisZedira/checklist-seo-local), [calculateur du temps perdu](https://github.com/YanisZedira/calculateur-temps-perdu), [générateur de llms.txt](https://github.com/YanisZedira/llms-txt-generator).

Une idée d'outil, une erreur de calcul ? Ouvrez un ticket.
