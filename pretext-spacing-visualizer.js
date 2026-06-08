// ==========================================================================
// pretext-layout-visualizer.js: Debug tools for yiningkarlli.com's custom
// Knuth-Plass style justified text layout system
// ==========================================================================

// ==========================================================================
// MARK: MIT LICENSE
// ==========================================================================

// Copyright Yining Karl Li

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(() => {
// ==========================================================================
// MARK: Module constants and state
// ==========================================================================
const SPACING_VISUALIZER_QUERY_PARAM = 'spacing-debug';
const SETTINGS_EDITOR_QUERY_PARAM = 'edit';
const OVERLAY_VISIBILITY_SHORTCUT_KEY = 'h';
const BODY_LAYOUT_MIN_CHARS = 80;
const SECONDARY_LAYOUT_MIN_CHARS = 30;
const LAYOUT_ROOT_SELECTOR = '.post-content, .pretext-layout-root';
const PARAGRAPH_TARGET_SELECTOR = 'p, li, .newsrightbar';
const CAPTION_TARGET_SELECTOR = '.figcaption > span, .caption > span';
const SETTINGS_EDITOR_STYLE_ID = 'pretext-settings-editor-styles';
const SETTINGS_EDITOR_FIELDS = [
    { key: 'linePenalty', label: 'Line Penalty', min: 0, max: 80, step: 1 },
    { key: 'minSpaceWidthRatio', label: 'Min Space Width Ratio', min: 0.2, max: 1, step: 0.01 },
    { key: 'maxSpaceWidthRatio', label: 'Max Space Width Ratio', min: 1, max: 4, step: 0.01 },
    { key: 'adaptiveMaxSpaceWidthRetryCount', label: 'Adaptive Max Space Retries', min: 0, max: 12, step: 1 },
    { key: 'adaptiveMaxSpaceWidthStep', label: 'Adaptive Max Space Step', min: 1, max: 1.5, step: 0.01 },
    { key: 'adaptiveMaxSpaceWidthRatioCap', label: 'Adaptive Max Space Cap', min: 1, max: 6, step: 0.05 },
    { key: 'hyphenPenalty', label: 'Hyphen Penalty', min: 0, max: 1200, step: 10 },
    { key: 'adaptiveHyphenPenaltyRetryCount', label: 'Adaptive Hyphen Retries', min: 0, max: 10, step: 1 },
    { key: 'adaptiveHyphenPenaltyStep', label: 'Adaptive Hyphen Step', min: 0.5, max: 1, step: 0.01 },
    { key: 'consecutiveHyphenPenalty', label: 'Consecutive Hyphen Penalty', min: 0, max: 1200, step: 10 },
    { key: 'minSingleWordHyphenFillRatio', label: 'Min Single-Word Hyphen Fill', min: 0, max: 1, step: 0.01 },
    { key: 'minSingleWordHyphenChars', label: 'Min Single-Word Hyphen Chars', min: 1, max: 16, step: 1 },
    { key: 'finalLinePenalty', label: 'Final Line Penalty', min: 0, max: 300, step: 1 },
    { key: 'singleWordLastLinePenalty', label: 'Single-Word Last Line Penalty', min: 0, max: 5000, step: 25 }
];

const spacingVisualizerCanvas = document.createElement('canvas');
const spacingVisualizerContext = spacingVisualizerCanvas.getContext('2d');
const spacingVisualizerTextWidthCache = new Map();

let spacingVisualizerLayer = null;
let spacingVisualizerBadge = null;
let settingsEditorElement = null;
let settingsEditorStatus = null;
let settingsEditorComparisonToggle = null;
let settingsEditorBrowserHyphenationToggle = null;
let settingsEditorBrowserHyphenationEnabled = true;
let spacingVisualizerEnabled = false;
let spacingVisualizerObserver = null;
let spacingVisualizerRenderFrame = 0;
let settingsEditorRefreshTimeout = 0;
let debugOverlaysHidden = false;

// ==========================================================================
// MARK: Layout root queries and utilities
// ==========================================================================
function getLayoutRoots() {
    return Array.from(document.querySelectorAll(LAYOUT_ROOT_SELECTOR));
}

function queryLayoutRootElements(selector) {
    return getLayoutRoots().flatMap(root => Array.from(root.querySelectorAll(selector)));
}

function buildFontShorthand(cs) {
    return [(cs.fontStyle || 'normal'), (cs.fontVariant || 'normal'), (cs.fontWeight || '400'),
            (cs.fontSize || '16px'), (cs.fontFamily || 'sans-serif')].join(' ');
}

function measureTextWidth(text, font) {
    if (!spacingVisualizerContext) return 0;
    let fontCache = spacingVisualizerTextWidthCache.get(font);
    if (!fontCache) {
        fontCache = new Map();
        spacingVisualizerTextWidthCache.set(font, fontCache);
    }
    if (fontCache.has(text)) return fontCache.get(text);
    spacingVisualizerContext.font = font;
    const width = spacingVisualizerContext.measureText(text).width;
    fontCache.set(text, width);
    return width;
}

function debounce(fn, ms) {
    let t = null;
    return () => {
        clearTimeout(t);
        t = setTimeout(fn, ms);
    };
}

// ==========================================================================
// MARK: Debug overlay visibility
// ==========================================================================
function canToggleDebugOverlayVisibility() {
    return !!settingsEditorElement || spacingVisualizerEnabled;
}

function syncDebugOverlayVisibility() {
    [spacingVisualizerLayer, spacingVisualizerBadge, settingsEditorElement].forEach(element => {
        if (element) element.hidden = debugOverlaysHidden;
    });
    document.body.classList.toggle('pretext-debug-overlays-hidden', debugOverlaysHidden);
}

function setDebugOverlaysHidden(hidden) {
    debugOverlaysHidden = !!hidden;
    if (debugOverlaysHidden && settingsEditorElement?.contains(document.activeElement)) {
        document.activeElement.blur();
    }
    syncDebugOverlayVisibility();
}

function toggleDebugOverlayVisibility() {
    if (!canToggleDebugOverlayVisibility()) return;
    setDebugOverlaysHidden(!debugOverlaysHidden);
}

// ==========================================================================
// MARK: Settings editor
// ==========================================================================
function getPretextLayoutControls() {
    return window.__pretextLayoutControls || null;
}

function getSettingsSnapshot() {
    const controls = getPretextLayoutControls();
    return controls && typeof controls.getKnuthPlassSettings === 'function'
        ? controls.getKnuthPlassSettings()
        : null;
}

function scheduleSettingsEditorLayoutRefresh() {
    if (settingsEditorRefreshTimeout) clearTimeout(settingsEditorRefreshTimeout);
    settingsEditorRefreshTimeout = window.setTimeout(() => {
        settingsEditorRefreshTimeout = 0;
        const controls = getPretextLayoutControls();
        if (controls && typeof controls.refresh === 'function') controls.refresh();
        scheduleVisualizerRender();
        updateSettingsEditorStatus();
    }, 90);
}

function ensureSettingsEditorStyles() {
    if (document.getElementById(SETTINGS_EDITOR_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = SETTINGS_EDITOR_STYLE_ID;
    style.textContent = `
.pretext-settings-editor {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 50vh;
    z-index: 2147483000;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 16px 18px 18px;
    overflow: hidden;
    color: #f4f0e8;
    background: rgba(19, 23, 24, 0.96);
    border-top: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 -14px 40px rgba(0, 0, 0, 0.35);
    font: 13px/1.35 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.pretext-settings-editor[hidden],
.spacing-visualizer-layer[hidden],
.spacing-visualizer-badge[hidden] {
    display: none !important;
}
.pretext-settings-editor-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
}
.pretext-settings-editor-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 14px;
}
.pretext-settings-editor h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0;
}
.pretext-settings-editor-status {
    color: rgba(244, 240, 232, 0.72);
    font-size: 12px;
    text-align: right;
}
.pretext-settings-compare {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: rgba(244, 240, 232, 0.88);
    white-space: nowrap;
    cursor: pointer;
}
.pretext-settings-compare input {
    margin: 0;
}
html.pretext-browser-hyphenation-auto .pretext-layout-managed p.pretext-layout-eligible,
html.pretext-browser-hyphenation-auto .pretext-layout-managed li.pretext-layout-eligible {
    hyphens: auto;
}
html.pretext-browser-hyphenation-none .pretext-layout-managed p.pretext-layout-eligible,
html.pretext-browser-hyphenation-none .pretext-layout-managed li.pretext-layout-eligible {
    hyphens: none;
}
.pretext-settings-editor-body {
    overflow: auto;
    padding-right: 4px;
}
.pretext-settings-grid {
    display: grid;
    grid-template-columns: minmax(210px, 1.2fr) minmax(260px, 1fr) minmax(260px, 1fr);
    gap: 8px 14px;
    align-items: center;
}
.pretext-settings-grid-header {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 6px 0;
    color: rgba(244, 240, 232, 0.72);
    background: rgba(19, 23, 24, 0.96);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
}
.pretext-settings-label {
    color: #f4f0e8;
    font-weight: 650;
}
.pretext-settings-key {
    display: block;
    margin-top: 2px;
    color: rgba(244, 240, 232, 0.48);
    font-size: 11px;
    font-weight: 400;
}
.pretext-settings-control {
    display: grid;
    grid-template-columns: minmax(120px, 1fr) 86px;
    gap: 8px;
    align-items: center;
}
.pretext-settings-control input[type='range'] {
    width: 100%;
}
.pretext-settings-control input[type='number'] {
    box-sizing: border-box;
    width: 86px;
    padding: 5px 6px;
    color: #f4f0e8;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 4px;
    font: inherit;
}
.pretext-settings-editor-message {
    padding: 10px 0;
    color: rgba(244, 240, 232, 0.72);
}
@media (max-width: 760px) {
    .pretext-settings-editor {
        padding: 12px;
        font-size: 12px;
    }
    .pretext-settings-editor-header {
        display: block;
    }
    .pretext-settings-editor-actions {
        justify-content: flex-start;
        margin-top: 6px;
    }
    .pretext-settings-editor-status {
        margin-top: 4px;
        text-align: left;
    }
    .pretext-settings-grid {
        grid-template-columns: minmax(150px, 0.9fr) minmax(210px, 1fr) minmax(210px, 1fr);
        min-width: 620px;
    }
}
`;
    document.head.appendChild(style);
}

function getSettingGroupLabel(group) {
    return group === 'narrow' ? 'Narrow' : 'Standard';
}

function syncSettingsEditorBrowserHyphenation(snapshot) {
    const browserComparisonEnabled = !!snapshot?.browserJustifyComparisonEnabled;
    if (settingsEditorBrowserHyphenationToggle) {
        settingsEditorBrowserHyphenationToggle.checked = settingsEditorBrowserHyphenationEnabled;
        settingsEditorBrowserHyphenationToggle.disabled = !browserComparisonEnabled;
    }
    document.documentElement.classList.toggle(
        'pretext-browser-hyphenation-auto',
        browserComparisonEnabled && settingsEditorBrowserHyphenationEnabled
    );
    document.documentElement.classList.toggle(
        'pretext-browser-hyphenation-none',
        browserComparisonEnabled && !settingsEditorBrowserHyphenationEnabled
    );
}

function updateSettingsEditorStatus() {
    if (!settingsEditorStatus) return;
    const snapshot = getSettingsSnapshot();
    syncSettingsEditorBrowserHyphenation(snapshot);
    if (!snapshot) {
        settingsEditorStatus.textContent = 'Pretext layout controls are unavailable.';
        return;
    }
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const activeLabel = snapshot.usingNarrow ? 'narrow' : 'standard';
    settingsEditorStatus.textContent = `Viewport ${viewportWidth}px. Active settings: ${activeLabel}. Narrow threshold: ${snapshot.narrowMaxViewportWidth}px.`;
    if (settingsEditorComparisonToggle) {
        settingsEditorComparisonToggle.checked = !!snapshot.browserJustifyComparisonEnabled;
    }
}

function syncSettingsEditorInputs(group, key, value) {
    if (!settingsEditorElement) return;
    settingsEditorElement.querySelectorAll(`[data-setting-group="${group}"][data-setting-key="${key}"]`).forEach(input => {
        input.value = String(value);
    });
}

function handleSettingsEditorInput(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const group = input.dataset.settingGroup;
    const key = input.dataset.settingKey;
    if (!group || !key) return;

    const value = Number(input.value);
    if (!Number.isFinite(value)) return;

    const controls = getPretextLayoutControls();
    if (!controls || typeof controls.setKnuthPlassSetting !== 'function') return;
    if (!controls.setKnuthPlassSetting(group, key, value)) return;

    syncSettingsEditorInputs(group, key, value);
    scheduleSettingsEditorLayoutRefresh();
}

function handleSettingsEditorComparisonToggle(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const controls = getPretextLayoutControls();
    if (!controls || typeof controls.setBrowserJustifyComparison !== 'function') return;
    controls.setBrowserJustifyComparison(input.checked);
    scheduleVisualizerRender();
    updateSettingsEditorStatus();
}

function handleSettingsEditorBrowserHyphenationToggle(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    settingsEditorBrowserHyphenationEnabled = input.checked;
    syncSettingsEditorBrowserHyphenation(getSettingsSnapshot());
    scheduleVisualizerRender();
}

function createSettingsEditorInput(field, group, value, type) {
    const input = document.createElement('input');
    input.type = type;
    input.value = String(value);
    input.step = String(field.step);
    input.min = String(field.min);
    input.max = String(field.max);
    input.dataset.settingGroup = group;
    input.dataset.settingKey = field.key;
    input.setAttribute('aria-label', `${getSettingGroupLabel(group)} ${field.label}`);
    input.addEventListener('input', handleSettingsEditorInput);
    return input;
}

function createSettingsEditorControl(field, group, value) {
    const control = document.createElement('div');
    control.className = 'pretext-settings-control';
    control.appendChild(createSettingsEditorInput(field, group, value, 'range'));
    control.appendChild(createSettingsEditorInput(field, group, value, 'number'));
    return control;
}

function createSettingsEditorRow(field, snapshot) {
    const fragment = document.createDocumentFragment();
    const label = document.createElement('div');
    label.className = 'pretext-settings-label';
    label.textContent = field.label;

    const key = document.createElement('span');
    key.className = 'pretext-settings-key';
    key.textContent = field.key;
    label.appendChild(key);

    fragment.appendChild(label);
    fragment.appendChild(createSettingsEditorControl(field, 'standard', snapshot.standard[field.key]));
    fragment.appendChild(createSettingsEditorControl(field, 'narrow', snapshot.narrow[field.key]));
    return fragment;
}

function startSettingsEditor() {
    if (settingsEditorElement) return;
    ensureSettingsEditorStyles();

    settingsEditorElement = document.createElement('section');
    settingsEditorElement.className = 'pretext-settings-editor';
    settingsEditorElement.setAttribute('aria-label', 'Knuth-Plass settings editor');

    const header = document.createElement('div');
    header.className = 'pretext-settings-editor-header';

    const title = document.createElement('h2');
    title.textContent = 'Knuth-Plass Settings Editor';
    header.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'pretext-settings-editor-actions';

    const comparisonLabel = document.createElement('label');
    comparisonLabel.className = 'pretext-settings-compare';

    settingsEditorComparisonToggle = document.createElement('input');
    settingsEditorComparisonToggle.type = 'checkbox';
    settingsEditorComparisonToggle.addEventListener('change', handleSettingsEditorComparisonToggle);
    comparisonLabel.appendChild(settingsEditorComparisonToggle);
    comparisonLabel.appendChild(document.createTextNode('Compare browser justify'));
    actions.appendChild(comparisonLabel);

    const browserHyphenationLabel = document.createElement('label');
    browserHyphenationLabel.className = 'pretext-settings-compare';

    settingsEditorBrowserHyphenationToggle = document.createElement('input');
    settingsEditorBrowserHyphenationToggle.type = 'checkbox';
    settingsEditorBrowserHyphenationToggle.addEventListener(
        'change',
        handleSettingsEditorBrowserHyphenationToggle
    );
    browserHyphenationLabel.appendChild(settingsEditorBrowserHyphenationToggle);
    browserHyphenationLabel.appendChild(document.createTextNode('Browser hyphenation'));
    actions.appendChild(browserHyphenationLabel);

    settingsEditorStatus = document.createElement('div');
    settingsEditorStatus.className = 'pretext-settings-editor-status';
    actions.appendChild(settingsEditorStatus);
    header.appendChild(actions);
    settingsEditorElement.appendChild(header);

    const body = document.createElement('div');
    body.className = 'pretext-settings-editor-body';

    const snapshot = getSettingsSnapshot();
    if (!snapshot) {
        const message = document.createElement('div');
        message.className = 'pretext-settings-editor-message';
        message.textContent = 'Pretext layout controls are unavailable.';
        body.appendChild(message);
    } else {
        const grid = document.createElement('div');
        grid.className = 'pretext-settings-grid';

        ['Parameter', 'KNUTH_PLASS_SETTINGS', 'NARROW_KNUTH_PLASS_SETTINGS'].forEach(text => {
            const cell = document.createElement('div');
            cell.className = 'pretext-settings-grid-header';
            cell.textContent = text;
            grid.appendChild(cell);
        });

        SETTINGS_EDITOR_FIELDS.forEach(field => {
            grid.appendChild(createSettingsEditorRow(field, snapshot));
        });
        body.appendChild(grid);
    }

    settingsEditorElement.appendChild(body);
    document.body.appendChild(settingsEditorElement);
    updateSettingsEditorStatus();
    syncDebugOverlayVisibility();
    window.addEventListener('resize', updateSettingsEditorStatus);
}

// ==========================================================================
// MARK: Target classification and eligibility
// ==========================================================================
// The visualizer intentionally mirrors the layout script's target-selection
// rules so its boxes and tooltips describe the same set of eligible elements.
function getNormalizedLayoutText(el) {
    return el.textContent.replace(/\s+/g, ' ').trim();
}

function isFullCodeLikeBlock(el) {
    if (!el.querySelector('pre, code, tt')) return false;
    if (el.querySelector('pre')) return true;

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!/\S/.test(node.nodeValue || '')) return NodeFilter.FILTER_REJECT;
            return node.parentElement?.closest('code, tt')
                ? NodeFilter.FILTER_REJECT
                : NodeFilter.FILTER_ACCEPT;
        }
    });
    return walker.nextNode() === null;
}

