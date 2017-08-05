# Markdown-it Heading Id and TOC Plugin

Isn't that confusing: what markdown-it plugins for generation of TOC and heading `id` attributes to use? Apparently, the `id` values may not match. So, why not choosing the one which generates it all consistently?

## Features

- Proven uniqueness if `id` values and identity of `id` values in headings and TOC
- Tagging for both TOC and "exclude from TOC" headings, user-configurable syntax
- User-configurable `id` prefixes
- Optional user-configurable auto-numbering with rich set of options
- Auto-numbering pattern can be defined in Markdown document
- Customizable choice of HTML element list types, global or individual for each TOC level: `ul` (default), `ol` or anything else
- Customizable sets of attributes for HTML list elements (not only CSS classes), global or individual for each TOC level
- Customizable CSS class of TOC's parent `div` element

## Installation

Install [npm package](https://www.npmjs.com/package/markdown-it-id-and-toc):

```
npm install markdown-it-id-and-toc
```

## Options

For detailed description, please see the plugin [documentation](https://sakryukov.github.io/markdown-it-id-and-toc).

This is just a self-explaining sample
```
    enableHeadingId: true,
    autoNumberingRegex: "^\\[\\]\\(\\=numbering([\\s\\S]*?)\\=\\)",
    autoNumbering: {
        "enable": false,
        "pattern": [],
        "defaultSuffix": ". ",
        "defaultPrefix": "",
        "defaultStart": 1,
        "defaultSeparator": "."
    },
    includeLevel: [1, 2, 3, 4, 5, 6],
    tocContainerClass: "toc",
    tocRegex: "^\\[\\]\\(toc\\)",
    excludeFromTocRegex: "\\[\\]\\(notoc\\)",
    defaultListElement: "ul",
    listElements: ["ul", "ul", "ul", "ul", "ul", "ul"],
    defaultListElementAttributeSet: { style: "list-style-type: none;" },
    listElementAttributeSets: [],
    idPrefix: "headings."
```

Example of auto-numbering options defined as a first paragraph in the document:

```
[](=numbering {
    enable: true
    defaultSuffix: 1". "
    h2.prefix: "Chapter "
    h2.start: ["One", "Two", "Three", "Four"]
    h2.suffix: ": "
    h5.standAlong: true
    h4.standAlong: true
    h5.start: "a"
    h5.suffix: ") "
}=)
```