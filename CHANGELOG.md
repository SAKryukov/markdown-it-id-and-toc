# Changelog

## Version 3.6.2

* Improved slugify, now all blank spaces are rendered as '-'

## Version 3.6.1

* Fixed a bug in handling of new format for in-document auto-numbering options; just one option should be legitimate

## Version 3.6.0

* Introduced simplified new format for in-document auto-numbering options

## Version 3.5.1

* Fixed a long-hunted bug: markdown-it failure in some valid but less usual use cases, such as: paragraph in next line after heading, HTML comment before heading, end-of file at the end line of a paragraph following some heading

## Version 3.5.0

* Improved handling of the case of invalid JSON in the in-doc auto-numbering specifications

## Version 3.4.0

* Regression issue fix: arrays in user options are not overridden by default, first of all, `includeLevel` used in TOC

## Version 3.3.0

* New major feature: heading number iterates not only by numbers or letters, but also by array of "numbers", such as ["One", "Two", "Three"] 

## Version 3.2.0

* Many improvements related to default options, handling the options and defaults, handling of the errors in the in-document option tag

## Version 3.0.3

* Fixed a bug with second run of embedded markdown-it plugin: TOC was not updated

## Version 3.0.2

* Fixed regression bug in auto-numbering, related to handling of RegExp failure: if first token is paragraph and not a auto-numbering settings tag, it wasn't rendering

## Version 3.0.1

* Fixed a bug in 3.0.0: failed second run of rendering without reloading; the handlers were set again

## Version 3.0.0

* Added user-configurable auto-numbering

## Version 2.0.3

* Code refactoring for better readability

## Version 2.0.2

* First production release to npm

## Version 0.0.1

* Initial release
