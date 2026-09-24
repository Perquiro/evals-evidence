// Evaluator-only Product clock. Timers and performance.now remain real.
const OriginalDate = Date;
const fixed = OriginalDate.parse('2026-09-17T12:00:00.000Z');
global.Date = class extends OriginalDate {
  constructor(...args) { super(...(args.length ? args : [fixed])); }
  static now() { return fixed; }
};
