// A small, dependency-free Markdown renderer covering the subset we use in
// article bodies: ## / ### headings, - bullet lists, **bold**, and paragraphs.
import { Fragment } from "react";

function renderInline(text, keyPrefix) {
  // Split on **bold** segments and render them as <strong>.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>;
  });
}

export default function Markdown({ content }) {
  const lines = (content || "").split("\n");
  const blocks = [];
  let listBuffer = [];
  let paragraphBuffer = [];

  const flushList = () => {
    if (listBuffer.length) {
      const items = listBuffer;
      blocks.push(
        <ul key={`ul-${blocks.length}`}>
          {items.map((item, i) => (
            <li key={i}>{renderInline(item, `li-${blocks.length}-${i}`)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      const text = paragraphBuffer.join(" ");
      blocks.push(
        <p key={`p-${blocks.length}`}>{renderInline(text, `p-${blocks.length}`)}</p>
      );
      paragraphBuffer = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push(<h3 key={`h3-${blocks.length}`}>{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(<h2 key={`h2-${blocks.length}`}>{line.slice(3)}</h2>);
    } else if (line.startsWith("- ")) {
      flushParagraph();
      listBuffer.push(line.slice(2));
    } else if (line.trim() === "") {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraphBuffer.push(line);
    }
  }
  flushParagraph();
  flushList();

  return <div className="prose">{blocks}</div>;
}
