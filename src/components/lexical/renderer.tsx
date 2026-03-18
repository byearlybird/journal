import type { ReactNode } from "react";

type LexicalTextNode = {
  type: "text";
  text: string;
  format: number;
};

type LexicalLinebreakNode = {
  type: "linebreak";
};

type LexicalParagraphNode = {
  type: "paragraph";
  children: (LexicalTextNode | LexicalLinebreakNode)[];
};

type LexicalRoot = {
  root: {
    type: "root";
    children: LexicalParagraphNode[];
  };
};

// Lexical format bitmask
const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_STRIKETHROUGH = 4;

function renderTextNode(node: LexicalTextNode, key: number): ReactNode {
  let element: ReactNode = node.text;

  if (node.format & FORMAT_BOLD) {
    element = <strong key={`${key}-b`}>{element}</strong>;
  }
  if (node.format & FORMAT_ITALIC) {
    element = <em key={`${key}-i`}>{element}</em>;
  }
  if (node.format & FORMAT_STRIKETHROUGH) {
    element = <del key={`${key}-s`}>{element}</del>;
  }

  return element;
}

function renderParagraph(node: LexicalParagraphNode, key: number): ReactNode {
  return (
    <p key={key}>
      {node.children.length === 0 ? (
        <br />
      ) : (
        node.children.map((child, i) => {
          if (child.type === "linebreak") return <br key={i} />;
          if (child.type === "text") return renderTextNode(child, i);
          return null;
        })
      )}
    </p>
  );
}

export function Renderer({ content }: { content: string }) {
  if (!content) return null;

  try {
    const data = JSON.parse(content) as LexicalRoot;
    if (data?.root?.type !== "root") throw new Error("Invalid format");

    return (
      <div className="lexical-content">
        {data.root.children.map((child, i) => {
          if (child.type === "paragraph") return renderParagraph(child, i);
          return null;
        })}
      </div>
    );
  } catch {
    // Fallback for legacy plain text
    return (
      <div className="lexical-content">
        {content.split("\n").map((line, i) => (
          <p key={i}>{line || <br />}</p>
        ))}
      </div>
    );
  }
}
