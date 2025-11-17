using Microsoft.AspNetCore.Mvc;
using APP.Data;
using APP.Models;
using APP.Filters;
using APP.Services;
using System.Collections.Generic;
using System.Linq;
using System;

namespace APP.Controllers
{
    [ApiController]
    [Route("api/export")]
    [AuthorizeSession("ADMIN", "ENCARGADO")] // Solo roles con permiso
    public class ConsolaExportController : ControllerBase
    {
        private readonly ConexionMySql _db;
        private readonly IExcelExportService _excelExportService;

        public ConsolaExportController(ConexionMySql db, IExcelExportService excelExportService)
        {
            _db = db;
            _excelExportService = excelExportService;
        }

        // --- Exportar todas las Consolas a Excel
        [HttpGet("consolas/excel")]
        public IActionResult ExportConsolasToExcel()
        {
            var consolas = _db.ObtenerConsolas();

            if (consolas == null || !consolas.Any())
                return NotFound(new { error = "No se encontraron consolas para exportar." });

            var excelData = _excelExportService.ExportConsolasToExcel(consolas);

            return File(excelData,
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        $"Consolas_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }

        // --- Exportar Consola individual a Excel
        [HttpGet("consola/{id}/excel")]
        public IActionResult ExportSingleConsolaToExcel(int id)
        {
            var consola = _db.ObtenerConsolas().FirstOrDefault(c => c.IdConsola == id);

            if (consola == null)
                return NotFound(new { error = "Consola no encontrada." });

            var excelData = _excelExportService.ExportConsolasToExcel(new List<Consola> { consola });

            return File(excelData,
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        $"Consola_{consola.Modelo}_{DateTime.Now:yyyyMMddHHmmss}.xlsx");
        }
    }
}
