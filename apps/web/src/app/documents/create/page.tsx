'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { FileText, ArrowRight, Calendar, Building2 } from 'lucide-react';
import TemplateForm from '../../../components/template-form';
import PDFGenerator from '../../../components/pdf-generator';
import { DocumentTemplate, DocumentData, GeneratedDocument } from '../../../types/template';
import commercialOfferTemplate from '../../../templates/template1';

// Моковые данные шаблонов (в реальном проекте будут загружаться с сервера)
const availableTemplates: DocumentTemplate[] = [
  commercialOfferTemplate,
  // Можно добавить другие шаблоны
];

export default function CreateDocumentPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setDocumentData(null);
    setGeneratedDocument(null);
  };

  const handleSaveDocument = useCallback((data: DocumentData) => {
    const newDocument: GeneratedDocument = {
      id: `doc-${Date.now()}`,
      templateId: data.templateId,
      title: `${selectedTemplate?.name} - ${new Date().toLocaleDateString('ru-RU')}`,
      content: '', // Будет заполнено процессором
      htmlContent: '', // Будет заполнено процессором
      data,
      createdAt: new Date()
    };

    setGeneratedDocument(newDocument);
    setDocumentData(data);
    
    // В реальном проекте здесь будет сохранение в базу данных
    console.log('Документ сохранен:', newDocument);
    
    // Показать уведомление об успешном сохранении
    alert('Документ успешно создан!');
  }, [selectedTemplate]);

  const handlePreview = useCallback((html: string) => {
    setPreviewHtml(html);
    setShowPreview(true);
  }, []);

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setDocumentData(null);
    setGeneratedDocument(null);
  };

  // Рендер списка шаблонов
  const renderTemplatesList = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Создание документа</h1>
        <p className="text-xl text-muted-foreground">
          Выберите шаблон для создания вашего документа
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            onClick={() => handleTemplateSelect(template)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{template.category}</Badge>
              </div>
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4 mr-2" />
                  Переменных: {template.variables.length}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Секций: {template.sections.length}
                </div>
                <Separator />
                <Button className="w-full" variant="outline">
                  Использовать шаблон
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {availableTemplates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Шаблоны не найдены</h3>
            <p className="text-muted-foreground">
              В данный момент нет доступных шаблонов для создания документов.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Рендер формы создания документа
  const renderDocumentForm = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBackToTemplates}>
                ← Назад к шаблонам
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{selectedTemplate?.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Заполните данные для создания документа
                </p>
              </div>
            </div>
            <Badge variant="outline">{selectedTemplate?.category}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TemplateForm
              template={selectedTemplate!}
              initialData={documentData}
              onSave={handleSaveDocument}
              onPreview={handlePreview}
            />
          </div>
          
          <div className="space-y-6">
            {documentData && (
              <PDFGenerator
                template={selectedTemplate!}
                data={documentData}
              />
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Информация о шаблоне</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Название:</span>
                  <p className="text-sm text-muted-foreground">{selectedTemplate?.name}</p>
                </div>
                <div>
                  <span className="font-medium">Описание:</span>
                  <p className="text-sm text-muted-foreground">{selectedTemplate?.description}</p>
                </div>
                <div>
                  <span className="font-medium">Категория:</span>
                  <p className="text-sm text-muted-foreground">{selectedTemplate?.category}</p>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground">
                  Создан: {selectedTemplate?.createdAt.toLocaleDateString('ru-RU')}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!selectedTemplate ? renderTemplatesList() : renderDocumentForm()}
      
      {/* Диалог предпросмотра */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Предпросмотр документа</DialogTitle>
            <DialogDescription>
              Так будет выглядеть ваш документ после генерации
            </DialogDescription>
          </DialogHeader>
          <div 
            className="border rounded-lg p-6 bg-white"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
