Markdown-it Heading Id and TOC Plugin[](title)

[*Sergey A Kryukov*](https://www.SAKryukov.org)

The ["markdown-it"](https://www.npmjs.com/package/markdown-it) plugin [markdown-it-id-and-toc](https://www.npmjs.com/package/markdown-it-id-and-toc) adds `id` attributes to the headings and Table of Contents (TOC) with optional feature-rich user-configurable auto-numbering.

The decision to implement these features in the same plugin package leads to guaranteed referential integrity of the document and uniqueness of `id` values.

## Contents[](notoc)

[](toc)

## Features

- Proven uniqueness if `id` values and identity of `id` values in headings and TOC
- Tagging for both TOC and "exclude from TOC" headings, user-configurable syntax
- User-configurable `id` prefixes
- Optional user-configurable auto-numbering with rich set of options
- Auto-numbering pattern can be defined in Markdown document
- Customizable choice of HTML element list types, global or individual for each TOC level: `ul` (default), `ol` or anything else
- Customizable sets of attributes for HTML list elements (not only CSS classes), global or individual for each TOC level
- Customizable CSS class of TOC's parent `div` element

## Options

| Property Name | Default | Description |
| --- | --- | --- |
| enableHeadingId | true | Enables or disables both features: adding `id` attributes to headings and TOC |
| autoNumbering | `undefined` | Defines structure of auto-numbering (see [Auto-Numbering Options](#heading.auto-numbering-options)) |
| autoNumberingRegex | `\[\]\(\=numbering([\s\S]*?)\=\)` | RegExp object or Regular Expression string for a tag used to define auto-numbering structure in a document, should come as a first paragraph of a document |
| includeLevel | `[1, 2, 3, 4, 5, 6]` | Levels of headings `h1` to `h6` to be included in TOC  |
| tocContainerClass | toc | Name of a CSS class of a `div` element surrounding the TOC content |
| tocRegex | `^\[\]\(toc\)` | RegExp object or Regular Expression string of a tag marking TOC placement |
| excludeFromTocRegex | `\[\]\(notoc\)` | RegExp object or Regular Expression string of a tag marking individual headings not to be included in TOC |
| defaultListElement | ul | Array of HTML element. Due to availability of auto-numbering, it make little to no sense to use any non-default values. |
| listElements | `["ul", "ul", "ul", "ul", "ul", "ul"]` | Array of HTML elements to be used as TOC list, per heading level. Due to availability of auto-numbering, it make little to no sense to use any non-default values. |
| defaultListElementAttributeSet | `{ style: "list-style-type: none;" }` | Set of HTML attributes added to each HTML list element within TOC, such as `ul` (default) |
| listElementAttributeSets | `[]` | Set of HTML attributes, same as above, but per heading level |
| idPrefix | `headings.` | Sting used as a prefix to all values of `id` attributes of heading elements  |

This is a JavaScript sample of the plugin options object with default values:
```
{
    enableHeadingId: true,
    autoNumbering: undefined,
    autoNumberingRegex: "\\[\\]\\(\\=numbering([\\s\\S]*?)\\=\\)",
    includeLevel: [1, 2, 3, 4, 5, 6],
    tocContainerClass: "toc",
    tocRegex: "^\\[\\]\\(toc\\)",
    excludeFromTocRegex: "\\[\\]\\(notoc\\)",
    defaultListElement: "ul",
    listElements: ["ul", "ul", "ul", "ul", "ul", "ul"],
    defaultListElementAttributeSet: { style: "list-style-type: none;" },
    listElementAttributeSets: [],
    idPrefix: "headings."
}
```

## Auto-Numbering Options

Auto-numbering structure could be defined in two ways: at the level of plugin options, through the option "[autoNumbering](#heading.options)", or at the level of the document. The document-level settings take precedence.

This is the representative sample of the fragment of the Markdown code using the extended syntax for passing auto-numbering option. This is a tag which should come as a first paragraph of the document:

```
[](=numbering                {
    "pattern": [
        { "start": 1 },
        { "prefix": "Chapter ", "start": 1 },
        { },
        { "start": 1, "separator": ".", "standAlong": true },
        { "suffix": ") ", "start": "a", "separator":".", "standAlong":true }
    ],
    "defaultPrefix": "",
    "defaultSuffix": ". ",
    "defaultStart": 1,
    "defaultSeparator": "."
}=)

```

First of all, all options come on two levels: general for the entire document (named `default*`) and per heading level, described in the property `pattern`. The exclusion is the option `standAlong` which appears only in `patter` and is only defined for individual heading levels. 

By default, a heading number is shown as a multi-component string including number of upper-level headings, such as in "2.11.3". The option `standAlong` is used to disable upper-level part, showing, in this example, just "3".

| Property Name | Default | Description |
| --- | --- | --- |
| prefix<br/>defaultPrefix | `""` | String which comes before number. Typical used include "Chapter ", "Part " |
| suffix<br/>defaultSuffix | `". "` | String which comes after number. It is used to separate number and heading caption |
| start<br/>defaultStart | 1 | Starting number in each numbered section. It can be any integer number, any string parsable to an integer number or any character. |
| separator<br/>defaultSeparator | 1 | Starting number in each numbered section. It can be any integer number, any string parsable to an integer number or any character. | . | String (most typically, as single-character string) delimiting components of number inherited from upper-level headings |
| standAlong | `undefined`| "Stand along" flag defining that for some individual levels of headings, the components of number inherited from upper-level headings are not shown |

### Default Auto-Numbering Structure
```
    autoNumbering: {
        "pattern": [],
        "defaultSuffix": ". ",
        "defaultPrefix": "",
        "defaultStart": 1,
        "defaultSeparator": "."
    },
```