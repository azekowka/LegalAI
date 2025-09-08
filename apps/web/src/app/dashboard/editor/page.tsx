"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { markdownToSlate } from "@/lib/markdown-to-slate";
import { RichTextEditor } from "@/components/rich-text-editor";
import { type Descendant } from 'slate';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface WorkRow {
  id: string;
  work_name: string;
  work_date: string;
  report_details: string;
  unit_of_measurement: string;
  quantity: string;
  price_per_unit: string;
  cost: string;
  vat_kzt: string;
}

// Mapping for placeholders to their Russian labels and example texts
const placeholderMap: Record<string, { label: string; placeholder: string }> = {
  customer_full_details: { label: "Полное наименование, адрес, данные о средствах связи заказчика", placeholder: "ТОО \"Excellence\", ул. Кабанбай Батыра, 60, +77072323232" },
  customer_iin_bin: { label: "ИИН/БИН заказчика", placeholder: "210323232232" },
  performer_full_details: { label: "Полное наименование, адрес, данные о средствах связи исполнителя", placeholder: "ТОО \"Example\", ул. Достык, 50, +77011234567" },
  performer_iin_bin: { label: "ИИН/БИН исполнителя", placeholder: "210323232232" },
  contract_info: { label: "Информация о договоре", placeholder: "Договор #550 от 25.12.2022г." },
  document_number: { label: "Номер документа", placeholder: "355" },
  compilation_date: { label: "Дата составления", placeholder: "25.02.2023" },
  inventory_details: { label: "Наименование, количество, стоимость", placeholder: "" },
  attachment_pages_count: { label: "Кол-во страниц в приложении", placeholder: "11" },
  attachment_documents_list: { label: "Перечень документов в приложении", placeholder: "1. Справка, 2. Отчет" },
  performer_position: { label: "Исполнитель - должность", placeholder: "Главный бухгалтер" },
  performer_full_name: { label: "Исполнитель - ФИО", placeholder: "Азаматов Азамат Азаматович" },
  customer_position: { label: "Заказчик - должность", placeholder: "Главный директор" },
  customer_full_name: { label: "Заказчик - ФИО", placeholder: "Бауыржанов Бауыржан Бауыржанович" },
  signing_date: { label: "Дата подписания", placeholder: "16.03.2023" },

  // For work rows, we'll use the keys directly in the loop, but here's for completeness
  work_name: { label: "Наименование работ", placeholder: "Услуги" },
  work_date: { label: "Дата работ", placeholder: "21.03.2023" },
  report_details: { label: "Сведения об отчете", placeholder: "" },
  unit_of_measurement: { label: "Ед. измерения", placeholder: "" },
  quantity: { label: "Кол-во", placeholder: "1" },
  price_per_unit: { label: "Цена за единицу", placeholder: "70 000" },
  cost: { label: "Стоимость", placeholder: "70 000" },
  vat_kzt: { label: "НДС, в KZT", placeholder: "7 460" },

  // Total fields
  total_quantity: { label: "Итого - Кол-во", placeholder: "X" },
  total_cost: { label: "Итого - Стоимость", placeholder: "70 000" },
  total_vat_kzt: { label: "Итого - НДС, в KZT", placeholder: "7 460" },
};

