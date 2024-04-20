import * as EnvService from '@services/env';
import { CronJob } from 'cron';
import { EventEmitter } from 'events';
import moment from 'moment';
import { timeout, TimeoutError } from 'promise-timeout';
import { not } from 'ramda';
import { WorkerService } from './index';
import { TimeValue, WorkerOptions } from './types';
import { createLoggingMoudule } from '@/utils';
import { Logger } from 'winston';
import { PerformanceService } from '@services/performance';
import { AxiosError } from 'axios';

/**
 *
 */
export class Worker extends EventEmitter {
  /**
   *
   */
  name: string;
  isWorking: boolean = false;
  lastRunTimestamp: moment.Moment | null = null;

  /**
   *
   * @private
   */
  private readonly cron: string;
  private readonly cronJob: CronJob;
  private readonly workFunc: (logger: Logger) => void | Promise<void>;
  private readonly checkTimeValue: TimeValue;
  private readonly freezeLimitTimeValue: TimeValue;
  private readonly isDevelopment: boolean;
  private readonly shouldRunImmediately: boolean;
  private readonly timeoutTimeValue: TimeValue | null;
  private lastErrorTimestamp: moment.Moment | null = null;
  private readonly logger: Logger;
  private readonly errorThrottleInMinutes: number;
  private isStopping: boolean = false;
  private readonly stopTimeoutTimeValue: TimeValue;
  private readonly intervalId?: ReturnType<typeof setInterval>;
  private readonly processName: string | null = null;
  private readonly runEvenIfAlreadyRunning: boolean;
  private workCounter: number;
  private readonly doNotLogStartAndFinish: boolean;
  private readonly onFreezeCallback: (() => void | null) | null;

  /**
   *
   * @param options
   */
  constructor(options: WorkerOptions) {
    super();

    this.name = options.name;
    this.cron = options.cron;

    this.logger = createLoggingMoudule(`WorkerService: ${this.name}`);
    this.cronJob = new CronJob(this.cron, () => this.work());
    this.workFunc = options.workFunc;
    this.checkTimeValue = options.checkTimeValue;
    this.freezeLimitTimeValue = options.freezeLimitTimeValue;
    this.isDevelopment = options.isDevelopment ?? EnvService.isTestOrDevelopment();
    this.shouldRunImmediately = options.shouldRunImmediately ?? false;
    this.timeoutTimeValue = options.timeoutTimeValue ?? null;
    this.stopTimeoutTimeValue = options.stopTimeoutTimeValue ?? WorkerService.oneMinuteTimeValue;
    this.errorThrottleInMinutes = options.errorThrottleInMinutes ?? 10;
    this.runEvenIfAlreadyRunning = options.runEvenIfAlreadyRunning ?? false;
    this.workCounter = 0;
    this.doNotLogStartAndFinish = options.doNotLogStartAndFinish ?? false;
    this.onFreezeCallback = typeof options.onFreeze === 'function' ? options.onFreeze : null;

    if (this.isDevelopment) {
      void this.work();
    } else {
      this.cronJob.start();

      if (this.shouldRunImmediately) {
        this.cronJob.fireOnTick();
      }

      this.intervalId = this.makeInterval();
      this.processName = options.processName ?? null;
    }
  }

  /**
   *
   * @private
   */
  private async work(): Promise<void> {
    if ((this.isWorking && not(this.runEvenIfAlreadyRunning)) || this.isStopping) {
      return;
    }

    this.workCounter += 1;
    this.isWorking = this.workCounter > 0;
    this.lastRunTimestamp = moment.utc();

    this.emit('start');

    const executionPerformance = new PerformanceService();
    executionPerformance.start();

    try {
      if (not(this.doNotLogStartAndFinish)) {
        this.logger.info(`[${this.name}] started`);
      }

      if (this.timeoutTimeValue) {
        timeout(this.workFunc(this.logger), WorkerService.timeValueToMs(this.timeoutTimeValue));
      } else {
        await this.workFunc(this.logger);
      }
    } catch (err) {
      if (err instanceof TimeoutError) {
        this.onTimeout(err);
      } else {
        this.onError(err);
      }
    } finally {
      executionPerformance.stop();
      const differenceInSeconds = executionPerformance.getResult();
      if (not(this.doNotLogStartAndFinish)) {
        this.logger.info(
          `[${this.name}] finished in ${differenceInSeconds} ${differenceInSeconds === 1 ? 'second' : 'seconds'}`
        );
      }
    }

    this.workCounter -= 1;
    this.isWorking = this.workCounter > 0;

    if (not(this.isWorking)) {
      this.emit('stop');
    }
  }

