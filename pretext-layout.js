// ==========================================================================
// pretext-layout.js: Javascript implementation of a Knuth-Plass style 
// justified text layout system, for yiningkarlli.com
// ==========================================================================

// ==========================================================================
// MARK: MIT LICENSE
// ==========================================================================

// Copyright Yining Karl Li

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// ==========================================================================
// MARK: Module constants, state, and configuration
// ==========================================================================
// Set to false to disable Knuth-Plass layout site-wide and fall back to CSS justification.
const PRETEXT_ENABLED = true;
const PRETEXT_MODULE_URL = '/pretext/pretext-0.0.3.bundle.mjs';
const PRETEXT_PLAIN_PARAGRAPH_MODE = 'knuth-plass'; // 'off' | 'greedy' | 'knuth-plass'
const PRETEXT_PLAIN_CAPTION_MODE = 'off'; // 'off' | 'greedy' | 'knuth-plass'
const USE_FORWARD_ACTIVE_NODE_KNUTH_PLASS = true;

const paragraphState = new WeakMap();
const textWidthCache = new Map();
const hyphenBreakCache = new Map();
const measureCanvas = document.createElement('canvas');
const measureContext = measureCanvas.getContext('2d');
const fontLoadPromiseCache = new Map();
const readyParagraphRenderQueue = new Set();
const readyCaptionRenderQueue = new Set();
const observedParagraphTargets = new Set();
const observedCaptionTargets = new Set();
const waitingParagraphTargets = new WeakSet();
const waitingCaptionTargets = new WeakSet();
const READY_RENDER_FRAME_BUDGET_MS = 8;
const RESIZE_VISIBLE_VIEWPORT_MARGIN_PX = 160;
const RESIZE_SETTLE_FULL_RELAYOUT_DELAY_MS = 180;
let pretextModulePromise = null;
let pretextModule = null;
let activePassProfile = null;
let readyRenderFrame = 0;
let resizeVisibleRelayoutFrame = 0;
let layoutTargetRescanTimeout = 0;
let resizeSettledFullRelayoutTimeout = 0;
let hasStartedLayoutInit = false;
const PRETEXT_LAYOUT_TOGGLE_EVENT = 'pretext-layout-toggle';
let pretextLayoutUserEnabled = !(window.__sitePreferences && window.__sitePreferences.layout === 'left');
let browserJustifyComparisonEnabled = false;
// Exposed for ad-hoc debugging from the console without needing a bundler/devtools hook.
const status = {
    loaded: false,
    reason: 'not-started',
    paragraphCount: 0,
    pretextModuleLoaded: false,
    pretextModuleReason: PRETEXT_PLAIN_PARAGRAPH_MODE === 'off' && PRETEXT_PLAIN_CAPTION_MODE === 'off'
        ? 'unused'
        : 'not-started',
    passProfile: null,
    lastError: null
};
window.__pretextLayoutStatus = status;
const BODY_LAYOUT_MIN_CHARS = 80;
const SECONDARY_LAYOUT_MIN_CHARS = 30;
const LAYOUT_ROOT_SELECTOR = '.post-content, .pretext-layout-root';
const PARAGRAPH_TARGET_SELECTOR = 'p, li, .newsrightbar';
const CAPTION_TARGET_SELECTOR = '.figcaption > span, .caption > span';
const STARTUP_PENDING_CLASS = 'pretext-layout-startup-pending';
const ELEMENT_PENDING_CLASS = 'pretext-layout-pending';
const settledParagraphTargets = new WeakSet();

// ==========================================================================
// MARK: Layout roots and visibility utilities
// ==========================================================================
function getLayoutRoots() {
    return Array.from(document.querySelectorAll(LAYOUT_ROOT_SELECTOR));
}

function queryLayoutRootElements(selector) {
    return getLayoutRoots().flatMap(root => Array.from(root.querySelectorAll(selector)));
}

function clearStartupPendingVisibility() {
    document.documentElement.classList.remove(STARTUP_PENDING_CLASS);
}

function setParagraphPendingVisibility(element, pending) {
    if (!element) return;
    element.classList.toggle(ELEMENT_PENDING_CLASS, !!pending);
}

function settleParagraphVisibility(element) {
    if (!element) return;
    settledParagraphTargets.add(element);
    setParagraphPendingVisibility(element, false);
}

function syncPendingParagraphVisibility(eligibleParagraphs) {
    const eligibleSet = new Set(eligibleParagraphs);
    queryLayoutRootElements(PARAGRAPH_TARGET_SELECTOR).forEach(paragraph => {
        setParagraphPendingVisibility(paragraph, eligibleSet.has(paragraph) && !settledParagraphTargets.has(paragraph));
    });
    clearStartupPendingVisibility();
}

function clearAllPendingParagraphVisibility() {
    queryLayoutRootElements(PARAGRAPH_TARGET_SELECTOR).forEach(paragraph => {
        setParagraphPendingVisibility(paragraph, false);
    });
    clearStartupPendingVisibility();
}

// ==========================================================================
// MARK: Pass profiling
// ==========================================================================
function createProfileBucket() {
    return { ms: 0, count: 0 };
}

function createPassProfile() {
    return {
        rememberOriginal: createProfileBucket(),
        naturalLineCount: createProfileBucket(),
        pretextSourcePrep: createProfileBucket(),
        pretextPrepare: { ...createProfileBucket(), cacheHits: 0, cacheMisses: 0 },
        pretextGreedy: createProfileBucket(),
        pretextSolve: createProfileBucket(),
        customSolve: createProfileBucket(),
        domRender: createProfileBucket(),
        domRenderLineClone: createProfileBucket(),
        domRenderInlineFlow: createProfileBucket(),
        domRenderTreeReplay: createProfileBucket(),
        pretextFallbacks: 0,
        paragraphEngines: {
            pretext: 0,
            custom: 0,
            failed: 0
        },
        captionEngines: {
            pretext: 0,
            custom: 0,
            failed: 0
        }
    };
}

function withProfileBucket(bucketName, fn) {
    const bucket = activePassProfile?.[bucketName];
    if (!bucket) return fn();
    const startedAt = performance.now();
    try {
        return fn();
    } finally {
        bucket.ms += performance.now() - startedAt;
        bucket.count += 1;
    }
}

function summarizeProfileBucket(bucket) {
    return {
        ms: Number(bucket.ms.toFixed(1)),
        count: bucket.count
    };
}

function summarizePassProfile(profile) {
    if (!profile) return null;
    return {
        rememberOriginal: summarizeProfileBucket(profile.rememberOriginal),
        naturalLineCount: summarizeProfileBucket(profile.naturalLineCount),
        pretextSourcePrep: summarizeProfileBucket(profile.pretextSourcePrep),
        pretextPrepare: {
            ...summarizeProfileBucket(profile.pretextPrepare),
            cacheHits: profile.pretextPrepare.cacheHits,
            cacheMisses: profile.pretextPrepare.cacheMisses
        },
        pretextGreedy: summarizeProfileBucket(profile.pretextGreedy),
        pretextSolve: summarizeProfileBucket(profile.pretextSolve),
        customSolve: summarizeProfileBucket(profile.customSolve),
        domRender: summarizeProfileBucket(profile.domRender),
        domRenderLineClone: summarizeProfileBucket(profile.domRenderLineClone),
        domRenderInlineFlow: summarizeProfileBucket(profile.domRenderInlineFlow),
        domRenderTreeReplay: summarizeProfileBucket(profile.domRenderTreeReplay),
        pretextFallbacks: profile.pretextFallbacks,
        paragraphEngines: { ...profile.paragraphEngines },
        captionEngines: { ...profile.captionEngines }
    };
}

function withDomRenderProfile(rendererBucketName, fn) {
    return withProfileBucket('domRender', () => withProfileBucket(rendererBucketName, fn));
}

function summarizeElementText(element, maxLength = 220) {
    const text = (element?.textContent || '').replace(/\s+/g, ' ').trim();
    return text.length > maxLength
        ? `${text.slice(0, maxLength - 1)}…`
        : text;
}

function describeLayoutError(error) {
    if (!error) return 'Unknown error';
    const name = typeof error.name === 'string' && error.name ? error.name : 'Error';
    const message = typeof error.message === 'string' && error.message ? error.message : String(error);
    return message && message !== name ? `${name}: ${message}` : name;
}

// ==========================================================================
// MARK: Knuth-Plass settings
// ==========================================================================
const KNUTH_PLASS_SETTINGS = {
    useForwardActiveNodeSolver: 1, // default-on switch for routing breakLinesKnuthPlass() to the forward active-node implementation. Set to 0 to use the older backward DP body.
    linePenalty: 10, // general penalty for adding a line break. Higher values tend to prefer fewer, fuller lines.
    minSpaceWidthRatio: 0.50, // minimum allowed word-space width as a fraction of the font’s normal space width. Increase this to prevent words from visually merging.
    maxSpaceWidthRatio: 1.5, // maximum allowed word-space width. Decrease this if some lines look too airy.
    adaptiveMaxSpaceWidthRetryCount: 6, // if a paragraph fails only because spaces would need to stretch too far, retry a few times with a slightly looser max just for that paragraph.
    adaptiveMaxSpaceWidthStep: 1.1, // each retry raises the paragraph-local max space width ratio by 10%.
    adaptiveMaxSpaceWidthRatioCap: 3.0, // hard ceiling for the paragraph-local max space width fallback.
    hyphenPenalty: 420, // penalty for ending a line with a discretionary hyphen. Increase to make hyphenation rarer.
    adaptiveHyphenPenaltyRetryCount: 3, // if widened spacing still cannot solve the paragraph, retry with a lower paragraph-local hyphen penalty to make end-of-line hyphenation more attractive.
    adaptiveHyphenPenaltyStep: 0.85, // each retry lowers the paragraph-local hyphen penalty by 15%.
    consecutiveHyphenPenalty: 220, // extra penalty when adjacent lines both end in discretionary hyphens.
    minSingleWordHyphenFillRatio: 0.5, // tuned to avoid tiny orphaned fragments on narrow layouts by requiring a hyphenated single-word line to still occupy a meaningful portion of the measure.
    minSingleWordHyphenChars: 4, // tuned to avoid tiny orphaned fragments such as "win-" sitting alone on a line.
    finalLinePenalty: 35, // penalty applied to a short ragged last line. Higher values push more text onto the last line’s predecessor.
    singleWordLastLinePenalty: 1200 // discourages a one-word final line without fully banning it.
};

const CAPTION_KNUTH_PLASS_SETTINGS = {
    useForwardActiveNodeSolver: 1,
    linePenalty: 12,
    minSpaceWidthRatio: 0.7,
    maxSpaceWidthRatio: 1.25,
    hyphenPenalty: 180,
    consecutiveHyphenPenalty: 300,
    minSingleWordHyphenFillRatio: 0.58, // same orphan-fragment guard as body text, but slightly stricter for narrow caption measures.
    minSingleWordHyphenChars: 5, // same orphan-fragment guard as body text, but slightly stricter for narrow caption measures.
    finalLinePenalty: 45,
    singleWordLastLinePenalty: 1800
};

// Viewport width at or below which paragraphs and captions use the narrow
// settings copies below. Tune this together with the narrow settings.
const NARROW_KNUTH_PLASS_SETTINGS_MAX_VIEWPORT_WIDTH_PX = 760;

// Narrow viewport settings intentionally start as exact copies of the wider
// settings so they can be tuned independently without changing wide layouts.
const NARROW_KNUTH_PLASS_SETTINGS = {
    ...KNUTH_PLASS_SETTINGS,
    linePenalty: 2,
    hyphenPenalty: 50,
    consecutiveHyphenPenalty: 120
};

const NARROW_CAPTION_KNUTH_PLASS_SETTINGS = {
    ...CAPTION_KNUTH_PLASS_SETTINGS
};

function getLayoutViewportWidth() {
    return window.innerWidth || document.documentElement?.clientWidth || 0;
}

function shouldUseNarrowKnuthPlassSettings() {
    const viewportWidth = getLayoutViewportWidth();
    return viewportWidth > 0 && viewportWidth <= NARROW_KNUTH_PLASS_SETTINGS_MAX_VIEWPORT_WIDTH_PX;
}

function getActiveKnuthPlassSettings() {
    return shouldUseNarrowKnuthPlassSettings()
        ? NARROW_KNUTH_PLASS_SETTINGS
        : KNUTH_PLASS_SETTINGS;
}

function getActiveCaptionKnuthPlassSettings() {
    return shouldUseNarrowKnuthPlassSettings()
        ? NARROW_CAPTION_KNUTH_PLASS_SETTINGS
        : CAPTION_KNUTH_PLASS_SETTINGS;
}

function cloneKnuthPlassSettings(settings) {
    return { ...settings };
}

function getKnuthPlassSettingsSnapshot() {
    return {
        standard: cloneKnuthPlassSettings(KNUTH_PLASS_SETTINGS),
        narrow: cloneKnuthPlassSettings(NARROW_KNUTH_PLASS_SETTINGS),
        narrowMaxViewportWidth: NARROW_KNUTH_PLASS_SETTINGS_MAX_VIEWPORT_WIDTH_PX,
        usingNarrow: shouldUseNarrowKnuthPlassSettings(),
        browserJustifyComparisonEnabled: isBrowserJustifyComparisonEnabled()
    };
}

function setKnuthPlassSetting(group, key, value) {
    const settings = group === 'narrow'
        ? NARROW_KNUTH_PLASS_SETTINGS
        : group === 'standard'
            ? KNUTH_PLASS_SETTINGS
            : null;
    const numericValue = Number(value);
    if (!settings || !Object.prototype.hasOwnProperty.call(settings, key) || !Number.isFinite(numericValue)) {
        return false;
    }
    settings[key] = numericValue;
    return true;
}

// Manual hyphenation overrides. Each number is a character slice position
// where the solver may split the word and render a trailing hyphen.
const HYPHENATION_EXCEPTIONS = Object.freeze(Object.assign(Object.create(null), {
    azimuthal: [4, 6],
    difficult: [3, 6],
    hyperion: [3, 5],
    implemented: [3, 6, 9],
    importance: [2, 4, 8],
    marschner: [4],
    melanin: [3, 5],
    pxrhaircolor: [3, 7],
    pxrsurface: [3],
    pxrmarschnerhair: [3, 12],
    randomization: [3, 6, 8, 10],
    reparameterization: [2, 4, 7, 10, 12],
    renderman: [3, 6],
    renderer: [3],
    scattering: [4, 7],
    variation: [3, 5, 7],
    vrayhairnextmtl: [4, 8, 12],
    takua: [3]
}));

// ==========================================================================
// MARK: Paragraph state and font helpers
// ==========================================================================
function setManagedParagraphAlignment(enabled) {
    getLayoutRoots().forEach(layoutRoot => {
        layoutRoot.classList.toggle('pretext-layout-managed', !!enabled);
    });
}

function setParagraphLayoutState(p, state, reason) {
    p.dataset.pretextLayoutState = state;
    if (reason) p.dataset.pretextLayoutReason = reason;
    else delete p.dataset.pretextLayoutReason;
}

function setParagraphLayoutAdjustment(p, adjustment) {
    if (adjustment) p.dataset.pretextLayoutAdjustment = adjustment;
    else delete p.dataset.pretextLayoutAdjustment;
}

function setParagraphLayoutEngine(p, engine) {
    if (engine) p.dataset.pretextLayoutEngine = engine;
    else delete p.dataset.pretextLayoutEngine;
}

function setParagraphLayoutRenderer(p, renderer) {
    if (renderer) p.dataset.pretextLayoutRenderer = renderer;
    else delete p.dataset.pretextLayoutRenderer;
}

function setParagraphEligibilityClass(p, eligible) {
    p.classList.toggle('pretext-layout-eligible', !!eligible);
}

function buildFontShorthand(cs) {
    return [(cs.fontStyle || 'normal'), (cs.fontVariant || 'normal'), (cs.fontWeight || '400'),
            (cs.fontSize || '16px'), (cs.fontFamily || 'sans-serif')].join(' ');
}

// ==========================================================================
// MARK: Module loading and font loading
// ==========================================================================
function needsPretextModule() {
    return PRETEXT_PLAIN_PARAGRAPH_MODE !== 'off' || PRETEXT_PLAIN_CAPTION_MODE !== 'off';
}

