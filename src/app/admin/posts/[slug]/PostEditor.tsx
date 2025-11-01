"use client"

import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Code as CodeIcon,
  Hash,
  Image as ImageIcon,
  Link2,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Check as CheckIconRadix,
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  MoreVertical,
} from "lucide-react"

// 引入 markdown 样式
import "@/app/style/markdown.css"

// Toast 提示
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

// ===== BlockNote =====
import "@blocknote/core/fonts/inter.css"
import "@blocknote/shadcn/style.css"
import {
  useCreateBlockNote,
  FormattingToolbarController,
  FormattingToolbar,
  BlockTypeSelect,
  useBlockNoteEditor,
  useComponentsContext,
  useSelectedBlocks,
  useEditorContentOrSelectionChange,
  SuggestionMenuController,
  type SuggestionMenuProps,
  type DefaultReactSuggestionItem,
  ColorStyleButton,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react"
import { BlockNoteView } from "@blocknote/shadcn"
import { filterSuggestionItems } from "@blocknote/core"
import matter from "gray-matter"

// ===== Radix =====
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import * as SelectPrimitive from "@radix-ui/react-select"
import * as PopoverPrimitive from "@radix-ui/react-popover"

// ========= className 合并 =========
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}


// requestAnimationFrame + 最小间隔的节流器（避免高频触发）
function rafThrottle<T extends (...args: any[]) => void>(fn: T, minInterval = 120) {
  let rafId: number | null = null
  let last = 0
  let pendingArgs: any[] | null = null
  return (...args: Parameters<T>) => {
    pendingArgs = args
    const now = performance.now()
    const invoke = () => {
      last = performance.now()
      rafId = null
      if (pendingArgs) {
        fn(...(pendingArgs as any))
        pendingArgs = null
      }
    }
    if (rafId == null) {
      const elapsed = now - last
      if (elapsed >= minInterval) {
        rafId = requestAnimationFrame(invoke)
      } else {
        rafId = window.setTimeout(() => {
          rafId = requestAnimationFrame(invoke)
        }, minInterval - elapsed) as unknown as number
      }
    }
  }
}

// 轻量文本提取：尽可能稳定，不掺杂样式字段，避免误判
function extractBlockPlainText(block: any): string {
  if (!block) return ""
  try {
    if (!("content" in block) || !block.content) return ""
    const res: string[] = []
    const walk = (node: any) => {
      if (!node) return
      if (Array.isArray(node)) {
        node.forEach(walk)
      } else if (typeof node === "object") {
        if (typeof node.text === "string") res.push(node.text)
        if (node.children) walk(node.children)
        if (node.content) walk(node.content)
        if (node.inlineContent) walk(node.inlineContent)
      }
    }
    walk(block.content)
    return res.join(" ").replace(/\s+/g, " ").trim()
  } catch {
    return ""
  }
}

// 32bit 简易哈希（仅用于小粒度字符串快速相等性判断）
function hash32(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return h
}

// 简易词级 LCS Diff
type DiffOp = { type: "eq" | "add" | "del"; text: string }
function diffWords(a: string, b: string): DiffOp[] {
  const A = a.split(/\s+/g)
  const B = b.split(/\s+/g)
  const n = A.length,
    m = B.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const ops: DiffOp[] = []
  let i = 0,
    j = 0
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      ops.push({ type: "eq", text: A[i] })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "del", text: A[i] })
      i++
    } else {
      ops.push({ type: "add", text: B[j] })
      j++
    }
  }
  while (i < n) ops.push({ type: "del", text: A[i++] })
  while (j < m) ops.push({ type: "add", text: B[j++] })
  return ops
}

/* ------------------------ 复用 v4 的 UI 组件 ------------------------ */
const DM = DropdownMenuPrimitive
const DropdownMenu = DM.Root
const DropdownMenuTrigger = DM.Trigger
const DropdownMenuGroup = DM.Group
const DropdownMenuPortal = DM.Portal
const DropdownMenuSub = DM.Sub
const DropdownMenuRadioGroup = DM.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DM.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DM.SubTrigger> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <DM.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none",
      "focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DM.SubTrigger>
))
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger"

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DM.SubContent>,
  React.ComponentPropsWithoutRef<typeof DM.SubContent>
