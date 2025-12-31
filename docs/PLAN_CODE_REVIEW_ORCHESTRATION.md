# Code Review Orchestration Plan

## Goal
Enhance the existing `runCodeReview` implementation in `lib/orchestration/review.ts` to support a more sophisticated, multi-stage review process involving specialized LLM personas, and potentially integrate it with the GitHub PR workflow (though the primary focus is on the review logic itself).

## Current State
- `lib/orchestration/review.ts` exists.
- It has a `runCodeReview` function.
- It supports a `simple` review (single pass) and a `comprehensive` review (parallel execution of 3 fixed personas: Security, Performance, Clean Code).
- It relies on the `LLMProvider` interface.

## Proposed Enhancements (v0.8.x)

### 1. Dynamic Persona Configuration
- Instead of hardcoding 3 personas, allow `ReviewRequest` to accept a list of custom personas or select from a predefined library.
- **Why:** Different PRs require different types of scrutiny (e.g., a CSS change needs a "UI/UX" review, not a "Security" one; a database migration needs a "DBA" review).

### 2. Multi-Turn / Interactive Review (Future)
- *Note:* The current implementation is single-shot (User Code -> LLM -> Review).
- **Vision:** Enable a "Debate" mode for reviews where the "Security Expert" and "Performance Engineer" can discuss trade-offs before presenting the final verdict. (This leverages the `debate.ts` logic we already have!).

### 3. Output Structuring
- Currently returns a raw markdown string.
- **Improvement:** Return a structured object:
  ```typescript
  interface ReviewResult {
      summary: string;
      score: number; // 0-100
      issues: {
          severity: 'high' | 'medium' | 'low';
          category: string;
          file?: string;
          line?: number; // Hard to get accurately without sophisticated parsing, but general location is good
          description: string;
          suggestion: string;
      }[];
      rawOutput: string;
  }
  ```
- **Why:** This allows the UI to render badges, filter by severity, and potentially block merges based on score.

### 4. Integration with `submodules/jules-agent-sdk-python`
- The Python SDK likely has its own review logic or prompts. We should ensure parity or delegation.
- *Action:* Check `jules-sdk-reference/src/jules_agent_sdk` for overlapping capabilities.

## Implementation Steps

1.  **Refactor `ReviewRequest`:** Add `personas?: ReviewPersona[]` and `outputFormat?: 'markdown' | 'json'`.
2.  **Enhance `runComprehensiveReview`:**
    -   Accept dynamic personas.
    -   Implement "Debate" logic (optional, maybe distinct `runDebateReview`?).
3.  **Structure Output:**
    -   Update prompts to request JSON output from the LLM.
    -   Add a parser to convert LLM response -> `ReviewResult` object.
    -   Handle parsing failures gracefully (fallback to raw markdown).
4.  **UI Updates (Later):**
    -   Update the "Quick Review" button or PR view to display the structured data (Scorecard, Issues List).

## Dependency Check
- `lib/orchestration/providers`: Needs to support JSON mode or structured output if available (e.g., OpenAI JSON mode).
- `types/jules.ts`: Update any frontend types if we want to show this new data.

