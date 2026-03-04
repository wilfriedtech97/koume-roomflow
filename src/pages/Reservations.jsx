import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Plus, Pencil, Trash2, Search, X, Calendar } from 'lucide-react';
import PageHeader from '../components/ui-custom/PageHeader';
import GlassButton from '../components/ui-custom/GlassButton';
import GlassModal from '../components/ui-custom/GlassModal';
import GlassSelect from '../components/ui-custom/GlassSelect';
import GlassInput from '../components/ui-custom/GlassInput';
import StatusBadge from '../components/ui-custom/StatusBadge';
import EmptyState from '../components/ui-custom/EmptyState';
import LoadingSpinner from '../components/ui-custom/LoadingSpinner';
import ExportButton from '../components/ui-custom/ExportButton';
import ReservationForm from '../components/reservations/ReservationForm';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import moment from 'moment';

export default function Reservations() {
  const [modal, setModal] = useState({ open: false, reservation: null });
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

  const { data: reservations = [], isLoading } = useQuery({ queryKey: ['reservations'], queryFn: () => base44.entities.Reservation.list('-created_date') });
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: () => base44.entities.Room.list() });
  const { data: occupants = [] } = useQuery({ queryKey: ['occupants'], queryFn: () => base44.entities.Occupant.list() });

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
      event_type: 'reservation', entity_type: 'reservation', entity_name: resData.occupant_name,
      description: `Reservation for ${resData.occupant_name} in Room ${resData.room_number}`,
      timestamp: new Date().toISOString(),
    });
    return res;
  };

  const saveMut = useMutation({
    mutationFn: async (data) => {
      // Edit: single object
      if (modal.reservation) {
        const { _existingOccupant, _selectedRoom, ...resData } = data;
        return base44.entities.Reservation.update(modal.reservation.id, resData);
      }
      // Create: array of occupants
      const list = Array.isArray(data) ? data : [data];
      for (const item of list) {
        await createSingleReservation(item);
      }
      qc.invalidateQueries({ queryKey: ['occupants'] });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservations'] }); setModal({ open: false, reservation: null }); },
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

  const clearDateFilters = () => { setDateFrom(''); setDateTo(''); };

  return (
    <div>
      <PageHeader
        title="Reservations"
        subtitle={`${reservations.length} total`}
        action={
          <div className="flex gap-3">
            <ExportButton data={reservations} filename="reservations" />
            <GlassButton onClick={() => setModal({ open: true, reservation: null })}><Plus className="w-4 h-4" /> New Reservation</GlassButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input className="w-full pl-10 pr-4 py-2.5 glass-input text-sm" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <GlassSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={[
          { value: '', label: 'All Status' }, { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'canceled', label: 'Canceled' },
        ]} />
        <GlassSelect value={typeFilter} onChange={e => setTypeFilter(e.target.value)} options={[
          { value: '', label: 'All Types' }, { value: 'man', label: 'Man' }, { value: 'woman', label: 'Woman' }, { value: 'couple', label: 'Couple' }, { value: 'family', label: 'Family' },
        ]} />
        {/* Date From */}
        <div className="relative" ref={calFromRef}>
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-black border border-slate-600 hover:border-cyan-500/60 transition-colors cursor-pointer"
            onClick={() => { setShowCalFrom(v => !v); setShowCalTo(false); }}
          >
            <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className={`text-sm flex-1 ${dateFrom ? 'text-white' : 'text-slate-500'}`}>{dateFrom ? moment(dateFrom).format('DD MMM YYYY') : 'De (From)'}</span>
            {dateFrom && <button type="button" onClick={e => { e.stopPropagation(); setDateFrom(''); }} className="text-slate-500 hover:text-white"><X className="w-3 h-3" /></button>}
          </div>
          {showCalFrom && (
            <div className="absolute z-50 top-full mt-1 bg-[#0d1b2e] border border-slate-700 rounded-xl shadow-2xl">
              <CalendarPicker
                mode="single"
                selected={dateFrom ? new Date(dateFrom) : undefined}
                onSelect={(d) => { setDateFrom(d ? moment(d).format('YYYY-MM-DD') : ''); setShowCalFrom(false); }}
                className="text-white"
              />
            </div>
          )}
        </div>
        {/* Date To */}
        <div className="relative" ref={calToRef}>
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-black border border-slate-600 hover:border-rose-500/60 transition-colors cursor-pointer"
            onClick={() => { setShowCalTo(v => !v); setShowCalFrom(false); }}
          >
            <Calendar className="w-4 h-4 text-rose-400 shrink-0" />
            <span className={`text-sm flex-1 ${dateTo ? 'text-white' : 'text-slate-500'}`}>{dateTo ? moment(dateTo).format('DD MMM YYYY') : 'À (To)'}</span>
            {dateTo && <button type="button" onClick={e => { e.stopPropagation(); setDateTo(''); }} className="text-slate-500 hover:text-white"><X className="w-3 h-3" /></button>}
          </div>
          {showCalTo && (
            <div className="absolute z-50 top-full mt-1 right-0 bg-[#0d1b2e] border border-slate-700 rounded-xl shadow-2xl">
              <CalendarPicker
                mode="single"
                selected={dateTo ? new Date(dateTo) : undefined}
                onSelect={(d) => { setDateTo(d ? moment(d).format('YYYY-MM-DD') : ''); setShowCalTo(false); }}
                className="text-white"
              />
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No reservations" message="Create a reservation or adjust filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(res => (
            <div key={res.id} className="entity-card p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white text-sm">{res.occupant_name}</h3>
                  <p className="text-[11px] text-slate-500 capitalize">{res.occupant_type} • Room {res.room_number || '—'}</p>
                </div>
                <StatusBadge status={res.status} />
              </div>
              <div className="text-xs text-slate-400 space-y-1 mb-3">
                <p>📅 {res.check_in_date ? moment(res.check_in_date).format('MMM D') : '—'} → {res.check_out_date ? moment(res.check_out_date).format('MMM D, YYYY') : '—'}</p>
                <p>🏢 {res.building_name || '—'} • {res.site_name || '—'}</p>
                {res.is_married_couple && <p className="text-cyan-400">💍 Married Couple</p>}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GlassButton variant="ghost" className="text-xs" onClick={() => setModal({ open: true, reservation: res })}><Pencil className="w-3 h-3" /> Edit</GlassButton>
                <GlassButton variant="ghost" className="text-xs text-rose-400" onClick={() => { if (confirm('Delete this reservation?')) deleteMut.mutate(res.id); }}><Trash2 className="w-3 h-3" /> Delete</GlassButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <GlassModal open={modal.open} onClose={() => setModal({ open: false, reservation: null })} title={modal.reservation ? 'Edit Reservation' : 'New Reservation'} maxWidth="max-w-2xl">
        <ReservationForm
          reservation={modal.reservation}
          rooms={rooms}
          allReservations={reservations}
          existingOccupants={occupants}
          onSubmit={(d) => saveMut.mutate(d)}
          onCancel={() => setModal({ open: false, reservation: null })}
        />
      </GlassModal>
    </div>
  );
}