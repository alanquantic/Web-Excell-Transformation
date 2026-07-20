# OTR Recommended Spare Parts - Excel Analysis Report

## Executive Summary

This Excel file is a **spare parts pricing calculator/catalog** for OTR (Off-The-Road) equipment manufactured by Eagle. It lists recommended spare parts for different equipment models with quantities, prices, and totals.

**File:** OTR Recommended Spare Parts.xlsx  
**Sheets:** 1 (Sheet1)  
**Data Range:** A1:E33  
**Purpose:** Calculate total cost of recommended spare parts for multiple equipment types

---

## 📊 Overall Structure

The spreadsheet is organized into **four equipment categories**, each listing spare parts with their quantities, unit prices, and totals:

1. **OTR Debeader** (5 parts)
2. **Punch Cutter II** (4 parts)
3. **Titan II** (4 parts)
4. **Interchangeable Parts** (1 part)

Each section includes:
- Equipment name/category header
- Column headers (Part, Quantity, Price Per Unit, Total)
- List of parts with their details
- Optional subtotal row

The spreadsheet ends with a **Grand Total** that sums all items.

---

## 📋 Sheet Structure Details

### Sheet: Sheet1

| Row Range | Section | Description |
|-----------|---------|-------------|
| Row 1 | Title | "OTR Recommended Spare Parts" |
| Row 2 | Blank | Separator |
| Rows 3-9 | OTR Debeader | Header (row 3), 5 parts (rows 4-8), Subtotal (row 9) |
| Rows 10-11 | Blank | Separator |
| Rows 12-17 | Punch Cutter II | Header (row 12), 4 parts (rows 13-16), Subtotal (row 17) |
| Rows 18-19 | Blank | Separator |
| Rows 20-24 | Titan II | Header (row 20), 4 parts (rows 21-24), **NO subtotal** |
| Rows 25-27 | Blank | Separator |
| Row 28 | Interchangeable Parts | Header + 1 part (same row), **NO subtotal** |
| Rows 29-30 | Blank | Separator |
| Row 31 | Grand Total | Final sum |
| Rows 32-33 | Blank | Extra space |

---

## 🔢 Column Layout

| Column | Header | Data Type | Purpose |
|--------|--------|-----------|---------|
| **A** | (Equipment Name) | Text | Equipment category name (merged with section header) |
| **B** | Part | Text | Part name/description |
| **C** | Quantity | Integer | Number of units needed |
| **D** | Price Per Unit | Currency ($) | Unit price in USD |
| **E** | Total | Currency ($) | Line item total (Quantity × Price Per Unit) |

---

## 🎯 Input Cells (User Parameters)

### Primary Inputs (14 parts total)

#### OTR Debeader (Rows 4-8)
| Row | Part Name | Quantity Input | Price Input |
|-----|-----------|----------------|-------------|
| 4 | Hydraulic Filter | C4 | D4 |
| 5 | Limit Switch | C5 | D5 |
| 6 | Cutter Blade | C6 | D6 |
| 7 | Guide Roller & Bushing | C7 | D7 |
| 8 | Guide Roller Pin | C8 | D8 |

#### Punch Cutter II (Rows 13-16)
| Row | Part Name | Quantity Input | Price Input |
|-----|-----------|----------------|-------------|
| 13 | Hydraulic Filter | C13 | D13 |
| 14 | Sensory Rotary Encoder | C14 | D14 |
| 15 | Limit Switch | C15 | D15 |
| 16 | Punch Blade | C16 | D16 |

#### Titan II (Rows 21-24)
| Row | Part Name | Quantity Input | Price Input |
|-----|-----------|----------------|-------------|
| 21 | Hydraulic Filter | C21 | D21 |
| 22 | Cutter Blade | C22 | D22 |
| 23 | Guide Roller & Bushing | C23 | D23 |
| 24 | Guide Roller Pin | C24 | D24 |

#### Interchangeable Parts (Row 28)
| Row | Part Name | Quantity Input | Price Input |
|-----|-----------|----------------|-------------|
| 28 | PQ Control | C28 | D28 |

### Input Cell Characteristics
- **Quantity Cells (Column C):** Integer values (typically 1-2)
- **Price Cells (Column D):** Decimal currency values in USD
- **No data validation** rules currently applied
- **No constraints** or ranges defined

---

## 📈 Output Cells (Calculated Results)

### Line Item Totals (Column E)

