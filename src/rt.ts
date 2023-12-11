/**
 * Descriptor of a persistent instance.
 */
export type PersistentInstanceDescriptor = {
  /**
   * The name of the machine.
   */
  machineName: string;

  /**
   * The name of the machine instance.
   * A UUID will be generated if not provided.
   */
  machineInstanceName?: string;

  /**
   * The version of the machine to use.
   * If not provided, the current machine version will be used.
   */
  machineVersionId?: string;
};

/**
 * Reference to a persistent actor.
 */
export type PersistentActorRef = {
  type: "statebacked.instance";

  /**
   * Local ID of the actor.
   * This is not globally unique but may be used in calls to `sendTo` to refer to the actor.
   */
  id: string;
  machineName: string;
  machineInstanceName: string;
};

/**
 * Options for spawning a persistent instance.
 */
export type SpawnOptions = {
  /**
   * Initial context to use for the instance.
   */
  context?: Record<string, unknown>;

  /**
   * Local name of the instance.
   * If specified, may be used in calls to `sendTo` to refer to the actor.
   */
  name?: string;
};

/**
 * Spawn a persistent instance of a machine.
 *
 * THIS **MUST** BE CALLED WITHIN AN `assign` ACTION TO HAVE THE INTENDED EFFECT.
 *
 * @param instanceDescriptor descriptor of the instance to spawn
 * @param opts spawn options
 * @returns A PersistentActorRef
 */
export const spawnPersistentInstance = (
  instanceDescriptor: PersistentInstanceDescriptor,
  opts?: SpawnOptions
): PersistentActorRef => {
  if (typeof (globalThis as any)?.__statebacked_rt?.spawn === "function") {
    return (globalThis as any).__statebacked_rt.spawn(instanceDescriptor, opts);
  }

  return {
    ...instanceDescriptor,
    type: "statebacked.instance",
    id: opts?.name ?? crypto.randomUUID(),
    machineInstanceName:
      instanceDescriptor.machineInstanceName ?? crypto.randomUUID(),
  };
};

/**
 * Event object.
 */
export type XStateEventObject = { type: string };

/**
 * Any event object.
 */
export interface AnyXStateEventObject extends XStateEventObject {
  [key: string]: any;
}

/**
 * String or object event.
 */
export type XStateEvent<TEvent extends XStateEventObject> = TEvent["type"] | TEvent;

/**
 * Event sender.
 */
export type XStateSender<TEvent extends XStateEventObject> = (event: XStateEvent<TEvent>) => void;

/**
 * Event receiver.
 */
export type XStateReceiver<TEvent extends XStateEventObject> = (
  listener: {
    bivarianceHack(event: TEvent): void;
  }["bivarianceHack"]
) => void;

/**
 * Invoke callback spawnable.
 */
export type XStateInvokeCallback<
  TEvent extends XStateEventObject = AnyXStateEventObject,
  TSentEvent extends XStateEventObject = AnyXStateEventObject
> = (
  callback: XStateSender<TSentEvent>,
  onReceive: XStateReceiver<TEvent>
) => (() => void) | Promise<any> | void;

/**
 * Subscription.
 */
export interface XStateSubscription {
  unsubscribe(): void;
}

/**
 * Observer spawnable.
 */
export interface XStateObserver<T> {
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}

/**
 * Subscribable for an InteropObservable.
 */
export interface XStateInteropSubscribable<T> {
  subscribe(observer: XStateObserver<T>): XStateSubscription;
}

declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}

/**
 * Interop observable spawnable.
 */
export interface XStateInteropObservable<T> {
  [Symbol.observable]: () => XStateInteropSubscribable<T>;
}

/**
 * Subscribable spawnable.
 */
export interface XStateSubscribable<T> extends XStateInteropSubscribable<T> {
  subscribe(observer: XStateObserver<T>): XStateSubscription;
  subscribe(
    next: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void
  ): XStateSubscription;
}

/**
 * Actor reference.
 */
