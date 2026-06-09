import { useState } from 'react'
import { Clock, Eye, EyeOff, Shield, ArrowLeft, User } from 'lucide-react'
import type { Employee } from '../types'
import { authService } from '../services/authService'

interface LoginPageProps {
  employees: Employee[]
  onLoginSuccess: (employee: Employee, fromApi?: boolean) => void
  onBack: () => void
}

export default function LoginPage({ employees, onLoginSuccess, onBack }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Tenta login via API primeiro
    try {
      const { employee } = await authService.login(email.trim(), password)
      onLoginSuccess(employee, true)
      return
    } catch {
      // API indisponível ou credenciais inválidas na API — tenta modo local
    }

    // Fallback: validação local (demo)
    const found = employees.find(
      (emp) => emp.email.toLowerCase() === email.toLowerCase().trim() && emp.status
    )

    if (!found || password !== '123456') {
      setError('E-mail ou senha inválidos. Verifique suas credenciais.')
      setLoading(false)
      return
    }

    setLoading(false)
    onLoginSuccess(found, false)
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

        </div>
      </div>
    </div>
  )
}
