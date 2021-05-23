/* tslint:disable */
/* eslint-disable */
/**
* @param {string} prog
* @returns {Bindings | undefined}
*/
export function generate(prog: string): Bindings | undefined;
/**
*/
export class Bindings {
  free(): void;
/**
* @returns {string}
*/
  readonly js: string;
/**
* @returns {string}
*/
  readonly ts: string;
}
