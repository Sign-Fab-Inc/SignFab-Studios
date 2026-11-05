import {readFileSync, writeFileSync} from 'node:fs';
const tenant = process.env.SIGNFAB_TENANT_ID;
if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(tenant || '') || /^0{8}-/.test(tenant)) {
  throw new Error('Set SIGNFAB_TENANT_ID to the real company tenant UUID.');
}
const file = new URL('../site/staticwebapp.config.json', import.meta.url);
const config = JSON.parse(readFileSync(file));
config.auth.identityProviders.azureActiveDirectory.registration.openIdIssuer = `https://login.microsoftonline.com/${tenant}/v2.0`;
writeFileSync(file, JSON.stringify(config, null, 2) + '\n');
console.log('Company tenant configured. No secrets were written.');
