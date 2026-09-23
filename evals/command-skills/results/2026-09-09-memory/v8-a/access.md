# Willow Library

This is a disposable local development Product. Its data and demo sessions are synthetic. All operations described by its API are permitted within the Actors in Setup.

The Product is an HTTP API. GET the URL from Setup, then follow its documentation. Use an HTTP client already installed on this machine. Set X-Actor to the available Actor name when selecting a demo session; there are no credentials.

Perquiro MCP is connected through tools.mjs for this Project. Do not use other Perquiro connections from the host, which belong to other Projects.

- List actual tool descriptions and schemas: node tools.mjs list
- Call a tool with an empty argument object: node tools.mjs call read_setup
- Call with a JSON argument file: node tools.mjs call record_surface arguments.json

The bridge returns the MCP result unchanged, including content and isError. Read the JSON text inside content. Store temporary request files and captures in this Project, outside .perquiro. Do not inspect bridge implementation or other workspaces.
