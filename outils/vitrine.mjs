// Un CODVAULT de démonstration, sans logos (aucune requête sortante) : la porte
// du socle à ouvrir, puis le coffre à créer dans le navigateur.
//   node outils/vitrine.mjs 8198
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { demarrer } from '../src/main.js';

const port = Number(process.argv[2] || 8198);
const dossier = fs.mkdtempSync(path.join(os.tmpdir(), 'codvault-vitrine-'));
const jeton = 'jeton-installation-de-la-vitrine-codvault';
// LOGOS_VITRINE : dossier de <domaine>.png, rangés d'avance dans le cache des
// logos ; le service n'a alors rien à aller chercher pour ces domaines.
const logosFournis = process.env.LOGOS_VITRINE && fs.existsSync(process.env.LOGOS_VITRINE) ? process.env.LOGOS_VITRINE : null;
const o = await demarrer({
  DATA_DIR: path.join(dossier, 'data'), PORT: String(port), HOTE: '127.0.0.1', SOCLE_JETON_INSTALLATION: jeton, CODVAULT_LOGOS: logosFournis ? 'oui' : 'non',
  ...(process.env.SOCLE_THEME ? { SOCLE_THEME: process.env.SOCLE_THEME } : {}),
}, { log: { info() {}, warn() {}, error() {} } });
if (logosFournis) {
  const ranger = o.db.prepare('INSERT INTO logos(domaine, type, octets, recupere) VALUES(?, ?, ?, ?) ON CONFLICT(domaine) DO UPDATE SET type = excluded.type, octets = excluded.octets, recupere = excluded.recupere');
  for (const f of fs.readdirSync(logosFournis).filter(f => f.endsWith('.png'))) ranger.run(f.slice(0, -4), 'image/png', fs.readFileSync(path.join(logosFournis, f)), Date.now());
}
console.log(`CODVAULT de démonstration sur http://localhost:${port} — jeton d’installation : ${jeton}`);
