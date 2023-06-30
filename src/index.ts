/**
 * `allowRead` will be called for every read request sent to an instance of the machine you are exposing.
 *
 * If `allowRead` returns true, the request will be permitted.
 * Otherwise, the request will be rejected with a 403 status and `{ code: "denied-by-machine-definition" }`.
 *
 * `allowRead` must be exported from your machine definition file.
 */
export type allowRead = (readRequest: ReadRequest) => boolean;

/**
 * `allowWrite` will be called for every request to send an event to an instance of the machine you are exposing.
 *
 * If `allowWrite` returns true, the request will be permitted.
 * Otherwise, the request will be rejected with a 403 status and `{ code: "denied-by-machine-definition" }`.
 *
 * `allowWrite` must be exported from your machine definition file.
 */
export type allowWrite = (writeRequest: WriteRequest) => boolean;

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
 * A request to send an event to the machine instance.
 *
 * Use WriteRequest<Context, EventShape, AuthContext> to specify the types of the context and events for your machine and the authContext you will provide.
 */
export type WriteRequest<
  EventShape extends { type: string } = { type: string; [key: string]: any },
  Context = object,
  AuthContext = { sub?: string }
> = {
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
