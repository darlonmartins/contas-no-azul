import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, LabelList
} from 'recharts';
import MonthSelector from '../components/dashboard/MonthSelector';
import CategorySelector from '../components/dashboard/CategorySelector';
import dayjs from 'dayjs';
import TrialBanner from '../components/ui/TrialBanner';
import { LayoutDashboard } from "lucide-react";
import {
  BarChart3,
  CreditCard,
  PieChart as PieChartIcon,
  AlertTriangle,
  DollarSign,
  ArrowDown,
  Repeat2,
  Wallet,
  CalendarRange
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [monthFilter, setMonthFilter] = useState(() => dayjs().format('YYYY-MM'));
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchDashboard = async () => {
    try {
      const params = {};
      if (monthFilter) params.month = monthFilter;
      if (categoryFilter) params.category = categoryFilter;

      const response = await api.get('/dashboard', { params });
      console.log("✅ /dashboard response:", response.data);
      setData(response.data);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [monthFilter, categoryFilter]);

  if (!data) return <div className="p-4">Carregando...</div>;

  const {
    summary = {},
    chart = [],
    trend = [],
    alerts = [],
    topCategories = [],
    goals = [],
    accounts = [],
    cards = []
  } = data;

  const meta = summary.totalGoals ?? 0;
  const usado = summary.totalExpenses ?? 0;
  const percentual = meta > 0 ? Math.round((usado / meta) * 100) : 0;

  return (
    <div className="p-6">
      <TrialBanner />

      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-800">
        <LayoutDashboard className="w-6 h-6 text-indigo-600" />
        Dashboard
      </h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <MonthSelector
          value={monthFilter}
          onChange={setMonthFilter}
          className="min-w-[200px]"
        />

        <CategorySelector
          value={categoryFilter}
          onChange={setCategoryFilter}
          categories={categories}
          className="min-w-[200px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Saldo Total</h3>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            R$ {(summary.balance ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-4">
            {Array.isArray(accounts) && accounts.map(account => (
              <div key={account.id} className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full bg-blue-500 mr-2`}></div>
                  <span className="text-sm text-gray-600">{account.name}</span>
                </div>
                <span className="text-sm font-medium">
                  R$ {(account.saldoAtual ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>

              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Gastos do Mês</h3>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            R$ {(usado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-1 text-xs text-gray-500 flex justify-between">
            <span>Meta: R$ {meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span>{percentual}% utilizado</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Cartões de Crédito</h3>
            <CreditCard className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-4">
            {cards.map(card => {
              const usage = (card.used / card.limit) || 0;
              const usagePercent = Math.round(usage * 100);
              return (
                <div key={card.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{card.name}</span>
                    {card.dueDate && (
                      <span className="text-sm text-gray-500">
                        Vence dia {card.dueDate}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      R$ {(card.used ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /
                      R$ {(card.limit ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${usage > 0.8 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                      {usagePercent}% usado
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full">
                    <div
                      className={`h-1.5 rounded-full ${usage > 0.8 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${usagePercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            Alertas Inteligentes
          </h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-3 border-l-4 ${alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                alert.type === 'danger' ? 'border-red-500 bg-red-50' :
                  'border-blue-500 bg-blue-50'
                } ${index > 0 ? 'border-t border-gray-200' : ''}`}>
                <p className={`text-sm ${alert.type === 'warning' ? 'text-yellow-700' :
                  alert.type === 'danger' ? 'text-red-700' :
                    'text-blue-700'
                  }`}>
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔹 BLOCO 1: Barras visuais das categorias */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Categorias que Mais Consomem</h3>
          <PieChartIcon className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="space-y-4">
          {topCategories.map((cat, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: cat.color }}></div>
              <span className="text-sm text-gray-600 flex-1">{cat.name}</span>
              <span className="text-sm font-medium text-gray-700 mr-3">
                R$ {(cat.value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 ml-2">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </div>


      {/* 🔹 BLOCO 2: Gráfico de Pizza colorido */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-2">Distribuição das Despesas por Categoria</h3>
        <p className="text-sm text-gray-500 mb-4">
          Veja a participação de cada categoria nas suas despesas totais.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={topCategories}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              label={({ name, value, percentage }) =>
                `${name}: R$ ${value.toFixed(2)} (${percentage}%)`
              }
              labelLine={false}
            >
              {topCategories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) =>
                `R$ ${Number(value).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}`
              }
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>



      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-4">Gastos Mensais com Cartões</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.cardSummaryChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="mes"
              tickFormatter={(value) => {
                const [ano, mes] = value.split("-");
                return new Date(ano, mes - 1).toLocaleDateString("pt-BR", {
                  month: "short",
                  year: "numeric",
                });
              }}
            />
            <YAxis />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload[0]) return null;
                const { cardDetails } = payload[0].payload;

                return (
                  <div className="bg-white p-3 shadow rounded border text-sm">
                    <p className="font-semibold text-gray-800 mb-2">
                      {new Date(label + "-01").toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    {cardDetails?.map((entry, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-gray-600">{entry.name}</span>
                        <span className="font-medium">
                          R$ {Number(entry.value).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend />
            <Bar dataKey="total" fill="#8b5cf6" name="Total gasto com cartões">
              <LabelList
                dataKey="total"
                position="top"
                formatter={(value) =>
                  `R$ ${Number(value).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-4">Resumo por Tipo de Transação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">

          <div className="border p-3 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="text-green-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-600">Ganhos</p>
              <p className="text-green-600 font-bold text-lg">
                R$ {(summary.income ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="border p-3 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <ArrowDown className="text-red-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-600">Despesas</p>
              <p className="text-red-600 font-bold text-lg">
                R$ {(summary.expense ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="border p-3 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <CreditCard className="text-purple-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-600">Cartão</p>
              <p className="text-purple-600 font-bold text-lg">
                R$ {(summary.despesa_cartao ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="border p-3 rounded-lg flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Repeat2 className="text-blue-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-600">Transferências</p>
              <p className="text-blue-600 font-bold text-lg">
                R$ {(summary.transfer ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-1">Receitas vs Despesas por Mês</h3>
        <p className="text-sm text-gray-500 mb-3">
          Compare o total de receitas e despesas registradas em cada mês.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data.incomeExpenseTrend}
            margin={{ top: 40, right: 20, bottom: 20, left: 20 }} // ⬅️ aumentou top de 20 para 40
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="mes"
              padding={{ left: 20, right: 20 }}
              tickFormatter={(value) => {
                const [ano, mes] = value.split("-");
                return new Date(ano, mes - 1).toLocaleDateString("pt-BR", {
                  month: "short",
                  year: "numeric",
                });
              }}
            />
            <YAxis
              tickFormatter={(value) =>
                `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`
              }
            />
            <Tooltip
              formatter={(value) =>
                `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              }
            />
            <Legend />
            <Bar dataKey="receitas" fill="#22c55e" name="Receitas">
              <LabelList
                dataKey="receitas"
                position="top"
                formatter={(value) =>
                  `R$ ${Number(value).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                }
              />
            </Bar>
            <Bar dataKey="despesas" fill="#ef4444" name="Despesas">
              <LabelList
                dataKey="despesas"
                position="top"
                formatter={(value) =>
                  `R$ ${Number(value).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 BLOCO: Progresso das Metas Mensais */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Progresso das Metas Mensais</h3>
          <CalendarRange className="h-5 w-5 text-purple-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.monthlyGoals?.length > 0 ? (
            data.monthlyGoals.map((goal) => {
              const percent = Math.min(Math.round(goal.percentageUsed || 0), 999);
              const used = goal.usedAmount ?? 0;
              const barColor =
                percent > 100 ? 'bg-red-500'
                  : percent > 80 ? 'bg-yellow-500'
                    : 'bg-green-500';

              return (
                <div key={goal.id} className="border p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800">{goal.Category?.name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(goal.month + '-01').toLocaleDateString('pt-BR', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    Meta: R$ {goal.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="h-2 bg-gray-200 rounded-full mb-1">
                    <div
                      className={`h-2 rounded-full ${barColor}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Usado: R$ {used.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span>{percent}%</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">Nenhuma meta mensal cadastrada para o mês.</p>
          )}
        </div>
      </div>


      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-4">Metas vs Despesas por Categoria</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chart} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" />
            <YAxis
              tickFormatter={(value) =>
                `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`
              }
            />
            <Tooltip
              formatter={(value) =>
                `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              }
            />
            <Legend />
            <Bar dataKey="metas" fill="#22c55e" name="Metas">
              <LabelList
                dataKey="metas"
                position="top"
                formatter={(value) =>
                  `R$ ${Number(value).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                }
              />
            </Bar>
            <Bar dataKey="despesas" fill="#ef4444" name="Despesas">
              <LabelList
                dataKey="despesas"
                position="top"
                formatter={(value) =>
                  `R$ ${Number(value).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>




      <div className="bg-white p-4 rounded shadow mb-8">
        <h3 className="text-xl font-bold mb-1">Evolução do Saldo Total nas Contas</h3>
        <p className="text-sm text-gray-500 mb-3">
          Visualize o saldo final acumulado de todas as suas contas ao fim de cada mês.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data.monthlyBalanceTrend}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="mes"
              padding={{ left: 20, right: 20 }}
              tick={{ dy: 14 }} // ⬅️ desloca o texto do mês para baixo
              tickFormatter={(value) => {
                const [ano, mes] = value.split("-");
                return new Date(ano, mes - 1).toLocaleDateString("pt-BR", {
                  month: "short",
                  year: "numeric",
                });
              }}
            />

            <YAxis
              domain={['auto', 'auto']} // ✅ mantém negativo + zero
              tickFormatter={(value) =>
                `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
              }
            />
            <Tooltip
              formatter={(value) =>
                `R$ ${Number(value).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}`
              }
              labelFormatter={(label) => {
                const [ano, mes] = label.split("-");
                return new Date(ano, mes - 1).toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                });
              }}
            />
            <Line
              type="monotone"
              dataKey="saldo"
              stroke="#10b981"
              name="Saldo Total"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>


      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Objetivos Financeiros</h3>
          <Wallet className="h-5 w-5 text-blue-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((goal, index) => {
            const percentage = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(0);
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            const status = isCompleted ? 'Concluído' : 'Em andamento';
            const statusClass = isCompleted
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800';

            const barClass = isCompleted ? 'bg-green-500' : 'bg-blue-500';

            return (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{goal.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass}`}>{status}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>R$ {(goal.currentAmount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span>de R$ {(goal.targetAmount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className={`h-2 rounded-full ${barClass}`} style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="mt-1 text-xs text-gray-500 text-right">{percentage}% concluído</div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
