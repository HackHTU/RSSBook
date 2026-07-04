# Contributing to RSSBook

> This document is also available in [Chinese](CONTRIBUTING.md).

This document guides you on how to contribute to the RSSBook project, including how to create new Feed sources, how to submit public instance listings, and how to submit Issues/Pull Requests.

## Route Rules

Before writing a Feed, please read the following rules to ensure your Feed meets the requirements.

### Naming Conventions

1. The `slug` should use the website's domain or a short identifier, consisting only of lowercase letters, numbers, and hyphens (`-`). It cannot contain spaces or other special characters.

### Path Conventions

1. Paths can only be

### Handler Function Conventions

1. Your handler function should be asynchronous (marked with `async`) and return a data object that conforms to the `Data` type.
2. When fetching external resources, your handler should use the `ofetch` method. However, it will throw an exception on request errors, so you need to use `try catch` to handle these exceptions.
3. In most cases, you should use destructuring assignment to obtain the required parameters and utility functions for more convenient Feed logic writing.


## Submitting Public Instance Listings

We hope RSSBook is a tool for everyone. If you've deployed a public instance of RSSBook, you're welcome to add it to our [Public Instance List](https://github.com/RSSBook/RSSBook/blob/main/HOSTS).

The `HOSTS` file uses a simple CSV (Comma-Separated Values) format, with each row representing a public instance.

You need to provide your instance's URL and a short description. Your instance URL should be a **publicly accessible** domain that **supports HTTPS**. In the description, you need to list your **version information** (which can be found in `package.json` or the OpenAPI documentation), along with a compelling description (without commas) promoting your instance (and perhaps yourself).

> [!TIP]
> 
> We recommend keeping your instance in sync with the upstream RSSBook project to get the latest features and fixes.

Then, you can submit a Pull Request to add your instance to the `HOSTS` file.

If the review is approved, we will add your instance to the list, and it will be displayed in all OpenAPI documentation.
