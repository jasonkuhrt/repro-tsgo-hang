/**
 * tsgo hang reproduction
 *
 * pnpm install
 * pnpm demo:works  # tsc completes
 * pnpm demo:hangs  # tsgo hangs
 *
 * Remarks:
 * - exporting Thing_ fixes hang
 * - removing declaration:true fixes hang
 * - removing namespace wrapper fixes hang
 */

type U<
  $A,
  $B,
  $C
> =
  $B extends 0    ? any :
  $A extends any  ? Omit<$A, 0> & $C :
                    any

export class A {
  static fromString = <$input>(input: A.Thing<$input, A.NameEmpty>) => null as any
}

export namespace A {
  export type Name = { b: any[]; a: any }
  export type NameEmpty = { b: []; a: null }

  type Add<
    $A extends Name,
    $B
  > =
    $A['a'] extends any
      ? U<$A, '', $B>
      : U<$A, '', $B>

  export type Thing<
    $A,
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