function loadPretextModule() {
    if (!needsPretextModule()) {
        status.pretextModuleLoaded = false;
        status.pretextModuleReason = 'unused';
        return Promise.resolve(null);
    }
    if (pretextModule) return Promise.resolve(pretextModule);
    if (!pretextModulePromise) {
        status.pretextModuleReason = 'loading';
        pretextModulePromise = import(PRETEXT_MODULE_URL)
            .then(mod => {
                pretextModule = mod;
                status.pretextModuleLoaded = true;
                status.pretextModuleReason = 'loaded';
                return mod;
            })
            .catch(error => {
                pretextModulePromise = null;
                pretextModule = null;
                status.pretextModuleLoaded = false;
                status.pretextModuleReason = 'load-failed';
                console.warn('[pretext-layout] failed to load Pretext module; falling back to custom engine.', error);
                return null;
            });
    }
    return pretextModulePromise;
}

function getFontLoadSampleText(element, maxLength = 64) {
    const sample = getNormalizedLayoutText(element).slice(0, maxLength);
    return sample || 'BESbswy';
}

function waitForElementFont(element) {
    if (!element?.isConnected || !document.fonts?.load) return Promise.resolve();

    try {
        const font = buildFontShorthand(window.getComputedStyle(element));
        const sampleText = getFontLoadSampleText(element);
        // Fonts can resolve at different times across paragraphs depending on
        // which faces their computed stack actually uses, so readiness is gated
        // per target instead of on the global document.fonts.ready promise.
        const cacheKey = `${font}\n${sampleText}`;
        if (!fontLoadPromiseCache.has(cacheKey)) {
            const fontLoadPromise = document.fonts.load(font, sampleText)
                .then(() => undefined)
                .catch(() => undefined);
            fontLoadPromiseCache.set(cacheKey, fontLoadPromise);
        }
        return fontLoadPromiseCache.get(cacheKey);
    } catch (_) {
        return Promise.resolve();
    }
}

// ==========================================================================
// MARK: Scheduling and render queue management
// ==========================================================================
function scheduleLayoutTargetRescan(delayMs = 0) {
    if (delayMs <= 0) {
        requestAnimationFrame(() => {
            scanAndScheduleLayoutTargets();
        });
        return;
    }
    if (layoutTargetRescanTimeout) clearTimeout(layoutTargetRescanTimeout);
    layoutTargetRescanTimeout = window.setTimeout(() => {
        layoutTargetRescanTimeout = 0;
        scanAndScheduleLayoutTargets();
    }, delayMs);
}

function scheduleVisibleResizeRelayout() {
    if (resizeVisibleRelayoutFrame) return;
    resizeVisibleRelayoutFrame = requestAnimationFrame(() => {
        resizeVisibleRelayoutFrame = 0;
        runVisibleResizeRelayoutPass();
    });
}

function scheduleResizeSettledFullRelayout() {
    if (resizeSettledFullRelayoutTimeout) clearTimeout(resizeSettledFullRelayoutTimeout);
    resizeSettledFullRelayoutTimeout = window.setTimeout(() => {
        resizeSettledFullRelayoutTimeout = 0;
        runResizeSettledRelayoutPass();
    }, RESIZE_SETTLE_FULL_RELAYOUT_DELAY_MS);
}

function handleResizeRelayout() {
    scheduleVisibleResizeRelayout();
    scheduleResizeSettledFullRelayout();
}

function cancelReadyRenderFlush() {
    if (!readyRenderFrame) return;
    cancelAnimationFrame(readyRenderFrame);
    readyRenderFrame = 0;
}

// Discards any incrementally queued renders and cancels their pending frame.
// Called before a full synchronous relayout pass so stale incremental work
// doesn't race with or duplicate the fresh pass.
function clearReadyRenderQueues() {
    readyParagraphRenderQueue.clear();
    readyCaptionRenderQueue.clear();
    cancelReadyRenderFlush();
}

function scheduleReadyRenderFlush() {
    if (readyRenderFrame) return;
    readyRenderFrame = requestAnimationFrame(() => {
        readyRenderFrame = 0;
        flushReadyRenderQueue();
    });
}

function queueReadyParagraphRender(paragraph) {
    if (!paragraph?.isConnected) return;
    readyParagraphRenderQueue.add(paragraph);
    scheduleReadyRenderFlush();
}

function queueReadyCaptionRender(caption) {
    if (!caption?.isConnected) return;
    readyCaptionRenderQueue.add(caption);
    scheduleReadyRenderFlush();
}

function requestParagraphRenderWhenReady(paragraph) {
    if (!paragraph?.isConnected || waitingParagraphTargets.has(paragraph)) return;
    waitingParagraphTargets.add(paragraph);
    Promise.all([
        waitForElementFont(paragraph),
        loadPretextModule()
    ])
        .then(() => {
            queueReadyParagraphRender(paragraph);
        })
        .finally(() => {
            waitingParagraphTargets.delete(paragraph);
        });
}

function requestCaptionRenderWhenReady(caption) {
    if (!caption?.isConnected || waitingCaptionTargets.has(caption)) return;
    waitingCaptionTargets.add(caption);
    Promise.all([
        waitForElementFont(caption),
        loadPretextModule()
    ])
        .then(() => {
            queueReadyCaptionRender(caption);
        })
        .finally(() => {
            waitingCaptionTargets.delete(caption);
        });
}

// ==========================================================================
// MARK: Target observation and render pass orchestration
// ==========================================================================
function observeParagraphTarget(paragraph) {
    if (observedParagraphTargets.has(paragraph)) return;
    observedParagraphTargets.add(paragraph);
}

function observeCaptionTarget(caption) {
    if (observedCaptionTargets.has(caption)) return;
    observedCaptionTargets.add(caption);
}

function summarizeObservedParagraphCount() {
    let count = 0;
    observedParagraphTargets.forEach(paragraph => {
        if (paragraph?.isConnected) count += 1;
    });
    return count;
}

function summarizeObservedCaptionCount() {
    let count = 0;
    observedCaptionTargets.forEach(caption => {
        if (caption?.isConnected) count += 1;
    });
    return count;
}

// Wraps a render callback with per-pass timing and profiling bookkeeping.
// Shared by the startup queue, the live viewport-limited resize pass, and the
// settled full-page resize pass.
function runRenderPass(fn) {
    const startedAt = performance.now();
    activePassProfile = createPassProfile();
    try {
        return fn();
    } finally {
        const elapsedMs = performance.now() - startedAt;
        const passProfileSummary = summarizePassProfile(activePassProfile);
        status.paragraphCount = summarizeObservedParagraphCount();
        status.passProfile = passProfileSummary;
        console.log(`[pretext-layout] pass completed in ${elapsedMs.toFixed(1)}ms`, passProfileSummary);
        activePassProfile = null;
    }
}

function renderQueuedParagraph(paragraph, paragraphMetadata) {
    if (!paragraph?.isConnected) return false;
    try {
        renderParagraph(paragraph, getPassLayoutMetadata(paragraph, paragraphMetadata));
    } catch (error) {
        restore(paragraph);
        settleParagraphVisibility(paragraph);
        setParagraphEligibilityClass(paragraph, false);
        setParagraphLayoutAdjustment(paragraph, '');
        setParagraphLayoutEngine(paragraph, 'failed');
        if (activePassProfile) activePassProfile.paragraphEngines.failed += 1;
        const errorSummary = describeLayoutError(error);
        const paragraphSummary = summarizeElementText(paragraph);
        status.lastError = {
            scope: 'paragraph',
            error: errorSummary,
            text: paragraphSummary
        };
        console.error('[pretext-layout] paragraph layout failed', {
            error,
            errorSummary,
            text: paragraphSummary
        });
        setParagraphLayoutState(paragraph, 'inactive', `Knuth-Plass pass threw ${errorSummary}.`);
    }
    return true;
}

function renderQueuedCaption(caption, captionMetadata) {
    if (!caption?.isConnected) return false;
    try {
        renderCaption(caption, getPassCaptionMetadata(caption, captionMetadata));
    } catch (error) {
        restore(caption);
        if (activePassProfile) activePassProfile.captionEngines.failed += 1;
        const errorSummary = describeLayoutError(error);
        const captionSummary = summarizeElementText(caption);
        status.lastError = {
            scope: 'caption',
            error: errorSummary,
            text: captionSummary
        };
        console.error('[pretext-layout] caption layout failed', {
            error,
            errorSummary,
            text: captionSummary
        });
    }
    return true;
}

function dequeueNextConnectedTarget(queue) {
    for (const target of queue) {
        queue.delete(target);
        if (target?.isConnected) return target;
    }
    return null;
}

function flushReadyRenderQueue() {
    if (!readyParagraphRenderQueue.size && !readyCaptionRenderQueue.size) {
        if (!summarizeObservedParagraphCount() && !summarizeObservedCaptionCount()) status.reason = 'no-eligible-paragraphs';
        return;
    }

    const frameStartedAt = performance.now();
    runRenderPass(() => {
        const paragraphMetadata = new WeakMap();
        const captionMetadata = new WeakMap();
        let renderedAny = false;

        while (true) {
            const nextParagraph = dequeueNextConnectedTarget(readyParagraphRenderQueue);
            if (nextParagraph) {
                renderedAny = renderQueuedParagraph(nextParagraph, paragraphMetadata) || renderedAny;
            } else {
                const nextCaption = dequeueNextConnectedTarget(readyCaptionRenderQueue);
                if (!nextCaption) break;
                renderedAny = renderQueuedCaption(nextCaption, captionMetadata) || renderedAny;
            }

            if ((performance.now() - frameStartedAt) >= READY_RENDER_FRAME_BUDGET_MS) break;
        }

        if (renderedAny) status.reason = 'active';
        else if (!summarizeObservedParagraphCount() && !summarizeObservedCaptionCount()) status.reason = 'no-eligible-paragraphs';
    });

    if (readyParagraphRenderQueue.size || readyCaptionRenderQueue.size) {
        scheduleReadyRenderFlush();
    }
}

// ==========================================================================
// MARK: Layout target collection and resize passes
// ==========================================================================
function isElementVisibleInViewport(element, marginPx = 0) {
    if (!element?.isConnected) return false;
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    return rect.bottom >= -marginPx
        && rect.top <= viewportHeight + marginPx
        && rect.right >= 0
        && rect.left <= viewportWidth;
}

// Queries the DOM for candidate layout targets and partitions them into
// potential and eligible sets. Shared by startup scanning and both resize
// relayout modes so the selection logic stays consistent.
function collectLayoutTargetsForPass({ paragraphFilter = null, captionFilter = null } = {}) {
    const paragraphMetadata = new WeakMap();
    const captionMetadata = new WeakMap();
    const paragraphs = queryLayoutRootElements(PARAGRAPH_TARGET_SELECTOR).filter(paragraph => {
        if (paragraphFilter && !paragraphFilter(paragraph)) return false;
        const metadata = getPassLayoutMetadata(paragraph, paragraphMetadata);
        return isPotentialLayoutTarget(paragraph, metadata);
    });
    const captions = collectCaptionSpans(captionMetadata).filter(caption => {
        return !captionFilter || captionFilter(caption);
    });
    const eligibleParagraphs = paragraphs.filter(paragraph => {
        return isEligibleParagraph(paragraph, getPassLayoutMetadata(paragraph, paragraphMetadata));
    });
    return {
        paragraphMetadata,
        captionMetadata,
        paragraphs,
        captions,
        eligibleParagraphs
    };
}

function restoreTargetsForMeasurement(paragraphs, captions) {
    // Resize-time target discovery must run against the original source DOM
    // instead of our previously rendered line-break markup, otherwise the scan
    // can disqualify paragraphs based on Pretext's own transient wrappers.
    for (const paragraph of paragraphs) {
        if (!paragraph?.isConnected) continue;
        rememberOriginal(paragraph);
        restore(paragraph);
    }
    for (const caption of captions) {
        if (!caption?.isConnected) continue;
        rememberOriginal(caption);
        restore(caption);
    }
}

function restoreObservedTargetsForMeasurement() {
    restoreTargetsForMeasurement(observedParagraphTargets, observedCaptionTargets);
}

function collectVisibleLayoutTargetsForPass() {
    const visibleParagraphs = queryLayoutRootElements(PARAGRAPH_TARGET_SELECTOR).filter(paragraph => {
        return isElementVisibleInViewport(paragraph, RESIZE_VISIBLE_VIEWPORT_MARGIN_PX);
    });
    const visibleCaptions = queryLayoutRootElements(CAPTION_TARGET_SELECTOR).filter(caption => {
        return isElementVisibleInViewport(caption, RESIZE_VISIBLE_VIEWPORT_MARGIN_PX);
    });
    restoreTargetsForMeasurement(visibleParagraphs, visibleCaptions);
    const visibleParagraphSet = new Set(visibleParagraphs);
    const visibleCaptionSet = new Set(visibleCaptions);
    return collectLayoutTargetsForPass({
        paragraphFilter: paragraph => visibleParagraphSet.has(paragraph),
        captionFilter: caption => visibleCaptionSet.has(caption)
    });
}

function renderCollectedLayoutTargets(targets, { syncPendingVisibility = false } = {}) {
    const { paragraphMetadata, captionMetadata, paragraphs, captions, eligibleParagraphs } = targets;
    const eligibleParagraphSet = new Set(eligibleParagraphs);
    paragraphs.forEach(observeParagraphTarget);
    captions.forEach(observeCaptionTarget);
    paragraphs.forEach(paragraph => {
        setParagraphEligibilityClass(paragraph, eligibleParagraphSet.has(paragraph));
    });
    if (syncPendingVisibility) syncPendingParagraphVisibility(eligibleParagraphs);

    status.paragraphCount = paragraphs.length;
    if (!paragraphs.length && !captions.length) {
        status.reason = 'no-eligible-paragraphs';
        return false;
    }

    runRenderPass(() => {
        paragraphs.forEach(paragraph => {
            renderQueuedParagraph(paragraph, paragraphMetadata);
        });
        captions.forEach(caption => {
            renderQueuedCaption(caption, captionMetadata);
        });
        status.reason = 'active';
    });
    return true;
}

function renderBrowserJustifyComparisonPass() {
    if (!isManagedLayoutEnabled()) {
        clearAllPendingParagraphVisibility();
        status.reason = 'disabled';
        return;
    }

    clearReadyRenderQueues();
    setManagedParagraphAlignment(true);
    restoreObservedTargetsForMeasurement();

    const { paragraphs, captions, eligibleParagraphs } = collectLayoutTargetsForPass();
    const eligibleParagraphSet = new Set(eligibleParagraphs);
    paragraphs.forEach(observeParagraphTarget);
    captions.forEach(observeCaptionTarget);
    paragraphs.forEach(paragraph => {
        const eligible = eligibleParagraphSet.has(paragraph);
        setParagraphEligibilityClass(paragraph, eligible);
        setParagraphLayoutAdjustment(paragraph, '');
        setParagraphLayoutEngine(paragraph, '');
        setParagraphLayoutRenderer(paragraph, '');
        setParagraphLayoutState(
            paragraph,
            eligible ? 'active' : 'inactive',
            eligible
                ? 'Browser default justified layout comparison mode.'
                : 'Element is not eligible for custom text layout.'
        );
    });
    clearAllPendingParagraphVisibility();

    status.paragraphCount = paragraphs.length;
    status.reason = paragraphs.length || captions.length
        ? 'browser-justify-comparison'
        : 'no-eligible-paragraphs';
}

function runVisibleResizeRelayoutPass() {
    if (!isManagedLayoutEnabled()) {
        clearAllPendingParagraphVisibility();
        status.reason = 'disabled';
        return;
    }
    if (browserJustifyComparisonEnabled) {
        renderBrowserJustifyComparisonPass();
        return;
    }
    clearReadyRenderQueues();
    renderCollectedLayoutTargets(collectVisibleLayoutTargetsForPass());
}

// Full synchronous relayout pass used once resize settles so the entire page
// catches up to the final window width, including targets that remained
// offscreen during the live resize passes.
function runResizeSettledRelayoutPass() {
    if (!isManagedLayoutEnabled()) {
        clearAllPendingParagraphVisibility();
        status.reason = 'disabled';
        return;
    }
    if (browserJustifyComparisonEnabled) {
        renderBrowserJustifyComparisonPass();
        return;
    }
    clearReadyRenderQueues();
    restoreObservedTargetsForMeasurement();
    renderCollectedLayoutTargets(collectLayoutTargetsForPass(), { syncPendingVisibility: true });
}

