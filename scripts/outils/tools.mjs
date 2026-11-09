// Les outils libres. Chaque script est écrit en JavaScript simple (pas de gabarit, pas de dépendance)
// et reçoit les aides $, num, eur, pct, copyText et download définies dans build.mjs.
const R = String.raw;
const B = '/ressources/blog/';

export const TOOLS = [
  {
    slug: 'qr-code', name: 'Générateur de QR code', category: 'UtilitiesApplication',
    short: 'Lien, Wi-Fi ou carte de contact. PNG et SVG, sans date d’expiration.',
    title: 'Générateur de QR code gratuit, sans inscription | YZ',
    desc: 'Créez un QR code pour un lien, un Wi-Fi ou une carte de contact. Téléchargement PNG ou SVG, sans compte, sans expiration et sans suivi.',
    h1: 'Générateur de QR code, sans inscription',
    lead: 'Créez un QR code pour un lien, un réseau Wi-Fi ou une carte de contact. Le code est fabriqué dans votre navigateur : il ne passe par aucun service et ne peut donc pas expirer.',
    lib: '/outils/qrcode.js',
    body: R`    <div class="grid">
      <label>Type de contenu<select id="type"><option value="text">Lien ou texte</option><option value="wifi">Réseau Wi-Fi</option><option value="contact">Carte de contact</option></select></label>
      <label>Taille de l'image<select id="size"><option value="320">320 px (écran)</option><option value="640" selected>640 px</option><option value="1280">1 280 px (impression)</option></select></label>
      <div class="full" id="f-text"><label>Lien ou texte<input id="text" value="https://yz-automation.fr" autocomplete="off"></label></div>
      <div class="full grid" id="f-wifi" hidden>
        <label>Nom du réseau<input id="wssid" autocomplete="off"></label>
        <label>Mot de passe<input id="wpass" autocomplete="off"></label>
        <label class="full">Sécurité<select id="wsec"><option value="WPA">WPA ou WPA2 (le plus courant)</option><option value="WEP">WEP</option><option value="nopass">Réseau ouvert</option></select></label>
      </div>
      <div class="full grid" id="f-contact" hidden>
        <label>Prénom<input id="cfn" autocomplete="off"></label>
        <label>Nom<input id="cln" autocomplete="off"></label>
        <label>Entreprise<input id="corg" autocomplete="off"></label>
        <label>Téléphone<input id="ctel" inputmode="tel" autocomplete="off"></label>
        <label>E-mail<input id="cmail" inputmode="email" autocomplete="off"></label>
        <label>Site internet<input id="curl" inputmode="url" autocomplete="off"></label>
      </div>
      <label class="full">Résistance aux dégâts<select id="level"><option value="M" selected>Moyenne (recommandée)</option><option value="L">Faible, code plus simple</option><option value="Q">Élevée</option><option value="H">Très élevée, pour une impression exposée</option></select></label>
    </div>
    <p class="center" style="margin:18px 0 0"><canvas id="qr" width="640" height="640" style="width:260px;border:1px solid var(--line);border-radius:12px" aria-label="QR code généré"></canvas></p>
    <p class="note center warn" id="msg" role="status"></p>
    <div class="actions" style="justify-content:center"><button class="primary" type="button" id="png">Télécharger en PNG</button><button type="button" id="svg">Télécharger en SVG</button></div>`,
    script: R`
var qr = null, type = $('type');
function escW(s) { return String(s).replace(/([\\;,:"])/g, '\\$1'); }
function data() {
  if (type.value === 'wifi') {
    var sec = $('wsec').value;
    if (!$('wssid').value) return '';
    return 'WIFI:T:' + sec + ';S:' + escW($('wssid').value) + ';' + (sec === 'nopass' ? '' : 'P:' + escW($('wpass').value) + ';') + ';';
  }
  if (type.value === 'contact') {
    var fn = $('cfn').value.trim(), ln = $('cln').value.trim();
    if (!fn && !ln) return '';
    var L = ['BEGIN:VCARD', 'VERSION:3.0', 'N:' + ln + ';' + fn, 'FN:' + (fn + ' ' + ln).trim()];
    if ($('corg').value) L.push('ORG:' + $('corg').value);
    if ($('ctel').value) L.push('TEL;TYPE=CELL:' + $('ctel').value);
    if ($('cmail').value) L.push('EMAIL:' + $('cmail').value);
    if ($('curl').value) L.push('URL:' + $('curl').value);
    L.push('END:VCARD');
    return L.join('\n');
  }
  return $('text').value.trim();
}
function draw() {
  ['text', 'wifi', 'contact'].forEach(function (k) { $('f-' + k).hidden = k !== type.value; });
  var d = data(), c = $('qr'), ctx = c.getContext('2d'), size = parseInt($('size').value, 10);
  c.width = c.height = size; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
  $('msg').textContent = ''; qr = null;
  if (!d) { $('msg').textContent = 'Renseignez le contenu du QR code.'; return; }
  try { qr = qrcode(0, $('level').value); qr.addData(d); qr.make(); }
  catch (e) { qr = null; $('msg').textContent = 'Contenu trop long pour un QR code. Raccourcissez-le.'; return; }
  var n = qr.getModuleCount(), cell = Math.max(1, Math.floor(size / (n + 8))), off = Math.floor((size - cell * n) / 2);
  ctx.fillStyle = '#000';
  for (var r = 0; r < n; r++) for (var col = 0; col < n; col++) if (qr.isDark(r, col)) ctx.fillRect(off + col * cell, off + r * cell, cell, cell);
}
document.addEventListener('input', draw);
$('png').addEventListener('click', function () { if (qr) download('qr-code.png', $('qr').toDataURL('image/png')); });
$('svg').addEventListener('click', function () { if (qr) download('qr-code.svg', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(qr.createSvgTag({ cellSize: 8, margin: 32, scalable: true }))); });
draw();`,
    help: R`    <h2>Comment utiliser votre QR code</h2>
    <p>Un QR code est une image qui contient un texte. Quand ce texte est un lien, le téléphone propose de l'ouvrir. Le code produit ici est dit statique : le contenu est inscrit dans l'image elle-même, sans redirection par un service tiers. Il fonctionne tant que le lien fonctionne.</p>
    <ul>
      <li><strong>Imprimez-le assez grand.</strong> Comptez 2 cm de côté au minimum pour une lecture à la main, et environ un dixième de la distance de lecture pour une affiche.</li>
      <li><strong>Gardez la marge blanche.</strong> Sans elle, beaucoup de téléphones ne détectent pas le code.</li>
      <li><strong>Testez avant d'imprimer</strong>, avec deux téléphones différents.</li>
      <li><strong>Dites ce qu'il ouvre.</strong> « Scannez pour laisser un avis » est scanné plus souvent qu'un code seul.</li>
    </ul>
    <p>Le format SVG reste net à toutes les tailles : c'est celui à donner à un imprimeur. Le PNG convient pour un écran ou un document.</p>`,
    faq: [
      ['Ce QR code a-t-il une date d’expiration ?', 'Non. Le lien est inscrit directement dans l’image, sans redirection. Le code reste lisible tant que la page ou le réseau qu’il désigne existe.'],
      ['Peut-on modifier le lien après impression ?', 'Non, c’est la contrepartie d’un code statique. Pour changer la destination sans réimprimer, faites pointer le code vers une adresse de votre propre site, que vous pourrez rediriger.'],
      ['Comment créer un QR code pour les avis Google ?', 'Copiez le lien « Demander des avis » depuis votre fiche Google Business Profile, collez-le dans le champ, puis téléchargez le code. Affichez-le en caisse ou sur vos factures.'],
      ['Le QR code Wi-Fi est-il sûr ?', 'Il contient le mot de passe en clair : toute personne qui le photographie peut se connecter. Réservez-le à un réseau invité, séparé de celui de l’entreprise.'],
    ],
    links: [[B + 'qr-code-avis-google', 'QR code pour les avis Google : le créer et où le placer'], ['/seo-technique-local', 'Référencement local : être trouvé sur Google Maps'], ['/outils/lien-whatsapp', 'Créer un lien WhatsApp avec son QR code']],
    cta: ['Plus d’avis Google, sans y penser', 'Un message part automatiquement après chaque prestation, avec le lien vers votre fiche. Vous récoltez des avis réguliers sans relancer à la main.', '/automatisation-ia', 'Voir l’automatisation'],
  },

  {
    slug: 'calcul-tva', name: 'Calculateur de TVA', category: 'FinanceApplication',
    short: 'HT vers TTC ou TTC vers HT, aux taux français de 20, 10, 5,5 et 2,1 %.',
    title: 'Calcul TVA : HT vers TTC et TTC vers HT | YZ Automation',
    desc: 'Calculez un prix TTC à partir du HT, ou retrouvez le HT à partir du TTC. Taux français de 20 %, 10 %, 5,5 % et 2,1 %, résultat immédiat.',
    h1: 'Calculateur de TVA : HT vers TTC et TTC vers HT',
    lead: 'Saisissez un montant, choisissez le taux et le sens du calcul. Le montant hors taxes, la TVA et le total TTC s’affichent aussitôt.',
    body: R`    <div class="grid three">
      <label>Montant en euros<input id="amount" inputmode="decimal" value="100"></label>
      <label>Taux de TVA<select id="rate"><option value="20">20 % (taux normal)</option><option value="10">10 % (intermédiaire)</option><option value="5.5">5,5 % (réduit)</option><option value="2.1">2,1 % (particulier)</option><option value="0">0 % (franchise ou exonération)</option></select></label>
      <label>Le montant saisi est<select id="dir"><option value="ht">hors taxes (HT)</option><option value="ttc">toutes taxes comprises (TTC)</option></select></label>
    </div>
    <div class="out" aria-live="polite">
      <div><strong id="ht">0 €</strong><span>Hors taxes</span></div>
      <div><strong id="tva">0 €</strong><span>TVA</span></div>
      <div><strong id="ttc">0 €</strong><span>TTC</span></div>
    </div>
    <div class="actions"><button type="button" id="copy">Copier le détail</button></div>`,
    script: R`
function calc() {
  var m = num($('amount').value), r = num($('rate').value) / 100, ht, ttc;
  if ($('dir').value === 'ht') { ht = m; ttc = m * (1 + r); } else { ttc = m; ht = m / (1 + r); }
  $('ht').textContent = eur(ht); $('tva').textContent = eur(ttc - ht); $('ttc').textContent = eur(ttc);
  return 'HT : ' + eur(ht) + ' | TVA ' + pct(r * 100) + ' : ' + eur(ttc - ht) + ' | TTC : ' + eur(ttc);
}
document.addEventListener('input', calc);
$('copy').addEventListener('click', function () { copyText(calc(), this); });
calc();`,
    help: R`    <h2>Les formules</h2>
    <ul>
      <li><strong>HT vers TTC :</strong> prix TTC = prix HT × (1 + taux). Pour 100 € à 20 % : 100 × 1,20 = 120 €.</li>
      <li><strong>TTC vers HT :</strong> prix HT = prix TTC ÷ (1 + taux). Pour 120 € à 20 % : 120 ÷ 1,20 = 100 €.</li>
      <li><strong>Montant de TVA :</strong> prix TTC moins prix HT.</li>
    </ul>
    <p>L'erreur la plus fréquente consiste à retirer 20 % du prix TTC pour retrouver le HT. 120 € moins 20 % donnent 96 €, et non 100 €. Il faut diviser par 1,20.</p>
    <h2>Les taux de TVA en France métropolitaine</h2>
    <div class="table"><table>
      <thead><tr><th>Taux</th><th>Exemples d'application</th></tr></thead>
      <tbody>
        <tr><td>20 %</td><td>Taux normal : la plupart des biens et des prestations de services</td></tr>
        <tr><td>10 %</td><td>Restauration sur place, transport de voyageurs, certains travaux de rénovation de logements</td></tr>
        <tr><td>5,5 %</td><td>Produits alimentaires, livres, travaux d'amélioration énergétique des logements</td></tr>
        <tr><td>2,1 %</td><td>Médicaments remboursables, presse</td></tr>
      </tbody>
    </table></div>
    <p class="note">Les conditions d'application de chaque taux sont fixées par le Code général des impôts. En cas de doute sur une prestation, votre expert-comptable ou le site impots.gouv.fr font foi.</p>`,
    faq: [
      ['Comment calculer un prix HT à partir du TTC ?', 'Divisez le prix TTC par 1 plus le taux. À 20 %, divisez par 1,20. À 10 %, par 1,10. À 5,5 %, par 1,055. Ne retirez pas le pourcentage du prix TTC : le résultat serait faux.'],
      ['Quel taux pour un auto-entrepreneur en franchise de TVA ?', 'En franchise en base, vous ne facturez pas de TVA : choisissez 0 %. La facture doit porter la mention « TVA non applicable, article 293 B du CGI ».'],
      ['Quel taux de TVA pour des travaux chez un particulier ?', 'Cela dépend de la nature des travaux et de l’âge du logement : 20 % par défaut, 10 % pour certains travaux de rénovation dans un logement de plus de deux ans, 5,5 % pour l’amélioration énergétique. Vérifiez les conditions avant d’émettre le devis.'],
    ],
    links: [['/outils/calcul-marge', 'Calculer sa marge et son prix de vente'], [B + 'automatiser-devis-pme-methode', 'Automatiser ses devis : la méthode pour une PME'], [B + 'facture-electronique-obligatoire-tpe-pme', 'Facture électronique obligatoire : le guide TPE et PME'], ['/outils/penalites-retard-facture', 'Calculer des pénalités de retard']],
    cta: ['Vos devis partent tout seuls', 'À partir d’une demande client, le devis est rédigé avec les bons taux, envoyé, puis relancé. Vous validez, le reste est automatique.', '/automatisation-ia', 'Automatiser mes devis'],
  },

  {
    slug: 'calcul-marge', name: 'Calculateur de marge', category: 'FinanceApplication',
    short: 'Taux de marge, taux de marque, coefficient et prix de vente à viser.',
    title: 'Calcul de marge, taux de marque et prix de vente | YZ',
    desc: 'Calculez marge, taux de marge, taux de marque et coefficient à partir de vos prix d’achat et de vente. Trouvez le prix de vente pour un taux visé.',
    h1: 'Calculateur de marge, de taux de marque et de prix de vente',
    lead: 'Saisissez votre prix d’achat et votre prix de vente hors taxes pour obtenir la marge, le taux de marge, le taux de marque et le coefficient multiplicateur.',
    body: R`    <div class="grid three">
      <label>Coût d'achat ou de revient HT<input id="cost" inputmode="decimal" value="60"></label>
      <label>Prix de vente HT<input id="price" inputmode="decimal" value="100"></label>
      <label>TVA à la vente<select id="vat"><option value="20">20 %</option><option value="10">10 %</option><option value="5.5">5,5 %</option><option value="2.1">2,1 %</option><option value="0">0 %</option></select></label>
    </div>
    <div class="out" aria-live="polite">
      <div><strong id="margin">0 €</strong><span>Marge brute</span></div>
      <div><strong id="markup">0 %</strong><span>Taux de marge (sur l'achat)</span></div>
      <div><strong id="rate">0 %</strong><span>Taux de marque (sur la vente)</span></div>
      <div><strong id="coef">0</strong><span>Coefficient multiplicateur</span></div>
      <div><strong id="ttc">0 €</strong><span>Prix de vente TTC</span></div>
      <div><strong id="qty">0</strong><span>Ventes pour 1 000 € de marge</span></div>
    </div>
    <h3>Quel prix de vente pour un taux de marque visé ?</h3>
    <div class="grid">
      <label>Taux de marque visé, en %<input id="target" inputmode="decimal" value="40"></label>
      <label>Prix de vente HT à pratiquer<input id="needed" readonly></label>
    </div>`,
    script: R`
function calc() {
  var c = num($('cost').value), p = num($('price').value), v = num($('vat').value) / 100, m = p - c;
  $('margin').textContent = eur(m);
  $('markup').textContent = c > 0 ? pct(m / c * 100) : 'n. d.';
  $('rate').textContent = p > 0 ? pct(m / p * 100) : 'n. d.';
  $('coef').textContent = c > 0 ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(p * (1 + v) / c) : 'n. d.';
  $('ttc').textContent = eur(p * (1 + v));
  $('qty').textContent = m > 0 ? String(Math.ceil(1000 / m)) : 'n. d.';
  var t = num($('target').value) / 100;
  $('needed').value = c > 0 && t > 0 && t < 1 ? eur(c / (1 - t)) : '';
}
document.addEventListener('input', calc);
calc();`,
    help: R`    <h2>Taux de marge ou taux de marque : la différence</h2>
    <p>Les deux mesurent la même marge, rapportée à deux bases différentes. Les confondre fausse un prix de vente.</p>
    <div class="table"><table>
      <thead><tr><th>Indicateur</th><th>Formule</th><th>Exemple : achat 60 €, vente 100 €</th></tr></thead>
      <tbody>
        <tr><td>Marge brute</td><td>prix de vente HT moins coût d'achat HT</td><td>40 €</td></tr>
        <tr><td>Taux de marge</td><td>marge ÷ coût d'achat</td><td>66,67 %</td></tr>
        <tr><td>Taux de marque</td><td>marge ÷ prix de vente</td><td>40 %</td></tr>
        <tr><td>Coefficient multiplicateur</td><td>prix de vente TTC ÷ coût d'achat HT</td><td>2 (avec 20 % de TVA)</td></tr>
      </tbody>
    </table></div>
    <p>Pour viser un taux de marque, la formule est : prix de vente HT = coût d'achat ÷ (1 moins le taux de marque). Avec un achat à 60 € et 40 % de marque : 60 ÷ 0,60 = 100 €. Ajouter 40 % au coût d'achat donnerait 84 €, soit un taux de marque de 28,6 % seulement.</p>
    <p>Pour un service, remplacez le coût d'achat par votre coût de revient : temps passé multiplié par votre coût horaire, plus les achats et les frais directs.</p>`,
    faq: [
      ['Comment calculer un prix de vente avec 30 % de marge ?', 'Précisez d’abord la base. Avec 30 % de taux de marge, multipliez le coût d’achat par 1,30. Avec 30 % de taux de marque, divisez le coût d’achat par 0,70. Pour un achat à 100 €, cela donne 130 € dans le premier cas et 142,86 € dans le second.'],
      ['Qu’est-ce qu’un coefficient multiplicateur ?', 'C’est le nombre par lequel on multiplie le prix d’achat hors taxes pour obtenir le prix de vente TTC. Un coefficient de 2 signifie qu’un article acheté 50 € HT est vendu 100 € TTC.'],
      ['La marge brute est-elle mon bénéfice ?', 'Non. Elle doit encore couvrir les frais fixes : loyer, salaires, assurances, logiciels, déplacements. Le bénéfice est ce qui reste une fois ces charges payées.'],
    ],
    links: [['/outils/calcul-tva', 'Calculateur de TVA'], [B + 'prix-automatisation-entreprise-2026', 'Prix d’une automatisation en entreprise'], ['/calculateur-temps-perdu', 'Calculer ce que coûtent vos tâches répétitives'], ['/power-bi-dashboard', 'Suivre ses marges dans un tableau de bord']],
    cta: ['Vos marges suivies sans tableur', 'Ventes, achats et heures réunis dans un tableau de bord mis à jour seul, pour voir quelle prestation rapporte vraiment.', '/power-bi-dashboard', 'Voir les tableaux de bord'],
  },

  {
    slug: 'signature-email', name: 'Générateur de signature e-mail', category: 'BusinessApplication',
    short: 'Une signature propre pour Gmail, Outlook ou Apple Mail, prête à coller.',
    title: 'Générateur de signature e-mail professionnelle | YZ',
    desc: 'Créez une signature e-mail professionnelle en une minute : nom, fonction, téléphone, site. Compatible Gmail, Outlook et Apple Mail, sans inscription.',
    h1: 'Générateur de signature e-mail professionnelle',
    lead: 'Remplissez les champs, vérifiez l’aperçu, puis copiez la signature dans votre messagerie. Le code est simple et s’affiche correctement dans Gmail, Outlook et Apple Mail.',
    body: R`    <div class="grid">
      <label>Prénom et nom<input id="s-name" value="Prénom Nom" autocomplete="off"></label>
      <label>Fonction<input id="s-role" value="Gérant" autocomplete="off"></label>
      <label>Entreprise<input id="s-org" value="Nom de l'entreprise" autocomplete="off"></label>
      <label>Téléphone<input id="s-tel" value="01 23 45 67 89" inputmode="tel" autocomplete="off"></label>
      <label>E-mail<input id="s-mail" value="contact@exemple.fr" inputmode="email" autocomplete="off"></label>
      <label>Site internet<input id="s-url" value="https://exemple.fr" inputmode="url" autocomplete="off"></label>
      <label>Adresse ou zone desservie (facultatif)<input id="s-addr" autocomplete="off"></label>
      <label>Couleur d'accent<input id="s-color" type="color" value="#1d4ed8"></label>
    </div>
    <div class="sig" id="preview" aria-label="Aperçu de la signature"></div>
    <div class="actions"><button class="primary" type="button" id="rich">Copier la signature</button><button type="button" id="html">Copier le code HTML</button></div>`,
    script: R`
function e(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function build() {
  var v = function (id) { return $(id).value.trim(); }, c = /^#[0-9a-f]{6}$/i.test($('s-color').value) ? $('s-color').value : '#1d4ed8';
  var url = v('s-url'), href = url && !/^https?:\/\//i.test(url) ? 'https://' + url : url, tel = v('s-tel');
  var lines = [];
  if (tel) lines.push('<a href="tel:' + e(tel.replace(/[^+\d]/g, '')) + '" style="color:#333333;text-decoration:none">' + e(tel) + '</a>');
  if (v('s-mail')) lines.push('<a href="mailto:' + e(v('s-mail')) + '" style="color:#333333;text-decoration:none">' + e(v('s-mail')) + '</a>');
  if (url) lines.push('<a href="' + e(href) + '" style="color:' + c + ';text-decoration:none">' + e(url.replace(/^https?:\/\//i, '').replace(/\/$/, '')) + '</a>');
  var role = [v('s-role'), v('s-org')].filter(Boolean).join(', ');
  return '<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333333">'
    + '<tr><td style="border-left:3px solid ' + c + ';padding-left:12px">'
    + '<div style="font-size:16px;font-weight:bold;color:#111111">' + e(v('s-name')) + '</div>'
    + (role ? '<div style="color:#555555">' + e(role) + '</div>' : '')
    + (lines.length ? '<div style="margin-top:6px">' + lines.join(' &nbsp;|&nbsp; ') + '</div>' : '')
    + (v('s-addr') ? '<div style="color:#777777;font-size:13px">' + e(v('s-addr')) + '</div>' : '')
    + '</td></tr></table>';
}
function render() { $('preview').innerHTML = build(); }
document.addEventListener('input', render);
$('html').addEventListener('click', function () { copyText(build(), this); });
$('rich').addEventListener('click', function () {
  var btn = this, range = document.createRange(), sel = window.getSelection();
  range.selectNodeContents($('preview')); sel.removeAllRanges(); sel.addRange(range);
  try { document.execCommand('copy'); btn.textContent = 'Copiée'; setTimeout(function () { btn.textContent = 'Copier la signature'; }, 1600); } catch (err) {}
  sel.removeAllRanges();
});
render();`,
    help: R`    <h2>Installer la signature</h2>
    <ul>
      <li><strong>Gmail :</strong> roue dentée, « Voir tous les paramètres », onglet « Général », rubrique « Signature ». Créez une signature et collez.</li>
      <li><strong>Outlook :</strong> « Paramètres », « Courrier », « Composer et répondre », puis collez dans le champ de signature.</li>
      <li><strong>Apple Mail :</strong> « Réglages », « Signatures », créez une signature, décochez « Toujours utiliser ma police par défaut », puis collez.</li>
    </ul>
    <p>Utilisez « Copier la signature » pour ces trois messageries. « Copier le code HTML » sert aux outils qui demandent du code, comme un logiciel de facturation ou d'envoi groupé.</p>
    <h2>Ce qui fait une bonne signature</h2>
    <ul>
      <li><strong>Quatre lignes au plus.</strong> Nom, fonction et entreprise, un téléphone, un site.</li>
      <li><strong>Pas d'image lourde.</strong> Beaucoup de messageries bloquent les images, et une signature en image n'est ni lisible ni cliquable.</li>
      <li><strong>Une adresse à votre nom de domaine.</strong> contact@votre-entreprise.fr inspire plus confiance qu'une adresse généraliste.</li>
    </ul>`,
    faq: [
      ['Pourquoi ma signature s’affiche-t-elle mal dans Outlook ?', 'Outlook gère mal les mises en page complexes et les images. Cette signature utilise un tableau simple et des styles en ligne, la forme la plus fiable. Collez-la sans la retoucher dans un traitement de texte.'],
      ['Faut-il mettre un logo dans sa signature ?', 'Ce n’est pas nécessaire. Les images sont souvent bloquées ou jointes en pièce attachée, ce qui alourdit chaque message. Un nom en gras et une couleur d’accent suffisent.'],
      ['Quelles mentions sont obligatoires dans un e-mail professionnel ?', 'Pour une société, les messages commerciaux doivent permettre d’identifier l’entreprise : dénomination, forme, siège, numéro d’immatriculation. Ajoutez-les sur une ligne discrète si vos e-mails servent de documents commerciaux.'],
    ],
    links: [[B + 'adresse-email-nom-de-domaine', 'Créer une adresse e-mail avec son nom de domaine'], ['/creation-site-internet', 'Création de site internet dès 490 €'], ['/outils/qr-code', 'Générer un QR code de carte de contact']],
    cta: ['Des e-mails qui se rédigent seuls', 'Réponses aux demandes courantes, relances de devis, confirmations de rendez-vous : un agent IA prépare les messages, vous gardez la main sur l’envoi.', '/automatisation-ia', 'Voir les agents IA'],
  },

  {
    slug: 'donnees-structurees-entreprise-locale', name: 'Générateur de données structurées locales', category: 'DeveloperApplication',
    short: 'Le code LocalBusiness à coller sur votre site, sans écrire de JSON.',
    title: 'Générateur de données structurées LocalBusiness | YZ',
    desc: 'Générez le code JSON-LD LocalBusiness de votre entreprise : métier, adresse, horaires, zones desservies. À coller sur votre site, sans rien installer.',
    h1: 'Générateur de données structurées pour entreprise locale',
    lead: 'Remplissez la fiche de votre entreprise. L’outil produit le code JSON-LD de type LocalBusiness, que Google lit pour comprendre qui vous êtes, où vous travaillez et quand vous êtes ouvert.',
    body: R`    <div class="grid">
      <label>Métier<select id="l-type">
        <option value="LocalBusiness">Entreprise locale (générique)</option><option value="Plumber">Plombier</option><option value="Electrician">Électricien</option><option value="HVACBusiness">Chauffagiste, climatisation</option><option value="RoofingContractor">Couvreur</option><option value="GeneralContractor">Entreprise du bâtiment</option><option value="Locksmith">Serrurier</option><option value="HousePainter">Peintre</option><option value="Restaurant">Restaurant</option><option value="Bakery">Boulangerie</option><option value="HairSalon">Salon de coiffure</option><option value="BeautySalon">Institut de beauté</option><option value="AutoRepair">Garage automobile</option><option value="Dentist">Dentiste</option><option value="Physician">Médecin</option><option value="LegalService">Avocat, service juridique</option><option value="AccountingService">Expert-comptable</option><option value="RealEstateAgent">Agence immobilière</option><option value="Florist">Fleuriste</option><option value="Store">Commerce</option><option value="ProfessionalService">Prestataire de services</option>
      </select></label>
      <label>Nom de l'entreprise<input id="l-name" autocomplete="off" value="Nom de l'entreprise"></label>
      <label>Adresse du site<input id="l-url" inputmode="url" autocomplete="off" value="https://exemple.fr"></label>
      <label>Téléphone<input id="l-tel" inputmode="tel" autocomplete="off" value="01 23 45 67 89"></label>
      <label class="full">Description en une phrase<input id="l-desc" autocomplete="off"></label>
      <label>Rue<input id="l-street" autocomplete="off"></label>
      <label>Code postal<input id="l-zip" inputmode="numeric" autocomplete="off"></label>
      <label>Ville<input id="l-city" autocomplete="off"></label>
      <label>Gamme de prix<select id="l-price"><option value="">Ne pas indiquer</option><option>€</option><option>€€</option><option>€€€</option></select></label>
      <label class="full">Communes ou zones desservies, séparées par des virgules<input id="l-area" autocomplete="off" placeholder="Cergy, Pontoise, Val-d'Oise"></label>
      <label>Ouverture en semaine<input id="l-open" type="time" value="09:00"></label>
      <label>Fermeture en semaine<input id="l-close" type="time" value="18:00"></label>
    </div>
    <p class="checks" style="margin-top:12px">
      <label><input type="checkbox" id="l-sat">Ouvert le samedi aux mêmes horaires</label>
      <label><input type="checkbox" id="l-hide">Je me déplace chez mes clients (ne pas publier la rue)</label>
    </p>
    <pre id="code" aria-label="Code JSON-LD généré"></pre>
    <div class="actions"><button class="primary" type="button" id="copy">Copier le code</button><a class="btn" href="https://search.google.com/test/rich-results" rel="noopener">Tester dans l'outil de Google</a></div>`,
    script: R`
function tel(v) { var d = v.replace(/[^+\d]/g, ''); return /^0\d{9}$/.test(d) ? '+33' + d.slice(1) : d; }
function build() {
  var v = function (id) { return $(id).value.trim(); };
  var o = { '@context': 'https://schema.org', '@type': v('l-type'), name: v('l-name') };
  if (v('l-desc')) o.description = v('l-desc');
  if (v('l-url')) { o.url = v('l-url'); o['@id'] = v('l-url').replace(/\/$/, '') + '/#entreprise'; }
  if (v('l-tel')) o.telephone = tel(v('l-tel'));
  if (v('l-price')) o.priceRange = v('l-price');
  var a = { '@type': 'PostalAddress' };
  if (v('l-street') && !$('l-hide').checked) a.streetAddress = v('l-street');
  if (v('l-zip')) a.postalCode = v('l-zip');
  if (v('l-city')) a.addressLocality = v('l-city');
  a.addressCountry = 'FR';
  if (a.postalCode || a.addressLocality || a.streetAddress) o.address = a;
  var areas = v('l-area').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  if (areas.length) o.areaServed = areas.map(function (n) { return { '@type': 'AdministrativeArea', name: n }; });
  if (v('l-open') && v('l-close')) {
    var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    if ($('l-sat').checked) days.push('Saturday');
    o.openingHoursSpecification = [{ '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: v('l-open'), closes: v('l-close') }];
  }
  return '<scr' + 'ipt type="application/ld+json">\n' + JSON.stringify(o, null, 2).replace(/</g, '\\u003c') + '\n</scr' + 'ipt>';
}
function render() { $('code').textContent = build(); }
document.addEventListener('input', render);
$('copy').addEventListener('click', function () { copyText(build(), this); });
render();`,
    help: R`    <h2>À quoi servent ces données</h2>
    <p>Les données structurées sont un bloc de code invisible pour le visiteur, écrit dans un vocabulaire commun aux moteurs de recherche (schema.org). Elles disent sans ambiguïté le nom de l'entreprise, son métier, son adresse, ses horaires et ses zones d'intervention. Google s'en sert pour relier votre site à votre fiche d'établissement, et les assistants IA pour citer vos coordonnées sans les deviner.</p>
    <h2>Où coller le code</h2>
    <ol>
      <li>Copiez le code généré.</li>
      <li>Collez-le dans la partie <code>&lt;head&gt;</code> de votre page d'accueil ou de votre page de contact. Sur WordPress, une extension d'insertion de code dans l'en-tête suffit.</li>
      <li>Vérifiez la page avec l'outil de test des résultats enrichis de Google.</li>
    </ol>
    <h2>Trois règles pour ne pas se tromper</h2>
    <ul>
      <li><strong>Les mêmes informations que sur votre fiche Google</strong>, au caractère près : nom, téléphone, adresse.</li>
      <li><strong>Le type le plus précis.</strong> « Plombier » vaut mieux que « Entreprise locale ».</li>
      <li><strong>Aucune note d'avis ajoutée à la main.</strong> Google ignore les étoiles qu'une entreprise s'attribue sur son propre site, et peut le sanctionner.</li>
    </ul>`,
    faq: [
      ['Les données structurées améliorent-elles le classement Google ?', 'Elles ne font pas monter une page à elles seules. Elles aident Google à comprendre l’entreprise et à l’associer à sa fiche d’établissement, et rendent possibles certains affichages enrichis. C’est une base à poser, pas un levier isolé.'],
      ['Faut-il mettre ce code sur toutes les pages ?', 'La page d’accueil ou la page de contact suffit pour décrire l’entreprise. Si vous avez plusieurs établissements, placez un bloc par établissement sur la page qui lui est dédiée.'],
      ['Que faire si je n’ai pas de local ouvert au public ?', 'Cochez la case de déplacement chez les clients : la rue n’est pas publiée, seules la ville et les zones desservies le sont. C’est le cas des artisans et des prestataires à domicile.'],
    ],
    links: [['/seo-technique-local', 'Référencement local : la méthode complète'], [B + 'schema-localbusiness-donnees-structurees-seo-local', 'Données structurées LocalBusiness : le guide'], ['/outils/apercu-google', 'Vérifier son titre et sa description dans Google'], ['https://yaniszedira.github.io/checklist-seo-local/', 'Checklist SEO local : 40 points à vérifier']],
    cta: ['Votre entreprise en tête sur Google Maps', 'Fiche Google, pages locales, données structurées et avis : un diagnostic offert, puis un suivi dès 49 € par mois.', '/seo-technique-local', 'Voir le référencement local'],
  },

  {
    slug: 'apercu-google', name: 'Aperçu Google', category: 'DeveloperApplication',
    short: 'Voyez votre titre et votre description tels que Google les affiche.',
    title: 'Aperçu Google : tester son titre et sa description | YZ',
    desc: 'Testez le titre et la meta description d’une page avant de la publier : aperçu du résultat Google, compteur de caractères et alerte de troncature.',
    h1: 'Aperçu Google : testez votre titre et votre description',
    lead: 'Écrivez le titre et la description d’une page pour voir le résultat tel qu’il apparaîtra dans Google, avec la longueur en caractères et en pixels.',
    body: R`    <div class="grid">
      <label class="full">Titre de la page <span id="tc" class="note"></span><input id="g-title" value="Plombier à Cergy : dépannage en 1 heure, devis offert" autocomplete="off"></label>
      <label class="full">Description <span id="dc" class="note"></span><textarea id="g-desc">Fuite, chauffe-eau, débouchage : intervention en 1 heure à Cergy et dans le Val-d'Oise. Prix annoncé avant de commencer, 4,9/5 sur 120 avis.</textarea></label>
      <label class="full">Adresse de la page<input id="g-url" value="https://exemple.fr/plombier-cergy" inputmode="url" autocomplete="off"></label>
    </div>
    <div class="serp" aria-label="Aperçu du résultat Google">
      <div class="u" id="pu"></div>
      <div class="t" id="pt"></div>
      <div class="d" id="pd"></div>
    </div>`,
    script: R`
var ctx = document.createElement('canvas').getContext('2d');
function width(text, font) { ctx.font = font; return ctx.measureText(text).width; }
function cut(text, font, max) {
  if (width(text, font) <= max) return text;
  var out = text;
  while (out.length > 1 && width(out + ' ...', font) > max) out = out.slice(0, -1);
  return out.replace(/\s+\S*$/, '') + ' ...';
}
function state(el, len, px, maxPx, min) {
  var ok = px <= maxPx && len >= min;
  el.textContent = '(' + len + ' caractères, ' + Math.round(px) + ' px sur ' + maxPx + (px > maxPx ? ' : trop long, sera coupé' : len < min ? ' : un peu court' : ' : bonne longueur') + ')';
  el.className = 'note ' + (ok ? 'ok' : 'warn');
}
function render() {
  var t = $('g-title').value.trim(), d = $('g-desc').value.trim().replace(/\s+/g, ' '), u = $('g-url').value.trim();
  var tf = '20px Arial', df = '14px Arial';
  state($('tc'), t.length, width(t, tf), 580, 30);
  state($('dc'), d.length, width(d, df), 920, 70);
  $('pt').textContent = cut(t, tf, 580) || 'Titre de la page';
  $('pd').textContent = cut(d, df, 920) || 'Description de la page.';
  var m = u.match(/^(https?:\/\/)?([^\/]+)(\/.*)?$/i);
  $('pu').textContent = m ? m[2] + (m[3] && m[3] !== '/' ? ' › ' + m[3].split('/').filter(Boolean).join(' › ') : '') : u;
}
document.addEventListener('input', render);
render();`,
    help: R`    <h2>Les longueurs à viser</h2>
    <div class="table"><table>
      <thead><tr><th>Élément</th><th>Repère</th><th>Pourquoi</th></tr></thead>
      <tbody>
        <tr><td>Titre</td><td>50 à 60 caractères, environ 580 pixels</td><td>Au-delà, Google coupe ou réécrit le titre</td></tr>
        <tr><td>Description</td><td>120 à 155 caractères</td><td>Sur téléphone, l'affichage est plus court encore</td></tr>
      </tbody>
    </table></div>
    <p>Google ne compte pas les caractères mais la largeur en pixels : un « W » prend plus de place qu'un « i ». L'outil mesure donc les deux. L'aperçu reste une estimation, car Google ajuste l'affichage selon l'écran et la recherche.</p>
    <h2>Ce qui donne envie de cliquer</h2>
    <ul>
      <li><strong>Le mot recherché au début du titre</strong>, suivi de la ville pour une activité locale.</li>
      <li><strong>Une raison concrète :</strong> un prix de départ, un délai, une note d'avis, une garantie.</li>
      <li><strong>Un titre différent pour chaque page.</strong> Deux pages au même titre se font concurrence.</li>
      <li><strong>Une description qui répond à la recherche</strong>, pas un slogan.</li>
    </ul>
    <p>Google peut afficher un autre texte que votre description s'il juge qu'un passage de la page répond mieux à la recherche. C'est fréquent et sans gravité.</p>`,
    faq: [
      ['Quelle est la longueur idéale d’un titre pour Google ?', 'Entre 50 et 60 caractères, soit environ 580 pixels de large. C’est la largeur affichée sur ordinateur avant troncature. Mieux vaut un titre de 55 caractères complet qu’un titre de 70 coupé au milieu d’un mot.'],
      ['La meta description compte-t-elle pour le classement ?', 'Pas directement. Elle n’entre pas dans le classement, mais elle influence le taux de clic : à position égale, un résultat plus convaincant reçoit plus de visites.'],
      ['Pourquoi Google n’affiche-t-il pas ma description ?', 'Google choisit parfois un extrait de la page qu’il estime plus proche de la recherche. Cela arrive quand la description est absente, trop courte, ou éloignée de ce que l’internaute a tapé.'],
    ],
    links: [['/seo-technique-local', 'Référencement local : diagnostic offert'], [B + 'combien-de-temps-pour-etre-reference-sur-google', 'Combien de temps pour être référencé sur Google ?'], [B + 'seo-technique-site-vitrine-12-points', 'SEO technique d’un site vitrine : les 12 points'], ['/outils/donnees-structurees-entreprise-locale', 'Générer ses données structurées locales']],
    cta: ['Des pages que Google montre et que l’on clique', 'Titres, descriptions, pages locales et fiche Google revus ensemble, avec un suivi mensuel des positions et des appels.', '/seo-technique-local', 'Demander un diagnostic'],
  },

  {
    slug: 'lien-whatsapp', name: 'Générateur de lien WhatsApp', category: 'UtilitiesApplication',
    short: 'Un lien et un QR code qui ouvrent une discussion avec votre numéro.',
    title: 'Créer un lien WhatsApp avec message et QR code | YZ',
    desc: 'Créez un lien WhatsApp cliquable vers votre numéro, avec un message déjà écrit et son QR code. Pour un site, une fiche Google ou une carte de visite.',
    h1: 'Créer un lien WhatsApp, avec message et QR code',
    lead: 'Saisissez votre numéro et, si vous le souhaitez, un message de départ. Vous obtenez un lien qui ouvre directement la discussion, et le QR code qui va avec.',
    lib: '/outils/qrcode.js',
    body: R`    <div class="grid">
      <label>Numéro WhatsApp<input id="w-tel" inputmode="tel" value="06 12 34 56 78" autocomplete="off"></label>
      <label>Pays du numéro<select id="w-cc"><option value="33">France (+33)</option><option value="32">Belgique (+32)</option><option value="41">Suisse (+41)</option><option value="352">Luxembourg (+352)</option><option value="1">Canada (+1)</option><option value="212">Maroc (+212)</option><option value="213">Algérie (+213)</option><option value="216">Tunisie (+216)</option></select></label>
      <label class="full">Message déjà écrit (facultatif)<textarea id="w-msg">Bonjour, je souhaite un devis pour</textarea></label>
    </div>
    <pre id="link" aria-label="Lien WhatsApp généré"></pre>
    <div class="actions"><button class="primary" type="button" id="copy">Copier le lien</button><a class="btn" id="open" rel="noopener" target="_blank">Tester le lien</a><button type="button" id="png">Télécharger le QR code</button></div>
    <p class="center" style="margin:18px 0 0"><canvas id="qr" width="480" height="480" style="width:200px;border:1px solid var(--line);border-radius:12px" aria-label="QR code du lien WhatsApp"></canvas></p>`,
    script: R`
function link() {
  var d = $('w-tel').value.replace(/\D/g, ''), cc = $('w-cc').value;
  if (d.indexOf('00') === 0) d = d.slice(2);
  else if ($('w-tel').value.trim().charAt(0) !== '+' && d.indexOf(cc) !== 0) d = cc + d.replace(/^0/, '');
  else if (d.charAt(0) === '0') d = cc + d.slice(1);
  if (d.length < 8) return '';
  var m = $('w-msg').value.trim();
  return 'https://wa.me/' + d + (m ? '?text=' + encodeURIComponent(m) : '');
}
function render() {
  var l = link(), c = $('qr'), ctx = c.getContext('2d');
  $('link').textContent = l || 'Saisissez un numéro complet.';
  if (l) $('open').href = l; else $('open').removeAttribute('href');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  if (!l) return;
  try {
    var q = qrcode(0, 'M'); q.addData(l); q.make();
    var n = q.getModuleCount(), cell = Math.max(1, Math.floor(c.width / (n + 8))), off = Math.floor((c.width - cell * n) / 2);
    ctx.fillStyle = '#000';
    for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (q.isDark(r, k)) ctx.fillRect(off + k * cell, off + r * cell, cell, cell);
  } catch (e) {}
}
document.addEventListener('input', render);
$('copy').addEventListener('click', function () { var l = link(); if (l) copyText(l, this); });
$('png').addEventListener('click', function () { if (link()) download('qr-code-whatsapp.png', $('qr').toDataURL('image/png')); });
render();`,
    help: R`    <h2>Comment fonctionne un lien WhatsApp</h2>
    <p>Le lien prend la forme <code>https://wa.me/</code> suivi du numéro au format international, sans le signe plus, sans espace et sans le zéro initial. Pour un mobile français 06 12 34 56 78, cela donne <code>wa.me/33612345678</code>. Sur téléphone, il ouvre l'application. Sur ordinateur, il ouvre WhatsApp Web.</p>
    <p>Le message déjà écrit apparaît dans le champ de saisie de votre client, qui peut le modifier avant de l'envoyer. Rien ne part sans son action.</p>
    <h2>Où le placer</h2>
    <ul>
      <li><strong>Sur votre site</strong>, en bouton près du téléphone.</li>
      <li><strong>Sur votre fiche Google</strong>, dans les liens de contact.</li>
      <li><strong>En QR code</strong> sur une carte de visite, une vitrine, un véhicule ou un devis papier.</li>
      <li><strong>Dans votre signature e-mail</strong> et vos profils de réseaux sociaux.</li>
    </ul>
    <p>Utilisez de préférence un numéro WhatsApp Business : il sépare les échanges professionnels de vos conversations personnelles et permet un message d'accueil.</p>`,
    faq: [
      ['Mon client doit-il enregistrer mon numéro pour m’écrire ?', 'Non. Le lien ouvre directement la discussion, sans passer par le carnet d’adresses. C’est ce qui le rend plus efficace qu’un numéro à recopier.'],
      ['Le lien fonctionne-t-il avec WhatsApp Business ?', 'Oui, il fonctionne de la même façon avec un compte WhatsApp classique et un compte WhatsApp Business. Seul le numéro compte.'],
      ['Peut-on répondre automatiquement sur WhatsApp ?', 'WhatsApp Business propose un message d’accueil et un message d’absence. Pour répondre aux questions, qualifier la demande et proposer un rendez-vous, il faut un agent relié à l’interface professionnelle de WhatsApp.'],
    ],
    links: [['/chatbot-site-internet', 'Chatbot IA pour site internet'], ['/agent-vocal-ia', 'Agent vocal IA : plus aucun appel manqué'], ['/outils/qr-code', 'Générateur de QR code'], ['/outils/signature-email', 'Générateur de signature e-mail']],
    cta: ['Une réponse en quelques secondes, jour et nuit', 'Un agent IA répond aux messages, pose les bonnes questions et place le rendez-vous dans votre agenda. Dès 390 €.', '/chatbot-site-internet', 'Voir l’agent de réponse'],
  },

  {
    slug: 'penalites-retard-facture', name: 'Calculateur de pénalités de retard', category: 'FinanceApplication',
    short: 'Pénalités et indemnité de 40 € sur une facture impayée entre professionnels.',
    title: 'Calcul des pénalités de retard d’une facture | YZ',
    desc: 'Calculez les pénalités de retard d’une facture impayée entre professionnels : jours de retard, intérêts et indemnité forfaitaire de 40 €.',
    h1: 'Calculateur de pénalités de retard sur facture',
    lead: 'Indiquez le montant de la facture, sa date d’échéance et le taux prévu dans vos conditions. L’outil calcule les jours de retard, les pénalités et l’indemnité forfaitaire de recouvrement.',
    body: R`    <div class="grid">
      <label>Montant TTC de la facture<input id="p-amount" inputmode="decimal" value="1200"></label>
      <label>Taux annuel des pénalités, en %<input id="p-rate" inputmode="decimal" placeholder="Taux de vos conditions de vente"></label>
      <label>Date d'échéance<input id="p-due" type="date"></label>
      <label>Date de paiement ou du jour<input id="p-paid" type="date"></label>
    </div>
    <p class="checks" style="margin-top:12px"><label><input type="checkbox" id="p-fee" checked>Ajouter l'indemnité forfaitaire de 40 € (client professionnel)</label></p>
    <div class="out" aria-live="polite">
      <div><strong id="days">0</strong><span>Jours de retard</span></div>
      <div><strong id="pen">0 €</strong><span>Pénalités de retard</span></div>
      <div><strong id="total">0 €</strong><span>Total dû avec la facture</span></div>
    </div>
    <p class="note warn" id="p-msg" role="status" style="margin:10px 0 0"></p>
    <div class="actions"><button type="button" id="copy">Copier le détail</button></div>`,
    script: R`
var iso = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
var today = new Date(), due = new Date(today.getTime() - 30 * 864e5);
$('p-paid').value = iso(today); $('p-due').value = iso(due);
function calc() {
  var m = num($('p-amount').value), r = num($('p-rate').value), a = Date.parse($('p-due').value), b = Date.parse($('p-paid').value);
  var days = isFinite(a) && isFinite(b) ? Math.max(0, Math.round((b - a) / 864e5)) : 0;
  var pen = m * r / 100 * days / 365, fee = $('p-fee').checked && days > 0 ? 40 : 0;
  $('days').textContent = String(days); $('pen').textContent = eur(pen); $('total').textContent = eur(m + pen + fee);
  $('p-msg').textContent = r > 0 ? '' : 'Saisissez le taux annuel inscrit dans vos conditions générales de vente ou sur la facture.';
  return 'Facture de ' + eur(m) + ', ' + days + ' jours de retard au taux annuel de ' + pct(r) + ' : pénalités ' + eur(pen) + (fee ? ', indemnité forfaitaire 40,00 €' : '') + ', total dû ' + eur(m + pen + fee) + '.';
}
document.addEventListener('input', calc);
$('copy').addEventListener('click', function () { copyText(calc(), this); });
calc();`,
    help: R`    <h2>La formule</h2>
    <p>Pénalités = montant TTC de la facture × taux annuel × nombre de jours de retard ÷ 365. Le retard se compte à partir du lendemain de la date d'échéance inscrite sur la facture.</p>
    <h2>Ce que prévoit la loi entre professionnels</h2>
    <ul>
      <li><strong>Les pénalités sont dues de plein droit</strong>, sans rappel ni mise en demeure, dès le lendemain de l'échéance (article L441-10 du Code de commerce).</li>
      <li><strong>Le taux figure dans vos conditions de vente et sur vos factures.</strong> Il ne peut pas être inférieur à trois fois le taux d'intérêt légal.</li>
      <li><strong>Si aucun taux n'est prévu</strong>, s'applique le taux de refinancement de la Banque centrale européenne majoré de 10 points.</li>
      <li><strong>Une indemnité forfaitaire de 40 €</strong> pour frais de recouvrement s'ajoute par facture payée en retard (article D441-5 du Code de commerce).</li>
    </ul>
    <p class="note">Ces règles concernent les ventes entre professionnels. Elles ne s'appliquent pas aux factures adressées à des particuliers. Le taux d'intérêt légal change chaque semestre : relevez le taux en vigueur sur le site de la Banque de France ou sur service-public.fr. Cet outil donne une estimation et ne remplace pas un conseil juridique.</p>`,
    faq: [
      ['À partir de quand les pénalités de retard courent-elles ?', 'Dès le lendemain de la date d’échéance figurant sur la facture. Aucun rappel n’est nécessaire pour qu’elles soient dues entre professionnels.'],
      ['L’indemnité de 40 € s’applique-t-elle à un particulier ?', 'Non. L’indemnité forfaitaire pour frais de recouvrement ne concerne que les clients professionnels. Elle est due par facture payée en retard, quel que soit le montant.'],
      ['Faut-il vraiment réclamer les pénalités ?', 'Elles sont dues même si vous ne les réclamez pas, mais beaucoup d’entreprises y renoncent pour préserver la relation. Les mentionner dans la relance suffit souvent à obtenir le paiement.'],
      ['Quelles mentions mettre sur la facture ?', 'La date d’échéance, le taux des pénalités de retard et le montant de l’indemnité forfaitaire de 40 € doivent figurer sur la facture. Leur absence est sanctionnable.'],
    ],
    links: [[B + 'automatiser-relance-impayes-n8n-stripe', 'Automatiser la relance des impayés'], [B + 'facture-electronique-obligatoire-tpe-pme', 'Facture électronique obligatoire : le guide'], ['/outils/calcul-tva', 'Calculateur de TVA'], ['/automatisation-ia', 'Automatiser devis, factures et relances']],
    cta: ['Des relances qui partent à la bonne date', 'Trois messages gradués, envoyés automatiquement après l’échéance, avec le détail des pénalités. Vous n’y pensez plus et vos factures rentrent plus vite.', '/automatisation-ia', 'Automatiser mes relances'],
  },

  {
    slug: 'compresser-image', name: 'Compresseur d’images', category: 'MultimediaApplication',
    short: 'Réduisez le poids de vos photos en WebP ou JPEG, sans les envoyer nulle part.',
    title: 'Compresser une image en WebP ou JPEG, en ligne | YZ',
    desc: 'Réduisez le poids de vos photos pour le web : conversion en WebP ou JPEG et redimensionnement. Les images restent sur votre appareil.',
    h1: 'Compresser une image pour le web, en WebP ou JPEG',
    lead: 'Choisissez une ou plusieurs photos. Elles sont redimensionnées et compressées sur votre appareil, sans passer par un serveur. Idéal avant de les mettre sur un site ou une fiche Google.',
    body: R`    <div class="grid three">
      <label class="full">Vos images (JPEG, PNG, WebP)<input id="i-files" type="file" accept="image/*" multiple></label>
      <label>Format de sortie<select id="i-format"><option value="image/webp">WebP (le plus léger)</option><option value="image/jpeg">JPEG (compatible partout)</option></select></label>
      <label>Largeur maximale<select id="i-width"><option value="800">800 px (vignette)</option><option value="1600" selected>1 600 px (pleine largeur)</option><option value="2400">2 400 px (grand écran)</option><option value="0">Ne pas redimensionner</option></select></label>
      <label>Qualité : <span id="i-qv">80</span> %<input id="i-q" type="range" min="40" max="95" step="5" value="80"></label>
    </div>
    <p class="note" id="i-msg" role="status" style="margin:12px 0 0">Aucune image choisie.</p>
    <ul class="files" id="i-list"></ul>`,
    script: R`
var urls = [];
function size(n) { return n > 1048576 ? (n / 1048576).toFixed(2).replace('.', ',') + ' Mo' : Math.max(1, Math.round(n / 1024)) + ' Ko'; }
function load(file) {
  return new Promise(function (resolve, reject) {
    var img = new Image(), u = URL.createObjectURL(file);
    img.onload = function () { URL.revokeObjectURL(u); resolve(img); };
    img.onerror = function () { URL.revokeObjectURL(u); reject(new Error('illisible')); };
    img.src = u;
  });
}
function one(file, mime, maxW, q) {
  return load(file).then(function (img) {
    var w = img.naturalWidth, h = img.naturalHeight, r = maxW && w > maxW ? maxW / w : 1;
    var c = document.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(h * r);
    var ctx = c.getContext('2d');
    if (mime === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return new Promise(function (resolve) { c.toBlob(function (b) { resolve({ blob: b, w: c.width, h: c.height }); }, mime, q); });
  });
}
function run() {
  var files = Array.prototype.slice.call($('i-files').files), mime = $('i-format').value, ext = mime === 'image/webp' ? 'webp' : 'jpg';
  var maxW = parseInt($('i-width').value, 10), q = parseInt($('i-q').value, 10) / 100, list = $('i-list');
  $('i-qv').textContent = $('i-q').value;
  urls.forEach(function (u) { URL.revokeObjectURL(u); }); urls = []; list.textContent = '';
  if (!files.length) { $('i-msg').textContent = 'Aucune image choisie.'; return; }
  $('i-msg').textContent = 'Compression en cours...';
  var before = 0, after = 0;
  files.reduce(function (p, file) {
    return p.then(function () { return one(file, mime, maxW, q); }).then(function (res) {
      var li = document.createElement('li'), info = document.createElement('span'), a = document.createElement('a');
      if (!res.blob || res.blob.type !== mime) { info.textContent = file.name + ' : ce format n’est pas pris en charge par votre navigateur.'; li.appendChild(info); list.appendChild(li); return; }
      var u = URL.createObjectURL(res.blob); urls.push(u); before += file.size; after += res.blob.size;
      var gain = Math.round((1 - res.blob.size / file.size) * 100);
      info.textContent = file.name + ' : ' + size(file.size) + ' vers ' + size(res.blob.size) + ' (' + (gain >= 0 ? 'moins ' + gain : 'plus ' + -gain) + ' %), ' + res.w + ' × ' + res.h + ' px';
      a.className = 'btn'; a.href = u; a.download = file.name.replace(/\.[^.]+$/, '') + '.' + ext; a.textContent = 'Télécharger';
      li.appendChild(info); li.appendChild(a); list.appendChild(li);
    }, function () {
      var li = document.createElement('li'); li.textContent = file.name + ' : image illisible.'; list.appendChild(li);
    });
  }, Promise.resolve()).then(function () {
    $('i-msg').textContent = before ? files.length + ' image(s) : ' + size(before) + ' vers ' + size(after) + ', soit ' + Math.round((1 - after / before) * 100) + ' % de moins.' : 'Aucune image traitée.';
  });
}
document.addEventListener('change', run);
$('i-q').addEventListener('input', function () { $('i-qv').textContent = this.value; });`,
    help: R`    <h2>Pourquoi compresser ses images</h2>
    <p>Les images représentent souvent plus de la moitié du poids d'une page. Une photo sortie d'un téléphone pèse 3 à 8 Mo, alors que 100 à 300 Ko suffisent pour l'afficher en pleine largeur. Des images trop lourdes ralentissent le site, surtout sur téléphone, et Google tient compte de la vitesse d'affichage.</p>
    <h2>Quels réglages choisir</h2>
    <div class="table"><table>
      <thead><tr><th>Usage</th><th>Largeur</th><th>Format</th><th>Qualité</th></tr></thead>
      <tbody>
        <tr><td>Photo en pleine largeur sur un site</td><td>1 600 px</td><td>WebP</td><td>75 à 80 %</td></tr>
        <tr><td>Vignette, photo de produit</td><td>800 px</td><td>WebP</td><td>75 à 80 %</td></tr>
        <tr><td>Photo pour une fiche Google ou un e-mail</td><td>1 600 px</td><td>JPEG</td><td>80 à 85 %</td></tr>
      </tbody>
    </table></div>
    <p>Le format WebP est lu par tous les navigateurs récents et pèse en général 25 à 35 % de moins qu'un JPEG de qualité visuelle équivalente. Gardez le JPEG pour les outils qui refusent le WebP.</p>
    <p class="note">Une image avec un fond transparent perd sa transparence en JPEG : elle est placée sur fond blanc. Le WebP la conserve.</p>`,
    faq: [
      ['Mes photos sont-elles envoyées sur un serveur ?', 'Non. La compression est faite par votre navigateur, sur votre appareil. Les images ne quittent pas votre ordinateur ou votre téléphone, ce qui convient aux photos de clients ou de chantiers.'],
      ['Quel poids viser pour une image de site internet ?', 'Moins de 200 Ko pour une photo en pleine largeur, moins de 80 Ko pour une vignette. Au-dessus de 500 Ko, une image ralentit sensiblement l’affichage sur téléphone.'],
      ['WebP ou JPEG : lequel choisir ?', 'WebP pour un site internet, car il est plus léger à qualité égale. JPEG quand l’image doit être envoyée par e-mail, déposée sur une plateforme ancienne ou imprimée.'],
    ],
    links: [[B + 'ameliorer-vitesse-site-core-web-vitals', 'Améliorer la vitesse de son site'], ['/creation-site-internet', 'Création de site internet rapide sur téléphone'], [B + 'fiche-google-business-profile-optimisation-complete', 'Optimiser sa fiche Google Business Profile'], ['/outils/apercu-google', 'Tester son titre et sa description Google']],
    cta: ['Un site qui s’affiche en moins de 2 secondes', 'Images optimisées, code léger, hébergement rapide : chaque site livré est mesuré sur téléphone avant la mise en ligne. Dès 490 €.', '/creation-site-internet', 'Voir la création de site'],
  },

  {
    slug: 'mot-de-passe', name: 'Générateur de mot de passe', category: 'SecurityApplication',
    short: 'Un mot de passe solide, tiré au hasard sur votre appareil.',
    title: 'Générateur de mot de passe sécurisé, sans envoi | YZ',
    desc: 'Générez un mot de passe solide et aléatoire, créé sur votre appareil et jamais transmis. Longueur et caractères au choix, solidité affichée.',
    h1: 'Générateur de mot de passe sécurisé',
    lead: 'Choisissez la longueur et les types de caractères. Le mot de passe est tiré au hasard par votre navigateur, avec son générateur cryptographique. Il n’est ni envoyé ni conservé.',
    body: R`    <pre id="pw" class="center" style="font-size:18px;margin-top:0" aria-live="polite" aria-label="Mot de passe généré"></pre>
    <div class="actions" style="justify-content:center"><button class="primary" type="button" id="copy">Copier</button><button type="button" id="again">En générer un autre</button></div>
    <div class="grid" style="margin-top:16px">
      <label class="full">Longueur : <span id="lv">20</span> caractères<input id="len" type="range" min="8" max="64" value="20"></label>
    </div>
    <p class="checks" style="margin-top:12px">
      <label><input type="checkbox" id="lo" checked>Minuscules</label>
      <label><input type="checkbox" id="up" checked>Majuscules</label>
      <label><input type="checkbox" id="di" checked>Chiffres</label>
      <label><input type="checkbox" id="sy" checked>Symboles</label>
      <label><input type="checkbox" id="amb" checked>Éviter les caractères qui se ressemblent (0 et O, 1 et l)</label>
    </p>
    <div class="out two" aria-live="polite">
      <div><strong id="bits">0</strong><span>Bits d'entropie</span></div>
      <div><strong id="level">.</strong><span>Solidité</span></div>
    </div>`,
    script: R`
var SETS = { lo: 'abcdefghijklmnopqrstuvwxyz', up: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', di: '0123456789', sy: '!#$%&*+-=?@_' };
function rand(n) { var lim = Math.floor(4294967296 / n) * n, a = new Uint32Array(1); do { crypto.getRandomValues(a); } while (a[0] >= lim); return a[0] % n; }
function gen() {
  var len = parseInt($('len').value, 10), sets = [];
  $('lv').textContent = String(len);
  ['lo', 'up', 'di', 'sy'].forEach(function (k) {
    if (!$(k).checked) return;
    var s = SETS[k]; if ($('amb').checked) s = s.replace(/[0O1lI]/g, '');
    sets.push(s);
  });
  if (!sets.length) { $('pw').textContent = 'Cochez au moins un type de caractères.'; $('bits').textContent = '0'; $('level').textContent = '.'; return; }
  var pool = sets.join(''), out, ok, tries = 0;
  do {
    out = ''; for (var i = 0; i < len; i++) out += pool.charAt(rand(pool.length));
    ok = sets.every(function (s) { for (var j = 0; j < out.length; j++) if (s.indexOf(out.charAt(j)) > -1) return true; return false; });
  } while (!ok && ++tries < 200);
  var bits = Math.floor(len * Math.log(pool.length) / Math.LN2);
  $('pw').textContent = out; $('bits').textContent = String(bits);
  $('level').textContent = bits < 50 ? 'Faible' : bits < 75 ? 'Correcte' : bits < 100 ? 'Solide' : 'Très solide';
}
document.addEventListener('input', gen);
$('again').addEventListener('click', gen);
$('copy').addEventListener('click', function () { copyText($('pw').textContent, this); });
gen();`,
    help: R`    <h2>Ce qui fait un bon mot de passe</h2>
    <ul>
      <li><strong>La longueur avant tout.</strong> Seize caractères tirés au hasard résistent mieux que huit caractères compliqués.</li>
      <li><strong>Un mot de passe par compte.</strong> Si un site est piraté, les autres comptes restent protégés.</li>
      <li><strong>Du hasard réel.</strong> Un prénom suivi d'une année se devine en quelques secondes.</li>
    </ul>
    <p>L'entropie, en bits, mesure le nombre de combinaisons possibles : chaque bit supplémentaire double l'effort d'un attaquant. Autour de 80 bits, un mot de passe aléatoire est hors de portée d'une attaque par force brute avec les moyens actuels.</p>
    <h2>Trois habitudes qui comptent plus que le mot de passe</h2>
    <ol>
      <li><strong>Un gestionnaire de mots de passe.</strong> Il retient tout à votre place : vous n'avez qu'un seul mot de passe à mémoriser.</li>
      <li><strong>La double authentification</strong> sur la messagerie, la banque et les outils de l'entreprise. Elle bloque la plupart des piratages, même si le mot de passe a fuité.</li>
      <li><strong>Des comptes nominatifs.</strong> Un identifiant partagé par toute l'équipe ne peut pas être retiré à une seule personne.</li>
    </ol>`,
    faq: [
      ['Ce générateur garde-t-il une trace de mon mot de passe ?', 'Non. Le mot de passe est créé par votre navigateur avec son générateur cryptographique et n’est transmis à aucun serveur. Fermez la page, il disparaît.'],
      ['Quelle longueur choisir ?', 'Seize caractères au minimum pour un compte courant, vingt ou plus pour la messagerie, la banque et le gestionnaire de mots de passe. Avec un gestionnaire, la longueur ne coûte rien.'],
      ['Faut-il changer ses mots de passe régulièrement ?', 'Plus par principe. Un mot de passe long, unique et aléatoire n’a besoin d’être changé que s’il a pu fuiter ou si un site signale une intrusion.'],
    ],
    links: [[B + 'securiser-agent-ia-injections-fuites', 'Sécuriser un agent IA contre les injections et les fuites'], [B + 'chatgpt-donnees-clients-regles-pme', 'Données clients et assistants IA : les règles'], [B + 'claude-mythos', 'Claude Mythos : ce que cela change pour votre sécurité'], ['/audit-ia', 'Audit IA en 5 jours']],
    cta: ['Des outils sûrs dès la conception', 'Accès limités, comptes nominatifs, sauvegardes et journal des actions : chaque automatisation livrée est pensée pour ne donner à l’IA que ce dont elle a besoin.', '/automatisation-ia', 'Voir la méthode'],
  },
];