>(({ className, ...props }, ref) => (
  <DM.Portal>
    <DM.SubContent
      ref={ref}
      className={cn(
        "z-[99999] min-w-[10rem] w-fit max-h-[20rem] overflow-y-auto overflow-x-hidden rounded-xl bg-popover p-1.5 text-popover-foreground shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DM.Portal>
))
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DM.Content>,
  React.ComponentPropsWithoutRef<typeof DM.Content>
>(({ className, sideOffset = 4, align = "end", ...props }, ref) => (
  <DM.Portal>
    <DM.Content
      ref={ref}
      sideOffset={sideOffset}
      align={align}
      className={cn(
        "z-50 min-w-[10rem] w-fit max-h-[20rem] overflow-y-auto overflow-x-hidden rounded-xl bg-popover p-1.5 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DM.Portal>
))
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DM.Item>,
  React.ComponentPropsWithoutRef<typeof DM.Item> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <DM.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DM.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DM.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DM.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DM.ItemIndicator>
        <CheckIconRadix className="h-4 w-4" />
      </DM.ItemIndicator>
    </span>
    {children}
  </DM.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DM.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DM.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DM.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-2.5 w-2.5 items-center justify-center">
      <DM.ItemIndicator>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      </DM.ItemIndicator>
    </span>
    {children}
  </DM.RadioItem>
))
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DM.Label>,
  React.ComponentPropsWithoutRef<typeof DM.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <DM.Label
    ref={ref}
    className={cn("px-2 py-1 text-[11px] font-semibold", inset && "pl-8", className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DM.Separator>,
  React.ComponentPropsWithoutRef<typeof DM.Separator>
>(({ className, ...props }, ref) => (
  <DM.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-[10px] tracking-widest opacity-60", className)} {...props} />
)
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

const PrettyDropdownMenu = {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuRadioGroup,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
}

// ---- Select ----
const SP = SelectPrimitive
const Select = SP.Root
const SelectGroup = SP.Group
const SelectValue = SP.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SP.Trigger>,
  React.ComponentPropsWithoutRef<typeof SP.Trigger>
>(({ className, children, ...props }, ref) => (
  <SP.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-8 items-center justify-between rounded-lg bg-transparent px-2 text-xs shadow-sm outline-none",
      "ring-offset-background placeholder:text-muted-foreground",
      "focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <SP.Icon>
      <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-70" />
    </SP.Icon>
  </SP.Trigger>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SP.Content>,
  React.ComponentPropsWithoutRef<typeof SP.Content>
>(({ className, children, position = "popper", align = "end", ...props }, ref) => (
  <SP.Portal>
    <SP.Content
      ref={ref}
      position={position}
      align={align}
      className={cn(
        "z-50 min-w-[10rem] w-fit max-h-[20rem] overflow-y-auto overflow-x-hidden rounded-xl bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
        className
      )}
      {...props}
    >
      <SP.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
        <ChevronUp className="h-4 w-4" />
      </SP.ScrollUpButton>
      <SP.Viewport className="p-1">{children}</SP.Viewport>
      <SP.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
        <ChevronDown className="h-4 w-4" />
      </SP.ScrollDownButton>
    </SP.Content>
  </SP.Portal>
))
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SP.Label>,
  React.ComponentPropsWithoutRef<typeof SP.Label>
>(({ className, ...props }, ref) => (
  <SP.Label ref={ref} className={cn("px-2 py-1 text-[11px] font-semibold", className)} {...props} />
))
SelectLabel.displayName = "SelectLabel"

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SP.Item>,
  React.ComponentPropsWithoutRef<typeof SP.Item>
>(({ className, children, ...props }, ref) => (
  <SP.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex size-3 items-center justify-center">
      <SP.ItemIndicator>
        <CheckIconRadix className="h-3.5 w-3.5" />
      </SP.ItemIndicator>
    </span>
    <SP.ItemText>{children}</SP.ItemText>
  </SP.Item>
))
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SP.Separator>,
  React.ComponentPropsWithoutRef<typeof SP.Separator>
>(({ className, ...props }, ref) => (
  <SP.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
))
SelectSeparator.displayName = "SelectSeparator"

const PrettySelect = {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}

// ---- Popover ----
const Pop = PopoverPrimitive
const Popover = Pop.Root
const PopoverTrigger = Pop.Trigger
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof Pop.Content>,
  React.ComponentPropsWithoutRef<typeof Pop.Content>
>(({ className, ...props }, ref) => (
  <Pop.Portal>
    <Pop.Content
      ref={ref}
      className={cn(
        "z-50 min-w-[10rem] w-fit max-h-[20rem] overflow-y-auto overflow-x-hidden rounded-xl bg-popover p-1.5 text-popover-foreground shadow-md outline-none",
        className
      )}
      {...props}
    />
  </Pop.Portal>
))
PopoverContent.displayName = "PopoverContent"

const PrettyPopover = {
  Popover,
  PopoverTrigger,
  PopoverContent,
}

interface PostEditorProps {
  slug: string
  initialContent: string
  isNewPost?: boolean
}

/* =======================================================================================
 * 主编辑器组件 —— 性能强化 + VSCode 风格 Diff Gutter（不改变 UI/业务）
 * =======================================================================================
 */
export default function PostEditor({ slug: initialSlug, initialContent, isNewPost: initialIsNewPost = false }: PostEditorProps) {
  const router = useRouter()
  const parsed = matter(initialContent)

  const [slug, setSlug] = useState(initialSlug)
  const [isNewPost, setIsNewPost] = useState(initialIsNewPost)
  const [title, setTitle] = useState(parsed.data.title || "")
  const [category, setCategory] = useState(parsed.data.category || "")
  const [tags, setTags] = useState((parsed.data.tags || []).join(", "))
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(initialIsNewPost) // 新文章默认有变更
  const [isContentLoaded, setIsContentLoaded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 统计展示
  const [wordCount, setWordCount] = useState(0)
  const readingTime = useMemo(() => Math.ceil(wordCount / 300), [wordCount])

  // ---- 初始化状态（用 useRef 避免重建）----
  const initialState = useRef({
    title: parsed.data.title || "",
    category: parsed.data.category || "",
    tags: (parsed.data.tags || []).join(", "),
  })

  // 基线：初始每个 block 的“纯文本签名”与哈希
  const baselineBlockTextByIdRef = useRef<Map<string, { text: string; hash: number }>>(new Map())

  // 当前发生变更的 block id 列表（仅用于 UI）
  const [changedBlockIds, setChangedBlockIds] = useState<string[]>([])

  // 编辑容器引用（用来放置 Diff Gutter 覆盖层）
  const editorContainerRef = useRef<HTMLDivElement | null>(null)

  // 从 markdown 创建编辑器
  const editor = useCreateBlockNote({
    uploadFile: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const { url } = await response.json()
      return url
    },
    domAttributes: {
      // 保留你的 inline 样式，但左侧 padding 会在全局样式中用 !important 覆盖
      editor: { style: "padding-inline: 0px;" },
    },
  })

  /* ---------------------------------- 内容加载 ---------------------------------- */
  useEffect(() => {
    let mounted = true
    const loadContent = async () => {
      if (!parsed.content) {
        setIsContentLoaded(true)
        return
      }
      const blocks = await editor.tryParseMarkdownToBlocks(parsed.content)
      editor.replaceBlocks(editor.document, blocks)

      // 建立基线签名
      const map = new Map<string, { text: string; hash: number }>()
      let totalChars = 0
      for (const b of blocks) {
        const txt = extractBlockPlainText(b)
        map.set(b.id, { text: txt, hash: hash32(txt) })
        totalChars += txt.replace(/\s/g, "").length
      }
      baselineBlockTextByIdRef.current = map
      setWordCount(totalChars)
      if (mounted) setIsContentLoaded(true)
    }
    loadContent()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* --------------------------------- 撤销滚动修复 --------------------------------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "y")) {
        const scrollPos = window.scrollY
        requestAnimationFrame(() => window.scrollTo(0, scrollPos))
        setTimeout(() => window.scrollTo(0, scrollPos), 0)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  /* ------------------------------- 变更检测（节流） ------------------------------- */

  // 计算当前变更的 block id 列表 + 统计字数
  const computeChangeSnapshot = useCallback(() => {
    const changed: string[] = []
    let totalChars = 0

    const blocks = editor.document
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i] as any
      const txt = extractBlockPlainText(b)
      totalChars += txt.replace(/\s/g, "").length
      const base = baselineBlockTextByIdRef.current.get(b.id)
      if (!base) {
        if (txt.length > 0) changed.push(b.id) // 新增
      } else {
        const h = hash32(txt)
        if (h !== base.hash) changed.push(b.id)
      }
    }
    return { changed, totalChars }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  // 节流后的 onChange 处理器
  const throttledOnEditorChange = useMemo(
    () =>
      rafThrottle(() => {
        if (!isContentLoaded) return
        const { changed, totalChars } = computeChangeSnapshot()
        setWordCount((prev) => (prev === totalChars ? prev : totalChars))

        setChangedBlockIds((prev) => {
          if (prev.length === changed.length && prev.every((id, idx) => id === changed[idx])) {
            return prev
          }
          return changed
        })

        const metaChanged =
          title !== initialState.current.title ||
          category !== initialState.current.category ||
          tags !== initialState.current.tags

        setHasChanges(metaChanged || changed.length > 0)
      }, 120),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [computeChangeSnapshot, isContentLoaded, title, category, tags]
  )

  useEffect(() => {
    if (!isContentLoaded) return
    throttledOnEditorChange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, category, tags, isContentLoaded])

  /* ---------------------------------- 删除逻辑 ---------------------------------- */
  const handleDelete = useCallback(async () => {
    if (isNewPost) {
      // 新文章直接返回
      router.push('/admin')
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch("/api/admin/delete-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })

      if (!response.ok) throw new Error("Failed to delete")
      
      // 带上刷新标志通知管理页面
      router.push('/admin?refresh=true')
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(`删除失败：${error instanceof Error ? error.message : "未知错误"}`)
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }, [slug, isNewPost, router])

  /* ---------------------------------- 保存逻辑 ---------------------------------- */
  const handleSave = useCallback(async () => {
    if (!hasChanges) return

    setIsSaving(true)
    try {
      const markdown = await editor.blocksToMarkdownLossy()

      // 构建 frontmatter
      const frontmatter = {
        title,
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        date: parsed.data.date || new Date().toISOString(),
        ...(parsed.data.excerpt && { excerpt: parsed.data.excerpt }),
        ...(parsed.data.coverImage && { coverImage: parsed.data.coverImage }),
      }

      const content = matter.stringify(markdown, frontmatter)

      // 如果是新文章，需要先创建
      if (isNewPost && slug === "new") {
        // 从标题生成 slug（只保留英文、数字、连字符）
        let generatedSlug = title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/^-+|-+$/g, "")
          .replace(/-+/g, "-")
        
        // 如果 slug 为空或不符合格式，使用时间戳
        if (!generatedSlug || !/^[a-z0-9-]+$/.test(generatedSlug)) {
          generatedSlug = `post-${Date.now()}`
        }

        const createResponse = await fetch("/api/admin/create-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: generatedSlug, content }),
        })

        if (!createResponse.ok) {
          const error = await createResponse.json()
          throw new Error(error.error || "Failed to create")
        }

        // 创建成功，更新状态继续编辑（不跳转，因为创建是异步的）
        setSlug(generatedSlug)
        setIsNewPost(false)
        
        // 更新元数据基线
        initialState.current.title = title
        initialState.current.category = category
        initialState.current.tags = tags
        
        // 更新 block 基线
        const newBaseline = new Map<string, { text: string; hash: number }>()
        for (const b of editor.document as any[]) {
          const txt = extractBlockPlainText(b)
          newBaseline.set(b.id, { text: txt, hash: hash32(txt) })
        }
        baselineBlockTextByIdRef.current = newBaseline
        
        setChangedBlockIds([])
        setHasChanges(false)
        
        // 更新 URL 但不刷新页面
        window.history.replaceState(null, '', `/admin/posts/${generatedSlug}`)
        
        toast.success("文章创建成功。您可以继续编辑。")
        return
      }

      // 更新已有文章
      const response = await fetch("/api/admin/save-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, content }),
      })

      if (!response.ok) throw new Error("Failed to save")

      // 保存成功：更新元数据基线
      initialState.current.title = title
      initialState.current.category = category
      initialState.current.tags = tags

      // 保存成功：更新 block 基线
      const newBaseline = new Map<string, { text: string; hash: number }>()
      for (const b of editor.document as any[]) {
        const txt = extractBlockPlainText(b)
        newBaseline.set(b.id, { text: txt, hash: hash32(txt) })
      }
      baselineBlockTextByIdRef.current = newBaseline

      setChangedBlockIds([])
      setHasChanges(false)

      toast.success("保存成功。您可能需要稍等一会才能在网站上看到更新。")
    } catch (error) {
      console.error("Save error:", error)
      toast.error(`保存失败：${error instanceof Error ? error.message : "未知错误"}`)
    } finally {
      setIsSaving(false)
    }
  }, [
    editor,
    slug,
    title,
    category,
    tags,
    parsed.data.date,
    parsed.data.excerpt,
    parsed.data.coverImage,
    hasChanges,
    isNewPost,
    router,
  ])

  /* ---------------------------------- 渲染 ---------------------------------- */
  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-background">
      {/* 顶部工具栏（保持原样） */}
      <div className="sticky top-0 z-50 bg-background">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回</span>
            </Link>

            <div className="flex items-center gap-3">
              {!isNewPost && (
                <>
                  <Link
                    href={`/post/${slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>预览</span>
                  </Link>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-950/50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>删除</span>
                  </button>

                  <div className="w-px h-5 bg-black/10 dark:bg-white/10" />
                </>
              )}

              <button
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 active:bg-black/70 dark:active:bg-white/70 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                title={!hasChanges ? "没有修改" : ""}
              >
                {isSaving ? (
                  <div className="inline-flex animate-spin items-center justify-center">
                    <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
                      <g clipPath="url(#clip0_2393_1490)">
                        <path d="M8 0V4" stroke="currentColor" strokeWidth="1.5"></path>
                        <path d="M8 16V12" opacity="0.5" stroke="currentColor" strokeWidth="1.5"></path>
                        <path d="M3.29773 1.52783L5.64887 4.7639" opacity="0.9" stroke="currentColor" strokeWidth="1.5"></path>
                        <path d="M12.7023 1.52783L10.3511 4.7639" opacity="0.1" stroke="currentColor" strokeWidth="1.5"></path>
                        <path d="M12.7023 14.472L10.3511 11.236" opacity="0.4" stroke="currentColor" strokeWidth="1.5"></path>
                        <path d="M3.29773 14.472L5.64887 11.236" opacity="0.6" stroke="currentColor" strokeWidth="1.5"></path>
                        <path d="M15.6085 5.52783L11.8043 6.7639" opacity="0.2" stroke="currentColor" strokeWidth="1.5"></path>
                        <path d="M0.391602 10.472L4.19583 9.23598" opacity="0.7" stroke="currentColor" strokeWidth="1.5"></path>
                        <path d="M15.6085 10.4722L11.8043 9.2361" opacity="0.3" stroke="currentColor" strokeWidth="1.5"></path>
                        <path d="M0.391602 5.52783L4.19583 6.7639" opacity="0.8" stroke="currentColor" strokeWidth="1.5"></path>
                      </g>
                      <defs>
                        <clipPath id="clip0_2393_1490">
                          <rect fill="white" height="16" width="16"></rect>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>
                  {isSaving 
                    ? (isNewPost ? "创建中..." : "保存中...") 
                    : (isNewPost ? "创建文章" : (hasChanges ? "保存" : "已保存"))
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主编辑区（保持原样） */}
      <div className="max-w-[900px] mx-auto px-6 md:px-12">
        {/* 标题 */}
        <div className="pt-16 pb-8 pl-6">
          <input
            type="text"
            placeholder="无标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "ArrowDown") {
                e.preventDefault()
                const el = document.querySelector(".bn-editor") as HTMLElement | null
                el?.focus()
              }
            }}
            className="w-full text-5xl font-bold bg-transparent border-none outline-none text-black dark:text-white placeholder:text-black/15 dark:placeholder:text-white/15 leading-[1.1] tracking-tight"
          />
        </div>

        {/* 元数据 */}
        <div className="pb-8 sm:pb-12 max-w-3xl mx-auto pl-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-black/40 dark:text-white/40 mb-6">
            <div className="flex items-center gap-3">
              <span>{wordCount.toLocaleString()} 字</span>
              <span>·</span>
              <span>{readingTime} 分钟</span>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-black/40 dark:text-white/40 w-12 flex-shrink-0">分类</span>
              <input
                type="text"
                placeholder="未分类"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-black/70 dark:text-white/70 placeholder:text-black/30 dark:placeholder:text-white/30 px-0"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-black/40 dark:text-white/40 w-12 flex-shrink-0">标签</span>
              <input
                type="text"
                placeholder="用逗号分隔"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-black/70 dark:text-white/70 placeholder:text-black/30 dark:placeholder:text-white/30 px-0"
              />
            </div>
          </div>
        </div>

        {/* 编辑器 + Diff Gutter 覆盖层 */}
        <div
          className="markdown-body max-w-3xl mx-auto pb-32 relative"
          data-editor-container
          ref={editorContainerRef}
        >
          <BlockNoteView
            editor={editor}
            formattingToolbar={false}
            slashMenu={false}
            linkToolbar
            onChange={throttledOnEditorChange}
            shadCNComponents={{
              DropdownMenu: PrettyDropdownMenu as any,
              Select: PrettySelect as any,
              Popover: PrettyPopover as any,
            }}
            theme="light"
          >
            <FormattingToolbarController formattingToolbar={() => <ToolbarShell />} />
            <SuggestionMenuController
              triggerCharacter="/"
              suggestionMenuComponent={PrettySlashMenu}
              getItems={async (query) =>
                filterSuggestionItems(getDefaultReactSlashMenuItems(editor), query)
              }
            />
          </BlockNoteView>

          {/* VSCode 风格改动标记（左侧细线 + 点击 Tooltip） */}
          <DiffGutter
            containerRef={editorContainerRef}
            editor={editor}
            changedBlockIds={changedBlockIds}
            getBaselineText={(id) => baselineBlockTextByIdRef.current.get(id)?.text ?? ""}
          />
        </div>
      </div>

      {/* 样式（包含修复后的 gutter + sonner 优化） */}
      <style jsx global>{`
        /* Sonner Toast 优化 - 极简单行风格 */
        [data-sonner-toaster] {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        }
        
        [data-sonner-toast] {
          border-radius: 999px !important;
          padding: 10px 20px !important;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
          border: none !important;
          background: rgba(0, 0, 0, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          min-height: auto !important;
          max-width: fit-content !important;
          width: auto !important;
          min-width: auto !important;
          gap: 0 !important;
          display: inline-flex !important;
        }
        
        .dark [data-sonner-toast] {
          background: rgba(255, 255, 255, 0.95) !important;
          box-shadow: 0 2px 12px rgba(255, 255, 255, 0.1) !important;
        }
        
        [data-sonner-toast] [data-content] {
          display: inline-flex !important;
          align-items: center !important;
          gap: 0 !important;
          white-space: nowrap !important;
        }
        
        [data-sonner-toast] [data-title] {
          font-weight: 500 !important;
          font-size: 13px !important;
          color: rgba(255, 255, 255, 0.9) !important;
          white-space: nowrap !important;
          display: inline !important;
        }
        
        .dark [data-sonner-toast] [data-title] {
          color: rgba(0, 0, 0, 0.9) !important;
        }
        
        [data-sonner-toast] [data-description] {
          display: none !important;
        }
        
        /* 移除 icon */
        [data-sonner-toast] [data-icon] {
          display: none !important;
        }
        
        /* 移除关闭按钮 */
        [data-sonner-toast] [data-close-button] {
          display: none !important;
        }
        

        /* ⚠️ 性能关键：保持 containment，但允许负值定位 */
        .bn-container,
        .bn-editor,
        .bn-formatting-toolbar,
        .bn-toolbar {
          overflow: visible !important;
          contain: none !important;
        }
        
        [data-editor-container] {
          overflow: visible !important;
          contain: none !important;
        }

        .bn-container > *,
        .bn-editor > *,
        .bn-formatting-toolbar > *,
        .bn-toolbar > * {
          overflow: visible !important;
        }

        /* 工具栏样式（原样） */
        .bn-container .bn-toolbar {
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border: none;
          border-radius: 8px;
          padding: 4px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.1);
          gap: 1px !important;
          z-index: 1000 !important;
        }

        .bn-container .bn-toolbar button {
          color: rgba(255, 255, 255, 0.9);
          height: 32px !important;
          min-height: 32px !important;
          min-width: 32px !important;
          padding: 6px !important;
          border-radius: 6px;
          transition: background-color 0.15s;
        }

        .bn-container .bn-toolbar button:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .bn-container .bn-toolbar button svg {
          width: 16px !important;
          height: 16px !important;
        }

        .bn-container .bn-toolbar button[aria-pressed="true"] {
          color: #fff;
          background-color: rgba(255, 255, 255, 0.2);
        }

         /* 编辑器（原样 + 补左侧 padding 给 gutter 留位） */
         [data-editor-container] {
           --diff-gutter-width: 14px;
           overflow: visible !important;
         }
         .bn-container .bn-editor {
           padding-bottom: 200px;
           scroll-padding-bottom: 200px;
           background-color: transparent !important;
           /* 关键：让内容不被左侧标记覆盖 */
           padding-left: calc(var(--diff-gutter-width) + 8px) !important;
         }

        /* 应用 markdown 样式 - 基础文本（原样） */
        .markdown-body .bn-editor .bn-inline-content,
        .markdown-body .bn-editor p,
        .markdown-body .bn-editor .bn-block-content p {
          font-size: 17px;
          line-height: 1.7;
          color: rgba(0, 0, 0, 0.8);
        }

        .dark .markdown-body .bn-editor .bn-inline-content,
        .dark .markdown-body .bn-editor p,
        .dark .markdown-body .bn-editor .bn-block-content p {
          color: rgba(255, 255, 255, 0.8);
        }

        /* 标题内的 .bn-inline-content 应该继承标题的字体大小，而不是固定的 17px */
        .markdown-body .bn-editor h1 .bn-inline-content,
        .markdown-body .bn-editor h2 .bn-inline-content,
        .markdown-body .bn-editor h3 .bn-inline-content,
        .markdown-body .bn-editor h4 .bn-inline-content,
        .markdown-body .bn-editor h5 .bn-inline-content,
        .markdown-body .bn-editor h6 .bn-inline-content {
          font-size: inherit !important;
          line-height: inherit !important;
        }

        .markdown-body .bn-editor h1,
        .markdown-body .bn-editor h2,
        .markdown-body .bn-editor h3,
        .markdown-body .bn-editor h4,
        .markdown-body .bn-editor h5,
        .markdown-body .bn-editor h6 {
          color: rgb(0, 0, 0);
          font-weight: 600;
        }


        .dark .markdown-body .bn-editor h1,
        .dark .markdown-body .bn-editor h2,
        .dark .markdown-body .bn-editor h3,
        .dark .markdown-body .bn-editor h4,
        .dark .markdown-body .bn-editor h5,
        .dark .markdown-body .bn-editor h6 {
          color: rgb(255, 255, 255);
        }

        .markdown-body .bn-editor strong {
          font-weight: 600;
          color: rgb(0, 0, 0);
        }

        .dark .markdown-body .bn-editor strong {
          color: rgb(255, 255, 255);
        }

        .markdown-body .bn-editor :not(pre) > code {
          font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
          font-size: 13px;
          background: rgba(0, 0, 0, 0.04);
          color: rgba(0, 0, 0, 0.9);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .dark .markdown-body .bn-editor :not(pre) > code {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.9);
        }

        .markdown-body .bn-editor [data-content-type="codeBlock"],
        .bn-block-content[data-content-type="codeBlock"] {
          margin: 32px 0;
          background-color: transparent !important;
          color: inherit !important;
          border-radius: 0 !important;
        }

        .markdown-body .bn-editor [data-content-type="codeBlock"] pre {
          margin: 0;
          padding: 20px;
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 8px;
          overflow-x: auto;
        }

        .dark .markdown-body .bn-editor [data-content-type="codeBlock"] pre {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.06);
        }

        .markdown-body .bn-editor [data-content-type="codeBlock"] pre code,
        .markdown-body .bn-editor [data-content-type="codeBlock"] pre code.bn-inline-content {
          background: transparent !important;
          padding: 0 !important;
          border-radius: 0 !important;
          font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', ui-monospace, 'Cascadia Code', Menlo, Monaco, Consolas, monospace;
          font-size: 14px;
          line-height: 1.75;
          font-weight: 350;
          color: #383A42 !important;
          white-space: pre;
          word-wrap: normal;
          display: block;
        }

        .dark .markdown-body .bn-editor [data-content-type="codeBlock"] pre code,
        .dark .markdown-body .bn-editor [data-content-type="codeBlock"] pre code.bn-inline-content {
          color: #E6E6E6 !important;
        }

        .markdown-body .bn-editor [data-content-type="codeBlock"] > div[contenteditable="false"] {
          display: none;
        }

        .markdown-body .bn-editor blockquote {
          border-left: 2px solid rgba(0, 0, 0, 0.2);
          padding-left: 16px;
          margin: 24px 0;
          color: rgba(0, 0, 0, 0.6);
        }

        .dark .markdown-body .bn-editor blockquote {
          border-left-color: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.6);
        }

        .markdown-body .bn-editor a {
          color: rgb(0, 0, 0);
          text-decoration: underline;
          text-decoration-color: rgba(0, 0, 0, 0.3);
          text-underline-offset: 4px;
        }

        .dark .markdown-body .bn-editor a {
          color: rgb(255, 255, 255);
          text-decoration-color: rgba(255, 255, 255, 0.3);
        }

        .markdown-body .bn-editor a:hover {
          text-decoration-color: rgb(0, 0, 0);
        }

        .dark .markdown-body .bn-editor a:hover {
          text-decoration-color: rgb(255, 255, 255);
        }

        .bn-block-content {
          margin-bottom: 1.5rem;
        }

        .bn-editor h1 {
          font-size: 3rem !important;
          margin-bottom: 1.5rem;
        }
        .bn-editor h2 {
          font-size: 2.5rem !important;
          margin-bottom: 1.25rem;
        }
        .bn-editor h3 {
          font-size: 2rem !important;
          margin-bottom: 1rem;
        }
        
        /* 确保标题内的所有子元素都继承标题的字体大小 */
        .bn-editor h1 *,
        .bn-editor h1 .bn-inline-content {
          font-size: 3rem !important;
        }
        .bn-editor h2 *,
        .bn-editor h2 .bn-inline-content {
          font-size: 2.5rem !important;
        }
        .bn-editor h3 *,
        .bn-editor h3 .bn-inline-content {
          font-size: 2rem !important;
        }

        /* ---------- Diff 标记 - 类似 BlockNote 侧边菜单 ---------- */
        .diff-gutter-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 100%;
          pointer-events: none;
          z-index: 1000;
        }
        
        /* 竖线 - 4px 粗线，使用 transform 定位 */
        .diff-marker {
          position: absolute;
          left: 0;
          top: 0;
          display: flex;
          width: 4px;
          border-radius: 2px;
          pointer-events: auto;
          cursor: pointer;
          transition-property: opacity, width, transform;
          transition-duration: 250ms;
          opacity: 0.8;
        }
        
        .diff-marker:hover {
          opacity: 1;
          width: 5px;
        }
        
        /* 修改 - 蓝色 */
        .diff-marker.mod {
          background: #0969da;
        }
        
        .dark .diff-marker.mod {
          background: #58a6ff;
        }
        
        /* 新增 - 绿色 */
        .diff-marker.add {
          background: #1a7f37;
        }
        
        .dark .diff-marker.add {
          background: #3fb950;
        }

        /* ---------- Diff Tooltip - 极简扁平 ---------- */
        .diff-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 13px;
          line-height: 1.5;
          max-width: 420px;
          padding: 12px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          animation: diffIn 0.12s ease-out;
          z-index: 9999;
          position: relative;
        }
        
        @keyframes diffIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
        }
        
        .dark .diff-content {
          background: #161616;
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }
        
        /* 标题 */
        .diff-caption {
          font-size: 11px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.5);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        
        .dark .diff-caption {
          color: rgba(255, 255, 255, 0.5);
        }
        
        /* 内容 */
        .diff-text-wrapper {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 13px;
          line-height: 1.6;
          color: rgba(0, 0, 0, 0.9);
          word-break: break-word;
        }
        
        .dark .diff-text-wrapper {
          color: rgba(255, 255, 255, 0.9);
        }
        
        /* 高亮 */
        .diff-line {
          display: inline;
          padding: 0 2px;
          border-radius: 2px;
        }
        
        .diff-add {
          background: rgba(26, 127, 55, 0.1);
          color: #1a7f37;
        }
        
        .dark .diff-add {
          background: rgba(63, 185, 80, 0.15);
          color: #3fb950;
        }
        
        .diff-del {
          background: rgba(207, 34, 46, 0.1);
          color: #cf222e;
          text-decoration: line-through;
          opacity: 0.8;
        }
        
        .dark .diff-del {
          background: rgba(248, 81, 73, 0.15);
          color: #f85149;
        }
        
        .diff-eq {
          opacity: 0.6;
        }
        
        .diff-empty {
          font-style: italic;
          opacity: 0.4;
          font-size: 12px;
        }
      `}</style>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          />
          
          {/* 对话框 */}
          <div className="relative bg-background border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
              确认删除文章？
            </h3>
            <p className="text-sm text-black/60 dark:text-white/60 mb-6">
              此操作无法撤销。文章 "<span className="font-medium">{title}</span>" 将被永久删除。
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 active:bg-red-800 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="inline-flex animate-spin items-center justify-center">
                      <svg height="14" strokeLinejoin="round" viewBox="0 0 16 16" width="14">
                        <g clipPath="url(#clip0_delete)">
                          <path d="M8 0V4" stroke="currentColor" strokeWidth="1.5"></path>
                          <path d="M8 16V12" opacity="0.5" stroke="currentColor" strokeWidth="1.5"></path>
                          <path d="M3.29773 1.52783L5.64887 4.7639" opacity="0.9" stroke="currentColor" strokeWidth="1.5"></path>
                          <path d="M12.7023 1.52783L10.3511 4.7639" opacity="0.1" stroke="currentColor" strokeWidth="1.5"></path>
                          <path d="M12.7023 14.472L10.3511 11.236" opacity="0.4" stroke="currentColor" strokeWidth="1.5"></path>
                          <path d="M3.29773 14.472L5.64887 11.236" opacity="0.6" stroke="currentColor" strokeWidth="1.5"></path>
                          <path d="M15.6085 5.52783L11.8043 6.7639" opacity="0.2" stroke="currentColor" strokeWidth="1.5"></path>
                          <path d="M0.391602 10.472L4.19583 9.23598" opacity="0.7" stroke="currentColor" strokeWidth="1.5"></path>
                          <path d="M15.6085 10.4722L11.8043 9.2361" opacity="0.3" stroke="currentColor" strokeWidth="1.5"></path>
                          <path d="M0.391602 5.52783L4.19583 6.7639" opacity="0.8" stroke="currentColor" strokeWidth="1.5"></path>
                        </g>
                        <defs>
                          <clipPath id="clip0_delete">
                            <rect fill="white" height="16" width="16"></rect>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <span>删除中...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>确认删除</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* -------------------------------- Slash 菜单（原样 + 小修） -------------------------------- */
function PrettySlashMenu(props: SuggestionMenuProps<DefaultReactSuggestionItem>) {
  return (
    <div
      className={cn(
        "rounded-xl bg-popover border border-black/5 dark:border-white/5 shadow-xl",
        "p-2 min-w-[16rem] w-fit max-h-[24rem] overflow-auto"
      )}
      onMouseDown={(e) => e.preventDefault()}
    >
      {props.items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-3 rounded-md px-2 py-2 cursor-pointer transition-colors",
            "text-black dark:text-white",
            // 修复笔误：dark:hover:bg:white/5 -> dark:hover:bg-white/5
            "hover:bg-black/5 dark:hover:bg-white/5",
            props.selectedIndex === index && "bg-black/5 dark:bg-white/5"
          )}
          onClick={() => props.onItemClick?.(item)}
        >
          {item.icon && (
            <span className="shrink-0 mt-0.5 w-4 h-4 text-black/70 dark:text-white/70">{item.icon}</span>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{item.title}</div>
            {item.subtext && (
              <div className="text-xs text-black/50 dark:text-white/50 truncate mt-0.5">{item.subtext}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------- 工具栏（原样） -------------------------------- */
function ToolbarShell() {
  const editor = useBlockNoteEditor()
  const Components = useComponentsContext()!
  const [isBold, setIsBold] = React.useState(false)
  const [isItalic, setIsItalic] = React.useState(false)
  const [isCode, setIsCode] = React.useState(false)
  const [hasLink, setHasLink] = React.useState(false)

  useEditorContentOrSelectionChange(() => {
    const styles = editor.getActiveStyles()
    setIsBold(!!styles.bold)
    setIsItalic(!!styles.italic)
    setIsCode(!!styles.code)
    setHasLink(!!editor.getSelectedLinkUrl())
  }, editor)

  const selectedBlocks = useSelectedBlocks()
  const hasInlineContent = selectedBlocks.some((b) => b.content !== undefined)

  if (!hasInlineContent) {
    return (
      <FormattingToolbar>
        <BlockTypeSelect key="blockTypeSelect" />
      </FormattingToolbar>
    )
  }

  const insertImageByURL = async () => {
    const url = window.prompt("请输入图片链接:", "https://")
    if (!url) return
    const selection = editor.getSelection()
    const ref =
      selection?.blocks[selection.blocks.length - 1] ?? editor.document[editor.document.length - 1]
    if (!ref) return
    editor.insertBlocks([{ type: "image", props: { url } }], ref, "after")
  }

  const convertToHeading1 = () => {
    const sel = editor.getSelection()
    if (!sel || sel.blocks.length === 0) return
    sel.blocks.forEach((b) => {
      editor.updateBlock(b, { type: "heading", props: { level: 1 } })
    })
  }

  const createOrEditLink = () => {
    const current = editor.getSelectedLinkUrl() || ""
    const url = window.prompt("输入链接（留空则移除链接）:", current)
    if (url === null) return
    editor.createLink(url)
  }

  return (
    <FormattingToolbar>
      <BlockTypeSelect key="blockTypeSelect" />
      <Components.FormattingToolbar.Button
        key="bold-btn"
        mainTooltip="加粗"
        onClick={() => editor.toggleStyles({ bold: true })}
        isSelected={isBold}
      >
        <BoldIcon className="w-3.5 h-3.5" />
      </Components.FormattingToolbar.Button>
      <Components.FormattingToolbar.Button
        key="italic-btn"
        mainTooltip="斜体"
        onClick={() => editor.toggleStyles({ italic: true })}
        isSelected={isItalic}
      >
        <ItalicIcon className="w-3.5 h-3.5" />
      </Components.FormattingToolbar.Button>
      <Components.FormattingToolbar.Button
        key="code-btn"
        mainTooltip="行内代码"
        onClick={() => editor.toggleStyles({ code: true })}
        isSelected={isCode}
      >
        <CodeIcon className="w-3.5 h-3.5" />
      </Components.FormattingToolbar.Button>
      <ColorStyleButton key="color-style" />
      <Components.FormattingToolbar.Button key="to-h1" mainTooltip="转换为标题 1" onClick={convertToHeading1}>
        <Hash className="w-3.5 h-3.5" />
      </Components.FormattingToolbar.Button>
      <Components.FormattingToolbar.Button key="img" mainTooltip="插入图片" onClick={insertImageByURL}>
        <ImageIcon className="w-3.5 h-3.5" />
      </Components.FormattingToolbar.Button>
      <Components.FormattingToolbar.Button
        key="link-btn"
        mainTooltip={hasLink ? "编辑/移除链接" : "创建链接"}
        onClick={createOrEditLink}
        isSelected={hasLink}
      >
        <Link2 className="w-3.5 h-3.5" />
      </Components.FormattingToolbar.Button>
    </FormattingToolbar>
  )
}

/* =======================================================================================
 * Diff Gutter 覆盖层：按 DOM 顺序为变更的 block 左侧绘制 6px 细线；点击查看词级 Diff
 * =======================================================================================
 */
function DiffGutter({
  containerRef,
  editor,
  changedBlockIds,
  getBaselineText,
}: {
  containerRef: React.RefObject<HTMLDivElement>
  editor: any
  changedBlockIds: string[]
  getBaselineText: (id: string) => string
}) {
  const layerRef = useRef<HTMLDivElement | null>(null)
  const [markers, setMarkers] = useState<
    { id: string; top: number; height: number; type: "add" | "mod"; index: number }[]
  >([])

  // 依据 DOM 计算每个 block 的矩形，找出需要标记的位置
  const recalc = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const editorRoot = container.querySelector(".bn-editor") as HTMLElement | null
    if (!editorRoot) return

    // 选择顶层 block 的内容节点（与 editor.document 顺序一致）
    const nodes = editorRoot.querySelectorAll<HTMLElement>(".bn-block > .bn-block-content[data-content-type]")
    const doc = editor.document as any[]

    const next: { id: string; top: number; height: number; type: "add" | "mod"; index: number }[] =
      []

    const containerRect = container.getBoundingClientRect()

    let domIdx = 0
    for (let i = 0; i < doc.length && domIdx < nodes.length; i++) {
      const block = doc[i]
      const node = nodes[domIdx++]
      if (!node) break

      const id = block.id as string
      if (!changedBlockIds.includes(id)) continue

      const rect = node.getBoundingClientRect()
      // 以容器为参照的绝对 top（容器自己是否滚动都兼容）
      const top = rect.top - containerRect.top + container.scrollTop
      const height = Math.max(12, Math.min(rect.height, 28)) // 细线高度控制
      const isAdded = !getBaselineText(id)
      next.push({
        id,
        top,
        height,
        type: isAdded ? "add" : "mod",
        index: i,
      })
    }
    setMarkers((prev) => {
      if (prev.length === next.length && prev.every((p, idx) => shallowEqualMarker(p, next[idx]))) {
        return prev
      }
      return next
    })
  }, [containerRef, editor, changedBlockIds, getBaselineText])

  const throttledRecalc = useMemo(() => rafThrottle(recalc, 90), [recalc])

  useLayoutEffect(() => {
    throttledRecalc()
  }, [throttledRecalc, changedBlockIds])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onScrollContainer = () => throttledRecalc()
    const onScrollWindow = () => throttledRecalc()

    const roContainer = new ResizeObserver(() => throttledRecalc())
    const editorRoot = el.querySelector(".bn-editor") as HTMLElement | null
    const roEditor = editorRoot ? new ResizeObserver(() => throttledRecalc()) : null

    el.addEventListener("scroll", onScrollContainer, { passive: true })
    window.addEventListener("scroll", onScrollWindow, { passive: true })
    roContainer.observe(el)
    if (editorRoot && roEditor) roEditor.observe(editorRoot)

    window.addEventListener("resize", throttledRecalc, { passive: true })

    return () => {
      el.removeEventListener("scroll", onScrollContainer)
      window.removeEventListener("scroll", onScrollWindow)
      roContainer.disconnect()
      if (roEditor && editorRoot) roEditor.disconnect()
      window.removeEventListener("resize", throttledRecalc as any)
    }
  }, [containerRef, throttledRecalc])

  return (
    <div ref={layerRef} className="diff-gutter-layer">
      {markers.map((m) => (
        <DiffMarker
          key={m.id}
          top={m.top}
          height={m.height}
          type={m.type}
          currentText={extractBlockPlainText(findBlockById(editor, m.id) as any)}
          baselineText={getBaselineText(m.id)}
        />
      ))}
    </div>
  )
}

function shallowEqualMarker(
  a: { id: string; top: number; height: number; type: "add" | "mod"; index: number },
  b: { id: string; top: number; height: number; type: "add" | "mod"; index: number }
) {
  return a.id === b.id && a.top === b.top && a.height === b.height && a.type === b.type && a.index === b.index
}

function findBlockById(editor: any, id: string): any | null {
  const doc = editor.document as any[]
  for (let i = 0; i < doc.length; i++) {
    if (doc[i].id === id) return doc[i]
  }
  return null
}

function DiffMarker({
  top,
  height,
  type,
  currentText,
  baselineText,
}: {
  top: number
  height: number
  type: "add" | "mod"
  currentText: string
  baselineText: string
}) {
  const { Popover, PopoverTrigger, PopoverContent } = PrettyPopover as any
  const ops = useMemo<DiffOp[] | null>(
    () => (type === "add" ? null : diffWords(baselineText, currentText)),
    [type, baselineText, currentText]
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn("diff-marker", type)}
          style={{ 
            transform: `translate(-32px, ${top}px)`,
            height: `${height}px`
          }}
          title={type === "add" ? "新增内容" : "修改内容"}
          aria-label={type === "add" ? "新增内容" : "修改内容"}
        />
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="diff-content">
        <div className="diff-caption">
          {type === "add" ? "新增内容" : "修改对比"}
        </div>
        <div className="diff-text-wrapper">
          {type === "add" ? (
            currentText ? (
              <span className="diff-line diff-add">{currentText}</span>
            ) : (
              <span className="diff-empty">（空）</span>
            )
          ) : ops && ops.length ? (
            ops.map((op, i) => {
              if (op.type === "add")
                return (
                  <span key={i} className="diff-line diff-add">
                    {op.text}
                  </span>
                )
              if (op.type === "del")
                return (
                  <span key={i} className="diff-line diff-del">
                    {op.text}
                  </span>
                )
              return (
                <span key={i} className="diff-line diff-eq">
                  {op.text}
                </span>
              )
            })
          ) : (
            <span className="diff-empty">（无差异）</span>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
