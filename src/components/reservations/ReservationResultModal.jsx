import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X, CalendarCheck, DoorOpen, User } from 'lucide-react';
import GlassButton from '../ui-custom/GlassButton';
import moment from 'moment';

// Modal shown after a reservation attempt — success or failure
export default function ReservationResultModal({ open, success, reservation, errorMessage, onClose }) {
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
          {success && reservation && (
            <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 space-y-2.5 mb-5">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-white font-medium">{reservation.occupant_name}</span>
                <span className="text-slate-500 capitalize text-xs">({reservation.occupant_type})</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DoorOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-300">Chambre {reservation.room_number}</span>
                <span className="text-slate-500 text-xs">· {reservation.building_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-300">
                  {reservation.check_in_date ? moment(reservation.check_in_date).format('DD MMM YYYY') : '—'}
                  {reservation.check_out_date
                    ? ` → ${moment(reservation.check_out_date).format('DD MMM YYYY')}`
                    : ' (indéterminée)'}
                </span>
              </div>
              {/* Status badge */}
              <div className="pt-1">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  reservation.status === 'confirmed'
                    ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {reservation.status === 'confirmed' ? 'Confirmée' : reservation.status === 'pending' ? 'En attente' : reservation.status}
                </span>
              </div>
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