function countRenderedLines(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const rects = Array.from(range.getClientRects()).filter(rect => rect.width > 0 && rect.height > 0);
    let count = 0;
    let previousTop = null;
    for (const rect of rects) {
        if (previousTop === null || Math.abs(rect.top - previousTop) > 1) {
            count += 1;
            previousTop = rect.top;
        }
    }
    return count;
}

function hasExcludedLayoutContent(el) {
    return !!el.querySelector('br, pre, img, canvas, svg, video, iframe, math') || isFullCodeLikeBlock(el);
}

function hasComplexListStructure(li) {
    return Array.from(li.children).some(child => /^(P|UL|OL|BLOCKQUOTE|FIGURE|TABLE|DIV|PRE|H[1-6])$/.test(child.tagName));
}

function getLayoutTargetKind(el) {
    if (!el || !el.matches('p, li, .newsrightbar')) return '';
    if (!el.isConnected || el.getClientRects().length === 0) return '';
    if (el.closest('.tableofcontents, .figcaption, .caption, .archive')) return '';
    if (el.classList.contains('references-section-content') || el.closest('.references-section-content')) return '';
    if (hasExcludedLayoutContent(el)) return '';

    if (el.matches('.newsrightbar')) return 'body-paragraph';

    if (el.matches('li')) {
        if (hasComplexListStructure(el)) return '';
        return 'list-item';
    }

    if (el.closest('li')) return 'list-item';
    if (el.closest('blockquote')) return 'blockquote-paragraph';
    return 'body-paragraph';
}

