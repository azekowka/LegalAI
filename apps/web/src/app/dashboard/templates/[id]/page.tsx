'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Settings, 
  FileText, 
  Download,
  RefreshCw,
  Info,
  Variable,
  Table
} from 'lucide-react';
import { RichTextEditor } from '@/components/rich-text-editor';
import TemplateVariablesPanel from '@/components/template-variables-panel';
import { DocumentTemplate, DocumentData, TemplateVariable } from '@/types/template';
import TemplateToSlateConverter from '@/lib/template-to-slate-converter';
import EnhancedTemplateConverter from '@/lib/enhanced-template-converter';
import ExactDocumentConverter from '@/lib/exact-document-converter';
import TemplateProcessor from '@/lib/template-processor';
import commercialOfferTemplate from '@/templates/template1';
import confidentialityAgreementTemplate from '@/templates/confidentiality-agreement';
import serviceAgreementTemplate from '@/templates/service-agreement';
import invoiceTemplate from '@/templates/invoice-template';
import { toast } from 'sonner';
import { debounce } from 'lodash';

// Моковые данные шаблонов
const mockTemplates: Record<string, DocumentTemplate> = {
  '3': commercialOfferTemplate,
  'commercial-offer-kz': commercialOfferTemplate,
  'confidentiality-agreement': confidentialityAgreementTemplate,
  'service-agreement': serviceAgreementTemplate,
  'invoice': invoiceTemplate
};

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  // Состояние
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [templateData, setTemplateData] = useState<DocumentData>({
    templateId: templateId,
    variables: {},
    tableData: {}
  });
  
  // Загрузка шаблона
  useEffect(() => {
    const loadTemplate = async () => {
      setIsLoading(true);
      try {
        // В реальном приложении здесь будет API вызов
        const loadedTemplate = mockTemplates[templateId];
        
        if (!loadedTemplate) {
          toast.error('Шаблон не найден');
          router.push('/dashboard/templates');
          return;
        }
        
        setTemplate(loadedTemplate);
        
        // Конвертируем шаблон в точную копию документа как на картинке
        const slateContent = ExactDocumentConverter.convertToExactLayout(loadedTemplate, templateData);
        const slateString = JSON.stringify(slateContent);
        setEditorContent(slateString);
        
        toast.success('Шаблон загружен');
      } catch (error) {
        console.error('Ошибка загрузки шаблона:', error);
        toast.error('Ошибка загрузки шаблона');
      } finally {
        setIsLoading(false);
      }
    };

    if (templateId) {
      loadTemplate();
    }
  }, [templateId, router]);

  // Обработка изменений в редакторе
  const handleEditorChange = useCallback((content: string) => {
    setEditorContent(content);
  }, []);

  // Обработка вставки переменной в редактор
  const handleVariableInsert = useCallback((variableId: string) => {
    // Эта функция будет интегрирована с Slate редактором
    // Пока что просто показываем уведомление
    const variableText = `{{${variableId}}}`;
    
    try {
      // Получаем текущий контент редактора
      const currentContent = JSON.parse(editorContent);
      
      // Добавляем переменную в конец последнего параграфа
      if (currentContent.length > 0) {
        const lastNode = currentContent[currentContent.length - 1];
        if (lastNode.children && lastNode.children.length > 0) {
          const lastChild = lastNode.children[lastNode.children.length - 1];
          lastChild.text += ` ${variableText}`;
        }
      } else {
        // Создаем новый параграф с переменной
        currentContent.push({
          type: 'paragraph',
          children: [{ text: variableText }]
        });
      }
      
      setEditorContent(JSON.stringify(currentContent));
      toast.success(`Переменная ${variableText} добавлена в редактор`);
    } catch (error) {
      console.error('Ошибка вставки переменной:', error);
      toast.error('Ошибка вставки переменной');
    }
  }, [editorContent]);

  // Сохранение шаблона
  const handleSave = useCallback(async () => {
    if (!template) return;
    
    setIsSaving(true);
    try {
      // Конвертируем Slate содержимое обратно в шаблон
      const slateContent = JSON.parse(editorContent);
      const updatedTemplate = TemplateToSlateConverter.convertSlateToTemplate(slateContent, template);
      
      // В реальном приложении здесь будет API вызов
      console.log('Сохранение шаблона:', updatedTemplate);
      
      setTemplate(updatedTemplate);
      toast.success('Шаблон сохранен');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Ошибка сохранения шаблона');
    } finally {
      setIsSaving(false);
    }
  }, [template, editorContent]);

  // Предпросмотр документа
  const handlePreview = useCallback(() => {
    if (!template) return;
    
    try {
      const htmlContent = TemplateProcessor.processTemplateToHTML(template, templateData);
      const previewWindow = window.open('', '_blank');
      
      if (previewWindow) {
        previewWindow.document.write(`
          <!DOCTYPE html>
          <html lang="ru">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Предпросмотр - ${template.name}</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 20px; line-height: 1.4; }
              .document-template { max-width: 800px; margin: 0 auto; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
          </html>
        `);
        previewWindow.document.close();
      }
    } catch (error) {
      console.error('Ошибка предпросмотра:', error);
      toast.error('Ошибка создания предпросмотра');
    }
  }, [template, templateData]);

  // Создаем debounced функцию для обновления документа
  const debouncedUpdateDocument = useMemo(
    () => debounce((template: DocumentTemplate, newTemplateData: DocumentData) => {
      try {
        const slateContent = ExactDocumentConverter.convertWithData(template, newTemplateData);
        const slateString = JSON.stringify(slateContent);
        setEditorContent(slateString);
      } catch (error) {
        console.error('Ошибка автоматического обновления:', error);
      }
    }, 500), // Задержка в 500мс
    []
  );

  // Очистка debounced функции при размонтировании
  useEffect(() => {
    return () => {
      debouncedUpdateDocument.cancel();
    };
  }, [debouncedUpdateDocument]);

  // Обновление переменной шаблона с автоматическим обновлением документа
  const handleVariableChange = useCallback((variableId: string, value: string) => {
    const newTemplateData = {
      ...templateData,
      variables: {
        ...templateData.variables,
        [variableId]: value
      }
    };
    
    // Сначала обновляем состояние переменных (для мгновенного отображения в полях)
    setTemplateData(newTemplateData);
    
    // Затем отложенно обновляем документ
    if (template) {
      debouncedUpdateDocument(template, newTemplateData);
    }
  }, [template, templateData, debouncedUpdateDocument]);

  // Обновление содержимого с переменными
  const handleRefreshWithVariables = useCallback(() => {
    if (!template) return;
    
    try {
      // Используем конвертер с заполненными данными
      const slateContent = ExactDocumentConverter.convertWithData(template, templateData);
      const slateString = JSON.stringify(slateContent);
      setEditorContent(slateString);
      toast.success('Содержимое обновлено с переменными');
    } catch (error) {
      console.error('Ошибка обновления:', error);
      toast.error('Ошибка обновления содержимого');
    }
  }, [template, templateData]);

  // Мемоизированные данные
  const allVariables = useMemo(() => {
    if (!template) return [];
    return TemplateProcessor.extractAllVariables(template);
  }, [template]);

  const globalVariables = useMemo(() => {
    return Object.values(allVariables).filter(v => v.scope === 'global');
  }, [allVariables]);

  const sectionVariables = useMemo(() => {
    return Object.values(allVariables).filter(v => v.scope === 'section');
  }, [allVariables]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Загрузка шаблона...</span>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Шаблон не найден</h2>
          <p className="text-muted-foreground mb-4">
            Запрашиваемый шаблон не существует или был удален.
          </p>
          <Button onClick={() => router.push('/dashboard/templates')}>
            Вернуться к шаблонам
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Заголовок */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6">
          <div className="flex items-center space-x-4 flex-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/dashboard/templates')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h1 className="font-semibold">{template.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePreview}
            >
              <Eye className="w-4 h-4 mr-2" />
              Предпросмотр
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Сохранить
            </Button>
          </div>
        </div>
      </div>

      {/* Основное содержимое */}
      <div className="flex-1 flex">
        {/* Редактор */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b px-6">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger value="editor" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Редактор</span>
                </TabsTrigger>
                <TabsTrigger value="variables" className="flex items-center space-x-2">
                  <Variable className="w-4 h-4" />
                  <span>Переменные</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Настройки</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="editor" className="flex-1 m-0 p-0">
              <RichTextEditor
                value={editorContent}
                onChange={handleEditorChange}
                placeholder="Начните редактировать шаблон..."
              />
            </TabsContent>

            <TabsContent value="variables" className="flex-1 p-6 overflow-auto">
              <div className="max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Переменные шаблона</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefreshWithVariables}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Обновить редактор
                  </Button>
                </div>

                {globalVariables.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Основные переменные</CardTitle>
                      <CardDescription>
                        Заполните пустые поля для редактирования документа
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {globalVariables.map(variable => (
                        <div key={variable.id} className="space-y-2">
                          <Label className="flex items-center space-x-1">
                            <span>{variable.name}</span>
                            {variable.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          <Input
                            type={variable.type === 'email' ? 'email' : variable.type === 'phone' ? 'tel' : variable.type === 'number' ? 'number' : variable.type === 'date' ? 'date' : 'text'}
                            placeholder={variable.placeholder || `Введите ${variable.name.toLowerCase()}`}
                            value={templateData.variables[variable.id] || variable.defaultValue || ''}
                            onChange={(e) => handleVariableChange(variable.id, e.target.value)}
                          />
                          {variable.description && (
                            <p className="text-xs text-muted-foreground">
                              {variable.description}
                            </p>
                          )}
                          {/*<div className="text-xs text-muted-foreground font-mono">
                            {'{{' + variable.id + '}}'}
                          </div>*/}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {sectionVariables.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Дополнительные переменные</CardTitle>
                      <CardDescription>
                        Переменные для отдельных секций документа
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {sectionVariables.map(variable => (
                        <div key={variable.id} className="space-y-2">
                          <Label className="flex items-center space-x-1">
                            <span>{variable.name}</span>
                            {variable.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          <Input
                            type={variable.type === 'email' ? 'email' : variable.type === 'phone' ? 'tel' : variable.type === 'number' ? 'number' : variable.type === 'date' ? 'date' : 'text'}
                            placeholder={variable.placeholder || `Введите ${variable.name.toLowerCase()}`}
                            value={templateData.variables[variable.id] || variable.defaultValue || ''}
                            onChange={(e) => handleVariableChange(variable.id, e.target.value)}
                          />
                          {variable.description && (
                            <p className="text-xs text-muted-foreground">
                              {variable.description}
                            </p>
                          )}
                          {/*<div className="text-xs text-muted-foreground font-mono">
                            {'{{' + variable.id + '}}'}
                          </div>*/}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 p-6 overflow-auto">
              <div className="max-w-2xl space-y-6">
                <h3 className="text-lg font-semibold">Настройки шаблона</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Основная информация</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Название шаблона</Label>
                      <Input value={template.name} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Описание</Label>
                      <Input value={template.description} readOnly />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Статистика</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Переменных:</span>
                      <span className="text-sm font-medium">{template.variables.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Секций:</span>
                      <span className="text-sm font-medium">{template.sections.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Создан:</span>
                      <span className="text-sm font-medium">
                        {template.createdAt.toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Изменен:</span>
                      <span className="text-sm font-medium">
                        {template.updatedAt.toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Боковая панель с переменными */}
        {activeTab === 'editor' && (
          <div className="w-80 border-l bg-background">
            <TemplateVariablesPanel
              template={template}
              onVariableInsert={handleVariableInsert}
              onVariableChange={handleVariableChange}
              variableValues={Object.fromEntries(
                Object.entries(templateData.variables).map(([key, value]) => [
                  key,
                  typeof value === 'number' ? String(value) : value
                ])
              ) as Record<string, string>}
              className="h-full border-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
