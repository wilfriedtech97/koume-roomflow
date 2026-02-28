import React, { useState, useMemo } from 'react';
import GlassInput from '../ui-custom/GlassInput';
import GlassSelect from '../ui-custom/GlassSelect';
import GlassTextarea from '../ui-custom/GlassTextarea';
import GlassButton from '../ui-custom/GlassButton';
import { Search, CheckCircle2, Wifi, Droplets, ShowerHead, Fan, Lightbulb, BathIcon, Users, ArrowLeft, Calendar, Infinity } from 'lucide-react';

const ROOM_TYPE_MAP = {
  standard: 'Classique',
  vip: 'VIP',
  couple: 'Couple',
  prayer: 'Prière',
  family: 'Family',
};

const OCCUPANT_TYPES = [
  { value: 'man', label: 'Homme' },
  { value: 'woman', label: 'Femme' },
  { value: 'couple', label: 'Couple' },
  { value: 'family', label: 'Famille' },
];

const ROOM_GENRES = [
  { value: '', label: 'Tous types' },
  { value: 'standard', label: 'Classique' },
  { value: 'vip', label: 'VIP' },
  { value: 'couple', label: 'Couple' },
  { value: 'prayer', label: 'Prière' },
  { value: 'family', label: 'Family' },
];

function FacilityIcon({ has, Icon, label }) {
  return (
    <span className={`flex items-center gap-1 text-xs ${has ? 'text-cyan-400' : 'text-slate-600'}`} title={label}>
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

export default function ReservationForm({ reservation, rooms = [], allReservations = [], onSubmit, onCancel }) {
  const isEdit = !!reservation;

  // Step 1: criteria
  const [criteria, setCriteria] = useState({
    genre: '',
    num_people: 1,
  });

  // Dates & reservation type (step 3)
  const [dates, setDates] = useState({
    check_in_date: reservation?.check_in_date || '',
    check_out_date: reservation?.check_out_date || '',
    reservation_type: reservation?.check_out_date ? 'determined' : 'determined',
  });

  // Step 2: room selection
  const [step, setStep] = useState(isEdit ? 2 : 1);
  const [selectedRoom, setSelectedRoom] = useState(isEdit ? rooms.find(r => r.id === reservation.room_id) || null : null);

  // Step 3: final form
  const [form, setForm] = useState({
    occupant_name: reservation?.occupant_name || '',
    occupant_type: reservation?.occupant_type || 'man',
    status: reservation?.status || 'pending',
    is_married_couple: reservation?.is_married_couple || false,
    notes: reservation?.notes || '',
  });
  const [error, setError] = useState('');

  // Filter matching rooms by type and capacity only (no date filtering)
  const matchingRooms = useMemo(() => {
    return rooms.filter(room => {
      if (room.status === 'unavailable') return false;
      if (criteria.genre && room.genre !== criteria.genre) return false;
      const cap = room.capacity || room.bed_count || 1;
      if (cap < Number(criteria.num_people)) return false;
      return true;
    });
  }, [criteria, rooms]);

  const validate = () => {
    if (!selectedRoom) return 'Veuillez sélectionner une chambre.';
    if (!dates.check_in_date) return 'Veuillez saisir la date d\'arrivée.';
    if (dates.reservation_type === 'determined' && !dates.check_out_date) return 'Veuillez saisir la date de départ.';
    const sameNameCount = allReservations.filter(r => {
      if (reservation && r.id === reservation.id) return false;
      return r.occupant_name?.toLowerCase() === form.occupant_name?.toLowerCase() && r.status !== 'canceled';
    }).length;
    if (sameNameCount >= 2) return 'Cette personne a déjà 2 réservations actives (max 2).';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    onSubmit({
      ...form,
      room_id: selectedRoom.id,
      room_number: selectedRoom.number,
      building_name: selectedRoom.building_name || '',
      site_name: selectedRoom.site_name || '',
      check_in_date: dates.check_in_date,
      check_out_date: dates.reservation_type === 'determined' ? dates.check_out_date : null,
    });
  };

  const handleSearch = () => {
    setError('');
    setStep(2);
  };

  return (
    <div className="space-y-5">
      {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{error}</div>}

      {/* STEP INDICATOR */}
      {!isEdit && (
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'}`}>1</span>
          <span className={step >= 1 ? 'text-cyan-400' : ''}>Critères</span>
          <div className="flex-1 h-px bg-slate-700" />
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'}`}>2</span>
          <span className={step >= 2 ? 'text-cyan-400' : ''}>Chambres</span>
          <div className="flex-1 h-px bg-slate-700" />
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'}`}>3</span>
          <span className={step >= 3 ? 'text-cyan-400' : ''}>Confirmation</span>
        </div>
      )}

      {/* ── STEP 1: CRITERIA ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassSelect label="Type de chambre" value={criteria.genre}
              onChange={e => setCriteria({ ...criteria, genre: e.target.value })}
              options={ROOM_GENRES} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Nombre de personnes</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setCriteria(c => ({ ...c, num_people: Math.max(1, c.num_people - 1) }))}
                  className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 font-bold flex items-center justify-center">−</button>
                <span className="text-lg font-bold text-white w-8 text-center">{criteria.num_people}</span>
                <button type="button" onClick={() => setCriteria(c => ({ ...c, num_people: c.num_people + 1 }))}
                  className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 font-bold flex items-center justify-center">+</button>
                <span className="text-sm text-slate-400 ml-1">personne(s)</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <GlassButton variant="secondary" type="button" onClick={onCancel}>Annuler</GlassButton>
            <GlassButton type="button" onClick={handleSearch}><Search className="w-4 h-4" /> Rechercher des chambres</GlassButton>
          </div>
        </div>
      )}

      {/* ── STEP 2: ROOM RESULTS ── */}
      {step === 2 && !isEdit && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              <span className="text-cyan-400 font-semibold">{matchingRooms.length}</span> chambre(s) disponible(s)
              {criteria.genre && <span className="ml-2 text-slate-500">· {ROOM_TYPE_MAP[criteria.genre] || criteria.genre}</span>}
              <span className="ml-2 text-slate-500">· {criteria.num_people} pers.</span>
            </div>
            <button type="button" onClick={() => { setStep(1); setSelectedRoom(null); }} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Modifier
            </button>
          </div>
          {matchingRooms.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">Aucune chambre disponible pour ces critères.</div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {matchingRooms.map(room => {
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <button type="button" key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${isSelected ? 'bg-cyan-500/15 border-cyan-500/60' : 'bg-slate-800/60 border-slate-700/40 hover:border-slate-600/60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                        <span className="font-semibold text-white text-sm">Chambre {room.number}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/80 text-slate-300 capitalize">{ROOM_TYPE_MAP[room.genre] || room.genre}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Users className="w-3.5 h-3.5" />
                        <span>{room.capacity || room.bed_count || 1} pers.</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">{room.building_name} · {room.site_name}</div>
                    <div className="flex flex-wrap gap-3">
                      <FacilityIcon has={room.hot_water} Icon={Droplets} label="Eau chaude" />
                      <FacilityIcon has={room.internal_shower} Icon={ShowerHead} label="Douche" />
                      <FacilityIcon has={room.bathroom} Icon={BathIcon} label="Salle de bain" />
                      <FacilityIcon has={room.fan} Icon={Fan} label="Ventilateur" />
                      <FacilityIcon has={room.lighting} Icon={Lightbulb} label="Éclairage" />
                      <FacilityIcon has={room.internet} Icon={Wifi} label="Internet" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <GlassButton variant="secondary" type="button" onClick={onCancel}>Annuler</GlassButton>
            <GlassButton type="button" disabled={!selectedRoom} onClick={() => { if (selectedRoom) setStep(3); }}>
              Continuer →
            </GlassButton>
          </div>
        </div>
      )}

      {/* ── STEP 3 / EDIT: FINAL DETAILS ── */}
      {(step === 3 || isEdit) && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected room summary */}
          {selectedRoom && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-cyan-300 font-semibold">Chambre {selectedRoom.number}</span>
                <span className="text-slate-400 mx-2">·</span>
                <span className="text-slate-400 capitalize">{ROOM_TYPE_MAP[selectedRoom.genre] || selectedRoom.genre}</span>
                <span className="text-slate-400 mx-2">·</span>
                <span className="text-slate-400">{selectedRoom.building_name}</span>
              </div>
              {!isEdit && (
                <button type="button" onClick={() => setStep(2)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Changer
                </button>
              )}
            </div>
          )}
          {/* Dates section */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dates de séjour</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <GlassInput label="Date d'arrivée *" type="date" value={dates.check_in_date}
                onChange={e => setDates({ ...dates, check_in_date: e.target.value })} />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Type de réservation</label>
                <div className="flex gap-2">
                  <button type="button"
                    onClick={() => setDates({ ...dates, reservation_type: 'determined' })}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${dates.reservation_type === 'determined' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-700/50'}`}>
                    <Calendar className="w-3.5 h-3.5" /> Déterminée
                  </button>
                  <button type="button"
                    onClick={() => setDates({ ...dates, reservation_type: 'undetermined', check_out_date: '' })}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${dates.reservation_type === 'undetermined' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-700/50'}`}>
                    <Infinity className="w-3.5 h-3.5" /> Indéterminée
                  </button>
                </div>
              </div>
            </div>
            {dates.reservation_type === 'determined' && (
              <GlassInput label="Date de départ *" type="date" value={dates.check_out_date}
                min={dates.check_in_date}
                onChange={e => setDates({ ...dates, check_out_date: e.target.value })} />
            )}
          </div>
          <GlassInput label="Nom de l'occupant *" value={form.occupant_name}
            onChange={e => setForm({ ...form, occupant_name: e.target.value })} required placeholder="Nom complet" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassSelect label="Type d'occupant *" value={form.occupant_type}
              onChange={e => setForm({ ...form, occupant_type: e.target.value })}
              options={OCCUPANT_TYPES} />
            <GlassSelect label="Statut" value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })} options={[
                { value: 'pending', label: 'En attente' },
                { value: 'confirmed', label: 'Confirmée' },
                { value: 'canceled', label: 'Annulée' },
              ]} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={form.is_married_couple}
              onChange={e => setForm({ ...form, is_married_couple: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-cyan-500" />
            💍 Couple marié
          </label>
          <GlassTextarea label="Notes" value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes..." />
          <div className="flex justify-end gap-3 pt-2">
            <GlassButton variant="secondary" type="button" onClick={onCancel}>Annuler</GlassButton>
            <GlassButton type="submit">{isEdit ? 'Mettre à jour' : 'Confirmer la réservation'}</GlassButton>
          </div>
        </form>
      )}
    </div>
  );
}