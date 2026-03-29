import { useState, useEffect } from 'react';
import { useEmpresa } from '../../context/EmpresaContext';
import { updateEmpresa } from '../../services';
import {
  Building2, Save, CheckCircle, AlertCircle,
  Phone, Mail, MapPin, FileText, Globe
} from 'lucide-react';
import { LogoUploader } from './LogoUploader';

export default function Configuracoes() {
  const { empresaAtual, selecionarEmpresa } = useEmpresa();

  const [form, setForm] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    site: '',
    descricao: '',
    logoUrl: '',
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (empresaAtual) {
      setForm({
        nome: empresaAtual.nome || '',
        cnpj: empresaAtual.cnpj || '',
        telefone: empresaAtual.telefone || '',
        email: empresaAtual.email || '',
        endereco: empresaAtual.endereco || '',
        cidade: empresaAtual.cidade || '',
        estado: empresaAtual.estado || '',
        cep: empresaAtual.cep || '',
        site: empresaAtual.site || '',
        descricao: empresaAtual.descricao || '',
        logoUrl: empresaAtual.logoUrl || '',
      });
      if (empresaAtual.logoUrl) setLogoPreview(empresaAtual.logoUrl);
    }
  }, [empresaAtual]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErro('Por favor, selecione um arquivo de imagem.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErro('A imagem deve ter no máximo 2MB.');
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
    setErro('');
  };

  const handleSalvar = async () => {
    if (!empresaAtual?.id) return;
    setSalvando(true);
    setErro('');
    setSucesso(false);
    try {
      let logoUrl = form.logoUrl;

      // Upload do logo se houver novo arquivo
      if (logoFile) {
        // TODO: implement logo upload via backend API
        // const storageRef = ref(storage, `empresas/${empresaAtual.id}/logo`);
        // await uploadBytes(storageRef, logoFile);
        // logoUrl = await getDownloadURL(storageRef);
      }

      await updateEmpresa(empresaAtual.id, { ...form, logoUrl });

      // Recarregar dados da empresa no contexto
      if (selecionarEmpresa) await selecionarEmpresa(empresaAtual.id);

      setSucesso(true);
      setLogoFile(null);
      setTimeout(() => setSucesso(false), 3000);
    } catch (e) {
      console.error(e);
      setErro('Erro ao salvar as configurações. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Configurações do Hotel</h2>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie as informações do seu estabelecimento. Esses dados aparecem nos recibos e documentos gerados pelo sistema.
        </p>
      </div>

      {/* Alertas */}
      {sucesso && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">Configurações salvas com sucesso!</span>
        </div>
      )}
      {erro && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{erro}</span>
        </div>
      )}

      {/* Logo */}
      <LogoUploader logoUrl={form.logoUrl} logoPreview={logoPreview} onFileSelected={handleLogoChange} />

      {/* Dados da Empresa */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Dados do Estabelecimento</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Nome do Hotel / Estabelecimento</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Hotel Paraíso"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">CNPJ</label>
            <input
              name="cnpj"
              value={form.cnpj}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="00.000.000/0001-00"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Telefone / WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contato@hotel.com.br"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Site</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                name="site"
                value={form.site}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="www.hotel.com.br"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Endereço</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Endereço</label>
            <input
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Rua, número, complemento"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Cidade</label>
            <input
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: São Paulo"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
              <input
                name="estado"
                value={form.estado}
                onChange={handleChange}
                maxLength={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="SP"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">CEP</label>
              <input
                name="cep"
                value={form.cep}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00000-000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Descrição / Observações</h3>
        </div>
        <textarea
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          rows={3}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Breve descrição do estabelecimento (aparece nos recibos)"
        />
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end pb-6">
        <button
          onClick={handleSalvar}
          disabled={salvando}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
        >
          <Save className="h-4 w-4" />
          {salvando ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}
