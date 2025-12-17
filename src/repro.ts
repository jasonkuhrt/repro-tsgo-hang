// Minimal tsgo hang reproduction
// Requires: declaration: true in tsconfig.json

type CamelCase<$S extends string> = $S extends `${infer First}-${infer Rest}`
  ? `${First}${Capitalize<CamelCase<Rest>>}`
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

// Class with merged namespace - THIS IS REQUIRED FOR HANG
export class Param {
  static fromString = <const $input extends string>(
    // Referencing Param.Analyze from merged namespace triggers the hang
    $input: Param.Analyze<$input> extends { long: string } ? $input : never,
  ) => null as any
}

// Merged namespace with recursive types
export namespace Param {
  export type Name = {
    aliases: { short: [...string[]]; long: [...string[]] }
    long: string | null
    short: string | null
  }

  export type NameEmpty = {
    aliases: { short: []; long: [] }
    long: null
    short: null
  }

  type Add<$Kind extends 'short' | 'long', $N extends Name, $V extends string> = $Kind extends 'short'
    ? $N['short'] extends null ? AddShort<$N, $V> : AddAliasShort<$N, $V>
    : $Kind extends 'long' ? $N['long'] extends null ? AddLong<$N, $V> : AddAliasLong<$N, $V>
    : never

  type AddAliasLong<$N extends Name, $V extends string> = Update<$N, 'aliases.long', Append<$N['aliases']['long'], CamelCase<$V>>>
  type AddAliasShort<$N extends Name, $V extends string> = Update<$N, 'aliases.short', Append<$N['aliases']['short'], $V>>
  type AddLong<$N extends Name, $V extends string> = Update<$N, 'long', CamelCase<$V>>
  type AddShort<$N extends Name, $V extends string> = Update<$N, 'short', $V>

  export type Analyze<$E extends string, $N extends Name = NameEmpty> = _Analyze<$E, $N>

  type _Analyze<$E extends string, $N extends Name> =
    $E extends `` ? $N :
    $E extends `--${infer v} ${infer tail}` ? _Analyze<tail, Add<'long', $N, v>> :
    $E extends `--${infer v}` ? Add<'long', $N, v> :
    $E extends `-${infer v}` ? Add<'short', $N, v> :
    'unknown'
}
