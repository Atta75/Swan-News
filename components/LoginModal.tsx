
import React, { useState } from 'react';

interface LoginModalProps {
  onLogin: (password: string) => boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (!success) {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 border-t-8 border-brand-red">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="flex gap-0.5">
              {['S', 'W', 'A', 'N'].map((char, i) => (
                <div key={i} className="w-10 h-10 bg-brand-red flex items-center justify-center">
                  <span className="text-white font-black text-xl leading-none pt-0.5">{char}</span>
                </div>
              ))}
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-2 font-urdu">ایڈمن لاگ ان</h2>
          <p className="text-center text-gray-500 dark:text-zinc-400 text-sm mb-8 font-urdu tracking-tight">انتظامی پینل تک رسائی کے لیے پاس ورڈ درج کریں</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 font-urdu">پاس ورڈ</label>
              <input 
                type="password" 
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={`w-full p-4 bg-gray-50 dark:bg-zinc-800 border-2 rounded-xl text-gray-900 dark:text-white transition-all outline-none ${error ? 'border-brand-red' : 'border-transparent focus:border-brand-red'}`}
                placeholder="••••••••"
              />
              {error && <p className="mt-2 text-brand-red text-xs font-bold font-urdu">غلط پاس ورڈ۔ دوبارہ کوشش کریں۔</p>}
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-brand-red text-white font-black uppercase tracking-widest hover:bg-brand-darkRed transition-all rounded-xl shadow-lg shadow-brand-red/20 font-urdu"
            >
              لاگ ان
            </button>
          </form>

          <button 
            onClick={onClose}
            className="w-full mt-4 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold transition-all font-urdu"
          >
            منسوخ کریں
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
