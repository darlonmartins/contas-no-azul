import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Settings = () => {
  const [frequency, setFrequency] = useState('mensal');
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/api/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.notificationFrequency) {
        setFrequency(res.data.notificationFrequency);
      }
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:3001/api/settings',
        { notificationFrequency: frequency },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Frequência atualizada com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar frequência:', err);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/goals/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'metas.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erro ao exportar metas:', err);
      alert('Erro ao exportar PDF');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Configurações</h1>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block">Frequência de Notificações</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="diaria">Diária</option>
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
            <option value="nenhuma">Nenhuma</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Atualizar
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Exportar Metas</h2>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Exportando...' : 'Exportar PDF'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
