**UX Design Planning Tasks** 
with AI UI tools incorporated and tailored prompts for effective use:

---

### **21. Task: Develop Wireframes for Core User Flows**

#### **Workflow Configuration**
**Branch**: `feature/wireframes`  
**Key Tasks**:
- Generate wireframes for registration, profile creation, job search, and job application workflows using AI tools like **Uizard** or **Figma AI**.  
- Validate mobile-first responsiveness and navigation consistency.  
- Focus on clarity and simplicity for user flows.

#### **AI Prompt Example**:
1. **Registration Wireframe Prompt**:  
   - *"Design a step-by-step registration form wireframe for a mobile job application platform. Include fields for email, password, and user role selection. Use a clean and responsive design with clear progress indicators."*
2. **Job Search Wireframe Prompt**:  
   - *"Create a wireframe for a mobile job search interface with filters for location, salary, and job type. Show results as cards with job title, company name, and salary range. Add a bottom navigation bar for seamless access to other features."*

#### **Code Implementation**
```yaml
name: Wireframe Development Workflow

on:
  pull_request:
    branches: [main, develop]

jobs:
  wireframe-development:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Design Environment
        run: |
          npm install figma-cli
          figma-cli sync wireframes

      - name: Validate Wireframes
        run: |
          npm run validate-wireframes

      - name: Upload Wireframes for Review
        uses: actions/upload-artifact@v3
        with:
          name: wireframe-assets
          path: ./wireframes/
```

#### **Key Developer Notes**:
- Use **Uizard** or **Figma AI** to create auto-generated wireframe drafts.  
- Validate wireframes for touch-friendly dimensions (minimum 44x44 pixels).  
- Iterate based on internal team feedback.  

---

### **22. Task: Design User Interface Mockups**

#### **Workflow Configuration**
**Branch**: `feature/ui-mockups`  
**Key Tasks**:
- Leverage AI tools like **Figma AI Assistant** or **Adobe Firefly** to generate high-fidelity mockups based on approved wireframes.  
- Incorporate the provided color palette, typography, and branding guidelines.  
- Generate both iOS-specific (San Francisco font, native feel) and Android-specific (Material Design principles) designs.

#### **AI Prompt Example**:
1. **Onboarding Mockup Prompt**:  
   - *"Create a visually engaging onboarding screen for a mobile job application platform. Include a welcome message, a background image relevant to careers, and a 'Get Started' button. Use a primary color of #007AFF and ensure accessibility compliance."*
2. **Profile Creation Mockup Prompt**:  
   - *"Design a high-fidelity mockup for the profile creation page. Include fields for skills, experience, and job preferences. Add a progress bar at the top and use subtle animations for transitions."*

#### **Code Implementation**
```yaml
name: UI Mockup Workflow

on:
  pull_request:
    branches: [main, develop]

jobs:
  ui-mockups:
    runs-on: ubuntu-latest
    steps:
      - name: Generate Mockups
        run: |
          npm install ai-ui-toolkit
          ai-ui-toolkit generate mockups --config ./mockup-config.json

      - name: Validate Mockups
        run: |
          npm run validate-mockups

      - name: Upload Mockups for Review
        uses: actions/upload-artifact@v3
        with:
          name: mockup-assets
          path: ./mockups/
```

#### **Key Developer Notes**:
- Generate interactive mockups to simulate real user flows.  
- Ensure text is legible and buttons adhere to the minimum size standards (44x44 pixels).  
- Address feedback in Figma using AI-assisted suggestions for improvements.  

---

### **23. Task: Develop User Journey Maps**

#### **Workflow Configuration**
**Branch**: `feature/user-journey`  
**Key Tasks**:
- Use AI tools like **FlowMapp AI** or **Lucidchart AI** to map end-to-end user journeys.  
- Highlight touchpoints for each user role (e.g., Job Seeker, Recruiter).  
- Include frustration points and optimization suggestions.  

#### **AI Prompt Example**:
- *"Generate a user journey map for a job seeker using a mobile job application platform. The journey starts with onboarding, progresses to job search, and ends with application submission. Include touchpoints, user goals, and potential pain points."*

#### **Code Implementation**
```yaml
name: User Journey Workflow

on:
  pull_request:
    branches: [main, develop]

jobs:
  user-journey:
    runs-on: ubuntu-latest
    steps:
      - name: Generate User Journey Maps
        run: |
          npm install ai-journey-toolkit
          ai-journey-toolkit create journey-map --output ./journeys

      - name: Validate User Journeys
        run: npm run validate-journeys

      - name: Upload Journey Maps
        uses: actions/upload-artifact@v3
        with:
          name: journey-assets
          path: ./journeys/
```

#### **Key Developer Notes**:
- Represent user emotions at each touchpoint using AI-generated insights.  
- Optimize journeys for efficiency (e.g., fewer clicks for common tasks).  
- Collaborate with stakeholders to validate maps before finalizing.  

---

### **24. Task: Design Interactive Prototypes**

#### **Workflow Configuration**
**Branch**: `feature/prototypes`  
**Key Tasks**:
- Use AI tools like **Framer AI** or **ProtoPie** to create clickable prototypes.  
- Link screens for key workflows (registration, job search, profile creation).  
- Simulate animations and interactions for user testing.  

#### **AI Prompt Example**:
- *"Create an interactive prototype for the job search workflow. Include transitions between the search screen, job detail view, and application submission. Ensure smooth animations and a 60fps performance target."*

#### **Code Implementation**
```yaml
name: Prototype Development Workflow

on:
  pull_request:
    branches: [main, develop]

jobs:
  prototypes:
    runs-on: ubuntu-latest
    steps:
      - name: Generate Prototypes
        run: |
          npm install ai-prototype-toolkit
          ai-prototype-toolkit generate --project mobile-job-platform

      - name: Validate Prototypes
        run: npm run validate-prototypes

      - name: Upload Prototypes
        uses: actions/upload-artifact@v3
        with:
          name: prototype-assets
          path: ./prototypes/
```

#### **Key Developer Notes**:
- Test prototypes on actual devices (iOS and Android).  
- Use AI tools to suggest improvements for usability and performance.  
- Collect user feedback to refine prototypes before development.  

---
