using Microsoft.AspNetCore.Mvc;
using APP.Data;
using APP.Models;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Text.Json;

namespace APP.Controllers
{
    [Route("api/consola")]
    [ApiController]
    [Authorize] // JWT obligatorio
    public class ConsolaApiController : ControllerBase
    {
        private readonly ConexionMySql _db;

        public ConsolaApiController(ConexionMySql db)
        {
            _db = db;
        }

        // DTO para crear/editar consola + proveedor opcional
        public class ConsolaCreateEditDTO
        {
            public Consola Consola { get; set; }
            public Proveedor Proveedor { get; set; }
        }

        // --- LISTAR TODAS LAS CONSOLAS ---
        [HttpGet]
        public IActionResult GetConsolas()
        {
            try
            {
                var lista = _db.ObtenerConsolas() ?? new List<Consola>();

                var result = lista.Select(c => new
                {
                    c.IdConsola,
                    c.Marca,
                    c.Modelo,
                    c.Almacenamiento,
                    c.Generacion,
                    c.IncluyeJuegos,
                    c.Precio,
                    c.Imagen,
                    Proveedor = c.Proveedor == null ? null : new
                    {
                        c.Proveedor.IdProveedor,
                        c.Proveedor.Nombre,
                        c.Proveedor.Direccion,
                        c.Proveedor.Telefono,
                        c.Proveedor.Email
                    }
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ConsolaApiController] Error en GetConsolas: {ex}");
                return StatusCode(500, new { error = "Error interno al listar consolas" });
            }
        }

        // --- BUSCAR POR MODELO ---
        [HttpGet("search")]
        public IActionResult Search([FromQuery] string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return BadRequest(new { error = "Debe enviar searchTerm" });

            try
            {
                var lista = _db.ObtenerConsolas() ?? new List<Consola>();
                var resultados = lista
                    .Where(c => !string.IsNullOrEmpty(c.Modelo) &&
                                c.Modelo.IndexOf(searchTerm, StringComparison.OrdinalIgnoreCase) >= 0)
                    .Select(c => new
                    {
                        c.IdConsola,
                        c.Marca,
                        c.Modelo,
                        c.Almacenamiento,
                        c.Generacion,
                        c.IncluyeJuegos,
                        c.Precio,
                        c.Imagen,
                        Proveedor = c.Proveedor == null ? null : new
                        {
                            c.Proveedor.IdProveedor,
                            c.Proveedor.Nombre
                        }
                    })
                    .ToList();

                if (!resultados.Any())
                    return NotFound(new { error = $"No se encontraron consolas con '{searchTerm}'." });

                return Ok(resultados);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ConsolaApiController] Error en Search('{searchTerm}'): {ex}");
                return StatusCode(500, new { error = "Error interno al buscar consolas" });
            }
        }

        // --- OBTENER CONSOLA POR ID ---
        [HttpGet("{id}")]
        public IActionResult GetConsola(int id)
        {
            try
            {
                var consola = _db.ObtenerConsolas()?.FirstOrDefault(c => c.IdConsola == id);

                if (consola == null)
                    return NotFound(new { error = "Consola no encontrada" });

                var result = new
                {
                    consola.IdConsola,
                    consola.Marca,
                    consola.Modelo,
                    consola.Almacenamiento,
                    consola.Generacion,
                    consola.IncluyeJuegos,
                    consola.Precio,
                    consola.Imagen,
                    Proveedor = consola.Proveedor == null ? null : new
                    {
                        consola.Proveedor.IdProveedor,
                        consola.Proveedor.Nombre,
                        consola.Proveedor.Direccion,
                        consola.Proveedor.Telefono,
                        consola.Proveedor.Email
                    }
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ConsolaApiController] Error en GetConsola id={id}: {ex}");
                return StatusCode(500, new { error = "Error interno al obtener consola" });
            }
        }

        // --- UTIL: parsear body ---
        private bool TryParseDto(JsonElement body, out ConsolaCreateEditDTO dto, out string errorMessage)
        {
            dto = null;
            errorMessage = null;
            try
            {
                var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                dto = JsonSerializer.Deserialize<ConsolaCreateEditDTO>(body.GetRawText(), opts);

                if (dto == null || dto.Consola == null)
                {
                    try
                    {
                        var singleConsola = JsonSerializer.Deserialize<Consola>(body.GetRawText(), opts);
                        if (singleConsola != null)
                        {
                            dto = new ConsolaCreateEditDTO { Consola = singleConsola, Proveedor = null };
                        }
                    }
                    catch { }
                }

                if (dto == null || dto.Consola == null)
                {
                    errorMessage = "No se encontró un objeto Consola válido en el body.";
                    return false;
                }

                return true;
            }
            catch (JsonException jex)
            {
                errorMessage = "JSON inválido: " + jex.Message;
                return false;
            }
            catch (Exception ex)
            {
                errorMessage = "Error al procesar body: " + ex.Message;
                return false;
            }
        }

