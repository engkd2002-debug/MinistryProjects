# GitHub publication and Pages deployment

## Target and preserved work

Existing remote: https://github.com/engkd2002-debug/MinistryProjects. Reuse this repository; do not create a duplicate or change visibility. Before publication the local `work` branch was unborn, all project files were untracked, and remote branch inspection returned no refs. No existing commits or uncommitted application work were overwritten.

All Phase 1–3 source, documents and relevant evidence are retained. The frontend remains a synthetic-data demo. Dependencies/build artifacts, test scratch directories, environment files, private keys and credential directories are excluded by `.gitignore`. A credential-pattern scan reported no matches in reviewed project text files; this is not a formal guarantee or a substitute for GitHub secret scanning.

## Deployment design

- `PAGES_BASE_PATH` configures Vite asset URLs; default `/` preserves local development.
- Router basename follows Vite `BASE_URL`, retaining clean browser routes.
- `scripts/prepare-pages.mjs` emits a Pages 404 fallback after the build. It redirects a deep path to the repository root using an encoded route parameter. `index.html` safely restores the same-origin, base-constrained path/query/hash before React starts.
- `.github/workflows/pages.yml` builds/tests main pushes and manual dispatches, uploads `dist`, and deploys through the `github-pages` environment. The deploy job alone has Pages/OIDC write permissions. Concurrent deployments queue, and unsuccessful builds do not replace an existing successful site.
- The existing validation workflow remains, with its evidence artifact updated to Phase 3.

The proposed site path is `/MinistryProjects/explorer`; a public URL must only be called live after GitHub deployment and HTTPS/browser verification. Private Pages availability and repository administrative permissions cannot be inferred from local builds. The workflow never changes visibility or selects another provider.

## Validation

- `npm ls --depth=0`: all declared direct dependencies resolved.
- `npm test`: 55 tests passed.
- `PAGES_BASE_PATH=/MinistryProjects/ npm run build`: strict TypeScript and production bundle passed.
- `PAGES_BASE_PATH=/MinistryProjects/ node scripts/prepare-pages.mjs`: fallback generated with matching base.
- Static Pages-equivalent browser checks cover real 404 redirect, deep-link refresh, query preservation, assets/fonts, other routes, Arabic/English, both themes and mobile layout. Results: `docs/evidence/deployment/static-pages-results.json`.

These are local compatibility checks. Public deployment remains separately gated by push, API permissions, Pages configuration, Actions result and public-site verification.

## Platform access observed

`git ls-remote origin` succeeded. GitHub CLI authentication was not usable; actual requests to `https://api.github.com/user` and the repository endpoint returned **Forbidden**. The cloud policy does not currently allow `api.github.com`; no GitHub REST connector is available in this session. This blocks account/visibility/plan inspection, enabling Pages and inspecting/running deployments through the API. Git transport is tested independently; its push result is recorded below after the attempt.

Required platform access: authenticated Git write access to this repository, GitHub API access with repository/workflow/Pages administration, and HTTPS access to the resulting GitHub Pages host for verification. Do not paste credentials into source or chat. Do not change a private repository to public to bypass a Pages plan restriction.
