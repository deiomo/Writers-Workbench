/*
 * Writer's Workbench Bridge
 * Receives lorebook entries from the Workbench (opened from this extension's folder,
 * so it shares SillyTavern's origin) over a BroadcastChannel, and writes them into a
 * World Info book with saveWorldInfo(). ST updates its in-memory cache immediately,
 * so the next generation uses the new text. The disk write follows on ST's debounce.
 *
 * Only entries this bridge created (tagged with `wwId`) are ever updated or removed.
 * Entries you write by hand in the same book are never touched.
 */

const CHANNEL = 'writers-workbench-bridge';
const VERSION = '0.4.0';
const MAX_ENTRIES = 2000;
const MAX_CONTENT = 200000;
const MAX_KEY = 2000;       // one keyword (long regex keys included)
const MAX_KEYS = 500;       // keywords per list
const MAX_TEXT = 20000;     // any other text field
const LEADER_LOCK = 'writers-workbench-bridge-leader';

const ctx = () => SillyTavern.getContext();

/* SillyTavern added these to getContext() at different versions (getWorldInfoNames only
   in 1.18). Prefer getContext, fall back to importing world-info.js directly, which
   exports them from 1.12.12 on. */
let wiModule = null;
async function wi() {
    if (!wiModule) {
        try { wiModule = await import('../../../world-info.js'); } catch (e) { wiModule = {}; console.warn('[WW Bridge] could not import world-info.js', e); }
    }
    const c = ctx();
    return {
        loadWorldInfo: c.loadWorldInfo || wiModule.loadWorldInfo,
        saveWorldInfo: c.saveWorldInfo || wiModule.saveWorldInfo,
        updateWorldInfoList: c.updateWorldInfoList || wiModule.updateWorldInfoList,
        reloadEditor: c.reloadWorldInfoEditor || wiModule.reloadEditor,
        names: async () => {
            if (typeof c.getWorldInfoNames === 'function') return c.getWorldInfoNames();
            if (Array.isArray(wiModule.world_names)) return [...wiModule.world_names];
            try {
                const r = await fetch('/api/settings/get', { method: 'POST', headers: c.getRequestHeaders(), body: '{}' });
                const d = await r.json();
                return Array.isArray(d.world_names) ? d.world_names : [];
            } catch (_) { return []; }
        },
    };
}

let stVersion = '';
async function detectVersion() {
    try { const r = await fetch('/version'); const d = await r.json(); stVersion = d.pkgVersion || d.version || ''; } catch (_) { }
    return stVersion;
}

/* what's missing, in plain words, or '' if everything needed is there */
async function capabilityProblem() {
    const f = await wi();
    const missing = [];
    if (typeof f.loadWorldInfo !== 'function') missing.push('loadWorldInfo');
    if (typeof f.saveWorldInfo !== 'function') missing.push('saveWorldInfo');
    if (typeof f.updateWorldInfoList !== 'function') missing.push('updateWorldInfoList');
    if (!missing.length) return '';
    return `SillyTavern ${stVersion || '(unknown version)'} is missing ${missing.join(', ')}. The bridge needs 1.12.12 or newer.`;
}
const workbenchUrl = new URL('./writers-workbench.html', import.meta.url).href;

let channel = null;
let lastPush = null;
const log = [];

function note(line) {
    const t = new Date();
    log.unshift(`${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}  ${line}`);
    log.length = Math.min(log.length, 30);
    const el = document.getElementById('wwb_log');
    if (el) el.textContent = log.join('\n');
}

function setStatus(text, live) {
    const el = document.getElementById('wwb_status');
    if (!el) return;
    el.classList.toggle('live', !!live);
    el.querySelector('.wwb-text').textContent = text;
}

/* book names become file names on disk: keep them tame */
function cleanBookName(name) {
    return String(name || '')
        .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100);
}