function scanAndScheduleLayoutTargets() {
    if (!isManagedLayoutEnabled()) {
        clearAllPendingParagraphVisibility();
        status.reason = 'disabled';
        return;
    }
    if (browserJustifyComparisonEnabled) {
        renderBrowserJustifyComparisonPass();
        return;
    }
    const { paragraphs, captions, eligibleParagraphs } = collectLayoutTargetsForPass();
    const eligibleParagraphSet = new Set(eligibleParagraphs);

    paragraphs.forEach(observeParagraphTarget);
    captions.forEach(observeCaptionTarget);
    paragraphs.forEach(paragraph => {
        setParagraphEligibilityClass(paragraph, eligibleParagraphSet.has(paragraph));
    });
    syncPendingParagraphVisibility(eligibleParagraphs);

    status.paragraphCount = paragraphs.length;
    if (!paragraphs.length && !captions.length) {
        status.reason = 'no-eligible-paragraphs';
        return;
    }

    eligibleParagraphs.forEach(requestParagraphRenderWhenReady);
    captions.forEach(requestCaptionRenderWhenReady);
    status.reason = 'awaiting-fonts';
}

// ==========================================================================
// MARK: Target classification and eligibility
// ==========================================================================
function isSectionHeading(el) {
    return !!el && /^H[1-6]$/.test(el.tagName);
}

function isReferencesHeading(el) {
    if (!isSectionHeading(el)) return false;
    const headingText = el.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
    return headingText === 'references' || headingText === 'bibliography' || headingText === 'works cited';
}

function markReferenceSectionContent() {
    // References sections should stay browser-laid-out and left-aligned, so we
    // tag everything that follows a recognized heading until the next heading.
    getLayoutRoots().forEach(layoutRoot => {
        layoutRoot.querySelectorAll('.references-section-content').forEach(el => {
            el.classList.remove('references-section-content');
        });

        layoutRoot.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
            if (!isReferencesHeading(heading)) return;
            for (let el = heading.nextElementSibling; el && !isSectionHeading(el); el = el.nextElementSibling) {
                el.classList.add('references-section-content');
            }
        });
    });
}

// textContent equivalent that substitutes a single placeholder character for
// inline atom-replacement elements (SVG, IMG). This is what we treat as the
// "raw text" of a paragraph for layout purposes: it places SVG math in the
// character stream so the K-P solver can break around it, while ignoring any
// internal text (e.g. MathJax SVG <title>s) that would otherwise pollute the
// normalized text with non-rendered characters.
function getRawLayoutText(el) {
    let buf = '';
    function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            buf += node.nodeValue || '';
            return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (isInlineAtomReplacementElement(node)) {
            buf += ATOM_PLACEHOLDER;
            return;
        }
        for (const child of node.childNodes) walk(child);
    }
    walk(el);
    return buf;
}

function getNormalizedLayoutText(el) {
    return getRawLayoutText(el).replace(/\s+/g, ' ').trim();
}

function createPassLayoutMetadata(el) {
    const kind = getLayoutTargetKind(el);
    return {
        kind,
        textLength: kind ? getNormalizedLayoutText(el).length : 0,
        naturalLineCount: undefined
    };
}

function getPassLayoutMetadata(el, metadataCache) {
    if (!metadataCache.has(el)) metadataCache.set(el, createPassLayoutMetadata(el));
    return metadataCache.get(el);
}

function createPassCaptionMetadata(el) {
    return {
        textLength: getNormalizedLayoutText(el).length,
        naturalLineCount: undefined
    };
}

function getPassCaptionMetadata(el, metadataCache) {
    if (!metadataCache.has(el)) metadataCache.set(el, createPassCaptionMetadata(el));
    return metadataCache.get(el);
}

function getOrMeasureNaturalLineCount(el, metadata) {
    if (typeof metadata?.naturalLineCount === 'number') return metadata.naturalLineCount;
    const naturalLineCount = countRenderedLines(el);
    if (metadata) metadata.naturalLineCount = naturalLineCount;
    return naturalLineCount;
}

// Inline code is allowed inside prose, but a paragraph/list item that is
// effectively nothing but code should still stay on the browser/default path.
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

function hasExcludedLayoutContent(el) {
    // Exclude blocky content that breaks simple text flow, plus paragraphs that
    // are effectively just code with no surrounding prose. Inline svg/img are
    // handled as atomic placeholder characters elsewhere in the pipeline.
    return !!el.querySelector('br, pre, canvas, video, iframe, math') || isFullCodeLikeBlock(el);
}

function hasComplexListStructure(li) {
    return Array.from(li.children).some(child => /^(P|UL|OL|BLOCKQUOTE|FIGURE|TABLE|DIV|PRE|H[1-6])$/.test(child.tagName));
}

// Layout is enabled for a few different text containers, but we keep the
// rendering path unified by normalizing them into a small set of target kinds.
function getLayoutTargetKind(el) {
    if (!el || !el.matches('p, li, .newsrightbar')) return '';
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

function isPotentialLayoutTarget(el, metadata = null) {
    const targetMetadata = metadata || createPassLayoutMetadata(el);
    const kind = targetMetadata.kind;
    if (!kind) return false;
    // Quotes/list items can become eligible at shorter lengths because they are
    // only admitted once they already wrap to multiple natural lines.
    return targetMetadata.textLength >= (kind === 'body-paragraph' ? BODY_LAYOUT_MIN_CHARS : SECONDARY_LAYOUT_MIN_CHARS);
}

function isEligibleParagraph(el, metadata = null) {
    const targetMetadata = metadata || createPassLayoutMetadata(el);
    const kind = targetMetadata.kind;
    if (!kind) return false;
    if (kind === 'body-paragraph') return targetMetadata.textLength >= BODY_LAYOUT_MIN_CHARS;
    if (targetMetadata.textLength < SECONDARY_LAYOUT_MIN_CHARS) return false;
    return getOrMeasureNaturalLineCount(el, targetMetadata) > 1;
}

function collectAllLayoutTargets() {
    return queryLayoutRootElements(PARAGRAPH_TARGET_SELECTOR).filter(isPotentialLayoutTarget);
}

function collectParagraphs() {
    return collectAllLayoutTargets().filter(isEligibleParagraph);
}

function collectCaptionSpans(metadataCache = null) {
    return queryLayoutRootElements(CAPTION_TARGET_SELECTOR)
        .filter(span => {
            const metadata = metadataCache ? getPassCaptionMetadata(span, metadataCache) : createPassCaptionMetadata(span);
            return metadata.textLength > 30;
        });
}

// ==========================================================================
// MARK: Inline word measurement
// ==========================================================================
const INLINE_WORD_MEASUREMENT_BOX_SELECTOR = 'code, tt, sup, sub, .material-symbols-outlined, svg, img';
const INLINE_REPLAY_CONTAINER_TAGS = new Set(['A', 'EM', 'STRONG', 'B', 'I', 'SPAN']);
const INLINE_REPLAY_ATOMIC_TAGS = new Set(['CODE', 'TT', 'SUP', 'SUB']);

// Inline elements that have no text content of their own (or whose text content
// should not participate in line layout). They are substituted with a single
// placeholder character in the normalized text so the K-P solver treats them as
// fixed-width atoms, with width taken from DOM measurement of the element.
const ATOM_PLACEHOLDER = '￼'; // OBJECT REPLACEMENT CHARACTER
const INLINE_ATOM_REPLACEMENT_TAGS = new Set(['svg', 'img']);

function isInlineAtomReplacementElement(el) {
    if (!(el instanceof Element)) return false;
    return INLINE_ATOM_REPLACEMENT_TAGS.has(el.tagName.toLowerCase());
}

function isMaterialSymbolInlineElement(element) {
    return !!element?.classList?.contains('material-symbols-outlined');
}

function isAtomicInlineElement(element, normalizedSegment) {
    if (!(element instanceof Element) || !normalizedSegment) return false;
    if (isMaterialSymbolInlineElement(element)) return true;
    if (isInlineAtomReplacementElement(element)) return !/\s/.test(normalizedSegment);
    return INLINE_REPLAY_ATOMIC_TAGS.has(element.tagName) && !/\s/.test(normalizedSegment);
}

// When inline content changes typography or introduces padded/bordered inline
// boxes, plain paragraph-level measurement underestimates the true rendered
// width. This snapshot turns the live DOM into word parts annotated with their
// actual font and any inline-box edge width so the solver can measure mixed
// styling accurately.
function buildInlineWordMeasurementSource(element, normalizedText) {
    if (element.querySelector('pre')) return null;
    if (!element.querySelector('*')) return null;

    const baseFont = buildFontShorthand(window.getComputedStyle(element));
    const words = [];
    const wordStarts = [];
    const wordParts = [];
    const wordEdgeExtras = [];
    const inlineBoxBounds = new Map();
    let sawMixedFont = false;
    let sawInlineBox = false;
    let normalizedOffset = 0;
    let pendingSpace = false;
    let currentWord = '';
    let currentWordStart = 0;
    let currentParts = [];

    function flushWord() {
        if (!currentWord) return;
        words.push(currentWord);
        wordStarts.push(currentWordStart);
        wordParts.push(currentParts);
        const firstPart = currentParts[0];
        const lastPart = currentParts[currentParts.length - 1];
        let leftExtra = 0;
        let rightExtra = 0;

        if (firstPart?.boxElement) {
            const bounds = inlineBoxBounds.get(firstPart.boxElement);
            if (bounds && bounds.firstOffset === currentWordStart) leftExtra = bounds.leftExtra;
        }

        if (lastPart?.boxElement) {
            const bounds = inlineBoxBounds.get(lastPart.boxElement);
            if (bounds && bounds.lastOffset === (currentWordStart + currentWord.length - 1)) rightExtra = bounds.rightExtra;
        }

        wordEdgeExtras.push({ leftExtra, rightExtra });
        currentWord = '';
        currentParts = [];
    }

    // Custom walker: yield text nodes AND inline atom-replacement elements
    // (SVG/IMG) in document order. Atom elements are treated as if they were
    // a text node containing a single placeholder character whose width is
    // taken from the element's bounding rect.
    function* walkSequence(node) {
        if (node.nodeType === Node.TEXT_NODE) { yield { kind: 'text', node }; return; }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (isInlineAtomReplacementElement(node)) { yield { kind: 'atom', node }; return; }
        for (const child of node.childNodes) yield* walkSequence(child);
    }

    for (const entry of walkSequence(element)) {
        const isAtom = entry.kind === 'atom';
        const text = isAtom ? ATOM_PLACEHOLDER : (entry.node.nodeValue || '');
        if (!text) continue;
        const parentForFont = isAtom ? entry.node : (entry.node.parentElement || element);
        const font = buildFontShorthand(window.getComputedStyle(parentForFont));
        if (font !== baseFont) sawMixedFont = true;
        // For atom-replacement elements (svg/img) the element IS the box and
        // contributes a width determined by DOM measurement. For text nodes,
        // look up the nearest atomic inline box (code/tt/sup/sub/...).
        const boxElement = isAtom ? entry.node : (entry.node.parentElement || element).closest(INLINE_WORD_MEASUREMENT_BOX_SELECTOR);
        if (boxElement) sawInlineBox = true;
        let boxExtras = null;
        if (boxElement && !inlineBoxBounds.has(boxElement)) {
            const boxStyle = window.getComputedStyle(boxElement);
            boxExtras = {
                leftExtra: (parseFloat(boxStyle.paddingLeft) || 0) + (parseFloat(boxStyle.borderLeftWidth) || 0),
                rightExtra: (parseFloat(boxStyle.paddingRight) || 0) + (parseFloat(boxStyle.borderRightWidth) || 0)
            };
            inlineBoxBounds.set(boxElement, {
                firstOffset: Number.POSITIVE_INFINITY,
                lastOffset: Number.NEGATIVE_INFINITY,
                ...boxExtras
            });
        }
        // Atom elements get an explicit width from the live DOM; canvas
        // measurement of the placeholder character would be meaningless.
        const atomExplicitWidth = isAtom ? entry.node.getBoundingClientRect().width : null;

        for (const ch of text) {
            if (/\s/.test(ch)) {
                if (currentWord) flushWord();
                if (words.length > 0) pendingSpace = true;
                continue;
            }

            if (pendingSpace) {
                normalizedOffset += 1;
                pendingSpace = false;
            }
            if (!currentWord) currentWordStart = normalizedOffset;

            if (boxElement) {
                const bounds = inlineBoxBounds.get(boxElement);
                bounds.firstOffset = Math.min(bounds.firstOffset, normalizedOffset);
                bounds.lastOffset = Math.max(bounds.lastOffset, normalizedOffset);
            }

            const partOffset = normalizedOffset - currentWordStart;
            const lastPart = currentParts[currentParts.length - 1];
            // Atom characters are never merged with adjacent text parts so the
            // explicit width is preserved at character granularity.
            const canMergeWithLast = lastPart
                && lastPart.font === font
                && lastPart.boxElement === boxElement
                && !isAtom
                && lastPart.explicitWidth === undefined;
            if (canMergeWithLast) {
                lastPart.text += ch;
                lastPart.end = partOffset + 1;
            } else {
                const part = {
                    start: partOffset,
                    end: partOffset + 1,
                    text: ch,
                    font,
                    boxElement
                };
                if (isAtom) part.explicitWidth = atomExplicitWidth;
                currentParts.push(part);
            }

            currentWord += ch;
            normalizedOffset += 1;
        }
    }
    flushWord();

    if (words.join(' ') !== normalizedText) return null;
    const atomicRanges = [];
    inlineBoxBounds.forEach((bounds, boxElement) => {
        if (!Number.isFinite(bounds.firstOffset) || !Number.isFinite(bounds.lastOffset)) return;
        const normalizedSegment = normalizedText.slice(bounds.firstOffset, bounds.lastOffset + 1);
        if (!isAtomicInlineElement(boxElement, normalizedSegment)) return;
        atomicRanges.push({
            start: bounds.firstOffset,
            end: bounds.lastOffset + 1
        });
    });
    atomicRanges.sort((a, b) => a.start - b.start || a.end - b.end);

    return sawMixedFont || sawInlineBox
        ? { words, wordStarts, wordParts, wordEdgeExtras, atomicRanges }
        : null;
}

// ==========================================================================
// MARK: DOM state capture and restoration
// ==========================================================================
function rememberOriginal(p) {
    if (!paragraphState.has(p)) {
        withProfileBucket('rememberOriginal', () => {
            const rawText = getRawLayoutText(p);
            const { normalized, rawIndices } = buildNormMap(rawText);
            const rawToNormIndices = buildRawToNormMap(rawText.length, rawIndices);
            paragraphState.set(p, {
                html: p.innerHTML,
                text: normalized,
                rawIndices,
                rawToNormIndices,
                inlineWordMeasurementSource: buildInlineWordMeasurementSource(p, normalized),
                inlineReplaySnapshot: null,
                inlineReplaySnapshotComputed: false,
                pretextSourceState: null,
                style: p.getAttribute('style'),
                pretextPrepared: null,
                pretextPreparedFont: '',
                // Tracks whether restore() needs to rebuild the original DOM before
                // a new pass; untouched paragraphs can skip that work.
                rendered: false
            });
        });
    }
    return paragraphState.get(p);
}

function restore(p) {
    const orig = paragraphState.get(p);
    if (!orig) return;
    if (!orig.rendered) return;
    p.innerHTML = orig.html;
    p.classList.remove('pretext-layout-active');
    p.classList.remove('pretext-inline-flow-active');
    setParagraphLayoutEngine(p, '');
    setParagraphLayoutRenderer(p, '');
    if (orig.style === null) p.removeAttribute('style');
    else p.setAttribute('style', orig.style);
    orig.rendered = false;
}

// ==========================================================================
// MARK: Text normalization and DOM index mapping
// ==========================================================================
// Build a mapping from each character index in the whitespace-normalized text
// back to its position in the raw textContent.  This lets us locate Pretext's
// line-break positions inside the live DOM text nodes.
function buildNormMap(rawText) {
    const rawIndices = [];
    let inSpace = true; // treat start as "in space" to trim leading whitespace
    for (let i = 0; i < rawText.length; i++) {
        if (/\s/.test(rawText[i])) {
            if (!inSpace) { rawIndices.push(i); inSpace = true; }
        } else {
            rawIndices.push(i);
            inSpace = false;
        }
    }
    // Drop trailing space entry if present
    while (rawIndices.length > 0 && /\s/.test(rawText[rawIndices[rawIndices.length - 1]])) {
        rawIndices.pop();
    }
    const normalized = rawIndices.map(i => (/\s/.test(rawText[i]) ? ' ' : rawText[i])).join('');
    return { normalized, rawIndices };
}

function buildRawToNormMap(rawTextLength, rawIndices) {
    const rawToNormIndices = new Array(rawTextLength).fill(-1);
    rawIndices.forEach((rawIndex, normIndex) => {
        rawToNormIndices[rawIndex] = normIndex;
    });
    return rawToNormIndices;
}

// ==========================================================================
// MARK: Inline replay snapshot
// ==========================================================================
function createInlineReplayDescriptor(element) {
    if (!(element instanceof Element)) return null;
    const tagName = element.tagName;
    if (!INLINE_REPLAY_CONTAINER_TAGS.has(tagName)) return null;
    if (tagName === 'SPAN' && element.attributes.length > 0) return null;
    return {
        kind: 'inline',
        tagName: tagName.toLowerCase(),
        attributes: Array.from(element.attributes, attr => ({
            name: attr.name,
            value: attr.value
        }))
    };
}

function createAtomicInlineReplayDescriptor(element, normalizedSegment) {
    if (!isAtomicInlineElement(element, normalizedSegment)) return null;
    return {
        kind: 'atomic',
        template: element.cloneNode(true)
    };
}

function cloneInlineReplayDescriptor(descriptor) {
    if (descriptor.kind === 'atomic') return descriptor.template.cloneNode(true);
    const node = document.createElement(descriptor.tagName);
    for (const { name, value } of descriptor.attributes) node.setAttribute(name, value);
    return node;
}

function buildInlineReplaySnapshot(element, normalizedText, rawToNormIndices) {
    if (!normalizedText || !element) return null;
    if (element.querySelector('pre')) return null;

    const rangeMap = new Map();
    const atomicRoots = new WeakSet();

    function scanNode(node, rawOffset) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue || '';
            let firstNormIndex = null;
            let lastNormIndex = null;
            for (let i = 0; i < text.length; i++) {
                const normIndex = rawToNormIndices[rawOffset + i];
                if (normIndex === undefined || normIndex < 0) continue;
                if (firstNormIndex === null) firstNormIndex = normIndex;
                lastNormIndex = normIndex;
            }
            return {
                rawOffset: rawOffset + text.length,
                firstNormIndex,
                lastNormIndex,
                unsupported: false
            };
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return {
                rawOffset,
                firstNormIndex: null,
                lastNormIndex: null,
                unsupported: false
            };
        }

        // Inline atom-replacement (SVG/IMG): contributes a single placeholder
        // character to the raw text. Register it as a 1-char atomic so the
        // tree-replay renderer clones the original element back at the right
        // boundary instead of trying to descend into its internals.
        if (isInlineAtomReplacementElement(node)) {
            const normIndex = rawToNormIndices[rawOffset];
            if (node !== element && normIndex !== undefined && normIndex >= 0) {
                rangeMap.set(node, {
                    descriptor: { kind: 'atomic', template: node.cloneNode(true) },
                    startBoundary: normIndex,
                    endBoundary: normIndex + 1
                });
                atomicRoots.add(node);
            }
            return {
                rawOffset: rawOffset + 1,
                firstNormIndex: normIndex >= 0 ? normIndex : null,
                lastNormIndex: normIndex >= 0 ? normIndex : null,
                unsupported: false
            };
        }

        let nextRawOffset = rawOffset;
        let firstNormIndex = null;
        let lastNormIndex = null;
        let childUnsupported = false;
        for (const child of node.childNodes) {
            const childResult = scanNode(child, nextRawOffset);
            nextRawOffset = childResult.rawOffset;
            if (childResult.unsupported) childUnsupported = true;
            if (childResult.firstNormIndex === null) continue;
            if (firstNormIndex === null) firstNormIndex = childResult.firstNormIndex;
            lastNormIndex = childResult.lastNormIndex;
        }

        if (node !== element) {
            const normalizedSegment = firstNormIndex !== null && lastNormIndex !== null
                ? normalizedText.slice(firstNormIndex, lastNormIndex + 1)
                : '';
            const atomicDescriptor = createAtomicInlineReplayDescriptor(node, normalizedSegment);
            if (atomicDescriptor && firstNormIndex !== null) {
                rangeMap.set(node, {
                    descriptor: atomicDescriptor,
                    startBoundary: firstNormIndex,
                    endBoundary: lastNormIndex + 1
                });
                atomicRoots.add(node);
                return {
                    rawOffset: nextRawOffset,
                    firstNormIndex,
                    lastNormIndex,
                    unsupported: false
                };
            }

            const descriptor = createInlineReplayDescriptor(node);
            if (!descriptor) {
                if (firstNormIndex !== null) childUnsupported = true;
            } else if (firstNormIndex !== null) {
                rangeMap.set(node, {
                    descriptor,
                    startBoundary: firstNormIndex,
                    endBoundary: lastNormIndex + 1
                });
            }
        }

        return {
            rawOffset: nextRawOffset,
            firstNormIndex,
            lastNormIndex,
            unsupported: childUnsupported
        };
    }

    const rootResult = scanNode(element, 0);
    if (rootResult.unsupported) return null;

    const boundaryOpens = Array.from({ length: normalizedText.length + 1 }, () => []);
    const boundaryCloses = Array.from({ length: normalizedText.length + 1 }, () => []);
    const atomicEntries = Array.from({ length: normalizedText.length + 1 }, () => []);
    const atomicRanges = [];

    function populateBoundaries(node) {
        for (const child of node.childNodes) {
            if (!(child instanceof Element)) continue;
            const range = rangeMap.get(child);
            if (!range) {
                populateBoundaries(child);
                continue;
            }

            if (range.descriptor.kind === 'atomic') {
                atomicEntries[range.startBoundary].push(range);
                atomicRanges.push(range);
                continue;
            }

            boundaryOpens[range.startBoundary].push(range.descriptor);
            if (!atomicRoots.has(child)) populateBoundaries(child);
            boundaryCloses[range.endBoundary].push(range.descriptor);
        }
    }

    populateBoundaries(element);
    if (!rangeMap.size) return null;
    const containsLink = Array.from(rangeMap.values()).some(range => {
        return range.descriptor.kind === 'inline' && range.descriptor.tagName === 'a';
    });
    return { boundaryOpens, boundaryCloses, atomicEntries, atomicRanges, containsLink };
}

