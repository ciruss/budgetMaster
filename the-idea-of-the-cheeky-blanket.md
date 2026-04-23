# BudgetMaster — Java Final Project: Learning Roadmap

## Context

Personal-finance webapp for a Java course final project. User sets a monthly spending limit and logs income, expenses, investments, assets, and liabilities. Each month the app shows totals, savings rate, net worth, and progress vs. the spending limit.

You're learning Java, so **this document is a todo list with pointers, not a solution manual.** Each task points you at the Spring/JPA concept to look up, the file(s) involved, and a hint about how to think about it. Write the code yourself. Ask for help on anything that gets stuck.

### Decisions locked in
- **Stack:** Spring Boot REST backend (`backend/`) + React (Vite) SPA (`frontend/`, to be created).
- **Auth:** Spring Security with session cookies + BCrypt password hashing.
- **Features (all four):** monthly budget/spending-limit, income & expense transactions, assets & liabilities / net worth, savings-rate & investment tracking.
- **Deliverables:** unit + integration tests, and a written README/report.

### What exists today
Draft entities (`User`, `Asset`, `AssetCategory`, `AssetSnapshot`, `Transaction`), a `UserRepository`, a half-wired `UserController`. A few bugs to fix first — I'll handle those immediately after this plan so you have a clean base, then it's your show.

---

## Phase 0 — Fix the existing scaffolding (I'll do this once, as you asked)

- Change `Asset.category` from `@OneToOne` → `@ManyToOne`.
- Change `AssetCategory.assets` to `@OneToMany` (matching the above).
- Add `@RestController` + `@RequestMapping("/api")` to `UserController` (or split it into `AuthController`).
- Replace `java.util.Date` with `Instant` / `LocalDate` in entities.
- Add `@Column(unique = true, nullable = false)` on `User.email`.
- Add `findByEmail(String email)` to `UserRepository`.
- Note the password-hashing bug — you'll fix it properly when you do Spring Security (Phase 3).

---

## Phase 1 — Data model (you)

Goal: finish the domain so every feature has something to persist into.

- [x] **Add a default spending limit on `User`**
  - New field: `defaultSpendingLimit` (`BigDecimal`, nullable — null means "no limit set").
  - Rationale: most users keep the same limit month-to-month, so storing it once avoids duplication.
- [x] **Add `MonthlyBudget` entity for *overrides only***
  - Fields: `id`, `user` (`@ManyToOne`), `yearMonth` (`String "YYYY-MM"` or `LocalDate` first-of-month), `spendingLimit` (`BigDecimal`).
  - A row exists only when the user wants a different limit for that specific month.
  - Pointer: one row per (user, month) — look up `@UniqueConstraint` on `@Table`.
  - Lookup rule in `BudgetService.getLimit(user, yearMonth)`: return the `MonthlyBudget` row if present, else fall back to `user.defaultSpendingLimit`.
  - Upside for your report: "I kept full historical data while avoiding redundant rows for unchanged months" — a real design trade-off worth writing about.
- [x] **Add `Category` entity for transactions**
  - Fields: `id`, `user` (`@ManyToOne`), `name`, `kind` (enum `INCOME` / `EXPENSE`, use `@Enumerated(EnumType.STRING)`).
  - Why separate from `AssetCategory`? Categories for transactions ("Groceries", "Salary") are different from categories for accounts ("Checking", "Brokerage").
- [x] **Fix `Transaction` to use the new `Category`**
  - Replace the `String category` field with `@ManyToOne Category category`.
  - Add a `type` enum field: `INCOME` / `EXPENSE` / `INVESTMENT`.
  - Add `userId` via `@ManyToOne User user` — every transaction must belong to a user, so you can query by user later.
- [x] **Create repositories for each entity**
  - `TransactionRepository`, `AssetRepository`, `AssetSnapshotRepository`, `MonthlyBudgetRepository`, `CategoryRepository`, `AssetCategoryRepository`.
  - Pointer: extend `JpaRepository<Entity, Long>`. Add custom finder methods when needed (e.g. `findByUserIdAndDateBetween`) — Spring Data will implement them from the method name.
