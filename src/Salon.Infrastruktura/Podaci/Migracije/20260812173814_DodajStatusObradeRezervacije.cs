using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salon.Infrastruktura.Podaci.Migracije
{
    /// <inheritdoc />
    public partial class DodajStatusObradeRezervacije : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ZahteviZaRezervaciju",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    IdZahteva = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Poruka = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RezervacijaId = table.Column<int>(type: "int", nullable: true),
                    DatumKreiranja = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DatumIzmene = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ZahteviZaRezervaciju", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ZahteviZaRezervaciju_Rezervacije_RezervacijaId",
                        column: x => x.RezervacijaId,
                        principalTable: "Rezervacije",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ZahteviZaRezervaciju_IdZahteva",
                table: "ZahteviZaRezervaciju",
                column: "IdZahteva",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ZahteviZaRezervaciju_RezervacijaId",
                table: "ZahteviZaRezervaciju",
                column: "RezervacijaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ZahteviZaRezervaciju");
        }
    }
}
