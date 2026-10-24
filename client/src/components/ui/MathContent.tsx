import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

interface MathContentProps {
  content: string
}

export default function MathContent({ content }: MathContentProps) {
  const normalizedContent = content
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `\n$$\n${math}\n$$\n`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math}$`)

  return (
    <div className="math-content">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  )
}