        // --- CREAR CONSOLA (ADMIN, ENCARGADO) ---
        [HttpPost]
        [Authorize(Roles = "ADMIN,ENCARGADO")]
        public IActionResult Create([FromBody] JsonElement body)
        {
            try
            {
                Console.WriteLine($"[ConsolaApiController] Create body: {body.GetRawText()}");

                if (!TryParseDto(body, out var dto, out var parseError))
                {
                    return BadRequest(new { error = parseError ?? "Body inválido" });
                }

                var consola = dto.Consola;
                var proveedor = dto.Proveedor;

                var errores = new List<string>();
                if (string.IsNullOrWhiteSpace(consola.Marca)) errores.Add("Marca es obligatoria.");
                if (string.IsNullOrWhiteSpace(consola.Modelo)) errores.Add("Modelo es obligatorio.");
                if (string.IsNullOrWhiteSpace(consola.Almacenamiento)) errores.Add("Almacenamiento es obligatorio.");
                if (string.IsNullOrWhiteSpace(consola.Generacion)) errores.Add("Generación es obligatoria.");
                if (consola.Precio <= 0) errores.Add("Precio debe ser mayor que 0.");

                if (errores.Any())
                    return BadRequest(new { error = "Campos obligatorios incompletos", details = errores });

                consola.Imagen = consola.Imagen ?? string.Empty;

                bool resultado = _db.InsertarConsola(consola, proveedor);
                if (!resultado)
                    return StatusCode(500, new { error = "No se pudo insertar la consola" });

                var bodyResult = new
                {
                    consola.IdConsola,
                    consola.Marca,
                    consola.Modelo,
                    consola.Almacenamiento,
                    consola.Generacion,
                    consola.IncluyeJuegos,
                    consola.Precio,
                    consola.Imagen,
                    Proveedor = proveedor == null ? null : new
                    {
                        proveedor.IdProveedor,
                        proveedor.Nombre,
                        proveedor.Direccion,
                        proveedor.Telefono,
                        proveedor.Email
                    }
                };

                return Ok(bodyResult);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ConsolaApiController] Error en Create: {ex}");
                return StatusCode(500, new { error = "Error interno al crear consola" });
            }
        }

        // --- EDITAR CONSOLA (ADMIN, ENCARGADO) ---
        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN,ENCARGADO")]
        public IActionResult Edit(int id, [FromBody] JsonElement body)
        {
            try
            {
                Console.WriteLine($"[ConsolaApiController] Edit id={id} body: {body.GetRawText()}");

                if (!TryParseDto(body, out var dto, out var parseError))
                    return BadRequest(new { error = parseError ?? "Body inválido" });

                var consola = dto.Consola;
                var proveedor = dto.Proveedor;
                consola.IdConsola = id;

                var errores = new List<string>();
                if (string.IsNullOrWhiteSpace(consola.Marca)) errores.Add("Marca es obligatoria.");
                if (string.IsNullOrWhiteSpace(consola.Modelo)) errores.Add("Modelo es obligatorio.");
                if (string.IsNullOrWhiteSpace(consola.Almacenamiento)) errores.Add("Almacenamiento es obligatorio.");
                if (string.IsNullOrWhiteSpace(consola.Generacion)) errores.Add("Generación es obligatoria.");
                if (consola.Precio <= 0) errores.Add("Precio debe ser mayor que 0.");

                if (errores.Any())
                    return BadRequest(new { error = "Campos obligatorios incompletos", details = errores });

                bool actualizado = _db.EditarConsola(consola, proveedor);
                if (!actualizado)
                    return StatusCode(500, new { error = "No se pudo actualizar la consola" });

                var bodyResult = new
                {
                    consola.IdConsola,
                    consola.Marca,
                    consola.Modelo,
                    consola.Almacenamiento,
                    consola.Generacion,
                    consola.IncluyeJuegos,
                    consola.Precio,
                    consola.Imagen,
                    Proveedor = proveedor == null ? null : new
                    {
                        proveedor.IdProveedor,
                        proveedor.Nombre
                    }
                };

                return Ok(bodyResult);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ConsolaApiController] Error en Edit id={id}: {ex}");
                return StatusCode(500, new { error = "Error interno al editar consola" });
            }
        }

        // --- ELIMINAR CONSOLA (ADMIN) ---
        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public IActionResult Delete(int id)
        {
            try
            {
                bool eliminado = _db.EliminarConsola(id);
                if (!eliminado)
                    return StatusCode(500, new { error = "No se pudo eliminar la consola" });

                return Ok(new { message = "Consola eliminada" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ConsolaApiController] Error en Delete id={id}: {ex}");
                return StatusCode(500, new { error = "Error interno al eliminar consola" });
            }
        }
    }
}
