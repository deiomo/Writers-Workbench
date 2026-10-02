# Writer's Workbench
A simple character card and lorebook builder for SillyTavern and other AI roleplay platforms.

Credits: Inspired by The Character Foundry by u/Due_Opportunity8693, Reddit link: https://www.reddit.com/r/SillyTavernAI/s/X4QE1rYhMT.
Vibe coded with Claude.

See [CHANGELOG.md](CHANGELOG.md) for what changed in each version.

# Two ways to use it

**As a plain file (offline).** Download `writers-workbench.html` and open it in your browser. Everything works except live sync.

**As a SillyTavern extension (live sync).** This repo is also a SillyTavern extension, the Writer's Workbench Bridge. With it, edits in the Workbench are written straight into a SillyTavern lorebook, so the next message uses the new text.

1. SillyTavern → Extensions panel → **Install extension** → paste `https://github.com/deiomo/Writers-Workbench` → Install.
   (Manual install: copy this folder into `SillyTavern/data/<your-user>/extensions/` so that `extensions/Writers-Workbench/manifest.json` exists, then reload SillyTavern.)
2. Wand menu → **Writer's Workbench**. It opens in a new tab, served by SillyTavern.
3. In the Workbench, open the **Live** tab, pick a lorebook (or make a new one), and tick Live.
4. In SillyTavern: World Info → activate that lorebook once.

Requires SillyTavern 1.12.12 or newer. Full bridge details, including exactly what it will and won't touch, are in [BRIDGE.md](BRIDGE.md).

Note: the copy served by SillyTavern keeps its own saved projects, separate from a copy you open as a local file. Move work between them with project export/import.

# Features!

You can create multiple entries and export them as entire lore books for your convenience.

You get to see the markdown output so you know exactly what the AI would see and copy it without having to download anything.

Its a HTML file so you can use it offline. No shady extensions that steals your API keys this time.

It comes with token counter, but don't expect it to be accurate.

A map maker that generates a dynamic description

Character relationship graph

Paste import: paste a character written anywhere (headings, `Key: value` lines, bullets, XML-style tags) and pick which detected fields to apply.

Lorebook import: load a SillyTavern lorebook (or a Workbench export) back in as a project.

Live sync into SillyTavern lorebooks (with the bridge extension above).

# Current templates available:

Main characters: full cards with contradiction, descriptions, likes/fears, NSFW sections, non-human mode

Side characters: trimmed version of the main character template, it will help you create memorable NPCs

Scenario: setting, tech level, mood, what's normal here

Locations: for any scale, from a room to a district

Items

Factions

History: events, and how they affect the present

Concepts: magic systems, laws, customs, species, anything else
