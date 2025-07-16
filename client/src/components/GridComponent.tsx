import { useState, useEffect } from 'react';
import { generateUniversalCardHeader, generateUniversalComponentJSX, generateUniversalPrompt, UniversalPromptConfig, universalInputStyles } from '../utils/universalRenderer';

export interface GridComponentProps {
  gridSize: number; // Total number of cells (e.g., 100 for 10x10)
  columns: number; // Number of columns (e.g., 10 for 10x10)
  preShadedCells?: number[]; // Array of cell indices that should be pre-shaded
  mode: 'view-only' | 'clickable' | 'identify-percentage';
  correctAnswer?: string | number;
  promptText?: string;
  onAnswer: (answer: string | number) => void;
  selectedCells?: number[]; // For externally controlled selection
  onCellsChange?: (cells: number[]) => void;
  resetTrigger?: number; // When this changes, reset the component state
  standardCode?: string; // For universal system integration
  lessonTitle?: string; // For universal system integration
}

function GridComponent({
  gridSize,
  columns,
  preShadedCells = [],
  mode,
  correctAnswer,
  promptText,
  onAnswer,
  selectedCells,
  onCellsChange,
  resetTrigger,
  standardCode,
  lessonTitle
}: GridComponentProps) {
  const [internalSelectedCells, setInternalSelectedCells] = useState<number[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCells, setDragStartCells] = useState<number[]>([]);
  const [dragStartTime, setDragStartTime] = useState<number>(0);
  const [dragStartCell, setDragStartCell] = useState<number | null>(null);

  // Reset component state when resetTrigger changes
  useEffect(() => {
    if (resetTrigger !== undefined) {
      setUserAnswer('');
      setInternalSelectedCells([]);
      setIsDragging(false);
      setDragStartCells([]);
      setDragStartTime(0);
      setDragStartCell(null);
    }
  }, [resetTrigger]);

  // Use external selection if provided, otherwise use internal state
  const currentSelectedCells = selectedCells || internalSelectedCells;
  const setCurrentSelectedCells = onCellsChange || setInternalSelectedCells;

  const rows = Math.ceil(gridSize / columns);

  const handleCellClick = (cellIndex: number) => {
    if (mode === 'view-only') return;

    if (mode === 'clickable') {
      // Only handle clicks if this wasn't a drag operation
      if (!isDragging) {
        // For single clicks, check if the cell was already shaded BEFORE mouseDown
        const wasAlreadyShaded = dragStartCells.includes(cellIndex);
        
        if (wasAlreadyShaded) {
          // If it was already shaded before mouseDown, remove it (single click to unshade)
          const newSelection = currentSelectedCells.filter(i => i !== cellIndex);
          setCurrentSelectedCells(newSelection);
        }
        // If it wasn't shaded before mouseDown, mouseDown already added it, so leave it shaded
        
        // Clear dragStartCells after processing the click
        setDragStartCells([]);
      }
    }
  };

  const handleMouseDown = (cellIndex: number) => {
    if (mode === 'view-only') return;

    if (mode === 'clickable') {
      setDragStartTime(Date.now());
      setDragStartCells([...currentSelectedCells]); // Remember starting state
      setDragStartCell(cellIndex); // Remember which cell was clicked first
      
      // Only shade the first cell if it's not already shaded
      // This allows single clicks on shaded cells to remove them
      if (!currentSelectedCells.includes(cellIndex)) {
        const newSelection = [...currentSelectedCells, cellIndex];
        setCurrentSelectedCells(newSelection);
      }
    }
  };

  const handleMouseEnter = (cellIndex: number) => {
    if (mode === 'view-only') return;

    if (mode === 'clickable') {
      // Check if mouse is being held down (drag operation)
      const currentTime = Date.now();
      const timeSinceMouseDown = currentTime - dragStartTime;
      
      // If mouse has been down for more than 100ms, consider it a drag
      if (dragStartTime > 0 && timeSinceMouseDown > 100) {
        setIsDragging(true);
        
        // During drag: only add cells, never remove them (one-way drag)
        if (!currentSelectedCells.includes(cellIndex)) {
          const newSelection = [...currentSelectedCells, cellIndex];
          setCurrentSelectedCells(newSelection);
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (mode === 'clickable') {
      setIsDragging(false);
      // Don't clear dragStartCells here - let the click handler use it first
      setDragStartTime(0);
      setDragStartCell(null);
    }
  };

  // Add global mouse up listener to handle cases where mouse is released outside the grid
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragStartCells([]);
      setDragStartTime(0);
      setDragStartCell(null);
    };

    if (isDragging || dragStartTime > 0) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging, dragStartTime]);

  const handleSubmit = () => {
    if (mode === 'identify-percentage') {
      // User enters percentage they see
      if (userAnswer.trim()) {
        onAnswer(userAnswer.trim());
      }
    } else if (mode === 'clickable') {
      // User has selected cells, calculate percentage
      const percentage = (currentSelectedCells.length / gridSize) * 100;
      
      // For non-whole percentages, we'll send the closest whole number
      // The answer checking logic will handle the tolerance
      const roundedPercentage = Math.round(percentage);
      onAnswer(roundedPercentage.toString());
    }
  };

  // Universal configuration for this component
  const universalConfig: UniversalPromptConfig = {
    type: 'grid-percentage',
    standardCode: standardCode || '6.NS.1.a',
    lessonTitle: lessonTitle || 'Grid Model Practice',
    context: { preShadedCells: preShadedCells.length, gridSize, mode }
  };

  const headerConfig = generateUniversalCardHeader(universalConfig);
  const universalPrompt = generateUniversalPrompt(universalConfig);

  const getCellClass = (cellIndex: number) => {
    const isPreShaded = preShadedCells.includes(cellIndex);
    const isSelected = currentSelectedCells.includes(cellIndex);
    const isClickable = mode === 'clickable';

    return `
      grid-cell
      ${isPreShaded ? 'grid-cell-pre-shaded' : ''}
      ${isSelected ? 'grid-cell-selected' : ''}
      ${!isPreShaded && !isSelected ? 'grid-cell-empty' : ''}
      ${isClickable ? 'grid-cell-clickable' : ''}
    `.trim();
  };

  const renderGrid = () => {
    return (
      <div 
        className="grid-container"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`
        }}
      >
        {Array.from({ length: gridSize }, (_, i) => (
          <div
            key={i}
            className={getCellClass(i)}
            onClick={() => handleCellClick(i)}
            onMouseDown={() => handleMouseDown(i)}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseUp={handleMouseUp}
            style={{ 
              userSelect: 'none', // Prevent text selection during drag
              cursor: mode === 'clickable' ? 'pointer' : 'default'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="text-center mb-4">
      {/* Universal header */}
      <div className="bg-gray-600 p-4 rounded-lg border-2 border-gray-400 mb-4">
        <div className="text-lg text-white mb-4 font-semibold">
          {promptText || universalPrompt}
        </div>
        
        {/* Grid visualization */}
        <div className="grid-wrapper">
          {renderGrid()}
        </div>
        
        {/* Grid status for clickable mode */}
        {mode === 'clickable' && (
          <div className="text-sm text-white mt-2 font-medium">
            {currentSelectedCells.length} out of {gridSize} cells selected
            ({Math.round((currentSelectedCells.length / gridSize) * 100)}%)
          </div>
        )}
      </div>
      
      {/* Universal input and submit section */}
      {mode === 'identify-percentage' && (
        <div className="flex items-center justify-center space-x-2">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter percentage (e.g., 20%)"
            className="w-32 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          <button 
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Submit
          </button>
        </div>
      )}
      
      {/* Submit button for clickable mode */}
      {mode === 'clickable' && (
        <div className="flex items-center justify-center">
          <button 
            onClick={handleSubmit}
            disabled={currentSelectedCells.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export default GridComponent;