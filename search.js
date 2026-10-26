// search.js: the site's search user interface: the search box in the
// navigation bar (which shows results as you type), the search results page
// (/4ed/search.html), and the highlighting of search terms on pages that are
// reached from search results.
//
// The search itself is implemented in search-engine.js; it and the corpus
// it searches are only loaded when they are needed.

(function () {
'use strict';

const ROOT = '/4ed/';
const RESULTS_PAGE = ROOT + 'search.html';
const CORPUS_URL = ROOT + 'search/corpus.json';
const ENGINE_URL = '/search-engine.js';

const GROUPS_PER_PAGE = 15;   // sections shown on the results page at a time
const HITS_PER_GROUP = 3;     // matches shown for each section before "more"
const SUBENTRIES_SHOWN = 8;   // index subentries shown before "more"

///////////////////////////////////////////////////////////////////////////
// Loading the engine and the index

let enginePromise = null, indexPromise = null;

function loadEngine() {
    if (window.PBRSearchEngine) return Promise.resolve(window.PBRSearchEngine);
    if (!enginePromise) {
        enginePromise = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = ENGINE_URL;
            s.onload = () => resolve(window.PBRSearchEngine);
            s.onerror = () => { enginePromise = null; reject(new Error('Unable to load ' + ENGINE_URL)); };
            document.head.appendChild(s);
        });
    }
    return enginePromise;
}

function loadIndex() {
    if (!indexPromise) {
        const corpus = fetch(CORPUS_URL).then(r => {
            if (!r.ok) throw new Error('Unable to load the search index (' + r.status + ')');
            return r.json();
        });
        indexPromise = Promise.all([loadEngine(), corpus])
            .then(([E, c]) => new E.SearchIndex(c))
            .catch(err => { indexPromise = null; throw err; });
    }
    return indexPromise;
}

///////////////////////////////////////////////////////////////////////////
// Formatting results

