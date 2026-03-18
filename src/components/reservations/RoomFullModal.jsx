import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, DoorOpen, Users, Wifi, Droplets, ShowerHead, Fan, Lightbulb, Bath } from 'lucide-react';
import GlassButton from '../ui-custom/GlassButton';

const ROOM_TYPE_MAP = {
  standard: 'Classique', vip: 'VIP', couple: 'Couple', prayer: 'Prière', family: 'Family',
};

function FacilityRow({ has, Icon, label }) {
  return (
    <div className={`flex items-center gap-2 text-xs ${has ? 'text-cyan-400' : 'text-slate-600'}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
      <span className="ml-auto">{has ? '✓' : '—'}</span>
    </div>
  );
}

// Modal displayed when a selected room has reached its maximum capacity
export default function RoomFullModal({ open, room, currentCount, onClose }) {
  if (!open || !room) return null;

  const capacity = room.capacity || room.bed_count || 1;

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
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="relative w-full max-w-md bg-[#0d1a30] border border-rose-500/40 rounded-2xl p-6 shadow-2xl"
        >
          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Chambre complète</h2>
              <p className="text-xs text-slate-400 mt-0.5">La capacité maximale est atteinte</p>
            </div>
          </div>

          {/* Room details card */}
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 space-y-3 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white">Chambre {room.number}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  {ROOM_TYPE_MAP[room.genre] || room.genre}
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-medium">
                Complet
              </span>
            </div>

            <div className="text-xs text-slate-400">{room.building_name} · {room.site_name}</div>

            {/* Capacity bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>Occupation</span>
                </div>
                <span className="text-xs font-semibold text-rose-400">{currentCount} / {capacity} places</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-700">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-red-500 transition-all"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Facilities */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-700/50">
              <FacilityRow has={room.hot_water} Icon={Droplets} label="Eau chaude" />
              <FacilityRow has={room.internal_shower} Icon={ShowerHead} label="Douche" />
              <FacilityRow has={room.bathroom} Icon={Bath} label="Salle de bain" />
              <FacilityRow has={room.fan} Icon={Fan} label="Ventilateur" />
              <FacilityRow has={room.lighting} Icon={Lightbulb} label="Éclairage" />
              <FacilityRow has={room.internet} Icon={Wifi} label="Internet" />
            </div>
          </div>

          <p className="text-sm text-slate-400 mb-5">
            Cette chambre ne peut plus accepter de nouvelles réservations. Veuillez choisir une autre chambre disponible.
          </p>

          <GlassButton onClick={onClose} className="w-full justify-center">
            Choisir une autre chambre
          </GlassButton>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}