import { Logger } from 'winston';

/**
 *
 */
export type SecondUnit = 'second' | 'seconds';

/**
 *
 */
export type MinuteUnit = 'minute' | 'minutes';

/**
 *
 */
export type HourUnit = 'hour' | 'hours';

/**
 *
 */
export type TimeUnit = SecondUnit | MinuteUnit | HourUnit;

/**
 *
 */
export interface WorkerOptions {
  name: string;
  cron: string;
  workFunc: (logger: Logger) => void | Promise<void>;
  checkTimeValue: TimeValue;
  freezeLimitTimeValue: TimeValue;
  isDevelopment?: boolean;
  shouldRunImmediately?: boolean;
  timeoutTimeValue?: TimeValue;
  errorThrottleInMinutes?: number;
  stopTimeoutTimeValue?: TimeValue;
  processName?: string;
  runEvenIfAlreadyRunning?: boolean;
  doNotLogStartAndFinish?: boolean;
  onFreeze?: () => void;
}

/**
 *
 */
export interface TimeValue {
  value: number;
  unit: TimeUnit;
}
