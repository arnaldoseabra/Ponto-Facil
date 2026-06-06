import { MapPin, Clock, AlertTriangle, BarChart3, CheckCircle, Zap, Shield, Bell } from 'lucide-react'

interface LandingPageProps {
  onLogin: () => void
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1a7a4a] flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Ponto <span className="text-[#4ade80]">Fácil</span>
            </span>
          </div>
          <button
            onClick={onLogin}
            className="btn-primary py-2 px-5 text-sm"
          >
            Entrar na Plataforma
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#1a7a4a]/20 border border-[#1a7a4a]/40 rounded-full px-4 py-1.5 text-sm text-[#4ade80] mb-6">
                <Zap className="w-4 h-4" />
                100% conforme CLT
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Controle de ponto inteligente baseado em{' '}
                <span className="text-[#4ade80]">GPS</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Registre, monitore e gerencie a jornada de trabalho da sua equipe com
                precisão GPS, cálculo automático de horas extras e alertas de conformidade
                CLT em tempo real.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <button onClick={onLogin} className="btn-primary text-base">
                  Começar agora
                </button>
                <button
                  onClick={onLogin}
                  className="btn-secondary text-base"
                >
                  Ver demonstração
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: '100%', label: 'Conformidade CLT' },
                  { value: '99.8%', label: 'Precisão GPS' },
                  { value: 'Real-time', label: 'Alertas WhatsApp' },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card-darker p-4 text-center">
                    <div className="text-2xl font-bold text-[#4ade80]">{stat.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* App Mockup */}
            <div className="relative">
              <div className="glass-card p-6 max-w-sm mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <img
                    src="https://i.pravatar.cc/40?u=joao@pontofacil.com"
                    alt="João"
                    className="w-10 h-10 rounded-full border-2 border-[#1a7a4a]"
                  />
                  <div>
                    <div className="font-semibold text-white text-sm">Bom dia, João!</div>
                    <div className="text-xs text-slate-400">Desenvolvedor Frontend</div>
                  </div>
                </div>

                <div className="bg-[#1a7a4a]/20 border border-[#1a7a4a]/40 rounded-xl p-4 text-center mb-6">
                  <div className="text-3xl font-mono font-bold text-[#4ade80]">08:47:23</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Av. Paulista, 1000 — São Paulo
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Entrada', done: true },
                    { label: 'Início Almoço', done: false },
                    { label: 'Retorno Almoço', done: false },
                    { label: 'Saída', done: false },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200 ${
                        btn.done
                          ? 'bg-[#1a7a4a] text-white'
                          : 'bg-white/10 text-slate-400 cursor-default'
                      }`}
                    >
                      {btn.done && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floating alert */}
              <div className="absolute -bottom-4 -right-4 glass-card p-3 max-w-48 hidden lg:block">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#4ade80]" />
                  <span className="text-xs text-white">Ponto registrado com sucesso!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Tudo que você precisa em uma plataforma
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Do registro de ponto ao relatório gerencial — automatizado, preciso e conforme a lei.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <MapPin className="w-6 h-6" />,
                title: 'Registro por GPS',
                description:
                  'Validação automática da localização com geofencing. Registre apenas dentro da área permitida.',
                color: 'text-emerald-400',
                bg: 'bg-emerald-400/10',
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: 'Cálculo Automático',
                description:
                  'Horas trabalhadas, extras e saldo calculados automaticamente em tempo real.',
                color: 'text-blue-400',
                bg: 'bg-blue-400/10',
              },
              {
                icon: <AlertTriangle className="w-6 h-6" />,
                title: 'Alertas CLT',
                description:
                  'Monitoramento contínuo de conformidade trabalhista com alertas visuais e via WhatsApp.',
                color: 'text-yellow-400',
                bg: 'bg-yellow-400/10',
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: 'Relatórios Inteligentes',
                description:
                  'Dashboards gerenciais, rankings, espelhos de ponto e exportação em PDF/Excel.',
                color: 'text-purple-400',
                bg: 'bg-purple-400/10',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass-card p-6 hover:bg-white/15 transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Por que escolher o <span className="text-[#4ade80]">Ponto Fácil</span>?
              </h2>
              <div className="space-y-4">
                {[
                  'Registro de ponto em menos de 2 segundos',
                  'Conformidade automática com a CLT',
                  'Notificações via WhatsApp em tempo real',
                  'Relatórios completos com exportação PDF/Excel',
                  'Dashboard gerencial com rankings e métricas',
                  'Convênios e benefícios para colaboradores',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#1a7a4a] flex items-center justify-center shrink-0">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '70%', label: 'Redução no tempo de apuração da folha' },
                { value: '2s', label: 'Tempo médio de registro de ponto' },
                { value: 'Zero', label: 'Erros manuais de cálculo de horas' },
                { value: '24/7', label: 'Monitoramento de conformidade CLT' },
              ].map((metric) => (
                <div key={metric.label} className="glass-card p-6 text-center">
                  <div className="text-3xl font-bold text-[#4ade80] mb-2">{metric.value}</div>
                  <div className="text-sm text-slate-400 leading-snug">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-12">
            <Shield className="w-12 h-12 text-[#4ade80] mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para modernizar seu controle de ponto?
            </h2>
            <p className="text-slate-400 mb-8">
              Acesse a demonstração gratuita e veja como o Ponto Fácil pode transformar a gestão
              de jornada da sua empresa.
            </p>
            <button onClick={onLogin} className="btn-primary text-base px-8">
              Acessar demonstração gratuita
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1a7a4a] flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Ponto Fácil</span>
            <span className="text-slate-500 text-sm">v1.0.0</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <button className="hover:text-white transition-colors">Privacidade</button>
            <button className="hover:text-white transition-colors">Termos de Uso</button>
            <span>CNPJ: 00.320.122/0001-90</span>
          </div>
          <div className="text-sm text-slate-500">
            © 2026 Ponto Fácil. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
