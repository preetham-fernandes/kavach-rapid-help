import Header from "@/components/header";
import ReportList from "@/components/dashboard/incident-feed";

export default function Reports() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Report Management
        </h1>

        <div>
          <ReportList />
        </div>
      </div>
    </main>
  );
}