- [x] **`application.properties` tweaks**
  - Enable H2 console: `spring.h2.console.enabled=true`.
  - Set `spring.jpa.hibernate.ddl-auto=update` for dev.
  - Add a `prod` profile with Postgres later.

**Check:** run `./mvnw spring-boot:run`, visit `/h2-console`, confirm all tables exist with correct columns and foreign keys.

---

## Phase 2 — DTOs and a layered structure

Goal: stop returning JPA entities directly — use DTOs so your API is decoupled from the DB schema.

- [x] Create package `ee.johan.budgetmaster.dto` with records for every request/response (`TransactionDto`, `AssetDto`, `CreateTransactionRequest`, etc.).
  - Pointer: Java `record` types are perfect for DTOs — immutable, one line each.
- [x] Create package `ee.johan.budgetmaster.service` — business logic lives here, controllers only translate HTTP ↔ service calls.
  - Rule of thumb: controller = thin, service = where the thinking happens, repository = just queries.

---

## Phase 3 — Spring Security + Auth

Goal: users log in with email + password, sessions persist via cookie, every other endpoint knows which user is calling.

- [x] **Add Spring Security dependency** to `pom.xml` (`spring-boot-starter-security`).
- [x] **Create `SecurityConfig`** (`@Configuration`, `@EnableWebSecurity`).
  - Define a `SecurityFilterChain` bean. Permit `/api/auth/**`.
  - Disable CSRF for `/api/**` during dev (fine for a course project; note this in the README).
  - Enable CORS for `http://localhost:5173`.
  - Define a `PasswordEncoder` bean → `BCryptPasswordEncoder`.
- [x] **Create `AppUserDetailsService implements UserDetailsService`** — loads a user by email from `UserRepository`.
- [x] **`AuthController`** with:
  - `POST /api/auth/signup` — hash the password with `PasswordEncoder.encode(...)` before saving. Fail with 409 if email exists.
  - `POST /api/auth/login` — let Spring Security's form login handle it, OR write a manual endpoint that calls `AuthenticationManager.authenticate(...)`.
  - `POST /api/auth/logout`.
  - `GET /api/me` — returns the current user's profile from `SecurityContextHolder.getContext().getAuthentication()`.
- [x] **In every other controller**, get the current user from the `Authentication` parameter or `SecurityContextHolder`. **Never** trust a `userId` field from the request body.

**Check:** sign up → log in → `GET /api/me` returns your user. Log out → `GET /api/me` returns 401.

---

## Phase 4 — Transactions feature (the heart of the app)

Goal: full CRUD + monthly filtering.

- [x] `TransactionService` — methods: `create`, `update`, `delete`, `listByMonth(user, yearMonth)`.
- [x] `TransactionController` — endpoints:
  - `GET /api/transactions?month=YYYY-MM`
  - `POST /api/transactions`
  - `PUT /api/transactions/{id}` (verify the transaction belongs to the current user before updating — 404 otherwise)
  - `DELETE /api/transactions/{id}`
- [x] Add validation with `@Valid`, `@NotNull`, `@Positive` on DTOs. (Skipped per user request)
- [x] Repository pointer: `findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end)`.

**Check:** create a few transactions via curl/Postman with a logged-in cookie; filter by month; updating someone else's transaction (simulated) returns 404.

---

## Phase 5 — Budgets and Categories

- [ ] `CategoryController` — list, create, delete (only categories owned by the current user).
- [ ] `BudgetController`:
  - `GET /api/budgets/{yyyy-mm}` — returns the budget or 404.
  - `PUT /api/budgets/{yyyy-mm}` — **upsert**: if one exists for that user+month, update it; otherwise create.

---

## Phase 6 — Assets, Liabilities, Snapshots

