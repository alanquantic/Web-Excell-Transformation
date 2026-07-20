# Eagle OTR Ops Suite - Architecture Documentation

## 📁 Project Structure

```
eagle_spare_parts_calculator/
└── nextjs_space/
    ├── app/                          # Next.js App Router
    │   ├── (auth)/                   # Auth group (login/signup)
    │   │   ├── login/
    │   │   └── signup/
    │   │
    │   ├── (dashboard)/              # Protected dashboard routes
    │   │   ├── projects/             # Project management
    │   │   │   ├── page.tsx          # Projects list
    │   │   │   ├── new/              # Create project
    │   │   │   └── [id]/             # Project details
    │   │   │       ├── page.tsx      # Project overview
    │   │   │       ├── fleet/        # Fleet management
    │   │   │       ├── simulations/  # Simulations for this project
    │   │   │       └── reports/      # Reports for this project
    │   │   │
    │   │   ├── simulations/          # All simulations
    │   │   │   ├── page.tsx          # Simulations list
    │   │   │   ├── new/              # Create simulation
    │   │   │   └── [id]/             # Simulation details
    │   │   │       ├── page.tsx      # Results view
    │   │   │       └── edit/         # Edit simulation
    │   │   │
    │   │   ├── reports/              # Report management
    │   │   │   ├── page.tsx          # Reports list
    │   │   │   └── [id]/             # Report viewer
    │   │   │
    │   │   └── settings/             # User/org settings
    │   │
    │   ├── calculator/               # Legacy spare parts calculator
    │   ├── history/                  # Calculation history
    │   │
    │   ├── api/                      # API Routes
    │   │   ├── auth/                 # Authentication endpoints
    │   │   ├── projects/             # Project CRUD
    │   │   │   ├── route.ts          # GET all, POST new
    │   │   │   └── [id]/
    │   │   │       ├── route.ts      # GET, PUT, DELETE
    │   │   │       ├── fleet/        # Fleet management
    │   │   │       └── members/      # Project members
    │   │   │
    │   │   ├── machines/             # Machine templates
    │   │   │   └── route.ts          # GET all templates
    │   │   │
    │   │   ├── simulations/          # Simulation CRUD
    │   │   │   ├── route.ts          # GET all, POST new
    │   │   │   ├── calculate/        # Run calculation
    │   │   │   └── [id]/
    │   │   │       └── route.ts      # GET, PUT, DELETE
    │   │   │
    │   │   ├── reports/              # Report generation
    │   │   │   ├── route.ts          # GET all, POST new
    │   │   │   ├── generate/         # Generate PDF
    │   │   │   └── [id]/
    │   │   │       └── route.ts      # GET, DELETE
    │   │   │
    │   │   ├── parts/                # Legacy parts API
    │   │   ├── scenarios/            # Legacy scenarios API
    │   │   ├── production/           # Production calculator API
    │   │   └── history/              # Calculation history API
    │   │
    │   ├── layout.tsx                # Root layout
    │   ├── page.tsx                  # Landing page
    │   └── globals.css               # Global styles
    │
    ├── components/
    │   ├── ui/                       # Shadcn/UI components
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   ├── header.tsx
    │   │   └── ...                   # Other UI primitives
    │   │
    │   ├── projects/                 # Project-specific components
    │   │   ├── project-card.tsx
    │   │   ├── project-form.tsx
    │   │   ├── project-rates-form.tsx
    │   │   └── project-members.tsx
    │   │
    │   ├── fleet/                    # Fleet management components
    │   │   ├── machine-card.tsx
    │   │   ├── fleet-overview.tsx
    │   │   └── add-machine-modal.tsx
    │   │
    │   ├── simulations/              # Simulation components
    │   │   ├── simulation-builder.tsx
    │   │   ├── machine-selector.tsx
    │   │   ├── results-dashboard.tsx
    │   │   ├── bottleneck-chart.tsx
    │   │   ├── cost-breakdown.tsx
    │   │   └── comparison-view.tsx
    │   │
    │   ├── reports/                  # Report components
    │   │   ├── report-builder.tsx
    │   │   ├── report-preview.tsx
    │   │   └── pdf-template.tsx
    │   │
    │   ├── charts/                   # Visualization components
    │   │   ├── production-gauge.tsx
    │   │   ├── cost-pie-chart.tsx
    │   │   ├── utilization-bars.tsx
    │   │   └── trend-line.tsx
    │   │
    │   ├── calculator/               # Legacy calculator components
    │   │   ├── parts-table.tsx
    │   │   ├── results-panel.tsx
    │   │   └── production-calculator.tsx
    │   │
    │   ├── layout/                   # Layout components
    │   │   ├── sidebar.tsx
    │   │   ├── dashboard-header.tsx
    │   │   └── mobile-nav.tsx
    │   │
    │   └── providers.tsx             # Context providers
    │
    ├── lib/
    │   ├── db.ts                     # Prisma client
    │   ├── auth-options.ts           # NextAuth config
    │   ├── utils.ts                  # Utility functions
    │   ├── types.ts                  # TypeScript types
    │   │
    │   ├── calculations/             # Business logic
    │   │   ├── production.ts         # Production calculations
    │   │   ├── costs.ts              # Cost calculations (OPEX)
    │   │   ├── bottleneck.ts         # Theory of Constraints
    │   │   └── revenue.ts            # Revenue/ROI projections
    │   │
    │   ├── constants/                # Configuration constants
    │   │   ├── machines.ts           # Eagle machine specs
    │   │   ├── tire-weights.ts       # Tire weight categories
    │   │   └── defaults.ts           # Default values
    │   │
    │   └── pdf/                      # PDF generation
    │       ├── templates/
    │       └── generator.ts
    │
    ├── hooks/                        # Custom React hooks
    │   ├── use-project.ts
    │   ├── use-simulation.ts
    │   ├── use-calculations.ts
    │   └── use-toast.ts
    │
    ├── prisma/
    │   ├── schema.prisma             # Database schema
    │   └── migrations/               # DB migrations
    │
    ├── scripts/
    │   ├── seed.ts                   # Database seeding
    │   └── seed-machines.ts          # Seed machine templates
    │
    ├── public/
    │   ├── favicon.svg
    │   └── images/
    │       └── machines/             # Machine images
    │
    └── config files...
```

