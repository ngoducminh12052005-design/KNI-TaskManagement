// import { useState, useRef, useEffect } from 'react'
// import { supabase } from './supabaseClient'
// import companyLogo from './assets/company-logo.png'
// import * as XLSX from 'xlsx'
// // ==================== TYPES ====================

// type Role = 'manager' | 'employee'
// type View = 'dashboard' | 'tasks' | 'leaderboard' | 'rewards' | 'social' | 'profile' | 'bodlog'
// type TaskStatus = 'open' | 'in-progress' | 'submitted' | 'completed'
// type TaskPriority = 'low' | 'medium' | 'high'
// type ChatChannel = 'general' | 'team' | 'announcements' | 'dm'

// interface AvatarConfig {
//   type: 'custom' | 'photo'
//   skinTone: string
//   hairStyle: number
//   hairColor: string
//   outfitColor: string
//   accessory: number
//   photoUrl?: string
// }

// interface User {
//   id: string
//   name: string
//   role: Role
//   avatar: AvatarConfig
//   exp: number
//   teamId: string
//   department: string
//   email?: string
//   isDirector?: boolean
//   driveFolderUrl?: string
// }

// interface Task {
//   id: string
//   title: string
//   description: string
//   expReward: number
//   status: TaskStatus
//   // assignedTo?: string
//   // projectManager?: string
//   assignedTo: string[]
//   projectManager: string[]
//   supporters: string[]
//   createdBy: string
//   dueDate: string
//   category: string
//   priority: TaskPriority
//   selfCreated: boolean
//   submissionFileUrl?: string
//   submissionNote?: string
//   submittedAt?: string
//   rejectedReason?: string
//   startDate?: string
//   important: boolean
//   urgent: boolean
//   crossDeptPending?: boolean
//   crossDeptRejected?: boolean
//   crossDeptRejectedReason?: string
//   crossDeptRejectedBy?: string
//   targetTeamId?: string
//   submissionOwnFolderUrl?: string
//   driveFolderCreated?: boolean
//   driveFolderName?: string
//   submissionFolderName?: string
//   driveFolderOwnerId?: string
//   approvedBy?: string
//   approvedAt?: string
// }

// interface Message {
//   id: string
//   userId: string
//   content: string
//   timestamp: string
//   channel: ChatChannel
//   toUserId?: string // chỉ dùng khi channel === 'dm': id của người nhận
// }

// type CollaborationStatus = 'pending' | 'assigned' | 'rejected'

// interface Collaboration {
//   id: string
//   title: string
//   description: string
//   startDate: string
//   endDate: string
//   requestedBy: string
//   requestingTeamId: string
//   targetTeamId: string
//   targetManagerId?: string
//   expReward?: number
//   status: CollaborationStatus
//   assignedEmployeeId?: string
//   assignedBy?: string
//   rejectedReason?: string
//   createdAt: string
//   driveFolderCreated?: boolean
//   driveFolderName?: string
// }

// interface Reward {
//   id: string
//   name: string
//   description: string
//   cost: number
//   emoji: string
//   category: string
// }



// // ==================== AVATAR SYSTEM ====================

// const SKIN_TONES = ['#FDBCB4', '#E8A87C', '#C68642', '#8D5524', '#4A2912']
// const HAIR_COLORS = ['#1a1a1a', '#4a2c0a', '#8B4513', '#C0392B', '#D4AC0D', '#FF69B4', '#4169E1', '#B8B8B8']
// const OUTFIT_COLORS = ['#4f46e5', '#059669', '#dc2626', '#d97706', '#0891b2', '#7c3aed', '#ec4899', '#374151']
// const HAIR_STYLE_LABELS = ['Ngắn', 'Vừa', 'Dài', 'Xoăn', 'Afro', 'Đuôi ngựa']
// const ACCESSORY_LABELS = ['Không', 'Kính tròn', 'Kính mát', 'Mũ', 'Băng đầu']

// const DEFAULT_AVATAR: AvatarConfig = {
//   type: 'custom', skinTone: '#E8A87C', hairStyle: 1, hairColor: '#1a1a1a', outfitColor: '#4f46e5', accessory: 0,
// }

// function darkenColor(hex: string, f = 0.2): string {
//   const n = parseInt(hex.slice(1), 16)
//   const r = Math.max(0, Math.round((n >> 16) * (1 - f)))
//   const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - f)))
//   const b = Math.max(0, Math.round((n & 0xff) * (1 - f)))
//   return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
// }

// // Full SVG character
// function CharacterSVG({ config, w = 100, h = 120, vb = '0 0 100 120' }: {
//   config: AvatarConfig; w?: number; h?: number; vb?: string
// }) {
//   const { skinTone, hairStyle, hairColor, outfitColor, accessory } = config
//   const pants = darkenColor(outfitColor, 0.28)
//   const skinDark = darkenColor(skinTone, 0.12)
//   const lightHairs = ['#B8B8B8', '#D4AC0D', '#FF69B4', '#4169E1', '#FDBCB4']
//   const browColor = lightHairs.includes(hairColor) ? darkenColor(skinTone, 0.3) : hairColor

//   const renderHair = () => {
//     switch (hairStyle) {
//       case 0:
//         return <path d="M29,34 Q28,11 50,10 Q72,11 71,34 Q65,18 50,15 Q35,18 29,34 Z" fill={hairColor} />
//       case 1:
//         return (
//           <g>
//             <ellipse cx="50" cy="19" rx="22" ry="13" fill={hairColor} />
//             <path d="M30,26 Q25,46 30,60" stroke={hairColor} strokeWidth="9" strokeLinecap="round" fill="none" />
//             <path d="M70,26 Q75,46 70,60" stroke={hairColor} strokeWidth="9" strokeLinecap="round" fill="none" />
//           </g>
//         )
//       case 2:
//         return (
//           <g>
//             <ellipse cx="50" cy="17" rx="22" ry="11" fill={hairColor} />
//             <path d="M30,23 Q21,62 25,84" stroke={hairColor} strokeWidth="10" strokeLinecap="round" fill="none" />
//             <path d="M70,23 Q79,62 75,84" stroke={hairColor} strokeWidth="10" strokeLinecap="round" fill="none" />
//           </g>
//         )
//       case 3:
//         return (
//           <g>
//             <circle cx="29" cy="27" r="11" fill={hairColor} />
//             <circle cx="42" cy="15" r="12" fill={hairColor} />
//             <circle cx="58" cy="15" r="12" fill={hairColor} />
//             <circle cx="71" cy="27" r="11" fill={hairColor} />
//             <circle cx="76" cy="39" r="9" fill={hairColor} />
//             <circle cx="24" cy="39" r="9" fill={hairColor} />
//           </g>
//         )
//       case 4:
//         return <circle cx="50" cy="24" r="28" fill={hairColor} />
//       case 5:
//         return (
//           <g>
//             <ellipse cx="50" cy="19" rx="22" ry="12" fill={hairColor} />
//             <path d="M30,27 Q26,42 30,54" stroke={hairColor} strokeWidth="7" strokeLinecap="round" fill="none" />
//             <path d="M70,14 Q86,8 84,36 Q82,44 72,40 Q71,28 70,20 Z" fill={hairColor} />
//           </g>
//         )
//       default: return null
//     }
//   }

//   const renderAccessory = () => {
//     switch (accessory) {
//       case 1: // Round glasses
//         return (
//           <g stroke="#1e1e3a" strokeWidth="1.5" fill="none" opacity="0.88">
//             <circle cx="43" cy="31" r="8" />
//             <circle cx="57" cy="31" r="8" />
//             <line x1="51" y1="31" x2="49" y2="31" />
//             <line x1="35" y1="30" x2="27" y2="29" />
//             <line x1="65" y1="30" x2="73" y2="29" />
//           </g>
//         )
//       case 2: // Sunglasses
//         return (
//           <g>
//             <circle cx="43" cy="31" r="8" fill="#0f0f1e" opacity="0.85" />
//             <circle cx="57" cy="31" r="8" fill="#0f0f1e" opacity="0.85" />
//             <g stroke="#3a3a5a" strokeWidth="1.5" fill="none">
//               <circle cx="43" cy="31" r="8" />
//               <circle cx="57" cy="31" r="8" />
//               <line x1="51" y1="31" x2="49" y2="31" />
//               <line x1="35" y1="30" x2="27" y2="29" />
//               <line x1="65" y1="30" x2="73" y2="29" />
//             </g>
//           </g>
//         )
//       case 3: // Hat
//         return (
//           <g>
//             <ellipse cx="50" cy="15" rx="27" ry="5.5" fill={darkenColor(hairColor === '#D4AC0D' ? '#8B4513' : hairColor, 0.1)} />
//             <rect x="33" y="0" width="34" height="16" rx="6" fill={hairColor === '#B8B8B8' ? '#444' : darkenColor(hairColor, 0.05)} />
//             <rect x="33" y="12" width="34" height="4" fill="rgba(0,0,0,0.2)" />
//           </g>
//         )
//       case 4: // Headband
//         return <rect x="27" y="25" width="46" height="9" rx="4.5" fill="#ec4899" />
//       default: return null
//     }
//   }

//   return (
//     <svg viewBox={vb} width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
//       {/* Hair (below head) */}
//       {renderHair()}

//       {/* Hat (below head) */}
//       {accessory === 3 && renderAccessory()}

//       {/* Ears */}
//       <ellipse cx="29" cy="34" rx="4.5" ry="5.5" fill={skinTone} />
//       <ellipse cx="71" cy="34" rx="4.5" ry="5.5" fill={skinTone} />

//       {/* Head */}
//       <ellipse cx="50" cy="32" rx="21" ry="22" fill={skinTone} />

//       {/* Cheek blush */}
//       <ellipse cx="37" cy="40" rx="6" ry="4" fill="#ff7777" opacity="0.16" />
//       <ellipse cx="63" cy="40" rx="6" ry="4" fill="#ff7777" opacity="0.16" />

//       {/* Eyebrows */}
//       <path d="M38,24 Q43,22 47,25" stroke={browColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
//       <path d="M53,25 Q57,22 62,24" stroke={browColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />

//       {/* Eyes - sclera */}
//       <ellipse cx="43" cy="30" rx="3.5" ry="3.8" fill="white" />
//       <ellipse cx="57" cy="30" rx="3.5" ry="3.8" fill="white" />
//       {/* Pupils */}
//       <circle cx="43.5" cy="30.5" r="2.2" fill="#1a1a2e" />
//       <circle cx="57.5" cy="30.5" r="2.2" fill="#1a1a2e" />
//       {/* Eye shine */}
//       <circle cx="44.3" cy="29.4" r="0.9" fill="white" />
//       <circle cx="58.3" cy="29.4" r="0.9" fill="white" />

//       {/* Nose */}
//       <path d="M48.5,37 Q50,40 51.5,37" stroke={skinDark} strokeWidth="1.2" fill="none" strokeLinecap="round" />

//       {/* Mouth - smile */}
//       <path d="M44,44 Q50,49 56,44" stroke="#c07070" strokeWidth="1.8" fill="none" strokeLinecap="round" />

//       {/* Glasses/Headband (over face) */}
//       {(accessory === 1 || accessory === 2 || accessory === 4) && renderAccessory()}

//       {/* Neck */}
//       <rect x="44" y="53" width="12" height="10" rx="2" fill={skinTone} />

//       {/* Body (shirt) */}
//       <rect x="26" y="62" width="48" height="33" rx="8" fill={outfitColor} />
//       {/* Subtle highlight on shirt */}
//       <rect x="26" y="62" width="48" height="6" rx="8" fill="rgba(255,255,255,0.06)" />
//       {/* Collar */}
//       <path d="M45,62 L50,70 L55,62 Z" fill={darkenColor(outfitColor, 0.1)} />

//       {/* Left arm / sleeve */}
//       <path d="M27,68 Q13,76 10,89" stroke={outfitColor} strokeWidth="12" strokeLinecap="round" fill="none" />
//       {/* Left hand */}
//       <circle cx="10" cy="89" r="5.5" fill={skinTone} />

//       {/* Right arm / sleeve */}
//       <path d="M73,68 Q87,76 90,89" stroke={outfitColor} strokeWidth="12" strokeLinecap="round" fill="none" />
//       {/* Right hand */}
//       <circle cx="90" cy="89" r="5.5" fill={skinTone} />

//       {/* Pants */}
//       <rect x="31" y="93" width="16" height="23" rx="6" fill={pants} />
//       <rect x="53" y="93" width="16" height="23" rx="6" fill={pants} />

//       {/* Shoes */}
//       <ellipse cx="39" cy="117" rx="10" ry="5" fill="#12121e" />
//       <ellipse cx="61" cy="117" rx="10" ry="5" fill="#12121e" />
//     </svg>
//   )
// }

// // Compact avatar (head crop) used in cards, chat, lists
// function CharAvatar({ user, size = 40 }: { user: User; size?: number }) {
//   if (user.avatar.type === 'photo' && user.avatar.photoUrl) {
//     return (
//       <img src={user.avatar.photoUrl} alt={user.name}
//         style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(255,255,255,0.12)', display: 'block' }} />
//     )
//   }
//   return (
//     <div style={{
//       width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
//       border: '2px solid rgba(255,255,255,0.1)', background: `${user.avatar.outfitColor}18`,
//     }}>
//       {/* Show head area only */}
//       <CharacterSVG config={user.avatar} vb="24 4 52 52" w={size} h={size} />
//     </div>
//   )
// }

// // Large avatar (full body) used in profile/login preview
// function FullAvatar({ avatar, size = 120 }: { avatar: AvatarConfig; size?: number }) {
//   if (avatar.type === 'photo' && avatar.photoUrl) {
//     return (
//       <img src={avatar.photoUrl} alt="avatar"
//         style={{ width: size, height: size, borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.12)', display: 'block' }} />
//     )
//   }
//   return <CharacterSVG config={avatar} vb="0 0 100 120" w={size} h={size * 1.2} />
// }

// // ==================== AVATAR CREATOR ====================

// function AvatarCreator({ value, onChange }: { value: AvatarConfig; onChange: (a: AvatarConfig) => void }) {
//   const [tab, setTab] = useState<'custom' | 'photo'>(value.type === 'photo' ? 'photo' : 'custom')
//   const fileRef = useRef<HTMLInputElement>(null)

//   const update = (patch: Partial<AvatarConfig>) =>
//     onChange({ ...value, type: 'custom', photoUrl: undefined, ...patch })

//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return
//     const reader = new FileReader()
//     reader.onload = ev => onChange({ ...value, type: 'photo', photoUrl: ev.target?.result as string })
//     reader.readAsDataURL(file)
//   }

//   return (
//     <div>
//       {/* Tab switcher */}
//       <div className="flex gap-1 p-0.5 rounded-xl mb-4" style={{ background: '#0a0a1a', border: '1px solid #1e1e3a' }}>
//         {[['custom', '🎨 Tự tạo nhân vật'], ['photo', '📷 Tải ảnh lên']].map(([id, label]) => (
//           <button key={id} onClick={() => setTab(id as 'custom' | 'photo')}
//             className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
//             style={{ background: tab === id ? '#7c3aed' : 'transparent', color: tab === id ? '#fff' : '#6b7280' }}>
//             {label}
//           </button>
//         ))}
//       </div>

//       <div className="flex gap-5">
//         {/* Preview */}
//         <div className="flex-shrink-0 flex flex-col items-center gap-2">
//           <div
//             className="rounded-2xl overflow-hidden flex items-end justify-center"
//             style={{
//               width: 110, height: 140,
//               background: `linear-gradient(160deg, ${value.outfitColor}22, #10102a)`,
//               border: `2px solid ${value.outfitColor}40`,
//             }}
//           >
//             <FullAvatar avatar={value} size={100} />
//           </div>
//           <span className="text-gray-600 text-[10px]">Xem trước</span>
//         </div>

//         {/* Controls */}
//         <div className="flex-1 space-y-3.5 min-w-0">
//           {tab === 'custom' ? (
//             <>
//               {/* Skin */}
//               <div>
//                 <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1.5">Màu da</p>
//                 <div className="flex gap-2">
//                   {SKIN_TONES.map(c => (
//                     <button key={c} onClick={() => update({ skinTone: c })}
//                       className="w-7 h-7 rounded-full transition-all hover:scale-110"
//                       style={{
//                         background: c,
//                         outline: value.skinTone === c ? `3px solid ${c}` : '3px solid transparent',
//                         outlineOffset: '2px',
//                         border: value.skinTone === c ? '2px solid white' : '2px solid transparent',
//                       }} />
//                   ))}
//                 </div>
//               </div>

//               {/* Hair style */}
//               <div>
//                 <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1.5">Kiểu tóc</p>
//                 <div className="flex flex-wrap gap-1">
//                   {HAIR_STYLE_LABELS.map((lbl, i) => (
//                     <button key={i} onClick={() => update({ hairStyle: i })}
//                       className="px-2.5 py-1 rounded-lg text-xs transition-all"
//                       style={{
//                         background: value.hairStyle === i ? '#7c3aed' : '#14143a',
//                         color: value.hairStyle === i ? '#fff' : '#6b7280',
//                         border: `1px solid ${value.hairStyle === i ? '#7c3aed' : '#1e1e4a'}`,
//                       }}>
//                       {lbl}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Hair color */}
//               <div>
//                 <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1.5">Màu tóc</p>
//                 <div className="flex flex-wrap gap-1.5">
//                   {HAIR_COLORS.map(c => (
//                     <button key={c} onClick={() => update({ hairColor: c })}
//                       className="w-5 h-5 rounded-full transition-all hover:scale-110"
//                       style={{
//                         background: c,
//                         border: `2px solid ${value.hairColor === c ? 'white' : '#1e1e4a'}`,
//                         boxShadow: value.hairColor === c ? `0 0 6px ${c}` : 'none',
//                       }} />
//                   ))}
//                 </div>
//               </div>

//               {/* Outfit */}
//               <div>
//                 <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1.5">Trang phục</p>
//                 <div className="flex flex-wrap gap-1.5">
//                   {OUTFIT_COLORS.map(c => (
//                     <button key={c} onClick={() => update({ outfitColor: c })}
//                       className="w-5 h-5 rounded-full transition-all hover:scale-110"
//                       style={{
//                         background: c,
//                         border: `2px solid ${value.outfitColor === c ? 'white' : '#1e1e4a'}`,
//                         boxShadow: value.outfitColor === c ? `0 0 6px ${c}` : 'none',
//                       }} />
//                   ))}
//                 </div>
//               </div>

//               {/* Accessory */}
//               <div>
//                 <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1.5">Phụ kiện</p>
//                 <div className="flex flex-wrap gap-1">
//                   {ACCESSORY_LABELS.map((lbl, i) => (
//                     <button key={i} onClick={() => update({ accessory: i })}
//                       className="px-2 py-1 rounded-lg text-xs transition-all"
//                       style={{
//                         background: value.accessory === i ? '#f59e0b' : '#14143a',
//                         color: value.accessory === i ? '#1a0f00' : '#6b7280',
//                         border: `1px solid ${value.accessory === i ? '#f59e0b' : '#1e1e4a'}`,
//                         fontWeight: value.accessory === i ? '600' : '400',
//                       }}>
//                       {lbl}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </>
//           ) : (
//             /* Photo upload */
//             <div className="flex flex-col gap-3">
//               {value.type === 'photo' && value.photoUrl ? (
//                 <div className="text-center">
//                   <img src={value.photoUrl} alt="preview"
//                     className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
//                     style={{ border: '3px solid #7c3aed', boxShadow: '0 0 20px #7c3aed50' }} />
//                   <p className="text-green-400 text-xs mb-1">✓ Đã tải lên thành công</p>
//                 </div>
//               ) : (
//                 <div
//                   className="rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer py-6"
//                   style={{ border: '1.5px dashed #2a2a5a', background: '#0a0a1a' }}
//                   onClick={() => fileRef.current?.click()}
//                 >
//                   <span className="text-3xl">📷</span>
//                   <p className="text-gray-500 text-xs text-center">Click để chọn ảnh của bạn<br /><span className="text-gray-700">JPG, PNG, WebP</span></p>
//                 </div>
//               )}

//               <div className="flex gap-2">
//                 <button onClick={() => fileRef.current?.click()}
//                   className="flex-1 py-2 rounded-lg text-sm text-violet-400 font-medium"
//                   style={{ background: '#14143a', border: '1px solid #2a2a5a' }}>
//                   {value.type === 'photo' && value.photoUrl ? 'Đổi ảnh' : 'Chọn ảnh'}
//                 </button>
//                 {value.type === 'photo' && value.photoUrl && (
//                   <button onClick={() => onChange({ ...DEFAULT_AVATAR })}
//                     className="px-3 py-2 rounded-lg text-xs text-gray-500"
//                     style={{ background: '#14143a', border: '1px solid #1e1e4a' }}>
//                     Dùng nhân vật
//                   </button>
//                 )}
//               </div>

//               <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// // ==================== HELPERS / SMALL COMPONENTS ====================

// const makeAvatar = (skinTone: string, hairStyle: number, hairColor: string, outfitColor: string, accessory = 0): AvatarConfig =>
//   ({ type: 'custom', skinTone, hairStyle, hairColor, outfitColor, accessory })

// const getLevel = (exp: number) => Math.max(1, Math.floor(Math.sqrt(exp / 40)) + 1)

// const getExpProgress = (exp: number) => {
//   const level = getLevel(exp)
//   const cur = Math.pow(level - 1, 2) * 40
//   const next = Math.pow(level, 2) * 40
//   return { progress: Math.min(100, Math.max(0, ((exp - cur) / (next - cur)) * 100)), needed: next - exp, level }
// }

// const fmtDate = (s: string) => new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
// const fmtTime = (s: string) => new Date(s).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

// // Tìm các vị trí "@Tên đầy đủ" khớp với danh sách user trong nội dung tin nhắn
// function parseMentions(content: string, users: User[]): { start: number; end: number; user: User }[] {
//   const candidates = [...users].sort((a, b) => b.name.length - a.name.length)
//   const matches: { start: number; end: number; user: User }[] = []
//   let i = 0
//   while (i < content.length) {
//     if (content[i] === '@') {
//       const rest = content.slice(i + 1)
//       const match = candidates.find(u => rest.startsWith(u.name))
//       if (match) {
//         const end = i + 1 + match.name.length
//         matches.push({ start: i, end, user: match })
//         i = end
//         continue
//       }
//     }
//     i++
//   }
//   return matches
// }

// // Tìm các đường link http(s):// hoặc www. trong nội dung tin nhắn
// function parseLinks(content: string): { start: number; end: number; url: string }[] {
//   const regex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi
//   const matches: { start: number; end: number; url: string }[] = []
//   let m: RegExpExecArray | null
//   while ((m = regex.exec(content)) !== null) {
//     let end = m.index + m[0].length
//     // Bỏ dấu câu thừa ở cuối link (dấu chấm, phẩy, ngoặc đóng...)
//     while (end > m.index && /[.,!?)\]]/.test(content[end - 1])) end--
//     if (end <= m.index) continue
//     const raw = content.slice(m.index, end)
//     const url = raw.startsWith('http') ? raw : `https://${raw}`
//     matches.push({ start: m.index, end, url })
//   }
//   return matches
// }

// // Render nội dung tin nhắn: tô màu @tag (bấm để xem hồ sơ) và biến link thành đường dẫn bấm được
// function renderMessageContent(content: string, users: User[], onMentionClick?: (u: User) => void) {
//   type Token = { start: number; end: number; type: 'mention'; user: User } | { start: number; end: number; type: 'link'; url: string }
//   const mentionTokens: Token[] = parseMentions(content, users).map(m => ({ ...m, type: 'mention' as const }))
//   const linkTokens: Token[] = parseLinks(content).map(l => ({ ...l, type: 'link' as const }))
//   const tokens = [...mentionTokens, ...linkTokens].sort((a, b) => a.start - b.start)

//   if (tokens.length === 0) return content

//   const nodes: React.ReactNode[] = []
//   let cursor = 0
//   tokens.forEach((t, idx) => {
//     if (t.start < cursor) return // bỏ qua nếu chồng lấn (hiếm khi xảy ra)
//     if (t.start > cursor) nodes.push(content.slice(cursor, t.start))
//     if (t.type === 'mention') {
//       nodes.push(
//         <span key={idx}
//           onClick={e => { e.stopPropagation(); onMentionClick?.(t.user) }}
//           style={{ color: '#facc15', fontWeight: 600, cursor: onMentionClick ? 'pointer' : 'default', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
//           {content.slice(t.start, t.end)}
//         </span>
//       )
//     } else {
//       nodes.push(
//         <a key={idx} href={t.url} target="_blank" rel="noopener noreferrer"
//           onClick={e => e.stopPropagation()}
//           style={{ color: '#60a5fa', textDecoration: 'underline', textUnderlineOffset: '2px', wordBreak: 'break-all' }}>
//           {content.slice(t.start, t.end)}
//         </a>
//       )
//     }
//     cursor = t.end
//   })
//   if (cursor < content.length) nodes.push(content.slice(cursor))
//   return nodes
// }

// function LevelBadge({ exp }: { exp: number }) {
//   return (
//     <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-white"
//       style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}>
//       Lv.{getLevel(exp)}
//     </span>
//   )
// }

// // Kiểm tra 1 tin nhắn có nằm trong phạm vi user này được xem không (dùng để đếm mention chính xác)
// function isMessageVisibleTo(m: Message, user: User, users: User[]): boolean {
//   if (m.channel === 'dm') return m.userId === user.id || m.toUserId === user.id
//   if (m.channel === 'team') return users.find(u => u.id === m.userId)?.teamId === user.teamId
//   return true
// }

// function ExpBarMini({ exp }: { exp: number }) {
//   const { progress } = getExpProgress(exp)
//   return (
//     <div className="h-1.5 bg-[#1a1a3a] rounded-full overflow-hidden">
//       <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#f59e0b)', transition: 'width 0.6s ease' }} />
//     </div>
//   )
// }

// // ==================== MOCK DATA ====================

// const MOCK_USERS: User[] = [
//   { id: 'u1', name: 'Nguyễn Minh Khoa', role: 'manager', avatar: makeAvatar('#C68642', 0, '#1a1a1a', '#4f46e5', 0), exp: 3200, teamId: 't1', department: 'Engineering' },
//   { id: 'u2', name: 'Trần Thị Mai', role: 'manager', avatar: makeAvatar('#E8A87C', 2, '#8B4513', '#0891b2', 4), exp: 2800, teamId: 't2', department: 'Design' },
//   { id: 'u3', name: 'Lê Văn Nam', role: 'employee', avatar: makeAvatar('#8D5524', 0, '#1a1a1a', '#dc2626', 0), exp: 1850, teamId: 't1', department: 'Engineering' },
//   { id: 'u4', name: 'Phạm Thu Thảo', role: 'employee', avatar: makeAvatar('#E8A87C', 5, '#4a2c0a', '#7c3aed', 1), exp: 2100, teamId: 't1', department: 'Engineering' },
//   { id: 'u5', name: 'Hoàng Đức Minh', role: 'employee', avatar: makeAvatar('#FDBCB4', 1, '#C0392B', '#059669', 0), exp: 1620, teamId: 't1', department: 'Engineering' },
//   { id: 'u6', name: 'Vũ Lan Anh', role: 'employee', avatar: makeAvatar('#FDBCB4', 3, '#FF69B4', '#ec4899', 4), exp: 1900, teamId: 't2', department: 'Design' },
//   { id: 'u7', name: 'Đặng Quốc Hưng', role: 'employee', avatar: makeAvatar('#4A2912', 4, '#1a1a1a', '#374151', 0), exp: 2300, teamId: 't2', department: 'Design' },
//   { id: 'u8', name: 'Bùi Thanh Tú', role: 'employee', avatar: makeAvatar('#C68642', 1, '#D4AC0D', '#d97706', 2), exp: 980, teamId: 't2', department: 'Design' },
// ]

// // const INITIAL_TASKS: Task[] = [
// //   { id: 't1', title: 'Xây dựng API authentication', description: 'Implement JWT authentication với refresh token và blacklist', expReward: 150, status: 'in-progress', assignedTo: 'u3', projectManager: 'u1', supporters: ['u4', 'u5'], createdBy: 'u1', dueDate: '2026-07-30', category: 'development', priority: 'high', selfCreated: false },
// //   { id: 't2', title: 'Thiết kế UI Dashboard', description: 'Tạo Figma mockup cho trang dashboard chính theo Design System mới', expReward: 80, status: 'open', assignedTo: 'u6', projectManager: 'u2', supporters: ['u7'], createdBy: 'u2', dueDate: '2026-07-28', category: 'design', priority: 'medium', selfCreated: false },
// //   { id: 't3', title: 'Viết unit tests cho Payment', description: 'Coverage tối thiểu 80% cho toàn bộ module payment', expReward: 100, status: 'completed', assignedTo: 'u4', projectManager: 'u1', supporters: [], createdBy: 'u1', dueDate: '2026-07-22', category: 'development', priority: 'high', selfCreated: false },
// //   { id: 't4', title: 'Tối ưu query database', description: 'Giảm response time của báo cáo xuống dưới 2 giây', expReward: 120, status: 'open', projectManager: 'u1', supporters: ['u3'], createdBy: 'u1', dueDate: '2026-08-05', category: 'development', priority: 'medium', selfCreated: false },
// //   { id: 't5', title: 'Học React Query', description: 'Tự học và áp dụng React Query vào dự án hiện tại', expReward: 60, status: 'in-progress', assignedTo: 'u3', supporters: [], createdBy: 'u3', dueDate: '2026-07-29', category: 'research', priority: 'low', selfCreated: true },
// //   { id: 't6', title: 'Review PR của team', description: 'Review ít nhất 5 pull request trong tuần này', expReward: 40, status: 'open', assignedTo: 'u5', projectManager: 'u1', supporters: [], createdBy: 'u1', dueDate: '2026-07-26', category: 'development', priority: 'low', selfCreated: false },
// //   { id: 't7', title: 'Xây dựng Design System', description: 'Setup Storybook và tạo component library đầy đủ', expReward: 200, status: 'open', assignedTo: 'u7', projectManager: 'u2', supporters: ['u6', 'u8'], createdBy: 'u2', dueDate: '2026-08-10', category: 'design', priority: 'high', selfCreated: false },
// //   { id: 't8', title: 'Viết tài liệu API', description: 'Swagger docs đầy đủ cho tất cả API endpoints', expReward: 70, status: 'open', projectManager: 'u1', supporters: [], createdBy: 'u1', dueDate: '2026-08-01', category: 'development', priority: 'medium', selfCreated: false },
// // ]
// const INITIAL_TASKS: Task[] = [
//   { id: 't1', title: 'Xây dựng API authentication', description: 'Implement JWT authentication với refresh token và blacklist', expReward: 150, status: 'in-progress', assignedTo: ['u3'], projectManager: ['u1'], supporters: ['u4', 'u5'], createdBy: 'u1', dueDate: '2026-07-30', category: 'development', priority: 'high', selfCreated: false, important: false, urgent: false },  
//   { id: 't2', title: 'Thiết kế UI Dashboard', description: 'Tạo Figma mockup cho trang dashboard chính theo Design System mới', expReward: 80, status: 'open', assignedTo: ['u6'], projectManager: ['u2'], supporters: ['u7'], createdBy: 'u2', dueDate: '2026-07-28', category: 'design', priority: 'medium', selfCreated: false , important: false, urgent: false},
//   { id: 't3', title: 'Viết unit tests cho Payment', description: 'Coverage tối thiểu 80% cho toàn bộ module payment', expReward: 100, status: 'completed', assignedTo: ['u4'], projectManager: ['u1'], supporters: [], createdBy: 'u1', dueDate: '2026-07-22', category: 'development', priority: 'high', selfCreated: false, important: false, urgent: false },
//   { id: 't4', title: 'Tối ưu query database', description: 'Giảm response time của báo cáo xuống dưới 2 giây', expReward: 120, status: 'open', assignedTo: [], projectManager: ['u1'], supporters: ['u3'], createdBy: 'u1', dueDate: '2026-08-05', category: 'development', priority: 'medium', selfCreated: false, important: false, urgent: false },
//   { id: 't5', title: 'Học React Query', description: 'Tự học và áp dụng React Query vào dự án hiện tại', expReward: 60, status: 'in-progress', assignedTo: ['u3'], projectManager: [], supporters: [], createdBy: 'u3', dueDate: '2026-07-29', category: 'research', priority: 'low', selfCreated: true , important: false, urgent: false},
//   { id: 't6', title: 'Review PR của team', description: 'Review ít nhất 5 pull request trong tuần này', expReward: 40, status: 'open', assignedTo: ['u5'], projectManager: ['u1'], supporters: [], createdBy: 'u1', dueDate: '2026-07-26', category: 'development', priority: 'low', selfCreated: false , important: false, urgent: false},
//   { id: 't7', title: 'Xây dựng Design System', description: 'Setup Storybook và tạo component library đầy đủ', expReward: 200, status: 'open', assignedTo: ['u7'], projectManager: ['u2'], supporters: ['u6', 'u8'], createdBy: 'u2', dueDate: '2026-08-10', category: 'design', priority: 'high', selfCreated: false, important: false, urgent: false },
//   { id: 't8', title: 'Viết tài liệu API', description: 'Swagger docs đầy đủ cho tất cả API endpoints', expReward: 70, status: 'open', assignedTo: [], projectManager: ['u1'], supporters: [], createdBy: 'u1', dueDate: '2026-08-01', category: 'development', priority: 'medium', selfCreated: false, important: false, urgent: false },
// ]

