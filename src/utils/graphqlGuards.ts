// Reguły walidacji GraphQL ograniczające głębokość, liczbę pól i szacowany koszt zapytania

import {
  GraphQLError,
  Kind,
  isListType,
  isNonNullType,
  type ASTVisitor,
  type GraphQLOutputType,
  type SelectionSetNode,
  type ValidationContext,
} from "graphql";

function selectionSetDepth(
  selectionSet: SelectionSetNode | undefined,
  context: ValidationContext,
  seen: Set<string>,
): number {
  if (!selectionSet) return 0;
  let max = 0;
  for (const sel of selectionSet.selections) {
    if (sel.kind === Kind.FIELD) {
      const child = sel.selectionSet ? selectionSetDepth(sel.selectionSet, context, seen) : 0;
      max = Math.max(max, 1 + child);
    } else if (sel.kind === Kind.INLINE_FRAGMENT) {
      max = Math.max(max, selectionSetDepth(sel.selectionSet, context, seen));
    } else if (sel.kind === Kind.FRAGMENT_SPREAD) {
      if (seen.has(sel.name.value)) continue;
      const frag = context.getFragment(sel.name.value);
      if (frag) {
        seen.add(sel.name.value);
        max = Math.max(max, selectionSetDepth(frag.selectionSet, context, seen));
      }
    }
  }
  return max;
}

export function depthLimit(maxDepth: number) {
  return (context: ValidationContext): ASTVisitor => ({
    OperationDefinition(node) {
      const depth = selectionSetDepth(node.selectionSet, context, new Set());
      if (depth > maxDepth) {
        context.reportError(
          new GraphQLError(`Query exceeds maximum depth of ${maxDepth} (got ${depth}).`, {
            nodes: [node],
            extensions: { code: "QUERY_TOO_DEEP" },
          }),
        );
      }
    },
  });
}

export function fieldCountLimit(maxFields: number) {
  return (context: ValidationContext): ASTVisitor => {
    let count = 0;
    return {
      Field() {
        count++;
        if (count === maxFields + 1) {
          context.reportError(
            new GraphQLError(`Query selects too many fields (limit ${maxFields}).`, {
              extensions: { code: "QUERY_TOO_COMPLEX" },
            }),
          );
        }
      },
    };
  };
}

const LIST_MULTIPLIER = 20;

function isListReturning(type: GraphQLOutputType | null | undefined): boolean {
  let t: GraphQLOutputType | null | undefined = type;
  while (t && isNonNullType(t)) t = t.ofType;
  return !!t && isListType(t);
}

export function complexityLimit(maxCost: number) {
  return (context: ValidationContext): ASTVisitor => {
    let totalCost = 0;
    let reported = false;
    const multiplierStack: number[] = [1];

    return {
      Field: {
        enter() {
          const multiplier = multiplierStack[multiplierStack.length - 1]!;
          totalCost += multiplier;
          multiplierStack.push(isListReturning(context.getType()) ? multiplier * LIST_MULTIPLIER : multiplier);
        },
        leave() {
          multiplierStack.pop();
        },
      },
      OperationDefinition: {
        leave(node) {
          if (totalCost > maxCost && !reported) {
            reported = true;
            context.reportError(
              new GraphQLError(`Query is too complex (estimated cost ${totalCost}, limit ${maxCost}).`, {
                nodes: [node],
                extensions: { code: "QUERY_TOO_COMPLEX" },
              }),
            );
          }
        },
      },
    };
  };
}