/* only accept the entry fields ST uses, with sane types */
const ENTRY_DEFAULTS = {
    key: [], keysecondary: [], comment: '', content: '', constant: false, vectorized: false,
    selective: true, selectiveLogic: 0, addMemo: true, order: 100, position: 0, disable: false,
    excludeRecursion: false, preventRecursion: false, delayUntilRecursion: false,
    probability: 100, useProbability: true, depth: 4, group: '', groupOverride: false,
    groupWeight: 100, scanDepth: null, caseSensitive: null, matchWholeWords: null,
    useGroupScoring: null, automationId: '', role: null, sticky: 0, cooldown: 0, delay: 0,
};

/* `cut` counts every field that had to be shortened, so the Workbench can say so */
function sanitizeEntry(raw, cut) {
    if (!raw || typeof raw !== 'object') return null;
    const wwId = typeof raw.wwId === 'string' ? raw.wwId.slice(0, 120) : '';
    if (!wwId) return null;
    const out = { wwId };
    const clip = (str, max) => { if (str.length > max) { if (cut) cut.n++; return str.slice(0, max); } return str; };
    for (const [k, def] of Object.entries(ENTRY_DEFAULTS)) {
        const v = raw[k];
        if (v === undefined) { out[k] = Array.isArray(def) ? [] : def; continue; }
        if (Array.isArray(def)) {
            if (!Array.isArray(v)) { out[k] = []; continue; }
            const list = v.filter(x => typeof x === 'string');
            if (list.length > MAX_KEYS && cut) cut.n++;
            out[k] = list.slice(0, MAX_KEYS).map(x => clip(x, MAX_KEY));
        } else if (typeof def === 'boolean') {
            out[k] = !!v;
        } else if (typeof def === 'number') {
            out[k] = Number.isFinite(Number(v)) ? Number(v) : def;
        } else if (typeof def === 'string') {
            out[k] = clip(String(v), k === 'content' ? MAX_CONTENT : MAX_TEXT);
        } else {
            out[k] = (v === null || typeof v === 'boolean' || typeof v === 'number') ? v : def;
        }
    }
    /* anything ST has that we don't list (e.g. newer fields, or characterFilter / triggers kept
       from an imported entry) passes through if it's a plain value or small plain JSON */
    for (const [k, v] of Object.entries(raw)) {
        if (k in out || k === 'uid' || k === 'displayIndex' || k === '__proto__') continue;
        if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) out[k] = typeof v === 'string' ? clip(v, MAX_TEXT) : v;
        else if (typeof v === 'object') {
            let json;
            try { json = JSON.stringify(v); } catch (_) { continue; }
            if (typeof json !== 'string') continue;
            if (json.length > MAX_TEXT) { if (cut) cut.n++; continue; }
            out[k] = JSON.parse(json);
        }
    }
    return out;
}

const WB_COMMENT = /^\[(Character|Main|Location|Item|Faction|History|Concept|Scenario|Cast)\] /;

async function inspectBook(name) {
    const f = await wi();
    const book = cleanBookName(name);
    const exists = (await f.names()).includes(book);
    if (!exists) return { book, exists: false, total: 0, linked: 0, adoptable: 0 };
    const data = await f.loadWorldInfo(book);
    const entries = Object.values((data && data.entries) || {}).filter(e => e && typeof e === 'object');
    return {
        book, exists: true, total: entries.length,
        linked: entries.filter(e => typeof e.wwId === 'string').length,
        adoptable: entries.filter(e => typeof e.wwId !== 'string' && WB_COMMENT.test(String(e.comment || ''))).length,
    };
}

async function readBook(name) {
    const f = await wi();
    const book = cleanBookName(name);
    const exists = (await f.names()).includes(book);
    if (!exists) return { book, exists: false, data: { entries: {} } };
    const data = await f.loadWorldInfo(book);
    return { book, exists: true, data: JSON.parse(JSON.stringify(data || { entries: {} })) };
}

