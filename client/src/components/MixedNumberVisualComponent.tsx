import React, { useState, useEffect } from 'react';
import { generateUniversalPrompt, UniversalPromptConfig } from '../utils/universalRenderer';

interface MixedNumberVisualComponentProps {
  originalFraction: string;
  correctAnswer: string;
  promptText: string;
  onAnswer: (answer: string) => void;
  standardCode?: string | null;
  lessonTitle?: string;
}

interface DragItem {
  id: number;
  isGrouped: boolean;
  groupId: number | null;
  x: number;
  y: number;
}

export default function MixedNumberVisualComponent({
  originalFraction,
  correctAnswer,
  promptText,
  onAnswer,
  standardCode,
  lessonTitle
}: MixedNumberVisualComponentProps) {
  const [userInput, setUserInput] = useState('');
  const [dragItems, setDragItems] = useState<DragItem[]>([]);
  const [groups, setGroups] = useState<{ [key: number]: DragItem[] }>({});
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [showGroupingArea, setShowGroupingArea] = useState(false);

  // Generate universal prompt
  const promptConfig: UniversalPromptConfig = {
    type: 'mixed-number-visual',
    standardCode: standardCode || '',
    lessonTitle: lessonTitle || ''
  };
  
  const universalPrompt = generateUniversalPrompt(promptConfig);

  // Parse mixed number or improper fraction
  const parseFraction = (fraction: string) => {
    // Check if it's a mixed number (e.g., "4 1/3")
    const mixedMatch = fraction.match(/(\d+) (\d+)\/(\d+)/);
    if (mixedMatch) {
      const whole = parseInt(mixedMatch[1]);
      const num = parseInt(mixedMatch[2]);
      const den = parseInt(mixedMatch[3]);
      // Convert to improper fraction for visualization
      const improperNumerator = (whole * den) + num;
      return {
        numerator: improperNumerator,
        denominator: den
      };
    }
    
    // Check if it's just an improper fraction (e.g., "11/4")
    const fractionMatch = fraction.match(/(\d+)\/(\d+)/);
    if (fractionMatch) {
      return {
        numerator: parseInt(fractionMatch[1]),
        denominator: parseInt(fractionMatch[2])
      };
    }
    
    return { numerator: 11, denominator: 4 }; // fallback
  };

  const { numerator, denominator } = parseFraction(originalFraction);

  // Initialize drag items
  useEffect(() => {
    const items: DragItem[] = [];
    for (let i = 0; i < numerator; i++) {
      items.push({
        id: i,
        isGrouped: false,
        groupId: null,
        x: 10 + (i % 6) * 50, // arrange in rows of 6 with tighter spacing
        y: 10 + Math.floor(i / 6) * 40 // smaller row spacing
      });
    }
    setDragItems(items);
    setShowGroupingArea(true);
  }, [numerator]);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, itemId: number) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drop in group area
  const handleDrop = (e: React.DragEvent, groupId: number) => {
    e.preventDefault();
    if (draggedItem === null) return;

    const currentGroup = groups[groupId] || [];
    if (currentGroup.length >= denominator) return; // group is full

    setDragItems(prev => 
      prev.map(item => 
        item.id === draggedItem 
          ? { ...item, isGrouped: true, groupId, x: 0, y: 0 }
          : item
      )
    );

    setGroups(prev => ({
      ...prev,
      [groupId]: [...currentGroup, dragItems.find(item => item.id === draggedItem)!]
    }));

    setDraggedItem(null);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Remove item from group
  const removeFromGroup = (itemId: number) => {
    const item = dragItems.find(i => i.id === itemId);
    if (!item || item.groupId === null) return;

    setDragItems(prev =>
      prev.map(i =>
        i.id === itemId
          ? { ...i, isGrouped: false, groupId: null, x: 50 + (i.id % 6) * 60, y: 50 + Math.floor(i.id / 6) * 60 }
          : i
      )
    );

    setGroups(prev => ({
      ...prev,
      [item.groupId!]: prev[item.groupId!].filter(i => i.id !== itemId)
    }));
  };

  // Calculate current grouping status
  const completeGroups = Object.values(groups).filter(group => group.length === denominator).length;
  const remainingItems = dragItems.filter(item => !item.isGrouped).length;

  const handleSubmit = () => {
    if (userInput.trim()) {
      onAnswer(userInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-600 to-gray-800 p-6 rounded-lg border border-gray-400/20 shadow-lg">
      {/* Universal prompt */}
      <div className="text-white text-2xl font-semibold mb-6 text-center">
        {universalPrompt}
      </div>
      
      {/* Fraction to convert */}
      <div className="text-white text-xl mb-4 text-center">
        Convert this improper fraction to a mixed number: <span className="font-bold text-yellow-300">{originalFraction}</span>
      </div>

      {/* Instructions */}
      <div className="text-white text-lg mb-4 text-center">
        Drag the circles into groups of <span className="font-bold text-blue-300">{denominator}</span> to see how many whole groups you can make:
      </div>

      {/* Visual area */}
      <div className="bg-gray-200 rounded-lg p-4 mb-6 min-h-[300px] relative">
        {/* Ungrouped items */}
        <div className="mb-4">
          <h3 className="text-gray-800 font-semibold mb-1">Items to group ({numerator} total):</h3>
          <div className="relative min-h-[80px]">
            {dragItems.filter(item => !item.isGrouped).map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                className="absolute w-8 h-8 bg-blue-500 rounded-full border-2 border-blue-700 cursor-move hover:bg-blue-600 flex items-center justify-center text-white text-sm font-bold"
                style={{ left: item.x, top: item.y }}
              >
                {item.id + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Group areas */}
        <div className="mt-4">
          <h3 className="text-gray-800 font-semibold mb-2">Group areas (groups of {denominator}):</h3>
          <div className="flex flex-wrap gap-4">
            {[0, 1, 2, 3, 4].map(groupId => (
              <div
                key={groupId}
                onDrop={(e) => handleDrop(e, groupId)}
                onDragOver={handleDragOver}
                className={`w-40 h-20 border-2 border-dashed rounded-lg p-2 ${
                  (groups[groupId] || []).length === denominator
                    ? 'border-green-500 bg-green-100'
                    : 'border-gray-400 bg-gray-50'
                }`}
              >
                <div className="text-gray-700 text-sm mb-1">Group {groupId + 1}</div>
                <div className="flex flex-wrap gap-1">
                  {(groups[groupId] || []).map(item => (
                    <div
                      key={item.id}
                      onClick={() => removeFromGroup(item.id)}
                      className="w-6 h-6 bg-blue-500 rounded-full border border-blue-700 cursor-pointer hover:bg-blue-600 flex items-center justify-center text-white text-xs"
                    >
                      {item.id + 1}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status display */}
      <div className="text-white text-lg mb-4 text-center">
        You have made <span className="font-bold text-green-300">{completeGroups}</span> complete groups of {denominator}, 
        with <span className="font-bold text-yellow-300">{remainingItems}</span> items remaining.
      </div>

      {/* Input field */}
      <div className="text-white text-lg mb-4 text-center">
        Enter your answer as a mixed number:
      </div>
      
      <div className="flex justify-center items-center space-x-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter mixed number"
          className="w-40 px-3 py-2 border border-gray-600 rounded text-white bg-[#35373b] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={!userInput.trim()}
        >
          Submit
        </button>
      </div>
    </div>
  );
}