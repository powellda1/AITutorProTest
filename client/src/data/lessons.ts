// This will be replaced with your full curriculum JSON file
export let curriculumData: any = null;

// Function to load curriculum from JSON file
export function loadCurriculumData(jsonData: any) {
  curriculumData = jsonData;
}

// Fallback curriculum for development
export const fallbackCurriculumCategories = [
  {
    id: 1,
    title: "Number and Number Sense",
    expanded: true,
    lessons: [
      { id: 1, title: "Basic Addition" },
      { id: 2, title: "Basic Subtraction" },
      { id: 3, title: "Multiplication Tables" }
    ]
  },
  {
    id: 2,
    title: "Measurement and Geometry",
    expanded: false,
    lessons: []
  },
  {
    id: 3,
    title: "Probability and Statistics",
    expanded: false,
    lessons: []
  },
  {
    id: 4,
    title: "Patterns, Functions, and Algebra",
    expanded: false,
    lessons: []
  }
];

// Helper function to get curriculum categories
export function getCurriculumCategories() {
  return curriculumData || fallbackCurriculumCategories;
}
