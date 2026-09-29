import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * Renders text containing LaTeX math:
 * - Display math: $$...$$ or \[...\]
 * - Inline math: $...$ or \(...\)
 */
export const KaTeXRenderer = ({ text = '', className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!text) return '';

    // First replace LaTeX display equations
    let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, equation) => {
      try {
        return katex.renderToString(equation.trim(), { displayMode: true, throwOnError: false });
      } catch (e) {
        return equation;
      }
    });

    // Replace LaTeX inline equations
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, equation) => {
      try {
        return katex.renderToString(equation.trim(), { displayMode: false, throwOnError: false });
      } catch (e) {
        return equation;
      }
    });

    // Replace newlines with <br /> for formatted paragraphs
    processed = processed.replace(/\n/g, '<br />');

    return processed;
  }, [text]);

  return (
    <span
      className={`katex-wrapper leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