function getEligibleParagraphState(el) {
    const kind = getLayoutTargetKind(el);
    if (!kind) return null;

    const textLength = getNormalizedLayoutText(el).length;
    if (kind === 'body-paragraph') {
        return textLength >= BODY_LAYOUT_MIN_CHARS ? { kind, textLength } : null;
    }
    if (textLength < SECONDARY_LAYOUT_MIN_CHARS) return null;
    return countRenderedLines(el) > 1 ? { kind, textLength } : null;
}

function collectVisualizationState() {
    const eligibleParagraphs = [];
    const targets = [];
    const nodes = queryLayoutRootElements(`${PARAGRAPH_TARGET_SELECTOR}, ${CAPTION_TARGET_SELECTOR}`);

    for (const node of nodes) {
        if (!node || !node.isConnected || node.getClientRects().length === 0) continue;

        if (node.matches(CAPTION_TARGET_SELECTOR)) {
            if (node.classList.contains('pretext-layout-active')) targets.push(node);
            continue;
        }

        if (node.classList.contains('pretext-layout-active')) {
            eligibleParagraphs.push(node);
            targets.push(node);
            continue;
        }

        const paragraphState = getEligibleParagraphState(node);
        if (!paragraphState) continue;
        eligibleParagraphs.push(node);

        if (window.getComputedStyle(node).textAlign === 'justify') targets.push(node);
    }

    return { eligibleParagraphs, targets };
}

