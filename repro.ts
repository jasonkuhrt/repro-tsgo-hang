/**
 * tsgo hang reproduction
 *
 * pnpm install
 * pnpm demo:works  # tsc completes
 * pnpm demo:hangs  # tsgo hangs
 *
 * Trigger: declaration:true + class/namespace merge + recursive types
 */

type U<
  $A,
  $B extends string,
  $C
> =

$B extends ``
  ? any
  : $A extends any
    ? Omit<$A, ''> & { [_ in $B]: $C }
  : any

export class A {
  static fromString = <const $input extends string>(
    input: A.Thing<$input> extends { long: string } ? $input : never,
  ) => null as any
}

export namespace A {
  export type Name = { aliases: string[]; long: string | null }
  export type NameEmpty = { aliases: []; long: null }

  type Add<
    $N extends Name,
    $V extends string
  > =
    $N['long'] extends null
    ? U<$N, 'long', $V>
    : U<$N, 'aliases', [...$N['aliases'], $V]>

  export type Thing<
    $E extends string,
    $N extends Name = NameEmpty
  > =
    _Thing<$E, $N>

  type _Thing<$E extends string, $N extends Name> =
    $E extends `` ? $N :
    $E extends `${infer v} ${infer tail}` ? _Thing<tail, Add<$N, v>> :
    $E extends `${infer v}` ? Add<$N, v> :
    'unknown'
}