**Current State:** ⚠️ **HARDCODED VALUES** (Not formulas!)

All line item totals in column E are currently hardcoded numbers, not formulas. They should be calculated as:

```
Total (E) = Quantity (C) × Price Per Unit (D)
```

**Affected Rows:**
- E4, E5, E6, E7, E8 (OTR Debeader items)
- E13, E14, E15, E16 (Punch Cutter II items)
- E21, E22, E23, E24 (Titan II items)
- E28 (Interchangeable Parts)

### Subtotals (Formulas)

| Cell | Formula | Description | Current Value |
|------|---------|-------------|---------------|
| **E9** | `=SUM(E4:E8)` | OTR Debeader Subtotal | $2,821.81 |
| **E17** | `=SUM(E13:E16)` | Punch Cutter II Subtotal | $3,201.97 |

**Note:** Titan II and Interchangeable Parts sections do **NOT** have subtotals.

### Grand Total (Formula)

| Cell | Formula | Description | Current Value |
|------|---------|-------------|---------------|
| **E31** | `=SUM(E4:E30)` | Grand Total of All Parts | $19,000.02 |

**Formula Logic:** Sums all values in E4:E30, which includes:
- All line item totals
- Section subtotals (E9, E17)
- Empty cells (rows 10-11, 18-19, 25-27, 29-30)

⚠️ **Issue:** This creates **double-counting** because subtotals (E9, E17) are already sums of their respective line items, which are also included in the E4:E30 range.

---

## ⚠️ Data Quality Issues Found

### Issue 1: Hardcoded Line Totals
**Problem:** Line item totals are not calculated with formulas  
**Impact:** If quantities or prices change, totals won't update automatically  
**Recommendation:** Replace all line item totals with formulas: `=C*D`

### Issue 2: Calculation Discrepancies
Several line items have incorrect totals:

| Row | Part | Expected | Actual | Difference |
|-----|------|----------|--------|------------|
| 6 | Cutter Blade (OTR Debeader) | $1,214.46 | $1,194.48 | -$19.98 |
| 16 | Punch Blade (Punch Cutter II) | $1,193.06 | $1,093.06 | -$100.00 |
| 22 | Cutter Blade (Titan II) | $5,306.00 | $4,513.96 | -$792.04 |

**Total Discrepancy:** -$912.02

These could be due to:
- Manual data entry errors
- Undocumented discounts
- Outdated prices after changes

### Issue 3: Double-Counting in Grand Total
**Problem:** Formula `=SUM(E4:E30)` includes both line items AND subtotals  
**Impact:** Inflates grand total incorrectly  
**Recommendation:** Use `=E9+E17+SUM(E21:E24)+E28` to avoid double-counting

**Verification:**
- Current Grand Total: $19,000.02
- Sum of all line items only: $13,888.26
- Difference (double-counted): $5,111.76

### Issue 4: Missing Subtotals
**Problem:** Titan II and Interchangeable Parts sections lack subtotals  
**Impact:** Inconsistent structure, harder to verify section totals  
**Recommendation:** Add subtotals for consistency:
- Add Titan II subtotal in row 25: `=SUM(E21:E24)`
- Add Interchangeable Parts label/row if needed

---

## 🔧 Formula Logic & Calculation Flow

### Current Formula Structure

```
┌─────────────────────────────────────────┐
│  OTR Debeader Section                   │
├─────────────────────────────────────────┤
│  E4-E8: Hardcoded line totals           │
│  E9: =SUM(E4:E8)  [Subtotal]            │
└─────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────┐
│  Punch Cutter II Section                │
├─────────────────────────────────────────┤
│  E13-E16: Hardcoded line totals         │
│  E17: =SUM(E13:E16)  [Subtotal]         │
└─────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────┐
│  Titan II Section                       │
├─────────────────────────────────────────┤
│  E21-E24: Hardcoded line totals         │
│  No subtotal                            │
└─────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────┐
│  Interchangeable Parts                  │
├─────────────────────────────────────────┤
│  E28: Hardcoded line total              │
│  No subtotal                            │
└─────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────┐
│  E31: =SUM(E4:E30)  [Grand Total]       │
└─────────────────────────────────────────┘
```

### Recommended Formula Structure

```
Line Item Total = Quantity × Price Per Unit
Section Subtotal = SUM(Section Line Items)
Grand Total = SUM(All Section Subtotals)
```

**Recommended Formulas:**

