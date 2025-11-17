import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsola } from '../../api/consola';
import { useAuth } from '../../components/AuthContext';
import './Details.css';

export default function DetailsConsola() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userRole } = useAuth();
    const role = (userRole || 'EMPLEADO').toUpperCase();

    const [consola, setConsola] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchConsola() {
            try {
                const data = await getConsola(id);
                setConsola(data);
            } catch (err) {
                console.error('[DetailsConsola] Error cargando Consola:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchConsola();
    }, [id]);

    if (loading) return <div>Cargando...</div>;
    if (!consola) return <div>Consola no encontrada</div>;

    const canEdit = role === 'ADMIN' || role === 'ENCARGADO';
    const canDelete = role === 'ADMIN';

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6 text-center mb-4">
                    <img 
                        src={consola.imagen || '/placeholder.png'} 
                        alt={consola.modelo || 'Consola'} 
                        className="img-fluid rounded shadow" 
                        style={{ maxHeight: '350px', objectFit: 'cover' }} 
                    />
                </div>

                <div className="col-md-6">
                    <h2 className="mb-3">{consola.modelo || 'Desconocido'}</h2>
                    <ul className="list-group mb-3">
                        <li className="list-group-item"><strong>Marca:</strong> {consola.marca || 'N/A'}</li>
                        <li className="list-group-item"><strong>Memoria:</strong> {consola.memoria || 'N/A'}</li>
                        <li className="list-group-item"><strong>Precio:</strong> {consola.precio != null ? consola.precio.toLocaleString('es-NI', { style: 'currency', currency: 'NIO' }) : 'N/A'}</li>
                        {consola.proveedor && (
                            <>
                                <li className="list-group-item"><strong>Proveedor:</strong> {consola.proveedor.nombre}</li>
                                <li className="list-group-item"><strong>Dirección:</strong> {consola.proveedor.direccion}</li>
                                <li className="list-group-item"><strong>Teléfono:</strong> {consola.proveedor.telefono}</li>
                                <li className="list-group-item"><strong>Email:</strong> {consola.proveedor.email}</li>
                            </>
                        )}
                    </ul>

                    <button className="btn btn-secondary mb-2" onClick={() => navigate('/consolas')}>Volver a la lista</button>

                    <div className="d-flex gap-2">
                        {canEdit && (
                            <button className="btn btn-warning flex-grow-1" onClick={() => navigate(`/consolas/edit/${consola.idConsola}`)}>Editar</button>
                        )}
                        {canDelete && (
                            <button className="btn btn-danger flex-grow-1" onClick={() => navigate(`/consolas/delete/${consola.idConsola}`)}>Borrar</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
