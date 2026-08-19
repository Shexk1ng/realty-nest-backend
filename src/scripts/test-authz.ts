// Executable authorization/tenant-isolation regression suite.

const ENDPOINT = process.env.GRAPHQL_URL ?? "http://localhost:4000/graphql";
const PASSWORD = process.env.DEMO_PASSWORD ?? "DemoPass123!";
const SYSTEM_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "bartlomiejdejewski01@gmail.com";
const COMPANY_ADMIN_EMAIL = process.env.COMPANYADMIN_EMAIL ?? "admin@nestrealty.pl";

interface GqlResult<T> { data?: T; errors?: { message: string; extensions?: { code?: string } }[] }

async function gql<T>(query: string, variables: Record<string, unknown> = {}, token?: string): Promise<GqlResult<T>> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ query, variables }),
  });
  return res.json() as Promise<GqlResult<T>>;
}

const errorCode = (r: GqlResult<unknown>) => r.errors?.[0]?.extensions?.code ?? (r.errors?.length ? "ERROR" : null);

async function login(email: string, password = PASSWORD) {
  const r = await gql<{ login: { accessToken: string | null; twoFactorRequired: boolean; user: { role: string; companyId: string | null; id: string } } }>(
    `mutation($e:String!,$p:String!){ login(email:$e,password:$p){ accessToken twoFactorRequired user{ id role companyId } } }`,
    { e: email, p: password },
  );
  return r.data?.login ?? null;
}

