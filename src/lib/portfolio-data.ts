export type Project = {
  id: string
  name: string
  category: string
  summary: string
  code: string[]
  stack: string[]
  metrics: { label: string; value: string }[]
  nodes: string[]
  accent: string
  problem: string
  decision: string
  outcome: string
  github: string
}

export const projects: Project[] = [
  {
    id: "carvaana",
    name: "Carvaana",
    category: "Carpooling platform backend",
    summary: "A secure ride-matching API combining local geospatial filtering with real road-path routing.",
    code: [
      "const nearby = await rides.findAll({",
      "  where: withinBounds(origin, 0.1),",
      "})",
      "return osrm.rankByRoute(nearby)",
    ],
    stack: ["Node.js", "Express.js", "PostgreSQL", "Sequelize", "OSRM", "JWT"],
    metrics: [
      { label: "Matching", value: "2-stage" },
      { label: "Geo filter", value: "±0.1°" },
      { label: "Auth", value: "JWT" },
    ],
    nodes: ["Client", "API", "Geo filter", "OSRM"],
    accent: "routing",
    problem: "Driver-passenger matching needed accurate road proximity without making every candidate an expensive external routing request.",
    decision: "Applied a local bounding-box filter first, then ranked the reduced candidate set using OSRM road-path routing.",
    outcome: "A normalized, authenticated backend for ride requests, matching, and transaction flows with controlled external API usage.",
    github: "https://github.com/atrivers3",
  },
  {
    id: "parhofast",
    name: "ParhoFast",
    category: "Educational collaboration platform",
    summary: "A role-aware collaboration platform with inherited permissions and relational enrollment integrity.",
    code: [
      "authorize('teacher', {",
      "  inherits: ['student'],",
      "})",
      "await enrollments.createOnce(user, course)",
    ],
    stack: ["React", "TypeScript", "Vite", "Node.js", "Express", "PostgreSQL", "Vercel"],
    metrics: [
      { label: "Access", value: "RBAC" },
      { label: "Integrity", value: "CASCADE" },
      { label: "Delivery", value: "CI/CD" },
    ],
    nodes: ["React UI", "REST API", "RBAC", "Postgres"],
    accent: "access",
    problem: "Student and teacher workflows required strict authorization while sharing common access paths and enrollment data.",
    decision: "Implemented inherited role middleware, a normalized junction table, cascade constraints, and parameterized queries.",
    outcome: "A deployed full-stack learning system with clear authorization boundaries and duplicate-safe enrollment flows.",
    github: "https://github.com/atrivers3",
  },
  {
    id: "raabta",
    name: "Raabta",
    category: "AI-powered sign language translator",
    summary: "An offline-first Roman Urdu translation pipeline driving authored 3D sign-language animation.",
    code: [
      "tokens = normalize(roman_urdu)",
      "senses = wsd.resolve(tokens, context)",
      "clips = lexicon.sequence(senses)",
      "unity.play(clips)",
    ],
    stack: ["Python", "FastAPI", "C#", "Unity", "Blender", "MediaPipe", "SQLite"],
    metrics: [
      { label: "Runtime", value: "Offline" },
      { label: "Context", value: "WSD" },
      { label: "Output", value: "3D signs" },
    ],
    nodes: ["Speech", "NLP/WSD", "Lexicon", "Unity"],
    accent: "translation",
    problem: "Roman Urdu contains spelling variance and contextual ambiguity that cannot map directly to deterministic sign animations.",
    decision: "Built a normalization and WSD pipeline, then sequenced manually authored Blender assets through a custom Unity C# engine.",
    outcome: "An offline-first translation prototype plus a MediaPipe-to-BVH research path for evaluating automated motion capture.",
    github: "https://github.com/atrivers3",
  },
  {
    id: "mini-ai-agent",
    name: "Mini AI Agent",
    category: "Autonomous reasoning engine",
    summary: "A persistent ReAct agent with validated state and a constrained expression-execution boundary.",
    code: [
      "while not task.complete:",
      "  thought = model.reason(context)",
      "  action = tools.validate(thought.action)",
      "  context.append(action.execute())",
    ],
    stack: ["Python", "FastAPI", "Gemini SDK", "Supabase", "PostgreSQL", "Pytest"],
    metrics: [
      { label: "Loop", value: "ReAct" },
      { label: "Sandbox", value: "AST" },
      { label: "State", value: "Durable" },
    ],
    nodes: ["Prompt", "Reasoner", "AST guard", "Memory"],
    accent: "agent",
    problem: "Multi-step agent tasks required controlled tool execution and conversation continuity between requests.",
    decision: "Used a ReAct loop, AST-based expression validation, Pydantic boundaries, and PostgreSQL-backed context persistence.",
    outcome: "A testable autonomous reasoning engine with explicit execution and memory boundaries.",
    github: "https://github.com/atrivers3/mini-ai-agent",
  },
  {
    id: "mini-gateway",
    name: "MyMiniGateway",
    category: "Mini payment gateway API",
    summary: "A layered payment simulator modeling routing, authorization, wallets, and transaction audit history.",
    code: [
      "await using var tx = db.BeginTransaction();",
      "wallet.Debit(amount);",
      "target.Credit(amount);",
      "await tx.CommitAsync();",
    ],
    stack: ["C#", "ASP.NET Core 8", "Entity Framework Core", "SQLite", "Swagger"],
    metrics: [
      { label: "Transfers", value: "Atomic" },
      { label: "Audit", value: "Full" },
      { label: "API", value: "REST" },
    ],
    nodes: ["Controller", "Router", "Bank sim", "Ledger"],
    accent: "payments",
    problem: "Payment and wallet lifecycles need consistent balances, traceable outcomes, and clear boundaries between transport and domain logic.",
    decision: "Separated controllers, DTOs, routing services, and bank simulation while wrapping wallet transfers in database transactions.",
    outcome: "A documented payment API covering validation, routing, approval, rejection, wallets, and audit logging.",
    github: "https://github.com/atrivers3/MyMiniGateway",
  },
  {
    id: "openpos",
    name: "OpenPOS",
    category: "Enterprise retail system",
    summary: "An ACID-aware retail platform protecting checkout and accounting history through explicit data constraints.",
    code: [
      "connection.setAutoCommit(false);",
      "saleDao.persist(order);",
      "inventoryDao.decrement(lines);",
      "connection.commit();",
    ],
    stack: ["Java", "JavaFX", "PostgreSQL", "JDBC", "JUnit"],
    metrics: [
      { label: "Checkout", value: "ACID" },
      { label: "Pattern", value: "DAO" },
      { label: "Quality", value: "JUnit" },
    ],
    nodes: ["JavaFX", "Services", "DAO/JDBC", "Postgres"],
    accent: "retail",
    problem: "Checkout interruptions and unrestricted data mutation could corrupt inventory and historical accounting records.",
    decision: "Used JDBC transactions, strict foreign keys, database triggers, DAO isolation, and regression tests around transaction logic.",
    outcome: "A retail system with resilient checkout semantics and a live SQL-aggregation analytics dashboard.",
    github: "https://github.com/atrivers3/OpenPOS",
  },
  {
    id: "expense-cli",
    name: "Expense Tracker CLI",
    category: "Three-tier financial CLI",
    summary: "A framework-light Java application with strict presentation, business, and data-access separation.",
    code: [
      "var statement = connection.prepareStatement(SQL);",
      "statement.setInt(1, report.month());",
      "statement.setInt(2, report.year());",
      "return dao.aggregate(statement);",
    ],
    stack: ["Java 17", "JDBC", "MySQL", "Maven"],
    metrics: [
      { label: "Layers", value: "3-tier" },
      { label: "Queries", value: "Prepared" },
      { label: "Reports", value: "SQL agg" },
    ],
    nodes: ["CLI", "Business", "DAO", "MySQL"],
    accent: "finance",
    problem: "A small financial application still needed maintainable boundaries, safe queries, and useful reporting without framework overhead.",
    decision: "Applied a three-tier architecture, DAO pattern, PreparedStatements, normalized storage, and externalized configuration.",
    outcome: "A decoupled expense tracker with safe persistence and dynamic monthly and yearly aggregate reports.",
    github: "https://github.com/atrivers3",
  },
]

