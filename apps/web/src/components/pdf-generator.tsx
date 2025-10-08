'use client';

import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Download, Printer, Share, Eye } from 'lucide-react';
import { DocumentTemplate, DocumentData } from '../types/template';
import TemplateProcessor from '../lib/template-processor';
import { useToast } from './ui/use-toast';

interface PDFGeneratorProps {
  template: DocumentTemplate;
  data: DocumentData;
  className?: string;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  template,
  data,
  className = ''
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Генерация HTML контента для PDF
  const generateHTMLContent = (): string => {
    const htmlContent = TemplateProcessor.processTemplateToHTML(template, data);
    
    return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.name}</title>
        <style>
          ${getPDFStyles()}
        </style>
      </head>
      <body>
        <div class="document-container">
          ${htmlContent}
        </div>
      </body>
      </html>
    `;
  };

  // Стили для PDF документа
  const getPDFStyles = (): string => {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Times New Roman', serif;
        font-size: 12pt;
        line-height: 1.4;
        color: #000;
        background: white;
      }
      
      .document-container {
        max-width: 210mm;
        margin: 0 auto;
        padding: 20mm;
        background: white;
        min-height: 297mm;
      }
      
      .section-header {
        text-align: center;
        font-size: 18pt;
        font-weight: bold;
        margin: 20px 0;
        text-transform: uppercase;
      }
      
      .section-contacts {
        margin: 15px 0;
        line-height: 1.6;
      }
      
      .contact-line {
        margin: 5px 0;
      }
      
      .section-text {
        margin: 15px 0;
        text-align: justify;
        line-height: 1.5;
      }
      
      .document-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 11pt;
      }
      
      .document-table th,
      .document-table td {
        border: 1px solid #000;
        padding: 8px 12px;
        text-align: left;
        vertical-align: top;
      }
      
      .document-table th {
        background-color: #f5f5f5;
        font-weight: bold;
        text-align: center;
      }
      
      .table-header {
        background-color: #f0f0f0;
        font-weight: bold;
        text-align: center;
      }
      
      .cell-number {
        text-align: center;
        width: 40px;
      }
      
      .cell-currency {
        text-align: right;
        font-family: monospace;
      }
      
      .signature {
        margin: 30px 0 10px 0;
        text-align: left;
      }
      
      .section-signature {
        margin: 30px 0;
        text-align: left;
        font-weight: bold;
      }
      
      @media print {
        .document-container {
          margin: 0;
          padding: 15mm;
          box-shadow: none;
        }
        
        body {
          background: white;
        }
        
        .no-print {
          display: none !important;
        }
      }
      
      @page {
        size: A4;
        margin: 15mm;
      }
    `;
  };

  // Функция печати
  const handlePrint = () => {
    const htmlContent = generateHTMLContent();
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Небольшая задержка для загрузки стилей
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  // Функция скачивания PDF (используя браузерную печать в PDF)
  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    
    try {
      const htmlContent = generateHTMLContent();
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Инструкция для пользователя
        setTimeout(() => {
          toast.info('Для сохранения в PDF:\n1. Нажмите Ctrl+P (Cmd+P на Mac)\n2. Выберите "Сохранить как PDF"\n3. Нажмите "Сохранить"');
        }, 500);
      }
    } catch (error) {
      console.error('Ошибка при генерации PDF:', error);
      toast.error('Произошла ошибка при генерации PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  // Предпросмотр в новом окне
  const handlePreview = () => {
    const htmlContent = generateHTMLContent();
    const previewWindow = window.open('', '_blank');
    
    if (previewWindow) {
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
    }
  };

  // Генерация текстового контента
  const generateTextContent = (): string => {
    return TemplateProcessor.processTemplate(template, data);
  };

  // Копирование в буфер обмена
  const handleCopyToClipboard = async () => {
    try {
      const textContent = generateTextContent();
      await navigator.clipboard.writeText(textContent);
      toast.success('Текст документа скопирован в буфер обмена');
    } catch (error) {
      console.error('Ошибка при копировании:', error);
      toast.error('Не удалось скопировать текст');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Экспорт документа</span>
          <Badge variant="secondary">{template.name}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Скрытый контент для печати */}
        <div 
          ref={contentRef} 
          className="hidden print:block"
          dangerouslySetInnerHTML={{ 
            __html: TemplateProcessor.processTemplateToHTML(template, data)
          }}
        />
        
        {/* Кнопки действий */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={handlePreview}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Просмотр
          </Button>
          
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Печать
          </Button>
          
          <Button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? 'Генерация...' : 'PDF'}
          </Button>
          
          <Button
            onClick={handleCopyToClipboard}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share className="h-4 w-4" />
            Копировать
          </Button>
        </div>
        
        {/* Информация о документе */}
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Шаблон: {template.name}</div>
          <div>Переменных заполнено: {Object.keys(data.variables).length}</div>
          {data.tableData && (
            <div>
              Таблиц: {Object.keys(data.tableData).length}
            </div>
          )}
        </div>
        
        {/* Предупреждения */}
        <div className="text-xs text-yellow-600 bg-yellow-50 p-3 rounded-md">
          <strong>Совет:</strong> Для лучшего качества PDF используйте браузер Chrome или Edge. 
          При печати выберите "Сохранить как PDF" в качестве принтера.
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFGenerator;
