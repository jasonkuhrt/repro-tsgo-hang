type NormalizeHierarchyInput<$H> = $H extends readonly string[] ? $H
  : $H extends string ? [$H]
  : readonly string[]

export interface StaticError<
  $HierarchyInput extends readonly string[] | string = readonly string[],
  $Context extends object = object,
> {
  ERROR_______: readonly [...NormalizeHierarchyInput<$HierarchyInput>, ...string[]]
  CONTEXT_____: $Context
}
