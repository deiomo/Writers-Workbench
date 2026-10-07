# Changelog

## October 2nd, 2026 (Workbench + Bridge 0.4.0)

### Changed
- The repo is now also the SillyTavern extension (Writer's Workbench Bridge). Install it from SillyTavern's Extensions panel with the repo URL. There's one copy of the Workbench now: `writers-workbench.html` (replaces `writers-workbench-v3.html`).
- Exported XML tags keep letters (including accented ones), digits, `_`, `-` and `.`, and drop other characters. `O'Neil` now exports as `<ONeil>`, not `<O'Neil>`. Names with only letters, digits and spaces export as before. Old exports still import and display fine.
- Unticking Main characters, Relationships or Scenario on the Live tab now removes those entries from the synced lorebook. Changing the active scenario removes the old one. Before, stale copies stayed active.

### Added
- Live sync is turned on with a large **Start live sync** button instead of a small checkbox. While syncing it turns green with a pulsing dot and reads "LIVE · click to pause".
- Live sync warns you before importing a lorebook that wasn't made by the Workbench. It names the entries, explains that they'll go into Concepts and be rewritten in SillyTavern wrapped in Concept XML tags with a "[Concept]" name, and suggests backing the lorebook up first. The Live tab says the same.

### Fixed: pasting a Workbench character back in
- Fields written in more than one paragraph keep all their paragraphs. Before, only the first paragraph stayed. In Body & Intimate Details the rest piled up in "Anything else", in Psychology they became behavioural triggers, and elsewhere they were lost.
- A main character's relationships no longer come back as "Name to …".
- Copying from the Reading view now pastes back cleanly: the whole card copies as the exact export, and a partial selection keeps its headings and bullet points.

### Fixed: saving and projects
- A damaged project or a bad backup can no longer lock you out of every project. The Workbench skips what it can't read, opens the next project that loads, and says what went wrong. Bad backups are rejected before a project is created.
- Autosave no longer stops silently after a failed load.
- The last edits before closing or reloading the tab are saved.
- Two tabs on the same project no longer silently overwrite each other. The tab that falls behind stops autosaving and tells you to reload.
- Relationships are no longer deleted when a character's name is blank for a moment (for example, mid-rename).
- Deleting an entry above the selected one no longer jumps to the wrong entry.
- A malformed character file no longer half-loads and breaks autosave.

### Fixed: importing and pasting
- Lorebook round trips (export → import → export) come back identical. Before, they corrupted entries a bit more each time (`Type: Name: The Rusty Anchor`), duplicated relationships into Notes, and lost settings like Vectorized, character filters, triggers and role.
- Names with apostrophes, accents, underscores or " to " import correctly.
- Entries from other lorebooks are named after their title, not their first heading.
- Lorebooks whose entries are stored as a list, and V2 character-book entries, can now be imported.
- Paste import:
  - Apply on one tab no longer applies what was detected on another tab.
  - A heading like "## Backstory" no longer renames the character. A Name proposal isn't ticked when the entry already has a name.
  - Text before the first heading is no longer dropped.
  - `Label:` with the value on the next line, `**Age:** 25`, single-line `<tag>…</tag>`, prose after bullet lists, and mixed XML + markdown pastes all parse now.
- "Move selected text" no longer cuts the wrong passage from cards with Windows line endings.
- v3 PNG export writes both the `chara` and `ccv3` data, like SillyTavern does.

### Fixed: live sync (Workbench + Bridge)
- Switching to "import the whole lorebook" no longer pushes the new project into the previously synced lorebook. If linking fails, live sync turns off and says so.
- Switching projects while live now pauses live sync instead of quietly syncing a different project into the same lorebook.
- Slow SillyTavern replies no longer cause overlapping syncs. Two Workbench tabs no longer pick up each other's replies.
- Duplicated projects get fresh entry IDs, so the original and the copy no longer fight over the same lorebook entries. The relationships entry is now per project.
- With several SillyTavern tabs open, only one handles the Workbench. Another takes over if that tab closes.
- The bridge's size limits are much higher, and anything it still has to shorten is reported instead of cut silently.

### Fixed: interface
- The preview no longer garbles itself for names like `a`, `span`, `class` or `lt`, and names with `&`, `<` or `>` are highlighted.
- The Reading view shows sections correctly for names with apostrophes, accents or underscores.
- Double-click works on the relationship graph (opens the character) and on the location overview (collapses or expands a group).
- Renaming a map object updates the other objects' "relative to" choices.
- A duplicated location no longer sits exactly on top of the original in the overview. Its exits aren't copied, since they would only go one way.
- Ctrl+S no longer opens the browser's "Save page" dialog on the Relationships, Guide, Credits and Live tabs.
- The empty token-budget bar is hidden when no budget is set.
- On phones, "+ New" and "Duplicate" stay visible in the roster.
- The Paper theme no longer has dark dropdowns or low-contrast window cells in the map.

### Known limits
- Map layouts aren't included in lorebook exports, so they don't come back on import.
- Map objects with the same name make "relative to" anchors ambiguous.
- Don't edit Workbench-made entries in SillyTavern's own editor; the next sync overwrites them.

## September 17th, 2026

- Multiple projects with separate autosaves and project backups.
- Local character imports for JSON, PNG, text, and Markdown, without requiring the template.
- Location map builder with walls, doors, objects, exits, and generated descriptions.
- Nested location groups for floors, houses, neighborhoods, and towns.
- Character relationship graph with labeled, reciprocal or one-way connections.
- Per-entry lorebook settings covering activation, keywords, placement, timing, recursion, and inclusion groups.
- Project-wide search with category filters and clickable results.

### Quality-of-life improvements
- Combined "Export everything" lorebook export.
- Move imported passages into template fields while preserving the original card.
- Two-click room and group connections without extra confirmation.
- Multi-selection, group movement, collapse/expand, and resizing-aware graph dragging.
- Keyboard shortcuts and matching dark-theme styling for search.
- Recovery of the previous autosaved workspace into a project.
- Removed external font requests; import processing stays local without AI.
