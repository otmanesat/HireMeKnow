# Task: CV Management System Implementation

## Overview
Implement a comprehensive CV management system that handles CV uploads, parsing, standardization, and smart analysis with scoring capabilities.

## Task Details

### Prerequisites
- AWS S3 for file storage
- Document parsing libraries
- ML models for CV analysis
- Text processing capabilities

### Development Steps

1. File Upload Service
```typescript
// src/services/upload/FileUploadService.ts
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

export class FileUploadService {
  private s3: S3;
  
  constructor() {
    this.s3 = new S3({
      region: process.env.AWS_REGION,
    });
  }

  async uploadCV(file: Buffer, fileName: string): Promise<string> {
    const fileId = uuidv4();
    const key = `cvs/${fileId}/${fileName}`;
    
    await this.s3.putObject({
      Bucket: process.env.CV_BUCKET_NAME!,
      Key: key,
      Body: file,
      ContentType: this.getContentType(fileName),
      Metadata: {
        originalName: fileName,
        uploadDate: new Date().toISOString(),
      },
    }).promise();

    return key;
  }

  private getContentType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }[extension!] || 'application/octet-stream';
  }
}
```

2. CV Parser Implementation
```typescript
// src/services/parser/CVParser.ts
import { TextractClient, AnalyzeDocumentCommand } from '@aws-sdk/client-textract';

export class CVParser {
  private textract: TextractClient;

  constructor() {
    this.textract = new TextractClient({ region: process.env.AWS_REGION });
  }

  async parseCV(s3Key: string): Promise<ParsedCV> {
    const command = new AnalyzeDocumentCommand({
      Document: {
        S3Object: {
          Bucket: process.env.CV_BUCKET_NAME,
          Name: s3Key,
        },
      },
      FeatureTypes: ['FORMS', 'TABLES', 'QUERIES'],
    });

    const response = await this.textract.send(command);
    return this.processTextractResponse(response);
  }

  private processTextractResponse(response: any): ParsedCV {
    return {
      personalInfo: this.extractPersonalInfo(response),
      education: this.extractEducation(response),
      experience: this.extractExperience(response),
      skills: this.extractSkills(response),
    };
  }
}
```

3. CV Analysis Service
```typescript
// src/services/analysis/CVAnalysisService.ts
import { ComprehendClient, DetectEntitiesCommand } from '@aws-sdk/client-comprehend';

export class CVAnalysisService {
  private comprehend: ComprehendClient;

  constructor() {
    this.comprehend = new ComprehendClient({ region: process.env.AWS_REGION });
  }

  async analyzeCV(parsedCV: ParsedCV): Promise<CVAnalysis> {
    const skills = await this.analyzeSkills(parsedCV.skills);
    const experience = await this.analyzeExperience(parsedCV.experience);
    
    return {
      skillsScore: this.calculateSkillsScore(skills),
      experienceScore: this.calculateExperienceScore(experience),
      overallScore: this.calculateOverallScore(skills, experience),
      recommendations: this.generateRecommendations(skills, experience),
    };
  }

  private async analyzeSkills(skills: string[]): Promise<AnalyzedSkills> {
    const command = new DetectEntitiesCommand({
      Text: skills.join(' '),
      LanguageCode: 'en',
    });
    
    const response = await this.comprehend.send(command);
    return this.processSkillsEntities(response.Entities || []);
  }
}
```

4. CV Storage and Indexing
```typescript
// src/services/storage/CVStorageService.ts
import { DynamoDB } from 'aws-sdk';
import { OpenSearchClient } from '@opensearch-project/opensearch';

export class CVStorageService {
  private dynamodb: DynamoDB.DocumentClient;
  private searchClient: OpenSearchClient;

  constructor() {
    this.dynamodb = new DynamoDB.DocumentClient();
    this.searchClient = new OpenSearchClient({
      node: process.env.OPENSEARCH_ENDPOINT,
    });
  }

  async storeCV(userId: string, cvData: CVData): Promise<void> {
    // Store in DynamoDB
    await this.dynamodb.put({
      TableName: process.env.CV_TABLE_NAME!,
      Item: {
        userId,
        cvId: cvData.id,
        s3Key: cvData.s3Key,
        parsedData: cvData.parsedData,
        analysis: cvData.analysis,
        createdAt: new Date().toISOString(),
      },
    }).promise();

    // Index in OpenSearch
    await this.searchClient.index({
      index: 'cvs',
      id: cvData.id,
      body: {
        userId,
        skills: cvData.parsedData.skills,
        experience: cvData.parsedData.experience,
        education: cvData.parsedData.education,
        score: cvData.analysis.overallScore,
      },
    });
  }
}
```

