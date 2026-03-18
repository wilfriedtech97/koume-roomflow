import React, { useState, useMemo } from 'react';
import GlassInput from '../ui-custom/GlassInput';
import GlassSelect from '../ui-custom/GlassSelect';
import GlassTextarea from '../ui-custom/GlassTextarea';
import GlassButton from '../ui-custom/GlassButton';
import {
  Search, CheckCircle2, Wifi, Droplets, ShowerHead, Fan, Lightbulb, Bath,
  Users, ArrowLeft, ArrowRight, Calendar, Infinity, UserSearch, X, Plus, Trash2,
} from 'lucide-react';

// Human-readable labels for room genre values
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

// Returns a blank occupant row template
const emptyOccupant = () => ({ occupant_name: '', occupant_phone: '', occupant_type: 'man', is_married_couple: false });

// Small icon indicator for a room facility
function FacilityIcon({ has, Icon, label }) {
  return (
    <span className={`flex items-center gap-1 text-xs ${has ? 'text-cyan-400' : 'text-slate-600'}`} title={label}>
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

// Individual occupant row with optional existing-occupant search dropdown
function OccupantRow({ occ, index, onChange, onRemove, canRemove, existingOccupants }) {
  const [search, setSearch] = useState('');
  const [showDrop, setShowDrop] = useState(false);

  // Filter existing occupants by name or phone for the search dropdown
  const filtered = useMemo(() => {
    if (!search.trim()) return existingOccupants.slice(0, 8);
    const q = search.toLowerCase();
    return existingOccupants.filter(o =>
      o.full_name?.toLowerCase().includes(q) || o.phone?.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [search, existingOccupants]);

  // Populate the row fields from a selected existing occupant record
  const selectExisting = (o) => {
    onChange({ ...occ, occupant_name: o.full_name || '', occupant_phone: o.phone || '' });
    setSearch(o.full_name || '');
    setShowDrop(false);
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-3">
      {/* Row header with occupant number and remove button */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Occupant {index + 1}</span>
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-rose-400 hover:text-rose-300 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search bar to pull data from an existing occupant record */}
      <div className="relative">
        <div className="relative">
          <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            className="w-full pl-10 pr-9 py-2 rounded-md bg-black border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/60 transition-colors"
            placeholder="Rechercher occupant existant..."
            value={search}
            onChange={e => { setSearch(e.target.value); setShowDrop(true); }}
            onFocus={() => setShowDrop(true)}
            onBlur={() => setTimeout(() => setShowDrop(false), 150)}
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); onChange({ ...occ, occupant_name: '', occupant_phone: '' }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {showDrop && filtered.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-[#0d1324] border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            {filtered.map(o => (
              <button key={o.id} type="button" onMouseDown={() => selectExisting(o)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-800/60 transition-colors flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">{o.full_name}</p>
                  <p className="text-xs text-slate-500">{o.phone || 'Pas de téléphone'}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 capitalize">{o.gender}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Name and phone fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <GlassInput label="Nom *" value={occ.occupant_name}
          onChange={e => { onChange({ ...occ, occupant_name: e.target.value }); setShowDrop(false); }}
          required placeholder="Prénom et nom complet" />
        <GlassInput label="Téléphone" value={occ.occupant_phone}
          onChange={e => onChange({ ...occ, occupant_phone: e.target.value })}
          placeholder="ex: +225 07 00 00 00" />
      </div>

      {/* Type and married-couple checkbox */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <GlassSelect label="Type" value={occ.occupant_type}
            onChange={e => onChange({ ...occ, occupant_type: e.target.value })}
            options={OCCUPANT_TYPES} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer mt-5">
          <input type="checkbox" checked={occ.is_married_couple}
            onChange={e => onChange({ ...occ, is_married_couple: e.target.checked })}
            className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-cyan-500" />
          💍 Marié(e)
        </label>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main ReservationForm component
// Steps (create only): 1 → Criteria | 2 → Room | 3 → Dates | 4 → Occupants
// Edit mode: single screen with room + dates + occupant details
// ─────────────────────────────────────────────
export default function ReservationForm({
  reservation,
  rooms = [],
  allReservations = [],
  existingOccupants = [],
  onSubmit,
  onCancel,
}) {
  // Pre-compute active reservation count per room for occupancy display
  const roomOccupancyMap = useMemo(() => {
    const map = {};
    allReservations.forEach(r => {
      if (r.room_id && r.status !== 'canceled') {
        map[r.room_id] = (map[r.room_id] || 0) + 1;
      }
    });
    return map;
  }, [allReservations]);
  const isEdit = !!reservation;

  // Step 1: filtering criteria
  const [criteria, setCriteria] = useState({ genre: '', num_people: 1 });

  // Step 3: dates and reservation type
  const [dates, setDates] = useState({
    check_in_date: reservation?.check_in_date || '',
    check_out_date: reservation?.check_out_date || '',
    reservation_type: reservation?.check_out_date ? 'determined' : 'determined',
  });

  // Current wizard step (1–4 for create, fixed at 2 for edit)
  const [step, setStep] = useState(isEdit ? 2 : 1);

  // Selected room object
  const [selectedRoom, setSelectedRoom] = useState(
    isEdit ? rooms.find(r => r.id === reservation.room_id) || null : null
  );

  // Edit-mode single occupant form
  const [form, setForm] = useState({
    occupant_name: reservation?.occupant_name || '',
    occupant_phone: reservation?.occupant_phone || '',
    occupant_type: reservation?.occupant_type || 'man',
    status: reservation?.status || 'pending',
    is_married_couple: reservation?.is_married_couple || false,
    notes: reservation?.notes || '',
  });

  // Create-mode multi-occupant list
  const [occupants, setOccupants] = useState([emptyOccupant()]);
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');

  // Compute rooms matching the criteria filters
  const matchingRooms = useMemo(() => {
    return rooms.filter(room => {
      if (room.status === 'unavailable') return false;
      if (criteria.genre && room.genre !== criteria.genre) return false;
      const cap = room.capacity || room.bed_count || 1;
      if (cap < Number(criteria.num_people)) return false;
      return true;
    });
  }, [criteria, rooms]);

  // Occupant list mutators
  const addOccupant = () => setOccupants(prev => [...prev, emptyOccupant()]);
  const removeOccupant = (i) => setOccupants(prev => prev.filter((_, idx) => idx !== i));
  const updateOccupant = (i, data) => setOccupants(prev => prev.map((o, idx) => idx === i ? data : o));

  // Per-step validation; returns error string or empty string if valid
  const validateStep = (targetStep) => {
    if (targetStep > 2 && !selectedRoom) return 'Veuillez sélectionner une chambre.';
    if (targetStep > 3) {
      if (!dates.check_in_date) return "Veuillez saisir la date d'arrivée.";
      if (dates.reservation_type === 'determined' && !dates.check_out_date) return 'Veuillez saisir la date de départ.';
    }
    return '';
  };

  // Navigate forward, validating the current step first
  const goNext = () => {
    const err = validateStep(step + 1);
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  };

  // Navigate backward
  const goBack = () => {
    setError('');
    setStep(s => s - 1);
  };

  // Final submission validation
  const validate = () => {
    if (!selectedRoom) return 'Veuillez sélectionner une chambre.';
    if (!dates.check_in_date) return "Veuillez saisir la date d'arrivée.";
    if (dates.reservation_type === 'determined' && !dates.check_out_date) return 'Veuillez saisir la date de départ.';
    if (!isEdit) {
      for (const occ of occupants) {
        if (!occ.occupant_name?.trim()) return 'Veuillez renseigner le nom de chaque occupant.';
      }
    } else {
      if (!form.occupant_name?.trim()) return "Veuillez renseigner le nom de l'occupant.";
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');

    const baseData = {
      room_id: selectedRoom.id,
      room_number: selectedRoom.number,
      building_name: selectedRoom.building_name || '',
      site_name: selectedRoom.site_name || '',
      check_in_date: dates.check_in_date,
      check_out_date: dates.reservation_type === 'determined' ? dates.check_out_date : null,
      _selectedRoom: selectedRoom,
    };

    if (isEdit) {
      // Edit: update the single existing reservation
      onSubmit({
        ...baseData,
        ...form,
        _existingOccupant: existingOccupants.find(
          o => o.full_name?.toLowerCase() === form.occupant_name?.toLowerCase()
        ) || null,
      });
    } else {
      // Create: ONE single reservation regardless of occupant count
      // Primary occupant = first in the list; additional occupants stored in notes
      const primary = occupants[0];
      const extraNames = occupants.slice(1).map(o => o.occupant_name).filter(Boolean);

      // Build notes: merge any additional occupant names with user-provided notes
      const extraLine = extraNames.length > 0
        ? `Occupants supplémentaires : ${extraNames.join(', ')}`
        : '';
      const combinedNotes = [extraLine, notes].filter(Boolean).join('\n');

      onSubmit({
        ...baseData,
        occupant_name: primary.occupant_name,
        occupant_phone: primary.occupant_phone || '',
        occupant_type: primary.occupant_type,
        is_married_couple: primary.is_married_couple,
        status,
        notes: combinedNotes,
        _existingOccupant: existingOccupants.find(
          o => o.full_name?.toLowerCase() === primary.occupant_name?.toLowerCase()
        ) || null,
      });
    }
  };

  // Total steps in create wizard
  const TOTAL_STEPS = 4;

  return (
    <div className="space-y-5">
      {/* Error message */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{error}</div>
      )}

      {/* Step indicator (create mode only) */}
      {!isEdit && (
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          {[
            { n: 1, label: 'Critères' },
            { n: 2, label: 'Chambre' },
            { n: 3, label: 'Dates' },
            { n: 4, label: 'Occupants' },
          ].map(({ n, label }, idx, arr) => (
            <React.Fragment key={n}>
              <div className="flex items-center gap-1.5">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  step > n ? 'bg-emerald-500 text-white' : step === n ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {step > n ? '✓' : n}
                </span>
                <span className={step >= n ? 'text-cyan-400' : 'text-slate-500'}>{label}</span>
              </div>
              {idx < arr.length - 1 && <div className="flex-1 h-px bg-slate-700" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ── STEP 1: CRITERIA ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassSelect
              label="Type de chambre"
              hint="Filtrer par catégorie de chambre"
              value={criteria.genre}
              onChange={e => setCriteria({ ...criteria, genre: e.target.value })}
              options={ROOM_GENRES}
            />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Nombre de personnes</label>
              <div className="flex items-center gap-3">
                <button type="button"
                  onClick={() => setCriteria(c => ({ ...c, num_people: Math.max(1, c.num_people - 1) }))}
                  className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 font-bold flex items-center justify-center">−
                </button>
                <span className="text-lg font-bold text-white w-8 text-center">{criteria.num_people}</span>
                <button type="button"
                  onClick={() => setCriteria(c => ({ ...c, num_people: c.num_people + 1 }))}
                  className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 font-bold flex items-center justify-center">+
                </button>
                <span className="text-sm text-slate-400 ml-1">personne(s)</span>
              </div>
              <p className="text-xs text-slate-500">Chambres avec capacité ≥ {criteria.num_people} personne(s)</p>
            </div>
          </div>
          <div className="flex justify-between gap-3 pt-2">
            <GlassButton variant="secondary" type="button" onClick={onCancel}>Annuler</GlassButton>
            <GlassButton type="button" onClick={goNext}>
              <Search className="w-4 h-4" /> Rechercher des chambres <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </div>
        </div>
      )}

      {/* ── STEP 2: ROOM SELECTION ── */}
      {step === 2 && !isEdit && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              <span className="text-cyan-400 font-semibold">{matchingRooms.length}</span> chambre(s) disponible(s)
              {criteria.genre && <span className="ml-2 text-slate-500">· {ROOM_TYPE_MAP[criteria.genre] || criteria.genre}</span>}
              <span className="ml-2 text-slate-500">· ≥ {criteria.num_people} pers.</span>
            </div>
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
                    {/* Occupancy progress bar */}
                    {(() => {
                      const cap = room.capacity || room.bed_count || 1;
                      const used = roomOccupancyMap[room.id] || 0;
                      const pct = Math.min(100, Math.round((used / cap) * 100));
                      const isFull = used >= cap;
                      return (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className={isFull ? 'text-rose-400' : 'text-slate-500'}>
                              {isFull ? '🔴 Complet' : `${used}/${cap} réservations`}
                            </span>
                            <span className={isFull ? 'text-rose-400 font-semibold' : 'text-slate-500'}>{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-700">
                            <div
                              className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                    <div className="flex flex-wrap gap-3">
                      <FacilityIcon has={room.hot_water} Icon={Droplets} label="Eau chaude" />
                      <FacilityIcon has={room.internal_shower} Icon={ShowerHead} label="Douche" />
                      <FacilityIcon has={room.bathroom} Icon={Bath} label="Salle de bain" />
                      <FacilityIcon has={room.fan} Icon={Fan} label="Ventilateur" />
                      <FacilityIcon has={room.lighting} Icon={Lightbulb} label="Éclairage" />
                      <FacilityIcon has={room.internet} Icon={Wifi} label="Internet" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex justify-between gap-3 pt-2">
            <GlassButton variant="secondary" type="button" onClick={goBack}>
              <ArrowLeft className="w-4 h-4" /> Retour
            </GlassButton>
            <GlassButton type="button" disabled={!selectedRoom} onClick={goNext}>
              Continuer <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </div>
        </div>
      )}

      {/* ── STEP 3: DATES ── */}
      {step === 3 && !isEdit && (
        <div className="space-y-4">
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
              <button type="button" onClick={() => { setStep(2); }} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Changer
              </button>
            </div>
          )}

          <div className="space-y-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dates de séjour</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <GlassInput
                label="Date d'arrivée *"
                hint="Jour d'entrée dans la chambre"
                type="date"
                value={dates.check_in_date}
                onChange={e => setDates({ ...dates, check_in_date: e.target.value })}
              />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Type de réservation</label>
                <p className="text-xs text-slate-500">Durée déterminée ou indéterminée</p>
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
              <GlassInput
                label="Date de départ *"
                hint="Jour de sortie de la chambre"
                type="date"
                value={dates.check_out_date}
                min={dates.check_in_date}
                onChange={e => setDates({ ...dates, check_out_date: e.target.value })}
              />
            )}
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <GlassButton variant="secondary" type="button" onClick={goBack}>
              <ArrowLeft className="w-4 h-4" /> Retour
            </GlassButton>
            <GlassButton type="button" onClick={goNext}>
              Continuer <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </div>
        </div>
      )}

      {/* ── STEP 4: OCCUPANTS (create) ── */}
      {step === 4 && !isEdit && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room + dates summary banner */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40 text-xs text-slate-400 flex flex-wrap gap-3">
            <span><span className="text-cyan-300 font-semibold">Chambre {selectedRoom?.number}</span> · {selectedRoom?.building_name}</span>
            <span>·</span>
            <span>📅 {dates.check_in_date} {dates.check_out_date ? `→ ${dates.check_out_date}` : '(indéterminée)'}</span>
          </div>

          {/* Occupant rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Occupants <span className="text-cyan-400 ml-1">({occupants.length})</span>
              </div>
              <button type="button" onClick={addOccupant}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" /> Ajouter un occupant
              </button>
            </div>
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {occupants.map((occ, i) => (
                <OccupantRow key={i} occ={occ} index={i}
                  onChange={data => updateOccupant(i, data)}
                  onRemove={() => removeOccupant(i)}
                  canRemove={occupants.length > 1}
                  existingOccupants={existingOccupants}
                />
              ))}
            </div>
          </div>

          {/* Shared status and notes */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paramètres communs</div>
            <GlassSelect label="Statut" value={status} onChange={e => setStatus(e.target.value)} options={[
              { value: 'pending', label: 'En attente' },
              { value: 'confirmed', label: 'Confirmée' },
              { value: 'canceled', label: 'Annulée' },
            ]} />
            <GlassTextarea label="Notes" hint="Informations supplémentaires (optionnel)" value={notes}
              onChange={e => setNotes(e.target.value)} placeholder="Observations ou instructions particulières..." />
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <GlassButton variant="secondary" type="button" onClick={goBack}>
              <ArrowLeft className="w-4 h-4" /> Retour
            </GlassButton>
            <GlassButton type="submit">
              Confirmer la réservation ({occupants.length} occupant{occupants.length > 1 ? 's' : ''})
            </GlassButton>
          </div>
        </form>
      )}

      {/* ── EDIT MODE: all fields on one screen ── */}
      {isEdit && (
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
            </div>
          )}

          {/* Dates section */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dates de séjour</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <GlassInput label="Date d'arrivée *" hint="Jour d'entrée dans la chambre" type="date" value={dates.check_in_date}
                onChange={e => setDates({ ...dates, check_in_date: e.target.value })} />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Type de réservation</label>
                <p className="text-xs text-slate-500">Durée déterminée ou indéterminée</p>
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
              <GlassInput label="Date de départ *" hint="Jour de sortie de la chambre" type="date" value={dates.check_out_date}
                min={dates.check_in_date}
                onChange={e => setDates({ ...dates, check_out_date: e.target.value })} />
            )}
          </div>

          {/* Occupant details */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Détails de l'occupant</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassInput label="Nom de l'occupant *" hint="Prénom et nom complet" value={form.occupant_name}
                onChange={e => setForm({ ...form, occupant_name: e.target.value })} required placeholder="ex: Kouamé Jean" />
              <GlassInput label="Téléphone" hint="Numéro de téléphone de l'occupant" value={form.occupant_phone}
                onChange={e => setForm({ ...form, occupant_phone: e.target.value })} placeholder="ex: +225 07 00 00 00" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassSelect label="Type d'occupant *" hint="Catégorie de l'occupant" value={form.occupant_type}
                onChange={e => setForm({ ...form, occupant_type: e.target.value })} options={OCCUPANT_TYPES} />
              <GlassSelect label="Statut" hint="État de la réservation" value={form.status}
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
          </div>

          <GlassTextarea label="Notes" hint="Informations supplémentaires (optionnel)" value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Observations ou instructions particulières..." />

          <div className="flex justify-end gap-3 pt-2">
            <GlassButton variant="secondary" type="button" onClick={onCancel}>Annuler</GlassButton>
            <GlassButton type="submit">Mettre à jour</GlassButton>
          </div>
        </form>
      )}
    </div>
  );
}