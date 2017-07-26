# Changelog

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