## Validation Steps

### 1. File Upload Testing
```typescript
// src/__tests__/services/FileUploadService.test.ts
describe('FileUploadService', () => {
  it('should upload CV successfully', async () => {
    const service = new FileUploadService();
    const testFile = Buffer.from('test content');
    
    const key = await service.uploadCV(testFile, 'test-cv.pdf');
    expect(key).toMatch(/^cvs\/[\w-]+\/test-cv\.pdf$/);
  });

  it('should handle large files', async () => {
    const service = new FileUploadService();
    const largeFile = Buffer.alloc(10 * 1024 * 1024); // 10MB
    
    await expect(service.uploadCV(largeFile, 'large-cv.pdf'))
      .resolves.not.toThrow();
  });
});
```

### 2. Parser Validation
```typescript
// src/__tests__/services/CVParser.test.ts
describe('CVParser', () => {
  it('should extract personal information correctly', async () => {
    const parser = new CVParser();
    const result = await parser.parseCV('test-cv-key');
    
    expect(result.personalInfo).toHaveProperty('name');
    expect(result.personalInfo).toHaveProperty('email');
    expect(result.personalInfo).toHaveProperty('phone');
  });

  it('should handle multiple document formats', async () => {
    const parser = new CVParser();
    const formats = ['pdf', 'docx'];
    
    for (const format of formats) {
      const result = await parser.parseCV(`test-cv.${format}`);
      expect(result).toBeDefined();
    }
  });
});
```

### 3. Analysis Testing
```typescript
// src/__tests__/services/CVAnalysisService.test.ts
describe('CVAnalysisService', () => {
  it('should calculate accurate skill scores', async () => {
    const service = new CVAnalysisService();
    const analysis = await service.analyzeCV(mockParsedCV);
    
    expect(analysis.skillsScore).toBeGreaterThanOrEqual(0);
    expect(analysis.skillsScore).toBeLessThanOrEqual(100);
  });

  it('should provide relevant recommendations', async () => {
    const service = new CVAnalysisService();
    const analysis = await service.analyzeCV(mockParsedCV);
    
    expect(analysis.recommendations).toBeInstanceOf(Array);
    expect(analysis.recommendations.length).toBeGreaterThan(0);
  });
});
```

## Architecture Guidelines

### Data Models
```typescript
// src/types/cv.ts
interface CVData {
  id: string;
  userId: string;
  s3Key: string;
  parsedData: ParsedCV;
  analysis: CVAnalysis;
  metadata: {
    fileName: string;
    fileSize: number;
    uploadDate: string;
    lastModified: string;
  };
}

interface ParsedCV {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  education: Education[];
  experience: Experience[];
  skills: string[];
}
```

### Security Measures
```typescript
// src/services/security/CVSecurityService.ts
export class CVSecurityService {
  async sanitizeCV(cvData: Buffer): Promise<Buffer> {
    // Remove potential malware
    const cleanedData = await this.scanForMalware(cvData);
    
    // Remove sensitive information
    return this.removeSensitiveData(cleanedData);
  }

  private async scanForMalware(data: Buffer): Promise<Buffer> {
    const clamav = new ClamAV();
    const scanResult = await clamav.scan(data);
    
    if (scanResult.isInfected) {
      throw new Error('Malware detected in CV');
    }
    
    return data;
  }
}
```

## Documentation Requirements

1. API Documentation
```yaml
# swagger/cv-management.yml
paths:
  /cv/upload:
    post:
      summary: Upload a new CV
      consumes:
        - multipart/form-data
      parameters:
        - in: formData
          name: file
          type: file
          required: true
      responses:
        201:
          description: CV uploaded successfully
          schema:
            $ref: '#/definitions/CVUploadResponse'
```

2. Integration Guide
```markdown
# CV Management Integration Guide

## Upload Process
1. File Validation
2. Virus Scanning
3. Upload to S3
4. Parse and Analyze
5. Store Results

## Analysis Features
- Skill Extraction
- Experience Validation
- Education Verification
- Score Calculation
```

## Dependencies
- AWS SDK
- AWS Textract
- AWS Comprehend
- OpenSearch
- ClamAV
- PDF.js
- Mammoth.js

## Task Completion Checklist
- [ ] File upload service implemented
- [ ] CV parser developed
- [ ] Analysis service created
- [ ] Storage solution configured
- [ ] Security measures implemented
- [ ] Tests written and passing
- [ ] Documentation completed
- [ ] Performance optimization done
- [ ] Error handling added
- [ ] Team review conducted