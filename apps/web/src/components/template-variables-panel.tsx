'use client';

import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  Search, 
  Variable, 
  ChevronDown, 
  ChevronRight,
  Info
} from 'lucide-react';
import { DocumentTemplate, TemplateVariable } from '../types/template';
import TemplateProcessor from '../lib/template-processor';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { toast } from 'sonner';

interface TemplateVariablesPanelProps {
  template: DocumentTemplate;
  onVariableInsert?: (variableId: string) => void;
  onVariableChange?: (variableId: string, value: string) => void;
  variableValues?: Record<string, string>;
  className?: string;
}

export const TemplateVariablesPanel: React.FC<TemplateVariablesPanelProps> = ({
  template,
  onVariableInsert,
  onVariableChange,
  variableValues = {},
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [globalVariablesOpen, setGlobalVariablesOpen] = useState(true);
  const [sectionVariablesOpen, setSectionVariablesOpen] = useState(true);

  // Получение всех переменных
  const allVariables = TemplateProcessor.extractAllVariables(template);
  const globalVariables = Object.values(allVariables).filter(v => v.scope === 'global');
  const sectionVariables = Object.values(allVariables).filter(v => v.scope === 'section');

  // Фильтрация переменных по поисковому запросу
  const filteredGlobalVariables = globalVariables.filter(variable =>
    variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSectionVariables = sectionVariables.filter(variable =>
    variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Вставка переменной (больше не используется напрямую, но сохранена как заглушка)
  const handleVariableClick = useCallback((variableId: string) => {
    if (onVariableInsert) {
      onVariableInsert(variableId);
    } else {
      // Копирование в буфер обмена как fallback
      const variableText = `{{${variableId}}}`;
      navigator.clipboard.writeText(variableText);
      toast.success(`Переменная ${variableText} скопирована в буфер обмена`);
    }
  }, [onVariableInsert]);

  // Рендер переменной с полем ввода
  const renderVariable = (variable: TemplateVariable & { scope?: string }) => (
    <div
      key={variable.id}
      className="p-3 border border-border rounded-lg space-y-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm truncate">
              {variable.name}
              {variable.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </span>
          </div>
        </div>
      </div>
      
      {/* Поле ввода */}
      <div className="space-y-1">
        <Input
          type={variable.type === 'email' ? 'email' : variable.type === 'phone' ? 'tel' : variable.type === 'number' ? 'number' : variable.type === 'date' ? 'date' : 'text'}
          placeholder={variable.placeholder || `Введите ${variable.name.toLowerCase()}`}
          value={variableValues[variable.id] || variable.defaultValue || ''}
          onChange={(e) => {
            if (onVariableChange) {
              onVariableChange(variable.id, e.target.value);
            }
          }}
          className="text-sm"
        />
        
        {variable.description && (
          <p className="text-xs text-muted-foreground">
            {variable.description}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Variable className="w-5 h-5" />
          <div className="flex-1">
            <CardTitle className="text-base">Переменные данные</CardTitle>
            <CardDescription>
              Заполните обязательные поля перед отправкой документа
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Поиск переменных..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Информационное сообщение */}
        {/*<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-900">
                Заполните обязательные поля
              </p>
            </div>
          </div>
        </div> */}

        <ScrollArea className="h-96">
          <div className="space-y-4">
            {/* Глобальные переменные */}
            {filteredGlobalVariables.length > 0 && (
              <Collapsible open={globalVariablesOpen} onOpenChange={setGlobalVariablesOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <div className="flex items-center space-x-2">
                      {globalVariablesOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <span className="font-medium">
                        Основные данные ({filteredGlobalVariables.length})
                      </span>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-3">
                  {filteredGlobalVariables.map(renderVariable)}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Переменные секций */}
            {filteredSectionVariables.length > 0 && (
              <>
                {filteredGlobalVariables.length > 0 && <Separator />}
                <Collapsible open={sectionVariablesOpen} onOpenChange={setSectionVariablesOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center space-x-2">
                        {sectionVariablesOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <span className="font-medium">
                          Дополнительные данные ({filteredSectionVariables.length})
                        </span>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-3">
                    {filteredSectionVariables.map(renderVariable)}
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}

            {/* Сообщение об отсутствии результатов */}
            {searchTerm && filteredGlobalVariables.length === 0 && filteredSectionVariables.length === 0 && (
              <div className="text-center py-8">
                <Variable className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Переменные не найдены
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Попробуйте изменить поисковый запрос
                </p>
              </div>
            )}

            {/* Сообщение об отсутствии переменных */}
            {!searchTerm && globalVariables.length === 0 && sectionVariables.length === 0 && (
              <div className="text-center py-8">
                <Variable className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  В шаблоне нет переменных
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Переменные позволяют создавать динамические документы
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Статистика */}
        <div className="border-t pt-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Всего переменных: {globalVariables.length + sectionVariables.length}</span>
          <span>Обязательных <span className="text-red-500">*</span>: {[...globalVariables, ...sectionVariables].filter(v => v.required).length}</span>
        </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateVariablesPanel;