| Cell | Current | Recommended | Reason |
|------|---------|-------------|--------|
| E4-E8 | Hardcoded | `=C4*D4` to `=C8*D8` | Auto-calculate on input change |
| E9 | `=SUM(E4:E8)` | `=SUM(E4:E8)` | ✓ Correct |
| E13-E16 | Hardcoded | `=C13*D13` to `=C16*D16` | Auto-calculate |
| E17 | `=SUM(E13:E16)` | `=SUM(E13:E16)` | ✓ Correct |
| E21-E24 | Hardcoded | `=C21*D21` to `=C24*D24` | Auto-calculate |
| E25 | N/A | `=SUM(E21:E24)` | Add Titan II subtotal |
| E28 | Hardcoded | `=C28*D28` | Auto-calculate |
| E31 | `=SUM(E4:E30)` | `=E9+E17+E25+E28` | Avoid double-counting |

---

## 🎨 Formatting & Styling

### Font Formatting
- **Title (A1):** Normal text
- **Section Headers (A3, A12, A20, A28):** **Bold**
- **Column Headers (B3-E3, etc.):** **Bold**
- **Data cells:** Normal text
- **Subtotals:** Normal text
- **Grand Total label (D31):** **Bold**

### Number Formatting
- **Quantity (Column C):** General/Integer format
- **Price Per Unit (Column D):** Currency format ($ symbol)
- **Total (Column E):** Currency format ($ symbol)
- **Subtotals (E9, E17):** Custom format `"$"#,##0.00`
- **Grand Total (E31):** Custom format `"$"#,##0.00`

### Cell Alignment
- All cells use default alignment (left for text, right for numbers)
- No special alignment rules applied

### Special Features
- **No merged cells** detected
- **No data validation** rules
- **No conditional formatting**
- **No comments or notes**
- **No hidden rows or columns**

---

## 💼 Business Logic & Rules

### Pricing Rules
- **Currency:** All prices in USD ($)
- **Quantity:** Integer values (1-2 units typical)
- **No discounts** explicitly defined
- **No tax calculations** included

### Equipment Categories
1. **OTR Debeader:** Tire debeading equipment
2. **Punch Cutter II:** Tire cutting/punching equipment
3. **Titan II:** Heavy-duty tire processing equipment
4. **Interchangeable Parts:** Universal components (PQ Control)

### Part Categories
- **Hydraulic Filters:** Common across all equipment ($181.40/unit)
- **Blades:** Cutter/Punch blades (various prices)
- **Switches:** Limit switches ($505.23/unit)
- **Rollers & Pins:** Guide rollers, bushings, pins (various prices)
- **Electronics:** Sensory Rotary Encoder, PQ Control

### Inventory Recommendations
- Most parts: 2 units recommended
- Rollers/Pins: 1 unit recommended
- Electronics: 1 unit recommended

---

## 🌐 Web Application Recommendations

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     User Interface                           │
│  ┌────────────────────────┐  ┌─────────────────────────┐    │
│  │   Input Panel (Left)   │  │  Results Panel (Right)  │    │
│  │  - Equipment Selector  │  │  - Section Subtotals    │    │
│  │  - Part Quantities     │  │  - Grand Total          │    │
│  │  - Unit Prices         │  │  - Pie Chart            │    │
│  │  - Save Scenario       │  │  - Export PDF           │    │
│  └────────────────────────┘  └─────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### Database Schema Recommendations

#### 1. **Users Table**
```
users
├── id (Primary Key)
├── username
├── email
├── password_hash
├── created_at
└── updated_at
```

#### 2. **Equipment Categories Table**
```
equipment_categories
├── id (Primary Key)
├── name (OTR Debeader, Punch Cutter II, etc.)
├── description
└── display_order
```

#### 3. **Parts Master Table**
```
parts
├── id (Primary Key)
├── equipment_category_id (Foreign Key)
├── part_name
├── default_price
├── default_quantity
├── part_type (hydraulic, blade, electronic, etc.)
└── is_active
```

#### 4. **Calculation Scenarios Table**
```
calculation_scenarios
├── id (Primary Key)
├── user_id (Foreign Key)
├── scenario_name
├── created_at
├── updated_at
└── notes
```

#### 5. **Scenario Line Items Table**
```
scenario_line_items
├── id (Primary Key)
├── scenario_id (Foreign Key)
├── part_id (Foreign Key)
├── quantity
├── unit_price
├── line_total (calculated: quantity × unit_price)
└── equipment_category_id (Foreign Key)
```