// const INITIAL_MESSAGES: Message[] = [
//   { id: 'm1', userId: 'u1', content: '🎉 Chào mừng team đến với WorkQuest! Hãy cùng chinh phục những thử thách mới nhé!', timestamp: '2026-07-23T08:00:00', channel: 'announcements' },
//   { id: 'm2', userId: 'u3', content: 'API auth đang tiến triển tốt, dự kiến xong vào thứ 5!', timestamp: '2026-07-23T09:15:00', channel: 'general' },
//   { id: 'm3', userId: 'u4', content: 'Vừa hoàn thành unit test rồi mọi người ơi! 🎊', timestamp: '2026-07-23T09:30:00', channel: 'general' },
//   { id: 'm4', userId: 'u6', content: 'Ai có design brief cho dashboard không? Chia sẻ mình với!', timestamp: '2026-07-23T10:00:00', channel: 'general' },
//   { id: 'm5', userId: 'u2', content: 'Đã upload lên Drive rồi nha Lan Anh, check folder "Q3 Design" nhé 📁', timestamp: '2026-07-23T10:05:00', channel: 'general' },
//   { id: 'm6', userId: 'u5', content: 'React Query hay thật, đang tìm hiểu Optimistic Updates 🚀', timestamp: '2026-07-23T10:45:00', channel: 'general' },
//   { id: 'm7', userId: 'u7', content: 'Design System đang setup xong Storybook, sẽ share preview link hôm nay!', timestamp: '2026-07-23T11:00:00', channel: 'general' },
//   { id: 'm8', userId: 'u1', content: '🏆 Tuần này team Engineering hoàn thành 87% target! Keep it up!', timestamp: '2026-07-23T11:30:00', channel: 'announcements' },
//   { id: 'm9', userId: 'u3', content: 'Cần hỗ trợ setup môi trường test không team?', timestamp: '2026-07-23T13:00:00', channel: 'team' },
//   { id: 'm10', userId: 'u4', content: 'Mình có thể giúp, nhắn sau standup nhé! 💪', timestamp: '2026-07-23T13:10:00', channel: 'team' },
// ]

// const REWARDS: Reward[] = [
//   { id: 'r1', name: 'Voucher WinMart', description: 'Voucher mua sắm 100.000đ', cost: 200, emoji: '🛒', category: 'Mua sắm' },
//   { id: 'r2', name: 'Nghỉ phép 1 ngày', description: '01 ngày nghỉ có hưởng lương', cost: 1000, emoji: '🏖️', category: 'Phúc lợi' },
//   { id: 'r3', name: 'Voucher Grab', description: 'Voucher GrabFood/GrabCar 200.000đ', cost: 500, emoji: '🛵', category: 'Phúc lợi' },
//   { id: 'r4', name: 'Team Lunch', description: 'Bữa trưa cùng team tối đa 8 người', cost: 800, emoji: '🍜', category: 'Ẩm thực' },
//   { id: 'r5', name: 'Voucher Shopee', description: 'Voucher mua sắm 150.000đ', cost: 350, emoji: '🛍️', category: 'Mua sắm' },
//   { id: 'r6', name: 'Combo phụ kiện', description: 'Chuột, bàn phím hoặc tai nghe', cost: 3000, emoji: '🖥️', category: 'Thiết bị' },
//   { id: 'r7', name: 'WFH 1 ngày', description: 'Làm việc từ xa 1 ngày', cost: 150, emoji: '🏠', category: 'Phúc lợi' },
//   { id: 'r8', name: 'Voucher CGV', description: 'Voucher xem phim 150.000đ', cost: 250, emoji: '🎬', category: 'Giải trí' },
//   { id: 'r9', name: 'Khám sức khỏe', description: 'Voucher khám sức khỏe 300.000đ', cost: 400, emoji: '🩺', category: 'Sức khỏe' },
// ]

// // const TEAMS = [
// //   { id: 't1', name: 'Engineering', emoji: '⚙️' },
// //   { id: 't2', name: 'Design', emoji: '🎨' },
// //   { id: 't3', name: 'Marketing', emoji: '📣' },
// //   { id: 't4', name: 'Sales', emoji: '💼' },
// //   { id: 't5', name: 'HR', emoji: '🧑\u200d🤝\u200d🧑' },
// //   { id: 't6', name: 'Customer Support', emoji: '🎧' },
// // ]
// const TEAMS = [
//   { id: 't1a', name: 'KNI Office - Ban Giám đốc', emoji: '👑' },
//   { id: 't1b', name: 'KNI Office - Văn phòng HĐQT', emoji: '📋' },
//   { id: 't1c', name: 'KNI Office - Nhân sự-IT-Pháp chế', emoji: '🧑‍💻' },
//   { id: 't1d', name: 'KNI Office - Truyền thông-Marketing', emoji: '📣' },
//   { id: 't1e', name: 'KNI Office - Kế toán', emoji: '💰' },
//   { id: 't1f', name: 'KNI Office - Dự án', emoji: '🏗️' },
//   { id: 't1g', name: 'KNI Office - Hỗ trợ', emoji: '🚗' },
//   { id: 't2', name: 'First Steps', emoji: '🌱' },
//   { id: 't3a', name: 'Genki House - Điều hành', emoji: '👑' },
//   { id: 't3b', name: 'Genki House - Bếp', emoji: '🍳' },
//   { id: 't3c', name: 'Genki House - Y tế-Trị liệu', emoji: '⚕️' },
//   { id: 't3d', name: 'Genki House - Hoạt động-Chăm sóc', emoji: '🧘' },
//   { id: 't3e', name: 'Genki House - Kinh doanh-Lễ tân', emoji: '💼' },
//   { id: 't3f', name: 'Genki House - Hỗ trợ', emoji: '🧹' },
//   { id: 't4', name: 'Genki Farm', emoji: '🌾' },
//   { id: 't5', name: 'Les Sens Phú Quốc', emoji: '🏝️' },
//   { id: 't6', name: 'ACVN', emoji: '🎓' },
// ]



// const CATEGORY_COLORS: Record<string, string> = {
//   development: '#8b5cf6', design: '#06b6d4', marketing: '#f59e0b',
//   research: '#10b981', operations: '#f97316', personal: '#6b7280',
// }
// const PRIORITY_CONFIG = {
//   high: { label: 'Cao', color: '#ef4444', bg: '#200a0a' },
//   medium: { label: 'Trung bình', color: '#f59e0b', bg: '#1a1000' },
//   low: { label: 'Thấp', color: '#6b7280', bg: '#111118' },
// }
// const PRIORITY_EXP_LIMITS: Record<TaskPriority, { min: number; max: number; suggested: number; hint: string }> = {
//   low: { min: 20, max: 60, suggested: 30, hint: '💡 Việc dễ, xong trong ngày → nên cho 20–60 EXP' },
//   medium: { min: 60, max: 150, suggested: 80, hint: '💡 Việc vừa, làm 2–3 ngày → nên cho 60–150 EXP' },
//   high: { min: 150, max: 300, suggested: 200, hint: '💡 Việc khó, nhiều ngày/phức tạp → nên cho 150–300 EXP' },
// }
// function getExpRange(priority: TaskPriority, important: boolean, urgent: boolean) {
//   const base = PRIORITY_EXP_LIMITS[priority]
//   const multiplier = (important ? 1.25 : 1.0) * (urgent ? 1.2 : 1.0)
//   return {
//     min: Math.round(base.min * multiplier),
//     max: Math.round(base.max * multiplier),
//     suggested: Math.round(base.suggested * multiplier),
//   }
// }
// function suggestExp(priority: TaskPriority, startDate: string, dueDate: string, important: boolean, urgent: boolean): number {
//   const range = getExpRange(priority, important, urgent)
//   if (!startDate || !dueDate) return range.suggested

//   const days = Math.round((new Date(dueDate).getTime() - new Date(startDate).getTime()) / 86400000)
//   const clampedDays = Math.min(Math.max(days, 1), 7)
//   const ratio = (7 - clampedDays) / 6 // 1 ngày → ratio 1 (điểm cao nhất khung); 7+ ngày → ratio 0 (điểm thấp nhất khung)

//   return Math.round(range.min + (range.max - range.min) * ratio)
// }
// // % của EXP gốc mà mỗi người "Hỗ trợ" nhận được khi task hoàn thành (Phụ trách/PM luôn nhận đủ 100%)
// const SUPPORTER_EXP_PERCENT = 0.3
// const STATUS_CONFIG = {
//   open: { label: 'Chưa bắt đầu', color: '#6b7280' },
//   'in-progress': { label: 'Đang làm', color: '#06b6d4' },
//   submitted: { label: 'Chờ duyệt', color: '#a78bfa' },
//   completed: { label: 'Hoàn thành', color: '#10b981' },
// }

// // ==================== LOGIN SCREEN ====================

// // function LoginScreen({ onLogin }: { onLogin: (u: User) => void }) {
// //   const [step, setStep] = useState<'role' | 'setup'>('role')
// //   const [role, setRole] = useState<Role>('employee')
// //   const [name, setName] = useState('')
// //   const [avatar, setAvatar] = useState<AvatarConfig>({ ...DEFAULT_AVATAR })

// //   const handleLogin = () => {
// //     if (!name.trim()) return
// //     onLogin({
// //       id: `user_${Date.now()}`,
// //       name: name.trim(),
// //       role,
// //       avatar,
// //       exp: role === 'manager' ? 800 : 100,
// //       teamId: 't1',
// //       department: role === 'manager' ? 'Engineering' : 'Engineering',
// //     })
// //   }

// //   return (
// //     <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
// //       style={{ background: 'radial-gradient(ellipse at 20% 50%, #1a0a3a 0%, #080812 50%, #0a1a0a 100%)', fontFamily: 'Inter, sans-serif' }}>
// //       {[...Array(20)].map((_, i) => (
// //         <div key={i} className="absolute rounded-full pointer-events-none"
// //           style={{
// //             width: Math.random() * 4 + 1, height: Math.random() * 4 + 1,
// //             left: `${(i * 17 + 5) % 100}%`, top: `${(i * 23 + 8) % 100}%`,
// //             background: i % 2 === 0 ? '#7c3aed' : '#f59e0b',
// //             animation: `float ${3 + (i % 4)}s ease-in-out infinite`,
// //             animationDelay: `${(i * 0.4) % 3}s`,
// //           }} />
// //       ))}

// //       <div className="w-full max-w-2xl mx-4 relative z-10">
// //         <div className="text-center mb-7">
// //           <div className="inline-flex items-center gap-3 mb-3">
// //             <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
// //               style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}>⚔️</div>
// //             <h1 className="text-5xl font-black tracking-widest"
// //               style={{ fontFamily: 'Rajdhani, sans-serif', background: 'linear-gradient(135deg, #7c3aed, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 20px #7c3aed60)' }}>
// //               WORKQUEST
// //             </h1>
// //           </div>
// //           <p className="text-gray-500 text-sm tracking-widest uppercase">Biến công việc thành cuộc phiêu lưu</p>
// //         </div>

// //         {step === 'role' ? (
// //           <div className="rounded-2xl p-6 animate-slide-up" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
// //             <h2 className="text-white text-xl font-bold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Bạn là ai trong công ty?</h2>
// //             <p className="text-gray-500 text-sm mb-5">Chọn vai trò để bắt đầu hành trình</p>
// //             <div className="grid grid-cols-2 gap-4">
// //               {[
// //                 { r: 'manager' as Role, icon: '👑', title: 'Quản Lý', desc: 'Giao task, quản lý team và nhận EXP dựa trên hiệu suất cả team', tag: 'Team-based scoring', tagColor: '#a78bfa', bg: '#1a1040', border: '#2a1a6a' },
// //                 { r: 'employee' as Role, icon: '⚔️', title: 'Nhân Viên', desc: 'Nhận task, hoàn thành mục tiêu và kiếm EXP để đổi phần thưởng', tag: 'Individual scoring', tagColor: '#34d399', bg: '#0a1a10', border: '#1a4a2a' },
// //               ].map(opt => (
// //                 <button key={opt.r} onClick={() => { setRole(opt.r); setStep('setup') }}
// //                   className="p-6 rounded-xl text-left transition-all hover:scale-[1.02]"
// //                   style={{ background: `linear-gradient(135deg, ${opt.bg}, #0e0e24)`, border: `1px solid ${opt.border}` }}>
// //                   <div className="text-4xl mb-3">{opt.icon}</div>
// //                   <div className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{opt.title}</div>
// //                   <div className="text-gray-400 text-xs mb-3 leading-relaxed">{opt.desc}</div>
// //                   <div className="text-xs" style={{ color: opt.tagColor }}>⚡ {opt.tag}</div>
// //                 </button>
// //               ))}
// //             </div>
// //           </div>
// //         ) : (
// //           <div className="rounded-2xl p-6 animate-slide-up" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
// //             <div className="flex items-center gap-3 mb-5">
// //               <button onClick={() => setStep('role')} className="text-gray-500 hover:text-gray-300 text-sm">← Quay lại</button>
// //               <div>
// //                 <h2 className="text-white text-xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Tạo hồ sơ nhân vật</h2>
// //                 <p className="text-gray-600 text-xs">{role === 'manager' ? '👑 Quản Lý' : '⚔️ Nhân Viên'}</p>
// //               </div>
// //             </div>

// //             <div className="mb-4">
// //               <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Tên của bạn</label>
// //               <input type="text" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
// //                 placeholder="Nhập tên hiển thị..."
// //                 className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
// //                 style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
// //             </div>

// //             <AvatarCreator value={avatar} onChange={setAvatar} />

// //             <button onClick={handleLogin} disabled={!name.trim()}
// //               className="w-full mt-5 py-3.5 rounded-xl font-bold text-white text-lg tracking-wide transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
// //               style={{
// //                 fontFamily: 'Rajdhani, sans-serif',
// //                 background: name.trim() ? 'linear-gradient(135deg, #7c3aed, #f59e0b)' : '#1e1e3a',
// //                 boxShadow: name.trim() ? '0 0 30px #7c3aed50' : 'none',
// //               }}>
// //               BẮT ĐẦU HÀNH TRÌNH ⚡
// //             </button>
// //           </div>
// //         )}
// //         <p className="text-center text-gray-700 text-xs mt-4">WorkQuest v1.0 — Gamify Your Workday</p>
// //       </div>
// //     </div>
// //   )
// // }

// function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
//   const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup')
//   const [step] = useState<'setup'>('setup')
//   const [role, setRole] = useState<Role>('employee')
//   const [name, setName] = useState('')
//   const [avatar, setAvatar] = useState<AvatarConfig>({ ...DEFAULT_AVATAR })
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [signupCode, setSignupCode] = useState('')
//   const [agreedTerms, setAgreedTerms] = useState(false)

//   const handleSignUp = async () => {
//   if (!email.trim() || !password.trim()) return
//   if (!agreedTerms) { setError('Vui lòng đọc và đồng ý với điều khoản bảo mật mã xác nhận trước khi tạo tài khoản.'); return }
//   setError('')
//   setLoading(true)

//   const { data: directoryEntry, error: lookupError } = await supabase
//   .from('employee_directory')
//   .select('*')
//   .eq('email', email.trim().toLowerCase())
//   .maybeSingle()

// if (lookupError) { setLoading(false); setError('Lỗi tra cứu: ' + lookupError.message); return }
// if (!directoryEntry) {
//   setLoading(false)
//   setError('Email này không có trong danh sách nhân viên công ty.')
//   return
// }
// if (directoryEntry.signup_code !== signupCode.trim().toUpperCase()) {
//   setLoading(false)
//   setError('Mã xác nhận không đúng. Liên hệ quản trị viên để lấy lại mã.')
//   return
// }

//   const { data, error: signUpError } = await supabase.auth.signUp({
//     email: email.trim().toLowerCase(),
//     password,
//     options: { data: { display_name: name.trim(), avatar } },
//   })
//   if (signUpError) { setLoading(false); setError(signUpError.message); return }
//   if (!data.user) { setLoading(false); setError('Kiểm tra email để xác nhận tài khoản, sau đó đăng nhập lại.'); return }

//   const team = TEAMS.find(t => t.id === directoryEntry.team_id)

// //   const { error: profileError } = await supabase.from('profiles').insert({
// //     id: data.user.id,
// //     name: directoryEntry.full_name,
// //     role: directoryEntry.role,
// //     avatar,
// //     exp: 0,
// //     team_id: directoryEntry.team_id,
// //     department: team?.name ?? '',
// //   })
// //   setLoading(false)
// //   if (profileError) { setError(profileError.message); return }
// //   onLoggedIn()
// // }
//     setLoading(false)
//     if (!data.session) {
//       setError('Đăng ký thành công! Kiểm tra email để xác nhận, sau đó quay lại đăng nhập.')
//       return
//     }}
// onLoggedIn()
//   const handleSignIn = async () => {
//     if (!email.trim() || !password.trim()) return
//     setError('')
//     setLoading(true)
//     const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
//     setLoading(false)
//     if (signInError) { setError(signInError.message); return }
//     onLoggedIn()
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
//       style={{ background: 'radial-gradient(ellipse at 20% 50%, #1a0a3a 0%, #080812 50%, #0a1a0a 100%)', fontFamily: 'Inter, sans-serif' }}>
//       {[...Array(20)].map((_, i) => (
//         <div key={i} className="absolute rounded-full pointer-events-none"
//           style={{
//             width: Math.random() * 4 + 1, height: Math.random() * 4 + 1,
//             left: `${(i * 17 + 5) % 100}%`, top: `${(i * 23 + 8) % 100}%`,
//             background: i % 2 === 0 ? '#7c3aed' : '#f59e0b',
//             animation: `float ${3 + (i % 4)}s ease-in-out infinite`,
//             animationDelay: `${(i * 0.4) % 3}s`,
//           }} />
//       ))}

//       <div className="w-full max-w-2xl mx-4 relative z-10">
//         <div className="text-center mb-7">
//           <div className="inline-flex flex-col items-center gap-3 mb-3">
//             <img src={companyLogo} alt="KNI Investment Holdings"
//               className="h-16 rounded-xl" style={{ filter: 'drop-shadow(0 0 20px #7c3aed40)' }} />
//             <h1 className="text-2xl font-black tracking-widest"
//               style={{ fontFamily: 'Rajdhani, sans-serif', color: '#e2e8f0' }}>
//               KNI TASK MANAGEMENT
//             </h1>
//           </div>
//           <p className="text-gray-500 text-sm tracking-widest uppercase">Hệ thống quản lý công việc nội bộ</p>
//         </div>

//         {/* --- Chuyển đổi Đăng nhập / Đăng ký --- */}
//         <div className="flex justify-center gap-2 mb-5">
//           <button onClick={() => { setAuthMode('signup'); setError('') }}
//             className="px-5 py-1.5 rounded-full text-xs font-bold tracking-wide"
//             style={{ background: authMode === 'signup' ? 'linear-gradient(135deg,#7c3aed,#f59e0b)' : '#14143a', color: authMode === 'signup' ? '#fff' : '#6b7280' }}>
//             TẠO TÀI KHOẢN
//           </button>
//           <button onClick={() => { setAuthMode('signin'); setError('') }}
//             className="px-5 py-1.5 rounded-full text-xs font-bold tracking-wide"
//             style={{ background: authMode === 'signin' ? 'linear-gradient(135deg,#7c3aed,#f59e0b)' : '#14143a', color: authMode === 'signin' ? '#fff' : '#6b7280' }}>
//             ĐĂNG NHẬP
//           </button>
//         </div>

//         {authMode === 'signin' ? (
//           /* --- FORM ĐĂNG NHẬP (cho người đã có tài khoản) --- */
//           <div className="rounded-2xl p-6 animate-slide-up" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//             <h2 className="text-white text-xl font-bold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Đăng nhập</h2>
//             <p className="text-gray-500 text-sm mb-5">Quay lại hành trình của bạn</p>

//             <div className="mb-3">
//               <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Email</label>
//               <input type="email" value={email} onChange={e => setEmail(e.target.value)}
//                 placeholder="ban@congty.com"
//                 className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
//                 style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//             </div>

//             <div className="mb-2">
//               <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Mật khẩu</label>
//               <input type="password" value={password} onChange={e => setPassword(e.target.value)}
//                 onKeyDown={e => e.key === 'Enter' && handleSignIn()}
//                 placeholder="••••••••"
//                 className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
//                 style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//             </div>

//             {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

//             <button onClick={handleSignIn} disabled={loading || !email.trim() || !password.trim()}
//               className="w-full mt-3 py-3.5 rounded-xl font-bold text-white text-lg tracking-wide transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
//               style={{
//                 fontFamily: 'Rajdhani, sans-serif',
//                 background: 'linear-gradient(135deg, #7c3aed, #f59e0b)',
//                 boxShadow: '0 0 30px #7c3aed50',
//               }}>
//               {loading ? 'ĐANG XỬ LÝ...' : 'VÀO GAME ⚡'}
//             </button>
//           </div>
        
//           ) : (
//           /* --- BƯỚC 2 CỦA ĐĂNG KÝ: tên, avatar + email/password mới --- */
//           <div className="rounded-2xl p-6 animate-slide-up" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//             <div className="mb-5">
//               <h2 className="text-white text-xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Tạo hồ sơ nhân vật</h2>
//             </div>

//             <div className="grid grid-cols-2 gap-3 mb-4">
//               <div>
//                 <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Tên của bạn</label>
//                 <input type="text" value={name} onChange={e => setName(e.target.value)}
//                   placeholder="Nhập tên hiển thị..."
//                   className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
//                   style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//               </div>
//               <div>
//                 <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Email</label>
//                 <input type="email" value={email} onChange={e => setEmail(e.target.value)}
//                   placeholder="ban@congty.com"
//                   className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
//                   style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//               </div>
//             </div>
            
//             <div className="mb-2">
//               <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Mã xác nhận (do công ty cấp)</label>
//               <input type="text" value={signupCode} onChange={e => setSignupCode(e.target.value)}
//                 placeholder="VD: A3F9K2"
//                 className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none uppercase"
//                 style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//             </div>
//             <p className="text-amber-400/80 text-[11px] mb-4 leading-relaxed">
//               ⚠️ Mã xác nhận này là thông tin riêng tư, chỉ dành cho bạn. Vui lòng không cung cấp mã cho bất kỳ ai khác dưới mọi hình thức.
//             </p>

//             <div className="mb-4">
//               <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Mật khẩu</label>
//               <input type="password" value={password} onChange={e => setPassword(e.target.value)}
//                 onKeyDown={e => e.key === 'Enter' && handleSignUp()}
//                 placeholder="Tối thiểu 6 ký tự"
//                 className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
//                 style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//             </div>

//             <AvatarCreator value={avatar} onChange={setAvatar} />

//             <label className="flex items-start gap-2.5 mt-5 cursor-pointer select-none">
//               <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)}
//                 className="w-4 h-4 mt-0.5 rounded accent-violet-500 flex-shrink-0" />
//               <span className="text-gray-400 text-xs leading-relaxed">
//                 Tôi đã đọc và đồng ý rằng mã xác nhận là thông tin bảo mật riêng của tôi, tôi sẽ không chia sẻ cho bất kỳ ai khác.
//               </span>
//             </label>

//             {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

//             <button onClick={handleSignUp} disabled={loading || !name.trim() || !email.trim() || !password.trim() || !agreedTerms}
//               className="w-full mt-5 py-3.5 rounded-xl font-bold text-white text-lg tracking-wide transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
//               style={{
//                 fontFamily: 'Rajdhani, sans-serif',
//                 background: (name.trim() && email.trim() && password.trim() && agreedTerms) ? 'linear-gradient(135deg, #7c3aed, #f59e0b)' : '#1e1e3a',
//                 boxShadow: (name.trim() && email.trim() && password.trim() && agreedTerms) ? '0 0 30px #7c3aed50' : 'none',
//               }}>
//               {loading ? 'ĐANG XỬ LÝ...' : 'BẮT ĐẦU HÀNH TRÌNH ⚡'}
//             </button>
//           </div>
//         )}
//         <p className="text-center text-gray-700 text-xs mt-4">WorkQuest v1.0 — Gamify Your Workday</p>
//       </div>
//     </div>
//   )
// }
// // ==================== DASHBOARD ====================

// function DashboardView({ currentUser, tasks, users, setTasks, setCurrentUser, setView }: {
//   currentUser: User; tasks: Task[]; users: User[]
//   setTasks: (t: Task[]) => void; setCurrentUser: (u: User) => void
//   setView: (v: View) => void
// }) {
//   const { progress, needed, level } = getExpProgress(currentUser.exp)
//   const isManager = currentUser.role === 'manager'
//   const myTasks = tasks.filter(t => t.assignedTo.includes(currentUser.id) || (t.selfCreated && t.createdBy === currentUser.id) || t.supporters.includes(currentUser.id))
//   const pending = myTasks.filter(t => t.status !== 'completed')
//   const teamExp = users.filter(u => u.teamId === currentUser.teamId).reduce((s, u) => s + u.exp, 0)

//   const handleComplete = (taskId: string, expReward: number) => {
//     setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t))
//     setCurrentUser({ ...currentUser, exp: currentUser.exp + expReward })
//   }

//   return (
//     <div className="p-6 max-w-6xl mx-auto space-y-5">
//       {/* Hero */}
//       <div className="rounded-2xl p-6 relative overflow-hidden"
//         style={{ background: `linear-gradient(135deg, ${currentUser.avatar.outfitColor}22, #0a0a1e)`, border: `1px solid ${currentUser.avatar.outfitColor}35` }}>
//         <div className="flex items-center gap-5">
//           <div className="rounded-2xl overflow-hidden flex-shrink-0"
//             style={{ width: 80, height: 96, background: `${currentUser.avatar.outfitColor}20`, border: `2px solid ${currentUser.avatar.outfitColor}40`, boxShadow: `0 0 30px ${currentUser.avatar.outfitColor}40` }}>
//             <FullAvatar avatar={currentUser.avatar} size={72} />
//           </div>
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 mb-1">
//               <span className="text-gray-400 text-sm">Xin chào,</span>
//               <LevelBadge exp={currentUser.exp} />
//               {isManager && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#1a0a3a', color: '#a78bfa' }}>👑 Manager</span>}
//             </div>
//             <h2 className="text-white text-2xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{currentUser.name}</h2>
            
//             <p className="text-gray-500 text-sm">{TEAMS.find(t => t.id === currentUser.teamId)?.name ?? 'Chưa có team'}</p>
//             <div className="mt-3">
//               <div className="flex justify-between text-xs mb-1.5">
//                 <span className="text-gray-500">Level {level} → {level + 1}</span>
//                 <span className="text-gray-600">Cần {needed} EXP</span>
//               </div>
//               <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1a1a3a' }}>
//                 <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#f59e0b)', transition: 'width 0.7s ease' }} />
//               </div>
//             </div>
//           </div>
//           <div className="text-right flex-shrink-0">
//             <div className="text-amber-400 text-4xl font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{currentUser.exp.toLocaleString()}</div>
//             <div className="text-gray-600 text-xs uppercase tracking-wider">EXP tổng</div>
//           </div>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-4 gap-4">
//         {[
//           { label: 'Task đang làm', value: myTasks.filter(t => t.status === 'in-progress').length, color: '#06b6d4', icon: '⚡' },
//           { label: 'Chưa bắt đầu', value: myTasks.filter(t => t.status === 'open').length, color: '#f59e0b', icon: '📋' },
//           { label: 'Hoàn thành', value: myTasks.filter(t => t.status === 'completed').length, color: '#10b981', icon: '✅' },
//           isManager
//             ? { label: 'Tổng EXP team', value: teamExp.toLocaleString(), color: '#a78bfa', icon: '👥' }
//             : { label: 'Hạng cá nhân', value: '#' + ([...users].sort((a, b) => b.exp - a.exp).findIndex(u => u.id === currentUser.id) + 1), color: '#ec4899', icon: '🏆' },
//         ].map(stat => (
//           <div key={stat.label} className="rounded-xl p-4" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-xl">{stat.icon}</span>
//               <span className="text-2xl font-black" style={{ color: stat.color, fontFamily: 'Rajdhani, sans-serif' }}>{stat.value}</span>
//             </div>
//             <div className="text-gray-500 text-xs">{stat.label}</div>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {/* Tasks */}
//         <div className="col-span-2 rounded-xl p-5" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//           <h3 className="text-white font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
//             ⚡ Task của tôi
//             <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: '#1e1e4a', color: '#6b7280' }}>{pending.length} chờ</span>
//           </h3>
//           <div className="space-y-2">
//             {pending.slice(0, 5).map(task => (
//               <div key={task.id} className="p-3 rounded-lg flex items-center gap-3 group"
//                 style={{ background: '#12122a', border: '1px solid #1a1a3a' }}>
//                 <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: PRIORITY_CONFIG[task.priority].color }} />
//                 <div className="flex-1 min-w-0">
//                   <div className="text-white text-sm font-medium truncate">
//                     {task.title}
//                     {task.selfCreated && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#1a2a1a', color: '#10b981' }}>Tự tạo</span>}
//                     {task.urgent && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#3a0a0a', color: '#f87171' }}>⏰ GẤP</span>}
//                     {task.important && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#3a1a0a', color: '#fbbf24' }}>🔥 Quan trọng</span>}
//                   </div>
//                   <div className="text-xs mt-0.5">
//                     <span style={{ color: STATUS_CONFIG[task.status].color }}>{STATUS_CONFIG[task.status].label}</span>
//                     <span className="text-gray-700 mx-1">·</span>
//                     <span className="text-gray-600">Hạn {fmtDate(task.dueDate)}</span>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 flex-shrink-0">
//                   <span className="text-amber-400 font-bold text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>+{task.expReward}</span>
//                   {task.assignedTo.includes(currentUser.id) && task.status === 'in-progress' && (
//                     <button onClick={() => setView('tasks')}
//                       className="text-xs px-3 py-1 rounded-lg font-semibold" style={{ background: '#1a1a40', color: '#a78bfa' }}>
//                       Vào nộp task →
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//             {pending.length === 0 && (
//               <div className="text-center py-8 text-gray-600">
//                 <div className="text-3xl mb-2">🎉</div>
//                 <div className="text-sm">Tất cả task đã hoàn thành!</div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Mini leaderboard */}
//         <div className="rounded-xl p-5" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//           <h3 className="text-white font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
//             🏆 {isManager ? 'Team' : 'Bảng xếp hạng'}
//           </h3>
//           <div className="space-y-3">
//             {(isManager ? users.filter(u => u.teamId === currentUser.teamId)
//               : users.filter(u => u.role === 'employee'))
//               .sort((a, b) => b.exp - a.exp).slice(0, 5).map((user, i) => (
//                 <div key={user.id} className="flex items-center gap-2.5">
//                   <span className="text-gray-600 text-xs w-4 font-mono">#{i + 1}</span>
//                   <CharAvatar user={user} size={28} />
//                   <div className="flex-1 min-w-0">
//                     <div className="text-white text-xs font-medium truncate">{user.name.split(' ').slice(-1)[0]}</div>
//                     <ExpBarMini exp={user.exp} />
//                   </div>
//                   <div className="text-amber-400 text-xs font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{user.exp}</div>
//                 </div>
//               ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ===========================================================================
// // function SubmitTaskModal({ task, currentUser, onClose }: { task: Task; currentUser: User; onClose: () => void }) {
// //   const [file, setFile] = useState<File | null>(null)
// //   const [note, setNote] = useState('')
// //   const [uploading, setUploading] = useState(false)
// //   const [error, setError] = useState('')

// //   // const handleSubmit = async () => {
// //   //   if (!file) { setError('Vui lòng chọn ảnh hoặc file kết quả trước khi nộp.'); return }
// //   //   setError('')
// //   //   setUploading(true)

// //   //   const ext = file.name.split('.').pop()
// //   //   const path = `${task.id}/${Date.now()}.${ext}`

