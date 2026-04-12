import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Plus, Pencil, Trash2, Search, X, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../components/ui-custom/PageHeader';
import GlassButton from '../components/ui-custom/GlassButton';
import GlassModal from '../components/ui-custom/GlassModal';
import GlassSelect from '../components/ui-custom/GlassSelect';
import StatusBadge from '../components/ui-custom/StatusBadge';
import EmptyState from '../components/ui-custom/EmptyState';
import LoadingSpinner from '../components/ui-custom/LoadingSpinner';
import ExportButton from '../components/ui-custom/ExportButton';
import ReservationForm from '../components/reservations/ReservationForm';
import RoomFullModal from '../components/reservations/RoomFullModal';
import ReservationResultModal from '../components/reservations/ReservationResultModal';
import ReservationDetailModal from '../components/reservations/ReservationDetailModal';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import moment from 'moment';

export default function Reservations() {
  const [modal, setModal] = useState({ open: false, reservation: null });
  const [duplicateRes, setDuplicateRes] = useState(null);
  const [roomFullModal, setRoomFullModal] = useState({ open: false, room: null, currentCount: 0 });
  const [resultModal, setResultModal] = useState({ open: false, success: false, reservation: null, allReservations: [], errorMessage: '' });
  const [detailModal, setDetailModal] = useState({ open: false, reservation: null });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showCalFrom, setShowCalFrom] = useState(false);
  const [showCalTo, setShowCalTo] = useState(false);
  const calFromRef = useRef(null);
  const calToRef = useRef(null);
  const qc = useQueryClient();

  useEffect(() => {
    const handler = (e) => {
      if (calFromRef.current && !calFromRef.current.contains(e.target)) setShowCalFrom(false);
      if (calToRef.current && !calToRef.current.contains(e.target)) setShowCalTo(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => base44.entities.Reservation.list('-created_date'),
  });
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => base44.entities.Room.list(),
  });
  const { data: occupants = [] } = useQuery({
    queryKey: ['occupants'],
    queryFn: () => base44.entities.Occupant.list(),
  });

  const createSingleReservation = async (data) => {
    const { _existingOccupant, _selectedRoom, ...resData } = data;
    const res = await base44.entities.Reservation.create(resData);
    if (!_existingOccupant && resData.occupant_name?.trim()) {
      await base44.entities.Occupant.create({
        full_name: resData.occupant_name,
        phone: resData.occupant_phone || '',
        gender: resData.occupant_type === 'woman' ? 'female' : 'male',
        room_id: resData.room_id,
        room_number: resData.room_number,
        building_name: resData.building_name,
        site_name: resData.site_name,
        check_in_date: resData.check_in_date,
        check_out_date: resData.check_out_date || '',
        status: 'active',
      });
    }
    await base44.entities.HistoryEvent.create({
      event_type: 'reservation',
      entity_type: 'reservation',
      entity_name: resData.occupant_name,
      description: `Réservation pour ${resData.occupant_name} — Chambre ${resData.room_number}`,
      timestamp: new Date().toISOString(),
    });
    return res;
  };

  const checkDuplicate = (occupantName) => {
    if (!occupantName?.trim()) return null;
    const name = occupantName.trim().toLowerCase();
    return reservations.find(r => r.occupant_name?.toLowerCase() === name && r.status !== 'canceled') || null;
  };

  const saveMut = useMutation({
    mutationFn: async (data) => {
      if (modal.reservation) {
        const { _existingOccupant, _selectedRoom, ...resData } = data;
        return base44.entities.Reservation.update(modal.reservation.id, resData);
      }

      const items = Array.isArray(data) ? data : [data];
      const firstItem = items[0];

      if (firstItem.room_id) {
        const room = rooms.find(r => r.id === firstItem.room_id) || firstItem._selectedRoom;
        const capacity = room ? (room.capacity || 1) : 1;
        const activeForRoom = reservations.filter(r => r.room_id === firstItem.room_id && r.status !== 'canceled').length;
        if (activeForRoom + items.length > capacity) {
          setRoomFullModal({ open: true, room, currentCount: activeForRoom });
          throw new Error('room_full');
        }
      }

      for (const item of items) {
        const existing = checkDuplicate(item.occupant_name);
        if (existing) {
          toast.error(`Réservation refusée : ${item.occupant_name} a déjà une réservation active.`, { duration: 6000 });
          setDuplicateRes(existing);
          throw new Error('duplicate');
        }
      }

      const created = [];
      for (const item of items) {
        const res = await createSingleReservation(item);
        created.push({ ...item, id: res?.id });
      }
      qc.invalidateQueries({ queryKey: ['occupants'] });
      return created;
    },
    onSuccess: (createdData) => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      setModal({ open: false, reservation: null });
      setDuplicateRes(null);
      const first = Array.isArray(createdData) ? createdData[0] : createdData;
      setResultModal({ open: true, success: true, reservation: first, allReservations: Array.isArray(createdData) ? createdData : [createdData], errorMessage: '' });
    },
    onError: (err) => {
      if (err.message === 'room_full' || err.message === 'duplicate') return;
      setModal({ open: false, reservation: null });
      setResultModal({ open: true, success: false, reservation: null, allReservations: [], errorMessage: err.message || 'Une erreur inattendue est survenue.' });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Reservation.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  });

  if (isLoading) return <LoadingSpinner />;

  const filtered = reservations.filter(r => {
    if (search && !r.occupant_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (typeFilter && r.occupant_type !== typeFilter) return false;
    if (dateFrom && r.check_out_date && r.check_out_date < dateFrom) return false;
    if (dateTo && r.check_in_date && r.check_in_date > dateTo) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Reservations"
        subtitle={`${reservations.length} total`}
        action={
          <div className="flex gap-3">
            <ExportButton data={reservations} filename="reservations" />
            <GlassButton onClick={() => setModal({ open: true, reservation: null })}>
              <Plus className="w-4 h-4" /> New Reservation
            </GlassButton>
          </div>
        }
      />

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <GlassSelect
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'canceled', label: 'Canceled' },
          ]}
        />
        <GlassSelect
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          options={[
            { value: '', label: 'All Types' },
            { value: 'man', label: 'Man' },
            { value: 'woman', label: 'Woman' },
            { value: 'couple', label: 'Couple' },
            { value: 'family', label: 'Family' },
          ]}
        />
        <div className="relative" ref={calFromRef}>
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-black border border-slate-600 hover:border-cyan-500/60 transition-colors cursor-pointer"
            onClick={() => { setShowCalFrom(v => !v); setShowCalTo(false); }}
          >
            <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className={`text-sm flex-1 ${dateFrom ? 'text-white' : 'text-slate-500'}`}>
              {dateFrom ? moment(dateFrom).format('DD MMM YYYY') : 'De (From)'}
            </span>
            {dateFrom && (
              <button type="button" onClick={e => { e.stopPropagation(); setDateFrom(''); }} className="text-slate-500 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {showCalFrom && (
            <div className="absolute z-50 top-full mt-1 bg-[#0d1b2e] border border-slate-700 rounded-xl shadow-2xl">
              <CalendarPicker
                mode="single"
                selected={dateFrom ? new Date(dateFrom) : undefined}
                onSelect={d => { setDateFrom(d ? moment(d).format('YYYY-MM-DD') : ''); setShowCalFrom(false); }}
                className="text-white"
              />
            </div>
          )}
        </div>
        <div className="relative" ref={calToRef}>
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-black border border-slate-600 hover:border-rose-500/60 transition-colors cursor-pointer"
            onClick={() => { setShowCalTo(v => !v); setShowCalFrom(false); }}
          >
            <Calendar className="w-4 h-4 text-rose-400 shrink-0" />
            <span className={`text-sm flex-1 ${dateTo ? 'text-white' : 'text-slate-500'}`}>
              {dateTo ? moment(dateTo).format('DD MMM YYYY') : 'À (To)'}
            </span>
            {dateTo && (
              <button type="button" onClick={e => { e.stopPropagation(); setDateTo(''); }} className="text-slate-500 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {showCalTo && (
            <div className="absolute z-50 top-full mt-1 right-0 bg-[#0d1b2e] border border-slate-700 rounded-xl shadow-2xl">
              <CalendarPicker
                mode="single"
                selected={dateTo ? new Date(dateTo) : undefined}
                onSelect={d => { setDateTo(d ? moment(d).format('YYYY-MM-DD') : ''); setShowCalTo(false); }}
                className="text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Duplicate warning banner */}
      {duplicateRes && (
        <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300 mb-1">Réservation existante détectée</p>
            <p className="text-xs text-amber-200/70 mb-2">Cet occupant a déjà une réservation active :</p>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-white space-y-1">
              <p><span className="text-amber-400 font-medium">👤</span> {duplicateRes.occupant_name} <span className="text-slate-400 capitalize">({duplicateRes.occupant_type})</span></p>
              <p><span className="text-amber-400 font-medium">🏠</span> Chambre {duplicateRes.room_number || '—'} • {duplicateRes.building_name || '—'}</p>
              <p><span className="text-amber-400 font-medium">📅</span> {duplicateRes.check_in_date ? moment(duplicateRes.check_in_date).format('DD MMM YYYY') : '—'} → {duplicateRes.check_out_date ? moment(duplicateRes.check_out_date).format('DD MMM YYYY') : '—'}</p>
              <p><span className="text-amber-400 font-medium">📌</span> Statut : <span className="capitalize">{duplicateRes.status}</span></p>
            </div>
          </div>
          <button onClick={() => setDuplicateRes(null)} className="text-slate-500 hover:text-white mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Reservation cards */}
      {filtered.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No reservations" message="Create a reservation or adjust filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(res => {
            const room = rooms.find(r => r.id === res.room_id);
            const cap = room?.capacity || 1;
            const usedCount = reservations.filter(r => r.room_id === res.room_id && r.status !== 'canceled').length;
            const pct = Math.min(100, Math.round((usedCount / cap) * 100));
            const isFull = usedCount >= cap;
            return (
              <div key={res.id} className="entity-card p-5 group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white text-base">Chambre {res.room_number || '—'}</h3>
                    <p className="text-[11px] text-slate-500">{res.building_name} · {res.site_name}</p>
                  </div>
                  <StatusBadge status={res.status} />
                </div>

                {/* Occupancy bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isFull ? 'text-rose-400' : 'text-slate-500'}>{usedCount}/{cap} occupant{cap > 1 ? 's' : ''}</span>
                    <span className={isFull ? 'text-rose-400 font-semibold' : 'text-slate-500'}>{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-700">
                    <div
                      className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Date range */}
                <div className="text-xs text-slate-400 mb-3">
                  📅 {res.check_in_date ? moment(res.check_in_date).format('DD MMM YYYY') : '—'}
                  {res.check_out_date ? ` → ${moment(res.check_out_date).format('DD MMM YYYY')}` : ' (indéterminée)'}
                </div>

                {/* Occupant details */}
                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/40 space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white font-medium">{res.occupant_name}</span>
                    <span className="text-xs text-slate-500 capitalize">({res.occupant_type})</span>
                    {res.is_married_couple && <span className="text-cyan-400 text-xs">💍</span>}
                  </div>
                  {res.occupant_phone && (
                    <div className="text-xs text-slate-400">📞 {res.occupant_phone}</div>
                  )}
                  {res.notes && (
                    <div className="text-xs text-slate-500 italic truncate" title={res.notes}>📝 {res.notes}</div>
                  )}
                </div>

                {/* Room facilities */}
                {room && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {room.hot_water && <span className="text-xs text-cyan-400">💧</span>}
                    {room.internal_shower && <span className="text-xs text-cyan-400">🚿</span>}
                    {room.bathroom && <span className="text-xs text-cyan-400">🛁</span>}
                    {room.fan && <span className="text-xs text-cyan-400">🌀</span>}
                    {room.lighting && <span className="text-xs text-cyan-400">💡</span>}
                    {room.internet && <span className="text-xs text-cyan-400">📶</span>}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GlassButton variant="ghost" className="text-xs" onClick={() => setDetailModal({ open: true, reservation: res })}>
                    👁 Voir
                  </GlassButton>
                  <GlassButton variant="ghost" className="text-xs" onClick={() => setModal({ open: true, reservation: res })}>
                    <Pencil className="w-3 h-3" /> Modifier
                  </GlassButton>
                  <GlassButton variant="ghost" className="text-xs text-rose-400"
                    onClick={() => { if (confirm('Supprimer cette réservation ?')) deleteMut.mutate(res.id); }}>
                    <Trash2 className="w-3 h-3" /> Supprimer
                  </GlassButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit reservation modal */}
      <GlassModal
        open={modal.open}
        onClose={() => setModal({ open: false, reservation: null })}
        title={modal.reservation ? 'Edit Reservation' : 'New Reservation'}
        maxWidth="max-w-2xl"
      >
        <ReservationForm
          reservation={modal.reservation}
          rooms={rooms}
          allReservations={reservations}
          existingOccupants={occupants}
          onSubmit={d => saveMut.mutate(d)}
          onCancel={() => setModal({ open: false, reservation: null })}
        />
      </GlassModal>

      {/* Room-full popup */}
      <RoomFullModal
        open={roomFullModal.open}
        room={roomFullModal.room}
        currentCount={roomFullModal.currentCount}
        onClose={() => setRoomFullModal({ open: false, room: null, currentCount: 0 })}
      />

      {/* Result popup */}
      <ReservationResultModal
        open={resultModal.open}
        success={resultModal.success}
        reservation={resultModal.reservation}
        allReservations={resultModal.allReservations || []}
        errorMessage={resultModal.errorMessage}
        onClose={() => setResultModal({ open: false, success: false, reservation: null, allReservations: [], errorMessage: '' })}
      />

      {/* Detail popup */}
      <ReservationDetailModal
        open={detailModal.open}
        reservation={detailModal.reservation}
        room={detailModal.reservation ? rooms.find(r => r.id === detailModal.reservation.room_id) : null}
        onClose={() => setDetailModal({ open: false, reservation: null })}
      />
    </div>
  );
}