// ─── Foundation / Education Data ────────────────────────────────────────────

export type EducationEntry = {
  institution: string
  degree: string
  duration: string
  location: string
}

export type LeadershipProgram = {
  program: string
  organiser: string
  completedCohorts: string[]
  pendingNote: string
}

export type TimelineEntry = {
  year: string
  role: string
  society: string
}

export type AwardEntry = {
  title: string
  issuer: string
  /** Set to false if the award name / issuer is not yet confirmed */
  confirmed: boolean
}

// ── Education ────────────────────────────────────────────────────────────────

export const education: EducationEntry = {
  institution: "FAST-NUCES",
  degree: "B.S. Computer Science",
  duration: "2022 – 2026",
  location: "Karachi, Pakistan",
}

// ── Harvard Aspire Leadership Program ───────────────────────────────────────

export const harvardAspire: LeadershipProgram = {
  program: "Harvard Aspire Leadership Program",
  organiser: "Harvard University",
  completedCohorts: ["Cohort I", "Cohort II"],
  /**
   * Cohort III was left incomplete due to a clash with university final
   * examinations. Participation was deprioritised in favour of academic
   * commitments. Certificates for the two completed cohorts were awarded.
   */
  pendingNote:
    "Cohort III — Deferred (Final Exam Prioritization). Certificates awarded for Cohorts I & II.",
}