export default function EditorPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId"); // Get templateId
  const templateName = searchParams.get("templateName"); // Get templateName
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [slateContent, setSlateContent] = useState<Descendant[]>([{ type: "paragraph", children: [{ text: "" }] }]);
  const [error, setError] = useState<string | null>(null);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [workRowsData, setWorkRowsData] = useState<WorkRow[]>([{
    id: "1",
    work_name: "",
    work_date: "",
    report_details: "",
    unit_of_measurement: "",
    quantity: "",
    price_per_unit: "",
    cost: "",
    vat_kzt: "",
  }]);

  useEffect(() => {
    if (templateId) {
      const fetchMarkdown = async () => {
        try {
          const response = await fetch(`/api/read-template?templateId=${templateId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.statusText}`);
          }
          const data = await response.text();
          setMarkdownContent(data);

          const placeholderRegex = /{{\s*([^}]+?)\s*}}/g;
          const matches = [...data.matchAll(placeholderRegex)];
          const extractedPlaceholders = Array.from(new Set(matches.map(match => match[1])));
          setPlaceholders(extractedPlaceholders.filter(p => !p.startsWith("work_name_") && p !== "works_table_rows"));

          const initialFormData: Record<string, string> = {};
          extractedPlaceholders.forEach(placeholder => {
            if (!placeholder.startsWith("work_name_") && placeholder !== "works_table_rows") {
              initialFormData[placeholder] = "";
            }
          });
          setFormData(initialFormData);

          const convertedSlate = markdownToSlate(data);
          const aligned = alignHeaderRight(convertedSlate);
          setSlateContent(aligned);

        } catch (err: any) {
          setError(err.message);
        }
      };
      fetchMarkdown();
    } else {
      setError("Не указан ID шаблона.");
    }
  }, [templateId]);

  // Function to apply placeholders to markdown content
  const applyPlaceholders = (mdContent: string, data: Record<string, string>): string => {
    let updatedMd = mdContent;
    for (const field in data) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        const value = data[field];
        updatedMd = updatedMd.replace(new RegExp(`{{\s*${field}\s*}}`, 'g'), value);
      }
    }

    // Handle dynamic work rows
    if (workRowsData.length > 0) {
      let workRowsMarkdown = "";
      // Add table header row with separator for Markdown table rendering
      workRowsMarkdown += `| № | Наименование работ | Дата выполнения работ | Сведения об отчете | Ед. измерения | Кол-во | Цена за ед. | Стоимость | НДС, в KZT |\n`;
      workRowsMarkdown += `|---|---|---|---|---|---|---|---|---|\n`;

      workRowsData.forEach((row, index) => {
        workRowsMarkdown += `| ${index + 1} | ${row.work_name || ''} | ${row.work_date || ''} | ${row.report_details || ''} | ${row.unit_of_measurement || ''} | ${row.quantity || ''} | ${row.price_per_unit || ''} | ${row.cost || ''} | ${row.vat_kzt || ''} |\n`;
      });
      updatedMd = updatedMd.replace(/{{works_table_rows}}/g, workRowsMarkdown);
    } else {
      // If no rows, replace with empty string or just the table header if preferred
      updatedMd = updatedMd.replace(/{{works_table_rows}}/g, ''); 
    }

    return updatedMd;
  };

  // Align initial header block (until the line 'Заказчик') to the right without changing plain text
  const alignHeaderRight = (nodes: Descendant[]): Descendant[] => {
    try {
      const result: Descendant[] = JSON.parse(JSON.stringify(nodes));
      let reachedCustomer = false;
      for (const node of result as any[]) {
        if (reachedCustomer) break;
        if (node.type === 'paragraph' && Array.isArray(node.children)) {
          const textContent = node.children.map((c: any) => c.text ?? '').join('');
          if (textContent.trim() === 'Заказчик') {
            reachedCustomer = true;
            break;
          }
          // Right-align non-empty header paragraphs
          if (textContent.trim().length > 0) {
            (node as any).align = 'right';
          }
        }
      }
      return result;
    } catch {
      return nodes;
    }
  };

  // Effect to update slateContent when formData, markdownContent or workRowsData changes
  useEffect(() => {
    if (markdownContent) {
      const filledMarkdown = applyPlaceholders(markdownContent, formData);
      console.log("Filled Markdown:", filledMarkdown); // Log the markdown after placeholders
      const convertedSlate = markdownToSlate(filledMarkdown);
      console.log("Converted Slate JSON:", JSON.stringify(convertedSlate, null, 2)); // Log the Slate JSON
      const aligned = alignHeaderRight(convertedSlate);
      setSlateContent(aligned);
    }
  }, [formData, markdownContent, workRowsData]);

  // Function to handle changes in input fields (for general placeholders)
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Function to handle changes in work row input fields
  const handleWorkRowChange = (id: string, field: keyof WorkRow, value: string) => {
    setWorkRowsData(prev =>
      prev.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // Function to add a new work row
  const handleAddRow = () => {
    setWorkRowsData(prev => [
      ...prev,
      {
        id: (prev.length + 1).toString(), // Simple ID generation for now
        work_name: "",
        work_date: "",
        report_details: "",
        unit_of_measurement: "",
        quantity: "",
        price_per_unit: "",
        cost: "",
        vat_kzt: "",
      },
    ]);
  };

  // Function to remove a work row
  const handleRemoveRow = (id: string) => {
    setWorkRowsData(prev => prev.filter(row => row.id !== id));
  };

  if (error) {
    return <div className="p-4 text-red-500">Ошибка: {error}</div>;
  }

  if (!templateId) {
    return <div className="p-4">Выберите шаблон для редактирования.</div>;
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">{templateName || "Редактор шаблона"}</h1>
        {/* <p>Путь к файлу: {filepath}</p> */}
        <RichTextEditor 
          value={JSON.stringify(slateContent)} 
          onChange={(newValue) => setSlateContent(JSON.parse(newValue))}
          readOnly={false}
        />
      </div>
      <div className="w-80 border-l border-gray-200 p-4 bg-gray-50">
        <h2 className="text-xl font-bold mb-4">Переменные данные</h2>
        <p className="text-sm text-gray-500 text-muted-foreground mb-4">
          Заполните обязательные поля перед отправкой документа
        </p>
        <div className="space-y-6 mt-4">
          {/* Отправитель Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Отправитель</h3>
            {placeholders.includes("performer_full_details") && (
              <div>
                <Label htmlFor="performer_full_details" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.performer_full_details.label}
                </Label>
                <Input
                  id="performer_full_details"
                  value={formData.performer_full_details || ""}
                  onChange={(e) => handleInputChange("performer_full_details", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.performer_full_details.placeholder}
                />
              </div>
            )}
            {placeholders.includes("performer_iin_bin") && (
              <div>
                <Label htmlFor="performer_iin_bin" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.performer_iin_bin.label}
                </Label>
                <Input
                  id="performer_iin_bin"
                  value={formData.performer_iin_bin || ""}
                  onChange={(e) => handleInputChange("performer_iin_bin", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.performer_iin_bin.placeholder}
                />
              </div>
            )}
          </div>

          {/* Информация о договоре Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Информация о договоре</h3>
            {placeholders.includes("contract_info") && (
              <div>
                <Label htmlFor="contract_info" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.contract_info.label}
                </Label>
                <Input
                  id="contract_info"
                  value={formData.contract_info || ""}
                  onChange={(e) => handleInputChange("contract_info", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.contract_info.placeholder}
                />
              </div>
            )}
            {placeholders.includes("document_number") && (
              <div>
                <Label htmlFor="document_number" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.document_number.label}
                </Label>
                <Input
                  id="document_number"
                  value={formData.document_number || ""}
                  onChange={(e) => handleInputChange("document_number", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.document_number.placeholder}
                />
              </div>
            )}
            {placeholders.includes("compilation_date") && (
              <div>
                <Label htmlFor="compilation_date" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.compilation_date.label}
                </Label>
                <Input
                  id="compilation_date"
                  value={formData.compilation_date || ""}
                  onChange={(e) => handleInputChange("compilation_date", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.compilation_date.placeholder}
                />
              </div>
            )}
          </div>

          {/* Выполненные работы Section */}
          <h3 className="text-lg font-bold mt-8 mb-4">Выполненные работы</h3>
          {workRowsData.map((row, rowIndex) => (
            <div key={row.id} className="border p-3 rounded-md bg-white shadow-sm mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-sm">Строка #{rowIndex + 1}</h4>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveRow(row.id)}
                  className="h-7 w-7 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {(Object.keys(row) as Array<keyof WorkRow>).filter(key => key !== "id").map(key => (
                  <div key={`${row.id}-${key}`}>
                    <Label htmlFor={`${row.id}-${key}`} className="mb-1 block text-xs font-medium text-gray-600">
                      {placeholderMap[key]?.label || key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <Input
                      id={`${row.id}-${key}`}
                      value={row[key]}
                      onChange={(e) => handleWorkRowChange(row.id, key, e.target.value)}
                      className="w-full text-sm"
                      placeholder={placeholderMap[key]?.placeholder || ""}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button onClick={handleAddRow} className="w-full mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Добавить строку
          </Button>

          {/* Итого Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Итого</h3>
            {placeholders.includes("total_quantity") && (
              <div>
                <Label htmlFor="total_quantity" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.total_quantity.label}
                </Label>
                <Input
                  id="total_quantity"
                  value={formData.total_quantity || ""}
                  onChange={(e) => handleInputChange("total_quantity", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.total_quantity.placeholder}
                />
              </div>
            )}
            {placeholders.includes("total_cost") && (
              <div>
                <Label htmlFor="total_cost" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.total_cost.label}
                </Label>
                <Input
                  id="total_cost"
                  value={formData.total_cost || ""}
                  onChange={(e) => handleInputChange("total_cost", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.total_cost.placeholder}
                />
              </div>
            )}
            {placeholders.includes("total_vat_kzt") && (
              <div>
                <Label htmlFor="total_vat_kzt" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.total_vat_kzt.label}
                </Label>
                <Input
                  id="total_vat_kzt"
                  value={formData.total_vat_kzt || ""}
                  onChange={(e) => handleInputChange("total_vat_kzt", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.total_vat_kzt.placeholder}
                />
              </div>
            )}
          </div>

          {/* Сведения об использовании запасов Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Сведения об использовании запасов, полученных от заказчика</h3>
            {placeholders.includes("inventory_details") && (
              <div>
                <Label htmlFor="inventory_details" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.inventory_details.label}
                </Label>
                <Input
                  id="inventory_details"
                  value={formData.inventory_details || ""}
                  onChange={(e) => handleInputChange("inventory_details", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.inventory_details.placeholder}
                />
              </div>
            )}
          </div>

          {/* Приложение Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Приложение</h3>
            {placeholders.includes("attachment_pages_count") && (
              <div>
                <Label htmlFor="attachment_pages_count" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.attachment_pages_count.label}
                </Label>
                <Input
                  id="attachment_pages_count"
                  value={formData.attachment_pages_count || ""}
                  onChange={(e) => handleInputChange("attachment_pages_count", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.attachment_pages_count.placeholder}
                />
              </div>
            )}
            {placeholders.includes("attachment_documents_list") && (
              <div>
                <Label htmlFor="attachment_documents_list" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.attachment_documents_list.label}
                </Label>
                <Input
                  id="attachment_documents_list"
                  value={formData.attachment_documents_list || ""}
                  onChange={(e) => handleInputChange("attachment_documents_list", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.attachment_documents_list.placeholder}
                />
              </div>
            )}
          </div>

          {/* Сдал (Исполнитель) Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Сдал (Исполнитель)</h3>
            {placeholders.includes("performer_position") && (
              <div>
                <Label htmlFor="performer_position" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.performer_position.label}
                </Label>
                <Input
                  id="performer_position"
                  value={formData.performer_position || ""}
                  onChange={(e) => handleInputChange("performer_position", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.performer_position.placeholder}
                />
              </div>
            )}
            {placeholders.includes("performer_full_name") && (
              <div>
                <Label htmlFor="performer_full_name" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.performer_full_name.label}
                </Label>
                <Input
                  id="performer_full_name"
                  value={formData.performer_full_name || ""}
                  onChange={(e) => handleInputChange("performer_full_name", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.performer_full_name.placeholder}
                />
              </div>
            )}
          </div>

          {/* Принял (Заказчик) Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Принял (Заказчик)</h3>
            {placeholders.includes("customer_position") && (
              <div>
                <Label htmlFor="customer_position" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.customer_position.label}
                </Label>
                <Input
                  id="customer_position"
                  value={formData.customer_position || ""}
                  onChange={(e) => handleInputChange("customer_position", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.customer_position.placeholder}
                />
              </div>
            )}
            {placeholders.includes("customer_full_name") && (
              <div>
                <Label htmlFor="customer_full_name" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.customer_full_name.label}
                </Label>
                <Input
                  id="customer_full_name"
                  value={formData.customer_full_name || ""}
                  onChange={(e) => handleInputChange("customer_full_name", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.customer_full_name.placeholder}
                />
              </div>
            )}
          </div>

          {/* Дата подписания Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Дата подписания</h3>
            {placeholders.includes("signing_date") && (
              <div>
                <Label htmlFor="signing_date" className="mb-1 block text-sm font-medium text-gray-700">
                  {placeholderMap.signing_date.label}
                </Label>
                <Input
                  id="signing_date"
                  value={formData.signing_date || ""}
                  onChange={(e) => handleInputChange("signing_date", e.target.value)}
                  className="w-full"
                  placeholder={placeholderMap.signing_date.placeholder}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
