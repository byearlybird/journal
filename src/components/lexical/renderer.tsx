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

function TextNode({ node }: { node: LexicalTextNode }) {
  let element: React.ReactNode = node.text;

  if (node.format & FORMAT_BOLD) {
    element = <strong>{element}</strong>;
  }
  if (node.format & FORMAT_ITALIC) {
    element = <em>{element}</em>;
  }
  if (node.format & FORMAT_STRIKETHROUGH) {
    element = <del>{element}</del>;
  }

  return element;
}

function ParagraphNode({ node }: { node: LexicalParagraphNode }) {
  return (
    <p>
      {node.children.length === 0 ? (
        <br />
      ) : (
        node.children.map((child, i) => {
          if (child.type === "linebreak") return <br key={i} />;
          if (child.type === "text") return <TextNode node={child} key={i} />;
          return null;
        })
      )}
    </p>
  );
}

export function Renderer({ content }: { content: string }) {
  if (!content) return null;

  const data = JSON.parse(content) as LexicalRoot;
  if (data?.root?.type !== "root") throw new Error("Invalid format");

  return (
    <div className="lexical-content">
      {data.root.children.map((child, i) => {
        if (child.type === "paragraph") return <ParagraphNode node={child} key={i} />;
        return null;
      })}
    </div>
  );
}
