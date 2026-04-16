const TableauDeBordAdmin = () => {
  const { user } = useAuth();
  const { formations, deleteFormation } = useFormations();
  const { actualites, deleteActualite } = useActualites();
  const navigate = useNavigate();

  const isAdmin = user?.is_admin;

  useEffect(() => {
    if (!user) navigate("/connexion");
    if (!isAdmin) navigate("/espace-participant");
  }, [user]);

  if (!user || !isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1>Admin Dashboard</h1>

      <p>Bienvenue {user.email}</p>

      <div className="grid md:grid-cols-2 gap-8">

        {/* FORMATIONS */}
        <div>
          <h2>Formations</h2>

          <button onClick={() => navigate("/ajouter-formation")}>
            + Ajouter
          </button>

          {formations.map((f) => (
            <div key={f.id}>
              <span onClick={() => navigate(`/modifier-formation/${f.id}`)}>
                {f.title}
              </span>

              <button onClick={() => deleteFormation(f.id)}>
                Supprimer
              </button>
            </div>
          ))}
        </div>

        {/* ACTUALITÉS */}
        <div>
          <h2>Actualités</h2>

          <button onClick={() => navigate("/ajouter-actualite")}>
            + Ajouter
          </button>

          {actualites.map((a) => (
            <div key={a.id}>
              <span onClick={() => navigate(`/modifier-actualite/${a.id}`)}>
                {a.titre}
              </span>

              <button onClick={() => deleteActualite(a.id)}>
                Supprimer
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};