// ==========================================================================
// MARK: Word rect and line measurement
// ==========================================================================
function getWordRects(target) {
    const tokens = [];
    // Work from rendered DOM ranges instead of text metrics so the overlay sees
    // the exact positions produced by either browser layout or custom layout.
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            return /\S/.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });
    const range = document.createRange();

    let node;
    while ((node = walker.nextNode())) {
        const text = node.nodeValue || '';
        const regex = /\S+/g;
        let match;
        while ((match = regex.exec(text))) {
            range.setStart(node, match.index);
            range.setEnd(node, match.index + match[0].length);
            const rects = range.getClientRects();
            for (let i = 0; i < rects.length; i++) {
                const rect = rects[i];
                if (rect.width <= 0.5 || rect.height <= 0.5) continue;
                tokens.push({
                    left: rect.left + window.scrollX,
                    right: rect.right + window.scrollX,
                    top: rect.top + window.scrollY,
                    bottom: rect.bottom + window.scrollY,
                    height: rect.height
                });
            }
        }
    }

    return tokens.sort((a, b) => (a.top - b.top) || (a.left - b.left));
}

function getTargetVisualizationBounds(target, wordRects) {
    const rect = target.getBoundingClientRect();
    let left = rect.left + window.scrollX;
    let top = rect.top + window.scrollY;
    let right = rect.right + window.scrollX;
    let bottom = rect.bottom + window.scrollY;

    if (wordRects.length) {
        for (const wordRect of wordRects) {
            left = Math.min(left, wordRect.left);
            top = Math.min(top, wordRect.top);
            right = Math.max(right, wordRect.right);
            bottom = Math.max(bottom, wordRect.bottom);
        }
    }

    return {
        left,
        top,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top)
    };
}