// //   //   const { error: uploadError } = await supabase.storage.from('task-submissions').upload(path, file)
// //   //   if (uploadError) { setUploading(false); setError('Lỗi tải file: ' + uploadError.message); return }

// //   //   const { data: urlData } = supabase.storage.from('task-submissions').getPublicUrl(path)

// //   //   const { error: updateError } = await supabase.from('tasks').update({
// //   //     status: 'submitted',
// //   //     submission_file_url: urlData.publicUrl,
// //   //     submission_note: note.trim() || null,
// //   //     submitted_at: new Date().toISOString(),
// //   //     rejected_reason: null,
// //   //   }).eq('id', task.id)

// //   //   setUploading(false)
// //   //   if (updateError) { setError(updateError.message); return }
// //   //   onClose()
// //   // }
  
// //   const handleSubmit = async () => {
// //     if (!file) { setError('Vui lòng chọn ảnh hoặc file kết quả trước khi nộp.'); return }
// //     setError('')
// //     setUploading(true)

// //     const ext = file.name.split('.').pop()
// //     const path = `${task.id}/${Date.now()}.${ext}`

// //     const arrayBuffer = await file.arrayBuffer()
// //     const { error: uploadError } = await supabase.storage.from('task-submissions').upload(path, arrayBuffer, {
// //       contentType: file.type || 'application/octet-stream',
// //     })
// //     if (uploadError) { setUploading(false); setError('Lỗi tải file: ' + uploadError.message); return }

// //     const { data: urlData } = supabase.storage.from('task-submissions').getPublicUrl(path)

// //     const { error: updateError } = await supabase.from('tasks').update({
// //     status: 'submitted',
// //     submission_file_url: urlData.publicUrl,
// //     submission_note: note.trim() || null,
// //     submitted_at: new Date().toISOString(),
// //     rejected_reason: null,
// //   }).eq('id', task.id)

// //   setUploading(false)
// //   if (updateError) { setError(updateError.message); return }

// //   // Báo cho người tạo task + các QL dự án (bỏ trùng, bỏ qua nếu chính người nộp)
// //   const recipientIds = Array.from(new Set([task.createdBy, ...task.projectManager]))
// //     .filter(uid => uid && uid !== currentUser.id)

// //   for (const uid of recipientIds) {
// //     await supabase.from('notifications').insert({
// //       message: `📥 ${currentUser.name} vừa nộp kết quả task: ${task.title}`,
// //       target_user_id: uid,
// //     })
// //   }

// //   onClose()
// // }
// //   // const handleSubmit = async () => {
// //   //   if (!file) { setError('Vui lòng chọn ảnh hoặc file kết quả trước khi nộp.'); return }
// //   //   setError('')
// //   //   setUploading(true)

// //   //   const { data: sessionData } = await supabase.auth.getSession()
// //   //   const token = sessionData.session?.access_token

// //   //   const formData = new FormData()
// //   //   formData.append('file', file)
// //   //   formData.append('taskId', task.id)

// //   //   // const uploadRes = await fetch('https://legrsdmjstoxcoxvumgg.supabase.co/functions/v1/upload-to-b2', {
// //   //   //   method: 'POST',
// //   //   //   headers: { Authorization: `Bearer ${token}` },
// //   //   //   body: formData,
// //   //   // })
// //   //   // const uploadJson = await uploadRes.json()
// //   //   // if (!uploadRes.ok) { setUploading(false); setError('Lỗi tải file: ' + (uploadJson.error || 'lỗi không xác định')); return }
// //   //   let uploadJson
// //   //   try {
// //   //     const uploadRes = await fetch('https://legrsdmjstoxcoxvumgg.supabase.co/functions/v1/upload-to-b2', {
// //   //       method: 'POST',
// //   //       headers: { Authorization: `Bearer ${token}` },
// //   //       body: formData,
// //   //     })
// //   //     // uploadJson = await uploadRes.json()
// //   //     // if (!uploadRes.ok) { setUploading(false); setError('Lỗi tải file: ' + (uploadJson.error || 'lỗi không xác định')); return }
// //   //     uploadJson = await uploadRes.json()
// //   //     if (!uploadRes.ok) {
// //   //       setUploading(false)
// //   //       setError(`Lỗi tải file (status ${uploadRes.status}): ${uploadJson.error || uploadJson.message || JSON.stringify(uploadJson)}`)
// //   //       return
// //   //     }
// //   //   } catch (err) {
// //   //     setUploading(false)
// //   //     setError('Không kết nối được tới server upload: ' + String(err))
// //   //     return
// //   //   } 

// //   return (
// //     <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: '#000000a0' }}>
// //       <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
// //         <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Nộp kết quả task</h3>
// //         <p className="text-gray-500 text-sm mb-4">{task.title}</p>

// //         <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Ảnh / File kết quả</label>
// //         <input type="file" accept="image/*,.pdf,.doc,.docx,.zip"
// //           onChange={e => setFile(e.target.files?.[0] ?? null)}
// //           className="w-full text-sm text-gray-300 mb-4 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white"
// //         />

// //         <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Ghi chú (không bắt buộc)</label>
// //         <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
// //           placeholder="Mô tả ngắn gọn kết quả đã làm..."
// //           className="w-full px-4 py-2.5 mb-4 rounded-xl text-white placeholder-gray-600 text-sm outline-none resize-none"
// //           style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />

// //         {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

// //         <div className="flex gap-2">
// //           <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-400" style={{ background: '#14143a' }}>
// //             Huỷ
// //           </button>
// //           <button onClick={handleSubmit} disabled={uploading}
// //             className="flex-1 py-2.5 rounded-xl font-bold text-sm disabled:opacity-40"
// //             style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff' }}>
// //             {uploading ? 'Đang tải lên...' : 'Nộp task'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }
// function SubmitTaskModal({ task, currentUser, users, onClose }: { task: Task; currentUser: User; users: User[]; onClose: () => void }) {
//   const [driveLink, setDriveLink] = useState('')
//   const [ownFolderUrl, setOwnFolderUrl] = useState('')
//   const [folderName, setFolderName] = useState('')
//   const [note, setNote] = useState('')
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')

//   const driveOwner = task.driveFolderOwnerId ? users.find(u => u.id === task.driveFolderOwnerId) : undefined
//   const pmsWithDrive = task.driveFolderOwnerId
//     ? (driveOwner?.driveFolderUrl ? [driveOwner] : [])
//     : task.projectManager.map(id => users.find(u => u.id === id)).filter((u): u is User => !!u && !!u.driveFolderUrl)

//   const hasNamedFolder = !task.selfCreated && task.driveFolderCreated && !!task.driveFolderName
//   const needsOwnFolderName = !task.selfCreated && !hasNamedFolder

//   const handleSubmit = async () => {
//     if (task.selfCreated && !ownFolderUrl.trim()) {
//       setError('Vui lòng dán link folder Drive của bạn (đã cấp quyền xem & chỉnh sửa cho quản lý) trước khi nộp.')
//       return
//     }
//     if (task.selfCreated && !/^https?:\/\//i.test(ownFolderUrl.trim())) {
//       setError('Link folder không hợp lệ, vui lòng dán đúng đường dẫn Google Drive.')
//       return
//     }
//     if (needsOwnFolderName && !folderName.trim()) {
//       setError('Vui lòng ghi tên folder bạn đã tự tạo trước khi nộp.')
//       return
//     }
//     if (!driveLink.trim()) { setError('Vui lòng dán link Google Drive chứa file/folder kết quả trước khi nộp.'); return }
//     if (!/^https?:\/\//i.test(driveLink.trim())) { setError('Link không hợp lệ, vui lòng dán đúng đường dẫn Google Drive.'); return }
//     setError('')
//     setSaving(true)

//     const { error: updateError } = await supabase.from('tasks').update({
//       status: 'submitted',
//       submission_file_url: driveLink.trim(),
//       submission_own_folder_url: task.selfCreated ? ownFolderUrl.trim() : null,
//       submission_folder_name: needsOwnFolderName ? folderName.trim() : null,
//       submission_note: note.trim() || null,
//       submitted_at: new Date().toISOString(),
//       rejected_reason: null,
//     }).eq('id', task.id)

//     setSaving(false)
//     if (updateError) { setError(updateError.message); return }

//     const recipientIds = Array.from(new Set([task.createdBy, ...task.projectManager]))
//       .filter(uid => uid && uid !== currentUser.id)

//     for (const uid of recipientIds) {
//       await supabase.from('notifications').insert({
//         message: `📥 ${currentUser.name} vừa nộp kết quả task: ${task.title}`,
//         target_user_id: uid,
//         link_task_id: task.id,
//       })
//     }

//     onClose()
//   }

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: '#000000a0' }}>
//       <div className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//         <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Nộp kết quả task</h3>
//         <p className="text-gray-500 text-sm mb-4">{task.title}</p>

//         {task.selfCreated ? (
//           <div className="mb-4 p-3 rounded-lg" style={{ background: '#2a1a00', border: '1px solid #4a3a00' }}>
//             <p className="text-amber-300 text-xs leading-relaxed mb-3">
//               🎯 Đây là task bạn tự tạo. Vui lòng dán link folder Drive của chính bạn, đồng thời <b>bật chia sẻ "Bất kỳ ai có link đều xem và chỉnh sửa được"</b> để quản lý có thể xem file kết quả.
//             </p>
//             <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Link folder Drive của bạn *</label>
//             <input value={ownFolderUrl} onChange={e => setOwnFolderUrl(e.target.value)}
//               placeholder="https://drive.google.com/drive/folders/..."
//               className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-600 text-sm outline-none"
//               style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//           </div>
//         ) : hasNamedFolder ? (
//           <div className="mb-4 p-3 rounded-lg" style={{ background: '#1a0a3a', border: '1px solid #3a1a6a' }}>
//             <p className="text-violet-300 text-xs leading-relaxed mb-3">
//               📁 Quản lý đã tạo sẵn folder cho task này. Vào Drive của quản lý, tìm đúng folder tên <b>"{task.driveFolderName}"</b> và nộp file vào đó.
//             </p>
//             {pmsWithDrive.map(pm => (
//               <a key={pm.id} href={pm.driveFolderUrl} target="_blank" rel="noopener noreferrer"
//                 className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all hover:scale-[1.01]"
//                 style={{ background: '#14143a', border: '1px solid #2a2a5a', color: '#a78bfa' }}>
//                 <CharAvatar user={pm} size={22} />
//                 📁 Mở Drive của {pm.name}
//               </a>
//             ))}
//           </div>
//         ) : needsOwnFolderName && pmsWithDrive.length > 0 ? (
//           <div className="mb-4 p-3 rounded-lg" style={{ background: '#2a1a00', border: '1px solid #4a3a00' }}>
//             <p className="text-amber-300 text-xs leading-relaxed mb-3">
//               ⚠️ Quản lý chưa tạo sẵn folder cho task này. Vào Drive bên dưới, tự tạo 1 folder mới, đặt tên tuỳ ý, rồi ghi lại tên đó ở ô bên dưới.
//             </p>
//             <div className="space-y-2">
//               {pmsWithDrive.map(pm => (
//                 <a key={pm.id} href={pm.driveFolderUrl} target="_blank" rel="noopener noreferrer"
//                   className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all hover:scale-[1.01]"
//                   style={{ background: '#14143a', border: '1px solid #2a2a5a', color: '#60a5fa' }}>
//                   <CharAvatar user={pm} size={22} />
//                   📁 Mở Drive của {pm.name}
//                 </a>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: '#2a1a00', color: '#fbbf24' }}>
//             ⚠️ Quản lý dự án chưa thiết lập link Google Drive. Hãy liên hệ trực tiếp để xin link nộp file, sau đó dán vào ô bên dưới.
//           </div>
//         )}

//         {needsOwnFolderName && (
//           <>
//             <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Tên folder bạn đã tự tạo *</label>
//             <input value={folderName} onChange={e => setFolderName(e.target.value)}
//               placeholder="VD: Nộp task - Nguyễn Văn A"
//               className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-600 text-sm outline-none mb-4"
//               style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//           </>
//         )}

//         <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Dán link file/folder đã nộp *</label>
//         <input value={driveLink} onChange={e => setDriveLink(e.target.value)}
//           placeholder="https://drive.google.com/file/d/... hoặc /folders/..."
//           className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-600 text-sm outline-none"
//           style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//         <p className="text-gray-600 text-[10px] mt-1.5 mb-4 leading-relaxed">
//           💡 Bấm chuột phải vào file/folder → "Chia sẻ" → bật quyền <b>"Bất kỳ ai có link đều xem và chỉnh sửa được"</b> → "Sao chép đường liên kết", rồi dán vào đây.
//         </p>

//         <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Ghi chú (không bắt buộc)</label>
//         <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
//           placeholder="Mô tả ngắn gọn kết quả đã làm..."
//           className="w-full px-4 py-2.5 mb-4 rounded-xl text-white placeholder-gray-600 text-sm outline-none resize-none"
//           style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />

//         {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

//         <div className="flex gap-2">
//           <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-400" style={{ background: '#14143a' }}>
//             Huỷ
//           </button>
//           <button onClick={handleSubmit} disabled={saving}
//             className="flex-1 py-2.5 rounded-xl font-bold text-sm disabled:opacity-40"
//             style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff' }}>
//             {saving ? 'Đang lưu...' : 'Nộp task'}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// //====================CollaborationRequestModal======================
// function CollaborationRequestModal({ currentUser, users, onClose }: {
//   currentUser: User; users: User[]; onClose: () => void
// }) {
//   const [title, setTitle] = useState('')
//   const [description, setDescription] = useState('')
//   const [startDate, setStartDate] = useState('')
//   const [endDate, setEndDate] = useState('')
//   const [targetTeamId, setTargetTeamId] = useState('')
//   const [targetManagerId, setTargetManagerId] = useState('')
//   const [expReward, setExpReward] = useState(80)
//   const [driveFolderCreated, setDriveFolderCreated] = useState(false)
//   const [driveFolderName, setDriveFolderName] = useState('')
//   const [error, setError] = useState('')
//   const [saving, setSaving] = useState(false)

//   const otherTeams = TEAMS.filter(t => t.id !== currentUser.teamId)
//   const managersInTargetTeam = users.filter(u => u.role === 'manager' && u.teamId === targetTeamId)

//   const handleSubmit = async () => {
//     if (!title.trim() || !description.trim() || !startDate || !endDate || !targetTeamId || !targetManagerId || !expReward) {
//       setError('Vui lòng điền đầy đủ tất cả các trường bắt buộc, bao gồm chọn quản lý cụ thể.')
//       return
//     }
//     if (endDate < startDate) { setError('Ngày kết thúc phải sau ngày bắt đầu.'); return }
//     setError('')
//     setSaving(true)
//     const { error: insertError } = await supabase.from('collaborations').insert({
//       title: title.trim(), description: description.trim(),
//       start_date: startDate, end_date: endDate,
//       requested_by: currentUser.id,
//       requesting_team_id: currentUser.teamId,
//       target_team_id: targetTeamId,
//       target_manager_id: targetManagerId,
//       exp_reward: expReward,
//       status: 'pending',
//       drive_folder_created: driveFolderCreated,
//       drive_folder_name: driveFolderCreated ? (driveFolderName.trim() || null) : null,
//     })
//     setSaving(false)
//     if (insertError) { setError(insertError.message); return }

//     const targetManager = users.find(u => u.id === targetManagerId)
//     await supabase.from('notifications').insert({
//       message: `🤝 ${currentUser.name} (${TEAMS.find(t => t.id === currentUser.teamId)?.name ?? ''}) muốn nhờ bạn hỗ trợ: "${title.trim()}"`,
//       target_user_id: targetManagerId,
//     })
//     onClose()
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
//       <div className="w-full max-w-md rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto"
//         style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//         <div className="flex justify-between items-center mb-5">
//           <h3 className="text-white font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>🤝 Yêu cầu phối hợp phòng ban</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-2xl leading-none">×</button>
//         </div>

//         <div className="space-y-3.5">
//           <div>
//             <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Tên dự án / công việc phối hợp *</label>
//             <input value={title} onChange={e => setTitle(e.target.value)}
//               placeholder="VD: Chiến dịch truyền thông Q4"
//               className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-600 text-sm outline-none"
//               style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//           </div>

//           <div>
//             <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Nhiệm vụ cần phối hợp *</label>
//             <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
//               placeholder="Mô tả cụ thể công việc cần bên hỗ trợ thực hiện..."
//               className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-600 text-sm outline-none resize-none"
//               style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Ngày bắt đầu *</label>
//               <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
//                 className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
//                 style={{ background: '#14143a', border: '1px solid #2a2a5a', colorScheme: 'dark' }} />
//             </div>
//             <div>
//               <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Ngày kết thúc *</label>
//               <input type="date" value={endDate} min={startDate || undefined} onChange={e => setEndDate(e.target.value)}
//                 className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
//                 style={{ background: '#14143a', border: '1px solid #2a2a5a', colorScheme: 'dark' }} />
//             </div>
//           </div>

//           <div>
//             <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Điểm EXP thưởng cho người nhận việc *</label>
//             <input type="number" value={expReward} onChange={e => setExpReward(parseInt(e.target.value) || 0)}
//               className="w-full px-3 py-2.5 rounded-lg text-amber-400 text-sm outline-none font-bold"
//               style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//           </div>

//           <div className="p-3 rounded-lg" style={{ background: '#0a0a1a', border: '1px solid #1e1e3a' }}>
//             <label className="flex items-center gap-2.5 mb-2 cursor-pointer select-none">
//               <input type="checkbox" checked={driveFolderCreated}
//                 onChange={e => setDriveFolderCreated(e.target.checked)}
//                 className="w-4 h-4 rounded accent-violet-500" />
//               <span className="text-white text-sm font-medium">📁 Tôi đã tạo sẵn folder Drive cho công việc này</span>
//             </label>
//             {driveFolderCreated ? (
//               <input value={driveFolderName} onChange={e => setDriveFolderName(e.target.value)}
//                 placeholder="Tên folder (VD: Phối hợp - Chiến dịch Q4)"
//                 className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-600 text-sm outline-none"
//                 style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//             ) : (
//               <p className="text-gray-600 text-[10px] leading-relaxed">
//                 💡 Nếu không tick, nhân viên được phân công sẽ tự tạo folder trong Drive của bạn và tự đặt tên khi nộp.
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Chọn phòng ban muốn nhờ hỗ trợ *</label>
//             <select value={targetTeamId} onChange={e => { setTargetTeamId(e.target.value); setTargetManagerId('') }}
//               className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
//               style={{ background: '#14143a', border: '1px solid #2a2a5a' }}>
//               <option value="">-- Chọn phòng ban --</option>
//               {otherTeams.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
//             </select>
//           </div>

//           {targetTeamId && (
//             <div>
//               <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Chọn quản lý muốn phối hợp *</label>
//               {managersInTargetTeam.length === 0 ? (
//                 <p className="text-red-400 text-xs">Phòng ban này chưa có quản lý nào trong hệ thống.</p>
//               ) : (
//                 <select value={targetManagerId} onChange={e => setTargetManagerId(e.target.value)}
//                   className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
//                   style={{ background: '#14143a', border: '1px solid #2a2a5a' }}>
//                   <option value="">-- Chọn quản lý --</option>
//                   {managersInTargetTeam.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
//                 </select>
//               )}
//             </div>
//           )}

//           {error && <p className="text-red-400 text-xs">{error}</p>}

//           <div className="flex gap-3 pt-1">
//             <button onClick={onClose}
//               className="flex-1 py-2.5 rounded-xl text-gray-400 text-sm"
//               style={{ background: '#14143a', border: '1px solid #2a2a5a' }}>Hủy</button>
//             <button onClick={handleSubmit} disabled={saving}
//               className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-40"
//               style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
//               {saving ? 'Đang gửi...' : 'Gửi yêu cầu'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// function CollaborationsPanel({ currentUser, users, collaborations }: {
//   currentUser: User; users: User[]; collaborations: Collaboration[]
// }) {
//   const [assigningId, setAssigningId] = useState<string | null>(null)
//   const [pickedEmployee, setPickedEmployee] = useState('')

//   if (currentUser.role !== 'manager') return null

//   const sent = collaborations.filter(c => c.requestedBy === currentUser.id)
//   const receivedPending = collaborations.filter(c => c.targetManagerId === currentUser.id && c.status === 'pending')
//   const receivedProcessed = collaborations.filter(c => c.targetManagerId === currentUser.id && c.status !== 'pending')
//   const myTeamEmployees = users.filter(u => u.role === 'employee' && u.teamId === currentUser.teamId)
//   const getUserById = (id?: string) => users.find(u => u.id === id)

//   const handleReject = async (c: Collaboration) => {
//     const reason = window.prompt('Lý do từ chối:') ?? ''
//     await supabase.from('collaborations').update({ status: 'rejected', rejected_reason: reason }).eq('id', c.id)
//     await supabase.from('notifications').insert({
//       message: `❌ ${currentUser.name} đã từ chối yêu cầu phối hợp "${c.title}"${reason ? `: ${reason}` : ''}`,
//       target_user_id: c.requestedBy,
//     })
//   }

//   const openAssign = (c: Collaboration) => {
//     setAssigningId(c.id)
//     setPickedEmployee('')
//   }

//   const handleConfirmAssign = async (c: Collaboration) => {
//     if (!pickedEmployee) return
//     const exp = c.expReward ?? 80
//     await supabase.from('collaborations').update({
//       status: 'assigned', assigned_employee_id: pickedEmployee, assigned_by: currentUser.id,
//     }).eq('id', c.id)

//     const { data: newTask } = await supabase.from('tasks').insert({
//       title: c.title,
//       description: `[Phối hợp phòng ban] ${c.description}`,
//       exp_reward: exp,
//       status: 'open',
//       assigned_to: [pickedEmployee],
//       project_manager: [c.requestedBy, currentUser.id],
//       supporters: [],
//       created_by: currentUser.id,
//       start_date: c.startDate,
//       due_date: c.endDate,
//       category: 'operations',
//       priority: 'medium',
//       self_created: false,
//       important: false,
//       urgent: false,
//       drive_folder_owner_id: c.requestedBy,
//       drive_folder_created: c.driveFolderCreated ?? false,
//       drive_folder_name: c.driveFolderCreated ? (c.driveFolderName ?? null) : null,
//     }).select('id').single()
//     const newTaskId = newTask?.id

//     const employeeName = getUserById(pickedEmployee)?.name ?? ''
//     await supabase.from('notifications').insert({
//       message: `🤝 ${currentUser.name} đã phân công ${employeeName} hợp tác trong dự án "${c.title}"`,
//       target_user_id: c.requestedBy,
//       link_task_id: newTaskId,
//     })
//     await supabase.from('notifications').insert({
//       message: `🤝 Bạn vừa được phân công hợp tác trong dự án "${c.title}" (phối hợp với ${TEAMS.find(t => t.id === c.requestingTeamId)?.name ?? ''})`,
//       target_user_id: pickedEmployee,
//       link_task_id: newTaskId,
//     })

//     setAssigningId(null)
//   }

//   const statusBadge = (c: Collaboration) => {
//     if (c.status === 'pending') return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: '#2a1a00', color: '#fbbf24' }}>⏳ Chờ duyệt</span>
//     if (c.status === 'rejected') return (
//       <div className="flex flex-col items-end gap-0.5">
//         <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: '#2a1010', color: '#f87171' }}>❌ Bị từ chối</span>
//         {c.rejectedReason && <span className="text-gray-500 text-[10px] max-w-[200px] text-right">{c.rejectedReason}</span>}
//       </div>
//     )
//     return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: '#0f2a1a', color: '#34d399' }}>✅ Đã phân công: {getUserById(c.assignedEmployeeId)?.name}</span>
//   }

//   if (sent.length === 0 && receivedPending.length === 0 && receivedProcessed.length === 0) return null

//   return (
//     <div className="mb-6 space-y-4">
//       {receivedPending.length > 0 && (
//         <div className="rounded-xl p-4" style={{ background: '#0e0e24', border: '1px solid #f59e0b30' }}>
//           <h3 className="text-white font-bold mb-3 text-sm flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
//             🤝 Yêu cầu phối hợp cần bạn duyệt
//             <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: '#2a1a00', color: '#fbbf24' }}>{receivedPending.length}</span>
//           </h3>
//           <div className="space-y-3">
//             {receivedPending.map(c => (
//               <div key={c.id} className="p-3 rounded-lg" style={{ background: '#12122a', border: '1px solid #1a1a3a' }}>
//                 <div className="mb-2">
//                   <div className="text-white text-sm font-semibold">{c.title}</div>
//                   <div className="text-gray-500 text-xs mt-0.5">
//                     Từ: {getUserById(c.requestedBy)?.name} ({TEAMS.find(t => t.id === c.requestingTeamId)?.name})
//                   </div>
//                   <div className="text-gray-600 text-xs mt-1">📅 {fmtDate(c.startDate)} → {fmtDate(c.endDate)}</div>
//                   {c.expReward != null && (
//                     <div className="text-amber-400 text-xs mt-1 font-bold">+{c.expReward} EXP (do bên yêu cầu đề xuất)</div>
//                   )}
//                 </div>
//                 <p className="text-gray-400 text-xs mb-3 leading-relaxed">{c.description}</p>

