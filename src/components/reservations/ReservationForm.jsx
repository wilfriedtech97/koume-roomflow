import React, { useState, useMemo } from 'react';
import GlassSelect from '../ui-custom/GlassSelect';
import GlassTextarea from '../ui-custom/GlassTextarea';
import GlassButton from '../ui-custom/GlassButton';
import GlassInput from '../ui-custom/GlassInput';
import DatePickerField from './DatePickerField';
import {
  Search, CheckCircle2, Wifi, Droplets, ShowerHead, Fan, Lightbulb, Bath,
  Users, ArrowLeft, ArrowRight, Infinity, UserSearch, X, Plus, Trash2, HardHat,
} from 'lucide-react';

const ROOM_TYPE_MAP = {
  standard: 'Classique', vip: 'VIP', couple: 'Couple', prayer: 'Prière', family: 'Famille',
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
  { value: 'family', label: 'Famille' },
];

const emptyOccupant = (defaultIn = '', defaultOut = '') => ({
  occupant_name: '', occupant_phone: '', occupant_type: 'man',
  is_married_couple: false, check_in_date: defaultIn, check_out_date: defaultOut,
  reservation_type: 'determined',
});

function FacilityIcon({ has, Icon, label }) {
  return (
    <span className={`flex items-center gap-1 text-xs ${has ? 'text-cyan-400' : 'text-slate-600'}`} title={label}>
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

function OccupantRow({ occ, index, onChange, onRemove, canRemove, existingOccupants }) {
  const [search, setSearch] = useState('');
  const [showDrop, setShowDrop] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return existingOccupants.slice(0, 8);
    const q = search.toLowerCase();
    return existingOccupants.filter(o =>
      o.full_name?.toLowerCase().includes(q) || o.phone?.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [search, existingOccupants]);

  const selectExisting = (o) => {
    onChange({ ...occ, occupant_name: o.full_name || '', occupant_phone: o.phone || '' });
    setSearch(o.full_name || '');
    setShowDrop(false);
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Occupant {index + 1}</span>
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-rose-400 hover:text-rose-300 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Existing occupant search */}
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
            <button type="button"
              onClick={() => { setSearch(''); onChange({ ...occ, occupant_name: '', occupant_phone: '' }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
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

      {/* Name and phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Nom *</label>
          <input
            className="w-full px-3 py-2 rounded-md bg-black border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/60"
            placeholder="Prénom et nom"
            value={occ.occupant_name}
            onChange={e => { onChange({ ...occ, occupant_name: e.target.value }); setShowDrop(false); }}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Téléphone</label>
          <input
            className="w-full px-3 py-2 rounded-md bg-black border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            placeholder="+225 07 00 00 00"
            value={occ.occupant_phone}
            onChange={e => onChange({ ...occ, occupant_phone: e.target.value })}
          />
        </div>
      </div>

      {/* Type + married */}
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

      {/* Per-occupant dates */}
      <div className="pt-2 border-t border-slate-700/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dates personnalisées</span>
          <div className="flex gap-1">
            <button type="button"
              onClick={() => onChange({ ...occ, reservation_type: 'determined' })}
              className={`px-2 py-1 rounded text-xs font-medium border transition-all ${occ.reservation_type === 'determined' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
              Déterminée
            </button>
            <button type="button"
              onClick={() => onChange({ ...occ, reservation_type: 'undetermined', check_out_date: '' })}
              className={`px-2 py-1 rounded text-xs font-medium border transition-all ${occ.reservation_type === 'undetermined' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
              <Infinity className="w-3 h-3 inline mr-1" />Indéterminée
            </button>
          </div>
        </div>
        <div className={`grid gap-3 ${occ.reservation_type === 'determined' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          <DatePickerField
            label="Arrivée *"
            value={occ.check_in_date}
            onChange={v => onChange({ ...occ, check_in_date: v })}
            placeholder="Date d'arrivée"
          />
          {occ.reservation_type === 'determined' && (
            <DatePickerField
              label="Départ *"
              value={occ.check_out_date}
              onChange={v => onChange({ ...occ, check_out_date: v })}
              min={occ.check_in_date}
              placeholder="Date de départ"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReservationForm({
  reservation,
  rooms = [],
  allReservations = [],
  existingOccupants = [],
  onSubmit,
  onCancel,
}) {
  const roomOccupancyMap = useMemo(() => {
    const map = {};
    allReservations.forEach(r => {
      if (r.room_id && r.status !== 'canceled') map[r.room_id] = (map[r.room_id] || 0) + 1;
    });
    return map;
  }, [allReservations]);

  const isEdit = !!reservation;
  const [criteria, setCriteria] = useState({ genre: '', num_people: 1, show_all: false });
  const [step, setStep] = useState(isEdit ? 2 : 1);
  const [selectedRoom, setSelectedRoom] = useState(
    isEdit ? rooms.find(r => r.id === reservation.room_id) || null : null
  );

  const [form, setForm] = useState({
    occupant_name: reservation?.occupant_name || '',
    occupant_phone: reservation?.occupant_phone || '',
    occupant_type: reservation?.occupant_type || 'man',
    status: reservation?.status || 'pending',
    is_married_couple: reservation?.is_married_couple || false,
    notes: reservation?.notes || '',
    check_in_date: reservation?.check_in_date || '',
    check_out_date: reservation?.check_out_date || '',
    reservation_type: reservation?.check_out_date ? 'determined' : 'determined',
  });

  const [occupants, setOccupants] = useState([emptyOccupant()]);
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Rooms eligible for search: exclude construction & unavailable (unless show_all)
  const matchingRooms = useMemo(() => {
    return rooms.filter(room => {
      if (room.status === 'construction') return false;
      if (room.status === 'unavailable') return false;
      if (criteria.genre && room.genre !== criteria.genre) return false;
      const cap = room.capacity || 1;
      if (cap < Number(criteria.num_people)) return false;
      return true;
    });
  }, [criteria, rooms]);

  // Rooms in construction (informational)
  const constructionRooms = useMemo(() => rooms.filter(r => r.status === 'construction'), [rooms]);

  const addOccupant = () => setOccupants(prev => [emptyOccupant(), ...prev]);
  const removeOccupant = (i) => setOccupants(prev => prev.filter((_, idx) => idx !== i));
  const updateOccupant = (i, data) => setOccupants(prev => prev.map((o, idx) => idx === i ? data : o));

  const goNext = () => {
    if (step === 2 && !selectedRoom) { setError('Veuillez sélectionner une chambre.'); return; }
    setError('');
    setStep(s => s + 1);
  };
  const goBack = () => { setError(''); setStep(s => s - 1); };

  const validate = () => {
    if (!selectedRoom) return 'Veuillez sélectionner une chambre.';
    if (isEdit) {
      if (!form.occupant_name?.trim()) return "Veuillez renseigner le nom de l'occupant.";
      if (!form.check_in_date) return "Veuillez saisir la date d'arrivée.";
    } else {
      for (const occ of occupants) {
        if (!occ.occupant_name?.trim()) return 'Veuillez renseigner le nom de chaque occupant.';
        if (!occ.check_in_date) return "Veuillez saisir la date d'arrivée pour chaque occupant.";
        if (occ.reservation_type === 'determined' && !occ.check_out_date)
          return `Veuillez saisir la date de départ pour ${occ.occupant_name || 'un occupant'}.`;
      }
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');

    const base = {
      room_id: selectedRoom.id,
      room_number: selectedRoom.number,
      building_name: selectedRoom.building_name || '',
      site_name: selectedRoom.site_name || '',
      _selectedRoom: selectedRoom,
    };

    if (isEdit) {
      onSubmit({
        ...base,
        occupant_name: form.occupant_name,
        occupant_phone: form.occupant_phone,
        occupant_type: form.occupant_type,
        status: form.status,
        is_married_couple: form.is_married_couple,
        notes: form.notes,
        check_in_date: form.check_in_date,
        check_out_date: form.reservation_type === 'determined' ? form.check_out_date : null,
        _existingOccupant: existingOccupants.find(o => o.full_name?.toLowerCase() === form.occupant_name?.toLowerCase()) || null,
      });
    } else {
      // Submit an array — one reservation object per occupant
      const payload = occupants.map(occ => ({
        ...base,
        occupant_name: occ.occupant_name,
        occupant_phone: occ.occupant_phone || '',
        occupant_type: occ.occupant_type,
        is_married_couple: occ.is_married_couple,
        check_in_date: occ.check_in_date,
        check_out_date: occ.reservation_type === 'determined' ? occ.check_out_date : null,
        status,
        notes,
        _existingOccupant: existingOccupants.find(o => o.full_name?.toLowerCase() === occ.occupant_name?.toLowerCase()) || null,
      }));
      onSubmit(payload);
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{error}</div>
      )}

      {/* Step indicator */}
      {!isEdit && (
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          {[{ n: 1, label: 'Critères' }, { n: 2, label: 'Chambre' }, { n: 3, label: 'Occupants' }].map(({ n, label }, idx, arr) => (
            <React.Fragment key={n}>
              <div className="flex items-center gap-1.5">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${step > n ? 'bg-emerald-500 text-white' : step === n ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
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
            <GlassSelect label="Type de chambre" hint="Filtrer par catégorie"
              value={criteria.genre}
              onChange={e => setCriteria({ ...criteria, genre: e.target.value })}
              options={ROOM_GENRES} />
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
                <span className="text-sm text-slate-400 ml-1">pers.</span>
              </div>
            </div>
          </div>

          {/* Construction rooms info */}
          {constructionRooms.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
              <HardHat className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/80">
                <span className="font-semibold text-amber-300">{constructionRooms.length} chambre(s) en construction</span> — exclues de la recherche :&nbsp;
                {constructionRooms.map(r => r.number).join(', ')}
              </div>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-2">
            <GlassButton variant="secondary" type="button" onClick={onCancel}>Annuler</GlassButton>
            <GlassButton type="button" onClick={goNext}>
              <Search className="w-4 h-4" /> Rechercher <ArrowRight className="w-4 h-4" />
            </GlassButton>
          </div>
        </div>
      )}

      {/* ── STEP 2: ROOM SELECTION ── */}
      {step === 2 && !isEdit && (
        <div className="space-y-3">
          <div className="text-sm text-slate-400">
            <span className="text-cyan-400 font-semibold">{matchingRooms.length}</span> chambre(s) disponible(s)
            {criteria.genre && <span className="ml-2 text-slate-500">· {ROOM_TYPE_MAP[criteria.genre]}</span>}
            <span className="ml-2 text-slate-500">· ≥ {criteria.num_people} pers.</span>
          </div>

          {matchingRooms.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">Aucune chambre disponible pour ces critères.</div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {matchingRooms.map(room => {
                const isSelected = selectedRoom?.id === room.id;
                const cap = room.capacity || 1;
                const used = roomOccupancyMap[room.id] || 0;
                const pct = Math.min(100, Math.round((used / cap) * 100));
                const isFull = used >= cap;
                return (
                  <button type="button" key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${isSelected ? 'bg-cyan-500/15 border-cyan-500/60' : 'bg-slate-800/60 border-slate-700/40 hover:border-slate-600/60'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                        <span className="font-semibold text-white">Chambre {room.number}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/80 text-slate-300">{ROOM_TYPE_MAP[room.genre] || room.genre}</span>
                        {isFull && <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">Complet</span>}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Users className="w-3.5 h-3.5" />{cap} pers.
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">{room.building_name} · {room.site_name}</div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={isFull ? 'text-rose-400' : 'text-slate-500'}>{used}/{cap} réservations</span>
                        <span className={isFull ? 'text-rose-400 font-semibold' : 'text-slate-500'}>{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-700">
                        <div className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
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

      {/* ── STEP 3: OCCUPANTS (create) ── */}
      {step === 3 && !isEdit && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room summary */}
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-cyan-300 font-semibold">Chambre {selectedRoom?.number}</span>
              <span className="text-slate-400 mx-2">·</span>
              <span className="text-slate-400">{ROOM_TYPE_MAP[selectedRoom?.genre] || selectedRoom?.genre}</span>
              <span className="text-slate-400 mx-2">·</span>
              <span className="text-slate-400">{selectedRoom?.building_name}</span>
              <span className="ml-3 text-xs text-slate-500">Cap. {selectedRoom?.capacity || 1} pers.</span>
            </div>
            <button type="button" onClick={() => setStep(2)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Changer
            </button>
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
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {occupants.map((occ, i) => (
                <OccupantRow key={i} occ={occ} index={occupants.length - 1 - i}
                  onChange={data => updateOccupant(i, data)}
                  onRemove={() => removeOccupant(i)}
                  canRemove={occupants.length > 1}
                  existingOccupants={existingOccupants}
                />
              ))}
            </div>
          </div>

          {/* Status + notes */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paramètres communs</div>
            <GlassSelect label="Statut" value={status} onChange={e => setStatus(e.target.value)} options={[
              { value: 'pending', label: 'En attente' },
              { value: 'confirmed', label: 'Confirmée' },
              { value: 'canceled', label: 'Annulée' },
            ]} />
            <GlassTextarea label="Notes" hint="Informations supplémentaires (optionnel)" value={notes}
              onChange={e => setNotes(e.target.value)} placeholder="Observations particulières..." />
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <GlassButton variant="secondary" type="button" onClick={goBack}>
              <ArrowLeft className="w-4 h-4" /> Retour
            </GlassButton>
            <GlassButton type="submit">
              Confirmer ({occupants.length} occupant{occupants.length > 1 ? 's' : ''})
            </GlassButton>
          </div>
        </form>
      )}

      {/* ── EDIT MODE ── */}
      {isEdit && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedRoom && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <div className="text-sm">
                <span className="text-cyan-300 font-semibold">Chambre {selectedRoom.number}</span>
                <span className="text-slate-400 mx-2">·</span>
                <span className="text-slate-400">{ROOM_TYPE_MAP[selectedRoom.genre] || selectedRoom.genre}</span>
                <span className="text-slate-400 mx-2">·</span>
                <span className="text-slate-400">{selectedRoom.building_name}</span>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dates de séjour</div>
            <div className="flex gap-2 mb-2">
              <button type="button"
                onClick={() => setForm({ ...form, reservation_type: 'determined' })}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${form.reservation_type === 'determined' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                Déterminée
              </button>
              <button type="button"
                onClick={() => setForm({ ...form, reservation_type: 'undetermined', check_out_date: '' })}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${form.reservation_type === 'undetermined' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                <Infinity className="w-3 h-3 inline mr-1" />Indéterminée
              </button>
            </div>
            <div className={`grid gap-3 ${form.reservation_type === 'determined' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              <DatePickerField label="Arrivée *" value={form.check_in_date}
                onChange={v => setForm({ ...form, check_in_date: v })} placeholder="Date d'arrivée" />
              {form.reservation_type === 'determined' && (
                <DatePickerField label="Départ *" value={form.check_out_date}
                  onChange={v => setForm({ ...form, check_out_date: v })}
                  min={form.check_in_date} placeholder="Date de départ" />
              )}
            </div>
          </div>

          {/* Occupant */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Détails de l'occupant</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassInput label="Nom *" value={form.occupant_name}
                onChange={e => setForm({ ...form, occupant_name: e.target.value })} required placeholder="Kouamé Jean" />
              <GlassInput label="Téléphone" value={form.occupant_phone}
                onChange={e => setForm({ ...form, occupant_phone: e.target.value })} placeholder="+225 07 00 00 00" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassSelect label="Type" value={form.occupant_type}
                onChange={e => setForm({ ...form, occupant_type: e.target.value })} options={OCCUPANT_TYPES} />
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
          </div>

          <GlassTextarea label="Notes" value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Observations..." />

          <div className="flex justify-end gap-3 pt-2">
            <GlassButton variant="secondary" type="button" onClick={onCancel}>Annuler</GlassButton>
            <GlassButton type="submit">Mettre à jour</GlassButton>
          </div>
        </form>
      )}
    </div>
  );
}