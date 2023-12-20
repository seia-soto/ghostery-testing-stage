# @ghostery/testing-stage/server

`server` exports compiled [`adblocker engine`](https://github.com/ghostery/adblocker) by watching TrackerDB definition files and local filter lists.

# Usage

```
pnpm start [options]

  Options:

    -w, --watch             Watch changes on TrackDB directory
    -d, --db <path>         Path to TrackerDB
    -h, --host <address>    Host to bind on (default: 127.0.0.1)
    -p, --port <port>       Port to bind on (default: 8122)

  Examples:

    - Watch changes on TrackerDB
      $ pnpm start -w -d ./trackerdb
```

You can export this project into a standalone executable.
In this case, you need to check if native dependencies are installed correctly.

```sh
# Install dependencies
pnpm install

# Bundle to support CJS module system
#   - Embedding native addons happen here
pnpm bundle

# Build to standalone executable
pnpm standalone
```

## Configuration via Environment Variables

The command line interface of this project is a simple wrapper allowing environment variables to be set via arguments.
You can skip specifying arguments by setting environment variables.

**BIND_ADDRESS**

- type: string
- default: `127.0.0.1`

Sets the address for application to bind on.

**BIND_PORT**

- type: string
- format: numeric (`/d`)
- default: `8122`

Sets the port for application to bind on.

**SOURCES**

- type: string
- format: command-spread URLs of sources
- default: (empty)

Sets the sources to build.
You can specify supported sources in URL schema.

Supported protocols are the followings:

```sh
trackerdb://path
```

**WATCH**

- type: boolean
- default: (empty)

The server will watch local sources if the variable has a length.
For example, this value will be evaluated to `false` if you leave this variable empty.

## API

### GET `/api/filters.txt`

Exposes registered filters in text format.
Note that the output of this endpoint doesn't take any post-processing from TrackerDB and filter lists.

```adb
! Title: @ghostery/testing-stage
! Expires: 1 hour
! Version: {Date.now()}

{filter content}
```

### GET `/api/engine.bytes`

Exposes compiled `FiltersEngine` of `@ghostery/adblocker` package.
