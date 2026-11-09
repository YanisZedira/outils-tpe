#!/usr/bin/env node
/**
 * Outils libres de YZ Automation : produit public/outils/index.html et public/outils/<slug>/index.html.
 *
 *   node scripts/outils/build.mjs
 *
 * Pages statiques, sans dépendance, calcul dans le navigateur. Vite copie public/ dans dist/,
 * puis scripts/cloudflare/prepare.mjs aplatit <slug>/index.html en <slug>.html (URL sans slash final).
 * Chaque outil est relié à une page de service, à des articles du Journal et aux autres outils.
 * Les routes sont déclarées dans scripts/generate-sitemap.mjs.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TOOLS } from './tools.mjs';

const root = resolve(import.meta.dirname, '../..');
const OUT = resolve(root, 'public/outils');
const SITE = 'https://yz-automation.fr';
const BOOK = 'https://cal.com/yanis-zedira-w1ldf1/15min';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

// Outils hébergés ailleurs sur le site ou en dépôt libre : listés sur la page d'accueil des outils.
const EXTRA = [
  { href: '/calculateur-temps-perdu', name: 'Calculateur du temps perdu', short: 'Ce que vos tâches répétitives coûtent par an, en heures et en euros.' },
  { href: '/checklist-site-internet', name: 'Checklist site internet', short: 'Les points à vérifier avant de mettre un site en ligne.' },
  { href: '/glossaire-ia-automatisation', name: 'Glossaire IA et automatisation', short: 'Les mots de l’IA expliqués simplement, pour décider sans jargon.' },
  { href: 'https://yaniszedira.github.io/checklist-seo-local/', name: 'Checklist SEO local', short: '40 points à cocher pour être trouvé sur Google et Google Maps.' },
  { href: 'https://github.com/YanisZedira/llms-txt-generator', name: 'Générateur de llms.txt', short: 'Le fichier qui présente votre site aux assistants IA, à partir du sitemap.' },
];

const HELPERS = `
var $ = function (id) { return document.getElementById(id); };
var num = function (v) { var n = parseFloat(String(v).replace(/\\s/g, '').replace(',', '.')); return isFinite(n) ? n : 0; };
var eur = function (n) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n); };
var pct = function (n) { return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n) + ' %'; };
var copyText = function (text, btn) {
  var done = function () { if (!btn) return; var t = btn.textContent; btn.textContent = 'Copié'; setTimeout(function () { btn.textContent = t; }, 1600); };
  if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () {}); return; }
  var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (e) {} ta.remove();
};
var download = function (name, href) { var a = document.createElement('a'); a.download = name; a.href = href; document.body.appendChild(a); a.click(); a.remove(); };
`;

const head = (title, desc, path, extra = '') => `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${path}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:image" content="${SITE}/yz-automation-google-business-cover-v2.png">
<meta property="og:locale" content="fr_FR">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/outils/outils.css">
${extra}
</head>
<body>
<header class="top">
  <a class="brand" href="/"><img src="/logo.svg" alt="YZ Automation" width="104" height="26"></a>
  <nav aria-label="Navigation"><a href="/outils">Tous les outils</a><a class="hide" href="/tarifs">Tarifs</a><a class="hide" href="/contact">Contact</a></nav>
</header>`;

const foot = `<footer>
  <p>Outils libres de <a href="/">YZ Automation</a>, studio fondé par Yanis Zedira : <a href="/creation-site-internet">création de site internet</a>, <a href="/automatisation-ia">automatisation et agents IA</a>, <a href="/seo-technique-local">référencement local</a>. Code source sous licence MIT sur <a href="https://github.com/YanisZedira/outils-tpe">GitHub</a>.</p>
  <p><a href="/ressources/blog">Le Journal</a> · <a href="/avis-clients">Avis clients</a> · <a href="/realisations">Réalisations</a> · <a href="/legal">Mentions légales</a></p>
</footer>
</body>
</html>
`;

const publisher = { '@type': 'Organization', name: 'YZ Automation', url: SITE };

for (const t of TOOLS) {
  const path = `/outils/${t.slug}`;
  const others = TOOLS.filter((o) => o.slug !== t.slug);
  const jsonld = [
    ld({ '@context': 'https://schema.org', '@type': 'WebApplication', name: t.name, url: SITE + path, description: t.desc,
      applicationCategory: t.category || 'BusinessApplication', operatingSystem: 'Tous (navigateur web)', inLanguage: 'fr',
      isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      author: { '@type': 'Person', name: 'Yanis Zedira', url: `${SITE}/a-propos` }, publisher }),
    ld({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Outils', item: SITE + '/outils' },
      { '@type': 'ListItem', position: 3, name: t.name, item: SITE + path }] }),
    ld({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }),
  ].join('\n');

  const html = `${head(t.title, t.desc, path, jsonld)}
<main>
  <p class="crumb"><a href="/">Accueil</a> / <a href="/outils">Outils</a> / ${esc(t.name)}</p>
  <h1>${esc(t.h1)}</h1>
  <p class="lead">${t.lead}</p>

  <section class="card tool" aria-label="${esc(t.name)}">
${t.body}
    <p class="note" style="margin:14px 0 0">Tout se passe dans votre navigateur : rien n'est envoyé ni enregistré sur un serveur.</p>
  </section>

  <section class="card">
${t.help}
  </section>

  <section class="card">
    <h2>Questions fréquentes</h2>
${t.faq.map(([q, a]) => `    <h3>${esc(q)}</h3>\n    <p>${esc(a)}</p>`).join('\n')}
  </section>

  <section class="card">
    <h2>Pour aller plus loin</h2>
    <ul>
${t.links.map(([href, label]) => `      <li><a href="${href}">${esc(label)}</a></li>`).join('\n')}
    </ul>
  </section>

  <section class="card cta">
    <h2>${esc(t.cta[0])}</h2>
    <p>${esc(t.cta[1])}</p>
    <a class="btn primary" href="${t.cta[2]}">${esc(t.cta[3])}</a>
    <a class="btn" href="${BOOK}">Réserver 15 min offertes</a>
  </section>

  <section>
    <h2>Les autres outils</h2>
    <ul class="others">
${others.map((o) => `      <li><a href="/outils/${o.slug}">${esc(o.name)}</a></li>`).join('\n')}
      <li><a href="/calculateur-temps-perdu">Calculateur du temps perdu</a></li>
    </ul>
  </section>
</main>
${t.lib ? `<script src="${t.lib}"></script>\n` : ''}<script>
(function () {${HELPERS}${t.script}
})();
</script>
${foot}`;
  mkdirSync(resolve(OUT, t.slug), { recursive: true });
  writeFileSync(resolve(OUT, t.slug, 'index.html'), html, 'utf8');
}

// Page d'accueil des outils
const hubTitle = 'Outils en ligne pour TPE et indépendants | YZ Automation';
const hubDesc = `${TOOLS.length + EXTRA.length} outils en ligne, libres et sans inscription : QR code, TVA, marge, signature e-mail, aperçu Google, compression d'images, données structurées.`;
const hub = `${head(hubTitle, hubDesc, '/outils', [
  ld({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Outils en ligne pour TPE et indépendants', url: SITE + '/outils', description: hubDesc, inLanguage: 'fr', publisher,
    mainEntity: { '@type': 'ItemList', itemListElement: TOOLS.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: `${SITE}/outils/${t.slug}` })) } }),
  ld({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE + '/' },
    { '@type': 'ListItem', position: 2, name: 'Outils', item: SITE + '/outils' }] }),
].join('\n'))}
<main class="hub">
  <p class="crumb"><a href="/">Accueil</a> / Outils</p>
  <h1>Des outils en ligne pour gagner du temps au quotidien</h1>
  <p class="lead">${TOOLS.length + EXTRA.length} outils pour les dirigeants de TPE, les artisans, les commerçants et les indépendants. Sans inscription, sans publicité, et sans envoi de données : tout se calcule dans votre navigateur.</p>
  <ul class="tools">
${TOOLS.map((t) => `    <li><a href="/outils/${t.slug}"><b>${esc(t.name)}</b><span>${esc(t.short)}</span></a></li>`).join('\n')}
${EXTRA.map((t) => `    <li><a href="${t.href}"><b>${esc(t.name)}</b><span>${esc(t.short)}</span></a></li>`).join('\n')}
  </ul>

  <section class="card">
    <h2>Pourquoi ces outils sont en libre accès</h2>
    <p>Je m'appelle Yanis Zedira et je conçois des sites, des agents IA et des automatisations pour des entreprises de toutes tailles. Ces outils viennent de mon travail quotidien : un calcul que je refaisais à la main, un fichier que je générais pour chaque client, une vérification avant chaque mise en ligne. Les publier coûte peu et rend service.</p>
    <p>Chaque outil tient dans une page. Vous pouvez vous en servir sans compte, le partager, ou reprendre son code, publié sous licence MIT sur <a href="https://github.com/YanisZedira/outils-tpe">GitHub</a>.</p>
  </section>

  <section class="card">
    <h2>Par besoin</h2>
    <div class="table"><table>
      <thead><tr><th>Vous voulez</th><th>Outil</th><th>Pour aller plus loin</th></tr></thead>
      <tbody>
        <tr><td>Chiffrer un prix ou une facture</td><td><a href="/outils/calcul-tva">TVA</a>, <a href="/outils/calcul-marge">marge</a>, <a href="/outils/penalites-retard-facture">pénalités de retard</a></td><td><a href="/automatisation-ia">Automatiser devis et relances</a></td></tr>
        <tr><td>Être trouvé sur Google</td><td><a href="/outils/apercu-google">Aperçu Google</a>, <a href="/outils/donnees-structurees-entreprise-locale">données structurées</a></td><td><a href="/seo-technique-local">Référencement local</a></td></tr>
        <tr><td>Accélérer votre site</td><td><a href="/outils/compresser-image">Compresser une image</a></td><td><a href="/creation-site-internet">Création de site internet</a></td></tr>
        <tr><td>Être contacté plus facilement</td><td><a href="/outils/qr-code">QR code</a>, <a href="/outils/lien-whatsapp">lien WhatsApp</a>, <a href="/outils/signature-email">signature e-mail</a></td><td><a href="/agent-vocal-ia">Agent vocal IA</a></td></tr>
        <tr><td>Protéger vos comptes</td><td><a href="/outils/mot-de-passe">Mot de passe</a></td><td><a href="/ressources/blog/securiser-agent-ia-injections-fuites">Sécuriser un agent IA</a></td></tr>
        <tr><td>Savoir quoi automatiser</td><td><a href="/calculateur-temps-perdu">Calculateur du temps perdu</a></td><td><a href="/audit-ia">Audit IA en 5 jours</a></td></tr>
      </tbody>
    </table></div>
  </section>

  <section class="card cta">
    <h2>Un outil vous manque ?</h2>
    <p>Dites-moi quel calcul ou quelle tâche vous refaites chaque semaine. Si l'outil peut servir à d'autres, je l'ajoute ici. S'il est propre à votre entreprise, je le construis pour vous.</p>
    <a class="btn primary" href="/contact">Proposer un outil</a>
    <a class="btn" href="${BOOK}">Réserver 15 min offertes</a>
  </section>
</main>
${foot}`;
writeFileSync(resolve(OUT, 'index.html'), hub, 'utf8');
console.log(`${TOOLS.length} outils écrits dans public/outils (+ page d'accueil)`);
for (const t of TOOLS) {
  if (t.title.length < 15 || t.title.length > 65) console.log(`  ! titre ${t.title.length} : ${t.slug}`);
  if (t.desc.length < 50 || t.desc.length > 165) console.log(`  ! description ${t.desc.length} : ${t.slug}`);
}
if (hubDesc.length > 165) console.log('  ! description accueil', hubDesc.length);
