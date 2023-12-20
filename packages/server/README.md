# @ghostery/testing-stage/server

`server` exports compiled [`adblocker engine`](https://github.com/ghostery/adblocker) by watching TrackerDB definition files and local filter lists.

----

# Configuration

Configuration of server can be done using environment variables.
Please, see `src/modules/config.ts` file to know what environment variables are used.

## Binding to specific address (`BIND_ADDRESS` and `BIND_PORT`)

`BIND_ADDRESS` and `BIND_PORT` decides the host and port for application to bind on.
By default the server will listen on `127.0.0.1:8122`.

## Registering sources (`SOURCES`)

`SOURCES` are comma-spread urls describing the location of TrackerDB and filter lists.

```
<protocol>://<location>[,...]
```

Currently the following types of sources are supported:

- TrackerDB: `trackerdb://path`

```sh
export SOURCES="trackerdb://path/to/trackerdb"
```

## Watching file changes (`WATCH`)

The server supports watching changes on the TrackerDB directory.
To enable watching, you can set `WATCH` environment variable to non-empty value:

```sh
export WATCH="true"
```

# API

## GET `/api/filters.txt`

Exposes registered filters in text format.
Note that the output of this endpoint doesn't take any post-processing from TrackerDB and filter lists.

```adb
! Title: @ghostery/testing-stage
! Expires: 1 hour
! Version: {Date.now()}

{filter content}
```

## GET `/api/engine.bytes`

Exposes compiled `FiltersEngine` of `@ghostery/adblocker` package.
