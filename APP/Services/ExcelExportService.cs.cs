using ClosedXML.Excel;
using APP.Models;
using System.Collections.Generic;
using System.IO;
using System;

namespace APP.Services
{
    public interface IExcelExportService
    {
        byte[] ExportConsolasToExcel(List<Consola> consolas);
    }

    public class ExcelExportService : IExcelExportService
    {
        public byte[] ExportConsolasToExcel(List<Consola> consolas)
        {
            using (var workbook = new XLWorkbook())
            {
                var sheet = workbook.Worksheets.Add("Listado de Consolas");

                // Encabezados
                sheet.Cell(1, 1).Value = "ID";
                sheet.Cell(1, 2).Value = "Marca";
                sheet.Cell(1, 3).Value = "Modelo";
                sheet.Cell(1, 4).Value = "Almacenamiento";
                sheet.Cell(1, 5).Value = "Generación";
                sheet.Cell(1, 6).Value = "Incluye Juegos";
                sheet.Cell(1, 7).Value = "Precio";
                sheet.Cell(1, 8).Value = "Proveedor";

                var header = sheet.Range(1, 1, 1, 8);
                header.Style.Font.Bold = true;
                header.Style.Fill.BackgroundColor = XLColor.LightGray;

                int row = 2;
                foreach (var consola in consolas)
                {
                    sheet.Cell(row, 1).Value = consola.IdConsola;
                    sheet.Cell(row, 2).Value = consola.Marca ?? "N/A";
                    sheet.Cell(row, 3).Value = consola.Modelo ?? "N/A";
                    sheet.Cell(row, 4).Value = consola.Almacenamiento ?? "N/A";
                    sheet.Cell(row, 5).Value = consola.Generacion ?? "N/A";
                    sheet.Cell(row, 6).Value = consola.IncluyeJuegos ? "Sí" : "No";
                    sheet.Cell(row, 7).Value = consola.Precio;
                    sheet.Cell(row, 8).Value = consola.Proveedor?.Nombre ?? "Sin proveedor";
                    row++;
                }

                sheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }
            }
        }
    }
}
