import { useState, useRef, useEffect, createContext, useContext } from 'react'
import { supabase } from './supabaseClient'
import companyLogo from './assets/company-logo.png'
import * as XLSX from 'xlsx'
// ==================== TYPES ====================

type Role = 'manager' | 'employee'
type View = 'dashboard' | 'tasks' | 'projects' | 'leaderboard' | 'rewards' | 'social' | 'profile' | 'proposals' | 'bodlog'
type TaskStatus = 'open' | 'in-progress' | 'submitted' | 'completed'
type TaskPriority = 'low' | 'medium' | 'high'
type ChatChannel = 'general' | 'team' | 'announcements' | 'dm' | 'proposal'

interface AvatarConfig {
  type: 'custom' | 'photo'
  skinTone: string
  hairStyle: number
  hairColor: string
  outfitColor: string
  accessory: number
  photoUrl?: string
  dicebearSeed?: string
}

interface User {
  id: string
  name: string
  role: Role
  avatar: AvatarConfig
  exp: number
  teamId: string
  department: string
  email?: string
  isDirector?: boolean
  driveFolderUrl?: string
  signatureUrl?: string
}

interface Task {
  id: string
  title: string
  description: string
  expReward: number
  status: TaskStatus
  // assignedTo?: string
  // projectManager?: string
  assignedTo: string[]
  projectManager: string[]
  supporters: string[]
  createdBy: string
  dueDate: string
  category: string
  priority: TaskPriority
  selfCreated: boolean
  submissionFileUrl?: string
  submissionNote?: string
  submittedAt?: string
  rejectedReason?: string
  startDate?: string
  important: boolean
  urgent: boolean
  isTeamProject?: boolean
  crossDeptPending?: boolean
  crossDeptRejected?: boolean
  crossDeptRejectedReason?: string
  crossDeptRejectedBy?: string
  creationApproval?: 'pending' | 'approved' | 'rejected'
  creationApprovedBy?: string
  creationRejectedReason?: string
  targetTeamId?: string
  submissionOwnFolderUrl?: string
  driveFolderCreated?: boolean
  driveFolderName?: string
  submissionFolderName?: string
  driveFolderOwnerId?: string
  approvedBy?: string
  approvedAt?: string
  ticketReceivedText?: string
  ticketInProcessText?: string
  ticketCompletedText?: string
  ticketReceivedAt?: string
  ticketInProcessAt?: string
  ticketCompletedAt?: string
  taskCode?: string
  company?: string
  projectId?: string
  createdAt?: string
  slaLevel?: 'P1' | 'P2' | 'P3' | 'P4'
  workStatus?: 'received' | 'processing' | 'pending' | 'complete'
  startedAt?: string
  processingStartedAt?: string
  totalProcessingSeconds?: number
  pendingReason?: string
  pendingRequestedBy?: string
  pendingRequestedAt?: string
  isLocked?: boolean
  lockReason?: string
  unlockRequestedReason?: string
  unlockRequestedAt?: string
  slaUnlockGranted?: boolean
  completeIssue?: string
  closeResult?: 'successful' | 'with_issue'
  closeNote?: string
}

interface Message {
  id: string
  userId: string
  content: string
  timestamp: string
  channel: ChatChannel
  toUserId?: string // chỉ dùng khi channel === 'dm': id của người nhận
  proposalId?: string
}
interface ProposalApproval {
  id: string
  proposalId: string
  approverId: string
  action: 'approved' | 'rejected' | 'forwarded'
  note?: string
  createdAt: string
}
interface ProposalRevision {
  id: string
  proposalId: string
  editedBy: string
  addedNote?: string
  editedNote?: string
  createdAt: string
}

type ProposalStatus = 'pending' | 'approved' | 'rejected'

interface Proposal {
  id: string
  title: string
  description: string
  driveUrl: string
  submittedBy: string
  recipientId: string
  status: ProposalStatus
  rejectedReason?: string
  participants: string[]
  createdAt: string
  signedFileUrl?: string
  code?: string
  groupName?: string
  department?: string
  company?: string
  brief?: string
  days?: number
  dueDate?: string
  approvalMode?: 'seq' | 'par'
  items?: { item: string; cost: string; amount: number }[]
  risks?: { t: string; lv: string; u: string; at: string }[]
  planStatus?: string
  kind?: 'dexuat' | 'totrinh' | 'dntt'
  projectId?: string
  formData?: Record<string, any>
  attachments?: { name: string; path: string; size: number; type: string; at?: string; by?: string; round?: number; note?: string }[]
}

type CollaborationStatus = 'pending' | 'assigned' | 'rejected'

interface Collaboration {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  requestedBy: string
  requestingTeamId: string
  targetTeamId: string
  targetManagerId?: string
  expReward?: number
  status: CollaborationStatus
  assignedEmployeeIds?: string[]
  assignedBy?: string
  rejectedReason?: string
  createdAt: string
  driveFolderCreated?: boolean
  driveFolderName?: string
}

interface Reward {
  id: string
  name: string
  description: string
  cost: number
  emoji: string
  category: string
}



// ==================== AVATAR SYSTEM ====================

const SKIN_TONES = ['#FDBCB4', '#E8A87C', '#C68642', '#8D5524', '#4A2912']
const HAIR_COLORS = ['#1a1a1a', '#4a2c0a', '#8B4513', '#C0392B', '#D4AC0D', '#FF69B4', '#4169E1', '#B8B8B8']
const OUTFIT_COLORS = ['#4f46e5', '#059669', '#dc2626', '#d97706', '#0891b2', '#7c3aed', '#ec4899', '#374151']
const HAIR_STYLE_LABELS = ['Ngắn', 'Vừa', 'Dài', 'Xoăn', 'Afro', 'Đuôi ngựa']
const ACCESSORY_LABELS = ['Không', 'Kính tròn', 'Kính mát', 'Mũ', 'Băng đầu']



const DEFAULT_AVATAR: AvatarConfig = {
  type: 'custom', skinTone: '#E8A87C', hairStyle: 1, hairColor: '#1a1a1a', outfitColor: '#4f46e5', accessory: 0,
  dicebearSeed: 'kni-default',
}

function darkenColor(hex: string, f = 0.2): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.round((n >> 16) * (1 - f)))
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - f)))
  const b = Math.max(0, Math.round((n & 0xff) * (1 - f)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Full SVG character
function CharacterSVG({ config, w = 100, h = 120, vb = '0 0 100 120' }: {
  config: AvatarConfig; w?: number; h?: number; vb?: string
}) {
  const { skinTone, hairStyle, hairColor, outfitColor, accessory } = config
  const pants = darkenColor(outfitColor, 0.28)
  const skinDark = darkenColor(skinTone, 0.12)
  const lightHairs = ['#B8B8B8', '#D4AC0D', '#FF69B4', '#4169E1', '#FDBCB4']
  const browColor = lightHairs.includes(hairColor) ? darkenColor(skinTone, 0.3) : hairColor

  const renderHair = () => {
    switch (hairStyle) {
      case 0:
        return <path d="M29,34 Q28,11 50,10 Q72,11 71,34 Q65,18 50,15 Q35,18 29,34 Z" fill={hairColor} />
      case 1:
        return (
          <g>
            <ellipse cx="50" cy="19" rx="22" ry="13" fill={hairColor} />
            <path d="M30,26 Q25,46 30,60" stroke={hairColor} strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M70,26 Q75,46 70,60" stroke={hairColor} strokeWidth="9" strokeLinecap="round" fill="none" />
          </g>
        )
      case 2:
        return (
          <g>
            <ellipse cx="50" cy="17" rx="22" ry="11" fill={hairColor} />
            <path d="M30,23 Q21,62 25,84" stroke={hairColor} strokeWidth="10" strokeLinecap="round" fill="none" />
            <path d="M70,23 Q79,62 75,84" stroke={hairColor} strokeWidth="10" strokeLinecap="round" fill="none" />
          </g>
        )
      case 3:
        return (
          <g>
            <circle cx="29" cy="27" r="11" fill={hairColor} />
            <circle cx="42" cy="15" r="12" fill={hairColor} />
            <circle cx="58" cy="15" r="12" fill={hairColor} />
            <circle cx="71" cy="27" r="11" fill={hairColor} />
            <circle cx="76" cy="39" r="9" fill={hairColor} />
            <circle cx="24" cy="39" r="9" fill={hairColor} />
          </g>
        )
      case 4:
        return <circle cx="50" cy="24" r="28" fill={hairColor} />
      case 5:
        return (
          <g>
            <ellipse cx="50" cy="19" rx="22" ry="12" fill={hairColor} />
            <path d="M30,27 Q26,42 30,54" stroke={hairColor} strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M70,14 Q86,8 84,36 Q82,44 72,40 Q71,28 70,20 Z" fill={hairColor} />
          </g>
        )
      default: return null
    }
  }

  const renderAccessory = () => {
    switch (accessory) {
      case 1: // Round glasses
        return (
          <g stroke="#1e1e3a" strokeWidth="1.5" fill="none" opacity="0.88">
            <circle cx="43" cy="31" r="8" />
            <circle cx="57" cy="31" r="8" />
            <line x1="51" y1="31" x2="49" y2="31" />
            <line x1="35" y1="30" x2="27" y2="29" />
            <line x1="65" y1="30" x2="73" y2="29" />
          </g>
        )
      case 2: // Sunglasses
        return (
          <g>
            <circle cx="43" cy="31" r="8" fill="#0f0f1e" opacity="0.85" />
            <circle cx="57" cy="31" r="8" fill="#0f0f1e" opacity="0.85" />
            <g stroke="#3a3a5a" strokeWidth="1.5" fill="none">
              <circle cx="43" cy="31" r="8" />
              <circle cx="57" cy="31" r="8" />
              <line x1="51" y1="31" x2="49" y2="31" />
              <line x1="35" y1="30" x2="27" y2="29" />
              <line x1="65" y1="30" x2="73" y2="29" />
            </g>
          </g>
        )
      case 3: // Hat
        return (
          <g>
            <ellipse cx="50" cy="15" rx="27" ry="5.5" fill={darkenColor(hairColor === '#D4AC0D' ? '#8B4513' : hairColor, 0.1)} />
            <rect x="33" y="0" width="34" height="16" rx="6" fill={hairColor === '#B8B8B8' ? '#444' : darkenColor(hairColor, 0.05)} />
            <rect x="33" y="12" width="34" height="4" fill="rgba(0,0,0,0.2)" />
          </g>
        )
      case 4: // Headband
        return <rect x="27" y="25" width="46" height="9" rx="4.5" fill="#ec4899" />
      default: return null
    }
  }

  return (
    <svg viewBox={vb} width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      {/* ===== ĐẦU (scale to lên để ra tỉ lệ chibi dễ thương, đầu to - thân nhỏ) ===== */}
      <g transform="translate(-7.5,-4.8) scale(1.15)">
        {/* Hair (below head) */}
        {renderHair()}

        {/* Hat (below head) */}
        {accessory === 3 && renderAccessory()}

        {/* Ears */}
        <ellipse cx="29" cy="34" rx="4.5" ry="5.5" fill={skinTone} />
        <ellipse cx="71" cy="34" rx="4.5" ry="5.5" fill={skinTone} />

        {/* Head */}
        <ellipse cx="50" cy="32" rx="21" ry="22" fill={skinTone} />

        {/* Cheek blush - to và hồng hơn cho cute */}
        <ellipse cx="36" cy="41" rx="7" ry="4.5" fill="#ff8899" opacity="0.35" />
        <ellipse cx="64" cy="41" rx="7" ry="4.5" fill="#ff8899" opacity="0.35" />

        {/* Eyebrows */}
        <path d="M38,23 Q43,21 47,24" stroke={browColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M53,24 Q57,21 62,23" stroke={browColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Eyes - to tròn kiểu anime cute */}
        <ellipse cx="42" cy="31" rx="4.8" ry="5.4" fill="white" />
        <ellipse cx="58" cy="31" rx="4.8" ry="5.4" fill="white" />
        <circle cx="42.6" cy="32.2" r="3.1" fill="#1a1a2e" />
        <circle cx="58.6" cy="32.2" r="3.1" fill="#1a1a2e" />
        <circle cx="43.9" cy="30.2" r="1.3" fill="white" />
        <circle cx="59.9" cy="30.2" r="1.3" fill="white" />
        <circle cx="41.3" cy="33.3" r="0.6" fill="white" opacity="0.85" />
        <circle cx="57.3" cy="33.3" r="0.6" fill="white" opacity="0.85" />

        {/* Nose - chấm nhỏ xíu cute */}
        <circle cx="50" cy="38" r="0.9" fill={skinDark} opacity="0.5" />

        {/* Mouth - cười nhỏ cute */}
        <path d="M46,43 Q50,46.5 54,43" stroke="#c07070" strokeWidth="1.6" fill="none" strokeLinecap="round" />

        {/* Glasses/Headband (over face) */}
        {(accessory === 1 || accessory === 2 || accessory === 4) && renderAccessory()}
      </g>

      {/* Neck */}
      <rect x="44" y="53" width="12" height="10" rx="2" fill={skinTone} />

      {/* Body - bo tròn mềm như thú bông */}
      <rect x="27" y="62" width="46" height="30" rx="16" fill={outfitColor} />
      <rect x="27" y="62" width="46" height="6" rx="16" fill="rgba(255,255,255,0.08)" />
      {/* Collar */}
      <path d="M45,62 L50,69 L55,62 Z" fill={darkenColor(outfitColor, 0.1)} />

      {/* Left arm - ngắn mập cute */}
      <path d="M29,68 Q17,76 13,88" stroke={outfitColor} strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="13" cy="88" r="6.5" fill={skinTone} />

      {/* Right arm */}
      <path d="M71,68 Q83,76 87,88" stroke={outfitColor} strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="87" cy="88" r="6.5" fill={skinTone} />

      {/* Pants - chân ngắn kiểu chibi */}
      <rect x="32" y="90" width="15" height="17" rx="7" fill={pants} />
      <rect x="53" y="90" width="15" height="17" rx="7" fill={pants} />

      {/* Shoes - to tròn cute, có chút highlight */}
      <ellipse cx="39" cy="110" rx="11" ry="6" fill="#22222e" />
      <ellipse cx="61" cy="110" rx="11" ry="6" fill="#22222e" />
      <ellipse cx="36" cy="108.3" rx="3" ry="1.4" fill="rgba(255,255,255,0.15)" />
      <ellipse cx="58" cy="108.3" rx="3" ry="1.4" fill="rgba(255,255,255,0.15)" />
    </svg>
  )
}

// Chữ cái đầu của tên (bỏ phần trong ngoặc, ví dụ "(IT)")
function getInitials(name: string) {
  const clean = name.replace(/\(.*?\)/g, ' ').trim()
  return clean.split(/\s+/).filter(Boolean).slice(-2).map(w => w[0]).join('').toUpperCase() || '?'
}

// Cắt vuông ở giữa và thu nhỏ ảnh còn tối đa 256px (JPEG) trước khi lưu vào hồ sơ
function resizeImageToDataUrl(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Không đọc được file ảnh.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('File không phải ảnh hợp lệ.'))
      img.onload = () => {
        const side = Math.min(img.width, img.height)
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2
        const out = Math.min(maxSize, side)
        const canvas = document.createElement('canvas')
        canvas.width = out; canvas.height = out
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Trình duyệt không hỗ trợ xử lý ảnh.')); return }
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, out, out)
        ctx.drawImage(img, sx, sy, side, side, 0, 0, out, out)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

// Compact avatar (head crop) used in cards, chat, lists
function CharAvatar({ user, size = 40 }: { user: User; size?: number }) {
  if (user.avatar.type === 'photo' && user.avatar.photoUrl) {
    return (
      <img src={user.avatar.photoUrl} alt={user.name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)', display: 'block' }} />
    )
  }
  const palette: [string, string][] = [
    ['#ede9fe', '#5b21b6'], ['#dbeafe', '#1d4ed8'], ['#dcfce7', '#15803d'],
    ['#fef3c7', '#b45309'], ['#fce7f3', '#be185d'], ['#e0f2fe', '#0369a1'],
  ]
  const seed = Array.from(user.id).reduce((s, c) => s + c.charCodeAt(0), 0)
  const [bg, fg] = palette[seed % palette.length]
  const initials = getInitials(user.name)
  return (
    <div title={user.name} style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: Math.max(10, Math.round(size * 0.38)), letterSpacing: 0.3,
    }}>{initials}</div>
  )
}

// Ảnh đại diện lớn dùng ở hồ sơ, dashboard. Chưa có ảnh thì hiện chữ cái đầu của tên
function FullAvatar({ avatar, size = 120, name }: { avatar: AvatarConfig; size?: number; name?: string }) {
  if (avatar.type === 'photo' && avatar.photoUrl) {
    return (
      <img src={avatar.photoUrl} alt={name ?? 'avatar'}
        style={{ width: size, height: size, borderRadius: '12px', objectFit: 'cover', display: 'block' }} />
    )
  }
  return (
    <div title={name} style={{
      width: size, height: size, borderRadius: '12px', background: `${avatar.outfitColor}22`, color: avatar.outfitColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: Math.round(size * 0.38), letterSpacing: 1,
    }}>{name ? getInitials(name) : '?'}</div>
  )
}

// ==================== AVATAR CREATOR ====================

// ==================== AVATAR UPLOADER (chỉ tải ảnh, không còn nhân vật) ====================

function AvatarCreator({ value, onChange, name }: { value: AvatarConfig; onChange: (a: AvatarConfig) => void; name?: string }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const hasPhoto = value.type === 'photo' && !!value.photoUrl

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Vui lòng chọn file ảnh (JPG, PNG, WebP).'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Ảnh lớn hơn 10MB, vui lòng chọn ảnh nhỏ hơn.'); return }
    setError(''); setBusy(true)
    try {
      const url = await resizeImageToDataUrl(file)
      onChange({ ...value, type: 'photo', photoUrl: url })
    } catch (err: any) {
      setError(err?.message ?? 'Không xử lý được ảnh.')
    }
    setBusy(false)
  }
  const removePhoto = () => onChange({ ...value, type: 'custom', photoUrl: undefined })

  return (
    <div>
      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Ảnh đại diện</p>
      <div className="flex gap-5 items-center">
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className="rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ width: 110, height: 110, background: `${value.outfitColor}22`, border: `2px solid ${value.outfitColor}50` }}>
            <FullAvatar avatar={value} size={102} name={name} />
          </div>
          <span className="text-gray-600 text-[10px]">Xem trước</span>
        </div>

        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
              style={{ background: '#14143a', border: '1px solid #2a2a5a', color: '#a78bfa' }}>
              {busy ? 'Đang xử lý...' : hasPhoto ? '📷 Đổi ảnh' : '📷 Chọn ảnh'}
            </button>
            {hasPhoto && (
              <button type="button" onClick={removePhoto}
                className="px-3 py-2 rounded-lg text-xs text-gray-400"
                style={{ background: '#14143a', border: '1px solid #1e1e4a' }}>Xóa ảnh</button>
            )}
          </div>
          <p className="text-gray-600 text-[11px]">JPG, PNG, WebP. Ảnh sẽ tự được cắt vuông và thu nhỏ.</p>
          {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </div>
    </div>
  )
}

// ==================== HELPERS / SMALL COMPONENTS ====================

const makeAvatar = (skinTone: string, hairStyle: number, hairColor: string, outfitColor: string, accessory = 0): AvatarConfig =>
  ({ type: 'custom', skinTone, hairStyle, hairColor, outfitColor, accessory })

const getLevel = (exp: number) => Math.max(1, Math.floor(Math.sqrt(exp / 40)) + 1)

const getExpProgress = (exp: number) => {
  const level = getLevel(exp)
  const cur = Math.pow(level - 1, 2) * 40
  const next = Math.pow(level, 2) * 40
  return { progress: Math.min(100, Math.max(0, ((exp - cur) / (next - cur)) * 100)), needed: next - exp, level }
}

const fmtDate = (s: string) => new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
const fmtTime = (s: string) => new Date(s).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

// Tên hiển thị gọn: bỏ phần trong ngoặc (chức danh) trước khi lấy từ cuối cùng
function shortName(fullName: string) {
  const withoutParens = fullName.replace(/\(.*?\)/g, '').trim()
  const parts = withoutParens.split(' ').filter(Boolean)
  return parts.length > 0 ? parts[parts.length - 1] : fullName
}

// Tìm các vị trí "@Tên đầy đủ" khớp với danh sách user trong nội dung tin nhắn
function parseMentions(content: string, users: User[]): { start: number; end: number; user: User }[] {
  const candidates = [...users].sort((a, b) => b.name.length - a.name.length)
  const matches: { start: number; end: number; user: User }[] = []
  let i = 0
  while (i < content.length) {
    if (content[i] === '@') {
      const rest = content.slice(i + 1)
      const match = candidates.find(u => rest.startsWith(u.name))
      if (match) {
        const end = i + 1 + match.name.length
        matches.push({ start: i, end, user: match })
        i = end
        continue
      }
    }
    i++
  }
  return matches
}

// Tìm các đường link http(s):// hoặc www. trong nội dung tin nhắn
function parseLinks(content: string): { start: number; end: number; url: string }[] {
  const regex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi
  const matches: { start: number; end: number; url: string }[] = []
  let m: RegExpExecArray | null
  while ((m = regex.exec(content)) !== null) {
    let end = m.index + m[0].length
    // Bỏ dấu câu thừa ở cuối link (dấu chấm, phẩy, ngoặc đóng...)
    while (end > m.index && /[.,!?)\]]/.test(content[end - 1])) end--
    if (end <= m.index) continue
    const raw = content.slice(m.index, end)
    const url = raw.startsWith('http') ? raw : `https://${raw}`
    matches.push({ start: m.index, end, url })
  }
  return matches
}

// Render nội dung tin nhắn: tô màu @tag (bấm để xem hồ sơ) và biến link thành đường dẫn bấm được
function renderMessageContent(content: string, users: User[], onMentionClick?: (u: User) => void, isMe?: boolean) {
  type Token = { start: number; end: number; type: 'mention'; user: User } | { start: number; end: number; type: 'link'; url: string }
  const mentionTokens: Token[] = parseMentions(content, users).map(m => ({ ...m, type: 'mention' as const }))
  const linkTokens: Token[] = parseLinks(content).map(l => ({ ...l, type: 'link' as const }))
  const tokens = [...mentionTokens, ...linkTokens].sort((a, b) => a.start - b.start)

  if (tokens.length === 0) return content

  const nodes: React.ReactNode[] = []
  let cursor = 0
  tokens.forEach((t, idx) => {
    if (t.start < cursor) return // bỏ qua nếu chồng lấn (hiếm khi xảy ra)
    if (t.start > cursor) nodes.push(content.slice(cursor, t.start))
    if (t.type === 'mention') {
      nodes.push(
        <span key={idx}
          onClick={e => { e.stopPropagation(); onMentionClick?.(t.user) }}
          style={{
            color: isMe ? '#fff' : '#b45309',
            fontWeight: 700,
            cursor: onMentionClick ? 'pointer' : 'default',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}>
          {content.slice(t.start, t.end)}
        </span>
      )
    } else {
      nodes.push(
        <a key={idx} href={t.url} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            color: isMe ? '#fff' : '#1d4ed8',
            fontWeight: 600,
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            wordBreak: 'break-all',
          }}>
          {content.slice(t.start, t.end)}
        </a>
      )
    }
    cursor = t.end
  })
  if (cursor < content.length) nodes.push(content.slice(cursor))
  return nodes
}

function LevelBadge({ exp }: { exp: number }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-white"
      style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}>
      Lv.{getLevel(exp)}
    </span>
  )
}

// Kiểm tra 1 tin nhắn có nằm trong phạm vi user này được xem không (dùng để đếm mention chính xác)
function isMessageVisibleTo(m: Message, user: User, users: User[]): boolean {
  if (m.channel === 'dm') return m.userId === user.id || m.toUserId === user.id
  if (m.channel === 'team') return users.find(u => u.id === m.userId)?.teamId === user.teamId
  return true
}

function ExpBarMini({ exp }: { exp: number }) {
  const { progress } = getExpProgress(exp)
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
      <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#f59e0b)', transition: 'width 0.6s ease' }} />
    </div>
  )
}

// ==================== MOCK DATA ====================

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Nguyễn Minh Khoa', role: 'manager', avatar: makeAvatar('#C68642', 0, '#1a1a1a', '#4f46e5', 0), exp: 3200, teamId: 't1', department: 'Engineering' },
  { id: 'u2', name: 'Trần Thị Mai', role: 'manager', avatar: makeAvatar('#E8A87C', 2, '#8B4513', '#0891b2', 4), exp: 2800, teamId: 't2', department: 'Design' },
  { id: 'u3', name: 'Lê Văn Nam', role: 'employee', avatar: makeAvatar('#8D5524', 0, '#1a1a1a', '#dc2626', 0), exp: 1850, teamId: 't1', department: 'Engineering' },
  { id: 'u4', name: 'Phạm Thu Thảo', role: 'employee', avatar: makeAvatar('#E8A87C', 5, '#4a2c0a', '#7c3aed', 1), exp: 2100, teamId: 't1', department: 'Engineering' },
  { id: 'u5', name: 'Hoàng Đức Minh', role: 'employee', avatar: makeAvatar('#FDBCB4', 1, '#C0392B', '#059669', 0), exp: 1620, teamId: 't1', department: 'Engineering' },
  { id: 'u6', name: 'Vũ Lan Anh', role: 'employee', avatar: makeAvatar('#FDBCB4', 3, '#FF69B4', '#ec4899', 4), exp: 1900, teamId: 't2', department: 'Design' },
  { id: 'u7', name: 'Đặng Quốc Hưng', role: 'employee', avatar: makeAvatar('#4A2912', 4, '#1a1a1a', '#374151', 0), exp: 2300, teamId: 't2', department: 'Design' },
  { id: 'u8', name: 'Bùi Thanh Tú', role: 'employee', avatar: makeAvatar('#C68642', 1, '#D4AC0D', '#d97706', 2), exp: 980, teamId: 't2', department: 'Design' },
]

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Xây dựng API authentication', description: 'Implement JWT authentication với refresh token và blacklist', expReward: 150, status: 'in-progress', assignedTo: ['u3'], projectManager: ['u1'], supporters: ['u4', 'u5'], createdBy: 'u1', dueDate: '2026-07-30', category: 'development', priority: 'high', selfCreated: false, important: false, urgent: false },  
  { id: 't2', title: 'Thiết kế UI Dashboard', description: 'Tạo Figma mockup cho trang dashboard chính theo Design System mới', expReward: 80, status: 'open', assignedTo: ['u6'], projectManager: ['u2'], supporters: ['u7'], createdBy: 'u2', dueDate: '2026-07-28', category: 'design', priority: 'medium', selfCreated: false , important: false, urgent: false},
  { id: 't3', title: 'Viết unit tests cho Payment', description: 'Coverage tối thiểu 80% cho toàn bộ module payment', expReward: 100, status: 'completed', assignedTo: ['u4'], projectManager: ['u1'], supporters: [], createdBy: 'u1', dueDate: '2026-07-22', category: 'development', priority: 'high', selfCreated: false, important: false, urgent: false },
  { id: 't4', title: 'Tối ưu query database', description: 'Giảm response time của báo cáo xuống dưới 2 giây', expReward: 120, status: 'open', assignedTo: [], projectManager: ['u1'], supporters: ['u3'], createdBy: 'u1', dueDate: '2026-08-05', category: 'development', priority: 'medium', selfCreated: false, important: false, urgent: false },
  { id: 't5', title: 'Học React Query', description: 'Tự học và áp dụng React Query vào dự án hiện tại', expReward: 60, status: 'in-progress', assignedTo: ['u3'], projectManager: [], supporters: [], createdBy: 'u3', dueDate: '2026-07-29', category: 'research', priority: 'low', selfCreated: true , important: false, urgent: false},
  { id: 't6', title: 'Review PR của team', description: 'Review ít nhất 5 pull request trong tuần này', expReward: 40, status: 'open', assignedTo: ['u5'], projectManager: ['u1'], supporters: [], createdBy: 'u1', dueDate: '2026-07-26', category: 'development', priority: 'low', selfCreated: false , important: false, urgent: false},
  { id: 't7', title: 'Xây dựng Design System', description: 'Setup Storybook và tạo component library đầy đủ', expReward: 200, status: 'open', assignedTo: ['u7'], projectManager: ['u2'], supporters: ['u6', 'u8'], createdBy: 'u2', dueDate: '2026-08-10', category: 'design', priority: 'high', selfCreated: false, important: false, urgent: false },
  { id: 't8', title: 'Viết tài liệu API', description: 'Swagger docs đầy đủ cho tất cả API endpoints', expReward: 70, status: 'open', assignedTo: [], projectManager: ['u1'], supporters: [], createdBy: 'u1', dueDate: '2026-08-01', category: 'development', priority: 'medium', selfCreated: false, important: false, urgent: false },
]

const INITIAL_MESSAGES: Message[] = [
  { id: 'm1', userId: 'u1', content: '🎉 Chào mừng team đến với WorkQuest! Hãy cùng chinh phục những thử thách mới nhé!', timestamp: '2026-07-23T08:00:00', channel: 'announcements' },
  { id: 'm2', userId: 'u3', content: 'API auth đang tiến triển tốt, dự kiến xong vào thứ 5!', timestamp: '2026-07-23T09:15:00', channel: 'general' },
  { id: 'm3', userId: 'u4', content: 'Vừa hoàn thành unit test rồi mọi người ơi! 🎊', timestamp: '2026-07-23T09:30:00', channel: 'general' },
  { id: 'm4', userId: 'u6', content: 'Ai có design brief cho dashboard không? Chia sẻ mình với!', timestamp: '2026-07-23T10:00:00', channel: 'general' },
  { id: 'm5', userId: 'u2', content: 'Đã upload lên Drive rồi nha Lan Anh, check folder "Q3 Design" nhé 📁', timestamp: '2026-07-23T10:05:00', channel: 'general' },
  { id: 'm6', userId: 'u5', content: 'React Query hay thật, đang tìm hiểu Optimistic Updates 🚀', timestamp: '2026-07-23T10:45:00', channel: 'general' },
  { id: 'm7', userId: 'u7', content: 'Design System đang setup xong Storybook, sẽ share preview link hôm nay!', timestamp: '2026-07-23T11:00:00', channel: 'general' },
  { id: 'm8', userId: 'u1', content: '🏆 Tuần này team Engineering hoàn thành 87% target! Keep it up!', timestamp: '2026-07-23T11:30:00', channel: 'announcements' },
  { id: 'm9', userId: 'u3', content: 'Cần hỗ trợ setup môi trường test không team?', timestamp: '2026-07-23T13:00:00', channel: 'team' },
  { id: 'm10', userId: 'u4', content: 'Mình có thể giúp, nhắn sau standup nhé! 💪', timestamp: '2026-07-23T13:10:00', channel: 'team' },
]

const REWARDS: Reward[] = [
  { id: 'r1', name: 'Voucher WinMart', description: 'Voucher mua sắm 100.000đ', cost: 200, emoji: '🛒', category: 'Mua sắm' },
  { id: 'r2', name: 'Nghỉ phép 1 ngày', description: '01 ngày nghỉ có hưởng lương', cost: 1000, emoji: '🏖️', category: 'Phúc lợi' },
  { id: 'r3', name: 'Voucher Grab', description: 'Voucher GrabFood/GrabCar 200.000đ', cost: 500, emoji: '🛵', category: 'Phúc lợi' },
  { id: 'r4', name: 'Team Lunch', description: 'Bữa trưa cùng team tối đa 8 người', cost: 800, emoji: '🍜', category: 'Ẩm thực' },
  { id: 'r5', name: 'Voucher Shopee', description: 'Voucher mua sắm 150.000đ', cost: 350, emoji: '🛍️', category: 'Mua sắm' },
  { id: 'r6', name: 'Combo phụ kiện', description: 'Chuột, bàn phím hoặc tai nghe', cost: 3000, emoji: '🖥️', category: 'Thiết bị' },
  { id: 'r7', name: 'WFH 1 ngày', description: 'Làm việc từ xa 1 ngày', cost: 150, emoji: '🏠', category: 'Phúc lợi' },
  { id: 'r8', name: 'Voucher CGV', description: 'Voucher xem phim 150.000đ', cost: 250, emoji: '🎬', category: 'Giải trí' },
  { id: 'r9', name: 'Khám sức khỏe', description: 'Voucher khám sức khỏe 300.000đ', cost: 400, emoji: '🩺', category: 'Sức khỏe' },
]


const TEAMS = [
  { id: 't1a', name: 'KNI Office - Ban Giám đốc', emoji: '👑' },
  { id: 't1b', name: 'KNI Office - Văn phòng HĐQT', emoji: '📋' },
  { id: 't1c', name: 'KNI Office - Nhân sự-IT-Pháp chế', emoji: '🧑‍💻' },
  { id: 't1d', name: 'KNI Office - Truyền thông-Marketing', emoji: '📣' },
  { id: 't1e', name: 'KNI Office - Kế toán', emoji: '💰' },
  { id: 't1f', name: 'KNI Office - Dự án', emoji: '🏗️' },
  { id: 't1g', name: 'KNI Office - Hỗ trợ', emoji: '🚗' },
  { id: 't2', name: 'First Steps', emoji: '🌱' },
  { id: 't3a', name: 'Genki House - Điều hành', emoji: '👑' },
  { id: 't3b', name: 'Genki House - Bếp', emoji: '🍳' },
  { id: 't3c', name: 'Genki House - Y tế-Trị liệu', emoji: '⚕️' },
  { id: 't3d', name: 'Genki House - Hoạt động-Chăm sóc', emoji: '🧘' },
  { id: 't3e', name: 'Genki House - Kinh doanh-Lễ tân', emoji: '💼' },
  { id: 't3f', name: 'Genki House - Hỗ trợ', emoji: '🧹' },
  { id: 't4', name: 'Genki Farm', emoji: '🌾' },
  { id: 't5', name: 'Les Sens Phú Quốc', emoji: '🏝️' },
  { id: 't6', name: 'ACVN', emoji: '🎓' },
]



const CATEGORY_COLORS: Record<string, string> = {
  development: '#8b5cf6', design: '#06b6d4', marketing: '#f59e0b',
  research: '#10b981', operations: '#f97316', personal: '#6b7280',
}
const PRIORITY_CONFIG = {
  high: { label: 'Cao', color: '#ef4444', bg: '#200a0a' },
  medium: { label: 'Trung bình', color: '#f59e0b', bg: '#1a1000' },
  low: { label: 'Thấp', color: '#6b7280', bg: '#111118' },
}
const SLA_LEVELS: Record<string, { label: string; hours: number; color: string }> = {
  P1: { label: 'P1 · 1 giờ', hours: 1, color: '#dc2626' },
  P2: { label: 'P2 · 4 giờ', hours: 4, color: '#d97706' },
  P3: { label: 'P3 · 1 ngày', hours: 24, color: '#2563eb' },
  P4: { label: 'P4 · 3 ngày', hours: 72, color: '#059669' },
}

const WORK_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  received: { label: '📥 Đã nhận', color: '#6b7280' },
  processing: { label: '⚙️ Đang xử lý', color: '#2563eb' },
  pending: { label: '⏸ Tạm hoãn', color: '#d97706' },
  complete: { label: '✅ Complete', color: '#059669' },
}

// Sinh mã task dạng TASK{ddmmyy}-{số thứ tự trong ngày}
function generateTaskCode(startDate: string, existingTasks: Task[]) {
  const d = new Date(startDate)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  const prefix = `TASK${dd}${mm}${yy}`
  const countSameDay = existingTasks.filter(t => t.taskCode?.startsWith(prefix)).length
  return `${prefix}-${String(countSameDay + 1).padStart(2, '0')}`
}
// Mã viết tắt của công ty, dùng làm tiền tố tên task (sửa lại cho đúng ý bạn)
const COMPANY_CODES: Record<string, string> = {
  'KNI Office': 'KNI',
  'Genki House': 'GH',
  'Genki Farm': 'GF',
  'First Steps': 'FS',
  'Les Sens Phú Quốc': 'LSPQ',
  'ACVN': 'ACVN',
}

// Gắn tiền tố "KNI-" vào tên task; nếu đổi công ty thì gỡ tiền tố cũ trước
const withCompanyPrefix = (title: string, company?: string, oldCompany?: string) => {
  let t = title.trim()
  const oldCode = oldCompany ? COMPANY_CODES[oldCompany] : undefined
  if (oldCode && t.toLowerCase().startsWith(`${oldCode}-`.toLowerCase())) t = t.slice(oldCode.length + 1).trim()
  const code = company ? COMPANY_CODES[company] : undefined
  if (!code) return t
  return t.toLowerCase().startsWith(`${code}-`.toLowerCase()) ? t : `${code}-${t}`
}

// Sắp task cũ nhất ở trên, mới nhất ở dưới cùng
const byCreatedAsc = (a: Task, b: Task) => {
  const ka = a.createdAt ?? a.startDate ?? ''
  const kb = b.createdAt ?? b.startDate ?? ''
  if (ka !== kb) return ka < kb ? -1 : 1
  return (a.taskCode ?? '').localeCompare(b.taskCode ?? '')
}
// Task mới nhất ở trên cùng (dùng cho dạng Thẻ)
const byCreatedDesc = (a: Task, b: Task) => byCreatedAsc(b, a)
// Tính hạn SLA và kiểm tra trễ hạn
function getSlaDeadline(task: Task): Date | null {
  if (!task.slaLevel || !task.startedAt) return null
  const start = new Date(task.startedAt)
  return new Date(start.getTime() + SLA_LEVELS[task.slaLevel].hours * 3600000)
}

function isSlaOverdue(task: Task): boolean {
  const deadline = getSlaDeadline(task)
  if (!deadline) return false
  if (task.workStatus === 'complete' || task.status === 'completed') return false
  return new Date() > deadline
}

// Tổng thời gian đã "Đang xử lý" (cộng dồn qua các lần tạm dừng/tiếp tục), tính bằng giây
function getElapsedProcessingSeconds(task: Task): number {
  const base = task.totalProcessingSeconds ?? 0
  if (task.workStatus === 'processing' && task.processingStartedAt) {
    return base + Math.floor((Date.now() - new Date(task.processingStartedAt).getTime()) / 1000)
  }
  return base
}
function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  if (h > 0) return `${h}:${mm}:${ss}`
  return `${mm}:${ss}`
}
const PRIORITY_EXP_LIMITS: Record<TaskPriority, { min: number; max: number; suggested: number; hint: string }> = {
  low: { min: 20, max: 60, suggested: 30, hint: '💡 Việc dễ, xong trong ngày → nên cho 20–60 EXP' },
  medium: { min: 60, max: 150, suggested: 80, hint: '💡 Việc vừa, làm 2–3 ngày → nên cho 60–150 EXP' },
  high: { min: 150, max: 300, suggested: 200, hint: '💡 Việc khó, nhiều ngày/phức tạp → nên cho 150–300 EXP' },
}
function getExpRange(priority: TaskPriority, important: boolean, urgent: boolean) {
  const base = PRIORITY_EXP_LIMITS[priority]
  const multiplier = (important ? 1.25 : 1.0) * (urgent ? 1.2 : 1.0)
  return {
    min: Math.round(base.min * multiplier),
    max: Math.round(base.max * multiplier),
    suggested: Math.round(base.suggested * multiplier),
  }
}
function suggestExp(priority: TaskPriority, startDate: string, dueDate: string, important: boolean, urgent: boolean): number {
  const range = getExpRange(priority, important, urgent)
  if (!startDate || !dueDate) return range.suggested

  const days = Math.round((new Date(dueDate).getTime() - new Date(startDate).getTime()) / 86400000)
  const clampedDays = Math.min(Math.max(days, 1), 7)
  const ratio = (7 - clampedDays) / 6 // 1 ngày → ratio 1 (điểm cao nhất khung); 7+ ngày → ratio 0 (điểm thấp nhất khung)

  return Math.round(range.min + (range.max - range.min) * ratio)
}
// % của EXP gốc mà mỗi người "Hỗ trợ" nhận được khi task hoàn thành (Phụ trách/PM luôn nhận đủ 100%)
const SUPPORTER_EXP_PERCENT = 0.3
const STATUS_CONFIG = {
  open: { label: 'Chưa bắt đầu', color: '#6b7280' },
  'in-progress': { label: 'Đang làm', color: '#06b6d4' },
  submitted: { label: 'Chờ duyệt', color: '#a78bfa' },
  completed: { label: 'Hoàn thành', color: '#10b981' },
}

// ==================== THEME ====================
type ThemeMode = 'dark' | 'light'

const THEMES: Record<ThemeMode, {
  bgApp: string; bgSidebar: string; bgPanel: string; bgCard: string; bgCardAlt: string
  border: string; borderStrong: string
  textPrimary: string; textSecondary: string; textMuted: string; textFaint: string
  inputBg: string
}> = {
  dark: {
    bgApp: '#080812', bgSidebar: '#06060f', bgPanel: '#0e0e24', bgCard: '#12122a', bgCardAlt: '#0a0a1a',
    border: '#1e1e4a', borderStrong: '#2a2a5a',
    textPrimary: '#f1f5f9', textSecondary: '#9ca3af', textMuted: '#6b7280', textFaint: '#374151',
    inputBg: '#14143a',
  },
  light: {
    bgApp: '#f4f5fb', bgSidebar: '#ffffff', bgPanel: '#ffffff', bgCard: '#f7f8fc', bgCardAlt: '#eef0f9',
    border: '#e2e4f0', borderStrong: '#cdd0e8',
    textPrimary: '#1a1a2e', textSecondary: '#4b5568', textMuted: '#8b8ba0', textFaint: '#b8bad0',
    inputBg: '#ffffff',
  },
}

function useThemeVars(mode: ThemeMode) {
  const t = THEMES[mode]
  return {
    '--bg-app': t.bgApp, '--bg-sidebar': t.bgSidebar, '--bg-panel': t.bgPanel,
    '--bg-card': t.bgCard, '--bg-card-alt': t.bgCardAlt,
    '--border': t.border, '--border-strong': t.borderStrong,
    '--text-primary': t.textPrimary, '--text-secondary': t.textSecondary,
    '--text-muted': t.textMuted, '--text-faint': t.textFaint,
    '--input-bg': t.inputBg,
  } as React.CSSProperties
}


function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup')
  const [step] = useState<'setup'>('setup')
  const [role, setRole] = useState<Role>('employee')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<AvatarConfig>({ ...DEFAULT_AVATAR })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupCode, setSignupCode] = useState('')
  const [agreedTerms, setAgreedTerms] = useState(false)

  const handleSignUp = async () => {
  if (!email.trim() || !password.trim()) return
  if (!agreedTerms) { setError('Vui lòng đọc và đồng ý với điều khoản bảo mật mã xác nhận trước khi tạo tài khoản.'); return }
  setError('')
  setLoading(true)

  const { data: directoryEntry, error: lookupError } = await supabase
  .from('employee_directory')
  .select('*')
  .eq('email', email.trim().toLowerCase())
  .maybeSingle()

if (lookupError) { setLoading(false); setError('Lỗi tra cứu: ' + lookupError.message); return }
if (!directoryEntry) {
  setLoading(false)
  setError('Email này không có trong danh sách nhân viên công ty.')
  return
}
if (directoryEntry.signup_code !== signupCode.trim().toUpperCase()) {
  setLoading(false)
  setError('Mã xác nhận không đúng. Liên hệ quản trị viên để lấy lại mã.')
  return
}

  const { data, error: signUpError } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { display_name: name.trim(), avatar } },
  })
  if (signUpError) { setLoading(false); setError(signUpError.message); return }
  if (!data.user) { setLoading(false); setError('Kiểm tra email để xác nhận tài khoản, sau đó đăng nhập lại.'); return }

  const team = TEAMS.find(t => t.id === directoryEntry.team_id)

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: data.user.id,
    name: name.trim() || directoryEntry.full_name,
    role: directoryEntry.role,
    avatar,
    exp: 0,
    team_id: directoryEntry.team_id,
    department: team?.name ?? '',
    email: email.trim().toLowerCase(),
  })

  setLoading(false)
  if (profileError) { setError(profileError.message); return }

  if (!data.session) {
    setError('Đăng ký thành công! Kiểm tra email để xác nhận, sau đó quay lại đăng nhập.')
    return
  }
  onLoggedIn()
}

const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) return
    setError('')
    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) { setError(signInError.message); return }
    onLoggedIn()
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 18% 20%, #3b1e8a30 0%, transparent 45%),
          radial-gradient(circle at 85% 15%, #f59e0b18 0%, transparent 40%),
          radial-gradient(circle at 75% 85%, #0891b230 0%, transparent 45%),
          linear-gradient(160deg, #0a0a16 0%, #050509 100%)
        `,
        fontFamily: 'Inter, sans-serif',
      }}>
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            width: Math.random() * 4 + 1, height: Math.random() * 4 + 1,
            left: `${(i * 17 + 5) % 100}%`, top: `${(i * 23 + 8) % 100}%`,
            background: i % 2 === 0 ? '#7c3aed' : '#f59e0b',
            animation: `float ${3 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${(i * 0.4) % 3}s`,
          }} />
      ))}

      <div className="w-full max-w-2xl mx-4 relative z-10">
        <div className="text-center mb-7">
          <div className="inline-flex flex-col items-center gap-3 mb-3">
            <img src={companyLogo} alt="KNI Investment Holdings"
              className="h-16 rounded-xl" style={{ filter: 'drop-shadow(0 0 20px #7c3aed40)' }} />
            <h1 className="text-2xl font-black tracking-widest"
              style={{ fontFamily: 'Rajdhani, sans-serif', color: '#e2e8f0' }}>
              KNI TASK MANAGEMENT
            </h1>
          </div>
          <p className="text-gray-500 text-sm tracking-widest uppercase">Hệ thống quản lý công việc nội bộ</p>
        </div>

        {/* --- Chuyển đổi Đăng nhập / Đăng ký --- */}
        <div className="flex justify-center gap-2 mb-5">
          <button onClick={() => { setAuthMode('signup'); setError('') }}
            className="px-5 py-1.5 rounded-full text-xs font-bold tracking-wide"
            style={{ background: authMode === 'signup' ? 'linear-gradient(135deg,#7c3aed,#f59e0b)' : '#14143a', color: authMode === 'signup' ? '#fff' : '#6b7280' }}>
            TẠO TÀI KHOẢN
          </button>
          <button onClick={() => { setAuthMode('signin'); setError('') }}
            className="px-5 py-1.5 rounded-full text-xs font-bold tracking-wide"
            style={{ background: authMode === 'signin' ? 'linear-gradient(135deg,#7c3aed,#f59e0b)' : '#14143a', color: authMode === 'signin' ? '#fff' : '#6b7280' }}>
            ĐĂNG NHẬP
          </button>
        </div>

        {authMode === 'signin' ? (
          /* --- FORM ĐĂNG NHẬP (cho người đã có tài khoản) --- */
          <div className="rounded-2xl p-6 animate-slide-up" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
            <h2 className="text-white text-xl font-bold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Đăng nhập</h2>
            <p className="text-gray-500 text-sm mb-5">Quay lại hành trình của bạn</p>

            <div className="mb-3">
              <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="ban@congty.com"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
                style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
            </div>

            <div className="mb-2">
              <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Mật khẩu</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
                style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
            </div>

            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

            <button onClick={handleSignIn} disabled={loading || !email.trim() || !password.trim()}
              className="w-full mt-3 py-3.5 rounded-xl font-bold text-white text-lg tracking-wide transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                background: 'linear-gradient(135deg, #7c3aed, #f59e0b)',
                boxShadow: '0 0 30px #7c3aed50',
              }}>
              {loading ? 'ĐANG XỬ LÝ...' : 'VÀO GAME ⚡'}
            </button>
          </div>
        
          ) : (
          /* --- BƯỚC 2 CỦA ĐĂNG KÝ: tên, avatar + email/password mới --- */
          <div className="rounded-2xl p-6 animate-slide-up" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
            <div className="mb-5">
              <h2 className="text-white text-xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Tạo hồ sơ</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Tên của bạn</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Nhập tên hiển thị..."
                  autoComplete="off"
                  name="display-name-no-autofill"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
                  style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
              </div>
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="ban@congty.com"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
                  style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
              </div>
            </div>
            
            <div className="mb-2">
              <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Mã xác nhận (do công ty cấp)</label>
              <input type="text" value={signupCode} onChange={e => setSignupCode(e.target.value)}
                placeholder="VD: A3F9K2"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none uppercase"
                style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
            </div>
            <p className="text-amber-400/80 text-[11px] mb-4 leading-relaxed">
              ⚠️ Mã xác nhận này là thông tin riêng tư, chỉ dành cho bạn. Vui lòng không cung cấp mã cho bất kỳ ai khác dưới mọi hình thức.
            </p>

            <div className="mb-4">
              <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Mật khẩu</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignUp()}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
                style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
            </div>

            <AvatarCreator value={avatar} onChange={setAvatar} name={name} />

            <label className="flex items-start gap-2.5 mt-5 cursor-pointer select-none">
              <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded accent-violet-500 flex-shrink-0" />
              <span className="text-gray-400 text-xs leading-relaxed">
                Tôi đã đọc và đồng ý rằng mã xác nhận là thông tin bảo mật riêng của tôi, tôi sẽ không chia sẻ cho bất kỳ ai khác.
              </span>
            </label>

            {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

            <button onClick={handleSignUp} disabled={loading || !name.trim() || !email.trim() || !password.trim() || !agreedTerms}
              className="w-full mt-5 py-3.5 rounded-xl font-bold text-white text-lg tracking-wide transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                background: (name.trim() && email.trim() && password.trim() && agreedTerms) ? 'linear-gradient(135deg, #7c3aed, #f59e0b)' : '#1e1e3a',
                boxShadow: (name.trim() && email.trim() && password.trim() && agreedTerms) ? '0 0 30px #7c3aed50' : 'none',
              }}>
              {loading ? 'ĐANG XỬ LÝ...' : 'BẮT ĐẦU HÀNH TRÌNH ⚡'}
            </button>
          </div>
        )}
        <p className="text-center text-gray-700 text-xs mt-4">WorkQuest v1.0 — Gamify Your Workday</p>
      </div>
    </div>
  )
}
// ===== Nhóm trạng thái task cho Dashboard =====
type TaskBucket = 'received' | 'processing' | 'pending' | 'completed' | 'closed'

const BUCKET_META: Record<TaskBucket, { label: string; color: string }> = {
  received: { label: 'Received', color: '#6b7280' },
  processing: { label: 'In-process', color: '#2563eb' },
  pending: { label: 'Pending', color: '#d97706' },
  completed: { label: 'Completed', color: '#059669' },
  closed: { label: 'Close', color: '#7c3aed' },
}

// Mỗi task thuộc đúng 1 nhóm
const statusBucket = (t: Task): TaskBucket => {
  if (t.status === 'completed') return 'closed'                                     // quản lý đã duyệt
  if (t.workStatus === 'complete' || t.status === 'submitted') return 'completed'   // đã làm xong / đã nộp, chờ quản lý đóng
  if (t.workStatus === 'pending') return 'pending'
  if (t.workStatus === 'processing' || t.status === 'in-progress') return 'processing'
  return 'received'
}

// Ô Completed: tính theo nhân viên báo (complete_issue).
// Ô Close: tính theo quản lý chọn (close_result).
const taskHadIssue = (t: Task) =>
  t.status === 'completed'
    ? (t.closeResult ? t.closeResult === 'with_issue' : !!t.completeIssue)
    : !!t.completeIssue

function StatusStatCard({ icon, label, color, total, subs, active, onClick }: {
  icon: string; label: string; color: string; total: number
  subs?: { label: string; value: number; color: string }[]
  active?: boolean; onClick?: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl p-4" onClick={onClick}
  style={{
    background: 'var(--bg-panel)',
    border: `1px solid ${active ? color : 'var(--border)'}`,
    boxShadow: active ? `0 0 0 2px ${color}33` : 'none',
    cursor: onClick ? 'pointer' : 'default',
  }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-2xl font-black" style={{ color, fontFamily: 'Rajdhani, sans-serif' }}>{total}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
        {subs && (
          <button type="button" onClick={e => { e.stopPropagation(); setOpen(o => !o) }} title="Xem chi tiết" className="text-xs px-1.5 rounded" style={{ color }}>
            {open ? '▴' : '▾'}
          </button>
        )}
      </div>
      {subs && open && (
        <div className="mt-2 pt-2 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
          {subs.map(s => (
            <div key={s.label} className="flex items-center justify-between text-[11px]">
              <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
              <span className="font-bold" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ===== Tờ trình / đề xuất của tôi =====
function DashboardProposals({ proposals, currentUser, onOpen, onViewAll }: {
  proposals: Proposal[]; currentUser: User; onOpen?: (id: string) => void; onViewAll: () => void
}) {
  const [myPendingIds, setMyPendingIds] = useState<string[]>([])
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('proposal_steps').select('proposal_id').eq('approver_id', currentUser.id).eq('status', 'pending')
      setMyPendingIds((data ?? []).map((x: any) => x.proposal_id))
    }
    load()
    const ch = supabase.channel(`dash-steps-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposal_steps' }, () => { load() })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [currentUser.id])

  const mine = proposals.filter(p => p.submittedBy === currentUser.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const needMe = proposals.filter(p => p.status === 'pending' && myPendingIds.includes(p.id)).length
  const isReview = (p: Proposal) => p.status === 'rejected' && !!p.rejectedReason?.startsWith('[REVIEW]')
  const chip = (p: Proposal): [string, string, string] =>
    p.status === 'pending' ? ['⏳ Chờ duyệt', '#fbbf2422', '#d97706']
    : isReview(p) ? ['🔁 Xem xét lại', '#fbbf2433', '#b45309']
    : p.status === 'rejected' ? ['❌ Từ chối', '#f8717122', '#dc2626']
    : ['✅ Đã duyệt', '#34d39922', '#059669']
  const nPending = mine.filter(p => p.status === 'pending').length
  const nApproved = mine.filter(p => p.status === 'approved').length
  const nRejected = mine.filter(p => p.status === 'rejected').length
  const pill = (label: string, n: number, color: string) => (
    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--bg-card-alt)', color }}>{label} {n}</span>
  )

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <h3 className="font-bold flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
          📜 Tờ trình / Đề xuất của tôi
          <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>{mine.length}</span>
        </h3>
        <button type="button" onClick={onViewAll} className="text-xs font-semibold" style={{ color: '#8b5cf6' }}>Xem tất cả →</button>
      </div>
      <div className="flex gap-1.5 flex-wrap mb-3">
        {pill('⏳ Chờ duyệt', nPending, '#d97706')}
        {pill('✅ Đã duyệt', nApproved, '#059669')}
        {pill('❌ Từ chối / xem xét lại', nRejected, '#dc2626')}
        {needMe > 0 && (
          <button type="button" onClick={onViewAll} className="text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background: '#7c3aed22', color: '#7c3aed' }}>
            📥 {needMe} cái cần bạn duyệt
          </button>
        )}
      </div>
      {mine.length === 0 ? (
        <p className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>Bạn chưa gửi tờ trình hay đề xuất nào.</p>
      ) : (
        <div>
          {mine.slice(0, 5).map(p => {
            const [label, bg, color] = chip(p)
            return (
              <button key={p.id} type="button" onClick={() => onOpen?.(p.id)}
                className="w-full text-left py-2 flex items-center justify-between gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="min-w-0">
                  <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    <span className="font-mono text-[11px] mr-2" style={{ color: 'var(--text-muted)' }}>{p.code ?? ''}</span>{p.title}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {p.groupName ?? (p.kind === 'totrinh' ? 'Tờ trình' : 'Đề xuất')} · {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold whitespace-nowrap flex-shrink-0" style={{ background: bg, color }}>{label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ===== Dự án trên Dashboard =====
function DashboardProjects({ currentUser, tasks, onOpen, onViewAll }: {
  currentUser: User; tasks: Task[]; onOpen?: (id: string) => void; onViewAll: () => void
}) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [p, m] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('project_members').select('project_id, user_id'),
      ])
      const byProject: Record<string, string[]> = {}
      ;(m.data ?? []).forEach((x: any) => { (byProject[x.project_id] ??= []).push(x.user_id) })
      setProjects((p.data ?? []).map((x: any) => mapDbProject(x, byProject[x.id] ?? [])))
      setLoading(false)
    }
    load()
    const ch = supabase.channel(`dash-projects-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => { load() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members' }, () => { load() })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const isDir = !!currentUser.isDirector
  const isMgr = currentUser.role === 'manager'
  const canSee = (p: Project) =>
    isDir || p.createdBy === currentUser.id || p.managerId === currentUser.id || p.ownerId === currentUser.id ||
    p.memberIds.includes(currentUser.id) || (isMgr && p.teamId === currentUser.teamId)
  const visible = projects.filter(canSee)
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
          🗂️ Dự án
          <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>{visible.length}</span>
        </h3>
        <button type="button" onClick={onViewAll} className="text-xs font-semibold" style={{ color: '#8b5cf6' }}>Xem tất cả →</button>
      </div>
      {loading ? (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Đang tải...</p>
      ) : visible.length === 0 ? (
        <p className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>Bạn chưa tham gia dự án nào.</p>
      ) : (
        <div>
          {visible.slice(0, 5).map(p => {
            const list = tasks.filter(t => t.projectId === p.id)
            const done = list.filter(t => t.status === 'completed').length
            const pct = list.length ? Math.round((done / list.length) * 100) : 0
            const waiting = list.filter(t => t.status === 'submitted').length
            const overdue = list.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr).length
            const st = PROJECT_STATUS[p.status] ?? PROJECT_STATUS.planning
            return (
              <button key={p.id} type="button" onClick={() => onOpen?.(p.id)} className="w-full text-left py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    <span className="font-mono text-[11px] mr-2" style={{ color: 'var(--text-muted)' }}>{p.code}</span>{p.name}
                  </p>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap flex-shrink-0" style={{ background: st[1], color: st[2] }}>{st[0]}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mt-1.5" style={{ background: 'var(--bg-card-alt)' }}>
                  <div className="h-full" style={{ width: `${pct}%`, background: '#059669' }} />
                </div>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {pct}% · {done}/{list.length} task · {p.memberIds.length} thành viên
                  {waiting > 0 && <span style={{ color: '#7c3aed' }}> · 📤 {waiting} chờ duyệt</span>}
                  {overdue > 0 && <span style={{ color: '#dc2626' }}> · ⚠️ {overdue} quá hạn</span>}
                </p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ===== Quản lý xem Dashboard của 1 nhân viên (chỉ xem) =====
function EmployeeDashboardModal({ employee, tasks, users, proposals, onClose }: {
  employee: User; tasks: Task[]; users: User[]; proposals: Proposal[]; onClose: () => void
}) {
  return (
    <div className="fixed inset-x-0 top-16 bottom-14 md:bottom-0 z-50 flex flex-col" style={{ background: 'var(--bg-app)' }}>
      <div className="shrink-0 flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <CharAvatar user={employee} size={32} />
          <div className="min-w-0">
            <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>Dashboard của {employee.name}</div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>👁 Chế độ chỉ xem</div>
          </div>
        </div>
        <button type="button" onClick={onClose}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          ✕ Đóng
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <DashboardView
          currentUser={employee} tasks={tasks} users={users} proposals={proposals}
          setView={() => {}} readOnly />
      </div>
    </div>
  )
}

// ===== Bảng nhân viên: quản lý xem phòng ban mình, BOD xem toàn công ty =====
function DashboardPeople({ currentUser, users, tasks, proposals }: { currentUser: User; users: User[]; tasks: Task[]; proposals: Proposal[] }) {
  const isDir = !!currentUser.isDirector
  const [viewing, setViewing] = useState<User | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const todayStr = new Date().toISOString().split('T')[0]

  const statOf = (uid: string) => {
    const mine = tasks
      .filter(t => t.assignedTo.includes(uid) || (t.selfCreated && t.createdBy === uid) || t.supporters.includes(uid))
      .filter(t => !isTaskGated(t))   // task tự tạo đang chờ duyệt thì chưa tính
    const c: Record<TaskBucket, number> = { received: 0, processing: 0, pending: 0, completed: 0, closed: 0 }
    mine.forEach(t => { c[statusBucket(t)]++ })
    const overdue = mine.filter(t => {
      const b = statusBucket(t)
      return b !== 'closed' && b !== 'completed' && !!t.dueDate && t.dueDate < todayStr
    }).length
    return { ...c, overdue }
  }

  const renderRow = (u: User, rank: number) => {
    const s = statOf(u.id)
    return (
      <div key={u.id} onClick={() => setViewing(u)} title="Bấm để xem Dashboard"
        className="flex items-center gap-2.5 py-1.5 px-1.5 rounded-lg cursor-pointer transition-colors hover:bg-[color:var(--bg-card-alt)]">
        <span className="text-xs w-5 font-mono text-right flex-shrink-0" style={{ color: 'var(--text-muted)' }}>#{rank}</span>
        <CharAvatar user={u} size={28} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {u.name}
            {u.role === 'manager' && <span className="ml-1 text-[9px] px-1 rounded font-bold" style={{ background: '#a78bfa22', color: '#8b5cf6' }}>QL</span>}
          </div>
          <div className="text-[10px] flex flex-wrap gap-x-2" style={{ color: 'var(--text-muted)' }}>
            <span title="Received">📥 {s.received}</span>
            <span title="In-process">⚙️ {s.processing}</span>
            <span title="Pending">⏸ {s.pending}</span>
            <span title="Completed">✅ {s.completed}</span>
            <span title="Close">🔒 {s.closed}</span>
            {s.overdue > 0 && <span className="font-bold" style={{ color: '#dc2626' }}>⚠️ {s.overdue} quá hạn</span>}
          </div>
        </div>
        <div className="text-amber-500 text-xs font-bold flex-shrink-0" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{u.exp}</div>
      </div>
    )
  }

  const box = { background: 'var(--bg-panel)', border: '1px solid var(--border)' }
  const h3 = { fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }

  if (!isDir) {
    const team = TEAMS.find(t => t.id === currentUser.teamId)
    const members = users.filter(u => u.teamId === currentUser.teamId && u.id !== currentUser.id).sort((a, b) => b.exp - a.exp)
    return (
      <div className="rounded-xl p-5 self-start" style={box}>
        <h3 className="font-bold mb-1" style={h3}>👥 Nhân viên phòng ban</h3>
        <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>{team ? `${team.emoji} ${team.name}` : 'Phòng ban của bạn'} · {members.length} người</p>
        <div className="max-h-[70vh] overflow-y-auto">
          {members.length === 0 && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chưa có nhân viên nào trong phòng ban.</p>}
          {members.map((u, i) => renderRow(u, i + 1))}
        </div>
            {viewing && <EmployeeDashboardModal employee={viewing} tasks={tasks} users={users} proposals={proposals} onClose={() => setViewing(null)} />}
      </div>
    )
  }

  const known = new Set(TEAMS.map(t => t.id))
  const groups: { id: string; title: string; members: User[] }[] = TEAMS
    .map(t => ({ id: t.id, title: `${t.emoji} ${t.name}`, members: users.filter(u => u.teamId === t.id).sort((a, b) => b.exp - a.exp) }))
    .filter(g => g.members.length > 0)
  const others = users.filter(u => !known.has(u.teamId)).sort((a, b) => b.exp - a.exp)
  if (others.length > 0) groups.push({ id: '__other', title: 'Khác', members: others })

  return (
    <div className="rounded-xl p-5 self-start" style={box}>
      <h3 className="font-bold mb-1" style={h3}>🏢 Toàn công ty</h3>
      <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>{groups.length} phòng ban · {users.length} người</p>
      <div className="max-h-[75vh] overflow-y-auto space-y-3">
        {groups.map(g => (
          <div key={g.id}>
            <button type="button" onClick={() => setCollapsed(c => ({ ...c, [g.id]: !c[g.id] }))}
              className="w-full flex items-center justify-between text-xs font-bold py-1.5 px-2 rounded-lg" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-primary)' }}>
              <span className="truncate text-left">{collapsed[g.id] ? '▸' : '▾'} {g.title} <span className="font-normal" style={{ color: 'var(--text-muted)' }}>({g.members.length})</span></span>
              <span className="text-amber-500 flex-shrink-0 ml-2">{g.members.reduce((s, u) => s + u.exp, 0).toLocaleString()} EXP</span>
            </button>
            {!collapsed[g.id] && <div className="mt-1">{g.members.map((u, i) => renderRow(u, i + 1))}</div>}
          </div>
        ))}
      </div>
        {viewing && <EmployeeDashboardModal employee={viewing} tasks={tasks} users={users} proposals={proposals} onClose={() => setViewing(null)} />}
    </div>
  )
}

// ==================== DASHBOARD ====================

function DashboardView({ currentUser, tasks, users, proposals, setView, onOpenProposal, onOpenProject, readOnly = false }: {
  currentUser: User; tasks: Task[]; users: User[]; proposals: Proposal[]
  setView: (v: View) => void
  onOpenProposal?: (id: string) => void; onOpenProject?: (id: string) => void
  readOnly?: boolean
}) {
  const { progress, needed, level } = getExpProgress(currentUser.exp)
  const isManager = currentUser.role === 'manager'
  const showPeople = !readOnly && (isManager || !!currentUser.isDirector)
  const needMyApproval = (t: Task) => !readOnly && canApproveSelfTask(t, currentUser, users)
const myTasks = tasks.filter(t =>
  t.assignedTo.includes(currentUser.id) ||
  (t.selfCreated && t.createdBy === currentUser.id) ||
  t.supporters.includes(currentUser.id) ||
  needMyApproval(t)   // task nhân viên tự tạo đang chờ mình duyệt
)
  const pending = myTasks.filter(t => t.status !== 'completed')
  const bucketCount = (b: TaskBucket, issue?: boolean) =>
    myTasks.filter(t =>
      (!isTaskGated(t) || needMyApproval(t)) &&   // task chờ duyệt: chỉ người duyệt mới thấy trong Received
      statusBucket(t) === b &&
      (issue === undefined || taskHadIssue(t) === issue)
    ).length

  const [bucketFilter, setBucketFilter] = useState<'all' | TaskBucket>('all')
  const toggleBucket = (b: TaskBucket) => setBucketFilter(f => (f === b ? 'all' : b))
  const shown = bucketFilter === 'all'
    ? pending
    : myTasks.filter(t => (!isTaskGated(t) || needMyApproval(t)) && statusBucket(t) === bucketFilter)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Hero */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${currentUser.avatar.outfitColor}18, var(--bg-panel))`, border: `1px solid ${currentUser.avatar.outfitColor}35` }}>
        <div className="flex items-center gap-5">
          <div className="rounded-2xl overflow-hidden flex-shrink-0"
            style={{ width: 80, height: 96, background: `${currentUser.avatar.outfitColor}20`, border: `2px solid ${currentUser.avatar.outfitColor}40`, boxShadow: `0 0 30px ${currentUser.avatar.outfitColor}30` }}>
            <FullAvatar avatar={currentUser.avatar} name={currentUser.name} size={72} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Xin chào,</span>
              <LevelBadge exp={currentUser.exp} />
              {isManager && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#a78bfa22', color: '#8b5cf6' }}>👑 Quản lý</span>}
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>{currentUser.name}</h2>

            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{TEAMS.find(t => t.id === currentUser.teamId)?.name ?? 'Chưa có team'}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--text-muted)' }}>Level {level} → {level + 1}</span>
                <span style={{ color: 'var(--text-muted)' }}>Cần {needed} EXP</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#f59e0b)', transition: 'width 0.7s ease' }} />
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-amber-500 text-4xl font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{currentUser.exp.toLocaleString()}</div>
            <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>EXP tổng</div>
          </div>
        </div>
      </div>

            {/* Trạng thái task của tôi */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-start">
        <StatusStatCard icon="📥" label="Received" color={BUCKET_META.received.color} total={bucketCount('received')}
          active={bucketFilter === 'received'} onClick={() => toggleBucket('received')} />
        <StatusStatCard icon="⚙️" label="In-process" color={BUCKET_META.processing.color} total={bucketCount('processing')}
          active={bucketFilter === 'processing'} onClick={() => toggleBucket('processing')} />
        <StatusStatCard icon="⏸" label="Pending" color={BUCKET_META.pending.color} total={bucketCount('pending')}
          active={bucketFilter === 'pending'} onClick={() => toggleBucket('pending')} />
        <StatusStatCard icon="✅" label="Completed" color={BUCKET_META.completed.color} total={bucketCount('completed')}
          active={bucketFilter === 'completed'} onClick={() => toggleBucket('completed')}
          subs={[
            { label: 'Complete with issue', value: bucketCount('completed', true), color: '#dc2626' },
            { label: 'Complete successful', value: bucketCount('completed', false), color: '#059669' },
          ]} />
        <StatusStatCard icon="🔒" label="Close" color={BUCKET_META.closed.color} total={bucketCount('closed')}
          active={bucketFilter === 'closed'} onClick={() => toggleBucket('closed')}
          subs={[
            { label: 'Close with issue', value: bucketCount('closed', true), color: '#dc2626' },
            { label: 'Close successful', value: bucketCount('closed', false), color: '#059669' },
          ]} />
      </div>

      <div className={`grid grid-cols-1 gap-4 ${showPeople ? 'lg:grid-cols-3' : ''}`}>
        <div className={`space-y-4 ${showPeople ? 'lg:col-span-2' : ''}`}>
          {/* Task của tôi */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
                ⚡ Task của tôi
                {bucketFilter === 'all'
                  ? <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>{pending.length} chờ</span>
                  : <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${BUCKET_META[bucketFilter].color}22`, color: BUCKET_META[bucketFilter].color }}>{BUCKET_META[bucketFilter].label} · {shown.length}</span>}
              </h3>
              <div className="flex items-center gap-3">
                {bucketFilter !== 'all' && (
                  <button type="button" onClick={() => setBucketFilter('all')} className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>✕ Bỏ lọc</button>
                )}
                <button type="button" onClick={() => setView('tasks')} className="text-xs font-semibold" style={{ color: '#8b5cf6' }}>Xem tất cả →</button>
              </div>
            </div>
            <div className="space-y-2">
              {shown.slice(0, bucketFilter === 'all' ? 5 : 50).map(task => {
                const bucket = BUCKET_META[statusBucket(task)]
                return (
                  <div key={task.id} className="p-3 rounded-lg flex items-center gap-3 group"
                    style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
                    <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: PRIORITY_CONFIG[task.priority].color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {task.title}
                        {task.selfCreated && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#10b98122', color: '#10b981' }}>Tự tạo</span>}
                        {task.urgent && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#f8717122', color: '#f87171' }}>⏰ GẤP</span>}
                        {task.important && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#fbbf2422', color: '#d97706' }}>🔥 Quan trọng</span>}
                      </div>
                      <div className="text-xs mt-0.5">
                        <span style={{ color: bucket.color }}>{bucket.label}</span>
                        <span className="mx-1" style={{ color: 'var(--text-muted)' }}>·</span>
                        <span style={{ color: 'var(--text-muted)' }}>Hạn {fmtDate(task.dueDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-amber-500 font-bold text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>+{task.expReward}</span>

                        {/* Quản lý: duyệt / từ chối task nhân viên tự tạo */}
                        {needMyApproval(task) && (
                          <>
                            <button onClick={() => rejectSelfTask(task, currentUser)}
                              className="text-xs px-2.5 py-1 rounded-lg font-bold" style={{ background: '#f8717122', color: '#dc2626' }}>
                              Từ chối
                            </button>
                            <button onClick={() => approveSelfTask(task, currentUser)}
                              className="text-xs px-2.5 py-1 rounded-lg font-bold" style={{ background: '#34d39922', color: '#059669' }}>
                              ✓ Duyệt cho làm
                            </button>
                          </>
                        )}

                        {/* Nhân viên: báo đang chờ quản lý duyệt */}
                        {task.creationApproval === 'pending' && task.createdBy === currentUser.id && (
                          <span className="text-[10px] px-2 py-1 rounded-lg font-semibold" style={{ background: '#fbbf2422', color: '#d97706' }}>
                            ⏳ Chờ quản lý duyệt
                          </span>
                        )}

                        {task.assignedTo.includes(currentUser.id) && task.status === 'in-progress' && (
                        <button onClick={() => setView('tasks')}
                          className="text-xs px-3 py-1 rounded-lg font-semibold" style={{ background: '#a78bfa22', color: '#8b5cf6' }}>
                          Vào nộp task →
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {shown.length === 0 && (
                <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  <div className="text-3xl mb-2">{bucketFilter === 'all' ? '🎉' : '📭'}</div>
                  <div className="text-sm">{bucketFilter === 'all' ? 'Tất cả task đã hoàn thành!' : 'Không có task nào ở trạng thái này'}</div>
                </div>
              )}
            </div>
          </div>

          <DashboardProposals proposals={proposals} currentUser={currentUser} onOpen={onOpenProposal} onViewAll={() => setView('proposals')} />
          <DashboardProjects currentUser={currentUser} tasks={tasks} onOpen={onOpenProject} onViewAll={() => setView('projects')} />
        </div>

        {showPeople && <DashboardPeople currentUser={currentUser} users={users} tasks={tasks} proposals={proposals} />}
      </div>
    </div>
  )
}

function SubmitTaskModal({ task, currentUser, users, onClose }: { task: Task; currentUser: User; users: User[]; onClose: () => void }) {
  const [driveLink, setDriveLink] = useState('')
  const [ownFolderUrl, setOwnFolderUrl] = useState('')
  const [folderName, setFolderName] = useState('')
  const [note, setNote] = useState('')
  const [hasIssue, setHasIssue] = useState(false)
  const [issueText, setIssueText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const driveOwner = task.driveFolderOwnerId ? users.find(u => u.id === task.driveFolderOwnerId) : undefined
  const pmsWithDrive = task.driveFolderOwnerId
    ? (driveOwner?.driveFolderUrl ? [driveOwner] : [])
    : task.projectManager.map(id => users.find(u => u.id === id)).filter((u): u is User => !!u && !!u.driveFolderUrl)

  const hasNamedFolder = !task.selfCreated && task.driveFolderCreated && !!task.driveFolderName
  const needsOwnFolderName = !task.selfCreated && !hasNamedFolder

  const handleSubmit = async () => {
    if (task.selfCreated && !ownFolderUrl.trim()) {
      setError('Vui lòng dán link folder Drive của bạn (đã cấp quyền xem & chỉnh sửa cho quản lý) trước khi nộp.')
      return
    }
    if (task.selfCreated && !/^https?:\/\//i.test(ownFolderUrl.trim())) {
      setError('Link folder không hợp lệ, vui lòng dán đúng đường dẫn Google Drive.')
      return
    }
    if (needsOwnFolderName && !folderName.trim()) {
      setError('Vui lòng ghi tên folder bạn đã tự tạo trước khi nộp.')
      return
    }
    if (!driveLink.trim()) { setError('Vui lòng dán link Google Drive chứa file/folder kết quả trước khi nộp.'); return }
    if (!/^https?:\/\//i.test(driveLink.trim())) { setError('Link không hợp lệ, vui lòng dán đúng đường dẫn Google Drive.'); return }
    if (hasIssue && !issueText.trim()) { setError('Bạn chọn "Complete with issue", vui lòng ghi rõ issue là gì.'); return }
    setError('')
    setSaving(true)

    // Dừng đồng hồ xử lý, cộng dồn thời gian đã chạy
    const elapsed = task.processingStartedAt
      ? Math.floor((Date.now() - new Date(task.processingStartedAt).getTime()) / 1000) : 0

    const { error: updateError } = await supabase.from('tasks').update({
      status: 'submitted',
      work_status: 'complete',
      processing_started_at: null,
      total_processing_seconds: (task.totalProcessingSeconds ?? 0) + elapsed,
      complete_issue: hasIssue ? issueText.trim() : null,
      submission_file_url: driveLink.trim(),
      submission_own_folder_url: task.selfCreated ? ownFolderUrl.trim() : null,
      submission_folder_name: needsOwnFolderName ? folderName.trim() : null,
      submission_note: note.trim() || null,
      submitted_at: new Date().toISOString(),
      rejected_reason: null,
    }).eq('id', task.id)

    setSaving(false)
    if (updateError) { setError(updateError.message); return }

    const recipientIds = new Set(
      Array.from(new Set([task.createdBy, ...task.projectManager]))
        .filter(uid => uid && uid !== currentUser.id)
    )

    if (task.selfCreated) {
      users
        .filter(u => u.role === 'manager' && u.teamId === currentUser.teamId && u.id !== currentUser.id)
        .forEach(mgr => recipientIds.add(mgr.id))
    }

    for (const uid of recipientIds) {
      await supabase.from('notifications').insert({
        message: `📥 ${currentUser.name} đã ${hasIssue ? `Complete with issue (${issueText.trim()})` : 'Complete successful'} task: ${task.title}`,
        target_user_id: uid,
        link_task_id: task.id,
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
        <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>Complete task</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{task.title}</p>

        {task.selfCreated ? (
          <div className="mb-4 p-3 rounded-lg" style={{ background: '#fbbf2414', border: '1px solid #fbbf2440' }}>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#d97706' }}>
              🎯 Đây là task bạn tự tạo. Vui lòng dán link folder Drive của chính bạn, đồng thời <b>bật chia sẻ "Bất kỳ ai có link đều xem và chỉnh sửa được"</b> để quản lý có thể xem file kết quả.
            </p>
            <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Link folder Drive của bạn *</label>
            <input value={ownFolderUrl} onChange={e => setOwnFolderUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none placeholder-[color:var(--text-muted)]"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
        ) : hasNamedFolder ? (
          <div className="mb-4 p-3 rounded-lg" style={{ background: '#a78bfa14', border: '1px solid #a78bfa40' }}>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#8b5cf6' }}>
              📁 Quản lý đã tạo sẵn folder cho task này. Vào Drive của quản lý, tìm đúng folder tên <b>"{task.driveFolderName}"</b> và nộp file vào đó.
            </p>
            {pmsWithDrive.map(pm => (
              <a key={pm.id} href={pm.driveFolderUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all hover:scale-[1.01]"
                style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: '#8b5cf6' }}>
                <CharAvatar user={pm} size={22} />
                📁 Mở Drive của {pm.name}
              </a>
            ))}
          </div>
        ) : needsOwnFolderName && pmsWithDrive.length > 0 ? (
          <div className="mb-4 p-3 rounded-lg" style={{ background: '#fbbf2414', border: '1px solid #fbbf2440' }}>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#d97706' }}>
              ⚠️ Quản lý chưa tạo sẵn folder cho task này. Vào Drive bên dưới, tự tạo 1 folder mới, đặt tên tuỳ ý, rồi ghi lại tên đó ở ô bên dưới.
            </p>
            <div className="space-y-2">
              {pmsWithDrive.map(pm => (
                <a key={pm.id} href={pm.driveFolderUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all hover:scale-[1.01]"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: '#3b82f6' }}>
                  <CharAvatar user={pm} size={22} />
                  📁 Mở Drive của {pm.name}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: '#fbbf2414', color: '#d97706' }}>
            ⚠️ Quản lý dự án chưa thiết lập link Google Drive. Hãy liên hệ trực tiếp để xin link nộp file, sau đó dán vào ô bên dưới.
          </div>
        )}

        {needsOwnFolderName && (
          <>
            <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Tên folder bạn đã tự tạo *</label>
            <input value={folderName} onChange={e => setFolderName(e.target.value)}
              placeholder="VD: Nộp task - Nguyễn Văn A"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mb-4 placeholder-[color:var(--text-muted)]"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </>
        )}

        <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Dán link file/folder đã nộp *</label>
        <input value={driveLink} onChange={e => setDriveLink(e.target.value)}
          placeholder="https://drive.google.com/file/d/... hoặc /folders/..."
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none placeholder-[color:var(--text-muted)]"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        <p className="text-[10px] mt-1.5 mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          💡 Bấm chuột phải vào file/folder → "Chia sẻ" → bật quyền <b>"Bất kỳ ai có link đều xem và chỉnh sửa được"</b> → "Sao chép đường liên kết", rồi dán vào đây.
        </p>
                <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Kết quả Complete *</p>
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={() => setHasIssue(false)}
              className="flex-1 py-2 rounded-lg text-xs font-bold"
              style={{ background: !hasIssue ? '#34d39922' : 'transparent', color: !hasIssue ? '#059669' : 'var(--text-muted)', border: `1px solid ${!hasIssue ? '#059669' : 'var(--border)'}` }}>
              ✅ Complete successful
            </button>
            <button type="button" onClick={() => setHasIssue(true)}
              className="flex-1 py-2 rounded-lg text-xs font-bold"
              style={{ background: hasIssue ? '#f8717122' : 'transparent', color: hasIssue ? '#dc2626' : 'var(--text-muted)', border: `1px solid ${hasIssue ? '#dc2626' : 'var(--border)'}` }}>
              ⚠️ Complete with issue
            </button>
          </div>
          {hasIssue && (
            <textarea value={issueText} onChange={e => setIssueText(e.target.value)} rows={2}
              placeholder="Ghi rõ issue là gì (VD: trễ do chờ nhà cung cấp, thiếu dữ liệu đầu vào...)"
              className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none placeholder-[color:var(--text-muted)]"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          )}
        </div>
        <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Ghi chú (không bắt buộc)</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
          placeholder="Mô tả ngắn gọn kết quả đã làm..."
          className="w-full px-4 py-2.5 mb-4 rounded-xl text-sm outline-none resize-none placeholder-[color:var(--text-muted)]"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />

        {error && <p className="text-xs mb-3" style={{ color: '#dc2626' }}>{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-muted)' }}>
            Huỷ
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff' }}>
            {saving ? 'Đang lưu...' : 'Complete'}
          </button>
        </div>
      </div>
    </div>
  )
}

//====================CollaborationRequestModal======================
function CollaborationRequestModal({ currentUser, users, onClose }: {
  currentUser: User; users: User[]; onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [targetTeamId, setTargetTeamId] = useState('')
  const [targetManagerId, setTargetManagerId] = useState('')
  const [expReward, setExpReward] = useState(80)
  const [driveFolderCreated, setDriveFolderCreated] = useState(false)
  const [driveFolderName, setDriveFolderName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const otherTeams = TEAMS.filter(t => t.id !== currentUser.teamId)
  const managersInTargetTeam = users.filter(u => u.role === 'manager' && u.teamId === targetTeamId)

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !startDate || !endDate || !targetTeamId || !targetManagerId || !expReward) {
      setError('Vui lòng điền đầy đủ tất cả các trường bắt buộc, bao gồm chọn quản lý cụ thể.')
      return
    }
    if (endDate < startDate) { setError('Ngày kết thúc phải sau ngày bắt đầu.'); return }
    setError('')
    setSaving(true)
    const { error: insertError } = await supabase.from('collaborations').insert({
      title: title.trim(), description: description.trim(),
      start_date: startDate, end_date: endDate,
      requested_by: currentUser.id,
      requesting_team_id: currentUser.teamId,
      target_team_id: targetTeamId,
      target_manager_id: targetManagerId,
      exp_reward: expReward,
      status: 'pending',
      drive_folder_created: driveFolderCreated,
      drive_folder_name: driveFolderCreated ? (driveFolderName.trim() || null) : null,
    })
    setSaving(false)
    if (insertError) { setError(insertError.message); return }

    await supabase.from('notifications').insert({
      message: `🤝 ${currentUser.name} (${TEAMS.find(t => t.id === currentUser.teamId)?.name ?? ''}) muốn nhờ bạn hỗ trợ: "${title.trim()}"`,
      target_user_id: targetManagerId,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>🤝 Yêu cầu phối hợp phòng ban</h3>
          <button onClick={onClose} className="text-2xl leading-none hover:opacity-70" style={{ color: 'var(--text-muted)' }}>×</button>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Tên dự án / công việc phối hợp *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="VD: Chiến dịch truyền thông Q4"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none placeholder-[color:var(--text-muted)]"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Nhiệm vụ cần phối hợp *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Mô tả cụ thể công việc cần bên hỗ trợ thực hiện..."
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none placeholder-[color:var(--text-muted)]"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Ngày bắt đầu *</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Ngày kết thúc *</label>
              <input type="date" value={endDate} min={startDate || undefined} onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Điểm EXP thưởng cho người nhận việc *</label>
            <input type="number" value={expReward} onChange={e => setExpReward(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2.5 rounded-lg text-amber-500 text-sm outline-none font-bold"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }} />
          </div>

          <div className="p-3 rounded-lg" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
            <label className="flex items-center gap-2.5 mb-2 cursor-pointer select-none">
              <input type="checkbox" checked={driveFolderCreated}
                onChange={e => setDriveFolderCreated(e.target.checked)}
                className="w-4 h-4 rounded accent-violet-500" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>📁 Tôi đã tạo sẵn folder Drive cho công việc này</span>
            </label>
            {driveFolderCreated ? (
              <input value={driveFolderName} onChange={e => setDriveFolderName(e.target.value)}
                placeholder="Tên folder (VD: Phối hợp - Chiến dịch Q4)"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none placeholder-[color:var(--text-muted)]"
                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            ) : (
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                💡 Nếu không tick, nhân viên được phân công sẽ tự tạo folder trong Drive của bạn và tự đặt tên khi nộp.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Chọn phòng ban muốn nhờ hỗ trợ *</label>
            <select value={targetTeamId} onChange={e => { setTargetTeamId(e.target.value); setTargetManagerId('') }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <option value="">-- Chọn phòng ban --</option>
              {otherTeams.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
            </select>
          </div>

          {targetTeamId && (
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Chọn quản lý muốn phối hợp *</label>
              {managersInTargetTeam.length === 0 ? (
                <p className="text-xs" style={{ color: '#dc2626' }}>Phòng ban này chưa có quản lý nào trong hệ thống.</p>
              ) : (
                <select value={targetManagerId} onChange={e => setTargetManagerId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  <option value="">-- Chọn quản lý --</option>
                  {managersInTargetTeam.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              )}
            </div>
          )}

          {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Hủy</button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
              {saving ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


function CollaborationsPanel({ currentUser, users, collaborations }: {
  currentUser: User; users: User[]; collaborations: Collaboration[]
}) {
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [pickedEmployees, setPickedEmployees] = useState<string[]>([])

  if (currentUser.role !== 'manager') return null

  const sent = collaborations.filter(c => c.requestedBy === currentUser.id)
  const receivedPending = collaborations.filter(c => c.targetManagerId === currentUser.id && c.status === 'pending')
  const receivedProcessed = collaborations.filter(c => c.targetManagerId === currentUser.id && c.status !== 'pending')
  const myTeamEmployees = users.filter(u => u.role === 'employee' && u.teamId === currentUser.teamId)
  const getUserById = (id?: string) => users.find(u => u.id === id)

  const handleReject = async (c: Collaboration) => {
    const reason = window.prompt('Lý do từ chối:') ?? ''
    await supabase.from('collaborations').update({ status: 'rejected', rejected_reason: reason }).eq('id', c.id)
    await supabase.from('notifications').insert({
      message: `❌ ${currentUser.name} đã từ chối yêu cầu phối hợp "${c.title}"${reason ? `: ${reason}` : ''}`,
      target_user_id: c.requestedBy,
    })
  }

  const openAssign = (c: Collaboration) => {
    setAssigningId(c.id)
    setPickedEmployees([])
  }

  const toggleEmployee = (uid: string) => {
    setPickedEmployees(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid])
  }

  const handleConfirmAssign = async (c: Collaboration) => {
    if (pickedEmployees.length === 0) return
    const exp = c.expReward ?? 80
    await supabase.from('collaborations').update({
      status: 'assigned', assigned_employee_ids: pickedEmployees, assigned_by: currentUser.id,
    }).eq('id', c.id)

    const { data: newTask } = await supabase.from('tasks').insert({
      title: c.title,
      description: `[Phối hợp phòng ban] ${c.description}`,
      exp_reward: exp,
      status: 'open',
      assigned_to: pickedEmployees,
      project_manager: [c.requestedBy, currentUser.id],
      supporters: [],
      created_by: currentUser.id,
      start_date: c.startDate,
      due_date: c.endDate,
      category: 'operations',
      priority: 'medium',
      self_created: false,
      important: false,
      urgent: false,
      drive_folder_owner_id: c.requestedBy,
      drive_folder_created: c.driveFolderCreated ?? false,
      drive_folder_name: c.driveFolderCreated ? (c.driveFolderName ?? null) : null,
    }).select('id').single()
    const newTaskId = newTask?.id

    const employeeNames = pickedEmployees.map(uid => getUserById(uid)?.name).filter(Boolean).join(', ')
    await supabase.from('notifications').insert({
      message: `🤝 ${currentUser.name} đã phân công ${employeeNames} hợp tác trong dự án "${c.title}"`,
      target_user_id: c.requestedBy,
      link_task_id: newTaskId,
    })
    for (const uid of pickedEmployees) {
      await supabase.from('notifications').insert({
        message: `🤝 Bạn vừa được phân công hợp tác trong dự án "${c.title}" (phối hợp với ${TEAMS.find(t => t.id === c.requestingTeamId)?.name ?? ''})`,
        target_user_id: uid,
        link_task_id: newTaskId,
      })
    }

    setAssigningId(null)
  }

  const statusBadge = (c: Collaboration) => {
    if (c.status === 'pending') return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: '#fbbf2422', color: '#d97706' }}>⏳ Chờ duyệt</span>
    if (c.status === 'rejected') return (
      <div className="flex flex-col items-end gap-0.5">
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: '#f8717122', color: '#dc2626' }}>❌ Bị từ chối</span>
        {c.rejectedReason && <span className="text-[10px] max-w-[200px] text-right" style={{ color: 'var(--text-muted)' }}>{c.rejectedReason}</span>}
      </div>
    )
    const names = (c.assignedEmployeeIds ?? []).map(id => getUserById(id)?.name).filter(Boolean).join(', ')
    return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: '#34d39922', color: '#059669' }}>✅ Đã phân công: {names}</span>
  }

  if (sent.length === 0 && receivedPending.length === 0 && receivedProcessed.length === 0) return null

  return (
    <div className="mb-6 space-y-4">
      {receivedPending.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-panel)', border: '1px solid #f59e0b40' }}>
          <h3 className="font-bold mb-3 text-sm flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
            🤝 Yêu cầu phối hợp cần bạn duyệt
            <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: '#fbbf2422', color: '#d97706' }}>{receivedPending.length}</span>
          </h3>
          <div className="space-y-3">
            {receivedPending.map(c => (
              <div key={c.id} className="p-3 rounded-lg" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
                <div className="mb-2">
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Từ: {getUserById(c.requestedBy)?.name} ({TEAMS.find(t => t.id === c.requestingTeamId)?.name})
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>📅 {fmtDate(c.startDate)} → {fmtDate(c.endDate)}</div>
                  {c.expReward != null && (
                    <div className="text-amber-500 text-xs mt-1 font-bold">+{c.expReward} EXP (do bên yêu cầu đề xuất)</div>
                  )}
                </div>
                <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{c.description}</p>

                {assigningId === c.id ? (
                  <div className="space-y-2 p-2.5 rounded-lg" style={{ background: 'var(--bg-panel)' }}>
                    <label className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                      Phân công nhân viên phòng bạn {pickedEmployees.length > 0 && `(${pickedEmployees.length} đã chọn)`}
                    </label>
                    <div className="rounded-lg overflow-hidden max-h-40 overflow-y-auto" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
                      {myTeamEmployees.length === 0 ? (
                        <p className="text-xs p-2.5" style={{ color: 'var(--text-muted)' }}>Team bạn chưa có nhân viên nào.</p>
                      ) : (
                        myTeamEmployees.map(u => (
                          <label key={u.id} className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer transition-colors hover:bg-[color:var(--bg-panel)]">
                            <input type="checkbox" checked={pickedEmployees.includes(u.id)} onChange={() => toggleEmployee(u.id)}
                              className="w-4 h-4 rounded accent-violet-500" />
                            <CharAvatar user={u} size={20} />
                            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setAssigningId(null)} className="flex-1 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-muted)' }}>Hủy</button>
                      <button onClick={() => handleConfirmAssign(c)} disabled={pickedEmployees.length === 0}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40" style={{ background: '#34d39922', color: '#059669' }}>
                        Xác nhận phân công
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleReject(c)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#f8717122', color: '#dc2626' }}>
                      Từ chối
                    </button>
                    <button onClick={() => openAssign(c)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#34d39922', color: '#059669' }}>
                      ✓ Duyệt
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {receivedProcessed.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          <h3 className="font-bold mb-3 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>📋 Yêu cầu phối hợp đã xử lý</h3>
          <div className="space-y-2">
            {receivedProcessed.map(c => (
              <div key={c.id} className="p-3 rounded-lg flex items-center justify-between gap-3" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Từ: {getUserById(c.requestedBy)?.name}</div>
                </div>
                {statusBadge(c)}
              </div>
            ))}
          </div>
        </div>
      )}

      {sent.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          <h3 className="font-bold mb-3 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>📨 Yêu cầu phối hợp đã gửi</h3>
          <div className="space-y-2">
            {sent.map(c => (
              <div key={c.id} className="p-3 rounded-lg flex items-center justify-between gap-3" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Nhờ: {getUserById(c.targetManagerId)?.name ?? TEAMS.find(t => t.id === c.targetTeamId)?.name}</div>
                </div>
                {statusBadge(c)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
// Dropdown chọn nhiều người dùng chung (Phụ trách / PM / Hỗ trợ)
function MultiUserSelect({ label, options, selected, onToggle, placeholder = 'Chọn...', badge, isDirector = false }: {
  label: string; options: User[]; selected: string[]; onToggle: (id: string) => void
  placeholder?: string; badge?: string; isDirector?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [teamId, setTeamId] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const teamsWithOptions = TEAMS.filter(t => options.some(u => u.teamId === t.id))
  const visibleUsers = isDirector ? options.filter(u => u.teamId === teamId) : options

  return (
    <div ref={ref} className="relative">
      <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
        {label} {selected.length > 0 && <span style={{ color: '#8b5cf6' }}>({selected.length} được chọn)</span>}
      </label>
      <button onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-left flex items-center justify-between"
        style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: selected.length > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        <span>
          {selected.length === 0 ? placeholder
            : selected.map(sid => options.find(u => u.id === sid)?.name).join(', ')}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
          {isDirector && (
            <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <select value={teamId} onChange={e => setTeamId(e.target.value)}
                className="w-full px-2 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <option value="">-- Chọn phòng ban --</option>
                {teamsWithOptions.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
              </select>
            </div>
          )}
          <div className="max-h-52 overflow-y-auto">
            {isDirector && !teamId ? (
              <p className="text-xs px-3 py-3" style={{ color: 'var(--text-muted)' }}>Chọn phòng ban trước để hiện danh sách</p>
            ) : visibleUsers.length === 0 ? (
              <p className="text-xs px-3 py-3" style={{ color: 'var(--text-muted)' }}>Không có ai phù hợp.</p>
            ) : visibleUsers.map(u => (
              <label key={u.id}
                className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors hover:bg-[color:var(--bg-panel)]">
                <input type="checkbox" checked={selected.includes(u.id)} onChange={() => onToggle(u.id)}
                  className="w-4 h-4 rounded accent-violet-500" />
                <CharAvatar user={u} size={24} />
                <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                {badge && u.role === 'manager' && (
                  <span className="text-[9px] px-1 rounded" style={{ background: '#a78bfa22', color: '#8b5cf6' }}>{badge}</span>
                )}
                <LevelBadge exp={u.exp} />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


//==================== TASKS COMMENTS =====================
//==================== TASKS COMMENTS =====================
// ===== Task nhân viên tự tạo phải được quản lý duyệt trước khi làm =====
const isTaskGated = (t: Task) => t.creationApproval === 'pending' || t.creationApproval === 'rejected'

// Những người được quyền duyệt: quản lý cùng phòng ban với người tạo + quản lý được chọn làm PM của task
const getTaskApproverIds = (creatorId: string, projectManagerIds: string[], users: User[]) => {
  const creator = users.find(u => u.id === creatorId)
  const ids = new Set<string>()
  users.forEach(u => { if (u.role === 'manager' && creator && u.teamId === creator.teamId && u.id !== creatorId) ids.add(u.id) })
  projectManagerIds.forEach(id => {
    const u = users.find(x => x.id === id)
    if (u?.role === 'manager' && id !== creatorId) ids.add(id)
  })
  return Array.from(ids)
}

const canApproveSelfTask = (task: Task, user: User, users: User[]) => {
  if (task.creationApproval !== 'pending' || user.id === task.createdBy) return false
  return getTaskApproverIds(task.createdBy, task.projectManager, users).includes(user.id)
}

async function approveSelfTask(task: Task, approver: User) {
  const nowIso = new Date().toISOString()
  const { error } = await supabase.from('tasks').update({
    creation_approval: 'approved',
    creation_approved_by: approver.id,
    creation_approved_at: nowIso,
    creation_rejected_reason: null,
    // Duyệt xong: tự chuyển sang "Đang xử lý", nhân viên không cần bấm Bắt đầu nữa
    status: 'in-progress',
    work_status: 'processing',
    started_at: nowIso,
    processing_started_at: nowIso,
  }).eq('id', task.id).eq('creation_approval', 'pending')
  if (error) { alert('Không duyệt được task: ' + error.message); return }
  await supabase.from('notifications').insert({
    message: `✅ ${approver.name} đã duyệt task [${task.taskCode ?? task.title}] bạn tự tạo, task đã chuyển sang Đang xử lý, bạn có thể làm ngay`,
    target_user_id: task.createdBy, link_task_id: task.id,
  })
}

async function rejectSelfTask(task: Task, approver: User) {
  const reason = window.prompt('Lý do từ chối (người tạo sẽ thấy lý do này):') ?? ''
  if (reason.trim() === '' && !window.confirm('Bạn chưa nhập lý do, vẫn muốn từ chối?')) return
  const { error } = await supabase.from('tasks').update({
    creation_approval: 'rejected', creation_approved_by: approver.id,
    creation_approved_at: new Date().toISOString(), creation_rejected_reason: reason.trim() || null,
  }).eq('id', task.id).eq('creation_approval', 'pending')
  if (error) { alert('Không từ chối được task: ' + error.message); return }
  await supabase.from('notifications').insert({
    message: `❌ ${approver.name} đã từ chối task [${task.taskCode ?? task.title}] bạn tự tạo${reason.trim() ? `: ${reason.trim()}` : ''}. Hãy sửa lại rồi gửi duyệt lại`,
    target_user_id: task.createdBy, link_task_id: task.id,
  })
}
function TaskCommentsPanel({ taskId, currentUser, users }: { taskId: string; currentUser: User; users: User[] }) {
  const [comments, setComments] = useState<{ id: string; userId: string; content: string; createdAt: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('task_comments').select('*').eq('task_id', taskId).order('created_at')
      .then(({ data }) => {
        if (data) setComments(data.map(c => ({ id: c.id, userId: c.user_id, content: c.content, createdAt: c.created_at })))
        setLoading(false)
      })

    const channel = supabase.channel(`task-comments-${taskId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_comments', filter: `task_id=eq.${taskId}` }, payload => {
        const c = payload.new
        setComments(prev => [...prev, { id: c.id, userId: c.user_id, content: c.content, createdAt: c.created_at }])
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [taskId])

  const send = async () => {
    if (!input.trim()) return
    const content = input.trim()
    setInput('')
    await supabase.from('task_comments').insert({ task_id: taskId, user_id: currentUser.id, content })
  }

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
      {loading ? (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Đang tải...</p>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto mb-2">
          {comments.length === 0 && <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Chưa có bình luận nào.</p>}
          {comments.map(c => {
            const u = users.find(x => x.id === c.userId)
            return (
              <div key={c.id} className="flex items-start gap-2">
                {u && <CharAvatar user={u} size={22} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{u?.name ?? 'Ẩn danh'}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{fmtTime(c.createdAt)}</span>
                  </div>
                  <p className="text-xs break-words" style={{ color: 'var(--text-muted)' }}>{c.content}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div className="flex gap-1.5">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Viết bình luận..."
          className="flex-1 min-w-0 px-3 py-1.5 rounded-lg text-xs outline-none placeholder-[color:var(--text-muted)]"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        <button onClick={send} disabled={!input.trim()}
          className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 flex-shrink-0"
          style={{ background: '#7c3aed', color: '#fff' }}>
          Gửi
        </button>
      </div>
    </div>
  )
}

const TRACKER_STATUS: Record<string, [string, string, string]> = {
  received: ['Receive', '#3b82f622', '#2563eb'],
  processing: ['In process', '#f59e0b22', '#b45309'],
  pending: ['Pending', '#8b5cf622', '#7c3aed'],
  complete: ['Complete', '#34d39922', '#059669'],
  closed: ['Closed', '#64748b22', '#64748b'],
}
const TRACKER_PRIORITY: Record<string, string> = { P1: '#dc2626', P2: '#ea580c', P3: '#ca8a04', P4: '#16a34a' }

const fmtClock = (sec: number) => {
  const s = Math.max(0, Math.floor(sec))
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), x = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d > 0 ? `${d} ngày ` : ''}${pad(h)}:${pad(m)}:${pad(x)}`
}

// Ô đếm giờ SLA trong Tracker (tự chạy từng giây, chỉ khi task còn đang tính giờ)
function SlaCell({ task }: { task: Task }) {
  const [, setTick] = useState(0)
  const done = task.status === 'completed' || task.workStatus === 'complete'
  const deadline = getSlaDeadline(task)
  const live = !done && (!!deadline || task.workStatus === 'processing')
  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [live])

  let text = 'Không áp dụng SLA'
  let color = 'var(--text-muted)'
  let bg = 'transparent'
  let sub = ''
  if (task.slaLevel) {
    const lv = SLA_LEVELS[task.slaLevel]
    if (task.isLocked) { text = '🔒 Đã khoá — quá hạn SLA'; color = '#dc2626'; bg = '#dc262618' }
    else if (done) { text = '✅ Đã hoàn tất'; color = '#059669' }
    else if (!deadline) { text = `Chưa bắt đầu · SLA ${lv.label}` }
    else {
      const remain = Math.floor((deadline.getTime() - Date.now()) / 1000)
      sub = `Hạn: ${deadline.toLocaleString('vi-VN')}`
      if (remain < 0) { text = `⚠️ Quá hạn ${fmtClock(-remain)}`; color = '#dc2626'; bg = '#dc262618' }
      else {
        text = `Còn ${fmtClock(remain)}`
        color = remain < lv.hours * 3600 * 0.25 ? '#d97706' : '#059669'
        bg = color + '18'
      }
    }
  }
  const showElapsed = task.workStatus === 'processing' || task.workStatus === 'pending' || task.workStatus === 'complete' || done

  return (
    <div className="space-y-1 text-center">
      <div className="px-2 py-1 rounded-md font-bold font-mono whitespace-nowrap" style={{ background: bg, color }}>{text}</div>
      {sub && <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
      {showElapsed && <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>⏱ Đã xử lý {formatDuration(getElapsedProcessingSeconds(task))}</div>}
    </div>
  )
}
function TaskTracker({ tasks: rawTasks, users, currentUser }: { tasks: Task[]; users: User[]; currentUser: User }) {
  const [teamSel, setTeamSel] = useState('')
  const [who, setWho] = useState('')
  const [onlyOverdue, setOnlyOverdue] = useState(false)
  const [, setClock] = useState(0)
  useEffect(() => { const id = setInterval(() => setClock(c => c + 1), 15000); return () => clearInterval(id) }, [])
  const isOver = (t: Task) => isSlaOverdue(t) || !!t.isLocked
  const teamIdOf = (id: string) => users.find(u => u.id === id)?.teamId
  const involved = (t: Task) => [...t.assignedTo, ...t.supporters]

  // Phân quyền: Ban giám đốc xem hết; còn lại chỉ xem task có người cùng phòng ban với mình
  const isDir = !!currentUser.isDirector
  const inMyTeam = (id: string) => teamIdOf(id) === currentUser.teamId
  const allTasks = isDir
    ? rawTasks
    : rawTasks.filter(t => involved(t).some(inMyTeam) || t.targetTeamId === currentUser.teamId)

  const overdueCount = allTasks.filter(isOver).length
  const tasks = allTasks.filter(t =>
    (!onlyOverdue || isOver(t)) && (
      who ? involved(t).includes(who)
      : teamSel ? involved(t).some(id => teamIdOf(id) === teamSel)
      : true))
  const peopleIds = Array.from(new Set(allTasks.flatMap(involved)))
    .filter(id => (isDir || inMyTeam(id)) && (!teamSel || teamIdOf(id) === teamSel))
  const teamsInTasks = isDir
    ? TEAMS.filter(tm => allTasks.some(t => involved(t).some(id => teamIdOf(id) === tm.id)))
    : []
  const [notes, setNotes] = useState<{ id: string; taskId: string; userId: string; note: string; createdAt: string }[]>([])
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [openComments, setOpenComments] = useState<string | null>(null)
  const idsKey = tasks.map(t => t.id).join(',')

  const load = async () => {
    const ids = tasks.map(t => t.id)
    if (ids.length === 0) { setNotes([]); setCommentCounts({}); return }
    const [n, c] = await Promise.all([
      supabase.from('task_work_notes').select('*').in('task_id', ids).order('created_at'),
      supabase.from('task_comments').select('id, task_id').in('task_id', ids),
    ])
    setNotes((n.data ?? []).map((x: any) => ({ id: x.id, taskId: x.task_id, userId: x.user_id, note: x.note, createdAt: x.created_at })))
    const counts: Record<string, number> = {}
    ;(c.data ?? []).forEach((x: any) => { counts[x.task_id] = (counts[x.task_id] ?? 0) + 1 })
    setCommentCounts(counts)
  }

  useEffect(() => {
    load()
    const ch = supabase.channel('tracker-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_work_notes' }, () => { load() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_comments' }, () => { load() })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [idsKey])

  const userOf = (id: string) => users.find(u => u.id === id)
  const teamOf = (u?: User) => TEAMS.find(t => t.id === u?.teamId)?.name ?? u?.department ?? ''
  const fmtDate = (s?: string) => (s ? new Date(s).toLocaleDateString('vi-VN') : '—')
  const dayKey = (iso: string) => new Date(iso).toLocaleDateString('vi-VN')

  const notesOf = (taskId: string) => {
    const m = new Map<string, typeof notes>()
    notes.filter(n => n.taskId === taskId).forEach(n => {
      const k = dayKey(n.createdAt)
      m.set(k, [...(m.get(k) ?? []), n])
    })
    return Array.from(m.entries())
  }

  const addNote = async (taskId: string) => {
    const lines = (drafts[taskId] ?? '').split('\n').map(s => s.replace(/^\s*[-•*]\s*/, '').trim()).filter(Boolean)
    if (lines.length === 0) return
    setDrafts(prev => ({ ...prev, [taskId]: '' }))
    const base = Date.now()
    const { error } = await supabase.from('task_work_notes').insert(
      lines.map((note, i) => ({ task_id: taskId, user_id: currentUser.id, note, created_at: new Date(base + i).toISOString() }))
    )
    if (error) { alert('Không ghi được worknote: ' + error.message); return }
    load()
  }

  const th = 'px-2 py-2 text-xs font-bold text-white text-center border border-white/30 whitespace-nowrap'
  const td = 'px-2 py-2 text-xs align-top border'
  const cellBorder = { borderColor: 'var(--border)', color: 'var(--text-primary)' }
  const commentTask = tasks.find(t => t.id === openComments)

  return (
    <div className="mb-6">
      <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
              <div className="flex flex-wrap items-center gap-2 mb-3">
        <button type="button" onClick={() => { setTeamSel(''); setWho('') }}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: !teamSel && !who ? '#7c3aed' : 'var(--bg-panel)', color: !teamSel && !who ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border)' }}>Tất cả</button>
        <button type="button" onClick={() => { setTeamSel(''); setWho(currentUser.id) }}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: who === currentUser.id ? '#7c3aed' : 'var(--bg-panel)', color: who === currentUser.id ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border)' }}>Của tôi</button>
        {isDir && (
          <select value={teamSel} onChange={e => { setTeamSel(e.target.value); setWho('') }}
            className="px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            <option value="">-- Phòng ban --</option>
            {teamsInTasks.map(tm => <option key={tm.id} value={tm.id}>{tm.emoji} {tm.name}</option>)}
          </select>
        )}
        <select value={who} onChange={e => setWho(e.target.value)}
          className="px-2 py-1.5 rounded-lg text-xs outline-none"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <option value="">-- Người phụ trách --</option>
          {peopleIds.map(id => <option key={id} value={id}>{users.find(u => u.id === id)?.name}</option>)}
        </select>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Đang xem {tasks.length} task</span>
        {overdueCount > 0 && (
          <span className="text-xs px-2 py-1 rounded-md font-bold" style={{ background: '#dc262618', color: '#dc2626' }}>⚠️ {overdueCount} quá hạn SLA</span>
        )}
        <button type="button" onClick={() => setOnlyOverdue(v => !v)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: onlyOverdue ? '#dc2626' : 'var(--bg-panel)', color: onlyOverdue ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border)' }}>Chỉ quá hạn</button>
      </div>
        <table className="w-full border-collapse" style={{ minWidth: 1700 }}>
          <thead>
            <tr style={{ background: '#6d9eeb' }}>
              <th className={th} style={{ width: 44 }}>No</th>
              <th className={th} style={{ width: 120 }}>ID Number</th>
              <th className={th} style={{ width: 90 }}>Company</th>
              <th className={th} style={{ minWidth: 220 }}>Title</th>
              <th className={th} style={{ width: 100 }}>Status</th>
              <th className={th} style={{ width: 70 }}>Priority</th>
              <th className={th} style={{ width: 130 }}>PIC</th>
              <th className={th} style={{ width: 130 }}>Support</th>
              <th className={th} style={{ width: 95 }}>Start Date</th>
              <th className={th} style={{ width: 95 }}>Due Date</th>
              <th className={th} style={{ width: 190, background: '#cc4125' }}>SLA / Thời gian</th>
              <th className={th} style={{ minWidth: 320 }}>Work Note</th>
              <th className={th} style={{ width: 100, background: '#3c78d8' }}>Comments</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr><td colSpan={13} className="px-3 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có task nào.</td></tr>
            )}
            {tasks.map((t, i) => {
              const sk = t.status === 'completed' ? 'closed' : (t.workStatus ?? 'received')
              const st = TRACKER_STATUS[sk] ?? TRACKER_STATUS.received
              const days = notesOf(t.id)
              return (
                <tr key={t.id} style={isOver(t) ? { background: '#dc262612' } : undefined}>
                  <td className={`${td} text-center`} style={cellBorder}>{i + 1}</td>
                  <td className={`${td} font-mono`} style={cellBorder}>{t.taskCode ?? '—'}</td>
                  <td className={`${td} text-center font-semibold`} style={cellBorder}>{t.company ? (COMPANY_CODES[t.company] ?? t.company) : '—'}</td>
                  <td className={`${td} font-semibold`} style={cellBorder}>{t.title}</td>
                  <td className={`${td} text-center`} style={cellBorder}>
                    <span className="px-2 py-0.5 rounded-md font-semibold whitespace-nowrap" style={{ background: st[1], color: st[2] }}>{st[0]}</span>
                  </td>
                  <td className={`${td} text-center font-bold`} style={{ ...cellBorder, color: t.slaLevel ? TRACKER_PRIORITY[t.slaLevel] : 'var(--text-muted)' }}>{t.slaLevel ?? '—'}</td>
                  <td className={td} style={cellBorder}>
                    {t.assignedTo.length === 0 && '—'}
                    {t.assignedTo.map(id => (
                      <div key={id}>{userOf(id)?.name}<div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{teamOf(userOf(id))}</div></div>
                    ))}
                  </td>
                  <td className={td} style={cellBorder}>
                    {t.supporters.length === 0 && '—'}
                    {t.supporters.map(id => (
                      <div key={id}>{userOf(id)?.name}<div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{teamOf(userOf(id))}</div></div>
                    ))}
                  </td>
                  <td className={`${td} text-center`} style={cellBorder}>{fmtDate(t.startDate)}</td>
                  <td className={`${td} text-center`} style={cellBorder}>{fmtDate(t.dueDate)}</td>
                  <td className={td} style={cellBorder}><SlaCell task={t} /></td>
                  <td className={td} style={cellBorder}>
                    {days.length === 0 && <p className="mb-1.5" style={{ color: 'var(--text-muted)' }}>Chưa có cập nhật.</p>}
                    {days.map(([day, list]) => (
                      <div key={day} className="mb-1.5">
                        <p className="font-bold">{day}:</p>
                        {list.map(n => (
                          <p key={n.id} className="pl-2">- {n.note} <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>({userOf(n.userId)?.name})</span></p>
                        ))}
                      </div>
                    ))}
                    <textarea value={drafts[t.id] ?? ''} onChange={e => setDrafts(prev => ({ ...prev, [t.id]: e.target.value }))}
                      rows={2} placeholder={`Hôm nay ${new Date().toLocaleDateString('vi-VN')}: ghi mỗi ý một dòng...`}
                      className="w-full px-2 py-1 rounded text-xs outline-none resize-none"
                      style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                    <button type="button" onClick={() => addNote(t.id)} disabled={!(drafts[t.id] ?? '').trim()}
                      className="mt-1 px-2.5 py-1 rounded text-[11px] font-bold text-white disabled:opacity-40" style={{ background: '#0891b2' }}>Ghi lại</button>
                  </td>
                  <td className={`${td} text-center`} style={cellBorder}>
                    <button type="button" onClick={() => setOpenComments(t.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: '#7c3aed' }}>
                      💬 {commentCounts[t.id] ?? 0}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {commentTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setOpenComments(null)}>
          <div className="w-full max-w-lg rounded-2xl p-5" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>💬 Comments · {commentTask.taskCode ?? ''} {commentTask.title}</h3>
              <button type="button" onClick={() => setOpenComments(null)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>Quản lý ghi nhận xét hoặc yêu cầu bổ sung cho người phụ trách tại đây.</p>
            <TaskCommentsPanel taskId={commentTask.id} currentUser={currentUser} users={users} />
          </div>
        </div>
      )}
    </div>
  )
}

function TaskWorkNotePanel({ taskId, currentUser, users }: { taskId: string; currentUser: User; users: User[] }) {
  const [notes, setNotes] = useState<{ id: string; userId: string; note: string; createdAt: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('task_work_notes').select('*').eq('task_id', taskId).order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setNotes(data.map(n => ({ id: n.id, userId: n.user_id, note: n.note, createdAt: n.created_at })))
        setLoading(false)
      })

    const channel = supabase.channel(`task-worknotes-${taskId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_work_notes', filter: `task_id=eq.${taskId}` }, payload => {
        const n = payload.new
        setNotes(prev => [{ id: n.id, userId: n.user_id, note: n.note, createdAt: n.created_at }, ...prev])
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [taskId])

  const send = async () => {
    if (!input.trim()) return
    const note = input.trim()
    setInput('')
    await supabase.from('task_work_notes').insert({ task_id: taskId, user_id: currentUser.id, note })
  }

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
      <div className="flex gap-1.5 mb-3">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Hôm nay đã làm tới đâu..."
          className="flex-1 min-w-0 px-3 py-1.5 rounded-lg text-xs outline-none placeholder-[color:var(--text-muted)]"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        <button onClick={send} disabled={!input.trim()}
          className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 flex-shrink-0"
          style={{ background: '#0891b2', color: '#fff' }}>
          Ghi lại
        </button>
      </div>
      {loading ? (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Đang tải...</p>
      ) : notes.length === 0 ? (
        <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Chưa có cập nhật tiến độ nào.</p>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {notes.map(n => {
            const u = users.find(x => x.id === n.userId)
            return (
              <div key={n.id} className="flex items-start gap-2">
                {u && <CharAvatar user={u} size={20} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{u?.name ?? 'Ẩn danh'}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <p className="text-xs break-words" style={{ color: 'var(--text-muted)' }}>{n.note}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TaskTicketPanel({ task, currentUser, users, canSubmit }: {
  task: Task; currentUser: User; users: User[]; canSubmit: boolean
}) {
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const step: 'received' | 'in_process' | 'completed' | null =
    !task.ticketReceivedText ? 'received'
    : !task.ticketInProcessText ? 'in_process'
    : !task.ticketCompletedText ? 'completed'
    : null

  const notifyManagers = async (label: string) => {
    const recipientIds = Array.from(new Set([task.createdBy, ...task.projectManager]))
      .filter(uid => uid && uid !== currentUser.id)
    for (const uid of recipientIds) {
      await supabase.from('notifications').insert({
        message: `🔧 ${currentUser.name} cập nhật trạng thái task "${task.title}": ${label}`,
        target_user_id: uid,
        link_task_id: task.id,
      })
    }
  }

  const confirmStep = async (which: 'received' | 'in_process' | 'completed', label: string) => {
    if (!draft.trim()) return
    setSaving(true)
    const col = which === 'received' ? 'ticket_received_text' : which === 'in_process' ? 'ticket_in_process_text' : 'ticket_completed_text'
    const atCol = which === 'received' ? 'ticket_received_at' : which === 'in_process' ? 'ticket_in_process_at' : 'ticket_completed_at'
    await supabase.from('tasks').update({ [col]: draft.trim(), [atCol]: new Date().toISOString() }).eq('id', task.id)
    await notifyManagers(label)
    setDraft('')
    setSaving(false)
  }

  // const LockedStep = ({ label, text, at }: { label: string; text?: string; at?: string }) => {
  //   if (!text) return null
  //   return (
  //     <div className="p-2.5 rounded-lg mb-2" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
  //       <div className="flex items-center justify-between mb-1">
  //         <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
  //         <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>🔒 {at ? fmtTime(at) : ''}</span>
  //       </div>
  //       <p className="text-xs whitespace-pre-wrap break-words" style={{ color: 'var(--text-muted)' }}>{text}</p>
  //     </div>
  //   )
  // }

  const isKniNotificationHtml = (value: string) =>
  /<table[\s\S]*KNI Task Management Notification/i.test(value)

  const TicketNotificationPreview = ({ html }: { html: string }) => {
    const srcDoc = `<!doctype html>
  <html>
  <head>
  <meta charset="UTF-8">
  <style>
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
  }
  body {
    font-family: Arial, Helvetica, sans-serif;
  }
  table[role="presentation"] {
    width: 100% !important;
    max-width: 100% !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  img {
    max-width: 100% !important;
    height: auto !important;
  }
  </style>
  </head>
  <body>${html}</body>
  </html>`

    return (
      <iframe
        title="KNI Task Management Notification"
        srcDoc={srcDoc}
        sandbox=""
        className="w-full rounded-lg bg-white"
        style={{
          height: 500,
          border: '1px solid var(--border)'
        }}
      />
    )
  }

  const LockedStep = ({
    label,
    text,
    at
  }: {
    label: string
    text?: string
    at?: string
  }) => {
    if (!text) return null

    const isHtml = isKniNotificationHtml(text)

    return (
      <div
        className="p-2.5 rounded-lg mb-2"
        style={{
          background: 'var(--bg-card-alt)',
          border: '1px solid var(--border)'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {label}
          </span>

          <span
            className="text-[10px]"
            style={{ color: 'var(--text-muted)' }}
          >
            🔒 {at ? fmtTime(at) : ''}
          </span>
        </div>

        {isHtml ? (
          <TicketNotificationPreview html={text} />
        ) : (
          <p
            className="text-xs whitespace-pre-wrap break-words"
            style={{ color: 'var(--text-muted)' }}
          >
            {text}
          </p> 
        )}
      </div>
    )
  }

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
      <a href="/ticket-form.html" target="_blank" rel="noopener noreferrer"
        className="text-xs underline block mb-1" style={{ color: '#3b82f6' }}>
        📋 Mở Ticket Form KNI
      </a>
      <p className="text-[10px] mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Vui lòng vào đường link trên, điền trạng thái task (Received → In Process → Completed), bấm "Copy" rồi dán nội dung vào ô bên dưới, theo đúng thứ tự từng bước.
      </p>

      <LockedStep label="1️⃣ Đã tiếp nhận (Received)" text={task.ticketReceivedText} at={task.ticketReceivedAt} />
      <LockedStep label="2️⃣ Đang xử lý (In Process)" text={task.ticketInProcessText} at={task.ticketInProcessAt} />
      <LockedStep label="3️⃣ Hoàn thành (Completed)" text={task.ticketCompletedText} at={task.ticketCompletedAt} />

      {step && canSubmit && (
        <div>
          <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>
            {step === 'received' && 'Dán nội dung bước 1️⃣ Đã tiếp nhận (Received)'}
            {step === 'in_process' && 'Dán nội dung bước 2️⃣ Đang xử lý (In Process)'}
            {step === 'completed' && 'Dán nội dung bước 3️⃣ Hoàn thành (Completed)'}
          </label>
          <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3}
            placeholder="Dán nội dung đã copy từ Ticket Form..."
            className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none placeholder-[color:var(--text-muted)] mb-2"
            style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          <button
            onClick={() => confirmStep(step, step === 'received' ? '1️⃣ Đã tiếp nhận' : step === 'in_process' ? '2️⃣ Đang xử lý' : '3️⃣ Hoàn thành')}
            disabled={!draft.trim() || saving}
            className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
            style={{ background: '#0891b2', color: '#fff' }}>
            {saving ? 'Đang lưu...' : '✅ Xác nhận & Khóa'}
          </button>
        </div>
      )}
      {step && !canSubmit && (
        <p className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>Chưa cập nhật bước này.</p>
      )}
      {!step && (
        <p className="text-xs font-semibold" style={{ color: '#059669' }}>✅ Đã hoàn tất toàn bộ tiến trình ticket.</p>
      )}
    </div>
  )
}

// ==================== TASKS VIEW ====================

function TasksView({ currentUser, tasks, users, setTasks, setCurrentUser, collaborations, highlightTaskId, clearHighlightTaskId }: {
  currentUser: User; tasks: Task[]; users: User[]
  setTasks: (t: Task[]) => void; setCurrentUser: (u: User) => void
  collaborations: Collaboration[]
  highlightTaskId?: string | null; clearHighlightTaskId?: () => void
}) {
  const [filter, setFilter] = useState<'all' | TaskBucket>('all')
  const [search, setSearch] = useState('')
  const [showCollabModal, setShowCollabModal] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'tracker'>('cards')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null)
  const [openWorkNoteFor, setOpenWorkNoteFor] = useState<string | null>(null)
  const [openTicketFor, setOpenTicketFor] = useState<string | null>(null)
  const [submittingTask, setSubmittingTask] = useState<Task | null>(null)
  const [selfMode, setSelfMode] = useState(false)
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [flashTaskId, setFlashTaskId] = useState<string | null>(null)

  // Đồng hồ chạy real-time (mỗi giây) để hiển thị thời gian đang xử lý, chỉ chạy khi có task nào đó đang "Đang xử lý"
  const [, setTick] = useState(0)
  const hasProcessingTask = tasks.some(t => t.workStatus === 'processing')
  useEffect(() => {
    if (!hasProcessingTask) return
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [hasProcessingTask])

  useEffect(() => {
  const checkSlaAndLock = async () => {
    for (const task of tasks) {
      if (
        !task.isLocked &&
        !task.slaUnlockGranted &&
        task.status !== 'completed' &&
        isSlaOverdue(task)
      ) {
        const { error } = await supabase
          .from('tasks')
          .update({
            is_locked: true,
            lock_reason: 'Quá hạn SLA',
          })
          .eq('id', task.id)
          .eq('is_locked', false)

        if (error) {
          console.error(`Không thể khóa task ${task.id}:`, error)
        }
      }
    }
  }

  checkSlaAndLock()

  // Kiểm tra mỗi 10 giây
  const interval = setInterval(checkSlaAndLock, 10000)

  return () => clearInterval(interval)
}, [tasks])

  useEffect(() => {
    if (!highlightTaskId) return
    setFilter('all')
    setSearch('')
    const tryScroll = () => {
      const el = taskRefs.current[highlightTaskId]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setFlashTaskId(highlightTaskId)
        setTimeout(() => setFlashTaskId(prev => (prev === highlightTaskId ? null : prev)), 2500)
        clearHighlightTaskId?.()
      } else {
        setTimeout(tryScroll, 150)
      }
    }
    const t = setTimeout(tryScroll, 150)
    return () => clearTimeout(t)
  }, [highlightTaskId])
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const [form, setForm] = useState({
    title: '', description: '', expReward: 80, startDate: todayStr, dueDate: '',
    category: 'development', priority: 'medium' as TaskPriority,
    important: false, urgent: false, isTeamProject: false,
    assignedTo: [] as string[], projectManager: [] as string[], supporters: [] as string[],
    driveFolderCreated: false, driveFolderName: '',
    slaLevel: '' as '' | 'P1' | 'P2' | 'P3' | 'P4',
    company: '',
  })

  const isManager = currentUser.role === 'manager'
  const employees = currentUser.isDirector
    ? users
    : users.filter(u => u.role === 'employee' && u.teamId === currentUser.teamId)
  const teamUsers = currentUser.isDirector
    ? users
    : users.filter(u => u.teamId === currentUser.teamId)

  const isCountable = (t: Task) => !isTaskGated(t) || canApproveSelfTask(t, currentUser, users)

const scoped = tasks.filter(t => {
    const isMyTask = t.assignedTo.includes(currentUser.id) || (t.selfCreated && t.createdBy === currentUser.id) || t.supporters.includes(currentUser.id) || t.projectManager.includes(currentUser.id)
    const assignees = users.filter(u => t.assignedTo.includes(u.id))
    const deptPrefix = (id?: string) => id?.match(/^t\d+/)?.[0] ?? ''
    const isCrossDeptForMyDept = !!t.targetTeamId && (
      currentUser.isDirector
        ? deptPrefix(currentUser.teamId) === deptPrefix(t.targetTeamId)
        : t.targetTeamId === currentUser.teamId
    )
    const inScope = isManager
      ? (isMyTask || t.createdBy === currentUser.id || assignees.some(a => a.teamId === currentUser.teamId) || isCrossDeptForMyDept)
      : (isMyTask && !t.crossDeptRejected)
    if (!inScope) return false
    if (search.trim() && !t.title.toLowerCase().includes(search.trim().toLowerCase()) && !t.description.toLowerCase().includes(search.trim().toLowerCase())) return false
    return true
  })

const bucketCount = (b: TaskBucket, issue?: boolean) =>
  scoped.filter(t =>
    isCountable(t) &&
    statusBucket(t) === b &&
    (issue === undefined || taskHadIssue(t) === issue)
  ).length

const visible = scoped
  .filter(t => filter === 'all' || (isCountable(t) && statusBucket(t) === filter))
  .sort(byCreatedDesc)

const toggleBucket = (b: TaskBucket) => setFilter(f => (f === b ? 'all' : b))

  const handleStart = async (id: string) => {
    const t0 = tasks.find(x => x.id === id)
    if (t0 && isTaskGated(t0)) { alert('Task này chưa được quản lý duyệt nên chưa thể bắt đầu.'); return }
    const now = new Date().toISOString()
    const { error } = await supabase.from('tasks').update({
      status: 'in-progress',
      started_at: now,
      work_status: 'processing',
      processing_started_at: now,
    }).eq('id', id)
    if (error) { alert('Không bắt đầu được task: ' + error.message); return }
  }

  const handleApprove = async (task: Task, result: 'successful' | 'with_issue') => {
    let closeNote = ''
    if (result === 'with_issue') {
      closeNote = window.prompt('Ghi rõ issue của task này (bắt buộc):', task.completeIssue ?? '') ?? ''
      if (!closeNote.trim()) return   // không ghi issue thì không đóng
    }
    const closeLabel = result === 'with_issue' ? 'Close with issue' : 'Close successful'
    const approvedAt = new Date().toISOString()

    const { error: approveError } = await supabase.from('tasks').update({
      status: 'completed',
      approved_by: currentUser.id,
      approved_at: approvedAt,
      close_result: result,
      close_note: closeNote.trim() || null,
    }).eq('id', task.id)

    if (approveError) {
      alert('Không thể duyệt task: ' + approveError.message)
      return
    }

    const isTeamwork = task.isTeamProject || task.assignedTo.length > 1 || task.supporters.length > 0
    const supportExp = Math.round(task.expReward * SUPPORTER_EXP_PERCENT)

    const bodUsers = users.filter(u => u.isDirector && u.id !== currentUser.id)
    const taskOwnerIds = Array.from(new Set([
      ...task.assignedTo,
      task.createdBy,
    ])).filter(Boolean)

    const taskOwnerNames = taskOwnerIds
      .map(uid => users.find(u => u.id === uid)?.name)
      .filter(Boolean)
      .join(', ')

    const taskTypeLabel = task.selfCreated ? 'task tự tạo' : 'task được giao'
    const departmentName = TEAMS.find(t => t.id === currentUser.teamId)?.name ?? currentUser.department

    for (const bod of bodUsers) {
      await supabase.from('notifications').insert({
        message: `📢 ${currentUser.name} (${departmentName}) đã ${closeLabel} ${taskTypeLabel}: "${task.title}"${taskOwnerNames ? ` — Nhân sự: ${taskOwnerNames}` : ''}`,
        target_user_id: bod.id,
        link_task_id: task.id,
      })
    }

    const rewardedIds = Array.from(new Set([...task.assignedTo, ...task.supporters]))
      .filter(uid => uid && uid !== currentUser.id)
    for (const uid of rewardedIds) {
      const isSupporter = task.supporters.includes(uid) && !task.assignedTo.includes(uid)
      const earnedExp = isSupporter ? supportExp : task.expReward
      await supabase.from('notifications').insert({
        message: `✅ ${currentUser.name} đã ${closeLabel} task: "${task.title}" — bạn nhận được +${earnedExp} EXP`,
        target_user_id: uid,
        link_task_id: task.id,
      })
    }

    const pmIds = task.projectManager.filter(uid => uid && uid !== currentUser.id)
    for (const uid of pmIds) {
      const pm = users.find(u => u.id === uid)
      const eligibleForExp = pm?.role === 'employee' || task.selfCreated || isTeamwork
      await supabase.from('notifications').insert({
        message: eligibleForExp
          ? `✅ ${currentUser.name} đã ${closeLabel} task: "${task.title}" — bạn nhận được +${task.expReward} EXP`
          : `✅ ${currentUser.name} đã duyệt task: "${task.title}" (task cá nhân, không cộng EXP cho PM)`,
        target_user_id: uid,
        link_task_id: task.id,
      })
    }

    for (const uid of task.assignedTo) {
      const assignee = users.find(u => u.id === uid)
      if (assignee) {
        await supabase.from('profiles').update({ exp: assignee.exp + task.expReward }).eq('id', assignee.id)
      }
    }

    for (const uid of task.projectManager) {
      const pm = users.find(u => u.id === uid)
      if (!pm) continue
      const eligibleForExp = pm.role === 'employee' || task.selfCreated || isTeamwork
      if (eligibleForExp) {
        await supabase.from('profiles').update({ exp: pm.exp + task.expReward }).eq('id', pm.id)
      }
    }

    for (const uid of task.supporters) {
      const supporter = users.find(u => u.id === uid)
      if (supporter) {
        await supabase.from('profiles').update({ exp: supporter.exp + supportExp }).eq('id', supporter.id)
      }
    }
  }

  const handleReject = async (task: Task) => {
    const reason = window.prompt('Lý do từ chối (nhân viên sẽ thấy để sửa lại):') ?? ''
    await supabase.from('tasks').update({
      status: 'in-progress',
      work_status: 'processing',
      processing_started_at: new Date().toISOString(),
      complete_issue: null,
      submission_file_url: null, submission_note: null, rejected_reason: reason,
    }).eq('id', task.id)

    const notifyIds = Array.from(new Set([...task.assignedTo, ...task.supporters]))
      .filter(uid => uid && uid !== currentUser.id)

    for (const uid of notifyIds) {
      await supabase.from('notifications').insert({
        message: `❌ ${currentUser.name} đã từ chối task: "${task.title}"${reason ? ` — Lý do: ${reason}` : ''}`,
        target_user_id: uid,
        link_task_id: task.id,
      })
    }
  }
    const handleRequestUnlock = async (task: Task) => {
    const reason = window.prompt('Lý do trễ hạn / xin mở khoá task:') ?? ''
    if (!reason.trim()) return
    await supabase.from('tasks').update({
      unlock_requested_reason: reason.trim(),
      unlock_requested_at: new Date().toISOString(),
    }).eq('id', task.id)

    const managers = users.filter(u => u.role === 'manager' && u.teamId === currentUser.teamId)
    for (const mgr of managers) {
      await supabase.from('notifications').insert({
        message: `🔒 ${currentUser.name} xin mở khoá task quá hạn "${task.title}": ${reason.trim()}`,
        target_user_id: mgr.id,
        link_task_id: task.id,
      })
    }
  }

  const handleUnlock = async (task: Task) => {
    await supabase.from('tasks').update({
      is_locked: false, unlock_requested_reason: null, unlock_requested_at: null,
      sla_unlock_granted: true,
    }).eq('id', task.id)

    const notifyIds = Array.from(new Set([...task.assignedTo, task.createdBy])).filter(uid => uid !== currentUser.id)
    for (const uid of notifyIds) {
      await supabase.from('notifications').insert({
        message: `🔓 ${currentUser.name} đã mở khoá task "${task.title}", bạn có thể tiếp tục làm.`,
        target_user_id: uid,
        link_task_id: task.id,
      })
    }
  }

  // Báo cho quản lý (cùng team + BOD) mỗi khi trạng thái xử lý của task thay đổi
  const notifyManagersWorkStatus = async (task: Task, newStatus: string) => {
    const managers = users.filter(u => u.role === 'manager' && (u.teamId === currentUser.teamId || u.isDirector) && u.id !== currentUser.id)
    const label = WORK_STATUS_CONFIG[newStatus]?.label ?? newStatus
    for (const mgr of managers) {
      await supabase.from('notifications').insert({
        message: `🔄 ${currentUser.name} đã chuyển task "${task.title}" sang trạng thái: ${label}`,
        target_user_id: mgr.id,
        link_task_id: task.id,
      })
    }
  }

  const updateWorkStatus = async (task: Task, newStatus: string) => {
    if (isTaskGated(task)) { alert('Task này chưa được quản lý duyệt nên chưa thể đổi trạng thái.'); return }
    // Xin tạm dừng: phải nhập lý do, và chỉ thực sự chuyển sang "pending" sau khi quản lý duyệt
    if (newStatus === 'pending') {
      if (task.pendingRequestedAt) return // đang chờ duyệt rồi, không gửi lại
      const reason = window.prompt('Lý do xin tạm dừng task này (quản lý sẽ duyệt trước khi chính thức tạm dừng):') ?? ''
      if (!reason.trim()) return
      const { error } = await supabase.from('tasks').update({
        pending_reason: reason.trim(),
        pending_requested_by: currentUser.id,
        pending_requested_at: new Date().toISOString(),
      }).eq('id', task.id)
      if (error) { alert('Không gửi được yêu cầu tạm dừng: ' + error.message); return }

      const managers = users.filter(u => u.role === 'manager' && (u.teamId === currentUser.teamId || u.isDirector))
      for (const mgr of managers) {
        await supabase.from('notifications').insert({
          message: `⏸ ${currentUser.name} xin tạm dừng task "${task.title}": ${reason.trim()}`,
          target_user_id: mgr.id,
          link_task_id: task.id,
        })
      }
      return
    }

    // Chuyển sang / tiếp tục "Đang xử lý": bắt đầu tính giờ nếu chưa chạy, cộng dồn tiếp nếu đang resume từ tạm dừng
    if (newStatus === 'processing') {
      const updates: Record<string, any> = { work_status: 'processing' }
      if (!task.processingStartedAt) updates.processing_started_at = new Date().toISOString()
      updates.pending_reason = null
      updates.pending_requested_by = null
      updates.pending_requested_at = null
      const { error } = await supabase.from('tasks').update(updates).eq('id', task.id)
      if (error) { alert('Không đổi được trạng thái: ' + error.message); return }
      await notifyManagersWorkStatus(task, newStatus)
      return
    }

    // Hoàn tất: dừng đồng hồ, cộng dồn thời gian đã chạy
    if (newStatus === 'complete') {
      const updates: Record<string, any> = { work_status: 'complete' }
      if (task.processingStartedAt) {
        const elapsed = Math.floor((Date.now() - new Date(task.processingStartedAt).getTime()) / 1000)
        updates.total_processing_seconds = (task.totalProcessingSeconds ?? 0) + elapsed
        updates.processing_started_at = null
      }
      const { error } = await supabase.from('tasks').update(updates).eq('id', task.id)
      if (error) { alert('Không đổi được trạng thái: ' + error.message); return }
      await notifyManagersWorkStatus(task, newStatus)
      return
    }

    // 'received' hoặc trường hợp khác: set trực tiếp
    const { error } = await supabase.from('tasks').update({ work_status: newStatus }).eq('id', task.id)
    if (error) { alert('Không đổi được trạng thái: ' + error.message); return }
    await notifyManagersWorkStatus(task, newStatus)
  }

  const handleApprovePending = async (task: Task) => {
    const updates: Record<string, any> = {
      work_status: 'pending',
      pending_requested_by: null,
      pending_requested_at: null,
      pending_reason: null,
    }
    if (task.processingStartedAt) {
      const elapsed = Math.floor((Date.now() - new Date(task.processingStartedAt).getTime()) / 1000)
      updates.total_processing_seconds = (task.totalProcessingSeconds ?? 0) + elapsed
      updates.processing_started_at = null
    }
    const { error } = await supabase.from('tasks').update(updates).eq('id', task.id)
    if (error) { alert('Không duyệt được yêu cầu tạm dừng: ' + error.message); return }

    const notifyId = task.pendingRequestedBy
    if (notifyId && notifyId !== currentUser.id) {
      await supabase.from('notifications').insert({
        message: `✅ ${currentUser.name} đã duyệt yêu cầu tạm dừng task "${task.title}"`,
        target_user_id: notifyId,
        link_task_id: task.id,
      })
    }
  }

  const handleRejectPending = async (task: Task) => {
    const reason = window.prompt('Lý do từ chối yêu cầu tạm dừng (không bắt buộc):') ?? ''
    const { error } = await supabase.from('tasks').update({
      pending_reason: null, pending_requested_by: null, pending_requested_at: null,
    }).eq('id', task.id)
    if (error) { alert('Không từ chối được yêu cầu: ' + error.message); return }

    const notifyId = task.pendingRequestedBy
    if (notifyId && notifyId !== currentUser.id) {
      await supabase.from('notifications').insert({
        message: `❌ ${currentUser.name} đã từ chối yêu cầu tạm dừng task "${task.title}"${reason.trim() ? `: ${reason.trim()}` : ''}`,
        target_user_id: notifyId,
        link_task_id: task.id,
      })
    }
  }

  const handleApproveCrossDept = async (task: Task) => {
    await supabase.from('tasks').update({ cross_dept_pending: false }).eq('id', task.id)
  }

  const handleRejectCrossDept = async (task: Task) => {
    const reason = window.prompt('Lý do từ chối (quản lý đã giao sẽ thấy lý do này):') ?? ''
    if (reason.trim() === '' && !window.confirm('Bạn chưa nhập lý do, vẫn muốn từ chối?')) return
    await supabase.from('tasks').update({
      cross_dept_pending: false,
      cross_dept_rejected: true,
      cross_dept_rejected_reason: reason.trim() || null,
      cross_dept_rejected_by: currentUser.id,
    }).eq('id', task.id)
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setSelfMode(task.selfCreated)
    setForm({
      title: task.title, description: task.description, expReward: task.expReward,
      startDate: task.startDate || todayStr, dueDate: task.dueDate,
      category: task.category, priority: task.priority,
      important: task.important, urgent: task.urgent, isTeamProject: task.isTeamProject ?? false,
      assignedTo: task.assignedTo, projectManager: task.projectManager, supporters: task.supporters,
          driveFolderCreated: task.driveFolderCreated ?? false,
    driveFolderName: task.driveFolderName ?? '',
    slaLevel: task.slaLevel ?? '',
    company: task.company ?? '',
  })
  setShowModal(true)
}

  const handleSaveTask = async () => {
    const prefixOnly = form.company && COMPANY_CODES[form.company] ? `${COMPANY_CODES[form.company]}-` : ''
    if (!form.title.trim() || form.title.trim() === prefixOnly) return
    const finalTitle = withCompanyPrefix(form.title, form.company, editingTask?.company)
    const { min, max } = getExpRange(form.priority, form.important, form.urgent)
    if (form.expReward < min || form.expReward > max) {
      alert(`Điểm EXP phải nằm trong khoảng ${min}–${max} cho mức độ "${PRIORITY_CONFIG[form.priority].label}" với lựa chọn Quan trọng/Gấp hiện tại`)
      return
    }

    if (editingTask) {
      const resubmit = editingTask.creationApproval === 'rejected' && editingTask.selfCreated && editingTask.createdBy === currentUser.id
      await supabase.from('tasks').update({
        title: finalTitle, company: form.company || null, description: form.description, exp_reward: form.expReward,
        assigned_to: form.assignedTo, project_manager: form.projectManager, supporters: form.supporters,
        start_date: form.startDate, due_date: form.dueDate,
        ...(resubmit ? { creation_approval: 'pending', creation_rejected_reason: null } : {}),
        category: form.category, priority: form.priority,
        important: form.important, urgent: form.urgent, is_team_project: form.isTeamProject,
              drive_folder_created: form.driveFolderCreated,
      drive_folder_name: form.driveFolderCreated ? (form.driveFolderName.trim() || null) : null,
      sla_level: form.slaLevel || null,
    }).eq('id', editingTask.id)
    if (resubmit) {
      for (const mgrId of getTaskApproverIds(currentUser.id, form.projectManager, users)) {
        await supabase.from('notifications').insert({
          message: `🔁 ${currentUser.name} đã chỉnh sửa và gửi duyệt lại task [${editingTask.taskCode ?? finalTitle}]`,
          target_user_id: mgrId, link_task_id: editingTask.id,
        })
      }
    }
  } else {
      const creatingForSelf = !isManager || selfMode
      const needsApproval = creatingForSelf && currentUser.role === 'employee'
      const assignedUsers = form.assignedTo.map(uid => users.find(u => u.id === uid)).filter(Boolean) as User[]
      const outsideAssignees = assignedUsers.filter(u => u.teamId !== currentUser.teamId)
      const isCrossDept = !creatingForSelf && !currentUser.isDirector && outsideAssignees.length > 0
      const targetTeamId = isCrossDept ? outsideAssignees[0].teamId : null

      const taskCode = generateTaskCode(form.startDate, tasks)
      const { data: newTask } = await supabase.from('tasks').insert({
        title: finalTitle, company: form.company || null, description: form.description, exp_reward: form.expReward,
        task_code: taskCode,
        sla_level: form.slaLevel || null,
        work_status: (creatingForSelf && !needsApproval) ? 'processing' : 'received',
        status: (creatingForSelf && !needsApproval) ? 'in-progress' : 'open',
        started_at: (creatingForSelf && !needsApproval) ? new Date().toISOString() : null,
        processing_started_at: (creatingForSelf && !needsApproval) ? new Date().toISOString() : null,
        assigned_to: creatingForSelf ? [currentUser.id] : form.assignedTo,
        project_manager: form.projectManager, supporters: form.supporters,
        created_by: currentUser.id,
        start_date: form.startDate,
        due_date: form.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        category: form.category, priority: form.priority, self_created: creatingForSelf,
        important: form.important, urgent: form.urgent, is_team_project: form.isTeamProject,
        cross_dept_pending: isCrossDept,
        creation_approval: needsApproval ? 'pending' : 'approved',
        target_team_id: targetTeamId,
        drive_folder_created: !creatingForSelf && form.driveFolderCreated,
        drive_folder_name: (!creatingForSelf && form.driveFolderCreated) ? (form.driveFolderName.trim() || null) : null,
      }).select('id').single()
      const newTaskId = newTask?.id

      if (isManager && !selfMode) {
        const taskContent = form.description.trim() || form.title
        for (const uid of form.assignedTo) {
          if (uid === currentUser.id) continue
          await supabase.from('notifications').insert({
            message: `📋 ${currentUser.name} vừa giao task [${taskCode}] cho bạn: ${taskContent}`,
            target_user_id: uid,
            link_task_id: newTaskId,
          })
        }

        for (const uid of form.supporters) {
          if (uid === currentUser.id) continue
          await supabase.from('notifications').insert({
            message: `🤝 ${currentUser.name} vừa thêm bạn làm người hỗ trợ task [${taskCode}]: ${taskContent}`,
            target_user_id: uid,
            link_task_id: newTaskId,
          })
        }

        if (isCrossDept && targetTeamId) {
          const targetManagers = users.filter(u => u.role === 'manager' && u.teamId === targetTeamId)
          const assigneeNames = outsideAssignees.map(u => u.name).join(', ')
          for (const mgr of targetManagers) {
            await supabase.from('notifications').insert({
              message: `📨 ${currentUser.name} (${TEAMS.find(t => t.id === currentUser.teamId)?.name ?? ''}) muốn giao task [${taskCode}] "${form.title}" cho ${assigneeNames} trong phòng ban của bạn: ${taskContent}`,
              target_user_id: mgr.id,
              link_task_id: newTaskId,
            })
          }
        }
      } else if (creatingForSelf) {
        const taskContent = form.description.trim() || form.title
        for (const mgrId of getTaskApproverIds(currentUser.id, form.projectManager, users)) {
          await supabase.from('notifications').insert({
            message: needsApproval
              ? `🎯 ${currentUser.name} vừa tự tạo task [${taskCode}] và đang chờ bạn duyệt trước khi làm: ${taskContent}`
              : `🎯 ${currentUser.name} vừa tự tạo task [${taskCode}]: ${taskContent}`,
            target_user_id: mgrId,
            link_task_id: newTaskId,
          })
        }
      }
    }

    setShowModal(false)
    setEditingTask(null)
    setSelfMode(false)
    setForm({ title: '', description: '', expReward: 80, startDate: todayStr, dueDate: '', category: 'development', priority: 'medium', important: false, urgent: false, isTeamProject: false, assignedTo: [], projectManager: [], supporters: [], driveFolderCreated: false, driveFolderName: '', slaLevel: '', company: '' })
  }

  const toggleFormArray = (field: 'assignedTo' | 'projectManager' | 'supporters', uid: string) => {
    setForm(f => ({
      ...f, [field]: f[field].includes(uid)
        ? f[field].filter(s => s !== uid)
        : [...f[field], uid],
    }))
  }

  const getUserById = (id?: string) => users.find(u => u.id === id)

  const canApproveCrossDept = (task: Task) => {
    if (!task.targetTeamId) return false
    const deptPrefix = (id?: string) => id?.match(/^t\d+/)?.[0] ?? ''
    return currentUser.isDirector
      ? deptPrefix(currentUser.teamId) === deptPrefix(task.targetTeamId)
      : currentUser.teamId === task.targetTeamId
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>Quản lý Task</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{visible.length} task</p>
        </div>
        <div className="flex gap-2">
          {isManager && (
            <button onClick={() => setShowCollabModal(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:scale-105"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: '#8b5cf6' }}>
              🤝 Phối hợp phòng ban
            </button>
          )}
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-white text-sm flex items-center gap-2 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 0 20px #7c3aed40' }}>
            <span className="text-lg leading-none">+</span>
            <span>{isManager ? 'Giao Task' : 'Tự tạo Task'}</span>
          </button>
        </div>
      </div>

      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm task theo tên hoặc mô tả..."
          className="w-full pl-9 pr-9 py-2.5 rounded-lg text-sm outline-none placeholder-[color:var(--text-muted)]"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}>
            ✕
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        {([['cards', '🗂 Thẻ'], ['tracker', '📊 Tracker']] as const).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setViewMode(k)}
            className="px-3.5 py-1.5 rounded-lg text-sm font-semibold"
            style={{
              background: viewMode === k ? '#0891b2' : 'var(--bg-panel)',
              color: viewMode === k ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${viewMode === k ? '#0891b2' : 'var(--border)'}`,
            }}>
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-start mb-5">
        <StatusStatCard icon="📥" label="Received" color={BUCKET_META.received.color}
          total={bucketCount('received')} active={filter === 'received'} onClick={() => toggleBucket('received')} />
        <StatusStatCard icon="⚙️" label="In-process" color={BUCKET_META.processing.color}
          total={bucketCount('processing')} active={filter === 'processing'} onClick={() => toggleBucket('processing')} />
        <StatusStatCard icon="⏸" label="Pending" color={BUCKET_META.pending.color}
          total={bucketCount('pending')} active={filter === 'pending'} onClick={() => toggleBucket('pending')} />
        <StatusStatCard icon="✅" label="Completed" color={BUCKET_META.completed.color}
          total={bucketCount('completed')} active={filter === 'completed'} onClick={() => toggleBucket('completed')}
          subs={[
            { label: 'Complete with issue', value: bucketCount('completed', true), color: '#dc2626' },
            { label: 'Complete successful', value: bucketCount('completed', false), color: '#059669' },
          ]} />
        <StatusStatCard icon="🔒" label="Close" color={BUCKET_META.closed.color}
          total={bucketCount('closed')} active={filter === 'closed'} onClick={() => toggleBucket('closed')}
          subs={[
            { label: 'Close with issue', value: bucketCount('closed', true), color: '#dc2626' },
            { label: 'Close successful', value: bucketCount('closed', false), color: '#059669' },
          ]} />
      </div>

      {viewMode === 'tracker' && <TaskTracker tasks={[...(currentUser.isDirector ? tasks : visible)].sort(byCreatedAsc)} users={users} currentUser={currentUser} />}
      <div className={viewMode === 'tracker' ? 'hidden' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
        {visible.map(task => {
          const assignees = task.assignedTo.map(getUserById).filter((u): u is User => !!u)
          const pms = task.projectManager.map(getUserById).filter((u): u is User => !!u)
          const pri = PRIORITY_CONFIG[task.priority]
          const isMyTask = task.assignedTo.includes(currentUser.id) || task.supporters.includes(currentUser.id)
          const isTaskParticipant = task.assignedTo.includes(currentUser.id) || task.projectManager.includes(currentUser.id) || task.supporters.includes(currentUser.id) || task.createdBy === currentUser.id
          const isBeforeStartDate = !!task.startDate && task.startDate > new Date().toISOString().split('T')[0]
          const catColor = CATEGORY_COLORS[task.category] ?? '#6b7280'
          const canEdit = isManager && (task.createdBy === currentUser.id || assignees.some(a => a.teamId === currentUser.teamId))

          const isFlashed = flashTaskId === task.id
          return (
            <div key={task.id} ref={el => { taskRefs.current[task.id] = el }}
              className="rounded-xl p-4 flex flex-col transition-all hover:-translate-y-0.5"
              style={{
                background: isFlashed ? '#7c3aed1a' : 'var(--bg-panel)',
                border: `1px solid ${isFlashed ? '#7c3aed' : task.status === 'completed' ? '#10b98130' : 'var(--border)'}`,
                boxShadow: isFlashed ? '0 0 16px #7c3aed40' : 'none',
                transition: 'background 0.4s ease, border 0.4s ease, box-shadow 0.4s ease',
              }}>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider"
                      style={{ background: `${catColor}20`, color: catColor }}>{task.category}</span>
                    {task.selfCreated && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#10b98122', color: '#10b981' }}>Tự tạo</span>}
                    {task.urgent && <span className="text-[10px] px-1.5 py-0.5 rounded font-bold animate-pulse" style={{ background: '#f8717122', color: '#dc2626' }}>⏰ GẤP</span>}
                    {task.important && <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#fbbf2422', color: '#d97706' }}>🔥 Quan trọng</span>}
                  </div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {task.taskCode && <span className="font-mono text-[10px] mr-1.5" style={{ color: 'var(--text-muted)' }}>[{task.taskCode}]</span>}
                    {task.title}
                  </h3>
                </div>
                <div className="text-right flex-shrink-0">
                  {canEdit && (
                    <button onClick={() => openEditModal(task)}
                      className="hover:text-violet-400 text-[10px] mb-1 block ml-auto" style={{ color: 'var(--text-muted)' }}>
                      ✏️ Sửa
                    </button>
                  )}
                  <div className="text-amber-500 font-black text-lg leading-none" style={{ fontFamily: 'Rajdhani, sans-serif' }}>+{task.expReward}</div>
                  <div className="text-amber-600 text-[10px] opacity-70">EXP</div>
                </div>
              </div>

              <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{task.description}</p>

              {/* Priority + date */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: pri.bg, color: pri.color }}>{pri.label}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>📅 {fmtDate(task.dueDate)}</span>
                {task.slaLevel && (
                  <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: `${SLA_LEVELS[task.slaLevel].color}22`, color: SLA_LEVELS[task.slaLevel].color }}>
                    {SLA_LEVELS[task.slaLevel].label}
                  </span>
                )}
              </div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <select value={task.workStatus ?? 'received'}
                  disabled={!!task.pendingRequestedAt || !!task.isLocked || isTaskGated(task) || task.status === 'submitted' || task.status === 'completed'}
                  onChange={e => {
                    if (e.target.value === 'complete') setSubmittingTask(task)
                    else updateWorkStatus(task, e.target.value)
                  }}
                  onClick={e => e.stopPropagation()}
                  className="text-xs px-2 py-1 rounded outline-none disabled:opacity-50"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: WORK_STATUS_CONFIG[task.workStatus ?? 'received'].color }}>
                  {Object.entries(WORK_STATUS_CONFIG)
                    .filter(([key]) => !(key === 'received' && task.selfCreated))
                    .map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                </select>
                {(task.workStatus === 'processing' || task.workStatus === 'pending' || task.workStatus === 'complete') && (
                  <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-muted)' }}>
                    ⏱ {formatDuration(getElapsedProcessingSeconds(task))}
                  </span>
                )}
                {isSlaOverdue(task) && !task.isLocked && (
                  <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: '#f8717122', color: '#dc2626' }}>
                    ⚠️ Quá hạn SLA
                  </span>
                )}
                {task.isLocked && (
                  <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: '#f8717122', color: '#dc2626' }}>
                    🔒 Đã khoá — quá hạn SLA
                  </span>
                )}
              </div>

              {task.pendingRequestedAt && (
                <div className="mb-3 p-2.5 rounded-lg" style={{ background: '#d9770622', border: '1px solid #d9770640' }}>
                  <p className="text-xs font-semibold" style={{ color: '#d97706' }}>⏳ Đang chờ duyệt yêu cầu tạm dừng</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Lý do: {task.pendingReason}</p>
                  {currentUser.role === 'manager' && (
                    <div className="flex gap-1.5 mt-2">
                      <button onClick={() => handleRejectPending(task)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: '#f8717122', color: '#dc2626' }}>
                        Từ chối
                      </button>
                      <button onClick={() => handleApprovePending(task)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: '#34d39922', color: '#059669' }}>
                        ✓ Duyệt tạm dừng
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* People section */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] w-14 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>Phụ trách:</span>
                  {assignees.length > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {assignees.map(a => (
                        <div key={a.id} className="flex items-center gap-1">
                          <CharAvatar user={a} size={20} />
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{shortName(a.name)}</span>
                        </div>
                      ))}
                    </div>
                  ) : <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Chưa giao</span>}
                </div>

                {pms.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] w-14 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>QL dự án:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {pms.map(pm => (
                        <div key={pm.id} className="flex items-center gap-1">
                          <CharAvatar user={pm} size={20} />
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pm.name}</span>                        </div>
                      ))}
                      <span className="text-[9px] px-1 rounded" style={{ background: '#a78bfa22', color: '#8b5cf6' }}>PM</span>
                    </div>
                  </div>
                )}

                {task.supporters.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-14 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>Hỗ trợ:</span>
                    <div className="flex -space-x-1">
                      {task.supporters.slice(0, 4).map(sid => {
                        const su = getUserById(sid)
                        return su ? <CharAvatar key={sid} user={su} size={20} /> : null
                      })}
                      {task.supporters.length > 4 && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px]"
                          style={{ background: 'var(--border)', color: 'var(--text-muted)', border: '2px solid var(--bg-panel)' }}>+{task.supporters.length - 4}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end mt-3">
                {task.crossDeptPending &&
                  currentUser.role === 'manager' &&
                  (currentUser.teamId === task.targetTeamId || currentUser.isDirector) ? (
                    <div className="flex flex-col gap-1.5 items-end">
                      <p className="text-[10px] text-right max-w-[220px] leading-relaxed" style={{ color: '#d97706' }}>
                        📨 {getUserById(task.createdBy)?.name} ({TEAMS.find(t => t.id === getUserById(task.createdBy)?.teamId)?.name}) muốn giao cho team {TEAMS.find(t => t.id === task.targetTeamId)?.name}
                      </p>
                      <div className="flex gap-1.5">
                        <button onClick={() => handleRejectCrossDept(task)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#f8717122', color: '#dc2626' }}>
                          Từ chối
                        </button>
                        <button onClick={() => handleApproveCrossDept(task)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#34d39922', color: '#059669' }}>
                          ✓ Duyệt nhận task
                        </button>
                      </div>
                    </div>

                  ) : task.crossDeptPending ? (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#fbbf2422', color: '#d97706' }}>
                      ⏳ Chờ quản lý phòng ban duyệt
                    </span>

                  ) : task.crossDeptRejected ? (
                    <div className="flex flex-col gap-1 items-end max-w-[240px]">
                      <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#f8717122', color: '#dc2626' }}>
                        ❌ Bị từ chối bởi {getUserById(task.crossDeptRejectedBy)?.name ?? 'quản lý phòng đích'}
                      </span>
                      {task.crossDeptRejectedReason && (
                        <p className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>Lý do: {task.crossDeptRejectedReason}</p>
                      )}
                    </div>

                  ) : task.creationApproval === 'pending' && canApproveSelfTask(task, currentUser, users) ? (
                    <div className="flex flex-col gap-1.5 items-end">
                      <p className="text-[10px] text-right max-w-[220px] leading-relaxed" style={{ color: '#d97706' }}>
                        🎯 {getUserById(task.createdBy)?.name} tự tạo task này, cần bạn duyệt trước khi làm
                      </p>
                      <div className="flex gap-1.5">
                        <button onClick={() => rejectSelfTask(task, currentUser)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#f8717122', color: '#dc2626' }}>
                          Từ chối
                        </button>
                        <button onClick={() => approveSelfTask(task, currentUser)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#34d39922', color: '#059669' }}>
                          ✓ Duyệt cho làm
                        </button>
                      </div>
                    </div>

                  ) : task.creationApproval === 'pending' ? (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#fbbf2422', color: '#d97706' }}>
                      ⏳ Chờ quản lý duyệt task này mới được làm
                    </span>

                  ) : task.creationApproval === 'rejected' ? (
                    <div className="flex flex-col gap-1 items-end max-w-[240px]">
                      <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#f8717122', color: '#dc2626' }}>
                        ❌ Quản lý {getUserById(task.creationApprovedBy)?.name ?? ''} từ chối
                      </span>
                      {task.creationRejectedReason && (
                        <p className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>Lý do: {task.creationRejectedReason}</p>
                      )}
                      <p className="text-[10px] text-right" style={{ color: 'var(--text-muted)' }}>Bấm "Sửa" rồi lưu để gửi duyệt lại</p>
                    </div>

                  ) : task.status === 'completed' ? (
                    <div className="flex flex-col items-end gap-0.5 max-w-[240px]">
                      <span className="text-xs font-semibold" style={{ color: task.closeResult === 'with_issue' ? '#b45309' : '#059669' }}>
                        {task.closeResult === 'with_issue' ? '🔒 Close with issue' : '🔒 Close successful'}
                      </span>
                      {(task.closeNote || task.completeIssue) && (
                        <p className="text-[11px] text-right" style={{ color: 'var(--text-muted)' }}>Issue: {task.closeNote || task.completeIssue}</p>
                      )}
                    </div>

                  ) : task.status === 'submitted' && currentUser.role === 'manager' ? (
                    <div className="flex flex-col gap-1.5 items-end">
                      {task.submissionOwnFolderUrl && (
                        <a href={task.submissionOwnFolderUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs underline" style={{ color: '#8b5cf6' }}>
                          📁 Xem folder Drive của người tự tạo task
                        </a>
                      )}
                      {task.submissionFolderName && (
                        <p className="text-[11px] max-w-[200px] text-right" style={{ color: 'var(--text-muted)' }}>📂 Nhân viên tự đặt tên folder: {task.submissionFolderName}</p>
                      )}
                      {task.submissionFileUrl && (
                        <a href={task.submissionFileUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs underline" style={{ color: '#3b82f6' }}>
                          📁 Xem file trên Google Drive
                        </a>
                      )}
                      {task.submissionNote && <p className="text-xs max-w-[200px] text-right" style={{ color: 'var(--text-muted)' }}>{task.submissionNote}</p>}
                      <p className="text-xs max-w-[240px] text-right font-semibold"
                        style={{ color: task.completeIssue ? '#dc2626' : '#059669' }}>
                        {task.completeIssue ? `⚠️ Complete with issue: ${task.completeIssue}` : '✅ Complete successful'}
                      </p>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        <button onClick={() => handleReject(task)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#f8717122', color: '#dc2626' }}>
                          Làm lại
                        </button>
                        <button onClick={() => handleApprove(task, 'with_issue')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#fbbf2433', color: '#b45309' }}>
                          🔒 Close with issue
                        </button>
                        <button onClick={() => handleApprove(task, 'successful')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#34d39922', color: '#059669' }}>
                          🔒 Close successful
                        </button>
                      </div>
                    </div>

                  ) : task.status === 'submitted' && task.assignedTo.includes(currentUser.id) ? (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#a78bfa22', color: '#8b5cf6' }}>
                      {task.completeIssue ? '⚠️ Complete with issue, chờ quản lý Close' : '✅ Complete successful, chờ quản lý Close'}
                    </span>

                  ) : (task.isLocked || (isSlaOverdue(task) && !task.slaUnlockGranted)) ? (
                    <div className="flex flex-col gap-1 items-end">
                      {task.unlockRequestedReason ? (
                        <>
                          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#fbbf2422', color: '#d97706' }}>
                            ⏳ Đang chờ duyệt mở khoá
                          </span>
                          <p className="text-[10px] max-w-[200px] text-right" style={{ color: 'var(--text-muted)' }}>Lý do: {task.unlockRequestedReason}</p>
                          {currentUser.role === 'manager' && (
                            <button onClick={() => handleUnlock(task)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#34d39922', color: '#059669' }}>
                              🔓 Mở khoá cho làm tiếp
                            </button>
                          )}
                        </>
                      ) : (
                        isMyTask && (
                          <button onClick={() => handleRequestUnlock(task)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#f8717122', color: '#dc2626' }}>
                            🔒 Xin mở khoá (ghi lý do)
                          </button>
                        )
                      )}
                    </div>
                  ) : isMyTask ? (
                    <div className="flex flex-col gap-1 items-end">
                      <div className="flex gap-1.5">
                        {task.status === 'open' && !task.crossDeptPending && isBeforeStartDate && (
                          <span className="px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-muted)' }}>
                            🔒 Chưa tới ngày bắt đầu ({fmtDate(task.startDate!)})
                          </span>
                        )}
                        {task.status === 'open' && !task.crossDeptPending && !isBeforeStartDate && (
                          <button onClick={() => handleStart(task.id)}
                            className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#3b82f622', color: '#2563eb' }}>
                            Bắt đầu
                          </button>
                        )}
                        {task.status === 'in-progress' && task.workStatus !== 'pending' && (
                          <button onClick={() => setSubmittingTask(task)}
                            className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#34d39922', color: '#059669' }}>
                            Complete ✓
                          </button>
                        )}
                        {task.status === 'in-progress' && task.workStatus === 'pending' && (
                          <span className="px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: '#d9770622', color: '#d97706' }}>
                            ⏸ Đang tạm hoãn, chưa thể nộp
                          </span>
                        )}
                      </div>
                      {task.status === 'in-progress' && task.rejectedReason && (
                        <p className="text-xs mt-1 max-w-[200px] text-right" style={{ color: '#dc2626' }}>❌ Bị từ chối: {task.rejectedReason}</p>
                      )}
                    </div>

                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded" style={{ color: STATUS_CONFIG[task.status].color, background: 'var(--bg-card-alt)' }}>
                      {STATUS_CONFIG[task.status].label}
                    </span>
                  )}
              </div>

                            {isTaskParticipant && (
                <>
                  <div className="flex gap-4 mt-3">
                    <button onClick={() => setOpenCommentsFor(openCommentsFor === task.id ? null : task.id)}
                      className="hover:text-violet-400 text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      💬 Thảo luận {openCommentsFor === task.id ? '▲' : '▼'}
                    </button>
                    <button onClick={() => setOpenWorkNoteFor(openWorkNoteFor === task.id ? null : task.id)}
                      className="hover:text-cyan-500 text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      📝 Work Note {openWorkNoteFor === task.id ? '▲' : '▼'}
                    </button>
                  </div>
                  {openCommentsFor === task.id && (
                    <TaskCommentsPanel taskId={task.id} currentUser={currentUser} users={users} />
                  )}
                  {openWorkNoteFor === task.id && (
                    <TaskWorkNotePanel taskId={task.id} currentUser={currentUser} users={users} />
                  )}

                  <button onClick={() => setOpenTicketFor(openTicketFor === task.id ? null : task.id)}
                    className="hover:text-cyan-400 text-xs flex items-center gap-1 mt-2" style={{ color: 'var(--text-muted)' }}>
                    📋 Trạng thái Ticket {openTicketFor === task.id ? '▲' : '▼'}
                  </button>
                  {openTicketFor === task.id && (
                    <TaskTicketPanel task={task} currentUser={currentUser} users={users} canSubmit={isMyTask} />
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">📭</div>
          <div className="text-sm">Không có task nào</div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
                {editingTask ? '✏️ Chỉnh sửa Task' : isManager && !selfMode ? '📋 Giao Task Mới' : '🎯 Tạo Task Cá Nhân'}
              </h3>
              <button onClick={() => { setShowModal(false); setEditingTask(null); setSelfMode(false) }}
                className="text-2xl leading-none hover:opacity-70" style={{ color: 'var(--text-muted)' }}>×</button>
            </div>

            {isManager && !editingTask && (
              <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
                <button onClick={() => setSelfMode(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: !selfMode ? '#7c3aed' : 'transparent', color: !selfMode ? '#fff' : 'var(--text-muted)' }}>
                  📋 Giao cho người khác
                </button>
                <button onClick={() => setSelfMode(true)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: selfMode ? '#7c3aed' : 'transparent', color: selfMode ? '#fff' : 'var(--text-muted)' }}>
                  🎯 Tự tạo cho tôi
                </button>
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Công ty</label>
                <select value={form.company}
                  onChange={e => { const v = e.target.value; setForm(f => ({ ...f, company: v, title: withCompanyPrefix(f.title, v, f.company) })) }}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  <option value="">-- Chọn công ty --</option>
                  {COMPANIES.map(c => <option key={c} value={c}>{COMPANY_CODES[c] ? `${COMPANY_CODES[c]} · ${c}` : c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Tên task *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Mô tả ngắn gọn task..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none placeholder-[color:var(--text-muted)]"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Mô tả</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Yêu cầu và mục tiêu cụ thể..." rows={2}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none placeholder-[color:var(--text-muted)]"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Ngày bắt đầu</label>
                  <input type="date" value={form.startDate}
                    onChange={e => {
                      const startDate = e.target.value
                      setForm(f => ({ ...f, startDate, expReward: suggestExp(f.priority, startDate, f.dueDate, f.important, f.urgent) }))
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Hạn hoàn thành</label>
                  <input type="date" value={form.dueDate} min={form.startDate || undefined}
                    onChange={e => {
                      const dueDate = e.target.value
                      setForm(f => ({ ...f, dueDate, expReward: suggestExp(f.priority, f.startDate, dueDate, f.important, f.urgent) }))
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>EXP thưởng</label>
                <input type="number" value={form.expReward}
                  onChange={e => setForm({ ...form, expReward: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-lg text-amber-500 text-sm outline-none font-bold"
                  style={{
                    background: 'var(--bg-card-alt)',
                    border: `1px solid ${form.expReward < getExpRange(form.priority, form.important, form.urgent).min || form.expReward > getExpRange(form.priority, form.important, form.urgent).max ? '#f87171' : 'var(--border)'}`,
                  }} />
                <p className="text-[10px] mt-1.5 leading-relaxed"
                  style={{ color: form.expReward < getExpRange(form.priority, form.important, form.urgent).min || form.expReward > getExpRange(form.priority, form.important, form.urgent).max ? '#dc2626' : 'var(--text-muted)' }}>
                  💡 Gợi ý theo độ khó + Quan trọng/Gấp: {getExpRange(form.priority, form.important, form.urgent).min}–{getExpRange(form.priority, form.important, form.urgent).max} EXP
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Danh mục</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Ưu tiên</label>
                  <select value={form.priority}
                    onChange={e => {
                      const newPriority = e.target.value as TaskPriority
                      setForm(f => ({ ...f, priority: newPriority, expReward: suggestExp(newPriority, f.startDate, f.dueDate, f.important, f.urgent) }))
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </div>
              </div>

                            <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Mức độ quan trọng</label>
                  <select value={form.important ? '1' : '0'}
                    onChange={e => {
                      const important = e.target.value === '1'
                      setForm(f => ({ ...f, important, expReward: suggestExp(f.priority, f.startDate, f.dueDate, important, f.urgent) }))
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    <option value="0">Không quan trọng</option>
                    <option value="1">Quan trọng</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Mức độ gấp</label>
                  <select value={form.urgent ? '1' : '0'}
                    onChange={e => {
                      const urgent = e.target.value === '1'
                      setForm(f => ({ ...f, urgent, expReward: suggestExp(f.priority, f.startDate, f.dueDate, f.important, urgent) }))
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    <option value="0">Không gấp</option>
                    <option value="1">Gấp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                  Mức độ SLA (thời gian xử lý bắt buộc)
                </label>
                <select value={form.slaLevel} onChange={e => setForm({ ...form, slaLevel: e.target.value as any })}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  <option value="">-- Không áp dụng SLA --</option>
                  {Object.entries(SLA_LEVELS).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
                <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  💡 Đồng hồ SLA bắt đầu tính từ lúc nhân viên bấm "Bắt đầu", không phải từ ngày bắt đầu dự kiến.
                </p>
              </div>

              {isManager && (
                <div className="p-3 rounded-lg" style={{ background: '#0ea5e914', border: '1px solid #0ea5e930' }}>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input type="checkbox" checked={form.isTeamProject}
                      onChange={e => setForm({ ...form, isTeamProject: e.target.checked })}
                      className="w-4 h-4 rounded accent-cyan-500" />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>👥 Đây là dự án nhóm (Teamwork)</span>
                  </label>
                  <p className="text-[10px] mt-1.5 leading-relaxed ml-6" style={{ color: 'var(--text-muted)' }}>
                    💡 Tick vào nếu đây là công việc nhóm — Quản lý dự án (PM) sẽ luôn được nhận EXP dù chỉ giao cho 1 người phụ trách.
                  </p>
                </div>
              )}

              {isManager && !selfMode && (
                <>
                  <MultiUserSelect
                    label="Giao cho (Phụ trách) — mỗi người nhận đủ 100% EXP"
                    options={employees}
                    selected={form.assignedTo}
                    onToggle={uid => toggleFormArray('assignedTo', uid)}
                    placeholder="Chưa giao"
                    isDirector={currentUser.isDirector} />

                  <MultiUserSelect
                    label="Quản lý dự án (PM) — mỗi người nhận đủ 100% EXP"
                    options={teamUsers}
                    selected={form.projectManager}
                    onToggle={uid => toggleFormArray('projectManager', uid)}
                    placeholder="Chọn PM..."
                    badge="PM"
                    isDirector={currentUser.isDirector} />

                  <MultiUserSelect
                    label={`Người hỗ trợ — mỗi người nhận ${Math.round(SUPPORTER_EXP_PERCENT * 100)}% EXP`}
                    options={employees}
                    selected={form.supporters}
                    onToggle={uid => toggleFormArray('supporters', uid)}
                    placeholder="Chọn người hỗ trợ..."
                    isDirector={currentUser.isDirector} />

                  <div className="p-3 rounded-lg" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
                    <label className="flex items-center gap-2.5 mb-2 cursor-pointer select-none">
                      <input type="checkbox" checked={form.driveFolderCreated}
                        onChange={e => setForm({ ...form, driveFolderCreated: e.target.checked })}
                        className="w-4 h-4 rounded accent-violet-500" />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>📁 Tôi đã tạo sẵn folder Drive cho task này</span>
                    </label>

                    {form.driveFolderCreated ? (
                      <input value={form.driveFolderName} onChange={e => setForm({ ...form, driveFolderName: e.target.value })}
                        placeholder="Tên folder (VD: Nộp task - Nguyễn Văn A)"
                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none placeholder-[color:var(--text-muted)]"
                        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                    ) : (
                      <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        💡 Nếu không tick, nhân viên sẽ tự tạo folder trong Drive của bạn và tự đặt tên khi nộp.
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => { setShowModal(false); setEditingTask(null); setSelfMode(false) }}
                  className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Hủy</button>
                <button onClick={handleSaveTask} disabled={!form.title.trim()}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>{editingTask ? 'Lưu thay đổi' : 'Tạo Task'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {submittingTask && (
        <SubmitTaskModal task={submittingTask} currentUser={currentUser} users={users} onClose={() => setSubmittingTask(null)} />
      )}
      {showCollabModal && (
        <CollaborationRequestModal currentUser={currentUser} users={users} onClose={() => setShowCollabModal(false)} />
      )}
    </div>
  )
}

// ==================== LEADERBOARD ====================

function LeaderboardView({ users, tasks }: { users: User[]; tasks: Task[] }) {
  const [tab, setTab] = useState<'individual' | 'team'>('individual')
  const sorted = [...users].sort((a, b) => b.exp - a.exp)
  const teams = TEAMS.map(team => {
    const members = users.filter(u => u.teamId === team.id)
    const totalExp = members.reduce((s, u) => s + u.exp, 0)
    const done = tasks.filter(t => t.status === 'completed' && members.some(u => t.assignedTo.includes(u.id))).length
    return { ...team, totalExp, memberCount: members.length, done, manager: users.find(u => u.teamId === team.id && u.role === 'manager') }
  }).sort((a, b) => b.totalExp - a.totalExp)
  const medals = ['🥇', '🥈', '🥉']
  const medalBg = ['#fef3c7', '#f1f5f9', '#fed7aa']
  const rankBorder = ['#f59e0b40', '#94a3b840', '#ea580c30']

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black mb-1" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>🏆 BẢNG XẾP HẠNG</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cạnh tranh lành mạnh — phát triển cùng nhau</p>
      </div>

      <div className="flex p-1 rounded-xl mb-6" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
        {[['individual', '👤 Cá nhân'], ['team', '👥 Đội nhóm']].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id as typeof tab)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: tab === id ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'transparent', color: tab === id ? '#fff' : 'var(--text-muted)' }}>
            {lbl}
          </button>
        ))}
      </div>

      {tab === 'individual' ? (
        <div className="space-y-3">
          {sorted.map((user, i) => {
            const done = tasks.filter(t => t.status === 'completed' && t.assignedTo.includes(user.id)).length
            const isTop = i < 3
            return (
              <div key={user.id} className="rounded-xl p-4 flex items-center gap-3 transition-all hover:-translate-y-0.5"
                style={{
                  background: isTop ? `linear-gradient(135deg, ${user.avatar.outfitColor}12, var(--bg-panel))` : 'var(--bg-panel)',
                  border: `1px solid ${isTop ? rankBorder[i] : 'var(--border)'}`,
                  boxShadow: isTop ? `0 4px 16px ${user.avatar.outfitColor}18` : '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: isTop ? medalBg[i] : 'var(--bg-card-alt)' }}>
                  {isTop ? <span className="text-lg">{medals[i]}</span>
                    : <span className="font-bold text-xs font-mono" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>}
                </div>
                <CharAvatar user={user} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
                    <LevelBadge exp={user.exp} />
                    {user.role === 'manager' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#a78bfa22', color: '#8b5cf6', border: '1px solid #a78bfa30' }}>
                        Quản lý
                      </span>
                    )}
                  </div>
                  <div className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    {TEAMS.find(t => t.id === user.teamId)?.name ?? '—'} · {done} task xong
                  </div>
                  <div className="max-w-[160px]"><ExpBarMini exp={user.exp} /></div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-amber-500 text-xl font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{user.exp.toLocaleString()}</div>
                  <div className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>EXP</div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map((team, i) => {
            const isTop = i === 0
            return (
              <div key={team.id} className="rounded-xl p-5 transition-all hover:-translate-y-0.5"
                style={{
                  background: 'var(--bg-panel)',
                  border: `1px solid ${isTop ? '#f59e0b40' : 'var(--border)'}`,
                  boxShadow: isTop ? '0 4px 16px #f59e0b15' : '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: i < 3 ? medalBg[i] : 'var(--bg-card-alt)' }}>
                      <span className="text-xl">{i < 3 ? medals[i] : `#${i + 1}`}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{team.emoji}</span>
                        <span className="font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>{team.name}</span>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Quản lý: {team.manager?.name ?? '—'} · {team.memberCount} thành viên
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-500 text-2xl font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{team.totalExp.toLocaleString()}</div>
                    <div className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>tổng EXP</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="text-center">
                    <div className="font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>{team.done}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Task xong</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
                      {team.memberCount > 0 ? Math.round(team.totalExp / team.memberCount) : 0}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>EXP TB/người</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ==================== REWARDS ====================
function RedemptionHistoryPanel({ users, refreshKey }: { users: User[]; refreshKey?: number }) {
  const [allRedemptions, setAllRedemptions] = useState<{
    id: string; userId: string; rewardName: string; cost: number; redeemedAt: string
  }[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<'week' | 'month' | 'all' | 'custom'>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const load = async () => {
    const { data } = await supabase.from('redemptions').select('*').order('redeemed_at', { ascending: false })
    if (data) setAllRedemptions(data.map(r => ({
      id: r.id, userId: r.user_id, rewardName: r.reward_name, cost: r.cost, redeemedAt: r.redeemed_at,
    })))
    setLoading(false)
  }

  // Tải lại khi danh sách đổi quà của app đổi (ví dụ vừa đổi xong)
  useEffect(() => { load() }, [refreshKey])

  // Và tự cập nhật khi bất kỳ ai đổi quà (realtime)
  useEffect(() => {
    const ch = supabase.channel(`redemption-history-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'redemptions' }, () => { load() })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const filtered = allRedemptions.filter(r => {
    const d = new Date(r.redeemedAt)
    const now = new Date()
    if (range === 'week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      return d >= startOfWeek
    }
    if (range === 'month') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }
    if (range === 'custom') {
      if (customFrom && d < new Date(customFrom)) return false
      if (customTo && d > new Date(customTo + 'T23:59:59')) return false
      return true
    }
    return true // 'all'
  })

  const exportExcel = () => {
    const rows = filtered.map(r => {
      const u = users.find(x => x.id === r.userId)
      const team = TEAMS.find(t => t.id === u?.teamId)
      return {
        'Nhân viên': u?.name ?? '(đã xoá)',
        'Email': u?.email ?? '',
        'Phòng ban': team?.name ?? '',
        'Phần thưởng': r.rewardName,
        'Điểm đã dùng': r.cost,
        'Ngày đổi': new Date(r.redeemedAt).toLocaleString('vi-VN'),
      }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [{ wch: 22 }, { wch: 26 }, { wch: 28 }, { wch: 25 }, { wch: 14 }, { wch: 20 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Lich su doi qua')
    const label = range === 'week' ? 'tuan-nay' : range === 'month' ? 'thang-nay' : range === 'custom' ? `${customFrom || 'batdau'}_${customTo || 'ketthuc'}` : 'tatca'
    XLSX.writeFile(wb, `lich-su-doi-qua_${label}.xlsx`)
  }

  const RANGE_OPTIONS: { id: typeof range; label: string }[] = [
    { id: 'week', label: 'Tuần này' },
    { id: 'month', label: 'Tháng này' },
    { id: 'all', label: 'Tất cả' },
    { id: 'custom', label: 'Tự chọn' },
  ]

  return (
    <div className="mt-8 rounded-xl p-5" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
          📋 Lịch sử đổi quà toàn công ty
        </h3>
        <button onClick={exportExcel} disabled={filtered.length === 0}
          className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-40"
          style={{ background: '#10b981', color: '#fff' }}>
          ⬇ Xuất Excel ({filtered.length})
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {RANGE_OPTIONS.map(opt => (
          <button key={opt.id} onClick={() => setRange(opt.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: range === opt.id ? '#7c3aed' : 'var(--bg-card-alt)', color: range === opt.id ? '#fff' : 'var(--text-muted)' }}>
            {opt.label}
          </button>
        ))}
        {range === 'custom' && (
          <>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-xs outline-none"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>đến</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              className="px-2 py-1.5 rounded-lg text-xs outline-none"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </>
        )}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Không có dữ liệu trong khoảng thời gian này.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>Nhân viên</th>
                <th className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>Email</th>
                <th className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>Phòng ban</th>
                <th className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>Phần thưởng</th>
                <th className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>Điểm</th>
                <th className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>Ngày đổi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const u = users.find(x => x.id === r.userId)
                const team = TEAMS.find(t => t.id === u?.teamId)
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2 pr-4" style={{ color: 'var(--text-primary)' }}>{u?.name ?? '(đã xoá)'}</td>
                    <td className="py-2 pr-4 text-xs" style={{ color: 'var(--text-muted)' }}>{u?.email ?? ''}</td>
                    <td className="py-2 pr-4 text-xs" style={{ color: 'var(--text-muted)' }}>{team?.name ?? ''}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--text-primary)' }}>{r.rewardName}</td>
                    <td className="py-2 pr-4 text-amber-500">{r.cost}</td>
                    <td className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>{new Date(r.redeemedAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function BodLogView({ tasks, users }: { tasks: Task[]; users: User[] }) {
  const [tab, setTab] = useState<'tasks' | 'rewards'>('tasks')
  const getUserById = (id?: string) => users.find(u => u.id === id)

  const approvedTasks = [...tasks]
    .filter(t => t.status === 'completed')
    .sort((a, b) => (b.approvedAt ?? '').localeCompare(a.approvedAt ?? ''))

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black mb-1" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>📊 Nhật ký BOD</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Theo dõi task đã duyệt và phần thưởng đã đổi toàn công ty</p>
      </div>

      <div className="flex p-1 rounded-xl mb-6 max-w-md mx-auto" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
        {[['tasks', '📋 Task đã duyệt'], ['rewards', '🎁 Phần thưởng đã đổi']].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id as typeof tab)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: tab === id ? '#7c3aed' : 'transparent', color: tab === id ? '#fff' : 'var(--text-muted)' }}>
            {lbl}
          </button>
        ))}
      </div>

      {tab === 'tasks' ? (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          {approvedTasks.length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>Chưa có task nào được duyệt.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th className="py-2.5 px-4">Task</th>
                    <th className="py-2.5 px-4">Người phụ trách</th>
                    <th className="py-2.5 px-4">Phòng ban</th>
                    <th className="py-2.5 px-4">Duyệt bởi</th>
                    <th className="py-2.5 px-4">Ngày duyệt</th>
                    <th className="py-2.5 px-4">EXP</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedTasks.map(t => {
                    const assignee = getUserById(t.assignedTo[0])
                    const approver = getUserById(t.approvedBy)
                    const team = TEAMS.find(team => team.id === assignee?.teamId)
                    return (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-2.5 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>{t.title}</td>
                        <td className="py-2.5 px-4" style={{ color: 'var(--text-primary)' }}>
                          {t.assignedTo.map(id => getUserById(id)?.name).filter(Boolean).join(', ') || '—'}
                        </td>
                        <td className="py-2.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{team?.name ?? '—'}</td>
                        <td className="py-2.5 px-4" style={{ color: 'var(--text-primary)' }}>{approver?.name ?? '—'}</td>
                        <td className="py-2.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {t.approvedAt ? new Date(t.approvedAt).toLocaleString('vi-VN') : '—'}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-amber-500">+{t.expReward}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <RedemptionHistoryPanel users={users} />
      )}
    </div>
  )
}


function RewardsView({ currentUser, redemptions, users }: { currentUser: User; redemptions: { id: string; userId: string; rewardId: string; cost: number }[]; users: User[] }) {
  const myRedemptions = redemptions.filter(r => r.userId === currentUser.id)
  const spentPoints = myRedemptions.reduce((s, r) => s + r.cost, 0)
  const availablePoints = currentUser.exp - spentPoints
  const redeemed = myRedemptions.map(r => r.rewardId)
  const [notice, setNotice] = useState('')

  const handleRedeem = async (r: Reward) => {
    if (availablePoints < r.cost || redeemed.includes(r.id)) return
    const { error } = await supabase.from('redemptions').insert({
      user_id: currentUser.id, reward_id: r.id, reward_name: r.name, cost: r.cost,
    })
    if (error) { setNotice('❌ Lỗi: ' + error.message); setTimeout(() => setNotice(''), 3500); return }

    await supabase.from('notifications').insert({
      message: `🎁 ${currentUser.name} vừa dùng ${r.cost} điểm đổi lấy: ${r.name}`,
    })

    setNotice(`🎉 Đổi thành công: ${r.name}!`)
    setTimeout(() => setNotice(''), 3500)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>🎁 Cửa Hàng Phần Thưởng</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đổi EXP lấy phần thưởng xứng đáng</p>
        </div>
        <div className="px-5 py-3 rounded-xl text-right" style={{ background: '#f59e0b14', border: '1px solid #f59e0b30' }}>
          <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Điểm khả dụng</div>
          <div className="text-amber-500 text-2xl font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{availablePoints.toLocaleString()} ⚡</div>
        </div>
      </div>

      {notice && (
        <div className="mb-5 p-3 rounded-xl text-center text-sm font-medium animate-slide-up"
          style={{ background: '#10b98114', border: '1px solid #10b98130', color: '#10b981' }}>{notice}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {REWARDS.map(r => {
          const can = availablePoints >= r.cost
          const done = redeemed.includes(r.id)
          return (
            <div key={r.id} className="rounded-xl p-5 flex flex-col transition-all hover:-translate-y-0.5"
              style={{
                background: 'var(--bg-panel)',
                border: `1px solid ${done ? '#10b98130' : can ? 'var(--border)' : 'var(--border)'}`,
                opacity: done ? 0.75 : can ? 1 : 0.6,
              }}>
              <div className="text-4xl text-center mb-3">{r.emoji}</div>
              <div className="flex-1 text-center">
                <h3 className="font-bold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>{r.name}</h3>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{r.description}</p>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-muted)' }}>{r.category}</span>
              </div>
              <div className="mt-4 text-center mb-2">
                <span className="text-xl font-black" style={{ fontFamily: 'Rajdhani, sans-serif', color: can ? '#d97706' : 'var(--text-muted)' }}>
                  {r.cost.toLocaleString()} EXP
                </span>
              </div>
              <button onClick={() => handleRedeem(r)} disabled={!can || done}
                className="w-full py-2 rounded-lg font-bold text-sm disabled:cursor-not-allowed"
                style={{
                  background: done ? '#10b98118' : can ? 'linear-gradient(135deg,#7c3aed,#f59e0b)' : 'var(--bg-card-alt)',
                  color: done ? '#10b981' : can ? '#fff' : 'var(--text-muted)',
                }}>
                {done ? '✓ Đã đổi' : can ? 'Đổi ngay' : 'Chưa đủ EXP'}
              </button>
            </div>
          )
        })}
      </div>

      {currentUser.teamId === 't1c' && <RedemptionHistoryPanel users={users} refreshKey={redemptions.length} />}
    </div>
  )
}




function UserProfileCard({ user, onClose, onMessage }: { user: User; onClose: () => void; onMessage?: () => void }) {
  const { progress, needed, level } = getExpProgress(user.exp)
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="relative w-full max-w-xs rounded-2xl p-6 text-center animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{ background: `linear-gradient(135deg, ${user.avatar.outfitColor}18, var(--bg-panel))`, border: `1px solid ${user.avatar.outfitColor}35` }}>
        <button onClick={onClose} className="absolute top-3 right-3 text-xl leading-none hover:opacity-70" style={{ color: 'var(--text-muted)' }}>×</button>
        <div className="w-24 h-24 mx-auto mb-3 rounded-2xl overflow-hidden flex items-center justify-center"
          style={{ background: `${user.avatar.outfitColor}20`, border: `2px solid ${user.avatar.outfitColor}40`, boxShadow: `0 0 24px ${user.avatar.outfitColor}40` }}>
          <FullAvatar avatar={user.avatar} name={user.name} size={92} />
        </div>
        <h3 className="font-bold text-lg mb-0.5" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>{user.name}</h3>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{TEAMS.find(t => t.id === user.teamId)?.name ?? user.department}</p>
        <div className="flex justify-center mb-3"><LevelBadge exp={user.exp} /></div>
        <div className="text-amber-500 text-xl font-black mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{user.exp.toLocaleString()} EXP</div>
        <div className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>Cần {needed} EXP → Lv.{level + 1}</div>
        <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#f59e0b)' }} />
        </div>
        <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium" style={{ background: '#a78bfa18', color: '#8b5cf6', border: '1px solid #a78bfa30' }}>
          {user.role === 'manager' ? '👑 Quản Lý' : '⚔️ Nhân Viên'}
        </span>
        {onMessage && (
          <button onClick={onMessage}
            className="w-full mt-4 py-2.5 rounded-lg font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>
            💬 Nhắn tin riêng
          </button>
        )}
      </div>
    </div>
  )
}


function BrowseByDepartmentModal({ users, currentUser, onSelectUser, onClose }: {
  users: User[]; currentUser: User; onSelectUser: (userId: string) => void; onClose: () => void
}) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const teamsWithCount = TEAMS.map(t => ({
    ...t, count: users.filter(u => u.teamId === t.id && u.id !== currentUser.id).length,
  })).filter(t => t.count > 0)

  const peopleInTeam = selectedTeamId
    ? users.filter(u => u.teamId === selectedTeamId && u.id !== currentUser.id)
    : []

  const searchResults = search.trim()
    ? users.filter(u => u.id !== currentUser.id && u.name.toLowerCase().includes(search.trim().toLowerCase()))
    : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-sm rounded-2xl p-5 max-h-[80vh] flex flex-col" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
            {selectedTeamId && !search.trim() ? (
              <>
                <button onClick={() => setSelectedTeamId(null)} className="text-lg hover:opacity-70" style={{ color: 'var(--text-muted)' }}>‹</button>
                {TEAMS.find(t => t.id === selectedTeamId)?.emoji} {TEAMS.find(t => t.id === selectedTeamId)?.name}
              </>
            ) : (
              <>🏢 Tìm người để nhắn tin</>
            )}
          </h3>
          <button onClick={onClose} className="text-2xl leading-none hover:opacity-70" style={{ color: 'var(--text-muted)' }}>×</button>
        </div>

        <div className="relative mb-3 flex-shrink-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} autoFocus
            placeholder="Gõ tên cần tìm..."
            className="w-full pl-9 pr-8 py-2.5 rounded-lg text-sm outline-none placeholder-[color:var(--text-muted)]"
            style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm hover:opacity-70" style={{ color: 'var(--text-muted)' }}>✕</button>
          )}
        </div>

        <div className="overflow-y-auto flex-1 space-y-1.5">
          {search.trim() ? (
            searchResults.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Không tìm thấy ai tên "{search.trim()}".</p>
            ) : (
              searchResults.map(u => (
                <button key={u.id} onClick={() => onSelectUser(u.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all hover:brightness-95"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
                  <CharAvatar user={u} size={28} />
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{u.name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {TEAMS.find(t => t.id === u.teamId)?.name}{u.role === 'manager' ? ' · Quản lý' : ''}
                    </div>
                  </div>
                </button>
              ))
            )
          ) : !selectedTeamId ? (
            teamsWithCount.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Chưa có phòng ban nào có nhân sự.</p>
            ) : (
              teamsWithCount.map(t => (
                <button key={t.id} onClick={() => setSelectedTeamId(t.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all hover:brightness-95"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
                  <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span className="text-lg">{t.emoji}</span> {t.name}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.count} người ›</span>
                </button>
              ))
            )
          ) : (
            peopleInTeam.map(u => (
              <button key={u.id} onClick={() => onSelectUser(u.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all hover:brightness-95"
                style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
                <CharAvatar user={u} size={28} />
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{u.name}</div>
                  {u.role === 'manager' && <div className="text-[10px]" style={{ color: '#8b5cf6' }}>Quản lý</div>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
// ==================== SOCIAL ====================

function SocialView({ currentUser, users, messages, setMessages, showMentions, setShowMentions, markMentionsSeen, navigateTarget, clearNavigateTarget, proposals }: {
  currentUser: User; users: User[]; messages: Message[]; setMessages: (m: Message[]) => void
  showMentions: boolean; setShowMentions: (v: boolean) => void; markMentionsSeen: () => void
  navigateTarget?: { channel: ChatChannel; dmUserId?: string; proposalId?: string } | null
  clearNavigateTarget?: () => void
  proposals: Proposal[]
}) {
  const [channel, setChannel] = useState<ChatChannel>('general')
  const [proposalId, setProposalId] = useState<string | null>(null)
  const [dmUserId, setDmUserId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [showBrowseDept, setShowBrowseDept] = useState(false)
  const [proposalsOpen, setProposalsOpen] = useState(false)
  const [lastSeenMap, setLastSeenMap] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('chatLastSeen') || '{}') } catch { return {} }
  })
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  const markSeen = (key: string) => {
    const now = new Date().toISOString()
    setLastSeenMap(prev => {
      const next = { ...prev, [key]: now }
      localStorage.setItem('chatLastSeen', JSON.stringify(next))
      return next
    })
  }

  useEffect(() => { markSeen('channel:general') }, [])

  useEffect(() => {
  if (!navigateTarget) return
  setShowMentions(false)
  if (navigateTarget.channel === 'proposal' && navigateTarget.proposalId) {
    setChannel('proposal')
    setDmUserId(null)
    setProposalId(navigateTarget.proposalId)
  } else if (navigateTarget.channel === 'dm' && navigateTarget.dmUserId) {
    setChannel('dm')
    setDmUserId(navigateTarget.dmUserId)
    setProposalId(null)
    markSeen(`dm:${navigateTarget.dmUserId}`)
  } else {
    setChannel(navigateTarget.channel)
    setDmUserId(null)
    setProposalId(null)
    markSeen(`channel:${navigateTarget.channel}`)
  }
  clearNavigateTarget?.()
}, [navigateTarget])

  useEffect(() => {
    if (showMentions) markMentionsSeen()
  }, [showMentions])

  const isDm = channel === 'dm' && dmUserId !== null
  const dmPartner = isDm ? users.find(u => u.id === dmUserId) : undefined

  const mentionMessages = messages.filter(m =>
    isMessageVisibleTo(m, currentUser, users) &&
    parseMentions(m.content, users).some(x => x.user.id === currentUser.id)
  )

  const isProposal = channel === 'proposal' && proposalId !== null
  const currentProposal = isProposal ? proposals.find(p => p.id === proposalId) : undefined
  const filtered = showMentions
    ? mentionMessages
    : isProposal
    ? messages.filter(m => m.channel === 'proposal' && m.proposalId === proposalId)
    : isDm
    ? messages.filter(m => m.channel === 'dm' &&
        ((m.userId === currentUser.id && m.toUserId === dmUserId) ||
         (m.userId === dmUserId && m.toUserId === currentUser.id)))
    : channel === 'team'
      ? messages.filter(m => m.channel === 'team' &&
          users.find(u => u.id === m.userId)?.teamId === currentUser.teamId)
      : messages.filter(m => m.channel === channel)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [filtered.length, channel, dmUserId, showMentions])

  useEffect(() => {
    if (showMentions) return
    if (isDm && dmUserId) markSeen(`dm:${dmUserId}`)
    else if (!isDm) markSeen(`channel:${channel}`)
  }, [filtered.length, channel, dmUserId, showMentions])

  const channelUnread = (chId: ChatChannel) => {
    const seen = lastSeenMap[`channel:${chId}`] || ''
    return messages.some(m => {
      if (m.channel !== chId || m.userId === currentUser.id) return false
      if (chId === 'team' && users.find(u => u.id === m.userId)?.teamId !== currentUser.teamId) return false
      return m.timestamp > seen
    })
  }

  const dmUnread = (partnerId: string) => {
    const seen = lastSeenMap[`dm:${partnerId}`] || ''
    return messages.some(m => m.channel === 'dm' && m.userId === partnerId && m.toUserId === currentUser.id && m.timestamp > seen)
  }

  const mentionCandidates = mentionQuery === null ? [] : users
    .filter(u => u.id !== currentUser.id)
    .filter(u => u.name.toLowerCase().includes(mentionQuery.toLowerCase()))
    .slice(0, 6)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    const cursor = e.target.selectionStart ?? value.length
    const beforeCursor = value.slice(0, cursor)
    const atIndex = beforeCursor.lastIndexOf('@')
    if (atIndex === -1) { setMentionQuery(null); return }
    const afterAt = beforeCursor.slice(atIndex + 1)
    if (/\s/.test(afterAt)) { setMentionQuery(null); return }
    setMentionQuery(afterAt)
  }

  const selectMention = (user: User) => {
    const cursor = inputRef.current?.selectionStart ?? input.length
    const beforeCursor = input.slice(0, cursor)
    const atIndex = beforeCursor.lastIndexOf('@')
    if (atIndex === -1) return
    const before = input.slice(0, atIndex)
    const after = input.slice(cursor)
    setInput(`${before}@${user.name} ${after}`)
    setMentionQuery(null)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const send = async () => {
    if (!input.trim()) return
    const content = input.trim()
    const { error } = await supabase.from('messages').insert({
      user_id: currentUser.id,
      to_user_id: isDm ? dmUserId : null,
      content,
      channel: isDm ? 'dm' : channel,
      proposal_id: isProposal ? proposalId : null,
    })
    if (error) { console.error(error); return }
    setInput('')
    setMentionQuery(null)

    const mentioned = parseMentions(content, users)
    const notifiedIds = new Set<string>()
    const currentChannel = isDm ? 'dm' : channel
    const channelLabel = currentChannel === 'dm' ? 'tin nhắn riêng'
      : currentChannel === 'team' ? 'kênh team'
      : currentChannel === 'announcements' ? 'kênh thông báo'
      : 'kênh chung'
    const preview = content.length > 60 ? content.slice(0, 60) + '…' : content
    for (const m of mentioned) {
      if (m.user.id === currentUser.id || notifiedIds.has(m.user.id)) continue
      notifiedIds.add(m.user.id)
      await supabase.from('notifications').insert({
        message: `💬 ${currentUser.name} đã nhắc đến bạn ở ${channelLabel}: "${preview}"`,
        target_user_id: m.user.id,
        link_channel: currentChannel,
        link_dm_user_id: currentChannel === 'dm' ? currentUser.id : null,
      })
    }
  }

  const canPost = isProposal || isDm || channel !== 'announcements' || currentUser.role === 'manager'

  const myTeam = TEAMS.find(t => t.id === currentUser.teamId)

  // Đang xem một tờ trình thì tự mở nhóm "Tờ trình" trong sidebar
  useEffect(() => { if (isProposal) setProposalsOpen(true) }, [isProposal])

  const myProposals = proposals
    .filter(p => p.participants.includes(currentUser.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const dayLabel = (iso: string) => {
    const d = new Date(iso)
    const dd = d.toLocaleDateString('vi-VN')
    if (d.toDateString() === new Date().toDateString()) return `Hôm nay · ${dd}`
    if (d.toDateString() === new Date(Date.now() - 86400000).toDateString()) return `Hôm qua · ${dd}`
    return dd
  }
  const dateGroups: [string, Proposal[]][] = []
  myProposals.forEach(p => {
    const label = dayLabel(p.createdAt)
    const last = dateGroups[dateGroups.length - 1]
    if (last && last[0] === label) last[1].push(p)
    else dateGroups.push([label, [p]])
  })
  const groupOf = (p: Proposal) => p.groupName ?? (p.kind === 'totrinh' ? 'Tờ trình' : 'Đề xuất')

  const CHANNELS: { id: ChatChannel; label: string; desc: string; icon: string }[] = [
    { id: 'general', label: '# chung', desc: 'Tất cả', icon: '💬' },
    { id: 'team', label: myTeam ? `# ${myTeam.name}` : '# team', desc: myTeam ? `${myTeam.emoji} Nội bộ team` : 'Chưa có team', icon: '👥' },
    { id: 'announcements', label: '📣 thông báo', desc: 'Manager', icon: '📣' },
  ]

  const openChannel = (id: ChatChannel) => {
    setChannel(id)
    setDmUserId(null)
    setShowMentions(false)
    markSeen(`channel:${id}`)
  }

  const openDm = (userId: string) => {
    setChannel('dm')
    setDmUserId(userId)
    setShowMentions(false)
    markSeen(`dm:${userId}`)
  }

  const headerLabel = showMentions ? '🔔 Nhắc đến tôi' : isProposal ? `📜 ${currentProposal?.title ?? ''}` : isDm ? `@ ${dmPartner?.name ?? ''}` : CHANNELS.find(c => c.id === channel)?.label
  const headerDesc = showMentions ? 'Tất cả tin nhắn có tag bạn' : isProposal ? `${currentProposal?.participants.length ?? 0} người tham gia` : isDm ? 'Nhắn tin riêng' : CHANNELS.find(c => c.id === channel)?.desc

  const pinnedAnnouncements = (channel === 'announcements' && !isDm && !showMentions)
    ? [...messages]
        .filter(m => m.channel === 'announcements' && users.find(u => u.id === m.userId)?.isDirector)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 3)
    : []

  const handleUnpin = async (messageId: string) => {
    if (!window.confirm('Gỡ thông báo này khỏi mục ghim? Thông báo sẽ bị xoá hoàn toàn khỏi kênh.')) return
    const { error } = await supabase.from('messages').delete().eq('id', messageId)
    if (error) {
      alert('Không xoá được: ' + error.message)
      console.error(error)
    }
  }

  const jumpToMessage = (messageId: string) => {
    const el = messageRefs.current[messageId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedId(messageId)
      setTimeout(() => setHighlightedId(prev => (prev === messageId ? null : prev)), 2500)
    }
  }

  return (
    <div className="flex" style={{ height: 'calc(100vh - 64px)' }}>
    {/* Sidebar */}
    <div className="w-16 md:w-48 flex-shrink-0 p-1.5 md:p-3 flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-panel)', borderRight: '1px solid var(--border)' }}>
        <p className="text-[10px] uppercase tracking-widest px-2 mb-2" style={{ color: 'var(--text-muted)' }}>Kênh</p>
        {CHANNELS.map(ch => (
          <button key={ch.id} onClick={() => openChannel(ch.id)} title={ch.label}
            className="relative w-full text-left px-2 py-2 rounded-lg mb-0.5 transition-all flex md:block items-center justify-center md:justify-start"
            style={{ background: !isDm && !showMentions && channel === ch.id ? 'var(--bg-card-alt)' : 'transparent', color: !isDm && !showMentions && channel === ch.id ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            <span className="text-lg md:hidden relative">
              {ch.icon}
              {channelUnread(ch.id) && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />}
            </span>
            <div className="text-sm hidden md:flex items-center gap-1.5 min-w-0">
              <span className="truncate">{ch.label}</span>
              {channelUnread(ch.id) && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
            </div>
            <div className="text-[10px] opacity-60 hidden md:block">{ch.desc}</div>
          </button>
        ))}

        {myProposals.length > 0 && (
          <>
            <button type="button" onClick={() => setProposalsOpen(o => !o)} title="Tờ trình"
              className="w-full flex items-center justify-between px-2 mt-4 mb-2 text-[10px] uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}>
              <span className="hidden md:inline">Tờ trình ({myProposals.length})</span>
              <span className="md:hidden text-lg">📜</span>
              <span className="text-xs">{proposalsOpen ? '▾' : '▸'}</span>
            </button>
            {proposalsOpen && (
              <div className="max-h-64 overflow-y-auto mb-1">
                {dateGroups.map(([label, list]) => (
                  <div key={label}>
                    <p className="hidden md:block text-[10px] font-semibold px-2 mt-2 mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    {list.map(p => (
                      <button key={p.id}
                        onClick={() => { setChannel('proposal'); setDmUserId(null); setProposalId(p.id); setShowMentions(false) }}
                        title={`${p.title} — ${groupOf(p)}`}
                        className="w-full text-left px-2 py-1.5 rounded-lg mb-0.5 transition-all"
                        style={{ background: isProposal && proposalId === p.id ? 'var(--bg-card-alt)' : 'transparent', color: isProposal && proposalId === p.id ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        <div className="text-lg md:hidden text-center">📜</div>
                        <div className="text-sm hidden md:block truncate">📜 {p.title}</div>
                        <div className="text-[10px] opacity-60 hidden md:block truncate pl-5">
                          {groupOf(p)} · {new Date(p.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <button onClick={() => setShowBrowseDept(true)}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg mt-4 mb-2 transition-all hover:brightness-95"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
          <span className="text-base">🔍</span>
          <span className="text-xs hidden md:inline" style={{ color: 'var(--text-muted)' }}>Tìm người theo phòng ban</span>
        </button>

        <p className="text-[10px] uppercase tracking-widest px-2 mt-2 mb-2" style={{ color: 'var(--text-muted)' }}>Online ({users.length})</p>
        <div className="space-y-1 overflow-y-auto flex-1">
          {users.filter(u => u.id !== currentUser.id).map(u => (
            <button key={u.id} onClick={() => openDm(u.id)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all"
              style={{ background: isDm && !showMentions && dmUserId === u.id ? 'var(--bg-card-alt)' : 'transparent' }}>
              <div className="relative flex-shrink-0">
                <CharAvatar user={u} size={20} />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400"
                  style={{ border: '1.5px solid var(--bg-panel)' }} />
              </div>
              <span className="text-[11px] truncate flex-1 text-left" style={{ color: 'var(--text-muted)' }}>{shortName(u.name)}</span>
              {u.role === 'manager' && <span className="text-[9px]" style={{ color: '#8b5cf6' }}>QL</span>}
              {dmUnread(u.id) && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-app)' }}>
        <div className="px-5 py-3 flex items-center gap-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          {isDm && dmPartner && <CharAvatar user={dmPartner} size={24} />}
          <span className="font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
            {headerLabel}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>— {headerDesc}</span>
          <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>{filtered.length} tin nhắn</span>
        </div>

        {pinnedAnnouncements.length > 0 && (
          <div className="px-4 pt-3 pb-1 flex-shrink-0 space-y-2" style={{ background: '#fbbf2422', borderBottom: '1px solid #fbbf2460' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: '#b45309' }}>
              📌 Thông báo mới nhất
            </p>
            {pinnedAnnouncements.map(msg => {
              const sender = users.find(u => u.id === msg.userId)
              if (!sender) return null
              return (
                <div key={msg.id} onClick={() => jumpToMessage(msg.id)}
                  className="flex items-start gap-2 p-2.5 rounded-lg mb-2 group transition-all hover:brightness-105"
                  style={{ background: '#fef3c7', border: '1px solid #f59e0b50', boxShadow: '0 1px 3px rgba(245,158,11,0.15)', cursor: 'pointer' }}>
                  <CharAvatar user={sender} size={26} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold" style={{ color: '#b45309' }}>👑 BOD · {sender.name}</span>
                      <span className="text-[10px]" style={{ color: '#92400e' }}>{fmtTime(msg.timestamp)}</span>
                    </div>
                    <p className="text-xs mt-0.5 leading-relaxed break-words" style={{ color: '#451a03' }}>
                      {renderMessageContent(msg.content, users, setProfileUser)}
                    </p>
                  </div>
                  {currentUser.isDirector && (
                    <button onClick={e => { e.stopPropagation(); handleUnpin(msg.id) }}
                      title="Gỡ khỏi ghim (đã hoàn thành / hết hạn)"
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 hover:text-red-500 text-xs px-2 py-1 rounded-lg transition-all"
                      style={{ background: 'rgba(0,0,0,0.06)', color: '#d97706' }}>
                      🗑 Gỡ
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filtered.map(msg => {
            const sender = users.find(u => u.id === msg.userId)
            if (!sender) return null
            const isMe = msg.userId === currentUser.id
            const mentionsMe = !isMe && parseMentions(msg.content, users).some(m => m.user.id === currentUser.id)
            const isManagerMsg = !isMe && !!sender.isDirector
            const isHighlighted = highlightedId === msg.id
            return (
              <div key={msg.id} ref={el => { messageRefs.current[msg.id] = el }}
                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                style={{ transition: 'background 0.4s ease', borderRadius: 12, background: isHighlighted ? '#7c3aed1a' : 'transparent' }}>
                <CharAvatar user={sender} size={36} />
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {!isMe && (
                      <span className="text-xs font-semibold flex items-center gap-1" style={{ color: isManagerMsg ? '#d97706' : sender.avatar.outfitColor }}>
                        {isManagerMsg && '👑'} {sender.name}
                      </span>
                    )}
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{fmtTime(msg.timestamp)}</span>
                    {mentionsMe && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#fbbf2422', color: '#d97706' }}>
                        Bạn được tag
                      </span>
                    )}
                    {showMentions && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-muted)' }}>
                        {msg.channel === 'dm'
                          ? `DM với ${(msg.userId === currentUser.id ? users.find(u => u.id === msg.toUserId) : users.find(u => u.id === msg.userId))?.name ?? '?'}`
                          : msg.channel === 'team' ? '# team' : msg.channel === 'announcements' ? '📣 thông báo' : '# chung'}
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                      background: isMe ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : mentionsMe ? '#fbbf2414' : isManagerMsg ? '#fbbf2410' : 'var(--bg-panel)',
                      color: isMe ? '#fff' : 'var(--text-primary)',
                      borderRadius: isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                      border: isMe ? 'none' : mentionsMe ? '1px solid #facc1560' : isManagerMsg ? '1px solid #fbbf2440' : '1px solid var(--border)',
                      boxShadow: mentionsMe ? '0 0 12px #facc1520' : 'none',
                    }}>
                    {renderMessageContent(msg.content, users, setProfileUser, isMe)}
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
              <div className="text-3xl mb-2">💬</div>
              <div className="text-sm">
                {isDm ? `Chưa có tin nhắn nào với ${dmPartner?.name}. Hãy bắt đầu!` : 'Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!'}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          {showMentions ? (
            <div className="text-center text-sm py-2" style={{ color: 'var(--text-muted)' }}>
              💬 Bấm vào kênh tương ứng bên trên tin nhắn để trả lời
            </div>
          ) : canPost ? (
            <div className="flex gap-3 items-center">
              <CharAvatar user={currentUser} size={36} />
              <div className="relative flex-1 min-w-0">
                {mentionQuery !== null && mentionCandidates.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl overflow-hidden z-20"
                    style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
                    {mentionCandidates.map(u => (
                      <button key={u.id} onClick={() => selectMention(u)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[color:var(--bg-panel)] transition-colors">
                        <CharAvatar user={u} size={22} />
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                <input ref={inputRef} value={input} onChange={handleInputChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      if (mentionQuery !== null && mentionCandidates.length > 0) {
                        e.preventDefault()
                        selectMention(mentionCandidates[0])
                      } else {
                        send()
                      }
                    }
                    if (e.key === 'Escape') setMentionQuery(null)
                  }}
                  placeholder={isDm ? `Nhắn riêng cho ${dmPartner?.name}... (gõ @ để tag, Enter để gửi)` : `Nhắn vào ${CHANNELS.find(c => c.id === channel)?.label}... (gõ @ để tag, Enter để gửi)`}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none placeholder-[color:var(--text-muted)]"
                  style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <button onClick={send} disabled={!input.trim()}
                className="flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm disabled:opacity-40 transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff' }}>
                Gửi
              </button>
            </div>
          ) : (
            <div className="text-center text-sm py-2" style={{ color: 'var(--text-muted)' }}>
              📣 Chỉ Manager mới có thể đăng vào kênh thông báo
            </div>
          )}
        </div>
      </div>
      {profileUser && (
        <UserProfileCard user={profileUser} onClose={() => setProfileUser(null)}
          onMessage={() => { openDm(profileUser.id); setProfileUser(null) }} />
      )}
      {showBrowseDept && (
        <BrowseByDepartmentModal users={users} currentUser={currentUser}
          onSelectUser={(userId) => { openDm(userId); setShowBrowseDept(false) }}
          onClose={() => setShowBrowseDept(false)} />
      )}
    </div>
  )
}

// ==================== PROFILE ====================

// function ProfileView({ currentUser, setCurrentUser, tasks }: {
//   currentUser: User; setCurrentUser: (u: User) => void; tasks: Task[]
// }) {
//   const [editing, setEditing] = useState(false)
//   const [draftAvatar, setDraftAvatar] = useState<AvatarConfig>(currentUser.avatar)
function mapDbProposalRevision(r: any): ProposalRevision {
  return { id: r.id, proposalId: r.proposal_id, editedBy: r.edited_by, addedNote: r.added_note ?? undefined, editedNote: r.edited_note ?? undefined, createdAt: r.created_at }
}

function SignDocumentModal({ currentUser, proposal, onClose }: { currentUser: User; proposal: Proposal; onClose: () => void }) {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [placement, setPlacement] = useState<{ page: number; x: number; y: number } | null>(null)
  const [sigSize, setSigSize] = useState({ w: 130, h: 60 })
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [signedBlobUrl, setSignedBlobUrl] = useState<string | null>(null)
  const [signedFileLink, setSignedFileLink] = useState('')
  const [savingLink, setSavingLink] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!currentUser.signatureUrl) return
    const img = new Image()
    img.onload = () => setSigSize({ w: 130, h: Math.round(130 * (img.naturalHeight / img.naturalWidth)) })
    img.src = currentUser.signatureUrl
  }, [currentUser.signatureUrl])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Vui lòng chọn file PDF.'); return }
    setError('')
    const bytes = new Uint8Array(await file.arrayBuffer())
    setPdfBytes(bytes)
    setPlacement(null)

    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
    const doc = await pdfjsLib.getDocument({ data: bytes.slice() }).promise
    setPdfDoc(doc)
    setPageCount(doc.numPages)
    setPageIndex(0)
  }

  useEffect(() => {
    if (!pdfDoc) return
    (async () => {
      const page = await pdfDoc.getPage(pageIndex + 1)
      const viewport = page.getViewport({ scale: 1 })
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      if (ctx) await page.render({ canvasContext: ctx, viewport }).promise
    })()
  }, [pdfDoc, pageIndex])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)
    setPlacement({ page: pageIndex, x, y })
  }

  const handleExport = async () => {
    if (!pdfBytes || !placement || !currentUser.signatureUrl) return
    if (placement.page !== pageIndex) {
      setError(`Chữ ký đang được đặt ở trang ${placement.page + 1}, không phải trang bạn đang xem. Vui lòng quay lại đúng trang đó để xác nhận, hoặc bấm lại vị trí mới trên trang hiện tại.`)
      return
    }
    setProcessing(true)
    setError('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const doc = await PDFDocument.load(pdfBytes)
      const page = doc.getPages()[placement.page]
      const { height: pageHeight } = page.getSize()

      const sigRes = await fetch(currentUser.signatureUrl)
      const sigBytes = new Uint8Array(await sigRes.arrayBuffer())
      const isPng = currentUser.signatureUrl.includes('image/png')
      const pngImage = isPng ? await doc.embedPng(sigBytes) : await doc.embedJpg(sigBytes)

      page.drawImage(pngImage, {
        x: placement.x,
        y: pageHeight - placement.y - sigSize.h,
        width: sigSize.w, height: sigSize.h,
      })

      const outBytes = await doc.save()
      const blob = new Blob([outBytes as BlobPart], { type: 'application/pdf' })
      setSignedBlobUrl(URL.createObjectURL(blob))
    } catch (err: any) {
      setError('Lỗi khi tạo file đã ký: ' + err.message)
    }
    setProcessing(false)
  }

  const handleSaveSignedLink = async () => {
    if (!signedFileLink.trim()) return
    setSavingLink(true)
    await supabase.from('proposals').update({ signed_file_url: signedFileLink.trim() }).eq('id', proposal.id)
    setSavingLink(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-3xl rounded-2xl p-6 max-h-[92vh] overflow-y-auto" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>🖊 Ký tờ trình</h3>
          <button onClick={onClose} className="text-2xl leading-none hover:opacity-70" style={{ color: 'var(--text-muted)' }}>×</button>
        </div>

        {!currentUser.signatureUrl && (
          <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: '#fbbf2422', color: '#d97706' }}>
            ⚠️ Bạn chưa lưu chữ ký. Vào Hồ sơ → mục "Chữ ký của tôi" để tải ảnh chữ ký lên trước.
          </div>
        )}

        {!pdfBytes ? (
          <div className="rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer py-14"
            style={{ border: '1.5px dashed var(--border)', background: 'var(--bg-card-alt)' }}
            onClick={() => fileInputRef.current?.click()}>
            <span className="text-4xl">📄</span>
            <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>Bấm để chọn file PDF cần ký</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button disabled={pageIndex === 0} onClick={() => setPageIndex(i => Math.max(0, i - 1))}
                  className="px-2 py-1 rounded text-xs disabled:opacity-30" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-primary)' }}>‹ Trước</button>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Trang {pageIndex + 1}/{pageCount}</span>
                <button disabled={pageIndex >= pageCount - 1} onClick={() => setPageIndex(i => Math.min(pageCount - 1, i + 1))}
                  className="px-2 py-1 rounded text-xs disabled:opacity-30" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-primary)' }}>Sau ›</button>
              </div>
              <button onClick={() => { setPdfBytes(null); setPdfDoc(null); setPlacement(null) }}
                className="text-xs underline" style={{ color: 'var(--text-muted)' }}>Chọn file khác</button>
            </div>

            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              {placement
                ? `🔒 Đã cố định chữ ký tại trang ${placement.page + 1}. Bấm lại vào tài liệu để đổi vị trí.`
                : '💡 Nhấn vào vị trí trên tài liệu muốn đặt chữ ký.'}
            </p>

            <div className="relative inline-block" style={{ maxWidth: '100%' }}>
              <canvas ref={canvasRef} onClick={handleCanvasClick}
                style={{ maxWidth: '100%', height: 'auto', cursor: 'crosshair', border: '1px solid var(--border)', display: 'block' }} />
              {placement && placement.page === pageIndex && currentUser.signatureUrl && canvasRef.current && (
                <img src={currentUser.signatureUrl} alt="chữ ký"
                  style={{
                    position: 'absolute',
                    left: `${(placement.x / canvasRef.current.width) * 100}%`,
                    top: `${(placement.y / canvasRef.current.height) * 100}%`,
                    width: `${(sigSize.w / canvasRef.current.width) * 100}%`,
                    pointerEvents: 'none',
                  }} />
              )}
            </div>
          </>
        )}

        {error && <p className="text-xs mt-3" style={{ color: '#dc2626' }}>{error}</p>}

        {!signedBlobUrl ? (
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-muted)' }}>Đóng</button>
            <button onClick={handleExport} disabled={!pdfBytes || !placement || !currentUser.signatureUrl || processing}
              className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
              {processing ? 'Đang xử lý...' : '✅ Xác nhận ký'}
            </button>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded-xl space-y-3" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>✅ Đã tạo file ký thành công</p>
            <a href={signedBlobUrl} download={`${proposal.title}-da-ky.pdf`}
              className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#3b82f622', color: '#2563eb' }}>
              ⬇ Tải file đã ký về máy
            </a>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Tải file trên về, tải lên đúng thư mục Drive của tờ trình này, sau đó dán link file đã ký vào ô dưới để lưu lại cho mọi người xem.
            </p>
            <input value={signedFileLink} onChange={e => setSignedFileLink(e.target.value)}
              placeholder="https://drive.google.com/file/d/... (file đã ký)"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none placeholder-[color:var(--text-muted)]"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-panel)', color: 'var(--text-muted)' }}>Đóng</button>
              <button onClick={handleSaveSignedLink} disabled={!signedFileLink.trim() || savingLink}
                className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
                {savingLink ? 'Đang lưu...' : '💾 Lưu link file đã ký'}
              </button>
            </div>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
      </div>
    </div>
  )
}
// Cầu nối: bấm số tờ trình ở bất kỳ đâu -> ProposalsView mở đúng tờ trình đó
const ProposalLinkContext = createContext<(code: string) => void>(() => {})
const PROPOSAL_CODE_SPLIT = /(\bR-?TASK\d{6}-\d{2,})/gi

function ProposalCodeLink({ code }: { code: string }) {
  const open = useContext(ProposalLinkContext)
  return (
    <button type="button" onClick={() => open(code)}
      className="underline font-mono font-semibold" style={{ color: '#2563eb' }}>{code}</button>
  )
}

// Tự biến mọi số RTASKddmmyy-NN trong đoạn text thành link
function LinkifyCodes({ text }: { text: string }) {
  const parts = text.split(PROPOSAL_CODE_SPLIT)
  return <>{parts.map((s, i) => (i % 2 === 1 ? <ProposalCodeLink key={i} code={s.toUpperCase()} /> : <span key={i}>{s}</span>))}</>
}
function ProposalSupplementSection({ p, currentUser, flow }: {
  p: Proposal; currentUser: User; flow: { id: string; approverId: string; status: string }[]
}) {
  const [files, setFiles] = useState<File[]>([])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [driveLink, setDriveLink] = useState('')

  if (currentUser.id !== p.submittedBy || p.status === 'approved') return null
  const isRejected = p.status === 'rejected'

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    const tooBig = picked.find(f => f.size > MAX_FILE_MB * 1024 * 1024)
    if (tooBig) { setMsg(`File "${tooBig.name}" lớn hơn ${MAX_FILE_MB}MB.`); e.target.value = ''; return }
    if (files.length + picked.length > MAX_FILES) { setMsg(`Mỗi lần bổ sung tối đa ${MAX_FILES} file.`); e.target.value = ''; return }
    setMsg('')
    setFiles(prev => [...prev, ...picked])
    e.target.value = ''
  }

  const submit = async () => {
    const link = driveLink.trim()
if (link && !/^https?:\/\//i.test(link)) { setMsg('Link Drive không hợp lệ (phải bắt đầu bằng http:// hoặc https://).'); return }
if (!note.trim() && files.length === 0 && !link) { setMsg('Hãy nhập nội dung bổ sung, chọn file hoặc dán link Drive.'); return }
    setSaving(true); setMsg('')
    let uploaded: { name: string; path: string; size: number; type: string }[] = []
    try { uploaded = await uploadProposalFiles(currentUser.id, files) }
    catch (err: any) { setSaving(false); setMsg('Tải file thất bại: ' + (err?.message ?? '')); return }

    const round = Math.max(0, ...(p.attachments ?? []).map(a => a.round ?? 0)) + 1
    const tagged = [
  ...uploaded.map(f => ({ ...f, round, note: note.trim() || undefined })),
  ...(link ? [{
    name: 'Link Drive bổ sung', path: link, size: 0, type: 'link',
    at: new Date().toISOString(), by: currentUser.id, round, note: note.trim() || undefined,
  }] : []),
]
    const update: Record<string, any> = { attachments: [...(p.attachments ?? []), ...tagged] }
    if (isRejected) { update.status = 'pending'; update.rejected_reason = null }
    const { error } = await supabase.from('proposals').update(update).eq('id', p.id)
    if (error) { setSaving(false); setMsg('Không lưu được: ' + error.message); return }

    await supabase.from('proposal_revisions').insert({
      proposal_id: p.id,
      edited_by: currentUser.id,
      added_note: [
        note.trim(),
        uploaded.length ? `File: ${uploaded.map(f => f.name).join(', ')}` : '',
        link ? `Link Drive: ${link}` : '',
      ].filter(Boolean).join(' — ') || null,
    })

    if (isRejected && flow.length > 0) {
      await supabase.from('proposal_steps')
        .update({ status: p.approvalMode === 'par' ? 'pending' : 'waiting', decided_at: null, note: null })
        .eq('proposal_id', p.id)
      if (p.approvalMode !== 'par') {
        await supabase.from('proposal_steps').update({ status: 'pending' }).eq('proposal_id', p.id).eq('step_order', 1)
      }
    }

    await supabase.from('notifications').insert({
      message: `📜 ${currentUser.name} đã bổ sung hồ sơ${isRejected ? ' và nộp lại' : ''} cho tờ trình "${p.title}"`,
      target_user_id: p.recipientId,
      link_proposal_id: p.id,
    })

    setFiles([]); setNote(''); setDriveLink(''); setSaving(false)
    setMsg(isRejected ? '✅ Đã nộp lại, đề xuất quay về trạng thái chờ duyệt.' : '✅ Đã bổ sung hồ sơ.')
  }

  const inputStyle = { background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

  return (
    <section className="rounded-xl p-4" style={{ background: 'var(--bg-panel)', border: `1px solid ${isRejected ? '#dc262655' : 'var(--border)'}` }}>
      <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {isRejected ? 'Bổ sung hồ sơ & nộp lại' : 'Bổ sung hồ sơ'}
      </h3>
      {isRejected && (
        <p className="text-xs mb-2" style={{ color: '#b45309' }}>{p.rejectedReason?.startsWith('[REVIEW]') ? `Người duyệt yêu cầu xem xét lại: ${p.rejectedReason.slice(8).trim()}` : `Lý do từ chối: ${p.rejectedReason || '—'}`}</p>
      )}
      <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
        placeholder="Đã bổ sung / chỉnh sửa gì? VD: đã bổ sung báo giá và bảng so sánh nhà cung cấp"
        className="w-full px-2 py-1.5 rounded-lg text-xs outline-none resize-none mb-2" style={inputStyle} />
      <input value={driveLink} onChange={e => setDriveLink(e.target.value)}
        placeholder="Link Drive chứa báo giá / tài liệu (https://drive.google.com/...)"
        className="w-full px-2 py-1.5 rounded-lg text-xs outline-none mb-2" style={inputStyle} />
      <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={pick}
        className="w-full text-xs" style={{ color: 'var(--text-muted)' }} />
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between text-xs rounded-lg px-2 py-1" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-primary)' }}>
              <span className="truncate">{f.name} ({(f.size / 1024 / 1024).toFixed(1)}MB)</span>
              <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} style={{ color: '#dc2626' }}>✕</button>
            </li>
          ))}
        </ul>
      )}
      {msg && <p className="text-xs mt-2" style={{ color: msg.startsWith('✅') ? '#059669' : '#dc2626' }}>{msg}</p>}
      <button type="button" onClick={submit} disabled={saving}
        className="mt-3 px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-40"
        style={{ background: isRejected ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : '#0891b2' }}>
        {saving ? 'Đang gửi...' : isRejected ? 'Bổ sung & nộp lại' : 'Bổ sung hồ sơ'}
      </button>
    </section>
  )
}
function ProposalAttachments({ p, users }: { p: Proposal; users: User[] }) {
  const list = p.attachments ?? []
  if (list.length === 0) return null
  const fmt = (d?: string) => (d ? new Date(d).toLocaleString('vi-VN') : '')
  const rounds = Array.from(new Set(list.map(a => a.round ?? 0))).sort((a, b) => a - b)
  return (
    <div className="pt-2 space-y-2">
      {rounds.map(r => {
        const files = list.filter(a => (a.round ?? 0) === r)
        const first = files[0]
        const when = first.at ?? (r === 0 ? p.createdAt : undefined)
        const who = users.find(u => u.id === first.by)?.name ?? (r === 0 ? users.find(u => u.id === p.submittedBy)?.name : undefined)
        return (
          <div key={r} className="rounded-lg p-2" style={{ background: 'var(--bg-card-alt)' }}>
            <p className="text-[11px] font-semibold mb-1" style={{ color: r === 0 ? 'var(--text-muted)' : '#b45309' }}>
              {r === 0 ? 'Hồ sơ ban đầu' : `Bổ sung lần ${r}`}{when ? ` · ${fmt(when)}` : ''}{who ? ` · ${who}` : ''}
            </p>
            {first.note && <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>"<LinkifyCodes text={first.note} />"</p>}
            <div className="flex flex-wrap gap-3">
              {files.map(a => (
                <button key={a.path} type="button" onClick={() => openProposalFile(a.path)}
                  className="text-xs underline" style={{ color: '#3b82f6' }}>📎 {a.name}</button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
type DocCostRow = { item: string; unit: string; qty: string; price: string; note: string }
// Số < 1.000 coi như đơn vị "triệu" (dữ liệu cũ) -> đổi ra VNĐ đầy đủ
const toVnd = (n: number) => {
  const v = Number(n) || 0
  return Math.abs(v) < 1000 ? Math.round(v * 1e6) : Math.round(v)
}

const costRowAmount = (r: { amount?: number; qty?: string; price?: string }) =>
  toVnd(r.amount !== undefined ? Number(r.amount) || 0 : (Number(r.qty) || 0) * (Number(r.price) || 0))

const CHU_SO = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
function docBaChuSo(n: number, full: boolean): string {
  const tram = Math.floor(n / 100), chuc = Math.floor((n % 100) / 10), dv = n % 10
  let s = ''
  if (tram > 0 || full) s += CHU_SO[tram] + ' trăm'
  if (chuc > 1) {
    s += ' ' + CHU_SO[chuc] + ' mươi'
    if (dv === 1) s += ' mốt'
    else if (dv === 5) s += ' lăm'
    else if (dv > 0) s += ' ' + CHU_SO[dv]
  } else if (chuc === 1) {
    s += ' mười'
    if (dv === 5) s += ' lăm'
    else if (dv > 0) s += ' ' + CHU_SO[dv]
  } else if (dv > 0) {
    if (tram > 0 || full) s += ' lẻ'
    s += ' ' + CHU_SO[dv]
  }
  return s.trim()
}
function docSoThanhChu(value: number): string {
  let n = Math.round(Number(value) || 0)
  if (n === 0) return 'Không đồng'
  const neg = n < 0
  if (neg) n = -n
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ']
  const groups: number[] = []
  while (n > 0) { groups.push(n % 1000); n = Math.floor(n / 1000) }
  const parts: string[] = []
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue
    const full = i < groups.length - 1
    parts.push([docBaChuSo(groups[i], full), units[i]].filter(Boolean).join(' '))
  }
  const text = (neg ? 'âm ' : '') + parts.join(' ') + ' đồng chẵn'
  return text.charAt(0).toUpperCase() + text.slice(1)
}


function ProposalDocForm({ currentUser, users, onClose }: { currentUser: User; users: User[]; onClose: () => void }) {
  const now = new Date()
  const dateText = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`
  const myManagers = users.filter(u => u.role === 'manager' && u.teamId === currentUser.teamId && u.id !== currentUser.id)

  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [place, setPlace] = useState('HCMC')
  const [kinhGui, setKinhGui] = useState<string[]>(['Ban Giám đốc Tập đoàn KNI'])
  const [canCu, setCanCu] = useState<string[]>([''])
  const [intro, setIntro] = useState('')
  const [noiDung, setNoiDung] = useState('')
  const [rows, setRows] = useState<DocCostRow[]>([{ item: '', unit: '', qty: '', price: '', note: '' }])
  const [bangChu, setBangChu] = useState('')
  const [thongTinKhac, setThongTinKhac] = useState('')
  const [deNghi, setDeNghi] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [driveUrl, setDriveUrl] = useState('')
  const [recipientId, setRecipientId] = useState(myManagers[0]?.id ?? '')
  const [extraApprovers, setExtraApprovers] = useState<string[]>([])
  const [approvalMode, setApprovalMode] = useState<'seq' | 'par'>('seq')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const nameOf = (id: string) => users.find(u => u.id === id)?.name ?? ''
  const rowAmount = (r: DocCostRow) => toVnd((Number(r.qty) || 0) * (Number(r.price) || 0))
  const total = rows.reduce((s, r) => s + rowAmount(r), 0)
  const money = (n: number) => n.toLocaleString('vi-VN')
  const approverIds = [recipientId, ...extraApprovers.filter(id => id !== recipientId)].filter(Boolean)

  const line = 'w-full bg-transparent outline-none border-b border-dashed border-gray-300 focus:border-blue-500 py-0.5'
  const ink = { color: '#111827' }

  const renderList = (list: string[], set: (v: string[]) => void, bullet: string, placeholder: string) => (
    <div className="space-y-1">
      {list.map((v, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="pt-0.5">{bullet}</span>
          <input value={v} onChange={e => set(list.map((x, j) => (j === i ? e.target.value : x)))}
            placeholder={placeholder} className={line} style={ink} />
          {list.length > 1 && (
            <button type="button" onClick={() => set(list.filter((_, j) => j !== i))} className="text-red-500 text-xs px-1">✕</button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => set([...list, ''])} className="text-xs text-blue-600">+ Thêm dòng</button>
    </div>
  )

  const updateRow = (i: number, patch: Partial<DocCostRow>) => setRows(prev => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  const pickFiles = (e: { target: HTMLInputElement }) => {
    const picked = Array.from(e.target.files ?? [])
    const tooBig = picked.find(f => f.size > MAX_FILE_MB * 1024 * 1024)
    if (tooBig) { setError(`File "${tooBig.name}" lớn hơn ${MAX_FILE_MB}MB. Hãy dùng link Drive cho file lớn.`); e.target.value = ''; return }
    if (files.length + picked.length > MAX_FILES) { setError(`Tối đa ${MAX_FILES} file.`); e.target.value = ''; return }
    setError('')
    setFiles(prev => [...prev, ...picked])
    e.target.value = ''
  }

  const submit = async () => {
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề tờ trình (V/V).'); return }
    if (!intro.trim() && !noiDung.trim()) { setError('Vui lòng nhập nội dung tờ trình.'); return }
    if (!recipientId) { setError('Vui lòng chọn người duyệt đầu tiên.'); return }
    setSaving(true); setError('')

    let uploaded: { name: string; path: string; size: number; type: string }[] = []
    try { uploaded = await uploadProposalFiles(currentUser.id, files) }
    catch (err: any) { setSaving(false); setError('Tải file thất bại: ' + (err?.message ?? '')); return }

    const cleanRows = rows
      .filter(r => r.item.trim())
      .map(r => ({ ...r, price: r.price ? String(toVnd(Number(r.price))) : '' }))
    const items = cleanRows.map(r => ({
      item: r.item.trim(),
      cost: `${[r.qty, r.unit].filter(Boolean).join(' ')}${r.price ? ` × ${money(Number(r.price))}` : ''}`.trim(),
      amount: rowAmount(r),
    }))
    const formData = {
      place, dateText, kinhGui: kinhGui.filter(s => s.trim()), canCu: canCu.filter(s => s.trim()),
      intro: intro.trim(), noiDung: noiDung.trim(), costRows: cleanRows, bangChu: docSoThanhChu(total),
      thongTinKhac: thongTinKhac.trim(), deNghi: deNghi.trim(),
    }

    let data: any = null
    let insertError: any = null
    for (let i = 0; i < 3; i++) {
      const res = await supabase.from('proposals').insert({
        title: title.trim(),
        description: (intro.trim() || noiDung.trim()).slice(0, 200),
        drive_url: driveUrl.trim(),
        submitted_by: currentUser.id, recipient_id: recipientId, status: 'pending',
        participants: [currentUser.id, ...approverIds],
        code: await generateProposalCode(currentUser.id),
        group_name: 'Tờ trình', department: currentUser.department, company: company || null,
        brief: title.trim(), approval_mode: approvalMode,
        attachments: uploaded, items, kind: 'totrinh', form_data: formData,
      }).select('id').single()
      data = res.data; insertError = res.error
      if (!insertError && data?.id) {
        await supabase.from('proposal_steps').insert(approverIds.map((id, k) => ({
          proposal_id: data.id, approver_id: id, step_order: k + 1,
          status: k === 0 || approvalMode === 'par' ? 'pending' : 'waiting',
        })))
      }
      if (!insertError || insertError.code !== '23505') break
    }
    setSaving(false)
    if (insertError) { setError(insertError.message); return }

    const notifyIds = approvalMode === 'par' ? approverIds : [recipientId]
    for (const id of notifyIds) {
      await supabase.from('notifications').insert({
        message: `📜 ${currentUser.name} vừa trình tờ trình "${title.trim()}" cho bạn`,
        target_user_id: id,
        link_proposal_id: data?.id,
      })
    }
    onClose()
  }

  const area = `${line} resize-none`
  const th = 'border border-gray-400 px-1.5 py-1 text-xs font-bold text-center bg-gray-50'
  const td = 'border border-gray-400 px-1 py-0.5 text-xs'
  const cell = 'w-full bg-transparent outline-none'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#d1d5db' }}>
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5" style={{ background: '#f9fafb', borderBottom: '1px solid #d1d5db' }}>
        <span className="text-sm font-bold text-gray-800">📜 Tạo tờ trình mới (RTASK)</span>
        <button type="button" onClick={onClose} className="text-gray-500 text-lg px-2">✕</button>
      </div>

      <div className="max-w-[860px] mx-auto my-4 bg-white shadow-xl p-6 sm:p-12 text-[13px] leading-relaxed" style={{ ...ink, fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <p className="font-bold text-gray-500">TẬP ĐOÀN KHÔI NGUYÊN INVESTMENT (KNI)</p>
        <div className="flex items-center gap-2 font-bold text-gray-500 flex-wrap">
          <span>CÔNG TY</span>
          <select value={company} onChange={e => setCompany(e.target.value)} className="border-b border-dashed border-gray-300 bg-transparent outline-none font-bold" style={ink}>
            <option value="">-- chọn --</option>
            {COMPANIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
          <span>– {(currentUser.department || '').toUpperCase()}</span>
        </div>

        <div className="grid grid-cols-3 border border-black my-5">
          <div className="p-3 text-xs border-r border-black flex items-center">Số/No: <span className="ml-1 font-mono text-gray-500">RTASK… (tự sinh khi gửi)</span></div>
          <div className="col-span-2 p-3 text-center text-3xl font-bold">TỜ TRÌNH<span className="text-blue-400">/ PROPOSAL</span></div>
        </div>

        <textarea value={title} onChange={e => setTitle(e.target.value)} rows={2}
          placeholder="(V/V: NỘI DUNG TỜ TRÌNH — VD: PHÊ DUYỆT KINH PHÍ MUA SẮM THIẾT BỊ IT ...)"
          className={`${area} text-center text-base font-bold uppercase`} style={ink} />

        <div className="text-right italic my-3 flex items-center justify-end gap-1">
          <input value={place} onChange={e => setPlace(e.target.value)} className="w-20 text-right bg-transparent outline-none border-b border-dashed border-gray-300 italic" style={ink} />
          <span>, {dateText}</span>
        </div>

        <div className="flex gap-3 mb-3">
          <b className="shrink-0 w-20">Kính gửi:</b>
          <div className="flex-1">{renderList(kinhGui, setKinhGui, '-', 'Ban Giám đốc / đơn vị nhận')}</div>
        </div>

        <div className="mb-3">
          <b>Căn cứ:</b>
          <div className="mt-1 italic">{renderList(canCu, setCanCu, '•', 'Căn cứ Tờ trình / kế hoạch / báo giá ...')}</div>
        </div>

        <textarea value={intro} onChange={e => setIntro(e.target.value)} rows={3}
          placeholder="Phòng ... kính trình Ban Giám đốc xem xét và phê duyệt ... với các nội dung chi tiết như sau:"
          className={`${area} mb-4`} style={ink} />

        <p className="font-bold mb-1">NỘI DUNG</p>
        <textarea value={noiDung} onChange={e => setNoiDung(e.target.value)} rows={10}
          placeholder={'I. NỘI DUNG ĐIỀU CHỈNH & TỐI ƯU CHI PHÍ\n1. Về Máy tính xách tay & Phần mềm bản quyền: ...\n2. Về Thiết bị In ấn / Copy / Scan: ...'}
          className={`${area} mb-4`} style={ink} />

        <p className="font-bold mb-1">CHI PHÍ</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th className={th} style={{ width: 36 }}>STT</th>
                <th className={th}>Danh mục</th>
                <th className={th} style={{ width: 70 }}>Đơn vị</th>
                <th className={th} style={{ width: 60 }}>Số lượng</th>
                <th className={th} style={{ width: 110 }}>Đơn giá (VNĐ)</th>
                <th className={th} style={{ width: 110 }}>Thành tiền (VNĐ)</th>
                <th className={th}>Ghi chú</th>
                <th style={{ width: 24 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className={`${td} text-center`}>{i + 1}</td>
                  <td className={td}><input value={r.item} onChange={e => updateRow(i, { item: e.target.value })} className={cell} style={ink} /></td>
                  <td className={td}><input value={r.unit} onChange={e => updateRow(i, { unit: e.target.value })} className={cell} style={ink} /></td>
                  <td className={td}><input type="number" min="0" value={r.qty} onChange={e => updateRow(i, { qty: e.target.value })} className={cell} style={ink} /></td>
                  <td className={td}><input type="number" min="0" value={r.price} onChange={e => updateRow(i, { price: e.target.value })} className={cell} style={ink} /></td>
                  <td className={`${td} text-right`}>{money(rowAmount(r))}</td>
                  <td className={td}><input value={r.note} onChange={e => updateRow(i, { note: e.target.value })} className={cell} style={ink} /></td>
                  <td className="text-center">
                    {rows.length > 1 && <button type="button" onClick={() => setRows(prev => prev.filter((_, j) => j !== i))} className="text-red-500 text-xs">✕</button>}
                  </td>
                </tr>
              ))}
              <tr>
                <td className={`${td} font-bold`} colSpan={5}>TỔNG CHI PHÍ</td>
                <td className={`${td} font-bold text-right`}>{money(total)}</td>
                <td className={td}></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <button type="button" onClick={() => setRows(prev => [...prev, { item: '', unit: '', qty: '', price: '', note: '' }])} className="text-xs text-blue-600 mt-1">+ Thêm dòng chi phí</button>
        <div className="italic mt-2 mb-4">(Bằng chữ: {docSoThanhChu(total)})</div>

        <p className="font-bold mb-1">THÔNG TIN KHÁC</p>
        <textarea value={thongTinKhac} onChange={e => setThongTinKhac(e.target.value)} rows={3}
          placeholder="Điều khoản thanh toán, thời gian giao hàng, ghi chú bổ sung ..." className={`${area} mb-4`} style={ink} />

        <p className="font-bold mb-1">ĐỀ NGHỊ PHÊ DUYỆT</p>
        <textarea value={deNghi} onChange={e => setDeNghi(e.target.value)} rows={4}
          placeholder={'Phòng ... kính trình Ban Giám đốc phê duyệt:\n1. Phê duyệt kinh phí ... \n2. ...\nKính trình Ban Giám đốc xem xét và quyết định./.'}
          className={`${area} mb-4`} style={ink} />

        <p className="font-bold mb-1">Tài liệu đính kèm theo Tờ trình:</p>
        <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={pickFiles} className="text-xs" />
        {files.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between text-xs">
                <span className="truncate">☐ {f.name} ({(f.size / 1024 / 1024).toFixed(1)}MB)</span>
                <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-red-500 px-1">✕</button>
              </li>
            ))}
          </ul>
        )}
        <input value={driveUrl} onChange={e => setDriveUrl(e.target.value)} placeholder="Hoặc dán link Google Drive (file lớn)" className={`${line} mt-2 text-xs`} style={ink} />

        <div className="grid gap-4 mt-8 text-center" style={{ gridTemplateColumns: `repeat(${Math.min(4, 1 + Math.max(approverIds.length, 1))}, minmax(0, 1fr))` }}>
          <div>
            <p className="font-bold">Người lập tờ trình</p>
            <p className="font-bold text-xs">(Ký, ghi rõ họ tên)</p>
            <p className="mt-10 text-xs text-gray-500">{currentUser.name}</p>
          </div>
          {(approverIds.length > 0 ? approverIds : ['']).map((id, i) => (
            <div key={i}>
              <p className="font-bold">{i === approverIds.length - 1 && approverIds.length > 1 ? 'Phê duyệt cuối cùng' : `Người duyệt ${i + 1}`}</p>
              <p className="font-bold text-xs">(Ký, ghi rõ họ tên)</p>
              <p className="mt-10 text-xs text-gray-500">{id ? nameOf(id) : '—'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[860px] mx-auto mb-4 bg-white shadow-xl p-6 text-[13px] space-y-4" style={ink}>
        <p className="font-bold">Luồng phê duyệt</p>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Người duyệt đầu tiên {myManagers.length > 0 ? '(quản lý phòng ban của bạn)' : ''} *</label>
          <select value={recipientId} disabled={myManagers.length === 1} onChange={e => setRecipientId(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white disabled:bg-gray-100" style={ink}>
            {myManagers.length === 0 && <option value="">-- Chọn người duyệt --</option>}
            {(myManagers.length > 0 ? myManagers : users.filter(u => u.id !== currentUser.id)).map(u => (
              <option key={u.id} value={u.id}>{u.name} — {u.department}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Người duyệt tiếp theo (không bắt buộc, duyệt theo thứ tự bạn tick)</label>
          <ApproverPicker users={users} excludeIds={[currentUser.id, recipientId]} value={extraApprovers} onChange={setExtraApprovers} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Luồng phê duyệt</label>
          <select value={approvalMode} onChange={e => setApprovalMode(e.target.value as 'seq' | 'par')} className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white" style={ink}>
            <option value="seq">Nối tiếp (lần lượt)</option>
            <option value="par">Song song (cùng lúc)</option>
          </select>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 px-4 py-3 flex items-center justify-end gap-3" style={{ background: '#f9fafb', borderTop: '1px solid #d1d5db' }}>
        {error && <span className="text-xs text-red-600 mr-auto">{error}</span>}
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600">Hủy</button>
        <button type="button" onClick={submit} disabled={saving}
          className="px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
          {saving ? 'Đang gửi...' : 'Gửi tờ trình'}
        </button>
      </div>
    </div>
  )
}
function ProposalDocView({ p, users, currentUserId, onClose, canAct, onApprove, onReject, onRequestReview }: {
  p: Proposal; users: User[]; currentUserId: string; onClose: () => void; canAct: boolean
  onApprove: (note: string) => Promise<void>; onReject: (note: string) => Promise<void>; onRequestReview: (note: string) => Promise<void>
}) {
  const f: any = p.formData ?? {}
  const [steps, setSteps] = useState<{ id: string; approverId: string; order: number; status: string; decidedAt?: string; note?: string }[]>([])
  const [busy, setBusy] = useState(false)
  const [myNote, setMyNote] = useState('')
  const [warn, setWarn] = useState('')
  const nameOf = (id?: string) => users.find(u => u.id === id)?.name ?? ''
  const fmt = (d?: string) => (d ? new Date(d).toLocaleString('vi-VN') : '')
  const money = (n: number) => Number(n || 0).toLocaleString('vi-VN')

  useEffect(() => {
    let alive = true
    supabase.from('proposal_steps').select('*').eq('proposal_id', p.id).order('step_order').then(({ data }: any) => {
      if (!alive) return
      setSteps((data ?? []).map((s: any) => ({ id: s.id, approverId: s.approver_id, order: s.step_order, status: s.status, decidedAt: s.decided_at ?? undefined, note: s.note ?? undefined })))
    })
    return () => { alive = false }
  }, [p.id, p.status, p.recipientId])

  const flow = steps.length > 0 ? steps : [{
    id: 'legacy', approverId: p.recipientId, order: 1,
    status: p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending',
    decidedAt: undefined as string | undefined,
    note: undefined as string | undefined,
  }]
  const STATUS: Record<string, string> = {
    approved: '✓ Đã duyệt', pending: 'Chờ duyệt', waiting: 'Chưa đến lượt', rejected: '✕ Từ chối', revision: '🔁 Yêu cầu xem xét lại', skipped: 'Bỏ qua',
  }
  const STATUS_COLOR: Record<string, string> = {
    approved: '#059669', pending: '#b45309', waiting: '#6b7280', rejected: '#dc2626', revision: '#b45309', skipped: '#6b7280',
  }

  const rows: any[] = Array.isArray(f.costRows) && f.costRows.length > 0
    ? f.costRows
    : (p.items ?? []).map((x: any) => ({ item: x.item, unit: '', qty: '', price: '', note: x.cost, amount: x.amount }))
  const amt = (r: any) => costRowAmount(r)
  const total = rows.reduce((s, r) => s + amt(r), 0)

  const ink = { color: '#111827' }
  const th = 'border border-gray-400 px-1.5 py-1 text-xs font-bold text-center bg-gray-50'
  const td = 'border border-gray-400 px-1.5 py-1 text-xs'
  const para = (text?: string) => (text ? <p className="whitespace-pre-wrap mb-4">{text}</p> : null)
  const heading = (t: string) => <p className="font-bold mb-1">{t}</p>

  const isReview = p.status === 'rejected' && !!p.rejectedReason?.startsWith('[REVIEW]')
  const act = async (fn: (note: string) => Promise<void>, needNote = false) => {
    if (needNote && !myNote.trim()) { setWarn('Hãy ghi ý kiến của bạn vào ô dưới tên bạn ở cuối tờ trình.'); return }
    setWarn(''); setBusy(true)
    try { await fn(myNote.trim()) } finally { setBusy(false) }
    onClose()
  }

  return (
    <div className="fixed inset-x-0 top-16 bottom-14 md:bottom-0 z-50 flex flex-col" style={{ background: '#d1d5db' }}>
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5" style={{ background: '#f9fafb', borderBottom: '1px solid #d1d5db' }}>
        <span className="text-sm font-bold text-gray-800">📄 Tờ trình {p.code ?? ''}</span>
        <button type="button" onClick={onClose} className="text-gray-500 text-lg px-2">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto">

      {isReview && (
        <div className="max-w-[860px] mx-auto mt-4 rounded-lg px-4 py-3 text-sm" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
          🔁 <b>Người duyệt yêu cầu xem xét lại:</b> {(p.rejectedReason ?? '').replace('[REVIEW]', '').trim()}
        </div>
      )}
      <div className="max-w-[860px] mx-auto my-4 bg-white shadow-xl p-6 sm:p-12 text-[13px] leading-relaxed" style={{ ...ink, fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <p className="font-bold text-gray-500">TẬP ĐOÀN KHÔI NGUYÊN INVESTMENT (KNI)</p>
        <p className="font-bold text-gray-500">
          {p.company ? `CÔNG TY ${p.company.toUpperCase()}` : ''}{p.company && p.department ? ' – ' : ''}{(p.department ?? '').toUpperCase()}
        </p>

        <div className="grid grid-cols-3 border border-black my-5">
          <div className="p-3 text-xs border-r border-black flex items-center">Số/No: <span className="ml-1 font-mono">{p.code ?? '—'}</span></div>
          <div className="col-span-2 p-3 text-center text-3xl font-bold">TỜ TRÌNH<span className="text-blue-400">/ PROPOSAL</span></div>
        </div>

        <p className="text-center text-base font-bold uppercase whitespace-pre-wrap">{p.title}</p>
        <p className="text-right italic my-3">{f.place ?? 'HCMC'}, {f.dateText ?? new Date(p.createdAt).toLocaleDateString('vi-VN')}</p>

        {Array.isArray(f.kinhGui) && f.kinhGui.length > 0 && (
          <div className="flex gap-3 mb-3">
            <b className="shrink-0 w-20">Kính gửi:</b>
            <div>{f.kinhGui.map((k: string, i: number) => <p key={i}>- {k}</p>)}</div>
          </div>
        )}

        {Array.isArray(f.canCu) && f.canCu.length > 0 && (
          <div className="mb-3">
            <b>Căn cứ:</b>
            <ul className="italic mt-1 space-y-1">{f.canCu.map((c: string, i: number) => <li key={i}>• {c}</li>)}</ul>
          </div>
        )}

        {para(f.intro)}
        {f.noiDung && <>{heading('NỘI DUNG')}{para(f.noiDung)}</>}

        {rows.length > 0 && (
          <>
            {heading('CHI PHÍ')}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 560 }}>
                <thead>
                  <tr>
                    <th className={th} style={{ width: 36 }}>STT</th><th className={th}>Danh mục</th><th className={th}>Đơn vị</th>
                    <th className={th}>Số lượng</th><th className={th}>Đơn giá (VNĐ)</th><th className={th}>Thành tiền (VNĐ)</th><th className={th}>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td className={`${td} text-center`}>{i + 1}</td>
                      <td className={td}>{r.item}{r.extra && <i> (phát sinh)</i>}</td>
                      <td className={`${td} text-center`}>{r.unit}</td>
                      <td className={`${td} text-center`}>{r.qty}</td>
                      <td className={`${td} text-right`}>{r.price ? money(toVnd(Number(r.price))) : ''}</td>
                      <td className={`${td} text-right`}>{money(amt(r))}</td>
                      <td className={td}>{r.note}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className={`${td} font-bold`} colSpan={5}>TỔNG CHI PHÍ</td>
                    <td className={`${td} font-bold text-right`}>{money(total)}</td>
                    <td className={td}></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="italic mt-2">(Bằng chữ: {docSoThanhChu(total)})</p>
            <div className="mb-4" />
          </>
        )}

        {f.thongTinKhac && <>{heading('THÔNG TIN KHÁC')}{para(f.thongTinKhac)}</>}
        {f.deNghi && <>{heading('ĐỀ NGHỊ PHÊ DUYỆT')}{para(f.deNghi)}</>}

        {((p.attachments ?? []).length > 0 || p.driveUrl) && (
          <div className="mb-4">
            {heading('Tài liệu đính kèm theo Tờ trình:')}
            <div className="flex flex-col gap-1 items-start">
              {(p.attachments ?? []).map(a => (
                <button key={a.path} type="button" onClick={() => openProposalFile(a.path)} className="text-xs underline text-blue-600">📎 {a.name}</button>
              ))}
              {p.driveUrl && <a href={p.driveUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline text-blue-600">📁 Xem tài liệu đính kèm trên Drive</a>}
            </div>
          </div>
        )}

        <div className="grid gap-4 mt-8 text-center" style={{ gridTemplateColumns: `repeat(${Math.min(4, 1 + flow.length)}, minmax(0, 1fr))` }}>
          <div>
            <p className="font-bold">Người lập tờ trình</p>
            <p className="font-bold text-xs">(Ký, ghi rõ họ tên)</p>
            <p className="mt-8 font-semibold">{nameOf(p.submittedBy)}</p>
            <p className="text-[11px] text-gray-500">{fmt(p.createdAt)}</p>
          </div>
          {flow.map((s, i) => {
            const mine = canAct && s.approverId === currentUserId && s.status === 'pending'
            return (
              <div key={s.id}>
                <p className="font-bold">{i === flow.length - 1 && flow.length > 1 ? 'Phê duyệt cuối cùng' : `Người duyệt ${i + 1}`}</p>
                <p className="font-bold text-xs">(Ký, ghi rõ họ tên)</p>
                <p className="mt-8 font-semibold">{nameOf(s.approverId)}</p>
                <p className="text-[11px] font-semibold" style={{ color: STATUS_COLOR[s.status] ?? '#6b7280' }}>{STATUS[s.status] ?? s.status}</p>
                {s.decidedAt && <p className="text-[11px] text-gray-500">{fmt(s.decidedAt)}</p>}
                {mine ? (
                  <textarea value={myNote} onChange={e => setMyNote(e.target.value)} rows={3}
                    placeholder="Ý kiến của bạn (VD: chi phí quá cao, đề nghị xem xét lại...)"
                    className="mt-2 w-full text-xs border border-amber-300 rounded p-1.5 outline-none focus:border-amber-500 bg-amber-50" style={ink} />
                ) : (
                  s.note && <p className="mt-1 text-[11px] italic" style={{ color: s.status === 'revision' ? '#b45309' : '#374151' }}>“{s.note}”</p>
                )}
              </div>
            )
          })}
        </div>
        {p.status === 'rejected' && p.rejectedReason && !isReview && (
          <p className="mt-6 text-xs text-red-600">Lý do từ chối: {p.rejectedReason}</p>
        )}
      </div>

      </div>
      <div className="shrink-0 px-4 py-3 flex items-center justify-end gap-3" style={{ background: '#f9fafb', borderTop: '1px solid #d1d5db' }}>
        {warn && <span className="text-xs text-red-600 mr-auto">{warn}</span>}
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600">Đóng</button>
        {canAct && (
          <>
            <button type="button" disabled={busy} onClick={() => act(async n => { await onReject(n) })}
              className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-40" style={{ background: '#fee2e2', color: '#dc2626' }}>Từ chối</button>
            <button type="button" disabled={busy} onClick={() => act(onRequestReview, true)}
              className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-40" style={{ background: '#fef3c7', color: '#b45309' }}>🔁 Yêu cầu xem xét lại</button>
            <button type="button" disabled={busy} onClick={() => act(onApprove)}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-40" style={{ background: '#059669' }}>✓ Duyệt</button>
          </>
        )}
      </div>
    </div>
  )
}
function vnMoneyWords(input: number): string {
  const n = Math.round(Number(input) || 0)
  if (n <= 0) return 'Không Đồng'
  const digit = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
  const readGroup = (num: number, full: boolean): string => {
    const tram = Math.floor(num / 100)
    const chuc = Math.floor((num % 100) / 10)
    const donvi = num % 10
    const parts: string[] = []
    if (tram > 0 || full) parts.push(`${digit[tram]} trăm`)
    if (chuc > 1) parts.push(`${digit[chuc]} mươi`)
    else if (chuc === 1) parts.push('mười')
    else if (donvi > 0 && (tram > 0 || full)) parts.push('lẻ')
    if (donvi > 0) {
      if (chuc > 1 && donvi === 1) parts.push('mốt')
      else if (chuc > 0 && donvi === 5) parts.push('lăm')
      else parts.push(digit[donvi])
    }
    return parts.join(' ')
  }
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ']
  const groups: number[] = []
  let rest = n
  while (rest > 0) { groups.push(rest % 1000); rest = Math.floor(rest / 1000) }
  const words: string[] = []
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue
    const text = readGroup(groups[i], i < groups.length - 1)
    words.push(units[i] ? `${text} ${units[i]}` : text)
  }
  const sentence = `${words.join(' ')} đồng`
  return sentence.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

type DnttRow = { desc: string; unit: string; qty: string; price: string; invoice: string }
const DNTT_ROLES = ['Trưởng bộ phận/ OM/ Quản lý đơn vị', 'Kế toán trưởng', 'Ban Giám đốc/ Ban Giám Hiệu']

function ProposalDnttForm({ currentUser, users, onClose }: { currentUser: User; users: User[]; onClose: () => void }) {
  const now = new Date()
  const dateText = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
  const myManagers = users.filter(u => u.role === 'manager' && u.teamId === currentUser.teamId && u.id !== currentUser.id)

  const [dept, setDept] = useState(currentUser.department ?? '')
  const [content, setContent] = useState('')
  const [relatedInput, setRelatedInput] = useState('')
  const [payMethod, setPayMethod] = useState<'cash' | 'bank' | ''>('')
  const [rows, setRows] = useState<DnttRow[]>([{ desc: '', unit: '', qty: '1', price: '', invoice: '' }])
  const [owner, setOwner] = useState('')
  const [account, setAccount] = useState('')
  const [bankName, setBankName] = useState('')
  const [branch, setBranch] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [driveUrl, setDriveUrl] = useState('')
  const [recipientId, setRecipientId] = useState(myManagers[0]?.id ?? '')
  const [extraApprovers, setExtraApprovers] = useState<string[]>([])
  const [approvalMode, setApprovalMode] = useState<'seq' | 'par'>('seq')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const nameOf = (id: string) => users.find(u => u.id === id)?.name ?? ''
  const money = (n: number) => Number(n || 0).toLocaleString('vi-VN')
  const rowAmount = (r: DnttRow) => (Number(r.qty) || 0) * (Number(r.price) || 0)
  const total = rows.reduce((s, r) => s + rowAmount(r), 0)
  const approverIds = [recipientId, ...extraApprovers.filter(id => id !== recipientId)].filter(Boolean)
  const roleOf = (i: number) => DNTT_ROLES[i] ?? `Người duyệt ${i + 1}`

  const line = 'w-full bg-transparent outline-none border-b border-dashed border-gray-300 focus:border-blue-500 py-0.5'
  const ink = { color: '#111827' }
  const th = 'border border-gray-500 px-1.5 py-1 text-xs font-bold text-center bg-gray-50'
  const td = 'border border-gray-500 px-1 py-0.5 text-xs align-top'
  const cell = 'w-full bg-transparent outline-none'

  const updateRow = (i: number, patch: Partial<DnttRow>) => setRows(prev => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  const pickFiles = (e: { target: HTMLInputElement }) => {
    const picked = Array.from(e.target.files ?? [])
    const tooBig = picked.find(f => f.size > MAX_FILE_MB * 1024 * 1024)
    if (tooBig) { setError(`File "${tooBig.name}" lớn hơn ${MAX_FILE_MB}MB. Hãy dùng link Drive cho file lớn.`); e.target.value = ''; return }
    if (files.length + picked.length > MAX_FILES) { setError(`Tối đa ${MAX_FILES} file.`); e.target.value = ''; return }
    setError('')
    setFiles(prev => [...prev, ...picked])
    e.target.value = ''
  }

  const submit = async () => {
    const cleanRows = rows.filter(r => r.desc.trim())
    if (!content.trim()) { setError('Vui lòng nhập nội dung đề nghị thanh toán.'); return }
    if (cleanRows.length === 0 || total <= 0) { setError('Vui lòng nhập ít nhất một dòng chi tiết có số tiền.'); return }
    if (!payMethod) { setError('Vui lòng chọn hình thức thanh toán.'); return }
    if (payMethod === 'bank' && (!owner.trim() || !account.trim())) { setError('Vui lòng nhập tên chủ tài khoản và số tài khoản.'); return }
    if (!recipientId) { setError('Vui lòng chọn người duyệt đầu tiên.'); return }

    const relatedCodes = Array.from(new Set((relatedInput.match(/\bR-?TASK\d{6}-\d{2,}/gi) ?? []).map(c => c.toUpperCase())))
    if (relatedInput.trim() && relatedCodes.length === 0) { setError('Số tờ trình liên quan phải có dạng RTASKddmmyy-NN.'); return }
    if (relatedCodes.length > 0) {
      const { data: found } = await supabase.from('proposals').select('code').in('code', relatedCodes)
      const missing = relatedCodes.filter(c => !(found ?? []).some((x: any) => x.code === c))
      if (missing.length > 0) { setError(`Không tìm thấy tờ trình: ${missing.join(', ')}`); return }
    }

    setSaving(true); setError('')

    let uploaded: { name: string; path: string; size: number; type: string }[] = []
    try { uploaded = await uploadProposalFiles(currentUser.id, files) }
    catch (err: any) { setSaving(false); setError('Tải file thất bại: ' + (err?.message ?? '')); return }

    const items = cleanRows.map(r => ({
      item: r.desc.trim().split('\n')[0],
      cost: `${r.qty || ''} ${r.unit}`.trim() + (r.price ? ` × ${money(Number(r.price))}` : ''),
      amount: rowAmount(r),
    }))
    const formData = {
      dept, payMethod, dateText, rows: cleanRows,
      bank: payMethod === 'bank' ? { owner: owner.trim(), account: account.trim(), bankName: bankName.trim(), branch: branch.trim() } : null,
      bangChu: vnMoneyWords(total), total, relatedCodes,
    }

    let data: any = null
    let insertError: any = null
    for (let i = 0; i < 3; i++) {
      const res = await supabase.from('proposals').insert({
        title: content.trim().slice(0, 200),
        description: content.trim().slice(0, 200),
        drive_url: driveUrl.trim(),
        submitted_by: currentUser.id, recipient_id: recipientId, status: 'pending',
        participants: [currentUser.id, ...approverIds],
        code: await generateProposalCode(currentUser.id),
        group_name: 'Đề nghị thanh toán', department: dept || currentUser.department, company: null,
        brief: content.trim().slice(0, 200), approval_mode: approvalMode,
        attachments: uploaded, items, kind: 'dntt', form_data: formData,
      }).select('id').single()
      data = res.data; insertError = res.error
      if (!insertError && data?.id) {
        await supabase.from('proposal_steps').insert(approverIds.map((id, k) => ({
          proposal_id: data.id, approver_id: id, step_order: k + 1,
          status: k === 0 || approvalMode === 'par' ? 'pending' : 'waiting',
        })))
      }
      if (!insertError || insertError.code !== '23505') break
    }
    setSaving(false)
    if (insertError) { setError(insertError.message); return }

    const notifyIds = approvalMode === 'par' ? approverIds : [recipientId]
    for (const id of notifyIds) {
      await supabase.from('notifications').insert({
        message: `💳 ${currentUser.name} vừa gửi đề nghị thanh toán "${content.trim().slice(0, 80)}" cho bạn`,
        target_user_id: id,
        link_proposal_id: data?.id,
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#d1d5db' }}>
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5" style={{ background: '#f9fafb', borderBottom: '1px solid #d1d5db' }}>
        <span className="text-sm font-bold text-gray-800">💳 Tạo đề nghị thanh toán (RTASK)</span>
        <button type="button" onClick={onClose} className="text-gray-500 text-lg px-2">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[860px] mx-auto my-4 bg-white shadow-xl p-6 sm:p-10 text-[13px] leading-relaxed" style={{ ...ink, fontFamily: '"Times New Roman", Times, serif' }}>
          <p className="font-bold text-[12px]">Công Ty Cổ Phần Tập Đoàn Đầu Tư Khôi Nguyên</p>
          <p className="font-bold text-[11px]">414-416 Tân Phú, Khu Nam Thông 3-S14, KP6, P. Tân Phú, Q.7, Tp.HCM, Việt Nam</p>

          <div className="text-center my-5">
            <p className="text-lg font-bold">ĐỀ NGHỊ THANH TOÁN</p>
            <p className="text-lg font-bold text-blue-600">(PAYMENT REQUEST)</p>
            <p className="text-[11px] text-gray-500 mt-1">Số/No: <span className="font-mono">RTASK… (tự sinh khi gửi)</span></p>
          </div>

          <div className="space-y-1.5 mb-3">
            <p>Người đề nghị <i className="text-blue-600">(Requested by)</i>: <b>{currentUser.name}</b></p>
            <div className="flex items-center gap-2">
              <span className="shrink-0">Địa chỉ/Bộ phận <i className="text-blue-600">(Add/Dept)</i>:</span>
              <input value={dept} onChange={e => setDept(e.target.value)} className={line} style={ink} />
            </div>
            <div className="flex items-start gap-2">
              <span className="shrink-0">Nội dung đề nghị thanh toán <i className="text-blue-600">(Requested About)</i>:</span>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={2}
                placeholder="VD: Thanh toán cước truy cập internet băng rộng tháng 08/2026"
                className={`${line} resize-none`} style={ink} />
            </div>
            <div className="flex items-center gap-2">
              <span className="shrink-0">Tờ trình liên quan <i className="text-blue-600">(Related proposal)</i>:</span>
              <input value={relatedInput} onChange={e => setRelatedInput(e.target.value)}
                placeholder="VD: RTASK181026-01 (nhiều số thì cách nhau bằng dấu phẩy)"
                className={line} style={ink} />
            </div>
            <div>
              <p>Hình thức thanh toán <i className="text-blue-600">(Payment method)</i>:</p>
              <div className="flex gap-8 pl-24 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payMethod" checked={payMethod === 'cash'} onChange={() => setPayMethod('cash')} /> Tiền mặt/Cash
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payMethod" checked={payMethod === 'bank'} onChange={() => setPayMethod('bank')} /> Chuyển khoản/Bank transfer
                </label>
              </div>
            </div>
          </div>

          <p className="font-bold mb-1">Chi tiết mua hàng hóa, dịch vụ <i className="text-blue-600">(Detail of items)</i>:</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th className={th} style={{ width: 34 }}>STT<br /><i className="font-normal">No</i></th>
                  <th className={th}>DIỄN GIẢI<br /><i className="font-normal">Description</i></th>
                  <th className={th} style={{ width: 60 }}>ĐVT<br /><i className="font-normal">Unit</i></th>
                  <th className={th} style={{ width: 70 }}>SỐ LƯỢNG<br /><i className="font-normal">Quantity</i></th>
                  <th className={th} style={{ width: 100 }}>ĐƠN GIÁ<br /><i className="font-normal">Unit price</i></th>
                  <th className={th} style={{ width: 110 }}>THÀNH TIỀN + VAT<br /><i className="font-normal">Amount incl. VAT</i></th>
                  <th className={th} style={{ width: 90 }}>SỐ HOÁ ĐƠN<br /><i className="font-normal">Invoice no.</i></th>
                  <th style={{ width: 22 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className={`${td} text-center`}>{i + 1}</td>
                    <td className={td}><textarea value={r.desc} onChange={e => updateRow(i, { desc: e.target.value })} rows={3} className={`${cell} resize-none`} style={ink} placeholder="Diễn giải khoản thanh toán..." /></td>
                    <td className={td}><input value={r.unit} onChange={e => updateRow(i, { unit: e.target.value })} className={cell} style={ink} /></td>
                    <td className={td}><input type="number" min="0" value={r.qty} onChange={e => updateRow(i, { qty: e.target.value })} className={cell} style={ink} /></td>
                    <td className={td}><input type="number" min="0" value={r.price} onChange={e => updateRow(i, { price: e.target.value })} className={cell} style={ink} /></td>
                    <td className={`${td} text-right`}>{money(rowAmount(r))}</td>
                    <td className={td}><input value={r.invoice} onChange={e => updateRow(i, { invoice: e.target.value })} className={cell} style={ink} /></td>
                    <td className="text-center">
                      {rows.length > 1 && <button type="button" onClick={() => setRows(prev => prev.filter((_, j) => j !== i))} className="text-red-500 text-xs">✕</button>}
                    </td>
                  </tr>
                ))}
                {payMethod === 'bank' && (
                  <tr>
                    <td className={td}></td>
                    <td className={td} colSpan={6}>
                      <p className="font-bold underline mb-1">THÔNG TIN CHUYỂN KHOẢN:</p>
                      <div className="space-y-1">
                        <div className="flex gap-2 items-center"><span className="shrink-0">- Tên chủ tài khoản:</span><input value={owner} onChange={e => setOwner(e.target.value)} className={line} style={ink} /></div>
                        <div className="flex gap-2 items-center"><span className="shrink-0">- Số tài khoản:</span><input value={account} onChange={e => setAccount(e.target.value)} className={line} style={ink} /></div>
                        <div className="flex gap-2 items-center"><span className="shrink-0">- Tên ngân hàng:</span><input value={bankName} onChange={e => setBankName(e.target.value)} className={line} style={ink} /></div>
                        <div className="flex gap-2 items-center"><span className="shrink-0">- Tại chi nhánh:</span><input value={branch} onChange={e => setBranch(e.target.value)} className={line} style={ink} /></div>
                      </div>
                    </td>
                  </tr>
                )}
                <tr>
                  <td className={`${td} font-bold text-center`} colSpan={5}>TỔNG CỘNG (TOTAL)</td>
                  <td className={`${td} font-bold text-right`}>{money(total)}</td>
                  <td className={td}></td>
                </tr>
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => setRows(prev => [...prev, { desc: '', unit: '', qty: '1', price: '', invoice: '' }])} className="text-xs text-blue-600 mt-1">+ Thêm dòng</button>
          <p className="text-right font-bold mt-2">{vnMoneyWords(total)}</p>

          <div className="mt-4">
            <p className="font-bold text-xs mb-1">Chứng từ đính kèm (hóa đơn, báo giá, ủy nhiệm chi...):</p>
            <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={pickFiles} className="text-xs" />
            {files.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between text-xs">
                    <span className="truncate">☐ {f.name} ({(f.size / 1024 / 1024).toFixed(1)}MB)</span>
                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-red-500 px-1">✕</button>
                  </li>
                ))}
              </ul>
            )}
            <input value={driveUrl} onChange={e => setDriveUrl(e.target.value)} placeholder="Hoặc dán link Google Drive (file lớn)" className={`${line} mt-2 text-xs`} style={ink} />
          </div>

          <div className="grid gap-3 mt-8 text-center text-xs" style={{ gridTemplateColumns: `repeat(${Math.min(4, 1 + Math.max(approverIds.length, 1))}, minmax(0, 1fr))` }}>
            <div>
              <p className="font-bold">Người đề nghị</p>
              <p className="italic text-blue-600">(Requested by)</p>
              <p className="mt-8 font-semibold">{currentUser.name}</p>
              <p className="text-gray-500">Ngày/ Date {dateText}</p>
            </div>
            {(approverIds.length > 0 ? approverIds : ['']).map((id, i) => (
              <div key={i}>
                <p className="font-bold">{roleOf(i)}</p>
                <p className="italic text-blue-600">&nbsp;</p>
                <p className="mt-8 font-semibold">{id ? nameOf(id) : '…………'}</p>
                <p className="text-gray-500">Ngày/ Date ……/……/……</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-[860px] mx-auto mb-4 bg-white shadow-xl p-6 text-[13px] space-y-4" style={ink}>
          <p className="font-bold">Luồng phê duyệt</p>
          <div>
            <label className="block text-xs text-gray-500 mb-1">1. Trưởng bộ phận / Quản lý đơn vị {myManagers.length > 0 ? '(quản lý phòng ban của bạn)' : ''} *</label>
            <select value={recipientId} onChange={e => setRecipientId(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white" style={ink}>
              {myManagers.length === 0 && <option value="">-- Chọn người duyệt --</option>}
              {myManagers.length > 0
                ? myManagers.map(u => <option key={u.id} value={u.id}>{u.name} — {u.department}</option>)
                : (
                  <>
                    {TEAMS.map(t => {
                      const members = users.filter(u => u.id !== currentUser.id && u.teamId === t.id)
                      return members.length === 0 ? null : (
                        <optgroup key={t.id} label={`${t.emoji} ${t.name}`}>
                          {members.map(u => <option key={u.id} value={u.id}>{u.name}{u.role === 'manager' ? ' (Quản lý)' : ''}</option>)}
                        </optgroup>
                      )
                    })}
                    {users.some(u => u.id !== currentUser.id && !TEAMS.some(t => t.id === u.teamId)) && (
                      <optgroup label="Khác">
                        {users.filter(u => u.id !== currentUser.id && !TEAMS.some(t => t.id === u.teamId)).map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </optgroup>
                    )}
                  </>
                )}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Người duyệt tiếp theo: chọn phòng ban rồi chọn lần lượt <b>Kế toán trưởng</b>, <b>Ban Giám đốc</b> (duyệt theo thứ tự trong danh sách)</label>
            <ApproverPicker users={users} excludeIds={[currentUser.id, recipientId]} value={extraApprovers} onChange={setExtraApprovers} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Luồng phê duyệt</label>
            <select value={approvalMode} onChange={e => setApprovalMode(e.target.value as 'seq' | 'par')} className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white" style={ink}>
              <option value="seq">Nối tiếp (lần lượt)</option>
              <option value="par">Song song (cùng lúc)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 py-3 flex items-center justify-end gap-3" style={{ background: '#f9fafb', borderTop: '1px solid #d1d5db' }}>
        {error && <span className="text-xs text-red-600 mr-auto">{error}</span>}
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600">Hủy</button>
        <button type="button" onClick={submit} disabled={saving}
          className="px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
          {saving ? 'Đang gửi...' : 'Gửi đề nghị'}
        </button>
      </div>
    </div>
  )
}

function ProposalGroupPicker({ onPick, onBack, onClose }: { onPick: (g: string) => void; onBack: () => void; onClose: () => void }) {
  const opts: [string, string, string][] = [
    ['Mua sắm', '🛒', 'Đề xuất mua sắm thiết bị, vật tư, dịch vụ'],
    ['Nghỉ phép', '🏖️', 'Đơn xin nghỉ phép'],
    ['Đi công tác', '✈️', 'Đề xuất đi công tác'],
    ['Đề nghị thanh toán', '💳', 'Đề nghị thanh toán (ĐNTT) theo mẫu của công ty'],
    ['Khác', '📝', 'Đề xuất khác, tự điền thông tin'],
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-5 space-y-2.5" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Chọn loại đề xuất</h3>
        {opts.map(([name, icon, desc]) => (
          <button key={name} type="button" onClick={() => onPick(name)}
            className="w-full text-left rounded-xl p-3 hover:opacity-90"
            style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
            <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{icon} {name}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</div>
          </button>
        ))}
        <div className="flex justify-between pt-1">
          <button type="button" onClick={onBack} className="text-sm" style={{ color: 'var(--text-muted)' }}>← Quay lại</button>
          <button type="button" onClick={onClose} className="text-sm" style={{ color: 'var(--text-muted)' }}>Hủy</button>
        </div>
      </div>
    </div>
  )
}

function ProposalDnttView({ p, users, currentUserId, onClose, canAct, onApprove, onReject, onRequestReview }: {
  p: Proposal; users: User[]; currentUserId: string; onClose: () => void; canAct: boolean
  onApprove: (note: string) => Promise<void>; onReject: (note: string) => Promise<void>; onRequestReview: (note: string) => Promise<void>
}) {
  const f: any = p.formData ?? {}
  const [steps, setSteps] = useState<{ id: string; approverId: string; order: number; status: string; decidedAt?: string; note?: string }[]>([])
  const [busy, setBusy] = useState(false)
  const [myNote, setMyNote] = useState('')
  const [warn, setWarn] = useState('')
  const nameOf = (id?: string) => users.find(u => u.id === id)?.name ?? ''
  const fmt = (d?: string) => (d ? new Date(d).toLocaleString('vi-VN') : '')
  const money = (n: number) => Number(n || 0).toLocaleString('vi-VN')

  useEffect(() => {
    let alive = true
    supabase.from('proposal_steps').select('*').eq('proposal_id', p.id).order('step_order').then(({ data }: any) => {
      if (!alive) return
      setSteps((data ?? []).map((s: any) => ({ id: s.id, approverId: s.approver_id, order: s.step_order, status: s.status, decidedAt: s.decided_at ?? undefined, note: s.note ?? undefined })))
    })
    return () => { alive = false }
  }, [p.id, p.status, p.recipientId])

  const flow = steps.length > 0 ? steps : [{
    id: 'legacy', approverId: p.recipientId, order: 1,
    status: p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending',
    decidedAt: undefined as string | undefined,
    note: undefined as string | undefined,
  }]
  const STATUS: Record<string, string> = {
    approved: '✓ Đã duyệt', pending: 'Chờ duyệt', waiting: 'Chưa đến lượt', rejected: '✕ Từ chối', revision: '🔁 Yêu cầu xem xét lại', skipped: 'Bỏ qua',
  }
  const STATUS_COLOR: Record<string, string> = {
    approved: '#059669', pending: '#b45309', waiting: '#6b7280', rejected: '#dc2626', revision: '#b45309', skipped: '#6b7280',
  }
  const roleOf = (i: number) => DNTT_ROLES[i] ?? `Người duyệt ${i + 1}`

  const rows: any[] = Array.isArray(f.rows) ? f.rows : []
  const amt = (r: any) => (Number(r.qty) || 0) * (Number(r.price) || 0)
  const total = rows.reduce((s, r) => s + amt(r), 0)

  const ink = { color: '#111827' }
  const th = 'border border-gray-500 px-1.5 py-1 text-xs font-bold text-center bg-gray-50'
  const td = 'border border-gray-500 px-1.5 py-1 text-xs align-top'
  const isReview = p.status === 'rejected' && !!p.rejectedReason?.startsWith('[REVIEW]')

  const act = async (fn: (note: string) => Promise<void>, needNote = false) => {
    if (needNote && !myNote.trim()) { setWarn('Hãy ghi ý kiến của bạn vào ô dưới tên bạn ở cuối đề nghị.'); return }
    setWarn(''); setBusy(true)
    try { await fn(myNote.trim()) } finally { setBusy(false) }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#d1d5db' }}>
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5" style={{ background: '#f9fafb', borderBottom: '1px solid #d1d5db' }}>
        <span className="text-sm font-bold text-gray-800">💳 Đề nghị thanh toán {p.code ?? ''}</span>
        <button type="button" onClick={onClose} className="text-gray-500 text-lg px-2">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isReview && (
          <div className="max-w-[860px] mx-auto mt-4 rounded-lg px-4 py-3 text-sm" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
            🔁 <b>Người duyệt yêu cầu xem xét lại:</b> {(p.rejectedReason ?? '').replace('[REVIEW]', '').trim()}
          </div>
        )}
        <div className="max-w-[860px] mx-auto my-4 bg-white shadow-xl p-6 sm:p-10 text-[13px] leading-relaxed" style={{ ...ink, fontFamily: '"Times New Roman", Times, serif' }}>
          <p className="font-bold text-[12px]">Công Ty Cổ Phần Tập Đoàn Đầu Tư Khôi Nguyên</p>
          <p className="font-bold text-[11px]">414-416 Tân Phú, Khu Nam Thông 3-S14, KP6, P. Tân Phú, Q.7, Tp.HCM, Việt Nam</p>

          <div className="text-center my-5">
            <p className="text-lg font-bold">ĐỀ NGHỊ THANH TOÁN</p>
            <p className="text-lg font-bold text-blue-600">(PAYMENT REQUEST)</p>
            <p className="text-[11px] text-gray-600 mt-1">Số/No: <span className="font-mono">{p.code ?? '—'}</span></p>
          </div>

          <div className="space-y-1.5 mb-3">
            <p>Người đề nghị <i className="text-blue-600">(Requested by)</i>: <b>{nameOf(p.submittedBy)}</b></p>
            <p>Địa chỉ/Bộ phận <i className="text-blue-600">(Add/Dept)</i>: {f.dept || p.department || '—'}</p>
            <p>Nội dung đề nghị thanh toán <i className="text-blue-600">(Requested About)</i>: {p.title}</p>
            {Array.isArray(f.relatedCodes) && f.relatedCodes.length > 0 && (
              <p>Tờ trình liên quan <i className="text-blue-600">(Related proposal)</i>:{' '}
                {f.relatedCodes.map((c: string, i: number) => (
                  <span key={c}>{i > 0 && ', '}<ProposalCodeLink code={c} /></span>
                ))}
              </p>
            )}
            <div>
              <p>Hình thức thanh toán <i className="text-blue-600">(Payment method)</i>:</p>
              <div className="flex gap-8 pl-24 mt-1">
                <span>{f.payMethod === 'cash' ? '☑' : '☐'} Tiền mặt/Cash</span>
                <span>{f.payMethod === 'bank' ? '☑' : '☐'} Chuyển khoản/Bank transfer</span>
              </div>
            </div>
          </div>

          <p className="font-bold mb-1">Chi tiết mua hàng hóa, dịch vụ <i className="text-blue-600">(Detail of items)</i>:</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th className={th} style={{ width: 34 }}>STT</th><th className={th}>DIỄN GIẢI</th><th className={th}>ĐVT</th>
                  <th className={th}>SỐ LƯỢNG</th><th className={th}>ĐƠN GIÁ</th><th className={th}>THÀNH TIỀN + VAT</th><th className={th}>SỐ HOÁ ĐƠN</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className={`${td} text-center`}>{i + 1}</td>
                    <td className={`${td} whitespace-pre-wrap`}>{r.desc}</td>
                    <td className={`${td} text-center`}>{r.unit}</td>
                    <td className={`${td} text-center`}>{r.qty}</td>
                    <td className={`${td} text-right`}>{r.price ? money(Number(r.price)) : ''}</td>
                    <td className={`${td} text-right`}>{money(amt(r))}</td>
                    <td className={td}>{r.invoice}</td>
                  </tr>
                ))}
                {f.payMethod === 'bank' && f.bank && (
                  <tr>
                    <td className={td}></td>
                    <td className={td} colSpan={6}>
                      <p className="font-bold underline">THÔNG TIN CHUYỂN KHOẢN:</p>
                      <p>- Tên chủ tài khoản: {f.bank.owner}</p>
                      <p>- Số tài khoản: {f.bank.account}</p>
                      <p>- Tên ngân hàng: {f.bank.bankName}</p>
                      <p>- Tại chi nhánh: {f.bank.branch}</p>
                    </td>
                  </tr>
                )}
                <tr>
                  <td className={`${td} font-bold text-center`} colSpan={5}>TỔNG CỘNG (TOTAL)</td>
                  <td className={`${td} font-bold text-right`}>{money(total)}</td>
                  <td className={td}></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-right font-bold mt-2">{f.bangChu || vnMoneyWords(total)}</p>

          {((p.attachments ?? []).length > 0 || p.driveUrl) && (
            <div className="mt-4">
              <p className="font-bold text-xs mb-1">Chứng từ đính kèm:</p>
              <div className="flex flex-col gap-1 items-start">
                {(p.attachments ?? []).map(a => (
                  <button key={a.path} type="button" onClick={() => openProposalFile(a.path)} className="text-xs underline text-blue-600">📎 {a.name}</button>
                ))}
                {p.driveUrl && <a href={p.driveUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline text-blue-600">📁 Xem tài liệu đính kèm trên Drive</a>}
              </div>
            </div>
          )}

          <div className="grid gap-3 mt-8 text-center text-xs" style={{ gridTemplateColumns: `repeat(${Math.min(4, 1 + flow.length)}, minmax(0, 1fr))` }}>
            <div>
              <p className="font-bold">Người đề nghị</p>
              <p className="italic text-blue-600">(Requested by)</p>
              <p className="mt-8 font-semibold">{nameOf(p.submittedBy)}</p>
              <p className="text-gray-500">Ngày/ Date {new Date(p.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            {flow.map((s, i) => {
              const mine = canAct && s.approverId === currentUserId && s.status === 'pending'
              return (
                <div key={s.id}>
                  <p className="font-bold">{roleOf(i)}</p>
                  <p className="italic text-blue-600">&nbsp;</p>
                  <p className="mt-8 font-semibold">{nameOf(s.approverId)}</p>
                  <p className="font-semibold" style={{ color: STATUS_COLOR[s.status] ?? '#6b7280' }}>{STATUS[s.status] ?? s.status}</p>
                  {s.decidedAt && <p className="text-gray-500">Ngày/ Date {fmt(s.decidedAt)}</p>}
                  {mine ? (
                    <textarea value={myNote} onChange={e => setMyNote(e.target.value)} rows={3}
                      placeholder="Ý kiến của bạn (VD: số tiền chưa khớp hóa đơn...)"
                      className="mt-2 w-full text-xs border border-amber-300 rounded p-1.5 outline-none focus:border-amber-500 bg-amber-50" style={ink} />
                  ) : (
                    s.note && <p className="mt-1 italic" style={{ color: s.status === 'revision' ? '#b45309' : '#374151' }}>“{s.note}”</p>
                  )}
                </div>
              )
            })}
          </div>
          {p.status === 'rejected' && p.rejectedReason && !isReview && (
            <p className="mt-6 text-xs text-red-600">Lý do từ chối: {p.rejectedReason}</p>
          )}
        </div>
      </div>

      <div className="shrink-0 px-4 py-3 flex items-center justify-end gap-3" style={{ background: '#f9fafb', borderTop: '1px solid #d1d5db' }}>
        {warn && <span className="text-xs text-red-600 mr-auto">{warn}</span>}
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600">Đóng</button>
        {canAct && (
          <>
            <button type="button" disabled={busy} onClick={() => act(async n => { await onReject(n) })}
              className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-40" style={{ background: '#fee2e2', color: '#dc2626' }}>Từ chối</button>
            <button type="button" disabled={busy} onClick={() => act(onRequestReview, true)}
              className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-40" style={{ background: '#fef3c7', color: '#b45309' }}>🔁 Yêu cầu xem xét lại</button>
            <button type="button" disabled={busy} onClick={() => act(onApprove)}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-40" style={{ background: '#059669' }}>✓ Duyệt</button>
          </>
        )}
      </div>
    </div>
  )
}

function ApproverPicker({ users, excludeIds, value, onChange, tone = 'light' }: {
  users: User[]; excludeIds: string[]; value: string[]; onChange: (v: string[]) => void; tone?: 'light' | 'dark'
}) {
  const [teamId, setTeamId] = useState('')
  const [q, setQ] = useState('')
  const dark = tone === 'dark'
  const box = dark
    ? { background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }
    : { background: '#ffffff', border: '1px solid #d1d5db', color: '#111827' }
  const muted = dark ? 'var(--text-muted)' : '#6b7280'

  const teamName = (u: User) => TEAMS.find(t => t.id === u.teamId)?.name ?? u.department ?? ''
  const nameOf = (id: string) => users.find(u => u.id === id)?.name ?? ''
  const pool = users.filter(u => !excludeIds.includes(u.id) && !value.includes(u.id))
  const query = q.trim().toLowerCase()
  const shown = (query ? pool.filter(u => u.name.toLowerCase().includes(query)) : teamId ? pool.filter(u => u.teamId === teamId) : [])
    .sort((a, b) => (b.role === 'manager' ? 1 : 0) - (a.role === 'manager' ? 1 : 0))

  const move = (i: number, dir: -1 | 1) => {
    const next = [...value]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ol className="space-y-1">
          {value.map((id, i) => {
            const u = users.find(x => x.id === id)
            return (
              <li key={id} className="flex items-center gap-2 text-xs rounded px-2 py-1" style={box}>
                <b>{i + 2}.</b>
                <span className="flex-1">{nameOf(id)} <span style={{ color: muted }}>— {u ? teamName(u) : ''}</span></span>
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="px-1 disabled:opacity-30">↑</button>
                <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="px-1 disabled:opacity-30">↓</button>
                <button type="button" onClick={() => onChange(value.filter(x => x !== id))} className="px-1" style={{ color: '#dc2626' }}>✕</button>
              </li>
            )
          })}
        </ol>
      )}
      <div className="flex gap-2">
        <select value={teamId} onChange={e => { setTeamId(e.target.value); setQ('') }}
          className="flex-1 rounded px-2 py-1.5 text-xs outline-none" style={box}>
          <option value="">-- Chọn phòng ban --</option>
          {TEAMS.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
        </select>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="hoặc gõ tên để tìm"
          className="flex-1 rounded px-2 py-1.5 text-xs outline-none" style={box} />
      </div>
      {(teamId || query) && (
        <div className="flex flex-wrap gap-1.5">
          {shown.length === 0 && <span className="text-xs" style={{ color: muted }}>Không có ai phù hợp.</span>}
          {shown.map(u => (
            <button key={u.id} type="button" onClick={() => onChange([...value, u.id])}
              className="text-xs px-2.5 py-1 rounded-full" style={box}>
              ＋ {u.name}{u.role === 'manager' ? ' (Quản lý)' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
function ProposalKindPicker({ onPick, onClose }: { onPick: (k: 'dexuat' | 'totrinh') => void; onClose: () => void }) {
  const Opt = ({ k, icon, title, desc }: { k: 'dexuat' | 'totrinh'; icon: string; title: string; desc: string }) => (
    <button type="button" onClick={() => onPick(k)}
      className="w-full text-left rounded-xl p-4 transition-colors hover:opacity-90"
      style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
      <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{icon} {title}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{desc}</div>
    </button>
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-5 space-y-3" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Bạn muốn tạo gì?</h3>
        <Opt k="totrinh" icon="📜" title="Tờ trình" desc="Văn bản đầy đủ: Kính gửi, Căn cứ, Nội dung, Chi phí, Đề nghị phê duyệt." />
        <Opt k="dexuat" icon="📝" title="Đề xuất" desc="Đề xuất ngắn gọn: mua sắm, nghỉ phép, công tác, thanh toán…" />
        <button type="button" onClick={onClose} className="w-full py-2 rounded-xl text-sm" style={{ color: 'var(--text-muted)' }}>Hủy</button>
      </div>
    </div>
  )
}

type CostRow = { item: string; unit?: string; qty?: string; price?: string; note?: string; amount?: number; extra?: boolean }
type CostItem = { item: string; cost: string; amount: number; extra?: boolean }

const hasCostRows = (fd: any) => Array.isArray(fd?.costRows) && fd.costRows.length > 0

// costRows (bảng tờ trình) -> items (giữ tương thích với chỗ khác dùng items)
const rowToItem = (r: CostRow): CostItem => {
  const computed = `${[r.qty, r.unit].filter(Boolean).join(' ')}${r.price ? ` × ${toVnd(Number(r.price)).toLocaleString('vi-VN')}` : ''}`.trim()
  return { item: (r.item || '').trim(), cost: computed || (r.note ?? ''), amount: costRowAmount(r), ...(r.extra ? { extra: true } : {}) }
}
// items cũ (đề xuất) -> costRows
const itemToRow = (x: CostItem): CostRow =>
  ({ item: x.item, unit: '', qty: '', price: '', note: x.cost, amount: x.amount, ...(x.extra ? { extra: true } : {}) })

function ProposalCostSection({ p, canEdit }: { p: Proposal; canEdit: boolean }) {
  const readRows = (): CostRow[] =>
    hasCostRows(p.formData) ? (p.formData!.costRows as CostRow[]) : (p.items ?? []).map(itemToRow)

  const [rows, setRows] = useState<CostRow[]>(readRows)
  const [item, setItem] = useState('')
  const [unit, setUnit] = useState('')
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')
  const [note, setNote] = useState('')


  const total = rows.reduce((s, r) => s + costRowAmount(r), 0)
  const fmt = (n: number) => toVnd(n).toLocaleString('vi-VN')

  // Đồng bộ lại khi dữ liệu thay đổi (realtime / người khác sửa)
  useEffect(() => { setRows(readRows()) }, [p.items, p.formData])

  // Thành tiền xem trước ở ô nhập
  const previewAmount = price === '' ? 0
    : costRowAmount({ qty: qty === '' ? '1' : qty, price: String(toVnd(Number(price))) })

  const save = async (change: (list: CostRow[]) => CostRow[]) => {
    const { data: cur, error: readErr } = await supabase
      .from('proposals').select('items, form_data').eq('id', p.id).single()
    if (readErr || !cur) { alert('Không đọc được dữ liệu chi phí: ' + (readErr?.message ?? '')); return false }

    const fd: any = cur.form_data ?? {}
    const useRows = hasCostRows(fd)
    const base: CostRow[] = useRows ? fd.costRows : ((cur.items ?? []) as CostItem[]).map(itemToRow)
    const nextRows = change(base)

    const payload: any = { items: nextRows.map(rowToItem) }
    if (useRows || p.kind === 'totrinh') {
      payload.form_data = { ...fd, costRows: nextRows }
    }
    const { error } = await supabase.from('proposals').update(payload).eq('id', p.id)
    if (error) { alert('Không lưu được chi phí: ' + error.message); return false }
    setRows(nextRows)
    return true
  }

  const add = async () => {
    if (!item.trim() || price === '') return
    const row: CostRow = {
      item: item.trim(), unit: unit.trim(),
      qty: qty === '' ? '1' : qty,
      price: String(toVnd(Number(price))),
      note: note.trim(), extra: true,
    }
    const ok = await save(list => [...list, row])
    if (ok) { setItem(''); setUnit(''); setQty(''); setPrice(''); setNote('') }
  }
  const remove = (i: number) => save(list => list.filter((_, j) => j !== i))

  const inputStyle = { background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }
  const th = 'py-1.5 px-1.5 font-semibold text-left whitespace-nowrap'
  const td = 'py-1.5 px-1.5 align-top'

  return (
    <section className="rounded-xl p-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Thông tin chi phí</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ minWidth: 560 }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)' }}>
              <th className={`${th} w-8`}>STT</th>
              <th className={th}>Hạng mục</th>
              <th className={th}>Đơn vị</th>
              <th className={`${th} text-right`}>Số lượng</th>
              <th className={`${th} text-right`}>Đơn giá (VNĐ)</th>
              <th className={`${th} text-right`}>Thành tiền (VNĐ)</th>
              <th className={th}>Ghi chú</th>
              {canEdit && <th className="w-6"></th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={8} className="py-2" style={{ color: 'var(--text-muted)' }}>Chưa có hạng mục nào.</td></tr>
            )}
            {rows.map((r, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <td className={`${td} text-center`}>{i + 1}</td>
                <td className={td}>
                  {r.item}
                  {r.extra && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#f59e0b22', color: '#b45309' }}>Phát sinh</span>}
                </td>
                <td className={td}>{r.unit}</td>
                <td className={`${td} text-right`}>{r.qty}</td>
                <td className={`${td} text-right`}>{r.price ? fmt(Number(r.price)) : ''}</td>
                <td className={`${td} text-right`}>{fmt(costRowAmount(r))}</td>
                <td className={td}>{r.note}</td>
                {canEdit && (
                  <td className={`${td} text-right`}>
                    <button type="button" onClick={() => remove(i)} style={{ color: '#dc2626' }}>✕</button>
                  </td>
                )}
              </tr>
            ))}
            {rows.length > 0 && (
              <tr style={{ borderTop: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <td className="py-2 px-1.5 font-bold" colSpan={5}>Tổng chi phí</td>
                <td className="py-2 px-1.5 font-bold text-right">{fmt(total)}</td>
                <td colSpan={canEdit ? 2 : 1}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {rows.length > 0 && (
        <p className="text-xs italic mt-2" style={{ color: 'var(--text-muted)' }}>(Bằng chữ: {docSoThanhChu(total)})</p>
      )}

      {canEdit && (
        <div className="mt-3">
          <div className="flex gap-2 flex-wrap">
            <input value={item} onChange={e => setItem(e.target.value)} placeholder="Hạng mục"
              className="flex-1 min-w-[140px] px-2 py-1.5 rounded-lg text-xs outline-none" style={inputStyle} />
            <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Đơn vị"
              className="w-20 px-2 py-1.5 rounded-lg text-xs outline-none" style={inputStyle} />
            <input type="number" min="0" value={qty} onChange={e => setQty(e.target.value)} placeholder="SL"
              className="w-16 px-2 py-1.5 rounded-lg text-xs outline-none" style={inputStyle} />
            <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="Đơn giá (VNĐ)"
              className="w-32 px-2 py-1.5 rounded-lg text-xs outline-none" style={inputStyle} />
          </div>
          <div className="flex gap-2 flex-wrap mt-2 items-center">
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú"
              className="flex-1 min-w-[140px] px-2 py-1.5 rounded-lg text-xs outline-none" style={inputStyle} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Thành tiền: <b style={{ color: 'var(--text-primary)' }}>{fmt(previewAmount)}</b>
            </span>
            <button type="button" onClick={add} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#0891b2' }}>Thêm</button>
          </div>
        </div>
      )}
    </section>
  )
}

function ProposalRiskSection({ p, users, currentUser, canEdit }: { p: Proposal; users: User[]; currentUser: User; canEdit: boolean }) {
  type Risk = { t: string; lv: string; u: string; at: string }
  const [risks, setRisks] = useState<Risk[]>(p.risks ?? [])
  const [text, setText] = useState('')
  const [lv, setLv] = useState('Trung bình')
  const COLORS: Record<string, [string, string]> = {
    'Thấp': ['#34d39922', '#059669'], 'Trung bình': ['#f59e0b22', '#b45309'], 'Cao': ['#ef444422', '#dc2626'],
  }
  const add = async () => {
    if (!text.trim()) return
    const next = [...risks, { t: text.trim(), lv, u: currentUser.id, at: new Date().toISOString() }]
    const { error } = await supabase.from('proposals').update({ risks: next }).eq('id', p.id)
    if (error) { alert('Không lưu được rủi ro: ' + error.message); return }
    setRisks(next)
    setText('')
  }
  const inputStyle = { background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

  return (
    <section className="rounded-xl p-4 mt-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Rủi ro</h3>
      {risks.length === 0 && <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Chưa ghi nhận rủi ro nào.</p>}
      <div className="space-y-2">
        {risks.map((r, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-md font-semibold shrink-0" style={{ background: (COLORS[r.lv] ?? COLORS['Trung bình'])[0], color: (COLORS[r.lv] ?? COLORS['Trung bình'])[1] }}>{r.lv}</span>
            <span className="flex-1" style={{ color: 'var(--text-primary)' }}>{r.t}</span>
            <span style={{ color: 'var(--text-muted)' }}>{users.find(u => u.id === r.u)?.name} · {new Date(r.at).toLocaleDateString('vi-VN')}</span>
          </div>
        ))}
      </div>
      {canEdit && (
        <div className="flex gap-2 mt-3">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add() }}
            placeholder="Mô tả rủi ro" className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none" style={inputStyle} />
          <select value={lv} onChange={e => setLv(e.target.value)} className="px-2 py-1.5 rounded-lg text-xs outline-none" style={inputStyle}>
            <option>Thấp</option><option>Trung bình</option><option>Cao</option>
          </select>
          <button type="button" onClick={add} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#0891b2' }}>Thêm rủi ro</button>
        </div>
      )}
    </section>
  )
}

function ProposalCommentsSection({ p, users, currentUser }: { p: Proposal; users: User[]; currentUser: User }) {
  const [comments, setComments] = useState<{ id: string; userId: string; content: string; createdAt: string }[]>([])
  const [text, setText] = useState('')
  const load = async () => {
    const { data } = await supabase.from('proposal_comments').select('*').eq('proposal_id', p.id).order('created_at')
    setComments((data ?? []).map((c: any) => ({ id: c.id, userId: c.user_id, content: c.content, createdAt: c.created_at })))
  }
  useEffect(() => { load() }, [p.id])
  const send = async () => {
    const t = text.trim()
    if (!t) return
    const { error } = await supabase.from('proposal_comments').insert({ proposal_id: p.id, user_id: currentUser.id, content: t })
    if (error) { alert('Không gửi được bình luận: ' + error.message); return }
    setText('')
    load()
  }
  return (
    <section className="rounded-xl p-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Trao đổi</h3>
      {comments.length === 0 && <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Chưa có trao đổi nào.</p>}
      <div className="space-y-2 mb-3">
        {comments.map(c => (
          <div key={c.id} className="text-xs">
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{users.find(u => u.id === c.userId)?.name}</span>
            <span className="ml-2" style={{ color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString('vi-VN')}</span>
            <p style={{ color: 'var(--text-primary)' }}>{c.content}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send() }}
          placeholder="Viết bình luận..." className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        <button type="button" onClick={send} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#0891b2' }}>Gửi</button>
      </div>
    </section>
  )
}
const PLAN_STATUS: [string, string][] = [
  ['received', 'Receive'], ['processing', 'Process'], ['pending', 'Pending'], ['complete', 'Complete'], ['closed', 'Close'],
]

function ProposalPlanSection({ p, users, currentUser, flow }: {
  p: Proposal; users: User[]; currentUser: User; flow: { id: string; approverId: string; status: string }[]
}) {
  const [planStatus, setPlanStatus] = useState(p.planStatus ?? 'received')
  const [notes, setNotes] = useState<{ id: string; userId: string; note: string; createdAt: string }[]>([])
  const [newNote, setNewNote] = useState('')
  const userOf = (id?: string) => users.find(u => u.id === id)
  const fmtD = (d?: string) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—')
  const canChange = currentUser.id === p.submittedBy || flow.some(s => s.approverId === currentUser.id) || !!currentUser.isDirector

  const loadNotes = async () => {
    const { data } = await supabase.from('proposal_work_notes').select('*').eq('proposal_id', p.id).order('created_at')
    setNotes((data ?? []).map((n: any) => ({ id: n.id, userId: n.user_id, note: n.note, createdAt: n.created_at })))
  }
  useEffect(() => { loadNotes() }, [p.id])

  const addNote = async () => {
    const t = newNote.trim()
    if (!t) return
    const { error } = await supabase.from('proposal_work_notes').insert({ proposal_id: p.id, user_id: currentUser.id, note: t })
    if (error) { alert('Không ghi được worknote: ' + error.message); return }
    setNewNote('')
    loadNotes()
  }

  const changeStatus = async (v: string) => {
    const { error } = await supabase.from('proposals').update({ plan_status: v }).eq('id', p.id)
    if (error) { alert('Không đổi được trạng thái: ' + error.message); return }
    setPlanStatus(v)
  }

  const LABEL: Record<string, [string, string, string]> = {
    pending: ['Chờ duyệt', '#f59e0b22', '#b45309'],
    waiting: ['Chưa đến lượt', '#64748b22', '#64748b'],
    approved: ['Đã duyệt', '#34d39922', '#059669'],
    rejected: ['Từ chối', '#ef444422', '#dc2626'],
        revision: ['Yêu cầu xem xét lại', '#f59e0b22', '#b45309'],
    skipped: ['Bỏ qua', '#64748b22', '#64748b'],
  }
  const Badge = ({ s }: { s: string }) => {
    const l = LABEL[s] ?? [s, '#64748b22', '#64748b']
    return <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: l[1], color: l[2] }}>{l[0]}</span>
  }
  const Person = ({ id }: { id?: string }) => (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: '#7c3aed' }}>
        {(userOf(id)?.name ?? '?').split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()}
      </span>
      {userOf(id)?.name}
    </span>
  )
  const th = { color: 'var(--text-muted)' }
  const td = { color: 'var(--text-primary)', verticalAlign: 'top' as const }

  return (
    <section className="rounded-xl p-4 mt-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Kế hoạch</h3>
      <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>
        Tự tạo khi gửi đề xuất. Chỉ cần đổi trạng thái và cập nhật worknote: Receive → Process → Pending → Complete → Close
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ minWidth: 980 }}>
          <thead>
            <tr className="text-left">
              {['STT', 'ID TASK', 'Nội dung', 'Worknote', 'Start date', 'End date', 'Người đề xuất', 'Assign', 'Phê duyệt', 'Status'].map(h => (
                <th key={h} className="py-2 pr-3 font-semibold" style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td className="py-3 pr-3" style={td}>1</td>
              <td className="py-3 pr-3 font-mono" style={td}>{p.code ?? '—'}</td>
              <td className="py-3 pr-3 font-semibold" style={{ ...td, maxWidth: 180 }}>{p.brief || p.title}</td>
              <td className="py-3 pr-3" style={{ ...td, minWidth: 260 }}>
                {notes.length === 0
                  ? <p className="mb-1.5" style={{ color: 'var(--text-muted)' }}>Chưa có cập nhật nào.</p>
                  : notes.map(n => (
                    <p key={n.id} className="mb-1">
                      <span style={{ color: 'var(--text-muted)' }}>{fmtD(n.createdAt)} · {userOf(n.userId)?.name}: </span>{n.note}
                    </p>
                  ))}
                <div className="flex gap-1.5">
                  <input value={newNote} onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addNote() }}
                    placeholder="Cập nhật worknote, VD: đã đưa tờ trình cho kế toán"
                    className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none"
                    style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  <button type="button" onClick={addNote} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>Ghi</button>
                </div>
              </td>
              <td className="py-3 pr-3" style={td}>{fmtD(p.createdAt)}</td>
              <td className="py-3 pr-3" style={td}>{p.dueDate ? p.dueDate.split('-').reverse().join('/') : '—'}</td>
              <td className="py-3 pr-3" style={td}><Person id={p.submittedBy} /></td>
              <td className="py-3 pr-3" style={td}><Person id={p.submittedBy} /></td>
              <td className="py-3 pr-3" style={td}>
                <div className="space-y-1">
                  <Badge s={p.status} />
                  {flow.map(s => (
                    <div key={s.id} className="flex items-center gap-1.5"><Person id={s.approverId} /><Badge s={s.status} /></div>
                  ))}
                </div>
              </td>
              <td className="py-3" style={td}>
                <select value={planStatus} disabled={!canChange} onChange={e => changeStatus(e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none disabled:opacity-50"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  {PLAN_STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
function ProposalDetailModal({ proposal: p, users, currentUser, approvals, revisions, onClose }: {
  proposal: Proposal; users: User[]; currentUser: User; approvals: ProposalApproval[]; revisions: ProposalRevision[]; onClose: () => void
}) {
  const [steps, setSteps] = useState<{ id: string; approverId: string; order: number; status: string; note?: string; decidedAt?: string }[]>([])
  const userOf = (id?: string) => users.find(u => u.id === id)
  const initials = (name?: string) => (name ?? '?').split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
  const fmt = (d?: string) => (d ? new Date(d).toLocaleString('vi-VN') : '')

  useEffect(() => {
    let alive = true
    supabase.from('proposal_steps').select('*').eq('proposal_id', p.id).order('step_order').then(({ data }) => {
      if (!alive) return
      setSteps((data ?? []).map((s: any) => ({
        id: s.id, approverId: s.approver_id, order: s.step_order, status: s.status,
        note: s.note ?? undefined, decidedAt: s.decided_at ?? undefined,
      })))
    })
    return () => { alive = false }
  }, [p.id, p.status, p.recipientId])

  const flow = steps.length > 0 ? steps : [{
    id: 'legacy', approverId: p.recipientId, order: 1,
    status: p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending',
    note: p.rejectedReason, decidedAt: undefined as string | undefined,
  }]

  const LABEL: Record<string, [string, string, string]> = {
    pending: ['Chờ duyệt', '#f59e0b22', '#b45309'],
    waiting: ['Chưa đến lượt', '#64748b22', '#64748b'],
    approved: ['Đã duyệt', '#34d39922', '#059669'],
    rejected: ['Từ chối', '#ef444422', '#dc2626'],
    skipped: ['Bỏ qua', '#64748b22', '#64748b'],
  }
  const Badge = ({ s }: { s: string }) => {
    const l = LABEL[s] ?? [s, '#64748b22', '#64748b']
    return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: l[1], color: l[2] }}>{l[0]}</span>
  }
  const Avatar = ({ id }: { id?: string }) => (
    <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: '#7c3aed' }}>
      {initials(userOf(id)?.name)}
    </span>
  )
  const Row = ({ k, v }: { k: string; v?: string | number | null }) => (
    <div className="grid grid-cols-3 gap-2 text-xs py-1">
      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
      <span className="col-span-2" style={{ color: 'var(--text-primary)' }}>{v || '—'}</span>
    </div>
  )

  const events = [
    { at: p.createdAt, text: `${userOf(p.submittedBy)?.name ?? ''} đã gửi đề xuất` },
    ...approvals.filter(a => a.proposalId === p.id).map(a => ({
      at: a.createdAt,
      text: `${userOf(a.approverId)?.name ?? ''} ${a.action === 'approved' ? 'đã duyệt' : a.action === 'rejected' ? (a.note?.startsWith('[REVIEW]') ? 'yêu cầu xem xét lại' : 'đã từ chối') : 'đã chuyển tiếp'}${a.note ? `: ${a.note.replace('[REVIEW]', '').trim()}` : ''}`,
    })),
    ...revisions.filter(r => r.proposalId === p.id).map(r => ({
      at: r.createdAt, text: `${userOf(r.editedBy)?.name ?? ''} đã gửi lại đề xuất`,
    })),
  ].sort((a, b) => a.at.localeCompare(b.at))

  const card = { background: 'var(--bg-panel)', border: '1px solid var(--border)' }
  const canEdit = currentUser.id === p.submittedBy || flow.some(s => s.approverId === currentUser.id) || !!currentUser.isDirector

  return (
    <div className="fixed inset-x-0 top-16 bottom-14 md:bottom-0 z-50 overflow-y-auto p-4" style={{ background: 'var(--bg-app)' }}>
      <div className="max-w-5xl mx-auto">
        <button onClick={onClose} className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>← Danh sách đề xuất</button>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {p.code ? `${p.code}: ` : ''}{p.title}
        </h2>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{p.kind === 'totrinh' ? 'Tờ trình' : (p.groupName ? `Đề xuất ${p.groupName.toLowerCase()}` : 'Đề xuất')}</p>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <section className="rounded-xl p-4" style={card}>
              <div className="flex items-center gap-2 mb-3">
                <Badge s={p.status === 'rejected' && p.rejectedReason?.startsWith('[REVIEW]') ? 'revision' : p.status} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Gửi bởi</span>
                <Avatar id={p.submittedBy} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{userOf(p.submittedBy)?.name}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>lúc {fmt(p.createdAt)}</span>
              </div>
              <Row k="Nhóm đề xuất" v={p.groupName} />
              <Row k="Phòng ban" v={p.department} />
              <Row k="Công ty" v={p.company} />
              <Row k="Thời gian cần" v={p.days ? `${p.days} ngày` : undefined} />
              <Row k="Hạn kết thúc" v={p.dueDate} />
              <Row k="Mô tả ngắn" v={p.brief} />
              <Row k="Mô tả dài" v={p.description} />
              {p.status === 'rejected' && p.rejectedReason && <Row k="Lý do từ chối" v={p.rejectedReason} />}
              <ProposalAttachments p={p} users={users} />
              {p.driveUrl && (
                <div className="pt-2">
                  <a href={p.driveUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: '#3b82f6' }}>📁 Link Drive</a>
                </div>
              )}
            </section>
            <ProposalSupplementSection p={p} currentUser={currentUser} flow={flow} />
            <ProposalCostSection p={p} canEdit={canEdit} />
            <ProposalCommentsSection p={p} users={users} currentUser={currentUser} />
          </div>

          <div className="space-y-4">
            <section className="rounded-xl p-4" style={card}>
              <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Luồng phê duyệt</h3>
              <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>
                {p.approvalMode === 'par' ? 'Duyệt song song: cùng lúc.' : 'Duyệt nối tiếp: lần lượt từng người.'}
              </p>
              <div className="space-y-3">
                {flow.map(s => (
                  <div key={s.id} className="flex gap-2">
                    <Avatar id={s.approverId} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {userOf(s.approverId)?.name} <span className="font-normal" style={{ color: 'var(--text-muted)' }}>{userOf(s.approverId)?.department}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge s={s.status} />
                        {s.decidedAt && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{fmt(s.decidedAt)}</span>}
                      </div>
                      {s.note && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}><LinkifyCodes text={s.note} /></p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl p-4" style={card}>
              <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Lịch sử</h3>
              <div className="space-y-2">
                {events.map((e, i) => (
                  <div key={i}>
                    <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{e.text}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{fmt(e.at)}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

const MAX_FILES = 5
const MAX_FILE_MB = 10

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    const blob: Blob | null = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.8))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  }
}

async function uploadProposalFiles(userId: string, files: File[]) {
    const out: { name: string; path: string; size: number; type: string; at?: string; by?: string }[] = []
    for (const f of files) {
    const small = await compressImage(f)
    const safe = small.name.replace(/[^\w.\-]+/g, '_')
    const path = `${userId}/${Date.now()}_${safe}`
    const { error } = await supabase.storage.from('proposal-files').upload(path, small, { contentType: small.type || undefined })
    if (error) throw error
    out.push({ name: small.name, path, size: small.size, type: small.type, at: new Date().toISOString(), by: userId })
  }
  return out
}

async function openProposalFile(path: string) {
  if (/^https?:\/\//i.test(path)) { window.open(path, '_blank', 'noopener'); return }
  const { data, error } = await supabase.storage.from('proposal-files').createSignedUrl(path, 3600)
  if (error || !data) { alert('Không mở được file: ' + (error?.message ?? '')); return }
  window.open(data.signedUrl, '_blank', 'noopener')
}

const PROPOSAL_GROUPS = ['Mua sắm', 'Nghỉ phép', 'Đi công tác', 'Đề nghị thanh toán', 'Khác']
const COMPANIES = ['KNI Office', 'Genki House', 'Genki Farm', 'First Steps', 'Les Sens Phú Quốc', 'ACVN']

async function generateProposalCode(userId: string): Promise<string> {
  const d = new Date()
  const ds = String(d.getDate()).padStart(2, '0') + String(d.getMonth() + 1).padStart(2, '0') + String(d.getFullYear()).slice(-2)
  const prefix = `RTASK${ds}-`
  const { count } = await supabase.from('proposals')
    .select('id', { count: 'exact', head: true }).eq('submitted_by', userId).like('code', `${prefix}%`)
  return `${prefix}${String((count ?? 0) + 1).padStart(2, '0')}`
}

function ProposalModal({ currentUser, users, editingProposal, onClose, kind = 'dexuat', initialGroup = '' }: { currentUser: User; users: User[]; editingProposal?: Proposal | null; onClose: () => void; kind?: 'dexuat' | 'totrinh'; initialGroup?: string }) {
  const [title, setTitle] = useState(editingProposal?.title ?? '')
  const [description, setDescription] = useState(editingProposal?.description ?? '')
  const [driveUrl, setDriveUrl] = useState(editingProposal?.driveUrl ?? '')
  const [revisionNote, setRevisionNote] = useState('')
  const [recipientId, setRecipientId] = useState(
    editingProposal?.recipientId ??
    (users.find(u => u.role === 'manager' && u.teamId === currentUser.teamId && u.id !== currentUser.id)?.id ?? '')
  )
  const [resubmitTeamId, setResubmitTeamId] = useState(
    editingProposal ? (users.find(u => u.id === editingProposal.recipientId)?.teamId ?? '') : ''
  )
  const [addedNote, setAddedNote] = useState('')
  const [editedNote, setEditedNote] = useState('')
  const [error, setError] = useState('')
  const [groupName, setGroupName] = useState(editingProposal?.groupName ?? initialGroup)
  const [company, setCompany] = useState(editingProposal?.company ?? '')
  const [days, setDays] = useState('')
  const [brief, setBrief] = useState(editingProposal?.brief ?? '')
  const [files, setFiles] = useState<File[]>([])
  const [costItems, setCostItems] = useState<{ item: string; cost: string; amount: number }[]>([])
  const [ciItem, setCiItem] = useState('')
  const [ciCost, setCiCost] = useState('')
  const [ciAmount, setCiAmount] = useState('')
  const myManagers = users.filter(u => u.role === 'manager' && u.teamId === currentUser.teamId && u.id !== currentUser.id)
  const [extraApprovers, setExtraApprovers] = useState<string[]>([])
  const [approvalMode, setApprovalMode] = useState<'seq' | 'par'>('seq')
  const [saving, setSaving] = useState(false)


  const managersInResubmitTeam = users.filter(u => u.role === 'manager' && u.teamId === resubmitTeamId)

  const handleSubmit = async () => {
    if (!title.trim() || !recipientId || (!editingProposal && (!brief.trim() || !groupName.trim()))) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.')
      return
    }
    if (editingProposal && !addedNote.trim() && !editedNote.trim()) {
      setError('Vui lòng ghi rõ ít nhất một trong hai: nội dung đã bổ sung hoặc đã chỉnh sửa.')
      return
    }
    if (driveUrl.trim() && !/^https?:\/\//i.test(driveUrl.trim())) {
      setError('Link Drive không hợp lệ.')
      return
    }
    setError('')
    setSaving(true)

    if (editingProposal) {
      // Sửa & gửi lại: cập nhật nội dung, reset trạng thái về chờ duyệt
      const { error: updateError } = await supabase.from('proposals').update({
        title: title.trim(), description: description.trim(), drive_url: driveUrl.trim(),
        recipient_id: recipientId, status: 'pending', rejected_reason: null,
        participants: editingProposal.participants.includes(recipientId)
          ? editingProposal.participants
          : [...editingProposal.participants, recipientId],
      }).eq('id', editingProposal.id)
      if (updateError) { setSaving(false); setError(updateError.message); return }

      // Lưu lại nội dung đã bổ sung/chỉnh sửa để hiện trong lịch sử
      await supabase.from('proposal_revisions').insert({
        proposal_id: editingProposal.id,
        edited_by: currentUser.id,
        added_note: addedNote.trim() || null,
        edited_note: editedNote.trim() || null,
      })
      setSaving(false)

      await supabase.from('notifications').insert({
        message: `📜 ${currentUser.name} đã chỉnh sửa và gửi lại tờ trình "${title.trim()}" cho bạn`,
        target_user_id: recipientId,
        link_proposal_id: editingProposal.id,
      })
    } else {
      const dueDate = days ? new Date(Date.now() + Number(days) * 864e5).toISOString().slice(0, 10) : null
      const finalItems = ciItem.trim() && ciAmount !== ''
        ? [...costItems, { item: ciItem.trim(), cost: ciCost.trim(), amount: Number(ciAmount) }]
        : costItems
      let uploaded: { name: string; path: string; size: number; type: string }[] = []
      try { uploaded = await uploadProposalFiles(currentUser.id, files) }
      catch (err: any) { setSaving(false); setError('Tải file thất bại: ' + (err?.message ?? '')); return }
      let data: any = null
      let insertError: any = null
      for (let i = 0; i < 3; i++) {
        const res = await supabase.from('proposals').insert({
          title: title.trim(), description: description.trim(), drive_url: driveUrl.trim(),
          submitted_by: currentUser.id, recipient_id: recipientId, status: 'pending',
          participants: [currentUser.id, recipientId, ...extraApprovers],
          code: await generateProposalCode(currentUser.id),
          group_name: groupName, department: currentUser.department, company: company || null,
          brief: brief.trim(), days: days ? Number(days) : null, due_date: dueDate,
          approval_mode: approvalMode,
          attachments: uploaded,
          items: finalItems,
          kind,
        }).select('id').single()
        data = res.data; insertError = res.error
                if (!insertError && data?.id) {
          const approverIds = [recipientId, ...extraApprovers.filter(id => id !== recipientId)]
          await supabase.from('proposal_steps').insert(approverIds.map((id, i) => ({
            proposal_id: data.id, approver_id: id, step_order: i + 1,
            status: i === 0 || approvalMode === 'par' ? 'pending' : 'waiting',
          })))
        }
        if (!insertError || insertError.code !== '23505') break
      }
      setSaving(false)
      if (insertError) { setError(insertError.message); return }

      await supabase.from('notifications').insert({
        message: `📜 ${currentUser.name} vừa trình tờ trình "${title.trim()}" cho bạn`,
        target_user_id: recipientId,
        link_proposal_id: data?.id,
      })
            if (approvalMode === 'par') {
        for (const id of extraApprovers) {
          await supabase.from('notifications').insert({
            message: `📜 ${currentUser.name} vừa trình tờ trình "${title.trim()}" cho bạn`,
            target_user_id: id,
            link_proposal_id: data?.id,
          })
        }
      }
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
            {editingProposal ? '✏️ Chỉnh sửa & Gửi lại tờ trình' : (kind === 'totrinh' ? '📜 Tạo tờ trình mới (RTASK)' : '📜 Tạo đề xuất mới (RTASK)')}
          </h3>
          <button onClick={onClose} className="text-2xl leading-none hover:opacity-70" style={{ color: 'var(--text-muted)' }}>×</button>
        </div>

        {editingProposal?.rejectedReason && (
          <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: '#f8717114', color: '#dc2626' }}>
            ❌ Lý do bị từ chối trước đó: {editingProposal.rejectedReason}
          </div>
        )}

        {editingProposal && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Nội dung đã bổ sung (nếu có)
              </label>
              <textarea value={addedNote} onChange={e => setAddedNote(e.target.value)} rows={2}
                placeholder="VD: Đã bổ sung thêm báo giá của 3 nhà cung cấp..."
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none placeholder-[color:var(--text-muted)]"
                style={{ background: '#f59e0b14', border: '1px solid #f59e0b40', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Nội dung đã chỉnh sửa (nếu có)
              </label>
              <textarea value={editedNote} onChange={e => setEditedNote(e.target.value)} rows={2}
                placeholder="VD: Đã giảm ngân sách đề xuất từ 10 triệu xuống còn 5 triệu..."
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none placeholder-[color:var(--text-muted)]"
                style={{ background: '#f59e0b14', border: '1px solid #f59e0b40', color: 'var(--text-primary)' }} />
            </div>
          </div>
        )}

        <div className="space-y-3.5">
          <div>
            <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Tên đề xuất *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="VD: Đề xuất ngân sách marketing Q4"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none placeholder-[color:var(--text-muted)]"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>

          {!editingProposal && (
            <>
              <div>
                <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Nhóm đề xuất *</label>
                <select value={groupName} onChange={e => setGroupName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  <option value="">-- Chọn nhóm --</option>
                  {PROPOSAL_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Phòng ban</label>
                  <div className="px-3 py-2.5 rounded-lg text-sm" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    {currentUser.department || '—'}
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Công ty</label>
                  <select value={company} onChange={e => setCompany(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    <option value="">--</option>
                    {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Mô tả ngắn *</label>
                  <input value={brief} onChange={e => setBrief(e.target.value)} placeholder="Tóm tắt 1 dòng"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none placeholder-[color:var(--text-muted)]"
                    style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Thời gian cần (ngày)</label>
                  <input type="number" min="0" step="0.5" value={days} onChange={e => setDays(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Mô tả dài (nội dung)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Mô tả ngắn gọn nội dung tờ trình..."
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none placeholder-[color:var(--text-muted)]"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>

                    {!editingProposal && (
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Tải file / hình ảnh lên (tối đa 5 file, mỗi file ≤ 10MB)</label>
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={e => {
                  const picked = Array.from(e.target.files ?? [])
                  const tooBig = picked.find(f => f.size > MAX_FILE_MB * 1024 * 1024)
                  if (tooBig) { setError(`File "${tooBig.name}" lớn hơn ${MAX_FILE_MB}MB. Hãy dùng link Drive cho file lớn.`); e.target.value = ''; return }
                  if (files.length + picked.length > MAX_FILES) { setError(`Tối đa ${MAX_FILES} file.`); e.target.value = ''; return }
                  setError('')
                  setFiles(prev => [...prev, ...picked])
                  e.target.value = ''
                }}
                className="w-full text-xs" style={{ color: 'var(--text-muted)' }} />
              {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between text-xs rounded-lg px-2 py-1" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-primary)' }}>
                      <span className="truncate">{f.name} ({(f.size / 1024 / 1024).toFixed(1)}MB)</span>
                      <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} style={{ color: '#dc2626' }}>✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Hoặc dán link Google Drive (file lớn)</label>
            <input value={driveUrl} onChange={e => setDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none placeholder-[color:var(--text-muted)]"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              💡 Nhớ bật chia sẻ "Bất kỳ ai có link đều xem được" trước khi dán vào đây.
            </p>
          </div>

          {editingProposal && (
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Nội dung đã bổ sung/chỉnh sửa so với lần trước *
              </label>
              <textarea value={revisionNote} onChange={e => setRevisionNote(e.target.value)} rows={3}
                placeholder="VD: Đã bổ sung số liệu quý 3, chỉnh lại mục ngân sách..."
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none placeholder-[color:var(--text-muted)]"
                style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>
          )}

                              {!editingProposal && (
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Chi phí dự kiến (nếu có)</label>
              {costItems.length > 0 && (
                <ul className="mb-2 space-y-1">
                  {costItems.map((x, i) => (
                    <li key={i} className="flex items-center justify-between text-xs rounded-lg px-2 py-1" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-primary)' }}>
                      <span className="truncate">{x.item}{x.cost ? ` · ${x.cost}` : ''} — {x.amount.toLocaleString('vi-VN')}</span>
                      <button type="button" onClick={() => setCostItems(prev => prev.filter((_, j) => j !== i))} style={{ color: '#dc2626' }}>✕</button>
                    </li>
                  ))}
                  <li className="text-xs font-bold px-2" style={{ color: 'var(--text-primary)' }}>
                    Tổng: {costItems.reduce((s, x) => s + x.amount, 0).toLocaleString('vi-VN')} VND
                  </li>
                </ul>
              )}
              <div className="flex gap-2 flex-wrap">
                <input value={ciItem} onChange={e => setCiItem(e.target.value)} placeholder="Hạng mục"
                  className="flex-1 min-w-[100px] px-2 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                <input value={ciCost} onChange={e => setCiCost(e.target.value)} placeholder="Chi phí (loại / ghi chú)"
                  className="flex-1 min-w-[100px] px-2 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                <input type="number" min="0" value={ciAmount} onChange={e => setCiAmount(e.target.value)} placeholder="Số tiền (VNĐ)"
                  className="w-24 px-2 py-2 rounded-lg text-xs outline-none"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                <button type="button"
                  onClick={() => {
                    if (!ciItem.trim() || ciAmount === '') return
                    setCostItems(prev => [...prev, { item: ciItem.trim(), cost: ciCost.trim(), amount: Number(ciAmount) }])
                    setCiItem(''); setCiCost(''); setCiAmount('')
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-white" style={{ background: '#0891b2' }}>Thêm</button>
              </div>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Có chi phí phát sinh sau này thì thêm ở trang chi tiết.</p>
            </div>
          )}
          {!editingProposal && (
            <>
              <div>
                <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Người duyệt đầu tiên (quản lý phòng ban của bạn) *</label>
                <select value={recipientId} disabled={myManagers.length === 1} onChange={e => setRecipientId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  {myManagers.length === 0 && <option value="">-- Chọn người duyệt --</option>}
                  {(myManagers.length > 0 ? myManagers : users.filter(u => u.id !== currentUser.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.name} — {u.department}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Người duyệt tiếp theo (không bắt buộc)</label>
                <ApproverPicker tone="dark" users={users} excludeIds={[currentUser.id, recipientId]} value={extraApprovers} onChange={setExtraApprovers} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Luồng phê duyệt</label>
                <select value={approvalMode} onChange={e => setApprovalMode(e.target.value as 'seq' | 'par')}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  <option value="seq">Nối tiếp (lần lượt)</option>
                  <option value="par">Song song (cùng lúc)</option>
                </select>
              </div>
            </>
          )}
          {editingProposal && (<>
          <div>
            <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Chọn phòng ban *</label>
            <select value={resubmitTeamId} onChange={e => { setResubmitTeamId(e.target.value); setRecipientId('') }}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <option value="">-- Chọn phòng ban --</option>
              {TEAMS.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
            </select>
          </div>

          {resubmitTeamId && (
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Chọn quản lý *</label>
              {managersInResubmitTeam.length === 0 ? (
                <p className="text-xs" style={{ color: '#dc2626' }}>Phòng ban này chưa có quản lý nào trong hệ thống.</p>
              ) : (
                <select value={recipientId} onChange={e => setRecipientId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  <option value="">-- Chọn quản lý --</option>
                  {managersInResubmitTeam.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              )}
            </div>
          )}
                    </>)}
          {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Hủy</button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
              {saving ? 'Đang gửi...' : editingProposal ? 'Gửi lại' : 'Gửi tờ trình'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ForwardApprovalModal({ proposal, currentUser, users, onClose }: {
  proposal: Proposal; currentUser: User; users: User[]; onClose: () => void
}) {
  const [teamId, setTeamId] = useState('')
  const [nextApproverId, setNextApproverId] = useState('')
  const [saving, setSaving] = useState(false)

  // Chỉ liệt kê những phòng ban thực sự có ít nhất 1 quản lý (khác chính mình)
  const teamsWithManagers = TEAMS.filter(t =>
    users.some(u => u.role === 'manager' && u.teamId === t.id && u.id !== currentUser.id)
  )

  // Sau khi chọn phòng ban, chỉ liệt kê quản lý của đúng phòng ban đó
  const managerCandidates = users.filter(u =>
    u.role === 'manager' && u.teamId === teamId && u.id !== currentUser.id
  )

  const handleTeamChange = (id: string) => {
    setTeamId(id)
    setNextApproverId('') // đổi phòng ban thì phải chọn lại quản lý
  }

  const handleForward = async () => {
    if (!nextApproverId) return
    setSaving(true)
    await supabase.from('proposals').update({
      recipient_id: nextApproverId,
      status: 'pending',
      participants: proposal.participants.includes(nextApproverId)
        ? proposal.participants
        : [...proposal.participants, nextApproverId],
    }).eq('id', proposal.id)

    await supabase.from('notifications').insert({
      message: `📜 ${currentUser.name} chuyển tờ trình "${proposal.title}" cho bạn duyệt tiếp theo`,
      target_user_id: nextApproverId,
      link_proposal_id: proposal.id,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
        <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
          📤 Mời người duyệt tiếp theo
        </h3>

        <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Phòng ban</label>
        <select value={teamId} onChange={e => handleTeamChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mb-4"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <option value="">-- Chọn phòng ban --</option>
          {teamsWithManagers.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
        </select>

        <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Quản lý</label>
        <select value={nextApproverId} onChange={e => setNextApproverId(e.target.value)} disabled={!teamId}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mb-4 disabled:opacity-40"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <option value="">{teamId ? '-- Chọn quản lý --' : 'Chọn phòng ban trước'}</option>
          {managerCandidates.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        {teamId && managerCandidates.length === 0 && (
          <p className="text-xs mb-4" style={{ color: '#f87171' }}>Phòng ban này chưa có quản lý khác để chọn.</p>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-muted)' }}>Hủy</button>
          <button onClick={handleForward} disabled={!nextApproverId || saving}
            className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
            {saving ? 'Đang gửi...' : 'Chuyển tiếp'}
          </button>
        </div>
      </div>
    </div>
  )
}

type TrackerStep = { id: string; proposal_id: string; approver_id: string; step_order: number; status: string }

function ProposalTracker({ proposals, users, approvals, kindTab, isMyTurn, onOpenDetail, onOpenDoc }: {
  proposals: Proposal[]; users: User[]; approvals: ProposalApproval[]; kindTab: 'totrinh' | 'dexuat'
  isMyTurn: (p: Proposal) => boolean; onOpenDetail: (p: Proposal) => void; onOpenDoc: (p: Proposal) => void
}) {
  const [steps, setSteps] = useState<TrackerStep[]>([])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'mine' | 'approved' | 'rejected' | 'overdue'>('all')
  const [, setClock] = useState(0)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('proposal_steps').select('*').order('step_order')
      setSteps((data ?? []) as TrackerStep[])
    }
    load()
    const ch = supabase.channel(`proposal-tracker-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposal_steps' }, () => { load() })
      .subscribe()
    const tick = setInterval(() => setClock(c => c + 1), 30000)
    return () => { supabase.removeChannel(ch); clearInterval(tick) }
  }, [])

  const nameOf = (id?: string) => users.find(u => u.id === id)?.name ?? '—'
  const groupOf = (p: Proposal) => p.groupName ?? (p.kind === 'totrinh' ? 'Tờ trình' : 'Đề xuất')
  const fmtDay = (s: string) => new Date(s).toLocaleDateString('vi-VN')
  const fmtSpan = (ms: number) => {
    const m = Math.max(0, Math.floor(ms / 60000))
    const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60
    return d > 0 ? `${d} ngày ${h} giờ` : h > 0 ? `${h} giờ ${mm} phút` : `${mm} phút`
  }
  const dueMs = (d?: string) => {
    if (!d) return NaN
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T23:59:59`).getTime() : new Date(d).getTime()
  }
  const isReview = (p: Proposal) => p.status === 'rejected' && !!p.rejectedReason?.startsWith('[REVIEW]')
  const stateOf = (p: Proposal): [string, string, string] => {
    if (p.status === 'pending') return ['⏳ Chờ duyệt', '#fbbf2422', '#d97706']
    if (isReview(p)) return ['🔁 Cần xem xét lại', '#fbbf2433', '#b45309']
    if (p.status === 'rejected') return ['❌ Bị từ chối', '#f8717122', '#dc2626']
    return ['✅ Đã duyệt', '#34d39922', '#059669']
  }
  const stepIcon = (s: string) =>
    s === 'approved' ? '✅' : s === 'pending' ? '⏳' : s === 'rejected' ? '❌' : s === 'revision' ? '🔁' : s === 'skipped' ? '⏭' : '○'

  const timeInfo = (p: Proposal): { text: string; color: string; over: boolean } => {
    const now = Date.now()
    const created = new Date(p.createdAt).getTime()
    if (p.status === 'pending') {
      const due = dueMs(p.dueDate)
      if (!Number.isNaN(due)) {
        if (due < now) return { text: `⚠️ Quá hạn ${fmtSpan(now - due)}`, color: '#dc2626', over: true }
        return { text: `Còn ${fmtSpan(due - now)} (hạn ${new Date(due).toLocaleDateString('vi-VN')})`, color: due - now < 86400000 ? '#d97706' : '#059669', over: false }
      }
      return { text: `Đã chờ ${fmtSpan(now - created)}`, color: 'var(--text-muted)', over: false }
    }
    const last = approvals.filter(a => a.proposalId === p.id).map(a => a.createdAt).sort().pop()
    if (last) {
      return { text: `${p.status === 'approved' ? 'Duyệt xong sau' : 'Xử lý sau'} ${fmtSpan(new Date(last).getTime() - created)}`, color: 'var(--text-muted)', over: false }
    }
    return { text: '—', color: 'var(--text-muted)', over: false }
  }

  const base = proposals.filter(p => (kindTab === 'totrinh' ? p.kind === 'totrinh' : p.kind !== 'totrinh'))
  const matchFilter = (p: Proposal, f: typeof filter) =>
    f === 'all' ? true
    : f === 'pending' ? p.status === 'pending'
    : f === 'mine' ? (p.status === 'pending' && isMyTurn(p))
    : f === 'approved' ? p.status === 'approved'
    : f === 'rejected' ? p.status === 'rejected'
    : timeInfo(p).over
  const rows = base
    .filter(p => !q.trim() || `${p.code ?? ''} ${p.title} ${nameOf(p.submittedBy)}`.toLowerCase().includes(q.trim().toLowerCase()))
    .filter(p => matchFilter(p, filter))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const th = 'px-2 py-2 text-xs font-bold text-white text-center border border-white/30 whitespace-nowrap'
  const td = 'px-2 py-2 text-xs align-top border'
  const cellBorder = { borderColor: 'var(--border)', color: 'var(--text-primary)' }
  const filters: [typeof filter, string][] = [
    ['all', 'Tất cả'], ['pending', 'Chờ duyệt'], ['mine', 'Cần tôi duyệt'], ['approved', 'Đã duyệt'], ['rejected', 'Từ chối'], ['overdue', 'Quá hạn'],
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 Tìm theo mã, tên hoặc người gửi..."
          className="flex-1 min-w-[220px] px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        {filters.map(([k, label]) => {
          const n = base.filter(p => matchFilter(p, k)).length
          const hot = (k === 'overdue' || k === 'mine') && n > 0
          return (
            <button key={k} type="button" onClick={() => setFilter(k)} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: filter === k ? '#7c3aed' : 'var(--bg-panel)', color: filter === k ? '#fff' : (hot ? (k === 'overdue' ? '#dc2626' : '#7c3aed') : 'var(--text-muted)'), border: '1px solid var(--border)' }}>
              {label} ({n})
            </button>
          )
        })}
      </div>

      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full border-collapse" style={{ minWidth: 1250 }}>
          <thead>
            <tr style={{ background: '#6d9eeb' }}>
              <th className={th} style={{ width: 44 }}>STT</th>
              <th className={th} style={{ width: 150 }}>Mã</th>
              <th className={th}>Tiêu đề</th>
              <th className={th} style={{ width: 130 }}>Nhóm</th>
              <th className={th} style={{ width: 130 }}>Người gửi</th>
              <th className={th} style={{ width: 95 }}>Ngày gửi</th>
              <th className={th} style={{ width: 260 }}>Tiến trình duyệt</th>
              <th className={th} style={{ width: 135, background: '#3c78d8' }}>Trạng thái</th>
              <th className={th} style={{ width: 200, background: '#cc4125' }}>Hạn / Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={9} className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Chưa có {kindTab === 'totrinh' ? 'tờ trình' : 'đề xuất'} nào khớp.
              </td></tr>
            )}
            {rows.map((p, i) => {
              const flow = steps.filter(s => s.proposal_id === p.id).sort((a, b) => a.step_order - b.step_order)
              const okCount = flow.filter(s => s.status === 'approved').length
              const [stLabel, stBg, stColor] = stateOf(p)
              const ti = timeInfo(p)
              return (
                <tr key={p.id} style={ti.over ? { background: '#dc262612' } : undefined}>
                  <td className={`${td} text-center`} style={cellBorder}>{i + 1}</td>
                  <td className={`${td} font-mono`} style={cellBorder}>{p.code ?? '—'}</td>
                  <td className={td} style={cellBorder}>
                    <button type="button" onClick={() => onOpenDetail(p)} className="text-left font-semibold underline" style={{ color: '#7c3aed' }}>{p.title}</button>
                    {(p.kind === 'totrinh' || p.kind === 'dntt') && (
                      <button type="button" onClick={() => onOpenDoc(p)} title={p.kind === 'dntt' ? 'Xem đề nghị thanh toán' : 'Xem tờ trình'} className="ml-2">📄</button>
                    )}
                  </td>
                  <td className={td} style={cellBorder}>{groupOf(p)}</td>
                  <td className={td} style={cellBorder}>{nameOf(p.submittedBy)}</td>
                  <td className={`${td} text-center`} style={cellBorder}>{fmtDay(p.createdAt)}</td>
                  <td className={td} style={cellBorder}>
                    {flow.length > 0 ? (
                      <>
                        <div className="text-[11px] font-semibold mb-1">{okCount}/{flow.length} đã duyệt</div>
                        <div className="flex flex-wrap gap-1">
                          {flow.map(s => (
                            <span key={s.id} className="text-[11px] px-1.5 py-0.5 rounded"
                              style={{ background: s.status === 'pending' ? '#fbbf2433' : 'var(--bg-card-alt)', fontWeight: s.status === 'pending' ? 700 : 400 }}>
                              {stepIcon(s.status)} {nameOf(s.approver_id)}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <span className="text-[11px]">→ {nameOf(p.recipientId)}</span>
                    )}
                  </td>
                  <td className={`${td} text-center`} style={cellBorder}>
                    <span className="px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap" style={{ background: stBg, color: stColor }}>{stLabel}</span>
                  </td>
                  <td className={`${td} text-center`} style={cellBorder}>
                    <span className="font-semibold" style={{ color: ti.color }}>{ti.text}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProposalsView({ currentUser, users, proposals, proposalApprovals, proposalRevisions, onJoinDiscussion, highlightProposalId, clearHighlightProposalId }: {
  currentUser: User; users: User[]; proposals: Proposal[]; proposalApprovals: ProposalApproval[]
  proposalRevisions: ProposalRevision[]
  onJoinDiscussion: (p: Proposal) => void
  highlightProposalId?: string | null; clearHighlightProposalId?: () => void
}) {
  const [showModal, setShowModal] = useState(false)
  const [forwardingProposal, setForwardingProposal] = useState<Proposal | null>(null)
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null)
  const [detailProposal, setDetailProposal] = useState<Proposal | null>(null)
  const [docProposal, setDocProposal] = useState<Proposal | null>(null)
  const [createKind, setCreateKind] = useState<'dexuat' | 'totrinh' | null>(null)
  const [createGroup, setCreateGroup] = useState<string | null>(null)
  const [listTab, setListTab] = useState<'totrinh' | 'dexuat'>('totrinh')
  const [viewMode, setViewMode] = useState<'list' | 'tracker'>('list')
  const [signingProposal, setSigningProposal] = useState<Proposal | null>(null)
  const [pendingMine, setPendingMine] = useState<string[]>([])
  const loadPendingMine = async () => {
    const { data } = await supabase.from('proposal_steps').select('proposal_id').eq('approver_id', currentUser.id).eq('status', 'pending')
    setPendingMine((data ?? []).map((s: any) => s.proposal_id))
  }
  useEffect(() => {
    loadPendingMine()
    const ch = supabase.channel(`steps-${currentUser.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposal_steps' }, () => { loadPendingMine() })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [currentUser.id, proposals])
  const isMyTurn = (p: Proposal) => p.recipientId === currentUser.id || pendingMine.includes(p.id)
  const getUserById = (id?: string) => users.find(u => u.id === id)
  const openByCode = (raw: string) => {
  const code = raw.trim().toUpperCase()
  const target = proposals.find(x => (x.code ?? '').toUpperCase() === code)
  if (!target) { alert(`Không tìm thấy tờ trình ${code}, hoặc bạn không có quyền xem.`); return }
  if (target.kind === 'totrinh' || target.kind === 'dntt') { setDetailProposal(null); setDocProposal(target) }
  else { setDocProposal(null); setDetailProposal(target) }
  }
  const proposalRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [flashProposalId, setFlashProposalId] = useState<string | null>(null)

  useEffect(() => {
    if (!highlightProposalId) return
    const tryScroll = () => {
      const el = proposalRefs.current[highlightProposalId]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setFlashProposalId(highlightProposalId)
        setTimeout(() => setFlashProposalId(prev => (prev === highlightProposalId ? null : prev)), 2500)
        clearHighlightProposalId?.()
      } else {
        setTimeout(tryScroll, 150)
      }
    }
    const t = setTimeout(tryScroll, 150)
    return () => clearTimeout(t)
  }, [highlightProposalId])

  const receivedAll = proposals.filter(p => isMyTurn(p))
  const sentAll = proposals.filter(p => p.submittedBy === currentUser.id)
    const processedAll = proposals.filter(p =>
    !isMyTurn(p) &&
    p.submittedBy !== currentUser.id &&
    proposalApprovals.some(a => a.proposalId === p.id && a.approverId === currentUser.id)
  )

    type StepRow = { id: string; approver_id: string; step_order: number; status: string }

  const loadSteps = async (proposalId: string): Promise<StepRow[]> => {
    const { data } = await supabase.from('proposal_steps').select('*').eq('proposal_id', proposalId).order('step_order')
    return (data ?? []) as StepRow[]
  }

   const handleApprove = async (p: Proposal, note?: string) => {
    const steps = await loadSteps(p.id)
    const mine = steps.find(s => s.approver_id === currentUser.id && s.status === 'pending')

    // Đề xuất cũ (chưa có luồng nhiều người): duyệt như trước
    if (!mine) {
      await supabase.from('proposals').update({ status: 'approved' }).eq('id', p.id)
      await supabase.from('proposal_approvals').insert({ proposal_id: p.id, approver_id: currentUser.id, action: 'approved', note: note || null })
      await supabase.from('notifications').insert({
        message: `✅ ${currentUser.name} đã duyệt tờ trình "${p.title}"`,
        target_user_id: p.submittedBy,
        link_proposal_id: p.id,
      })
      return
    }

    await supabase.from('proposal_steps').update({ status: 'approved', decided_at: new Date().toISOString(), note: note || null }).eq('id', mine.id)
    await supabase.from('proposal_approvals').insert({ proposal_id: p.id, approver_id: currentUser.id, action: 'approved', note: note || null })

    const rest = steps.filter(s => s.id !== mine.id)
    let nextStep: StepRow | undefined
    let allDone = false
    if ((p.approvalMode ?? 'seq') === 'par') {
      allDone = rest.every(s => s.status === 'approved')
    } else {
      nextStep = rest.filter(s => s.status === 'waiting').sort((a, b) => a.step_order - b.step_order)[0]
      allDone = !nextStep
    }

    if (allDone) {
      await supabase.from('proposals').update({ status: 'approved' }).eq('id', p.id)
      await supabase.from('notifications').insert({
        message: `✅ Tờ trình "${p.title}" đã được tất cả người duyệt thông qua`,
        target_user_id: p.submittedBy,
        link_proposal_id: p.id,
      })
    } else if (nextStep) {
      await supabase.from('proposal_steps').update({ status: 'pending' }).eq('id', nextStep.id)
      await supabase.from('proposals').update({
        recipient_id: nextStep.approver_id,
        participants: p.participants.includes(nextStep.approver_id) ? p.participants : [...p.participants, nextStep.approver_id],
      }).eq('id', p.id)
      await supabase.from('notifications').insert({
        message: `📜 Tờ trình "${p.title}" của ${getUserById(p.submittedBy)?.name} đã qua ${currentUser.name}, đến lượt bạn duyệt`,
        target_user_id: nextStep.approver_id,
        link_proposal_id: p.id,
      })
      await supabase.from('notifications').insert({
        message: `✅ ${currentUser.name} đã duyệt tờ trình "${p.title}", đã chuyển cho ${getUserById(nextStep.approver_id)?.name}`,
        target_user_id: p.submittedBy,
        link_proposal_id: p.id,
      })
    } else {
      await supabase.from('notifications').insert({
        message: `✅ ${currentUser.name} đã duyệt tờ trình "${p.title}" (còn chờ người duyệt khác)`,
        target_user_id: p.submittedBy,
        link_proposal_id: p.id,
      })
    }
    loadPendingMine()
  }

    const declineProposal = async (p: Proposal, kind: 'rejected' | 'revision', text: string) => {
    const steps = await loadSteps(p.id)
    const mine = steps.find(s => s.approver_id === currentUser.id && s.status === 'pending')
    if (mine) {
      await supabase.from('proposal_steps').update({ status: kind, decided_at: new Date().toISOString(), note: text || null }).eq('id', mine.id)
      const others = steps.filter(s => s.id !== mine.id && (s.status === 'waiting' || s.status === 'pending')).map(s => s.id)
      if (others.length > 0) await supabase.from('proposal_steps').update({ status: 'skipped' }).in('id', others)
    }
    const stored = kind === 'revision' ? `[REVIEW] ${text}` : text
    await supabase.from('proposals').update({ status: 'rejected', rejected_reason: stored }).eq('id', p.id)
    await supabase.from('proposal_approvals').insert({
      proposal_id: p.id, approver_id: currentUser.id, action: 'rejected', note: stored || null,
    })
    await supabase.from('notifications').insert({
      message: kind === 'revision'
        ? `🔁 ${currentUser.name} yêu cầu xem xét lại tờ trình "${p.title}"${text ? `: ${text}` : ''}`
        : `❌ ${currentUser.name} đã từ chối tờ trình "${p.title}"${text ? `: ${text}` : ''}`,
      target_user_id: p.submittedBy,
      link_proposal_id: p.id,
    })
    loadPendingMine()
  }

  const handleReject = async (p: Proposal, note?: string) => {
    const reason = note && note.trim() ? note.trim() : (window.prompt('Lý do từ chối:') ?? '')
    await declineProposal(p, 'rejected', reason)
  }

  const handleRequestReview = async (p: Proposal, note: string) => {
    await declineProposal(p, 'revision', note)
  }
  
  const tabList = (list: Proposal[]) =>
    list
      .filter(p => (listTab === 'totrinh' ? p.kind === 'totrinh' : p.kind !== 'totrinh'))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const received = tabList(receivedAll)
  const sent = tabList(sentAll)
  const processedByMe = tabList(processedAll)
  const relevant = Array.from(new Map([...receivedAll, ...sentAll, ...processedAll].map(p => [p.id, p] as [string, Proposal])).values())
  const countTotrinh = relevant.filter(p => p.kind === 'totrinh').length
  const countDexuat = relevant.length - countTotrinh
  const needTotrinh = receivedAll.filter(p => p.kind === 'totrinh' && p.status === 'pending').length
  const needDexuat = receivedAll.filter(p => p.kind !== 'totrinh' && p.status === 'pending').length

  const statusBadge = (p: Proposal) => {
    if (p.status === 'pending') return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: '#fbbf2422', color: '#d97706' }}>⏳ Chờ duyệt</span>
    if (p.status === 'rejected' && p.rejectedReason?.startsWith('[REVIEW]')) return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: '#fbbf2433', color: '#b45309' }}>🔁 Cần xem xét lại</span>
    if (p.status === 'rejected') return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: '#f8717122', color: '#dc2626' }}>❌ Bị từ chối</span>
    return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: '#34d39922', color: '#059669' }}>✅ Đã duyệt</span>
  }

  const ApprovalHistory = ({ p }: { p: Proposal }) => {
    const approvals = proposalApprovals.filter(a => a.proposalId === p.id)
    const revisions = proposalRevisions.filter(r => r.proposalId === p.id)
    const timeline = [
      ...approvals.map(a => ({ type: 'approval' as const, at: a.createdAt, data: a })),
      ...revisions.map(r => ({ type: 'revision' as const, at: r.createdAt, data: r })),
    ].sort((a, b) => a.at.localeCompare(b.at))
    if (timeline.length === 0) return null
    return (
      <div className="mt-2 pt-2 space-y-1.5" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Lịch sử duyệt</p>
        {timeline.map(item => {
          if (item.type === 'approval') {
            const a = item.data
            return (
              <div key={a.id} className="text-xs flex items-center gap-1.5">
                <span>{a.action === 'approved' ? '✅' : '❌'}</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {getUserById(a.approverId)?.name} ({TEAMS.find(t => t.id === getUserById(a.approverId)?.teamId)?.name})
                </span>
                <span style={{ color: 'var(--text-muted)' }}>· {new Date(a.createdAt).toLocaleString('vi-VN')}</span>
              </div>
            )
          }
          const r = item.data
          return (
            <div key={r.id} className="text-xs p-2 rounded-lg space-y-1" style={{ background: '#f59e0b10' }}>
              <div className="flex items-center gap-1.5">
                <span>📝</span>
                <span className="font-medium" style={{ color: '#b45309' }}>{getUserById(r.editedBy)?.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>đã gửi lại · {new Date(r.createdAt).toLocaleString('vi-VN')}</span>
              </div>
              {r.addedNote && <p style={{ color: 'var(--text-muted)' }}>➕ <b style={{ color: 'var(--text-primary)' }}>Đã bổ sung:</b> {r.addedNote}</p>}
              {r.editedNote && <p style={{ color: 'var(--text-muted)' }}>✏️ <b style={{ color: 'var(--text-primary)' }}>Đã chỉnh sửa:</b> {r.editedNote}</p>}
            </div>
          )
        })}
      </div>
    )
  }

  const ProposalCard = ({ p, showActions }: { p: Proposal; showActions?: boolean }) => (
    <div ref={el => { proposalRefs.current[p.id] = el }}
      className="rounded-xl p-4 transition-all"
      style={{
        background: flashProposalId === p.id ? '#7c3aed1a' : 'var(--bg-panel)',
        border: `1px solid ${flashProposalId === p.id ? '#7c3aed' : 'var(--border)'}`,
        boxShadow: flashProposalId === p.id ? '0 0 16px #7c3aed40' : 'none',
        transition: 'background 0.4s ease, border 0.4s ease, box-shadow 0.4s ease',
      }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{p.code && <span className="font-mono text-xs mr-2" style={{ color: 'var(--text-muted)' }}>[{p.code}]</span>}{p.title}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {getUserById(p.submittedBy)?.name} → {getUserById(p.recipientId)?.name}
          </p>
        </div>
        {statusBadge(p)}
      </div>
      <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.description}</p>
      <button type="button" onClick={() => setDetailProposal(p)}
        className="text-xs font-semibold mb-3 underline" style={{ color: '#7c3aed' }}>🔍 Xem chi tiết</button>
      {(p.kind === 'totrinh' || p.kind === 'dntt') && (
        <button type="button" onClick={() => setDocProposal(p)}
          className="text-xs font-semibold mb-3 ml-4 underline" style={{ color: '#059669' }}>
          {p.kind === 'dntt' ? '📄 Xem đề nghị thanh toán' : '📄 Xem tờ trình'}
        </button>
      )}
      {p.status === 'rejected' && p.rejectedReason && (
        p.rejectedReason.startsWith('[REVIEW]')
          ? <p className="text-xs mb-3" style={{ color: '#b45309' }}>🔁 Người duyệt yêu cầu xem xét lại: {p.rejectedReason.slice(8).trim()}</p>
          : <p className="text-xs mb-3" style={{ color: '#dc2626' }}>Lý do: {p.rejectedReason}</p>
      )}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {p.driveUrl && (
            <a href={p.driveUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs underline" style={{ color: '#3b82f6' }}>
              📁 Xem tài liệu đính kèm trên Drive
            </a>
          )}
          {(p.attachments ?? []).map(a => (
            <button key={a.path} type="button" onClick={() => openProposalFile(a.path)}
              title={a.at ? `Tải lên ${new Date(a.at).toLocaleString('vi-VN')}` : undefined}
              className="text-xs underline" style={{ color: '#3b82f6' }}>
              📎 {a.name}{(a.round ?? 0) > 0 && a.at ? ` (bổ sung lần ${a.round} · ${new Date(a.at).toLocaleString('vi-VN')})` : ''}
            </button>
          ))}
          {p.signedFileUrl && (
            <a href={p.signedFileUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs underline" style={{ color: '#0e7490' }}>
              🖊 Xem file đã ký
            </a>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => onJoinDiscussion(p)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#a78bfa22', color: '#8b5cf6' }}>
            💬 Tham gia thảo luận
          </button>
          {showActions && p.status === 'pending' && (
            <>
              <button onClick={() => handleReject(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#f8717122', color: '#dc2626' }}>
                Từ chối
              </button>
              <button onClick={() => handleApprove(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#34d39922', color: '#059669' }}>
                ✓ Duyệt
              </button>
            </>
          )}
          {p.submittedBy === currentUser.id && p.status === 'approved' && (
            <button onClick={() => setForwardingProposal(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#3b82f622', color: '#2563eb' }}>
              📤 Mời người duyệt tiếp theo
            </button>
          )}
          {p.submittedBy === currentUser.id && p.status === 'rejected' && (
            <button onClick={() => setEditingProposal(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#f59e0b22', color: '#b45309' }}>
              ✏️ Chỉnh sửa & Gửi lại
            </button>
          )}
          {isMyTurn(p) && (p.status === 'pending' || p.status === 'approved') && (
            <button onClick={() => setSigningProposal(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#0891b222', color: '#0e7490' }}>
              🖊 Ký tờ trình
            </button>
          )}
        </div>
      </div>
      <ApprovalHistory p={p} />
    </div>
  )

  return (
    <ProposalLinkContext.Provider value={openByCode}>
    <div className={`p-6 ${viewMode === 'tracker' ? 'max-w-7xl' : 'max-w-4xl'} mx-auto`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>📜 Tờ trình & Đề xuất</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{countTotrinh} tờ trình · {countDexuat} đề xuất</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 0 20px #7c3aed40' }}>
          + Tạo mới
        </button>
      </div>

            <div className="flex gap-2 mb-5">
        {([['totrinh', '📜 Tờ trình', countTotrinh, needTotrinh], ['dexuat', '📝 Đề xuất', countDexuat, needDexuat]] as const).map(([key, label, count, need]) => (
          <button key={key} type="button" onClick={() => setListTab(key)}
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{
              background: listTab === key ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : 'var(--bg-card-alt)',
              color: listTab === key ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}>
            {label} <span className="opacity-70">({count})</span>
            {need > 0 && <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white">{need}</span>}
          </button>
        ))}
        <div className="ml-auto flex gap-1.5">
          {([['list', '📋 Danh sách'], ['tracker', '📊 Tracker']] as const).map(([k, label]) => (
            <button key={k} type="button" onClick={() => setViewMode(k)} className="px-3 py-2 rounded-xl text-sm font-semibold"
              style={{ background: viewMode === k ? '#0891b2' : 'var(--bg-card-alt)', color: viewMode === k ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {viewMode === 'tracker' ? (
        <ProposalTracker
          proposals={currentUser.isDirector ? proposals : relevant}
          users={users} approvals={proposalApprovals} kindTab={listTab}
          isMyTurn={isMyTurn} onOpenDetail={setDetailProposal} onOpenDoc={setDocProposal} />
      ) : (<>
      {received.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>📥 Cần bạn duyệt</h3>
          <div className="space-y-3">{received.map(p => <ProposalCard key={p.id} p={p} showActions />)}</div>
        </div>
      )}

      {sent.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>📨 Đã gửi</h3>
          <div className="space-y-3">{sent.map(p => <ProposalCard key={p.id} p={p} />)}</div>
        </div>
      )}

      {processedByMe.length > 0 && (
        <div>
          <h3 className="font-bold mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>✅ Đã xử lý (đã chuyển tiếp)</h3>
          <div className="space-y-3">{processedByMe.map(p => <ProposalCard key={p.id} p={p} />)}</div>
        </div>
      )}

      {received.length === 0 && sent.length === 0 && processedByMe.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">📜</div>
          <div className="text-sm">Chưa có {listTab === 'totrinh' ? 'tờ trình' : 'đề xuất'} nào</div>
        </div>
      )}
      </>)}

      {showModal && !createKind && (
        <ProposalKindPicker onPick={k => { setCreateGroup(null); setCreateKind(k) }}
          onClose={() => setShowModal(false)} />
      )}
      {showModal && createKind === 'dexuat' && !createGroup && (
        <ProposalGroupPicker onPick={g => setCreateGroup(g)} onBack={() => setCreateKind(null)}
          onClose={() => { setShowModal(false); setCreateKind(null); setCreateGroup(null) }} />
      )}
      {showModal && createKind === 'dexuat' && createGroup && createGroup !== 'Đề nghị thanh toán' && (
        <ProposalModal kind="dexuat" initialGroup={createGroup === 'Khác' ? '' : createGroup} currentUser={currentUser} users={users}
          onClose={() => { setShowModal(false); setCreateKind(null); setCreateGroup(null) }} />
      )}
      {showModal && createKind === 'dexuat' && createGroup === 'Đề nghị thanh toán' && (
        <ProposalDnttForm currentUser={currentUser} users={users}
          onClose={() => { setShowModal(false); setCreateKind(null); setCreateGroup(null) }} />
      )}
      {showModal && createKind === 'totrinh' && (
        <ProposalDocForm currentUser={currentUser} users={users}
          onClose={() => { setShowModal(false); setCreateKind(null); setCreateGroup(null) }} />
      )}
              {detailProposal && (
        <ProposalDetailModal
          proposal={proposals.find(x => x.id === detailProposal.id) ?? detailProposal}
          users={users} currentUser={currentUser} approvals={proposalApprovals} revisions={proposalRevisions}
          onClose={() => setDetailProposal(null)} />
      )}
      {docProposal && (() => {
        const cur = proposals.find(x => x.id === docProposal.id) ?? docProposal
        const common = {
          p: cur, users, currentUserId: currentUser.id, onClose: () => setDocProposal(null),
          canAct: isMyTurn(cur) && cur.status === 'pending',
          onApprove: async (note: string) => { await handleApprove(cur, note) },
          onReject: async (note: string) => { await handleReject(cur, note) },
          onRequestReview: async (note: string) => { await handleRequestReview(cur, note) },
        }
        return cur.kind === 'dntt' ? <ProposalDnttView {...common} /> : <ProposalDocView {...common} />
      })()}
      {editingProposal && (
        <ProposalModal currentUser={currentUser} users={users} editingProposal={editingProposal} onClose={() => setEditingProposal(null)} />
      )}
      {forwardingProposal && (
        <ForwardApprovalModal proposal={forwardingProposal} currentUser={currentUser} users={users} onClose={() => setForwardingProposal(null)} />
      )}
      {signingProposal && (
        <SignDocumentModal currentUser={currentUser} proposal={signingProposal} onClose={() => setSigningProposal(null)} />
      )}
    </div>
    </ProposalLinkContext.Provider>
  )
}
function ProfileView({ currentUser, setCurrentUser, tasks }: {
  currentUser: User; setCurrentUser: (u: User) => void; tasks: Task[]
}) {
  const [editing, setEditing] = useState(false)
  const [draftAvatar, setDraftAvatar] = useState<AvatarConfig>(currentUser.avatar)
  const [draftName, setDraftName] = useState(currentUser.name)
  const [driveDraft, setDriveDraft] = useState(currentUser.driveFolderUrl ?? '')
  const [driveSaved, setDriveSaved] = useState(false)

  const { progress, needed, level } = getExpProgress(currentUser.exp)
  const myDone = tasks.filter(t => t.status === 'completed' && (t.assignedTo.includes(currentUser.id) || (t.selfCreated && t.createdBy === currentUser.id)))
  const selfMade = tasks.filter(t => t.selfCreated && t.createdBy === currentUser.id)

  const achievements = [
    { name: 'Người Mới', desc: 'Task đầu tiên', icon: '🌟', ok: myDone.length >= 1 },
    { name: 'Chăm Chỉ', desc: '5 task xong', icon: '💪', ok: myDone.length >= 5 },
    { name: 'Task Master', desc: '20 task xong', icon: '🏆', ok: myDone.length >= 20 },
    { name: 'EXP Hunter', desc: '1000 EXP', icon: '⚡', ok: currentUser.exp >= 1000 },
    { name: 'Level 5!', desc: 'Đạt Level 5', icon: '🚀', ok: level >= 5 },
    { name: 'Self Starter', desc: 'Tự tạo 3 task', icon: '🎯', ok: selfMade.length >= 3 },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Left */}
        <div className="space-y-4">
          <div className="rounded-2xl p-6 text-center"
            style={{ background: `linear-gradient(135deg, ${currentUser.avatar.outfitColor}18, var(--bg-panel))`, border: `1px solid ${currentUser.avatar.outfitColor}30` }}>
            <div className="w-28 h-28 mx-auto mb-3 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{ background: `${currentUser.avatar.outfitColor}20`, border: `2px solid ${currentUser.avatar.outfitColor}40`, boxShadow: `0 0 30px ${currentUser.avatar.outfitColor}30` }}>
              <FullAvatar avatar={currentUser.avatar} name={currentUser.name} size={108} />
            </div>
            <h3 className="font-bold text-xl mb-0.5" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>{currentUser.name}</h3>
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{currentUser.department}</p>
            <div className="flex justify-center mb-3"><LevelBadge exp={currentUser.exp} /></div>
            <div className="text-amber-500 text-2xl font-black mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{currentUser.exp.toLocaleString()} EXP</div>
            <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Cần {needed} EXP → Lv.{level + 1}</div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#f59e0b)' }} />
            </div>
            <button onClick={() => { setDraftAvatar(currentUser.avatar); setDraftName(currentUser.name); setEditing(!editing) }}
              className="mt-4 w-full py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: editing ? '#7c3aed' : 'var(--bg-card-alt)', color: editing ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {editing ? '↑ Đóng' : '📷 Đổi tên & ảnh đại diện'}
            </button>
            <button
              onClick={async () => {
                if (!window.confirm('Đăng xuất khỏi tài khoản?')) return
                await supabase.auth.signOut()
              }}
              className="mt-2 w-full py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: '#f8717118', color: '#dc2626', border: '1px solid #f8717130' }}>
              🚪 Đăng xuất
            </button>
          </div>

          {/* Stats */}
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
            <h4 className="font-bold mb-3 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>📊 Thống kê</h4>
            {[
              ['Task hoàn thành', myDone.length],
              ['Đang làm', tasks.filter(t => t.status === 'in-progress' && t.assignedTo.includes(currentUser.id)).length],
              ['Task tự tạo', selfMade.length],
              ['Cấp độ', `Lv.${level}`],
            ].map(([lbl, val]) => (
              <div key={lbl as string} className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{lbl}</span>
                <span className="text-sm font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>{val}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: '#a78bfa18', color: '#8b5cf6', border: '1px solid #a78bfa30' }}>
                {currentUser.role === 'manager' ? '👑 Quản Lý' : '⚔️ Nhân Viên'}
              </span>
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: '#60a5fa18', color: '#3b82f6', border: '1px solid #60a5fa30' }}>
                🏢 {TEAMS.find(t => t.id === currentUser.teamId)?.name ?? 'Chưa có team'}
              </span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="col-span-2 space-y-4">
          {currentUser.role === 'manager' && (
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
              <h4 className="font-bold mb-1 flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
                📁 Thư mục nộp task (Google Drive)
              </h4>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Nhân viên sẽ được dẫn tới link này để tải file kết quả lên khi nộp task cho bạn.
              </p>
              <input value={driveDraft} onChange={e => setDriveDraft(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mb-2"
                style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] leading-relaxed flex-1" style={{ color: 'var(--text-muted)' }}>
                  💡 Bật chia sẻ "Bất kỳ ai có link đều chỉnh sửa được" cho thư mục này.
                </p>
                <button onClick={async () => {
                  await supabase.from('profiles').update({ drive_folder_url: driveDraft.trim() || null }).eq('id', currentUser.id)
                  setCurrentUser({ ...currentUser, driveFolderUrl: driveDraft.trim() || undefined })
                  setDriveSaved(true)
                  setTimeout(() => setDriveSaved(false), 2000)
                }}
                  className="px-4 py-2 rounded-lg font-bold text-white text-xs flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>
                  {driveSaved ? '✓ Đã lưu' : 'Lưu link'}
                </button>
              </div>
            </div>
          )}

          <div className="rounded-xl p-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
            <h4 className="font-bold mb-1 flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
              🖊 Chữ ký của tôi
            </h4>
            <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Tải ảnh chữ ký tay đã crop gọn (nền trắng) để dùng khi ký tờ trình.
            </p>
            {currentUser.signatureUrl && (
              <div className="flex items-center gap-3 mb-3">
                <img src={currentUser.signatureUrl} alt="chữ ký" className="h-14 rounded-lg"
                  style={{ background: '#fff', border: '1px solid var(--border)', padding: 4 }} />
                <button onClick={async () => {
                  await supabase.from('profiles').update({ signature_url: null }).eq('id', currentUser.id)
                  setCurrentUser({ ...currentUser, signatureUrl: undefined })
                }} className="text-xs" style={{ color: '#dc2626' }}>Xoá chữ ký</button>
              </div>
            )}
            <input type="file" accept="image/*" onChange={async e => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = async ev => {
                const dataUrl = ev.target?.result as string
                await supabase.from('profiles').update({ signature_url: dataUrl }).eq('id', currentUser.id)
                setCurrentUser({ ...currentUser, signatureUrl: dataUrl })
              }
              reader.readAsDataURL(file)
            }} className="text-xs" style={{ color: 'var(--text-muted)' }} />
          </div>

          {editing && (
            <div className="rounded-xl p-4 animate-slide-up" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
              <h4 className="font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>📷 Tên & ảnh đại diện</h4>

              <div className="mb-4">
                <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Tên hiển thị</label>
                <input value={draftName} onChange={e => setDraftName(e.target.value)} maxLength={40}
                  placeholder="Nhập tên bạn muốn hiển thị..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>

              <AvatarCreator value={draftAvatar} onChange={setDraftAvatar} name={draftName} />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Hủy</button>
                <button onClick={async () => {
                  const trimmed = draftName.trim() || currentUser.name
                  await supabase.from('profiles').update({ name: trimmed, avatar: draftAvatar }).eq('id', currentUser.id)
                  setCurrentUser({ ...currentUser, name: trimmed, avatar: draftAvatar })
                  setEditing(false)
                }}
                  className="flex-1 py-2.5 rounded-lg font-bold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>Lưu thay đổi</button>
              </div>
            </div>
          )}

          <div className="rounded-xl p-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
            <h4 className="font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>🏅 Thành Tích</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.map(a => (
                <div key={a.name} className="p-3 rounded-xl text-center"
                  style={{ background: a.ok ? '#f59e0b12' : 'var(--bg-card-alt)', border: `1px solid ${a.ok ? '#f59e0b30' : 'var(--border)'}`, opacity: a.ok ? 1 : 0.5 }}>
                  <div className="text-2xl mb-2" style={{ filter: a.ok ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
                  <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{a.name}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{a.desc}</div>
                  {a.ok && <div className="mt-1.5 text-amber-500 text-[10px]">✓ Đạt được</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== PROJECTS ====================

const PROJECT_COMPANIES = ['KNI', 'GENKI', 'FIRSTSTEPS', 'ACVN', 'AMERYS']
const PROJECT_STATUS: Record<string, [string, string, string]> = {
  planning: ['Lập kế hoạch', '#3b82f622', '#2563eb'],
  active: ['Đang chạy', '#34d39922', '#059669'],
  on_hold: ['Tạm dừng', '#f59e0b22', '#b45309'],
  done: ['Hoàn thành', '#8b5cf622', '#7c3aed'],
  closed: ['Đóng', '#64748b22', '#64748b'],
}
const PROJECT_RISK: Record<string, [string, string]> = {
  low: ['Thấp', '#059669'], medium: ['Trung bình', '#b45309'], high: ['Cao', '#dc2626'],
}

interface Project {
  id: string
  code: string
  name: string
  company?: string
  cls: string
  status: string
  priority: string
  objective?: string
  description?: string
  ownerId?: string
  managerId?: string
  teamId?: string
  affected?: string
  plannedStart?: string
  plannedEnd?: string
  budget: number
  supplierName?: string
  supplierRef?: string
  riskLevel: string
  createdBy?: string
  createdAt: string
  memberIds: string[]
}

function mapDbProject(p: any, memberIds: string[]): Project {
  return {
    id: p.id, code: p.code ?? '', name: p.name, company: p.company ?? undefined, cls: p.class ?? 'project',
    status: p.status ?? 'planning', priority: p.priority ?? 'P3', objective: p.objective ?? undefined,
    description: p.description ?? undefined, ownerId: p.owner_id ?? undefined, managerId: p.manager_id ?? undefined,
    teamId: p.team_id ?? undefined, affected: p.affected ?? undefined, plannedStart: p.planned_start ?? undefined,
    plannedEnd: p.planned_end ?? undefined, budget: Number(p.budget) || 0, supplierName: p.supplier_name ?? undefined,
    supplierRef: p.supplier_ref ?? undefined, riskLevel: p.risk_level ?? 'medium', createdBy: p.created_by ?? undefined,
    createdAt: p.created_at, memberIds,
  }
}

function ProjectMemberPicker({ users, excludeIds, value, onChange }: {
  users: User[]; excludeIds: string[]; value: string[]; onChange: (v: string[]) => void
}) {
  const [teamId, setTeamId] = useState('')
  const [q, setQ] = useState('')
  const box = { background: '#ffffff', border: '1px solid #d1d5db', color: '#111827' }
  const pool = users.filter(u => !excludeIds.includes(u.id) && !value.includes(u.id))
  const query = q.trim().toLowerCase()
  const shown = query ? pool.filter(u => u.name.toLowerCase().includes(query)) : teamId ? pool.filter(u => u.teamId === teamId) : []
  const teamName = (u?: User) => TEAMS.find(t => t.id === u?.teamId)?.name ?? u?.department ?? ''
  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(id => {
            const u = users.find(x => x.id === id)
            return (
              <span key={id} className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5" style={box}>
                {u?.name} <span className="text-gray-500">· {teamName(u)}</span>
                <button type="button" onClick={() => onChange(value.filter(x => x !== id))} style={{ color: '#dc2626' }}>✕</button>
              </span>
            )
          })}
        </div>
      )}
      <div className="flex gap-2">
        <select value={teamId} onChange={e => { setTeamId(e.target.value); setQ('') }} className="flex-1 rounded px-2 py-1.5 text-xs outline-none" style={box}>
          <option value="">-- Chọn phòng ban --</option>
          {TEAMS.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
        </select>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="hoặc gõ tên để tìm" className="flex-1 rounded px-2 py-1.5 text-xs outline-none" style={box} />
      </div>
      {(teamId || query) && (
        <div className="flex flex-wrap gap-1.5">
          {shown.length === 0 && <span className="text-xs text-gray-500">Không có ai phù hợp.</span>}
          {shown.map(u => (
            <button key={u.id} type="button" onClick={() => onChange([...value, u.id])} className="text-xs px-2.5 py-1 rounded-full" style={box}>
              ＋ {u.name}{u.role === 'manager' ? ' (Quản lý)' : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectForm({ currentUser, users, onClose, onCreated }: {
  currentUser: User; users: User[]; onClose: () => void; onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [cls, setCls] = useState('project')
  const [priority, setPriority] = useState('P3')
  const [status, setStatus] = useState('planning')
  const [objective, setObjective] = useState('')
  const [description, setDescription] = useState('')
  const [ownerId, setOwnerId] = useState('')
  const [managerId, setManagerId] = useState(currentUser.id)
  const [teamId, setTeamId] = useState(currentUser.teamId)
  const [members, setMembers] = useState<string[]>([])
  const [affected, setAffected] = useState('')
  const [plannedStart, setPlannedStart] = useState('')
  const [plannedEnd, setPlannedEnd] = useState('')
  const [budget, setBudget] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [supplierRef, setSupplierRef] = useState('')
  const [riskLevel, setRiskLevel] = useState('medium')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const box = 'w-full border border-gray-300 rounded px-2 py-1.5 bg-white text-sm outline-none focus:border-blue-500'
  const ink = { color: '#111827' }
  const label = 'block text-xs font-semibold text-gray-600 mb-1'
  const userOptions = (
    <>
      <option value="">-- Chọn --</option>
      {TEAMS.map(t => {
        const list = users.filter(u => u.teamId === t.id)
        return list.length === 0 ? null : (
          <optgroup key={t.id} label={`${t.emoji} ${t.name}`}>
            {list.map(u => <option key={u.id} value={u.id}>{u.name}{u.role === 'manager' ? ' (Quản lý)' : ''}</option>)}
          </optgroup>
        )
      })}
    </>
  )

  const submit = async () => {
    if (!name.trim()) { setError('Vui lòng nhập tên dự án.'); return }
    if (!company) { setError('Vui lòng chọn công ty.'); return }
    if (!managerId) { setError('Vui lòng chọn quản lý dự án.'); return }
    if (plannedStart && plannedEnd && plannedEnd < plannedStart) { setError('Ngày kết thúc phải sau ngày bắt đầu.'); return }
    setSaving(true); setError('')
    const now = new Date()
    const ds = String(now.getDate()).padStart(2, '0') + String(now.getMonth() + 1).padStart(2, '0') + String(now.getFullYear()).slice(-2)
    const prefix = `PTASK${ds}-`
    let created: any = null
    let insertError: any = null
    for (let i = 0; i < 3; i++) {
      const { data: sameDay } = await supabase.from('projects').select('code').like('code', `${prefix}%`)
      const maxN = (sameDay ?? []).reduce((m: number, r: any) => Math.max(m, parseInt(String(r.code).slice(prefix.length), 10) || 0), 0)
      const code = `${prefix}${String(maxN + 1 + i).padStart(2, '0')}`
      const res = await supabase.from('projects').insert({
        code, name: name.trim(), company, class: cls, status, priority,
        objective: objective.trim() || null, description: description.trim() || null,
        owner_id: ownerId || null, manager_id: managerId, team_id: teamId || null,
        affected: affected.trim() || null, planned_start: plannedStart || null, planned_end: plannedEnd || null,
        budget: Number(budget) || 0, supplier_name: supplierName.trim() || null, supplier_ref: supplierRef.trim() || null,
        risk_level: riskLevel, created_by: currentUser.id,
      }).select('id').single()
      created = res.data; insertError = res.error
      if (!insertError || insertError.code !== '23505') break
    }
    if (insertError || !created) { setSaving(false); setError(insertError?.message ?? 'Không tạo được dự án.'); return }
    const memberIds = Array.from(new Set([managerId, ...(ownerId ? [ownerId] : []), ...members]))
    await supabase.from('project_members').insert(memberIds.map(uid => ({ project_id: created.id, user_id: uid, role: uid === managerId ? 'manager' : 'member' })))
    setSaving(false)
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#d1d5db' }}>
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5" style={{ background: '#f9fafb', borderBottom: '1px solid #d1d5db' }}>
        <span className="text-sm font-bold text-gray-800">🗂️ Tạo dự án mới</span>
        <button type="button" onClick={onClose} className="text-gray-500 text-lg px-2">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[860px] mx-auto my-4 bg-white shadow-xl p-6 sm:p-8 space-y-5 text-[13px]" style={ink}>
          <div>
            <label className={label}>Tên dự án *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="VD: Nâng cấp hạ tầng mạng văn phòng ACVN Hà Nội" className={box} style={ink} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={label}>Công ty *</label>
              <select value={company} onChange={e => setCompany(e.target.value)} className={box} style={ink}>
                <option value="">-- Chọn --</option>
                {PROJECT_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Loại</label>
              <select value={cls} onChange={e => setCls(e.target.value)} className={box} style={ink}>
                <option value="project">Dự án (Project)</option>
                <option value="bau">Vận hành thường xuyên (BAU)</option>
              </select>
            </div>
            <div>
              <label className={label}>Ưu tiên</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className={box} style={ink}>
                {['P1', 'P2', 'P3', 'P4'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Trạng thái</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className={box} style={ink}>
                {Object.entries(PROJECT_STATUS).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={label}>Mục tiêu và lý do thực hiện</label>
            <textarea value={objective} onChange={e => setObjective(e.target.value)} rows={3} className={`${box} resize-none`} style={ink}
              placeholder="Lợi ích mang lại có vượt trội rủi ro không? Mục tiêu cần đạt?" />
          </div>
          <div>
            <label className={label}>Mô tả chi tiết</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={`${box} resize-none`} style={ink} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={label}>Người yêu cầu / chủ dự án</label>
              <select value={ownerId} onChange={e => setOwnerId(e.target.value)} className={box} style={ink}>{userOptions}</select>
            </div>
            <div>
              <label className={label}>Quản lý dự án (PM) *</label>
              <select value={managerId} onChange={e => setManagerId(e.target.value)} className={box} style={ink}>{userOptions}</select>
            </div>
            <div>
              <label className={label}>Phòng ban chịu trách nhiệm chính</label>
              <select value={teamId} onChange={e => setTeamId(e.target.value)} className={box} style={ink}>
                <option value="">-- Chọn --</option>
                {TEAMS.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={label}>Thành viên tham gia (chọn phòng ban rồi chọn người)</label>
            <ProjectMemberPicker users={users} excludeIds={[managerId, ownerId]} value={members} onChange={setMembers} />
          </div>
          <div>
            <label className={label}>Công ty / khách hàng bị ảnh hưởng</label>
            <input value={affected} onChange={e => setAffected(e.target.value)} className={box} style={ink} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={label}>Dự kiến bắt đầu</label>
              <input type="date" value={plannedStart} onChange={e => setPlannedStart(e.target.value)} className={box} style={ink} />
            </div>
            <div>
              <label className={label}>Dự kiến kết thúc</label>
              <input type="date" value={plannedEnd} onChange={e => setPlannedEnd(e.target.value)} className={box} style={ink} />
            </div>
            <div>
              <label className={label}>Ngân sách (VNĐ)</label>
              <input type="number" min="0" value={budget} onChange={e => setBudget(e.target.value)} className={box} style={ink} />
            </div>
            <div>
              <label className={label}>Mức rủi ro</label>
              <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} className={box} style={ink}>
                {Object.entries(PROJECT_RISK).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={label}>Nhà cung cấp (nếu có)</label>
              <input value={supplierName} onChange={e => setSupplierName(e.target.value)} className={box} style={ink} />
            </div>
            <div>
              <label className={label}>Mã tham chiếu nhà cung cấp</label>
              <input value={supplierRef} onChange={e => setSupplierRef(e.target.value)} className={box} style={ink} />
            </div>
          </div>
          <p className="text-xs text-gray-500">Mã dự án <b>PTASKngàytháng năm-số thứ tự</b> (ví dụ PTASK201026-01) sẽ tự sinh khi lưu.</p>
        </div>
      </div>
      <div className="shrink-0 px-4 py-3 flex items-center justify-end gap-3" style={{ background: '#f9fafb', borderTop: '1px solid #d1d5db' }}>
        {error && <span className="text-xs text-red-600 mr-auto">{error}</span>}
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600">Hủy</button>
        <button type="button" onClick={submit} disabled={saving}
          className="px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
          {saving ? 'Đang lưu...' : 'Tạo dự án'}
        </button>
      </div>
    </div>
  )
}

// Mã task con: TASK-<mã dự án>.<số thứ tự>, ví dụ TASK-PTASK201026-01.1
async function generateProjectTaskCode(projectId: string, projectCode: string, skip = 0): Promise<string> {
  const prefix = `TASK-${projectCode}.`
  const { data } = await supabase.from('tasks').select('task_code').eq('project_id', projectId)
  let maxN = 0
  ;(data ?? []).forEach((r: any) => {
    const c = String(r.task_code ?? '')
    if (!c.startsWith(prefix)) return
    const n = parseInt(c.slice(prefix.length), 10)
    if (!Number.isNaN(n) && n > maxN) maxN = n
  })
  return `${prefix}${maxN + 1 + skip}`
}

function ProjectTaskForm({ project, users, currentUser, canAssign, onClose }: {
  project: Project; users: User[]; currentUser: User; canAssign: boolean; onClose: () => void
}) {
  const todayStr = new Date().toISOString().split('T')[0]
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignees, setAssignees] = useState<string[]>(canAssign ? [] : [currentUser.id])
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [exp, setExp] = useState(getExpRange('medium', false, false).suggested)
  const [startDate, setStartDate] = useState(todayStr)
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const inp = { background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }
  const lab = 'text-xs font-semibold mb-1 block'
  const nameOf = (id: string) => users.find(u => u.id === id)?.name ?? id
  const range = getExpRange(priority, false, false)
  const memberUsers = users.filter(u => project.memberIds.includes(u.id))
  const otherUsers = users.filter(u => !project.memberIds.includes(u.id))

  const changePriority = (p: TaskPriority) => { setPriority(p); setExp(getExpRange(p, false, false).suggested) }

  const submit = async () => {
    if (!title.trim()) { setError('Vui lòng nhập tên task.'); return }
    if (assignees.length === 0) { setError('Vui lòng chọn ít nhất một người phụ trách.'); return }
    if (dueDate && dueDate < startDate) { setError('Hạn hoàn thành phải sau ngày bắt đầu.'); return }
    if (exp < range.min || exp > range.max) {
      setError(`Điểm EXP phải nằm trong khoảng ${range.min}–${range.max} cho mức độ "${PRIORITY_CONFIG[priority].label}".`)
      return
    }
    setSaving(true); setError('')
    const creatingForSelf = !canAssign
    const finalDue = dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

    let newTask: any = null
    let lastError: any = null
    let code = ''
    for (let i = 0; i < 3; i++) {
      code = await generateProjectTaskCode(project.id, project.code, i)
      const res = await supabase.from('tasks').insert({
        title: title.trim(), description: description.trim(), exp_reward: exp,
        task_code: code, project_id: project.id,
        work_status: 'received', status: 'open',
        assigned_to: assignees,
        project_manager: project.managerId ? [project.managerId] : [],
        supporters: [],
        created_by: currentUser.id,
        start_date: startDate, due_date: finalDue,
        category: 'development', priority, self_created: creatingForSelf,
        important: false, urgent: false, is_team_project: false,
        cross_dept_pending: false, target_team_id: null,
        creation_approval: creatingForSelf && currentUser.role === 'employee' ? 'pending' : 'approved',
        drive_folder_created: false, drive_folder_name: null,
      }).select('id').single()
      newTask = res.data; lastError = res.error
      if (!lastError || lastError.code !== '23505') break
    }
    if (lastError || !newTask) { setSaving(false); setError(lastError?.message ?? 'Không tạo được task.'); return }

    // Người được giao mà chưa là thành viên thì tự thêm vào dự án
    const missing = assignees.filter(uid => !project.memberIds.includes(uid))
    if (missing.length > 0) {
      await supabase.from('project_members').insert(missing.map(uid => ({ project_id: project.id, user_id: uid, role: 'member' })))
    }

    // Thông báo: người được giao và quản lý dự án
    const where = `trong dự án [${project.code}] ${project.name}`
    const notified = new Set<string>()
    if (canAssign) {
      for (const uid of assignees) {
        if (uid === currentUser.id) continue
        notified.add(uid)
        await supabase.from('notifications').insert({
          message: `📋 ${currentUser.name} vừa giao task [${code}] cho bạn ${where}: ${title.trim()}`,
          target_user_id: uid, link_task_id: newTask.id,
        })
      }
    }
    if (project.managerId && project.managerId !== currentUser.id && !notified.has(project.managerId)) {
      await supabase.from('notifications').insert({
        message: creatingForSelf
          ? `🎯 ${currentUser.name} vừa tự tạo task [${code}] ${where} và đang chờ bạn duyệt trước khi làm: ${title.trim()}`
          : `🗂️ ${currentUser.name} vừa tạo task [${code}] ${where}, giao cho ${assignees.map(nameOf).join(', ')}: ${title.trim()}`,
        target_user_id: project.managerId, link_task_id: newTask.id,
      })
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-5" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>＋ Thêm task vào dự án</h3>
          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          <span className="font-mono">[{project.code}]</span> {project.name} · mã task sẽ là <b>TASK-{project.code}.số</b> (tự sinh khi lưu)
        </p>
        <div className="space-y-3">
          <div>
            <label className={lab} style={{ color: 'var(--text-muted)' }}>Tên task *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inp} />
          </div>
          <div>
            <label className={lab} style={{ color: 'var(--text-muted)' }}>Mô tả</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={inp} />
          </div>

          <div>
            <label className={lab} style={{ color: 'var(--text-muted)' }}>Người phụ trách *</label>
            {canAssign ? (
              <>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {assignees.map(id => (
                    <span key={id} className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-primary)' }}>
                      {nameOf(id)}
                      <button type="button" onClick={() => setAssignees(a => a.filter(x => x !== id))} style={{ color: '#dc2626' }}>✕</button>
                    </span>
                  ))}
                </div>
                <select value="" onChange={e => { const v = e.target.value; if (v && !assignees.includes(v)) setAssignees(a => [...a, v]) }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inp}>
                  <option value="">＋ Thêm người phụ trách...</option>
                  {memberUsers.length > 0 && (
                    <optgroup label="⭐ Thành viên dự án">
                      {memberUsers.map(u => <option key={u.id} value={u.id}>{u.name}{u.role === 'manager' ? ' (Quản lý)' : ''}</option>)}
                    </optgroup>
                  )}
                  {TEAMS.map(t => {
                    const list = otherUsers.filter(u => u.teamId === t.id)
                    return list.length === 0 ? null : (
                      <optgroup key={t.id} label={`${t.emoji} ${t.name}`}>
                        {list.map(u => <option key={u.id} value={u.id}>{u.name}{u.role === 'manager' ? ' (Quản lý)' : ''}</option>)}
                      </optgroup>
                    )
                  })}
                </select>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Người chưa trong dự án sẽ tự được thêm vào thành viên.</p>
              </>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{currentUser.name} (bạn tự nhận)</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lab} style={{ color: 'var(--text-muted)' }}>Mức độ</label>
              <select value={priority} onChange={e => changePriority(e.target.value as TaskPriority)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inp}>
                {(['low', 'medium', 'high'] as TaskPriority[]).map(p => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
              </select>
            </div>
            <div>
              <label className={lab} style={{ color: 'var(--text-muted)' }}>EXP ({range.min}–{range.max})</label>
              <input type="number" value={exp} onChange={e => setExp(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inp} />
            </div>
            <div>
              <label className={lab} style={{ color: 'var(--text-muted)' }}>Ngày bắt đầu</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inp} />
            </div>
            <div>
              <label className={lab} style={{ color: 'var(--text-muted)' }}>Hạn hoàn thành</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inp} />
            </div>
          </div>
        </div>
        {error && <p className="text-xs mt-3" style={{ color: '#dc2626' }}>{error}</p>}
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-muted)' }}>Hủy</button>
          <button type="button" onClick={submit} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-60" style={{ background: '#7c3aed' }}>
            {saving ? 'Đang lưu...' : 'Tạo task'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ===== Thảo luận của dự án =====
function ProjectDiscussion({ project, currentUser, users }: { project: Project; currentUser: User; users: User[] }) {
  const [comments, setComments] = useState<{ id: string; userId: string; content: string; createdAt: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const mapC = (c: any) => ({ id: c.id as string, userId: c.user_id as string, content: c.content as string, createdAt: c.created_at as string })
  const addUnique = (c: { id: string; userId: string; content: string; createdAt: string }) =>
    setComments(prev => (prev.some(x => x.id === c.id) ? prev : [...prev, c]))
  const fmtWhen = (s: string) => new Date(s).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  useEffect(() => {
    setLoading(true)
    supabase.from('project_comments').select('*').eq('project_id', project.id).order('created_at')
      .then(({ data }) => { setComments((data ?? []).map(mapC)); setLoading(false) })
    const ch = supabase.channel(`project-comments-${project.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_comments', filter: `project_id=eq.${project.id}` },
        payload => addUnique(mapC(payload.new)))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [project.id])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [comments.length])

  const send = async () => {
    const content = input.trim()
    if (!content || sending) return
    setSending(true)
    const { data, error } = await supabase.from('project_comments')
      .insert({ project_id: project.id, user_id: currentUser.id, content }).select('*').single()
    setSending(false)
    if (error) { alert('Không gửi được bình luận: ' + error.message); return }
    setInput('')
    if (data) addUnique(mapC(data))
  }

  return (
    <section className="rounded-xl p-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>💬 Thảo luận ({comments.length})</h3>
      {loading ? (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Đang tải...</p>
      ) : (
        <div ref={listRef} className="space-y-3 max-h-80 overflow-y-auto mb-3 pr-1">
          {comments.length === 0 && <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Chưa có bình luận nào. Hãy là người đầu tiên.</p>}
          {comments.map(c => {
            const u = users.find(x => x.id === c.userId)
            return (
              <div key={c.id} className="flex items-start gap-2">
                {u && <CharAvatar user={u} size={26} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{u?.name ?? 'Ẩn danh'}</span>
                    {c.userId === project.managerId && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#7c3aed22', color: '#7c3aed' }}>PM</span>
                    )}
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{fmtWhen(c.createdAt)}</span>
                  </div>
                  <p className="text-xs break-words whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{c.content}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div className="flex gap-1.5">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Viết bình luận cho cả dự án..."
          className="flex-1 min-w-0 px-3 py-2 rounded-lg text-xs outline-none"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
        <button type="button" onClick={send} disabled={!input.trim() || sending}
          className="px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-40 flex-shrink-0" style={{ background: '#7c3aed', color: '#fff' }}>Gửi</button>
      </div>
    </section>
  )
}

// ===== Tờ trình & đề xuất liên quan đến dự án =====
function ProjectProposals({ project, proposals, users, currentUser, canManage, onOpenProposal }: {
  project: Project; proposals: Proposal[]; users: User[]; currentUser: User; canManage: boolean
  onOpenProposal?: (proposalId: string) => void
}) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const me = currentUser.id
  const isDir = !!currentUser.isDirector
  const nameOf = (id?: string) => users.find(u => u.id === id)?.name ?? '—'
  const involved = (p: Proposal) => p.submittedBy === me || p.recipientId === me || p.participants.includes(me)
  const canView = (p: Proposal) => canManage || isDir || involved(p)
  const groupOf = (p: Proposal) => p.groupName ?? (p.kind === 'totrinh' ? 'Tờ trình' : 'Đề xuất')
  const chip = (p: Proposal): [string, string, string] =>
    p.status === 'pending' ? ['⏳ Chờ duyệt', '#fbbf2422', '#d97706']
    : p.status === 'rejected' && p.rejectedReason?.startsWith('[REVIEW]') ? ['🔁 Xem xét lại', '#fbbf2433', '#b45309']
    : p.status === 'rejected' ? ['❌ Từ chối', '#f8717122', '#dc2626']
    : ['✅ Đã duyệt', '#34d39922', '#059669']

  const allLinked = proposals.filter(p => p.projectId === project.id)
  const linked = allLinked.filter(canView).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const hidden = allLinked.length - linked.length
  const candidates = proposals.filter(p => !p.projectId && p.code && (isDir || involved(p)))

  const link = async () => {
    const c = code.trim().toUpperCase()
    if (!c) return
    setMsg('')
    const p = proposals.find(x => (x.code ?? '').toUpperCase() === c)
    if (!p || !(isDir || involved(p))) { setMsg(`Không tìm thấy tờ trình ${c}, hoặc bạn không có quyền gắn.`); return }
    if (p.projectId === project.id) { setMsg('Tờ trình này đã gắn vào dự án rồi.'); return }
    if (p.projectId) { setMsg('Tờ trình này đã gắn vào một dự án khác. Hãy gỡ ở dự án đó trước.'); return }
    setBusy(true)
    const { error } = await supabase.from('proposals').update({ project_id: project.id }).eq('id', p.id)
    setBusy(false)
    if (error) { setMsg('Không gắn được: ' + error.message); return }
    setCode('')
  }
  const unlink = async (p: Proposal) => {
    if (!window.confirm(`Gỡ ${p.code ?? 'tờ trình'} khỏi dự án này?`)) return
    const { error } = await supabase.from('proposals').update({ project_id: null }).eq('id', p.id)
    if (error) alert('Không gỡ được: ' + error.message)
  }

  return (
    <section className="rounded-xl p-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>📜 Tờ trình & Đề xuất liên quan ({linked.length})</h3>
      {linked.length === 0 && (
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Chưa có tờ trình hay đề xuất nào gắn vào dự án này.</p>
      )}
      {linked.map(p => {
        const [label, bg, color] = chip(p)
        return (
          <div key={p.id} className="py-2" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  <span className="font-mono text-[11px] mr-2" style={{ color: 'var(--text-muted)' }}>{p.code ?? ''}</span>{p.title}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {groupOf(p)} · {nameOf(p.submittedBy)} · {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold whitespace-nowrap" style={{ background: bg, color }}>{label}</span>
                {onOpenProposal && <button type="button" onClick={() => onOpenProposal(p.id)} className="text-[11px] underline" style={{ color: '#2563eb' }}>Mở</button>}
                {(canManage || p.submittedBy === me) && (
                  <button type="button" onClick={() => unlink(p)} className="text-[11px]" style={{ color: '#dc2626' }}>Gỡ</button>
                )}
              </div>
            </div>
          </div>
        )
      })}
      {hidden > 0 && (
        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>+ {hidden} tờ trình khác thuộc dự án nhưng bạn không liên quan nên không hiển thị.</p>
      )}
      <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex gap-1.5">
          <input list="project-proposal-codes" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && link()}
            placeholder="Chọn hoặc dán mã tờ trình (VD: RTASK201026-01)"
            className="flex-1 min-w-0 px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          <datalist id="project-proposal-codes">
            {candidates.map(p => <option key={p.id} value={p.code}>{p.title}</option>)}
          </datalist>
          <button type="button" onClick={link} disabled={!code.trim() || busy}
            className="px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-40 flex-shrink-0" style={{ background: '#7c3aed', color: '#fff' }}>＋ Gắn</button>
        </div>
        {msg && <p className="text-[11px] mt-1.5" style={{ color: '#dc2626' }}>{msg}</p>}
      </div>
    </section>
  )
}

function ProjectDetail({ project, users, tasks, proposals, currentUser, canEdit, onClose, onChanged, onOpenTask, onOpenProposal }: {
  project: Project; users: User[]; tasks: Task[]; proposals: Proposal[]; currentUser: User; canEdit: boolean
  onClose: () => void; onChanged: () => void; onOpenTask?: (taskId: string) => void; onOpenProposal?: (proposalId: string) => void
}) {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskFilter, setTaskFilter] = useState<'all' | 'mine' | 'waiting' | 'overdue' | 'done'>('all')
  const nameOf = (id?: string) => users.find(u => u.id === id)?.name ?? '—'
  const money = (n: number) => Number(n || 0).toLocaleString('vi-VN')
  const fmtD = (s?: string) => (s ? new Date(s).toLocaleDateString('vi-VN') : '—')
  const st = PROJECT_STATUS[project.status] ?? PROJECT_STATUS.planning
  const rk = PROJECT_RISK[project.riskLevel] ?? PROJECT_RISK.medium
  const todayStr = new Date().toISOString().split('T')[0]
  const isOverdue = (t: Task) => t.status !== 'completed' && !!t.dueDate && t.dueDate < todayStr
  const seq = (t: Task) => { const m = (t.taskCode ?? '').match(/\.(\d+)$/); return m ? parseInt(m[1], 10) : 0 }
  const list = tasks.filter(t => t.projectId === project.id).sort((a, b) => seq(a) - seq(b))
  const done = list.filter(t => t.status === 'completed').length
  const waiting = list.filter(t => t.status === 'submitted').length
  const overdue = list.filter(isOverdue).length
  const working = list.length - done - waiting
  const pct = list.length ? Math.round((done / list.length) * 100) : 0
  const team = TEAMS.find(t => t.id === project.teamId)
  const canAssign = canEdit || currentUser.role === 'manager'
  const projectOpen = project.status !== 'closed' && project.status !== 'done'

  const shown = list.filter(t =>
    taskFilter === 'all' ? true
    : taskFilter === 'mine' ? (t.assignedTo.includes(currentUser.id) || t.createdBy === currentUser.id)
    : taskFilter === 'waiting' ? t.status === 'submitted'
    : taskFilter === 'overdue' ? isOverdue(t)
    : t.status === 'completed')

  const stateOf = (t: Task): [string, string] => {
    if (t.creationApproval === 'pending') return ['⏳ Chờ duyệt tạo task', '#d97706']
    if (t.creationApproval === 'rejected') return ['❌ Bị từ chối', '#dc2626']
    if (t.status === 'completed') return ['✅ Hoàn thành', '#059669']
    if (t.status === 'submitted') return ['📤 Chờ duyệt', '#7c3aed']
    const w = WORK_STATUS_CONFIG[t.workStatus ?? 'received']
    return [w.label, w.color]
  }
  const canOpen = (t: Task) => t.assignedTo.includes(currentUser.id) || t.projectManager.includes(currentUser.id) || t.createdBy === currentUser.id

  const row = (k: string, v: string) => (
    <div className="grid grid-cols-3 gap-2 py-1 text-xs">
      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
      <span className="col-span-2" style={{ color: 'var(--text-primary)' }}>{v || '—'}</span>
    </div>
  )
  const changeStatus = async (v: string) => {
    const { error } = await supabase.from('projects').update({ status: v }).eq('id', project.id)
    if (error) { alert('Không đổi được trạng thái: ' + error.message); return }
    onChanged()
  }
  const card = { background: 'var(--bg-panel)', border: '1px solid var(--border)' }
  const tile = (label: string, value: number, color: string) => (
    <div className="rounded-lg px-3 py-2 text-center flex-1 min-w-[80px]" style={{ background: 'var(--bg-card-alt)' }}>
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  )
  const filterBtn = (id: typeof taskFilter, label: string) => (
    <button key={id} type="button" onClick={() => setTaskFilter(id)} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
      style={{ background: taskFilter === id ? '#7c3aed' : 'var(--bg-card-alt)', color: taskFilter === id ? '#fff' : 'var(--text-muted)' }}>{label}</button>
  )

  return (
    <div className="fixed inset-x-0 top-16 bottom-14 md:bottom-0 z-50 overflow-y-auto p-4" style={{ background: 'var(--bg-app)' }}>
      <div className="max-w-5xl mx-auto">
        <button type="button" onClick={onClose} className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>← Danh sách dự án</button>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          <span className="font-mono text-sm mr-2" style={{ color: 'var(--text-muted)' }}>[{project.code}]</span>{project.name}
        </h2>
        <div className="flex items-center gap-2 mt-1 mb-4">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: st[1], color: st[2] }}>{st[0]}</span>
          <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{project.priority}</span>
          <span className="text-xs font-semibold" style={{ color: rk[1] }}>Rủi ro: {rk[0]}</span>
          {canEdit && (
            <select value={project.status} onChange={e => changeStatus(e.target.value)} className="ml-auto px-2 py-1 rounded-lg text-xs outline-none"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              {Object.entries(PROJECT_STATUS).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}
            </select>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <section className="rounded-xl p-4" style={card}>
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Thông tin dự án</h3>
              {row('Công ty', project.company ?? '')}
              {row('Loại', project.cls === 'bau' ? 'Vận hành thường xuyên (BAU)' : 'Dự án (Project)')}
              {row('Mục tiêu và lý do', project.objective ?? '')}
              {row('Mô tả', project.description ?? '')}
              {row('Bên bị ảnh hưởng', project.affected ?? '')}
              {row('Nhà cung cấp', [project.supplierName, project.supplierRef].filter(Boolean).join(' · '))}
            </section>

            <section className="rounded-xl p-4" style={card}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Task của dự án ({list.length})</h3>
                {projectOpen ? (
                  <button type="button" onClick={() => setShowTaskForm(true)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#7c3aed' }}>＋ Thêm task</button>
                ) : (
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Dự án đã đóng, không thêm task mới</span>
                )}
              </div>
              <div className="flex gap-2 mb-3 flex-wrap">
                {tile('Tổng', list.length, 'var(--text-primary)')}
                {tile('Đang làm', working, '#2563eb')}
                {tile('Chờ duyệt', waiting, waiting > 0 ? '#7c3aed' : 'var(--text-muted)')}
                {tile('Quá hạn', overdue, overdue > 0 ? '#dc2626' : 'var(--text-muted)')}
                {tile('Hoàn thành', done, '#059669')}
              </div>
              <div className="flex gap-1.5 mb-2 flex-wrap">
                {filterBtn('all', 'Tất cả')}
                {filterBtn('mine', 'Của tôi')}
                {filterBtn('waiting', 'Chờ duyệt')}
                {filterBtn('overdue', 'Quá hạn')}
                {filterBtn('done', 'Hoàn thành')}
              </div>
              {shown.length === 0 && (
                <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>
                  {list.length === 0 ? 'Chưa có task nào. Bấm "＋ Thêm task" để tạo task đầu tiên của dự án.' : 'Không có task nào khớp bộ lọc.'}
                </p>
              )}
              {shown.map(t => {
                const [stLabel, stColor] = stateOf(t)
                return (
                  <div key={t.id} className="py-2" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          <span className="font-mono text-[11px] mr-2" style={{ color: 'var(--text-muted)' }}>{t.taskCode ?? ''}</span>{t.title}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {t.assignedTo.length > 0 ? t.assignedTo.map(id => nameOf(id)).join(', ') : 'Chưa giao'}
                          {t.selfCreated ? ' · tự tạo' : ''} · Hạn {fmtD(t.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isOverdue(t) && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#dc262618', color: '#dc2626' }}>⚠️ Quá hạn</span>}
                        <span className="text-[11px] font-semibold" style={{ color: stColor }}>{stLabel}</span>
                        {canApproveSelfTask(t, currentUser, users) && (
                          <>
                            <button type="button" onClick={() => approveSelfTask(t, currentUser)} className="text-[11px] font-bold" style={{ color: '#059669' }}>✓ Duyệt</button>
                            <button type="button" onClick={() => rejectSelfTask(t, currentUser)} className="text-[11px] font-bold" style={{ color: '#dc2626' }}>Từ chối</button>
                          </>
                        )}
                        {onOpenTask && canOpen(t) && (
                          <button type="button" onClick={() => onOpenTask(t.id)} className="text-[11px] underline" style={{ color: '#2563eb' }}>Mở</button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-xl p-4" style={card}>
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Tiến độ</h3>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card-alt)' }}>
                <div className="h-full" style={{ width: `${pct}%`, background: '#059669' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{pct}% · {done}/{list.length} task hoàn thành</p>
              {row('Dự kiến bắt đầu', fmtD(project.plannedStart))}
              {row('Dự kiến kết thúc', fmtD(project.plannedEnd))}
              {row('Ngân sách', `${money(project.budget)} VNĐ`)}
            </section>
            <section className="rounded-xl p-4" style={card}>
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Con người</h3>
              {row('Chủ dự án', nameOf(project.ownerId))}
              {row('Quản lý dự án', nameOf(project.managerId))}
              {row('Phòng ban chính', team ? `${team.emoji} ${team.name}` : '')}
              <p className="text-xs mt-2 mb-1 font-semibold" style={{ color: 'var(--text-muted)' }}>Thành viên ({project.memberIds.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {project.memberIds.map(id => (
                  <span key={id} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-primary)' }}>{nameOf(id)}</span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4 mt-4 pb-8">
        <div className="md:col-span-2 space-y-4">
          <ProjectProposals project={project} proposals={proposals} users={users} currentUser={currentUser} canManage={canAssign} onOpenProposal={onOpenProposal} />
          <ProjectDiscussion project={project} currentUser={currentUser} users={users} />
        </div>
      </div>
      {showTaskForm && <ProjectTaskForm project={project} users={users} currentUser={currentUser} canAssign={canAssign} onClose={() => setShowTaskForm(false)} />}
    </div>
  )
}

function ProjectsView({ currentUser, users, tasks, proposals, onOpenTask, onOpenProposal, focusProjectId, onFocusHandled }: {
  currentUser: User; users: User[]; tasks: Task[]; proposals: Proposal[]
  onOpenTask?: (taskId: string) => void; onOpenProposal?: (proposalId: string) => void
  focusProjectId?: string | null; onFocusHandled?: () => void
}) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [fCompany, setFCompany] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [q, setQ] = useState('')

  const load = async () => {
    const [p, m] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('project_members').select('project_id, user_id'),
    ])
    const byProject: Record<string, string[]> = {}
    ;(m.data ?? []).forEach((x: any) => { (byProject[x.project_id] ??= []).push(x.user_id) })
    setProjects((p.data ?? []).map((x: any) => mapDbProject(x, byProject[x.id] ?? [])))
    setLoading(false)
  }

  useEffect(() => {
    load()
    const ch = supabase.channel('projects-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => { load() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members' }, () => { load() })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  useEffect(() => {
    if (focusProjectId) { setOpenId(focusProjectId); onFocusHandled?.() }
  }, [focusProjectId])

  const isDir = !!currentUser.isDirector
  const isMgr = currentUser.role === 'manager'
  const canSee = (p: Project) =>
    isDir || p.createdBy === currentUser.id || p.managerId === currentUser.id || p.ownerId === currentUser.id ||
    p.memberIds.includes(currentUser.id) || (isMgr && p.teamId === currentUser.teamId)
  const canEditProject = (p: Project) => isDir || p.managerId === currentUser.id || p.createdBy === currentUser.id
  const nameOf = (id?: string) => users.find(u => u.id === id)?.name ?? '—'

  const visible = projects.filter(canSee)
    .filter(p => !fCompany || p.company === fCompany)
    .filter(p => !fStatus || p.status === fStatus)
    .filter(p => !q.trim() || `${p.code} ${p.name}`.toLowerCase().includes(q.trim().toLowerCase()))
  const open = projects.find(p => p.id === openId)
  const sel = { background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>🗂️ Dự án</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{visible.length} dự án</p>
        </div>
        {(isMgr || isDir) && (
          <button type="button" onClick={() => setShowForm(true)} className="px-4 py-2.5 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 0 20px #7c3aed40' }}>+ Tạo dự án</button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 Tìm theo mã hoặc tên dự án..." className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm outline-none" style={sel} />
        <select value={fCompany} onChange={e => setFCompany(e.target.value)} className="px-2 py-2 rounded-lg text-sm outline-none" style={sel}>
          <option value="">Tất cả công ty</option>
          {PROJECT_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} className="px-2 py-2 rounded-lg text-sm outline-none" style={sel}>
          <option value="">Mọi trạng thái</option>
          {Object.entries(PROJECT_STATUS).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}
        </select>
      </div>

      {loading && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</p>}
      {!loading && visible.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">🗂️</div>
          <div className="text-sm">Chưa có dự án nào</div>
        </div>
      )}

      <div className="space-y-3">
        {visible.map(p => {
          const st = PROJECT_STATUS[p.status] ?? PROJECT_STATUS.planning
          const rk = PROJECT_RISK[p.riskLevel] ?? PROJECT_RISK.medium
          const list = tasks.filter(t => t.projectId === p.id)
          const done = list.filter(t => t.status === 'completed').length
          const pct = list.length ? Math.round((done / list.length) * 100) : 0
          return (
            <button key={p.id} type="button" onClick={() => setOpenId(p.id)} className="w-full text-left rounded-xl p-4 hover:opacity-90"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    <span className="font-mono text-xs mr-2" style={{ color: 'var(--text-muted)' }}>[{p.code}]</span>{p.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {p.company ?? '—'} · PM: {nameOf(p.managerId)} · {p.plannedStart ? new Date(p.plannedStart).toLocaleDateString('vi-VN') : '—'} → {p.plannedEnd ? new Date(p.plannedEnd).toLocaleDateString('vi-VN') : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{p.priority}</span>
                  <span className="text-[11px] font-semibold" style={{ color: rk[1] }}>● {rk[0]}</span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: st[1], color: st[2] }}>{st[0]}</span>
                </div>
              </div>
              <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-card-alt)' }}>
                <div className="h-full" style={{ width: `${pct}%`, background: '#059669' }} />
              </div>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                {pct}% · {done}/{list.length} task · {p.memberIds.length} thành viên
                {list.some(t => t.status === 'submitted') && <span style={{ color: '#7c3aed' }}> · 📤 {list.filter(t => t.status === 'submitted').length} chờ duyệt</span>}
                {list.some(t => t.status !== 'completed' && t.dueDate && t.dueDate < new Date().toISOString().split('T')[0]) && <span style={{ color: '#dc2626' }}> · ⚠️ {list.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < new Date().toISOString().split('T')[0]).length} quá hạn</span>}
              </p>
            </button>
          )
        })}
      </div>

      {showForm && <ProjectForm currentUser={currentUser} users={users} onClose={() => setShowForm(false)} onCreated={load} />}
      {open && <ProjectDetail project={open} users={users} tasks={tasks} proposals={proposals} currentUser={currentUser} canEdit={canEditProject(open)} onClose={() => setOpenId(null)} onChanged={load} onOpenTask={onOpenTask} onOpenProposal={onOpenProposal} />}
    </div>
  )
}
// ==================== APP SHELL ====================

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'tasks', label: 'Task', icon: '📋' },
  { id: 'projects', label: 'Dự án', icon: '🗂️' },
  { id: 'proposals', label: 'Tờ trình', icon: '📜' },
  { id: 'leaderboard', label: 'Xếp hạng', icon: '🏆' },
  { id: 'rewards', label: 'Quà', icon: '🎁' },
  { id: 'social', label: 'Social', icon: '💬' },
  { id: 'profile', label: 'Hồ sơ', icon: '👤' },
]

const NAV_GROUPS: { title: string; ids: string[] }[] = [
  { title: 'Tổng quan', ids: ['dashboard'] },
  { title: 'Công việc', ids: ['tasks', 'projects', 'proposals'] },
  { title: 'Cộng đồng', ids: ['leaderboard', 'rewards', 'social'] },
  { title: 'Hệ thống', ids: ['bodlog', 'profile'] },
]
function NotificationBell({ notifications, onNotificationClick }: {
  notifications: { id: string; message: string; createdAt: string; linkChannel?: string; linkDmUserId?: string; linkTaskId?: string; linkProposalId?: string }[]
  onNotificationClick?: (n: { linkChannel?: string; linkDmUserId?: string; linkTaskId?: string; linkProposalId?: string }) => void
}) {
  const [open, setOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState(() => localStorage.getItem('lastSeenNotif') || '')
  const unread = notifications.filter(n => n.createdAt > lastSeen).length

  const toggle = () => {
    setOpen(o => !o)
    if (!open) {
      const now = new Date().toISOString()
      localStorage.setItem('lastSeenNotif', now)
      setLastSeen(now)
    }
  }

  const deleteOne = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id)
  }

  const deleteAll = async () => {
    if (!window.confirm('Xoá toàn bộ thông báo?')) return
    const ids = notifications.map(n => n.id)
    if (ids.length > 0) await supabase.from('notifications').delete().in('id', ids)
  }

  return (
    <div className="relative">
      <button onClick={toggle} className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[color:var(--bg-card-alt)]">
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl z-50"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Thông báo</span>
            {notifications.length > 0 && (
              <button onClick={deleteAll} className="text-[10px] hover:underline" style={{ color: '#dc2626' }}>Xoá tất cả</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>Chưa có thông báo nào</p>
          ) : (
            notifications.map(n => (
              <div key={n.id}
                onClick={() => { if (n.linkChannel || n.linkTaskId || n.linkProposalId) { onNotificationClick?.(n); setOpen(false) } }}
                className="px-4 py-3 flex items-start justify-between gap-2 group" style={{ borderBottom: '1px solid var(--border)', cursor: (n.linkChannel || n.linkTaskId || n.linkProposalId) ? 'pointer' : 'default' }}>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{n.message}</p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{fmtTime(n.createdAt)}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteOne(n.id) }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 text-xs flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}>
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )}

function AppShell({ currentUser, setCurrentUser, allUsers, tasks, setTasks, messages, setMessages, redemptions, notifications, collaborations, proposals, proposalApprovals, proposalRevisions }: {
  currentUser: User; setCurrentUser: (u: User) => void; allUsers: User[]
  tasks: Task[]; setTasks: (t: Task[]) => void
  messages: Message[]; setMessages: (m: Message[]) => void
  redemptions: { id: string; userId: string; rewardId: string; cost: number }[]
  notifications: { id: string; message: string; createdAt: string }[]
  collaborations: Collaboration[]
  proposals: Proposal[]
  proposalApprovals: ProposalApproval[]
  proposalRevisions: ProposalRevision[]
}) {
  const [view, setView] = useState<View>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => { try { return localStorage.getItem('sidebarCollapsed') === '1' } catch { return false } })
  const [sidebarHover, setSidebarHover] = useState(false)
  useEffect(() => { try { localStorage.setItem('sidebarCollapsed', sidebarCollapsed ? '1' : '0') } catch {} }, [sidebarCollapsed])
  const [sidebarPinned, setSidebarPinned] = useState(false)  // bấm KNI Work để mở
  const sidebarOpen = sidebarPinned || sidebarHover
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('themeMode') as ThemeMode) || 'light')
  const themeVars = useThemeVars(theme)
  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('themeMode', next)
      return next
    })
  }
  const { level } = getExpProgress(currentUser.exp)
  const [showMentions, setShowMentions] = useState(false)
  const [lastSeenMention, setLastSeenMention] = useState(() => localStorage.getItem('lastSeenMention') || '')
  const [socialTarget, setSocialTarget] = useState<{ channel: ChatChannel; dmUserId?: string; proposalId?: string } | null>(null)
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null)
  const [highlightProposalId, setHighlightProposalId] = useState<string | null>(null)
  const [projectFocusId, setProjectFocusId] = useState<string | null>(null)

  const handleJoinProposal = async (proposal: Proposal) => {
    if (!proposal.participants.includes(currentUser.id)) {
      await supabase.from('proposals').update({
        participants: [...proposal.participants, currentUser.id],
      }).eq('id', proposal.id)
    }
    setView('social')
    setShowMentions(false)
    setSocialTarget({ channel: 'proposal', proposalId: proposal.id })
  }
  const navItems = currentUser.isDirector ? [...NAV, { id: 'bodlog', icon: '📊', label: 'Log BOD' }] : NAV

  const handleNotificationClick = (n: { linkChannel?: string; linkDmUserId?: string; linkTaskId?: string; linkProposalId?: string }) => {
    if (n.linkProposalId) {
      setView('proposals')
      setHighlightProposalId(n.linkProposalId)
      return
    }
    if (n.linkTaskId) {
      setView('tasks')
      setHighlightTaskId(n.linkTaskId)
      return
    }
    if (!n.linkChannel) return
    setView('social')
    setShowMentions(false)
    if (n.linkChannel === 'dm' && n.linkDmUserId) {
      setSocialTarget({ channel: 'dm', dmUserId: n.linkDmUserId })
    } else {
      setSocialTarget({ channel: n.linkChannel as ChatChannel })
    }
  }

  const markMentionsSeen = () => {
    const now = new Date().toISOString()
    localStorage.setItem('lastSeenMention', now)
    setLastSeenMention(now)
  }

  // Merge current user into users list (keeps their live exp/avatar updated)
  const users = allUsers.some(u => u.id === currentUser.id)
    ? allUsers.map(u => u.id === currentUser.id ? currentUser : u)
    : [...allUsers, currentUser]

  const mentionCount = messages.filter(m =>
    m.userId !== currentUser.id &&
    isMessageVisibleTo(m, currentUser, users) &&
    parseMentions(m.content, users).some(x => x.user.id === currentUser.id) &&
    m.timestamp > lastSeenMention
  ).length  

  const sharedProps = { currentUser, tasks, users, setTasks, setCurrentUser, redemptions, setView }

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <DashboardView {...sharedProps} proposals={proposals}
        onOpenProposal={id => { setView('proposals'); setHighlightProposalId(id) }}
        onOpenProject={id => { setProjectFocusId(id); setView('projects') }} />
      case 'tasks': return (
        <TasksView {...sharedProps} collaborations={collaborations}
          highlightTaskId={highlightTaskId} clearHighlightTaskId={() => setHighlightTaskId(null)} />
      )
      case 'projects': return <ProjectsView currentUser={currentUser} users={users} tasks={tasks} proposals={proposals}
        focusProjectId={projectFocusId} onFocusHandled={() => setProjectFocusId(null)}
        onOpenTask={id => { setView('tasks'); setHighlightTaskId(id) }}
        onOpenProposal={id => { setView('proposals'); setHighlightProposalId(id) }} />
      case 'leaderboard': return <LeaderboardView users={users} tasks={tasks} />
      case 'rewards': return <RewardsView currentUser={currentUser} redemptions={redemptions} users={users} />
      case 'social': return (
        <SocialView currentUser={currentUser} users={users} messages={messages} setMessages={setMessages}
          showMentions={showMentions} setShowMentions={setShowMentions} markMentionsSeen={markMentionsSeen}
          navigateTarget={socialTarget} clearNavigateTarget={() => setSocialTarget(null)}
          proposals={proposals} />
      )
      case 'profile': return <ProfileView currentUser={currentUser} setCurrentUser={setCurrentUser} tasks={tasks} />
      case 'proposals': return <ProposalsView currentUser={currentUser} users={users} proposals={proposals} proposalApprovals={proposalApprovals} proposalRevisions={proposalRevisions} onJoinDiscussion={handleJoinProposal}
          highlightProposalId={highlightProposalId} clearHighlightProposalId={() => setHighlightProposalId(null)} />
          case 'bodlog': return currentUser.isDirector ? <BodLogView tasks={tasks} users={users} /> : <DashboardView {...sharedProps} proposals={proposals} />
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden overflow-x-hidden" style={{ ...themeVars, ...({ '--sidebar-w': sidebarCollapsed ? '0px' : '15rem' } as any), background: 'var(--bg-app)', fontFamily: 'Inter, sans-serif' }}>
            {/* Sidebar */}
            {sidebarCollapsed && <div className="hidden md:block fixed left-0 top-0 bottom-0 w-2 z-[70]" onMouseEnter={() => setSidebarHover(true)} />}
        <div className={`hidden md:flex w-60 flex-col overflow-y-auto transition-transform duration-200 ${sidebarCollapsed ? 'fixed left-0 top-0 bottom-0 z-[80]' : 'flex-shrink-0'}`}
          onMouseLeave={() => setSidebarHover(false)}
          style={{
            background: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border)',
            transform: sidebarCollapsed && !sidebarHover ? 'translateX(-100%)' : 'translateX(0)',
            boxShadow: sidebarCollapsed && sidebarHover ? '8px 0 30px rgba(0,0,0,0.18)' : 'none',
          }}>
        <div className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none" title="Bấm để thu gọn / ghim menu"
  onClick={() => { setSidebarCollapsed(c => !c); setSidebarHover(false) }}>
          <img src={companyLogo} alt="KNI" className="w-9 h-9 rounded-lg object-contain" />
          <div>
            <div className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>KNI Work</div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Quản lý công việc</div>
          </div>
        </div>
        <nav className="flex-1 px-3 pb-3">
          {NAV_GROUPS.map(group => {
            const items = group.ids.map(id => navItems.find(n => n.id === id)).filter(Boolean) as typeof navItems
            if (items.length === 0) return null
            return (
              <div key={group.title} className="mb-3">
                <p className="px-3 py-1.5 text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>{group.title}</p>
                {items.map(item => {
                  const active = view === item.id
                  return (
                    <button key={item.id} type="button"
                      onClick={() => {
                        setView(item.id as View)
                        setSidebarHover(false)
                        if (item.id === 'social' && mentionCount > 0) setShowMentions(true)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left mb-0.5"
                      style={{
                        background: active ? 'linear-gradient(135deg, #6d5ae6, #5b4bd5)' : 'transparent',
                        color: active ? '#ffffff' : 'var(--text-secondary)',
                        boxShadow: active ? '0 6px 16px #6d5ae640' : 'none',
                      }}>
                      <span className="text-base w-5 text-center">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.id === 'social' && mentionCount > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                          {mentionCount > 9 ? '9+' : mentionCount}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </nav>
        <button type="button" onClick={() => setView('profile')} className="flex items-center gap-3 px-5 py-3 text-left" style={{ borderTop: '1px solid var(--border)' }}>
          <CharAvatar user={currentUser} size={36} />
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{currentUser.name}</div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{currentUser.isDirector ? 'Ban Giám đốc' : currentUser.role === 'manager' ? 'Quản lý' : 'Nhân viên'}</div>
          </div>
        </button>
      </div>

        {/* Bottom nav — chỉ hiện trên mobile */}
      <div className="flex md:hidden items-center justify-around py-2 flex-shrink-0"
        style={{ background: 'var(--bg-sidebar)', borderTop: '1px solid var(--border)' }}>
        {navItems.map(item => (
          <button key={item.id}
            onClick={() => {
              setView(item.id as View)
              if (item.id === 'social' && mentionCount > 0) setShowMentions(true)
            }}
            className="relative flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg"
            style={{ color: view === item.id ? '#6d5ae6' : 'var(--text-muted)' }}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-[9px]">{item.label}</span>
            {item.id === 'social' && mentionCount > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                {mentionCount > 9 ? '9+' : mentionCount}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden order-first md:order-none">
                {/* Topbar */}
        <div className="h-16 flex items-center justify-between px-3 sm:px-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button type="button" onClick={() => { setSidebarCollapsed(c => !c); setSidebarHover(false) }}
              title={sidebarCollapsed ? 'Hiện menu' : 'Ẩn menu'}
              className="hidden md:flex items-center justify-center w-9 h-9 mr-2 rounded-lg text-lg hover:bg-[color:var(--bg-card-alt)] flex-shrink-0"
              style={{ color: 'var(--text-primary)' }}>
              ☰
            </button>
            <h1 className="font-bold text-base sm:text-lg truncate" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
              {navItems.find(n => n.id === view)?.icon} {navItems.find(n => n.id === view)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-4 flex-shrink-0">
            <button onClick={toggleTheme}
              title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-base sm:text-lg transition-all flex-shrink-0"
              style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <div className="hidden md:flex items-center gap-2.5">
              <span className="text-amber-400 text-xs font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Lv.{level}</span>
              <div className="w-28"><ExpBarMini exp={currentUser.exp} /></div>
              <span className="text-gray-600 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{currentUser.exp}</span>
            </div>
            <span className="md:hidden text-amber-400 text-[11px] font-bold flex-shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Lv.{level}</span>

            <NotificationBell notifications={notifications} onNotificationClick={handleNotificationClick} />

            <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => setView('profile')}>
              <CharAvatar user={currentUser} size={32} />
              <div className="hidden sm:block">
                <div className="text-sm font-medium leading-tight truncate max-w-[140px]" title={currentUser.name} style={{ color: 'var(--text-primary)' }}>{currentUser.name}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{currentUser.isDirector ? 'Ban Giám đốc' : currentUser.role === 'manager' ? 'Quản lý' : 'Nhân viên'}</div>
              </div>
            </div>

            <button
              onClick={async () => {
                if (!window.confirm('Đăng xuất khỏi tài khoản?')) return
                await supabase.auth.signOut()
              }}
              title="Đăng xuất"
              className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-lg items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm flex-shrink-0">
              🚪
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-app)' }}>{renderView()}</div>
      </div>
    </div>
  )
}

// ==================== APP (shared state at top level) ====================

// export default function App() {
//   const [currentUser, setCurrentUser] = useState<User | null>(null)
//   // Lifted to App level → persists across user logins in same session
//   const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
//   const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)

//   if (!currentUser) return <LoginScreen onLogin={setCurrentUser} />

//   return (
//     <AppShell
//       currentUser={currentUser}
//       setCurrentUser={setCurrentUser}
//       allUsers={MOCK_USERS}
//       tasks={tasks}
//       setTasks={setTasks}
//       messages={messages}
//       setMessages={setMessages}
//     />
//   )
// }

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [currentProfile, setCurrentProfile] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [checkingSession, setCheckingSession] = useState(true)
  const [redemptions, setRedemptions] = useState<{ id: string; userId: string; rewardId: string; cost: number }[]>([])
  const [notifications, setNotifications] = useState<{ id: string; message: string; createdAt: string; targetUserId?: string; linkChannel?: string; linkDmUserId?: string; linkTaskId?: string; linkProposalId?: string }[]>([])
  const [collaborations, setCollaborations] = useState<Collaboration[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [proposalApprovals, setProposalApprovals] = useState<ProposalApproval[]>([])
  const [proposalRevisions, setProposalRevisions] = useState<ProposalRevision[]>([])

  function mapProfileToUser(p: any): User {
  return { id: p.id, name: p.name, role: p.role, avatar: p.avatar, exp: p.exp, teamId: p.team_id, department: p.department, email: p.email, isDirector: p.is_director ?? false, driveFolderUrl: p.drive_folder_url ?? undefined, signatureUrl: p.signature_url ?? undefined }
}

  function mapDbMessage(m: any): Message {
    return { id: m.id, userId: m.user_id, toUserId: m.to_user_id ?? undefined, content: m.content, channel: m.channel, timestamp: m.created_at, proposalId: m.proposal_id ?? undefined }
  }
  function mapDbTask(t: any): Task {
  return {
    id: t.id, title: t.title, description: t.description, expReward: t.exp_reward,
    status: t.status, assignedTo: t.assigned_to ?? [], projectManager: t.project_manager ?? [],
    supporters: t.supporters ?? [], createdBy: t.created_by, dueDate: t.due_date,
    category: t.category, priority: t.priority, selfCreated: t.self_created,
    important: t.important ?? false,
    urgent: t.urgent ?? false,
    submissionFileUrl: t.submission_file_url ?? undefined,
    submissionNote: t.submission_note ?? undefined,
    submittedAt: t.submitted_at ?? undefined,
    rejectedReason: t.rejected_reason ?? undefined,
    startDate: t.start_date,
    crossDeptPending: t.cross_dept_pending ?? false,
    crossDeptRejected: t.cross_dept_rejected ?? false,
    crossDeptRejectedReason: t.cross_dept_rejected_reason ?? undefined,
    crossDeptRejectedBy: t.cross_dept_rejected_by ?? undefined,
    creationApproval: (t.creation_approval ?? 'approved') as 'pending' | 'approved' | 'rejected',
    creationApprovedBy: t.creation_approved_by ?? undefined,
    creationRejectedReason: t.creation_rejected_reason ?? undefined,
    targetTeamId: t.target_team_id ?? undefined,
    submissionOwnFolderUrl: t.submission_own_folder_url ?? undefined,
    driveFolderCreated: t.drive_folder_created ?? false,
    driveFolderName: t.drive_folder_name ?? undefined,
    submissionFolderName: t.submission_folder_name ?? undefined,
    driveFolderOwnerId: t.drive_folder_owner_id ?? undefined,
    approvedBy: t.approved_by ?? undefined,
    approvedAt: t.approved_at ?? undefined,
    ticketReceivedText: t.ticket_received_text ?? undefined,
    ticketInProcessText: t.ticket_in_process_text ?? undefined,
    ticketCompletedText: t.ticket_completed_text ?? undefined,
    ticketReceivedAt: t.ticket_received_at ?? undefined,
    ticketInProcessAt: t.ticket_in_process_at ?? undefined,
    ticketCompletedAt: t.ticket_completed_at ?? undefined,
    taskCode: t.task_code ?? undefined,
    company: t.company ?? undefined,
    projectId: t.project_id ?? undefined,
    createdAt: t.created_at ?? undefined,
    slaLevel: t.sla_level ?? undefined,
    workStatus: t.work_status ?? 'received',
    startedAt: t.started_at ?? undefined,
    processingStartedAt: t.processing_started_at ?? undefined,
    totalProcessingSeconds: t.total_processing_seconds ?? 0,
    pendingReason: t.pending_reason ?? undefined,
    pendingRequestedBy: t.pending_requested_by ?? undefined,
    pendingRequestedAt: t.pending_requested_at ?? undefined,
    isLocked: t.is_locked ?? false,
    lockReason: t.lock_reason ?? undefined,
    unlockRequestedReason: t.unlock_requested_reason ?? undefined,
    unlockRequestedAt: t.unlock_requested_at ?? undefined,
    slaUnlockGranted: t.sla_unlock_granted ?? false,
    completeIssue: t.complete_issue ?? undefined,
    closeResult: t.close_result ?? undefined,
    closeNote: t.close_note ?? undefined,
  }
}
function mapDbProposal(p: any): Proposal {
  return {
    id: p.id, title: p.title, description: p.description, driveUrl: p.drive_url,
    submittedBy: p.submitted_by, recipientId: p.recipient_id, status: p.status,
    rejectedReason: p.rejected_reason ?? undefined,
    participants: p.participants ?? [],
    createdAt: p.created_at,
    signedFileUrl: p.signed_file_url ?? undefined,
    code: p.code ?? undefined,
    groupName: p.group_name ?? undefined,
    department: p.department ?? undefined,
    company: p.company ?? undefined,
    brief: p.brief ?? undefined,
    days: p.days ?? undefined,
    dueDate: p.due_date ?? undefined,
    approvalMode: p.approval_mode ?? 'seq',
    items: p.items ?? [],
    risks: p.risks ?? [],
    planStatus: p.plan_status ?? 'received',
    kind: p.kind ?? 'dexuat',
    projectId: p.project_id ?? undefined,
    formData: p.form_data ?? {},
    attachments: p.attachments ?? [],
  }
}
function mapDbProposalApproval(a: any): ProposalApproval {
  return {
    id: a.id, proposalId: a.proposal_id, approverId: a.approver_id,
    action: a.action, note: a.note ?? undefined, createdAt: a.created_at,
  }
}
function mapDbCollaboration(c: any): Collaboration {
  return {
    id: c.id, title: c.title, description: c.description,
    startDate: c.start_date, endDate: c.end_date,
    requestedBy: c.requested_by, requestingTeamId: c.requesting_team_id, targetTeamId: c.target_team_id,
    targetManagerId: c.target_manager_id ?? undefined,
    expReward: c.exp_reward ?? undefined,
    status: c.status, assignedEmployeeIds: c.assigned_employee_ids ?? [],
    assignedBy: c.assigned_by ?? undefined, rejectedReason: c.rejected_reason ?? undefined,
    createdAt: c.created_at,
    driveFolderCreated: c.drive_folder_created ?? false,
    driveFolderName: c.drive_folder_name ?? undefined,
  }
}



  //=============================================================================
  useEffect(() => {
  if (!session) return
  supabase.from('redemptions').select('*').then(({ data }) => data && setRedemptions(
    data.map(r => ({ id: r.id, userId: r.user_id, rewardId: r.reward_id, cost: r.cost }))
  ))
//   const channel = supabase.channel('redemptions-changes')
//     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'redemptions' }, payload => {
//       const r = payload.new
//       setRedemptions(prev => [...prev, { id: r.id, userId: r.user_id, rewardId: r.reward_id, cost: r.cost }])
//     }).subscribe()
//   return () => { supabase.removeChannel(channel) }
// }, [session])
  const channel = supabase.channel('redemptions-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'redemptions' }, payload => {
      const r = payload.new
      setRedemptions(prev => [...prev, { id: r.id, userId: r.user_id, rewardId: r.reward_id, cost: r.cost }])
    }).subscribe()
  return () => { supabase.removeChannel(channel) }
}, [session])

useEffect(() => {
  if (!session) return

  const isForCurrentUser = (n: any) =>
    !n.target_user_id || n.target_user_id === session.user.id

  supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50)
    .then(({ data }) => data && setNotifications(data
      .filter(isForCurrentUser)
      .map(n => ({
        id: n.id, message: n.message, createdAt: n.created_at,
        targetUserId: n.target_user_id ?? undefined,
        linkChannel: n.link_channel ?? undefined,
        linkDmUserId: n.link_dm_user_id ?? undefined,
        linkTaskId: n.link_task_id ?? undefined,
        linkProposalId: n.link_proposal_id ?? undefined,
      }))))

  const notifChannel = supabase.channel('notifications-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
      const n = payload.new
      if (!isForCurrentUser(n)) return

      setNotifications(prev => [{
        id: n.id, message: n.message, createdAt: n.created_at,
        targetUserId: n.target_user_id ?? undefined,
        linkChannel: n.link_channel ?? undefined,
        linkDmUserId: n.link_dm_user_id ?? undefined,
        linkTaskId: n.link_task_id ?? undefined,
        linkProposalId: n.link_proposal_id ?? undefined,
      }, ...prev])
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notifications' }, payload => {
      setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
    })
    .subscribe()
  return () => { supabase.removeChannel(notifChannel) }
}, [session])

  // Kiểm tra xem đã đăng nhập từ trước chưa (giữ session khi refresh trang)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCheckingSession(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])
  //==============================================================================
  // Khi allUsers cập nhật (real-time), đồng bộ luôn currentProfile nếu có thay đổi
useEffect(() => {
  if (!currentProfile) return
  const updated = allUsers.find(u => u.id === currentProfile.id)
  if (updated && JSON.stringify(updated) !== JSON.stringify(currentProfile)) {
    setCurrentProfile(updated)
  }
}, [allUsers])

  // Nạp profile của chính mình khi có session
  useEffect(() => {
    if (!session) { setCurrentProfile(null); return }
    supabase.from('profiles').select('*').eq('id', session.user.id).single()
      .then(({ data }) => { if (data) setCurrentProfile(mapProfileToUser(data)) })
  }, [session])

  // Nạp toàn bộ user + lắng nghe realtime
  useEffect(() => {
    if (!session) return
    supabase.from('profiles').select('*').then(({ data }) => data && setAllUsers(data.map(mapProfileToUser)))
    const channel = supabase.channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        supabase.from('profiles').select('*').then(({ data }) => data && setAllUsers(data.map(mapProfileToUser)))
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [session])


  // 👇 ĐOẠN MỚI THÊM — nạp tin nhắn + lắng nghe realtime
  useEffect(() => {
    if (!session) return
    supabase.from('messages').select('*').order('created_at')
      .then(({ data }) => data && setMessages(data.map(mapDbMessage)))

    const channel = supabase.channel('messages-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => [...prev, mapDbMessage(payload.new)])
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [session])


  useEffect(() => {
  if (!session) return
  supabase.from('tasks').select('*').then(({ data }) => data && setTasks(data.map(mapDbTask)))

  const channel = supabase.channel('tasks-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
      supabase.from('tasks').select('*').then(({ data }) => data && setTasks(data.map(mapDbTask)))
    }).subscribe()
  return () => { supabase.removeChannel(channel) }
}, [session])

useEffect(() => {
  if (!session) return
  supabase.from('collaborations').select('*').then(({ data }) => data && setCollaborations(data.map(mapDbCollaboration)))

  const channel = supabase.channel('collaborations-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'collaborations' }, () => {
      supabase.from('collaborations').select('*').then(({ data }) => data && setCollaborations(data.map(mapDbCollaboration)))
    }).subscribe()
  return () => { supabase.removeChannel(channel) }
}, [session])

useEffect(() => {
  if (!session) return
  supabase.from('proposals').select('*').then(({ data }) => data && setProposals(data.map(mapDbProposal)))

  const channel = supabase.channel('proposals-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'proposals' }, () => {
      supabase.from('proposals').select('*').then(({ data }) => data && setProposals(data.map(mapDbProposal)))
    }).subscribe()
  return () => { supabase.removeChannel(channel) }
}, [session])


useEffect(() => {
  if (!session) return
  supabase.from('proposal_approvals').select('*').then(({ data }) => data && setProposalApprovals(data.map(mapDbProposalApproval)))

  const channel = supabase.channel('proposal-approvals-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'proposal_approvals' }, () => {
      supabase.from('proposal_approvals').select('*').then(({ data }) => data && setProposalApprovals(data.map(mapDbProposalApproval)))
    }).subscribe()
  return () => { supabase.removeChannel(channel) }
}, [session])


useEffect(() => {
  if (!session) return
  supabase.from('proposal_revisions').select('*').then(({ data }) => data && setProposalRevisions(data.map(mapDbProposalRevision)))

  const channel = supabase.channel('proposal-revisions-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'proposal_revisions' }, () => {
      supabase.from('proposal_revisions').select('*').then(({ data }) => data && setProposalRevisions(data.map(mapDbProposalRevision)))
    }).subscribe()
  return () => { supabase.removeChannel(channel) }
}, [session])


  // Khi allUsers cập nhật (real-time), đồng bộ luôn currentProfile nếu có thay đổi
useEffect(() => {
  if (!currentProfile) return
  const updated = allUsers.find(u => u.id === currentProfile.id)
  if (updated && JSON.stringify(updated) !== JSON.stringify(currentProfile)) {
    setCurrentProfile(updated)
  }
}, [allUsers])

// useEffect(() => {
//   if (!currentProfile) return
//   const w = window as any
//   if (!w.OneSignalDeferred) return
//   w.OneSignalDeferred.push(async (OneSignal: any) => {
//     await OneSignal.login(currentProfile.id)
//     await OneSignal.User.addTag('team', currentProfile.teamId)
//     await OneSignal.Notifications.requestPermission()
//   })
// }, [currentProfile])

useEffect(() => {
  if (!currentProfile) return

  const w = window as any

  if (!w.OneSignalDeferred) {
    console.error('OneSignalDeferred chưa được load')
    return
  }

  w.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      // Đăng nhập user hiện tại vào OneSignal
      await OneSignal.login(currentProfile.id)

      // Gắn team của user
      await OneSignal.User.addTag(
        'team',
        currentProfile.teamId
      )

      // Kiểm tra Push Subscription
      const optedIn =
        await OneSignal.User.PushSubscription.optedIn

      console.log(
        'OneSignal push subscribed:',
        optedIn
      )

      console.log(
        'OneSignal user:',
        currentProfile.id
      )

      console.log(
        'OneSignal team:',
        currentProfile.teamId
      )

    } catch (error) {
      console.error(
        'OneSignal error:',
        error
      )
    }
  })
}, [currentProfile])


  if (checkingSession) return <div style={{ background: '#060610', minHeight: '100vh' }} />
  if (!session || !currentProfile) return <LoginScreen onLoggedIn={() => {}} />

  return (
    <AppShell
      currentUser={currentProfile}
      setCurrentUser={setCurrentProfile}
      allUsers={allUsers}
      tasks={tasks}
      setTasks={setTasks}
      messages={messages}
      setMessages={setMessages}
      redemptions={redemptions}
      notifications={notifications}
      collaborations={collaborations}
      proposals={proposals}
      proposalApprovals={proposalApprovals}
      proposalRevisions={proposalRevisions}
    />
  )
}
