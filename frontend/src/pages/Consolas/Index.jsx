import React, { useEffect, useState } from 'react';
import { Link, Outlet, useMatch } from 'react-router-dom';
import { getConsolas } from '../../api/consola'; // API para consolas
import { useAuth } from '../../components/AuthContext';
import './Index.css';

export default function ConsolaIndex() {
    const { userRole } = useAuth();
    const isAtIndex = useMatch({ path: '/consolas', end: true });

    const [consolas, setConsolas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                console.log('[ConsolaIndex] Llamando a getConsolas...');
                const data = await getConsolas();
                console.log('[ConsolaIndex] Datos recibidos:', data);
                setConsolas(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('[ConsolaIndex] Error cargando consolas:', err);
                setError('Error cargando consolas desde el servidor.');
            }
        }
        fetchData();
    }, []);

    const handleSearch = (e) => {
        e?.preventDefault();
        console.log('[ConsolaIndex] Buscar Consola:', searchTerm);
        // Aquí puedes agregar búsqueda backend: llamar searchConsola(searchTerm) y setConsolas(resultado)
    };

    const canCreate = userRole === 'ADMIN' || userRole === 'ENCARGADO';
    const canEdit = userRole === 'ADMIN' || userRole === 'ENCARGADO';
    const canDelete = userRole === 'ADMIN';

    return (
        <div className="container mt-4">
            {isAtIndex && (
                <>
                    <div className="mb-3 d-flex flex-wrap gap-2">
                        {canCreate && (
                            <Link to="/consolas/create" className="btn btn-primary">Añadir Consola</Link>
                        )}
                    </div>

                    {error && <div className="alert alert-warning text-center">{error}</div>}

                    <div className="row">
                        {consolas.length === 0 && !error && (
                            <div className="col-12 text-center">No hay consolas disponibles.</div>
                        )}

                        {consolas.map((item, index) => (
                            <div key={item?.idConsola ?? index} className="col-sm-6 col-md-4 col-lg-3 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <img
                                        src={item?.imagen || '/placeholder.png'}
                                        className="card-img-top"
                                        alt={item?.modelo || 'Consola'}
                                        style={{ height: '180px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title">{item?.modelo || 'Desconocido'}</h5>
                                        <p className="card-text mb-1">Marca: {item?.marca || 'N/A'}</p>
                                        <p className="card-text mb-2">Memoria: {item?.memoria || 'N/A'}</p>
                                        <p className="card-text mb-2">Plataforma: {item?.plataforma || 'N/A'}</p>
                                        <p className="card-text mb-3">Edición Especial: {item?.edicionEspecial ? 'Sí' : 'No'}</p>
                                        <p className="card-text fw-bold mb-3">
                                            Precio: {item?.precio != null && typeof item.precio === 'number'
                                                ? item.precio.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })
                                                : (item?.precio != null ? item.precio : 'N/A')}
                                        </p>

                                        <div className="mt-auto d-flex gap-2">
                                            <Link to={`/consolas/details/${item?.idConsola}`} className="btn btn-primary flex-grow-1">Detalles</Link>
                                            {canEdit && (
                                                <Link to={`/consolas/edit/${item?.idConsola}`} className="btn btn-warning flex-grow-1">Editar</Link>
                                            )}
                                            {canDelete && (
                                                <Link to={`/consolas/delete/${item?.idConsola}`} className="btn btn-danger flex-grow-1">Borrar</Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <Outlet />
        </div>
    );
}
