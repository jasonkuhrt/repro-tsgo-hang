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
    input: A.Thing<$input, A.NameEmpty> extends { long: string } ? $input : never,
  ) => null as any
}

export namespace A {
  export type Name = { aliases: any[]; long: any }
  export type NameEmpty = { aliases: []; long: null }

  type Add<
    $A extends Name,
    $B extends string
  > =
    $A['long'] extends null
    ? U<$A, 'long', $B>
    : U<$A, 'aliases', [...$A['aliases'], $B]>

  export type Thing<
    $A extends string,
    $B extends Name
  > =
    Thing_<$A, $B>

  type Thing_<
    $A,
    $B extends Name
  > =
    $A extends `` ? $B :
    $A extends `${infer v} ${infer tail}` ? Thing_<tail, Add<$B, v>> :
    $A extends `${infer v}` ? Add<$B, v> :
    'unknown'
}
