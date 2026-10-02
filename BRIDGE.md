# Writer's Workbench Bridge (prototype)

Live sync from Writer's Workbench into SillyTavern World Info. Edit an entry in the
Workbench and the next message in SillyTavern uses the new text.

## Requirements

SillyTavern 1.12.12 or newer. Older versions show a message saying so instead of failing silently.

## Install

Easiest: SillyTavern → Extensions panel → Install extension → paste
`https://github.com/deiomo/Writers-Workbench` → Install. Updates come through SillyTavern's
extension updater.

Manual: copy this whole folder into `SillyTavern/data/<your-user>/extensions/`
(usually `data/default-user/extensions/`), then restart SillyTavern or reload the page.
Check the layout: `extensions/<folder>/manifest.json`. If `manifest.json` is one folder deeper,
the zip was extracted one level too deep and SillyTavern won't find it.

Extensions panel → Writer's Workbench Bridge should appear, and the wand menu gets a
"Writer's Workbench" item.

## Use

1. Wand menu → Writer's Workbench. It opens in a new tab, served by SillyTavern.
2. In the Workbench, open the **Live** tab → pick a lorebook from the list, or choose
   "New lorebook" and type a name → tick Live and confirm.
3. In SillyTavern: World Info → activate that lorebook once (globally or on the character).
4. Keep the SillyTavern tab open while you work.

## Going live on an existing lorebook

If the lorebook has entries your open project doesn't, you're asked whether to import the whole
lorebook into a new project. Say yes and every entry is linked to it, so later edits update those
same entries in place. Entries the Workbench didn't make land in Concepts and are rewritten in
Workbench format on the first sync. This is a one-time import: after it, edits made in
SillyTavern's own editor to linked entries are overwritten by the next sync.

## What it touches

- Only the lorebook you name.
- Only entries the Workbench made (they carry `wwId` and `wwProject` fields). Entries you write
  by hand in the same book are never changed or removed.
- An entry is removed only when the same project made it and you deleted it in the Workbench.
  Entries from other projects, and entries you merely unticked in Export everything, are kept.
  Pausing Live removes nothing.
- Side characters, locations, items, factions, history, and concepts always sync. The Live tab
  has its own checkboxes for the active scenario, main characters, and the relationship graph.

## Notes

- If the lorebook you pick already holds entries from an earlier Workbench JSON import, you're
  asked whether to link them. Linked entries update in place; otherwise the Workbench adds its
  own copies beside them.
- The Workbench opened from SillyTavern keeps its own saved data, separate from a copy you
  open as a local file. Move work between them with project export/import.
- If you have the World Info editor open on the synced book, it refreshes on each sync.
  Don't edit Workbench-made entries in SillyTavern's editor; the next sync overwrites them.
- Main character card descriptions are not synced yet, only lorebook entries.

## Troubleshooting

Open the bridge's drawer in SillyTavern's Extensions panel. The log there shows the
SillyTavern version it detected and any problem it found. The Workbench's live sync
row shows the same message. Browser console lines start with `[WW Bridge]`.
