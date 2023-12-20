# @ghostery/testing-stage/server

`server` exports compiled [`adblocker engine`](https://github.com/ghostery/adblocker) by watching TrackerDB definition files and local filter lists.

----

# Configuration

Configuration of server can be done using environment variables.
Please, see `src/modules/config.ts` file to know what environment variables are used.

**Binding to specific address**

To bind at specific address:

```sh
export BIND_ADDRESS="127.0.0.1"
export BIND_PORT="8122"
```

**Specify the location of TrackerDB or filter lists**

```sh
export SOURCES="trackerdb:///absolute/path/to/trackerdb"
export SOURCES="trackerdb://./relative/path/to/trackerdb"
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
