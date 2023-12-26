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

## Development

If you're new to Fastify, it's highly recommended to learn basic components on [Fastify documentation](https://fastify.dev).

### Understanding architecture

The basic folder structure looks like following:

```yaml
- src:
  - entrypoints
  - modules:
    - init.ts
  - plugins
```

- `entrypoints`: The possible boot entrypoints for this project. If you're going to initialise server instance and bind on address, this is a place for you.
- `modules`: The set of static source-codes without states. Stateless means you can't have managed state in the application lifecycle. If you're going to manage states in the application, see `plugins` instead.
  - `init.ts`: This file describes state initialisation of `plugins`. Relatively heavy tasks like downloading bytes from web should be put in here instead of plugin boot procedure.
- `plugins`: The set of stateful source-codes based on Fastify plugin ecosystem. Stateful means you'll have managed state in the application lifecycle. If you're going to implement feature, the core logics should be aparted and put in `modules` instead.

To understand architecture, I'd recommend you to follow the source-code from entrypoint.
There's a development entrypoint in `src/entrypoints/dev.ts` initialising `FastifyInstance` from `src/index.ts`.

Note that we aparted the entrypoint and the server initialiser.
We can allow dynamic bootstrap of the server by aparting the entrypoint and the server initialiser.
For example, we can do unit tests without actually binding the server to the address.

### Adding features

Adding features means you may have a dedicated configuration or some logics for your new feature.

#### `modules` directory: stateless functions

First is to add core logics in `modules` directory.
In this directory, you write stateless functions without having managed states.
For example, you can write a function that parses some strings into object but you can't declare a mutable state that used by other functions in this directory.

**Good**

```javascript
const doSomething = () => ...
const transformSomething = () => ...
```

**Bad**

```javascript
const state = [] // Having a managed state which is mutable

const doSomething = () => {
  state.push(1) // Having an access to managed state
  ...
}
const transformSomething = () => {
  state.splice(...)
}
```

#### `plugins` directory: stateful functions

After writing core logics in `modules` directory.
You may need a managed state for your core logic.
For example, this project has a feature to watch file system changes.
Start by deciding the scope of your plugin: whether to use `fastify-plugin` or not.
If you want your plugin to be available from every scope of the server instance, you'll need to wrap your plugin with `fastify-plugin` package.
See [`Encapsulation` in Fastify docs](https://fastify.dev/docs/v4.25.x/Reference/Encapsulation/).

Define your plugin's context in the source-code and decorate it in the appropriate location. See [`Decorators`](https://fastify.dev/docs/v4.25.x/Reference/Decorators/) and [`TypeScript#creating-a-typescript-fastify-plugin`](https://fastify.dev/docs/v4.25.x/Reference/TypeScript/#creating-a-typescript-fastify-plugin) in Fastify docs.

**Good**

```typescript
import fastifyPlugin from 'fastify-plugin'

export type PluginContext = {
  state: number
}

const plugin: FastifyPluginAsync = async server => {
  const context: PluginContext = {
    state: 0
  }

  server.decorate('prop', context)
}

export const somePlugin = fastifyPlugin(plugin)
```

**Bad**

```typescript
export type PluginContext = {
  state: number
}

export const context: PluginContext = {
  state: 0
} // The state is outside of the application lifecycle

const plugin: FastifyPluginAsync = async server => {
  ...
}
```
