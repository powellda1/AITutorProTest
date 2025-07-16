import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getMathTutorResponse } from "./services/openai";
import { insertChatMessageSchema, insertAiResponseSchema, insertSubjectSchema, insertCurriculumFrameworkSchema, insertContentAreaSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
// import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'application/json',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JSON, PDF, and Word documents are allowed'));
      }
    }
  });

  // Upload curriculum JSON endpoint
  app.post("/api/curriculum/upload", upload.single('curriculum'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const curriculumData = JSON.parse(req.file.buffer.toString());
      await storage.loadCurriculumFromJson(curriculumData);
      
      res.json({ 
        message: "Curriculum loaded successfully",
        categoriesCount: curriculumData.length,
        lessonsCount: await storage.getLessons().then(lessons => lessons.length)
      });
    } catch (error) {
      console.error("Curriculum upload error:", error);
      res.status(500).json({ message: "Failed to upload curriculum: " + (error as Error).message });
    }
  });

  // Load curriculum from JSON data endpoint
  app.post("/api/curriculum/load", async (req, res) => {
    try {
      const curriculumData = req.body;
      await storage.loadCurriculumFromJson(curriculumData);
      
      const allLessons = await storage.getLessons();
      const strandCount = Object.keys(curriculumData).length;
      
      res.json({ 
        message: "Curriculum loaded successfully",
        categoriesCount: strandCount,
        lessonsCount: allLessons.length
      });
    } catch (error) {
      console.error("Curriculum load error:", error);
      res.status(500).json({ message: "Failed to load curriculum: " + (error as Error).message });
    }
  });

  // Get all lessons
  app.get("/api/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessons();
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  // New curriculum routes
  app.get("/api/strands", async (req, res) => {
    try {
      const contentAreas = await storage.getContentAreas();
      res.json(contentAreas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch strands" });
    }
  });

  app.get("/api/standards/:contentAreaId", async (req, res) => {
    try {
      const contentAreaId = parseInt(req.params.contentAreaId);
      const standards = await storage.getStandardsByContentArea(contentAreaId);
      res.json(standards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch standards" });
    }
  });

  app.get("/api/sub-standards/:standardId", async (req, res) => {
    try {
      const standardId = parseInt(req.params.standardId);
      const subStandards = await storage.getSubStandardsByStandard(standardId);
      res.json(subStandards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sub-standards" });
    }
  });

  app.get("/api/sub-lessons/:subStandardId", async (req, res) => {
    try {
      const subStandardId = parseInt(req.params.subStandardId);
      const subLessons = await storage.getSubLessonsBySubStandard(subStandardId);
      res.json(subLessons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sub-lessons" });
    }
  });

  // Direct content area to lessons endpoint (simplified structure)
  app.get("/api/lessons/content-area/:contentAreaId", async (req, res) => {
    try {
      const contentAreaId = parseInt(req.params.contentAreaId);
      const lessons = await storage.getLessonsByContentArea(contentAreaId);
      res.json(lessons);
    } catch (error) {
      console.error('❌ API Error fetching lessons by content area:', error);
      res.status(500).json({ message: "Failed to fetch lessons by content area" });
    }
  });

  // Get lessons by standard ID
  app.get("/api/lessons/standard/:standardId", async (req, res) => {
    try {
      const standardId = parseInt(req.params.standardId);
      console.log(`🔍 Fetching lessons for standard ID: ${standardId}`);
      const lessons = await storage.getSubLessonsByStandard(standardId);
      console.log(`✅ Found ${lessons.length} lessons for standard ID: ${standardId}`);
      res.json(lessons);
    } catch (error) {
      console.error('❌ API Error fetching lessons by standard:', error);
      res.status(500).json({ message: "Failed to fetch lessons by standard" });
    }
  });

  // Get lesson by ID
  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lesson = await storage.getLessonById(id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  // Get lessons by category
  app.get("/api/lessons/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const lessons = await storage.getLessonsByCategory(category);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lessons by category" });
    }
  });

  // Get chat messages for a session
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Send a chat message and get AI response
  app.post("/api/chat", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      
      // Save user message
      const userMessage = await storage.createChatMessage(messageData);
      
      // Get AI response using GPT-4-turbo for faster chatbot responses
      const aiResponse = await getMathTutorResponse(messageData.message, "gpt-4-turbo");
      
      // Save AI message
      const aiMessage = await storage.createChatMessage({
        message: aiResponse.response,
        sender: "ai",
        sessionId: messageData.sessionId
      });
      
      // Save AI response details
      const aiResponseRecord = await storage.createAiResponse({
        question: messageData.message,
        response: aiResponse.response,
        sessionId: messageData.sessionId
      });
      
      res.json({
        userMessage,
        aiMessage,
        aiResponse: aiResponseRecord,
        explanation: aiResponse.explanation,
        examples: aiResponse.examples
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Get AI responses for a session
  app.get("/api/ai-responses/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const responses = await storage.getAiResponses(sessionId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI responses" });
    }
  });

  // Clear chat messages for a session
  app.delete("/api/chat/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      await storage.clearChatMessages(sessionId);
      res.json({ message: "Chat messages cleared successfully" });
    } catch (error) {
      console.error("Clear chat error:", error);
      res.status(500).json({ message: "Failed to clear chat messages" });
    }
  });

  // Phase 2: Multi-subject foundation routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get("/api/subjects/:code", async (req, res) => {
    try {
      const code = req.params.code;
      const subject = await storage.getSubjectByCode(code);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subject" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const result = insertSubjectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const subject = await storage.createSubject(result.data);
      res.json(subject);
    } catch (error) {
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  app.get("/api/curriculum-frameworks", async (req, res) => {
    try {
      const frameworks = await storage.getCurriculumFrameworks();
      res.json(frameworks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch curriculum frameworks" });
    }
  });

  app.get("/api/curriculum-frameworks/:code", async (req, res) => {
    try {
      const code = req.params.code;
      const framework = await storage.getFrameworkByCode(code);
      if (!framework) {
        return res.status(404).json({ message: "Framework not found" });
      }
      res.json(framework);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch framework" });
    }
  });

  app.post("/api/curriculum-frameworks", async (req, res) => {
    try {
      const result = insertCurriculumFrameworkSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const framework = await storage.createCurriculumFramework(result.data);
      res.json(framework);
    } catch (error) {
      res.status(500).json({ message: "Failed to create curriculum framework" });
    }
  });

  app.get("/api/content-areas", async (req, res) => {
    try {
      const contentAreas = await storage.getContentAreas();
      res.json(contentAreas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content areas" });
    }
  });

  app.get("/api/content-areas/subject/:subjectId", async (req, res) => {
    try {
      const subjectId = parseInt(req.params.subjectId);
      if (isNaN(subjectId)) {
        return res.status(400).json({ message: "Invalid subject ID" });
      }
      const contentAreas = await storage.getContentAreasBySubject(subjectId);
      res.json(contentAreas);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content areas for subject" });
    }
  });

  app.post("/api/content-areas", async (req, res) => {
    try {
      const result = insertContentAreaSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const contentArea = await storage.createContentArea(result.data);
      res.json(contentArea);
    } catch (error) {
      res.status(500).json({ message: "Failed to create content area" });
    }
  });

  // Parse PDF files
  app.post("/api/curriculum/parse-pdf", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ message: "File must be a PDF" });
      }

      // Simple PDF text extraction approach
      const text = req.file.buffer.toString('latin1');
      
      // Basic parsing logic to extract curriculum structure from PDF text
      const parsedCurriculum = parsePDFToCurriculum(text);
      
      res.json(parsedCurriculum);
    } catch (error) {
      console.error("PDF parse error:", error);
      res.status(500).json({ 
        message: "Failed to parse PDF: " + (error as Error).message 
      });
    }
  });

  // Parse Word documents
  app.post("/api/curriculum/parse-word", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!req.file.mimetype.includes('word') && !req.file.mimetype.includes('document')) {
        return res.status(400).json({ message: "File must be a Word document" });
      }

      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      const text = result.value;
      
      // Basic parsing logic to extract curriculum structure from Word text
      const parsedCurriculum = parseWordToCurriculum(text);
      
      // Extract metadata from the parsed curriculum
      const metadata = storage.getCurriculumMetadata(parsedCurriculum);
      
      res.json({
        success: true,
        message: "Word document parsed successfully",
        curriculum: parsedCurriculum,
        metadata: metadata,
        educationalContent: parsedCurriculum._educationalContent || null
      });
    } catch (error) {
      console.error("Word parse error:", error);
      res.status(500).json({ 
        message: "Failed to parse Word document: " + (error as Error).message 
      });
    }
  });

  // Phase 3: Generic curriculum loading routes
  app.post("/api/curriculum/load-generic", async (req, res) => {
    try {
      const { curriculumData, subjectCode, frameworkCode } = req.body;
      
      if (!curriculumData || !subjectCode || !frameworkCode) {
        return res.status(400).json({ 
          message: "Missing required fields: curriculumData, subjectCode, frameworkCode" 
        });
      }
      
      await storage.loadGenericCurriculum(curriculumData, subjectCode, frameworkCode);
      
      const allLessons = await storage.getLessons();
      const allStrands = await storage.getStrands();
      
      res.json({ 
        message: "Generic curriculum loaded successfully",
        subjectCode,
        frameworkCode,
        strandsCount: allStrands.length,
        lessonsCount: allLessons.length
      });
    } catch (error) {
      console.error("Generic curriculum load error:", error);
      res.status(500).json({ 
        message: "Failed to load generic curriculum: " + (error as Error).message 
      });
    }
  });

  app.post("/api/curriculum/validate", async (req, res) => {
    try {
      const { curriculumData } = req.body;
      
      if (!curriculumData) {
        return res.status(400).json({ message: "Missing curriculumData" });
      }
      
      const validation = storage.validateCurriculumStructure(curriculumData);
      const metadata = storage.getCurriculumMetadata(curriculumData);
      
      res.json({ 
        validation,
        metadata,
        suggestions: {
          subjectCode: metadata.subjectHint?.toUpperCase().replace(/\s+/g, '_') || 'UNKNOWN',
          frameworkCode: metadata.frameworkHint?.toUpperCase().replace(/\s+/g, '_') || 'CUSTOM'
        }
      });
    } catch (error) {
      console.error("Curriculum validation error:", error);
      res.status(500).json({ 
        message: "Failed to validate curriculum: " + (error as Error).message 
      });
    }
  });

  app.get("/api/curriculum/metadata/:format", async (req, res) => {
    try {
      const format = req.params.format;
      
      const supportedFormats = {
        strands: {
          description: "Mathematics-style curriculum with strands containing standards and sub-lessons",
          example: {
            "6.NS": {
              "name": "Number and Number Sense",
              "description": "Grade 6 number concepts",
              "standards": {
                "6.NS.1": {
                  "description": "Represent and compare fractions, decimals, and percents",
                  "sub_lessons": [
                    {
                      "title": "Converting fractions to decimals",
                      "code": "6.NS.1.a",
                      "explanation": "Students learn to convert fractions to decimal form",
                      "examples": ["1/2 = 0.5", "3/4 = 0.75"]
                    }
                  ]
                }
              }
            }
          }
        },
        domains: {
          description: "Common Core-style curriculum with domains containing clusters and standards",
          example: {
            "NBT": {
              "name": "Number and Operations in Base Ten",
              "description": "Base ten number system",
              "clusters": {
                "NBT.A": {
                  "description": "Understand place value",
                  "standards": [
                    {
                      "title": "Read and write multi-digit numbers",
                      "code": "NBT.A.1",
                      "explanation": "Students read and write numbers in various forms",
                      "examples": ["12,345", "twelve thousand three hundred forty-five"]
                    }
                  ]
                }
              }
            }
          }
        },
        units: {
          description: "Unit-based curriculum with topics and activities",
          example: {
            "unit1": {
              "name": "Introduction to Algebra",
              "description": "Basic algebraic concepts",
              "topics": {
                "variables": {
                  "name": "Variables and Expressions",
                  "description": "Understanding variables",
                  "activities": [
                    {
                      "title": "Identifying variables",
                      "code": "U1.T1.A1",
                      "explanation": "Students identify variables in expressions",
                      "examples": ["In 2x + 3, x is the variable"]
                    }
                  ]
                }
              }
            }
          }
        },
        flexible: {
          description: "Any flexible structure - system will adapt automatically",
          example: {
            "topics": [
              {
                "title": "Basic Addition",
                "content": "Learning to add numbers",
                "examples": ["2 + 3 = 5", "10 + 15 = 25"]
              }
            ],
            "concepts": {
              "numbers": "Understanding number concepts",
              "operations": "Basic mathematical operations"
            }
          }
        }
      };
      
      if (format === 'all') {
        res.json(supportedFormats);
      } else if (supportedFormats[format as keyof typeof supportedFormats]) {
        res.json(supportedFormats[format as keyof typeof supportedFormats]);
      } else {
        res.status(404).json({ 
          message: "Format not found", 
          supportedFormats: Object.keys(supportedFormats) 
        });
      }
    } catch (error) {
      console.error("Metadata error:", error);
      res.status(500).json({ 
        message: "Failed to get curriculum metadata: " + (error as Error).message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to parse PDF text into curriculum structure
function parsePDFToCurriculum(text: string): any {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const curriculum: any = {};
  
  let currentSection = '';
  let currentSubsection = '';
  let currentContent: any[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect section headers (usually all caps or numbered)
    if (trimmed.match(/^[A-Z\s]+$/) && trimmed.length > 3 && trimmed.length < 50) {
      if (currentSection && currentContent.length > 0) {
        if (!curriculum[currentSection]) {
          curriculum[currentSection] = { name: currentSection, topics: {} };
        }
        if (currentSubsection) {
          curriculum[currentSection].topics[currentSubsection] = {
            name: currentSubsection,
            activities: currentContent
          };
        }
      }
      currentSection = trimmed;
      currentSubsection = '';
      currentContent = [];
    }
    // Detect subsection headers (often contain numbers or specific patterns)
    else if (trimmed.match(/^\d+\./) || trimmed.match(/^[A-Z]\.\s/)) {
      if (currentSubsection && currentContent.length > 0) {
        if (!curriculum[currentSection]) {
          curriculum[currentSection] = { name: currentSection, topics: {} };
        }
        curriculum[currentSection].topics[currentSubsection] = {
          name: currentSubsection,
          activities: currentContent
        };
      }
      currentSubsection = trimmed;
      currentContent = [];
    }
    // Collect content lines
    else if (trimmed.length > 10) {
      currentContent.push({
        title: trimmed.substring(0, 100), // Limit title length
        explanation: trimmed,
        examples: []
      });
    }
  }
  
  // Handle last section
  if (currentSection && currentContent.length > 0) {
    if (!curriculum[currentSection]) {
      curriculum[currentSection] = { name: currentSection, topics: {} };
    }
    if (currentSubsection) {
      curriculum[currentSection].topics[currentSubsection] = {
        name: currentSubsection,
        activities: currentContent
      };
    }
  }
  
  return curriculum;
}

// Helper function to parse Word document text into curriculum structure
function parseWordToCurriculum(text: string): any {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const curriculum: any = {};
  
  // Enhanced parsing to extract educational content
  let currentUnit = '';
  let currentTopic = '';
  let currentLessons: any[] = [];
  let currentStandard = '';
  let parsingContext = 'general'; // 'general', 'strategies', 'activities', 'misconceptions'
  
  // Storage for educational content
  const educationalContent = {
    officialStandards: [],
    teachingStrategies: [],
    benchmarkActivities: [],
    commonMisconceptions: []
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
    
    // Detect educational standards (e.g., "6.NS.1", "Standard 1.2")
    const standardMatch = trimmed.match(/^(\d+\.\w+\.\d+(?:\.\w+)?)|^(Standard\s+\d+\.\d+)/i);
    if (standardMatch) {
      currentStandard = standardMatch[0];
      
      // Extract standard information
      const standardInfo = {
        code: currentStandard,
        title: extractTitle(lines, i),
        description: extractDescription(lines, i),
        understandingTheStandard: extractSection(lines, i, ['understanding', 'overview', 'purpose']),
        skillsInPractice: extractBulletPoints(lines, i, ['skills', 'practice', 'students will']),
        conceptsAndConnections: extractSection(lines, i, ['concepts', 'connections', 'relates to']),
        assessmentNotes: extractSection(lines, i, ['assessment', 'evaluation', 'testing'])
      };
      
      educationalContent.officialStandards.push(standardInfo);
    }
    
    // Detect teaching strategies
    if (trimmed.match(/^(teaching|strategy|approach|method)/i) || 
        trimmed.match(/mathematical\s+(connections|reasoning|modeling)/i)) {
      parsingContext = 'strategies';
      
      const strategy = {
        standardCode: currentStandard,
        strategyType: extractStrategyType(trimmed),
        title: trimmed,
        description: extractDescription(lines, i),
        instructions: extractInstructions(lines, i),
        materials: extractMaterials(lines, i),
        misconceptions: extractMisconceptions(lines, i),
        guidingQuestions: extractQuestions(lines, i)
      };
      
      educationalContent.teachingStrategies.push(strategy);
    }
    
    // Detect benchmark activities
    if (trimmed.match(/^(activity|exercise|benchmark|assessment)/i) || 
        trimmed.match(/(human\s+number\s+line|card\s+game|hands-on)/i)) {
      parsingContext = 'activities';
      
      const activity = {
        standardCode: currentStandard,
        activityType: extractActivityType(trimmed),
        title: trimmed,
        description: extractDescription(lines, i),
        instructions: extractInstructions(lines, i),
        benchmarks: extractBenchmarks(lines, i),
        materials: extractMaterials(lines, i),
        variations: extractVariations(lines, i)
      };
      
      educationalContent.benchmarkActivities.push(activity);
    }
    
    // Detect common misconceptions
    if (trimmed.match(/^(misconception|common\s+error|mistake|incorrect)/i) || 
        trimmed.match(/students\s+(often|may|might).*think/i)) {
      parsingContext = 'misconceptions';
      
      const misconception = {
        standardCode: currentStandard,
        misconceptionType: extractMisconceptionType(trimmed),
        description: trimmed,
        incorrectAnswer: extractIncorrectAnswer(lines, i),
        correctAnswer: extractCorrectAnswer(lines, i),
        explanation: extractExplanation(lines, i),
        teachingStrategy: extractTeachingStrategy(lines, i)
      };
      
      educationalContent.commonMisconceptions.push(misconception);
    }
    
    // General curriculum structure parsing
    if (trimmed.match(/^(Unit|Chapter|Section|Grade)\s+\d+/i) || 
        (trimmed.match(/^[A-Z\s]+$/) && trimmed.length > 3 && trimmed.length < 80)) {
      if (currentUnit && currentLessons.length > 0) {
        if (!curriculum[currentUnit]) {
          curriculum[currentUnit] = { name: currentUnit, topics: {} };
        }
        if (currentTopic) {
          curriculum[currentUnit].topics[currentTopic] = {
            name: currentTopic,
            activities: currentLessons
          };
        }
      }
      currentUnit = trimmed;
      currentTopic = '';
      currentLessons = [];
      parsingContext = 'general';
    }
    else if (trimmed.match(/^(Topic|Lesson)\s+\d+/i) || 
             trimmed.match(/^\d+\.\d+/) ||
             trimmed.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+/)) {
      if (currentTopic && currentLessons.length > 0) {
        if (!curriculum[currentUnit]) {
          curriculum[currentUnit] = { name: currentUnit, topics: {} };
        }
        curriculum[currentUnit].topics[currentTopic] = {
          name: currentTopic,
          activities: currentLessons
        };
      }
      currentTopic = trimmed;
      currentLessons = [];
    }
    else if (trimmed.length > 15 && !trimmed.match(/^(page|P\.|pp\.)/i) && parsingContext === 'general') {
      // Extract examples from the content
      const examples = extractExamples(trimmed);
      
      currentLessons.push({
        title: trimmed.substring(0, 100),
        explanation: trimmed,
        examples: examples
      });
    }
  }
  
  // Handle last unit/topic
  if (currentUnit && currentLessons.length > 0) {
    if (!curriculum[currentUnit]) {
      curriculum[currentUnit] = { name: currentUnit, topics: {} };
    }
    if (currentTopic) {
      curriculum[currentUnit].topics[currentTopic] = {
        name: currentTopic,
        activities: currentLessons
      };
    }
  }
  
  // Add educational content to curriculum
  curriculum._educationalContent = educationalContent;
  
  return curriculum;
}

// Helper functions for content extraction
function extractTitle(lines: string[], startIndex: number): string {
  const nextLine = startIndex + 1 < lines.length ? lines[startIndex + 1].trim() : '';
  return nextLine.length > 0 && nextLine.length < 100 ? nextLine : '';
}

function extractDescription(lines: string[], startIndex: number): string {
  const descriptions: string[] = [];
  for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 20 && line.length < 500 && !line.match(/^(teaching|strategy|activity|misconception)/i)) {
      descriptions.push(line);
    }
  }
  return descriptions.join(' ').substring(0, 500);
}

function extractSection(lines: string[], startIndex: number, keywords: string[]): string {
  const content: string[] = [];
  for (let i = startIndex; i < Math.min(startIndex + 10, lines.length); i++) {
    const line = lines[i].trim().toLowerCase();
    if (keywords.some(keyword => line.includes(keyword))) {
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const contentLine = lines[j].trim();
        if (contentLine.length > 10) {
          content.push(contentLine);
        }
      }
      break;
    }
  }
  return content.join(' ').substring(0, 500);
}

function extractBulletPoints(lines: string[], startIndex: number, keywords: string[]): string[] {
  const bullets: string[] = [];
  let foundSection = false;
  
  for (let i = startIndex; i < Math.min(startIndex + 15, lines.length); i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();
    
    if (keywords.some(keyword => lowerLine.includes(keyword))) {
      foundSection = true;
      continue;
    }
    
    if (foundSection && (line.startsWith('•') || line.startsWith('-') || line.match(/^\d+\./))) {
      bullets.push(line.replace(/^[•\-\d\.]\s*/, '').trim());
    } else if (foundSection && line.length === 0) {
      break;
    }
  }
  
  return bullets;
}

function extractStrategyType(text: string): string {
  if (text.toLowerCase().includes('connection')) return 'Mathematical Connections';
  if (text.toLowerCase().includes('reasoning')) return 'Mathematical Reasoning';
  if (text.toLowerCase().includes('modeling')) return 'Mathematical Modeling';
  if (text.toLowerCase().includes('problem')) return 'Problem Solving';
  return 'General Strategy';
}

function extractActivityType(text: string): string {
  if (text.toLowerCase().includes('number line')) return 'Human Number Line';
  if (text.toLowerCase().includes('card')) return 'Card Game';
  if (text.toLowerCase().includes('hands-on')) return 'Hands-On Activity';
  if (text.toLowerCase().includes('benchmark')) return 'Benchmark Activity';
  return 'Learning Activity';
}

function extractMisconceptionType(text: string): string {
  if (text.toLowerCase().includes('decimal')) return 'Decimal Misconception';
  if (text.toLowerCase().includes('fraction')) return 'Fraction Misconception';
  if (text.toLowerCase().includes('percent')) return 'Percent Misconception';
  return 'General Misconception';
}

function extractInstructions(lines: string[], startIndex: number): string[] {
  const instructions: string[] = [];
  let foundInstructions = false;
  
  for (let i = startIndex + 1; i < Math.min(startIndex + 10, lines.length); i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('step') || lowerLine.includes('instruction') || lowerLine.includes('procedure')) {
      foundInstructions = true;
      continue;
    }
    
    if (foundInstructions && (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('•'))) {
      instructions.push(line.replace(/^[\d\.\s•\-]+/, '').trim());
    }
  }
  
  return instructions;
}

