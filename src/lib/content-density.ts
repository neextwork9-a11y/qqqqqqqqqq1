import { Element, type DOMNode } from "html-react-parser";

/** Keep complete source content available while shortening the first view. */
export function collectionLimit(node: Element): number | undefined {
  const cls = (node.attribs["class"] ?? "").split(/\s+/);
  if (cls.includes("events")) return 12;
  if (cls.includes("awards")) return 12;
  if (cls.includes("timeline")) return 8;
  if (cls.includes("box-ordered")) return 6;
  if (node.name === "ul" && node.parent instanceof Element && node.parent.attribs["id"] === "grid-container") return 12;
  if (cls.includes("row") && node.children.some(n => n instanceof Element && containsClass(n, "embed-responsive"))) return 6;
  if (node.name === "ol" && node.children.filter(n => n instanceof Element && n.name === "li").length > 8) return 6;
  // Product FAQ answers are title + one or more paragraphs: never split an answer.
  if (node.children.filter(n => n instanceof Element && (n.attribs["class"] ?? "").split(/\s+/).includes("title")).length > 6) return 6;
  return undefined;
}

function containsClass(node: Element, cls: string): boolean {
  return (node.attribs["class"] ?? "").split(/\s+/).includes(cls) || node.children.some(n => n instanceof Element && containsClass(n, cls));
}

export function collectionGroups(node: Element): DOMNode[][] {
  const children = node.children as DOMNode[];
  const questions = children.some(n => n instanceof Element && (n.attribs["class"] ?? "").split(/\s+/).includes("title"));
  if (questions) {
    const groups: DOMNode[][] = [];
    for (const child of children) {
      if (child instanceof Element && (child.attribs["class"] ?? "").split(/\s+/).includes("title")) groups.push([]);
      const group = groups.at(-1);
      if (group) group.push(child);
    }
    return groups;
  }
  if ((node.attribs["class"] ?? "").split(/\s+/).includes("timeline")) {
    const groups: DOMNode[][] = [];
    let pending: DOMNode[] = [];
    for (const child of children) {
      pending.push(child);
      if (child instanceof Element && child.name === "li") { groups.push(pending); pending = []; }
    }
    return groups;
  }
  return children.filter(n => n instanceof Element).map(n => [n]);
}