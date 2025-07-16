import type { Lesson } from "@shared/schema";

export class TabLabelGenerator {
  /**
   * Generate a concise tab label from a lesson title and standard code
   * This is a temporary solution for prototyping - will be replaced with database storage
   */
  static generateLabel(lesson: Lesson, standardCode: string): string {
    const title = lesson.title.toLowerCase();
    
    // 6.NS.1.a specific patterns
    if (standardCode === '6.NS.1.a') {
      if (title.includes('percentage is illustrated')) {
        return 'Identify Percents';
      }
      if (title.includes('benchmark percents') && title.includes('strip')) {
        return 'Benchmark Percents';
      }
    }
    
    // 6.NS.1.b patterns
    if (standardCode === '6.NS.1.b') {
      if (title.includes('convert') && title.includes('decimal') && title.includes('percent')) {
        return 'Decimals ↔ Percents';
      }
      if (title.includes('number line')) {
        return 'Number Line Models';
      }
      if (title.includes('pictorial') || title.includes('model')) {
        return 'Pictorial Models';
      }
    }
    
    // 6.NS.1.c patterns
    if (standardCode === '6.NS.1.c') {
      if (title.includes('fraction') && title.includes('percent')) {
        return 'Fractions ↔ Percents';
      }
      if (title.includes('mixed number')) {
        return 'Mixed Numbers';
      }
      if (title.includes('model')) {
        return 'Model Conversions';
      }
    }
    
    // 6.NS.1.d patterns (all forms)
    if (standardCode === '6.NS.1.d') {
      if (title.includes('all') || title.includes('multiple')) {
        return 'All Conversions';
      }
      if (title.includes('equivalency') || title.includes('equivalent')) {
        return 'Multi-Form Equivalency';
      }
      return 'Complete Transformations';
    }
    
    // 6.NS.1.e patterns (compare/order)
    if (standardCode === '6.NS.1.e') {
      if (title.includes('compare')) {
        return 'Compare Numbers';
      }
      if (title.includes('order')) {
        return 'Order Rationals';
      }
      if (title.includes('justify')) {
        return 'Justify Solutions';
      }
    }
    
    // Fallback: Extract first 2-3 meaningful words
    const words = title.split(' ').filter(word => 
      word.length > 2 && 
      !['the', 'and', 'for', 'with', 'are', 'this', 'that'].includes(word)
    );
    
    return words.slice(0, 2).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  
  /**
   * Generate tooltip text (full lesson title)
   */
  static generateTooltip(lesson: Lesson): string {
    // Use universal renderer for consistent title display
    const config = {
      type: lesson.explanation?.includes('grid') ? 'grid-percentage' : 
            lesson.explanation?.includes('strip') ? 'strip-percentage' : 
            lesson.title.includes('Convert between percents and decimals') ? 'number-line' : 
            'word-problem',
      standardCode: lesson.code,
      lessonTitle: lesson.title,
      context: lesson
    };
    
    // Import generateUniversalPrompt dynamically to avoid circular dependency
    try {
      const { generateUniversalPrompt } = require('./universalRenderer');
      return generateUniversalPrompt(config).replace(/^(What percentage is illustrated\?|Identify the percentage shown in the grid|What percent is shown\?)\s*/, 'Grid Model Practice');
    } catch (error) {
      // Fallback to processed title if universal renderer fails
      return lesson.title.replace(/^(What percentage is illustrated\?|Identify the percentage shown in the grid|What percent is shown\?)\s*/, 'Grid Model Practice');
    }
  }
  
  /**
   * Check if this function should be replaced with database lookup
   * Returns true if lesson has a tab_label column (future database storage)
   */
  static shouldUseDatabase(lesson: any): boolean {
    return lesson.tab_label !== undefined;
  }
  
  /**
   * Main entry point - use database if available, otherwise generate on-the-fly
   */
  static getTabLabel(lesson: Lesson, standardCode: string): string {
    // Future database integration point
    if (this.shouldUseDatabase(lesson)) {
      return (lesson as any).tab_label;
    }
    
    // Current on-the-fly generation
    return this.generateLabel(lesson, standardCode);
  }
}