function groupTokensByLine(tokens) {
    const lines = [];
    for (const token of tokens) {
        // Browser rect tops are noisy by a pixel or two, so line grouping uses
        // a small tolerance instead of exact top equality. Tokens are already
        // sorted by visual order, so each token can only belong to the current
        // line or a new following line.
        const line = lines[lines.length - 1];
        if (line && Math.abs(line.top - token.top) <= 2) {
            line.tokens.push(token);
            line.top = Math.min(line.top, token.top);
            line.bottom = Math.max(line.bottom, token.bottom);
        } else {
            lines.push({
                top: token.top,
                bottom: token.bottom,
                tokens: [token]
            });
        }
    }

    return lines
        .map(line => ({
            top: line.top,
            bottom: line.bottom,
            tokens: line.tokens.sort((a, b) => a.left - b.left)
        }))
        .filter(line => line.tokens.length > 1)
        .sort((a, b) => a.top - b.top);
}

function getTargetSpaceWidth(target) {
    const font = buildFontShorthand(window.getComputedStyle(target));
    return Math.max(measureTextWidth(' ', font), 1);
}

// ==========================================================================
// MARK: Visualizer label and box helpers
// ==========================================================================
function isLayoutEngineManaged() {
    return getLayoutRoots().some(layoutRoot => layoutRoot.classList.contains('pretext-layout-managed'));
}

