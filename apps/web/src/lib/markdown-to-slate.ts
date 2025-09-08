import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm'; // Import remarkGfm
import { type Descendant } from 'slate';

// Define custom types for Slate to match the RichTextEditor's types
interface CustomElement {
  type: string;
  align?: "left" | "center" | "right" | "justify";
  url?: string;
  indent?: number;
  children: CustomText[];
}

interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontFamily?: string;
}

// Recursive function to convert Markdown AST to Slate JSON
const convertNodeToSlate = (node: any): Descendant | Descendant[] => {
  console.log("AST Node Type:", node.type, "Node Value:", node.value, "Children length:", node.children?.length);
  if (node.type === 'text') {
    // Handle custom underline syntax for text nodes
    const text = node.value as string;
    const parts: (Descendant | Descendant[])[] = [];
    const underlineRegex = /\+\+(.*?)\+\+/g;
    let lastIndex = 0;
    let match;

    while ((match = underlineRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: text.substring(lastIndex, match.index) });
      }
      parts.push({ text: match[1], underline: true });
      lastIndex = underlineRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex) });
    }
    
    if (parts.length > 1) return parts.flat(); // Flatten if multiple parts
    return parts[0] || { text: '' };

  } else if (node.type === 'strong') {
    // Apply bold mark to all children
    return node.children.flatMap(convertNodeToSlate).map((child: any) => ({ ...child, bold: true }));
  } else if (node.type === 'emphasis') {
    // Apply italic mark to all children
    return node.children.flatMap(convertNodeToSlate).map((child: any) => ({ ...child, italic: true }));
  } else if (node.type === 'delete') {
    // Apply strikethrough mark to all children
    return node.children.flatMap(convertNodeToSlate).map((child: any) => ({ ...child, strikethrough: true }));
  } else if (node.type === 'paragraph') {
    const children = node.children.flatMap(convertNodeToSlate);
    // Handle custom boxed field syntax within paragraphs
    const newChildren: Descendant[] = [];
    const boxedFieldRegex = /\[\[box:(.+?)\]\]/g;

    for (const child of children) {
      if ('text' in child && typeof child.text === 'string') {
        let lastIndex = 0;
        let match;
        const textContent = child.text;

        while ((match = boxedFieldRegex.exec(textContent)) !== null) {
          if (match.index > lastIndex) {
            newChildren.push({ text: textContent.substring(lastIndex, match.index) });
          }
          newChildren.push({ type: 'boxed-field', fieldName: match[1], children: [{ text: `{{${match[1]}}}` }] } as CustomElement);
          lastIndex = boxedFieldRegex.lastIndex;
        }
        if (lastIndex < textContent.length) {
          newChildren.push({ text: textContent.substring(lastIndex) });
        }
      } else {
        newChildren.push(child);
      }
    }

    return {
      type: 'paragraph',
      children: newChildren.length > 0 ? newChildren : [{ text: '' }],
    } as CustomElement;
  } else if (node.type.startsWith('heading')) {
    const level = parseInt(node.type.replace('heading', ''));
    return {
      type: `heading-${level}`,
      children: node.children.flatMap(convertNodeToSlate),
    } as CustomElement;
  } else if (node.type === 'list') {
    const listType = node.ordered ? 'numbered-list' : 'bulleted-list';
    return {
      type: listType,
      children: node.children.map((listItem: any) => ({
        type: 'list-item',
        children: listItem.children.flatMap(convertNodeToSlate),
      })),
    } as CustomElement;
  } else if (node.type === 'table') { // Handle tables
    return {
      type: 'table',
      children: node.children.flatMap(convertNodeToSlate),
    } as CustomElement;
  } else if (node.type === 'tableHead') { // Handle table head
    return {
      type: 'table-head', // New Slate element type
      children: node.children.flatMap(convertNodeToSlate),
    } as CustomElement;
  } else if (node.type === 'tableBody') { // Handle table body
    return {
      type: 'table-body', // New Slate element type
      children: node.children.flatMap(convertNodeToSlate),
    } as CustomElement;
  } else if (node.type === 'tableRow') { // Handle table rows
    return {
      type: 'table-row',
      children: node.children.flatMap(convertNodeToSlate),
    } as CustomElement;
  } else if (node.type === 'tableCell') { // Handle table cells
    const isHeader = node.parent && node.parent.type === 'tableRow' && node.parent.parent && node.parent.parent.type === 'tableHead'; // Correctly identify header cells
    return {
      type: isHeader ? 'table-header-cell' : 'table-cell',
      children: node.children.flatMap(convertNodeToSlate),
    } as CustomElement;
  } else if (node.type === 'code') { // Inline code
    return { text: node.value, code: true }; // Assuming 'code' mark for inline code
  } else if (node.type === 'inlineCode') { // Inline code (another possible type from remark-parse)
    return { text: node.value, code: true };
  } else if (node.type === 'code-block' || node.type === 'codeBlock') { // Block code
    return {
      type: 'code-block',
      children: [{ text: node.value }],
    } as CustomElement;
  } else if (node.type === 'blockquote') {
    return {
      type: 'blockquote',
      children: node.children.flatMap(convertNodeToSlate),
    } as CustomElement;
  } else if (node.type === 'link') {
    return {
      type: 'link',
      url: node.url,
      children: node.children.flatMap(convertNodeToSlate),
    } as CustomElement;
  } else if (node.type === 'break') {
    return { text: '\n' };
  }

  // Handle root children directly instead of wrapping in a 'document' element
  if (node.type === 'root') {
    return node.children.flatMap(convertNodeToSlate);
  }

  // Fallback for unhandled types, try to extract text value
  if (node.value) {
    return { text: node.value };
  }

  // If no value and no children, return empty text node as a fallback
  if (node.children) {
    return node.children.flatMap(convertNodeToSlate);
  }

  return { text: '' };
};

export function markdownToSlate(markdown: string): Descendant[] {
  const processor = unified().use(remarkParse).use(remarkGfm); // Use remarkGfm
  const ast = processor.parse(markdown);
  
  const slateNodes = convertNodeToSlate(ast);

  // Ensure it's always an array of Descendant
  return Array.isArray(slateNodes) ? slateNodes : [slateNodes];
}
