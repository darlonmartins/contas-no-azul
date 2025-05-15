import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTrial } from '../context/TrialContext';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { registerPayment, daysLeft, status } = useTrial();
  
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (paymentMethod === 'credit_card' && (!cardNumber || !cardName || !cardExpiry || !cardCvv)) {
      setError('Por favor, preencha todos os campos do cartão');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const paymentData = {
        paymentMethod,
        paymentReference: paymentMethod === 'credit_card' 
          ? `${cardNumber.slice(-4)}` 
          : `PIX-${Date.now()}`
      };
      
      const success = await registerPayment(paymentData);
      
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setError('Erro ao processar pagamento. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Pagamento Confirmado!</h2>
          <p className="text-gray-600 mt-2">
            Seu pagamento foi processado com sucesso. Você agora tem acesso completo ao sistema.
          </p>
          <Link 
            to="/dashboard"
            className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Ir para o Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <Link 
        to="/dashboard" 
        className="flex items-center text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
      </Link>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Assinar Sistema</h2>
        <p className="text-gray-600 mt-2">
          {status === 'expired' 
            ? 'Seu período de avaliação expirou. Assine agora para continuar usando o sistema.'
            : `Você tem ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'} restantes no seu período de avaliação.`}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <h3 className="font-semibold text-blue-800">Contas no Azul Premium</h3>
        <p className="text-blue-700 text-sm mt-1">Acesso a todas as funcionalidades por apenas R$ 19,90/mês</p>
        <ul className="text-sm text-blue-700 mt-2">
          <li className="flex items-center mt-1">
            <CheckCircle className="w-4 h-4 mr-2" /> Dashboard completo
          </li>
          <li className="flex items-center mt-1">
            <CheckCircle className="w-4 h-4 mr-2" /> Alertas inteligentes
          </li>
          <li className="flex items-center mt-1">
            <CheckCircle className="w-4 h-4 mr-2" /> Relatórios automáticos
          </li>
          <li className="flex items-center mt-1">
            <CheckCircle className="w-4 h-4 mr-2" /> Recursos avançados
          </li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Método de Pagamento
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="credit_card"
                checked={paymentMethod === 'credit_card'}
                onChange={() => setPaymentMethod('credit_card')}
                className="mr-2"
              />
              <span>Cartão de Crédito</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="pix"
                checked={paymentMethod === 'pix'}
                onChange={() => setPaymentMethod('pix')}
                className="mr-2"
              />
              <span>PIX</span>
            </label>
          </div>
        </div>

        {paymentMethod === 'credit_card' ? (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Número do Cartão
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="0000 0000 0000 0000"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nome no Cartão
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Nome como aparece no cartão"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex space-x-4 mb-4">
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Data de Validade
                </label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/AA"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="123"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="mb-4 p-4 border border-gray-200 rounded-md">
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-2">Escaneie o QR Code abaixo:</p>
              <div className="bg-gray-200 w-48 h-48 mx-auto flex items-center justify-center">
                <span className="text-gray-500">QR Code PIX</span>
              </div>
              <p className="text-sm text-gray-700 mt-2">Ou use a chave PIX:</p>
              <p className="font-mono bg-gray-100 p-2 rounded mt-1">controlefinanceiro@exemplo.com</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center py-2 px-4 rounded-md transition duration-200 ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {loading ? (
            'Processando...'
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Confirmar Pagamento
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Seus dados de pagamento estão seguros. Utilizamos criptografia de ponta a ponta.
      </p>
    </div>
  );
};

export default PaymentPage;