// ── Social Work & Leadership Timeline ───────────────────────────────────────

export const leadershipTimeline: TimelineEntry[] = [
  {
    year: "2024",
    role: "Food Assistant Manager",
    society: "Developer's Day 2024",
  },
  {
    year: "2023 – 2024",
    role: "SOP Compliance Co-Head",
    society: "ACM NUCES",
  },
  {
    year: "2023",
    role: "Campus Brand Ambassador",
    society: "Developer's Day 2023",
  },
  {
    year: "2022 – 2023",
    role: "Core Team Member",
    // TODO: Replace with your actual society name for 2022–2023
    society: "Your Society / Club Name",
  },
]

// ── Awards ───────────────────────────────────────────────────────────────────
// HOW TO ADD AN AWARD:
//   1. Copy the object template below.
//   2. Fill in `title` (the award name) and `issuer` (organisation / project).
//   3. Set `confirmed: true` once you have verified the details.
//   4. Add it to the array — it will render automatically as a badge.
//
// Example:
//   { title: "Star Performer Award", issuer: "ACM NUCES", confirmed: true },
//   { title: "Best Volunteer", issuer: "Developer's Day 2024", confirmed: true },

export const awards: AwardEntry[] = [
  // ↓ Add your confirmed awards here — see instructions above
  // { title: "Star Performer Award", issuer: "[Organisation / Project]", confirmed: true },
  // { title: "Best Volunteer", issuer: "[Organisation]", confirmed: true },
]

// ── Legacy flat array (used nowhere — kept for reference) ───────────────────
export const foundation = [
  { label: "Computer Science", value: "FAST-NUCES", detail: "Systems, algorithms, databases, and data-intensive design" },
  { label: "Backend practice", value: "Polyglot systems", detail: "Java, C#, Python, Node.js, PostgreSQL, and MySQL" },
  { label: "Operating model", value: "Architecture first", detail: "Integrity, failure modes, and security before implementation detail" },
]

// ─── Deployments / Experience ────────────────────────────────────────────────

export type DeploymentFeature = {
  name: string
  description: string
}

export type DeploymentContribution = {
  name: string
  description: string
}

export type Deployment = {
  id: string
  company: string
  role: string
  duration: string
  stack: string[]
  status: "Development Ready" | "Active Development" | "Production"
  features: DeploymentFeature[]
  contributions: DeploymentContribution[]
}

export const deployments: Deployment[] = [
  {
    id: "orbhex",
    company: "Orbhex",
    role: "Python Developer",
    duration: "June 2025 – Nov 2025",
    stack: ["Python", "FastAPI", "PostgreSQL", "Redis", "Celery", "Docker", "Playwright", "OpenAI Whisper", "Google Gemini SDK"],
    status: "Development Ready",
    features: [
      {
        name: "Async Multi-Source Scraping Engine",
        description: "Automated data harvesting pipelines for Google Maps, Reddit, Twitter, and internal portals.",
      },
      {
        name: "LLM Data Processing Pipeline",
        description: "Integrated Google Gemini SDK to intelligently parse, filter, and extract insights from raw scraped data.",
      },
      {
        name: "Authentication & API Gateway",
        description: "Built secure JWT-based auth with token refresh workflows and centralized REST endpoints.",
      },
    ],
    contributions: [
      {
        name: "Optimized DB Latency",
        description: "Designed a Redis caching strategy for JWT auth and frequent queries, cutting database load by 70% and dropping average response time to 15ms.",
      },
      {
        name: "Smart Token Consumption",
        description: "Structured raw scraped payloads before passing them to the Gemini SDK, significantly reducing unnecessary LLM token usage and API calls.",
      },
      {
        name: "Scalable Background Jobs",
        description: "Implemented Celery worker queues to handle heavy web automation and scraping tasks asynchronously without blocking API responses.",
      }
    ]
  }
]