//                 {assigningId === c.id ? (
//                   <div className="space-y-2 p-2.5 rounded-lg" style={{ background: '#0a0a1a' }}>
//                     <label className="text-gray-500 text-[10px] uppercase tracking-wider block">Phân công nhân viên phòng bạn</label>
//                     <select value={pickedEmployee} onChange={e => setPickedEmployee(e.target.value)}
//                       className="w-full px-2.5 py-2 rounded-lg text-white text-xs outline-none"
//                       style={{ background: '#14143a', border: '1px solid #2a2a5a' }}>
//                       <option value="">-- Chọn nhân viên --</option>
//                       {myTeamEmployees.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
//                     </select>
//                     <div className="flex gap-2 pt-1">
//                       <button onClick={() => setAssigningId(null)} className="flex-1 py-1.5 rounded-lg text-xs text-gray-400" style={{ background: '#14143a' }}>Hủy</button>
//                       <button onClick={() => handleConfirmAssign(c)} disabled={!pickedEmployee}
//                         className="flex-1 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40" style={{ background: '#0f2a1a', color: '#34d399' }}>
//                         Xác nhận phân công
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="flex gap-2 justify-end">
//                     <button onClick={() => handleReject(c)}
//                       className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#2a1010', color: '#f87171' }}>
//                       Từ chối
//                     </button>
//                     <button onClick={() => openAssign(c)}
//                       className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#0f2a1a', color: '#34d399' }}>
//                       ✓ Duyệt
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {receivedProcessed.length > 0 && (
//         <div className="rounded-xl p-4" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//           <h3 className="text-white font-bold mb-3 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>📋 Yêu cầu phối hợp đã xử lý</h3>
//           <div className="space-y-2">
//             {receivedProcessed.map(c => (
//               <div key={c.id} className="p-3 rounded-lg flex items-center justify-between gap-3" style={{ background: '#12122a', border: '1px solid #1a1a3a' }}>
//                 <div>
//                   <div className="text-white text-sm font-medium">{c.title}</div>
//                   <div className="text-gray-500 text-xs">Từ: {getUserById(c.requestedBy)?.name}</div>
//                 </div>
//                 {statusBadge(c)}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {sent.length > 0 && (
//         <div className="rounded-xl p-4" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//           <h3 className="text-white font-bold mb-3 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>📨 Yêu cầu phối hợp đã gửi</h3>
//           <div className="space-y-2">
//             {sent.map(c => (
//               <div key={c.id} className="p-3 rounded-lg flex items-center justify-between gap-3" style={{ background: '#12122a', border: '1px solid #1a1a3a' }}>
//                 <div>
//                   <div className="text-white text-sm font-medium">{c.title}</div>
//                   <div className="text-gray-500 text-xs">Nhờ: {getUserById(c.targetManagerId)?.name ?? TEAMS.find(t => t.id === c.targetTeamId)?.name}</div>
//                 </div>
//                 {statusBadge(c)}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
// // Dropdown chọn nhiều người dùng chung (Phụ trách / PM / Hỗ trợ)
// function MultiUserSelect({ label, options, selected, onToggle, placeholder = 'Chọn...', badge }: {
//   label: string; options: User[]; selected: string[]; onToggle: (id: string) => void
//   placeholder?: string; badge?: string
// }) {
//   const [open, setOpen] = useState(false)
//   const ref = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     const h = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
//     }
//     document.addEventListener('mousedown', h)
//     return () => document.removeEventListener('mousedown', h)
//   }, [])

//   return (
//     <div ref={ref} className="relative">
//       <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">
//         {label} {selected.length > 0 && <span className="text-violet-400">({selected.length} được chọn)</span>}
//       </label>
//       <button onClick={() => setOpen(!open)}
//         className="w-full px-3 py-2.5 rounded-lg text-sm text-left flex items-center justify-between"
//         style={{ background: '#14143a', border: '1px solid #2a2a5a', color: selected.length > 0 ? '#e2e8f0' : '#6b7280' }}>
//         <span>
//           {selected.length === 0 ? placeholder
//             : selected.map(sid => options.find(u => u.id === sid)?.name.split(' ').slice(-1)[0]).join(', ')}
//         </span>
//         <span className="text-gray-500">{open ? '▲' : '▼'}</span>
//       </button>
//       {open && (
//         <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-xl overflow-hidden max-h-60 overflow-y-auto"
//           style={{ background: '#14143a', border: '1px solid #2a2a5a', boxShadow: '0 8px 24px #00000060' }}>
//           {options.map(u => (
//             <label key={u.id}
//               className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors hover:bg-[#1e1e4a]">
//               <input type="checkbox" checked={selected.includes(u.id)} onChange={() => onToggle(u.id)}
//                 className="w-4 h-4 rounded accent-violet-500" />
//               <CharAvatar user={u} size={24} />
//               <span className="text-white text-sm flex-1">{u.name}</span>
//               {badge && u.role === 'manager' && (
//                 <span className="text-[9px] px-1 rounded" style={{ background: '#1a0a3a', color: '#a78bfa' }}>{badge}</span>
//               )}
//               <LevelBadge exp={u.exp} />
//             </label>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }


// //==================== TASKS COMMENTS =====================
// function TaskCommentsPanel({ taskId, currentUser, users }: { taskId: string; currentUser: User; users: User[] }) {
//   const [comments, setComments] = useState<{ id: string; userId: string; content: string; createdAt: string }[]>([])
//   const [input, setInput] = useState('')
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     supabase.from('task_comments').select('*').eq('task_id', taskId).order('created_at')
//       .then(({ data }) => {
//         if (data) setComments(data.map(c => ({ id: c.id, userId: c.user_id, content: c.content, createdAt: c.created_at })))
//         setLoading(false)
//       })

//     const channel = supabase.channel(`task-comments-${taskId}`)
//       .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_comments', filter: `task_id=eq.${taskId}` }, payload => {
//         const c = payload.new
//         setComments(prev => [...prev, { id: c.id, userId: c.user_id, content: c.content, createdAt: c.created_at }])
//       }).subscribe()
//     return () => { supabase.removeChannel(channel) }
//   }, [taskId])

//   const send = async () => {
//     if (!input.trim()) return
//     const content = input.trim()
//     setInput('')
//     await supabase.from('task_comments').insert({ task_id: taskId, user_id: currentUser.id, content })
//   }

//   return (
//     <div className="mt-3 pt-3" style={{ borderTop: '1px solid #1e1e4a' }} onClick={e => e.stopPropagation()}>
//       {loading ? (
//         <p className="text-gray-600 text-xs">Đang tải...</p>
//       ) : (
//         <div className="space-y-2 max-h-52 overflow-y-auto mb-2">
//           {comments.length === 0 && <p className="text-gray-600 text-xs italic">Chưa có bình luận nào.</p>}
//           {comments.map(c => {
//             const u = users.find(x => x.id === c.userId)
//             return (
//               <div key={c.id} className="flex items-start gap-2">
//                 {u && <CharAvatar user={u} size={22} />}
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-baseline gap-1.5">
//                     <span className="text-gray-300 text-xs font-semibold">{u?.name ?? 'Ẩn danh'}</span>
//                     <span className="text-gray-700 text-[10px]">{fmtTime(c.createdAt)}</span>
//                   </div>
//                   <p className="text-gray-400 text-xs break-words">{c.content}</p>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       )}
//       <div className="flex gap-1.5">
//         <input value={input} onChange={e => setInput(e.target.value)}
//           onKeyDown={e => e.key === 'Enter' && send()}
//           placeholder="Viết bình luận..."
//           className="flex-1 min-w-0 px-3 py-1.5 rounded-lg text-white placeholder-gray-600 text-xs outline-none"
//           style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//         <button onClick={send} disabled={!input.trim()}
//           className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40 flex-shrink-0"
//           style={{ background: '#7c3aed', color: '#fff' }}>
//           Gửi
//         </button>
//       </div>
//     </div>
//   )
// }

// // ==================== TASKS VIEW ====================

// function TasksView({ currentUser, tasks, users, setTasks, setCurrentUser, collaborations, highlightTaskId, clearHighlightTaskId }: {
//   currentUser: User; tasks: Task[]; users: User[]
//   setTasks: (t: Task[]) => void; setCurrentUser: (u: User) => void
//   collaborations: Collaboration[]
//   highlightTaskId?: string | null; clearHighlightTaskId?: () => void
// }) {
//   const [filter, setFilter] = useState<'all' | 'mine' | 'open' | 'done'>('all')
//   const [search, setSearch] = useState('')
//   const [showCollabModal, setShowCollabModal] = useState(false)
//   const [showModal, setShowModal] = useState(false)
//   const [editingTask, setEditingTask] = useState<Task | null>(null)
//   const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null)
//   const [submittingTask, setSubmittingTask] = useState<Task | null>(null)
//   const [selfMode, setSelfMode] = useState(false)
//   const taskRefs = useRef<Record<string, HTMLDivElement | null>>({})
//   const [flashTaskId, setFlashTaskId] = useState<string | null>(null)

//   useEffect(() => {
//     if (!highlightTaskId) return
//     // Nếu task đang bị filter/search ẩn đi, tự động xoá filter/search để đảm bảo thấy được
//     setFilter('all')
//     setSearch('')
//     const tryScroll = () => {
//       const el = taskRefs.current[highlightTaskId]
//       if (el) {
//         el.scrollIntoView({ behavior: 'smooth', block: 'center' })
//         setFlashTaskId(highlightTaskId)
//         setTimeout(() => setFlashTaskId(prev => (prev === highlightTaskId ? null : prev)), 2500)
//         clearHighlightTaskId?.()
//       } else {
//         // Task có thể chưa kịp render (do vừa đổi filter) — thử lại sau 1 nhịp
//         setTimeout(tryScroll, 150)
//       }
//     }
//     const t = setTimeout(tryScroll, 150)
//     return () => clearTimeout(t)
//   }, [highlightTaskId])
//   const now = new Date()
//   const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
//   const [form, setForm] = useState({
//     title: '', description: '', expReward: 80, startDate: todayStr, dueDate: '',
//     category: 'development', priority: 'medium' as TaskPriority,
//     important: false, urgent: false,
//     assignedTo: [] as string[], projectManager: [] as string[], supporters: [] as string[],
//     driveFolderCreated: false, driveFolderName: '',
//   })

//   const isManager = currentUser.role === 'manager'
// // const employees = users.filter(u => u.role === 'employee' && u.teamId === currentUser.teamId)
// // const teamUsers = users.filter(u => u.teamId === currentUser.teamId)
//   const employees = currentUser.isDirector
//   ? users
//   : users.filter(u => u.role === 'employee' && u.teamId === currentUser.teamId)
//   const teamUsers = currentUser.isDirector
//     ? users
//     : users.filter(u => u.teamId === currentUser.teamId)

//   const visible = tasks.filter(t => {
//     const isMyTask = t.assignedTo.includes(currentUser.id) || (t.selfCreated && t.createdBy === currentUser.id) || t.supporters.includes(currentUser.id) || t.projectManager.includes(currentUser.id)
//     const assignees = users.filter(u => t.assignedTo.includes(u.id))
//     const deptPrefix = (id?: string) => id?.match(/^t\d+/)?.[0] ?? ''
//     const isCrossDeptForMyDept = !!t.targetTeamId && (
//       currentUser.isDirector
//         ? deptPrefix(currentUser.teamId) === deptPrefix(t.targetTeamId)
//         : t.targetTeamId === currentUser.teamId
//     )
//     const inScope = isManager
//       ? (isMyTask || t.createdBy === currentUser.id || assignees.some(a => a.teamId === currentUser.teamId) || isCrossDeptForMyDept)
//       : (isMyTask && !t.crossDeptRejected)
//     if (!inScope) return false
//     if (search.trim() && !t.title.toLowerCase().includes(search.trim().toLowerCase()) && !t.description.toLowerCase().includes(search.trim().toLowerCase())) return false
//     if (filter === 'mine') return isMyTask
//     if (filter === 'open') return t.status === 'open'
//     if (filter === 'done') return t.status === 'completed'
//     return true
//   })

//   // const handleStart = (id: string) => setTasks(tasks.map(t => t.id === id ? { ...t, status: 'in-progress' } : t))
//   // const handleComplete = (id: string, exp: number) => {
//   //   setTasks(tasks.map(t => t.id === id ? { ...t, status: 'completed' } : t))
//   //   setCurrentUser({ ...currentUser, exp: currentUser.exp + exp })
//   // }
//   // const handleCreate = () => {
//   //   if (!form.title.trim()) return
//   //   setTasks([...tasks, {
//   //     id: `task_${Date.now()}`, title: form.title, description: form.description, expReward: form.expReward,
//   //     status: 'open', assignedTo: isManager ? (form.assignedTo || undefined) : currentUser.id,
//   //     projectManager: form.projectManager || undefined, supporters: form.supporters,
//   //     createdBy: currentUser.id,
//   //     dueDate: form.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
//   //     category: form.category, priority: form.priority, selfCreated: !isManager,
//   //   }])
//   //   setShowModal(false)
//   //   setForm({ title: '', description: '', expReward: 50, dueDate: '', category: 'development', priority: 'medium', assignedTo: '', projectManager: '', supporters: [] })
//   // }

//   const handleStart = async (id: string) => {
//   await supabase.from('tasks').update({ status: 'in-progress' }).eq('id', id)
// }

// const handleApprove = async (task: Task) => {
//   await supabase.from('tasks').update({
//     status: 'completed',
//     approved_by: currentUser.id,
//     approved_at: new Date().toISOString(),
//   }).eq('id', task.id)

//   // Mỗi người Phụ trách nhận đủ 100% EXP (không chia, dù có nhiều người)
//   for (const uid of task.assignedTo) {
//     const assignee = users.find(u => u.id === uid)
//     if (assignee) {
//       await supabase.from('profiles').update({ exp: assignee.exp + task.expReward }).eq('id', assignee.id)
//     }
//   }

//   // Mỗi Quản lý dự án (PM) cũng nhận đủ 100% EXP (dù có nhiều người)
//   for (const uid of task.projectManager) {
//     const pm = users.find(u => u.id === uid)
//     if (pm) {
//       await supabase.from('profiles').update({ exp: pm.exp + task.expReward }).eq('id', pm.id)
//     }
//   }

//   // Người hỗ trợ nhận % của EXP gốc
//   const supportExp = Math.round(task.expReward * SUPPORTER_EXP_PERCENT)
//   for (const uid of task.supporters) {
//     const supporter = users.find(u => u.id === uid)
//     if (supporter) {
//       await supabase.from('profiles').update({ exp: supporter.exp + supportExp }).eq('id', supporter.id)
//     }
//   }
// }

// // const handleReject = async (task: Task) => {
// //   const reason = window.prompt('Lý do từ chối (nhân viên sẽ thấy để sửa lại):') ?? ''
// //   await supabase.from('tasks').update({
// //     status: 'in-progress', submission_file_url: null, submission_note: null, rejected_reason: reason,
// //   }).eq('id', task.id)
// // }

// // const handleCreate = async () => {
// const handleReject = async (task: Task) => {
//   const reason = window.prompt('Lý do từ chối (nhân viên sẽ thấy để sửa lại):') ?? ''
//   await supabase.from('tasks').update({
//     status: 'in-progress', submission_file_url: null, submission_note: null, rejected_reason: reason,
//   }).eq('id', task.id)
// }

// const handleApproveCrossDept = async (task: Task) => {
//   await supabase.from('tasks').update({ cross_dept_pending: false }).eq('id', task.id)
// }

// const handleRejectCrossDept = async (task: Task) => {
//   const reason = window.prompt('Lý do từ chối (quản lý đã giao sẽ thấy lý do này):') ?? ''
//   if (reason.trim() === '' && !window.confirm('Bạn chưa nhập lý do, vẫn muốn từ chối?')) return
//   await supabase.from('tasks').update({
//     cross_dept_pending: false,
//     cross_dept_rejected: true,
//     cross_dept_rejected_reason: reason.trim() || null,
//     cross_dept_rejected_by: currentUser.id,
//   }).eq('id', task.id)
// }

// // const viewSubmissionFile = async (key: string) => {
// //   const { data: sessionData } = await supabase.auth.getSession()
// //   const token = sessionData.session?.access_token
// //   const res = await fetch('https://legrsdmjstoxcoxvumgg.supabase.co/functions/v1/get-file-url', {
// //     method: 'POST',
// //     headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
// //     body: JSON.stringify({ key }),
// //   })
// //   const json = await res.json()
// //   if (res.ok && json.url) window.open(json.url, '_blank')
// //   else alert('Không mở được file: ' + (json.error || 'lỗi không xác định'))
// // }


// const openEditModal = (task: Task) => {
//   setEditingTask(task)
//   setSelfMode(task.selfCreated)
//   setForm({
//     title: task.title, description: task.description, expReward: task.expReward,
//     startDate: task.startDate || todayStr, dueDate: task.dueDate,
//     category: task.category, priority: task.priority,
//     important: task.important, urgent: task.urgent,
//     assignedTo: task.assignedTo, projectManager: task.projectManager, supporters: task.supporters,
//     driveFolderCreated: task.driveFolderCreated ?? false,
//     driveFolderName: task.driveFolderName ?? '',
//   })
//   setShowModal(true)
// }

// const handleSaveTask = async () => {
//   if (!form.title.trim()) return
//   const { min, max } = getExpRange(form.priority, form.important, form.urgent)
//   if (form.expReward < min || form.expReward > max) {
//     alert(`Điểm EXP phải nằm trong khoảng ${min}–${max} cho mức độ "${PRIORITY_CONFIG[form.priority].label}" với lựa chọn Quan trọng/Gấp hiện tại`)
//     return
//   }

//   if (editingTask) {
//     await supabase.from('tasks').update({
//       title: form.title, description: form.description, exp_reward: form.expReward,
//       assigned_to: form.assignedTo, project_manager: form.projectManager, supporters: form.supporters,
//       start_date: form.startDate, due_date: form.dueDate,
//       category: form.category, priority: form.priority,
//       important: form.important, urgent: form.urgent,
//       drive_folder_created: form.driveFolderCreated,
//       drive_folder_name: form.driveFolderCreated ? (form.driveFolderName.trim() || null) : null,
//     }).eq('id', editingTask.id)
//   } else {
//     const creatingForSelf = !isManager || selfMode
//     const assignedUsers = form.assignedTo.map(uid => users.find(u => u.id === uid)).filter(Boolean) as User[]
//     const outsideAssignees = assignedUsers.filter(u => u.teamId !== currentUser.teamId)
//     const isCrossDept = !creatingForSelf && !currentUser.isDirector && outsideAssignees.length > 0
//     const targetTeamId = isCrossDept ? outsideAssignees[0].teamId : null

//     const { data: newTask } = await supabase.from('tasks').insert({
//       title: form.title, description: form.description, exp_reward: form.expReward,
//       status: 'open', assigned_to: creatingForSelf ? [currentUser.id] : form.assignedTo,
//       project_manager: form.projectManager, supporters: form.supporters,
//       created_by: currentUser.id,
//       start_date: form.startDate,
//       due_date: form.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
//       category: form.category, priority: form.priority, self_created: creatingForSelf,
//       important: form.important, urgent: form.urgent,
//       cross_dept_pending: isCrossDept,
//       target_team_id: targetTeamId,
//       drive_folder_created: !creatingForSelf && form.driveFolderCreated,
//       drive_folder_name: (!creatingForSelf && form.driveFolderCreated) ? (form.driveFolderName.trim() || null) : null,
//     }).select('id').single()
//     const newTaskId = newTask?.id

//     // Báo cho từng nhân viên được giao (chỉ khi thật sự giao cho người khác)
//     if (isManager && !selfMode) {
//       for (const uid of form.assignedTo) {
//         if (uid === currentUser.id) continue
//         await supabase.from('notifications').insert({
//           message: `📋 ${currentUser.name} vừa giao cho bạn task: ${form.title}`,
//           target_user_id: uid,
//           link_task_id: newTaskId,
//         })
//       }

//       // Báo cho từng người hỗ trợ được thêm vào task
//       for (const uid of form.supporters) {
//         if (uid === currentUser.id) continue
//         await supabase.from('notifications').insert({
//           message: `🤝 ${currentUser.name} vừa thêm bạn làm người hỗ trợ task: ${form.title}`,
//           target_user_id: uid,
//           link_task_id: newTaskId,
//         })
//       }

//       // Báo cho quản lý phòng ban đích nếu đây là task liên phòng ban
//       if (isCrossDept && targetTeamId) {
//         const targetManagers = users.filter(u => u.role === 'manager' && u.teamId === targetTeamId)
//         const assigneeNames = outsideAssignees.map(u => u.name).join(', ')
//         for (const mgr of targetManagers) {
//           await supabase.from('notifications').insert({
//             message: `📨 ${currentUser.name} (${TEAMS.find(t => t.id === currentUser.teamId)?.name ?? ''}) muốn giao task "${form.title}" cho ${assigneeNames} trong phòng ban của bạn`,
//             target_user_id: mgr.id,
//             link_task_id: newTaskId,
//           })
//         }
//       }
//     }
//   }

//   setShowModal(false)
//   setEditingTask(null)
//   setSelfMode(false)
//   setForm({ title: '', description: '', expReward: 80, startDate: todayStr, dueDate: '', category: 'development', priority: 'medium', important: false, urgent: false, assignedTo: [], projectManager: [], supporters: [], driveFolderCreated: false, driveFolderName: '' })
// }

//   const toggleFormArray = (field: 'assignedTo' | 'projectManager' | 'supporters', uid: string) => {
//     setForm(f => ({
//       ...f, [field]: f[field].includes(uid)
//         ? f[field].filter(s => s !== uid)
//         : [...f[field], uid],
//     }))
//   }

//   const getUserById = (id?: string) => users.find(u => u.id === id)

//   const canApproveCrossDept = (task: Task) => {
//     if (!task.targetTeamId) return false
//     const deptPrefix = (id?: string) => id?.match(/^t\d+/)?.[0] ?? ''
//     return currentUser.isDirector
//       ? deptPrefix(currentUser.teamId) === deptPrefix(task.targetTeamId)
//       : currentUser.teamId === task.targetTeamId
//   }

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-white text-2xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Quản lý Task</h2>
//           <p className="text-gray-500 text-sm">{visible.length} task</p>
//         </div>
//         <div className="flex gap-2">
//           {isManager && (
//             <button onClick={() => setShowCollabModal(true)}
//               className="px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:scale-105"
//               style={{ background: '#14143a', border: '1px solid #2a2a5a', color: '#a78bfa' }}>
//               🤝 Phối hợp phòng ban
//             </button>
//           )}
//           <button onClick={() => setShowModal(true)}
//             className="px-4 py-2.5 rounded-xl font-bold text-white text-sm flex items-center gap-2 transition-all hover:scale-105"
//             style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 0 20px #7c3aed40' }}>
//             <span className="text-lg leading-none">+</span>
//             <span>{isManager ? 'Giao Task' : 'Tự tạo Task'}</span>
//           </button>
//         </div>
//       </div>

//       <div className="relative mb-3">
//         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">🔍</span>
//         <input value={search} onChange={e => setSearch(e.target.value)}
//           placeholder="Tìm task theo tên hoặc mô tả..."
//           className="w-full pl-9 pr-9 py-2.5 rounded-lg text-white placeholder-gray-600 text-sm outline-none"
//           style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }} />
//         {search && (
//           <button onClick={() => setSearch('')}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 text-sm">
//             ✕
//           </button>
//         )}
//       </div>
      
//       <CollaborationsPanel currentUser={currentUser} users={users} collaborations={collaborations} />
//       <div className="flex gap-2 mb-5">
//         {[{ id: 'all', label: 'Tất cả' }, { id: 'mine', label: 'Của tôi' }, { id: 'open', label: 'Chưa làm' }, { id: 'done', label: 'Xong' }].map(f => (
//           <button key={f.id} onClick={() => setFilter(f.id as typeof filter)}
//             className="px-3.5 py-1.5 rounded-lg text-sm transition-all"
//             style={{ background: filter === f.id ? '#7c3aed' : '#0e0e24', color: filter === f.id ? '#fff' : '#6b7280', border: `1px solid ${filter === f.id ? '#7c3aed' : '#1e1e4a'}` }}>
//             {f.label}
//           </button>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         {visible.map(task => {
//           const assignees = task.assignedTo.map(getUserById).filter((u): u is User => !!u)
//           const pms = task.projectManager.map(getUserById).filter((u): u is User => !!u)
//           const pri = PRIORITY_CONFIG[task.priority]
//           const isMyTask = task.assignedTo.includes(currentUser.id) || task.supporters.includes(currentUser.id)
//           const isTaskParticipant = task.assignedTo.includes(currentUser.id) || task.projectManager.includes(currentUser.id) || task.supporters.includes(currentUser.id) || task.createdBy === currentUser.id
//           const isBeforeStartDate = !!task.startDate && task.startDate > new Date().toISOString().split('T')[0]
//           const catColor = CATEGORY_COLORS[task.category] ?? '#6b7280'
//           const canEdit = isManager && (task.createdBy === currentUser.id || assignees.some(a => a.teamId === currentUser.teamId))

//           const isFlashed = flashTaskId === task.id
//           return (
//             <div key={task.id} ref={el => { taskRefs.current[task.id] = el }}
//               className="rounded-xl p-4 flex flex-col transition-all hover:-translate-y-0.5"
//               style={{
//                 background: isFlashed ? '#7c3aed1a' : '#0e0e24',
//                 border: `1px solid ${isFlashed ? '#7c3aed' : task.status === 'completed' ? '#10b98120' : '#1e1e4a'}`,
//                 boxShadow: isFlashed ? '0 0 16px #7c3aed40' : 'none',
//                 transition: 'background 0.4s ease, border 0.4s ease, box-shadow 0.4s ease',
//               }}>
//               {/* Header */}
//               <div className="flex items-start justify-between gap-2 mb-2">
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-1.5 mb-1 flex-wrap">
//                     <span className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider"
//                       style={{ background: `${catColor}20`, color: catColor }}>{task.category}</span>
//                     {task.selfCreated && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#1a2a1a', color: '#10b981' }}>Tự tạo</span>}
//                     {task.urgent && <span className="text-[10px] px-1.5 py-0.5 rounded font-bold animate-pulse" style={{ background: '#3a0a0a', color: '#f87171' }}>⏰ GẤP</span>}
//                     {task.important && <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#3a1a0a', color: '#fbbf24' }}>🔥 Quan trọng</span>}
//                   </div>
//                   <h3 className="text-white font-semibold text-sm">{task.title}</h3>
//                 </div>
//                 <div className="text-right flex-shrink-0">
//                   {canEdit && (
//                     <button onClick={() => openEditModal(task)}
//                       className="text-gray-500 hover:text-violet-400 text-[10px] mb-1 block ml-auto">
//                       ✏️ Sửa
//                     </button>
//                   )}
//                   <div className="text-amber-400 font-black text-lg leading-none" style={{ fontFamily: 'Rajdhani, sans-serif' }}>+{task.expReward}</div>
//                   <div className="text-amber-700 text-[10px]">EXP</div>
//                 </div>
//               </div>

//               <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">{task.description}</p>

//               {/* Priority + date */}
//               <div className="flex items-center gap-2 mb-3">
//                 <span className="text-xs px-2 py-0.5 rounded" style={{ background: pri.bg, color: pri.color }}>{pri.label}</span>
//                 <span className="text-gray-600 text-xs">📅 {fmtDate(task.dueDate)}</span>
//               </div>

//               {/* People section */}
//               <div className="space-y-1.5 mb-3">
//                 {/* Assignees (có thể nhiều người) */}
//                 <div className="flex items-start gap-2">
//                   <span className="text-gray-700 text-[10px] w-14 flex-shrink-0 mt-0.5">Phụ trách:</span>
//                   {assignees.length > 0 ? (
//                     <div className="flex items-center gap-2 flex-wrap">
//                       {assignees.map(a => (
//                         <div key={a.id} className="flex items-center gap-1">
//                           <CharAvatar user={a} size={20} />
//                           <span className="text-gray-400 text-xs">{a.name.split(' ').slice(-1)[0]}</span>
//                         </div>
//                       ))}
//                     </div>
//                   ) : <span className="text-gray-700 text-xs italic">Chưa giao</span>}
//                 </div>

//                 {/* Project Managers (có thể nhiều người) */}
//                 {pms.length > 0 && (
//                   <div className="flex items-start gap-2">
//                     <span className="text-gray-700 text-[10px] w-14 flex-shrink-0 mt-0.5">QL dự án:</span>
//                     <div className="flex items-center gap-2 flex-wrap">
//                       {pms.map(pm => (
//                         <div key={pm.id} className="flex items-center gap-1">
//                           <CharAvatar user={pm} size={20} />
//                           <span className="text-gray-400 text-xs">{pm.name.split(' ').slice(-1)[0]}</span>
//                         </div>
//                       ))}
//                       <span className="text-[9px] px-1 rounded" style={{ background: '#1a0a3a', color: '#a78bfa' }}>PM</span>
//                     </div>
//                   </div>
//                 )}

//                 {/* Supporters */}
//                 {task.supporters.length > 0 && (
//                   <div className="flex items-center gap-2">
//                     <span className="text-gray-700 text-[10px] w-14 flex-shrink-0">Hỗ trợ:</span>
//                     <div className="flex -space-x-1">
//                       {task.supporters.slice(0, 4).map(sid => {
//                         const su = getUserById(sid)
//                         return su ? <CharAvatar key={sid} user={su} size={20} /> : null
//                       })}
//                       {task.supporters.length > 4 && (
//                         <div className="w-5 h-5 rounded-full bg-[#1e1e4a] flex items-center justify-center text-[9px] text-gray-400"
//                           style={{ border: '2px solid #0e0e24' }}>+{task.supporters.length - 4}</div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Actions
//               <div className="flex items-center justify-end mt-auto">
//                 {task.status === 'completed'
//                   ? <span className="text-green-400 text-xs">✓ Hoàn thành</span>
//                   : isMyTask
//                     ? (
//                       <div className="flex gap-1.5">

//                         {task.status === 'open' && (
//                           <button onClick={() => handleStart(task.id)}
//                             className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#1e293b', color: '#60a5fa' }}>
//                             Bắt đầu
//                           </button>
//                         )}
//                         {task.status === 'in-progress' && task.assignedTo === currentUser.id && (
//                           <button onClick={() => setSubmittingTask(task)}
//                             className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#1e293b', color: '#34d399' }}>
//                             Nộp task ✓
//                           </button>
//                         )}
//                         {task.status === 'in-progress' && task.rejectedReason && task.assignedTo === currentUser.id && (
//                           <p className="text-red-400 text-xs mt-1">❌ Bị từ chối: {task.rejectedReason}</p>
//                         )}
//                         {task.status === 'submitted' && task.assignedTo === currentUser.id && (
//                           <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#1a1a40', color: '#a78bfa' }}>
//                             ⏳ Đang chờ quản lý duyệt
//                           </span>
//                         )}
//                         {task.status === 'submitted' && currentUser.role === 'manager' && (
//                           <div className="flex flex-col gap-1.5 items-end">
//                             {task.submissionFileUrl && (
//                               <a href={task.submissionFileUrl} target="_blank" rel="noopener noreferrer"
//                                 className="text-xs underline" style={{ color: '#60a5fa' }}>
//                                 📎 Xem file đã nộp
//                               </a>
//                             )}
//                             {task.submissionNote && <p className="text-gray-500 text-xs max-w-[200px] text-right">{task.submissionNote}</p>}
//                             <div className="flex gap-1.5">
//                               <button onClick={() => handleReject(task)}
//                                 className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#2a1010', color: '#f87171' }}>
//                                 Không chấp nhận
//                               </button>
//                               <button onClick={() => handleApprove(task)}
//                                 className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#0f2a1a', color: '#34d399' }}>
//                                 ✓ Duyệt
//                               </button>
//                             </div>
//                           </div>
//                         )}

//                       </div>
//                     )
//                     : <span className="text-xs px-2 py-0.5 rounded" style={{ color: STATUS_CONFIG[task.status].color, background: '#12121a' }}>
//                       {STATUS_CONFIG[task.status].label}
//                     </span>
//                 }
//               </div> */}
//               {/* Actions */}
//             <div className="flex items-center justify-end mt-3">
//               {task.crossDeptPending &&
//                 currentUser.role === 'manager' &&
//                 (currentUser.teamId === task.targetTeamId || currentUser.isDirector) ? (
//                   <div className="flex flex-col gap-1.5 items-end">
//                     <p className="text-amber-400 text-[10px] text-right max-w-[220px] leading-relaxed">
//                       📨 {getUserById(task.createdBy)?.name} ({TEAMS.find(t => t.id === getUserById(task.createdBy)?.teamId)?.name}) muốn giao cho team {TEAMS.find(t => t.id === task.targetTeamId)?.name}
//                     </p>
//                     <div className="flex gap-1.5">
//                       <button onClick={() => handleRejectCrossDept(task)}
//                         className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#2a1010', color: '#f87171' }}>
//                         Từ chối
//                       </button>
//                       <button onClick={() => handleApproveCrossDept(task)}
//                         className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#0f2a1a', color: '#34d399' }}>
//                         ✓ Duyệt nhận task
//                       </button>
//                     </div>
//                   </div>

//                 ) : task.crossDeptPending ? (
//                   <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#2a1a00', color: '#fbbf24' }}>
//                     ⏳ Chờ quản lý phòng ban duyệt
//                   </span>

//                 ) : task.crossDeptRejected ? (
//                   <div className="flex flex-col gap-1 items-end max-w-[240px]">
//                     <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#2a1010', color: '#f87171' }}>
//                       ❌ Bị từ chối bởi {getUserById(task.crossDeptRejectedBy)?.name ?? 'quản lý phòng đích'}
//                     </span>
//                     {task.crossDeptRejectedReason && (
//                       <p className="text-gray-500 text-xs text-right">Lý do: {task.crossDeptRejectedReason}</p>
//                     )}
//                   </div>

//                 ) : task.status === 'completed' ? (
//                 <span className="text-green-400 text-xs">✓ Hoàn thành</span>

//               // ) : task.status === 'submitted' && currentUser.role === 'manager' ? (
//               //   <div className="flex flex-col gap-1.5 items-end">
//               //     {task.submissionFileUrl && (
//               //       <a href={task.submissionFileUrl} target="_blank" rel="noopener noreferrer"
//               //         className="text-xs underline" style={{ color: '#60a5fa' }}>
//               //         📎 Xem file đã nộp
//               //       </a>
//               //     )}
//               ) : task.status === 'submitted' && currentUser.role === 'manager' ? (
//                 <div className="flex flex-col gap-1.5 items-end">
//                   {task.submissionOwnFolderUrl && (
//                     <a href={task.submissionOwnFolderUrl} target="_blank" rel="noopener noreferrer"
//                       className="text-xs underline" style={{ color: '#a78bfa' }}>
//                       📁 Xem folder Drive của người tự tạo task
//                     </a>
//                   )}
//                   {task.submissionFolderName && (
//                     <p className="text-gray-500 text-[11px] max-w-[200px] text-right">📂 Nhân viên tự đặt tên folder: {task.submissionFolderName}</p>
//                   )}
//                   {task.submissionFileUrl && (
//                     <a href={task.submissionFileUrl} target="_blank" rel="noopener noreferrer"
//                       className="text-xs underline" style={{ color: '#60a5fa' }}>
//                       📁 Xem file trên Google Drive
//                     </a>
//                   )}
//                   {task.submissionNote && <p className="text-gray-500 text-xs max-w-[200px] text-right">{task.submissionNote}</p>}
//                   <div className="flex gap-1.5">
//                     <button onClick={() => handleReject(task)}
//                       className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#2a1010', color: '#f87171' }}>
//                       Không chấp nhận
//                     </button>
//                     <button onClick={() => handleApprove(task)}
//                       className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#0f2a1a', color: '#34d399' }}>
//                       ✓ Duyệt
//                     </button>
//                   </div>
//                 </div>

//               ) : task.status === 'submitted' && task.assignedTo.includes(currentUser.id) ? (
//                 <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#1a1a40', color: '#a78bfa' }}>
//                   ⏳ Đang chờ quản lý duyệt
//                 </span>

//               ) : isMyTask ? (
//                 <div className="flex flex-col gap-1 items-end">
//                   <div className="flex gap-1.5">
//                     {task.status === 'open' && !task.crossDeptPending && isBeforeStartDate && (
//                       <span className="px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: '#1a1a40', color: '#6b7280' }}>
//                         🔒 Chưa tới ngày bắt đầu ({fmtDate(task.startDate!)})
//                       </span>
//                     )}
//                     {task.status === 'open' && !task.crossDeptPending && !isBeforeStartDate && (
//                       <button onClick={() => handleStart(task.id)}
//                         className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#1e293b', color: '#60a5fa' }}>
//                         Bắt đầu
//                       </button>
//                     )}
//                     {task.status === 'in-progress' && (
//                       <button onClick={() => setSubmittingTask(task)}
//                         className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#1e293b', color: '#34d399' }}>
//                         Nộp task ✓
//                       </button>
//                     )}
//                   </div>
//                   {task.status === 'in-progress' && task.rejectedReason && (
//                     <p className="text-red-400 text-xs mt-1 max-w-[200px] text-right">❌ Bị từ chối: {task.rejectedReason}</p>
//                   )}
//                 </div>

//               ) : (
//                 <span className="text-xs px-2 py-0.5 rounded" style={{ color: STATUS_CONFIG[task.status].color, background: '#12121a' }}>
//                   {STATUS_CONFIG[task.status].label}
//                 </span>
//               )}
//             </div>

//               {isTaskParticipant && (
//                 <>
//                   <button onClick={() => setOpenCommentsFor(openCommentsFor === task.id ? null : task.id)}
//                     className="text-gray-500 hover:text-violet-400 text-xs flex items-center gap-1 mt-3">
//                     💬 Thảo luận {openCommentsFor === task.id ? '▲' : '▼'}
//                   </button>
//                   {openCommentsFor === task.id && (
//                     <TaskCommentsPanel taskId={task.id} currentUser={currentUser} users={users} />
//                   )}
//                 </>
//               )}
//             </div>
//           )
//         })}
//       </div>

//       {visible.length === 0 && (
//         <div className="text-center py-16 text-gray-600">
//           <div className="text-4xl mb-3">📭</div>
//           <div className="text-sm">Không có task nào</div>
//         </div>
//       )}

//       {/* Create Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
//           <div className="w-full max-w-md rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto"
//             style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//             <div className="flex justify-between items-center mb-5">
//               <h3 className="text-white font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
//                 {editingTask ? '✏️ Chỉnh sửa Task' : isManager && !selfMode ? '📋 Giao Task Mới' : '🎯 Tạo Task Cá Nhân'}
//               </h3>
//               <button onClick={() => { setShowModal(false); setEditingTask(null); setSelfMode(false) }} className="text-gray-500 hover:text-gray-300 text-2xl leading-none">×</button>
//             </div>

//             {isManager && !editingTask && (
//               <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: '#0a0a1a', border: '1px solid #1e1e3a' }}>
//                 <button onClick={() => setSelfMode(false)}
//                   className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
//                   style={{ background: !selfMode ? '#7c3aed' : 'transparent', color: !selfMode ? '#fff' : '#6b7280' }}>
//                   📋 Giao cho người khác
//                 </button>
//                 <button onClick={() => setSelfMode(true)}
//                   className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
//                   style={{ background: selfMode ? '#7c3aed' : 'transparent', color: selfMode ? '#fff' : '#6b7280' }}>
//                   🎯 Tự tạo cho tôi
//                 </button>
//               </div>
//             )}

//             <div className="space-y-3.5">
//               <div>
//                 <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Tên task *</label>
//                 <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
//                   placeholder="Mô tả ngắn gọn task..."
//                   className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-600 text-sm outline-none"
//                   style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//               </div>

//               <div>
//                 <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Mô tả</label>
//                 <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
//                   placeholder="Yêu cầu và mục tiêu cụ thể..." rows={2}
//                   className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-600 text-sm outline-none resize-none"
//                   style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//               </div>

//               {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div>
//                   <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">EXP thưởng</label>
//                   <input type="number" value={form.expReward}
//                     min={PRIORITY_EXP_LIMITS[form.priority].min} max={PRIORITY_EXP_LIMITS[form.priority].max}
//                     onChange={e => setForm({ ...form, expReward: parseInt(e.target.value) || 0 })}
//                     onBlur={() => setForm(f => {
//                       const { min, max } = PRIORITY_EXP_LIMITS[f.priority]
//                       return { ...f, expReward: Math.min(Math.max(f.expReward, min), max) }
//                     })}
//                     className="w-full px-3 py-2.5 rounded-lg text-amber-400 text-sm outline-none font-bold"
//                     style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//                   <p className="text-gray-600 text-[10px] mt-1.5 leading-relaxed">{PRIORITY_EXP_LIMITS[form.priority].hint}</p>
//                 </div>
//                 <div>
//                   <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Deadline</label>
//                   <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
//                     className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
//                     style={{ background: '#14143a', border: '1px solid #2a2a5a', colorScheme: 'dark' }} />
//                 </div>
//               </div> */}

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Ngày bắt đầu</label>
//                   <input type="date" value={form.startDate}
//                     onChange={e => {
//                       const startDate = e.target.value
//                       setForm(f => ({ ...f, startDate, expReward: suggestExp(f.priority, startDate, f.dueDate, f.important, f.urgent) }))
//                     }}
//                     className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
//                     style={{ background: '#14143a', border: '1px solid #2a2a5a', colorScheme: 'dark' }} />
//                 </div>
//                 <div>
//                   <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Hạn hoàn thành</label>
//                   <input type="date" value={form.dueDate} min={form.startDate || undefined}
//                     onChange={e => {
//                       const dueDate = e.target.value
//                       setForm(f => ({ ...f, dueDate, expReward: suggestExp(f.priority, f.startDate, dueDate, f.important, f.urgent) }))
//                     }}
//                     className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
//                     style={{ background: '#14143a', border: '1px solid #2a2a5a', colorScheme: 'dark' }} />
//                 </div>
//               </div>

// <div>
//   <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">EXP thưởng</label>
//   <input type="number" value={form.expReward}
//   onChange={e => setForm({ ...form, expReward: parseInt(e.target.value) || 0 })}
//   className="w-full px-3 py-2.5 rounded-lg text-amber-400 text-sm outline-none font-bold"
//   style={{
//     background: '#14143a',
//     border: `1px solid ${form.expReward < getExpRange(form.priority, form.important, form.urgent).min || form.expReward > getExpRange(form.priority, form.important, form.urgent).max ? '#f87171' : '#2a2a5a'}`,
//   }} />
// <p className="text-[10px] mt-1.5 leading-relaxed"
//   style={{ color: form.expReward < getExpRange(form.priority, form.important, form.urgent).min || form.expReward > getExpRange(form.priority, form.important, form.urgent).max ? '#f87171' : '#6b7280' }}>
//   💡 Gợi ý theo độ khó + Quan trọng/Gấp: {getExpRange(form.priority, form.important, form.urgent).min}–{getExpRange(form.priority, form.important, form.urgent).max} EXP
// </p>
// </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div>
//                   <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Danh mục</label>
//                   <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
//                     className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
//                     style={{ background: '#14143a', border: '1px solid #2a2a5a' }}>
//                     {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Ưu tiên</label>
//                   <select value={form.priority}
//                     onChange={e => {
//                       const newPriority = e.target.value as TaskPriority
//                       setForm(f => ({ ...f, priority: newPriority, expReward: suggestExp(newPriority, f.startDate, f.dueDate, f.important, f.urgent) }))
//                     }}
//                     className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
//                     style={{ background: '#14143a', border: '1px solid #2a2a5a' }}>
//                     <option value="low">Thấp</option>
//                     <option value="medium">Trung bình</option>
//                     <option value="high">Cao</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Mức độ quan trọng</label>
//                   <select value={form.important ? '1' : '0'}
//                     onChange={e => {
//                       const important = e.target.value === '1'
//                       setForm(f => ({ ...f, important, expReward: suggestExp(f.priority, f.startDate, f.dueDate, important, f.urgent) }))
//                     }}
//                     className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
//                     style={{ background: '#14143a', border: '1px solid #2a2a5a' }}>
//                     <option value="0">Không quan trọng</option>
//                     <option value="1">Quan trọng</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Mức độ gấp</label>
//                   <select value={form.urgent ? '1' : '0'}
//                     onChange={e => {
//                       const urgent = e.target.value === '1'
//                       setForm(f => ({ ...f, urgent, expReward: suggestExp(f.priority, f.startDate, f.dueDate, f.important, urgent) }))
//                     }}
//                     className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
//                     style={{ background: '#14143a', border: '1px solid #2a2a5a' }}>
//                     <option value="0">Không gấp</option>
//                     <option value="1">Gấp</option>
//                   </select>
//                 </div>
//               </div>

//               {isManager && !selfMode && (
//                 <>
//                   <MultiUserSelect
//                     label="Giao cho (Phụ trách) — mỗi người nhận đủ 100% EXP"
//                     options={employees}
//                     selected={form.assignedTo}
//                     onToggle={uid => toggleFormArray('assignedTo', uid)}
//                     placeholder="Chưa giao" />

//                   <MultiUserSelect
//                     label="Quản lý dự án (PM) — mỗi người nhận đủ 100% EXP"
//                     options={teamUsers}
//                     selected={form.projectManager}
//                     onToggle={uid => toggleFormArray('projectManager', uid)}
//                     placeholder="Chọn PM..."
//                     badge="PM" />

//                   <MultiUserSelect
//                     label={`Người hỗ trợ — mỗi người nhận ${Math.round(SUPPORTER_EXP_PERCENT * 100)}% EXP`}
//                     options={employees}
//                     selected={form.supporters}
//                     onToggle={uid => toggleFormArray('supporters', uid)}
//                     placeholder="Chọn người hỗ trợ..." />

//                   <div className="p-3 rounded-lg" style={{ background: '#0a0a1a', border: '1px solid #1e1e3a' }}>
//                     <label className="flex items-center gap-2.5 mb-2 cursor-pointer select-none">
//                       <input type="checkbox" checked={form.driveFolderCreated}
//                         onChange={e => setForm({ ...form, driveFolderCreated: e.target.checked })}
//                         className="w-4 h-4 rounded accent-violet-500" />
//                       <span className="text-white text-sm font-medium">📁 Tôi đã tạo sẵn folder Drive cho task này</span>
//                     </label>

//                     {form.driveFolderCreated ? (
//                       <input value={form.driveFolderName} onChange={e => setForm({ ...form, driveFolderName: e.target.value })}
//                         placeholder="Tên folder (VD: Nộp task - Nguyễn Văn A)"
//                         className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-600 text-sm outline-none"
//                         style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//                     ) : (
//                       <p className="text-gray-600 text-[10px] leading-relaxed">
//                         💡 Nếu không tick, nhân viên sẽ tự tạo folder trong Drive của bạn và tự đặt tên khi nộp.
//                       </p>
//                     )}
//                   </div>
//                 </>
//               )}

//               <div className="flex gap-3 pt-1">
//                 <button onClick={() => { setShowModal(false); setEditingTask(null); setSelfMode(false) }}
//                   className="flex-1 py-2.5 rounded-xl text-gray-400 text-sm"
//                   style={{ background: '#14143a', border: '1px solid #2a2a5a' }}>Hủy</button>
//                 <button onClick={handleSaveTask} disabled={!form.title.trim()}
//                   className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-40"
//                   style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>{editingTask ? 'Lưu thay đổi' : 'Tạo Task'}</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       {submittingTask && (
//         <SubmitTaskModal task={submittingTask} currentUser={currentUser} users={users} onClose={() => setSubmittingTask(null)} />
//       )}
//       {showCollabModal && (
//         <CollaborationRequestModal currentUser={currentUser} users={users} onClose={() => setShowCollabModal(false)} />
//       )}
//     </div>
//   )
// }

// // ==================== LEADERBOARD ====================

// function LeaderboardView({ users, tasks }: { users: User[]; tasks: Task[] }) {
//   const [tab, setTab] = useState<'individual' | 'team'>('individual')
//   const sorted = [...users].sort((a, b) => b.exp - a.exp)
//   const teams = TEAMS.map(team => {
//     const members = users.filter(u => u.teamId === team.id)
//     const totalExp = members.reduce((s, u) => s + u.exp, 0)
//     const done = tasks.filter(t => t.status === 'completed' && members.some(u => t.assignedTo.includes(u.id))).length
//     return { ...team, totalExp, memberCount: members.length, done, manager: users.find(u => u.teamId === team.id && u.role === 'manager') }
//   }).sort((a, b) => b.totalExp - a.totalExp)
//   const medals = ['🥇', '🥈', '🥉']

//   return (
//     <div className="p-6 max-w-3xl mx-auto">
//       <div className="text-center mb-6">
//         <h2 className="text-white text-3xl font-black mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>🏆 BẢNG XẾP HẠNG</h2>
//         <p className="text-gray-500 text-sm">Cạnh tranh lành mạnh — phát triển cùng nhau</p>
//       </div>

//       <div className="flex p-1 rounded-xl mb-6" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//         {[['individual', '👤 Cá nhân'], ['team', '👥 Đội nhóm']].map(([id, lbl]) => (
//           <button key={id} onClick={() => setTab(id as typeof tab)}
//             className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
//             style={{ background: tab === id ? '#7c3aed' : 'transparent', color: tab === id ? '#fff' : '#6b7280' }}>
//             {lbl}
//           </button>
//         ))}
//       </div>

//       {tab === 'individual' ? (
//         <div className="space-y-3">
//           {sorted.map((user, i) => {
//             const done = tasks.filter(t => t.status === 'completed' && t.assignedTo.includes(user.id)).length
//             return (
//               <div key={user.id} className="rounded-xl p-4 flex items-center gap-3 transition-all hover:translate-x-1"
//                 style={{
//                   background: i < 3 ? `linear-gradient(135deg, ${user.avatar.outfitColor}10, #0e0e24)` : '#0e0e24',
//                   border: `1px solid ${i < 3 ? user.avatar.outfitColor + '25' : '#1e1e4a'}`,
//                 }}>
//                 <div className="w-8 text-center">
//                   {i < 3 ? <span className="text-xl">{medals[i]}</span>
//                     : <span className="text-gray-600 font-bold text-sm font-mono">#{i + 1}</span>}
//                 </div>
//                 <CharAvatar user={user} size={44} />
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2 mb-0.5">
//                     <span className="text-white font-semibold text-sm">{user.name}</span>
//                     <LevelBadge exp={user.exp} />
//                     {user.role === 'manager' && <span className="text-[10px] px-1.5 rounded-full" style={{ background: '#1e0a3a', color: '#a78bfa' }}>Manager</span>}
//                   </div>
                  
//                   <div className="text-gray-500 text-xs mb-1">{TEAMS.find(t => t.id === user.teamId)?.name ?? '—'} · {done} task xong</div>
//                   <div className="max-w-[140px]"><ExpBarMini exp={user.exp} /></div>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-amber-400 text-xl font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{user.exp.toLocaleString()}</div>
//                   <div className="text-gray-600 text-xs">EXP</div>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {teams.map((team, i) => (
//             <div key={team.id} className="rounded-xl p-5"
//               style={{ background: '#0e0e24', border: `1px solid ${i === 0 ? '#f59e0b25' : '#1e1e4a'}` }}>
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <span className="text-3xl">{i < 3 ? medals[i] : `#${i + 1}`}</span>
//                   <div>
//                     <div className="flex items-center gap-2">
//                       <span className="text-xl">{team.emoji}</span>
//                       <span className="text-white font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Team {team.name}</span>
//                     </div>
//                     <div className="text-gray-500 text-xs">Manager: {team.manager?.name} · {team.memberCount} thành viên</div>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-amber-400 text-2xl font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{team.totalExp.toLocaleString()}</div>
//                   <div className="text-gray-600 text-xs">tổng EXP</div>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3" style={{ borderTop: '1px solid #1e1e3a' }}>
//                 <div className="text-center">
//                   <div className="text-white font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{team.done}</div>
//                   <div className="text-gray-600 text-xs">Task xong</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-white font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{Math.round(team.totalExp / team.memberCount)}</div>
//                   <div className="text-gray-600 text-xs">EXP TB/người</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// // ==================== REWARDS ====================
// function RedemptionHistoryPanel({ users }: { users: User[] }) {
//   const [allRedemptions, setAllRedemptions] = useState<{
//     id: string; userId: string; rewardName: string; cost: number; redeemedAt: string
//   }[]>([])
//   const [loading, setLoading] = useState(true)
//   const [range, setRange] = useState<'week' | 'month' | 'all' | 'custom'>('month')
//   const [customFrom, setCustomFrom] = useState('')
//   const [customTo, setCustomTo] = useState('')

//   useEffect(() => {
//     supabase.from('redemptions').select('*').order('redeemed_at', { ascending: false })
//       .then(({ data }) => {
//         if (data) setAllRedemptions(data.map(r => ({
//           id: r.id, userId: r.user_id, rewardName: r.reward_name, cost: r.cost, redeemedAt: r.redeemed_at,
//         })))
//         setLoading(false)
//       })
//   }, [])

//   const filtered = allRedemptions.filter(r => {
//     const d = new Date(r.redeemedAt)
//     const now = new Date()
//     if (range === 'week') {
//       const startOfWeek = new Date(now)
//       startOfWeek.setDate(now.getDate() - now.getDay())
//       startOfWeek.setHours(0, 0, 0, 0)
//       return d >= startOfWeek
//     }
//     if (range === 'month') {
//       return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
//     }
//     if (range === 'custom') {
//       if (customFrom && d < new Date(customFrom)) return false
//       if (customTo && d > new Date(customTo + 'T23:59:59')) return false
//       return true
//     }
//     return true // 'all'
//   })
//   const exportExcel = () => {
//   const rows = filtered.map(r => {
//   const u = users.find(x => x.id === r.userId)
//   const team = TEAMS.find(t => t.id === u?.teamId)
//   return {
//     'Nhân viên': u?.name ?? '(đã xoá)',
//     'Email': u?.email ?? '',
//     'Phòng ban': team?.name ?? '',
//     'Phần thưởng': r.rewardName,
//     'Điểm đã dùng': r.cost,
//     'Ngày đổi': new Date(r.redeemedAt).toLocaleString('vi-VN'),
//   }
// })
// const ws = XLSX.utils.json_to_sheet(rows)
// ws['!cols'] = [{ wch: 22 }, { wch: 26 }, { wch: 28 }, { wch: 25 }, { wch: 14 }, { wch: 20 }]
//     const wb = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(wb, ws, 'Lich su doi qua')
//     const label = range === 'week' ? 'tuan-nay' : range === 'month' ? 'thang-nay' : range === 'custom' ? `${customFrom || 'batdau'}_${customTo || 'ketthuc'}` : 'tatca'
//     XLSX.writeFile(wb, `lich-su-doi-qua_${label}.xlsx`)
//   }

//   const RANGE_OPTIONS: { id: typeof range; label: string }[] = [
//     { id: 'week', label: 'Tuần này' },
//     { id: 'month', label: 'Tháng này' },
//     { id: 'all', label: 'Tất cả' },
//     { id: 'custom', label: 'Tự chọn' },
//   ]

//   return (
//     <div className="mt-8 rounded-xl p-5" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//       <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
//         <h3 className="text-white font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
//           📋 Lịch sử đổi quà toàn công ty
//         </h3>
//         <button onClick={exportExcel} disabled={filtered.length === 0}
//           className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-40"
//           style={{ background: '#10b981', color: '#fff' }}>
//           ⬇ Xuất Excel ({filtered.length})
//         </button>
//       </div>

//       <div className="flex gap-2 mb-4 flex-wrap items-center">
//         {RANGE_OPTIONS.map(opt => (
//           <button key={opt.id} onClick={() => setRange(opt.id)}
//             className="px-3 py-1.5 rounded-lg text-xs font-semibold"
//             style={{ background: range === opt.id ? '#7c3aed' : '#14143a', color: range === opt.id ? '#fff' : '#6b7280' }}>
//             {opt.label}
//           </button>
//         ))}
//         {range === 'custom' && (
//           <>
//             <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
//               className="px-2 py-1.5 rounded-lg text-xs text-white outline-none"
//               style={{ background: '#14143a', border: '1px solid #2a2a5a', colorScheme: 'dark' }} />
//             <span className="text-gray-600 text-xs">đến</span>
//             <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
//               className="px-2 py-1.5 rounded-lg text-xs text-white outline-none"
//               style={{ background: '#14143a', border: '1px solid #2a2a5a', colorScheme: 'dark' }} />
//           </>
//         )}
//       </div>

//       {loading ? (
//         <p className="text-gray-500 text-sm">Đang tải...</p>
//       ) : filtered.length === 0 ? (
//         <p className="text-gray-500 text-sm">Không có dữ liệu trong khoảng thời gian này.</p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-gray-500 text-left" style={{ borderBottom: '1px solid #1e1e4a' }}>
//                 <th className="py-2 pr-4">Nhân viên</th>
//                 <th className="py-2 pr-4">Email</th>
//                 <th className="py-2 pr-4">Phòng ban</th>
//                 <th className="py-2 pr-4">Phần thưởng</th>
//                 <th className="py-2 pr-4">Điểm</th>
//                 <th className="py-2 pr-4">Ngày đổi</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map(r => {
//                 const u = users.find(x => x.id === r.userId)
//                 const team = TEAMS.find(t => t.id === u?.teamId)
//                 return (
//                   <tr key={r.id} style={{ borderBottom: '1px solid #14142a' }}>
//                     <td className="py-2 pr-4 text-gray-300">{u?.name ?? '(đã xoá)'}</td>
//                     <td className="py-2 pr-4 text-gray-500 text-xs">{u?.email ?? ''}</td>
//                     <td className="py-2 pr-4 text-gray-500 text-xs">{team?.name ?? ''}</td>
//                     <td className="py-2 pr-4 text-gray-300">{r.rewardName}</td>
//                     <td className="py-2 pr-4 text-amber-400">{r.cost}</td>
//                     <td className="py-2 pr-4 text-gray-500">{new Date(r.redeemedAt).toLocaleDateString('vi-VN')}</td>
//                   </tr>
//                 ) 
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   )
// }

// function BodLogView({ tasks, users }: { tasks: Task[]; users: User[] }) {
//   const [tab, setTab] = useState<'tasks' | 'rewards'>('tasks')
//   const getUserById = (id?: string) => users.find(u => u.id === id)

//   const approvedTasks = [...tasks]
//     .filter(t => t.status === 'completed')
//     .sort((a, b) => (b.approvedAt ?? '').localeCompare(a.approvedAt ?? ''))

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <div className="text-center mb-6">
//         <h2 className="text-white text-3xl font-black mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>📊 Nhật ký BOD</h2>
//         <p className="text-gray-500 text-sm">Theo dõi task đã duyệt và phần thưởng đã đổi toàn công ty</p>
//       </div>

//       <div className="flex p-1 rounded-xl mb-6 max-w-md mx-auto" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//         {[['tasks', '📋 Task đã duyệt'], ['rewards', '🎁 Phần thưởng đã đổi']].map(([id, lbl]) => (
//           <button key={id} onClick={() => setTab(id as typeof tab)}
//             className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
//             style={{ background: tab === id ? '#7c3aed' : 'transparent', color: tab === id ? '#fff' : '#6b7280' }}>
//             {lbl}
//           </button>
//         ))}
//       </div>

//       {tab === 'tasks' ? (
//         <div className="rounded-xl overflow-hidden" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//           {approvedTasks.length === 0 ? (
//             <p className="text-gray-500 text-sm text-center py-10">Chưa có task nào được duyệt.</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="text-gray-500 text-left" style={{ borderBottom: '1px solid #1e1e4a' }}>
//                     <th className="py-2.5 px-4">Task</th>
//                     <th className="py-2.5 px-4">Người phụ trách</th>
//                     <th className="py-2.5 px-4">Phòng ban</th>
//                     <th className="py-2.5 px-4">Duyệt bởi</th>
//                     <th className="py-2.5 px-4">Ngày duyệt</th>
//                     <th className="py-2.5 px-4">EXP</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {approvedTasks.map(t => {
//                     const assignee = getUserById(t.assignedTo[0])
//                     const approver = getUserById(t.approvedBy)
//                     const team = TEAMS.find(team => team.id === assignee?.teamId)
//                     return (
//                       <tr key={t.id} style={{ borderBottom: '1px solid #14142a' }}>
//                         <td className="py-2.5 px-4 text-white font-medium">{t.title}</td>
//                         <td className="py-2.5 px-4 text-gray-300">
//                           {t.assignedTo.map(id => getUserById(id)?.name).filter(Boolean).join(', ') || '—'}
//                         </td>
//                         <td className="py-2.5 px-4 text-gray-500 text-xs">{team?.name ?? '—'}</td>
//                         <td className="py-2.5 px-4 text-gray-300">{approver?.name ?? '—'}</td>
//                         <td className="py-2.5 px-4 text-gray-500 text-xs">
//                           {t.approvedAt ? new Date(t.approvedAt).toLocaleString('vi-VN') : '—'}
//                         </td>
//                         <td className="py-2.5 px-4 text-amber-400 font-bold">+{t.expReward}</td>
//                       </tr>
//                     )
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       ) : (
//         <RedemptionHistoryPanel users={users} />
//       )}
//     </div>
//   )
// }


// function RewardsView({ currentUser, redemptions, users }: { currentUser: User; redemptions: { id: string; userId: string; rewardId: string; cost: number }[]; users: User[] }) {
//   const myRedemptions = redemptions.filter(r => r.userId === currentUser.id)
//   const spentPoints = myRedemptions.reduce((s, r) => s + r.cost, 0)
//   const availablePoints = currentUser.exp - spentPoints
//   const redeemed = myRedemptions.map(r => r.rewardId)
//   const [notice, setNotice] = useState('')

//   const handleRedeem = async (r: Reward) => {
//   if (availablePoints < r.cost || redeemed.includes(r.id)) return
//   const { error } = await supabase.from('redemptions').insert({
//     user_id: currentUser.id, reward_id: r.id, reward_name: r.name, cost: r.cost,
//   })
//   if (error) { setNotice('❌ Lỗi: ' + error.message); setTimeout(() => setNotice(''), 3500); return }

//   await supabase.from('notifications').insert({
//     message: `🎁 ${currentUser.name} vừa dùng ${r.cost} điểm đổi lấy: ${r.name}`,
//   })

//   setNotice(`🎉 Đổi thành công: ${r.name}!`)
//   setTimeout(() => setNotice(''), 3500)
// }
// //   const handleRedeem = async (r: Reward) => {
// //   if (availablePoints < r.cost || redeemed.includes(r.id)) return
// //   const { error } = await supabase.from('redemptions').insert({
// //     user_id: currentUser.id, reward_id: r.id, reward_name: r.name, cost: r.cost,
// //   })
// //   if (error) { setNotice('❌ Lỗi: ' + error.message); setTimeout(() => setNotice(''), 3500); return }

// //   const notifMessage = `🎁 ${currentUser.name} vừa dùng ${r.cost} điểm đổi lấy: ${r.name}`
// //   await supabase.from('notifications').insert({ message: notifMessage })

// //   const { data: pushData, error: pushError } =
// //   await supabase.functions.invoke('send-push', {
// //     body: { message: notifMessage }
// //   })

// // console.log('Push result:', pushData)
// // console.log('Push error:', pushError)

// //   setNotice(`🎉 Đổi thành công: ${r.name}!`)
// //   setTimeout(() => setNotice(''), 3500)
// // }
//   return (
//     <div className="p-6 max-w-5xl mx-auto">
//       <div className="flex items-start justify-between mb-6">
//         <div>
//           <h2 className="text-white text-2xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>🎁 Cửa Hàng Phần Thưởng</h2>
//           <p className="text-gray-500 text-sm">Đổi EXP lấy phần thưởng xứng đáng</p>
//         </div>
//         <div className="px-5 py-3 rounded-xl text-right" style={{ background: '#1a1200', border: '1px solid #3a2800' }}>
//           <div className="text-gray-500 text-xs mb-0.5">Điểm khả dụng</div>
//           <div className="text-amber-400 text-2xl font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{availablePoints.toLocaleString()} ⚡</div>
//         </div>
//         </div>

//       {notice && (
//         <div className="mb-5 p-3 rounded-xl text-center text-green-400 text-sm font-medium animate-slide-up"
//           style={{ background: '#0a2a1a', border: '1px solid #10b98130' }}>{notice}</div>
//       )}

//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {REWARDS.map(r => {
//           const can = availablePoints >= r.cost
//           const done = redeemed.includes(r.id)
//           return (
//             <div key={r.id} className="rounded-xl p-5 flex flex-col transition-all hover:-translate-y-0.5"
//               style={{ background: '#0e0e24', border: `1px solid ${done ? '#10b98130' : can ? '#1e1e4a' : '#141420'}`, opacity: done ? 0.75 : 1 }}>
//               <div className="text-4xl text-center mb-3">{r.emoji}</div>
//               <div className="flex-1 text-center">
//                 <h3 className="text-white font-bold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{r.name}</h3>
//                 <p className="text-gray-500 text-xs mb-2">{r.description}</p>
//                 <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#0e0e28', color: '#4b5563' }}>{r.category}</span>
//               </div>
//               <div className="mt-4 text-center mb-2">
//                 <span className="text-xl font-black" style={{ fontFamily: 'Rajdhani, sans-serif', color: can ? '#f59e0b' : '#4b5563' }}>
//                   {r.cost.toLocaleString()} EXP
//                 </span>
//               </div>
//               <button onClick={() => handleRedeem(r)} disabled={!can || done}
//                 className="w-full py-2 rounded-lg font-bold text-sm disabled:cursor-not-allowed"
//                 style={{ background: done ? '#0a2a1a' : can ? 'linear-gradient(135deg,#7c3aed,#f59e0b)' : '#141420', color: done ? '#10b981' : can ? '#fff' : '#3a3a5a' }}>
//                 {done ? '✓ Đã đổi' : can ? 'Đổi ngay' : 'Chưa đủ EXP'}
//               </button>
//             </div>
//           )
//         })}
//       </div>

//       {currentUser.teamId === 't1c' && <RedemptionHistoryPanel users={users} />}
//     </div>
//   )
// }




// function UserProfileCard({ user, onClose, onMessage }: { user: User; onClose: () => void; onMessage?: () => void }) {
//   const { progress, needed, level } = getExpProgress(user.exp)
//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: '#000000a0' }} onClick={onClose}>
//       <div className="relative w-full max-w-xs rounded-2xl p-6 text-center animate-slide-up"
//         onClick={e => e.stopPropagation()}
//         style={{ background: `linear-gradient(135deg, ${user.avatar.outfitColor}18, #0e0e24)`, border: `1px solid ${user.avatar.outfitColor}35` }}>
//         <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
//         <div className="w-24 h-32 mx-auto mb-3 rounded-2xl overflow-hidden flex items-end justify-center"
//           style={{ background: `${user.avatar.outfitColor}20`, border: `2px solid ${user.avatar.outfitColor}40`, boxShadow: `0 0 24px ${user.avatar.outfitColor}40` }}>
//           <FullAvatar avatar={user.avatar} size={86} />
//         </div>
//         <h3 className="text-white font-bold text-lg mb-0.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{user.name}</h3>
//         <p className="text-gray-500 text-xs mb-3">{TEAMS.find(t => t.id === user.teamId)?.name ?? user.department}</p>
//         <div className="flex justify-center mb-3"><LevelBadge exp={user.exp} /></div>
//         <div className="text-amber-400 text-xl font-black mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{user.exp.toLocaleString()} EXP</div>
//         <div className="text-gray-600 text-[11px] mb-3">Cần {needed} EXP → Lv.{level + 1}</div>
//         <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: '#1a1a3a' }}>
//           <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#f59e0b)' }} />
//         </div>
//         <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium" style={{ background: '#1a0a3a', color: '#a78bfa', border: '1px solid #3a1a6a' }}>
//           {user.role === 'manager' ? '👑 Quản Lý' : '⚔️ Nhân Viên'}
//         </span>
//         {onMessage && (
//           <button onClick={onMessage}
//             className="w-full mt-4 py-2.5 rounded-lg font-bold text-white text-sm"
//             style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>
//             💬 Nhắn tin riêng
//           </button>
//         )}
//       </div>
//     </div>
//   )
// }
// // ==================== SOCIAL ====================

// function SocialView({ currentUser, users, messages, setMessages, showMentions, setShowMentions, markMentionsSeen, navigateTarget, clearNavigateTarget }: {
//   currentUser: User; users: User[]; messages: Message[]; setMessages: (m: Message[]) => void
//   showMentions: boolean; setShowMentions: (v: boolean) => void; markMentionsSeen: () => void
//   navigateTarget?: { channel: ChatChannel; dmUserId?: string } | null
//   clearNavigateTarget?: () => void
// }) {
//   const [channel, setChannel] = useState<ChatChannel>('general')
//   const [dmUserId, setDmUserId] = useState<string | null>(null)
//   const [input, setInput] = useState('')
//   const [mentionQuery, setMentionQuery] = useState<string | null>(null)
//   const [profileUser, setProfileUser] = useState<User | null>(null)
//   const [lastSeenMap, setLastSeenMap] = useState<Record<string, string>>(() => {
//     try { return JSON.parse(localStorage.getItem('chatLastSeen') || '{}') } catch { return {} }
//   })
//   const endRef = useRef<HTMLDivElement>(null)
//   const inputRef = useRef<HTMLInputElement>(null)
//   const messageRefs = useRef<Record<string, HTMLDivElement | null>>({})
//   const [highlightedId, setHighlightedId] = useState<string | null>(null)

//   const markSeen = (key: string) => {
//     const now = new Date().toISOString()
//     setLastSeenMap(prev => {
//       const next = { ...prev, [key]: now }
//       localStorage.setItem('chatLastSeen', JSON.stringify(next))
//       return next
//     })
//   }

//   useEffect(() => { markSeen('channel:general') }, [])

//   useEffect(() => {
//     if (!navigateTarget) return
//     setShowMentions(false)
//     if (navigateTarget.channel === 'dm' && navigateTarget.dmUserId) {
//       setChannel('dm')
//       setDmUserId(navigateTarget.dmUserId)
//       markSeen(`dm:${navigateTarget.dmUserId}`)
//     } else {
//       setChannel(navigateTarget.channel)
//       setDmUserId(null)
//       markSeen(`channel:${navigateTarget.channel}`)
//     }
//     clearNavigateTarget?.()
//   }, [navigateTarget])

//   useEffect(() => {
//     if (showMentions) markMentionsSeen()
//   }, [showMentions])

//   const isDm = channel === 'dm' && dmUserId !== null
//   const dmPartner = isDm ? users.find(u => u.id === dmUserId) : undefined

//   const mentionMessages = messages.filter(m =>
//     isMessageVisibleTo(m, currentUser, users) &&
//     parseMentions(m.content, users).some(x => x.user.id === currentUser.id)
//   )

//   const filtered = showMentions
//     ? mentionMessages
//     : isDm
//     ? messages.filter(m => m.channel === 'dm' &&
//         ((m.userId === currentUser.id && m.toUserId === dmUserId) ||
//          (m.userId === dmUserId && m.toUserId === currentUser.id)))
//     : channel === 'team'
//       ? messages.filter(m => m.channel === 'team' &&
//           users.find(u => u.id === m.userId)?.teamId === currentUser.teamId)
//       : messages.filter(m => m.channel === channel)

//   useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [filtered.length, channel, dmUserId, showMentions])

//   useEffect(() => {
//     if (showMentions) return
//     if (isDm && dmUserId) markSeen(`dm:${dmUserId}`)
//     else if (!isDm) markSeen(`channel:${channel}`)
//   }, [filtered.length, channel, dmUserId, showMentions])

//   const channelUnread = (chId: ChatChannel) => {
//     const seen = lastSeenMap[`channel:${chId}`] || ''
//     return messages.some(m => {
//       if (m.channel !== chId || m.userId === currentUser.id) return false
//       if (chId === 'team' && users.find(u => u.id === m.userId)?.teamId !== currentUser.teamId) return false
//       return m.timestamp > seen
//     })
//   }

//   const dmUnread = (partnerId: string) => {
//     const seen = lastSeenMap[`dm:${partnerId}`] || ''
//     return messages.some(m => m.channel === 'dm' && m.userId === partnerId && m.toUserId === currentUser.id && m.timestamp > seen)
//   }

//   // const send = () => {
//   //   if (!input.trim()) return
//   //   setMessages([...messages, {
//   //     id: `m_${Date.now()}`, userId: currentUser.id, content: input.trim(),
//   //     timestamp: new Date().toISOString(),
//   //     channel: isDm ? 'dm' : channel,
//   //     ...(isDm ? { toUserId: dmUserId! } : {}),
//   //   }])
//   //   setInput('')
//   // }
//   const mentionCandidates = mentionQuery === null ? [] : users
//     .filter(u => u.id !== currentUser.id)
//     .filter(u => u.name.toLowerCase().includes(mentionQuery.toLowerCase()))
//     .slice(0, 6)

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value
//     setInput(value)
//     const cursor = e.target.selectionStart ?? value.length
//     const beforeCursor = value.slice(0, cursor)
//     const atIndex = beforeCursor.lastIndexOf('@')
//     if (atIndex === -1) { setMentionQuery(null); return }
//     const afterAt = beforeCursor.slice(atIndex + 1)
//     if (/\s/.test(afterAt)) { setMentionQuery(null); return }
//     setMentionQuery(afterAt)
//   }

//   const selectMention = (user: User) => {
//     const cursor = inputRef.current?.selectionStart ?? input.length
//     const beforeCursor = input.slice(0, cursor)
//     const atIndex = beforeCursor.lastIndexOf('@')
//     if (atIndex === -1) return
//     const before = input.slice(0, atIndex)
//     const after = input.slice(cursor)
//     setInput(`${before}@${user.name} ${after}`)
//     setMentionQuery(null)
//     requestAnimationFrame(() => inputRef.current?.focus())
//   }

//   const send = async () => {
//     if (!input.trim()) return
//     const content = input.trim()
//     const { error } = await supabase.from('messages').insert({
//       user_id: currentUser.id,
//       to_user_id: isDm ? dmUserId : null,
//       content,
//       channel: isDm ? 'dm' : channel,
//     })
//     if (error) { console.error(error); return }
//     setInput('')
//     setMentionQuery(null)

//     // Báo cho những người bị @tag trong tin nhắn
//     const mentioned = parseMentions(content, users)
//     const notifiedIds = new Set<string>()
//     const currentChannel = isDm ? 'dm' : channel
//     const channelLabel = currentChannel === 'dm' ? 'tin nhắn riêng'
//       : currentChannel === 'team' ? 'kênh team'
//       : currentChannel === 'announcements' ? 'kênh thông báo'
//       : 'kênh chung'
//     const preview = content.length > 60 ? content.slice(0, 60) + '…' : content
//     for (const m of mentioned) {
//       if (m.user.id === currentUser.id || notifiedIds.has(m.user.id)) continue
//       notifiedIds.add(m.user.id)
//       await supabase.from('notifications').insert({
//         message: `💬 ${currentUser.name} đã nhắc đến bạn ở ${channelLabel}: "${preview}"`,
//         target_user_id: m.user.id,
//         link_channel: currentChannel,
//         link_dm_user_id: currentChannel === 'dm' ? currentUser.id : null,
//       })
//     }
//   }

//   const canPost = isDm || channel !== 'announcements' || currentUser.role === 'manager'

//   // const CHANNELS: { id: ChatChannel; label: string; desc: string }[] = [
//   //   { id: 'general', label: '# chung', desc: 'Tất cả' },
//   //   { id: 'team', label: '# team', desc: 'Nội bộ' },
//   //   { id: 'announcements', label: '📣 thông báo', desc: 'Manager' },
//   // ]

//   const myTeam = TEAMS.find(t => t.id === currentUser.teamId)

//   const CHANNELS: { id: ChatChannel; label: string; desc: string; icon: string }[] = [
//     { id: 'general', label: '# chung', desc: 'Tất cả', icon: '💬' },
//     { id: 'team', label: myTeam ? `# ${myTeam.name}` : '# team', desc: myTeam ? `${myTeam.emoji} Nội bộ team` : 'Chưa có team', icon: '👥' },
//     { id: 'announcements', label: '📣 thông báo', desc: 'Manager', icon: '📣' },
//   ]

//   const openChannel = (id: ChatChannel) => {
//     setChannel(id)
//     setDmUserId(null)
//     setShowMentions(false)
//     markSeen(`channel:${id}`)
//   }

//   const openDm = (userId: string) => {
//     setChannel('dm')
//     setDmUserId(userId)
//     setShowMentions(false)
//     markSeen(`dm:${userId}`)
//   }

//   const headerLabel = showMentions ? '🔔 Nhắc đến tôi' : isDm ? `@ ${dmPartner?.name ?? ''}` : CHANNELS.find(c => c.id === channel)?.label
//   const headerDesc = showMentions ? 'Tất cả tin nhắn có tag bạn' : isDm ? 'Nhắn tin riêng' : CHANNELS.find(c => c.id === channel)?.desc

//   // Tối đa 3 thông báo mới nhất của Ban Giám đốc (BOD), được ghim ở đầu kênh "thông báo"
//   const pinnedAnnouncements = (channel === 'announcements' && !isDm && !showMentions)
//     ? [...messages]
//         .filter(m => m.channel === 'announcements' && users.find(u => u.id === m.userId)?.isDirector)
//         .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
//         .slice(0, 3)
//     : []

//   const handleUnpin = async (messageId: string) => {
//     if (!window.confirm('Gỡ thông báo này khỏi mục ghim? Thông báo sẽ bị xoá hoàn toàn khỏi kênh.')) return
//     const { error } = await supabase.from('messages').delete().eq('id', messageId)
//     if (error) {
//       alert('Không xoá được: ' + error.message)
//       console.error(error)
//     }
//   }

//   const jumpToMessage = (messageId: string) => {
//     const el = messageRefs.current[messageId]
//     if (el) {
//       el.scrollIntoView({ behavior: 'smooth', block: 'center' })
//       setHighlightedId(messageId)
//       setTimeout(() => setHighlightedId(prev => (prev === messageId ? null : prev)), 2500)
//     }
//   }

//   return (
//     <div className="flex" style={{ height: 'calc(100vh - 64px)' }}>
//     {/* Sidebar */}
//     <div className="w-16 md:w-48 flex-shrink-0 p-1.5 md:p-3 flex flex-col overflow-hidden"
//       style={{ background: '#060610', borderRight: '1px solid #1a1a3a' }}>
//         <p className="text-gray-700 text-[10px] uppercase tracking-widest px-2 mb-2">Kênh</p>
//         {CHANNELS.map(ch => (
//           <button key={ch.id} onClick={() => openChannel(ch.id)} title={ch.label}
//             className="relative w-full text-left px-2 py-2 rounded-lg mb-0.5 transition-all flex md:block items-center justify-center md:justify-start"
//             style={{ background: !isDm && !showMentions && channel === ch.id ? '#1a1a40' : 'transparent', color: !isDm && !showMentions && channel === ch.id ? '#e2e8f0' : '#6b7280' }}>
//             <span className="text-lg md:hidden relative">
//               {ch.icon}
//               {channelUnread(ch.id) && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />}
//             </span>
//             <div className="text-sm hidden md:flex items-center gap-1.5 min-w-0">
//               <span className="truncate">{ch.label}</span>
//               {channelUnread(ch.id) && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
//             </div>
//             <div className="text-[10px] opacity-50 hidden md:block">{ch.desc}</div>
//           </button>
//         ))}

//         <p className="text-gray-700 text-[10px] uppercase tracking-widest px-2 mt-4 mb-2">Online ({users.length})</p>
//         <div className="space-y-1 overflow-y-auto flex-1">
//           {users.filter(u => u.id !== currentUser.id).map(u => (
//             <button key={u.id} onClick={() => openDm(u.id)}
//               className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all"
//               style={{ background: isDm && !showMentions && dmUserId === u.id ? '#1a1a40' : 'transparent' }}>
//               <div className="relative flex-shrink-0">
//                 <CharAvatar user={u} size={20} />
//                 <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400"
//                   style={{ border: '1.5px solid #060610' }} />
//               </div>
//               <span className="text-gray-300 text-[11px] truncate flex-1 text-left">{u.name.split(' ').slice(-1)[0]}</span>
//               {u.role === 'manager' && <span className="text-[9px] text-purple-400">QL</span>}
//               {dmUnread(u.id) && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Chat */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <div className="px-5 py-3 flex items-center gap-2 flex-shrink-0" style={{ borderBottom: '1px solid #1a1a3a' }}>
//           {isDm && dmPartner && <CharAvatar user={dmPartner} size={24} />}
//           <span className="text-white font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
//             {headerLabel}
//           </span>
//           <span className="text-gray-600 text-xs">— {headerDesc}</span>
//           <span className="ml-auto text-gray-600 text-xs">{filtered.length} tin nhắn</span>
//         </div>

//         {pinnedAnnouncements.length > 0 && (
//           <div className="px-4 pt-3 pb-1 flex-shrink-0 space-y-2" style={{ background: '#120d00', borderBottom: '1px solid #3a2e00' }}>
//             <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
//               📌 Thông báo mới nhất
//             </p>
//             {pinnedAnnouncements.map(msg => {
//               const sender = users.find(u => u.id === msg.userId)
//               if (!sender) return null
//               return (
//                 <div key={msg.id} onClick={() => jumpToMessage(msg.id)}
//                   className="flex items-start gap-2 p-2.5 rounded-lg mb-2 group transition-all hover:brightness-110"
//                   style={{ background: '#1e1600', border: '1px solid #4a3a00', cursor: 'pointer' }}>
//                   <CharAvatar user={sender} size={26} />
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-1.5">
//                       <span className="text-amber-300 text-xs font-bold">👑 BOD · {sender.name}</span>
//                       <span className="text-gray-600 text-[10px]">{fmtTime(msg.timestamp)}</span>
//                     </div>
//                     <p className="text-amber-100/90 text-xs mt-0.5 leading-relaxed break-words">
//                       {renderMessageContent(msg.content, users, setProfileUser)}
//                     </p>
//                   </div>
//                   {currentUser.isDirector && (
//                     <button onClick={e => { e.stopPropagation(); handleUnpin(msg.id) }}
//                       title="Gỡ khỏi ghim (đã hoàn thành / hết hạn)"
//                       className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-amber-400/70 hover:text-red-400 text-xs px-2 py-1 rounded-lg transition-all"
//                       style={{ background: '#0000002a' }}>
//                       🗑 Gỡ
//                     </button>
//                   )}
//                 </div>
//               )
//             })}
//           </div>
//         )}

//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {filtered.map(msg => {
//             const sender = users.find(u => u.id === msg.userId)
//             if (!sender) return null
//             const isMe = msg.userId === currentUser.id
//             const mentionsMe = !isMe && parseMentions(msg.content, users).some(m => m.user.id === currentUser.id)
//             const isManagerMsg = !isMe && !!sender.isDirector
//             const isHighlighted = highlightedId === msg.id
//             return (
//               <div key={msg.id} ref={el => { messageRefs.current[msg.id] = el }}
//                 className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
//                 style={{ transition: 'background 0.4s ease', borderRadius: 12, background: isHighlighted ? '#7c3aed22' : 'transparent' }}>
//                 <CharAvatar user={sender} size={36} />
//                 <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
//                   <div className="flex items-center gap-2 mb-1 flex-wrap">
//                     {!isMe && (
//                       <span className="text-xs font-semibold flex items-center gap-1" style={{ color: isManagerMsg ? '#fbbf24' : sender.avatar.outfitColor }}>
//                         {isManagerMsg && '👑'} {sender.name}
//                       </span>
//                     )}
//                     <span className="text-gray-700 text-[10px]">{fmtTime(msg.timestamp)}</span>
//                     {mentionsMe && (
//                       <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#3a2e00', color: '#facc15' }}>
//                         Bạn được tag
//                       </span>
//                     )}
//                     {showMentions && (
//                       <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: '#1e1e4a', color: '#9ca3af' }}>
//                         {msg.channel === 'dm'
//                           ? `DM với ${(msg.userId === currentUser.id ? users.find(u => u.id === msg.toUserId) : users.find(u => u.id === msg.userId))?.name ?? '?'}`
//                           : msg.channel === 'team' ? '# team' : msg.channel === 'announcements' ? '📣 thông báo' : '# chung'}
//                       </span>
//                     )}
//                   </div>
//                   <div className="px-4 py-2.5 text-sm leading-relaxed"
//                     style={{
//                       background: isMe ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : mentionsMe ? '#241d05' : isManagerMsg ? '#1e1600' : '#0e0e24',
//                       color: isMe ? '#fff' : '#d1d5db',
//                       borderRadius: isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
//                       border: isMe ? 'none' : mentionsMe ? '1px solid #facc15' : isManagerMsg ? '1px solid #4a3a00' : '1px solid #1e1e4a',
//                       boxShadow: mentionsMe ? '0 0 12px #facc1530' : 'none',
//                     }}>
//                     {renderMessageContent(msg.content, users, setProfileUser)}
//                   </div>
//                 </div>
//               </div>
//             )
//           })}
//           {filtered.length === 0 && (
//             <div className="text-center py-16 text-gray-700">
//               <div className="text-3xl mb-2">💬</div>
//               <div className="text-sm">
//                 {isDm ? `Chưa có tin nhắn nào với ${dmPartner?.name}. Hãy bắt đầu!` : 'Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!'}
//               </div>
//             </div>
//           )}
//           <div ref={endRef} />
//         </div>

//         <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid #1a1a3a' }}>
//           {showMentions ? (
//             <div className="text-center text-gray-600 text-sm py-2">
//               💬 Bấm vào kênh tương ứng bên trên tin nhắn để trả lời
//             </div>
//           ) : canPost ? (
//             <div className="flex gap-3 items-center">
//               <CharAvatar user={currentUser} size={36} />
//               <div className="relative flex-1 min-w-0">
//                 {mentionQuery !== null && mentionCandidates.length > 0 && (
//                   <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl overflow-hidden z-20"
//                     style={{ background: '#14143a', border: '1px solid #2a2a5a', boxShadow: '0 8px 24px #00000060' }}>
//                     {mentionCandidates.map(u => (
//                       <button key={u.id} onClick={() => selectMention(u)}
//                         className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#1e1e4a] transition-colors">
//                         <CharAvatar user={u} size={22} />
//                         <span className="text-white text-sm">{u.name}</span>
//                       </button>
//                     ))}
//                   </div>
//                 )}
//                 <input ref={inputRef} value={input} onChange={handleInputChange}
//                   onKeyDown={e => {
//                     if (e.key === 'Enter' && !e.shiftKey) {
//                       if (mentionQuery !== null && mentionCandidates.length > 0) {
//                         e.preventDefault()
//                         selectMention(mentionCandidates[0])
//                       } else {
//                         send()
//                       }
//                     }
//                     if (e.key === 'Escape') setMentionQuery(null)
//                   }}
//                   placeholder={isDm ? `Nhắn riêng cho ${dmPartner?.name}... (gõ @ để tag, Enter để gửi)` : `Nhắn vào ${CHANNELS.find(c => c.id === channel)?.label}... (gõ @ để tag, Enter để gửi)`}
//                   className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-600 text-sm outline-none"
//                   style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }} />
//               </div>
//               <button onClick={send} disabled={!input.trim()}
//                 className="flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm disabled:opacity-40 transition-all hover:scale-105"
//                 style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff' }}>
//                 Gửi
//               </button>
//             </div>
//           ) : (
//             <div className="text-center text-gray-600 text-sm py-2">
//               📣 Chỉ Manager mới có thể đăng vào kênh thông báo
//             </div>
//           )}
//         </div>
//       </div>
//       {profileUser && (
//         <UserProfileCard user={profileUser} onClose={() => setProfileUser(null)}
//           onMessage={() => { openDm(profileUser.id); setProfileUser(null) }} />
//       )}
//     </div>
//   )
// }

// // ==================== PROFILE ====================

// // function ProfileView({ currentUser, setCurrentUser, tasks }: {
// //   currentUser: User; setCurrentUser: (u: User) => void; tasks: Task[]
// // }) {
// //   const [editing, setEditing] = useState(false)
// //   const [draftAvatar, setDraftAvatar] = useState<AvatarConfig>(currentUser.avatar)
// function ProfileView({ currentUser, setCurrentUser, tasks }: {
//   currentUser: User; setCurrentUser: (u: User) => void; tasks: Task[]
// }) {
//   const [editing, setEditing] = useState(false)
//   const [draftAvatar, setDraftAvatar] = useState<AvatarConfig>(currentUser.avatar)
//   const [draftName, setDraftName] = useState(currentUser.name)
//   const [driveDraft, setDriveDraft] = useState(currentUser.driveFolderUrl ?? '')
//   const [driveSaved, setDriveSaved] = useState(false)

//   const { progress, needed, level } = getExpProgress(currentUser.exp)
//   const myDone = tasks.filter(t => t.status === 'completed' && (t.assignedTo.includes(currentUser.id) || (t.selfCreated && t.createdBy === currentUser.id)))
//   const selfMade = tasks.filter(t => t.selfCreated && t.createdBy === currentUser.id)

//   const achievements = [
//     { name: 'Người Mới', desc: 'Task đầu tiên', icon: '🌟', ok: myDone.length >= 1 },
//     { name: 'Chăm Chỉ', desc: '5 task xong', icon: '💪', ok: myDone.length >= 5 },
//     { name: 'Task Master', desc: '20 task xong', icon: '🏆', ok: myDone.length >= 20 },
//     { name: 'EXP Hunter', desc: '1000 EXP', icon: '⚡', ok: currentUser.exp >= 1000 },
//     { name: 'Level 5!', desc: 'Đạt Level 5', icon: '🚀', ok: level >= 5 },
//     { name: 'Self Starter', desc: 'Tự tạo 3 task', icon: '🎯', ok: selfMade.length >= 3 },
//   ]

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
//         {/* Left */}
//         <div className="space-y-4">
//           <div className="rounded-2xl p-6 text-center"
//             style={{ background: `linear-gradient(135deg, ${currentUser.avatar.outfitColor}18, #0e0e24)`, border: `1px solid ${currentUser.avatar.outfitColor}30` }}>
//             <div className="w-28 h-36 mx-auto mb-3 rounded-2xl overflow-hidden flex items-end justify-center"
//               style={{ background: `${currentUser.avatar.outfitColor}20`, border: `2px solid ${currentUser.avatar.outfitColor}40`, boxShadow: `0 0 30px ${currentUser.avatar.outfitColor}40` }}>
//               <FullAvatar avatar={currentUser.avatar} size={100} />
//             </div>
//             <h3 className="text-white font-bold text-xl mb-0.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{currentUser.name}</h3>
//             <p className="text-gray-500 text-sm mb-3">{currentUser.department}</p>
//             <div className="flex justify-center mb-3"><LevelBadge exp={currentUser.exp} /></div>
//             <div className="text-amber-400 text-2xl font-black mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{currentUser.exp.toLocaleString()} EXP</div>
//             <div className="text-gray-600 text-xs mb-3">Cần {needed} EXP → Lv.{level + 1}</div>
//             <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1a1a3a' }}>
//               <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#f59e0b)' }} />
//             </div>
//             <button onClick={() => { setDraftAvatar(currentUser.avatar); setDraftName(currentUser.name); setEditing(!editing) }}
//               className="mt-4 w-full py-2 rounded-lg text-sm font-medium transition-all"
//               style={{ background: editing ? '#7c3aed' : '#14143a', color: editing ? '#fff' : '#6b7280', border: '1px solid #2a2a5a' }}>
//               {editing ? '↑ Đóng' : '🎭 Đổi tên & nhân vật'}
//             </button>
//           </div>

//           {/* Stats */}
//           <div className="rounded-xl p-4" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//             <h4 className="text-white font-bold mb-3 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>📊 Thống kê</h4>
//             {[
//               ['Task hoàn thành', myDone.length],
//               ['Đang làm', tasks.filter(t => t.status === 'in-progress' && t.assignedTo.includes(currentUser.id)).length],
//               ['Task tự tạo', selfMade.length],
//               ['Cấp độ', `Lv.${level}`],
//             ].map(([lbl, val]) => (
//               <div key={lbl as string} className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid #12121f' }}>
//                 <span className="text-gray-500 text-xs">{lbl}</span>
//                 <span className="text-white text-sm font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{val}</span>
//               </div>
//             ))}
//           </div>

//           <div className="rounded-xl p-4" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//             <div className="flex gap-2 flex-wrap">
//               <span className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: '#1a0a3a', color: '#a78bfa', border: '1px solid #3a1a6a' }}>
//                 {currentUser.role === 'manager' ? '👑 Quản Lý' : '⚔️ Nhân Viên'}
//               </span>
//               <span className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: '#0a1a3a', color: '#60a5fa', border: '1px solid #1a3a6a' }}>
                
//                 🏢 {TEAMS.find(t => t.id === currentUser.teamId)?.name ?? 'Chưa có team'}       
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Right */}
//         <div className="col-span-2 space-y-4">
//           {currentUser.role === 'manager' && (
//             <div className="rounded-xl p-4" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//               <h4 className="text-white font-bold mb-1 flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
//                 📁 Thư mục nộp task (Google Drive)
//               </h4>
//               <p className="text-gray-500 text-xs mb-3 leading-relaxed">
//                 Nhân viên sẽ được dẫn tới link này để tải file kết quả lên khi nộp task cho bạn.
//               </p>
//               <input value={driveDraft} onChange={e => setDriveDraft(e.target.value)}
//                 placeholder="https://drive.google.com/drive/folders/..."
//                 className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-600 text-sm outline-none mb-2"
//                 style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//               <div className="flex items-center justify-between gap-2">
//                 <p className="text-gray-600 text-[10px] leading-relaxed flex-1">
//                   💡 Bật chia sẻ "Bất kỳ ai có link đều chỉnh sửa được" cho thư mục này.
//                 </p>
//                 <button onClick={async () => {
//                   await supabase.from('profiles').update({ drive_folder_url: driveDraft.trim() || null }).eq('id', currentUser.id)
//                   setCurrentUser({ ...currentUser, driveFolderUrl: driveDraft.trim() || undefined })
//                   setDriveSaved(true)
//                   setTimeout(() => setDriveSaved(false), 2000)
//                 }}
//                   className="px-4 py-2 rounded-lg font-bold text-white text-xs flex-shrink-0"
//                   style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>
//                   {driveSaved ? '✓ Đã lưu' : 'Lưu link'}
//                 </button>
//               </div>
//             </div>
//           )}

