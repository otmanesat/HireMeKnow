# Task: Job Matching System Implementation

## Overview
Implement an AI-powered job matching system that connects candidates with relevant job opportunities based on skills, experience, and preferences, including match percentage indicators and customized job alerts.

## Task Details

### Prerequisites
- Machine learning framework
- OpenSearch cluster
- Real-time processing capabilities
- Notification system

### Development Steps

1. Matching Engine Implementation
```typescript
// src/services/matching/MatchingEngine.ts
import { OpenSearchClient } from '@opensearch-project/opensearch';
import { SageMakerRuntime } from 'aws-sdk';

export class MatchingEngine {
  private searchClient: OpenSearchClient;
  private sagemakerClient: SageMakerRuntime;

  constructor() {
    this.searchClient = new OpenSearchClient({
      node: process.env.OPENSEARCH_ENDPOINT,
    });
    this.sagemakerClient = new SageMakerRuntime();
  }

  async findMatches(candidateProfile: CandidateProfile): Promise<JobMatch[]> {
    // Get candidate embeddings
    const embeddings = await this.generateEmbeddings(candidateProfile);
    
    // Search for matching jobs
    const response = await this.searchClient.search({
      index: 'jobs',
      body: {
        query: {
          script_score: {
            query: { match_all: {} },
            script: {
              source: "cosineSimilarity(params.embeddings, 'job_vector') + 1.0",
              params: { embeddings },
            },
          },
        },
      },
    });

    return this.processSearchResults(response.body.hits.hits);
  }

  private async generateEmbeddings(profile: CandidateProfile): Promise<number[]> {
    const response = await this.sagemakerClient.invokeEndpoint({
      EndpointName: process.env.EMBEDDING_ENDPOINT!,
      Body: JSON.stringify(profile),
    }).promise();

    return JSON.parse(response.Body!.toString()).embeddings;
  }
}
```

2. Scoring Service
```typescript
// src/services/scoring/ScoringService.ts
export class ScoringService {
  async calculateMatchScore(
    candidate: CandidateProfile,
    job: JobPosting
  ): Promise<MatchScore> {
    const skillsScore = this.calculateSkillsMatch(candidate.skills, job.requirements);
    const experienceScore = this.calculateExperienceMatch(candidate.experience, job.requirements);
    const locationScore = this.calculateLocationMatch(candidate.location, job.location);
    
    return {
      overall: this.calculateOverallScore([skillsScore, experienceScore, locationScore]),
      breakdown: {
        skills: skillsScore,
        experience: experienceScore,
        location: locationScore,
      },
      confidence: this.calculateConfidence([skillsScore, experienceScore, locationScore]),
    };
  }

  private calculateSkillsMatch(
    candidateSkills: Skill[],
    jobRequirements: JobRequirement[]
  ): number {
    const requiredSkills = jobRequirements.filter(r => r.required);
    const preferredSkills = jobRequirements.filter(r => !r.required);
    
    const requiredScore = this.matchRequiredSkills(candidateSkills, requiredSkills);
    const preferredScore = this.matchPreferredSkills(candidateSkills, preferredSkills);
    
    return (requiredScore * 0.7) + (preferredScore * 0.3);
  }
}
```

3. Job Alert System
```typescript
// src/services/alerts/JobAlertService.ts
import { SNS } from 'aws-sdk';

export class JobAlertService {
  private sns: SNS;
  private matchingEngine: MatchingEngine;

  constructor() {
    this.sns = new SNS();
    this.matchingEngine = new MatchingEngine();
  }

  async processNewJob(job: JobPosting): Promise<void> {
    // Find matching candidates
    const matches = await this.findMatchingCandidates(job);
    
    // Send alerts to matching candidates
    for (const match of matches) {
      if (match.score.overall >= 0.7) {
        await this.sendJobAlert(match.candidate, job, match.score);
      }
    }
  }

  private async sendJobAlert(
    candidate: CandidateProfile,
    job: JobPosting,
    score: MatchScore
  ): Promise<void> {
    const message = this.formatAlertMessage(candidate, job, score);
    
    await this.sns.publish({
      TopicArn: process.env.JOB_ALERTS_TOPIC!,
      Message: JSON.stringify(message),
      MessageAttributes: {
        userId: { DataType: 'String', StringValue: candidate.userId },
        matchScore: { DataType: 'Number', StringValue: score.overall.toString() },
      },
    }).promise();
  }
}
```