#### 6. **Calculation History Table** (Optional)
```
calculation_history
├── id (Primary Key)
├── user_id (Foreign Key)
├── scenario_id (Foreign Key)
├── calculation_date
├── grand_total
└── json_data (full snapshot of calculation)
```

### Frontend Structure

#### Left Panel: Input Section
```
┌─────────────────────────────────────┐
│  📝 New Calculation                 │
│                                     │
│  Scenario Name: [_______________]   │
│  [Save Scenario] [Load Scenario]    │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  🔧 OTR DEBEADER                    │
│  ┌───────────────────────────────┐ │
│  │ Part          Qty    Price    │ │
│  │ Hydraulic     [2]   [$181.40] │ │
│  │ Filter                        │ │
│  │ Limit Switch  [2]   [$505.23] │ │
│  │ ...                           │ │
│  └───────────────────────────────┘ │
│                                     │
│  🔩 PUNCH CUTTER II                 │
│  ┌───────────────────────────────┐ │
│  │ Part          Qty    Price    │ │
│  │ ...                           │ │
│  └───────────────────────────────┘ │
│                                     │
│  [+ Add Custom Part]                │
│                                     │
│  [Calculate] [Reset]                │
└─────────────────────────────────────┘
```

#### Right Panel: Results Section
```
┌─────────────────────────────────────┐
│  📊 CALCULATION RESULTS             │
│                                     │
│  Equipment Breakdown:               │
│  ┌───────────────────────────────┐ │
│  │ OTR Debeader      $2,841.79   │ │
│  │ Punch Cutter II   $3,301.97   │ │
│  │ Titan II          $6,296.56   │ │
│  │ Interchangeable   $  655.90   │ │
│  └───────────────────────────────┘ │
│                                     │
│  ═══════════════════════════════════│
│  GRAND TOTAL:        $13,096.22    │
│  ═══════════════════════════════════│
│                                     │
│  📈 Cost Distribution               │
│  ┌───────────────────────────────┐ │
│  │     [Pie Chart Display]       │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│  [📄 Export PDF] [💾 Save]          │
└─────────────────────────────────────┘
```

### Key Features Implementation

#### 1. **Multi-User Authentication**
- Use JWT tokens or session-based auth
- Implement role-based access (Admin, User)
- Password hashing (bcrypt or similar)

#### 2. **Save Calculation Scenarios**
- Each user can create named scenarios
- Store all part quantities and prices
- Allow editing and updating existing scenarios
- Implement version history (optional)

#### 3. **Historical Data Storage**
- Auto-save each calculation
- Provide date-based filtering
- Allow comparison between scenarios
- Export historical data to CSV/Excel

#### 4. **Pie Chart Visualization**
- Show cost distribution by equipment category
- Use Chart.js or similar library
- Interactive tooltips with percentages
- Color-coded sections

#### 5. **PDF Export**
- Include company logo/branding
- Show all inputs (quantities, prices)
- Display all outputs (subtotals, grand total)
- Include pie chart visualization
- Add calculation date, user name, scenario name
- Format as professional invoice/quote

### Calculation Engine (JavaScript/Python)

```javascript
// Recommended calculation logic
class SparePartsCalculator {
  calculateLineItem(quantity, unitPrice) {
    return parseFloat((quantity * unitPrice).toFixed(2));
  }
  
  calculateSectionTotal(lineItems) {
    return lineItems.reduce((sum, item) => {
      return sum + this.calculateLineItem(item.quantity, item.unitPrice);
    }, 0);
  }
  
  calculateGrandTotal(sections) {
    return sections.reduce((sum, section) => {
      return sum + section.subtotal;
    }, 0);
  }
  
  getCostDistribution(sections) {
    const total = this.calculateGrandTotal(sections);
    return sections.map(section => ({
      name: section.name,
      amount: section.subtotal,
      percentage: (section.subtotal / total * 100).toFixed(2)
    }));
  }
}
```

### Data Validation Rules

| Field | Validation | Error Message |
|-------|------------|---------------|
| Quantity | Integer > 0 | "Quantity must be a positive integer" |
| Price | Decimal ≥ 0 | "Price must be a positive number" |
| Scenario Name | String, 3-100 chars | "Scenario name must be 3-100 characters" |

### User Workflows

