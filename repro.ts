/**
 * tsgo hang reproduction
 *
 * pnpm install
 * pnpm demo:works  # tsc completes
 * pnpm demo:hangs  # tsgo hangs
 *
 * Trigger: declaration:true + class/namespace merge + recursive types
 */

type U<$Obj, $Path extends string, $Value> = $Path extends `${infer Key}.${infer Rest}`
  ? $Obj extends Record<any, any>
    ? Key extends keyof $Obj ? Omit<$Obj, Key> & { [k in Key]: U<$Obj[k], Rest, $Value> }
    : $Obj
  : $Obj
  : $Obj extends Record<any, any>
    ? $Path extends keyof $Obj ? Omit<$Obj, $Path> & { [k in $Path]: $Value }
    : $Obj
  : $Obj

export class A {
  static fromString = <const $input extends string>(
    input: A.Analyze<$input> extends { long: string } ? $input : never,
  ) => null as any
}

export namespace A {
  export type Name = { aliases: string[]; long: string | null }
  export type NameEmpty = { aliases: []; long: null }

  type Add<$N extends Name, $V extends string> =
    $N['long'] extends null ? U<$N, 'long', $V> : U<$N, 'aliases', [...$N['aliases'], $V]>

  export type Analyze<$E extends string, $N extends Name = NameEmpty> = _Analyze<$E, $N>

  type _Analyze<$E extends string, $N extends Name> =
    $E extends `` ? $N :
    $E extends `--${infer v} ${infer tail}` ? _Analyze<tail, Add<$N, v>> :
    $E extends `--${infer v}` ? Add<$N, v> :
    'unknown'
}