  /**
   *
   */
  async stop(): Promise<void> {
    return new Promise(resolve => {
      this.logger.info(`[${this.name}] stop invoked`);

      this.isStopping = true;

      this.cronJob.stop();

      if (this.intervalId) {
        clearInterval(this.intervalId);
      }

      if (this.isWorking) {
        setTimeout(() => this.emit('stop'), WorkerService.timeValueToMs(this.stopTimeoutTimeValue));

        this.once('stop', () => {
          this.logger.info(`[${this.name}] stop executed`);

          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   *
   */
  async waitToFinish(): Promise<void> {
    return new Promise(resolve => {
      this.once('stop', resolve);
    });
  }

  /**
   *
   * @private
   */
  private makeInterval() {
    if (this.checkTimeValue != null) {
      const checkInMs = WorkerService.timeValueToMs(this.checkTimeValue);

      this.logger.info(`[${this.name}] check interval initialized: ${checkInMs}`);

      return setInterval(() => this.checkWorker(), checkInMs);
    }
  }

  /**
   *
   * @private
   */
  private checkWorker(): void {
    if (this.lastRunTimestamp == null) {
      return this.onFreeze();
    }

    const difference = moment.utc().valueOf() - this.lastRunTimestamp.valueOf();
    const freezeLimitInMs = WorkerService.timeValueToMs(this.freezeLimitTimeValue);

    this.logger.info(
      `[${this.name}] check report: working = ${this.isWorking}, last run = ${this.lastRunTimestamp.toISOString()}`
    );

    if (difference >= freezeLimitInMs) {
      return this.onFreeze();
    }
  }

  /**
   *
   * @private
   */
  private onFreeze(): void {
    this.logger.info(`[${this.name}] check report: worker is frozen`);

    // void broadcast("service-error", {
    //   message: `Worker "${this.name}" is frozen`,
    //   emoji: ":cold_face:",
    // });

    if (typeof this.onFreezeCallback === 'function') {
      this.onFreezeCallback();
    } else if (this.processName) {
      process.kill(process.pid, 'SIGINT');

      // exec(`pm2 restart ${this.processName}`, err => {
      //   if (err) {
      //     const stack = err?.stack ?? err;
      //
      //     console.error(`[${this.name}] restart failure:`, stack);
      //
      //     void broadcast('service-error', {
      //       message: `Worker "${this.name}" can't be restarted`,
      //       emoji: ':cold_face:'
      //     });
      //   }
      // });
    }
  }

  /**
   *
   * @private
   */
  // private get shouldBroadcastError(): boolean {
  //   const result = (() => {
  //     if (this.lastErrorTimestamp == null) {
  //       return true;
  //     } else {
  //       const differenceInSeconds =
  //         moment.utc().unix() - this.lastErrorTimestamp.unix();
  //       const differenceInMinutes = Math.trunc(differenceInSeconds / 60);

  //       return differenceInMinutes >= this.errorThrottleInMinutes;
  //     }
  //   })();

  //   if (result) {
  //     this.lastErrorTimestamp = moment.utc();
  //   }

  //   return result;
  // }

  /**
   *
   * @param err
   * @private
   */
  private onTimeout(err: TimeoutError): void {
    const stack = err?.stack ?? err;

    console.log(`[${this.name}] timeout error:`, stack);

    // if (this.shouldBroadcastError) {
    // void broadcast("service-error", {
    //   message: `Worker "${this.name}" timeout`,
    // });
    // }
  }

  /**
   *
   * @param err
   * @private
   */
  private onError(err: any): void {
    const uri = err?.options?.uri;
    const stack = err?.stack ?? err;

    if (err instanceof AxiosError) {
      console.error(`[${this.name}] error: ${uri} --`, stack);
    } else {
      console.error(`[${this.name}] error:`, stack);
    }

    // if (this.shouldBroadcastError) {
    //   let { message } = err;

    //   if (typeof message === "string" && /<!DOCTYPE html>/i.test(message)) {
    //     message = "Received HTML instead of JSON";
    //   }

    //   if (typeof message === "string" && /<html>.*<\/html>/s.test(message)) {
    //     message = "Received HTML instead of JSON";
    //   }

    //   if (
    //     typeof message === "string" &&
    //     message.includes("https://ethereum-rpc.publicnode.com")
    //   ) {
    //     message = message.replace(
    //       "https://ethereum-rpc.publicnode.com",
    //       '"Ethereum PublicNode"'
    //     );
    //   }

    //   if (
    //     typeof message === "string" &&
    //     message.includes("https://ethereum-goerli-rpc.publicnode.com")
    //   ) {
    //     message = message.replace(
    //       "https://ethereum-goerli-rpc.publicnode.com",
    //       '"Ethereum Goerli PublicNode"'
    //     );
    //   }

    //   if (
    //     typeof message === "string" &&
    //     message.includes("https://ethereum-holesky-rpc.publicnode.com")
    //   ) {
    //     message = message.replace(
    //       "https://ethereum-holesky-rpc.publicnode.com",
    //       '"Ethereum Holesky PublicNode"'
    //     );
    //   }

    // void broadcast("service-error", {
    //   message: `Worker "${this.name}" error: ${message}`,
    // });
    //}
  }
}