//           {editing && (
//             <div className="rounded-xl p-4 animate-slide-up" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//               <h4 className="text-white font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>🎭 Tùy chỉnh nhân vật</h4>

//               <div className="mb-4">
//                 <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Tên hiển thị</label>
//                 <input value={draftName} onChange={e => setDraftName(e.target.value)} maxLength={40}
//                   placeholder="Nhập tên bạn muốn hiển thị..."
//                   className="w-full px-3 py-2.5 rounded-lg text-white text-sm outline-none"
//                   style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//               </div>

              

//               <AvatarCreator value={draftAvatar} onChange={setDraftAvatar} />
//               <div className="flex gap-3 mt-4">
//                 <button onClick={() => setEditing(false)}
//                   className="flex-1 py-2.5 rounded-lg text-gray-400 text-sm"
//                   style={{ background: '#14143a', border: '1px solid #2a2a5a' }}>Hủy</button>
//                 <button onClick={async () => {
//                   const trimmed = draftName.trim() || currentUser.name
//                   await supabase.from('profiles').update({ name: trimmed, avatar: draftAvatar }).eq('id', currentUser.id)
//                   setCurrentUser({ ...currentUser, name: trimmed, avatar: draftAvatar })
//                   setEditing(false)
//                 }}
//                   className="flex-1 py-2.5 rounded-lg font-bold text-white text-sm"
//                   style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>Lưu thay đổi</button>
//               </div>
//             </div>
//           )}

