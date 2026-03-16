import type { LucideIcon } from 'lucide-react'
import {
  Brain,
  CheckCircle2,
  FileText,
  FolderOpen,
  Globe,
  History,
  Search,
  Sparkles,
  Tag,
  Wand2,
  Zap,
} from 'lucide-react'

export function getContentIcon(icon: string | null | undefined): LucideIcon {
  switch (icon) {
    case 'search':
      return Search
    case 'zap':
      return Zap
    case 'folder':
      return FolderOpen
    case 'history':
      return History
    case 'globe':
      return Globe
    case 'brain':
      return Brain
    case 'file-text':
      return FileText
    case 'tag':
      return Tag
    case 'wand-2':
      return Wand2
    case 'check-circle-2':
      return CheckCircle2
    default:
      return Sparkles
  }
}