function getRendererLabel(target) {
    const renderer = target.dataset.pretextLayoutRenderer || '';
    if (renderer === 'tree-replay') return 'Tree Replay';
    if (renderer === 'inline-flow') return 'Inline Flow';
    if (renderer === 'line-clone') return 'Line Clone';
    return '';
}

function getSolverLabel(target) {
    const engine = target.dataset.pretextLayoutEngine || '';
    if (engine === 'pretext') return 'Pretext';
    if (engine === 'custom') return 'Custom';
    if (engine === 'failed') return 'Failed';
    if (window.getComputedStyle(target).textAlign === 'justify') return 'Browser';
    if (target.classList.contains('pretext-layout-active')) return 'Custom Layout';
    return '';
}

function getLayoutLabel(target) {
    const solverLabel = getSolverLabel(target);
    const rendererLabel = getRendererLabel(target);
    if (solverLabel && rendererLabel) return `${solverLabel} / ${rendererLabel}`;
    if (solverLabel) return solverLabel;
    if (rendererLabel) return rendererLabel;
    return 'Inactive';
}

function getVisualizerBoxClass(target) {
    const renderer = target.dataset.pretextLayoutRenderer || '';
    if (renderer === 'tree-replay') return 'spacing-visualizer-eligible-tree';

    const engine = target.dataset.pretextLayoutEngine || '';
    if (engine === 'pretext') return 'spacing-visualizer-eligible-pretext';
    if (engine === 'custom') return 'spacing-visualizer-eligible-custom';
    if (window.getComputedStyle(target).textAlign === 'justify') return 'spacing-visualizer-eligible-browser';
    return 'spacing-visualizer-eligible-failed';
}