function getInlineReplaySnapshot(element, orig) {
    if (!orig?.text || !orig?.rawToNormIndices) return null;
    if (orig.inlineReplaySnapshotComputed) return orig.inlineReplaySnapshot;
    orig.inlineReplaySnapshot = buildInlineReplaySnapshot(element, orig.text, orig.rawToNormIndices);
    orig.inlineReplaySnapshotComputed = true;
    return orig.inlineReplaySnapshot;
}

// Collect all descendant text nodes with their cumulative raw-text offsets.
function buildTextNodeIndex(element) {
    // Offsets here are positions in getRawLayoutText(element). Each inline
    // atom-replacement element (SVG/IMG) contributes a single placeholder
    // character to the raw text, so text nodes that follow it advance their
    // start position by 1 even though no real text was consumed.
    const nodes = [];
    let offset = 0;
    function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            nodes.push({ node, start: offset, end: offset + node.length });
            offset += node.length;
            return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (isInlineAtomReplacementElement(node)) {
            offset += 1;
            return;
        }
        for (const child of node.childNodes) walk(child);
    }
    for (const child of element.childNodes) walk(child);
    return nodes;
}

function findDomPosFromIndex(textNodeIndex, rawIdx, startIndex) {
    for (let i = startIndex; i < textNodeIndex.length; i++) {
        const { node, start, end } = textNodeIndex[i];
        if (rawIdx >= start && rawIdx <= end) {
            return {
                pos: { node, offset: rawIdx - start },
                nodeIndex: i
            };
        }
    }
    return { pos: null, nodeIndex: textNodeIndex.length };
}

function measureTextWidth(text, font) {
    if (!measureContext) return 0;
    let fontCache = textWidthCache.get(font);
    if (!fontCache) {
        fontCache = new Map();
        textWidthCache.set(font, fontCache);
    }
    if (fontCache.has(text)) return fontCache.get(text);
    measureContext.font = font;
    const width = measureContext.measureText(text).width;
    fontCache.set(text, width);
    return width;
}

function buildWordMetrics(text, font, inlineWordMeasurementSource) {
    const words = inlineWordMeasurementSource?.words || text.split(' ').filter(Boolean);
    const wordStarts = inlineWordMeasurementSource?.wordStarts || [];
    if (!inlineWordMeasurementSource) {
        let offset = 0;
        for (const word of words) {
            wordStarts.push(offset);
            offset += word.length + 1;
        }
    }
    return {
        words,
        wordStarts,
        wordParts: inlineWordMeasurementSource?.wordParts || null,
        wordEdgeExtras: inlineWordMeasurementSource?.wordEdgeExtras || null,
        atomicRanges: inlineWordMeasurementSource?.atomicRanges || [],
        // Hyphen opportunities are word-local, so cache them once per metrics
        // bundle and reuse them across solver states and adaptive retries.
        hyphenBreaks: words.map(getHyphenBreaks),
        spaceWidth: measureTextWidth(' ', font),
        hyphenWidth: measureTextWidth('-', font)
    };
}

function measureWordSlice(metrics, wordIndex, start, end, font) {
    let width = 0;
    if (!metrics.wordParts) {
        width = measureTextWidth(metrics.words[wordIndex].slice(start, end), font);
    } else {
        // Mixed-font words are measured part-by-part so inline code/tt segments
        // keep their true width instead of inheriting the paragraph font.
        for (const part of metrics.wordParts[wordIndex]) {
            const sliceStart = Math.max(start, part.start);
            const sliceEnd = Math.min(end, part.end);
            if (sliceEnd <= sliceStart) continue;
            if (part.explicitWidth !== undefined) {
                // Atom-replacement parts (inline SVG/IMG) have a DOM-measured
                // width that canvas text measurement cannot reproduce. Pro-rate
                // by slice length so partial coverage stays well-defined even
                // though atoms are always single-character parts in practice.
                const partLen = part.end - part.start;
                const sliceLen = sliceEnd - sliceStart;
                width += part.explicitWidth * (partLen === 0 ? 0 : sliceLen / partLen);
                continue;
            }
            width += measureTextWidth(
                part.text.slice(sliceStart - part.start, sliceEnd - part.start),
                part.font
            );
        }
    }

    const edgeExtras = metrics.wordEdgeExtras?.[wordIndex];
    if (edgeExtras) {
        // Inline code boxes contribute padding/border at the word edges, which
        // text-glyph measurement alone would otherwise miss.
        if (start === 0) width += edgeExtras.leftExtra || 0;
        if (end === metrics.words[wordIndex].length) width += edgeExtras.rightExtra || 0;
    }
    return width;
}

function measureAppendTextWidth(metrics, wordIndex, offset, appendText, fallbackFont) {
    if (!appendText) return 0;
    if (!metrics.wordParts || !metrics.wordParts[wordIndex]?.length) {
        return measureTextWidth(appendText, fallbackFont);
    }

    const partOffset = Math.max(0, offset - 1);
    const matchingPart = metrics.wordParts[wordIndex].find(part => partOffset >= part.start && partOffset < part.end)
        || metrics.wordParts[wordIndex][metrics.wordParts[wordIndex].length - 1];
    return measureTextWidth(appendText, matchingPart.font);
}

// ==========================================================================
// MARK: Hyphenation
// ==========================================================================
function isLetter(ch) {
    return /[A-Za-z]/.test(ch);
}

function isVowel(ch) {
    return /[AEIOUYaeiouy]/.test(ch);
}

function hasVowel(str) {
    return /[AEIOUYaeiouy]/.test(str);
}

function getHeuristicHyphenBreaks(word) {
    const breaks = [];
    const lower = word.toLowerCase();
    const len = word.length;

    // Preserve explicit visual delimiters before attempting softer heuristic
    // syllable-ish breaks.
    for (let i = 1; i < len - 1; i++) {
        if ((word[i - 1] === '-' || word[i - 1] === '/') && i >= 2 && (len - i) >= 2) {
            breaks.push({ index: i, appendText: '' });
        }
    }

    for (let i = 3; i <= len - 3; i++) {
        const prev = word[i - 1];
        const next = word[i];
        if (!isLetter(prev) || !isLetter(next)) continue;

        const left = word.slice(0, i);
        const right = word.slice(i);
        if (!hasVowel(left) || !hasVowel(right)) continue;

        const prevLower = lower[i - 1];
        const nextLower = lower[i];
        const beforePrev = i >= 2 ? lower[i - 2] : '';
        const afterNext = i + 1 < len ? lower[i + 1] : '';

        let shouldBreak = false;
        if (isVowel(prevLower) && !isVowel(nextLower) && afterNext && isVowel(afterNext)) {
            shouldBreak = true;
        }
        if (!isVowel(prevLower) && isVowel(nextLower) && beforePrev && isVowel(beforePrev)) {
            shouldBreak = true;
        }
        if (!isVowel(prevLower) && !isVowel(nextLower) && beforePrev && isVowel(beforePrev) && afterNext && isVowel(afterNext)) {
            shouldBreak = true;
        }
        if (/[a-z]/.test(prev) && /[A-Z]/.test(next) && i >= 3 && (len - i) >= 3) {
            shouldBreak = true;
        }

        if (shouldBreak) breaks.push({ index: i, appendText: '-' });
    }

    const deduped = new Map();
    breaks.forEach(item => deduped.set(`${item.index}:${item.appendText}`, item));
    return Array.from(deduped.values()).sort((a, b) => a.index - b.index);
}

function getHyphenBreaks(word) {
    if (!hyphenBreakCache.has(word)) {
        const lower = word.toLowerCase();
        const manualException = Array.isArray(HYPHENATION_EXCEPTIONS[lower])
            ? HYPHENATION_EXCEPTIONS[lower]
            : [];
        const manualBreaks = manualException
            .filter(index => index >= 3 && index <= word.length - 3)
            .map(index => ({ index, appendText: '-' }));
        const heuristicBreaks = getHeuristicHyphenBreaks(word);
        const deduped = new Map();
        [...manualBreaks, ...heuristicBreaks].forEach(item => {
            if (item.index > 0 && item.index < word.length) {
                deduped.set(`${item.index}:${item.appendText}`, item);
            }
        });
        hyphenBreakCache.set(word, Array.from(deduped.values()).sort((a, b) => a.index - b.index));
    }
    return hyphenBreakCache.get(word);
}

// ==========================================================================
// MARK: Pretext module integration
// ==========================================================================
const SOFT_HYPHEN = '\u00AD';
const ZERO_WIDTH_BREAK = '\u200B';

function pushPreparedChar(state, ch, sourceAdvance) {
    state.solverText += ch;
    state.sourceBoundary += sourceAdvance;
    state.solverBoundaryToSourceBoundary.push(state.sourceBoundary);
}

function buildPretextSolverText(text) {
    const state = {
        solverText: '',
        sourceBoundary: 0,
        solverBoundaryToSourceBoundary: [0]
    };
    const words = text ? text.split(' ') : [];

    words.forEach((word, wordIndex) => {
        if (wordIndex > 0) pushPreparedChar(state, ' ', 1);

        const breakMap = new Map();
        getHyphenBreaks(word).forEach(item => {
            if (item.index > 0 && item.index < word.length) breakMap.set(item.index, item.appendText);
        });

        for (let i = 0; i < word.length; i++) {
            const appendText = breakMap.get(i);
            if (appendText === '-') pushPreparedChar(state, SOFT_HYPHEN, 0);
            else if (appendText === '') pushPreparedChar(state, ZERO_WIDTH_BREAK, 0);
            pushPreparedChar(state, word[i], 1);
        }
    });

    return state;
}

