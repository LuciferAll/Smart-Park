import fs from 'fs';

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

const tables = [
  {
    name: "tb_user", x: 230, y: 150,
    cols: [
      { n: "id", t: "varchar(191)", pk: true },
      { n: "name", t: "varchar(191)" },
      { n: "username", t: "varchar(191)" },
      { n: "password", t: "varchar(191)" },
      { n: "role", t: "enum('ADMIN','PETUGAS','OWNER')" },
      { n: "id_area", t: "varchar(191)", fk: true },
      { n: "createdAt", t: "datetime(3)" },
      { n: "updatedAt", t: "datetime(3)" }
    ]
  },
  {
    name: "tb_log_aktivitas", x: 230, y: 450,
    cols: [
      { n: "id", t: "varchar(191)", pk: true },
      { n: "id_user", t: "varchar(191)", fk: true },
      { n: "aksi", t: "varchar(191)" },
      { n: "timestamp", t: "datetime(3)" }
    ]
  },
  {
    name: "tb_kendaraan", x: 250, y: 650,
    cols: [
      { n: "id", t: "varchar(191)", pk: true },
      { n: "plat_nomor", t: "varchar(191)" },
      { n: "jenis_kendaraan", t: "varchar(191)" },
      { n: "merk", t: "varchar(191)" },
      { n: "warna", t: "varchar(191)" },
      { n: "createdAt", t: "datetime(3)" },
      { n: "pemilik", t: "varchar(191)" }
    ]
  },
  {
    name: "tb_transaksi", x: 600, y: 300,
    cols: [
      { n: "id", t: "varchar(191)", pk: true },
      { n: "no_tiket", t: "varchar(191)" },
      { n: "waktu_masuk", t: "datetime(3)" },
      { n: "waktu_keluar", t: "datetime(3)" },
      { n: "durasi_jam", t: "int(11)" },
      { n: "total_biaya", t: "int(11)" },
      { n: "status_pembayaran", t: "enum('PENDING','LUNAS','GAGAL')" },
      { n: "midtrans_token", t: "varchar(191)" },
      { n: "id_user", t: "varchar(191)", fk: true },
      { n: "id_kendaraan", t: "varchar(191)", fk: true },
      { n: "id_area", t: "varchar(191)", fk: true },
      { n: "createdAt", t: "datetime(3)" },
      { n: "updatedAt", t: "datetime(3)" }
    ]
  },
  {
    name: "tb_area_parkir", x: 600, y: 720,
    cols: [
      { n: "id", t: "varchar(191)", pk: true },
      { n: "nama_area", t: "varchar(191)" },
      { n: "max_kapasitas", t: "int(11)" },
      { n: "terisi", t: "int(11)" }
    ]
  },
  {
    name: "tb_jenis_kendaraan", x: 950, y: 350,
    cols: [
      { n: "id", t: "varchar(191)", pk: true },
      { n: "nama", t: "varchar(191)" },
      { n: "createdAt", t: "datetime(3)" }
    ]
  },
  {
    name: "tb_tarif", x: 950, y: 650,
    cols: [
      { n: "id", t: "varchar(191)", pk: true },
      { n: "jenis_kendaraan", t: "varchar(191)" },
      { n: "tarif_jam_pertama", t: "int(11)" },
      { n: "tarif_berikutnya", t: "int(11)" },
      { n: "max_biaya_per_hari", t: "int(11)" }
    ]
  }
];

let xml = `<mxfile host="app.diagrams.net" modified="2024-04-16T00:00:00.000Z" agent="Mozilla/5.0" version="21.1.2">
  <diagram id="class_diagram" name="Class Diagram Parking System">
    <mxGraphModel dx="1422" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />\n`;

let idCounter = 10;
const getId = () => idCounter++;

const dict = {};

tables.forEach(t => {
    let tId = getId();
    dict[t.name] = { id: tId, cols: {} };
    
    // The main table box
    xml += `<mxCell id="t${tId}" value="&lt;b&gt;db_parkir&lt;/b&gt; ${t.name}" style="shape=table;startSize=30;container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=0;align=center;fillColor=#f5f5f5;strokeColor=#666666;" vertex="1" parent="1">
      <mxGeometry x="${t.x}" y="${t.y}" width="250" height="${30 + t.cols.length * 30}" as="geometry"/>
    </mxCell>\n`;

    let currentY = 30;
    t.cols.forEach((c, idx) => {
        let rId = getId();
        let cId = getId();
        dict[t.name].cols[c.n] = cId;
        
        let icon = c.pk ? "🔑 " : (c.fk ? "🔗 " : "🔹 ");
        let bgColor = (idx % 2 === 0) ? "fillColor=none;" : "fillColor=#f9f9f9;";
        
        xml += `<mxCell id="r${rId}" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;top=0;left=0;bottom=0;right=0;collapsible=0;dropTarget=0;${bgColor}points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="t${tId}">
          <mxGeometry y="${currentY}" width="250" height="30" as="geometry"/>
        </mxCell>\n`;
        
        xml += `<mxCell id="c${cId}" value="${icon} ${c.n} : ${c.t}" style="shape=partialRectangle;html=1;whiteSpace=wrap;connectable=0;${bgColor}top=0;left=0;bottom=0;right=0;align=left;spacingLeft=6;" vertex="1" parent="r${rId}">
          <mxGeometry width="250" height="30" as="geometry"/>
        </mxCell>\n`;
        
        currentY += 30;
    });
});

// Relationships
function addRelation(sTable, sCol, tTable, tCol, color) {
    let relId = getId();
    let src = dict[sTable].cols[sCol];
    let tgt = dict[tTable].cols[tCol];
    xml += `<mxCell id="e${relId}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=0;strokeColor=${color};strokeWidth=2;" edge="1" parent="1" source="r${src}" target="r${tgt}">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>\n`;
}

// User to Area
addRelation("tb_user", "id_area", "tb_area_parkir", "id", "#00CC00");
// Log to User
addRelation("tb_log_aktivitas", "id_user", "tb_user", "id", "#00CC00");
// Transaksi to User
addRelation("tb_transaksi", "id_user", "tb_user", "id", "#0000CC");
// Transaksi to Kendaraan
addRelation("tb_transaksi", "id_kendaraan", "tb_kendaraan", "id", "#CCCC00");
// Transaksi to Area
addRelation("tb_transaksi", "id_area", "tb_area_parkir", "id", "#0000CC");


xml += `      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

fs.writeFileSync('class_diagram.drawio', xml);
console.log("Class diagram generated.");
