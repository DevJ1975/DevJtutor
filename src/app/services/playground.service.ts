import { Injectable, signal } from '@angular/core';
import { Exercise, RunnerKind } from '../models/curriculum.model';

export interface TestResult {
  name: string;
  passed: boolean;
}
export interface RunOutcome {
  output: string;
  error?: string;
}
export interface GradeOutcome {
  passed: boolean;
  tests: TestResult[];
  output: string;
  error?: string;
}

const PYODIDE_VERSION = '0.27.7';
const SQLJS_VERSION = '1.13.0';

declare const loadPyodide: ((opts: { indexURL: string }) => Promise<PyodideApi>) | undefined;
declare const initSqlJs: ((opts: { locateFile: (f: string) => string }) => Promise<SqlJsStatic>) | undefined;

interface PyodideApi {
  runPython(code: string): unknown;
}
interface SqlDb {
  run(sql: string): void;
  exec(sql: string): { columns: string[]; values: unknown[][] }[];
  close(): void;
}
interface SqlJsStatic {
  Database: new () => SqlDb;
}

@Injectable({ providedIn: 'root' })
export class PlaygroundService {
  /** Loading flags so the UI can show "Booting Python…" the first time. */
  readonly loadingRuntime = signal<RunnerKind | null>(null);

  private pyodide: PyodideApi | null = null;
  private pyodidePromise: Promise<PyodideApi> | null = null;
  private sql: SqlJsStatic | null = null;
  private sqlPromise: Promise<SqlJsStatic> | null = null;

  // ── Public API ────────────────────────────────────────────────
  async run(runner: RunnerKind, code: string, setupSql?: string): Promise<RunOutcome> {
    if (runner === 'js') return this.runJs(code, []);
    if (runner === 'python') return this.runPython(code, []);
    return this.runSql(code, setupSql);
  }

  async grade(exercise: Exercise, code: string): Promise<GradeOutcome> {
    if (exercise.runner === 'sql') return this.gradeSql(exercise, code);
    const asserts = exercise.tests.map((t) => t.assert);
    const res = exercise.runner === 'js' ? await this.runJsGraded(code, asserts) : await this.runPythonGraded(code, asserts);
    const tests = exercise.tests.map((t, i) => ({ name: t.name, passed: res.results[i] === true }));
    return { passed: !res.error && tests.every((t) => t.passed), tests, output: res.output, error: res.error };
  }

  // ── JavaScript (sandboxed Web Worker) ─────────────────────────
  private runJs(code: string, asserts: string[]): Promise<RunOutcome> {
    return this.runJsGraded(code, asserts).then((r) => ({ output: r.output, error: r.error }));
  }

  private runJsGraded(code: string, asserts: string[]): Promise<{ output: string; results: boolean[]; error?: string }> {
    const src = `
      self.onmessage = function (e) {
        var code = e.data.code, asserts = e.data.asserts || [];
        var logs = [];
        function fmt(v){ try { return typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v); } catch (_) { return String(v); } }
        var console = { log:function(){logs.push([].slice.call(arguments).map(fmt).join(' '))},
          error:function(){logs.push([].slice.call(arguments).map(fmt).join(' '))},
          warn:function(){logs.push([].slice.call(arguments).map(fmt).join(' '))},
          info:function(){logs.push([].slice.call(arguments).map(fmt).join(' '))} };
        try {
          var body = code + "\\n;return (asserts).map(function(__a){ try { return !!eval(__a); } catch (e) { return false; } });";
          var fn = new Function('console', 'asserts', body);
          var results = fn(console, asserts);
          self.postMessage({ logs: logs, results: results });
        } catch (err) {
          self.postMessage({ logs: logs, results: asserts.map(function(){return false;}), error: String((err && err.message) || err) });
        }
      };
    `;
    return new Promise((resolve) => {
      let worker: Worker | null = null;
      let url = '';
      const finish = (out: { logs?: string[]; results?: boolean[]; error?: string }) => {
        clearTimeout(timer);
        try { worker?.terminate(); } catch { /* ignore */ }
        if (url) URL.revokeObjectURL(url);
        resolve({ output: (out.logs ?? []).join('\n'), results: out.results ?? asserts.map(() => false), error: out.error });
      };
      const timer = setTimeout(() => finish({ error: 'Timed out (possible infinite loop). ⏱️', results: asserts.map(() => false) }), 5000);
      try {
        url = URL.createObjectURL(new Blob([src], { type: 'application/javascript' }));
        worker = new Worker(url);
        worker.onmessage = (e: MessageEvent) => finish(e.data);
        worker.onerror = (e) => finish({ error: e.message || 'Worker error' });
        worker.postMessage({ code, asserts });
      } catch (err) {
        finish({ error: String(err) });
      }
    });
  }