function getPretextSourceState(orig) {
    if (!orig?.text) return null;
    if (orig.pretextSourceState) return orig.pretextSourceState;

    return withProfileBucket('pretextSourcePrep', () => {
        const solverState = buildPretextSolverText(orig.text);
        orig.pretextSourceState = {
            solverText: solverState.solverText,
            solverBoundaryToSourceBoundary: solverState.solverBoundaryToSourceBoundary,
            sourceSpacePrefix: buildSourceSpacePrefix(orig.text)
        };
        return orig.pretextSourceState;
    });
}

function getGraphemeBoundaryOffsets(text) {
    const boundaries = [0];
    if (!text) return boundaries;

    if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        let offset = 0;
        for (const { segment } of segmenter.segment(text)) {
            offset += segment.length;
            boundaries.push(offset);
        }
        return boundaries;
    }

    let offset = 0;
    for (const grapheme of Array.from(text)) {
        offset += grapheme.length;
        boundaries.push(offset);
    }
    return boundaries;
}

function buildSegmentStartSourceBoundaries(segments, solverBoundaryToSourceBoundary) {
    const segmentStartSourceBoundaries = new Array(segments.length + 1);
    let solverBoundary = 0;

    for (let i = 0; i < segments.length; i++) {
        segmentStartSourceBoundaries[i] = solverBoundaryToSourceBoundary[solverBoundary] ?? 0;
        solverBoundary += segments[i].length;
    }
    segmentStartSourceBoundaries[segments.length] = solverBoundaryToSourceBoundary[solverBoundary] ?? 0;

    return segmentStartSourceBoundaries;
}

function ensurePretextCursorData(preparedState) {
    if (preparedState.segmentStartSolverBoundaries && preparedState.segmentGraphemeBoundaries) return;

    // Greedy line walking can end inside a segment, so only that path pays for
    // grapheme boundary caches. The Knuth-Plass path stays segment-boundary-only.
    const segments = preparedState.prepared.segments || [];
    const segmentStartSolverBoundaries = new Array(segments.length + 1);
    const segmentGraphemeBoundaries = new Array(segments.length);
    let solverBoundary = 0;

    for (let i = 0; i < segments.length; i++) {
        segmentStartSolverBoundaries[i] = solverBoundary;
        segmentGraphemeBoundaries[i] = getGraphemeBoundaryOffsets(segments[i]);
        solverBoundary += segments[i].length;
    }
    segmentStartSolverBoundaries[segments.length] = solverBoundary;

    preparedState.segmentStartSolverBoundaries = segmentStartSolverBoundaries;
    preparedState.segmentGraphemeBoundaries = segmentGraphemeBoundaries;
}

function buildSourceSpacePrefix(text) {
    const prefix = new Array(text.length + 1);
    prefix[0] = 0;
    for (let i = 0; i < text.length; i++) {
        prefix[i + 1] = prefix[i] + (text[i] === ' ' ? 1 : 0);
    }
    return prefix;
}

function getPretextPreparedParagraph(orig, font) {
    if (!pretextModule?.prepareWithSegments || !orig?.text) return null;
    if (orig.pretextPrepared && orig.pretextPreparedFont === font) {
        if (activePassProfile) activePassProfile.pretextPrepare.cacheHits += 1;
        return orig.pretextPrepared;
    }

    return withProfileBucket('pretextPrepare', () => {
        if (activePassProfile) activePassProfile.pretextPrepare.cacheMisses += 1;
        const sourceState = getPretextSourceState(orig);
        const prepared = pretextModule.prepareWithSegments(sourceState.solverText, font);
        const segmentStartSourceBoundaries = buildSegmentStartSourceBoundaries(
            prepared.segments || [],
            sourceState.solverBoundaryToSourceBoundary
        );
        const segmentStartSpaceCounts = segmentStartSourceBoundaries.map(
            boundary => sourceState.sourceSpacePrefix[boundary] ?? 0
        );

        orig.pretextPreparedFont = font;
        orig.pretextPrepared = {
            prepared,
            sourceText: orig.text,
            solverText: sourceState.solverText,
            solverBoundaryToSourceBoundary: sourceState.solverBoundaryToSourceBoundary,
            sourceSpacePrefix: sourceState.sourceSpacePrefix,
            segmentStartSourceBoundaries,
            segmentStartSpaceCounts,
            segmentStartSolverBoundaries: null,
            segmentGraphemeBoundaries: null,
            spaceWidth: measureTextWidth(' ', font),
            hyphenWidth: measureTextWidth('-', font),
            profileBucket: 'pretextSolve'
        };
        return orig.pretextPrepared;
    });
}

function getCursorSolverBoundary(preparedState, cursor) {
    if (!cursor) return 0;
    ensurePretextCursorData(preparedState);
    const segmentCount = preparedState.segmentStartSolverBoundaries.length - 1;
    const segmentIndex = Math.max(0, Math.min(cursor.segmentIndex || 0, segmentCount));
    if (segmentIndex >= segmentCount) return preparedState.segmentStartSolverBoundaries[segmentCount];

    const graphemeBoundaries = preparedState.segmentGraphemeBoundaries[segmentIndex] || [0];
    const graphemeIndex = Math.max(0, Math.min(cursor.graphemeIndex || 0, graphemeBoundaries.length - 1));
    return preparedState.segmentStartSolverBoundaries[segmentIndex] + graphemeBoundaries[graphemeIndex];
}

function getCursorSourceBoundary(preparedState, cursor) {
    const solverBoundary = getCursorSolverBoundary(preparedState, cursor);
    return preparedState.solverBoundaryToSourceBoundary[solverBoundary] ?? 0;
}

function getSegmentStartSourceBoundary(preparedState, segmentIndex) {
    const boundaryIndex = Math.max(0, Math.min(segmentIndex, preparedState.segmentStartSourceBoundaries.length - 1));
    return preparedState.segmentStartSourceBoundaries[boundaryIndex] ?? 0;
}

function lineEndsWithDiscretionaryHyphen(preparedState, line) {
    const solverBoundary = getCursorSolverBoundary(preparedState, line.end);
    if (solverBoundary <= 0 || solverBoundary > preparedState.solverText.length) return false;
    if (preparedState.solverText[solverBoundary - 1] !== SOFT_HYPHEN) return false;
    return typeof line.text === 'string' && /-$/.test(line.text);
}

function buildLayoutLineFromPretextLine(preparedState, line) {
    const normStart = getCursorSourceBoundary(preparedState, line.start);
    const normEnd = getCursorSourceBoundary(preparedState, line.end);
    const lineText = (line.text || '').replace(/\u200B/g, '');
    const visibleText = lineText.replace(/\s+$/g, '');
    return {
        text: visibleText,
        normStart,
        normEnd,
        appendText: lineEndsWithDiscretionaryHyphen(preparedState, line) ? '-' : '',
        spaces: (visibleText.match(/ /g) || []).length,
        naturalWidth: line.width,
        spaceWidth: preparedState.spaceWidth
    };
}

function hasPretextSensitiveInlineContent(element) {
    // Ligature-driven icon fonts depend on keeping the full literal token
    // intact. The plain Pretext path may split inside that text, so leave those
    // paragraphs on the older word-based solver instead.
    return !!element?.querySelector('.material-symbols-outlined');
}

function isPlainPretextCandidate(element, orig) {
    if (!pretextModule || PRETEXT_PLAIN_PARAGRAPH_MODE === 'off') return false;
    if (!orig?.text) return false;
    if (orig.inlineWordMeasurementSource) return false;
    if (hasPretextSensitiveInlineContent(element)) return false;
    return !element.querySelector('code, tt, pre');
}

function isPlainPretextCaptionCandidate(element, orig) {
    if (!pretextModule || PRETEXT_PLAIN_CAPTION_MODE === 'off') return false;
    if (!orig?.text) return false;
    if (orig.inlineWordMeasurementSource) return false;
    if (hasPretextSensitiveInlineContent(element)) return false;
    return !element.querySelector('code, tt, pre');
}

// ==========================================================================
// MARK: Solver: Pretext greedy and shared Knuth-Plass
// ==========================================================================
function breakLinesWithPretextGreedy(orig, font, targetWidth) {
    if (!pretextModule?.layoutNextLine) {
        return {
            lines: null,
            failureCode: 'pretext-unavailable',
            failureReason: 'The experimental Pretext engine is unavailable.'
        };
    }

    const preparedState = getPretextPreparedParagraph(orig, font);
    if (!preparedState?.prepared) {
        return {
            lines: null,
            failureCode: 'pretext-prepare-failed',
            failureReason: 'The experimental Pretext engine could not prepare paragraph text.'
        };
    }

    return withProfileBucket('pretextGreedy', () => {
        const lines = [];
        let cursor = { segmentIndex: 0, graphemeIndex: 0 };
        let lastBoundary = 0;

        while (true) {
            const nextLine = pretextModule.layoutNextLine(preparedState.prepared, cursor, targetWidth);
            if (!nextLine) break;

            const nextBoundary = getCursorSolverBoundary(preparedState, nextLine.end);
            if (nextBoundary <= lastBoundary) {
                return {
                    lines: null,
                    failureCode: 'pretext-stalled',
                    failureReason: 'The experimental Pretext engine produced a non-advancing line cursor.'
                };
            }

            const convertedLine = buildLayoutLineFromPretextLine(preparedState, nextLine);
            if (convertedLine.normEnd <= convertedLine.normStart) {
                return {
                    lines: null,
                    failureCode: 'pretext-source-map-failed',
                    failureReason: 'The experimental Pretext engine could not map a line back to the original paragraph text.'
                };
            }

            lines.push(convertedLine);
            cursor = nextLine.end;
            lastBoundary = nextBoundary;

            if (nextBoundary >= preparedState.solverText.length) break;
        }

        return lines.length > 1
            ? { lines, failureCode: '', failureReason: '' }
            : {
                lines: null,
                failureCode: 'too-few-lines',
                failureReason: 'Paragraph produced fewer than two lines after line breaking.'
            };
    });
}

function createKnuthPlassPrepareFailureResult() {
    return {
        lines: null,
        failureCode: 'pretext-prepare-failed',
        failureReason: 'The experimental Pretext engine could not prepare paragraph text.'
    };
}

function createParagraphTooShortResult() {
    return {
        lines: null,
        failureCode: 'paragraph-too-short',
        failureReason: 'Paragraph is too short to benefit from Knuth-Plass line breaking.'
    };
}

function shouldUseForwardActiveNodeKnuthPlass(settings) {
    return USE_FORWARD_ACTIVE_NODE_KNUTH_PLASS
        && settings?.useForwardActiveNodeSolver !== false
        && settings?.useForwardActiveNodeSolver !== 0;
}

function createLayoutLineCandidate(preparedState, startSegmentIndex, nextSegmentIndex, normEndBoundaryIndex, appendText, naturalWidth) {
    const segmentStartSourceBoundaries = preparedState.segmentStartSourceBoundaries;
    const segmentStartSpaceCounts = preparedState.segmentStartSpaceCounts;
    const normStart = segmentStartSourceBoundaries[startSegmentIndex];
    const normEnd = segmentStartSourceBoundaries[normEndBoundaryIndex];

    return {
        nextSegmentIndex,
        normStart,
        normEnd,
        appendText,
        spaces: segmentStartSpaceCounts[normEndBoundaryIndex] - segmentStartSpaceCounts[startSegmentIndex],
        naturalWidth,
        spaceWidth: preparedState.spaceWidth
    };
}

function buildLayoutLinesFromCandidates(sourceText, candidateLines) {
    return candidateLines.map(line => ({
        text: sourceText.slice(line.normStart, line.normEnd) + line.appendText,
        normStart: line.normStart,
        normEnd: line.normEnd,
        appendText: line.appendText,
        spaces: line.spaces,
        naturalWidth: line.naturalWidth,
        spaceWidth: line.spaceWidth
    }));
}

function breakLinesKnuthPlassActiveList(preparedState, targetWidth, settings) {
    if (!preparedState?.prepared) {
        return {
            lines: null,
            failureCode: 'prepare-failed',
            failureReason: 'The text could not be prepared for Knuth-Plass line breaking.'
        };
    }

    if (!preparedState.prepared.segments.length) {
        return createParagraphTooShortResult();
    }

    return withProfileBucket(preparedState.profileBucket || 'customSolve', () => {
        const { prepared } = preparedState;
        const { kinds, widths, lineEndFitAdvances } = prepared;
        const sourceText = preparedState.sourceText || '';
        const segmentCount = prepared.segments.length;
        const rejectionReasonCounts = new Map();
        const widthPrefix = new Array(segmentCount + 1).fill(0);
        for (let i = 0; i < segmentCount; i++) {
            widthPrefix[i + 1] = widthPrefix[i] + widths[i];
        }

        // The map of best node per key IS the live active set: superseding or
        // deactivating a node removes it from the map, so the per-break scan only
        // ever walks currently-active nodes instead of an append-only history.
        let activeNodeBestByKey = new Map();

        function getActiveNodeKey(segmentIndex, line) {
            return `${segmentIndex}:${line?.appendText === '-' ? 1 : 0}`;
        }

        function getActiveNodes() {
            return Array.from(activeNodeBestByKey.values());
        }

        function rebuildActiveNodeIndex(nodes) {
            activeNodeBestByKey = new Map();
            for (const node of nodes) {
                appendActiveNode(node);
            }
        }

        function appendActiveNode(node) {
            const key = getActiveNodeKey(node.segmentIndex, node.line);
            const previousBest = activeNodeBestByKey.get(key);
            if (previousBest && previousBest.cost <= node.cost) return false;
            // set() overwrites any worse same-key node, dropping it from the set.
            activeNodeBestByKey.set(key, node);
            return true;
        }

        function deactivateActiveNode(node) {
            const key = getActiveNodeKey(node.segmentIndex, node.line);
            if (activeNodeBestByKey.get(key) === node) activeNodeBestByKey.delete(key);
        }

        function considerActiveCandidate(activeNode, nextSegmentIndex, normEndBoundaryIndex, appendText, naturalWidth) {
            const candidate = createLayoutLineCandidate(
                preparedState,
                activeNode.segmentIndex,
                nextSegmentIndex,
                normEndBoundaryIndex,
                appendText,
                naturalWidth
            );
            const isLast = nextSegmentIndex >= segmentCount;
            const { demerit, rejectionReason } = computeLineDemerit(candidate, targetWidth, isLast, settings);
            if (!Number.isFinite(demerit)) {
                if (rejectionReason) {
                    rejectionReasonCounts.set(rejectionReason, (rejectionReasonCounts.get(rejectionReason) || 0) + 1);
                }
                if (rejectionReason === 'min-space-width') deactivateActiveNode(activeNode);
                return;
            }

            const consecutiveHyphenPenalty = activeNode.line?.appendText === '-' && appendText === '-'
                ? settings.consecutiveHyphenPenalty
                : 0;
            appendActiveNode({
                segmentIndex: nextSegmentIndex,
                cost: activeNode.cost + demerit + consecutiveHyphenPenalty,
                line: candidate,
                previous: activeNode
            });
        }

        function considerBreakAt(segmentIndex, nextSegmentIndex, normEndBoundaryIndex, appendText, naturalWidthFromStart) {
            // Snapshot before iterating: considerActiveCandidate mutates the set
            // (deactivations and the new nodes appended at nextSegmentIndex). Each
            // snapshot node has a distinct key and is visited once, and appends
            // target the disjoint nextSegmentIndex key, so no node in the snapshot
            // can be superseded before its visit — no per-node currency check needed.
            const nodesAtBreakStart = getActiveNodes();
            for (const activeNode of nodesAtBreakStart) {
                if (activeNode.segmentIndex >= nextSegmentIndex) continue;
                if (appendText === '' && kinds[segmentIndex] === 'hard-break' && segmentIndex <= activeNode.segmentIndex) continue;

                considerActiveCandidate(
                    activeNode,
                    nextSegmentIndex,
                    normEndBoundaryIndex,
                    appendText,
                    naturalWidthFromStart(activeNode.segmentIndex)
                );
            }
        }

        appendActiveNode({
            segmentIndex: 0,
            cost: 0,
            line: null,
            previous: null
        });

        for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
            const kind = kinds[segmentIndex];
            const segmentWidth = widths[segmentIndex];
            const nextKind = segmentIndex + 1 < kinds.length ? kinds[segmentIndex + 1] : '';

            if (kind === 'hard-break') {
                considerBreakAt(
                    segmentIndex,
                    segmentIndex + 1,
                    segmentIndex,
                    '',
                    startSegmentIndex => widthPrefix[segmentIndex] - widthPrefix[startSegmentIndex]
                );
                rebuildActiveNodeIndex(getActiveNodes().filter(node => {
                    return node.segmentIndex >= segmentIndex + 1;
                }));
                continue;
            }

            const normEndBoundaryIndex = kind === 'space' ? segmentIndex : segmentIndex + 1;
            if (kind === 'soft-hyphen') {
                considerBreakAt(
                    segmentIndex,
                    segmentIndex + 1,
                    normEndBoundaryIndex,
                    '-',
                    startSegmentIndex => widthPrefix[segmentIndex + 1] - widthPrefix[startSegmentIndex] - segmentWidth + lineEndFitAdvances[segmentIndex]
                );
                continue;
            }

            const canBreakHere = kind === 'space'
                || kind === 'zero-width-break'
                || (kind === 'text'
                    && nextKind !== 'space'
                    && nextKind !== 'soft-hyphen'
                    && nextKind !== 'zero-width-break'
                    && nextKind !== 'hard-break');

            if (!canBreakHere) continue;

            considerBreakAt(
                segmentIndex,
                segmentIndex + 1,
                normEndBoundaryIndex,
                '',
                startSegmentIndex => widthPrefix[segmentIndex + 1] - widthPrefix[startSegmentIndex] - segmentWidth + lineEndFitAdvances[segmentIndex]
            );
        }

        let bestTerminalNode = null;
        for (const node of activeNodeBestByKey.values()) {
            if (node.segmentIndex < segmentCount) continue;
            if (!bestTerminalNode || node.cost < bestTerminalNode.cost) bestTerminalNode = node;
        }

        if (!bestTerminalNode) {
            const failureSummary = summarizeBreakFailure(rejectionReasonCounts);
            return {
                lines: null,
                failureCode: failureSummary.failureCode,
                failureReason: failureSummary.failureReason
            };
        }

        const candidateLines = [];
        for (let node = bestTerminalNode; node?.line; node = node.previous) {
            candidateLines.push(node.line);
        }
        candidateLines.reverse();

        const lines = buildLayoutLinesFromCandidates(sourceText, candidateLines);
        return lines.length > 1
            ? { lines, failureCode: '', failureReason: '' }
            : {
                lines: null,
                failureCode: 'too-few-lines',
                failureReason: 'Paragraph produced fewer than two lines after line breaking.'
            };
    });
}

