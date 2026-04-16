import { useState } from "react";
import { registerUser } from "../../api/auth";
import { useTranslation } from 'react-i18next';
import LanguageModifier from "../../components/LanguageModifier";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginUser } from "../../api/auth";


export default function Register() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser({ username, email, password, password2 });
      toast.success(t("register.success"));
      const data = await loginUser({ username, password });
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("access_token", data.access);
      sessionStorage.setItem("refresh_token", data.refresh);
      
      window.location.href = "/";

    } catch (err: any) {
      const errors = err.response?.data;
      if (errors) {
        const messages = Object.values(errors).flat();
        const firstMessage = String(messages[0]);
        toast.error(firstMessage);
      } else {
        toast.error(t("register.error"));
      }
    }
  };

  return (
    <div className="bg-gray-900 h-screen">
      <LanguageModifier/>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
            {t("register.title")}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-gray-700 p-8 rounded-xl"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-100"
              >
                {t("register.email")}
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm/6 font-medium text-gray-100"
              >
                {t("register.username")}
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
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
                  {t("register.password")}
                </label>
                
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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password2"
                  className="block text-sm/6 font-medium text-gray-100"
                >
                  {t("register.password2")}
                </label>
                
              </div>
              <div className="mt-2">
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password2}
                  onChange={e => setPassword2(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                {t("register.submit")}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-400">
            {t("register.alreadyAccount")}{" "}
            <a
              href="/"
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              {t("register.loginHere")}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
