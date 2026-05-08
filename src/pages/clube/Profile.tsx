import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase/client'
import { Trophy, Globe, MapPin, Phone, MessageSquare, Save, Image as ImageIcon } from 'lucide-react'

export default function ClubProfile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: 'O Meu Clube',
    initials: 'omc',
    description: '',
    address: '',
    phone: '',
    website: '',
    socials: { instagram: '', facebook: '' }
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
    await updateDoc(doc(db, 'clubs', 'default_club'), profile)
    setSaving(false)
    alert('Perfil atualizado com sucesso!')
  }

  if (loading) return <div className="p-12 text-center text-zinc-500">A carregar perfil...</div>

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black tracking-tight text-white italic">Perfil do Clube</h1>
          <p className="text-zinc-500 font-medium">Define a identidade e as iniciais usadas para os logins automáticos.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-white text-black font-black rounded-2xl flex items-center gap-2 hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 active:scale-95"
        >
          <Save size={20} /> {saving ? 'A guardar...' : 'Guardar Perfil'}
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Identidade Visual */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[40px] text-center space-y-6">
            <div className="w-32 h-32 bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-3xl mx-auto flex flex-col items-center justify-center text-zinc-700 hover:text-white transition-colors cursor-pointer group">
              <ImageIcon size={40} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase mt-2">Logótipo</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">{profile.name}</h3>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">ID: {profile.initials}</p>
            </div>
          </div>
        </div>

        {/* Dados Base */}
        <div className="md:col-span-2 space-y-8">
          <section className="p-10 bg-zinc-900/50 border border-zinc-900 rounded-[40px] space-y-8">
            <h3 className="text-lg font-black text-white flex items-center gap-3">
              <Trophy size={24} className="text-zinc-500" /> Informação Base
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Nome Oficial</label>
                <input 
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl focus:border-white outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Iniciais (Padrão Email)</label>
                <input 
                  type="text"
                  maxLength={5}
                  value={profile.initials}
                  onChange={(e) => setProfile({...profile, initials: e.target.value.toLowerCase().replace(/\s/g, '')})}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl focus:border-white outline-none transition-all font-black"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Descrição / Manifesto</label>
                <textarea 
                  value={profile.description}
                  onChange={(e) => setProfile({...profile, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl focus:border-white outline-none transition-all"
                  placeholder="Escreve aqui a história ou valores do clube..."
                />
              </div>
            </div>
          </section>

          <section className="p-10 bg-zinc-900/50 border border-zinc-900 rounded-[40px] space-y-8">
            <h3 className="text-lg font-black text-white flex items-center gap-3">
              <Globe size={24} className="text-zinc-500" /> Contactos & Morada
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Morada Sede</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input 
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Contacto Telefónico</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input 
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl outline-none"
                  />
                </div>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Website Oficial</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input 
                    type="text"
                    value={profile.website}
                    onChange={(e) => setProfile({...profile, website: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl outline-none"
                    placeholder="https://meuclube.pt"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
