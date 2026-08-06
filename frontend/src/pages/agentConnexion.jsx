import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connexionAgent } from "../services/api";

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
    <div className="min-h-screen bg-jaune/5 flex items-center justify-center">
      <form onSubmit={soumettre} className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="font-bold text-vert-dark text-2xl mb-2 text-center">Espace agent</h1>

        <div>
          <label className="text-sm text-gray-500">Identifiant</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white rounded-full px-5 py-3 shadow-sm border border-gray-200 outline-none focus:border-vert"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white rounded-full px-5 py-3 shadow-sm border border-gray-200 outline-none focus:border-vert"
          />
        </div>

        {erreur && <p className="text-red-500 text-sm">{erreur}</p>}

        <button
          type="submit"
          disabled={envoi}
          className="mt-2 bg-vert hover:bg-vert-dark text-white px-6 py-3 rounded-full font-medium transition-colors disabled:opacity-50"
        >
          {envoi ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

export default AgentConnexion;