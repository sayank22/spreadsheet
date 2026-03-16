# Spreadsheet

A modern web application built with React and Vite for creating and managing spreadsheets.

This project is an assignment implementation of a spreadsheet-like web application built with React + Vite.

It supports formulas, dependency tracking, sorting, filtering, multi-cell paste, undo/redo, and local storage persistence.

The goal of this assignment was to implement the required features while maintaining correct spreadsheet behavior, performance, and data integrity.


## 🏗 Architecture Overview
The application separates the **Core Engine** (data, formulas, dependency graph, caching) from the **View Layer** (React UI). This ensures high performance and prevents visual UI changes from destructively mutating underlying data relationships.


### Task 1: Column Sort & Filter (View-Layer Architecture)
* **Decision:** Implemented sorting and filtering entirely in the View Layer (React UI) rather than mutating the underlying Engine's data map. 
* **Why:** If rows are physically moved in the engine data structure, mathematical formulas (e.g., `=A1+B1`) will break as cell references change. I introduced a `rowOrder` state array that maps visual rows to the engine's static data indices.
* **UX Detail:** When sorting, empty cells are explicitly forced to the bottom of the grid regardless of ascending/descending direction to maintain a clean UI. The original row numbers (1, 2, 3...) remain attached to their data to visually communicate that formulas are still referencing the correct original coordinates.

### Task 2: Multi-Cell Copy & Paste (Clipboard Integration)
* **Decision:** Designed a dual-clipboard system intercepting both `text/plain` (TSV) and `application/json` formats.
* **Why:** This ensures seamless bi-directional copy/pasting between this application and external tools (Microsoft Excel / Google Sheets), while also allowing internal copy-pasting to safely transfer raw formulas instead of just computed values.
* **Product Thinking (Undo UX):** Rather than letting a 50-cell paste operation pollute the engine's Undo Stack with 50 individual actions, I implemented an `executePaste` batch function in `engine/core.js`. This takes a single state snapshot of the grid, allowing the user to seamlessly undo a massive paste with a single `Ctrl+Z` command.

### Task 3: Local Storage Persistence
* **Decision:** Implemented a `500ms` Debounced Auto-Save using React's `useEffect` and a "Self-Healing" Initialization.
* **Why (Debounce):** Saving to `localStorage` on every single keystroke causes browser main-thread blocking and lag. The debounce ensures the save only triggers after the user pauses typing.
* **Why (Self-Healing):** The initial load function is wrapped in a strict `try/catch` block. If the JSON in `localStorage` is corrupted or fails versioning, the app safely catches the error, deletes the corrupted payload, and initializes a fresh grid to prevent a continuous "White Screen of Death."

---

## How to Test Features

### Sorting & Filtering
- Enter numbers in a column
- Click column header to sort asc / desc / reset
- Use filter dropdown to hide values

### Copy / Paste
- Copy cells from Excel / Google Sheets
- Paste into grid with Ctrl+V
- Undo with Ctrl+Z

### Persistence
- Edit cells
- Refresh page
- Data should remain

### Formulas
Try:
=a1+b1
=a1*10
=a1*b1

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sayank22/spreadhsheet.git
cd Spreadsheet
```

### 2. Install Dependencies

Install all required project dependencies:

```bash
npm install
```

### 3. Run Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

Create an optimized production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

### 5. Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### 6. Lint Code

Run ESLint to check for code quality issues:

```bash
npm run lint
```

## Project Structure

```
SpreadsheetApp/
├── src/
│   ├── App.jsx           # Main React component
│   ├── App.css           # Application styles
│   ├── main.jsx          # Application entry point
│   ├── index.css         # Global styles
│   ├── assets/           # Static assets (images, icons, etc.)
│   └── engine/           # Core application logic
│       └── core.js       # Engine core functionality
├── public/               # Static files served as-is
├── package.json          # Project dependencies and scripts
├── vite.config.js        # Vite configuration
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML entry point
└── README.md             # This file
```

## Technologies Used

- **React** - A JavaScript library for building user interfaces
- **Vite** - A next-generation frontend build tool
- **ESLint** - JavaScript linting utility
- **CSS** - Styling and layout

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |

## Features

- Formula engine with dependency graph
- Circular reference detection
- Undo / Redo support
- Column sorting (view-layer safe)
- Excel-like filtering
- Multi-cell copy & paste (Excel / Sheets compatible)
- Batch undo for paste operations
- Local storage persistence (debounced)
- Style formatting (bold / italic / color / alignment)
- Row / Column insert & delete

## Browser Support

This application works on all modern browsers that support ES2020+ JavaScript:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Demo Video

Loom video demonstrating all required features:

https://www.loom.com/share/74e44888cb91452882e060337ba2c697

# Spreadsheet


































































































<!-- 
## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/tauhidst07/spreadhsheet.git
cd SpreadsheetApp
```

### 2. Install Dependencies

Install all required project dependencies:

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

### 3. Run Development Server

Start the development server with hot module replacement (HMR):

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

Create an optimized production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

### 5. Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### 6. Lint Code

Run ESLint to check for code quality issues:

```bash
npm run lint
```

## Project Structure

```
SpreadsheetApp/
├── src/
│   ├── App.jsx           # Main React component
│   ├── App.css           # Application styles
│   ├── main.jsx          # Application entry point
│   ├── index.css         # Global styles
│   ├── assets/           # Static assets (images, icons, etc.)
│   └── engine/           # Core application logic
│       └── core.js       # Engine core functionality
├── public/               # Static files served as-is
├── package.json          # Project dependencies and scripts
├── vite.config.js        # Vite configuration
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML entry point
└── README.md             # This file
```

## Technologies Used

- **React** - A JavaScript library for building user interfaces
- **Vite** - A next-generation frontend build tool
- **ESLint** - JavaScript linting utility
- **CSS** - Styling and layout

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |


## Browser Support

This application works on all modern browsers that support ES2020+ JavaScript:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Dependencies won't install
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then reinstall: `rm -rf node_modules package-lock.json && npm install`

### Port 5173 already in use
- The dev server will automatically try the next available port
- Or specify a custom port: `npm run dev -- --port 3000`

### Build fails
- Ensure all dependencies are installed: `npm install`
- Clear any build cache: `rm -rf dist`
- Try rebuilding: `npm run build`



# task_AI_native_Office_intern -->