#### Workflow 1: New Calculation
1. User logs in
2. Navigates to "New Calculation"
3. Enters/adjusts quantities and prices
4. Clicks "Calculate"
5. Views results and pie chart
6. Optionally saves scenario
7. Exports to PDF if needed

#### Workflow 2: Load Existing Scenario
1. User logs in
2. Clicks "Load Scenario"
3. Selects from dropdown/list
4. System loads saved values
5. User can modify and recalculate
6. Saves as new scenario or updates existing

#### Workflow 3: View History
1. User logs in
2. Navigates to "History" page
3. Filters by date range
4. Views list of past calculations
5. Can reload any calculation
6. Can export historical data

### Technology Stack Recommendations

#### Backend
- **Framework:** FastAPI (Python) or Node.js/Express
- **Database:** PostgreSQL or MySQL
- **ORM:** SQLAlchemy (Python) or Prisma (Node.js)
- **Authentication:** JWT or OAuth 2.0
- **PDF Generation:** ReportLab (Python) or PDFKit (Node.js)

#### Frontend
- **Framework:** React.js or Vue.js
- **UI Library:** Material-UI or Tailwind CSS
- **Charts:** Chart.js or Recharts
- **State Management:** Redux or Zustand
- **HTTP Client:** Axios

#### Deployment
- **Hosting:** AWS, Azure, or Heroku
- **Database:** Managed PostgreSQL service
- **File Storage:** AWS S3 (for PDF exports)
- **CDN:** CloudFront or Cloudflare

### Security Considerations
- Implement HTTPS/SSL
- Sanitize all user inputs
- Use prepared statements to prevent SQL injection
- Implement rate limiting
- Add CSRF protection
- Regular security audits
- Data encryption at rest

### Performance Optimizations
- Cache frequently accessed data
- Implement database indexing
- Use lazy loading for historical data
- Optimize PDF generation (background jobs)
- Implement pagination for large datasets

---

## 📝 Summary of Findings

### What This Calculator Does
✅ Lists recommended spare parts for 4 equipment types  
✅ Tracks quantities and unit prices  
✅ Calculates line totals and grand total  
✅ Provides organized cost breakdown by equipment

### What It Should Do (But Doesn't)
❌ Use formulas for all line item totals (currently hardcoded)  
❌ Avoid double-counting in grand total formula  
❌ Include consistent subtotals for all sections  
❌ Validate/correct calculation discrepancies  
❌ Support multi-user scenarios  
❌ Store historical calculations  
❌ Generate reports and visualizations

### Critical Issues to Fix
1. **Replace hardcoded totals with formulas:** `=C*D` for each line item
2. **Fix grand total formula:** Use `=E9+E17+E25+E28` instead of `=SUM(E4:E30)`
3. **Add missing subtotals:** Titan II (row 25) and optionally Interchangeable Parts
4. **Verify/correct calculation errors:** Investigate discrepancies in rows 6, 16, 22

### Web Application Priority Features
1. **User authentication & multi-user support** ⭐⭐⭐
2. **Save/load calculation scenarios per user** ⭐⭐⭐
3. **Automatic formula-based calculations** ⭐⭐⭐
4. **Historical data storage & retrieval** ⭐⭐⭐
5. **Pie chart visualization** ⭐⭐
6. **PDF export with full details** ⭐⭐
7. **Responsive dashboard layout** ⭐⭐
8. **Data validation & error handling** ⭐⭐

---

## 🚀 Next Steps

### Phase 1: Fix Excel Issues (Optional)
- Correct all hardcoded formulas
- Fix calculation discrepancies
- Add missing subtotals
- Validate all formulas

### Phase 2: Design Database Schema
- Create ER diagram
- Define all tables and relationships
- Plan data migration strategy

### Phase 3: Develop Backend API
- Set up authentication system
- Create CRUD endpoints for parts, scenarios
- Implement calculation engine
- Build PDF generation service

### Phase 4: Build Frontend Interface
- Create responsive dashboard layout
- Implement input forms
- Build results display with pie chart
- Integrate PDF export

### Phase 5: Testing & Deployment
- Unit tests for calculations
- Integration tests for API
- User acceptance testing
- Deploy to production environment

---

**Report Generated:** January 14, 2026  
**Analyzed File:** OTR Recommended Spare Parts.xlsx  
**Total Data Points:** 14 parts across 4 equipment categories  
**Total Formulas:** 3 (2 subtotals + 1 grand total)  
**Issues Identified:** 4 critical calculation/formula issues

