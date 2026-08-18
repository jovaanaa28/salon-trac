using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Izvestavanje.Api.Migrations
{
    /// <inheritdoc />
    public partial class PocetnaIzvestavanjeBaza : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ObradjeniDogadjaji",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DogadjajId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    VremeObrade = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    TipDogadjaja = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ObradjeniDogadjaji", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Rezervacije",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    RezervacijaIdA1 = table.Column<int>(type: "int", nullable: false),
                    DatumKreiranja = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Status = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rezervacije", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "StavkeRezervacija",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    IzvestajnaRezervacijaId = table.Column<int>(type: "int", nullable: false),
                    UslugaId = table.Column<int>(type: "int", nullable: false),
                    KategorijaUslugeId = table.Column<int>(type: "int", nullable: false),
                    NazivKategorije = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Datum = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    VremePocetka = table.Column<TimeSpan>(type: "time(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StavkeRezervacija", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StavkeRezervacija_Rezervacije_IzvestajnaRezervacijaId",
                        column: x => x.IzvestajnaRezervacijaId,
                        principalTable: "Rezervacije",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ObradjeniDogadjaji_DogadjajId",
                table: "ObradjeniDogadjaji",
                column: "DogadjajId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Rezervacije_RezervacijaIdA1",
                table: "Rezervacije",
                column: "RezervacijaIdA1",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StavkeRezervacija_IzvestajnaRezervacijaId",
                table: "StavkeRezervacija",
                column: "IzvestajnaRezervacijaId");

            migrationBuilder.CreateIndex(
                name: "IX_StavkeRezervacija_KategorijaUslugeId",
                table: "StavkeRezervacija",
                column: "KategorijaUslugeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ObradjeniDogadjaji");

            migrationBuilder.DropTable(
                name: "StavkeRezervacija");

            migrationBuilder.DropTable(
                name: "Rezervacije");
        }
    }
}
