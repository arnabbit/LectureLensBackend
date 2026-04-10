# Category Modules

LectureLens supports multiple course categories. Each category defines how
transcripts are extracted, what the UI looks like, and how quizzes work.

## Architecture

```
src/categories/
  types.ts          ← Shared interfaces (CategoryConfig, Concept, ExtractionResult, QuizItem)
  base.ts           ← CategoryProcessor base class (shared retry logic + validation)
  dsa/              ← DSA category (problems, approaches, complexity)
    types.ts        ←   DSA-specific types (DSApproach, DSAProblem, DSAQuizItem)
    index.ts        ←   DSA processor implementation
    prompts.ts      ←   DSA-specific LLM prompts
    quiz.ts         ←   DSA quiz generation
  generic/          ← Generic fallback (concepts, explanations, takeaways)
    types.ts        ←   Generic-specific types (GenericConcept, GenericExtractionResult, GenericQuizItem)
    index.ts        ←   Generic processor implementation
    prompts.ts      ←   Generic LLM prompts
    quiz.ts         ←   Generic quiz generation
  registry.ts       ← Category registry (auto-discovery)
  router.ts         ← Combines detector + registry
  detector.ts       ← Detects category from course name using LLM
  README.md         ← This file
```

## How the System Works

1. User uploads a course transcript
2. Detector looks at the course name → "This is DSA" or "This is generic"
3. Router finds the corresponding category module
4. Module extracts content (DSA gets problems/approaches/complexity, generic gets concepts/takeaways)
5. Module generates quiz questions
6. Frontend renders using category-specific UI

---

## How to Add a New Category (e.g., Math)

### Step 1: Create the folder

```
src/categories/math/
  index.ts       ← Main processor
  types.ts       ← Math-specific types (if needed)
  prompts.ts     ← LLM prompts for math
  quiz.ts        ← Math quiz generation
```

### Step 2: Implement the contract

```typescript
// src/categories/math/index.ts

import { CategoryProcessor } from '../base';
import { ExtractionResult, QuizItem } from '../types';

export class MathProcessor extends CategoryProcessor {
  config = {
    id: 'math',
    name: 'Mathematics',
    description: 'Formulas, theorems, and step-by-step solutions',
    icon: '🔢'
  };

  async extract(transcript: string): Promise<ExtractionResult> {
    // Call LLM with math prompt
    // Return concepts (theorems, formulas)
  }

  async generateQuiz(result: ExtractionResult): Promise<QuizItem[]> {
    // Generate math quiz questions
  }
}

// Register in registry.ts — or rely on auto-discovery
```

### Step 3: Register it (if not using auto-discovery)

In `registry.ts`, add:
```typescript
import { MathProcessor } from './math';
registerCategory('math', new MathProcessor());
```

### Step 4: Done

The router will now detect math courses and use your plugin automatically.

---

## Contract Summary

Every category MUST provide:

| Requirement | Where | Description |
|-------------|-------|-------------|
| `CategoryConfig` with id, name, description, icon | types.ts | Category metadata |
| `extract(transcript: string): Promise<ExtractionResult>` | processor class | Extract content from transcript |
| `generateQuiz(result: ExtractionResult): Promise<QuizItem[]>` | processor class | Generate quiz questions |
| Extend `CategoryProcessor` | processor class | Inherit shared logic |
| Register in `registry.ts` | registry | Make category discoverable |

### What the Base Class Provides (Free)

| Method | Description |
|--------|-------------|
| `processWithRetry(transcript)` | Extract with up to 3 retries + exponential backoff |
| `validate(result)` | Checks required fields, throws with clear error |

### Base Types (all categories use these)

| Type | Description |
|------|-------------|
| `CategoryConfig` | Category metadata (id, name, description, icon) |
| `Concept` | A teachable unit with name + explanation + keyTakeaways |
| `ExtractionResult<T>` | What `extract()` returns - concepts array + metadata |
| `QuizItem` | A quiz question with options, correctAnswer, explanation, optional difficulty |

### DSA-Specific Types

| Type | Description |
|------|-------------|
| `DSApproach` | A solution approach with complexity (time/space) + optimisationScore |
| `DSAProblem` | Problem with multiple approaches + keyInsights |
| `DSAExtractionResult` | Adds problems[] to base ExtractionResult |
| `DSAQuizItem` | Adds `type` field (approach_comparison, complexity_identification, optimality) |

### Generic Types

| Type | Description |
|------|-------------|
| `GenericConcept` | Extends Concept with importance rating |
| `GenericExtractionResult` | Simpler than DSA — no problems, no complexity, no optimisationScore |
| `GenericQuizItem` | Adds `type` (recall, explain, true_false, key_point) + conceptName |

---

## Common Mistakes

1. **Don't hardcode DSA fields in base types** — keep base generic, put DSA-specific fields in `dsa/types.ts`
2. **Don't skip the base class** — retry logic and validation are provided for free
3. **Don't forget to register** — unregistered modules won't be found by the router (auto-discovery handles this, but check manually if not working)
4. **Don't use DSA prompts for non-DSA** — each category needs its own prompts file
5. **Don't name the method `process()` instead of `extract()`** — the interface contract uses `extract()`. This is a common typo from the old processor codebase.
6. **Don't duplicate quiz logic in index.ts** — put quiz generation in `quiz.ts` and call it from the category class.

---

## Questions?

Ask in the #lecturelens channel or open an issue.
