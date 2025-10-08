'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Plus, Trash2, Save, FileText, Eye } from 'lucide-react';
import { DocumentTemplate, TemplateVariable, DocumentData, TableRow } from '../types/template';
import TemplateProcessor from '../lib/template-processor';
import { useToast } from './ui/use-toast';

interface TemplateFormProps {
  template: DocumentTemplate;
  initialData?: DocumentData;
  onSave: (data: DocumentData) => void;
  onPreview: (html: string) => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  initialData,
  onSave,
  onPreview
}) => {
  const [activeTab, setActiveTab] = useState('variables');
  const [tableData, setTableData] = useState<Record<string, TableRow[]>>(
    initialData?.tableData || {}
  );
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: initialData?.variables || {}
  });

  const watchedValues = watch();

  // Получение всех переменных из шаблона
  const allVariables = TemplateProcessor.extractAllVariables(template);
  const globalVariables = Object.values(allVariables).filter(v => v.scope === 'global');
  const sectionVariables = Object.values(allVariables).filter(v => v.scope === 'section');

  const onSubmit = useCallback((data: Record<string, any>) => {
    const documentData: DocumentData = {
      templateId: template.id,
      variables: data,
      tableData
    };

    // Валидация
    const errors = TemplateProcessor.validateTemplateData(template, documentData);
    if (errors.length > 0) {
      toast.error('Ошибки валидации:\n' + errors.join('\n'));
      return;
    }

    onSave(documentData);
  }, [template, tableData, onSave, toast]);

  const handlePreview = useCallback(() => {
    const documentData: DocumentData = {
      templateId: template.id,
      variables: watchedValues,
      tableData
    };

    const html = TemplateProcessor.processTemplateToHTML(template, documentData);
    onPreview(html);
  }, [template, watchedValues, tableData, onPreview]);

  const renderVariableInput = (variable: TemplateVariable) => {
    const fieldName = variable.id;
    const isRequired = variable.required;

    switch (variable.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="flex items-center gap-1">
              {variable.name}
              {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={fieldName}
              type={variable.type === 'email' ? 'email' : variable.type === 'phone' ? 'tel' : 'text'}
              placeholder={variable.placeholder}
              {...register(fieldName, { 
                required: isRequired ? `${variable.name} обязательно для заполнения` : false 
              })}
              className={errors[fieldName] ? 'border-red-500' : ''}
            />
            {variable.description && (
              <p className="text-sm text-muted-foreground">{variable.description}</p>
            )}
            {errors[fieldName] && (
              <p className="text-sm text-red-500">{errors[fieldName]?.message}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="flex items-center gap-1">
              {variable.name}
              {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={fieldName}
              type="number"
              placeholder={variable.placeholder}
              {...register(fieldName, { 
                required: isRequired ? `${variable.name} обязательно для заполнения` : false,
                valueAsNumber: true
              })}
              className={errors[fieldName] ? 'border-red-500' : ''}
            />
            {variable.description && (
              <p className="text-sm text-muted-foreground">{variable.description}</p>
            )}
            {errors[fieldName] && (
              <p className="text-sm text-red-500">{errors[fieldName]?.message}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="flex items-center gap-1">
              {variable.name}
              {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={fieldName}
              type="date"
              {...register(fieldName, { 
                required: isRequired ? `${variable.name} обязательно для заполнения` : false 
              })}
              className={errors[fieldName] ? 'border-red-500' : ''}
            />
            {variable.description && (
              <p className="text-sm text-muted-foreground">{variable.description}</p>
            )}
            {errors[fieldName] && (
              <p className="text-sm text-red-500">{errors[fieldName]?.message}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="flex items-center gap-1">
              {variable.name}
              {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Select 
              onValueChange={(value) => setValue(fieldName, value)}
              defaultValue={variable.defaultValue}
            >
              <SelectTrigger className={errors[fieldName] ? 'border-red-500' : ''}>
                <SelectValue placeholder={variable.placeholder || 'Выберите значение'} />
              </SelectTrigger>
              <SelectContent>
                {variable.options?.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {variable.description && (
              <p className="text-sm text-muted-foreground">{variable.description}</p>
            )}
            {errors[fieldName] && (
              <p className="text-sm text-red-500">{errors[fieldName]?.message}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderTableEditor = (section: any) => {
    if (!section.tableColumns || !section.tableRows) return null;

    const sectionTableData = tableData[section.id] || section.tableRows;

    const addRow = () => {
      const newRow: TableRow = {
        id: `row-${Date.now()}`,
        ...section.tableColumns.reduce((acc: any, col: any) => {
          acc[col.id] = col.type === 'number' ? 0 : '';
          return acc;
        }, {})
      };

      setTableData(prev => ({
        ...prev,
        [section.id]: [...sectionTableData, newRow]
      }));
    };

    const removeRow = (rowId: string) => {
      setTableData(prev => ({
        ...prev,
        [section.id]: sectionTableData.filter(row => row.id !== rowId)
      }));
    };

    const updateRow = (rowId: string, columnId: string, value: string | number) => {
      setTableData(prev => ({
        ...prev,
        [section.id]: sectionTableData.map(row => 
          row.id === rowId ? { ...row, [columnId]: value } : row
        )
      }));
    };

    return (
      <Card key={section.id} className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{section.content}</CardTitle>
          <CardDescription>
            Редактирование таблицы данных
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    {section.tableColumns.map((col: any) => (
                      <th key={col.id} className="border border-gray-300 p-2 text-left">
                        {col.name}
                      </th>
                    ))}
                    <th className="border border-gray-300 p-2 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionTableData.map((row: TableRow, rowIndex: number) => (
                    <tr key={row.id}>
                      {section.tableColumns.map((col: any) => (
                        <td key={col.id} className="border border-gray-300 p-2">
                          {col.editable !== false ? (
                            <Input
                              type={col.type === 'number' || col.type === 'currency' ? 'number' : 'text'}
                              value={row[col.id] || ''}
                              onChange={(e) => {
                                const value = col.type === 'number' || col.type === 'currency' 
                                  ? parseFloat(e.target.value) || 0 
                                  : e.target.value;
                                updateRow(row.id, col.id, value);
                              }}
                              className="w-full"
                            />
                          ) : (
                            <span className="text-gray-600">
                              {col.type === 'number' ? rowIndex + 1 : row[col.id]}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="border border-gray-300 p-2 text-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeRow(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button type="button" onClick={addRow} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Добавить строку
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
        <p className="text-muted-foreground">{template.description}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="variables">Переменные</TabsTrigger>
            <TabsTrigger value="tables">Таблицы</TabsTrigger>
            <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
          </TabsList>

          <TabsContent value="variables" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основные данные</CardTitle>
                <CardDescription>
                  Заполните основную информацию для документа
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {globalVariables.map(variable => renderVariableInput(variable))}
              </CardContent>
            </Card>

            {sectionVariables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Дополнительные параметры</CardTitle>
                  <CardDescription>
                    Специфичные параметры для отдельных секций документа
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sectionVariables.map(variable => renderVariableInput(variable))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tables" className="space-y-6">
            {template.sections
              .filter(section => section.type === 'table')
              .map(section => renderTableEditor(section))
            }
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Предпросмотр документа</CardTitle>
                <CardDescription>
                  Просмотрите как будет выглядеть готовый документ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button type="button" onClick={handlePreview} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Обновить предпросмотр
                  </Button>
                </div>
                <div 
                  className="border rounded-lg p-6 bg-white min-h-96"
                  dangerouslySetInnerHTML={{ 
                    __html: TemplateProcessor.processTemplateToHTML(template, {
                      templateId: template.id,
                      variables: watchedValues,
                      tableData
                    })
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Все обязательные поля должны быть заполнены
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Предпросмотр
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Сохранить документ
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TemplateForm;
