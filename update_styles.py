import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

original_len = len(content)

# ===== 1. Update glass-dark CSS definition (deeper navy + stronger shadow) =====
content = content.replace(
    '.glass-dark { \n        background: rgba(15, 23, 42, 0.7); \n        backdrop-filter: blur(24px) saturate(180%);\n        border: 1px solid rgba(255, 255, 255, 0.05);\n      }',
    '.glass-dark { \n        background: rgba(10, 15, 30, 0.85); \n        backdrop-filter: blur(24px) saturate(180%);\n        border: 1px solid rgba(255, 255, 255, 0.06);\n        box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);\n      }'
)

# ===== 2. Update glass CSS definition (warmer light mode) =====
content = content.replace(
    '.glass { \n        background: rgba(255, 255, 255, 0.7); \n        backdrop-filter: blur(24px) saturate(180%);\n        border: 1px solid rgba(255, 255, 255, 0.3);\n      }',
    '.glass { \n        background: rgba(255, 255, 255, 0.85); \n        backdrop-filter: blur(24px) saturate(180%);\n        border: 1px solid rgba(0, 0, 0, 0.06);\n        box-shadow: 0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8);\n      }'
)

# ===== 3. Update shadow-premium (deeper shadows) =====
content = content.replace(
    '.shadow-premium { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }',
    '.shadow-premium { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25); }'
)
content = content.replace(
    '.shadow-premium-lg { box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12); }',
    '.shadow-premium-lg { box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35); }'
)
content = content.replace(
    '.shadow-premium-xl { box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); }',
    '.shadow-premium-xl { box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45); }'
)

# ===== 4. Update gradient-mesh to use emerald/indigo colors =====
old_mesh = (
    '      .gradient-mesh {\n'
    '        background: \n'
    '          radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),\n'
    '          radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),\n'
    '          radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.15) 0px, transparent 50%),\n'
    '          radial-gradient(at 0% 100%, rgba(59, 130, 246, 0.15) 0px, transparent 50%);\n'
    '      }'
)
new_mesh = (
    '      .gradient-mesh {\n'
    '        background: \n'
    '          radial-gradient(at 0% 0%, rgba(16, 217, 160, 0.12) 0px, transparent 50%),\n'
    '          radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%),\n'
    '          radial-gradient(at 100% 100%, rgba(16, 217, 160, 0.08) 0px, transparent 50%),\n'
    '          radial-gradient(at 0% 100%, rgba(99, 102, 241, 0.08) 0px, transparent 50%);\n'
    '      }'
)
content = content.replace(old_mesh, new_mesh)

# ===== 5. Add gradient-text and stat-num to injected styles =====
old_shadow_xl = '.shadow-premium-xl { box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45); }'
new_shadow_xl_plus = '''.shadow-premium-xl { box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45); }

      .gradient-text {
        background: linear-gradient(135deg, #10d9a0, #6366f1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .stat-num {
        font-weight: 900;
        letter-spacing: -1px;
        font-variant-numeric: tabular-nums;
        background: linear-gradient(135deg, #10d9a0, #6eb4f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .section-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1.5px;
      }'''
content = content.replace(old_shadow_xl, new_shadow_xl_plus)

# ===== 6. Update page backgrounds =====
content = content.replace(
    "${dark?'bg-slate-900':'bg-slate-50'}",
    "${dark?'app-bg-dark':'app-bg-light'}"
)
content = content.replace(
    "${dark?'bg-slate-900':'bg-gradient-to-br from-slate-50 via-white to-blue-50'}",
    "${dark?'app-bg-dark':'app-bg-light'}"
)
content = content.replace(
    "${dark?'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900':'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50'}",
    "${dark?'app-bg-dark':'app-bg-light'}"
)

# ===== 7. "Plato" brand h1 - gradient-text =====
content = content.replace(
    "text-5xl font-bold mb-3 ${dark?'text-white':'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent'}",
    "text-5xl font-extrabold mb-3 gradient-text"
)

# ===== 8. Plan name h1 in main plan view =====
content = content.replace(
    "text-3xl md:text-4xl font-bold mb-2 ${dark?'text-white':'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'}",
    "text-3xl md:text-4xl font-extrabold mb-2 gradient-text"
)

# ===== 9. Section labels - replace with section-label class =====
content = content.replace(
    "text-xs font-bold uppercase tracking-wider mb-3 ${dark?'text-slate-500':'text-gray-500'}",
    "section-label mb-3 ${dark?'text-slate-500':'text-gray-500'}"
)
content = content.replace(
    "text-xs font-bold uppercase tracking-wider ${dark?'text-slate-500':'text-gray-500'}",
    "section-label ${dark?'text-slate-500':'text-gray-500'}"
)
content = content.replace(
    "text-xs font-semibold uppercase tracking-wider mb-1 ${dark?'text-slate-400':'text-slate-600'}",
    "section-label mb-1 ${dark?'text-slate-400':'text-slate-600'}"
)
content = content.replace(
    "text-xs font-semibold uppercase tracking-wider ${dark?'text-slate-500':'text-gray-500'}",
    "section-label ${dark?'text-slate-500':'text-gray-500'}"
)

# ===== 10. Stat numbers on plan summary cards =====
content = content.replace(
    'text-3xl font-bold tabular-nums text-emerald-600',
    'stat-num text-emerald-600'
)
content = content.replace(
    'text-3xl font-bold tabular-nums text-blue-600',
    'stat-num text-blue-600'
)
content = content.replace(
    'text-3xl font-bold tabular-nums text-orange-600',
    'stat-num text-orange-600'
)
content = content.replace(
    'text-3xl font-bold tabular-nums text-purple-600',
    'stat-num text-purple-600'
)

# ===== 11. Bottom navigation glass effect =====
content = content.replace(
    "${dark?'bg-slate-800':'bg-white'} rounded-t-3xl flex flex-col",
    "${dark?'glass-dark':'glass'} rounded-t-3xl flex flex-col"
)
content = content.replace(
    "${dark?'bg-slate-800/95 border-slate-700':'bg-white/95 border-gray-200'} backdrop-blur-lg border-t p-4 shadow-2xl",
    "${dark?'glass-dark border-white/10':'glass border-gray-200'} border-t p-4 shadow-2xl"
)

# ===== 12. Progress bar confidence track =====
content = content.replace(
    "h-1.5 flex-1 rounded-full ${dark?'bg-slate-600':'bg-slate-200'}",
    "h-1.5 flex-1 progress-bar-track"
)

new_len = len(content)
print(f"Original: {original_len} bytes, New: {new_len} bytes, Diff: {new_len - original_len}")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
