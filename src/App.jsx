import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import './App.css'
import { createEngine } from './engine/core.js'

const TOTAL_ROWS = 50
const TOTAL_COLS = 50

export default function App() {
  // Engine instance is created once and reused across renders
  // Note: The engine maintains its own internal state, so React state is only used for UI updates
  const [engine] = useState(() => createEngine(TOTAL_ROWS, TOTAL_COLS))
  const [version, setVersion] = useState(0)
  const [selectedCell, setSelectedCell] = useState(null)
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  // Cell styles are stored separately from engine data
  // Format: { "row,col": { bold: bool, italic: bool, ... } }
  const [cellStyles, setCellStyles] = useState({})
  const cellInputRef = useRef(null)

  // rowOrder keeps track of which row index renders at which visual position
  const [rowOrder, setRowOrder] = useState(() => Array.from({ length: TOTAL_ROWS }, (_, i) => i))
  
  // Tracks which column is currently sorted and in what direction ('asc', 'desc', or null)
  const [sortState, setSortState] = useState({ col: null, direction: null }) 
  
// Tracks active filters: { colIndex: [array of hidden values] }
  const [filters, setFilters] = useState({})

  // ────── Filtering Logic ──────
  // Tracks which column's filter dropdown is currently open
  const [activeFilterMenu, setActiveFilterMenu] = useState(null);

  // Gets all unique values in a specific column to populate the filter checkboxes
  const getUniqueValues = useCallback((colIndex) => {
    const values = new Set();
    for (let r = 0; r < engine.rows; r++) {
      const val = engine.getCell(r, colIndex).computed ?? engine.getCell(r, colIndex).raw;
      values.add(val ?? "");
    }
    return Array.from(values).sort((a, b) => {
  if (a === "" && b === "") return 0
  if (a === "") return 1
  if (b === "") return -1

  if (!isNaN(a) && !isNaN(b))
    return Number(a) - Number(b)

  return String(a).localeCompare(String(b))
});
  }, [engine]);

  // forceRender
  const forceRerender = useCallback(() => setVersion(v => v + 1), [])

  // Copy/paste

  useEffect(() => {

  const handleGlobalCopy = (e) => {

    if (editingCell || document.activeElement.tagName === 'INPUT') return;
    if (!selectedCell) return;

    e.preventDefault();

    const cellData =
      engine.getCell(selectedCell.r, selectedCell.c);

    const copyText =
      cellData.computed !== null &&
      cellData.computed !== ''
        ? String(cellData.computed)
        : cellData.raw;

    e.clipboardData.setData(
      'text/plain',
      copyText
    );
  };

  const handleGlobalPaste = (e) => {
    // 1. Get the clipboard text first so we can inspect it
    const clipboardText = (e.clipboardData || window.clipboardData).getData('text/plain');
    if (!clipboardText) return;

    // 2. Check if it looks like Excel/Sheets grid data (contains tabs or newlines)
    const isGridPaste = clipboardText.includes('\t') || clipboardText.includes('\n');

    // 3. If they are typing in the top formula bar, let them paste normally
    if (document.activeElement.classList.contains('formula-bar-input')) return;

    // 4. If they are editing a cell, but pasting simple text (NO tabs), let normal paste happen
    if ((editingCell || document.activeElement.tagName === 'INPUT') && !isGridPaste) {
      return; 
    }

    // 5. IF WE REACH HERE: It's an Excel grid! Intercept and distribute!
    e.preventDefault();
    if (!selectedCell) return;

    const rows = clipboardText
      .split(/\r?\n/)
      .filter(r => r.length > 0);

    let targetRow = selectedCell.r;
    const updates = []; // Array to hold our batch

    rows.forEach(rowStr => {
      if (targetRow >= engine.rows) return;
      const cols = rowStr.split('\t');
      let targetCol = selectedCell.c;

      cols.forEach(cellVal => {
        if (targetCol >= engine.cols) return;
        
        // Collect the update instead of applying it immediately
        updates.push({ r: targetRow, c: targetCol, val: cellVal });
        targetCol++;
      });
      targetRow++;
    });

    // Send the batch to the engine
    if (updates.length > 0) {
      engine.executePaste(updates);
      // Kick the user out of "Edit Mode" so they can see the newly pasted grid!
      if (editingCell) {
        setEditingCell(null);
        setEditValue('');
      }
      forceRerender();
    }
  };

  window.addEventListener('copy', handleGlobalCopy);
  window.addEventListener('paste', handleGlobalPaste);

  return () => {
    window.removeEventListener('copy', handleGlobalCopy);
    window.removeEventListener('paste', handleGlobalPaste);
  };

}, [selectedCell, editingCell, engine, forceRerender]);

  // Toggles whether a specific value is hidden or shown in a column
  const toggleFilterValue = useCallback((colIndex, value) => {
    setFilters(prev => {
      const currentHidden = prev[colIndex] || [];
      if (currentHidden.includes(value)) {
        // If it's already hidden, remove it from the hidden list (make it visible)
        return { ...prev, [colIndex]: currentHidden.filter(v => v !== value) };
      } else {
        // Add it to the hidden list
        return { ...prev, [colIndex]: [...currentHidden, value] };
      }
    });
  }, []);

  // ────── Sorting Logic ──────
  const toggleSort = useCallback((colIndex) => {
    setActiveFilterMenu(null)
    setSortState(prev => {
      // 1. Determine the new direction
      let newDirection = 'asc';
      if (prev.col === colIndex) {
        if (prev.direction === 'asc') newDirection = 'desc';
        else if (prev.direction === 'desc') newDirection = null; // Reset
      }

      // 2. Apply the View-Layer Sort
      if (!newDirection) {
        // Reset to original order
        setRowOrder(Array.from({ length: engine.rows }, (_, i) => i));
      } else {
        // Sort the rows based on computed values
        setRowOrder(currentOrder => {
          const newOrder = [...currentOrder];
          newOrder.sort((a, b) => {
            // Get computed values, fallback to raw if computed is null/empty
            let v1 = engine.getCell(a, colIndex).computed ?? engine.getCell(a, colIndex).raw;
            let v2 = engine.getCell(b, colIndex).computed ?? engine.getCell(b, colIndex).raw;

            // Push empty cells to the bottom regardless of sort direction
            if (v1 === "" && v2 === "") return 0;
            if (v1 === "") return 1; 
            if (v2 === "") return -1;

            if (v1 === v2) return 0;
            const comparison = v1 > v2 ? 1 : -1;
            return newDirection === 'asc' ? comparison : -comparison;
          });
          return newOrder;
        });
      }

      // 3. Update the sort state
      return { col: colIndex, direction: newDirection };
    });
  }, [engine]);

  // ────── Cell style helpers ──────

  const getCellStyle = useCallback((row, col) => {
    const key = `${row},${col}`
    return cellStyles[key] || {
      bold: false, italic: false, underline: false,
      bg: 'white', color: '#202124', align: 'left', fontSize: 13
    }
  }, [cellStyles])

  const updateCellStyle = useCallback((row, col, updates) => {
    const key = `${row},${col}`
    setCellStyles(prev => ({
      ...prev,
      [key]: { ...getCellStyle(row, col), ...updates }
    }))
  }, [getCellStyle])

  // ────── Cell editing ──────

  const startEditing = useCallback((row, col) => {
    setSelectedCell({ r: row, c: col })
    setEditingCell({ r: row, c: col })
    const cellData = engine.getCell(row, col)
    setEditValue(cellData.raw)
    setTimeout(() => cellInputRef.current?.focus(), 0)
  }, [engine])

  const commitEdit = useCallback((row, col) => {
    // Only commit if the value actually changed to avoid unnecessary recalculations
    const currentCell = engine.getCell(row, col)
    if (currentCell.raw !== editValue) {
      engine.setCell(row, col, editValue)
      forceRerender()
    }
    setEditingCell(null)
  }, [engine, editValue, forceRerender])

  const handleCellClick = useCallback((row, col) => {
    if (editingCell && (editingCell.r !== row || editingCell.c !== col)) {
      commitEdit(editingCell.r, editingCell.c)
    }
    if (!editingCell || editingCell.r !== row || editingCell.c !== col) {
      startEditing(row, col)
    }
  }, [editingCell, commitEdit, startEditing])

  // ────── Keyboard navigation ──────

  const handleKeyDown = useCallback((event, row, col) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitEdit(row, col)
      startEditing(Math.min(row + 1, engine.rows - 1), col)
    } else if (event.key === 'Tab') {
      event.preventDefault()
      commitEdit(row, col)
      startEditing(row, Math.min(col + 1, engine.cols - 1))
    } else if (event.key === 'Escape') {
      setEditValue(engine.getCell(row, col).raw)
      setEditingCell(null)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      commitEdit(row, col)
      startEditing(Math.min(row + 1, engine.rows - 1), col)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      commitEdit(row, col)
      startEditing(Math.max(row - 1, 0), col)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      commitEdit(row, col)
      if (col > 0) {
        startEditing(row, col - 1)
      } else if (row > 0) {
        startEditing(row - 1, engine.cols - 1)
      }
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      commitEdit(row, col)
      startEditing(row, Math.min(col + 1, engine.cols - 1))
    }
  }, [engine, commitEdit, startEditing])

  // ────── Formula bar handlers ──────

  const handleFormulaBarKeyDown = useCallback((event) => {
    if (!editingCell) return
    handleKeyDown(event, editingCell.r, editingCell.c)
  }, [editingCell, handleKeyDown])

  const handleFormulaBarFocus = useCallback(() => {
    if (selectedCell && !editingCell) {
      setEditingCell(selectedCell)
      setEditValue(engine.getCell(selectedCell.r, selectedCell.c).raw)
    }
  }, [selectedCell, editingCell, engine])

  const handleFormulaBarChange = useCallback((value) => {
    if (!editingCell && selectedCell) setEditingCell(selectedCell)
    setEditValue(value)
  }, [editingCell, selectedCell])

  // ────── Undo / Redo ──────

  const handleUndo = useCallback(() => { if (engine.undo()) forceRerender() }, [engine, forceRerender])
  const handleRedo = useCallback(() => { if (engine.redo()) forceRerender() }, [engine, forceRerender])

    // ────── Global Keyboard Shortcuts (Ctrl+Z / Ctrl+Y) ──────
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Let the browser handle standard text undo if the user is actively typing in a box
      if (editingCell || document.activeElement.tagName === 'INPUT') return;

      // Check for Ctrl (Windows) or Cmd (Mac)
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo(); // Ctrl+Shift+Z
          } else {
            handleUndo(); // Ctrl+Z
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          handleRedo(); // Ctrl+Y
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [editingCell, handleUndo, handleRedo]);

  // ────── Formatting toggles ──────

  const toggleBold = useCallback(() => {
    if (!selectedCell) return
    const style = getCellStyle(selectedCell.r, selectedCell.c)
    updateCellStyle(selectedCell.r, selectedCell.c, { bold: !style.bold })
  }, [selectedCell, getCellStyle, updateCellStyle])

  const toggleItalic = useCallback(() => {
    if (!selectedCell) return
    const style = getCellStyle(selectedCell.r, selectedCell.c)
    updateCellStyle(selectedCell.r, selectedCell.c, { italic: !style.italic })
  }, [selectedCell, getCellStyle, updateCellStyle])

  const toggleUnderline = useCallback(() => {
    if (!selectedCell) return
    const style = getCellStyle(selectedCell.r, selectedCell.c)
    updateCellStyle(selectedCell.r, selectedCell.c, { underline: !style.underline })
  }, [selectedCell, getCellStyle, updateCellStyle])

  const changeFontSize = useCallback((size) => {
    if (!selectedCell) return
    updateCellStyle(selectedCell.r, selectedCell.c, { fontSize: size })
  }, [selectedCell, updateCellStyle])

  const changeAlignment = useCallback((align) => {
    if (!selectedCell) return
    updateCellStyle(selectedCell.r, selectedCell.c, { align })
  }, [selectedCell, updateCellStyle])

  const changeFontColor = useCallback((color) => {
    if (!selectedCell) return
    updateCellStyle(selectedCell.r, selectedCell.c, { color })
  }, [selectedCell, updateCellStyle])

  const changeBackgroundColor = useCallback((color) => {
    if (!selectedCell) return
    updateCellStyle(selectedCell.r, selectedCell.c, { bg: color })
  }, [selectedCell, updateCellStyle])

  // ────── Clear operations ──────

  const clearSelectedCell = useCallback(() => {
    if (!selectedCell) return
    engine.setCell(selectedCell.r, selectedCell.c, '')
    forceRerender()
    // Remove style entry for cleared cell
    // Note: This deletes the style object entirely - if you need to preserve default styles,
    // you may want to set them explicitly rather than deleting
    const key = `${selectedCell.r},${selectedCell.c}`
    setCellStyles(prev => { const next = { ...prev }; delete next[key]; return next })
    setEditValue('')
  }, [selectedCell, engine, forceRerender])

  const clearAllCells = useCallback(() => {
    for (let r = 0; r < engine.rows; r++) {
      for (let c = 0; c < engine.cols; c++) {
        engine.setCell(r, c, '')
      }
    }
    forceRerender()
    setCellStyles({})
    setSelectedCell(null)
    setEditingCell(null)
    setEditValue('')
  }, [engine, forceRerender])

  // ────── Row / Column operations ──────

  const insertRow = useCallback(() => {
    if (!selectedCell) return
    engine.insertRow(selectedCell.r)
    forceRerender()

    setRowOrder(
    Array.from({ length: engine.rows }, (_, i) => i)
  )

    setSelectedCell({ r: selectedCell.r + 1, c: selectedCell.c })
  }, [selectedCell, engine, forceRerender])

  const deleteRow = useCallback(() => {
    if (!selectedCell) return
    engine.deleteRow(selectedCell.r)
    forceRerender()
    setRowOrder(
    Array.from({ length: engine.rows }, (_, i) => i)
  )
    if (selectedCell.r >= engine.rows) {
      setSelectedCell({ r: engine.rows - 1, c: selectedCell.c })
    }
  }, [selectedCell, engine, forceRerender])

  const insertColumn = useCallback(() => {
    if (!selectedCell) return
    engine.insertColumn(selectedCell.c)
  forceRerender()
  setSelectedCell({
    r: selectedCell.r,
    c: selectedCell.c + 1
  })
}, [selectedCell, engine, forceRerender])

  const deleteColumn = useCallback(() => {
    if (!selectedCell) return
    engine.deleteColumn(selectedCell.c)
    forceRerender()
    setRowOrder(
    Array.from({ length: engine.rows }, (_, i) => i)
  )
    if (selectedCell.c >= engine.cols) {
      setSelectedCell({ r: selectedCell.r, c: engine.cols - 1 })
    }
  }, [selectedCell, engine, forceRerender])

  // ────── Derived state ──────

  const selectedCellStyle = useMemo(() => {
    return selectedCell ? getCellStyle(selectedCell.r, selectedCell.c) : null
  }, [selectedCell, getCellStyle])

  const getColumnLabel = useCallback((col) => {
    let label = ''
    let num = col + 1
    while (num > 0) {
      num--
      label = String.fromCharCode(65 + (num % 26)) + label
      num = Math.floor(num / 26)
    }
    return label
  }, [])

  const selectedCellLabel = selectedCell
    ? `${getColumnLabel(selectedCell.c)}${selectedCell.r + 1}`
    : 'No cell'

  // Formula bar shows the raw formula text, not the computed value
  // When editing, show the current editValue; otherwise show the cell's raw content
  // Note: This is different from the cell display, which shows computed values
  const formulaBarValue = editingCell
    ? editValue
    : (selectedCell ? engine.getCell(selectedCell.r, selectedCell.c).raw : '')

    // local storage save

