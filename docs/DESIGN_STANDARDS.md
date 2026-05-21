# Technical Implementation Prompt: Excel Add-in (Modern Design)

## Project Context

You are building a React-based Excel Taskpane Add-in using Fluid UI. The design is a "Modern Minimalist" take on the Excel ecosystem, utilizing a clean card-based layout with a focus on high-density information display suitable for a narrow taskpane.

## Core Design Tokens

- **Font**: `Libre Franklin` (Sans-serif)
- **Primary Color**: `#217346` (Excel Green)
- **Primary Light**: `#E9F5ED` (Soft Green background/active state)
- **Surface**: `#FDF8F6` (Off-white / Warm grey)
- **Borders**: `#EDEBE9`
- **Text (Primary)**: `#1C1B1A`
- **Border Radius**: `4px` (Consistent throughout)

## Global Component Standards

1. **Inputs**: White background, 1px border (`#EDEBE9`), 8px padding. For range selection, include a `Grid` icon on the right.
2. **Buttons**:
   - **Primary**: Background `#217346`, White text, bold.
   - **Secondary/Outline**: Background white, 1px border `#EDEBE9`, Text primary.
3. **Modals**:
   - Overlay: Semi-transparent backdrop.
   - Container: White background, rounded corners (4px), clean header with a title and an 'X' close icon.
   - Footer: Actions (Cancel, Primary Action) right-aligned.
4. **Icons**: Use a consistent stroke weight (approx 1.5px or 2px) to match the typography.

## Screen Architectures

### 1. Main Taskpane (Home)

- **Header**: Compact height, Title "Analysis Tools" in bold. Subtext "Select an action to apply to your current range."
- **Feature Cards**: Full-width buttons/cards.
  - White background, 1px border.
  - Leading icon (e.g., `BarChart`, `TrendingUp`, `Layers`).
  - Label text left-aligned.
  - Trailing `ChevronRight` icon.
- **Footer**: "Settings" icon on the right.

### 2. Descriptive Statistics Modal

- **Fields**:
  - "Select Range X" (Input with Grid icon).
  - "Output Cell" (Input with Grid icon).
- **Actions**: "Cancel" (left), "Insert into Excel" (right, primary green).

### 3. Regression Analysis Modal

- **Fields**: Range Y, Range X, Output Cell.
- **Selection**: Model Type Dropdown (Linear, Log-linear, etc.).
- **Toggle**: "Econometric Interpretation" switch.
- **Input**: "Alpha (α)" numerical input (default 0.05).

### 4. Compare Models Modal

- **Fields**: Range Y, Range X, Output Cell.
- **Selection**: Grid of checkboxes for multiple models (Linear, Semi-log, Log-linear, Lin-log).
- **Toggle**: "Econometric Interpretation" switch.

### 5. Create Dummy Values (Two-Step Flow)

- **Step 1**: Source Range selection.
- **Step 2**:
  - Display "Detected Values" list.
  - Radio button selection for "Main Value" (Baseline).
  - Info Box: Green background `#E9F5ED`, explaining the baseline omission for multicollinearity.

## Implementation Notes

- Ensure all screens are responsive to the taskpane's width (typically 350px - 400px).
- Use `flex-col` for vertical stacking and maintain consistent spacing (`gap-4` or `gap-6` between form groups).
- Implement standard Fluent-style transitions for button hovers and modal entries.
