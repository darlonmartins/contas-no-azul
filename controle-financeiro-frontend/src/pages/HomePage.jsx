import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  BellRing,
  Target,
  Home,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white px-8 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <LayoutDashboard className="w-6 h-6" />
          Contas no Azul
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/" className="flex items-center gap-1 hover:underline">
            <Home className="w-4 h-4" /> Início
          </Link>
          <Link to="/register" className="flex items-center gap-1 hover:underline">
            <UserPlus className="w-4 h-4" /> Registrar
          </Link>
          <Link to="/login">
            <button className="bg-white text-blue-600 px-4 py-1.5 rounded font-semibold flex items-center gap-1 hover:bg-gray-100">
              <LogIn className="w-4 h-4" /> Entrar
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto my-6 px-6">
        {/* Título e subtítulo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Controle Financeiro</h1>
          <p className="text-gray-600 text-lg mt-2">
            Sistema completo para gerenciamento de suas finanças pessoais
          </p>
        </div>

        {/* Dashboard Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-4 shadow-md">
            <h3 className="font-semibold text-lg mb-2">Saldo Total</h3>
            <p className="text-2xl font-bold mb-2">R$ 24.501,25</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="text-blue-600 font-bold">●</span> Conta Corrente</p>
              <p><span className="text-green-600 font-bold">●</span> Poupança</p>
              <p><span className="text-purple-600 font-bold">●</span> Investimentos</p>
            </div>
          </Card>

          <Card className="p-4 shadow-md">
            <h3 className="font-semibold text-lg mb-2">Gastos do Mês</h3>
            <p className="text-2xl font-bold mb-2">R$ 4.500,00</p>
            <p className="text-sm text-red-500">+12% em relação ao mês anterior</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Meta: R$ 6.000,00 • 75% utilizado</p>
          </Card>

          <Card className="p-4 shadow-md">
            <h3 className="font-semibold text-lg mb-2">Cartões de Crédito</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Nubank</span>
                  <span>R$ 2.350,75 / R$ 5.000,00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '47%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Vence dia 15 • 47% usado</p>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Itaú</span>
                  <span>R$ 6.800,00 / R$ 8.000,00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Vence dia 10 • 85% usado</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Alertas */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Alertas Inteligentes</h2>
          <Card className="p-4 shadow-md space-y-2 text-sm">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">• Fatura do cartão Itaú próxima do limite (85%)</div>
            <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded">• Débito automático da Netflix programado para amanhã</div>
            <div className="bg-red-100 border-l-4 border-red-500 p-3 rounded">• Gasto acima da média em Alimentação esta semana</div>
          </Card>
        </section>

        {/* Categorias */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Categorias que Mais Consomem</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { name: 'Alimentação', amount: 'R$ 1.250,00', percentage: 28, color: 'bg-red-500' },
              { name: 'Moradia', amount: 'R$ 1.800,00', percentage: 40, color: 'bg-blue-500' },
              { name: 'Transporte', amount: 'R$ 450,00', percentage: 10, color: 'bg-green-500' },
              { name: 'Lazer', amount: 'R$ 550,00', percentage: 12, color: 'bg-yellow-500' },
              { name: 'Compras Impulsivas', amount: 'R$ 450,00', percentage: 10, color: 'bg-pink-500' },
            ].map((item, index) => (
              <Card key={index} className="p-4 shadow-md text-sm">
                <div className="font-medium mb-1">{item.name}</div>
                <div className="text-gray-700 font-bold">{item.amount}</div>
                <div className="mt-2 bg-gray-200 h-2 rounded-full">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.percentage}%</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Funcionalidades */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Funcionalidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-4 shadow-md">
              <div className="flex items-center mb-2">
                <LayoutDashboard className="text-blue-500 w-5 h-5 mr-2" />
                <h3 className="font-semibold">Dashboard Completo</h3>
              </div>
              <p className="text-sm">Visualize todos os seus dados financeiros em um só lugar, com gráficos e indicadores claros.</p>
            </Card>
            <Card className="p-4 shadow-md">
              <div className="flex items-center mb-2">
                <BellRing className="text-yellow-500 w-5 h-5 mr-2" />
                <h3 className="font-semibold">Alertas Inteligentes</h3>
              </div>
              <p className="text-sm">Receba alertas sobre gastos acima da média, faturas próximas do limite e mais.</p>
            </Card>
            <Card className="p-4 shadow-md">
              <div className="flex items-center mb-2">
                <CreditCard className="text-purple-500 w-5 h-5 mr-2" />
                <h3 className="font-semibold">Gestão de Cartões</h3>
              </div>
              <p className="text-sm">Controle seus cartões de crédito, limites, faturas e parcelas em um só lugar.</p>
            </Card>
            <Card className="p-4 shadow-md">
              <div className="flex items-center mb-2">
                <Target className="text-green-500 w-5 h-5 mr-2" />
                <h3 className="font-semibold">Obejtivos Financeiros</h3>
              </div>
              <p className="text-sm">Defina metas de economia e acompanhe seu progresso de forma visual.</p>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-50 rounded-lg p-8 text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Comece a controlar suas finanças hoje!</h2>
          <p className="mb-4">7 dias de avaliação gratuita, sem compromisso.</p>
          <Link to="/register" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 inline-block">
            Criar Conta Gratuita
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm px-6">
          <div>
            <h4 className="font-semibold mb-2">Controle Financeiro</h4>
            <p>Sistema completo para gerenciamento de suas finanças pessoais, com dashboard, controle de cartões, alertas inteligentes e muito mais.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Links Rápidos</h4>
            <ul className="space-y-1">
              <li><Link to="/" className="hover:underline">Início</Link></li>
              <li><Link to="/register" className="hover:underline">Criar Conta</Link></li>
              <li><Link to="/login" className="hover:underline">Entrar</Link></li>
              <li><Link to="/precos" className="hover:underline">Planos e Preços</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Contato</h4>
            <p>Email: contato@controlefinanceiro.com.br</p>
            <p>Telefone: (11) 99999-9999</p>
            <div className="flex gap-2 mt-2 text-lg">
              <span>📘</span><span>🐦</span><span>📸</span>
            </div>
          </div>
        </div>
        <div className="container mx-auto mt-8 pt-4 border-t border-gray-700 text-center text-xs text-gray-400">
          © 2025 Controle Financeiro. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
