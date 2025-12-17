// Minimal in-repo reproduction with full complexity
import type { Ts } from '#ts'
import { Schema as S } from 'effect'

type Length<$S extends string, $Acc extends any[] = []> = $S extends `${infer _}${infer R}`
  ? Length<R, [...$Acc, any]>
  : $Acc['length']

type CamelCase<$S extends string> = $S extends `${infer First}-${infer Rest}`
  ? `${First}${Capitalize<CamelCase<Rest>>}`
  : $S extends `${infer First}_${infer Rest}` ? `${First}${Capitalize<CamelCase<Rest>>}`
  : $S

type Update<$Obj, $Path extends string, $Value> = $Path extends `${infer Key}.${infer Rest}`
  ? $Obj extends Record<any, any>
    ? Key extends keyof $Obj ? Omit<$Obj, Key> & { [k in Key]: Update<$Obj[k], Rest, $Value> }
    : $Obj
  : $Obj
  : $Obj extends Record<any, any>
    ? $Path extends keyof $Obj ? Omit<$Obj, $Path> & { [k in $Path]: $Value }
    : $Obj
  : $Obj

type Append<$Tuple extends readonly any[], $Element> = [...$Tuple, $Element]

interface ErrorParamParse<$message extends string>
  extends Ts.Err.StaticError<['cli', 'param', 'parse'], { message: $message }> {}

export class Param extends S.Class<Param>('Param')({
  canonical: S.String,
  short: S.NullOr(S.String),
  long: S.NullOr(S.String),
  aliases: S.Struct({
    short: S.Array(S.String),
    long: S.Array(S.String),
  }),
  expression: S.String,
}) {
  static fromString = <const $input extends string>(
    $input: Param.Analyze<$input> extends string ? ErrorParamParse<Param.Analyze<$input>> : $input,
  ) => {
    return null as any
  }
}

export namespace Param {
  export type Name = {
    expression: string
    canonical: string | null
    aliases: { short: [...string[]]; long: [...string[]] }
    long: string | null
    short: string | null
  }

  export type NameEmpty = {
    expression: string
    canonical: null
    aliases: { short: []; long: [] }
    long: null
    short: null
  }

  export interface SomeLimits {
    reservedNames: string | undefined
    usedNames: string | undefined
  }

  export namespace Errors {
    export interface Empty extends Ts.Err.StaticError<['cli', 'param', 'empty'], { message: 'Empty' }> {}
    export interface Unknown extends Ts.Err.StaticError<['cli', 'param', 'unknown'], { message: 'Unknown' }> {}
  }

  export namespace Checks {
    export namespace Messages {
      export interface LongTooShort<$V extends string>
        extends Ts.Err.StaticError<readonly ['cli', 'param', 'check', 'long-too-short'], { variant: $V }> {}
      export interface ShortTooLong<$V extends string>
        extends Ts.Err.StaticError<readonly ['cli', 'param', 'check', 'short-too-long'], { variant: $V }> {}
      export interface AliasDuplicate<$V extends string>
        extends Ts.Err.StaticError<readonly ['cli', 'param', 'check', 'alias-duplicate'], { variant: $V }> {}
      export interface AlreadyTaken<$V extends string>
        extends Ts.Err.StaticError<readonly ['cli', 'param', 'check', 'already-taken'], { variant: $V }> {}
      export interface Reserved<$V extends string>
        extends Ts.Err.StaticError<readonly ['cli', 'param', 'check', 'reserved'], { variant: $V }> {}
    }

    export namespace Kinds {
      export type LongTooShort<$V extends string> = {
        predicate: Length<$V> extends 1 ? true : false
        message: Messages.LongTooShort<$V>
      }
      export type ShortTooLong<$V extends string> = {
        predicate: Length<$V> extends 1 ? false : true
        message: Messages.ShortTooLong<$V>
      }
      export type AliasDuplicate<$N extends Name, $V extends string> = {
        predicate: CamelCase<$V> extends $N['long'] | $N['short'] ? true : false
        message: Messages.AliasDuplicate<$V>
      }
      export type AlreadyTaken<$L extends SomeLimits, $V extends string> = {
        predicate: $L['usedNames'] extends undefined ? false
          : CamelCase<$V> extends CamelCase<Exclude<$L['usedNames'], undefined>> ? true
          : false
        message: Messages.AlreadyTaken<$V>
      }
      export type Reserved<$L extends SomeLimits, $V extends string> = {
        predicate: $L['reservedNames'] extends undefined ? false
          : CamelCase<$V> extends CamelCase<Exclude<$L['reservedNames'], undefined>> ? true
          : false
        message: Messages.Reserved<$V>
      }
    }

    export interface Result {
      predicate: boolean
      message: Ts.Err.StaticError
    }

