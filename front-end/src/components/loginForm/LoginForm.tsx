import { useState } from "react";
import { loginUser } from "../../api/auth";
import { useTranslation } from 'react-i18next';
import LanguageModifier from "../LanguageModifier";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface LoginFormProps {
  onLogin: (token: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginUser({ username, password });
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("access_token", data.access);
      sessionStorage.setItem("refresh_token", data.refresh);
      onLogin(data.access);
      
      toast.success(t("login.success"));
    } catch (err: any) {
      console.error(err.response?.data || err);
      toast.error(t("login.error"));
    }
  };

  return (
    <div>
      <LanguageModifier/>
      <h1 className='text-2xl font-bold text-center bg-gray-900 text-white p-10'>
        {t("header.title")}
      </h1>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
            {t("login.title")}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-gray-700 p-8 rounded-xl"
          >
            <div>
              <label htmlFor="username" className="block text-sm/6 font-medium text-gray-100">
                {t("form.username")}
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="username"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-100"
                >
                  {t("form.password")}
                </label>
                <div className="text-sm">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info(t("form.forgotPasswordNotImplemented"));
                    }}
                    className="font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    {t("form.forgotPassword")}
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                {t("form.signIn")}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-400">
            {t("form.noAccount")}{' '}
            <a href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
              {t("form.createHere")}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
