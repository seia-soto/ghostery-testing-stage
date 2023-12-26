# @ghostery/testing-stage/server

`server` exports compiled [`adblocker engine`](https://github.com/ghostery/adblocker) by watching TrackerDB definition files and local filter lists.

## Usage

Install dependencies:

```sh
pnpm install
```

Create `tss-config.yaml` on the working directory and add your sources.

```yaml
bind:
  host: localhost
  port: 8122
sources:
  - type: trackerdb
    url: /path/to/trackerdb
  - type: file
    url: /path/to/file
```

| Type      | Url                         | Watch changes |
|-----------|-----------------------------|---------------|
| trackerdb | A path to local TrackerDB   | ✅ Supported   |
| file      | A path to local filter list | ✅ Supported   |

Install `/filters.txt` into your adblocker.
If you're using default bind address, the filter subscription url should be `http://localhost:8122/filters.txt`.
