# machine-def

The utilities exported by this package are useful in defining [State Backed](https://statebacked.dev) machine definitions.

A State Backed machine definition consists of a javascript file that exports the following:
- Default export an [XState](https://xstate.js.org/docs/) state machine (e.g. `export default createMachine(...)`)
- Export an `allowRead` function that accepts an object containing `{ machineInstanceName, state, context, authContext }` and returns a boolean indicating whether an entity with the provided `authContext` should be allowed to read an instance of the machine having the provided name, state, and context.
- Export an `allowWrite` function that accepts an object containing `{ machineInstanceName, state, context, event, authContext }` and returns a boolean indicating whether an entity with the provided `authContext` should be allowed to write `event` to an instance of the machine having the provided name, state, and context.

This module provides types and utilities for these functions.