//           <div className="rounded-xl p-4" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//             <h4 className="text-white font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>🏅 Thành Tích</h4>
//              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//               {achievements.map(a => (
//                 <div key={a.name} className="p-3 rounded-xl text-center"
//                   style={{ background: a.ok ? '#181808' : '#12121a', border: `1px solid ${a.ok ? '#f59e0b25' : '#1e1e3a'}`, opacity: a.ok ? 1 : 0.5 }}>
//                   <div className="text-2xl mb-2" style={{ filter: a.ok ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
//                   <div className="text-white text-xs font-bold mb-0.5">{a.name}</div>
//                   <div className="text-gray-600 text-[10px]">{a.desc}</div>
//                   {a.ok && <div className="mt-1.5 text-amber-400 text-[10px]">✓ Đạt được</div>}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ==================== APP SHELL ====================

// const NAV = [
//   { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
//   { id: 'tasks', icon: '📋', label: 'Task' },
//   { id: 'leaderboard', icon: '🏆', label: 'Xếp hạng' },
//   { id: 'rewards', icon: '🎁', label: 'Quà' },
//   { id: 'social', icon: '💬', label: 'Social' },
//   { id: 'profile', icon: '👤', label: 'Hồ sơ' },
// ]
// function NotificationBell({ notifications, onNotificationClick }: {
//   notifications: { id: string; message: string; createdAt: string; linkChannel?: string; linkDmUserId?: string; linkTaskId?: string }[]
//   onNotificationClick?: (n: { linkChannel?: string; linkDmUserId?: string; linkTaskId?: string }) => void
// }) {
//   const [open, setOpen] = useState(false)
//   const [lastSeen, setLastSeen] = useState(() => localStorage.getItem('lastSeenNotif') || '')
//   const unread = notifications.filter(n => n.createdAt > lastSeen).length

//   const toggle = () => {
//     setOpen(o => !o)
//     if (!open) {
//       const now = new Date().toISOString()
//       localStorage.setItem('lastSeenNotif', now)
//       setLastSeen(now)
//     }
//   }

//   const deleteOne = async (id: string) => {
//     await supabase.from('notifications').delete().eq('id', id)
//   }

//   const deleteAll = async () => {
//     if (!window.confirm('Xoá toàn bộ thông báo?')) return
//     const ids = notifications.map(n => n.id)
//     if (ids.length > 0) await supabase.from('notifications').delete().in('id', ids)
//   }

//   return (
//     <div className="relative">
//       <button onClick={toggle} className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#1a1a40]">
//         <span className="text-lg">🔔</span>
//         {unread > 0 && (
//           <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
//             {unread > 9 ? '9+' : unread}
//           </span>
//         )}
//       </button>
//       {open && (
//         <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl z-50"
//           style={{ background: '#0e0e24', border: '1px solid #1e1e4a', boxShadow: '0 8px 24px #00000060' }}>
//           <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1e1e4a' }}>
//             <span className="text-white font-bold text-sm">Thông báo</span>
//             {notifications.length > 0 && (
//               <button onClick={deleteAll} className="text-[10px] text-red-400 hover:underline">Xoá tất cả</button>
//             )}
//           </div>
//           {notifications.length === 0 ? (
//             <p className="text-gray-600 text-sm text-center py-6">Chưa có thông báo nào</p>
//           ) : (
//             notifications.map(n => (
//               <div key={n.id}
//                 onClick={() => { if (n.linkChannel || n.linkTaskId) { onNotificationClick?.(n); setOpen(false) } }}
//                 className="px-4 py-3 flex items-start justify-between gap-2 group" style={{ borderBottom: '1px solid #14142a', cursor: (n.linkChannel || n.linkTaskId) ? 'pointer' : 'default' }}>
//                 <div className="flex-1">
//                   <p className="text-sm text-gray-300">{n.message}</p>
//                   <p className="text-gray-600 text-[10px] mt-1">{fmtTime(n.createdAt)}</p>
//                 </div>
//                 <button onClick={e => { e.stopPropagation(); deleteOne(n.id) }}
//                   className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 text-xs flex-shrink-0">
//                   ✕
//                 </button>
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// function AppShell({ currentUser, setCurrentUser, allUsers, tasks, setTasks, messages, setMessages, redemptions, notifications, collaborations }: {
//   currentUser: User; setCurrentUser: (u: User) => void; allUsers: User[]
//   tasks: Task[]; setTasks: (t: Task[]) => void
//   messages: Message[]; setMessages: (m: Message[]) => void
//   redemptions: { id: string; userId: string; rewardId: string; cost: number }[]
//   notifications: { id: string; message: string; createdAt: string }[]
//   collaborations: Collaboration[]
// }) {
//   const [view, setView] = useState<View>('dashboard')
//   const { level } = getExpProgress(currentUser.exp)
//   const [showMentions, setShowMentions] = useState(false)
//   const [lastSeenMention, setLastSeenMention] = useState(() => localStorage.getItem('lastSeenMention') || '')
//   const [socialTarget, setSocialTarget] = useState<{ channel: ChatChannel; dmUserId?: string } | null>(null)
//   const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null)
//   const navItems = currentUser.isDirector ? [...NAV, { id: 'bodlog', icon: '📊', label: 'Log BOD' }] : NAV

//   const handleNotificationClick = (n: { linkChannel?: string; linkDmUserId?: string; linkTaskId?: string }) => {
//     if (n.linkTaskId) {
//       setView('tasks')
//       setHighlightTaskId(n.linkTaskId)
//       return
//     }
//     if (!n.linkChannel) return
//     setView('social')
//     setShowMentions(false)
//     if (n.linkChannel === 'dm' && n.linkDmUserId) {
//       setSocialTarget({ channel: 'dm', dmUserId: n.linkDmUserId })
//     } else {
//       setSocialTarget({ channel: n.linkChannel as ChatChannel })
//     }
//   }

//   const markMentionsSeen = () => {
//     const now = new Date().toISOString()
//     localStorage.setItem('lastSeenMention', now)
//     setLastSeenMention(now)
//   }

//   // Merge current user into users list (keeps their live exp/avatar updated)
//   const users = allUsers.some(u => u.id === currentUser.id)
//     ? allUsers.map(u => u.id === currentUser.id ? currentUser : u)
//     : [...allUsers, currentUser]

//   const mentionCount = messages.filter(m =>
//     m.userId !== currentUser.id &&
//     isMessageVisibleTo(m, currentUser, users) &&
//     parseMentions(m.content, users).some(x => x.user.id === currentUser.id) &&
//     m.timestamp > lastSeenMention
//   ).length  

//   const sharedProps = { currentUser, tasks, users, setTasks, setCurrentUser, redemptions, setView }

//   const renderView = () => {
//     switch (view) {
//       case 'dashboard': return <DashboardView {...sharedProps} />
//       case 'tasks': return (
//         <TasksView {...sharedProps} collaborations={collaborations}
//           highlightTaskId={highlightTaskId} clearHighlightTaskId={() => setHighlightTaskId(null)} />
//       )
//       case 'leaderboard': return <LeaderboardView users={users} tasks={tasks} />
//       case 'rewards': return <RewardsView currentUser={currentUser} redemptions={redemptions} users={users} />
//       case 'social': return (
//         <SocialView currentUser={currentUser} users={users} messages={messages} setMessages={setMessages}
//           showMentions={showMentions} setShowMentions={setShowMentions} markMentionsSeen={markMentionsSeen}
//           navigateTarget={socialTarget} clearNavigateTarget={() => setSocialTarget(null)} />
//       )
//       case 'profile': return <ProfileView currentUser={currentUser} setCurrentUser={setCurrentUser} tasks={tasks} />
//           case 'bodlog': return currentUser.isDirector ? <BodLogView tasks={tasks} users={users} /> : <DashboardView {...sharedProps} />
//     }
//   }

//   return (
//     <div className="flex flex-col md:flex-row h-screen overflow-hidden overflow-x-hidden" style={{ background: '#080812', fontFamily: 'Inter, sans-serif' }}>
//       {/* Sidebar */}
//       <div className="hidden md:flex w-[72px] flex-col items-center py-4 gap-0.5 flex-shrink-0"
//         style={{ background: '#06060f', borderRight: '1px solid #1a1a3a' }}>
//         <div className="mb-4">
//           <img src={companyLogo} alt="KNI" className="w-10 h-10 rounded-lg object-contain" />
//         </div>
//         {navItems.map(item => (
//           <button key={item.id}
//             onClick={() => {
//               setView(item.id as View)
//               if (item.id === 'social' && mentionCount > 0) setShowMentions(true)
//             }}
//             title={item.label}
//             className="relative w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-150"
//             style={{
//               background: view === item.id ? '#1a1a40' : 'transparent',
//               boxShadow: view === item.id ? 'inset 0 0 15px #7c3aed18, 0 0 0 1px #2a2a6a' : 'none',
//             }}>
//             <span className="text-xl">{item.icon}</span>
//             <span className="text-[8px] tracking-wide" style={{ color: view === item.id ? '#a78bfa' : '#374151' }}>{item.label}</span>
//             {item.id === 'social' && mentionCount > 0 && (
//               <span className="absolute top-1 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
//                 {mentionCount > 9 ? '9+' : mentionCount}
//               </span>
//             )}
//           </button>
//         ))}
//         <div className="flex-1" />
//         <button onClick={() => setView('profile')} className="mb-1">
//           <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: view === 'profile' ? `2px solid ${currentUser.avatar.outfitColor}` : '2px solid rgba(255,255,255,0.08)', background: `${currentUser.avatar.outfitColor}20` }}>
//             <CharacterSVG config={currentUser.avatar} vb="24 4 52 52" w={40} h={40} />
//           </div>
//         </button>
//       </div>

