import { replaceAtIndex } from "../util";

const emptyNodeArray = new Array<Node>();

export const enum NodeType {
  AST,
  Assertion,
  Alternation,
  Concatenation,
  Character,
  CharacterSet,
  CharacterClass,
  Repetition,
  RangeRepetition,
  Group
}

export abstract class Node {
  constructor(public type: NodeType) {}

  children(): Node[] {
    return emptyNodeArray;
  }

  abstract clone(): Node;

  replace(node: Node, replacement: Node): void {
    throw new Error("replace not implemented for this node type");
  }
}

export class AST extends Node {
  constructor(public body: Node) {
    super(NodeType.AST);
  }

  static is(node: Node): bool {
    return node.type == NodeType.AST;
  }

  children(): Node[] {
    return this.body != null ? [this.body as Node] : emptyNodeArray;
  }

  clone(): Node {
    return new AST(this.body.clone());
  }

  replace(node: Node, replacement: Node): void {
    this.body = replacement;
  }
}

export class ConcatenationNode extends Node {
  constructor(public expressions: Node[]) {
    super(NodeType.Concatenation);
  }

  static is(node: Node): bool {
    return node.type == NodeType.Concatenation;
  }

  children(): Node[] {
    return this.expressions;
  }

  clone(): Node {
    return new ConcatenationNode(
      this.expressions.slice(0).map<Node>(s => s.clone())
    );
  }

  replace(node: Node, replacement: Node): void {
    const expressions = this.expressions;
    const index = expressions.indexOf(node);
    this.expressions = replaceAtIndex(expressions, index, replacement);
  }
}

export class CharacterSetNode extends Node {
  constructor(public chars: string, public negated: bool) {
    super(NodeType.CharacterSet);
  }

  static is(node: Node): bool {
    return node.type == NodeType.CharacterSet;
  }

  clone(): Node {
    return new CharacterSetNode(this.chars, this.negated);
  }
}

export class CharacterNode extends Node {
  char: string;
  constructor(char: string) {
    super(NodeType.Character);
    this.char = char;
  }

  static is(node: Node): bool {
    return node.type == NodeType.Character;
  }

  clone(): Node {
    return new CharacterNode(this.char);
  }
}

export class AssertionNode extends Node {
  constructor(public kind: string) {
    super(NodeType.Assertion);
  }

  static is(node: Node, kind: string = ""): bool {
    return (
      node.type == NodeType.Assertion &&
      ((node as AssertionNode).kind == kind || kind == "")
    );
  }

  clone(): Node {
    return new AssertionNode(this.kind);
  }
}

export class CharacterClassNode extends Node {
  constructor(public charClass: string) {
    super(NodeType.CharacterClass);
  }

  static is(node: Node): bool {
    return node.type == NodeType.CharacterClass;
  }

  clone(): Node {
    return new CharacterClassNode(this.charClass);
  }
}

export class RepetitionNode extends Node {
  expression: Node;
  quantifier: string;
  constructor(expression: Node, quantifier: string) {
    super(NodeType.Repetition);
    this.quantifier = quantifier;
    this.expression = expression;
  }

  static is(node: Node): bool {
    return node.type == NodeType.Repetition;
  }

  clone(): Node {
    return new RepetitionNode(this.expression.clone(), this.quantifier);
  }

  replace(node: Node, replacement: Node): void {
    this.expression = replacement;
  }
}

export class RangeRepetitionNode extends Node {

  constructor(
    public expression: Node,
    public from: i32,
    public to: i32
  ) {
    super(NodeType.RangeRepetition);
  }

  static is(node: Node): bool {
    return node.type == NodeType.RangeRepetition;
  }

  clone(): Node {
    return new RangeRepetitionNode(this.expression.clone(), this.from, this.to);
  }

  replace(node: Node, replacement: Node): void {
    this.expression = replacement;
  }
}

export class AlternationNode extends Node {
  constructor(public left: Node, public right: Node) {
    super(NodeType.Alternation);
  }

  static is(node: Node): bool {
    return node.type == NodeType.Alternation;
  }

  children(): Node[] {
    return [this.left, this.right];
  }

  clone(): Node {
    return new AlternationNode(this.left.clone(), this.right.clone());
  }

  replace(node: Node, replacement: Node): void {
    if (this.left === node) {
      this.left = replacement;
    } else {
      this.right = replacement;
    }
  }
}

export class GroupNode extends Node {
  constructor(public expression: Node) {
    super(NodeType.Group);
  }

  static is(node: Node): bool {
    return node.type == NodeType.Group;
  }

  children(): Node[] {
    return [this.expression];
  }

  clone(): Node {
    return new GroupNode(this.expression.clone());
  }

  replace(node: Node, replacement: Node): void {
    this.expression = replacement;
  }
}
