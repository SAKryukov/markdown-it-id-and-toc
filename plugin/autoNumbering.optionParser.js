"use strict";

const util = require("util");

const defaultKeyword = "default";
const enableKeyword = "enable";
const trueKeyword = "true";
const properties = [
    "Suffix",
    "Prefix",
    "Start",
    "Separator"
];

const defaultKeywords = (function (defaultKeyword, properties) {
    const result = [];
    for (const property of properties)
        result.push(defaultKeyword + property);
    return result;
})(defaultKeyword, properties);

const headingKeywords = (function (properties) {
    const result = [];
    for (const property of properties)
        result.push(property.toLowerCase());
    return result;
})(properties);

//console.log(defaultKeywords);
//console.log(headingKeywords);

const headingRegexp = (function(headingKeywords) {
    const keywordSet = headingKeywords.join("|");
    const expression = util.format("\b*h([1-6])\.(%s)\b*:\b*(.*)", keywordSet);
    return new RegExp(expression);
})(headingKeywords);

const topLevelRegexp = (function(defaultKeywords, enableKeyword) {
    const keywordSet = [defaultKeywords.join("|"), enableKeyword].join("|");
    const expression = util.format("\b*(%s)\b*:\b*(.*)", keywordSet);
    return new RegExp(expression);
})(defaultKeywords, enableKeyword);

const splitRegex = (function() {
    return new RegExp("[\n\r]");
})();

function parse(text) {
    const result = {
        pattern: []
    };
    const lines = text.split(splitRegex);
    for (const line of lines) {
        if (line.length < 1) continue;
        const headingMatch = headingRegexp.exec(line);
        if (headingMatch) {
            if (headingMatch.length != 4) continue;
            const level = parseInt(headingMatch[1]);
            const propertyName = headingMatch[2];
            const propertyValue = headingMatch[3].trim();
            if (!result.pattern[level - 1])
                result.pattern[level - 1] = {};
            result.pattern[level - 1][propertyName] = propertyValue;
        } else {
            const topLevelMatch = topLevelRegexp.exec(line);
            if (!topLevelMatch) continue;
            if (topLevelMatch.length != 3) continue;
            const propertyName = topLevelMatch[1];
            const propertyValue = topLevelMatch[2].trim();
            if (propertyName == enableKeyword) {
                if (propertyValue.toLowerCase() == trueKeyword)
                    result[propertyName] = true;
            } else
                result[propertyName] = propertyValue;
        } //if
    } //loop
    return result;
} //parse

module.exports = function (optionText) {
    return parse(optionText);
}; //module.exports