async function linkBook(msg) {
    const f = await wi();
    const book = cleanBookName(msg.book);
    const project = typeof msg.project === 'string' ? msg.project.slice(0, 120) : '';
    if (!book || !project) throw new Error('Missing lorebook or project');
    const data = await f.loadWorldInfo(book);
    if (!data || !data.entries) throw new Error('Lorebook not found');
    const byUid = new Map(Object.entries(data.entries).map(([k, e]) => [String(e && e.uid !== undefined ? e.uid : k), k]));
    let linked = 0;
    for (const l of (Array.isArray(msg.links) ? msg.links : [])) {
        if (!l || typeof l.wwId !== 'string') continue;
        const k = byUid.get(String(l.uid));
        if (k === undefined) continue;
        data.entries[k].wwId = l.wwId.slice(0, 120);
        data.entries[k].wwProject = project;
        linked++;
    }
    if (linked) await f.saveWorldInfo(book, data, false);
    return { book, linked };
}

async function pushBook(msg) {
    const f = await wi();
    const book = cleanBookName(msg.book);
    if (!book) throw new Error('No lorebook name');
    const cut = { n: 0 };
    const incoming = (Array.isArray(msg.entries) ? msg.entries : []).slice(0, MAX_ENTRIES).map(e => sanitizeEntry(e, cut)).filter(Boolean);
    const truncated = cut.n;

    const exists = (await f.names()).includes(book);
    let data = exists ? await f.loadWorldInfo(book) : null;
    if (!data || typeof data !== 'object') data = { entries: {} };
    if (!data.entries || typeof data.entries !== 'object') data.entries = {};

    /* index what's there */
    const byWw = new Map();
    let maxUid = -1;
    for (const [k, e] of Object.entries(data.entries)) {
        const uid = Number(e && e.uid !== undefined ? e.uid : k);
        if (Number.isFinite(uid)) maxUid = Math.max(maxUid, uid);
        if (e && typeof e.wwId === 'string') byWw.set(e.wwId, k);
    }

    const project = typeof msg.project === 'string' ? msg.project.slice(0, 120) : '';
    const known = Array.isArray(msg.knownIds) ? new Set(msg.knownIds.filter(x => typeof x === 'string')) : null;
    let created = 0, updated = 0, removed = 0, unchanged = 0, adopted = 0;
    const byComment = new Map();
    if (msg.adopt === true) {
        for (const [k, e] of Object.entries(data.entries)) {
            if (e && typeof e.wwId !== 'string' && WB_COMMENT.test(String(e.comment || ''))) {
                const c = String(e.comment);
                if (!byComment.has(c)) byComment.set(c, k);
            }
        }
    }
    const seen = new Set();

    for (const entry of incoming) {
        seen.add(entry.wwId);
        let key = byWw.get(entry.wwId);
        if (key === undefined && byComment.has(entry.comment)) {
            key = byComment.get(entry.comment);
            byComment.delete(entry.comment);
            byWw.set(entry.wwId, key);
            adopted++;
        }
        if (key !== undefined) {
            const prev = data.entries[key];
            const merged = { ...prev, ...entry, uid: prev.uid, displayIndex: prev.displayIndex ?? prev.uid };
            if (project) merged.wwProject = project;
            if (JSON.stringify(merged) === JSON.stringify(prev)) { unchanged++; continue; }
            data.entries[key] = merged;
            updated++;
        } else {
            maxUid++;
            data.entries[String(maxUid)] = { ...entry, uid: maxUid, displayIndex: maxUid, ...(project ? { wwProject: project } : {}) };
            created++;
        }
    }

    /* Remove an entry only when this same project made it and the project no longer has it.
       Entries from other projects, entries from before projects were tagged, and entries that
       are merely unticked in Export everything are all left alone. */
    if (msg.prune !== false && project && known) {
        for (const [k, e] of Object.entries(data.entries)) {
            if (e && typeof e.wwId === 'string' && e.wwProject === project && !known.has(e.wwId)) {
                delete data.entries[k];
                removed++;
            }
        }
    }

    if (!created && !updated && !removed && exists) {
        return { book, created, updated, removed, unchanged, adopted, truncated, createdBook: false };
    }

    /* new book: write now so it appears in ST's lists; existing book: cache now, disk on debounce */
    await f.saveWorldInfo(book, data, !exists);
    if (!exists && typeof f.updateWorldInfoList === 'function') await f.updateWorldInfoList();
    try { if (typeof f.reloadEditor === 'function') f.reloadEditor(book); } catch (_) { /* editor not open on this book */ }

    return { book, created, updated, removed, unchanged, adopted, truncated, createdBook: !exists };
}

