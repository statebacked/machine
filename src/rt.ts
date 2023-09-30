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
export const spawn = (
  instanceDescriptor: PersistentInstanceDescriptor,
  opts?: SpawnOptions
): PersistentActorRef => {
  if (typeof globalThis?.__statebaked_rt?.spawn === "function") {
    return globalThis.__statebaked_rt.spawn(instanceDescriptor, opts);
  }

  return {
    ...instanceDescriptor,
    type: "statebacked.instance",
    id: opts.name ?? crypto.randomUUID(),
    machineInstanceName:
      instanceDescriptor.machineInstanceName ?? crypto.randomUUID(),
  };
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
export const invocableSource = (
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
export const sendTo = (
  actor:
    | string
    | PersistentActorRef
    | ((
        ctx: unknown,
        event: { type: string } & Record<string, unknown>
      ) => string | PersistentActorRef),
  event: any,
  opts?: {
    delay:
      | string
      | number
      | ((ctx: Record<string, unknown>, event: Event) => string | number);
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
