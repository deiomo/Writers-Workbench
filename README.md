# Writer's Workbench
A simple character card and lorebook builder for SillyTavern and other AI roleplay platforms. 

Credits: Inspired by The Character Foundry by u/Due_Opportunity8693, Reddit link: https://www.reddit.com/r/SillyTavernAI/s/X4QE1rYhMT.
Vibe coded with Claude. 

# Features!

You can create multiple entries and export them as entire lore books for your convenience.

You get to see the markdown output so you know exactly what the AI would see and copy it without having to download anything.

Its a HTML file so you can use it offline. No shady extensions that steals your API keys this time.

It comes with token counter, but don't expect it to be accurate.

A map maker that generates a dynamic description

Character relationship graph 

# Current templates available:

Main characters: full cards with contradiction, descriptions, likes/fears, NSFW sections, non-human mode

Side characters: trimmed version of the main character template, it will help you create memorable NPCs

Scenario: setting, tech level, mood, what's normal here

Locations: for any scale, from a room to a district

Items

Factions

History: events, and how they affect the present

Concepts: magic systems, laws, customs, species, anything else

# Changelog 

- Multiple projects with separate autosaves and project backups.

- Local character imports for JSON, PNG, text, and Markdown, without requiring the template.

- Location map builder with walls, doors, objects, exits, and generated descriptions.

- Nested location groups for floors, houses, neighborhoods, and towns.

- Character relationship graph with labeled, reciprocal or one-way connections.

- Per-entry lorebook settings covering activation, keywords, placement, timing, recursion, and inclusion groups.

- Project-wide search with category filters and clickable results.

# Quality-of-life improvements

- Combined “Export everything” lorebook export.
  
- Move imported passages into template fields while preserving the original card.
  
- Two-click room and group connections without extra confirmation.
  
- Multi-selection, group movement, collapse/expand, and resizing-aware graph dragging.
  
- Keyboard shortcuts and matching dark-theme styling for search.
  
- Recovery of the previous autosaved workspace into a project.

- Removed external font requests; import processing stays local without AI.
## New Fields to Fill Out
Main characters
- Face: Placeholder examples: sharp, pudgy, froggy, mature, withered.
- Non-human features: an optional toggle at the bottom of Appearance, off by default. Adds coat/scales/feathers, ears, tail, muzzle & teeth, hands & feet, build & stance, and a free-text field for horns, wings, and anything else. 
-Core belief and emotional need: four optional fields at the bottom of Psychology: core belief, protective strategy, emotional need, and conditions for change. They explain why the triggers above them fire and what could change them.
- What they know / What they wrongly believe: gives the model a knowledge state to play.
- Usual underwear: added to Body & intimate details.
## Side characters
-What they know / What they wrongly believe: same thing from from main characters.
## Scenario
-Genre and Themes

-Overarching story: a new section with three fields: what's going on, what it's driving toward, and what happens if nobody acts. 

History

-What people say happened: the public account under what really happened. NPCs can repeat the public, wrongful version while the narration knows better.
## Output format: every section is now an XML tag

Each section of every entry now exports wrapped in its own tag, named after the entry and the section so the AI can recall information better.