function openChannel() {
    if (channel) return;
    if (typeof BroadcastChannel === 'undefined') {
        setStatus('This browser has no BroadcastChannel; live sync unavailable', false);
        return;
    }
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = async (ev) => {
        const msg = ev.data || {};
        if (msg.type === 'hello') {
            try {
                const problem = await capabilityProblem();
                if (problem) {
                    channel.postMessage({ type: 'error', message: problem, fatal: true });
                    setStatus(problem, false);
                    note(problem);
                    return;
                }
                const f = await wi();
                channel.postMessage({ type: 'ready', version: VERSION, st: stVersion, worlds: await f.names() });
                setStatus('Workbench connected', true);
                note('Workbench connected');
            } catch (err) {
                const m = 'Bridge error on connect: ' + (err && err.message || err);
                console.error('[WW Bridge]', err);
                channel.postMessage({ type: 'error', message: m, fatal: true });
                note(m);
            }
            return;
        }
        if (msg.type === 'list') {
            try { const f = await wi(); channel.postMessage({ type: 'worlds', worlds: await f.names() }); }
            catch (err) { channel.postMessage({ type: 'error', message: String(err && err.message || err) }); }
            return;
        }
        if (msg.type === 'inspect') {
            try { channel.postMessage({ type: 'inspected', requestId: msg.requestId, ...(await inspectBook(msg.book)) }); }
            catch (err) { channel.postMessage({ type: 'inspected', requestId: msg.requestId, error: String(err && err.message || err) }); }
            return;
        }
        if (msg.type === 'read') {
            try { channel.postMessage({ type: 'bookData', requestId: msg.requestId, ...(await readBook(msg.book)) }); }
            catch (err) { channel.postMessage({ type: 'bookData', requestId: msg.requestId, error: String(err && err.message || err) }); }
            return;
        }
        if (msg.type === 'link') {
            try {
                const r = await linkBook(msg);
                channel.postMessage({ type: 'linkedBook', requestId: msg.requestId, ...r });
                note(`${r.book}: linked ${r.linked} entries to a Workbench project`);
            } catch (err) { channel.postMessage({ type: 'linkedBook', requestId: msg.requestId, error: String(err && err.message || err) }); }
            return;
        }
        if (msg.type === 'push') {
            try {
                const r = await pushBook(msg);
                lastPush = r;
                channel.postMessage({ type: 'pushed', requestId: msg.requestId, ...r });
                const parts = [];
                if (r.createdBook) parts.push('new book');
                if (r.created) parts.push(`+${r.created}`);
                if (r.updated) parts.push(`~${r.updated}`);
                if (r.removed) parts.push(`-${r.removed}`);
                if (r.adopted) parts.push(`linked ${r.adopted}`);
                if (r.truncated) parts.push(`${r.truncated} truncated`);
                if (parts.length) note(`${r.book}: ${parts.join(' ')}`);
                if (r.createdBook) toastr.info(`Created lorebook "${r.book}". Activate it in World Info to use it in chat.`, "Writer's Workbench");
                setStatus(`Live: ${r.book}`, true);
            } catch (err) {
                channel.postMessage({ type: 'error', requestId: msg.requestId, message: String(err && err.message || err) });
                note(`Error: ${err && err.message || err}`);
                console.error('[WW Bridge]', err);
                setStatus('Last sync failed', false);
            }
        }
    };
    setStatus('Waiting for the Workbench', false);
}