// ==========================================================================
// MARK: Visualizer rendering
// ==========================================================================
function ensureVisualizerElements() {
    if (!spacingVisualizerLayer) {
        spacingVisualizerLayer = document.createElement('div');
        spacingVisualizerLayer.className = 'spacing-visualizer-layer';
        document.body.appendChild(spacingVisualizerLayer);
    }

    if (!spacingVisualizerBadge) {
        spacingVisualizerBadge = document.createElement('div');
        spacingVisualizerBadge.className = 'spacing-visualizer-badge';
        spacingVisualizerBadge.textContent = 'Spacing Debug';
        document.body.appendChild(spacingVisualizerBadge);
    }
    syncDebugOverlayVisibility();
}

function syncLayerSize() {
    if (!spacingVisualizerLayer) return;
    spacingVisualizerLayer.style.height = `${Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.clientHeight
    )}px`;
}

function clearVisualizer() {
    if (spacingVisualizerLayer) spacingVisualizerLayer.replaceChildren();
}

function renderVisualizer() {
    spacingVisualizerRenderFrame = 0;
    if (!spacingVisualizerEnabled) return;

    ensureVisualizerElements();
    syncLayerSize();

    const { eligibleParagraphs, targets } = collectVisualizationState();
    const wordRectCache = new Map();
    const getWordRectsCached = target => {
        if (!wordRectCache.has(target)) wordRectCache.set(target, getWordRects(target));
        return wordRectCache.get(target);
    };
    const fragment = document.createDocumentFragment();
    if (isLayoutEngineManaged()) {
        for (const paragraph of eligibleParagraphs) {
            const rect = getTargetVisualizationBounds(paragraph, getWordRectsCached(paragraph));
            if (rect.width <= 0 || rect.height <= 0) continue;

            const box = document.createElement('div');
            const engine = paragraph.dataset.pretextLayoutEngine || '';
            box.className = `spacing-visualizer-eligible ${getVisualizerBoxClass(paragraph)}`;
            box.style.left = `${rect.left}px`;
            box.style.top = `${rect.top}px`;
            box.style.width = `${rect.width}px`;
            box.style.height = `${rect.height}px`;

            const label = document.createElement('div');
            label.className = 'spacing-visualizer-label';
            label.textContent = getLayoutLabel(paragraph);
            box.appendChild(label);

            if ((engine === 'pretext' || engine === 'custom') && paragraph.dataset.pretextLayoutAdjustment) {
                box.title = paragraph.dataset.pretextLayoutAdjustment;
            } else if (paragraph.dataset.pretextLayoutReason) {
                box.title = paragraph.dataset.pretextLayoutReason;
            }
            fragment.appendChild(box);
        }
    }

    for (const target of targets) {
        const lines = groupTokensByLine(getWordRectsCached(target));
        const spaceWidth = getTargetSpaceWidth(target);
        // Skip the final line because ragged last lines are expected and do not
        // indicate bad justification quality.
        for (const line of lines.slice(0, -1)) {
            for (let i = 0; i < line.tokens.length - 1; i++) {
                const current = line.tokens[i];
                const next = line.tokens[i + 1];
                const gapWidth = next.left - current.right;
                if (gapWidth <= 1) continue;

                const marker = document.createElement('div');
                const deviation = Math.abs((gapWidth / spaceWidth) - 1);
                const opacity = Math.min(0.72, 0.14 + (deviation * 0.28));
                const top = current.top + (current.height * 0.16);
                const height = current.height * 0.68;

                marker.className = 'spacing-visualizer-gap';
                marker.style.left = `${current.right}px`;
                marker.style.top = `${top}px`;
                marker.style.width = `${gapWidth}px`;
                marker.style.height = `${height}px`;
                marker.style.opacity = opacity.toFixed(3);
                fragment.appendChild(marker);
            }
        }
    }

    spacingVisualizerLayer.replaceChildren(fragment);
}

