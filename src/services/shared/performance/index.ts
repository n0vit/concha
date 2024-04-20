/**
 * Simple performance serive.
 *
 * Example 1:
 *  const perf = new PerformanceService();
 *  perf.start();
 *  do something
 *  perf.stop();
 *  console.log(perf.getResult(), perf.result);
 *   You will get: reuslt via method in property
 *
 * Example 2:
 *  const perf = new PerformanceService();
 *  perf.start();
 *  do something
 *  console.log(perf.getResult());
 *  You will get: reuslt only via method
 */
export class PerformanceService {
  private _startTime: number;
  private _endTime: number;
  public result: number;
  constructor() {
    this._startTime = 0;
    this._endTime = 0;
    this.result = 0;
  }

  /**
   * Starts the performance measurement by recording the current time.
   */
  public start() {
    this._startTime = performance.now();
  }

  /**
   * Stops the performance measurement by recording the current time and calculating the elapsed time.
   */
  public stop(): void {
    this._endTime = performance.now();
    this.result = Math.trunc(this._endTime - this._startTime) / 1000;
  }

  /**
   * Returns the result of the performance measurement in seconds.
   */
  public getResult() {
    if (this._endTime === 0) {
      this.stop();
    }
    return this.result;
  }
}
