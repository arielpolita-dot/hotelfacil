import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, BedDouble, Mail, Lock, Building2, Phone, User, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { login, criarConta, recuperarSenha, error: authError } = useAuth();
  const [modo, setModo] = useState('login'); // 'login' | 'cadastro' | 'recuperar'
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [form, setForm] = useState({
    email: '',
    senha: '',
    nome: '',
    nomeEmpresa: '',
    cnpj: '',
    telefone: '',
    endereco: '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    setSuccessMsg(null);

    try {
      if (modo === 'login') {
        await login(form.email, form.senha);
      } else if (modo === 'cadastro') {
        if (!form.nome || !form.nomeEmpresa) {
          setLocalError('Preencha todos os campos obrigatórios.');
          setLoading(false);
          return;
        }
        await criarConta(form.email, form.senha, form.nome, {
          nome: form.nomeEmpresa,
          cnpj: form.cnpj,
          telefone: form.telefone,
          endereco: form.endereco,
        });
      } else if (modo === 'recuperar') {
        if (!form.email) {
          setLocalError('Informe seu email para recuperar a senha.');
          setLoading(false);
          return;
        }
        await recuperarSenha(form.email);
        setSuccessMsg(`Email de recuperação enviado para ${form.email}. Verifique sua caixa de entrada (e o spam).`);
        setForm((f) => ({ ...f, email: '' }));
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('email-already-in-use')) {
        setLocalError('Este email já está cadastrado. Clique em "Fazer login" abaixo para entrar.');
      } else if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setLocalError('Email ou senha incorretos. Verifique seus dados e tente novamente.');
      } else if (msg.includes('too-many-requests')) {
        setLocalError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else {
        setLocalError(msg || 'Erro ao processar. Tente novamente.');
      }
    }
    setLoading(false);
  };

  const trocarModo = (novoModo) => {
    setModo(novoModo);
    setLocalError(null);
    setSuccessMsg(null);
    setForm({ email: '', senha: '', nome: '', nomeEmpresa: '', cnpj: '', telefone: '', endereco: '' });
  };

  const erro = localError || authError;

  return (
    <div className="min-h-screen flex">
      {/* ── Painel esquerdo decorativo ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col items-center justify-center p-14 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <BedDouble className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none">Hotel Fácil</h1>
              <p className="text-blue-400 text-xs mt-0.5">Sistema de Gestão Hoteleira</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Gerencie seu hotel<br />com facilidade
          </h2>
          <p className="text-blue-300 text-sm mb-10 leading-relaxed">
            Controle reservas, quartos, finanças e muito mais em um só lugar.
          </p>

          <div className="space-y-3">
            {[
              { icon: '📊', title: 'Dashboard em tempo real', desc: 'Métricas e ocupação atualizadas ao vivo' },
              { icon: '🛏️', title: 'Gestão de quartos', desc: 'Disponibilidade, reservas e check-in/out' },
              { icon: '💰', title: 'Controle financeiro', desc: 'Despesas, faturas e fluxo de caixa' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 backdrop-blur-sm">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold leading-none">{item.title}</p>
                  <p className="text-blue-300 text-xs mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
              <BedDouble className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Hotel Fácil</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

            {/* ── Cabeçalho ── */}
            <div className="mb-7">
              {modo === 'recuperar' && (
                <button
                  type="button"
                  onClick={() => trocarModo('login')}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao login
                </button>
              )}
              <h2 className="text-2xl font-bold text-gray-900">
                {modo === 'login' && 'Bem-vindo de volta!'}
                {modo === 'cadastro' && 'Criar nova conta'}
                {modo === 'recuperar' && 'Recuperar senha'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {modo === 'login' && 'Entre com seu email e senha para continuar'}
                {modo === 'cadastro' && 'Preencha os dados abaixo para começar'}
                {modo === 'recuperar' && 'Informe seu email e enviaremos um link para redefinir sua senha'}
              </p>
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
                <span>{erro}</span>
              </div>
            )}

            {/* Mensagem de sucesso */}
            {successMsg && (
              <div className="mb-5 flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-500" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campos de cadastro */}
              {modo === 'cadastro' && (
                <>
                  <Field label="Nome completo *" icon={<User className="h-4 w-4 text-gray-400" />}>
                    <input type="text" required value={form.nome} onChange={set('nome')} placeholder="Seu nome" className={inputCls} />
                  </Field>
                  <Field label="Nome do hotel / empresa *" icon={<Building2 className="h-4 w-4 text-gray-400" />}>
                    <input type="text" required value={form.nomeEmpresa} onChange={set('nomeEmpresa')} placeholder="Nome do seu hotel" className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="CNPJ" icon={null}>
                      <input type="text" value={form.cnpj} onChange={set('cnpj')} placeholder="00.000.000/0001-00" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                    </Field>
                    <Field label="Telefone" icon={null}>
                      <input type="tel" value={form.telefone} onChange={set('telefone')} placeholder="(00) 00000-0000" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                    </Field>
                  </div>
                  <Field label="Endereço" icon={null}>
                    <input type="text" value={form.endereco} onChange={set('endereco')} placeholder="Endereço completo" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                  </Field>
                </>
              )}

              {/* Email */}
              <Field label="Email" icon={<Mail className="h-4 w-4 text-gray-400" />}>
                <input type="email" required value={form.email} onChange={set('email')} placeholder="seu@email.com" className={inputCls} />
              </Field>

              {/* Senha — oculta na tela de recuperação */}
              {modo !== 'recuperar' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Senha</label>
                    {modo === 'login' && (
                      <button
                        type="button"
                        onClick={() => trocarModo('recuperar')}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium transition"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={form.senha}
                      onChange={set('senha')}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Botão principal */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm transition-all duration-150 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      {modo === 'login' && 'Entrando...'}
                      {modo === 'cadastro' && 'Criando conta...'}
                      {modo === 'recuperar' && 'Enviando email...'}
                    </span>
                  </>
                ) : (
                  <span>
                    {modo === 'login' && 'Entrar no sistema'}
                    {modo === 'cadastro' && 'Criar minha conta'}
                    {modo === 'recuperar' && 'Enviar link de recuperação'}
                  </span>
                )}
              </button>
            </form>

            {/* Rodapé do card */}
            {modo !== 'recuperar' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  {modo === 'login' ? 'Ainda não tem uma conta?' : 'Já possui uma conta?'}{' '}
                  <button
                    onClick={() => trocarModo(modo === 'login' ? 'cadastro' : 'login')}
                    className="text-blue-600 font-semibold hover:text-blue-700 transition"
                  >
                    {modo === 'login' ? 'Criar conta grátis' : 'Fazer login'}
                  </button>
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            © {new Date().getFullYear()} Hotel Fácil · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

function Field({ label, icon, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {icon ? (
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</div>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