function scheduleVisualizerRender() {
    if (!spacingVisualizerEnabled) return;
    if (spacingVisualizerRenderFrame) cancelAnimationFrame(spacingVisualizerRenderFrame);
    spacingVisualizerRenderFrame = requestAnimationFrame(renderVisualizer);
}

// ==========================================================================
// MARK: Visualizer lifecycle and observers
// ==========================================================================
function startVisualizerObservers() {
    const layoutRoots = getLayoutRoots();
    if (!layoutRoots.length || spacingVisualizerObserver) return;

    // Watch post content only; observing body would also capture this overlay's
    // own DOM churn and can cause the visualizer to continuously retrigger.
    spacingVisualizerObserver = new MutationObserver(debounce(scheduleVisualizerRender, 80));
    layoutRoots.forEach(layoutRoot => {
        spacingVisualizerObserver.observe(layoutRoot, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    });
}

function stopVisualizerObservers() {
    if (!spacingVisualizerObserver) return;
    spacingVisualizerObserver.disconnect();
    spacingVisualizerObserver = null;
}

function setVisualizerEnabled(nextEnabled) {
    spacingVisualizerEnabled = !!nextEnabled;
    document.body.classList.toggle('spacing-visualizer-enabled', spacingVisualizerEnabled);

    if (!spacingVisualizerEnabled) {
        stopVisualizerObservers();
        clearVisualizer();
        setDebugOverlaysHidden(false);
        return;
    }

    ensureVisualizerElements();
    startVisualizerObservers();
    scheduleVisualizerRender();
}

// ==========================================================================
// MARK: Initialization and external API
// ==========================================================================
function shouldStartEnabled() {
    const params = new URLSearchParams(window.location.search);
    return params.has(SPACING_VISUALIZER_QUERY_PARAM) && params.get(SPACING_VISUALIZER_QUERY_PARAM) !== '0';
}

function shouldStartSettingsEditor() {
    const params = new URLSearchParams(window.location.search);
    return params.get(SETTINGS_EDITOR_QUERY_PARAM) === '1';
}

function handleShortcut(event) {
    const key = typeof event.key === 'string' ? event.key.toLowerCase() : '';
    const isOverlayToggleKey = key === OVERLAY_VISIBILITY_SHORTCUT_KEY || event.code === 'KeyH';

    if (isOverlayToggleKey && !event.altKey && !event.metaKey && !event.ctrlKey) {
        if (!canToggleDebugOverlayVisibility()) return;
        event.preventDefault();
        event.stopPropagation();
        toggleDebugOverlayVisibility();
    }
}

window.__spacingVisualizer = {
    // Small debug API for toggling/re-rendering from the console.
    enable() { setVisualizerEnabled(true); },
    disable() { setVisualizerEnabled(false); },
    toggle() { setVisualizerEnabled(!spacingVisualizerEnabled); },
    toggleOverlays() { toggleDebugOverlayVisibility(); },
    render() { scheduleVisualizerRender(); },
    isEnabled() { return spacingVisualizerEnabled; }
};

document.addEventListener('keydown', handleShortcut, true);
window.addEventListener('resize', debounce(scheduleVisualizerRender, 120));
window.addEventListener('load', scheduleVisualizerRender, { once: true });

function startWhenReady() {
    if (shouldStartSettingsEditor()) startSettingsEditor();
    if (!getLayoutRoots().length) return;
    if (shouldStartEnabled()) setVisualizerEnabled(true);
}

if (document.readyState === 'complete') startWhenReady();
else window.addEventListener('load', startWhenReady, { once: true });
})();