function escapeHTML(s) {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// Converts corpus text to HTML, handling `code` and math; the character
// ranges in |marks| (sorted [start, end) pairs) are highlighted.
function textToHTML(text, marks, isCode) {
    const E = window.PBRSearchEngine;
    let out = '', mi = 0, inCode = false, inMath = false;
    for (let i = 0; i < text.length; ++i) {
        if (mi < marks.length && i === marks[mi][0]) out += '<mark>';
        const c = text[i];
        if (c === '`' && !isCode) {
            out += inCode ? '</code>' : '<code>';
            inCode = !inCode;
        } else if (c === E.MATH_OPEN) {
            out += '<span class="pbr-math">';
            inMath = true;
        } else if (c === E.MATH_CLOSE) {
            out += '</span>';
            inMath = false;
        } else {
            out += escapeHTML(c);
        }
        if (mi < marks.length && i + 1 === marks[mi][1]) {
            out += '</mark>';
            ++mi;
        }
    }
    if (inCode) out += '</code>';
    if (inMath) out += '</span>';
    return out;
}

// Returns a function that reports whether a token matches one of the
// query's terms.
function termMatcher(stems, prefixes) {
    return t => stems.has(t.stem) || (prefixes || []).some(p => t.word.startsWith(p));
}

function markRanges(text, matches) {
    const E = window.PBRSearchEngine;
    return E.tokenize(text, true).filter(matches).map(t => [t.start, t.end]);
}

// Returns HTML for an excerpt of the given text of up to about maxLength
// characters, chosen to show as many of the matched terms as possible.
function snippetHTML(text, matches, maxLength) {
    const E = window.PBRSearchEngine;
    const toks = E.tokenize(text, true);
    const hits = toks.filter(matches);
    if (text.length <= maxLength)
        return textToHTML(text, hits.map(t => [t.start, t.end]), false);

    // Find the window that has the most distinct matching terms.
    let bestStart = 0, bestScore = -1;
    for (let i = 0; i < hits.length; ++i) {
        const start = Math.max(0, hits[i].start - Math.floor(maxLength / 4));
        const seen = new Set();
        let n = 0;
        for (let j = i; j < hits.length && hits[j].end <= start + maxLength; ++j) {
            seen.add(hits[j].stem);
            ++n;
        }
        const score = 10 * seen.size + n;
        if (score > bestScore) {
            bestScore = score;
            bestStart = start;
        }
    }

    // Start at the beginning of a sentence if there's one shortly before;
    // otherwise at a word boundary.
    let start = bestStart;
    if (start > 0) {
        const sentence = text.lastIndexOf('. ', start);
        if (sentence !== -1 && start - sentence < maxLength / 4) start = sentence + 2;
        else while (start > 0 && !/\s/.test(text[start - 1])) --start;
    }
    let end = Math.min(text.length, start + maxLength);
    if (end < text.length) {
        while (end > start && !/\s/.test(text[end])) --end;
    }
    // Don't split inline math.
    const mathOpen = text.lastIndexOf(E.MATH_OPEN, start);
    if (mathOpen !== -1 && text.indexOf(E.MATH_CLOSE, mathOpen) >= start) start = mathOpen;
    const mathOpenEnd = text.lastIndexOf(E.MATH_OPEN, end);
    if (mathOpenEnd !== -1 && mathOpenEnd >= start && text.indexOf(E.MATH_CLOSE, mathOpenEnd) >= end)
        end = mathOpenEnd;

    // If the excerpt starts within inline code, restore its opening.
    let codePrefix = '';
    let ticks = 0;
    for (let i = 0; i < start; ++i) if (text[i] === '`') ++ticks;
    if (ticks % 2 === 1) codePrefix = '`';

    const sub = codePrefix + text.substring(start, end);
    const offset = start - codePrefix.length;
    const marks = hits.filter(t => t.start >= start && t.end <= end).map(t => [t.start - offset, t.end - offset]);
    return (start > 0 ? '… ' : '') + textToHTML(sub, marks, false) + (end < text.length ? ' …' : '');
}

// Returns HTML for a few lines of code around the best match.
function codeSnippetHTML(text, matches, maxLines) {
    const lines = text.split('\n');
    let best = 0, bestCount = -1;
    const E = window.PBRSearchEngine;
    const lineHits = lines.map(l => E.tokenize(l, true).filter(matches));
    lineHits.forEach((h, i) => {
        const n = new Set(h.map(t => t.stem)).size;
        if (n > bestCount) {
            best = i;
            bestCount = n;
        }
    });
    let first = Math.max(0, best - 1), last = Math.min(lines.length, first + maxLines);
    first = Math.max(0, last - maxLines);
    const shown = lines.slice(first, last);
    let indent = Math.min.apply(null, shown.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
    if (!isFinite(indent)) indent = 0;
    const html = shown.map((l, i) => {
        const marks = lineHits[first + i].map(t => [t.start - indent, t.end - indent]);
        return textToHTML(l.substr(indent), marks, true);
    });
    if (maxLines === 1) return html.join('');
    return (first > 0 ? '<span class="pbr-code-elision">⋮</span>\n' : '') + html.join('\n') +
        (last < lines.length ? '\n<span class="pbr-code-elision">⋮</span>' : '');
}

///////////////////////////////////////////////////////////////////////////
// Links and labels for locations in the book

// URL for a page, with the query to highlight there. Since the anchor may
// be followed by multiple blocks that have all of the terms, |nth|
// indicates which one is the target.
function pageURL(url, anchor, query, nth) {
    let u = ROOT + url;
    if (query) {
        u += '?h=' + encodeURIComponent(query.text);
        if (query.terms.some(t => t.prefix)) u += '&hp=1';
        if (nth) u += '&n=' + nth;
    }
    if (anchor) u += '#' + anchor;
    return u;
}

function blockURL(index, bi, query) {
    const b = index.blocks[bi];
    const E = window.PBRSearchEngine;
    let nth = 0;
    if (query && !E.hasAllTerms(b[4], query)) {
        // The block doesn't have all of the terms (e.g., for partial
        // matches or for the book's index); only use the ones it has.
        const toks = E.tokenize(b[4], true);
        const kept = query.terms.filter(t => t.required &&
            toks.some(tok => tok.stem === t.stem || (t.prefix && tok.word.startsWith(t.word))));
        query = kept.length === 0 ? null :
            E.parseQuery(kept.map(t => t.word).join(' '), kept[kept.length - 1].prefix);
    }
    if (query && b[1] !== 'o') {
        // Count the earlier blocks after the same anchor that will also
        // match on the page. (Footnotes aren't in the page's text.)
        for (let i = bi - 1; i >= 0 && index.blocks[i][0] === b[0] && index.blocks[i][3] === b[3]; --i)
            if (index.blocks[i][1] !== 'o' && E.hasAllTerms(index.blocks[i][4], query)) ++nth;
    }
    return pageURL(index.pages[b[0]][0], b[3], query, nth);
}

// A short label for where the block is, e.g., "6.2.2" or "Further Reading (Ch. 6)".
function blockLabel(index, bi) {
    const page = index.pages[index.blocks[bi][0]];
    if (page[2] === 'Further Reading' || page[2] === 'Exercises') {
        const ch = /^(\S+)\s/.exec(page[1]);
        return page[2] + (ch ? ' (' + (/^\d/.test(ch[1]) ? 'Ch. ' : 'App. ') + ch[1] + ')' : '');
    }
    return index.sectionNumber(bi) || page[2] || page[1];
}

// The title of the innermost section that contains the block.
function blockSectionTitle(index, bi) {
    const b = index.blocks[bi];
    if (/^[1-4]$/.test(b[1])) return b[4];
    const h = index.headings(bi);
    if (h.length > 0) return index.blocks[h[h.length - 1]][4];
    const page = index.pages[b[0]];
    return page[2] || page[1];
}

function pageTitle(index, pi) {
    const page = index.pages[pi];
    return page[2] || page[1];
}

// Text that describes the block's full location, for tooltips.
function blockLocation(index, bi) {
    const b = index.blocks[bi];
    const page = index.pages[b[0]];
    const parts = [page[1]];
    if (page[2]) parts.push(page[2]);
    for (const h of index.headings(bi)) parts.push(index.blocks[h][4]);
    if (/^[34]$/.test(b[1])) parts.push(b[4]);
    return parts.join(' › ');
}

// Finds the block with the given anchor on the given page (for
// identifier definitions).
function anchorBlock(index, page, anchor) {
    if (!index.anchorMap) {
        index.anchorMap = new Map();
        index.blocks.forEach((b, i) => {
            const k = b[0] + '#' + b[3];
            if (!index.anchorMap.has(k)) index.anchorMap.set(k, i);
        });
    }
    const bi = index.anchorMap.get(page + '#' + anchor);
    return bi === undefined ? -1 : bi;
}

///////////////////////////////////////////////////////////////////////////
// Searching

// Runs all of the searches for a query and gathers the results.
function runSearch(index, text, prefixLast) {
    const E = window.PBRSearchEngine;
    const query = E.parseQuery(text, prefixLast);
    const full = index.search(query, 0);
    const prefixes = query.terms.filter(t => t.prefix).map(t => t.word);
    const matches = termMatcher(full.stems, prefixes);

    // Group the matches by page, skipping duplicates (e.g., the same
    // bibliography entry in multiple chapters).
    const groups = new Map(), seen = new Set();
    for (const r of full.results) {
        const b = index.blocks[r.block];
        if (seen.has(b[4])) continue;
        seen.add(b[4]);
        let g = groups.get(b[0]);
        if (!g) {
            g = { page: b[0], hits: [], score: 0 };
            groups.set(b[0], g);
        }
        g.hits.push(r);
    }
    const sorted = Array.from(groups.values());
    for (const g of sorted) {
        g.score = g.hits[0].score;
        for (let i = 1; i < Math.min(g.hits.length, 5); ++i) g.score += 0.15 * g.hits[i].score;
    }
    sorted.sort((a, b) => b.score - a.score);

    return {
        query: query,
        matches: matches,
        groups: sorted,
        nMatches: seen.size,
        partial: full.partial,
        missing: full.missing,
        identifiers: index.searchIdentifiers(text, prefixLast),
        bookIndex: index.searchBookIndex(query),
    };
}

// Suggests alternative spellings for words in the query that don't
// appear in the book.
function suggestQuery(index, query) {
    let changed = false;
    const words = query.terms.map(t => {
        if (index.postings.has(t.stem)) return t.word;
        const maxDist = t.word.length >= 5 ? 2 : 1;
        let best = null, bestDist = maxDist + 1, bestCount = 0;
        for (const w of index.words) {
            if (Math.abs(w.length - t.word.length) > maxDist) continue;
            const d = editDistance(t.word, w, maxDist + 1);
            if (d > maxDist) continue;
            const count = index.postings.get(index.wordStem.get(w)).length;
            if (d < bestDist || (d === bestDist && count > bestCount)) {
                best = w;
                bestDist = d;
                bestCount = count;
            }
        }
        if (best === null) return t.word;
        changed = true;
        return best;
    });
    return changed ? words.join(' ') : null;
}

// Levenshtein distance, or |limit| if it's at least that.
function editDistance(a, b, limit) {
    let prev = new Array(b.length + 1), cur = new Array(b.length + 1);
    for (let j = 0; j <= b.length; ++j) prev[j] = j;
    for (let i = 1; i <= a.length; ++i) {
        cur[0] = i;
        let rowMin = i;
        for (let j = 1; j <= b.length; ++j) {
            cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
            rowMin = Math.min(rowMin, cur[j]);
        }
        if (rowMin >= limit) return limit;
        [prev, cur] = [cur, prev];
    }
    return Math.min(prev[b.length], limit);
}

///////////////////////////////////////////////////////////////////////////
// The results page

class ResultsPage {
    constructor(container, input) {
        this.container = container;
        this.input = input;
        this.index = null;
        this.timer = 0;

        const params = new URLSearchParams(location.search);
        input.value = params.get('q') || '';

        input.addEventListener('input', () => {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => this.update(true), 150);
        });
        input.form.addEventListener('submit', ev => {
            ev.preventDefault();
            clearTimeout(this.timer);
            this.update(true);
        });
        window.addEventListener('popstate', () => {
            input.value = new URLSearchParams(location.search).get('q') || '';
            this.update(false);
        });
        container.addEventListener('click', ev => this.click(ev));

        if (input.value.trim()) {
            this.container.innerHTML = '<p class="pbr-search-status">Loading the search index…</p>';
        } else {
            input.focus();
        }
        loadIndex().then(index => {
            this.index = index;
            this.update(false);
        }).catch(err => {
            this.container.innerHTML = '<p class="pbr-search-status">' + escapeHTML(err.message) + '</p>';
        });
    }

    update(updateURL) {
        const text = this.input.value.trim();
        if (updateURL) {
            const url = text ? RESULTS_PAGE + '?q=' + encodeURIComponent(text) : RESULTS_PAGE;
            history.replaceState(null, '', url);
        }
        document.title = text ? 'Search: ' + text : 'Search';
        if (!this.index) return;
        if (!text) {
            this.container.innerHTML = '';
            return;
        }
        this.results = runSearch(this.index, text, false);
        this.groupsShown = 0;
        this.container.innerHTML = this.renderAll();
    }

    click(ev) {
        const more = ev.target.closest('[data-pbr-more]');
        if (!more) return;
        ev.preventDefault();
        const what = more.getAttribute('data-pbr-more');
        if (what === 'results') {
            const list = this.container.querySelector('.pbr-result-list');
            list.insertAdjacentHTML('beforeend', this.renderGroups());
            if (this.groupsShown >= this.results.groups.length) more.remove();
        } else {
            // Reveal the hidden items in the enclosing list.
            const list = more.closest('.pbr-result, ul');
            list.querySelectorAll(':scope > .pbr-hidden').forEach(e => e.classList.remove('pbr-hidden'));
            if (more.parentElement.tagName === 'LI' && more.parentElement.children.length === 1)
                more.parentElement.remove();
            else
                more.remove();
        }
    }

    renderAll() {
        const r = this.results, index = this.index;
        let html = '';

        const nGroups = r.groups.length;
        let status = '';
        if (r.missing.length > 0)
            status += 'Not found in the book: ' + r.missing.map(t => '<b>' + escapeHTML(t.word) + '</b>').join(', ') + '. ';
        const suggestion = r.missing.length > 0 ? suggestQuery(index, r.query) : null;
        if (suggestion)
            status += 'Did you mean <a href="' + RESULTS_PAGE + '?q=' + encodeURIComponent(suggestion) + '">' +
                escapeHTML(suggestion) + '</a>?';
        if (status) html += '<p class="pbr-search-status">' + status + '</p>';

        if (nGroups === 0 && r.identifiers.length === 0 && r.bookIndex.main.length === 0 && r.bookIndex.sub.length === 0) {
            if (!status) html += '<p class="pbr-search-status">No results for <b>' + escapeHTML(r.query.text) + '</b>.</p>';
            return html;
        }

        // Exact matches of identifiers come first; otherwise, the book's
        // index is more likely to be useful.
        if (r.identifiers.length > 0 && r.identifiers[0].score >= 3)
            html += this.renderIdentifiers() + this.renderBookIndex();
        else
            html += this.renderBookIndex() + this.renderIdentifiers();

        html += '<h2 class="pbr-results-heading">Text';
        if (nGroups > 0)
            html += ' <span class="pbr-count">' + r.nMatches + (r.nMatches === 1 ? ' match' : ' matches') +
                ' in ' + nGroups + (nGroups === 1 ? ' section' : ' sections') + '</span>';
        html += '</h2>';
        if (r.partial)
            html += '<p class="pbr-search-status">No single paragraph includes all of the words; these include most of them.</p>';
        if (nGroups === 0)
            html += '<p class="pbr-search-status">No text matches.</p>';
        html += '<ol class="pbr-result-list">' + this.renderGroups() + '</ol>';
        if (this.groupsShown < nGroups)
            html += '<button class="pbr-more-button" data-pbr-more="results">More results</button>';
        return html;
    }

    renderGroups() {
        const r = this.results, index = this.index;
        let html = '';
        const end = Math.min(r.groups.length, this.groupsShown + GROUPS_PER_PAGE);
        for (let gi = this.groupsShown; gi < end; ++gi) {
            const g = r.groups[gi];
            const page = index.pages[g.page];
            html += '<li class="pbr-result">';
            html += '<div class="pbr-result-title"><a href="' + escapeHTML(pageURL(page[0], '', r.query)) + '">' +
                escapeHTML(pageTitle(index, g.page)) + '</a>';
            if (page[2]) html += ' <span class="pbr-result-chapter">' + escapeHTML(page[1]) + '</span>';
            html += '</div>';
            g.hits.forEach((hit, i) => {
                html += this.renderHit(hit.block, i >= HITS_PER_GROUP);
            });
            if (g.hits.length > HITS_PER_GROUP) {
                const n = g.hits.length - HITS_PER_GROUP;
                html += '<button class="pbr-more-button pbr-small" data-pbr-more="hits">' + n + ' more ' +
                    (n === 1 ? 'match' : 'matches') + ' in this section</button>';
            }
            html += '</li>';
        }
        this.groupsShown = end;
        return html;
    }

    renderHit(bi, hidden) {
        const index = this.index, r = this.results;
        const b = index.blocks[bi];
        const E = window.PBRSearchEngine;
        const kind = b[1];
        let html = '<div class="pbr-hit' + (hidden ? ' pbr-hidden' : '') + '">';
        const url = escapeHTML(blockURL(index, bi, r.query));

        // Where it is: the subsection (if any) and what kind of thing matched.
        const where = [];
        const h = index.headings(bi);
        if (h.length > 0 && !/^[1-4]$/.test(kind))
            where.push('<a href="' + url + '">' + escapeHTML(index.blocks[h[h.length - 1]][4]) + '</a>');
        if (kind !== 'p' && !/^[1-4]$/.test(kind))
            where.push('<span class="pbr-kind">' + (kind === 'f' && /^Table/.test(b[4]) ? 'Table' : E.KIND_NAMES[kind]) + '</span>');
        if (where.length > 0) html += '<div class="pbr-hit-where">' + where.join(' ') + '</div>';

        if (kind === 'c') {
            html += '<a class="pbr-hit-link" href="' + url + '"><pre class="pbr-snippet pbr-code-snippet">' +
                codeSnippetHTML(b[4], r.matches, 4) + '</pre></a>';
        } else if (kind === 'n') {
            html += '<a class="pbr-hit-link" href="' + url + '"><div class="pbr-snippet pbr-fragment-name">⟨' +
                textToHTML(b[4], markRanges(b[4], r.matches), false) + '⟩</div></a>';
        } else if (/^[1-4]$/.test(kind)) {
            html += '<a class="pbr-hit-link" href="' + url + '"><div class="pbr-snippet pbr-heading-hit">' +
                textToHTML(b[4], markRanges(b[4], r.matches), false) + '</div></a>';
        } else {
            html += '<a class="pbr-hit-link" href="' + url + '"><div class="pbr-snippet">' +
                snippetHTML(b[4], r.matches, 260) + '</div></a>';
        }
        return html + '</div>';
    }

    // Links to the targets of an index entry, labeled with section numbers
    // and printed page numbers.
    renderIndexTargets(entry) {
        const index = this.index;
        return (entry.t || []).map(t => {
            const bi = t[0];
            const pp = String(t[1]);
            return '<a class="pbr-index-target" href="' + escapeHTML(blockURL(index, bi, this.results.query)) + '" title="' +
                escapeHTML(blockLocation(index, bi)) + '">' + escapeHTML(blockLabel(index, bi)) +
                '<span class="pbr-printed-page">' + (/–/.test(pp) ? 'pp.' : 'p.') + '&nbsp;' + escapeHTML(pp) + '</span></a>';
        }).join('<span class="pbr-sep">, </span>');
    }

    renderIndexTerm(text) {
        return textToHTML(text, markRanges(text.replace(/`/g, ' '), this.results.matches), false);
    }

    renderIndexEntry(ei) {
        const e = this.index.bookIndex[ei];
        let html = this.renderIndexTerm(e.p[e.p.length - 1]);
        if (e.s) {
            html += ' <span class="pbr-see">see <a href="' + RESULTS_PAGE + '?q=' +
                encodeURIComponent(e.s.replace(/`/g, '')) + '">' + textToHTML(e.s, [], false) + '</a></span>';
        } else if (e.t && e.t.length > 0) {
            html += ' <span class="pbr-index-targets">' + this.renderIndexTargets(e) + '</span>';
        }
        return html;
    }

    renderBookIndex() {
        const bi = this.results.bookIndex, index = this.index;
        if (bi.main.length === 0 && bi.sub.length === 0) return '';
        let html = '<h2 class="pbr-results-heading">In the book’s index</h2><ul class="pbr-index">';
        bi.main.forEach((m, i) => {
            html += '<li class="pbr-index-main' + (i >= 4 ? ' pbr-hidden' : '') + '">' + this.renderIndexEntry(m.main.entry);
            if (m.main.subentries.length > 0) {
                html += '<ul class="pbr-index-sub">';
                m.main.subentries.forEach((si, j) => {
                    html += '<li' + (j >= SUBENTRIES_SHOWN ? ' class="pbr-hidden"' : '') + '>' +
                        this.renderIndexEntry(si) + '</li>';
                });
                if (m.main.subentries.length > SUBENTRIES_SHOWN) {
                    const n = m.main.subentries.length - SUBENTRIES_SHOWN;
                    html += '<li><button class="pbr-more-button pbr-small" data-pbr-more="sub">' + n + ' more</button></li>';
                }
                html += '</ul>';
            }
            html += '</li>';
        });
        // Subentries of other entries, shown along with their main entry.
        bi.sub.forEach((s, i) => {
            const main = index.bookIndex[s.main.entry];
            html += '<li class="pbr-index-main' + (bi.main.length + i >= 6 ? ' pbr-hidden' : '') + '">' +
                this.renderIndexTerm(main.p[0]) + '<ul class="pbr-index-sub"><li>' + this.renderIndexEntry(s.entry) +
                '</li></ul></li>';
        });
        const total = bi.main.length + bi.sub.length;
        const shown = Math.min(bi.main.length, 4) + Math.max(0, Math.min(bi.sub.length, 6 - bi.main.length));
        if (total > shown)
            html += '<li><button class="pbr-more-button pbr-small" data-pbr-more="index">' + (total - shown) +
                ' more index ' + (total - shown === 1 ? 'entry' : 'entries') + '</button></li>';
        return html + '</ul>';
    }

    renderIdentifiers() {
        const ids = this.results.identifiers, index = this.index;
        if (ids.length === 0) return '';
        let html = '<h2 class="pbr-results-heading">Definitions</h2><ul class="pbr-definitions">';
        ids.forEach((id, i) => {
            const ident = index.identifiers[id.ident];
            const bi = anchorBlock(index, ident[1], ident[2]);
            const where = bi >= 0 ? blockSectionTitle(index, bi) : pageTitle(index, ident[1]);
            html += '<li' + (i >= 6 ? ' class="pbr-hidden"' : '') + '><a href="' +
                escapeHTML(pageURL(index.pages[ident[1]][0], ident[2], null)) + '"><code>' + escapeHTML(ident[0]) +
                '</code></a> <span class="pbr-where">' + escapeHTML(where) + '</span></li>';
        });
        if (ids.length > 6)
            html += '<li><button class="pbr-more-button pbr-small" data-pbr-more="ids">' + (ids.length - 6) + ' more</button></li>';
        return html + '</ul>';
    }
}

///////////////////////////////////////////////////////////////////////////
// The search box in the navigation bar, which shows a dropdown with the
// top results as the user types.

class SearchBox {
    constructor(input) {
        this.input = input;
        this.form = input.form;
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'pbr-dropdown';
        this.dropdown.id = 'pbr-dropdown-' + SearchBox.count++;
        this.dropdown.setAttribute('role', 'listbox');
        this.dropdown.hidden = true;
        this.form.appendChild(this.dropdown);
        this.items = [];
        this.active = -1;
        this.timer = 0;

        input.setAttribute('role', 'combobox');
        input.setAttribute('aria-autocomplete', 'list');
        input.setAttribute('aria-expanded', 'false');
        input.setAttribute('aria-controls', this.dropdown.id);

        input.addEventListener('focus', () => {
            loadIndex().catch(() => {});
            if (input.value.trim()) this.update();
        });
        input.addEventListener('input', () => {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => this.update(), 60);
        });
        input.addEventListener('keydown', ev => this.keydown(ev));
        input.addEventListener('blur', () => setTimeout(() => this.close(), 150));
        // Keep the focus in the input when the dropdown is clicked.
        this.dropdown.addEventListener('mousedown', ev => ev.preventDefault());
        this.form.addEventListener('submit', ev => {
            if (!input.value.trim()) ev.preventDefault();
        });
    }

    close() {
        this.dropdown.hidden = true;
        this.input.setAttribute('aria-expanded', 'false');
        this.active = -1;
    }

    keydown(ev) {
        if (ev.key === 'Escape') {
            if (!this.dropdown.hidden) this.close();
            else this.input.blur();
            ev.preventDefault();
        } else if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
            if (this.dropdown.hidden || this.items.length === 0) return;
            ev.preventDefault();
            const n = this.items.length;
            this.setActive(ev.key === 'ArrowDown' ? (this.active + 1) % n : (this.active + n - 1) % n);
        } else if (ev.key === 'Enter') {
            if (this.active >= 0 && !this.dropdown.hidden) {
                ev.preventDefault();
                location.href = this.items[this.active].href;
            }
        }
    }

    setActive(i) {
        this.items.forEach((item, j) => item.classList.toggle('pbr-active', i === j));
        this.active = i;
        if (i >= 0) {
            this.input.setAttribute('aria-activedescendant', this.items[i].id);
            this.items[i].scrollIntoView({ block: 'nearest' });
        } else {
            this.input.removeAttribute('aria-activedescendant');
        }
    }

    show(html) {
        this.dropdown.innerHTML = html;
        this.dropdown.hidden = false;
        this.input.setAttribute('aria-expanded', 'true');
        this.items = Array.from(this.dropdown.querySelectorAll('a.pbr-dropdown-item'));
        this.items.forEach((item, i) => {
            item.id = this.dropdown.id + '-' + i;
            item.setAttribute('role', 'option');
        });
        this.setActive(-1);
    }

    update() {
        const text = this.input.value.trim();
        if (!text) {
            this.close();
            return;
        }
        if (!window.PBRSearchEngine || !this.index) {
            this.show('<div class="pbr-dropdown-status">Loading the search index…</div>');
            loadIndex().then(index => {
                this.index = index;
                if (document.activeElement === this.input) this.update();
            }).catch(err => this.show('<div class="pbr-dropdown-status">' + escapeHTML(err.message) + '</div>'));
            return;
        }

        const index = this.index;
        const r = runSearch(index, this.input.value, true);
        let html = '';
        const item = (href, title, detail, cls) =>
            '<a class="pbr-dropdown-item' + (cls ? ' ' + cls : '') + '" href="' + escapeHTML(href) + '">' +
            '<span class="pbr-dropdown-title">' + title + '</span>' +
            (detail ? '<span class="pbr-dropdown-detail">' + detail + '</span>' : '') + '</a>';

        for (const id of r.identifiers.slice(0, 3)) {
            const ident = index.identifiers[id.ident];
            const bi = anchorBlock(index, ident[1], ident[2]);
            html += item(pageURL(index.pages[ident[1]][0], ident[2], null),
                         '<code>' + escapeHTML(ident[0]) + '</code>',
                         'Definition · ' + escapeHTML(bi >= 0 ? blockSectionTitle(index, bi) : pageTitle(index, ident[1])));
        }

        let nIndex = 0;
        for (const m of r.bookIndex.main) {
            if (nIndex === 3) break;
            const e = index.bookIndex[m.main.entry];
            // Link to the entry's first target, or to the full results if
            // it only has subentries.
            let target = e.t && e.t.length > 0 ? e.t[0][0] : -1;
            const nSub = m.main.subentries.length;
            if (target === -1 && nSub === 0) continue;
            const href = target >= 0 && nSub === 0 ? blockURL(index, target, r.query)
                : RESULTS_PAGE + '?q=' + encodeURIComponent(e.p[0].replace(/`/g, ''));
            const detail = target >= 0 && nSub === 0 ? 'Index · ' + escapeHTML(blockSectionTitle(index, target))
                : 'Index · ' + (nSub + (e.t ? e.t.length : 0)) + ' entries';
            html += item(href, textToHTML(e.p[0], markRanges(e.p[0].replace(/`/g, ' '), r.matches), false), detail);
            ++nIndex;
        }

        for (const g of r.groups.slice(0, 6 - Math.min(nIndex, 2))) {
            const bi = g.hits[0].block;
            const b = index.blocks[bi];
            let title = blockSectionTitle(index, bi);
            let snippet = '';
            if (/^[1-4]$/.test(b[1])) {
                title = textToHTML(b[4], markRanges(b[4], r.matches), false);
                // Show where the heading is.
                const h = index.headings(bi), page = index.pages[b[0]];
                snippet = escapeHTML(h.length > 0 ? index.blocks[h[h.length - 1]][4] :
                                     b[1] === '2' || !page[2] ? page[1] : page[2]);
                if (b[1] === '1') snippet = '';
            } else {
                title = escapeHTML(title);
                snippet = b[1] === 'c' ? '<code>' + codeSnippetHTML(b[4], r.matches, 1) + '</code>'
                    : b[1] === 'n' ? '⟨' + textToHTML(b[4], markRanges(b[4], r.matches), false) + '⟩'
                    : snippetHTML(b[4], r.matches, 110);
            }
            html += item(blockURL(index, bi, r.query), title, snippet, 'pbr-dropdown-text');
        }

        if (html === '') html = '<div class="pbr-dropdown-status">No matches.</div>';
        html += item(RESULTS_PAGE + '?q=' + encodeURIComponent(text),
                     'All results for “' + escapeHTML(text) + '”', '', 'pbr-dropdown-all');
        this.show(html);
    }
}
SearchBox.count = 0;