//         {/* Bottom nav — chỉ hiện trên mobile */}
//       <div className="flex md:hidden items-center justify-around py-2 flex-shrink-0"
//         style={{ background: '#06060f', borderTop: '1px solid #1a1a3a' }}>
//         {navItems.map(item => (
//           <button key={item.id}
//             onClick={() => {
//               setView(item.id as View)
//               if (item.id === 'social' && mentionCount > 0) setShowMentions(true)
//             }}
//             className="relative flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg"
//             style={{ color: view === item.id ? '#a78bfa' : '#4b5563' }}>
//             <span className="text-lg">{item.icon}</span>
//             <span className="text-[9px]">{item.label}</span>
//             {item.id === 'social' && mentionCount > 0 && (
//               <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
//                 {mentionCount > 9 ? '9+' : mentionCount}
//               </span>
//             )}
//           </button>
//         ))}
//       </div>
//       {/* Main */}
//       <div className="flex-1 flex flex-col overflow-hidden order-first md:order-none">
//         {/* Topbar */}
//         <div className="h-16 flex items-center justify-between px-5 flex-shrink-0" style={{ borderBottom: '1px solid #1a1a3a' }}>
//           <div className="flex items-center gap-2.5">
//             <img src={companyLogo} alt="KNI" className="w-8 h-8 rounded-md object-contain md:hidden" />
//             <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
//               {navItems.find(n => n.id === view)?.icon} {navItems.find(n => n.id === view)?.label}
//             </h1>
//           </div>
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2.5">
//               <span className="text-amber-400 text-xs font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Lv.{level}</span>
//               <div className="w-28"><ExpBarMini exp={currentUser.exp} /></div>
//               <span className="text-gray-600 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{currentUser.exp}</span>
//             </div>
//             <NotificationBell notifications={notifications} onNotificationClick={handleNotificationClick} />
//             <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('profile')}>
//               <CharAvatar user={currentUser} size={36} />
//               <div>
//                 <div className="text-white text-sm font-medium leading-tight">{currentUser.name.split(' ').slice(-1)[0]}</div>
//                 <div className="text-gray-600 text-[10px]">{currentUser.role === 'manager' ? '👑 Quản lý' : '⚔️ Nhân viên'}</div>
//               </div>
//             </div>
//             <button
//               onClick={async () => {
//                 if (!window.confirm('Đăng xuất khỏi tài khoản?')) return
//                 await supabase.auth.signOut()
//               }}
//               title="Đăng xuất"
//               className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
//               🚪
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto">{renderView()}</div>
//       </div>
//     </div>
//   )
// }

// // ==================== APP (shared state at top level) ====================

// // export default function App() {
// //   const [currentUser, setCurrentUser] = useState<User | null>(null)
// //   // Lifted to App level → persists across user logins in same session
// //   const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
// //   const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)

// //   if (!currentUser) return <LoginScreen onLogin={setCurrentUser} />

// //   return (
// //     <AppShell
// //       currentUser={currentUser}
// //       setCurrentUser={setCurrentUser}
// //       allUsers={MOCK_USERS}
// //       tasks={tasks}
// //       setTasks={setTasks}
// //       messages={messages}
// //       setMessages={setMessages}
// //     />
// //   )
// // }

// export default function App() {
//   const [session, setSession] = useState<any>(null)
//   const [currentProfile, setCurrentProfile] = useState<User | null>(null)
//   const [allUsers, setAllUsers] = useState<User[]>([])
//   const [tasks, setTasks] = useState<Task[]>([])
//   const [messages, setMessages] = useState<Message[]>([])
//   const [checkingSession, setCheckingSession] = useState(true)
//   const [redemptions, setRedemptions] = useState<{ id: string; userId: string; rewardId: string; cost: number }[]>([])
//   const [notifications, setNotifications] = useState<{ id: string; message: string; createdAt: string; targetUserId?: string; linkChannel?: string; linkDmUserId?: string; linkTaskId?: string }[]>([])
//   const [collaborations, setCollaborations] = useState<Collaboration[]>([])

//   function mapProfileToUser(p: any): User {
//   return { id: p.id, name: p.name, role: p.role, avatar: p.avatar, exp: p.exp, teamId: p.team_id, department: p.department, email: p.email, isDirector: p.is_director ?? false, driveFolderUrl: p.drive_folder_url ?? undefined }
// }

//   function mapDbMessage(m: any): Message {
//     return { id: m.id, userId: m.user_id, toUserId: m.to_user_id ?? undefined, content: m.content, channel: m.channel, timestamp: m.created_at }
//   }
//   function mapDbTask(t: any): Task {
//   return {
//     id: t.id, title: t.title, description: t.description, expReward: t.exp_reward,
//     status: t.status, assignedTo: t.assigned_to ?? [], projectManager: t.project_manager ?? [],
//     supporters: t.supporters ?? [], createdBy: t.created_by, dueDate: t.due_date,
//     category: t.category, priority: t.priority, selfCreated: t.self_created,
//     important: t.important ?? false,
//     urgent: t.urgent ?? false,
//     submissionFileUrl: t.submission_file_url ?? undefined,
//     submissionNote: t.submission_note ?? undefined,
//     submittedAt: t.submitted_at ?? undefined,
//     rejectedReason: t.rejected_reason ?? undefined,
//     startDate: t.start_date,
//     crossDeptPending: t.cross_dept_pending ?? false,
//     crossDeptRejected: t.cross_dept_rejected ?? false,
//     crossDeptRejectedReason: t.cross_dept_rejected_reason ?? undefined,
//     crossDeptRejectedBy: t.cross_dept_rejected_by ?? undefined,
//     targetTeamId: t.target_team_id ?? undefined,
//     submissionOwnFolderUrl: t.submission_own_folder_url ?? undefined,
//     driveFolderCreated: t.drive_folder_created ?? false,
//     driveFolderName: t.drive_folder_name ?? undefined,
//     submissionFolderName: t.submission_folder_name ?? undefined,
//     driveFolderOwnerId: t.drive_folder_owner_id ?? undefined,
//     approvedBy: t.approved_by ?? undefined,
//     approvedAt: t.approved_at ?? undefined,
//   }
// }
// function mapDbCollaboration(c: any): Collaboration {
//   return {
//     id: c.id, title: c.title, description: c.description,
//     startDate: c.start_date, endDate: c.end_date,
//     requestedBy: c.requested_by, requestingTeamId: c.requesting_team_id, targetTeamId: c.target_team_id,
//     targetManagerId: c.target_manager_id ?? undefined,
//     expReward: c.exp_reward ?? undefined,
//     status: c.status, assignedEmployeeId: c.assigned_employee_id ?? undefined,
//     assignedBy: c.assigned_by ?? undefined, rejectedReason: c.rejected_reason ?? undefined,
//     createdAt: c.created_at,
//     driveFolderCreated: c.drive_folder_created ?? false,
//     driveFolderName: c.drive_folder_name ?? undefined,
//   }
// }



//   //=============================================================================
//   useEffect(() => {
//   if (!session) return
//   supabase.from('redemptions').select('*').then(({ data }) => data && setRedemptions(
//     data.map(r => ({ id: r.id, userId: r.user_id, rewardId: r.reward_id, cost: r.cost }))
//   ))
// //   const channel = supabase.channel('redemptions-changes')
// //     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'redemptions' }, payload => {
// //       const r = payload.new
// //       setRedemptions(prev => [...prev, { id: r.id, userId: r.user_id, rewardId: r.reward_id, cost: r.cost }])
// //     }).subscribe()
// //   return () => { supabase.removeChannel(channel) }
// // }, [session])
//   const channel = supabase.channel('redemptions-changes')
//     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'redemptions' }, payload => {
//       const r = payload.new
//       setRedemptions(prev => [...prev, { id: r.id, userId: r.user_id, rewardId: r.reward_id, cost: r.cost }])
//     }).subscribe()
//   return () => { supabase.removeChannel(channel) }
// }, [session])

// useEffect(() => {
//   if (!session) return
//   supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20)
//     .then(({ data }) => data && setNotifications(data.map(n => ({
//       id: n.id, message: n.message, createdAt: n.created_at,
//       targetUserId: n.target_user_id ?? undefined,
//       linkChannel: n.link_channel ?? undefined,
//       linkDmUserId: n.link_dm_user_id ?? undefined,
//       linkTaskId: n.link_task_id ?? undefined,
//     }))))

//   const notifChannel = supabase.channel('notifications-changes')
//     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
//       const n = payload.new
//       setNotifications(prev => [{
//         id: n.id, message: n.message, createdAt: n.created_at,
//         targetUserId: n.target_user_id ?? undefined,
//         linkChannel: n.link_channel ?? undefined,
//         linkDmUserId: n.link_dm_user_id ?? undefined,
//         linkTaskId: n.link_task_id ?? undefined,
//       }, ...prev])
//     })
//     .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notifications' }, payload => {
//       setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
//     })
//     .subscribe()
//   return () => { supabase.removeChannel(notifChannel) }
// }, [session])
  
//   // Kiểm tra xem đã đăng nhập từ trước chưa (giữ session khi refresh trang)
//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setSession(data.session)
//       setCheckingSession(false)
//     })
//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session)
//     })
//     return () => listener.subscription.unsubscribe()
//   }, [])
//   //==============================================================================
//   // Khi allUsers cập nhật (real-time), đồng bộ luôn currentProfile nếu có thay đổi
// useEffect(() => {
//   if (!currentProfile) return
//   const updated = allUsers.find(u => u.id === currentProfile.id)
//   if (updated && JSON.stringify(updated) !== JSON.stringify(currentProfile)) {
//     setCurrentProfile(updated)
//   }
// }, [allUsers])

//   // Nạp profile của chính mình khi có session
//   useEffect(() => {
//     if (!session) { setCurrentProfile(null); return }
//     supabase.from('profiles').select('*').eq('id', session.user.id).single()
//       .then(({ data }) => { if (data) setCurrentProfile(mapProfileToUser(data)) })
//   }, [session])

//   // Nạp toàn bộ user + lắng nghe realtime
//   useEffect(() => {
//     if (!session) return
//     supabase.from('profiles').select('*').then(({ data }) => data && setAllUsers(data.map(mapProfileToUser)))
//     const channel = supabase.channel('profiles-changes')
//       .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
//         supabase.from('profiles').select('*').then(({ data }) => data && setAllUsers(data.map(mapProfileToUser)))
//       }).subscribe()
//     return () => { supabase.removeChannel(channel) }
//   }, [session])


//   // 👇 ĐOẠN MỚI THÊM — nạp tin nhắn + lắng nghe realtime
//   useEffect(() => {
//     if (!session) return
//     supabase.from('messages').select('*').order('created_at')
//       .then(({ data }) => data && setMessages(data.map(mapDbMessage)))

//     const channel = supabase.channel('messages-changes')
//       .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
//         setMessages(prev => [...prev, mapDbMessage(payload.new)])
//       })
//       .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, payload => {
//         setMessages(prev => prev.filter(m => m.id !== payload.old.id))
//       })
//       .subscribe()
//     return () => { supabase.removeChannel(channel) }
//   }, [session])


//   useEffect(() => {
//   if (!session) return
//   supabase.from('tasks').select('*').then(({ data }) => data && setTasks(data.map(mapDbTask)))

//   const channel = supabase.channel('tasks-changes')
//     .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
//       supabase.from('tasks').select('*').then(({ data }) => data && setTasks(data.map(mapDbTask)))
//     }).subscribe()
//   return () => { supabase.removeChannel(channel) }
// }, [session])

// useEffect(() => {
//   if (!session) return
//   supabase.from('collaborations').select('*').then(({ data }) => data && setCollaborations(data.map(mapDbCollaboration)))

//   const channel = supabase.channel('collaborations-changes')
//     .on('postgres_changes', { event: '*', schema: 'public', table: 'collaborations' }, () => {
//       supabase.from('collaborations').select('*').then(({ data }) => data && setCollaborations(data.map(mapDbCollaboration)))
//     }).subscribe()
//   return () => { supabase.removeChannel(channel) }
// }, [session])


//   // Khi allUsers cập nhật (real-time), đồng bộ luôn currentProfile nếu có thay đổi
// useEffect(() => {
//   if (!currentProfile) return
//   const updated = allUsers.find(u => u.id === currentProfile.id)
//   if (updated && JSON.stringify(updated) !== JSON.stringify(currentProfile)) {
//     setCurrentProfile(updated)
//   }
// }, [allUsers])

// // useEffect(() => {
// //   if (!currentProfile) return
// //   const w = window as any
// //   if (!w.OneSignalDeferred) return
// //   w.OneSignalDeferred.push(async (OneSignal: any) => {
// //     await OneSignal.login(currentProfile.id)
// //     await OneSignal.User.addTag('team', currentProfile.teamId)
// //     await OneSignal.Notifications.requestPermission()
// //   })
// // }, [currentProfile])

// useEffect(() => {
//   if (!currentProfile) return

//   const w = window as any

//   if (!w.OneSignalDeferred) {
//     console.error('OneSignalDeferred chưa được load')
//     return
//   }

//   w.OneSignalDeferred.push(async (OneSignal: any) => {
//     try {
//       // Đăng nhập user hiện tại vào OneSignal
//       await OneSignal.login(currentProfile.id)

//       // Gắn team của user
//       await OneSignal.User.addTag(
//         'team',
//         currentProfile.teamId
//       )

//       // Kiểm tra Push Subscription
//       const optedIn =
//         await OneSignal.User.PushSubscription.optedIn

//       console.log(
//         'OneSignal push subscribed:',
//         optedIn
//       )

//       console.log(
//         'OneSignal user:',
//         currentProfile.id
//       )

//       console.log(
//         'OneSignal team:',
//         currentProfile.teamId
//       )

//     } catch (error) {
//       console.error(
//         'OneSignal error:',
//         error
//       )
//     }
//   })
// }, [currentProfile])


//   if (checkingSession) return <div style={{ background: '#060610', minHeight: '100vh' }} />
//   if (!session || !currentProfile) return <LoginScreen onLoggedIn={() => {}} />

//   return (
//     <AppShell
//       currentUser={currentProfile}
//       setCurrentUser={setCurrentProfile}
//       allUsers={allUsers}
//       tasks={tasks}
//       setTasks={setTasks}
//       messages={messages}
//       setMessages={setMessages}
//       redemptions={redemptions}
//       notifications={notifications}
//       collaborations={collaborations}
//     />
//   )
// }
import { useState, useRef, useEffect } from 'react'
import { supabase } from './supabaseClient'
import companyLogo from './assets/company-logo.png'
import * as XLSX from 'xlsx'
// ==================== TYPES ====================

type Role = 'manager' | 'employee'
type View = 'dashboard' | 'tasks' | 'leaderboard' | 'rewards' | 'social' | 'profile' | 'bodlog'
type TaskStatus = 'open' | 'in-progress' | 'submitted' | 'completed'
type TaskPriority = 'low' | 'medium' | 'high'
type ChatChannel = 'general' | 'team' | 'announcements' | 'dm'

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
  targetTeamId?: string
  submissionOwnFolderUrl?: string
  driveFolderCreated?: boolean
  driveFolderName?: string
  submissionFolderName?: string
  driveFolderOwnerId?: string
  approvedBy?: string
  approvedAt?: string
}