function extractMaterials(lines: string[], startIndex: number): string[] {
  const materials: string[] = [];
  let foundMaterials = false;
  
  for (let i = startIndex + 1; i < Math.min(startIndex + 8, lines.length); i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('material') || lowerLine.includes('supplies') || lowerLine.includes('needed')) {
      foundMaterials = true;
      continue;
    }
    
    if (foundMaterials && (line.startsWith('•') || line.startsWith('-') || line.includes('card') || line.includes('paper'))) {
      materials.push(line.replace(/^[•\-]\s*/, '').trim());
    }
  }
  
  return materials;
}

function extractMisconceptions(lines: string[], startIndex: number): string[] {
  const misconceptions: string[] = [];
  
  for (let i = startIndex + 1; i < Math.min(startIndex + 8, lines.length); i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().includes('misconception') || line.toLowerCase().includes('mistake')) {
      misconceptions.push(line);
    }
  }
  
  return misconceptions;
}

function extractQuestions(lines: string[], startIndex: number): string[] {
  const questions: string[] = [];
  
  for (let i = startIndex + 1; i < Math.min(startIndex + 8, lines.length); i++) {
    const line = lines[i].trim();
    if (line.endsWith('?') || line.toLowerCase().includes('question')) {
      questions.push(line);
    }
  }
  
  return questions;
}

