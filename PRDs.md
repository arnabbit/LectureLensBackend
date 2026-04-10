# LectureLens Plugin Architecture — Phase PRDs

## Phase 0: Design Category Interface Contract

**Goal:** Define the TypeScript interface that every category module must implement.

### Tasks

**Task 0.1: Define Category Types**
- Create `src/categories/types.ts`
- Define `CategoryConfig` interface: `{ id, name, description, icon }`
- Define `ExtractionResult` interface: `{ concepts[], metadata }` (generic shape)
- Define `QuizItem` interface: `{ question, options, correctAnswer, explanation }`
- Define `CategoryModule` interface: `{ config, extract(), generateQuiz(), renderCard() }`

**Task 0.2: Define DSA-Specific Types**
- Create `src/categories/dsa/types.ts`
- Extend `ExtractionResult` with DSA fields: `problems[]`, each with `approaches[]`, `complexity: { time, space }`, `optimisationScore`
- DSA-specific `QuizItem` variants: approach comparison, complexity identification

**Task 0.3: Define Generic Types**
- Create `src/categories/generic/types.ts`
- Generic extraction: `concepts[]` with `name`, `explanation`, `keyTakeaways[]`
- Generic quiz: standard Q&A, recall prompts

**Task 0.4: Define CategoryProcessor Base Class**
- Create `src/categories/base.ts`
- Abstract `process(transcript: string): ExtractionResult`
- Abstract `generateQuiz(result: ExtractionResult): QuizItem[]`
- Shared retry logic, validation, error handling

**Task 0.5: Document the Contract**
- Write `src/categories/README.md` explaining:
  - How to add a new category
  - What each category must export
  - How the router discovers categories

---

## Phase 1: Build Category Router & Loader

**Goal:** Build the core infrastructure that detects course category and loads the right module.

### Tasks

**Task 1.1: Build Category Detector**
- Create `src/categories/detector.ts`
- Uses LLM to classify course name into category
- Returns `"dsa"` | `"generic"` (expandable later)
- Cache results per courseId

**Task 1.2: Build Category Registry**
- Create `src/categories/registry.ts`
- Map of category ID → CategoryModule
- Auto-discovery: scans `src/categories/` for modules
- `getCategory(id: string): CategoryModule` function
- Fallback: returns generic module for unknown categories

**Task 1.3: Build Category Router**
- Create `src/categories/router.ts`
- `route(course): CategoryModule` — combines detector + registry
- Flow: detect category → lookup module → return module

**Task 1.4: Integrate Router into Processing Pipeline**
- Modify `src/services/processingRunner.js`
- Instead of hardcoded processor, call router
- Router returns the right CategoryModule
- Module's `process()` method handles extraction

**Task 1.5: Add Configuration**
- Add category-related settings to `src/config.js`
- Feature flag: `ENABLE_CATEGORY_ROUTER` (default: true)
- Fallback category: configurable (default: `"generic"`)

---

## Phase 2: Migrate Existing DSA Processor

**Goal:** Convert the existing DSA processor into a category module following the new interface contract.

### Tasks

**Task 2.1: Wrap Existing DSA Processor**
- Create `src/categories/dsa/index.ts`
- Import existing `DSAProcessor` logic
- Implement `CategoryModule` interface
- Map existing output to new `ExtractionResult` type

**Task 2.2: Update DSA Extraction Prompts**
- Move prompts from `src/utils/prompts.js` to `src/categories/dsa/prompts.ts`
- No logic changes — just relocation
- Ensure DSA-specific output shape (problems, approaches, complexity)

**Task 2.3: Update DSA Quiz Generation**
- Create `src/categories/dsa/quiz.ts`
- Existing quiz logic (grade answer, rephrase) stays
- Wrap in `generateQuiz()` method

**Task 2.4: Register DSA Category**
- Add DSA module to registry
- Category ID: `"dsa"`
- Test: existing DSA courses still process correctly

**Task 2.5: Verify No Regression**
- Run existing DSA course through new pipeline
- Compare output with old pipeline
- Ensure all existing tests pass

---

## Phase 3: Build Generic Fallback Module

**Goal:** Create a universal extractor + UI for any course type without a specialized module.

### Tasks

**Task 3.1: Create Generic Extractor**
- Create `src/categories/generic/index.ts`
- LLM prompt: extract concepts, explanations, key takeaways
- No DSA-specific fields (no complexity, no optimisationScore)
- Output: `concepts[]` with `{ name, explanation, keyTakeaways[] }`

**Task 3.2: Write Generic Extraction Prompt**
- Create `src/categories/generic/prompts.ts`
- Prompt: "You are an expert educator. Extract the main concepts from this lecture."
- Output format: concept cards with name, explanation, key takeaways
- Works for ANY subject: history, science, business, etc.

**Task 3.3: Create Generic Quiz Generator**
- Create `src/categories/generic/quiz.ts`
- Quiz types: "What was the main concept?", "Explain X", "True/False"
- Grade based on key point coverage, not "optimality"

**Task 3.4: Register Generic Category**
- Add to registry as `"generic"`
- Set as fallback for unknown categories

**Task 3.5: Test with Diverse Content**
- Test with a math lecture (unknown category → generic)
- Test with a business lecture
- Verify extraction makes sense and isn't "DSA-ified"

---

## Phase 4: Update Frontend for Category-Aware Display

**Goal:** Frontend renders content appropriately based on category.

### Tasks

**Task 4.1: Update API Types**
- Modify `services/api.ts`
- Make `complexity` and `optimisationScore` optional
- Add `category` field to `Problem` interface
- Add `Concept` interface for generic content

**Task 4.2: Create Category-Specific Card Components**
- Create `components/DSACard.tsx` — code blocks, complexity badges
- Create `components/GenericCard.tsx` — concept cards, key takeaways
- Create `components/CategoryCard.tsx` — wrapper that picks the right card based on category

**Task 4.3: Update Quiz Screen**
- Quiz adapts based on category
- DSA: "Which approach is optimal?"
- Generic: "What was the main concept?"

**Task 4.4: Update Course Screen**
- Show category badge (DSA, Generic, etc.)
- Render problems/concepts with correct card type

**Task 4.5: Test Frontend End-to-End**
- Test DSA course in app
- Test generic course in app
- Verify no DSA-specific UI shows for generic content
