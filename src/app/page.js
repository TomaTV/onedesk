import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-6 flex flex-col items-center justify-start gap-6">
        <Image
          className="dark:invert"
          src="/1desk.svg"
          alt="Onedesk logo"
          width={40}
          height={40}
          priority
        />
        <h2 className="font-bold text-xl text-black">Onedesk</h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 pb-20 flex items-center justify-center">
        <main className="flex flex-col gap-[32px] items-center text-black">
          <h1 className="text-4xl font-bold text-center">Welcome to Onedesk</h1>
          <p className="text-lg text-center">Your digital workspace</p>
        </main>
      </div>
    </div>
  );
}
