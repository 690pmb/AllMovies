# GitHub Copilot Instructions for AllMovies

Welcome! This repository hosts **AllMovies**, a serverless, modular Angular 12.2 client-side web application for searching and tracking movies, series, and cast details.

---

## 🚀 Build, Test, and Lint Commands

Use the following npm scripts to manage, validate, and test the project:

- **Dependency Installation**: `npm install`
- **Development Server**: `npm start` (Runs at `http://localhost:4242`)
- **Production Build**: `npm run build`
- **Run All Tests**: `npm test` (Runs Karma and Jasmine, followed by `npm run lint`)
- **Run a Single Test Suite/File**:
  - Filter specific files using the CLI: `npx ng test --include=src/app/shared/pipes/image.pipe.spec.ts`
  - Or isolate in code by replacing `describe` or `it` with `fdescribe` or `fit` inside the relevant spec file.
- **Check Lint & Formatting**: `npm run lint` (Checks TypeScript with GTS, SCSS with Stylelint)
- **Auto-Fix Lint & Formatting**: `npm run fix` (Fixes TypeScript with GTS, formats with Prettier, fixes SCSS with Stylelint)

---

## 🏛️ High-Level Architecture

The project has a clear architecture separated into domain models, static data mappers, communication services, state managers, and feature modules:

### 1. Serverless Backend (Dropbox Storage)

- **Architecture Model**: There is no custom backend server or database. Instead, the application uses **Dropbox** as its database/persistence layer.
- **Data Persistence**:
  - `user.json` stores all registered users with encrypted/local passwords.
  - Authenticated user data is persisted in user-specific JSON files: `ex_<userId>.json` (movies), `tv_<userId>.json` (series), and `tag_<userId>.json` (tags).
- **Communication**: Managed via `DropboxService` (`src/app/service/dropbox.service.ts`) using the Dropbox API.

### 2. State & State Management (Managers vs. Services)

- **Services (`src/app/service/`)**: Low-level data-fetching components communicating directly with external APIs (OMDb, TMDB, Dropbox).
- **Managers (`src/app/manager/`)**: Inject Services and handle state/cache management. They extend `AbstractService<T, ID>` (`abstract.manager.ts`) to manage:
  - Cache replay via RxJS `shareReplay(1)`.
  - Automatic language-switch reactions using `TranslateService`.
  - Router parameter matching and duplicate prevention via `distinctUntilChanged`.

### 3. Data Flow

```
External API / Dropbox Files  ──►  Services (get Promise/Observable)
                                       │
                                       ▼
Domain Models (Strongly Typed) ◄──  Mappers (Static JSON parser helpers)
                                       │
                                       ▼
Components (Reactive UI)       ◄──  Managers (Manages cache/language state)
```

### 4. Code Organization

- `src/app/application-modules/`: Feature-specific modules (e.g., `dashboard`, `discover`, `movie-detail`, `login`, `tags`).
- `src/app/shared/`: Reusable components (autocomplete, modals, score indicators), directives, pipes (e.g., `image`, `truncate`), and static model mappers.
- `src/app/model/`: Strongly typed model definitions.
- `src/app/constant/`: Environment, Dropbox, and external API constants.

---

## 📌 Key Conventions

- **State Access**: Components must inject **Managers** rather than low-level services to retrieve entity details. This ensures proper caching, routing-parameter updates, and language reactivity.
- **Mappers**: Always write or update a static Mapper class (e.g. `MapMovie` or `MapSerie` in `src/app/shared/`) to clean, validate, and shape API payloads before they reach components or managers. Do not parse raw API JSON directly inside components.
- **Localization (i18n)**: All user-facing strings must be localized. Use `TranslateService` or `translate` pipe with translation keys added to both:
  - English: `src/assets/i18n/en.json`
  - French: `src/assets/i18n/fr.json`
- **Dropbox Synced Files**: When editing user preferences, movie tracking, or tags lists, make sure changes conform to the JSON file-saving conventions in `MyDatasService` and `AuthService`.
- **CSS / Styling**: Global and utility styles are structured inside `src/app/styles/`. Components should restrict themselves to scoped, element-specific styles, using style variables (`_variables.scss`) and mixins from `_imports.scss`. Stylelint rules are strictly enforced on commit.
