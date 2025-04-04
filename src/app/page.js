import Sidebar from "../components/Sidebar";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      {/* Intégration de la sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 pb-20 flex items-center justify-center bg-white text-gray-800">
        <main className="flex flex-col gap-[32px] items-center">
          <h1 className="text-4xl font-bold text-center">Bienvenue sur Onedesk</h1>
          <p className="text-lg text-center text-gray-600">Votre espace de travail numérique</p>
        </main>
      </div>
    </div>
  );
}
