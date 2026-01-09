/**
 * 🕸️ P1-SUB-6: FLOW PIPE
 * Chains multiple operations (transformations, validations) into a pipeline.
 */

export type PipeFunction<T = any, R = any> = (input: T) => R;

export class FlowPipe<T = any> {
  private stages: PipeFunction[] = [];

  constructor(private initialValue: T) {}

  public static start<I>(input: I): FlowPipe<I> {
    return new FlowPipe(input);
  }

  public pipe<R>(fn: PipeFunction<any, R>): FlowPipe<R> {
    this.stages.push(fn);
    return this as any;
  }

  public execute(): T {
    return this.stages.reduce((acc, fn) => fn(acc), this.initialValue);
  }
}
