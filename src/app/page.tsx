import { GameApp } from "@/components/GameApp";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50 dark:bg-slate-950">
      <GameApp />
    </div>
  );
}