function openWorkbench() {
    window.open(workbenchUrl, 'writers-workbench');
}

function addUi() {
    /* wand menu item */
    const menu = document.getElementById('extensionsMenu');
    if (menu && !document.getElementById('wwb_menu_item')) {
        const item = document.createElement('div');
        item.id = 'wwb_menu_item';
        item.className = 'list-group-item flex-container flexGap5 interactable';
        item.tabIndex = 0;
        item.innerHTML = '<div class="fa-solid fa-hammer extensionsMenuExtensionButton"></div><span>Writer\'s Workbench</span>';
        item.addEventListener('click', openWorkbench);
        menu.appendChild(item);
    }

    /* settings drawer */
    const host = document.getElementById('extensions_settings2');
    if (host && !document.getElementById('wwb_settings')) {
        const box = document.createElement('div');
        box.id = 'wwb_settings';
        box.className = 'inline-drawer';
        box.innerHTML = `
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>Writer's Workbench Bridge</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <div id="wwb_status" class="wwb-status"><span class="wwb-dot"></span><span class="wwb-text">Starting</span></div>
                <div class="menu_button" id="wwb_open">Open Writer's Workbench</div>
                <small>Sync to edit lorebooks.</small>
                <div id="wwb_log" class="wwb-log"></div>
            </div>`;
        host.appendChild(box);
        box.querySelector('#wwb_open').addEventListener('click', openWorkbench);
    }
}

/* open the channel and tell any waiting Workbench tab we're here */
async function startServing() {
    openChannel();
    const problem = await capabilityProblem();
    if (problem) { setStatus(problem, false); note(problem); }
    else if (channel) {
        /* a Workbench tab opened before this loaded would otherwise wait on its retry */
        const f = await wi();
        channel.postMessage({ type: 'ready', version: VERSION, st: stVersion, worlds: await f.names() });
    }
}

/* With two SillyTavern tabs open, both would answer every message and each would write the
   whole book from its own cache, so a stale tab could undo edits made in the other one.
   Only the tab holding this lock opens the channel; another takes over when it closes. */
async function startBridge() {
    const locks = typeof navigator !== 'undefined' && navigator.locks;
    if (!locks || typeof locks.request !== 'function') { await startServing(); return; }
    const serve = async () => {
        note('This tab is now handling the Workbench');
        try { await startServing(); } catch (err) { console.error('[WW Bridge] failed to start', err); }
        return new Promise(() => { });  // hold the lock until this tab closes
    };
    /* the request's own promise only settles when the lock is released, so don't await it */
    const got = await new Promise(resolve => {
        locks.request(LEADER_LOCK, { ifAvailable: true }, lock => {
            if (!lock) { resolve(false); return null; }
            resolve(true);
            return serve();
        }).catch(err => { console.error('[WW Bridge] lock failed', err); resolve(null); });
    });
    if (got === null) { await startServing(); return; }
    if (got) return;
    setStatus('Another SillyTavern tab is handling the Workbench', false);
    note('Another SillyTavern tab is handling the Workbench; this one takes over if it closes');
    locks.request(LEADER_LOCK, serve).catch(err => console.error('[WW Bridge] lock failed', err));
}

jQuery(async () => {
    try {
        addUi();
        await detectVersion();
        note(`Bridge ${VERSION} loaded on SillyTavern ${stVersion || '(unknown version)'}`);
        await startBridge();
        console.log(`[WW Bridge] ${VERSION} ready on SillyTavern ${stVersion}`);
    } catch (err) {
        console.error('[WW Bridge] failed to start', err);
    }
});
