import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsola, updateConsola, getProveedores } from '../../api/consola';
import './Edit.css';

export default function EditConsola() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [consola, setConsola] = useState({
        IdConsola: id ? Number(id) : 0,
        Marca: '',
        Modelo: '',
        Memoria: '',
        Plataforma: '',
        EdicionEspecial: false,
        Imagen: '',
        Precio: '',
        ProveedoresIdProveedor: ''
    });

    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [consolaData, proveedoresData] = await Promise.all([
                    getConsola(id),
                    getProveedores()
                ]);

                const get = (obj, ...keys) => {
                    for (const k of keys) {
                        if (!obj) continue;
                        if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
                    }
                    return undefined;
                };

                const mapped = {
                    IdConsola: get(consolaData, 'IdConsola', 'idConsola', 'id') ?? Number(id),
                    Marca: get(consolaData, 'Marca', 'marca') ?? '',
                    Modelo: get(consolaData, 'Modelo', 'modelo') ?? '',
                    Memoria: get(consolaData, 'Memoria', 'memoria') ?? '',
                    Plataforma: get(consolaData, 'Plataforma', 'plataforma') ?? '',
                    EdicionEspecial: Boolean(get(consolaData, 'EdicionEspecial', 'edicionEspecial')),
                    Imagen: get(consolaData, 'Imagen', 'imagen') ?? '',
                    Precio: get(consolaData, 'Precio', 'precio') != null ? String(get(consolaData, 'Precio', 'precio')) : '',
                    ProveedoresIdProveedor:
                        get(consolaData?.Proveedor, 'IdProveedor', 'id') ??
                        get(consolaData, 'ProveedoresIdProveedor', 'proveedoresIdProveedor') ??
                        ''
                };

                setConsola(prev => ({ ...prev, ...mapped }));
                setProveedores(Array.isArray(proveedoresData) ? proveedoresData : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConsola(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setErrors({});

            const errores = [];
            if (!consola.Marca.trim()) errores.push('Marca es obligatoria.');
            if (!consola.Modelo.trim()) errores.push('Modelo es obligatorio.');
            if (!consola.Memoria.trim()) errores.push('Memoria es obligatoria.');
            if (!consola.Plataforma.trim()) errores.push('Plataforma es obligatoria.');

            const precio = parseFloat(consola.Precio);
            if (!Number.isFinite(precio) || precio <= 0) errores.push('Precio debe ser un número mayor que 0.');

            if (errores.length > 0) {
                setErrors({ form: errores.join(' ') });
                return;
            }

            const consolaToSend = {
                IdConsola: Number(consola.IdConsola),
                Marca: consola.Marca.trim(),
                Modelo: consola.Modelo.trim(),
                Memoria: consola.Memoria.trim(),
                Plataforma: consola.Plataforma.trim(),
                EdicionEspecial: !!consola.EdicionEspecial,
                Imagen: consola.Imagen.trim() || '',
                Precio: precio,
                ProveedoresIdProveedor: consola.ProveedoresIdProveedor ? Number(consola.ProveedoresIdProveedor) : 0
            };

            await updateConsola(id, consolaToSend, null);
            navigate(`/consola/details/${id}`);
        } catch (err) {
            console.error(err);
            setErrors({ form: 'Error al guardar los cambios' });
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (!consola) return <div>Consola no encontrada</div>;

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Editar Consola: {consola.Modelo}</h2>

            {errors.form && <div className="alert alert-danger">{errors.form}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Marca</label>
                    <input type="text" name="Marca" value={consola.Marca} onChange={handleChange} className="form-control" required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Modelo</label>
                    <input type="text" name="Modelo" value={consola.Modelo} onChange={handleChange} className="form-control" required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Memoria</label>
                    <input type="text" name="Memoria" value={consola.Memoria} onChange={handleChange} className="form-control" required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Plataforma</label>
                    <input type="text" name="Plataforma" value={consola.Plataforma} onChange={handleChange} className="form-control" required />
                </div>

                <div className="mb-3 form-check">
                    <input type="checkbox" name="EdicionEspecial" checked={!!consola.EdicionEspecial} onChange={handleChange} className="form-check-input" />
                    <label className="form-check-label">Edición Especial</label>
                </div>

                <div className="mb-3">
                    <label className="form-label">Precio</label>
                    <input type="number" step="0.01" name="Precio" value={consola.Precio} onChange={handleChange} className="form-control" required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Proveedor</label>
                    <select name="ProveedoresIdProveedor" value={String(consola.ProveedoresIdProveedor ?? '')} onChange={handleChange} className="form-select">
                        <option value="">-- Seleccione un proveedor --</option>
                        {proveedores.map(p => (
                            <option key={p.IdProveedor ?? p.id} value={p.IdProveedor ?? p.id}>{p.Nombre ?? p.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">URL Imagen</label>
                    <input type="text" name="Imagen" value={consola.Imagen} onChange={handleChange} className="form-control" />
                </div>

                <button type="submit" className="btn btn-warning">Guardar cambios</button>
                <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate(`/consolas/details/${consola.IdConsola}`)}>Cancelar</button>
            </form>
        </div>
    );
}