function breakLinesKnuthPlassBackwardsDP(preparedState, targetWidth, settings) {
    if (!preparedState?.prepared) {
        return {
            lines: null,
            failureCode: 'prepare-failed',
            failureReason: 'The text could not be prepared for Knuth-Plass line breaking.'
        };
    }

    if (!preparedState.prepared.segments.length) {
        return createParagraphTooShortResult();
    }

    return withProfileBucket(preparedState.profileBucket || 'customSolve', () => {
        const { prepared } = preparedState;
        const { kinds, widths, lineEndFitAdvances } = prepared;
        const sourceText = preparedState.sourceText || '';
        const segmentCount = prepared.segments.length;
        const segmentStartSourceBoundaries = preparedState.segmentStartSourceBoundaries;
        const segmentStartSpaceCounts = preparedState.segmentStartSpaceCounts;
        const rejectionReasonCounts = new Map();
        const bestCosts = new Array(segmentCount + 1).fill(Number.POSITIVE_INFINITY);
        const bestLines = new Array(segmentCount + 1).fill(null);
        bestCosts[segmentCount] = 0;

        function countSegmentSpaces(startSegmentIndex, endBoundaryIndex) {
            return segmentStartSpaceCounts[endBoundaryIndex] - segmentStartSpaceCounts[startSegmentIndex];
        }

        function considerCandidate(startSegmentIndex, bestState, nextSegmentIndex, normEndBoundaryIndex, appendText, naturalWidth) {
            const normStart = segmentStartSourceBoundaries[startSegmentIndex];
            const normEnd = segmentStartSourceBoundaries[normEndBoundaryIndex];
            const candidate = {
                nextSegmentIndex,
                normStart,
                normEnd,
                appendText,
                spaces: countSegmentSpaces(startSegmentIndex, normEndBoundaryIndex),
                naturalWidth,
                spaceWidth: preparedState.spaceWidth
            };
            const isLast = nextSegmentIndex >= segmentCount;
            const { demerit, rejectionReason } = computeLineDemerit(candidate, targetWidth, isLast, settings);
            if (!Number.isFinite(demerit)) {
                if (rejectionReason) {
                    rejectionReasonCounts.set(rejectionReason, (rejectionReasonCounts.get(rejectionReason) || 0) + 1);
                }
                return;
            }
            const nextCost = bestCosts[nextSegmentIndex];
            if (!Number.isFinite(nextCost)) return;

            const consecutiveHyphenPenalty = appendText === '-' && bestLines[nextSegmentIndex]?.appendText === '-'
                ? settings.consecutiveHyphenPenalty
                : 0;
            const total = demerit + consecutiveHyphenPenalty + nextCost;
            if (total < bestState.cost) {
                bestState.cost = total;
                bestState.line = candidate;
            }
        }

        for (let startSegmentIndex = segmentCount - 1; startSegmentIndex >= 0; startSegmentIndex--) {
            let bestState = { cost: Number.POSITIVE_INFINITY, line: null };
            let sawCandidate = false;
            let naturalWidth = 0;

            for (let segmentIndex = startSegmentIndex; segmentIndex < segmentCount; segmentIndex++) {
                const kind = kinds[segmentIndex];
                const segmentWidth = widths[segmentIndex];
                const nextKind = segmentIndex + 1 < kinds.length ? kinds[segmentIndex + 1] : '';

                if (kind === 'hard-break') {
                    if (segmentIndex > startSegmentIndex) {
                        sawCandidate = true;
                        considerCandidate(
                            startSegmentIndex,
                            bestState,
                            segmentIndex + 1,
                            segmentIndex,
                            '',
                            naturalWidth
                        );
                    }
                    break;
                }

                naturalWidth += segmentWidth;

                const normEndBoundaryIndex = kind === 'space' ? segmentIndex : segmentIndex + 1;
                if (kind === 'soft-hyphen') {
                    sawCandidate = true;
                    considerCandidate(
                        startSegmentIndex,
                        bestState,
                        segmentIndex + 1,
                        normEndBoundaryIndex,
                        '-',
                        naturalWidth - segmentWidth + lineEndFitAdvances[segmentIndex]
                    );
                    continue;
                }

                const canBreakHere = kind === 'space'
                    || kind === 'zero-width-break'
                    || (kind === 'text'
                        && nextKind !== 'space'
                        && nextKind !== 'soft-hyphen'
                        && nextKind !== 'zero-width-break'
                        && nextKind !== 'hard-break');

                if (!canBreakHere) continue;

                const naturalLineWidth = naturalWidth - segmentWidth + lineEndFitAdvances[segmentIndex];
                sawCandidate = true;
                considerCandidate(
                    startSegmentIndex,
                    bestState,
                    segmentIndex + 1,
                    normEndBoundaryIndex,
                    '',
                    naturalLineWidth
                );

                const spaces = countSegmentSpaces(startSegmentIndex, normEndBoundaryIndex);
                const overflow = naturalLineWidth - targetWidth;
                const maxShrink = spaces * preparedState.spaceWidth * (1 - settings.minSpaceWidthRatio);
                if (overflow > Math.max(maxShrink, 0)) break;
            }

            if (!sawCandidate) {
                rejectionReasonCounts.set('last-line-overflow', (rejectionReasonCounts.get('last-line-overflow') || 0) + 1);
            }

            bestCosts[startSegmentIndex] = bestState.cost;
            bestLines[startSegmentIndex] = bestState.line;
        }

        if (!Number.isFinite(bestCosts[0]) || !bestLines[0]) {
            const failureSummary = summarizeBreakFailure(rejectionReasonCounts);
            return {
                lines: null,
                failureCode: failureSummary.failureCode,
                failureReason: failureSummary.failureReason
            };
        }

        const lines = [];
        for (let segmentIndex = 0; segmentIndex < segmentCount;) {
            const line = bestLines[segmentIndex];
            if (!line) break;
            lines.push({
                text: sourceText.slice(line.normStart, line.normEnd) + line.appendText,
                normStart: line.normStart,
                normEnd: line.normEnd,
                appendText: line.appendText,
                spaces: line.spaces,
                naturalWidth: line.naturalWidth,
                spaceWidth: line.spaceWidth
            });
            segmentIndex = line.nextSegmentIndex;
        }

        return lines.length > 1
            ? { lines, failureCode: '', failureReason: '' }
            : {
                lines: null,
                failureCode: 'too-few-lines',
                failureReason: 'Paragraph produced fewer than two lines after line breaking.'
            };
    });
}

function breakLinesKnuthPlass(preparedState, targetWidth, settings) {
    if (shouldUseForwardActiveNodeKnuthPlass(settings)) {
        return breakLinesKnuthPlassActiveList(preparedState, targetWidth, settings);
    } else {
        return breakLinesKnuthPlassBackwardsDP(preparedState, targetWidth, settings);
    }
}

// ==========================================================================
// MARK: Local prepared text model
// ==========================================================================
function buildSegmentStartSpaceCounts(segmentStartSourceBoundaries, sourceSpacePrefix) {
    return segmentStartSourceBoundaries.map(boundary => sourceSpacePrefix[boundary] ?? 0);
}

function buildLocalPreparedParagraph(text, font, inlineWordMeasurementSource) {
    const metrics = buildWordMetrics(text, font, inlineWordMeasurementSource);
    const segments = [];
    const kinds = [];
    const widths = [];
    const lineEndFitAdvances = [];
    const segmentStartSourceBoundaries = [];

    function pushSegment(segment, kind, width, lineEndFitAdvance, sourceStart, sourceEnd) {
        segments.push(segment);
        kinds.push(kind);
        widths.push(width);
        lineEndFitAdvances.push(lineEndFitAdvance);
        segmentStartSourceBoundaries.push(sourceStart);
        return sourceEnd;
    }

    function pushWordRangeWithBreaks(word, wordIndex, wordStart, rangeStart, rangeEnd, wordBreaks) {
        let partStart = rangeStart;
        for (const item of wordBreaks) {
            if (item.index <= partStart || item.index >= rangeEnd) continue;
            const part = word.slice(partStart, item.index);
            const partWidth = measureWordSlice(metrics, wordIndex, partStart, item.index, font);
            pushSegment(part, 'text', partWidth, partWidth, wordStart + partStart, wordStart + item.index);

            if (item.appendText === '-') {
                const hyphenWidth = measureAppendTextWidth(metrics, wordIndex, item.index, item.appendText, font);
                pushSegment(SOFT_HYPHEN, 'soft-hyphen', 0, hyphenWidth, wordStart + item.index, wordStart + item.index);
            } else if (item.appendText === '') {
                pushSegment(ZERO_WIDTH_BREAK, 'zero-width-break', 0, 0, wordStart + item.index, wordStart + item.index);
            }
            partStart = item.index;
        }

        if (partStart < rangeEnd) {
            const part = word.slice(partStart, rangeEnd);
            const partWidth = measureWordSlice(metrics, wordIndex, partStart, rangeEnd, font);
            pushSegment(part, 'text', partWidth, partWidth, wordStart + partStart, wordStart + rangeEnd);
        }
    }

    for (let wordIndex = 0; wordIndex < metrics.words.length; wordIndex++) {
        const word = metrics.words[wordIndex];
        const wordStart = metrics.wordStarts[wordIndex];
        const wordEnd = wordStart + word.length;
        const wordBreaks = metrics.hyphenBreaks[wordIndex]
            .filter(item => item.index > 0 && item.index < word.length)
            .sort((a, b) => a.index - b.index);
        const atomicRanges = metrics.atomicRanges
            .filter(range => range.start >= wordStart && range.end <= wordEnd)
            .map(range => ({
                start: range.start - wordStart,
                end: range.end - wordStart
            }))
            .sort((a, b) => a.start - b.start || a.end - b.end);
        let partStart = 0;

        for (const range of atomicRanges) {
            if (range.end <= partStart) continue;
            const atomicStart = Math.max(range.start, partStart);
            if (atomicStart > partStart) {
                pushWordRangeWithBreaks(word, wordIndex, wordStart, partStart, atomicStart, wordBreaks);
            }
            if (range.end > atomicStart) {
                const part = word.slice(atomicStart, range.end);
                const partWidth = measureWordSlice(metrics, wordIndex, atomicStart, range.end, font);
                pushSegment(part, 'text', partWidth, partWidth, wordStart + atomicStart, wordStart + range.end);
            }
            partStart = Math.max(partStart, range.end);
        }

        if (partStart < word.length) {
            pushWordRangeWithBreaks(word, wordIndex, wordStart, partStart, word.length, wordBreaks);
        }

        if (wordIndex < metrics.words.length - 1) {
            const spaceStart = wordStart + word.length;
            pushSegment(' ', 'space', metrics.spaceWidth, 0, spaceStart, spaceStart + 1);
        }
    }

    const sourceTextEnd = text.length;
    segmentStartSourceBoundaries.push(sourceTextEnd);
    const sourceSpacePrefix = buildSourceSpacePrefix(text);

    return {
        prepared: {
            segments,
            kinds,
            widths,
            lineEndFitAdvances
        },
        sourceText: text,
        sourceSpacePrefix,
        segmentStartSourceBoundaries,
        segmentStartSpaceCounts: buildSegmentStartSpaceCounts(segmentStartSourceBoundaries, sourceSpacePrefix),
        spaceWidth: metrics.spaceWidth,
        hyphenWidth: metrics.hyphenWidth,
        profileBucket: 'customSolve'
    };
}

function computeLineDemerit(lineMetrics, targetWidth, isLast, settings) {
    const { spaces, naturalWidth, spaceWidth, appendText, normStart, normEnd } = lineMetrics;
    const delta = targetWidth - naturalWidth;
    const hyphenPenalty = appendText === '-' ? settings.hyphenPenalty : 0;

    if (isLast) {
        if (delta < 0) {
            return {
                demerit: Number.POSITIVE_INFINITY,
                rejectionReason: 'last-line-overflow'
            };
        }
        let penalty = settings.finalLinePenalty * Math.pow(delta / Math.max(targetWidth, 1), 2) + hyphenPenalty;
        if (spaces === 0) penalty += settings.singleWordLastLinePenalty;
        return { demerit: penalty, rejectionReason: '' };
    }

    if (spaces === 0) {
        if (appendText && naturalWidth <= targetWidth) {
            const fragmentChars = normEnd - normStart;
            const fillRatio = naturalWidth / Math.max(targetWidth, 1);
            if (fragmentChars < settings.minSingleWordHyphenChars || fillRatio < settings.minSingleWordHyphenFillRatio) {
                return {
                    demerit: Number.POSITIVE_INFINITY,
                    rejectionReason: 'single-word-line'
                };
            }
            const slackRatio = delta / Math.max(targetWidth, 1);
            const penalty = 1800 + hyphenPenalty + (2200 * slackRatio * slackRatio);
            return { demerit: penalty, rejectionReason: '' };
        }
        return {
            demerit: Number.POSITIVE_INFINITY,
            rejectionReason: 'single-word-line'
        };
    }

    const adjustment = delta / spaces;
    const adjustedSpaceWidth = spaceWidth + adjustment;
    const minSpaceWidth = spaceWidth * settings.minSpaceWidthRatio;
    const maxSpaceWidth = spaceWidth * settings.maxSpaceWidthRatio;

    if (adjustedSpaceWidth < minSpaceWidth || adjustedSpaceWidth > maxSpaceWidth) {
        return {
            demerit: Number.POSITIVE_INFINITY,
            rejectionReason: adjustedSpaceWidth < minSpaceWidth ? 'min-space-width' : 'max-space-width'
        };
    }

    const availableAdjustment = adjustment >= 0
        ? Math.max(maxSpaceWidth - spaceWidth, 1)
        : Math.max(spaceWidth - minSpaceWidth, 1);
    const ratio = Math.abs(adjustment) / availableAdjustment;
    const badness = 100 * Math.pow(ratio, 3);
    return {
        demerit: Math.pow(settings.linePenalty + badness, 2) + hyphenPenalty,
        rejectionReason: ''
    };
}