- [ ] Add a `kind` field to `Asset` (`ASSET` / `LIABILITY` enum) so you can distinguish net-worth contributors from subtractors.
- [ ] CRUD endpoints for assets (scoped to user).
- [ ] `POST /api/assets/{id}/snapshots` — record a balance at a date.
- [ ] `GET /api/assets/{id}/snapshots` — list the history.

---

## Phase 7 — Summary service (the "wow" part of your report)

Goal: one endpoint that returns everything the dashboard needs for a given month.

- [ ] `SummaryService.summarize(user, yearMonth)` returns a `SummaryDto` with:
  - `income` = Σ transactions where `type = INCOME` in month
  - `expenses` = Σ transactions where `type = EXPENSE`
  - `invested` = Σ transactions where `type = INVESTMENT`
  - `savings = income - expenses - invested` (money you kept liquid)
  - `savingsRate = (savings + invested) / income` (what fraction of income you didn't spend — usually the more interesting number)
  - `budgetRemaining = spendingLimit - expenses`
  - `netWorth` = (Σ latest snapshot per ASSET) − (Σ latest snapshot per LIABILITY), up to end of month
- [ ] `GET /api/summary/{yyyy-mm}` returns this.
- [ ] `GET /api/networth?from=YYYY-MM&to=YYYY-MM` — returns an array of `{ yearMonth, netWorth }` for charting.
- [ ] **Write unit tests for this service first** — it's where bugs hide. Mock the repositories; verify the math on handcrafted data.

---

## Phase 8 — Error handling polish

- [ ] Create `GlobalExceptionHandler` with `@RestControllerAdvice`.
- [ ] Map validation errors → 400 with a JSON body; "not found" → 404; unique-constraint violations → 409.

---

## Phase 9 — Tests (course requirement — interleave, don't defer)

For each service you write, add tests as you go. Don't save all testing for the end.

- [ ] **Repository tests** — `@DataJpaTest`, verify your custom finder methods work.
- [ ] **Service tests** — pure JUnit + Mockito, mock repos, assert business logic. Heavy emphasis on `SummaryService`.
- [ ] **Controller tests** — `@SpringBootTest` + `MockMvc`, use `@WithMockUser` to simulate a logged-in user. One test per endpoint covering happy path + one failure case.

Target something like 30–50 tests total. Your course will likely grade for test presence and meaningfulness — mention coverage in the README.

---

## Phase 10 — Frontend (React + Vite)

Scaffold `frontend/` with `npm create vite@latest -- --template react-ts`. Add: React Router, TanStack Query, Recharts, Tailwind (or plain CSS). Configure Vite to proxy `/api` → `http://localhost:8080`.

Pages, in build order:
1. Login + Signup (with an `AuthProvider` context).
2. Dashboard — current month tiles, spending-limit progress bar, net-worth chart.
3. Transactions — table + add/edit modal, month switcher.
4. Assets — list + add-snapshot action per asset.
5. History — table of past months with metrics.

All `fetch` calls need `credentials: "include"` so the session cookie is sent.

---

## Phase 11 — README / Report

This doubles as your course report. Include:

- Feature list and screenshots.
- Architecture diagram (boxes: React → Spring controllers → services → JPA → Postgres).
- ER diagram of the entities.
- Endpoint table.
- How to run backend, frontend, and tests locally.
- Tech choices + why (good place to show off that you understood *why* you used Spring Security, JPA, DTOs, etc., not just that you used them).
- "Future work" section — multi-currency, recurring transactions, per-category budget limits, bank import.

---

## Out of scope for the deadline

Multi-currency, recurring transactions, per-category budget limits, bank data import, password reset, email notifications, mobile app. List these under "Future work" in the README — showing you know what you *didn't* build is a strong signal.

---

## How to use me from here

- Stuck on a concept? Ask — I'll explain and point at docs rather than writing it for you.
- Want me to review code you've written? Paste it or tell me the file and I'll critique.
- Want me to actually write a specific piece? Just say so explicitly; I'll switch modes for that request.
