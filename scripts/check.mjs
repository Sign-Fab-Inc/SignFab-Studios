import assert from 'node:assert/strict';
import {readFileSync, existsSync, readdirSync, lstatSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = resolve(root, 'site');
const config = JSON.parse(readFileSync(resolve(site, 'staticwebapp.config.json')));
assert.deepEqual(config.routes, [
  {route: '/.auth/login/github', statusCode: 404},
  {route: '/.auth/*', allowedRoles: ['anonymous']},
  {route: '/access-denied.html', allowedRoles: ['anonymous']},
  {route: '/*', allowedRoles: ['employee']}
], 'Only authentication endpoints and the generic access message may be anonymous.');
assert(!config.navigationFallback, 'Fallbacks must not bypass protected routes.');
assert.equal(config.globalHeaders['Cache-Control'], 'no-store');
assert.equal(config.responseOverrides['403'].rewrite, '/access-denied.html');
assert.equal(config.responseOverrides['401'].redirect, '/.auth/login/aad?post_login_redirect_uri=.referrer');
const providers = config.auth.identityProviders;
assert.deepEqual(Object.keys(providers), ['azureActiveDirectory']);
const registration = providers.azureActiveDirectory.registration;
assert.equal(registration.clientIdSettingName, 'SIGNFAB_ENTRA_CLIENT_ID');
assert.equal(registration.clientSecretSettingName, 'SIGNFAB_ENTRA_CLIENT_SECRET');
if (process.argv.includes('--production')) {
  assert.match(registration.openIdIssuer, /^https:\/\/login\.microsoftonline\.com\/[a-f0-9-]{36}\/v2\.0$/i, 'A real company tenant must be configured before deployment.');
}
const studios = JSON.parse(readFileSync(resolve(site, 'studios.json')));
for (const studio of studios) {
  assert.equal(typeof studio.name, 'string');
  if (studio.path === null) continue;
  assert.match(studio.path, /^\/studios\/[a-zA-Z0-9_./-]+$/);
  assert(!studio.path.includes('..'));
  assert(existsSync(resolve(site, '.' + studio.path)), `Missing studio: ${studio.path}`);
}
function inspect(folder) {
  for (const name of readdirSync(folder)) {
    const path = resolve(folder, name);
    assert(!lstatSync(path).isSymbolicLink(), 'No links outside the deploy folder.');
    assert(!/(^\.env|^\.git|\.(pem|key|pfx|zip|bak)$)/i.test(name), `Unexpected deploy file: ${name}`);
    if (lstatSync(path).isDirectory()) inspect(path);
  }
}
inspect(site);
// Exercise representative direct requests against ordered route rules.
function matchingRoute(path) {
  return config.routes.find(rule => rule.route.endsWith('*') ? path.startsWith(rule.route.slice(0, -1)) : rule.route === path);
}
for (const path of ['/', '/index.html', '/assets/portal.js', '/studios.json', '/studios/open-shape/index.html', '/studios/open-shape/data.json', '/missing.html']) {
  assert.deepEqual(matchingRoute(path).allowedRoles, ['employee']);
}
console.log('PASS: protected routes, company identity configuration, directory links and deployment file checks.');
if (!process.argv.includes('--production')) console.log('Template check only: live authentication and the tenant still require administrator setup.');
