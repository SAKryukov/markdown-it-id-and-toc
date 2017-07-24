"use strict";

const defaultOptions = {
    enableHeadingId: true,
    autoNumberingPattern: [
        { start: 1 },
        { prefix: "Chapter ", start: 1 },
        { },
        { start: 1, accumulate: true },
    ],
    autoNumberingSuffix: ". ",
    defaultAutoNumberingPrefix: '',
    defaultAutoAutoNumberingStart: 1,
    autoNumberingRegex: "\\[\\]\\(numbering(*.?)\\)",
    includeLevel: [2, 4, 5, 6],
    tocContainerClass: "toc",
    tocRegex: "^\\[\\]\\(toc\\)",
    excludeFromTocRegex: "\\[\\]\\(notoc\\)",
    defaultListElement: "ul",
    listElements: ["ul", "ul", "ul", "ul", "ul", "ul"],
    defaultListElementAttributeSet: { style: "list-style-type: none;" },
    listElementAttributeSets: [],
    itemPrefixes: ['', 'Chapter '], // array of strings: prefix depending on level
    format: undefined
}; //defaultOptions
defaultOptions.bulletedListType = defaultOptions.defaultListElement;

module.exports = function (md, userOptions) {

    const util = require("util");

    const options = defaultOptions;
    if (userOptions)
        for (let index in userOptions)
            options[index] = userOptions[index];

    // no magic function names:
    const tocFunctionNames = { open: "tocOpen", close: "tocClose", body: "tocBody" };
    const ruleName = "toc"; // works with null, but let's care about other plug-ins

    // entry point:
    md.core.ruler.before("inline", "buildToc", function (state) {
        if (!options.enableHeadingId)   // inconsistent with having toc/no-toc tags, 
            return;                     // so leave them as is
        let tocRegexp = options.tocRegex;
        if (tocRegexp.constructor != RegExp)
            tocRegexp = new RegExp(options.tocRegex, "m");
        // extra global check saves time if there is no match:
        let doToc = false;
        if (tocRegexp) {
            const match = tocRegexp.exec(state.src);
            doToc = match != null;
        } //if
        let excludeFromTocRegex = options.excludeFromTocRegex;
        if (excludeFromTocRegex.constructor != RegExp)
            excludeFromTocRegex = new RegExp(options.excludeFromTocRegex, "m");
        //
        const usedIds = { headings: {}, toc: {}, excludeFromToc: {} };
        const idCounts = { headings: 0, toc: 0 };
        const idSet = [];
        buildIdSet(idSet, state.tokens, excludeFromTocRegex, usedIds);
        addIdAttributes(idCounts, idSet);
        if (!doToc) return;
        createToc(state, usedIds, idCounts, idSet);
        detectAndPushToc(tocRegexp);
    }); //md.core.ruler.before

    const slugify = function (s, used) {
        let slug = options.idPrefix +
            s.replace(' ', '-')
                .replace(/[^A-Za-z0-9\-\.\_]/g, function (match) {
                    return match.codePointAt().toString(16);
                }).toLowerCase();
        while (used[slug])
            slug += '.';
        used[slug] = slug;
        return slug;
    } // idHeadersSlugify    

    function headingLevel(token) { return token.tag && parseInt(token.tag.substr(1, 1)); }

    function nextNumber(number) { // number is a letter of a number as string or numeric
        let tryNumeric = parseInt(number);
        if (isNaN(tryNumeric)) {
            let codePoint = number.codePointAt();
            return String.fromCodePoint(++codePoint);
        } else
            return (++tryNumeric).toString();
    } //nextNumber    

    function initializeAutoNumbering() {
        return {
            level: -1,
            levels: []
        };
    } //initializeAutoNumbering
    function getAutoNumberingOption(level, array, generic) {
        if (!array) return generic;
        if (!array[level - 1]) return generic;
        if (!array[level - 1].length) return generic;
        return array[level - 1];
    } //getAutoNumberingOption
    function iterateAutoNumbering(excludeFromToc, autoSet, token) {
        if (excludeFromToc) return '';
        const delimiters = ["", "", "", "", "-" ];
        const defaultDelimiter = '.';
        const initials = ["", "", "", "α", "a"];
        const defaultInitial = 1;
        if (!options.autoNumberingPattern)
            return '';
        const level = headingLevel(token);
        const initialNumber = getAutoNumberingOption(level, initials, defaultInitial);
        if (!autoSet.levels[level])
            autoSet.levels[level] = { number: initialNumber };
        if (level > autoSet.level) {
            autoSet.levels[level].number = initialNumber;
            const delimiter = getAutoNumberingOption(autoSet.level, delimiters, defaultDelimiter);
            autoSet.levels[level].accumulator =
                autoSet.levels[autoSet.level] ?
                    (
                        autoSet.levels[autoSet.level].accumulator ?
                            autoSet.levels[autoSet.level].accumulator + delimiter + autoSet.levels[autoSet.level].number
                            : autoSet.levels[autoSet.level].number
                    ) :
                    '';
        } else
            autoSet.levels[level].number = nextNumber(autoSet.levels[level].number);
        const result =
            autoSet.levels[level].accumulator.length > 0 ? 
                util.format("%s%s%s%s",
                    autoSet.levels[level].accumulator,
                    getAutoNumberingOption(level, delimiters, defaultDelimiter),
                    autoSet.levels[level].number,
                    options.autoNumberingSuffix)
                : autoSet.levels[level].number + options.autoNumberingSuffix;
        autoSet.level = level;
        return result;
    } //iterateAutoNumbering

    function buildIdSet(idSet, tokens, excludeFromTocRegex, usedIds) {
        // auto-numbers:
        const autoSet = initializeAutoNumbering();
        // end auto-numbers
        let lastLevel
        for (let index = 1; index < tokens.length; ++index) {
            const token = tokens[index];
            const headingTextToken = tokens[index - 1];
            if (token.type !== "heading_close" || headingTextToken.type !== "inline") continue;
            let excludeFromToc = false;
            if (excludeFromTocRegex) {
                const oldContent = headingTextToken.content;
                headingTextToken.content = headingTextToken.content.replace(excludeFromTocRegex, "");
                excludeFromToc = oldContent !== headingTextToken.content;
                if (excludeFromToc)
                    usedIds.excludeFromToc[index] = token;
            } //if
            idSet.push({
                id: slugify(headingTextToken.content, usedIds),
                prefix: iterateAutoNumbering(excludeFromToc, autoSet, token)
            });
        } //loop
    } //buildIdSet

    function addIdAttributes(idCounts, idSet) {
        const headingOpenPrevious = md.renderer.rules.heading_open;
        md.renderer.rules.heading_open = function (tokens, index, userOptions, object, renderer) {
            tokens[index].attrs = tokens[index].attrs || [];
            let title = tokens[index + 1].children.reduce(function (accumulator, child) {
                return accumulator + child.content;
            }, "");
            const headingSlug = idSet[idCounts.headings].id;
            tokens[index].attrs.push(["id", headingSlug]);
            const prefix = idSet[idCounts.headings].prefix;
            ++idCounts.headings;
            if (headingOpenPrevious)
                return headingOpenPrevious.apply(this, arguments) + prefix;
            else
                return renderer.renderToken.apply(renderer, arguments) + prefix;
            //SA!!! APPEND text to return to add prefix to heading content
        }; //md.renderer.rules.heading_open
    } //addIdAttributes

    function createToc(state, usedIds, idCounts, idSet) {
        md.renderer.rules[tocFunctionNames.open] = function (tokens, index) {
            return util.format("<div class=\"%s\">", options.tocContainerClass);
        }; // open
        md.renderer.rules[tocFunctionNames.body] = function (tokens, index) {
            return createTocTree(0, state.tokens, usedIds, idCounts, idSet)[1];
        }; //body
        md.renderer.rules[tocFunctionNames.close] = function (tokens, index) {
            return "</div>";
        }; //close
    } //createToc

    function detectAndPushToc(tocRegexp) {
        md.inline.ruler.before("text", ruleName, function toc(state, silent) {
            if (silent) return false;
            const match = tocRegexp.exec(state.src);
            if (!match) return false;
            if (match.length < 1) return false;
            state.push(tocFunctionNames.open, ruleName, 1);
            state.push(tocFunctionNames.body, ruleName, 0);
            state.push(tocFunctionNames.close, ruleName, -1);
            state.src = "";
            return true;
        });
    } //detectAndPushToc

    function createTocTree(tokenIndex, tokens, usedIds, idCounts, idSet) {
        let headings = [],
            listItemContent = "",
            currentLevel,
            subHeadings,
            currentTokenIndex = tokenIndex;
        const size = tokens.length;
        while (currentTokenIndex < size) {
            const token = tokens[currentTokenIndex];
            const heading = tokens[currentTokenIndex - 1];
            if (!heading) { currentTokenIndex++; continue; }
            const level = headingLevel(token);
            if (token.type !== "heading_close" || heading.type !== "inline") {
                currentTokenIndex++;
                continue;
            } //if
            if (usedIds.excludeFromToc[currentTokenIndex] == token || options.includeLevel.indexOf(level) == -1) {
                currentTokenIndex++;
                ++idCounts.toc; // one id is skipped
                continue;
            } //if
            if (currentLevel) {
                if (level > currentLevel) {
                    subHeadings = createTocTree(currentTokenIndex, tokens, usedIds, idCounts, idSet);
                    listItemContent += subHeadings[1];
                    currentTokenIndex = subHeadings[0];
                    continue;
                } //if
                if (level < currentLevel) {
                    listItemContent += "</li>";
                    headings.push(listItemContent);
                    return [currentTokenIndex, listElement(currentLevel, options, headings)];
                } //if
                if (level == currentLevel) {
                    listItemContent += "</li>";
                    headings.push(listItemContent);
                } //if
            } else
                currentLevel = level; // We init with the first found level
            const tocSlug = idSet[idCounts.toc].id;
            const prefix = idSet[idCounts.toc].prefix;
            ++idCounts.toc;
            listItemContent = util.format("<li>%s<a href=\"#%s\">", prefix, tocSlug);
            listItemContent += typeof options.format === "function" ? options.format(heading.content) : heading.content;
            listItemContent += "</a>";
            currentTokenIndex++;
        } //loop
        listItemContent += "</li>";
        headings.push(listItemContent);
        return [tokens.length, listElement(currentLevel, options, headings)];
    } //createTocTree

    function listElement(level, options, headings) {
        let listTag = options.defaultListElement;
        if (options.listElements)
            if (options.listElements[level - 1])
                listTag = options.listElements[level - 1];
        let elementAttributes = "";
        if (options.listElementAttributeSets)
            if (options.listElementAttributeSets[level - 1])
                for (let index in options.listElementAttributeSets[level - 1])
                    elementAttributes += util.format(" %s=\"%s\"", index, options.listElementAttributeSets[level - 1][index]);
        if (options.listElementAttributeSets)
            if (options.listElementAttributeSets.length < 1)
                for (let index in options.defaultListElementAttributeSet)
                    elementAttributes += util.format(" %s=\"%s\"",
                        index,
                        options.defaultListElementAttributeSet[index]);
        return util.format("<%s%s>%s</%s>", listTag, elementAttributes, headings.join(""), listTag);
    } //listElement

}; //module.exports
