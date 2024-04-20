import { HOUR_UNITS, MINUTE_UNITS, SECOND_UNITS } from "./constants";
import * as R from "ramda";
import { TimeUnit, TimeValue, WorkerOptions } from "./types";
import { Worker } from "./worker";

/**
 *
 */
export class WorkerService {
  /**
   *
   */
  static everyFiveSeconds = WorkerService.every(5, "seconds");
  static everyFifteenSeconds = WorkerService.every(15, "seconds");
  static everyMinute = WorkerService.every(1, "minute");
  static everyFiveMinutes = WorkerService.every(5, "minutes");
  static everyTenMinutes = WorkerService.every(10, "minutes");
  static everyFifteenMinutes = WorkerService.every(15, "minutes");
  static everyHour = WorkerService.every(1, "hour");
  static oneMinuteTimeValue = WorkerService.makeTimeValue(1, "minute");
  static oneHourTimeValue = WorkerService.makeTimeValue(1, "hour");
  static halfAnHourTimeValue = WorkerService.makeTimeValue(30, "minutes");
  static twoHoursTimeValue = WorkerService.makeTimeValue(2, "hours");
  static threeHoursTimeValue = WorkerService.makeTimeValue(3, "hours");

  /**
   *
   * @param value
   * @param unit
   */
  static every(value: number, unit: TimeUnit): string {
    return R.cond<any, string>([
      [() => R.includes(unit, SECOND_UNITS), R.always(`*/${value} * * * * *`)],
      [() => R.includes(unit, MINUTE_UNITS), R.always(`*/${value} * * * *`)],
      [() => R.includes(unit, HOUR_UNITS), R.always(`0 */${value} * * *`)],
      [
        R.T,
        () => {
          throw new Error("Invalid time unit");
        },
      ],
    ])();
  }

  /**
   *
   * @param value
   * @param unit
   */
  static at(value: string | number, unit: TimeUnit): string {
    return R.cond<any, string>([
      [() => R.includes(unit, SECOND_UNITS), R.always(`${value} * * * * *`)],
      [() => R.includes(unit, MINUTE_UNITS), R.always(`${value} * * * *`)],
      [() => R.includes(unit, HOUR_UNITS), R.always(`0 ${value} * * *`)],
      [
        R.T,
        () => {
          throw new Error("Invalid time unit");
        },
      ],
    ])();
  }

  /**
   *
   * @param value
   * @param unit
   */
  static makeTimeValue(value: number, unit: TimeUnit): TimeValue {
    return { value, unit };
  }

  /**
   *
   * @param timeValue
   * @private
   */
  static timeValueToMs(timeValue: TimeValue): number {
    const multiplier = R.cond([
      [() => R.includes(timeValue.unit, SECOND_UNITS), R.always(1000)],
      [() => R.includes(timeValue.unit, MINUTE_UNITS), R.always(1000 * 60)],
      [() => R.includes(timeValue.unit, HOUR_UNITS), R.always(1000 * 60 * 60)],
      [
        R.T,
        () => {
          throw new Error("Invalid time unit");
        },
      ],
    ])();

    return timeValue.value * multiplier;
  }

  /**
   *
   * @param options
   */
  static createWorker(options: WorkerOptions): Worker {
    return new Worker(options);
  }
}

/**
 *
 */
export * from "./worker";
export * from "./constants";
export * from "./types";
