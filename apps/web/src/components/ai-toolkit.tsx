import { MessageSquarePlus, Pilcrow, FileCheck, TextSelect, Component, AlignJustify } from 'lucide-react'

const AiToolkit = () => {
  const toolkitItems = [
    { icon: <MessageSquarePlus size={20} />, text: 'Add AI comment' },
    { icon: <Pilcrow size={20} />, text: 'Add new paragraph' },
    { icon: <FileCheck size={20} />, text: 'Proofread' },
    { icon: <TextSelect size={20} />, text: 'Adjust text selection' },
    { icon: <Component size={20} />, text: 'Add custom component' },
    { icon: <AlignJustify size={20} />, text: 'Justify edit' },
  ]

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow w-64">
      <h3 className="text-lg font-semibold mb-4">AI Toolkit</h3>
      <ul className="space-y-2">
        {toolkitItems.map((item, index) => (
          <li key={index} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
            {item.icon}
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AiToolkit