  // ── Python (Pyodide) ──────────────────────────────────────────
  private async ensurePyodide(): Promise<PyodideApi> {
    if (this.pyodide) return this.pyodide;
    if (!this.pyodidePromise) {
      this.loadingRuntime.set('python');
      this.pyodidePromise = (async () => {
        await loadScript(`https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`);
        const py = await loadPyodide!({ indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/` });
        return py;
      })();
    }
    this.pyodide = await this.pyodidePromise;
    this.loadingRuntime.set(null);
    return this.pyodide;
  }

  private async runPython(code: string, asserts: string[]): Promise<RunOutcome> {
    const r = await this.runPythonGraded(code, asserts);
    return { output: r.output, error: r.error };
  }

  private async runPythonGraded(code: string, asserts: string[]): Promise<{ output: string; results: boolean[]; error?: string }> {
    let py: PyodideApi;
    try {
      py = await this.ensurePyodide();
    } catch {
      this.loadingRuntime.set(null);
      return { output: '', results: asserts.map(() => false), error: 'Could not load the Python runtime (network blocked?).' };
    }
    py.runPython('import sys, io\n_buf = io.StringIO()\nsys.stdout = _buf\nsys.stderr = _buf');
    let error: string | undefined;
    try {
      py.runPython(code);
    } catch (e) {
      error = cleanPyError(e);
    }
    let output = '';
    try {
      output = String(py.runPython('_buf.getvalue()') ?? '');
    } catch { /* ignore */ }
    const results = asserts.map((a) => {
      try {
        return py.runPython(a) === true;
      } catch {
        return false;
      }
    });
    py.runPython('sys.stdout = sys.__stdout__\nsys.stderr = sys.__stderr__');
    return { output, results, error };
  }

  // ── SQL (sql.js) ──────────────────────────────────────────────
  private async ensureSql(): Promise<SqlJsStatic> {
    if (this.sql) return this.sql;
    if (!this.sqlPromise) {
      this.loadingRuntime.set('sql');
      this.sqlPromise = (async () => {
        await loadScript(`https://cdn.jsdelivr.net/npm/sql.js@${SQLJS_VERSION}/dist/sql-wasm.js`);
        return initSqlJs!({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/sql.js@${SQLJS_VERSION}/dist/${f}` });
      })();
    }
    this.sql = await this.sqlPromise;
    this.loadingRuntime.set(null);
    return this.sql;
  }

  private async runSql(query: string, setup?: string): Promise<RunOutcome> {
    let SQL: SqlJsStatic;
    try {
      SQL = await this.ensureSql();
    } catch {
      this.loadingRuntime.set(null);
      return { output: '', error: 'Could not load the SQL runtime (network blocked?).' };
    }
    const db = new SQL.Database();
    try {
      if (setup) db.run(setup);
      const res = db.exec(query);
      return { output: formatSqlResult(res) };
    } catch (e) {
      return { output: '', error: String((e as Error)?.message ?? e) };
    } finally {
      db.close();
    }
  }

  private async gradeSql(exercise: Exercise, code: string): Promise<GradeOutcome> {
    let SQL: SqlJsStatic;
    try {
      SQL = await this.ensureSql();
    } catch {
      return { passed: false, tests: [{ name: 'run query', passed: false }], output: '', error: 'Could not load the SQL runtime.' };
    }
    const expected = this.execRows(SQL, exercise.setupSql, exercise.solution);
    const actual = this.execRows(SQL, exercise.setupSql, code);
    if (actual.error) {
      return { passed: false, tests: [{ name: 'query runs without error', passed: false }], output: '', error: actual.error };
    }
    const ordered = /order\s+by/i.test(exercise.solution);
    const passed = sameRows(expected.rows, actual.rows, ordered);
    const name = exercise.tests[0]?.name ?? 'returns the expected rows';
    return {
      passed,
      tests: [{ name, passed }],
      output: formatRows(actual.columns, actual.rows),
    };
  }

  private execRows(SQL: SqlJsStatic, setup: string | undefined, query: string): { columns: string[]; rows: unknown[][]; error?: string } {
    const db = new SQL.Database();
    try {
      if (setup) db.run(setup);
      const res = db.exec(query);
      const last = res[res.length - 1];
      return { columns: last?.columns ?? [], rows: last?.values ?? [] };
    } catch (e) {
      return { columns: [], rows: [], error: String((e as Error)?.message ?? e) };
    } finally {
      db.close();
    }
  }
}

// ── helpers ───────────────────────────────────────────────────
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

function cleanPyError(e: unknown): string {
  const msg = String((e as Error)?.message ?? e);
  const lines = msg.trim().split('\n');
  // Surface the most relevant last lines of a Python traceback.
  return lines.slice(-3).join('\n');
}

function formatSqlResult(res: { columns: string[]; values: unknown[][] }[]): string {
  if (!res.length) return '(no rows returned)';
  const last = res[res.length - 1];
  return formatRows(last.columns, last.values);
}

function formatRows(columns: string[], rows: unknown[][]): string {
  if (!columns.length) return '(no rows returned)';
  const header = columns.join(' | ');
  const sep = columns.map(() => '---').join(' | ');
  const body = rows.map((r) => r.map((v) => (v === null ? 'NULL' : String(v))).join(' | ')).join('\n');
  return `${header}\n${sep}\n${body}`;
}

function sameRows(a: unknown[][], b: unknown[][], ordered: boolean): boolean {
  if (a.length !== b.length) return false;
  const norm = (rows: unknown[][]) => rows.map((r) => JSON.stringify(r));
  let na = norm(a);
  let nb = norm(b);
  if (!ordered) {
    na = [...na].sort();
    nb = [...nb].sort();
  }
  return na.every((v, i) => v === nb[i]);
}
