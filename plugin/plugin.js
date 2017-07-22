"use strict";

const defaultOptions = {
    enableHeadingId: true, //SA what to do if TOC is detected? 
    includeLevel: [1, 2, 3, 4, 5, 6],
    tocContainerClass: "toc",
    tocRegex: "^\\[\\]\\(toc\\)",
    excludeFromTocRegex: "\\[\\]\\(notoc\\)",
    defaultListElement: "ul",
    listElements: ["ul", "ul", "ul", "ul", "ul", "ul"],
    defaultListElementAttributeSet: { style: "list-style-type: none;" },
    listElementAttributeSets: [],
    itemPrefixes: [], // array of strings: prefix depending on level
    idPrefix: "headings.",
    format: undefined
}; //defaultOptions
defaultOptions.bulletedListType = defaultOptions.defaultListElement;

module.exports = function (md, userOptions) {

    const util = require("util");

    const options = defaultOptions;
    if (userOptions)
        for (let index in userOptions)
            options[index] = userOptions[index];

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

    // function nextNumber(number) { // number is a letter of a number as string or numeric
    //     let tryNumeric = parseInt(number);
    //     if (isNaN(tryNumeric)) {
    //         let codePoint = number.codePointAt();
    //         return String.fromCodePoint(++codePoint);
    //     } else
    //         return (++tryNumeric).toString();
    // } //nextNumber

    // no magic function names:
    const tocFunctionNames = { open: "tocOpen", close: "tocClose", body: "tocBody" };
    const ruleName = "toc"; // works with null, but let's care about other plug-ins

    function createTocTree(pos, tokens, usedIds, idCounts, idSet, excludeFromTocRegex) {
        let headings = [],
            buffer = "",
            currentLevel,
            subHeadings,
            size = tokens.length,
            currentPos = pos;
        while (currentPos < size) {
            let token = tokens[currentPos];
            let heading = tokens[currentPos - 1];
            if (!heading) { currentPos++; continue; }
            let level = token.tag && parseInt(token.tag.substr(1, 1));
            let excludeFromToc = false;
            if (excludeFromTocRegex)
                excludeFromToc = excludeFromTocRegex.exec(heading.content) != null;
            if (token.type !== "heading_close"
                || options.includeLevel.indexOf(level) == -1 || heading.type !== "inline"
                || excludeFromToc) {
                currentPos++;
                continue;
            } //if
            if (currentLevel) {
                if (level > currentLevel) {
                    subHeadings = createTocTree(currentPos, tokens, usedIds, idCounts, idSet, excludeFromTocRegex);
                    buffer += subHeadings[1];
                    currentPos = subHeadings[0];
                    continue;
                } //if
                if (level < currentLevel) {
                    buffer += "</li>";
                    headings.push(buffer);
                    return [currentPos, listElement(currentLevel, options, headings)];
                } //if
                if (level == currentLevel) {
                    buffer += "</li>";
                    headings.push(buffer);
                } //if
            } else
                currentLevel = level; // We init with the first found level
            //SA!!! currentLevel is the level of the TOC item, number of '#' in '#', '##', '###'...
            // APPEND text after "<li><a href=\"#%s\">" to make PREFIX to title
            const tocSlug = idSet[idCounts.toc];
            ++idCounts.toc;
            buffer = util.format("<li><a href=\"#%s\">", tocSlug);
            let headingContent = heading.content;
            if (options.itemPrefixes)
                if (options.itemPrefixes[currentLevel - 1])
                    headingContent = options.itemPrefixes[currentLevel - 1] + headingContent;
            buffer += typeof options.format === "function" ? options.format(headingContent) : headingContent;
            buffer += "</a>";
            currentPos++;
        } //loop
        buffer += "</li>";
        headings.push(buffer);
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

    function buildIdSet(idSet, tokens, usedIds) {
        for (let index = 1; index < tokens.length; ++index) {
            const token = tokens[index];
            const previousToken = tokens[index - 1];
            if (token.type !== "heading_close" || previousToken.type !== "inline") continue;
            idSet.push(slugify(previousToken.content, usedIds));
        } //loop
    } //buildIdSet

    md.core.ruler.before("inline", "buildToc", function (state) {
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
        const usedIds = { headings: {}, toc: {} };
        const idCounts = { headings: 0, toc: 0 };
        const idSet = [];
        buildIdSet(idSet, state.tokens, usedIds);
        // create TOC:
        if (doToc) {
            md.renderer.rules[tocFunctionNames.open] = function (tokens, index) {
                return util.format("<div class=\"%s\">", options.tocContainerClass);
            }; // open
            md.renderer.rules[tocFunctionNames.body] = function (tokens, index) {
                return createTocTree(0, state.tokens, usedIds, idCounts, idSet, excludeFromTocRegex)[1];
            }; //body
            md.renderer.rules[tocFunctionNames.close] = function (tokens, index) {
                return "</div>";
            }; //close
        } //if doToc
        // add id attributes:
        const headingOpenPrevious = md.renderer.rules.heading_open;
        md.renderer.rules.heading_open = function (tokens, index, userOptions, object, renderer) {
            tokens[index].attrs = tokens[index].attrs || [];
            let title = tokens[index + 1].children.reduce(function (accumulator, child) {
                return accumulator + child.content;
            }, "");
            const headingSlug = idSet[idCounts.headings];
            tokens[index].attrs.push(["id", headingSlug]);
            ++idCounts.headings;
            if (headingOpenPrevious)
                return headingOpenPrevious.apply(this, arguments);
            else
                return renderer.renderToken.apply(renderer, arguments);
            //SA!!! APPEND text to return to add prefix to heading content
        }; //md.renderer.rules.heading_open
        // detect TOC location:
        if (doToc)
            md.inline.ruler.before("text", ruleName, function toc(state, silent) {
                if (silent) return false;
                const match = tocRegexp.exec(state.src);
                if (!match) return false;
                if (match.length < 1) return false;
                state.push(tocFunctionNames.open, ruleName, 1);
                state.push(tocFunctionNames.body, ruleName, 0);
                state.push(tocFunctionNames.close, ruleName, -1);
                let newline = state.src.indexOf("\n");
                if (newline !== -1)
                    state.pos = state.pos + newline;
                else
                    state.pos = state.pos + state.posMax + 1;
                return true;
            });
    }); //md.core.ruler.before

}; //module.exports
