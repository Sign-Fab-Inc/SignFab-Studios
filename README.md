# SignFab Studios — private deployment package

Prepared November 5, 2026. This is a deployment package, not a live employee portal. The private source repository is https://github.com/Sign-Fab-Inc/SignFab-Studios. No company source or data is intended for public publication. Open Shape Studio is included as an exact copy of the existing local HTML, with a launch link on the homepage.

## Access findings

- The GitHub plugin is installed and enabled, but no GitHub connector tools were exposed in this chat. This is not evidence that its repository authorization is working.
- A signed-in Chrome GitHub session was available. The Sign-Fab-Inc organization view showed 0 repositories and a deletion notice for Sign-Fab-Inc/Open-Shape-Studio. The all-account private-repository search also returned 0 repositories. These findings describe only the current session's visible access; they do not establish that the company has no repositories elsewhere.
- On continuation, this task created Sign-Fab-Inc/SignFab-Studios and verified its Private visibility. It did not delete or restore any repository.
- The original studio was found in the open File Explorer folder under OneDrive - Sign Fab / Documents / CLAUDE CODE / Open Shape Studio. Only Open_Shape_Studio.html was copied; adjacent DXF drawings and development settings were excluded. The copied HTML's SHA-256 matched the original. Two inline scripts passed JavaScript syntax checks; resource references were embedded and no common network-call patterns were found. This is a limited static audit, not a full security or production-geometry review.
- The user confirmed Microsoft 365 employee sign-in. The actual tenant, employee assignments, Azure subscription and deployment credentials remain unverified.

## Selected architecture

Use a **private Sign-Fab-Inc GitHub repository** for source and **Azure Static Web Apps Standard** for hosting, with a custom single-tenant Microsoft Entra ID registration. Standard supports custom authentication. Do not enable GitHub Pages or publish the repository.

Azure must enforce access before sending HTML, JavaScript, JSON, images or other studio files. The ordered configuration permits only authentication system endpoints and a generic access-denied message without an employee role. Its catch-all requires the custom `employee` role. Signing into a Microsoft account alone does not grant that role. No browser-side email-domain check is used as authorization. Do not replace `employee` with `authenticated` or `anonymous`.

This is an authenticated internet-facing service, not a private network endpoint. Authorized employees can inspect the HTML and JavaScript delivered to their browser. Never put passwords, API keys or backend credentials in studio files. Review external APIs and CDNs in the supplied studios before deployment; those services require their own authorization and data review.

## Administrator requirements and setup

1. The PRIVATE `Sign-Fab-Inc/SignFab-Studios` repository has been created. A GitHub organization administrator should verify its source access and deployment permissions. Open Shape Studio is connected; provide any additional studios with their companion scripts, styles, fonts and assets. Preserve folder relationships. No need to give ordinary employees GitHub source access.
2. An Azure administrator needs a subscription, permission to create a Static Web Apps Standard resource, and approval for its paid hosting plan. Create the resource with deployment source **Other**, not GitHub Pages. This package does not purchase or provision that resource.
3. A Microsoft Entra application administrator must supply the company's tenant UUID and create a single-tenant app registration (accounts in this organizational directory only). Set a Web redirect URI of `https://<actual-hostname>/.auth/login/aad/callback`. Add the equivalent callback for an approved custom hostname if used.
4. In the enterprise application's properties, require user assignment. Assign only current employees, individually or through a maintained employee security group; exclude guests, contractors and service accounts unless explicitly authorized. Group-based assignment needs Entra P1/P2 licensing. Administrator consent may be needed. Apply the company's MFA/Conditional Access rules as licensed.
5. Set Azure application settings `SIGNFAB_ENTRA_CLIENT_ID` and `SIGNFAB_ENTRA_CLIENT_SECRET` from that registration. Keep the secret only in Azure's protected settings or an approved Key Vault reference; do not put it in GitHub source, the browser or chat. Record its expiry and owner for rotation.
6. In Azure Static Web Apps **Role management**, invite each approved company Microsoft identity using provider `aad`, granting the exact custom role `employee`. Entra enterprise-app assignment and Static Web Apps roles are separate controls: both are required by this setup. An Entra group does not automatically become a Static Web Apps role. Check platform role/user quotas against the workforce size. If larger scale requires dynamic roles, implement and review a server-side Graph group-membership role function before rollout.
7. Create a GitHub environment named `production`. Set environment variable `SIGNFAB_TENANT_ID` to the company's tenant UUID, and environment secret `AZURE_STATIC_WEB_APPS_API_TOKEN` to this resource's deployment token. Configure deployment reviewers/branch protections where the GitHub plan supports them. If required-review protection is unavailable, restrict who can push main and manage deployment credentials.
8. Copy this package's contents, including `.github`, into the confirmed private repository. The workflow only deploys from main in a private repository. It configures the real tenant, checks route protection and linked studio files, and uploads only `site/`. Pull requests do not receive deployments or secrets. A missing/invalid tenant blocks deployment. The deployment token is not an employee login credential.
9. For additional studios, place the complete application under `site/studios/<slug>/` and set its entry in `site/studios.json`. Open Shape Studio is already at `"path": "/studios/open-shape/index.html"`. Test relative paths, browser downloads and any external services before rollout. Do not copy unrelated company folders or secrets into `site/`.
10. Run `node scripts/check.mjs` locally. For a production check, set `SIGNFAB_TENANT_ID`, run `node scripts/configure.mjs`, then `node scripts/check.mjs --production`. Push main to deploy after administrator setup. There are no package dependencies or build/install steps.