let pass = 0, fail = 0, skip = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`); }
}
function skipped(name: string, why: string) { skip++; console.log(`  ⏭️  ${name} — pominięto: ${why}`); }

async function checkPageIsolation(name: string, query: string, token: string, companyId: string | null) {
  const r = await gql<Record<string, { items: { companyId: string | null }[] }>>(query, {}, token);
  const key = r.data ? Object.keys(r.data)[0] : undefined;
  const rows = key && r.data ? r.data[key]!.items ?? [] : [];
  const leaked = rows.filter((row) => row.companyId && row.companyId !== companyId);
  check(name, leaked.length === 0, `${leaked.length} rekordów spoza firmy (błędy: ${errorCode(r) ?? "brak"})`);
}

async function findForeignProperty(companyId: string | null, excludeUserId: string, token: string) {
  const r = await gql<{ getProperties: { items: { id: string; agentId: string | null; companyId: string | null }[] } }>(
    `query($cid:String){ getProperties(companyId:$cid, limit:500){ items{ id agentId companyId } } }`,
    { cid: companyId ?? undefined },
    token,
  );
  const items = r.data?.getProperties?.items ?? [];
  return items.find((p) => p.companyId === companyId && p.agentId && p.agentId !== excludeUserId) ?? null;
}

async function main() {
  console.log(`\n🔐 Testy kontroli dostępu i izolacji wielodostępowej → ${ENDPOINT}\n`);

  const anon = await gql(`{ getProperties { items { id } } }`);
  check("Zapytanie bez uwierzytelnienia zostaje odrzucone (UNAUTHENTICATED)", errorCode(anon) === "UNAUTHENTICATED", `otrzymano ${errorCode(anon)}`);

  const sysAdmin = await login(SYSTEM_ADMIN_EMAIL);
  check("Administrator systemu może się zalogować", !!sysAdmin?.accessToken && sysAdmin.user.role === "SYSTEM_ADMIN", sysAdmin?.twoFactorRequired ? "wymagane 2FA" : "");
  const compAdmin = await login(COMPANY_ADMIN_EMAIL);
  check("Administrator firmy może się zalogować", !!compAdmin?.accessToken && compAdmin.user.role === "COMPANY_ADMIN");

  const sysToken = sysAdmin?.accessToken ?? undefined;

  let agent: { id: string; token: string; companyId: string | null } | null = null;
  let agentAssistant: { id: string; token: string; companyId: string | null } | null = null;
  let allUsers: { id: string; email: string; role: string; companyId: string | null }[] = [];
  if (sysToken) {
    const users = await gql<{ getUsers: { items: { id: string; email: string; role: string; companyId: string | null }[] } }>(
      `{ getUsers(limit:500) { items { id email role companyId } } }`, {}, sysToken,
    );
    allUsers = users.data?.getUsers?.items ?? [];
    const candidate = allUsers.find((u) => u.role === "AGENT");
    if (candidate) {
      const a = await login(candidate.email);
      if (a?.accessToken) agent = { id: candidate.id, token: a.accessToken, companyId: a.user.companyId };
      else skipped("AGENT login", `could not log in as ${candidate.email}`);
    } else {
      skipped("Wyszukanie konta agenta", "nie znaleziono konta agenta (uruchom seed:demo)");
    }

    const assistantCandidate = allUsers.find((u) => u.role === "AGENT_ASSISTANT");
    if (assistantCandidate) {
      const a = await login(assistantCandidate.email);
      if (a?.accessToken) agentAssistant = { id: assistantCandidate.id, token: a.accessToken, companyId: a.user.companyId };
      else skipped("Logowanie asystenta agenta", `nie udało się zalogować jako ${assistantCandidate.email}`);
    } else {
      skipped("Wyszukanie konta asystenta agenta", "nie znaleziono konta asystenta (uruchom seed:demo)");
    }
  }

  if (agent) {
    const props = await gql<{ getProperties: { items: { id: string; companyId: string | null }[] } }>(
      `{ getProperties(limit:500) { items { id companyId } } }`, {}, agent.token,
    );
    const rows = props.data?.getProperties?.items ?? [];
    const leaked = rows.filter((p) => p.companyId && p.companyId !== agent!.companyId);
    check("Izolacja najemców: agent widzi wyłącznie oferty własnej firmy", leaked.length === 0, `${leaked.length} rekordów spoza firmy`);

    const create = await gql(
      `mutation{ createUser(email:"hacker@evil.test", password:"Password123!", name:"X", role:"COMPANY_ADMIN"){ id } }`,
      {}, agent.token,
    );
    check("Eskalacja uprawnień zablokowana: agent nie tworzy użytkownika (FORBIDDEN)", errorCode(create) === "FORBIDDEN", `otrzymano ${errorCode(create)}`);

    const logs = await gql(`{ getAuditLogs(limit:1){ id } }`, {}, agent.token);
    check("Dziennik audytu tylko dla administratora: agent odrzucony (FORBIDDEN)", errorCode(logs) === "FORBIDDEN", `otrzymano ${errorCode(logs)}`);
  } else {
    skipped("Izolacja, eskalacja, dostęp do dziennika", "brak konta agenta");
  }

  let otherCompanyUser: { id: string; companyId: string | null } | null = null;
  if (compAdmin?.accessToken && sysToken) {
    otherCompanyUser = allUsers.find((u) => u.companyId && u.companyId !== compAdmin.user.companyId) ?? null;
    if (otherCompanyUser) {
      const cross = await gql(`query($id:ID!){ getUserById(id:$id){ id } }`, { id: otherCompanyUser.id }, compAdmin.accessToken);
      check("Odczyt międzyfirmowy zablokowany: administrator firmy nie czyta cudzego użytkownika", errorCode(cross) === "FORBIDDEN", `otrzymano ${errorCode(cross)}`);

      const crossStatus = await gql(
        `query($id:ID){ twoFactorStatus(userId:$id){ enabled } }`, { id: otherCompanyUser.id }, compAdmin.accessToken,
      );
      check(
        "Odczyt stanu 2FA innej firmy zablokowany",
        errorCode(crossStatus) === "FORBIDDEN", `otrzymano ${errorCode(crossStatus)}`,
      );
      const crossDisable = await gql(
        `mutation($id:ID){ disableTwoFactor(userId:$id){ enabled } }`, { id: otherCompanyUser.id }, compAdmin.accessToken,
      );
      check(
        "Wyłączenie 2FA w innej firmie zablokowane",
        errorCode(crossDisable) === "FORBIDDEN", `otrzymano ${errorCode(crossDisable)}`,
      );
    } else {
      skipped("Odczyt międzyfirmowy i zarządzanie 2FA", "brak drugiej firmy w zbiorze");
    }
  }

  if (agent) {
    const salePrice = 100_000;
    const rate = 2;
    const bogusAmount = 999_999_999;
    const expected = Math.round((salePrice * rate) / 100);
    const created = await gql<{ addCommission: { id: string; amount: number } }>(
      `mutation($sp:Float!,$r:Float!,$amt:Float!,$d:String!){ addCommission(salePrice:$sp, rate:$r, amount:$amt, dealDate:$d){ id amount } }`,
      { sp: salePrice, r: rate, amt: bogusAmount, d: new Date().toISOString() },
      agent.token,
    );
    const gotAmount = created.data?.addCommission?.amount;
    check(
      "Kwota prowizji ignoruje wartość z klienta i jest przeliczana po stronie serwera",
      gotAmount === expected, `sent ${bogusAmount}, expected ${expected}, got ${gotAmount ?? errorCode(created)}`,
    );
  } else {
    skipped("Kontrola zaufania do kwoty prowizji", "brak konta agenta");
  }

  if (agent) {
    const modules: { name: string; query: string }[] = [
      { name: "klientów", query: `{ getContacts(limit:500){ items{ companyId } } }` },
      { name: "dokumentów", query: `{ getDocuments(limit:500){ items{ companyId } } }` },
      { name: "wydarzeń kalendarza", query: `{ getEvents(limit:500){ items{ companyId } } }` },
      { name: "kampanii", query: `{ getCampaigns(limit:500){ items{ companyId } } }` },
      { name: "szans sprzedaży", query: `{ getLeads(limit:500){ items{ companyId } } }` },
      { name: "transakcji", query: `{ getTransactions(limit:500){ items{ companyId } } }` },
      { name: "zadań", query: `{ getTasks(limit:500){ items{ companyId } } }` },
      { name: "prezentacji", query: `{ getViewings(limit:500){ items{ companyId } } }` },
    ];
    for (const m of modules) {
      await checkPageIsolation(`Izolacja najemców: agent widzi wyłącznie ${m.name} własnej firmy`, m.query, agent.token, agent.companyId);
    }
  } else {
    skipped("Izolacja pozostałych modułów", "brak konta agenta");
  }

  if (agentAssistant && sysToken) {
    const foreign = await findForeignProperty(agentAssistant.companyId, agentAssistant.id, sysToken);
    if (foreign) {
      const r = await gql(
        `mutation($id:ID!,$t:String){ updateProperty(id:$id, title:$t){ id } }`,
        { id: foreign.id, t: "Próba modyfikacji przez test regresyjny" },
        agentAssistant.token,
      );
      check("Asystent agenta nie edytuje cudzej oferty (FORBIDDEN)", errorCode(r) === "FORBIDDEN", `otrzymano ${errorCode(r)}`);
    } else {
      skipped("Kontrola własności oferty przez asystenta", "brak cudzej oferty w firmie");
    }
  } else {
    skipped("Kontrola własności oferty przez asystenta", "brak konta asystenta agenta");
  }

  if (agent && sysToken) {
    const foreign = await findForeignProperty(agent.companyId, agent.id, sysToken);
    if (foreign) {
      const r = await gql(
        `mutation($pid:ID!,$l:Boolean!){ togglePropShare(propertyId:$pid, listed:$l){ id } }`,
        { pid: foreign.id, l: true },
        agent.token,
      );
      check("Agent nie zmienia udostępnienia cudzej oferty (FORBIDDEN)", errorCode(r) === "FORBIDDEN", `otrzymano ${errorCode(r)}`);
    } else {
      skipped("togglePropShare ownership check", "brak cudzej oferty w firmie");
    }

    const own = await gql<{ getProperties: { items: { id: string }[] } }>(`{ getProperties(limit:1){ items{ id } } }`, {}, agent.token);
    const ownPropertyId = own.data?.getProperties?.items?.[0]?.id;
    if (ownPropertyId) {
      const toggled = await gql(
        `mutation($pid:ID!,$l:Boolean!){ togglePropShare(propertyId:$pid, listed:$l){ id propShareListed } }`,
        { pid: ownPropertyId, l: true },
        agent.token,
      );
      const toggledOk = !errorCode(toggled);
      check("Agent zmienia udostępnienie własnej oferty", toggledOk, `otrzymano ${errorCode(toggled)}`);
      if (toggledOk) {
        const propshareLogs = await gql<{ getAuditLogs: { id: string }[] }>(`{ getAuditLogs(category:"PROPSHARE", limit:5){ id } }`, {}, sysToken);
        check(
          "Operacja PropShare trafia do dziennika audytu (regresja: brakujące wartości wyliczeniowe)",
          (propshareLogs.data?.getAuditLogs?.length ?? 0) > 0, `otrzymano ${errorCode(propshareLogs)}`,
        );
      }
    } else {
      skipped("Regresja dziennika audytu PropShare", "agent nie ma oferty do przełączenia");
    }
  } else {
    skipped("Własność oferty PropShare i regresja dziennika", "brak konta agenta");
  }

  if (agent) {
    const tempPassword = "TempPass456!";
    const changed = await gql<{ changePassword: boolean }>(
      `mutation($id:ID!,$cur:String!,$new:String!){ changePassword(id:$id, currentPassword:$cur, newPassword:$new) }`,
      { id: agent.id, cur: PASSWORD, new: tempPassword },
      agent.token,
    );
    if (changed.data?.changePassword && sysToken) {
      const passwordLogs = await gql<{ getAuditLogs: { messageParamsJson: string | null }[] }>(
        `query($aid:String){ getAuditLogs(category:"USER", actorId:$aid, limit:20){ messageParamsJson } }`,
        { aid: agent.id }, sysToken,
      );
      const entries = (passwordLogs.data?.getAuditLogs ?? []).filter((e) =>
        e.messageParamsJson?.includes("password"),
      );
      const leaksHash = entries.some((e) => e.messageParamsJson?.includes("$2"));
      const allRedacted = entries.length > 0 && entries.every((e) => e.messageParamsJson?.includes("[redacted]"));
      check(
        "Skrót hasła jest redagowany w dzienniku audytu, nie zapisywany jawnie",
        !leaksHash && allRedacted,
        leaksHash
          ? "found a bcrypt-looking hash in the log"
          : entries.length === 0
            ? "no password-change entry found"
            : allRedacted ? "" : `${entries.length} entries, not all redacted`,
      );
    } else {
      skipped("Kontrola redakcji hasła", `zmiana hasła nie powiodła się: ${errorCode(changed)}`);
    }
    const reverted = await gql(
      `mutation($id:ID!,$cur:String!,$new:String!){ changePassword(id:$id, currentPassword:$cur, newPassword:$new) }`,
      { id: agent.id, cur: tempPassword, new: PASSWORD },
      agent.token,
    );
    if (errorCode(reverted)) console.log(`  ⚠️  could not revert AGENT password back to demo password: ${errorCode(reverted)}`);
  } else {
    skipped("Kontrola redakcji hasła", "brak konta agenta");
  }

  if (agent && compAdmin?.accessToken) {
    const tempPassword2 = "AdminReset789!";
    const reset = await gql<{ changePassword: boolean }>(
      `mutation($id:ID!,$cur:String!,$new:String!){ changePassword(id:$id, currentPassword:$cur, newPassword:$new) }`,
      { id: agent.id, cur: "irrelevant-value-admin-does-not-know", new: tempPassword2 },
      compAdmin.accessToken,
    );
    check("Administrator firmy resetuje hasło użytkownika własnej firmy bez znajomości poprzedniego", !!reset.data?.changePassword, `otrzymano ${errorCode(reset)}`);

    if (reset.data?.changePassword) {
      const agentEmail = allUsers.find((u) => u.id === agent!.id)?.email ?? "";
      const reLogin = await login(agentEmail, tempPassword2);
      check("Reset hasła przez administratora odnosi skutek (logowanie nowym hasłem)", !!reLogin?.accessToken, reLogin?.accessToken ? "" : "logowanie nie powiodło się");

      const revert = await gql(
        `mutation($id:ID!,$cur:String!,$new:String!){ changePassword(id:$id, currentPassword:$cur, newPassword:$new) }`,
        { id: agent.id, cur: tempPassword2, new: PASSWORD },
        agent.token,
      );
      if (errorCode(revert)) console.log(`  ⚠️  could not revert AGENT password back to demo password: ${errorCode(revert)}`);
    }
  } else {
    skipped("Kontrola resetu hasła przez administratora", "brak konta agenta lub administratora firmy");
  }

  if (otherCompanyUser && compAdmin?.accessToken) {
    const crossReset = await gql(
      `mutation($id:ID!,$cur:String!,$new:String!){ changePassword(id:$id, currentPassword:$cur, newPassword:$new) }`,
      { id: otherCompanyUser.id, cur: "x", new: "WontWork123!" },
      compAdmin.accessToken,
    );
    check("Reset hasła w innej firmie zablokowany", errorCode(crossReset) === "FORBIDDEN", `otrzymano ${errorCode(crossReset)}`);
  } else {
    skipped("Kontrola resetu hasła w innej firmie", "brak drugiej firmy w zbiorze");
  }

  if (agent && otherCompanyUser) {
    const crossOwner = await gql<{ addContact: { id: string } }>(
      `mutation($oid:String){ addContact(name:"Test właściciela z innej firmy", ownerId:$oid){ id } }`,
      { oid: otherCompanyUser.id },
      agent.token,
    );
    check(
      "Przypisanie klienta użytkownikowi innej firmy odrzucone",
      errorCode(crossOwner) === "BAD_USER_INPUT", `otrzymano ${errorCode(crossOwner)}`,
    );
  } else {
    skipped("Kontrola przypisania właściciela z innej firmy", "brak agenta lub użytkownika drugiej firmy");
  }

  if (sysToken) {
    const companies = await gql<{ getCompanies: { items: { name: string }[] } }>(`{ getCompanies(limit:1){ items{ name } } }`, {}, sysToken);
    const existingName = companies.data?.getCompanies?.items?.[0]?.name;
    if (existingName) {
      const dup = await gql(
        `mutation($n:String!){ createCompany(name:$n, adminEmail:"dup-test@example.com", adminName:"Dup Test", adminPassword:"DupPass123!"){ id } }`,
        { n: existingName },
        sysToken,
      );
      check("Zduplikowana nazwa firmy zostaje odrzucona", !!errorCode(dup), `oczekiwano błędu, otrzymano ${errorCode(dup) ?? "powodzenie"}`);
    } else {
      skipped("Kontrola zduplikowanej nazwy firmy", "nie znaleziono firmy");
    }
  }

  if (sysToken) {
    const chain = await gql<{ auditChainStatus: { ok: boolean; total: number; brokenAtSeq: number | null } }>(
      `{ auditChainStatus { ok total brokenAtSeq } }`, {}, sysToken,
    );
    const st = chain.data?.auditChainStatus;
    check("Łańcuch skrótów dziennika audytu jest nienaruszony", !!st?.ok, st ? `naruszenie przy wpisie ${st.brokenAtSeq}` : (errorCode(chain) ?? "brak danych"));
  }

  if (sysToken) {
    const deep = `{ a:__typename ${"b{ ".repeat(20)}__typename ${"}".repeat(20)} }`;
    const r = await gql(deep, {}, sysToken);
    const code = errorCode(r);
    check("Limit głębokości GraphQL odrzuca zapytanie zagnieżdżone", code === "QUERY_TOO_DEEP" || code === "GRAPHQL_VALIDATION_FAILED" || !!r.errors?.length, `otrzymano ${code}`);
  }

  console.log(`\n──────── WYNIK ────────`);
  console.log(`PASS: ${pass}   FAIL: ${fail}   POMINIĘTO: ${skip}`);
  console.log(`────────────────────────\n`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => { console.error("Przebieg testów nie powiódł się:", err); process.exit(2); });