useEffect(() => {

  const timerId = setTimeout(() => {

    try {

      const stateToSave = {
        engineData: engine.exportData(),
        styles: cellStyles,
        rowOrder,
        filters
      };

      localStorage.setItem(
        'spreadsheet_app_data',
        JSON.stringify(stateToSave)
      );

    } catch (error) {

      console.error("Save failed", error);

      if (error.name === 'QuotaExceededError') {
        alert("Local storage full");
      }

    }

  }, 500);

  return () => clearTimeout(timerId);

}, [version, cellStyles, rowOrder, filters, engine]);

    // local strage load

useEffect(() => {

  try {

    const savedData =
      localStorage.getItem(
        'spreadsheet_app_data'
      );

    if (savedData) {

      const parsed =
        JSON.parse(savedData);

      if (parsed.engineData) {

        engine.loadData(
          parsed.engineData
        );
      }
      if (parsed.styles) {
        setCellStyles(parsed.styles);
      }
      if (parsed.filters) {
        setFilters(parsed.filters);
      }
      if (parsed.rowOrder) {
        setRowOrder(parsed.rowOrder);
      }
      forceRerender();
    }

  } catch (error) {

    console.error(
      "Failed to parse saved spreadsheet data",
      error
    );

    localStorage.removeItem(
      'spreadsheet_app_data'
    );
  }
}, [engine, forceRerender])

  // ────── Render ──────

  return (
    <div className="app-wrapper">
      <div className="app-header">
        <h2 className="app-title">📊 Spreadsheet App</h2>
      </div>

      <div className="main-content">

        {/* ── Toolbar ── */}
        <div className="toolbar">
          <div className="toolbar-group">
            <button className={`toolbar-btn bold-btn ${selectedCellStyle?.bold ? 'active' : ''}`} onClick={toggleBold} title="Bold">B</button>
            <button className={`toolbar-btn italic-btn ${selectedCellStyle?.italic ? 'active' : ''}`} onClick={toggleItalic} title="Italic">I</button>
            <button className={`toolbar-btn underline-btn ${selectedCellStyle?.underline ? 'active' : ''}`} onClick={toggleUnderline} title="Underline">U</button>
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Size:</span>
            <select className="toolbar-select" value={selectedCellStyle?.fontSize || 13} onChange={(e) => changeFontSize(parseInt(e.target.value))}>
              {[8, 10, 11, 12, 13, 14, 16, 18, 20, 24].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="toolbar-group">
            <button className={`align-btn ${selectedCellStyle?.align === 'left' ? 'active' : ''}`} onClick={() => changeAlignment('left')} title="Align Left">⬤←</button>
            <button className={`align-btn ${selectedCellStyle?.align === 'center' ? 'active' : ''}`} onClick={() => changeAlignment('center')} title="Align Center">⬤</button>
            <button className={`align-btn ${selectedCellStyle?.align === 'right' ? 'active' : ''}`} onClick={() => changeAlignment('right')} title="Align Right">⬤→</button>
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Text:</span>
            <input
              type="color"
              value={selectedCellStyle?.color || '#000000'}
              onChange={(e) => changeFontColor(e.target.value)}
              title="Font color"
              style={{ width: '32px', height: '32px', border: '1px solid #dadce0', cursor: 'pointer', borderRadius: '4px' }}
            />
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Fill:</span>
            <select className="toolbar-select" value={selectedCellStyle?.bg || 'white'} onChange={(e) => changeBackgroundColor(e.target.value)}>
              <option value="white">White</option>
              <option value="#ffff99">Yellow</option>
              <option value="#99ffcc">Green</option>
              <option value="#ffcccc">Red</option>
              <option value="#cce5ff">Blue</option>
              <option value="#e0ccff">Purple</option>
              <option value="#ffd9b3">Orange</option>
              <option value="#f0f0f0">Gray</option>
            </select>
          </div>

          <div className="toolbar-group">
            <button className="toolbar-btn" onClick={handleUndo} disabled={!engine.canUndo()} title="Undo">↶ Undo</button>
            <button className="toolbar-btn" onClick={handleRedo} disabled={!engine.canRedo()} title="Redo">↷ Redo</button>
          </div>

          <div className="toolbar-group">
            <button className="toolbar-btn" onClick={insertRow} title="Insert Row">+ Row</button>
            <button className="toolbar-btn" onClick={deleteRow} title="Delete Row">- Row</button>
            <button className="toolbar-btn" onClick={insertColumn} title="Insert Column">+ Col</button>
            <button className="toolbar-btn" onClick={deleteColumn} title="Delete Column">- Col</button>
          </div>

          <div className="toolbar-group">
            <button className="toolbar-btn danger" onClick={clearSelectedCell}>✕ Cell</button>
            <button className="toolbar-btn danger" onClick={clearAllCells}>✕ All</button>
          </div>
        </div>

        {/* ── Formula Bar ── */}
        <div className="formula-bar">
          <span className="formula-bar-label">{selectedCellLabel}</span>
          <input
            className="formula-bar-input"
            value={formulaBarValue}
            onChange={(e) => handleFormulaBarChange(e.target.value)}
            onKeyDown={handleFormulaBarKeyDown}
            onFocus={handleFormulaBarFocus}
            placeholder="Select a cell then type, or enter a formula like =SUM(A1:A5)"
          />
        </div>

        {/* ── Grid ── */}
        <div className="grid-scroll">
          <table className="grid-table">
            <thead>
              <tr>
                <th className="col-header-blank"></th>
                {Array.from({ length: engine.cols }, (_, colIndex) => (
  <th 
    key={colIndex} 
    className="col-header"
    style={{ cursor: 'pointer', userSelect: 'none', position: 'relative' }}
    onClick={() => toggleSort(colIndex)}
    title="Click to sort"
  >
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
      {getColumnLabel(colIndex)}
      
      {/* Sort Indicator */}
      {sortState.col === colIndex && sortState.direction && (
        <span style={{ fontSize: '10px' }}>
          {sortState.direction === 'asc' ? '▲' : '▼'}
        </span>
      )}

      {/* Filter Button */}
      <span 
        onClick={(e) => {
          e.stopPropagation(); // Prevents the sorting click from triggering
          setActiveFilterMenu(activeFilterMenu === colIndex ? null : colIndex);
        }}
        style={{ 
          fontSize: '12px', 
          marginLeft: 'auto',
          padding: '2px 4px',
          borderRadius: '3px',
          background: filters[colIndex]?.length > 0 ? '#d3e3fd' : 'transparent' // Highlight if active
        }}
        title="Filter"
      >
        ▼
      </span>
    </div>

    {/* Filter Dropdown Menu */}
    {activeFilterMenu === colIndex && (
      <div 
        className="filter-menu" 
        style={{ 
          position: 'absolute', top: '100%', left: 0, 
          background: 'white', border: '1px solid #ccc', 
          zIndex: 100, padding: '8px', maxHeight: '200px', 
          overflowY: 'auto', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          fontWeight: 'normal', color: '#333'
        }} 
        onClick={e => e.stopPropagation()} // Keep menu open when clicking inside
      >
        <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>Filter Values:</div>
        {getUniqueValues(colIndex).map(val => (
          <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '4px', textAlign: 'left', whiteSpace: 'nowrap', fontSize: '12px', cursor: 'pointer', marginBottom: '4px' }}>
            <input 
              type="checkbox" 
              checked={!(filters[colIndex] || []).includes(val)}
              onChange={() => toggleFilterValue(colIndex, val)}
            />
            {val === "" ? "(Blanks)" : val}
          </label>
        ))}
      </div>
    )}
  </th>
))}
              </tr>
            </thead>
            <tbody>
              {rowOrder
  .filter(rowIndex => {

    for (const colIndexStr in filters) {

      const colIndex = parseInt(colIndexStr)

      const hiddenValues = filters[colIndex]

      if (hiddenValues && hiddenValues.length > 0) {

        const cellVal = String(
          engine.getCell(rowIndex, colIndex).computed ??
          engine.getCell(rowIndex, colIndex).raw
        )

        if (hiddenValues.includes(cellVal)) {
          return false
        }

      }

    }

    return true

  })
  .map(rowIndex => (
                <tr key={rowIndex}>
                  <td className="row-header">{rowIndex + 1}</td>
                  {Array.from({ length: engine.cols }, (_, colIndex) => {
                    const isSelected = selectedCell?.r === rowIndex && selectedCell?.c === colIndex
                    const isEditing = editingCell?.r === rowIndex && editingCell?.c === colIndex
                    const cellData = engine.getCell(rowIndex, colIndex)
                    const style = cellStyles[`${rowIndex},${colIndex}`] || {}
                    const displayValue = cellData.error
                      ? cellData.error
                      : (cellData.computed !== null && cellData.computed !== '' ? String(cellData.computed) : cellData.raw)

                    return (
                      <td
                        key={colIndex}
                        className={`cell ${isSelected ? 'selected' : ''}`}
                        style={{ background: style.bg || 'white' }}
                        onMouseDown={(e) => { e.preventDefault(); handleCellClick(rowIndex, colIndex) }}
                      >
                        {isEditing ? (
                          <input
                            autoFocus
                            className="cell-input"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => commitEdit(rowIndex, colIndex)}
                            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                            ref={isSelected ? cellInputRef : undefined}
                            style={{
                              fontWeight: style.bold ? 'bold' : 'normal',
                              fontStyle: style.italic ? 'italic' : 'normal',
                              textDecoration: style.underline ? 'underline' : 'none',
                              color: style.color || '#202124',
                              fontSize: (style.fontSize || 13) + 'px',
                              textAlign: style.align || 'left',
                              background: style.bg || 'white',
                            }}
                          />
                        ) : (
                          <div
                            className={`cell-display align-${style.align || 'left'} ${cellData.error ? 'error' : ''}`}
                            style={{
                              fontWeight: style.bold ? 'bold' : 'normal',
                              fontStyle: style.italic ? 'italic' : 'normal',
                              textDecoration: style.underline ? 'underline' : 'none',
                              color: cellData.error ? '#d93025' : (style.color || '#202124'),
                              fontSize: (style.fontSize || 13) + 'px',
                            }}
                          >
                            {displayValue}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="footer-hint">
          Click a cell to edit · Enter/Tab/Arrow keys to navigate · Formulas: =A1+B1 · =SUM(A1:A5) · =AVG(A1:A5) · =MAX(A1:A5) · =MIN(A1:A5)
        </p>
      </div>
    </div>
  )
}