4. Recommendation Engine
```typescript
// src/services/recommendations/RecommendationEngine.ts
export class RecommendationEngine {
  async generateRecommendations(
    candidate: CandidateProfile,
    matches: JobMatch[]
  ): Promise<JobRecommendation[]> {
    const recommendations = matches.map(match => ({
      job: match.job,
      score: match.score,
      reasons: this.generateMatchReasons(candidate, match),
      skillGaps: this.identifySkillGaps(candidate.skills, match.job.requirements),
      nextSteps: this.suggestNextSteps(candidate, match),
    }));

    return this.prioritizeRecommendations(recommendations);
  }

  private generateMatchReasons(
    candidate: CandidateProfile,
    match: JobMatch
  ): MatchReason[] {
    return [
      this.analyzeSkillMatch(candidate.skills, match.job.requirements),
      this.analyzeExperienceMatch(candidate.experience, match.job.requirements),
      this.analyzeLocationMatch(candidate.location, match.job.location),
    ].filter(reason => reason.relevance >= 0.7);
  }
}
```

## Validation Steps

### 1. Matching Algorithm Testing
```typescript
// src/__tests__/services/MatchingEngine.test.ts
describe('MatchingEngine', () => {
  it('should find relevant matches', async () => {
    const engine = new MatchingEngine();
    const profile = mockCandidateProfile();
    
    const matches = await engine.findMatches(profile);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].score.overall).toBeGreaterThan(0.7);
  });

  it('should handle location preferences', async () => {
    const engine = new MatchingEngine();
    const profile = mockCandidateProfile({
      location: 'Remote Only',
    });
    
    const matches = await engine.findMatches(profile);
    expect(matches.every(m => 
      m.job.location === 'Remote' || m.job.remoteAllowed
    )).toBeTruthy();
  });
});
```

### 2. Scoring Validation
```typescript
// src/__tests__/services/ScoringService.test.ts
describe('ScoringService', () => {
  it('should calculate accurate match scores', async () => {
    const service = new ScoringService();
    const candidate = mockCandidateProfile();
    const job = mockJobPosting();
    
    const score = await service.calculateMatchScore(candidate, job);
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(1);
    expect(score.breakdown).toBeDefined();
  });
});
```

### 3. Alert System Testing
```typescript
// src/__tests__/services/JobAlertService.test.ts
describe('JobAlertService', () => {
  it('should send alerts for high-quality matches', async () => {
    const service = new JobAlertService();
    const job = mockJobPosting();
    
    const sendSpy = jest.spyOn(service['sns'], 'publish');
    await service.processNewJob(job);
    
    expect(sendSpy).toHaveBeenCalled();
    const calls = sendSpy.mock.calls;
    expect(calls.every(call => 
      JSON.parse(call[0].Message).score >= 0.7
    )).toBeTruthy();
  });
});
```

## Architecture Guidelines

### Data Models
```typescript
// src/types/matching.ts
interface JobMatch {
  job: JobPosting;
  score: MatchScore;
  reasons: MatchReason[];
  skillGaps: SkillGap[];
}

interface MatchScore {
  overall: number;
  breakdown: {
    skills: number;
    experience: number;
    location: number;
  };
  confidence: number;
}

interface MatchReason {
  type: MatchReasonType;
  description: string;
  relevance: number;
}
```

### Performance Optimization
```typescript
// src/services/optimization/MatchingOptimizer.ts
export class MatchingOptimizer {
  async optimizeSearch(query: MatchQuery): Promise<OptimizedQuery> {
    // Apply location-based filtering
    const locationFilter = this.createLocationFilter(query.location);
    
    // Apply salary range filtering
    const salaryFilter = this.createSalaryFilter(query.salary);
    
    // Optimize skill vectors
    const skillVectors = await this.optimizeSkillVectors(query.skills);
    
    return {
      must: [locationFilter, salaryFilter],
      should: skillVectors,
      minimumShouldMatch: 1,
    };
  }
}
```

## Documentation Requirements

1. API Documentation
```yaml
# swagger/matching.yml
paths:
  /matching/jobs:
    post:
      summary: Find matching jobs for a candidate
      parameters:
        - in: body
          name: profile
          schema:
            $ref: '#/definitions/CandidateProfile'
      responses:
        200:
          description: Matching jobs found
          schema:
            type: array
            items:
              $ref: '#/definitions/JobMatch'
```

2. Algorithm Documentation
```markdown
# Matching Algorithm

## Components
1. Skill Matching
   - Required Skills Weight: 70%
   - Preferred Skills Weight: 30%

2. Experience Matching
   - Years of Experience
   - Industry Relevance
   - Role Similarity

3. Location Matching
   - Exact Location: 100%
   - Same City: 90%
   - Same Region: 70%
   - Remote: Based on preferences
```

## Dependencies
- OpenSearch
- AWS SageMaker
- AWS SNS
- Redis
- TypeScript
- Jest

## Task Completion Checklist
- [ ] Matching engine implemented
- [ ] Scoring service created
- [ ] Alert system configured
- [ ] Recommendation engine developed
- [ ] Tests written and passing
- [ ] Documentation completed
- [ ] Performance optimization done
- [ ] ML models trained and deployed
- [ ] Error handling implemented
- [ ] Team review conducted