    export type SomeFailures = [Result, ...Result[]]

    type FilterFailures<$R extends [...Result[]], $A extends Result[] = []> = $R extends
      [infer H extends Result, ...infer T extends Result[]]
      ? H['predicate'] extends true ? FilterFailures<T, [...$A, H]> : FilterFailures<T, $A>
      : $A

    export type BaseChecks<$V extends string, $L extends SomeLimits, $N extends Name> = FilterFailures<
      [Kinds.AliasDuplicate<$N, $V>, Kinds.AlreadyTaken<$L, $V>, Kinds.Reserved<$L, $V>]
    >

    export type LongChecks<$V extends string, $L extends SomeLimits, $N extends Name> = FilterFailures<
      [...BaseChecks<$V, $L, $N>, Kinds.LongTooShort<$V>]
    >

    export type ShortChecks<$V extends string, $L extends SomeLimits, $N extends Name> = FilterFailures<
      [...BaseChecks<$V, $L, $N>, Kinds.ShortTooLong<$V>]
    >

    export type ReportFailures<$R extends [...Result[]]> = $R extends
      [infer H extends Result, ...infer T extends Result[]]
      ? H['predicate'] extends true ? H['message'] : ReportFailures<T>
      : never
  }

  interface SomeLimitsNone {
    reservedNames: undefined
    usedNames: undefined
  }

  type Add<$Kind extends 'short' | 'long', $N extends Name, $V extends string> = $Kind extends 'short'
    ? $N['short'] extends null ? AddShort<$N, $V> : AddAliasShort<$N, $V>
    : $Kind extends 'long' ? $N['long'] extends null ? AddLong<$N, $V> : AddAliasLong<$N, $V>
    : never

  type AddAliasLong<$N extends Name, $V extends string> = Update<$N, 'aliases.long', Append<$N['aliases']['long'], CamelCase<$V>>>
  type AddAliasShort<$N extends Name, $V extends string> = Update<$N, 'aliases.short', Append<$N['aliases']['short'], $V>>
  type AddLong<$N extends Name, $V extends string> = Update<$N, 'long', CamelCase<$V>>
  type AddShort<$N extends Name, $V extends string> = Update<$N, 'short', $V>

  type addCanonical<$N extends Name> = Update<
    $N,
    'canonical',
    $N['long'] extends string ? $N['long'] : $N['short'] extends string ? $N['short'] : never
  >

  export type Analyze<
    $E extends string,
    $L extends SomeLimits = SomeLimitsNone,
    $N extends Name = NameEmpty,
  > = _Analyze<$E, $L, $N>

  type _Analyze<$E extends string, $L extends SomeLimits, $N extends Name> = $E extends ``
    ? NameEmpty extends $N ? Errors.Empty : addCanonical<$N>
    : $E extends ` ${infer tail}` ? _Analyze<tail, $L, $N>
    : $E extends `${infer initial} ` ? _Analyze<initial, $L, $N>
    : $E extends `--${infer v} ${infer tail}`
      ? Checks.LongChecks<v, $L, $N> extends Checks.SomeFailures
        ? Checks.ReportFailures<Checks.LongChecks<v, $L, $N>>
        : _Analyze<tail, $L, Add<'long', $N, v>>
    : $E extends `--${infer v}`
      ? Checks.LongChecks<v, $L, $N> extends Checks.SomeFailures
        ? Checks.ReportFailures<Checks.LongChecks<v, $L, $N>>
        : _Analyze<'', $L, Add<'long', $N, v>>
    : $E extends `-${infer v} ${infer tail}`
      ? Checks.ShortChecks<v, $L, $N> extends Checks.SomeFailures
        ? Checks.ReportFailures<Checks.ShortChecks<v, $L, $N>>
        : _Analyze<tail, $L, Add<'short', $N, v>>
    : $E extends `-${infer v}`
      ? Checks.ShortChecks<v, $L, $N> extends Checks.SomeFailures
        ? Checks.ReportFailures<Checks.ShortChecks<v, $L, $N>>
        : _Analyze<'', $L, Add<'short', $N, v>>
    : $E extends `${infer v} ${infer tail}`
      ? Checks.BaseChecks<v, $L, $N> extends Checks.SomeFailures
        ? Checks.ReportFailures<Checks.BaseChecks<v, $L, $N>>
        : _Analyze<tail, $L, Add<Length<v> extends 1 ? 'short' : 'long', $N, v>>
    : $E extends `${infer v}`
      ? Checks.BaseChecks<v, $L, $N> extends Checks.SomeFailures
        ? Checks.ReportFailures<Checks.BaseChecks<v, $L, $N>>
        : _Analyze<'', $L, Add<Length<v> extends 1 ? 'short' : 'long', $N, v>>
    : Errors.Unknown
}
