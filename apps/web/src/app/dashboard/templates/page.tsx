"use client";

import { useState } from "react";
import { Search, MoreHorizontal, FileText, ChevronDown, Trash2, RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation"; // Import useRouter
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Template {
  id: string;
  name: string;
  documents: number;
  status: "Черновик" | "Опубликован";
  lastModified: string;
  // filepath?: string; // Removed filepath property
}

const mockTemplates: Template[] = [
  {
    id: "contract_for_services",
    name: "Договор оказания услуг",
    documents: 12,
    status: "Опубликован",
    lastModified: "15 дек 2023, 14:30",
  },
  {
    id: "avr",
    name: "Акт выполненных работ",
    documents: 8,
    status: "Черновик",
    lastModified: "14 дек 2023, 16:15",
    // filepath: "templates/avr.md", // Removed filepath
  },
  {
    id: "commercial_offer",
    name: "Коммерческое предложение",
    documents: 15,
    status: "Опубликован",
    lastModified: "13 дек 2023, 10:45",
  },
  {
    id: "invoice",
    name: "Счет на оплату",
    documents: 6,
    status: "Черновик",
    lastModified: "12 дек 2023, 15:20",
  },
  {
    id: "nda",
    name: "Соглашение о конфиденциальности",
    documents: 9,
    status: "Опубликован",
    lastModified: "11 дек 2023, 13:10",
  },
];

export default function TemplatesDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [deletedTemplates, setDeletedTemplates] = useState<Template[]>([]);
  const router = useRouter(); // Initialize useRouter

  const moveToTrash = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setDeletedTemplates(prev => [...prev, template]);
    }
  };

  const restoreFromTrash = (templateId: string) => {
    const template = deletedTemplates.find(t => t.id === templateId);
    if (template) {
      setDeletedTemplates(prev => prev.filter(t => t.id !== templateId));
      setTemplates(prev => [...prev, template]);
    }
  };

  const permanentDelete = (templateId: string) => {
    setDeletedTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "draft" && template.status === "Черновик") ||
      (statusFilter === "published" && template.status === "Опубликован");
    return matchesSearch && matchesStatus;
  });

  const filteredDeletedTemplates = deletedTemplates.filter((template) => {
    return template.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const getStatusBadgeVariant = (status: string) => {
    return status === "Опубликован" ? "default" : "secondary";
  };

  return (
    <div className="w-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">Главная</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">Шаблоны</span>
        </div>
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Новый шаблон
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
          <TabsTrigger
            value="all"
            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 font-medium text-sm transition-all duration-300 ease-in-out"
          >
            Все ({templates.length})
          </TabsTrigger>
          <TabsTrigger
            value="trash"
            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 font-medium text-sm transition-all duration-300 ease-in-out"
          >
            Корзина ({deletedTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {/* Search and Filter Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Поиск по названию шаблона..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-input"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-card border-input">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="published" className="[&>span]:!text-green-700">
                  <span style={{ color: '#15803d' }}>Опубликован</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Templates Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Название шаблона
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Документы
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Статус
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Последнее изменение
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground w-12">
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTemplates.map((template, index) => (
                    <tr
                      key={template.id}
                      className={`border-t border-border hover:bg-muted/20 transition-colors cursor-pointer ${
                        index === filteredTemplates.length - 1 ? "" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-foreground">
                            {template.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {template.documents}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={getStatusBadgeVariant(template.status)}
                          className={
                            template.status === "Опубликован"
                              ? "bg-green-50 text-green-700 hover:bg-green-50"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                          }
                        >
                          {template.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {template.lastModified}
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-8 h-8 p-0 hover:bg-muted"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => {
                              // if (template.filepath) {
                              router.push(`/dashboard/editor?templateId=${template.id}&templateName=${encodeURIComponent(template.name)}`);
                              // }
                            }}>Редактировать</DropdownMenuItem>
                            <DropdownMenuItem>Дублировать</DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => moveToTrash(template.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">
                  Шаблоны не найдены
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Попробуйте изменить критерии поиска или фильтра."
                    : "Начните с создания вашего первого шаблона."}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trash" className="mt-6">
          {/* Search for deleted templates */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Поиск удаленных шаблонов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-input"
              />
            </div>
          </div>

          {deletedTemplates.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Trash2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">Корзина пуста</h3>
              <p className="text-sm text-muted-foreground">
                Удаленные шаблоны будут отображаться здесь для восстановления.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Название шаблона
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Документы
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Статус
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Последнее изменение
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground w-12">
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeletedTemplates.map((template, index) => (
                      <tr
                        key={template.id}
                        className={`border-t border-border hover:bg-muted/20 transition-colors cursor-pointer ${
                          index === filteredDeletedTemplates.length - 1 ? "" : ""
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-50 rounded-md flex items-center justify-center">
                              <FileText className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="font-medium text-foreground opacity-60">
                              {template.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {template.documents}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className="opacity-60"
                          >
                            {template.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {template.lastModified}
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-8 h-8 p-0 hover:bg-muted"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => restoreFromTrash(template.id)}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Восстановить
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => permanentDelete(template.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Удалить навсегда
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}