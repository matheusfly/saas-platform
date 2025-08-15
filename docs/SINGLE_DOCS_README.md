# Single HTML Documentation Generator

This script generates a single, beautifully styled HTML documentation file from all markdown content in the `docs`, `documentation`, and `documentacao` directories.

## Usage

To generate the single HTML documentation file, run the following command from the root of the project:

```bash
node docs/generate-single-docs.mjs
```

This will create a `docs.html` file in the `docs` directory with all the documentation content.

## How it works

The script scans all documentation directories for markdown files, converts them to HTML, and combines them into a single file with a beautiful, modern design. It also adds navigation to the different sections of the documentation.