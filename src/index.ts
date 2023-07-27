/**
 * `allowRead` will be called for every read request sent to an instance of the machine you are exposing.
 *
 * If `allowRead` returns true, the request will be permitted.
 * Otherwise, the request will be rejected with a 403 status and `{ code: "denied-by-machine-definition" }`.
 *
 * `allowRead` must be exported from your machine definition file.
 *
 * Use `AllowRead<Context, AuthContext>` to specify the shape of your machine's context and the expected shape of the authContext you will provide.
 */
export type AllowRead<Context = object, AuthContext = { sub?: string }> = (
  readRequest: ReadRequest<Context, AuthContext>
) => boolean;

/**
 * `allowWrite` will be called for every request to send an event to an instance of the machine you are exposing.
 *
 * If `allowWrite` returns true, the request will be permitted.
 * Otherwise, the request will be rejected with a 403 status and `{ code: "denied-by-machine-definition" }`.
 *
 * `allowWrite` must be exported from your machine definition file.
 *
 * Use `AllowRead<Context, AuthContext, EventShape>` to specify the shape of your machine's events and context and the expected shape of the authContext you will provide.
 */
export type AllowWrite<
  Context = object,
  AuthContext = { sub?: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  EventShape extends { type: string } = { type: string; [key: string]: any }
> = (writeRequest: WriteRequest<Context, AuthContext, EventShape>) => boolean;

/**
 * A request to read the state of a machine instance.
 *
 * Use ReadRequest<Context, AuthContext> to specify the types of the context for your machine and the authContext you will provide.
 */
export type ReadRequest<Context = object, AuthContext = { sub?: string }> = {
  /**
   * The name of the machine instance to read.
   *
   * This is the name you provided when you created the machine instance.
   */
  machineInstanceName: string;

  /**
   * The current state of the machine instance.
   *
   * If the machine is in a single top-level state, this is the name of that state.
   * If the machine is in a nested state, this is an object with the name of the parent state as the key and the name of the child state as the value.
   * If the machine is in a parallel state, there will be multiple keys and values.
   *
   * Identical to the state.value property of an XState state.
   */
  state: State;

  /**
   * The context of the machine instance.
   */
  context: Context;

  /**
   * The authorization context of the reader requesting access to the machine instance.
   *
   * The authorization context is the `act` claim of the JWT used to authenticate the reader (with the top-level `sub` claim used as a fallback if `act` did not provide a sub)
   */
  authContext: AuthContext;
};

/**
 * A request to initialize or send an event to the machine instance.
 *
 * Use WriteRequest<Context, AuthContext, EventShape> to specify the types of the context and events for your machine and the authContext you will provide.
 */
export type WriteRequest<
  Context = object,
  AuthContext = { sub?: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  EventShape extends { type: string } = { type: string; [key: string]: any }
> =
  | EventWriteRequest<Context, AuthContext, EventShape>
  | InitializationWriteRequest<Context, AuthContext>;

/**
 * A request to send an event to the machine instance.
 *
 * Use EventWriteRequest<Context, AuthContext, EventShape> to specify the types of the context and events for your machine and the authContext you will provide.
 */
export type EventWriteRequest<
  Context = object,
  AuthContext = { sub?: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  EventShape extends { type: string } = { type: string; [key: string]: any }
> = {
  type: "event";

  /**
   * The name of the machine instance to read.
   *
   * This is the name you provided when you created the machine instance.
   */
  machineInstanceName: string;

  /**
   * The current state of the machine instance.
   *
   * If the machine is in a single top-level state, this is the name of that state.
   * If the machine is in a nested state, this is an object with the name of the parent state as the key and the name of the child state as the value.
   * If the machine is in a parallel state, there will be multiple keys and values.
   *
   * Identical to the state.value property of an XState state.
   */
  state: State;

  /**
   * The context of the machine instance.
   */
  context: Context;

  /**
   * The event that the requester wants to send to the machine instance.
   */
  event: SCXMLEvent<EventShape>;

  /**
   * The authorization context of the reader requesting access to the machine instance.
   *
   * The authorization context is the `act` claim of the JWT used to authenticate the reader (with the top-level `sub` claim used as a fallback if `act` did not provide a sub)
   */
  authContext: AuthContext;
};

/**
 * A request to initialize the machine instance.
 *
 * Use InitializationWriteRequest<Context, AuthContext> to specify the types of the context and events for your machine and the authContext you will provide.
 */
export type InitializationWriteRequest<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Context = object,
  AuthContext = { sub?: string }
> = {
  type: "initialization";

  /**
   * The name of the machine instance to read.
   *
   * This is the name you provided when you created the machine instance.
   */
  machineInstanceName: string;

  /**
   * The initial context provided to the machine instance.
   */
  context: Context;

  /**
   * The authorization context of the reader requesting access to the machine instance.
   *
   * The authorization context is the `act` claim of the JWT used to authenticate the reader (with the top-level `sub` claim used as a fallback if `act` did not provide a sub)
   */
  authContext: AuthContext;
};

/**
 * The state of a machine instance.
 *
 * If the machine is in a single top-level state, this is the name of that state.
 * If the machine is in a nested state, this is an object with the name of the parent state as the key and the name of the child state as the value.
 * If the machine is in a parallel state, there will be multiple keys and values.
 *
 * Identical to the state.value property of an XState state.
 */
export type State = string | { [parentState: string]: State };

/**
 * A standardized format for the events that can be sent to a machine instance.
 *
 * Matches the state._event property of an XState state.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SCXMLEvent<EventShape = { type: string; [key: string]: any }> = {
  /**
   * The name of the event. `name` matches the `type` property of an XState event.
   */
  name: string;

  /**
   * The type of the event.
   *  - "platform" is for events raised by the platform itself, such as error events,
   *  - "internal" is for events raised by <raise> and <send> with target '_internal'
   *  - "external" is for all other events. Authorization is only checked for "external" events.
   */
  type: "platform" | "internal" | "external";

  /**
   * The origin of the event. This is NOT YET supported for externally-sent events in the State Backed platform.
   */
  origin: undefined;

  /**
   * The user-sent event.
   */
  data: EventShape;
};

/**
 * upgradeState is called to migrate a state of an instance of a previous version of a machine
 * to a state of the new version of the machine.
 *
 * upgradeState migrates individual states, one at a time, by mapping StatePaths of the previous
 * machine version to StatePaths of the new machine version.
 * StatePaths represent a path from the root of the machine, through the state hierarchy, to a single leaf state.
 *
 * Note that StatePaths represent the path to a single state, not the entire state of the machine.
 * In cases where machines have parallel states, upgradeState will be called multiple times for each parallel leaf state.
 * This is done to make upgradeState as simple as possible.
 * Ideally, this should be a simple map from every possible state of the old machine to a state of the new machine.
 *
 * The provided context parameter may not be a valid context for oldState.
 * This will happen because, in addition to migrating the current machine state, we also migrate
 * the history of the machine to allow history states to continue to function properly.
 * So, context is *a* context for the old version of the machine at or after the machine transitioned to oldState.
 *
 * To use your own context shapes, use UpgradeState<Context>. where Context is the *prior* machine version's context shape.
 */
export type UpgradeState<Context = object> = (
  oldState: StatePath,
  context: Context
) => StatePath;

/**
 * upgradeContext is called to migrate the context of an instance of a previous version of a machine
 * to the context of the new version of the machine.
 *
 * upgradeContext receives an array of StatePaths representing all states that the old machine was in
 * (potentially >1 if the old machine had parallel states) and an array of StatePaths representing the mapping
 * of those states into new machine version states by upgradeState.
 *
 * To use your own context shapes, use UpgradeContext<OldContext, NewContext>.
 */
export type UpgradeContext<OldContext = object, NewContext = object> = (
  oldStates: Array<StatePath>,
  newStates: Array<StatePath>,
  context: OldContext
) => NewContext;

/**
 * A path from the root of the machine, through the state hierarchy, to a single leaf state.
 *
 * For a machine like this:
 * ```
 * {
 *  initial: "a",
 *  states: {
 *   a: {
 *     initial: "b",
 *     states: {
 *       b: {}
 *     }
 *   }
 *  }
 * }
 * ```
 *
 * You may see a StatePath like this: ["a", "b"].
 *
 */
export type StatePath = Array<string>;