interface Message {
  id: string
  userId: string
  content: string
  timestamp: string
  channel: ChatChannel
  toUserId?: string // chỉ dùng khi channel === 'dm': id của người nhận
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
  assignedEmployeeId?: string
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

function randomDicebearSeed() {
  return 'kni-' + Math.random().toString(36).slice(2, 10)
}

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

// Sinh URL avatar từ DiceBear (style Notionists) dựa theo seed lưu trong hồ sơ
function buildDicebearUrl(avatar: AvatarConfig) {
  const seed = avatar.dicebearSeed || 'kni-default'
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`
}

// Compact avatar (head crop) used in cards, chat, lists
function CharAvatar({ user, size = 40 }: { user: User; size?: number }) {
  if (user.avatar.type === 'photo' && user.avatar.photoUrl) {
    return (
      <img src={user.avatar.photoUrl} alt={user.name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(255,255,255,0.12)', display: 'block' }} />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      border: `2px solid ${user.avatar.outfitColor}40`, background: `${user.avatar.outfitColor}18`,
    }}>
      <img src={buildDicebearUrl(user.avatar)} alt={user.name}
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
    </div>
  )
}

// Large avatar used in profile/login preview
function FullAvatar({ avatar, size = 120 }: { avatar: AvatarConfig; size?: number }) {
  if (avatar.type === 'photo' && avatar.photoUrl) {
    return (
      <img src={avatar.photoUrl} alt="avatar"
        style={{ width: size, height: size, borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.12)', display: 'block' }} />
    )
  }
  return (
    <img src={buildDicebearUrl(avatar)} alt="avatar"
      style={{ width: size, height: size, display: 'block' }} />
  )
}

// ==================== AVATAR CREATOR ====================

function AvatarCreator({ value, onChange }: { value: AvatarConfig; onChange: (a: AvatarConfig) => void }) {
  const [tab, setTab] = useState<'custom' | 'photo'>(value.type === 'photo' ? 'photo' : 'custom')
  const fileRef = useRef<HTMLInputElement>(null)

  const update = (patch: Partial<AvatarConfig>) =>
    onChange({ ...value, type: 'custom', photoUrl: undefined, ...patch })

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onChange({ ...value, type: 'photo', photoUrl: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1 p-0.5 rounded-xl mb-4" style={{ background: '#0a0a1a', border: '1px solid #1e1e3a' }}>
        {[['custom', '🧑 Nhân vật'], ['photo', '📷 Tải ảnh lên']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as 'custom' | 'photo')}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: tab === id ? '#7c3aed' : 'transparent', color: tab === id ? '#fff' : '#6b7280' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-5">
        {/* Preview */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div
            className="rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              width: 110, height: 110,
              background: `${value.outfitColor}22`,
              border: `2px solid ${value.outfitColor}50`,
            }}
          >
            <FullAvatar avatar={value} size={96} />
          </div>
          <span className="text-gray-600 text-[10px]">Xem trước</span>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-3.5 min-w-0">
          {tab === 'custom' ? (
            <>
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Nhân vật</p>
                <button onClick={() => update({ dicebearSeed: randomDicebearSeed() })}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02]"
                  style={{ background: '#14143a', border: '1px solid #2a2a5a', color: '#a78bfa' }}>
                  🎲 Đổi nhân vật ngẫu nhiên
                </button>
              </div>

              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1.5">Màu viền / chủ đạo</p>
                <div className="flex flex-wrap gap-1.5">
                  {OUTFIT_COLORS.map(c => (
                    <button key={c} onClick={() => update({ outfitColor: c })}
                      className="w-6 h-6 rounded-full transition-all hover:scale-110"
                      style={{
                        background: c,
                        border: `2px solid ${value.outfitColor === c ? 'white' : '#1e1e4a'}`,
                        boxShadow: value.outfitColor === c ? `0 0 6px ${c}` : 'none',
                      }} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Photo upload */
            <div className="flex flex-col gap-3">
              {value.type === 'photo' && value.photoUrl ? (
                <div className="text-center">
                  <img src={value.photoUrl} alt="preview"
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                    style={{ border: '3px solid #7c3aed', boxShadow: '0 0 20px #7c3aed50' }} />
                  <p className="text-green-400 text-xs mb-1">✓ Đã tải lên thành công</p>
                </div>
              ) : (
                <div
                  className="rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer py-6"
                  style={{ border: '1.5px dashed #2a2a5a', background: '#0a0a1a' }}
                  onClick={() => fileRef.current?.click()}
                >
                  <span className="text-3xl">📷</span>
                  <p className="text-gray-500 text-xs text-center">Click để chọn ảnh của bạn<br /><span className="text-gray-700">JPG, PNG, WebP</span></p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => fileRef.current?.click()}
                  className="flex-1 py-2 rounded-lg text-sm text-violet-400 font-medium"
                  style={{ background: '#14143a', border: '1px solid #2a2a5a' }}>
                  {value.type === 'photo' && value.photoUrl ? 'Đổi ảnh' : 'Chọn ảnh'}
                </button>
                {value.type === 'photo' && value.photoUrl && (
                  <button onClick={() => onChange({ ...DEFAULT_AVATAR, dicebearSeed: randomDicebearSeed() })}
                    className="px-3 py-2 rounded-lg text-xs text-gray-500"
                    style={{ background: '#14143a', border: '1px solid #1e1e4a' }}>
                    Dùng nhân vật
                  </button>
                )}
              </div>

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
          )}
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

// const INITIAL_TASKS: Task[] = [
//   { id: 't1', title: 'Xây dựng API authentication', description: 'Implement JWT authentication với refresh token và blacklist', expReward: 150, status: 'in-progress', assignedTo: 'u3', projectManager: 'u1', supporters: ['u4', 'u5'], createdBy: 'u1', dueDate: '2026-07-30', category: 'development', priority: 'high', selfCreated: false },
//   { id: 't2', title: 'Thiết kế UI Dashboard', description: 'Tạo Figma mockup cho trang dashboard chính theo Design System mới', expReward: 80, status: 'open', assignedTo: 'u6', projectManager: 'u2', supporters: ['u7'], createdBy: 'u2', dueDate: '2026-07-28', category: 'design', priority: 'medium', selfCreated: false },
//   { id: 't3', title: 'Viết unit tests cho Payment', description: 'Coverage tối thiểu 80% cho toàn bộ module payment', expReward: 100, status: 'completed', assignedTo: 'u4', projectManager: 'u1', supporters: [], createdBy: 'u1', dueDate: '2026-07-22', category: 'development', priority: 'high', selfCreated: false },
//   { id: 't4', title: 'Tối ưu query database', description: 'Giảm response time của báo cáo xuống dưới 2 giây', expReward: 120, status: 'open', projectManager: 'u1', supporters: ['u3'], createdBy: 'u1', dueDate: '2026-08-05', category: 'development', priority: 'medium', selfCreated: false },
//   { id: 't5', title: 'Học React Query', description: 'Tự học và áp dụng React Query vào dự án hiện tại', expReward: 60, status: 'in-progress', assignedTo: 'u3', supporters: [], createdBy: 'u3', dueDate: '2026-07-29', category: 'research', priority: 'low', selfCreated: true },
//   { id: 't6', title: 'Review PR của team', description: 'Review ít nhất 5 pull request trong tuần này', expReward: 40, status: 'open', assignedTo: 'u5', projectManager: 'u1', supporters: [], createdBy: 'u1', dueDate: '2026-07-26', category: 'development', priority: 'low', selfCreated: false },
//   { id: 't7', title: 'Xây dựng Design System', description: 'Setup Storybook và tạo component library đầy đủ', expReward: 200, status: 'open', assignedTo: 'u7', projectManager: 'u2', supporters: ['u6', 'u8'], createdBy: 'u2', dueDate: '2026-08-10', category: 'design', priority: 'high', selfCreated: false },
//   { id: 't8', title: 'Viết tài liệu API', description: 'Swagger docs đầy đủ cho tất cả API endpoints', expReward: 70, status: 'open', projectManager: 'u1', supporters: [], createdBy: 'u1', dueDate: '2026-08-01', category: 'development', priority: 'medium', selfCreated: false },
// ]
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

// const TEAMS = [
//   { id: 't1', name: 'Engineering', emoji: '⚙️' },
//   { id: 't2', name: 'Design', emoji: '🎨' },
//   { id: 't3', name: 'Marketing', emoji: '📣' },
//   { id: 't4', name: 'Sales', emoji: '💼' },
//   { id: 't5', name: 'HR', emoji: '🧑\u200d🤝\u200d🧑' },
//   { id: 't6', name: 'Customer Support', emoji: '🎧' },
// ]
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
// ==================== LOGIN SCREEN ====================

// function LoginScreen({ onLogin }: { onLogin: (u: User) => void }) {
//   const [step, setStep] = useState<'role' | 'setup'>('role')
//   const [role, setRole] = useState<Role>('employee')
//   const [name, setName] = useState('')
//   const [avatar, setAvatar] = useState<AvatarConfig>({ ...DEFAULT_AVATAR })

//   const handleLogin = () => {
//     if (!name.trim()) return
//     onLogin({
//       id: `user_${Date.now()}`,
//       name: name.trim(),
//       role,
//       avatar,
//       exp: role === 'manager' ? 800 : 100,
//       teamId: 't1',
//       department: role === 'manager' ? 'Engineering' : 'Engineering',
//     })
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
//       style={{ background: 'radial-gradient(ellipse at 20% 50%, #1a0a3a 0%, #080812 50%, #0a1a0a 100%)', fontFamily: 'Inter, sans-serif' }}>
//       {[...Array(20)].map((_, i) => (
//         <div key={i} className="absolute rounded-full pointer-events-none"
//           style={{
//             width: Math.random() * 4 + 1, height: Math.random() * 4 + 1,
//             left: `${(i * 17 + 5) % 100}%`, top: `${(i * 23 + 8) % 100}%`,
//             background: i % 2 === 0 ? '#7c3aed' : '#f59e0b',
//             animation: `float ${3 + (i % 4)}s ease-in-out infinite`,
//             animationDelay: `${(i * 0.4) % 3}s`,
//           }} />
//       ))}

//       <div className="w-full max-w-2xl mx-4 relative z-10">
//         <div className="text-center mb-7">
//           <div className="inline-flex items-center gap-3 mb-3">
//             <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
//               style={{ background: 'linear-gradient(135deg, #7c3aed, #f59e0b)' }}>⚔️</div>
//             <h1 className="text-5xl font-black tracking-widest"
//               style={{ fontFamily: 'Rajdhani, sans-serif', background: 'linear-gradient(135deg, #7c3aed, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 20px #7c3aed60)' }}>
//               WORKQUEST
//             </h1>
//           </div>
//           <p className="text-gray-500 text-sm tracking-widest uppercase">Biến công việc thành cuộc phiêu lưu</p>
//         </div>

//         {step === 'role' ? (
//           <div className="rounded-2xl p-6 animate-slide-up" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//             <h2 className="text-white text-xl font-bold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Bạn là ai trong công ty?</h2>
//             <p className="text-gray-500 text-sm mb-5">Chọn vai trò để bắt đầu hành trình</p>
//             <div className="grid grid-cols-2 gap-4">
//               {[
//                 { r: 'manager' as Role, icon: '👑', title: 'Quản Lý', desc: 'Giao task, quản lý team và nhận EXP dựa trên hiệu suất cả team', tag: 'Team-based scoring', tagColor: '#a78bfa', bg: '#1a1040', border: '#2a1a6a' },
//                 { r: 'employee' as Role, icon: '⚔️', title: 'Nhân Viên', desc: 'Nhận task, hoàn thành mục tiêu và kiếm EXP để đổi phần thưởng', tag: 'Individual scoring', tagColor: '#34d399', bg: '#0a1a10', border: '#1a4a2a' },
//               ].map(opt => (
//                 <button key={opt.r} onClick={() => { setRole(opt.r); setStep('setup') }}
//                   className="p-6 rounded-xl text-left transition-all hover:scale-[1.02]"
//                   style={{ background: `linear-gradient(135deg, ${opt.bg}, #0e0e24)`, border: `1px solid ${opt.border}` }}>
//                   <div className="text-4xl mb-3">{opt.icon}</div>
//                   <div className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{opt.title}</div>
//                   <div className="text-gray-400 text-xs mb-3 leading-relaxed">{opt.desc}</div>
//                   <div className="text-xs" style={{ color: opt.tagColor }}>⚡ {opt.tag}</div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="rounded-2xl p-6 animate-slide-up" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//             <div className="flex items-center gap-3 mb-5">
//               <button onClick={() => setStep('role')} className="text-gray-500 hover:text-gray-300 text-sm">← Quay lại</button>
//               <div>
//                 <h2 className="text-white text-xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Tạo hồ sơ nhân vật</h2>
//                 <p className="text-gray-600 text-xs">{role === 'manager' ? '👑 Quản Lý' : '⚔️ Nhân Viên'}</p>
//               </div>
//             </div>

//             <div className="mb-4">
//               <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Tên của bạn</label>
//               <input type="text" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
//                 placeholder="Nhập tên hiển thị..."
//                 className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none"
//                 style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />
//             </div>

//             <AvatarCreator value={avatar} onChange={setAvatar} />

//             <button onClick={handleLogin} disabled={!name.trim()}
//               className="w-full mt-5 py-3.5 rounded-xl font-bold text-white text-lg tracking-wide transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
//               style={{
//                 fontFamily: 'Rajdhani, sans-serif',
//                 background: name.trim() ? 'linear-gradient(135deg, #7c3aed, #f59e0b)' : '#1e1e3a',
//                 boxShadow: name.trim() ? '0 0 30px #7c3aed50' : 'none',
//               }}>
//               BẮT ĐẦU HÀNH TRÌNH ⚡
//             </button>
//           </div>
//         )}
//         <p className="text-center text-gray-700 text-xs mt-4">WorkQuest v1.0 — Gamify Your Workday</p>
//       </div>
//     </div>
//   )
// }

function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup')
  const [step] = useState<'setup'>('setup')
  const [role, setRole] = useState<Role>('employee')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<AvatarConfig>({ ...DEFAULT_AVATAR, dicebearSeed: randomDicebearSeed() })
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

//   const { error: profileError } = await supabase.from('profiles').insert({
//     id: data.user.id,
//     name: directoryEntry.full_name,
//     role: directoryEntry.role,
//     avatar,
//     exp: 0,
//     team_id: directoryEntry.team_id,
//     department: team?.name ?? '',
//   })
//   setLoading(false)
//   if (profileError) { setError(profileError.message); return }
//   onLoggedIn()
// }
    setLoading(false)
    if (!data.session) {
      setError('Đăng ký thành công! Kiểm tra email để xác nhận, sau đó quay lại đăng nhập.')
      return
    }}
onLoggedIn()
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
              <h2 className="text-white text-xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Tạo hồ sơ nhân vật</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Tên của bạn</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Nhập tên hiển thị..."
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

            <AvatarCreator value={avatar} onChange={setAvatar} />

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
// ==================== DASHBOARD ====================

function DashboardView({ currentUser, tasks, users, setTasks, setCurrentUser, setView }: {
  currentUser: User; tasks: Task[]; users: User[]
  setTasks: (t: Task[]) => void; setCurrentUser: (u: User) => void
  setView: (v: View) => void
}) {
  const { progress, needed, level } = getExpProgress(currentUser.exp)
  const isManager = currentUser.role === 'manager'
  const myTasks = tasks.filter(t => t.assignedTo.includes(currentUser.id) || (t.selfCreated && t.createdBy === currentUser.id) || t.supporters.includes(currentUser.id))
  const pending = myTasks.filter(t => t.status !== 'completed')
  const teamExp = users.filter(u => u.teamId === currentUser.teamId).reduce((s, u) => s + u.exp, 0)

  const handleComplete = (taskId: string, expReward: number) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t))
    setCurrentUser({ ...currentUser, exp: currentUser.exp + expReward })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Hero */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${currentUser.avatar.outfitColor}18, var(--bg-panel))`, border: `1px solid ${currentUser.avatar.outfitColor}35` }}>
        <div className="flex items-center gap-5">
          <div className="rounded-2xl overflow-hidden flex-shrink-0"
            style={{ width: 80, height: 96, background: `${currentUser.avatar.outfitColor}20`, border: `2px solid ${currentUser.avatar.outfitColor}40`, boxShadow: `0 0 30px ${currentUser.avatar.outfitColor}30` }}>
            <FullAvatar avatar={currentUser.avatar} size={72} />
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Task đang làm', value: myTasks.filter(t => t.status === 'in-progress').length, color: '#06b6d4', icon: '⚡' },
          { label: 'Chưa bắt đầu', value: myTasks.filter(t => t.status === 'open').length, color: '#f59e0b', icon: '📋' },
          { label: 'Hoàn thành', value: myTasks.filter(t => t.status === 'completed').length, color: '#10b981', icon: '✅' },
          isManager
            ? { label: 'Tổng EXP team', value: teamExp.toLocaleString(), color: '#a78bfa', icon: '👥' }
            : { label: 'Hạng cá nhân', value: '#' + ([...users].sort((a, b) => b.exp - a.exp).findIndex(u => u.id === currentUser.id) + 1), color: '#ec4899', icon: '🏆' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-4" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-2xl font-black" style={{ color: stat.color, fontFamily: 'Rajdhani, sans-serif' }}>{stat.value}</span>
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tasks */}
        <div className="col-span-2 rounded-xl p-5" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
            ⚡ Task của tôi
            <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>{pending.length} chờ</span>
          </h3>
          <div className="space-y-2">
            {pending.slice(0, 5).map(task => (
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
                    <span style={{ color: STATUS_CONFIG[task.status].color }}>{STATUS_CONFIG[task.status].label}</span>
                    <span className="mx-1" style={{ color: 'var(--text-muted)' }}>·</span>
                    <span style={{ color: 'var(--text-muted)' }}>Hạn {fmtDate(task.dueDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-amber-500 font-bold text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>+{task.expReward}</span>
                  {task.assignedTo.includes(currentUser.id) && task.status === 'in-progress' && (
                    <button onClick={() => setView('tasks')}
                      className="text-xs px-3 py-1 rounded-lg font-semibold" style={{ background: '#a78bfa22', color: '#8b5cf6' }}>
                      Vào nộp task →
                    </button>
                  )}
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                <div className="text-3xl mb-2">🎉</div>
                <div className="text-sm">Tất cả task đã hoàn thành!</div>
              </div>
            )}
          </div>
        </div>

        {/* Mini leaderboard */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>
            🏆 {isManager ? 'Team' : 'Bảng xếp hạng'}
          </h3>
          <div className="space-y-3">
            {(isManager ? users.filter(u => u.teamId === currentUser.teamId)
              : users.filter(u => u.role === 'employee'))
              .sort((a, b) => b.exp - a.exp).slice(0, 5).map((user, i) => (
                <div key={user.id} className="flex items-center gap-2.5">
                  <span className="text-xs w-4 font-mono" style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                  <CharAvatar user={user} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.name.split(' ').slice(-1)[0]}</div>
                    <ExpBarMini exp={user.exp} />
                  </div>
                  <div className="text-amber-500 text-xs font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{user.exp}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================================================
// function SubmitTaskModal({ task, currentUser, onClose }: { task: Task; currentUser: User; onClose: () => void }) {
//   const [file, setFile] = useState<File | null>(null)
//   const [note, setNote] = useState('')
//   const [uploading, setUploading] = useState(false)
//   const [error, setError] = useState('')

//   // const handleSubmit = async () => {
//   //   if (!file) { setError('Vui lòng chọn ảnh hoặc file kết quả trước khi nộp.'); return }
//   //   setError('')
//   //   setUploading(true)

//   //   const ext = file.name.split('.').pop()
//   //   const path = `${task.id}/${Date.now()}.${ext}`

//   //   const { error: uploadError } = await supabase.storage.from('task-submissions').upload(path, file)
//   //   if (uploadError) { setUploading(false); setError('Lỗi tải file: ' + uploadError.message); return }

//   //   const { data: urlData } = supabase.storage.from('task-submissions').getPublicUrl(path)

//   //   const { error: updateError } = await supabase.from('tasks').update({
//   //     status: 'submitted',
//   //     submission_file_url: urlData.publicUrl,
//   //     submission_note: note.trim() || null,
//   //     submitted_at: new Date().toISOString(),
//   //     rejected_reason: null,
//   //   }).eq('id', task.id)

//   //   setUploading(false)
//   //   if (updateError) { setError(updateError.message); return }
//   //   onClose()
//   // }
  
//   const handleSubmit = async () => {
//     if (!file) { setError('Vui lòng chọn ảnh hoặc file kết quả trước khi nộp.'); return }
//     setError('')
//     setUploading(true)

//     const ext = file.name.split('.').pop()
//     const path = `${task.id}/${Date.now()}.${ext}`

//     const arrayBuffer = await file.arrayBuffer()
//     const { error: uploadError } = await supabase.storage.from('task-submissions').upload(path, arrayBuffer, {
//       contentType: file.type || 'application/octet-stream',
//     })
//     if (uploadError) { setUploading(false); setError('Lỗi tải file: ' + uploadError.message); return }

//     const { data: urlData } = supabase.storage.from('task-submissions').getPublicUrl(path)

//     const { error: updateError } = await supabase.from('tasks').update({
//     status: 'submitted',
//     submission_file_url: urlData.publicUrl,
//     submission_note: note.trim() || null,
//     submitted_at: new Date().toISOString(),
//     rejected_reason: null,
//   }).eq('id', task.id)

//   setUploading(false)
//   if (updateError) { setError(updateError.message); return }

//   // Báo cho người tạo task + các QL dự án (bỏ trùng, bỏ qua nếu chính người nộp)
//   const recipientIds = Array.from(new Set([task.createdBy, ...task.projectManager]))
//     .filter(uid => uid && uid !== currentUser.id)

//   for (const uid of recipientIds) {
//     await supabase.from('notifications').insert({
//       message: `📥 ${currentUser.name} vừa nộp kết quả task: ${task.title}`,
//       target_user_id: uid,
//     })
//   }

//   onClose()
// }
//   // const handleSubmit = async () => {
//   //   if (!file) { setError('Vui lòng chọn ảnh hoặc file kết quả trước khi nộp.'); return }
//   //   setError('')
//   //   setUploading(true)

//   //   const { data: sessionData } = await supabase.auth.getSession()
//   //   const token = sessionData.session?.access_token

//   //   const formData = new FormData()
//   //   formData.append('file', file)
//   //   formData.append('taskId', task.id)

//   //   // const uploadRes = await fetch('https://legrsdmjstoxcoxvumgg.supabase.co/functions/v1/upload-to-b2', {
//   //   //   method: 'POST',
//   //   //   headers: { Authorization: `Bearer ${token}` },
//   //   //   body: formData,
//   //   // })
//   //   // const uploadJson = await uploadRes.json()
//   //   // if (!uploadRes.ok) { setUploading(false); setError('Lỗi tải file: ' + (uploadJson.error || 'lỗi không xác định')); return }
//   //   let uploadJson
//   //   try {
//   //     const uploadRes = await fetch('https://legrsdmjstoxcoxvumgg.supabase.co/functions/v1/upload-to-b2', {
//   //       method: 'POST',
//   //       headers: { Authorization: `Bearer ${token}` },
//   //       body: formData,
//   //     })
//   //     // uploadJson = await uploadRes.json()
//   //     // if (!uploadRes.ok) { setUploading(false); setError('Lỗi tải file: ' + (uploadJson.error || 'lỗi không xác định')); return }
//   //     uploadJson = await uploadRes.json()
//   //     if (!uploadRes.ok) {
//   //       setUploading(false)
//   //       setError(`Lỗi tải file (status ${uploadRes.status}): ${uploadJson.error || uploadJson.message || JSON.stringify(uploadJson)}`)
//   //       return
//   //     }
//   //   } catch (err) {
//   //     setUploading(false)
//   //     setError('Không kết nối được tới server upload: ' + String(err))
//   //     return
//   //   } 

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: '#000000a0' }}>
//       <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#0e0e24', border: '1px solid #1e1e4a' }}>
//         <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Nộp kết quả task</h3>
//         <p className="text-gray-500 text-sm mb-4">{task.title}</p>

//         <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Ảnh / File kết quả</label>
//         <input type="file" accept="image/*,.pdf,.doc,.docx,.zip"
//           onChange={e => setFile(e.target.files?.[0] ?? null)}
//           className="w-full text-sm text-gray-300 mb-4 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white"
//         />

//         <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Ghi chú (không bắt buộc)</label>
//         <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
//           placeholder="Mô tả ngắn gọn kết quả đã làm..."
//           className="w-full px-4 py-2.5 mb-4 rounded-xl text-white placeholder-gray-600 text-sm outline-none resize-none"
//           style={{ background: '#14143a', border: '1px solid #2a2a5a' }} />

//         {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

//         <div className="flex gap-2">
//           <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-400" style={{ background: '#14143a' }}>
//             Huỷ
//           </button>
//           <button onClick={handleSubmit} disabled={uploading}
//             className="flex-1 py-2.5 rounded-xl font-bold text-sm disabled:opacity-40"
//             style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff' }}>
//             {uploading ? 'Đang tải lên...' : 'Nộp task'}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }
function SubmitTaskModal({ task, currentUser, users, onClose }: { task: Task; currentUser: User; users: User[]; onClose: () => void }) {
  const [driveLink, setDriveLink] = useState('')
  const [ownFolderUrl, setOwnFolderUrl] = useState('')
  const [folderName, setFolderName] = useState('')
  const [note, setNote] = useState('')
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
    setError('')
    setSaving(true)

    const { error: updateError } = await supabase.from('tasks').update({
      status: 'submitted',
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
        message: `📥 ${currentUser.name} vừa nộp kết quả task: ${task.title}`,
        target_user_id: uid,
        link_task_id: task.id,
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
        <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>Nộp kết quả task</h3>
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
            {saving ? 'Đang lưu...' : 'Nộp task'}
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
  const [pickedEmployee, setPickedEmployee] = useState('')

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
    setPickedEmployee('')
  }

  const handleConfirmAssign = async (c: Collaboration) => {
    if (!pickedEmployee) return
    const exp = c.expReward ?? 80
    await supabase.from('collaborations').update({
      status: 'assigned', assigned_employee_id: pickedEmployee, assigned_by: currentUser.id,
    }).eq('id', c.id)

    const { data: newTask } = await supabase.from('tasks').insert({
      title: c.title,
      description: `[Phối hợp phòng ban] ${c.description}`,
      exp_reward: exp,
      status: 'open',
      assigned_to: [pickedEmployee],
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

    const employeeName = getUserById(pickedEmployee)?.name ?? ''
    await supabase.from('notifications').insert({
      message: `🤝 ${currentUser.name} đã phân công ${employeeName} hợp tác trong dự án "${c.title}"`,
      target_user_id: c.requestedBy,
      link_task_id: newTaskId,
    })
    await supabase.from('notifications').insert({
      message: `🤝 Bạn vừa được phân công hợp tác trong dự án "${c.title}" (phối hợp với ${TEAMS.find(t => t.id === c.requestingTeamId)?.name ?? ''})`,
      target_user_id: pickedEmployee,
      link_task_id: newTaskId,
    })

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
    return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: '#34d39922', color: '#059669' }}>✅ Đã phân công: {getUserById(c.assignedEmployeeId)?.name}</span>
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
                    <label className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Phân công nhân viên phòng bạn</label>
                    <select value={pickedEmployee} onChange={e => setPickedEmployee(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg text-xs outline-none"
                      style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                      <option value="">-- Chọn nhân viên --</option>
                      {myTeamEmployees.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setAssigningId(null)} className="flex-1 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-muted)' }}>Hủy</button>
                      <button onClick={() => handleConfirmAssign(c)} disabled={!pickedEmployee}
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
function MultiUserSelect({ label, options, selected, onToggle, placeholder = 'Chọn...', badge }: {
  label: string; options: User[]; selected: string[]; onToggle: (id: string) => void
  placeholder?: string; badge?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

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
            : selected.map(sid => options.find(u => u.id === sid)?.name.split(' ').slice(-1)[0]).join(', ')}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-xl overflow-hidden max-h-60 overflow-y-auto"
          style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
          {options.map(u => (
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
      )}
    </div>
  )
}


//==================== TASKS COMMENTS =====================
//==================== TASKS COMMENTS =====================
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

// ==================== TASKS VIEW ====================

function TasksView({ currentUser, tasks, users, setTasks, setCurrentUser, collaborations, highlightTaskId, clearHighlightTaskId }: {
  currentUser: User; tasks: Task[]; users: User[]
  setTasks: (t: Task[]) => void; setCurrentUser: (u: User) => void
  collaborations: Collaboration[]
  highlightTaskId?: string | null; clearHighlightTaskId?: () => void
}) {
  const [filter, setFilter] = useState<'all' | 'mine' | 'open' | 'done'>('all')
  const [search, setSearch] = useState('')
  const [showCollabModal, setShowCollabModal] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null)
  const [submittingTask, setSubmittingTask] = useState<Task | null>(null)
  const [selfMode, setSelfMode] = useState(false)
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [flashTaskId, setFlashTaskId] = useState<string | null>(null)

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
  })

  const isManager = currentUser.role === 'manager'
  const employees = currentUser.isDirector
    ? users
    : users.filter(u => u.role === 'employee' && u.teamId === currentUser.teamId)
  const teamUsers = currentUser.isDirector
    ? users
    : users.filter(u => u.teamId === currentUser.teamId)

  const visible = tasks.filter(t => {
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
    if (filter === 'mine') return isMyTask
    if (filter === 'open') return t.status === 'open'
    if (filter === 'done') return t.status === 'completed'
    return true
  })

  const handleStart = async (id: string) => {
    await supabase.from('tasks').update({ status: 'in-progress' }).eq('id', id)
  }

  const handleApprove = async (task: Task) => {
    const approvedAt = new Date().toISOString()

    const { error: approveError } = await supabase.from('tasks').update({
      status: 'completed',
      approved_by: currentUser.id,
      approved_at: approvedAt,
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
        message: `📢 ${currentUser.name} (${departmentName}) đã duyệt ${taskTypeLabel}: "${task.title}"${taskOwnerNames ? ` — Nhân sự: ${taskOwnerNames}` : ''}`,
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
        message: `✅ ${currentUser.name} đã duyệt task: "${task.title}" — bạn nhận được +${earnedExp} EXP`,
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
          ? `✅ ${currentUser.name} đã duyệt task: "${task.title}" — bạn nhận được +${task.expReward} EXP`
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
      status: 'in-progress', submission_file_url: null, submission_note: null, rejected_reason: reason,
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
    })
    setShowModal(true)
  }

  const handleSaveTask = async () => {
    if (!form.title.trim()) return
    const { min, max } = getExpRange(form.priority, form.important, form.urgent)
    if (form.expReward < min || form.expReward > max) {
      alert(`Điểm EXP phải nằm trong khoảng ${min}–${max} cho mức độ "${PRIORITY_CONFIG[form.priority].label}" với lựa chọn Quan trọng/Gấp hiện tại`)
      return
    }

    if (editingTask) {
      await supabase.from('tasks').update({
        title: form.title, description: form.description, exp_reward: form.expReward,
        assigned_to: form.assignedTo, project_manager: form.projectManager, supporters: form.supporters,
        start_date: form.startDate, due_date: form.dueDate,
        category: form.category, priority: form.priority,
        important: form.important, urgent: form.urgent, is_team_project: form.isTeamProject,
        drive_folder_created: form.driveFolderCreated,
        drive_folder_name: form.driveFolderCreated ? (form.driveFolderName.trim() || null) : null,
      }).eq('id', editingTask.id)
    } else {
      const creatingForSelf = !isManager || selfMode
      const assignedUsers = form.assignedTo.map(uid => users.find(u => u.id === uid)).filter(Boolean) as User[]
      const outsideAssignees = assignedUsers.filter(u => u.teamId !== currentUser.teamId)
      const isCrossDept = !creatingForSelf && !currentUser.isDirector && outsideAssignees.length > 0
      const targetTeamId = isCrossDept ? outsideAssignees[0].teamId : null

      const { data: newTask } = await supabase.from('tasks').insert({
        title: form.title, description: form.description, exp_reward: form.expReward,
        status: 'open', assigned_to: creatingForSelf ? [currentUser.id] : form.assignedTo,
        project_manager: form.projectManager, supporters: form.supporters,
        created_by: currentUser.id,
        start_date: form.startDate,
        due_date: form.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        category: form.category, priority: form.priority, self_created: creatingForSelf,
        important: form.important, urgent: form.urgent, is_team_project: form.isTeamProject,
        cross_dept_pending: isCrossDept,
        target_team_id: targetTeamId,
        drive_folder_created: !creatingForSelf && form.driveFolderCreated,
        drive_folder_name: (!creatingForSelf && form.driveFolderCreated) ? (form.driveFolderName.trim() || null) : null,
      }).select('id').single()
      const newTaskId = newTask?.id

      if (isManager && !selfMode) {
        for (const uid of form.assignedTo) {
          if (uid === currentUser.id) continue
          await supabase.from('notifications').insert({
            message: `📋 ${currentUser.name} vừa giao cho bạn task: ${form.title}`,
            target_user_id: uid,
            link_task_id: newTaskId,
          })
        }

        for (const uid of form.supporters) {
          if (uid === currentUser.id) continue
          await supabase.from('notifications').insert({
            message: `🤝 ${currentUser.name} vừa thêm bạn làm người hỗ trợ task: ${form.title}`,
            target_user_id: uid,
            link_task_id: newTaskId,
          })
        }

        if (isCrossDept && targetTeamId) {
          const targetManagers = users.filter(u => u.role === 'manager' && u.teamId === targetTeamId)
          const assigneeNames = outsideAssignees.map(u => u.name).join(', ')
          for (const mgr of targetManagers) {
            await supabase.from('notifications').insert({
              message: `📨 ${currentUser.name} (${TEAMS.find(t => t.id === currentUser.teamId)?.name ?? ''}) muốn giao task "${form.title}" cho ${assigneeNames} trong phòng ban của bạn`,
              target_user_id: mgr.id,
              link_task_id: newTaskId,
            })
          }
        }
      } else if (creatingForSelf) {
        const teamManagers = users.filter(u => u.role === 'manager' && u.teamId === currentUser.teamId && u.id !== currentUser.id)
        for (const mgr of teamManagers) {
          await supabase.from('notifications').insert({
            message: `🎯 ${currentUser.name} vừa tự tạo task: ${form.title}`,
            target_user_id: mgr.id,
            link_task_id: newTaskId,
          })
        }
      }
    }

    setShowModal(false)
    setEditingTask(null)
    setSelfMode(false)
    setForm({ title: '', description: '', expReward: 80, startDate: todayStr, dueDate: '', category: 'development', priority: 'medium', important: false, urgent: false, isTeamProject: false, assignedTo: [], projectManager: [], supporters: [], driveFolderCreated: false, driveFolderName: '' })
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

      <CollaborationsPanel currentUser={currentUser} users={users} collaborations={collaborations} />
      <div className="flex gap-2 mb-5">
        {[{ id: 'all', label: 'Tất cả' }, { id: 'mine', label: 'Của tôi' }, { id: 'open', label: 'Chưa làm' }, { id: 'done', label: 'Xong' }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id as typeof filter)}
            className="px-3.5 py-1.5 rounded-lg text-sm transition-all"
            style={{ background: filter === f.id ? '#7c3aed' : 'var(--bg-panel)', color: filter === f.id ? '#fff' : 'var(--text-muted)', border: `1px solid ${filter === f.id ? '#7c3aed' : 'var(--border)'}` }}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{task.title}</h3>
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
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: pri.bg, color: pri.color }}>{pri.label}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>📅 {fmtDate(task.dueDate)}</span>
              </div>

              {/* People section */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] w-14 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>Phụ trách:</span>
                  {assignees.length > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {assignees.map(a => (
                        <div key={a.id} className="flex items-center gap-1">
                          <CharAvatar user={a} size={20} />
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.name.split(' ').slice(-1)[0]}</span>
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
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pm.name.split(' ').slice(-1)[0]}</span>
                        </div>
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

                  ) : task.status === 'completed' ? (
                    <span className="text-xs" style={{ color: '#059669' }}>✓ Hoàn thành</span>

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
                      <div className="flex gap-1.5">
                        <button onClick={() => handleReject(task)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#f8717122', color: '#dc2626' }}>
                          Không chấp nhận
                        </button>
                        <button onClick={() => handleApprove(task)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: '#34d39922', color: '#059669' }}>
                          ✓ Duyệt
                        </button>
                      </div>
                    </div>

                  ) : task.status === 'submitted' && task.assignedTo.includes(currentUser.id) ? (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#a78bfa22', color: '#8b5cf6' }}>
                      ⏳ Đang chờ quản lý duyệt
                    </span>

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
                        {task.status === 'in-progress' && (
                          <button onClick={() => setSubmittingTask(task)}
                            className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#34d39922', color: '#059669' }}>
                            Nộp task ✓
                          </button>
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
                  <button onClick={() => setOpenCommentsFor(openCommentsFor === task.id ? null : task.id)}
                    className="hover:text-violet-400 text-xs flex items-center gap-1 mt-3" style={{ color: 'var(--text-muted)' }}>
                    💬 Thảo luận {openCommentsFor === task.id ? '▲' : '▼'}
                  </button>
                  {openCommentsFor === task.id && (
                    <TaskCommentsPanel taskId={task.id} currentUser={currentUser} users={users} />
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
                    placeholder="Chưa giao" />

                  <MultiUserSelect
                    label="Quản lý dự án (PM) — mỗi người nhận đủ 100% EXP"
                    options={teamUsers}
                    selected={form.projectManager}
                    onToggle={uid => toggleFormArray('projectManager', uid)}
                    placeholder="Chọn PM..."
                    badge="PM" />

                  <MultiUserSelect
                    label={`Người hỗ trợ — mỗi người nhận ${Math.round(SUPPORTER_EXP_PERCENT * 100)}% EXP`}
                    options={employees}
                    selected={form.supporters}
                    onToggle={uid => toggleFormArray('supporters', uid)}
                    placeholder="Chọn người hỗ trợ..." />

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
function RedemptionHistoryPanel({ users }: { users: User[] }) {
  const [allRedemptions, setAllRedemptions] = useState<{
    id: string; userId: string; rewardName: string; cost: number; redeemedAt: string
  }[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<'week' | 'month' | 'all' | 'custom'>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  useEffect(() => {
    supabase.from('redemptions').select('*').order('redeemed_at', { ascending: false })
      .then(({ data }) => {
        if (data) setAllRedemptions(data.map(r => ({
          id: r.id, userId: r.user_id, rewardName: r.reward_name, cost: r.cost, redeemedAt: r.redeemed_at,
        })))
        setLoading(false)
      })
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

      {currentUser.teamId === 't1c' && <RedemptionHistoryPanel users={users} />}
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
        <div className="w-24 h-32 mx-auto mb-3 rounded-2xl overflow-hidden flex items-end justify-center"
          style={{ background: `${user.avatar.outfitColor}20`, border: `2px solid ${user.avatar.outfitColor}40`, boxShadow: `0 0 24px ${user.avatar.outfitColor}40` }}>
          <FullAvatar avatar={user.avatar} size={86} />
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
// ==================== SOCIAL ====================

function SocialView({ currentUser, users, messages, setMessages, showMentions, setShowMentions, markMentionsSeen, navigateTarget, clearNavigateTarget }: {
  currentUser: User; users: User[]; messages: Message[]; setMessages: (m: Message[]) => void
  showMentions: boolean; setShowMentions: (v: boolean) => void; markMentionsSeen: () => void
  navigateTarget?: { channel: ChatChannel; dmUserId?: string } | null
  clearNavigateTarget?: () => void
}) {
  const [channel, setChannel] = useState<ChatChannel>('general')
  const [dmUserId, setDmUserId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [profileUser, setProfileUser] = useState<User | null>(null)
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
    if (navigateTarget.channel === 'dm' && navigateTarget.dmUserId) {
      setChannel('dm')
      setDmUserId(navigateTarget.dmUserId)
      markSeen(`dm:${navigateTarget.dmUserId}`)
    } else {
      setChannel(navigateTarget.channel)
      setDmUserId(null)
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

  const filtered = showMentions
    ? mentionMessages
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

  const canPost = isDm || channel !== 'announcements' || currentUser.role === 'manager'

  const myTeam = TEAMS.find(t => t.id === currentUser.teamId)

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

  const headerLabel = showMentions ? '🔔 Nhắc đến tôi' : isDm ? `@ ${dmPartner?.name ?? ''}` : CHANNELS.find(c => c.id === channel)?.label
  const headerDesc = showMentions ? 'Tất cả tin nhắn có tag bạn' : isDm ? 'Nhắn tin riêng' : CHANNELS.find(c => c.id === channel)?.desc

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

        <p className="text-[10px] uppercase tracking-widest px-2 mt-4 mb-2" style={{ color: 'var(--text-muted)' }}>Online ({users.length})</p>
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
              <span className="text-[11px] truncate flex-1 text-left" style={{ color: 'var(--text-muted)' }}>{u.name.split(' ').slice(-1)[0]}</span>
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
    </div>
  )
}

// ==================== PROFILE ====================

// function ProfileView({ currentUser, setCurrentUser, tasks }: {
//   currentUser: User; setCurrentUser: (u: User) => void; tasks: Task[]
// }) {
//   const [editing, setEditing] = useState(false)
//   const [draftAvatar, setDraftAvatar] = useState<AvatarConfig>(currentUser.avatar)
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
            <div className="w-28 h-36 mx-auto mb-3 rounded-2xl overflow-hidden flex items-end justify-center"
              style={{ background: `${currentUser.avatar.outfitColor}20`, border: `2px solid ${currentUser.avatar.outfitColor}40`, boxShadow: `0 0 30px ${currentUser.avatar.outfitColor}30` }}>
              <FullAvatar avatar={currentUser.avatar} size={100} />
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
              {editing ? '↑ Đóng' : '🎭 Đổi tên & nhân vật'}
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

          {editing && (
            <div className="rounded-xl p-4 animate-slide-up" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
              <h4 className="font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-primary)' }}>🎭 Tùy chỉnh nhân vật</h4>

              <div className="mb-4">
                <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Tên hiển thị</label>
                <input value={draftName} onChange={e => setDraftName(e.target.value)} maxLength={40}
                  placeholder="Nhập tên bạn muốn hiển thị..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>

              <AvatarCreator value={draftAvatar} onChange={setDraftAvatar} />
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

// ==================== APP SHELL ====================

const NAV = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'tasks', icon: '📋', label: 'Task' },
  { id: 'leaderboard', icon: '🏆', label: 'Xếp hạng' },
  { id: 'rewards', icon: '🎁', label: 'Quà' },
  { id: 'social', icon: '💬', label: 'Social' },
  { id: 'profile', icon: '👤', label: 'Hồ sơ' },
]
function NotificationBell({ notifications, onNotificationClick }: {
  notifications: { id: string; message: string; createdAt: string; linkChannel?: string; linkDmUserId?: string; linkTaskId?: string }[]
  onNotificationClick?: (n: { linkChannel?: string; linkDmUserId?: string; linkTaskId?: string }) => void
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
                onClick={() => { if (n.linkChannel || n.linkTaskId) { onNotificationClick?.(n); setOpen(false) } }}
                className="px-4 py-3 flex items-start justify-between gap-2 group" style={{ borderBottom: '1px solid var(--border)', cursor: (n.linkChannel || n.linkTaskId) ? 'pointer' : 'default' }}>
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

function AppShell({ currentUser, setCurrentUser, allUsers, tasks, setTasks, messages, setMessages, redemptions, notifications, collaborations }: {
  currentUser: User; setCurrentUser: (u: User) => void; allUsers: User[]
  tasks: Task[]; setTasks: (t: Task[]) => void
  messages: Message[]; setMessages: (m: Message[]) => void
  redemptions: { id: string; userId: string; rewardId: string; cost: number }[]
  notifications: { id: string; message: string; createdAt: string }[]
  collaborations: Collaboration[]
}) {
  const [view, setView] = useState<View>('dashboard')
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('themeMode') as ThemeMode) || 'dark')
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
  const [socialTarget, setSocialTarget] = useState<{ channel: ChatChannel; dmUserId?: string } | null>(null)
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null)
  const navItems = currentUser.isDirector ? [...NAV, { id: 'bodlog', icon: '📊', label: 'Log BOD' }] : NAV

  const handleNotificationClick = (n: { linkChannel?: string; linkDmUserId?: string; linkTaskId?: string }) => {
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
      case 'dashboard': return <DashboardView {...sharedProps} />
      case 'tasks': return (
        <TasksView {...sharedProps} collaborations={collaborations}
          highlightTaskId={highlightTaskId} clearHighlightTaskId={() => setHighlightTaskId(null)} />
      )
      case 'leaderboard': return <LeaderboardView users={users} tasks={tasks} />
      case 'rewards': return <RewardsView currentUser={currentUser} redemptions={redemptions} users={users} />
      case 'social': return (
        <SocialView currentUser={currentUser} users={users} messages={messages} setMessages={setMessages}
          showMentions={showMentions} setShowMentions={setShowMentions} markMentionsSeen={markMentionsSeen}
          navigateTarget={socialTarget} clearNavigateTarget={() => setSocialTarget(null)} />
      )
      case 'profile': return <ProfileView currentUser={currentUser} setCurrentUser={setCurrentUser} tasks={tasks} />
          case 'bodlog': return currentUser.isDirector ? <BodLogView tasks={tasks} users={users} /> : <DashboardView {...sharedProps} />
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden overflow-x-hidden" style={{ ...themeVars, background: 'var(--bg-app)', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <div className="hidden md:flex w-[72px] flex-col items-center py-4 gap-0.5 flex-shrink-0"
        style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>
        <div className="mb-4">
          <img src={companyLogo} alt="KNI" className="w-10 h-10 rounded-lg object-contain" />
        </div>
        {navItems.map(item => (
          <button key={item.id}
            onClick={() => {
              setView(item.id as View)
              if (item.id === 'social' && mentionCount > 0) setShowMentions(true)
            }}
            title={item.label}
            className="relative w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-150"
            style={{
              background: view === item.id ? '#1a1a40' : 'transparent',
              boxShadow: view === item.id ? 'inset 0 0 15px #7c3aed18, 0 0 0 1px #2a2a6a' : 'none',
            }}>
            <span className="text-xl">{item.icon}</span>
            <span className="text-[8px] tracking-wide" style={{ color: view === item.id ? '#a78bfa' : '#374151' }}>{item.label}</span>
            {item.id === 'social' && mentionCount > 0 && (
              <span className="absolute top-1 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                {mentionCount > 9 ? '9+' : mentionCount}
              </span>
            )}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={() => setView('profile')} className="mb-1">
          <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: view === 'profile' ? `2px solid ${currentUser.avatar.outfitColor}` : '2px solid rgba(255,255,255,0.08)', background: `${currentUser.avatar.outfitColor}20` }}>
            <CharAvatar user={currentUser} size={40} />
          </div>
        </button>
      </div>

        {/* Bottom nav — chỉ hiện trên mobile */}
      <div className="flex md:hidden items-center justify-around py-2 flex-shrink-0"
        style={{ background: '#06060f', borderTop: '1px solid #1a1a3a' }}>
        {navItems.map(item => (
          <button key={item.id}
            onClick={() => {
              setView(item.id as View)
              if (item.id === 'social' && mentionCount > 0) setShowMentions(true)
            }}
            className="relative flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg"
            style={{ color: view === item.id ? '#a78bfa' : '#4b5563' }}>
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
            <img src={companyLogo} alt="KNI" className="w-8 h-8 rounded-md object-contain md:hidden flex-shrink-0" />
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
                <div className="text-sm font-medium leading-tight truncate max-w-[100px]" style={{ color: 'var(--text-primary)' }}>{currentUser.name.split(' ').slice(-1)[0]}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{currentUser.role === 'manager' ? '👑 Quản lý' : '⚔️ Nhân viên'}</div>
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
  const [notifications, setNotifications] = useState<{ id: string; message: string; createdAt: string; targetUserId?: string; linkChannel?: string; linkDmUserId?: string; linkTaskId?: string }[]>([])
  const [collaborations, setCollaborations] = useState<Collaboration[]>([])

  function mapProfileToUser(p: any): User {
  return { id: p.id, name: p.name, role: p.role, avatar: p.avatar, exp: p.exp, teamId: p.team_id, department: p.department, email: p.email, isDirector: p.is_director ?? false, driveFolderUrl: p.drive_folder_url ?? undefined }
}

  function mapDbMessage(m: any): Message {
    return { id: m.id, userId: m.user_id, toUserId: m.to_user_id ?? undefined, content: m.content, channel: m.channel, timestamp: m.created_at }
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
    targetTeamId: t.target_team_id ?? undefined,
    submissionOwnFolderUrl: t.submission_own_folder_url ?? undefined,
    driveFolderCreated: t.drive_folder_created ?? false,
    driveFolderName: t.drive_folder_name ?? undefined,
    submissionFolderName: t.submission_folder_name ?? undefined,
    driveFolderOwnerId: t.drive_folder_owner_id ?? undefined,
    approvedBy: t.approved_by ?? undefined,
    approvedAt: t.approved_at ?? undefined,
  }
}
function mapDbCollaboration(c: any): Collaboration {
  return {
    id: c.id, title: c.title, description: c.description,
    startDate: c.start_date, endDate: c.end_date,
    requestedBy: c.requested_by, requestingTeamId: c.requesting_team_id, targetTeamId: c.target_team_id,
    targetManagerId: c.target_manager_id ?? undefined,
    expReward: c.exp_reward ?? undefined,
    status: c.status, assignedEmployeeId: c.assigned_employee_id ?? undefined,
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
    />
  )
}