function extractBenchmarks(lines: string[], startIndex: number): string[] {
  const benchmarks: string[] = [];
  
  for (let i = startIndex + 1; i < Math.min(startIndex + 8, lines.length); i++) {
    const line = lines[i].trim();
    if (line.includes('%') || line.includes('benchmark')) {
      const percentMatches = line.match(/\d+%/g);
      if (percentMatches) {
        benchmarks.push(...percentMatches);
      }
    }
  }
  
  return benchmarks.length > 0 ? benchmarks : ['0%', '25%', '50%', '75%', '100%'];
}

function extractVariations(lines: string[], startIndex: number): string[] {
  const variations: string[] = [];
  
  for (let i = startIndex + 1; i < Math.min(startIndex + 8, lines.length); i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().includes('variation') || line.toLowerCase().includes('alternative')) {
      variations.push(line);
    }
  }
  
  return variations;
}

function extractIncorrectAnswer(lines: string[], startIndex: number): string {
  for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().includes('incorrect') || line.toLowerCase().includes('wrong')) {
      return line;
    }
  }
  return '';
}

function extractCorrectAnswer(lines: string[], startIndex: number): string {
  for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().includes('correct') || line.toLowerCase().includes('right')) {
      return line;
    }
  }
  return '';
}

function extractExplanation(lines: string[], startIndex: number): string {
  const explanations: string[] = [];
  for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().includes('explain') || line.toLowerCase().includes('because')) {
      explanations.push(line);
    }
  }
  return explanations.join(' ').substring(0, 300);
}

function extractTeachingStrategy(lines: string[], startIndex: number): string {
  for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().includes('strategy') || line.toLowerCase().includes('approach')) {
      return line;
    }
  }
  return '';
}

function extractExamples(text: string): string[] {
  const examples: string[] = [];
  
  // Look for mathematical expressions, equations, and examples
  const mathPatterns = [
    /\d+\/\d+/g,          // Fractions: 1/2, 3/4
    /\d+\.\d+/g,          // Decimals: 0.5, 0.75
    /\d+%/g,              // Percentages: 50%, 75%
    /\d+\s*[+\-×÷]\s*\d+/g, // Basic operations
    /\$\d+(?:\.\d{2})?/g   // Money amounts
  ];
  
  mathPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      examples.push(...matches);
    }
  });
  
  // Look for explicit examples
  const exampleMatch = text.match(/(?:example|e\.g\.|for instance)[:\s]([^.]+)/gi);
  if (exampleMatch) {
    examples.push(...exampleMatch.map(match => match.replace(/(?:example|e\.g\.|for instance)[:\s]/gi, '').trim()));
  }
  
  return [...new Set(examples)]; // Remove duplicates
}
