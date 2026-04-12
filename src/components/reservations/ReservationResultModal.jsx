import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X, CalendarCheck, DoorOpen, User, Phone } from 'lucide-react';
import GlassButton from '../ui-custom/GlassButton';
import moment from 'moment';

// Modal shown after a reservation attempt — success or failure
export default function ReservationResultModal({ open, success, reservation, allReservations = [], errorMessage, onClose }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 24 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className={`relative w-full max-w-sm rounded-2xl p-6 shadow-2xl border ${
            success
              ? 'bg-[#0a1f15] border-emerald-500/40'
              : 'bg-[#1a0d10] border-rose-500/40'
          }`}
        >
          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Icon + title */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
              success ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-rose-500/15 border border-rose-500/30'
            }`}>
              {success
                ? <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                : <XCircle className="w-9 h-9 text-rose-400" />
              }
            </div>
            <h2 className={`text-lg font-bold mb-1 ${success ? 'text-emerald-300' : 'text-rose-300'}`}>
              {success ? 'Réservation confirmée !' : 'Réservation échouée'}
            </h2>
            <p className="text-sm text-slate-400">
              {success
                ? 'La réservation a été créée avec succès.'
                : errorMessage || 'Une erreur est survenue lors de la création.'}
            </p>
          </div>

          {/* Reservation summary (success only) */}
          {success && (allReservations.length > 0 || reservation) && (
            <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 space-y-3 mb-5 max-h-60 overflow-y-auto">
              {/* Room header */}
              <div className="flex items-center gap-2 pb-2 border-b border-slate-700/50">
                <DoorOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-white font-bold">Chambre {(allReservations[0] || reservation)?.room_number}</span>
                <span className="text-slate-500 text-xs">· {(allReservations[0] || reservation)?.building_name}</span>
              </div>
              {/* One row per occupant */}
              {(allReservations.length > 0 ? allReservations : [reservation]).map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-white font-medium">{r.occupant_name}</span>
                    <span className="text-slate-500 capitalize text-xs">({r.occupant_type})</span>
                    {r.is_married_couple && <span className="text-xs">💍</span>}
                  </div>
                  {r.occupant_phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 ml-5">
                      <Phone className="w-3 h-3" />{r.occupant_phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400 ml-5">
                    <CalendarCheck className="w-3 h-3" />
                    {r.check_in_date ? moment(r.check_in_date).format('DD MMM YYYY') : '—'}
                    {r.check_out_date ? ` → ${moment(r.check_out_date).format('DD MMM YYYY')}` : ' (indéterminée)'}
                  </div>
                </div>
              ))}
            </div>
          )}

          <GlassButton
            onClick={onClose}
            variant={success ? 'success' : 'danger'}
            className="w-full justify-center"
          >
            {success ? 'Fermer' : 'Réessayer'}
          </GlassButton>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}