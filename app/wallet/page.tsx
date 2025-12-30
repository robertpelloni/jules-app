import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bobcoin Wallet - Jules UI",
  description: "Manage your Bobcoin balance and transactions.",
};

export default function WalletPage() {
  return (
    <div className="flex flex-col h-full bg-black text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
          <p className="text-zinc-400">Manage your Bobcoin assets and transactions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card */}
        <div className="p-6 rounded-xl bg-zinc-900 border border-white/10">
            <h2 className="text-lg font-medium mb-2 text-zinc-300">Total Balance</h2>
            <div className="text-4xl font-bold text-white font-mono">
                0.00 <span className="text-purple-400 text-xl">BOB</span>
            </div>
            <div className="mt-4 flex gap-2">
                 <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Send
                 </button>
                 <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors border border-white/5">
                    Receive
                 </button>
            </div>
        </div>

        {/* Recent Transactions Placeholder */}
        <div className="p-6 rounded-xl bg-zinc-900 border border-white/10 opacity-50">
            <h2 className="text-lg font-medium mb-4 text-zinc-300">Recent Transactions</h2>
            <div className="text-sm text-zinc-500 text-center py-8">
                No transactions found.
            </div>
        </div>
      </div>
    </div>
  );
}