///////////////////////////////////////////////////////////////////////////
// Highlighting search terms on a page reached from the search results.

// The paragraph layout code (pretext-layout.js) breaks paragraphs into
// lines, removing the spaces at line breaks and adding hyphens when it
// breaks words. Returns true if the given node is at the end of such a
// line.
function atLineEnd(node, block) {
    for (let n = node; n && n !== block; n = n.parentNode) {
        if (n.nextSibling) return n.nextSibling.nodeName === 'BR';
        if (n.parentNode.classList && n.parentNode.classList.contains('pretext-line')) return true;
    }
    return false;
}

// Finds the block of text on the page that was a search result: the nth
// one after the anchor that has all of the query's terms. To get that
// right, this walks the page's text the same way that tangleweave/search.go
// does when it extracts the corpus, splitting it into the same blocks.
// Returns {element, start}, where start is the first text node of the block,
// which may not be at the start of the element; returns null if there's no
// such block.
function findTarget(E, query, anchorId, nth) {
    // Identifiers' anchors may also appear in collapsed copies of code
    // fragments; use the one that isn't.
    let anchor = null;
    if (anchorId) {
        const all = Array.from(document.querySelectorAll('[id="' + CSS.escape(anchorId) + '"]'));
        anchor = all.find(e => !e.closest('.collapse')) || all[0] || null;
    }
    // Elements that start new blocks of text.
    const blockSelector = 'p, li, figcaption, h1, h2, h3, h4, h5, h6, tr, div, ol, ul, table, thead, tbody, ' +
        'pre, blockquote, dl, dt, dd';
    // Blocks whose text isn't included.
    const skipBlockSelector = '.displaymath, .leftcolumn, .eqno';
    // Inline elements whose text isn't included. (Collapsed code also
    // doesn't end the current block.)
    const skipSelector = '.collapse, .exerciseicon, button, script, style, nav';

    let passedAnchor = !anchor, segment = null, target = null, firstMatch = null;

    // Since a hyphen at the end of a line may either have been added by the
    // layout code or have been there originally, the text of each block is
    // accumulated both with such words joined and without.
    const startSegment = (block, node) => {
        if (!segment)
            segment = { block: block, start: node, joined: '', split: '', hyphen: false, afterAnchor: passedAnchor };
    };
    const endSegment = () => {
        if (segment && segment.afterAnchor &&
            (E.hasAllTerms(segment.joined, query) || E.hasAllTerms(segment.split, query))) {
            const match = { element: segment.block, start: segment.start };
            if (!firstMatch) firstMatch = match;
            if (nth-- === 0) target = match;
        }
        segment = null;
    };
    const lineBreak = () => {
        if (!segment) return;
        if (!segment.hyphen) segment.joined += ' ';
        segment.split += ' ';
        segment.hyphen = false;
    };
    const walk = (node, block) => {
        for (let c = node.firstChild; c && !target; c = c.nextSibling) {
            if (c === anchor) passedAnchor = true;
            if (c.nodeType === Node.TEXT_NODE) {
                const v = c.nodeValue;
                if (!segment && !/\S/.test(v)) continue;
                startSegment(block, c);
                if (v.endsWith('-') && atLineEnd(c, block)) {
                    segment.joined += v.slice(0, -1);
                    segment.hyphen = true;
                } else {
                    segment.joined += v;
                }
                segment.split += v;
            } else if (c.nodeType === Node.ELEMENT_NODE) {
                if (c.tagName === 'BR') {
                    lineBreak();
                } else if (c.tagName.toLowerCase() === 'svg') {
                    // Inline math starts a block in the corpus, though its
                    // text isn't searched.
                    startSegment(block, c);
                    segment.joined += ' ';
                    segment.split += ' ';
                } else if (c.matches(skipSelector)) {
                    continue;
                } else if (c.matches(blockSelector)) {
                    endSegment();
                    if (!c.matches(skipBlockSelector)) walk(c, c);
                    endSegment();
                } else {
                    walk(c, block);
                    if (c.classList.contains('pretext-line')) lineBreak();
                }
            }
        }
    };
    for (const root of document.querySelectorAll('.pretext-layout-root')) {
        walk(root, root);
        endSegment();
        if (target) break;
    }
    // Use the first match if there aren't as many as expected.
    return target || firstMatch;
}

