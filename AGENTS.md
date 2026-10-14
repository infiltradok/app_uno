# AGENTS.md - AppUno (Angular 22 + SSR)

## Project Overview
- **Framework**: Angular 22 (standalone components, signals)
- **SSR**: Enabled via `@angular/ssr` + Express
- **Test Runner**: Vitest (via `@angular/build:unit-test`)
- **Package Manager**: npm@11.12.1
- **Node**: Requires Node 22+ (per `@types/node:^22.12.0`)

## Key Commands
| Command | Description |
|---------|-------------|
| `npm start` | Dev server (`ng serve`) at `http://localhost:4200` |
| `npm run build` | Production build (`ng build`) → `dist/` |
| `npm run watch` | Watch mode build (development) |
| `npm test` | Unit tests via Vitest (`ng test`) |
| `npm run serve:ssr:app_uno` | Run SSR server (`node dist/app_uno/server/server.mjs`) |

## Architecture Notes
- **Entry Points**:
  - Browser: `src/main.ts` → `bootstrapApplication(App, appConfig)`
  - Server: `src/main.server.ts` (SSR bootstrap)
  - Express: `src/server.ts` (serves static + handles Angular requests)
- **App Config**: `src/app/app.config.ts` — providers for router, hydration, error listeners
- **Routing**: `src/app/app.routes.ts` — currently empty `Routes = []`
- **Component**: `src/app/app.ts` — standalone `App` component with `RouterOutlet`
- **Styling**: Global `src/styles.css` + component-scoped `src/app/app.css`

## Project Structure Conventions
- **Pattern**: Component-Service architecture
  - Components handle UI logic only
  - Services contain business logic, data fetching, state management
- **Interfaces**: Place in `interfaces/` folder (e.g., `src/app/interfaces/`, `src/app/features/xyz/interfaces/`)
- **Component Files**: Separate template from logic
  - `component.ts` — class + decorator
  - `component.html` — template (referenced via `templateUrl`)
  - `component.css` — styles (referenced via `styleUrl` or `styleUrls`)
  - Do NOT use inline templates (`template:`) or inline styles (`styles:`)

## TypeScript Configuration
- Project references: `tsconfig.app.json` (app), `tsconfig.spec.json` (tests)
- Strict Angular compiler options enabled (`strictInjectionParameters`, `strictInputAccessModifiers`)
- Target: ES2022, Module: preserve (for ESM)

## SSR Details
- Build output: `dist/app_uno/browser` (client) + `dist/app_uno/server` (server)
- Server entry: `src/server.ts` → exports `reqHandler` for Angular CLI / Firebase
- Express serves static files from `browserDistFolder` with 1-year cache
- Port: `process.env.PORT || 4000` (also respects PM2 `pm_id`)

## Testing
- Vitest globals via `tsconfig.spec.json` (`types: ["vitest/globals"]`)
- Test files: `src/**/*.spec.ts`
- No e2e framework configured (`ng e2e` will fail until added)

## Common Gotchas
1. **SSR requires build first**: Run `npm run build` before `npm run serve:ssr:app_uno`
2. **Port conflict**: Dev server (4200) ≠ SSR server (4000)
3. **Empty routes**: App currently has no routes defined — add to `app.routes.ts`
4. **Node ESM**: Server uses ESM (`import.meta.dirname`, `.mjs` output)