function summarizeBreakFailure(reasonCounts) {
    const orderedReasons = [
        'min-space-width',
        'max-space-width',
        'single-word-line',
        'last-line-overflow'
    ];
    let bestReason = '';
    let bestCount = 0;
    for (const reason of orderedReasons) {
        const count = reasonCounts.get(reason) || 0;
        if (count > bestCount) {
            bestCount = count;
            bestReason = reason;
        }
    }

    switch (bestReason) {
    case 'min-space-width':
        return {
            failureCode: bestReason,
            failureReason: 'No acceptable Knuth-Plass line breaks were found because candidate layouts needed spaces to shrink below the minimum width.'
        };
    case 'max-space-width':
        return {
            failureCode: bestReason,
            failureReason: 'No acceptable Knuth-Plass line breaks were found because candidate layouts needed spaces to stretch beyond the maximum width.'
        };
    case 'single-word-line':
        return {
            failureCode: bestReason,
            failureReason: 'No acceptable Knuth-Plass line breaks were found because candidate layouts required a single-word non-final line.'
        };
    case 'last-line-overflow':
        return {
            failureCode: bestReason,
            failureReason: 'No acceptable Knuth-Plass line breaks were found because the remaining final line could not fit within the paragraph width.'
        };
    default:
        return {
            failureCode: '',
            failureReason: 'No acceptable Knuth-Plass line breaks were found within the spacing limits.'
        };
    }
}

// ==========================================================================
// MARK: Adaptive solver retries
// ==========================================================================
function formatAdaptiveMaxSpacingAdjustment(baseRatio, relaxedRatio, attemptCount) {
    return `Laid out after raising the paragraph-local max space width ratio from ${baseRatio.toFixed(2)} to ${relaxedRatio.toFixed(2)} over ${attemptCount} ${attemptCount === 1 ? 'retry' : 'retries'}.`;
}

function formatAdaptiveSpacingAndHyphenAdjustment(baseSettings, relaxedSettings, maxAttemptCount, hyphenAttemptCount) {
    const parts = [];
    if (relaxedSettings.maxSpaceWidthRatio > baseSettings.maxSpaceWidthRatio + 1e-6 && maxAttemptCount > 0) {
        parts.push(`raising the paragraph-local max space width ratio from ${baseSettings.maxSpaceWidthRatio.toFixed(2)} to ${relaxedSettings.maxSpaceWidthRatio.toFixed(2)} over ${maxAttemptCount} ${maxAttemptCount === 1 ? 'retry' : 'retries'}`);
    }
    parts.push(`lowering the paragraph-local hyphen penalty from ${baseSettings.hyphenPenalty.toFixed(1)} to ${relaxedSettings.hyphenPenalty.toFixed(1)} over ${hyphenAttemptCount} ${hyphenAttemptCount === 1 ? 'retry' : 'retries'}`);
    return `Laid out after ${parts.join(' and ')}.`;
}

// Paragraphs keep a conservative global default, then only on spacing-limit
// failures do we relax settings locally for that one paragraph.  This preserves
// normal behavior elsewhere while still rescuing difficult narrow-measure cases.
function breakLinesWithAdaptivePreparedParagraphSpacing(preparedState, targetWidth, settings) {
    const baseResult = breakLinesKnuthPlass(preparedState, targetWidth, settings);
    if (baseResult.lines || baseResult.failureCode !== 'max-space-width') {
        return {
            ...baseResult,
            appliedSettings: settings,
            adjustmentMessage: ''
        };
    }

    const retryCount = settings.adaptiveMaxSpaceWidthRetryCount || 0;
    const retryStep = settings.adaptiveMaxSpaceWidthStep || 1;
    const ratioCap = Math.max(settings.maxSpaceWidthRatio, settings.adaptiveMaxSpaceWidthRatioCap || settings.maxSpaceWidthRatio);
    if (retryCount <= 0 || retryStep <= 1 || ratioCap <= settings.maxSpaceWidthRatio) {
        return {
            ...baseResult,
            appliedSettings: settings,
            adjustmentMessage: ''
        };
    }

    let relaxedSettings = settings;
    let lastResult = baseResult;
    let maxAttemptCount = 0;
    for (let attempt = 1; attempt <= retryCount; attempt++) {
        const nextRatio = Math.min(ratioCap, relaxedSettings.maxSpaceWidthRatio * retryStep);
        if (nextRatio <= relaxedSettings.maxSpaceWidthRatio + 1e-6) break;
        relaxedSettings = {
            ...relaxedSettings,
            maxSpaceWidthRatio: nextRatio
        };
        lastResult = breakLinesKnuthPlass(preparedState, targetWidth, relaxedSettings);
        maxAttemptCount = attempt;
        if (lastResult.lines) {
            return {
                ...lastResult,
                appliedSettings: relaxedSettings,
                adjustmentMessage: formatAdaptiveMaxSpacingAdjustment(settings.maxSpaceWidthRatio, relaxedSettings.maxSpaceWidthRatio, attempt)
            };
        }
        if (lastResult.failureCode !== 'max-space-width') break;
    }

    const hyphenRetryCount = settings.adaptiveHyphenPenaltyRetryCount || 0;
    const hyphenRetryStep = settings.adaptiveHyphenPenaltyStep || 1;
    if (hyphenRetryCount > 0 && hyphenRetryStep > 0 && hyphenRetryStep < 1) {
        let hyphenAttemptCount = 0;
        for (let attempt = 1; attempt <= hyphenRetryCount; attempt++) {
            const nextHyphenPenalty = Math.max(1, relaxedSettings.hyphenPenalty * hyphenRetryStep);
            if (nextHyphenPenalty >= relaxedSettings.hyphenPenalty - 1e-6) break;
            relaxedSettings = {
                ...relaxedSettings,
                hyphenPenalty: nextHyphenPenalty
            };
            lastResult = breakLinesKnuthPlass(preparedState, targetWidth, relaxedSettings);
            hyphenAttemptCount = attempt;
            if (lastResult.lines) {
                return {
                    ...lastResult,
                    appliedSettings: relaxedSettings,
                    adjustmentMessage: formatAdaptiveSpacingAndHyphenAdjustment(settings, relaxedSettings, maxAttemptCount, hyphenAttemptCount)
                };
            }
        }
    }

    return {
        ...lastResult,
        appliedSettings: settings,
        adjustmentMessage: ''
    };
}

function breakLinesWithAdaptiveParagraphSpacing(text, font, targetWidth, settings, inlineWordMeasurementSource) {
    const preparedState = buildLocalPreparedParagraph(text, font, inlineWordMeasurementSource);
    return breakLinesWithAdaptivePreparedParagraphSpacing(preparedState, targetWidth, settings);
}

function breakLinesWithAdaptiveParagraphSpacingWithPretext(orig, font, targetWidth, settings) {
    const preparedState = getPretextPreparedParagraph(orig, font);
    if (!preparedState?.prepared) return createKnuthPlassPrepareFailureResult();
    return breakLinesWithAdaptivePreparedParagraphSpacing(preparedState, targetWidth, settings);
}

// ==========================================================================
// MARK: DOM renderers
// ==========================================================================
function getClampedWordSpacing(extra, line, settings) {
    if (line.spaces <= 0) return null;
    // The solver and renderer both clamp spacing with the same settings so the
    // final DOM matches the assumptions that produced the winning line breaks.
    const minSpacing = line.spaceWidth * (settings.minSpaceWidthRatio - 1);
    const maxSpacing = line.spaceWidth * (settings.maxSpaceWidthRatio - 1);
    const spacing = Math.min(maxSpacing, Math.max(minSpacing, extra / line.spaces));
    return Number.isFinite(spacing) && Math.abs(spacing) > 0.01 ? spacing : null;
}

function shouldPreserveInlineLinkFlow(element, orig) {
    if (!orig?.text || !orig?.rawToNormIndices) return false;
    if (orig.inlineWordMeasurementSource) return false;
    if (element.querySelector('code, tt, pre')) return false;
    if (!element.querySelector('a')) return false;
    return !element.querySelector('*:not(a)');
}

function shouldUseTreeAwareInlineReplay(element, orig) {
    return !!getInlineReplaySnapshot(element, orig);
}

function createAdjustedSpaceNode(width) {
    const span = document.createElement('span');
    span.className = 'pretext-inline-space';
    span.textContent = ' ';
    span.style.width = `${width}px`;
    return span;
}

function createInlineRunNode() {
    const span = document.createElement('span');
    span.className = 'pretext-inline-run';
    return span;
}

function buildInlineFlowRenderPlan(orig, lines, width, settings) {
    const adjustedSpaceWidths = new Array(orig.text.length).fill(null);
    const breakBoundaries = new Map();
    const skippedSpaceIndices = new Set();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isLast = i === lines.length - 1;
        if (line.normStart < 0 || line.normEnd > orig.text.length || line.normEnd <= line.normStart) {
            return {
                ok: false,
                reason: 'Computed line break positions exceeded the normalized paragraph text.'
            };
        }

        const spacing = !isLast
            ? (getClampedWordSpacing(width - line.naturalWidth, line, settings) || 0)
            : 0;
        const adjustedWidth = line.spaceWidth + spacing;
        for (let normIndex = line.normStart; normIndex < line.normEnd; normIndex++) {
            if (orig.text[normIndex] === ' ') adjustedSpaceWidths[normIndex] = adjustedWidth;
        }

        if (!isLast) {
            breakBoundaries.set(line.normEnd, { appendText: line.appendText || '' });
            if (orig.text[line.normEnd] === ' ') skippedSpaceIndices.add(line.normEnd);
        }
    }

    return {
        ok: true,
        adjustedSpaceWidths,
        breakBoundaries,
        skippedSpaceIndices
    };
}

function renderLinesIntoElementPreservingInlineFlow(element, orig, lines, width, settings, failureMessagePrefix) {
    return withDomRenderProfile('domRenderInlineFlow', () => {
        const textNodeIndex = buildTextNodeIndex(element);
        const renderPlan = buildInlineFlowRenderPlan(orig, lines, width, settings);
        if (!renderPlan.ok) {
            return {
                ok: false,
                reason: `${failureMessagePrefix}${renderPlan.reason}`
            };
        }

        const { adjustedSpaceWidths, breakBoundaries, skippedSpaceIndices } = renderPlan;
        for (const { node, start } of textNodeIndex) {
            const fragment = document.createDocumentFragment();
            let currentRun = createInlineRunNode();
            let textBuffer = '';

            function flushTextBuffer() {
                if (!textBuffer) return;
                currentRun.appendChild(document.createTextNode(textBuffer));
                textBuffer = '';
            }

            function flushCurrentRun() {
                flushTextBuffer();
                if (!currentRun.childNodes.length) return;
                fragment.appendChild(currentRun);
                currentRun = createInlineRunNode();
            }

            const text = node.nodeValue || '';
            for (let offset = 0; offset < text.length; offset++) {
                const rawIndex = start + offset;
                const normIndex = orig.rawToNormIndices[rawIndex];
                if (normIndex === undefined || normIndex < 0) continue;

                const breakInfo = breakBoundaries.get(normIndex);
                if (breakInfo) {
                    flushTextBuffer();
                    if (breakInfo.appendText) currentRun.appendChild(document.createTextNode(breakInfo.appendText));
                    flushCurrentRun();
                    fragment.appendChild(document.createElement('br'));
                }

                if (skippedSpaceIndices.has(normIndex)) continue;

                if (orig.text[normIndex] === ' ') {
                    flushTextBuffer();
                    const adjustedWidth = adjustedSpaceWidths[normIndex];
                    if (adjustedWidth !== null) currentRun.appendChild(createAdjustedSpaceNode(adjustedWidth));
                    else textBuffer += ' ';
                    continue;
                }

                textBuffer += text[offset];
            }

            flushCurrentRun();
            node.replaceWith(fragment);
        }

        return { ok: true, reason: '' };
    });
}

function renderLinesIntoElementTreeReplay(element, orig, lines, width, settings, failureMessagePrefix) {
    return withDomRenderProfile('domRenderTreeReplay', () => {
        const snapshot = getInlineReplaySnapshot(element, orig);
        if (!snapshot) {
            return {
                ok: false,
                reason: `${failureMessagePrefix}No tree-aware inline replay snapshot was available for this paragraph.`
            };
        }

        const renderPlan = buildInlineFlowRenderPlan(orig, lines, width, settings);
        if (!renderPlan.ok) {
            return {
                ok: false,
                reason: `${failureMessagePrefix}${renderPlan.reason}`
            };
        }

        const { adjustedSpaceWidths, breakBoundaries, skippedSpaceIndices } = renderPlan;
        for (const atomicRange of snapshot.atomicRanges) {
            for (let boundary = atomicRange.startBoundary + 1; boundary < atomicRange.endBoundary; boundary++) {
                if (breakBoundaries.has(boundary)) {
                    return {
                        ok: false,
                        reason: `${failureMessagePrefix}The tree-aware renderer cannot split an atomic inline node across two lines.`
                    };
                }
                if (skippedSpaceIndices.has(boundary)) {
                    return {
                        ok: false,
                        reason: `${failureMessagePrefix}The tree-aware renderer encountered an atomic inline node with an internal break-space.`
                    };
                }
                if (snapshot.boundaryOpens[boundary]?.length || snapshot.boundaryCloses[boundary]?.length) {
                    return {
                        ok: false,
                        reason: `${failureMessagePrefix}The tree-aware renderer encountered nested inline boundaries inside an atomic inline node.`
                    };
                }
            }
        }

        const fragment = document.createDocumentFragment();
        const stack = [fragment];
        let activeAtomicEndBoundary = -1;

        function currentParent() {
            return stack[stack.length - 1];
        }

        function appendText(text) {
            if (!text) return;
            const parent = currentParent();
            const lastChild = parent.lastChild;
            if (lastChild?.nodeType === Node.TEXT_NODE) lastChild.nodeValue += text;
            else parent.appendChild(document.createTextNode(text));
        }

        for (let boundary = 0; boundary <= orig.text.length; boundary++) {
            if (boundary < activeAtomicEndBoundary) continue;

            const breakInfo = breakBoundaries.get(boundary);
            if (breakInfo?.appendText) appendText(breakInfo.appendText);

            const closes = snapshot.boundaryCloses[boundary];
            for (const descriptor of closes) {
                if (stack.length <= 1) {
                    return {
                        ok: false,
                        reason: `${failureMessagePrefix}The tree-aware renderer encountered an unexpected inline close boundary.`
                    };
                }
                const node = currentParent();
                if (!(node instanceof Element) || node.tagName.toLowerCase() !== descriptor.tagName) {
                    return {
                        ok: false,
                        reason: `${failureMessagePrefix}The tree-aware renderer could not reconcile nested inline markup with the solved breakpoints.`
                    };
                }
                stack.pop();
            }

            if (breakInfo) currentParent().appendChild(document.createElement('br'));

            const opens = snapshot.boundaryOpens[boundary];
            for (const descriptor of opens) {
                const node = cloneInlineReplayDescriptor(descriptor);
                currentParent().appendChild(node);
                stack.push(node);
            }

            const atomics = snapshot.atomicEntries[boundary];
            if (atomics?.length) {
                for (const atomic of atomics) {
                    currentParent().appendChild(cloneInlineReplayDescriptor(atomic.descriptor));
                    activeAtomicEndBoundary = Math.max(activeAtomicEndBoundary, atomic.endBoundary);
                }
                if (boundary < activeAtomicEndBoundary) continue;
            }

            if (boundary >= orig.text.length || skippedSpaceIndices.has(boundary)) continue;

            const ch = orig.text[boundary];
            if (ch === ' ') {
                const adjustedWidth = adjustedSpaceWidths[boundary];
                if (adjustedWidth !== null) currentParent().appendChild(createAdjustedSpaceNode(adjustedWidth));
                else appendText(' ');
                continue;
            }

            appendText(ch);
        }

        if (stack.length !== 1) {
            return {
                ok: false,
                reason: `${failureMessagePrefix}The tree-aware renderer left inline markup open after replaying the paragraph.`
            };
        }

        element.replaceChildren(fragment);
        return { ok: true, reason: '' };
    });
}

