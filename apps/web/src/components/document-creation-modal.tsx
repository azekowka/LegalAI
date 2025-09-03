"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Plus, X } from 'lucide-react';

interface DocumentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const templates = [
  { id: 'work-act', name: 'Акт Выполненных Работ', icon: FileText },
  { id: 'commercial-proposal', name: 'Коммерческое предложение', icon: FileText },
  { id: 'invoice', name: 'Счет на оплату', icon: FileText },
  { id: 'confidentiality', name: 'Соглашение о Конфиденциальности', icon: FileText },
];

export function DocumentCreationModal({ isOpen, onClose }: DocumentCreationModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload here
      console.log('File dropped:', e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Handle file selection here
      console.log('File selected:', e.target.files[0]);
    }
  };

  const handleCreateNew = () => {
    console.log('Create new document');
    router.push('/dashboard/editor');
    onClose();
  };

  const handleTemplateSelect = (templateId: string) => {
    console.log('Template selected:', templateId);
    onClose();
  };

  const handleNewTemplate = () => {
    console.log('Create new template');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Создать документ</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Create New Section */}
          <div>
            <Button
              onClick={handleCreateNew}
              variant="outline"
              className="w-full justify-start h-12 text-base font-medium hover:bg-gray-50 transition-colors"
            >
              <FileText className="mr-3 h-5 w-5 text-gray-600" />
              Создать новый
            </Button>
          </div>

          {/* Upload File Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Загрузить файл</h3>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.rtf"
                onChange={handleFileSelect}
              />
              <Upload className="mx-auto h-10 w-10 text-gray-400 mb-4" />
              <p className="text-base font-medium text-gray-900 mb-2">
                Выберите файл или перенесите его сюда
              </p>
              <p className="text-sm text-gray-500">
                Можно выбрать несколько файлов: pdf, doc, docx, rtf
              </p>
            </div>
          </div>

          {/* Templates Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Создать из шаблона</h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  variant="outline"
                  className="w-full justify-start h-12 text-base font-normal hover:bg-gray-50 transition-colors"
                >
                  <template.icon className="mr-3 h-5 w-5 text-gray-600" />
                  {template.name}
                </Button>
              ))}
              
              <Button
                onClick={handleNewTemplate}
                variant="outline"
                className="w-full justify-start h-12 text-base font-normal hover:bg-gray-50 transition-colors border-dashed"
              >
                <Plus className="mr-3 h-5 w-5 text-gray-600" />
                Новый шаблон
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}