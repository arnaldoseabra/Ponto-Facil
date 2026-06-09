import { useState } from 'react'
import { Clock, Eye, EyeOff, ArrowLeft, Check, Building2, Users } from 'lucide-react'
import type { Employee, Plan } from '../types'
import { companyService } from '../services/companyService'

interface RegisterPageProps {
  onSuccess: (employee: Employee) => void
  onBack: () => void
}

const PLANS: { id: Plan; name: string; price: string; maxEmployees: string; features: string[]; highlight?: boolean }[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'Grátis',
    maxEmployees: 'até 2 funcionários',
    features: ['Registro de ponto GPS', 'Espelho de horas', 'Alertas CLT', 'Suporte por e-mail'],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 'R$ 39,90/mês',
    maxEmployees: 'até 10 funcionários',
    features: ['Tudo do Free', 'Rankings e relatórios', 'Convênios e benefícios', 'Aniversariantes'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 99,90/mês',
    maxEmployees: 'até 50 funcionários',
    features: ['Tudo do Basic', 'Notificações WhatsApp', 'Exportação PDF/Excel', 'Suporte prioritário'],
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'R$ 299,90/mês',
    maxEmployees: 'Ilimitado',
    features: ['Tudo do Premium', 'Funcionários ilimitados', 'API de integração', 'Suporte dedicado'],
  },
]

export default function RegisterPage({ onSuccess, onBack }: RegisterPageProps) {
  const [step, setStep] = useState<'plan' | 'form'>('plan')
  const [selectedPlan, setSelectedPlan] = useState<Plan>('basic')

  const [companyName, setCompanyName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { employee } = await companyService.register({
        company_name:  companyName,
        cnpj:          cnpj || undefined,
        company_email: companyEmail,
        phone:         phone || undefined,
        plan:          selectedPlan,
        admin_name:    adminName,
        admin_email:   adminEmail,
        password,
      })
      onSuccess(employee)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1a7a4a] flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Ponto <span className="text-[#4ade80]">Fácil</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className={step === 'plan' ? 'text-white font-medium' : ''}>1. Plano</span>
            <span>→</span>
            <span className={step === 'form' ? 'text-white font-medium' : ''}>2. Cadastro</span>
          </div>
        </div>
      </header>

      <div className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">

          {/* STEP 1: Seleção de plano */}
          {step === 'plan' && (
            <div className="animate-fade-in">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">Escolha seu plano</h1>
                <p className="text-slate-400">Comece grátis. Faça upgrade quando precisar.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`glass-card p-5 text-left transition-all duration-200 hover:scale-[1.02] relative ${
                      selectedPlan === plan.id
                        ? 'border-[#1a7a4a] bg-[#1a7a4a]/20 ring-1 ring-[#1a7a4a]'
                        : 'hover:bg-white/15'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a7a4a] text-white text-xs px-3 py-1 rounded-full font-medium">
                        Mais popular
                      </div>
                    )}

                    <div className="mb-3">
                      <div className="font-bold text-white text-lg">{plan.name}</div>
                      <div className="text-[#4ade80] font-semibold">{plan.price}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {plan.maxEmployees}
                      </div>
                    </div>

                    <ul className="space-y-1.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-3 h-3 text-[#4ade80] shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {selectedPlan === plan.id && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-[#4ade80] font-medium">
                        <Check className="w-3 h-3" />
                        Selecionado
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <button onClick={() => setStep('form')} className="btn-primary px-10">
                  Continuar com plano {PLANS.find(p => p.id === selectedPlan)?.name}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Formulário */}
          {step === 'form' && (
            <div className="animate-fade-in max-w-xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Criar sua conta</h1>
                <p className="text-slate-400">
                  Plano selecionado:{' '}
                  <span className="text-[#4ade80] font-semibold">
                    {PLANS.find(p => p.id === selectedPlan)?.name} — {PLANS.find(p => p.id === selectedPlan)?.price}
                  </span>
                  {' '}·{' '}
                  <button onClick={() => setStep('plan')} className="text-slate-400 underline text-sm hover:text-white">
                    alterar
                  </button>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
                {/* Empresa */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-[#4ade80]" />
                    <span className="text-sm font-semibold text-[#4ade80] uppercase tracking-wide">Dados da empresa</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="label-glass">Nome da empresa *</label>
                      <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="input-glass" placeholder="Minha Empresa Ltda" />
                    </div>
                    <div>
                      <label className="label-glass">CNPJ</label>
                      <input type="text" value={cnpj} onChange={e => setCnpj(e.target.value)} className="input-glass" placeholder="00.000.000/0001-00" />
                    </div>
                    <div>
                      <label className="label-glass">Telefone</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-glass" placeholder="(11) 99999-9999" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label-glass">E-mail da empresa *</label>
                      <input type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} required className="input-glass" placeholder="contato@empresa.com" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10" />

                {/* Admin */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-[#4ade80]" />
                    <span className="text-sm font-semibold text-[#4ade80] uppercase tracking-wide">Conta do administrador</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="label-glass">Seu nome *</label>
                      <input type="text" value={adminName} onChange={e => setAdminName(e.target.value)} required className="input-glass" placeholder="João Silva" />
                    </div>
                    <div>
                      <label className="label-glass">E-mail de acesso *</label>
                      <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required className="input-glass" placeholder="joao@empresa.com" />
                    </div>
                    <div>
                      <label className="label-glass">Senha *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="input-glass pr-10"
                          placeholder="Mínimo 6 caracteres"
                        />
                        <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Criar conta gratuitamente'}
                </button>

                <p className="text-xs text-slate-500 text-center">
                  Ao criar sua conta você concorda com os Termos de Uso e a Política de Privacidade.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