function countRenderedLines(element) {
    return withProfileBucket('naturalLineCount', () => {
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
    });
}

function renderLinesIntoElement(element, orig, lines, width, settings, failureMessagePrefix) {
    return withDomRenderProfile('domRenderLineClone', () => {
        const textNodeIndex = buildTextNodeIndex(element);
        const fragment = document.createDocumentFragment();
        let textNodeSearchIndex = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isLast = i === lines.length - 1;
            const normStart = line.normStart;
            const normEnd = line.normEnd;
            if (normStart < 0 || normEnd > orig.rawIndices.length || normEnd <= normStart) {
                return {
                    ok: false,
                    reason: `${failureMessagePrefix}Computed line break positions exceeded the normalized paragraph text.`
                };
            }

            const rawStart = orig.rawIndices[normStart];
            const rawEnd = orig.rawIndices[normEnd - 1] + 1;
            const startResult = findDomPosFromIndex(textNodeIndex, rawStart, textNodeSearchIndex);
            const endResult = findDomPosFromIndex(textNodeIndex, rawEnd, startResult.nodeIndex);
            const startPos = startResult.pos;
            const endPos = endResult.pos;
            if (!startPos || !endPos) {
                return {
                    ok: false,
                    reason: `${failureMessagePrefix}Computed line break positions could not be resolved back to DOM text nodes.`
                };
            }
            textNodeSearchIndex = endResult.nodeIndex;

            const range = document.createRange();
            range.setStart(startPos.node, startPos.offset);
            range.setEnd(endPos.node, endPos.offset);

            const span = document.createElement('span');
            span.className = 'pretext-line';
            span.appendChild(range.cloneContents());
            if (line.appendText) span.appendChild(document.createTextNode(line.appendText));

            if (!isLast) {
                const spacing = getClampedWordSpacing(width - line.naturalWidth, line, settings);
                if (spacing !== null) span.style.wordSpacing = `${spacing}px`;
            }

            fragment.appendChild(span);
        }

        element.replaceChildren(fragment);
        return { ok: true, reason: '' };
    });
}

// ==========================================================================
// MARK: Per-element render pipelines
// ==========================================================================
function renderParagraph(p, passMetadata = null) {
    const orig = rememberOriginal(p);
    restore(p);
    setParagraphLayoutAdjustment(p, '');
    setParagraphLayoutEngine(p, '');
    setParagraphLayoutRenderer(p, '');
    const metadata = passMetadata || createPassLayoutMetadata(p);
    const targetKind = metadata.kind;
    if (!targetKind) {
        settleParagraphVisibility(p);
        setParagraphEligibilityClass(p, false);
        setParagraphLayoutState(p, 'inactive', 'Element is not eligible for custom text layout.');
        return;
    }
    if (targetKind !== 'body-paragraph' && getOrMeasureNaturalLineCount(p, metadata) < 2) {
        settleParagraphVisibility(p);
        setParagraphEligibilityClass(p, false);
        setParagraphLayoutState(
            p,
            'inactive',
            targetKind === 'list-item'
                ? 'List item is only a single line at this width.'
                : 'Quote block is only a single line at this width.'
        );
        return;
    }
    // getBoundingClientRect gives sub-pixel precision; floor to stay within the
    // actual column so word-spacing never pushes a line past its container.
    const cs = window.getComputedStyle(p);
    const pLeft  = parseFloat(cs.paddingLeft)  || 0;
    const pRight = parseFloat(cs.paddingRight) || 0;
    const width = Math.floor(p.getBoundingClientRect().width - pLeft - pRight);
    if (!orig.text) {
        restore(p);
        settleParagraphVisibility(p);
        setParagraphEligibilityClass(p, false);
        setParagraphLayoutState(p, 'inactive', 'Paragraph has no usable text after normalization.');
        return;
    }
    if (width < 120) {
        restore(p);
        settleParagraphVisibility(p);
        setParagraphEligibilityClass(p, false);
        setParagraphLayoutState(p, 'inactive', 'Paragraph is too narrow for the layout pass.');
        return;
    }

    const font = buildFontShorthand(cs);
    const settings = getActiveKnuthPlassSettings();
    const plainPretextMode = isPlainPretextCandidate(p, orig) ? PRETEXT_PLAIN_PARAGRAPH_MODE : 'off';
    let breakResult = null;
    let adjustmentMessage = '';
    let usedEngine = '';

    if (plainPretextMode === 'greedy') {
        breakResult = breakLinesWithPretextGreedy(orig, font, width);
        if (breakResult.lines) {
            usedEngine = 'pretext';
            adjustmentMessage = 'Laid out with the experimental Pretext greedy plain-text engine.';
        }
    } else if (plainPretextMode === 'knuth-plass') {
        breakResult = breakLinesWithAdaptiveParagraphSpacingWithPretext(orig, font, width, settings);
        if (breakResult.lines) {
            usedEngine = 'pretext';
            adjustmentMessage = breakResult.adjustmentMessage || 'Laid out with the experimental Pretext Knuth-Plass plain-text engine.';
        }
    }

    if (!breakResult || !breakResult.lines) {
        if (plainPretextMode !== 'off' && activePassProfile) activePassProfile.pretextFallbacks += 1;
        breakResult = breakLinesWithAdaptiveParagraphSpacing(
            orig.text,
            font,
            width,
            settings,
            orig.inlineWordMeasurementSource
        );
        adjustmentMessage = breakResult.adjustmentMessage || '';
        if (breakResult.lines) usedEngine = 'custom';
    }

    const lines = breakResult.lines;
    const appliedSettings = breakResult.appliedSettings || settings;
    if (!lines) {
        restore(p);
        settleParagraphVisibility(p);
        setParagraphEligibilityClass(p, false);
        setParagraphLayoutEngine(p, 'failed');
        setParagraphLayoutState(p, 'inactive', breakResult.failureReason || 'No acceptable Knuth-Plass line breaks were found within the spacing limits.');
        if (activePassProfile) activePassProfile.paragraphEngines.failed += 1;
        return;
    }

    const treeAwareInlineReplay = shouldUseTreeAwareInlineReplay(p, orig);
    const preserveInlineFlow = !treeAwareInlineReplay && shouldPreserveInlineLinkFlow(p, orig);
    let renderResult = null;
    let usesInlineFlowRendering = false;
    let renderer = 'line-clone';
    if (treeAwareInlineReplay) {
        renderResult = renderLinesIntoElementTreeReplay(p, orig, lines, width, appliedSettings, '');
        if (renderResult.ok) {
            usesInlineFlowRendering = true;
            renderer = 'tree-replay';
        } else {
            renderResult = renderLinesIntoElement(p, orig, lines, width, appliedSettings, '');
            renderer = 'line-clone';
        }
    } else if (preserveInlineFlow) {
        renderResult = renderLinesIntoElementPreservingInlineFlow(p, orig, lines, width, appliedSettings, '');
        if (renderResult.ok) {
            usesInlineFlowRendering = true;
            renderer = 'inline-flow';
        }
    } else {
        renderResult = renderLinesIntoElement(p, orig, lines, width, appliedSettings, '');
    }
    if (!renderResult.ok) {
        restore(p);
        settleParagraphVisibility(p);
        setParagraphEligibilityClass(p, false);
        setParagraphLayoutEngine(p, 'failed');
        setParagraphLayoutState(p, 'inactive', renderResult.reason || 'Computed line break positions could not be rendered back into the paragraph DOM.');
        if (activePassProfile) activePassProfile.paragraphEngines.failed += 1;
        return;
    }
    if (usesInlineFlowRendering) p.classList.add('pretext-inline-flow-active');
    p.classList.add('pretext-layout-active');
    orig.rendered = true;
    setParagraphEligibilityClass(p, true);
    setParagraphLayoutEngine(p, usedEngine || 'custom');
    setParagraphLayoutRenderer(p, renderer);
    setParagraphLayoutAdjustment(p, adjustmentMessage);
    setParagraphLayoutState(p, 'active', '');
    settleParagraphVisibility(p);
    if (activePassProfile) activePassProfile.paragraphEngines[usedEngine || 'custom'] += 1;
}

function renderCaption(span, passMetadata = null) {
    const orig = rememberOriginal(span);
    restore(span);
    setParagraphLayoutRenderer(span, '');

    const metadata = passMetadata || createPassCaptionMetadata(span);
    const naturalLineCount = getOrMeasureNaturalLineCount(span, metadata);
    // pbrt: skip K-P for caption legend spans. They live inline inside a
    // figcaption that already carries the bold "Figure N: Title." prefix, and
    // applying white-space:nowrap to the legend (the tree-replay path) pushes
    // its first K-P line off the title's row, producing an inconsistent break
    // for long captions vs short ones. Browser-justify gives uniform results.
    if (!orig.text || naturalLineCount < 99) return;

    const width = Math.floor(span.getBoundingClientRect().width);
    if (width < 120) return;

    const font = buildFontShorthand(window.getComputedStyle(span));
    const captionSettings = getActiveCaptionKnuthPlassSettings();
    const plainPretextMode = isPlainPretextCaptionCandidate(span, orig) ? PRETEXT_PLAIN_CAPTION_MODE : 'off';
    let captionResult = null;
    let usedEngine = '';
    if (plainPretextMode === 'greedy') captionResult = breakLinesWithPretextGreedy(orig, font, width);
    else if (plainPretextMode === 'knuth-plass') {
        const preparedState = getPretextPreparedParagraph(orig, font);
        captionResult = preparedState?.prepared
            ? breakLinesKnuthPlass(preparedState, width, captionSettings)
            : createKnuthPlassPrepareFailureResult();
    }
    if (captionResult?.lines) usedEngine = 'pretext';
    if (!captionResult || !captionResult.lines || captionResult.lines.length < 3) {
        if (plainPretextMode !== 'off' && activePassProfile) activePassProfile.pretextFallbacks += 1;
        captionResult = breakLinesKnuthPlass(
            buildLocalPreparedParagraph(orig.text, font, orig.inlineWordMeasurementSource),
            width,
            captionSettings
        );
        if (captionResult?.lines) usedEngine = 'custom';
    }
    const lines = captionResult.lines;
    if (!lines || lines.length < 3) {
        if (activePassProfile) activePassProfile.captionEngines.failed += 1;
        return;
    }

    const treeAwareInlineReplay = shouldUseTreeAwareInlineReplay(span, orig);
    const preserveInlineFlow = !treeAwareInlineReplay && shouldPreserveInlineLinkFlow(span, orig);
    let renderResult = null;
    let usesInlineFlowRendering = false;
    let renderer = 'line-clone';
    if (treeAwareInlineReplay) {
        renderResult = renderLinesIntoElementTreeReplay(span, orig, lines, width, captionSettings, '');
        if (renderResult.ok) {
            usesInlineFlowRendering = true;
            renderer = 'tree-replay';
        } else {
            renderResult = renderLinesIntoElement(span, orig, lines, width, captionSettings, '');
            renderer = 'line-clone';
        }
    } else if (preserveInlineFlow) {
        renderResult = renderLinesIntoElementPreservingInlineFlow(span, orig, lines, width, captionSettings, '');
        if (renderResult.ok) {
            usesInlineFlowRendering = true;
            renderer = 'inline-flow';
        }
    } else {
        renderResult = renderLinesIntoElement(span, orig, lines, width, captionSettings, '');
    }
    if (!renderResult.ok) {
        restore(span);
        if (activePassProfile) activePassProfile.captionEngines.failed += 1;
        return;
    }
    if (usesInlineFlowRendering) span.classList.add('pretext-inline-flow-active');
    span.classList.add('pretext-layout-active');
    span.style.width = `${width}px`;
    orig.rendered = true;
    setParagraphLayoutRenderer(span, renderer);
    if (activePassProfile) activePassProfile.captionEngines[usedEngine || 'custom'] += 1;
}

// ==========================================================================
// MARK: Initialization and external API
// ==========================================================================
function rafThrottle(fn) {
    let frame = 0;
    return () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
            frame = 0;
            fn();
        });
    };
}

function init() {
    if (!PRETEXT_ENABLED) {
        clearAllPendingParagraphVisibility();
        setManagedParagraphAlignment(false);
        status.reason = 'disabled';
        return;
    }
    markReferenceSectionContent();
    setManagedParagraphAlignment(isManagedLayoutEnabled());
    if (isManagedLayoutEnabled()) {
        scanAndScheduleLayoutTargets();
        // Some pages do a small amount of post-processing after DOMContentLoaded.
        // Re-scan after a short delay so early startup does not get stuck with
        // an empty target set before that content settles.
        scheduleLayoutTargetRescan();
        scheduleLayoutTargetRescan(500);
    } else {
        restoreManagedLayoutTargets();
        status.reason = 'disabled';
    }
    status.loaded = true;
    window.addEventListener('resize', handleResizeRelayout);
    window.addEventListener('load', () => {
        scanAndScheduleLayoutTargets();
    }, { once: true });
}

function isManagedLayoutEnabled() {
    return PRETEXT_ENABLED && pretextLayoutUserEnabled;
}

function isBrowserJustifyComparisonEnabled() {
    return PRETEXT_ENABLED && pretextLayoutUserEnabled && browserJustifyComparisonEnabled;
}

function restoreManagedLayoutTargets() {
    clearReadyRenderQueues();
    queryLayoutRootElements(PARAGRAPH_TARGET_SELECTOR).forEach(paragraph => {
        rememberOriginal(paragraph);
        restore(paragraph);
        setParagraphEligibilityClass(paragraph, false);
        setParagraphLayoutAdjustment(paragraph, '');
        setParagraphLayoutEngine(paragraph, '');
        setParagraphLayoutRenderer(paragraph, '');
        setParagraphLayoutState(paragraph, 'inactive', 'Custom text layout disabled.');
    });
    queryLayoutRootElements(CAPTION_TARGET_SELECTOR).forEach(caption => {
        rememberOriginal(caption);
        restore(caption);
    });
    clearAllPendingParagraphVisibility();
}

function setManagedLayoutEnabled(enabled) {
    pretextLayoutUserEnabled = !!enabled;
    if (!PRETEXT_ENABLED) {
        clearAllPendingParagraphVisibility();
        setManagedParagraphAlignment(false);
        status.reason = 'disabled';
        return;
    }
    if (!pretextLayoutUserEnabled) {
        browserJustifyComparisonEnabled = false;
        restoreManagedLayoutTargets();
        setManagedParagraphAlignment(false);
        status.reason = 'disabled';
        return;
    }
    loadPretextModule();
    setManagedParagraphAlignment(true);
    markReferenceSectionContent();
    scanAndScheduleLayoutTargets();
}

function setBrowserJustifyComparisonEnabled(enabled) {
    browserJustifyComparisonEnabled = !!enabled;
    if (!PRETEXT_ENABLED) {
        clearAllPendingParagraphVisibility();
        status.reason = 'disabled';
        return;
    }
    if (browserJustifyComparisonEnabled) {
        renderBrowserJustifyComparisonPass();
    } else if (isManagedLayoutEnabled()) {
        runResizeSettledRelayoutPass();
    } else {
        restoreManagedLayoutTargets();
    }
}

window.__pretextLayoutControls = {
    setEnabled: setManagedLayoutEnabled,
    isEnabled: () => isManagedLayoutEnabled(),
    setBrowserJustifyComparison: setBrowserJustifyComparisonEnabled,
    isBrowserJustifyComparisonEnabled,
    getKnuthPlassSettings: getKnuthPlassSettingsSnapshot,
    setKnuthPlassSetting,
    refresh: () => {
        if (browserJustifyComparisonEnabled) renderBrowserJustifyComparisonPass();
        else if (isManagedLayoutEnabled()) runResizeSettledRelayoutPass();
        else restoreManagedLayoutTargets();
    }
};

document.addEventListener(PRETEXT_LAYOUT_TOGGLE_EVENT, event => {
    setManagedLayoutEnabled(!event.detail || event.detail.enabled !== false);
});

function startWhenReady() {
    if (hasStartedLayoutInit) return;
    hasStartedLayoutInit = true;
    loadPretextModule();
    try {
        init();
    } catch (_) {
        clearAllPendingParagraphVisibility();
        status.reason = 'initialization-failed';
    }
}

startWhenReady();
