# RSSBook Error Reference

Use `@/utils/error` for route handlers, utilities, and the global Elysia error handler. Prefer the narrowest error that matches the failure mode.

## Browser

- `BrowserUnavailableError`: route was declared with `browser: true`, but the app was created without browser support.
- `BrowserClosedError`: a browser instance was already deinitialized and cannot be reused.
- `BrowserInitializationError`: browser startup returned a non-browser or otherwise failed before the browser became usable.
- `BrowserEndpointError`: CDP/WebSocket endpoint resolution failed or returned an invalid browser description.
- `UnsupportedProtocolError`: browser endpoint URL uses an unsupported protocol.

## Cache And Fetch

- `CacheMissError`: a cache lookup was required, but no fetcher was provided.
- `FetchHtmlError`: HTML fetch or HTML parsing for a page scrape failed.
- `SourceFetchError`: a feed source could not fetch or parse any upstream feed data.

## Input And Validation

- `InvalidUrlError`: a URL string cannot be parsed.
- `InvalidProtocolError`: a URL is not `http:` or `https:`.
- `LocalAddressError` and `LocalIpAddressError`: local addresses and IP literals are rejected.
- `InvalidDomainSuffixError` and `InvalidDomainNameError`: the host is not an allowed public domain.
- `InvalidRoutePathError`: a dispatch path does not start with `/`.
- `InvalidSourceSlugError`: a source slug does not match the allowed slug format.
- `DuplicateRouteTitleError` and `DuplicateSourceError`: route or source registration collides with an existing one.

## Feed Parsing And Rendering

- `ParseError`: raw JSON parsing or feed parsing failed.
- `DataValidationError`: parsed feed data did not satisfy the `Data` schema.
- `InvalidFeedFormatError` and `FeedFormatError`: the requested feed format is invalid or unsupported.
- `FeedRenderError`: feed serialization failed after validation.

## Route Utilities

- `InvalidOverrideJsonError`: a utility route override payload is invalid JSON.
- `UnionFeedError`, `IntersectionFeedError`, `FilterFeedError`, `SortFeedError`, `TransformFeedError`: combine, intersect, filter, sort, or transform route logic failed after upstream work started.
- `InvalidRankingTypeError`: the requested source-specific ranking type is not supported.
- `FeedNotFoundError`: an upstream source page, author, tag, or user could not be found.

## Status Guidance

- Use `400` for client input and validation failures.
- Use `404` for missing upstream resources.
- Use `502` for upstream fetch or endpoint resolution failures.
- Use `503` when the failure is caused by unavailable runtime capabilities.
- Use `500` for internal or invariant violations.

## Skill Rule

When adding a new route handler, start by checking this reference and use an existing error class if one matches. Add a new error only when the failure mode has a stable meaning that will be reused elsewhere.
