import { useState } from 'react'
import { Clock, Eye, EyeOff, Shield, ArrowLeft, User, Zap } from 'lucide-react'
import type { Employee } from '../types'

interface LoginPageProps {
  employees: Employee[]
  onLoginSuccess: (employee: Employee) => void
  onBack: () => void
}

export default function LoginPage({ employees, onLoginSuccess, onBack }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const demoEmployee = employees.find((e) => e.profile === 'employee')
  const demoAdmin = employees.find((e) => e.profile === 'admin')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      const found = employees.find(
        (emp) =>
          emp.email.toLowerCase() === email.toLowerCase().trim() &&
          emp.status
      )

      if (!found || password !== '123456') {
        setError('E-mail ou senha inválidos. Verifique suas credenciais.')
        setLoading(false)
        return
      }

      setLoading(false)
      onLoginSuccess(found)
    }, 600)
  }

  const fillDemo = (emp: Employee) => {
    setEmail(emp.email)
    setPassword('123456')
    setIsAdmin(emp.profile === 'admin')
    setError('')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1a7a4a] flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">
              Ponto <span className="text-[#4ade80]">Fácil</span>
            </span>
          </div>

          <button
            onClick={() => setIsAdmin((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isAdmin
                ? 'bg-[#1a7a4a] text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <Shield className="w-4 h-4" />
            Painel Admin
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center pt-20 pb-10 px-4">
        <div className="w-full max-w-md">
          {/* Formulário */}
          <div className="glass-card p-8 mb-4">
            <div className="text-center mb-8">
              <div
                className={`w-14 h-14 rounded-2xl ${
                  isAdmin ? 'bg-purple-600/30' : 'bg-[#1a7a4a]/30'
                } flex items-center justify-center mx-auto mb-4`}
              >
                {isAdmin ? (
                  <Shield className="w-7 h-7 text-purple-400" />
                ) : (
                  <User className="w-7 h-7 text-[#4ade80]" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-white">
                {isAdmin ? 'Acesso Administrativo' : 'Acesso do Funcionário'}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {isAdmin
                  ? 'Entre com suas credenciais de administrador'
                  : 'Entre com seu e-mail e senha'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-glass">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="input-glass"
                />
              </div>

              <div>
                <label className="label-glass">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-glass pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Entrar'
                )}
              </button>

              <button
                type="button"
                className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors duration-200 py-1"
                onClick={() => {}}
              >
                Esqueci minha senha
              </button>
            </form>
          </div>

          {/* Atalhos de demonstração */}
          <div className="glass-card-darker p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-[#4ade80]" />
              <span className="text-sm font-medium text-slate-300">Acesso rápido para demonstração</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {demoEmployee && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={demoEmployee.avatar}
                      alt={demoEmployee.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate">{demoEmployee.name}</div>
                      <div className="text-xs text-slate-500 truncate">{demoEmployee.role}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mb-2 truncate">{demoEmployee.email}</div>
                  <button
                    onClick={() => fillDemo(demoEmployee)}
                    className="w-full text-xs bg-[#1a7a4a]/30 hover:bg-[#1a7a4a]/50 text-[#4ade80] py-1.5 rounded-lg transition-colors duration-200"
                  >
                    Preencher
                  </button>
                </div>
              )}

              {demoAdmin && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={demoAdmin.avatar}
                      alt={demoAdmin.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate">{demoAdmin.name}</div>
                      <div className="text-xs text-slate-500 truncate">{demoAdmin.role}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mb-2 truncate">{demoAdmin.email}</div>
                  <button
                    onClick={() => fillDemo(demoAdmin)}
                    className="w-full text-xs bg-purple-600/30 hover:bg-purple-600/50 text-purple-400 py-1.5 rounded-lg transition-colors duration-200"
                  >
                    Preencher
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 text-center mt-3">
              Senha de demonstração: <span className="text-slate-300 font-mono">123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