function highlightSearchTerms() {
    const params = new URLSearchParams(location.search);
    const q = params.get('h');
    if (!q) return;

    loadEngine().then(E => {
        const query = E.parseQuery(q, params.get('hp') === '1');
        const terms = query.terms.filter(t => t.required);
        if (terms.length === 0) return;
        const matchesTerm = (t, tok) => tok.stem === t.stem || (t.prefix && tok.word.startsWith(t.word));
        const matches = tok => terms.some(t => matchesTerm(t, tok));

        const roots = Array.from(document.querySelectorAll('.pretext-layout-root'));
        const visible = node => {
            for (let e = node.parentElement; e; e = e.parentElement) {
                const tag = e.tagName.toLowerCase();
                if (tag === 'svg' || tag === 'script' || tag === 'style' || e.classList.contains('collapse'))
                    return false;
                if (e.classList.contains('pretext-layout-root')) return true;
            }
            return true;
        };

        const found = findTarget(E, query, decodeURIComponent(location.hash.substr(1)),
                                 parseInt(params.get('n') || '0', 10));
        const target = found ? found.element : null;
        // Whether the node is in the target block (which may start partway
        // through the target element).
        const inTarget = node => target && target.contains(node) &&
            (!found.start.isConnected || found.start === node ||
             (found.start.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING));

        let firstRange = null;
        const supported = window.CSS && CSS.highlights && window.Highlight;
        const highlight = () => {
            if (!supported) return;
            const ranges = [];
            firstRange = null;
            for (const root of roots) {
                const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
                for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                    if (!node.nodeValue.trim() || !visible(node)) continue;
                    for (const tok of E.tokenize(node.nodeValue, true)) {
                        if (!matches(tok)) continue;
                        const range = new Range();
                        range.setStart(node, tok.start);
                        range.setEnd(node, tok.end);
                        ranges.push(range);
                        if (!firstRange && inTarget(node)) firstRange = range;
                    }
                }
            }
            CSS.highlights.set('pbr-search', new Highlight(...ranges));
        };
        highlight();

        // The text layout code rewrites paragraphs after the page loads, so
        // the highlights need to be updated when the DOM changes.
        let observer = null;
        if (supported) {
            let timer = 0;
            observer = new MutationObserver(() => {
                clearTimeout(timer);
                timer = setTimeout(highlight, 200);
            });
            for (const root of roots) observer.observe(root, { childList: true, subtree: true });
        }

        // Scroll to the match, unless the user has started scrolling.
        let userScrolled = false;
        const noteScroll = () => { userScrolled = true; };
        for (const ev of ['wheel', 'touchmove', 'keydown', 'mousedown'])
            window.addEventListener(ev, noteScroll, { once: true, passive: true });
        const scrollToTarget = () => {
            if (userScrolled || !target) return;
            const rect = (firstRange && firstRange.getClientRects().length > 0 ? firstRange : target).getBoundingClientRect();
            window.scrollTo(window.scrollX, window.scrollY + rect.top - window.innerHeight / 3);
        };
        if (target) {
            target.classList.add('pbr-search-target');
            scrollToTarget();
            // Again after the layout settles (and after the code in the
            // footer that adjusts the scroll position for anchors).
            setTimeout(scrollToTarget, 700);
            setTimeout(scrollToTarget, 1700);
        }

        // A note about the highlighting, with links back to the results and
        // to turn it off.
        const note = document.createElement('div');
        note.className = 'pbr-search-note';
        note.setAttribute('role', 'status');
        note.innerHTML = '<a href="' + RESULTS_PAGE + '?q=' + encodeURIComponent(q) + '">« Search results</a> for ' +
            '<b>' + escapeHTML(q) + '</b> <button type="button" aria-label="Clear search highlighting" title="Clear highlighting">×</button>';
        note.querySelector('button').addEventListener('click', () => {
            if (supported) CSS.highlights.delete('pbr-search');
            if (observer) observer.disconnect();
            if (target) target.classList.remove('pbr-search-target');
            note.remove();
            history.replaceState(history.state, '', location.pathname + location.hash);
        });
        document.body.appendChild(note);
    });
}

///////////////////////////////////////////////////////////////////////////

function init() {
    for (const input of document.querySelectorAll('input.pbr-search-input'))
        new SearchBox(input);

    const results = document.getElementById('pbr-search-results');
    if (results) new ResultsPage(results, document.getElementById('pbr-search-query'));

    highlightSearchTerms();

    // "/" focuses the search box.
    document.addEventListener('keydown', ev => {
        if (ev.key !== '/' || ev.ctrlKey || ev.metaKey || ev.altKey) return;
        const t = ev.target;
        if (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName)) return;
        const input = document.getElementById('pbr-search-query') ||
            Array.from(document.querySelectorAll('input.pbr-search-input')).find(i => i.offsetParent !== null);
        if (input) {
            ev.preventDefault();
            input.focus();
            input.select();
        }
    });
}

// For testing.
window.PBRSearch = { findTarget: findTarget, loadEngine: loadEngine, loadIndex: loadIndex };

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
