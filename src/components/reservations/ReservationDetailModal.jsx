import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Phone, User, Home, MapPin, FileText, Heart } from 'lucide-react';
import StatusBadge from '../ui-custom/StatusBadge';
import moment from 'moment';

const OCCUPANT_TYPE_MAP = { man: 'Homme', woman: 'Femme', couple: 'Couple', family: 'Famille' };

export default function ReservationDetailModal({ reservation, room, open, onClose }) {
  if (!open || !reservation) return null;

  const Row = ({ icon: Icon, label, value, accent }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-slate-800/80 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className={`w-3.5 h-3.5 ${accent || 'text-slate-400'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm text-white font-medium break-words">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#0d1324] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-gradient-to-r from-cyan-500/10 to-transparent">
              <div>
                <h2 className="text-base font-bold text-white">Détails de la réservation</h2>
                <p className="text-xs text-slate-500 mt-0.5">Chambre {reservation.room_number} · {reservation.building_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={reservation.status} />
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-1">
              <Row icon={User} label="Occupant" value={reservation.occupant_name} accent="text-cyan-400" />
              <Row icon={User} label="Type" value={OCCUPANT_TYPE_MAP[reservation.occupant_type] || reservation.occupant_type} />
              {reservation.occupant_phone && <Row icon={Phone} label="Téléphone" value={reservation.occupant_phone} accent="text-emerald-400" />}
              {reservation.is_married_couple && <Row icon={Heart} label="Statut marital" value="Couple marié 💍" accent="text-pink-400" />}

              <div className="pt-1">
                <Row icon={Calendar} label="Date d'arrivée" value={reservation.check_in_date ? moment(reservation.check_in_date).format('dddd DD MMMM YYYY') : '—'} accent="text-cyan-400" />
                <Row icon={Calendar} label="Date de départ"
                  value={reservation.check_out_date ? moment(reservation.check_out_date).format('dddd DD MMMM YYYY') : 'Indéterminée'}
                  accent="text-rose-400" />
              </div>

              <Row icon={Home} label="Chambre" value={`N° ${reservation.room_number}`} />
              <Row icon={MapPin} label="Emplacement" value={[reservation.building_name, reservation.site_name].filter(Boolean).join(' · ')} />

              {room && (
                <div className="py-2.5 border-b border-slate-800/60">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Équipements</p>
                  <div className="flex flex-wrap gap-2">
                    {room.hot_water && <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">💧 Eau chaude</span>}
                    {room.internal_shower && <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">🚿 Douche</span>}
                    {room.bathroom && <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">🛁 Salle de bain</span>}
                    {room.fan && <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">🌀 Ventilateur</span>}
                    {room.lighting && <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">💡 Éclairage</span>}
                    {room.internet && <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">📶 Internet</span>}
                  </div>
                </div>
              )}

              {reservation.notes && <Row icon={FileText} label="Notes" value={reservation.notes} />}

              <div className="pt-1">
                <Row icon={Calendar} label="Créé le" value={reservation.created_date ? moment(reservation.created_date).format('DD MMM YYYY HH:mm') : '—'} />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-800/60 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-medium">
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}