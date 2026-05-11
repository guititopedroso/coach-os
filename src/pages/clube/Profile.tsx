import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase/client'
import { 
  Trophy, 
  Globe, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Save, 
  Image as ImageIcon,
  Shield,
  Star,
  Target,
  History,
  LayoutDashboard
} from 'lucide-react'

export default function ClubProfile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: 'O Meu Clube',
    initials: 'omc',
    description: '',
    vision: '',
    history: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    socials: { instagram: '', facebook: '', twitter: '' }
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const docSnap = await getDoc(doc(db, 'clubs', 'default_club'))
    if (docSnap.exists()) {
      setProfile({ ...profile, ...docSnap.data() })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'clubs', 'default_club'), profile)
      alert('Identidade do Clube atualizada com sucesso!')
    } catch (err) {
      console.error(err)
      alert('Erro ao guardar perfil.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-zinc-500 font-black uppercase tracking-widest animate-pulse">A sincronizar identidade...</div>

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Header Estilizado */}
      <div className="relative h-64 bg-zinc-900 rounded-[48px] overflow-hidden border border-zinc-800 shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-600/20 via-transparent to-zinc-950/80"></div>
        <div className="absolute bottom-0 left-0 right-0 p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl border-4 border-zinc-900">
               <Shield size={48} className="text-zinc-900" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-black text-white italic tracking-tighter">{profile.name}</h1>
              <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.4em]">Quartel-General CoachOS</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-10 py-5 bg-white text-black font-black rounded-2xl flex items-center gap-3 hover:bg-zinc-200 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
          >
            <Save size={20} /> {saving ? 'A guardar...' : 'Guardar Alterações'}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Coluna Esquerda: Definições de Sistema */}
        <div className="space-y-8">
           <section className="p-8 bg-zinc-900/50 border border-zinc-900 rounded-[40px] space-y-6">
              <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-[10px]">
                <LayoutDashboard size={14} className="text-indigo-500" /> Configurações de Sistema
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Iniciais do Clube (Padrão Email)</label>
                <input 
                  type="text"
                  maxLength={5}
                  value={profile.initials}
                  onChange={(e) => setProfile({...profile, initials: e.target.value.toLowerCase().replace(/\s/g, '')})}
                  className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none transition-all font-black text-white text-center uppercase tracking-widest"
                />
                <p className="text-[9px] text-zinc-500 font-bold px-2 italic">Usado para gerar logins como: sub19.coach@{profile.initials || '...'}.pt</p>
              </div>
           </section>

           <section className="p-8 bg-zinc-900/50 border border-zinc-900 rounded-[40px] space-y-6">
              <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-[10px]">
                <Globe size={14} className="text-blue-500" /> Presença Digital
              </div>
              <div className="space-y-4">
                 <ProfileInput label="Website" icon={<Globe size={14}/>} value={profile.website} onChange={(val: string) => setProfile({...profile, website: val})} />
                 <ProfileInput label="Instagram" icon={<ImageIcon size={14}/>} value={profile.socials.instagram} onChange={(val: string) => setProfile({...profile, socials: {...profile.socials, instagram: val}})} />
                 <ProfileInput label="Facebook" icon={<ImageIcon size={14}/>} value={profile.socials.facebook} onChange={(val: string) => setProfile({...profile, socials: {...profile.socials, facebook: val}})} />
              </div>
           </section>
        </div>

        {/* Coluna Direita: Identidade e História */}
        <div className="lg:col-span-2 space-y-8 text-left">
           <section className="p-10 bg-zinc-900/50 border border-zinc-900 rounded-[40px] space-y-8">
              <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-[10px]">
                <Star size={16} className="text-amber-500" /> Identidade Institucional
              </div>
              
              <div className="grid gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Nome Oficial da Instituição</label>
                  <input 
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none transition-all font-black text-white text-xl"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center gap-2">
                      <Target size={12}/> Visão / Ambição
                    </label>
                    <textarea 
                      value={profile.vision}
                      onChange={(e) => setProfile({...profile, vision: e.target.value})}
                      rows={3}
                      className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm text-zinc-400 font-medium"
                      placeholder="Ex: Tornar-se a referência da formação..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center gap-2">
                      <History size={12}/> Breve História
                    </label>
                    <textarea 
                      value={profile.history}
                      onChange={(e) => setProfile({...profile, history: e.target.value})}
                      rows={3}
                      className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm text-zinc-400 font-medium"
                      placeholder="Ex: Fundado em 19XX, o clube tem como tradição..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Descrição Geral / Manifesto</label>
                  <textarea 
                    value={profile.description}
                    onChange={(e) => setProfile({...profile, description: e.target.value})}
                    rows={4}
                    className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm text-zinc-400 font-medium leading-relaxed"
                    placeholder="Descreve os valores fundamentais do clube..."
                  />
                </div>
              </div>
           </section>

           <section className="p-10 bg-zinc-900/50 border border-zinc-900 rounded-[40px] space-y-8">
              <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-[10px]">
                <MapPin size={16} className="text-emerald-500" /> Sede e Contactos
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                 <ProfileInput label="Morada Completa" icon={<MapPin size={14}/>} value={profile.address} onChange={(val: string) => setProfile({...profile, address: val})} />
                 <ProfileInput label="Telemóvel / Sede" icon={<Phone size={14}/>} value={profile.phone} onChange={(val: string) => setProfile({...profile, phone: val})} />
                 <div className="md:col-span-2">
                    <ProfileInput label="Email de Contacto Público" icon={<MessageSquare size={14}/>} value={profile.email} onChange={(val: string) => setProfile({...profile, email: val})} />
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  )
}

function ProfileInput({ label, icon, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700">{icon}</div>
        <input 
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold text-white text-sm"
        />
      </div>
    </div>
  )
}
