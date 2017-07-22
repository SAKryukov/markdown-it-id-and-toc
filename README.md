# Markdown-it Heading Id and TOC Plugin

Isn't that confusing: what markdown-it plugins for generation of TOC and heading `id` attributes to use? Apparently, the `id` values may not match. So, why not choosing the one which generates it all consistently?

## Features

- Proven uniqueness if `id` values and identity of `id` values in headings and TOC
- Tagging for both TOC and "exclude from TOC" headings, user-configurable syntax
- User-configurable `id` prefixes
- Customizable choice of HTML element list types, global or individual for each TOC level: `ul` (default), `ol` or anything else
- Customizable sets of attributes for HTML list elements (not only CSS classes), global or individual for each TOC level
- Customizable CSS class of TOC's parent `div` element

## Options

```
    includeLevel: [1, 2, 3, 4, 5, 6],
    tocContainerClass: "toc"
    tocRegex: "^\\[\\]\\(toc\\)"
    excludeFromTocRegex: "\\{\\}\\(notoc\\)"
    defaultListElement: "ul"
    listElements: ["ul", "ul", "ul", "ul", "ul", "ul"]
    defaultListElementAttributeSet: { style: "list-style-type: none;" }
    listElementAttributeSets: []
    itemPrefixes: [] // array of strings: prefix depending on level
    idPrefix: "headings."
```