import { 
  users, 
  lessons, 
  chatMessages, 
  aiResponses,
  standards,
  subStandards,
  subLessons,
  subjects,
  curriculumFrameworks,
  contentAreas,
  officialStandards,
  teachingStrategies,
  benchmarkActivities,
  commonMisconceptions,
  type User, 
  type InsertUser,
  type Lesson,
  type InsertLesson,
  type ChatMessage,
  type InsertChatMessage,
  type AiResponse,
  type InsertAiResponse,
  type Standard,
  type InsertStandard,
  type SubStandard,
  type InsertSubStandard,
  type SubLesson,
  type InsertSubLesson,
  type Subject,
  type InsertSubject,
  type CurriculumFramework,
  type InsertCurriculumFramework,
  type ContentArea,
  type InsertContentArea
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lesson methods (legacy)
  getLessons(): Promise<Lesson[]>;
  getLessonById(id: number): Promise<Lesson | undefined>;
  getLessonsByCategory(category: string): Promise<Lesson[]>;
  getLessonsByContentArea(contentAreaId: number): Promise<Lesson[]>;
  
  // New curriculum methods (Option A structure)
  getContentAreas(): Promise<ContentArea[]>;
  getStandardsByContentArea(contentAreaId: number): Promise<Standard[]>;
  getSubLessonsByStandard(standardId: number): Promise<SubLesson[]>;
  
  // Keep sub_standards methods for future subjects
  getSubStandardsByStandard(standardId: number): Promise<SubStandard[]>;
  getSubLessonsBySubStandard(subStandardId: number): Promise<SubLesson[]>;
  
  // Phase 2: Multi-subject foundation methods
  getSubjects(): Promise<Subject[]>;
  getSubjectByCode(code: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  getCurriculumFrameworks(): Promise<CurriculumFramework[]>;
  getFrameworkByCode(code: string): Promise<CurriculumFramework | undefined>;
  createCurriculumFramework(framework: InsertCurriculumFramework): Promise<CurriculumFramework>;
  getContentAreas(): Promise<ContentArea[]>;
  getContentAreasBySubject(subjectId: number): Promise<ContentArea[]>;
  createContentArea(contentArea: InsertContentArea): Promise<ContentArea>;
  
  // Chat methods
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(sessionId: string): Promise<void>;
  
  // AI Response methods
  getAiResponses(sessionId: string): Promise<AiResponse[]>;
  createAiResponse(response: InsertAiResponse): Promise<AiResponse>;
  
  // Curriculum methods
  loadCurriculumFromJson(curriculumData: any): Promise<void>;
  clearAllLessons(): Promise<void>;
  clearAllCurriculum(): Promise<void>;
  
  // Phase 2: Initialize default data
  initializeDefaultSubjects(): Promise<void>;
  
  // Phase 3: Generic curriculum loading
  loadGenericCurriculum(curriculumData: any, subjectCode: string, frameworkCode: string): Promise<void>;
  validateCurriculumStructure(curriculumData: any): { valid: boolean; errors: string[] };
  getCurriculumMetadata(curriculumData: any): { 
    subjectHint?: string; 
    frameworkHint?: string; 
    gradeLevel?: string; 
    hierarchyPattern?: string;
    contentAreas?: string[];
  };
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lessons: Map<number, Lesson>;
  private chatMessages: Map<number, ChatMessage>;
  private aiResponses: Map<number, AiResponse>;
  private currentUserId: number;
  private currentLessonId: number;
  private currentChatId: number;
  private currentAiId: number;

  constructor() {
    this.users = new Map();
    this.lessons = new Map();
    this.chatMessages = new Map();
    this.aiResponses = new Map();
    this.currentUserId = 1;
    this.currentLessonId = 1;
    this.currentChatId = 1;
    this.currentAiId = 1;
    
    // Initialize with sample lessons
    this.initializeLessons();
  }

  private initializeLessons() {
    const sampleLessons: Omit<Lesson, 'id'>[] = [
      {
        title: "Basic Addition",
        description: "Learn the fundamentals of addition with interactive examples",
        content: {
          sections: [
            {
              title: "What is Addition?",
              content: "Addition is combining two or more numbers to get a total or sum."
            },
            {
              title: "Example Problem",
              content: "2 + 3 = 5",
              type: "math"
            }
          ]
        },
        category: "Number and Number Sense",
        order: 1
      },
      {
        title: "Basic Subtraction",
        description: "Master subtraction through step-by-step examples",
        content: {
          sections: [
            {
              title: "What is Subtraction?",
              content: "Subtraction is taking away one number from another."
            },
            {
              title: "Example Problem",
              content: "5 - 2 = 3",
              type: "math"
            }
          ]
        },
        category: "Number and Number Sense",
        order: 2
      },
      {
        title: "Multiplication Tables",
        description: "Learn multiplication through interactive tables and practice",
        content: {
          sections: [
            {
              title: "Understanding Multiplication",
              content: "Multiplication is repeated addition. 3 × 4 means adding 3 four times."
            },
            {
              title: "Example Problem",
              content: "3 × 4 = 12",
              type: "math"
            }
          ]
        },
        category: "Number and Number Sense",
        order: 3
      }
    ];

    sampleLessons.forEach(lesson => {
      const id = this.currentLessonId++;
      this.lessons.set(id, { ...lesson, id });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values()).sort((a, b) => a.order - b.order);
  }

  async getLessonById(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async getLessonsByCategory(category: string): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.category === category)
      .sort((a, b) => a.order - b.order);
  }

  async getLessonsByContentArea(contentAreaId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.contentAreaId === contentAreaId)
      .sort((a, b) => a.order - b.order);
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.currentLessonId++;
    const lesson: Lesson = { ...insertLesson, id };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      timestamp: new Date() 
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async clearChatMessages(sessionId: string): Promise<void> {
    for (const [id, message] of this.chatMessages.entries()) {
      if (message.sessionId === sessionId) {
        this.chatMessages.delete(id);
      }
    }
  }

  async getAiResponses(sessionId: string): Promise<AiResponse[]> {
    return Array.from(this.aiResponses.values())
      .filter(response => response.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createAiResponse(insertResponse: InsertAiResponse): Promise<AiResponse> {
    const id = this.currentAiId++;
    const response: AiResponse = { 
      ...insertResponse, 
      id, 
      timestamp: new Date() 
    };
    this.aiResponses.set(id, response);
    return response;
  }

  async loadCurriculumFromJson(curriculumData: any): Promise<void> {
    // Clear existing lessons first
    await this.clearAllLessons();
    
    // Load lessons from new strand-based curriculum structure
    if (curriculumData && curriculumData.strands && Array.isArray(curriculumData.strands)) {
      for (const strand of curriculumData.strands) {
        if (strand.standards && Array.isArray(strand.standards)) {
          for (const standard of strand.standards) {
            if (standard.sub_lessons && Array.isArray(standard.sub_lessons)) {
              for (const subLesson of standard.sub_lessons) {
                const lesson: Omit<Lesson, 'id'> = {
                  title: subLesson.title || 'Untitled Lesson',
                  description: subLesson.explanation || 'No description available',
                  content: { 
                    explanation: subLesson.explanation,
                    examples: subLesson.examples || []
                  },
                  category: strand.strand_name || 'Uncategorized',
                  order: 0,
                  
                  // New curriculum structure fields
                  strandCode: strand.strand_code,
                  strandName: strand.strand_name,
                  standard: standard.standard,
                  standardText: standard.standard_text,
                  code: subLesson.code,
                  explanation: subLesson.explanation,
                  examples: subLesson.examples || [],
                  
                  // Metadata
                  grade: curriculumData.grade,
                  subject: curriculumData.subject,
                  state: curriculumData.state,
                };
                
                const id = this.currentLessonId++;
                this.lessons.set(id, { ...lesson, id });
              }
            }
          }
        }
      }
    }
    // Fallback for old curriculum structure
    else if (curriculumData && Array.isArray(curriculumData)) {
      for (const category of curriculumData) {
        if (category.lessons && Array.isArray(category.lessons)) {
          for (const lessonData of category.lessons) {
            const lesson: Omit<Lesson, 'id'> = {
              title: lessonData.title || 'Untitled Lesson',
              description: lessonData.description || 'No description available',
              content: lessonData.content || { sections: [] },
              category: category.title || 'Uncategorized',
              order: lessonData.order || 0
            };
            
            const id = this.currentLessonId++;
            this.lessons.set(id, { ...lesson, id });
          }
        }
      }
    }
  }

  async clearAllLessons(): Promise<void> {
    this.lessons.clear();
    this.currentLessonId = 1;
  }

  async clearAllCurriculum(): Promise<void> {
    this.lessons.clear();
    this.currentLessonId = 1;
  }

  async getContentAreas(): Promise<ContentArea[]> {
    // Mock implementation - not used in memory storage
    return [];
  }

  async getStandardsByContentArea(contentAreaId: number): Promise<Standard[]> {
    // Mock implementation - not used in memory storage
    return [];
  }

  async getSubStandardsByStandard(standardId: number): Promise<SubStandard[]> {
    // Mock implementation - not used in memory storage
    return [];
  }

  async getSubLessonsBySubStandard(subStandardId: number): Promise<SubLesson[]> {
    // Mock implementation - not used in memory storage
    return [];
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons).orderBy(lessons.order);
  }

  async getLessonById(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson || undefined;
  }

  async getLessonsByCategory(category: string): Promise<Lesson[]> {
    return await db.select().from(lessons)
      .where(eq(lessons.category, category))
      .orderBy(lessons.order);
  }

  async getLessonsByContentArea(contentAreaId: number): Promise<Lesson[]> {
    try {
      console.log('🔍 Fetching lessons for content area ID:', contentAreaId);
      
      // Option A: Get lessons by joining through standards -> sub_lessons  
      const results = await db
        .select({
          id: subLessons.id,
          title: subLessons.title,
          description: subLessons.explanation,
          content: subLessons.examples,
          category: contentAreas.name,
          order: subLessons.order,
          strandCode: contentAreas.code,
          strandName: contentAreas.name,
          standard: standards.code,
          standardText: standards.description,
          subStandard: standards.code,
          subStandardText: standards.description,
          code: subLessons.code,
          explanation: subLessons.explanation,
          examples: subLessons.examples,
          grade: contentAreas.grade,
          contentAreaId: contentAreas.id,
        })
        .from(subLessons)
        .innerJoin(standards, eq(subLessons.standardId, standards.id))
        .innerJoin(contentAreas, eq(standards.contentAreaId, contentAreas.id))
        .where(eq(contentAreas.id, contentAreaId))
        .orderBy(standards.order, subLessons.order);

      console.log('✅ Found', results.length, 'lessons for content area ID:', contentAreaId);
      
      return results.map(row => ({
        ...row,
        subject: "Mathematics",
        state: "Virginia",
      }));
      
    } catch (error) {
      console.error('❌ Error in getLessonsByContentArea:', error);
      throw error;
    }
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const [lesson] = await db
      .insert(lessons)
      .values(insertLesson)
      .returning();
    return lesson;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.timestamp);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async clearChatMessages(sessionId: string): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.sessionId, sessionId));
  }

  async getAiResponses(sessionId: string): Promise<AiResponse[]> {
    return await db.select().from(aiResponses)
      .where(eq(aiResponses.sessionId, sessionId))
      .orderBy(aiResponses.timestamp);
  }

  async createAiResponse(insertResponse: InsertAiResponse): Promise<AiResponse> {
    const [response] = await db
      .insert(aiResponses)
      .values(insertResponse)
      .returning();
    return response;
  }

  async loadCurriculumFromJson(curriculumData: any): Promise<void> {
    // Clear existing curriculum first
    await this.clearAllCurriculum();
    
    // Check if it's new format (has strands array) or old format (object entries)
    const strandsArray = curriculumData.strands || Object.entries(curriculumData).map(([code, data]) => ({
      strand_code: code,
      strand_name: (data as any).description,
      standards: Object.entries((data as any).standards || {}).map(([stdCode, stdData]) => ({
        standard: stdCode,
        standard_text: (stdData as any).description,
        sub_lessons: (stdData as any).sub_lessons || []
      }))
    }));
    
    // Process new format with strands array
    for (const strandData of strandsArray) {
      // Create strand
      const [createdStrand] = await db.insert(contentAreas).values({
        code: strandData.strand_code,
        name: strandData.strand_name,
        description: strandData.strand_name,
        grade: null,
        subject: null,
        state: null,
      }).returning();
      
      // Process standards
      for (const standardData of strandData.standards) {
        // Create standard
        const [createdStandard] = await db.insert(standards).values({
          code: standardData.standard,
          description: standardData.standard_text || 'No description available',
          strandId: createdStrand.id,
        }).returning();
        
        // Create sub-standard (one per standard)
        const [createdSubStandard] = await db.insert(subStandards).values({
          code: standardData.standard,
          description: standardData.standard_text || 'No description available',
          examples: [],
          standardId: createdStandard.id,
        }).returning();
        
        // Process sub-standards as sub-lessons
        const originalStrandData = curriculumData[strandData.strand_code];
        const originalStandardData = originalStrandData?.standards?.[standardData.standard];
        const subStandardsData = originalStandardData?.sub_standards || {};
        let subLessonOrder = 0;
        
        
        for (const [subStandardCode, subStandardData] of Object.entries(subStandardsData)) {
          // Create sub-lesson
          await db.insert(subLessons).values({
            title: subStandardCode,
            code: subStandardCode,
            explanation: (subStandardData as any).description,
            examples: (subStandardData as any).examples || [],
            subStandardId: createdSubStandard.id,
            order: subLessonOrder++,
          });
          
          // Also create legacy lesson for curriculum tree
          await db.insert(lessons).values({
            title: subStandardCode,
            description: (subStandardData as any).description,
            content: (subStandardData as any).description,
            strandCode: strandData.strand_code,
            strandName: strandData.strand_name,
            standard: standardData.standard,
            standardText: standardData.standard_text,
            subStandard: subStandardCode,
            order: subLessonOrder - 1,
          });
        }
      }
    }
  }

  async clearAllLessons(): Promise<void> {
    await db.delete(lessons);
  }

  async clearAllCurriculum(): Promise<void> {
    await db.delete(subLessons);
    await db.delete(subStandards);
    await db.delete(standards);
    // Note: We don't delete content_areas as they are managed separately
  }

  async getContentAreas(): Promise<ContentArea[]> {
    return await db.select().from(contentAreas).where(eq(contentAreas.active, true));
  }

  async getStandardsByContentArea(contentAreaId: number): Promise<Standard[]> {
    return await db.select().from(standards).where(eq(standards.contentAreaId, contentAreaId));
  }

  async getSubStandardsByStandard(standardId: number): Promise<SubStandard[]> {
    return await db.select().from(subStandards).where(eq(subStandards.standardId, standardId));
  }

  async getSubLessonsBySubStandard(subStandardId: number): Promise<SubLesson[]> {
    return await db.select().from(subLessons).where(eq(subLessons.subStandardId, subStandardId)).orderBy(subLessons.order);
  }

  // Option A: Get sub-lessons directly by standard ID
  async getSubLessonsByStandard(standardId: number): Promise<SubLesson[]> {
    return await db.select().from(subLessons).where(eq(subLessons.standardId, standardId)).orderBy(subLessons.order);
  }

  // Phase 2: Multi-subject foundation methods
  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.active, true));
  }

  async getSubjectByCode(code: string): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.code, code));
    return subject || undefined;
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const [subject] = await db
      .insert(subjects)
      .values(insertSubject)
      .returning();
    return subject;
  }

  async getCurriculumFrameworks(): Promise<CurriculumFramework[]> {
    return await db.select().from(curriculumFrameworks).where(eq(curriculumFrameworks.active, true));
  }

  async getFrameworkByCode(code: string): Promise<CurriculumFramework | undefined> {
    const [framework] = await db.select().from(curriculumFrameworks).where(eq(curriculumFrameworks.code, code));
    return framework || undefined;
  }

  async createCurriculumFramework(insertFramework: InsertCurriculumFramework): Promise<CurriculumFramework> {
    const [framework] = await db
      .insert(curriculumFrameworks)
      .values(insertFramework)
      .returning();
    return framework;
  }

  async getContentAreas(): Promise<ContentArea[]> {
    return await db.select().from(contentAreas).where(eq(contentAreas.active, true));
  }

  async getContentAreasBySubject(subjectId: number): Promise<ContentArea[]> {
    return await db.select().from(contentAreas)
      .where(eq(contentAreas.subjectId, subjectId))
      .where(eq(contentAreas.active, true));
  }

  async createContentArea(insertContentArea: InsertContentArea): Promise<ContentArea> {
    const [contentArea] = await db
      .insert(contentAreas)
      .values(insertContentArea)
      .returning();
    return contentArea;
  }

  async initializeDefaultSubjects(): Promise<void> {
    // Check if subjects already exist
    const existingSubjects = await this.getSubjects();
    if (existingSubjects.length > 0) {
      return; // Already initialized
    }

    // Create default subjects
    const mathSubject = await this.createSubject({
      name: "Mathematics",
      code: "MATH",
      description: "Grade 6 Mathematics curriculum with number sense, computation, and problem solving",
      active: true
    });

    // Create default Virginia DOE framework
    const vaFramework = await this.createCurriculumFramework({
      name: "Virginia Department of Education",
      code: "VA_DOE",
      description: "Virginia's 2023 Mathematics Standards of Learning",
      state: "Virginia",
      active: true
    });

    // Create default content areas for existing math curriculum
    await this.createContentArea({
      name: "Number and Number Sense",
      code: "6.NS",
      description: "Fractions, decimals, percents, and integers",
      grade: "6",
      subjectId: mathSubject.id,
      frameworkId: vaFramework.id,
      metadata: {
        hierarchyPattern: "strand -> standard -> subStandard -> subLesson",
        interactiveTypes: ["grid", "conversion", "comparison", "ordering"]
      },
      active: true
    });

    await this.createContentArea({
      name: "Computation and Estimation",
      code: "6.CE",
      description: "Operations with fractions and decimals",
      grade: "6",
      subjectId: mathSubject.id,
      frameworkId: vaFramework.id,
      metadata: {
        hierarchyPattern: "strand -> standard -> subStandard -> subLesson",
        interactiveTypes: ["computation", "estimation"]
      },
      active: true
    });

    await this.createContentArea({
      name: "Measurement and Geometry",
      code: "6.MG",
      description: "Area, perimeter, and geometric relationships",
      grade: "6",
      subjectId: mathSubject.id,
      frameworkId: vaFramework.id,
      metadata: {
        hierarchyPattern: "strand -> standard -> subStandard -> subLesson",
        interactiveTypes: ["measurement", "geometry"]
      },
      active: true
    });

    await this.createContentArea({
      name: "Probability and Statistics",
      code: "6.PS",
      description: "Data analysis and probability concepts",
      grade: "6",
      subjectId: mathSubject.id,
      frameworkId: vaFramework.id,
      metadata: {
        hierarchyPattern: "strand -> standard -> subStandard -> subLesson",
        interactiveTypes: ["data", "probability"]
      },
      active: true
    });

    await this.createContentArea({
      name: "Patterns, Functions, and Algebra",
      code: "6.PFA",
      description: "Algebraic thinking and pattern recognition",
      grade: "6",
      subjectId: mathSubject.id,
      frameworkId: vaFramework.id,
      metadata: {
        hierarchyPattern: "strand -> standard -> subStandard -> subLesson",
        interactiveTypes: ["patterns", "functions", "algebra"]
      },
      active: true
    });

    console.log("✅ Phase 2: Default subjects and content areas initialized");
  }

  // Phase 3: Generic curriculum loading system
  async loadGenericCurriculum(curriculumData: any, subjectCode: string, frameworkCode: string): Promise<void> {
    console.log(`📚 Phase 3: Loading generic curriculum for ${subjectCode} with framework ${frameworkCode}`);
    
    // Validate curriculum structure
    const validation = this.validateCurriculumStructure(curriculumData);
    if (!validation.valid) {
      throw new Error(`Invalid curriculum structure: ${validation.errors.join(', ')}`);
    }

    // Get metadata hints
    const metadata = this.getCurriculumMetadata(curriculumData);
    console.log(`📋 Detected metadata:`, metadata);

    // Get or create subject and framework
    let subject = await this.getSubjectByCode(subjectCode);
    if (!subject) {
      subject = await this.createSubject({
        name: metadata.subjectHint || subjectCode,
        code: subjectCode,
        description: `${metadata.subjectHint || subjectCode} curriculum`,
        active: true
      });
    }

    let framework = await this.getFrameworkByCode(frameworkCode);
    if (!framework) {
      framework = await this.createCurriculumFramework({
        name: metadata.frameworkHint || frameworkCode,
        code: frameworkCode,
        description: `${metadata.frameworkHint || frameworkCode} curriculum framework`,
        state: null,
        active: true
      });
    }

    // Clear existing curriculum for this subject
    await this.clearAllCurriculum();

    // Process enhanced educational content if available
    if (curriculumData._educationalContent) {
      console.log(`📚 Processing enhanced educational content...`);
      await this.processEducationalContent(curriculumData._educationalContent, subject, framework, metadata);
    }

    // Process curriculum data based on detected structure
    if (this.hasStrandsStructure(curriculumData)) {
      await this.processStrandsStructure(curriculumData, subject, framework, metadata);
    } else if (this.hasDomainsStructure(curriculumData)) {
      await this.processDomainStructure(curriculumData, subject, framework, metadata);
    } else if (this.hasUnitsStructure(curriculumData)) {
      await this.processUnitsStructure(curriculumData, subject, framework, metadata);
    } else {
      // Fallback to flexible structure
      await this.processFlexibleStructure(curriculumData, subject, framework, metadata);
    }

    console.log(`✅ Phase 3: Generic curriculum loaded successfully for ${subjectCode}`);
  }

  validateCurriculumStructure(curriculumData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!curriculumData || typeof curriculumData !== 'object') {
      errors.push('Curriculum data must be an object');
      return { valid: false, errors };
    }

    // Check for required top-level structure
    const hasStrands = curriculumData.strands || Object.keys(curriculumData).some(key => 
      typeof curriculumData[key] === 'object' && curriculumData[key].standards
    );
    
    const hasDomains = curriculumData.domains || Object.keys(curriculumData).some(key =>
      typeof curriculumData[key] === 'object' && curriculumData[key].clusters
    );
    
    const hasUnits = curriculumData.units || Object.keys(curriculumData).some(key =>
      typeof curriculumData[key] === 'object' && curriculumData[key].lessons
    );

    const hasFlexibleStructure = Object.keys(curriculumData).length > 0;

    if (!hasStrands && !hasDomains && !hasUnits && !hasFlexibleStructure) {
      errors.push('No recognizable curriculum structure found (strands, domains, units, or flexible)');
    }

    return { valid: errors.length === 0, errors };
  }

  getCurriculumMetadata(curriculumData: any): { 
    subjectHint?: string; 
    frameworkHint?: string; 
    gradeLevel?: string; 
    hierarchyPattern?: string;
    contentAreas?: string[];
  } {
    const metadata: any = {};

    // Extract metadata from various possible locations
    if (curriculumData.metadata) {
      Object.assign(metadata, curriculumData.metadata);
    }

    // Detect subject from content keywords
    const contentString = JSON.stringify(curriculumData).toLowerCase();
    if (contentString.includes('math') || contentString.includes('number') || contentString.includes('algebra')) {
      metadata.subjectHint = 'Mathematics';
    } else if (contentString.includes('science') || contentString.includes('chemistry') || contentString.includes('biology')) {
      metadata.subjectHint = 'Science';
    } else if (contentString.includes('english') || contentString.includes('reading') || contentString.includes('writing')) {
      metadata.subjectHint = 'English Language Arts';
    } else if (contentString.includes('social') || contentString.includes('history') || contentString.includes('geography')) {
      metadata.subjectHint = 'Social Studies';
    }

    // Detect framework from keywords
    if (contentString.includes('virginia') || contentString.includes('va doe')) {
      metadata.frameworkHint = 'Virginia Department of Education';
    } else if (contentString.includes('common core') || contentString.includes('ccss')) {
      metadata.frameworkHint = 'Common Core State Standards';
    } else if (contentString.includes('next generation') || contentString.includes('ngss')) {
      metadata.frameworkHint = 'Next Generation Science Standards';
    }

    // Detect grade level
    const gradeMatch = contentString.match(/grade\s*(\d+|k|kindergarten)/i);
    if (gradeMatch) {
      metadata.gradeLevel = gradeMatch[1].toLowerCase() === 'k' ? 'K' : gradeMatch[1];
    }

    // Detect hierarchy pattern
    if (this.hasStrandsStructure(curriculumData)) {
      metadata.hierarchyPattern = 'strand -> standard -> subStandard -> subLesson';
    } else if (this.hasDomainsStructure(curriculumData)) {
      metadata.hierarchyPattern = 'domain -> cluster -> standard -> lesson';
    } else if (this.hasUnitsStructure(curriculumData)) {
      metadata.hierarchyPattern = 'unit -> topic -> objective -> activity';
    } else {
      metadata.hierarchyPattern = 'flexible -> adaptive -> content -> item';
    }

    // Extract content areas
    if (curriculumData.strands) {
      metadata.contentAreas = Object.keys(curriculumData.strands);
    } else if (curriculumData.domains) {
      metadata.contentAreas = Object.keys(curriculumData.domains);
    } else if (curriculumData.units) {
      metadata.contentAreas = Object.keys(curriculumData.units);
    } else {
      metadata.contentAreas = Object.keys(curriculumData).slice(0, 10); // Limit to first 10 keys
    }

    return metadata;
  }

  private hasStrandsStructure(data: any): boolean {
    return data.strands || Object.keys(data).some(key => 
      typeof data[key] === 'object' && data[key].standards
    );
  }

  private hasDomainsStructure(data: any): boolean {
    return data.domains || Object.keys(data).some(key =>
      typeof data[key] === 'object' && data[key].clusters
    );
  }

  private hasUnitsStructure(data: any): boolean {
    return data.units || Object.keys(data).some(key =>
      typeof data[key] === 'object' && data[key].lessons
    );
  }

  private async processStrandsStructure(curriculumData: any, subject: Subject, framework: CurriculumFramework, metadata: any): Promise<void> {
    const strandsData = curriculumData.strands || curriculumData;
    
    for (const [strandCode, strandInfo] of Object.entries(strandsData)) {
      const strandData = strandInfo as any;
      
      // Create strand
      const [createdStrand] = await db.insert(contentAreas).values({
        code: strandCode,
        name: strandData.name || strandData.description || strandCode,
        description: strandData.description || strandData.name || `${strandCode} content area`,
        grade: metadata.gradeLevel || null,
        subject: subject.code,
        state: framework.state,
      }).returning();

      // Process standards
      const standardsData = strandData.standards || {};
      for (const [standardCode, standardInfo] of Object.entries(standardsData)) {
        const standardData = standardInfo as any;
        
        // Create standard
        const [createdStandard] = await db.insert(standards).values({
          code: standardCode,
          description: standardData.description || standardData.text || `${standardCode} standard`,
          contentAreaId: createdStrand.id,
        }).returning();

        // Create sub-standards and sub-lessons
        const subLessonsData = standardData.sub_lessons || standardData.lessons || [];
        if (subLessonsData.length > 0) {
          // Create sub-standard
          const [createdSubStandard] = await db.insert(subStandards).values({
            code: standardCode,
            description: standardData.description || standardData.text || `${standardCode} activities`,
            examples: [],
            standardId: createdStandard.id,
          }).returning();

          // Create sub-lessons
          for (const [index, subLessonData] of subLessonsData.entries()) {
            await db.insert(subLessons).values({
              title: subLessonData.title || `${standardCode} Activity ${index + 1}`,
              code: subLessonData.code || `${standardCode}.${index + 1}`,
              explanation: subLessonData.explanation || subLessonData.description || 'No explanation provided',
              examples: subLessonData.examples || [],
              standardId: createdStandard.id,
              order: index,
            });
          }
        }
      }
    }
  }

  private async processDomainStructure(curriculumData: any, subject: Subject, framework: CurriculumFramework, metadata: any): Promise<void> {
    const domainsData = curriculumData.domains || curriculumData;
    
    for (const [domainCode, domainInfo] of Object.entries(domainsData)) {
      const domainData = domainInfo as any;
      
      // Create strand (using domain as strand)
      const [createdStrand] = await db.insert(contentAreas).values({
        code: domainCode,
        name: domainData.name || domainData.description || domainCode,
        description: domainData.description || `${domainCode} domain`,
        grade: metadata.gradeLevel || null,
        subject: subject.code,
        state: framework.state,
      }).returning();

      // Process clusters (as standards)
      const clustersData = domainData.clusters || {};
      for (const [clusterCode, clusterInfo] of Object.entries(clustersData)) {
        const clusterData = clusterInfo as any;
        
        // Create standard
        const [createdStandard] = await db.insert(standards).values({
          code: clusterCode,
          description: clusterData.description || `${clusterCode} cluster`,
          contentAreaId: createdStrand.id,
        }).returning();

        // Process standards/lessons
        const lessonsData = clusterData.standards || clusterData.lessons || [];
        if (lessonsData.length > 0) {
          // Create sub-standard
          const [createdSubStandard] = await db.insert(subStandards).values({
            code: clusterCode,
            description: clusterData.description || `${clusterCode} activities`,
            examples: [],
            standardId: createdStandard.id,
          }).returning();

          // Create sub-lessons
          for (const [index, lessonData] of lessonsData.entries()) {
            await db.insert(subLessons).values({
              title: lessonData.title || lessonData.name || `${clusterCode} Lesson ${index + 1}`,
              code: lessonData.code || `${clusterCode}.${index + 1}`,
              explanation: lessonData.explanation || lessonData.description || 'No explanation provided',
              examples: lessonData.examples || [],
              standardId: createdStandard.id,
              order: index,
            });
          }
        }
      }
    }
  }

  private async processUnitsStructure(curriculumData: any, subject: Subject, framework: CurriculumFramework, metadata: any): Promise<void> {
    const unitsData = curriculumData.units || curriculumData;
    
    for (const [unitCode, unitInfo] of Object.entries(unitsData)) {
      const unitData = unitInfo as any;
      
      // Create strand (using unit as strand)
      const [createdStrand] = await db.insert(contentAreas).values({
        code: unitCode,
        name: unitData.name || unitData.title || unitCode,
        description: unitData.description || `${unitCode} unit`,
        grade: metadata.gradeLevel || null,
        subject: subject.code,
        state: framework.state,
      }).returning();

      // Process topics (as standards)
      const topicsData = unitData.topics || unitData.lessons || {};
      for (const [topicCode, topicInfo] of Object.entries(topicsData)) {
        const topicData = topicInfo as any;
        
        // Create standard
        const [createdStandard] = await db.insert(standards).values({
          code: topicCode,
          description: topicData.description || topicData.name || `${topicCode} topic`,
          contentAreaId: createdStrand.id,
        }).returning();

        // Process lessons/activities
        const activitiesData = topicData.activities || topicData.lessons || [];
        if (activitiesData.length > 0) {
          // Create sub-standard
          const [createdSubStandard] = await db.insert(subStandards).values({
            code: topicCode,
            description: topicData.description || `${topicCode} activities`,
            examples: [],
            standardId: createdStandard.id,
          }).returning();

          // Create sub-lessons
          for (const [index, activityData] of activitiesData.entries()) {
            await db.insert(subLessons).values({
              title: activityData.title || activityData.name || `${topicCode} Activity ${index + 1}`,
              code: activityData.code || `${topicCode}.${index + 1}`,
              explanation: activityData.explanation || activityData.description || 'No explanation provided',
              examples: activityData.examples || [],
              standardId: createdStandard.id,
              order: index,
            });
          }
        }
      }
    }
  }

  private async processFlexibleStructure(curriculumData: any, subject: Subject, framework: CurriculumFramework, metadata: any): Promise<void> {
    // Handle any flexible structure by treating top-level keys as strands
    for (const [key, value] of Object.entries(curriculumData)) {
      if (typeof value === 'object' && value !== null) {
        const sectionData = value as any;
        
        // Create strand
        const [createdStrand] = await db.insert(contentAreas).values({
          code: key,
          name: sectionData.name || sectionData.title || key,
          description: sectionData.description || `${key} section`,
          grade: metadata.gradeLevel || null,
          subject: subject.code,
          state: framework.state,
        }).returning();

        // Create a default standard
        const [createdStandard] = await db.insert(standards).values({
          code: key,
          description: sectionData.description || `${key} content`,
          contentAreaId: createdStrand.id,
        }).returning();

        // Create sub-standard
        const [createdSubStandard] = await db.insert(subStandards).values({
          code: key,
          description: sectionData.description || `${key} activities`,
          examples: [],
          standardId: createdStandard.id,
        }).returning();

        // Extract any array-like content as lessons
        const lessonsData = this.extractLessonsFromFlexible(sectionData);
        for (const [index, lessonData] of lessonsData.entries()) {
          await db.insert(subLessons).values({
            title: lessonData.title || lessonData.name || `${key} Item ${index + 1}`,
            code: lessonData.code || `${key}.${index + 1}`,
            explanation: lessonData.explanation || lessonData.description || lessonData.content || 'No explanation provided',
            examples: lessonData.examples || [],
            standardId: createdStandard.id,
            order: index,
          });
        }
      }
    }
  }

  private extractLessonsFromFlexible(data: any): any[] {
    const lessons: any[] = [];
    
    // Look for arrays that might contain lessons
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        lessons.push(...value.map((item, index) => ({
          title: item.title || item.name || `${key} ${index + 1}`,
          code: item.code || `${key}.${index + 1}`,
          explanation: item.explanation || item.description || item.content || JSON.stringify(item),
          examples: item.examples || [],
          ...item
        })));
      } else if (typeof value === 'object' && value !== null) {
        // Recursively extract from nested objects
        lessons.push(...this.extractLessonsFromFlexible(value));
      } else if (typeof value === 'string' && value.length > 10) {
        // Treat long strings as lesson content
        lessons.push({
          title: key,
          code: key,
          explanation: value,
          examples: []
        });
      }
    }
    
    return lessons;
  }

  // Process enhanced educational content
  private async processEducationalContent(educationalContent: any, subject: Subject, framework: CurriculumFramework, metadata: any): Promise<void> {
    console.log(`📚 Processing educational content with ${educationalContent.officialStandards?.length || 0} standards, ${educationalContent.teachingStrategies?.length || 0} strategies, ${educationalContent.benchmarkActivities?.length || 0} activities, ${educationalContent.commonMisconceptions?.length || 0} misconceptions`);
    
    // Process official standards
    if (educationalContent.officialStandards?.length > 0) {
      for (const standard of educationalContent.officialStandards) {
        try {
          await db.insert(officialStandards).values({
            code: standard.code,
            title: standard.title || standard.code,
            description: standard.description || '',
            understandingTheStandard: standard.understandingTheStandard || null,
            skillsInPractice: standard.skillsInPractice || [],
            conceptsAndConnections: standard.conceptsAndConnections || [],
            assessmentNotes: standard.assessmentNotes || null,
            grade: metadata.gradeLevel || subject.code.match(/\d+/)?.[0] || 'Unknown',
            subject: subject.name,
            state: framework.state || 'Generic'
          });
        } catch (error) {
          console.log(`⚠️  Error inserting official standard ${standard.code}:`, error);
        }
      }
      console.log(`✅ Inserted ${educationalContent.officialStandards.length} official standards`);
    }

    // Process teaching strategies
    if (educationalContent.teachingStrategies?.length > 0) {
      for (const strategy of educationalContent.teachingStrategies) {
        try {
          await db.insert(teachingStrategies).values({
            standardCode: strategy.standardCode || 'General',
            strategyType: strategy.strategyType || 'General Strategy',
            title: strategy.title || 'Teaching Strategy',
            description: strategy.description || '',
            instructions: strategy.instructions || null,
            materials: strategy.materials || [],
            misconceptions: strategy.misconceptions || [],
            guidingQuestions: strategy.guidingQuestions || [],
            officialStandardId: null // Will be linked later if needed
          });
        } catch (error) {
          console.log(`⚠️  Error inserting teaching strategy:`, error);
        }
      }
      console.log(`✅ Inserted ${educationalContent.teachingStrategies.length} teaching strategies`);
    }

    // Process benchmark activities
    if (educationalContent.benchmarkActivities?.length > 0) {
      for (const activity of educationalContent.benchmarkActivities) {
        try {
          await db.insert(benchmarkActivities).values({
            standardCode: activity.standardCode || 'General',
            activityType: activity.activityType || 'Learning Activity',
            title: activity.title || 'Benchmark Activity',
            description: activity.description || '',
            instructions: activity.instructions || [],
            benchmarks: activity.benchmarks || [],
            materials: activity.materials || [],
            variations: activity.variations || [],
            officialStandardId: null // Will be linked later if needed
          });
        } catch (error) {
          console.log(`⚠️  Error inserting benchmark activity:`, error);
        }
      }
      console.log(`✅ Inserted ${educationalContent.benchmarkActivities.length} benchmark activities`);
    }

    // Process common misconceptions
    if (educationalContent.commonMisconceptions?.length > 0) {
      for (const misconception of educationalContent.commonMisconceptions) {
        try {
          await db.insert(commonMisconceptions).values({
            standardCode: misconception.standardCode || 'General',
            misconceptionType: misconception.misconceptionType || 'General Misconception',
            description: misconception.description || '',
            incorrectAnswer: misconception.incorrectAnswer || null,
            correctAnswer: misconception.correctAnswer || null,
            explanation: misconception.explanation || '',
            teachingStrategy: misconception.teachingStrategy || null,
            officialStandardId: null // Will be linked later if needed
          });
        } catch (error) {
          console.log(`⚠️  Error inserting common misconception:`, error);
        }
      }
      console.log(`✅ Inserted ${educationalContent.commonMisconceptions.length} common misconceptions`);
    }

    console.log(`✅ Enhanced educational content processing completed`);
  }
}

export const storage = new DatabaseStorage();