export interface XStateActorRef<TEvent extends XStateEventObject, TEmitted = any>
  extends XStateSubscribable<TEmitted>,
    XStateInteropObservable<TEmitted> {
  send: XStateSender<TEvent>; // TODO: this should just be TEvent
  id: string;
  getSnapshot: () => TEmitted | undefined;
  stop?: () => void;
  toJSON?: () => any;
}

/**
 * XState actor context.
 */
export interface XStateActorContext<TEvent extends XStateEventObject, TEmitted> {
  parent?: XStateActorRef<any, any>;
  self: XStateActorRef<TEvent, TEmitted>;
  id: string;
  observers: Set<XStateObserver<TEmitted>>;
}

/**
 * Behavior spawnable.
 */
export interface XStateBehavior<TEvent extends XStateEventObject, TEmitted = any> {
  transition: (
    state: TEmitted,
    event: TEvent,
    actorCtx: XStateActorContext<TEvent, TEmitted>
  ) => TEmitted;
  initialState: TEmitted;
  start?: (actorCtx: XStateActorContext<TEvent, TEmitted>) => TEmitted;
}

/**
 * Any state machine.
 */
export interface AnyXStateStateMachine {
  __xstatenode: true;
}

/**
 * Spawnable for spawnEphemeralInstance.
 */
export type XStateSpawnable =
  | AnyXStateStateMachine
  | PromiseLike<any>
  | XStateInvokeCallback
  | XStateInteropObservable<any>
  | XStateSubscribable<any>
  | XStateBehavior<any>;

/**
 * Options for spawnEphemeralInstance.
 */
export type EphemeralSpawnOptions = {
  name?: string;
  autoForward?: boolean;
  sync?: boolean;
};

/**
 * Spawn an ephemeral child instance.
 *
 * Same as `spawn` from xstate but ensures compatibility with State Backed packaging and runtime.
 *
 * @param entity
 * @param nameOrOptions
 * @returns
 */
export const spawnEphemeralInstance = (
  entity: XStateSpawnable,
  nameOrOptions?: string | EphemeralSpawnOptions
): XStateActorRef<any> => {
  return (globalThis as any).__statebacked_rt.spawn(entity, nameOrOptions);
};

/**
 * Format a persistent instance descriptor to use as an xstate invoke source.
 *
 * Use like this:
 * ```
 * createMachine({
 *   states: {
 *    idle: {
 *      invoke: {
 *        src: invocableSource({
 *          machineName: "myMachine",
 *          machineInstanceName: "myMachineInstance",
 *          machineVersionId: "ver_myMachineVersion",
 *        }),
 *      }
 *   }
 * })
 * ```
 *
 * @param instanceDescriptor PersistentInstanceDescriptor
 * @returns An object to be provided as the `src` property of an xstate invoke.
 */
export const persistentInvocableSource = (
  instanceDescriptor: PersistentInstanceDescriptor
) => ({
  type: "statebacked.invoke",
  machineName: instanceDescriptor.machineName,
  machineInstanceName:
    instanceDescriptor.machineInstanceName ?? crypto.randomUUID(),
  machineVersionId: instanceDescriptor.machineVersionId,
});

/**
 * Action creator to send an event to a persistent actor.
 *
 * @param actor The name of the actor to send the event to, or a PersistentActorRef, or a function that takes the current context and event and returns a string or PersistentActorRef
 * @param event The event to send or a function that takes the current context and event and returns an event
 * @param opts Send options including delay and event ID (which can be used to cancel the event)
 * @returns Action object to be used in an xstate definition
 */
export const sendTo = <
  TContext = Record<string, unknown>,
  TEvent = { type: string } & Record<string, unknown>
>(
  actor:
    | string
    | PersistentActorRef
    | ((ctx: TContext, event: TEvent) => string | PersistentActorRef),
  event: any,
  opts?: {
    delay:
      | string
      | number
      | ((ctx: TContext, event: TEvent) => string | number);
    id: string | number;
  }
) => {
  // we return our own action object so we don't force clients to deal with type issues of passing a PersistentActorRef to sendTo
  return {
    type: "xstate.send",
    to: actor,
    event: typeof event === "function" ? event : () => event,
    delay: opts?.delay,
    id: opts?.id,
  };
};
