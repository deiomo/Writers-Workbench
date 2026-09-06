# Writer's Workbench
A simple character card and lorebook builder for SillyTavern and other AI roleplay platforms. 

Credits: Inspired by The Character Foundry by u/Due_Opportunity8693, Reddit link: https://www.reddit.com/r/SillyTavernAI/s/X4QE1rYhMT.
Vibe coded with Claude. 

# Features!

You can create multiple entries and export them as entire lore books for your convenience.

You get to see the markdown output so you know exactly what the AI would see and copy it without having to download anything.

Its a HTML file so you can use it offline. No shady extensions that steals your API keys this time.

It comes with token counter, but don't expect it to be accurate.

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

-A visual overhaul to add some "pizzaz"

-Autosave: Your progressed is cached in your browser. You can close it and open it again, your progress will still be there. 

-Reset all: Resets progress in all tabs for convenience

-Example dialogue writing prompts to help you brainstorm dialogue for main and side characters

-13 prompts covering moods and situations: good mood, bad news, angered, small talk, bumped into by a stranger, complimented, asked to do something they don't want, caught in a lie, meeting someone new, someone they care about threatened, asked about their past, flirted with, under real pressure.   

- 5 prompts. Meeting {{user}}, {{user}} wants something, {{user}} has annoyed them, talking about their own work, something goes wrong in front of them.

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
