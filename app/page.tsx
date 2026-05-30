"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Ticket, Layers, Clock } from "lucide-react";

interface SupportTicket {
  ticketId: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function SupportDashboard() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetches live tickets from AWS DynamoDB through our API
  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      if (Array.isArray(data)) setTickets(data);
    } catch (err) {
      console.error("Failed to load tickets", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Transmits new ticket entries to AWS DynamoDB
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setLoading(true);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        fetchTickets(); // Automatically pulls the newest ticket into feed
      }
    } catch (err) {
      console.error("Error submitting ticket", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <header className="max-w-6xl mx-auto mb-10 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent flex items-center gap-3">
          <Layers className="text-orange-500" /> ZeroStack Support Engine
        </h1>
        <p className="text-slate-400 mt-2 text-sm">Powered by Next.js, Vercel v0, and Amazon DynamoDB</p>
      </header>

      <main className="max-w-6xl mx-auto grid md:grid-cols-5 gap-8">
        {/* Left Form Panel */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl h-fit">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-orange-400">
            <PlusCircle size={20} /> Open New Ticket
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Issue Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Connection pool timeout error"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Detailed Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Provide steps to reproduce the server error..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 text-slate-950 font-bold py-3 px-4 rounded-lg transition-colors duration-150 text-sm flex justify-center items-center gap-2 cursor-pointer"
            >
              {loading ? "Transmitting to AWS..." : "Deploy Support Ticket"}
            </button>
          </form>
        </div>

        {/* Right Feed Panel */}
        <div className="md:col-span-3 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-300 px-1">
            <Ticket size={20} className="text-orange-500" /> Live Pipeline Logs ({tickets.length})
          </h2>
          
          {tickets.length === 0 ? (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 p-12 text-center rounded-xl text-slate-500 text-sm">
              No cloud records found. Use the left form to write your first entry to Amazon DynamoDB!
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {tickets.map((ticket) => (
                <div key={ticket.ticketId} className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl hover:border-slate-700/60 transition-all duration-200">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-medium text-base text-slate-200">{ticket.title}</h3>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-medium">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{ticket.description}</p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 border-t border-slate-800/60 pt-3">
                    <Clock size={12} /> Cloud Entry ID: {ticket.ticketId}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
