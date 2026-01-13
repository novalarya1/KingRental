import React, { useState } from 'react';
import { Star, X, MessageSquare } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  vehicleName: string;
}

export default function ReviewModal({ isOpen, onClose, onSubmit, vehicleName }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Rate Your Experience</h2>
              <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest mt-1">{vehicleName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X size={20} /></button>
          </div>

          <div className="space-y-8">
            {/* Star Rating */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-90"
                >
                  <Star 
                    size={32} 
                    fill={(hover || rating) >= star ? "#2563eb" : "none"} 
                    className={(hover || rating) >= star ? "text-blue-600" : "text-zinc-700"}
                  />
                </button>
              ))}
            </div>

            {/* Comment Area */}
            <div className="relative group">
              <MessageSquare className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
              <textarea 
                placeholder="Tell us about your trip..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 pl-12 min-h-[120px] text-sm text-zinc-300 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <button 
              onClick={() => { onSubmit(rating, comment); onClose(); }}
              disabled={rating === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase py-4 rounded-2xl tracking-widest transition-all shadow-lg shadow-blue-600/20"
            >
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}