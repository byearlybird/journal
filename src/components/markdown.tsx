import { Link } from "@tanstack/react-router";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import type { ComponentProps } from "react";

const H1 = ({ children }: ComponentProps<"h1">) => (
  <h1 className="text-3xl font-bold mb-6">{children}</h1>
);

const H2 = ({ children }: ComponentProps<"h2">) => (
  <h2 className="text-2xl font-semibold mt-8 mb-4">{children}</h2>
);

const H3 = ({ children }: ComponentProps<"h3">) => (
  <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
);

const H4 = ({ children }: ComponentProps<"h4">) => (
  <h4 className="text-lg italic text-foreground-soft mb-6">{children}</h4>
);

const P = ({ children }: ComponentProps<"p">) => (
  <p className="mb-6 text-foreground-soft leading-relaxed">{children}</p>
);

const A = ({ href, children }: ComponentProps<"a">) => {
  if (!href) return <>{children}</>;

  if (/^(https?:|mailto:)/i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="underline hover:opacity-70">
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className="underline hover:opacity-70">
      {children}
    </Link>
  );
};

const Ul = ({ children }: ComponentProps<"ul">) => (
  <ul className="list-disc list-inside mb-4 space-y-1 text-foreground-soft leading-relaxed">
    {children}
  </ul>
);

const Ol = ({ children }: ComponentProps<"ol">) => (
  <ol className="list-decimal list-inside mb-4 space-y-1 text-foreground-soft leading-relaxed">
    {children}
  </ol>
);

const Li = ({ children }: ComponentProps<"li">) => <li className="ml-4">{children}</li>;

const Blockquote = ({ children }: ComponentProps<"blockquote">) => (
  <blockquote className="border-l-4 border-border pl-4 italic my-4 text-foreground-soft">
    {children}
  </blockquote>
);

const Code = ({ children }: ComponentProps<"code">) => (
  <code className="rounded px-1 py-0.5 font-mono text-sm bg-surface-tint">{children}</code>
);

const Pre = ({ children }: ComponentProps<"pre">) => (
  <pre className="rounded p-4 overflow-auto mb-4 font-mono text-sm bg-surface-tint">{children}</pre>
);

const components: Components = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  a: A,
  ul: Ul,
  ol: Ol,
  li: Li,
  blockquote: Blockquote,
  code: Code,
  pre: Pre,
};

export function DocMarkdown({ content }: { content: string }) {
  return <Markdown components={components}>{content}</Markdown>;
}
