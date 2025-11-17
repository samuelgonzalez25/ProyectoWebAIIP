import axios from "axios";

// URL base del backend ASP.NET para consolas
const API_URL = "http://localhost:5157/api/consola";

// helper para normalizar errores de axios
function formatAxiosError(err) {
  const e = new Error(err.message || "Network error");
  if (err.response) {
    e.status = err.response.status;
    e.body = err.response.data;
    e.message = (err.response.data && (err.response.data.error || err.response.data.message)) || err.message;
  } else if (err.request) {
    e.status = 0;
    e.body = null;
  }
  return e;
}

// --- OBTENER TODAS LAS CONSOLAS ---
export async function getConsolas() {
  try {
    console.log("[consola.js] Llamando a GET Consolas...");
    const resp = await axios.get(API_URL);
    return Array.isArray(resp.data) ? resp.data : [];
  } catch (err) {
    console.error("[consola.js] Error en getConsolas:", err);
    throw formatAxiosError(err);
  }
}

// --- OBTENER PROVEEDORES --- (extrae proveedores embebidos)
export async function getProveedores() {
  try {
    console.log("[consola.js] Extrayendo proveedores desde getConsolas...");
    const consolas = await getConsolas();
    if (!Array.isArray(consolas) || consolas.length === 0) return [];

    const map = new Map();
    consolas.forEach((c) => {
      const p = c?.proveedor || c?.Proveedor || null;
      if (!p) return;
      const proveedor = {
        IdProveedor: p.IdProveedor ?? p.idProveedor ?? p.Id ?? p.id ?? null,
        Nombre: p.Nombre ?? p.nombre ?? p.name ?? "",
        Direccion: p.Direccion ?? p.direccion ?? p.address ?? "",
        Telefono: p.Telefono ?? p.telefono ?? p.phone ?? "",
        Email: p.Email ?? p.email ?? "",
        raw: p,
      };
      const key = proveedor.IdProveedor ?? proveedor.Email ?? proveedor.Nombre ?? JSON.stringify(proveedor.raw);
      if (!map.has(key)) map.set(key, proveedor);
    });

    return Array.from(map.values()).map(p => ({
      IdProveedor: p.IdProveedor,
      Nombre: p.Nombre,
      Direccion: p.Direccion,
      Telefono: p.Telefono,
      Email: p.Email,
      id: p.IdProveedor,
      nombre: p.Nombre,
      _raw: p.raw,
    }));
  } catch (err) {
    console.error("[consola.js] Error en getProveedores:", err);
    throw err;
  }
}

// --- OBTENER CONSOLA POR ID ---
export async function getConsola(id) {
  if (!id) throw new Error("ID de Consola requerido");
  const idNum = Number(id);
  try {
    console.log("[consola.js] Llamando a getConsola:", idNum);
    const resp = await axios.get(`${API_URL}/${idNum}`);
    return resp.data;
  } catch (err) {
    console.error("[consola.js] Error en getConsola:", err);
    throw formatAxiosError(err);
  }
}

// --- BUSCAR CONSOLA POR TÉRMINO ---
export async function searchConsola(searchTerm) {
  if (!searchTerm || searchTerm.trim() === "") return [];
  try {
    console.log("[consola.js] Llamando a searchConsola:", searchTerm);
    const resp = await axios.get(`${API_URL}/search`, { params: { searchTerm } });
    return Array.isArray(resp.data) ? resp.data : [];
  } catch (err) {
    console.error("[consola.js] Error en searchConsola:", err);
    throw formatAxiosError(err);
  }
}

// --- CREAR CONSOLA ---
export async function createConsola(consola = {}, proveedor = null) {
  try {
    console.log("[consola.js] Llamando a createConsola:", { consola, proveedor });
    const resp = await axios.post(API_URL, { Consola: consola, Proveedor: proveedor });
    return resp.data;
  } catch (err) {
    console.error("[consola.js] Error en createConsola:", err);
    throw formatAxiosError(err);
  }
}

// --- ACTUALIZAR CONSOLA ---
export async function updateConsola(id, consola = {}, proveedor = null) {
  if (!id) throw new Error("ID de Consola requerido");
  const idNum = Number(id);
  try {
    console.log("[consola.js] Llamando a updateConsola:", idNum, { consola, proveedor });
    const resp = await axios.put(`${API_URL}/${idNum}`, { Consola: consola, Proveedor: proveedor });
    return resp.data;
  } catch (err) {
    console.error("[consola.js] Error en updateConsola:", err);
    throw formatAxiosError(err);
  }
}

// --- ELIMINAR CONSOLA ---
export async function deleteConsola(id) {
  if (!id) throw new Error("ID de Consola requerido");
  const idNum = Number(id);
  try {
    console.log("[consola.js] Llamando a deleteConsola:", idNum);
    await axios.delete(`${API_URL}/${idNum}`);
    return true;
  } catch (err) {
    console.error("[consola.js] Error en deleteConsola:", err);
    throw formatAxiosError(err);
  }
}
