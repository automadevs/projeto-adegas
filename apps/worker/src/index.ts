export const workerQueues = ["outbox", "sync-commands"] as const;

export type WorkerQueueName = (typeof workerQueues)[number];

export interface WorkerRuntimeConfig {
  readonly redisUrl: string;
  readonly queues: readonly WorkerQueueName[];
}

export function describeWorkerRuntime(
  redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379"
): WorkerRuntimeConfig {
  return {
    redisUrl,
    queues: workerQueues
  };
}

if (require.main === module) {
  const runtime = describeWorkerRuntime();
  console.log(`AdegaOS worker ready for queues: ${runtime.queues.join(", ")}`);
}