## Required live verification before employee rollout

The local checks verify the intended configuration; they do not prove Azure has enforced it. An administrator must test the actual deployed site:

| Account / request | Required outcome |
| --- | --- |
| Signed-out request for homepage, direct studio HTML, JSON, JS, or an asset | Redirect to company sign-in; no protected file bytes |
| Personal Microsoft account or another organization's account | Sign-in rejected |
| Tenant guest or unassigned employee | No portal access |
| Assigned company employee without the SWA employee role | Access denied; no protected file bytes |
| Assigned employee with employee role | Homepage, studio and dependencies load |
| Direct GitHub sign-in endpoint | Unavailable |
| Approved employee opening a studio desktop shortcut after sign-in | Opens the correct studio |
| Removed employee using a fresh session | Access denied |

Check the Azure default hostname as well as any custom hostname. Do not distribute links until these checks pass. Preview or staging resources must have the same protections before receiving company content; this workflow does not create PR previews.

## Employee shortcuts and ongoing administration

After verification, employees can open the actual HTTPS portal or studio URL. On Windows: desktop → right-click → New → Shortcut → paste the verified URL → name the shortcut. Never distribute a GitHub raw-file URL or a local file path. Sign-in still applies to shortcuts.

For employee departure, disable the company identity, remove enterprise-app assignment and SWA employee role, and revoke available sessions. Verify revocation against any existing portal cookie; do not assume a role or directory change immediately invalidates all active sessions. Previously downloaded files cannot be recalled. Keep an administrator responsible for the roster, role cleanup, credentials and deployment access.

For updates, preserve studio paths and merge reviewed changes into main. For rollback, revert the relevant source commit in the private repository and let the same workflow deploy it. Keep authentication rules intact during rollback.

## Verification performed on this package

The package's security check exercises ordered route matching for the homepage, manifest, scripts, direct studio files, data and unknown paths; validates the tenant provider and directory links; and rejects common credential/archive files in the deploy folder. The unconfigured template must fail the production check. Live Microsoft sign-in, user roles, Azure deployment and production drawing validation remain untested.

## Official references

- [Custom authentication and Standard plan requirement](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-custom)
- [Authentication, tenant restrictions and custom role invitations](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-authorization)
- [Ordered route rules and authorization](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)
- [Entra enterprise application user/group assignment](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/assign-user-or-group-access-portal)
- [GitHub Actions deployment to Azure Static Web Apps](https://docs.github.com/en/actions/how-tos/deploy/deploy-to-third-party-platforms/azure-static-web-app)
