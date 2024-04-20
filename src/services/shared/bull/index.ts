import { Processor, Queue, QueueOptions, Worker, WorkerOptions } from 'bullmq';
import client from '../redis/client';

/**
 * Custom implementation of the BullMQ worker
 * that shares the same Redis client.
 */
export class BullWorker<T extends any = any, R extends any = any> extends Worker {
  constructor(
    name: string,
    processor: string | URL | null | Processor<T, R, string>,
    opts?: Omit<WorkerOptions, 'connection'>
  ) {
    super(name, processor, { ...opts, connection: client.RedisClient });
  }
}

/**
 * Custom implementation of the BullMQ queue
 * that shares the same Redis client.
 */
export class BullQueue<DataType = any, ResultType = any, NameType extends string = string> extends Queue<
  DataType,
  ResultType,
  NameType
> {
  constructor(name: string, opts?: Omit<QueueOptions, 'connection'>) {
    super(name, { ...opts, connection: client.RedisClient });
  }
}
