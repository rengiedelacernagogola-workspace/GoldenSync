# TEXT FILE RULES

Applies to: Creating, basing on, or editing any text-based file
Status: Mandatory

---

## 1. PURPOSE

This document defines the standard that every text-based file must follow.
Each element in a file must serve a stated purpose. Anything without a purpose is removed.

---

## 2. SCOPE

These rules apply to the following file types and to any similar text-based format.

| File Type   | Extension     | Rules Apply To                  |
| ----------- | ------------- | ------------------------------- |
| Markdown    | .md           | Full document                   |
| Plain text  | .txt          | Full document                   |
| Config      | .yml, .json   | Indentation and naming only     |
| Source code | .py, .js, etc | Indentation and comments only   |

---

## 3. GENERAL PRINCIPLES

1. Every line must serve a purpose. Remove filler, repetition, and decoration.
2. Use one consistent format throughout the file. Do not mix styles.
3. Keep wording formal, direct, and complete. Avoid slang and vague terms.
4. Place content in a logical order: purpose, scope, rules, then reference data.
5. Present data in the form that reads clearest. Use a table for comparison, a list for sequence, a sentence for explanation.
6.Make it beginner friendly appoach that even a non-technical person can understand it.

---

## 4. TYPOGRAPHY

All text is set at 12px when the file is rendered or displayed.

| Element      | Size | Weight    | Usage                                |
| ------------ | ---- | --------- | ------------------------------------ |
| Body text    | 12px | Regular   | Paragraphs and list items            |
| Table cells  | 12px | Regular   | All table body rows                  |
| Table header | 12px | Bold      | First row of every table             |
| Headings     | 12px | Bold      | Hierarchy set by numbering, not size |
| Code         | 12px | Monospace | Inline and fenced code               |

Markdown has no native font size. Where the file is rendered as HTML, apply this style once at the top level:

```html
<style>
  body, table, code { font-size: 12px; }
</style>
```

---

## 5. INDENTATION

Use spaces only. Never use tabs. Indent consistently at every level.

| Level   | Indent   | Applies To                         |
| ------- | -------- | ---------------------------------- |
| Level 1 | 0 spaces | Paragraphs and top-level items     |
| Level 2 | 2 spaces | Nested list items                  |
| Level 3 | 4 spaces | Second nested items, code in lists |

Rules:

1. Maximum nesting depth is 3 levels.
2. A nested item must belong directly to the item above it.
3. Never leave trailing spaces at the end of a line.
4. Use one blank line between blocks. Never use two or more.

---

## 6. TABLES

Tables present data only. Each table must have a clear reason to exist.

### 6.1 Structure

| Rule                | Requirement                                           |
| ------------------- | ----------------------------------------------------- |
| Header row          | Required. Every column has a short, specific title    |
| Column width        | Pad every cell so pipes line up in the raw file       |
| Separator row       | Required. Dashes match the width of the column        |
| Empty cells         | Not allowed. Use "N/A" or a dash when no value exists |
| Merged content      | Not allowed. One value per cell                       |
| Cell length         | One short phrase per cell. Move long text outside     |

### 6.2 Alignment

| Data Type              | Alignment | Example           |
| ---------------------- | --------- | ----------------- |
| Text and descriptions  | Left      | Project name      |
| Numbers and currency   | Right     | 1,250.00          |
| Dates                  | Left      | 2026-11-12        |
| Status and short flags | Center    | Done              |

In Markdown, set alignment in the separator row:

| Alignment | Separator Syntax |
| --------- | ---------------- |
| Left      | `:---`           |
| Center    | `:---:`          |
| Right     | `---:`           |

### 6.3 Content

1. Use the same unit, format, and decimal places within a column.
2. Order rows by a stated logic: alphabetical, chronological, or by priority.
3. Do not place data in a table that reads better as a sentence.
4. Do not add columns that repeat information already shown.

---

## 7. LANGUAGE AND WORDING

| Do                                     | Do Not                               |
| -------------------------------------- | ------------------------------------ |
| Use complete, precise sentences        | Use fragments, filler, or slang      |
| Use one term for one concept           | Switch terms for the same concept    |
| Define abbreviations on first use      | Use undefined abbreviations          |
| Use numbered lists for ordered steps   | Use bullets for ordered steps        |
| Use consistent capitalization          | Mix capitalization styles            |
| Keep each paragraph to one topic       | Combine unrelated topics together    |

---

## 8. STRUCTURE

1. Begin with a title, then a short header block (version, scope, status).
2. Number all main sections in order: 1, 2, 3.
3. Number subsections under their parent: 6.1, 6.2.
4. Separate main sections with a horizontal rule.
5. Place no content outside a labeled section.

---

## 9. CREATING A NEW FILE

1. State the purpose of the file before writing content.
2. Choose the structure first, then fill in the content.
3. Name the file in lowercase with hyphens, for example `text-files-rules.md`.
4. Include only sections that carry information. Do not add empty placeholders.
5. Run the checklist in Section 11 before delivering.

---

## 10. EDITING AN EXISTING FILE

1. Read the full file before changing anything.
2. Match the existing format unless this document requires a correction.
3. Change only what the task requires. Do not reformat unrelated content.
4. When editing a table, re-pad every row so the columns stay aligned.
5. When adding a section, renumber the sections that follow.
6. Remove any content made redundant by the change.
7. Run the checklist in Section 11 after the edit.

---

## 11. CHECKLIST

| No. | Check                                           | Pass Condition                    |
| --- | ----------------------------------------------- | --------------------------------- |
| 1   | Every element serves a stated purpose           | No filler or decoration remains   |
| 2   | Font size is 12px                               | Applied to all text               |
| 3   | Indentation uses spaces at set levels           | No tabs, depth of 3 or less       |
| 4   | Tables are padded and aligned                   | Pipes line up in the raw file     |
| 5   | Table columns use correct alignment             | Text left, numbers right          |
| 6   | No empty cells                                  | Each cell has a value or "N/A"    |
| 7   | Wording is formal and consistent                | No slang, no mixed terms          |
| 8   | Sections are numbered and ordered               | Numbering is continuous           |
| 9   | No trailing spaces or double blank lines        | Verified                          |
| 10  | File name is lowercase with hyphens             | Verified                          |