---

## 🗄️ Database Schema (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                          USERS                                   │
│  - Manages authentication and authorization                      │
│  - Has role (ADMIN, MANAGER, OPERATOR)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ ProjectMember (many-to-many)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         PROJECTS                                 │
│  - Mining sites / client locations                              │
│  - Custom operational rates (electricity, fuel, labor)          │
│  - Operating parameters (shifts, hours, days/year)              │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  ProjectMachine │  │   Simulation    │  │     Report      │
│  (Fleet)        │  │  (Scenarios)    │  │  (PDF outputs)  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────────┐
│ MachineTemplate │◄─│  SimulationMachine  │
│ (Eagle specs)   │  │  (Config per sim)   │
└─────────────────┘  └─────────────────────┘
         │
         │ categoryId (optional link)
         ▼
┌─────────────────┐
│    Category     │ ◄── Legacy spare parts
│      Part       │     calculator models
└─────────────────┘
```

---

## 📊 Key Entities Explained

### 1. **Project (Mining Site)**

Each project represents a client location with unique operational costs:

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Project name (e.g., "Minera Escondida - Antofagasta") |
| `location` | String | Geographic location |
| `clientName` | String | Client company name |
| `electricityRate` | Float | $/kWh (varies by region) |
| `fuelRate` | Float | $/gallon for diesel equipment |
| `laborRate` | Float | $/hour for operators |
| `shiftsPerDay` | Int | 1, 2, or 3 shift operations |
| `operatingDaysYear` | Int | Typically 250-350 days |
| `avgTireWeightKg` | Float | Average tire weight at this site |

### 2. **MachineTemplate (Eagle Specs)**

Official Eagle machine specifications from technical documentation:

| Machine | Throughput | Power | Operators |
|---------|-----------|-------|----------|
| OTR Debeader | 6-8 tires/hr | 75 kW | 1 |
| Punch Cutter II | 4-6 tires/hr | 55 kW | 1 |
| Titan II | 4-5 tires/hr | 90 kW | 1 |

### 3. **ProjectMachine (Fleet)**

Actual equipment deployed at each site:

```typescript
{
  projectId: "proj_123",
  templateId: 1,                    // References MachineTemplate
  quantity: 2,                      // Two machines of this type
  serialNumbers: ["SN001", "SN002"],
  status: "OPERATIONAL",
  customThroughput: null            // Override if different from spec
}
```

### 4. **Simulation (Cost/Production Analysis)**

Saved calculations for comparison:

**Inputs:**
- Selected machines and quantities
- Operating parameters
- Rate type (typical vs. maximum)

**Outputs:**
- Production metrics (tires/shift, tons/year)
- Cost breakdown (labor, energy, maintenance)
- Bottleneck identification
- ROI projections

### 5. **Report (PDF Generation)**

Professional reports for client presentation:

| Type | Contents |
|------|----------|
| `PRODUCTION_ANALYSIS` | Throughput, bottlenecks, utilization |
| `COST_BREAKDOWN` | OPEX details, cost per tire/ton |
| `ROI_PROJECTION` | Revenue potential, payback period |
| `EXECUTIVE_SUMMARY` | High-level overview for decision makers |

---

## 🔄 Data Flow

```
1. User creates PROJECT with site-specific rates
                    │
                    ▼
2. User adds FLEET (machines from templates)
                    │
                    ▼
3. User creates SIMULATION
   - Selects machines from fleet
   - Sets operating parameters
   - System calculates:
     • Bottleneck (Theory of Constraints)
     • Production rates
     • Annual costs (OPEX)
     • Revenue potential
                    │
                    ▼
4. User generates REPORT
   - Selects simulation data
   - Customizes sections
   - Exports PDF for client
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Shadcn/UI |
| **State** | React Query, Zustand |
| **Database** | PostgreSQL (Abacus.AI hosted) |
| **ORM** | Prisma |
| **Auth** | NextAuth.js (Credentials) |
| **Charts** | Recharts |
| **PDF** | Client-side print / html2pdf |

---

## 🚀 Next Steps

1. **Seed machine templates** - Add Eagle machine specs to DB
2. **Build Projects module** - CRUD for projects/sites
3. **Build Fleet module** - Machine inventory per project
4. **Build Simulations module** - Advanced cost calculator
5. **Build Reports module** - PDF generation
6. **Add Dashboard** - Overview with key metrics
