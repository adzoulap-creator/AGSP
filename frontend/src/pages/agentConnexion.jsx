import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connexionAgent } from "../services/api";
import { Link } from "react-router-dom";
import logoAgsp from "../assets/logo.png";

function AgentConnexion() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const soumettre = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);

    try {
      const data = await connexionAgent(username, password);

      localStorage.setItem("agentToken", data.token);
      localStorage.setItem("agentNom", data.nom);

      navigate("/agent/tableau-de-bord");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef8f8] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-[30px] bg-white shadow-2xl md:h-[600px]">
        <div className="grid min-h-[600px] md:grid-cols-2">

          <div className="relative flex items-center justify-center overflow-hidden px-8 py-12 text-center text-white md:rounded-r-[150px]"
              style={{
                  background: "linear-gradient(to bottom right, rgba(5, 128, 68, 0.9), rgba(13, 128, 68, 0.9), rgba(5, 128, 68, 0.9))"
              }}>

            <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-black/10"></div>

            <div className="relative z-10">
              
              <img
                  src={logoAgsp}
                  alt="Sceau AGSP - République du Congo"
                  className="w-64 h-64 mx-auto animate-[float_2s_ease-in-out_infinite]"
              />
              <style>{`
                  @keyframes float {
                      0%, 100% { transform: translateY(0); }
                      50% { transform: translateY(-20px); }
                  }
              `}</style>

              <h2 className="mb-3 text-3xl font-bold">
                Bienvenue !
              </h2>

              <p className="mx-auto mb-8 max-w-xs text-sm leading-6 text-white/85">
                Accédez à votre espace agent pour gérer les rendez-vous et les
                services publics numériques.
              </p>

              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                  République du Congo
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/70">
                  Service Public Numérique
                </p>
              </div>

              <button
                type="button"
                className="rounded-full border border-white px-8 py-2 text-sm font-semibold transition hover:bg-white hover:text-[#087782]"
              >
                <Link to="/">
                    Espace Citoyens
                </Link>
                
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center bg-white px-6 py-10 sm:px-12">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center md:text-left">
                <h1 className="text-3xl font-bold text-[#14201c]">
                  Connexion
                </h1>

                <p className="mt-2 text-sm text-[#7b847f]">
                  Connectez-vous à votre espace agent
                </p>
              </div>

              <form
                onSubmit={soumettre}
                className="flex flex-col gap-5"
              >
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-medium text-[#5b6b62]"
                  >
                    Identifiant
                  </label>

                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Votre identifiant"
                    className="w-full rounded-md border border-[#e4e7e5] bg-[#f7f8f8] px-4 py-3 text-sm text-[#14201c] outline-none transition focus:border-[#08aeb7] focus:bg-white focus:ring-2 focus:ring-[#08aeb7]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-[#5b6b62]"
                  >
                    Mot de passe
                  </label>

                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full rounded-md border border-[#e4e7e5] bg-[#f7f8f8] px-4 py-3 text-sm text-[#14201c] outline-none transition focus:border-[#08aeb7] focus:bg-white focus:ring-2 focus:ring-[#08aeb7]/20"
                  />
                </div>

                <div className="text-right">
                </div>

                {erreur && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-600">{erreur}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={envoi}
                  className="mt-2 w-full rounded-full bg-gradient-to-r from-[#046A38] to-[#046A38] px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {envoi ? "Connexion..." : "Se connecter"}
                </button>

                <div className="my-2 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#e5e7e6]"></div>
                  <span className="text-xs text-[#9ba39f]">
                    ou continuer avec
                  </span>
                  <div className="h-px flex-1 bg-[#e5e7e6]"></div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-[#dfe4e1] text-sm font-bold text-[#3b4540] transition hover:bg-[#f1f7f6]"
                  >
                    G
                  </button>

                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-[#dfe4e1] text-sm font-bold text-[#3b4540] transition hover:bg-[#f1f7f6]"
                  >
                    f
                  </button>

                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-[#dfe4e1] text-sm font-bold text-[#3b4540] transition hover:bg-[#f1f7f6]"
                  >
                    in
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentConnexion;