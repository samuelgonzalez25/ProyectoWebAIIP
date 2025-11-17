// DTOs/ConsolaExportDTO.cs
using System;

namespace APP.DTOs
{
    public class ConsolaExportDTO
    {
        public int IdConsola { get; set; }
        public string Marca { get; set; } = string.Empty;
        public string Modelo { get; set; } = string.Empty;
        public string Memoria { get; set; } = string.Empty;   // equivalente a VRAM
        public string Plataforma { get; set; } = string.Empty; // por ejemplo: "PlayStation", "Xbox"
        public string Imagen { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public ProveedorDTO Proveedor { get; set; } = new ProveedorDTO();
    }

    public class ProveedorDTO
    {
        public int IdProveedor { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
