import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Link, ExternalLink, Type, Globe, Copy, Share2, Settings, HelpCircle, Lock, Users, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LinkIcon from "@/components/icons/link-icon"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentTitle: string
  shareUrl: string | null
  isShareLinkPublic: boolean
  onUpdateShareSettings: (isPublic: boolean, role: 'viewer' | 'commenter' | 'editor') => void
  currentUserEmail: string
  currentUserName: string
  currentUserImage: string | null // Add this line
}

export function ShareDialog({
  open,
  onOpenChange,
  documentTitle,
  shareUrl,
  isShareLinkPublic,
  onUpdateShareSettings,
  currentUserEmail,
  currentUserName,
  currentUserImage,
}: ShareDialogProps) {
  const [accessLevel, setAccessLevel] = useState<'restricted' | 'anyone_with_link'>(
    isShareLinkPublic ? 'anyone_with_link' : 'restricted'
  )
  const [role, setRole] = useState<'viewer' | 'commenter' | 'editor'>('viewer') // Default to viewer
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setAccessLevel(isShareLinkPublic ? 'anyone_with_link' : 'restricted')
      setRole('viewer') // Reset role to viewer when opening
    }
  }, [open, isShareLinkPublic])

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      toast("Публичная ссылка на документ скопирована в буфер обмена.", {
        description: "Ссылка скопирована",
      })
    }
  }

  const handleSaveSettings = () => {
    const newIsPublic = accessLevel === 'anyone_with_link'
    onUpdateShareSettings(newIsPublic, role)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between text-xl font-semibold">
            <span>Поделиться "{documentTitle}"</span>
            {/* Removed Settings and HelpCircle icons */}
          </DialogTitle>
          <DialogDescription className="sr-only">Настройки доступа к документу.</DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-4 space-y-6">
          {/* People with access section */}
          <div className="space-y-4">
            <Input placeholder="Добавить коллабораторов" />
            <h3 className="text-md font-semibold">Люди с доступом</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={currentUserImage || ""} alt="Аватар пользователя" />
                  <AvatarFallback>{currentUserName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{currentUserName} (вы)</p>
                  <p className="text-sm text-muted-foreground">{currentUserEmail}</p>
                </div>
              </div>
              <Badge variant="outline">Владелец</Badge>
            </div>
          </div>

          <Separator />

          {/* General access section */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Общий доступ</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Removed duplicate globe/lock icon */}
                <div className="flex flex-col">
                  <Select value={accessLevel} onValueChange={(value: 'restricted' | 'anyone_with_link') => setAccessLevel(value)}>
                    <SelectTrigger className="w-[200px] border-none shadow-none h-auto p-0 focus:ring-0">
                      <SelectValue placeholder="Выберите уровень доступа" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restricted">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Ограниченный доступ
                        </div>
                      </SelectItem>
                      <SelectItem value="anyone_with_link">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Все, у кого есть ссылка
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {accessLevel === 'restricted'
                      ? "Только люди с доступом могут открыть по ссылке"
                      : "Любой в интернете, у кого есть ссылка, может просматривать"}
                  </p>
                </div>
              </div>
              {accessLevel === 'anyone_with_link' && (
                <Select value={role} onValueChange={(value: 'viewer' | 'commenter' | 'editor') => setRole(value)}>
                  <SelectTrigger className="w-[120px] border-none shadow-none h-auto p-0 focus:ring-0">
                    <SelectValue placeholder="Роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Просмотр</SelectItem>
                    <SelectItem value="commenter">Комментирование</SelectItem>
                    <SelectItem value="editor">Редактирование</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between p-6 pt-0">
          <Button variant="outline" onClick={handleCopyLink} disabled={!shareUrl}>
            <LinkIcon className="h-4 w-4 mr-2" />
            Скопировать ссылку
          </Button>
          <Button onClick={handleSaveSettings}>Готово</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 