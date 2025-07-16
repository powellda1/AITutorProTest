import React, { useState, useEffect } from 'react';


interface OrderingComponentProps {
  numbersToOrder: string[];
  correctOrder: string[];
  promptText: string;
  onAnswer: (answer: string[]) => void;
}

export default function OrderingComponent({
  numbersToOrder,
  correctOrder,
  promptText,
  onAnswer
}: OrderingComponentProps) {
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Initialize with shuffled order (not the correct order!)
  useEffect(() => {
    if (userOrder.length === 0) {
      const shuffled = [...numbersToOrder];
      // Simple shuffle to avoid showing correct order initially
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setUserOrder(shuffled);
    }
  }, [numbersToOrder]);
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const newOrder = [...userOrder];
    const draggedItem = newOrder[draggedIndex];
    
    // Remove dragged item
    newOrder.splice(draggedIndex, 1);
    
    // Insert at new position
    newOrder.splice(dropIndex, 0, draggedItem);
    
    setUserOrder(newOrder);
    setDraggedIndex(null);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  const handleSubmit = () => {
    onAnswer(userOrder);
  };
  
  return (
    <div className="interactive-card">
      <div className="space-y-4">
        <div className="interactive-card-header">Interactive Activity:</div>
        <div className="interactive-card-description">
          {promptText}
        </div>
        
        <div className="text-white text-lg">
          Drag the numbers to put them in order from least to greatest
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 my-6">
          {userOrder.map((number, index) => (
            <div
              key={`${number}-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                px-4 py-3 rounded-lg border-2 cursor-move font-bold text-lg
                transition-all duration-200 shadow-md hover:shadow-lg
                ${draggedIndex === index 
                  ? 'bg-blue-200 border-blue-400 opacity-50' 
                  : 'bg-white border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-black'
                }
              `}
            >
              {number}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 text-lg bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}