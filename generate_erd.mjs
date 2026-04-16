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

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2024-04-16T00:00:00.000Z" agent="Mozilla/5.0" version="21.1.2">
  <diagram id="erd_diagram" name="ERD Parking System">
    <mxGraphModel dx="1422" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />\n`;

let nId = 2;
const g = () => nId++;

function createRect(value, x, y) {
    let id = g();
    xml += `<mxCell id="n${id}" value="${escapeXml(value)}" style="rounded=0;whiteSpace=wrap;html=1;fontStyle=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="120" height="60" as="geometry" />
    </mxCell>\n`;
    return id;
}

function createOval(value, x, y, isPk = false) {
    let id = g();
    let style = isPk ? "ellipse;whiteSpace=wrap;html=1;fontStyle=4;fillColor=#ffe6cc;strokeColor=#d79b00;" : "ellipse;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;";
    xml += `<mxCell id="n${id}" value="${escapeXml(value)}" style="${style}" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="90" height="40" as="geometry" />
    </mxCell>\n`;
    return id;
}

function createDiamond(value, x, y) {
    let id = g();
    xml += `<mxCell id="n${id}" value="${escapeXml(value)}" style="rhombus;whiteSpace=wrap;html=1;fontStyle=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="100" height="80" as="geometry" />
    </mxCell>\n`;
    return id;
}

function createEdge(source, target, label = "") {
    let id = g();
    xml += `<mxCell id="e${id}" value="${escapeXml(label)}" style="endArrow=none;html=1;rounded=0;" edge="1" parent="1" source="n${source}" target="n${target}">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>\n`;
}

// Entities layout
const e_user = createRect("tb_user", 200, 200);
const e_area = createRect("tb_area_parkir", 600, 200);
const e_tarif = createRect("tb_tarif", 950, 200);
const e_log = createRect("tb_log_aktivitas", 200, 600);
const e_trans = createRect("tb_transaksi", 600, 600);
const e_ken = createRect("tb_kendaraan", 950, 600);

// Attributes Helper
function attachAttrs(entityId, ex, ey, attrs) {
    const radius = 100;
    const angleStep = (Math.PI * 2) / attrs.length;
    attrs.forEach((attr, i) => {
        const ax = ex + 15 + radius * Math.cos(i * angleStep);
        const ay = ey + 10 + radius * Math.sin(i * angleStep);
        const attrId = createOval(attr.name, ax, ay, attr.pk);
        createEdge(entityId, attrId);
    });
}

attachAttrs(e_user, 200, 200, [
    {name: "id", pk: true}, {name: "username", pk: false}, {name: "password", pk: false}, {name: "name", pk: false}, {name: "role", pk: false}
]);

attachAttrs(e_area, 600, 200, [
    {name: "id", pk: true}, {name: "nama_area", pk: false}, {name: "max_kapasitas", pk: false}, {name: "terisi", pk: false}
]);

attachAttrs(e_tarif, 950, 200, [
    {name: "id", pk: true}, {name: "jenis_kend", pk: false}, {name: "jam_pertama", pk: false}, {name: "jam_berikut", pk: false}, {name: "max_biaya", pk: false}
]);

attachAttrs(e_log, 200, 600, [
    {name: "id", pk: true}, {name: "aksi", pk: false}, {name: "timestamp", pk: false}
]);

attachAttrs(e_trans, 600, 600, [
    {name: "id", pk: true}, {name: "no_tiket", pk: false}, {name: "waktu_masuk", pk: false}, {name: "waktu_keluar", pk: false}, {name: "biaya", pk: false}, {name: "status", pk: false}
]);

attachAttrs(e_ken, 950, 600, [
    {name: "id", pk: true}, {name: "plat_nomor", pk: false}, {name: "jenis", pk: false}, {name: "merk", pk: false}, {name: "warna", pk: false}
]);

// Relationships
// User <Bertugas_di> Area
const r_bertugas = createDiamond("Bertugas_di", 400, 190);
createEdge(e_user, r_bertugas, "N");
createEdge(r_bertugas, e_area, "1");

// User <Mencatat> Log
const r_mencatat = createDiamond("Men-generate", 210, 400);
createEdge(e_user, r_mencatat, "1");
createEdge(r_mencatat, e_log, "N");

// Area <Menampung> Transaksi
const r_menampung = createDiamond("Menampung", 610, 400);
createEdge(e_area, r_menampung, "1");
createEdge(r_menampung, e_trans, "N");

// Transaksi <Menggunakan> Kendaraan
const r_menggunakan = createDiamond("Terhubung_ke", 780, 590);
createEdge(e_trans, r_menggunakan, "N");
createEdge(r_menggunakan, e_ken, "1");

// Transaksi <Diproses_oleh> User
const r_diproses = createDiamond("Diproses_oleh", 400, 400);
createEdge(e_trans, r_diproses, "N");
createEdge(r_diproses, e_user, "1");

xml += `      </root>
    </mxGraphModel>
  </diagram>
</mxfile>\n`;

fs.writeFileSync('erd.drawio', xml);
console.log('generated erd');
