# @statebacked/machine - State Backed machine definition types and runtime utilities
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/statebacked/machine/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/@statebacked/machine.svg?style=flat)](https://www.npmjs.com/package/@statebacked/machine) [![CI](https://github.com/statebacked/machine/actions/workflows/ci.yaml/badge.svg)](https://github.com/statebacked/machine/actions/workflows/ci.yaml) [![Docs](https://img.shields.io/badge/docs-machine-blue)](https://statebacked.github.io/machine/)

The types and utilities exported by this package are useful in defining [State Backed](https://statebacked.dev) machine definitions.

# Installation

NPM
```
npm install --save @statebacked/machine
```

Yarn
```
yarn add @statebacked/machine
```

Deno
```
import type { AllowRead, AllowWrite } from "https://deno.land/x/statebacked_machine/mod.ts";
```

# Overview

A State Backed machine definition consists of a javascript file that exports the following:
- Default export an [XState](https://xstate.js.org/docs/) state machine (e.g. `export default createMachine(...)`)
- Export an `allowRead` function that accepts an object containing `{ machineInstanceName, state, context, authContext }` and returns a boolean indicating whether an entity with the provided `authContext` should be allowed to read an instance of the machine having the provided name, state, and context.
- Export an `allowWrite` function that accepts an object containing `{ machineInstanceName, state, context, event, authContext }` and returns a boolean indicating whether an entity with the provided `authContext` should be allowed to write `event` to an instance of the machine having the provided name, state, and context.

This module provides types and utilities for these functions.

# State Backed

[State Backed](https://statebacked.dev) allows you to spin up a backend by writing only an XState state machine.

Check out our [docs](https://docs.statebacked.dev) and get started with the [smply CLI](https://github.com/statebacked/smply). You can have a state machine backend running in 5 minutes.

# License

@statebacked/machine is [MIT licensed](https://github.com/statebacked/machine/blob/main/LICENSE).
