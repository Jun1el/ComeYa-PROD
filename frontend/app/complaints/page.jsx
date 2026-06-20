'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { currentUser } from '@/lib/auth';
import { DEFAULT_PRODUCTS } from '@/lib/seed';

export default function ComplaintsPage() {
  const [guard, setGuard] = useState(false);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [myComplaints, setMyComplaints] = useState([]);
  const [formData, setFormData] = useState({
    type: 'queja',
    subject: '',
    description: '',
    orderId: '',
    businessName: ''
  });
  const [businesses, setBusinesses] = useState([]);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const u = currentUser();
    if (!u) { 
      location.href = '/login'; 
    } else { 
      setGuard(true);
      setUser(u);
      loadMyComplaints(u.email);
      loadBusinesses();
    }
  }, []);

  const loadBusinesses = () => {
    // Obtener productos del localStorage (agregados por dueños)
    const storedProducts = JSON.parse(localStorage.getItem('comeya_products') || '[]');
    
    // Combinar con productos por defecto
    const allProducts = [...DEFAULT_PRODUCTS, ...storedProducts];
    
    // Extraer nombres únicos de negocios
    const uniqueBusinesses = [...new Set(allProducts.map(p => p.businessName))].sort();
    setBusinesses(uniqueBusinesses);
  };

  const loadMyComplaints = (email) => {
    const complaints = JSON.parse(localStorage.getItem('comeya_complaints') || '[]');
    const userComplaints = complaints.filter(c => c.userEmail === email);
    setMyComplaints(userComplaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.description || !formData.businessName) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const newComplaint = {
      id: `complaint_${Date.now()}`,
      ...formData,
      userName: user.name,
      userEmail: user.email,
      userDistrict: user.district,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      response: null,
      respondedAt: null
    };

    const complaints = JSON.parse(localStorage.getItem('comeya_complaints') || '[]');
    complaints.push(newComplaint);
    localStorage.setItem('comeya_complaints', JSON.stringify(complaints));

    setSuccess(true);
    setFormData({ type: 'queja', subject: '', description: '', orderId: '', businessName: '' });
    
    setTimeout(() => {
      setSuccess(false);
      setShowForm(false);
      loadMyComplaints(user.email);
    }, 2000);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      en_proceso: 'bg-blue-100 text-blue-800 border-blue-200',
      resuelto: 'bg-green-100 text-green-800 border-green-200',
      cerrado: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const labels = {
      pendiente: 'Pendiente',
      en_proceso: 'En Proceso',
      resuelto: 'Resuelto',
      cerrado: 'Cerrado'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (!guard) return null;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-primary/10 to-white">
        <Nav/>
        <div className="max-w-2xl mx-auto p-6 flex items-center justify-center min-h-[60vh]">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {formData.type === 'queja' ? '¡Queja Enviada!' : '¡Reclamo Enviado!'}
            </h2>
            <p className="text-brand-mutedDark/70">
              Hemos recibido tu {formData.type}. Te responderemos pronto.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-primary/10 to-white">
      <Nav/>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Libro de Reclamaciones</h1>
              <p className="text-brand-mutedDark/70">
                Envía tus quejas, reclamos o sugerencias. Estamos aquí para ayudarte.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 rounded-xl bg-brand-accent text-white hover:opacity-90 transition-opacity font-semibold"
            >
              {showForm ? 'Ver Mis Reclamos' : 'Nuevo Reclamo'}
            </button>
          </div>
        </div>

        {showForm ? (
          /* Formulario */
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-bold">Formulario de Reclamo</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-semibold mb-2">Tipo de Solicitud *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'queja' })}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
                      formData.type === 'queja'
                        ? 'border-brand-accent bg-brand-accent/10 font-semibold'
                        : 'border-gray-200 hover:border-brand-accent/50'
                    }`}
                  >
                    Queja
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'reclamo' })}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
                      formData.type === 'reclamo'
                        ? 'border-brand-accent bg-brand-accent/10 font-semibold'
                        : 'border-gray-200 hover:border-brand-accent/50'
                    }`}
                  >
                    Reclamo
                  </button>
                </div>
                <p className="text-xs text-brand-mutedDark/60 mt-2">
                  <strong>Queja:</strong> Disconformidad con el servicio. 
                  <strong className="ml-2">Reclamo:</strong> Disconformidad relacionada con el producto.
                </p>
              </div>

              {/* Restaurante */}
              <div>
                <label className="block text-sm font-semibold mb-2">Restaurante *</label>
                <select
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-brand-accent focus:outline-none transition-colors"
                  required
                >
                  <option value="">Selecciona el restaurante</option>
                  {businesses.map(business => (
                    <option key={business} value={business}>{business}</option>
                  ))}
                </select>
              </div>

              {/* Número de Pedido */}
              <div>
                <label className="block text-sm font-semibold mb-2">Número de Pedido (Opcional)</label>
                <input
                  type="text"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  placeholder="Ej: order_1234567890"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-brand-accent focus:outline-none transition-colors"
                />
              </div>

              {/* Asunto */}
              <div>
                <label className="block text-sm font-semibold mb-2">Asunto *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Resume tu queja o reclamo"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-brand-accent focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold mb-2">Descripción Detallada *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe detalladamente tu situación..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-brand-accent focus:outline-none transition-colors resize-none"
                  required
                />
              </div>

              {/* Info del Usuario */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-sm mb-2">Tus Datos de Contacto:</h3>
                <div className="text-sm space-y-1 text-brand-mutedDark/80">
                  <p><strong>Nombre:</strong> {user?.name}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Distrito:</strong> {user?.district}</p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ type: 'queja', subject: '', description: '', orderId: '', businessName: '' });
                  }}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-brand-accent text-white hover:opacity-90 transition-opacity font-semibold"
                >
                  Enviar {formData.type === 'queja' ? 'Queja' : 'Reclamo'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Lista de Reclamos */
          <div className="space-y-4">
            {myComplaints.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-primary/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">No tienes reclamos aún</h2>
                <p className="text-brand-mutedDark/70 mb-6">
                  Si tienes alguna queja o reclamo, puedes enviarlo usando el botón de arriba
                </p>
              </div>
            ) : (
              myComplaints.map(complaint => (
                <div key={complaint.id} className="glass rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          complaint.type === 'queja' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {complaint.type === 'queja' ? 'QUEJA' : 'RECLAMO'}
                        </span>
                        {getStatusBadge(complaint.status)}
                      </div>
                      <h3 className="text-xl font-bold mb-1">{complaint.subject}</h3>
                      <p className="text-sm text-brand-mutedDark/60">
                        Enviado el {new Date(complaint.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right text-sm text-brand-mutedDark/60">
                      ID: {complaint.id.split('_')[1].slice(0, 8)}
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="font-semibold">{complaint.businessName}</span>
                    </div>
                    {complaint.orderId && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span><strong>Pedido:</strong> {complaint.orderId}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4 p-4 bg-white/50 rounded-xl">
                    <p className="text-brand-mutedDark/80">{complaint.description}</p>
                  </div>

                  {complaint.response && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        <span className="font-semibold text-green-800">Respuesta del equipo:</span>
                      </div>
                      <p className="text-sm text-green-900 mb-2">{complaint.response}</p>
                      <p className="text-xs text-green-700">
                        Respondido el {new Date(complaint.respondedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
