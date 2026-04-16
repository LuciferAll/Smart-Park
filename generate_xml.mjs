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

const cruds = [
    { id: 'user', name: 'User', title: 'User' },
    { id: 'kendaraan', name: 'Kendaraan', title: 'Kendaraan' },
    { id: 'tarif', name: 'Tarif', title: 'Tarif Parkir' },
    { id: 'area', name: 'Area', title: 'Area Parkir' }
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2024-04-16T00:00:00.000Z" agent="Mozilla/5.0" version="21.1.2">
`;

function createElement(id, value, style, x, y, width, height) {
    return `<mxCell id="n${id}" value="${escapeXml(value)}" style="${escapeXml(style)}" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
    </mxCell>\n`;
}

function createEdge(id, source, target, value, style = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;") {
    return `<mxCell id="e${id}" value="${escapeXml(value)}" style="${escapeXml(style)}" edge="1" parent="1" source="n${source}" target="n${target}">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>\n`;
}

cruds.forEach((crud) => {
    xml += `  <diagram id="diag_${crud.id}" name="CRUD ${escapeXml(crud.name)}">
    <mxGraphModel dx="1422" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />\n`;

    let nId = 2;
    const g = () => nId++;

    const start = g();
    const menu = g();
    const table = g();
    const action = g();

    const t_form = g();
    const t_input = g();
    const t_val = g();
    const t_err = g();
    const t_save = g();

    const e_pilih = g();
    const e_form = g();
    const e_input = g();
    const e_val = g();
    const e_err = g();
    const e_save = g();

    const h_pilih = g();
    const h_conf = g();
    const h_relasi = g();
    const h_fail = g();
    const h_save = g();

    let ox = 500;
    let oy = 50;

    xml += createElement(start, "START", "ellipse;whiteSpace=wrap;html=1;fontStyle=1", ox, oy, 100, 50);
    xml += createElement(menu, `Admin masuk menu ${crud.title}`, "rounded=1;whiteSpace=wrap;html=1;", ox-20, oy+90, 140, 50);
    xml += createElement(table, `Tampilkan daftar ${crud.name} dalam tabel`, "rounded=1;whiteSpace=wrap;html=1;", ox-20, oy+180, 140, 50);
    xml += createElement(action, "Admin pilih aksi?", "rhombus;whiteSpace=wrap;html=1;", ox-20, oy+270, 140, 80);

    xml += createEdge(g(), start, menu, "");
    xml += createEdge(g(), menu, table, "");
    xml += createEdge(g(), table, action, "");

    let tx = ox - 350;
    xml += createElement(t_form, `Tampilkan form input ${crud.name} baru`, "rounded=1;whiteSpace=wrap;html=1;", tx, oy+380, 140, 50);
    xml += createElement(t_input, "Admin input data", "shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fixedSize=1;", tx, oy+470, 140, 50);
    xml += createElement(t_val, "Validasi input?", "rhombus;whiteSpace=wrap;html=1;", tx, oy+560, 140, 80);
    xml += createElement(t_err, "Error validasi", "rounded=1;whiteSpace=wrap;html=1;", tx-200, oy+575, 140, 50);
    xml += createElement(t_save, "Simpan data", "rounded=1;whiteSpace=wrap;html=1;", tx, oy+680, 140, 50);

    xml += createEdge(g(), action, t_form, "Tambah");
    xml += createEdge(g(), t_form, t_input, "");
    xml += createEdge(g(), t_input, t_val, "");
    
    let e1 = g();
    xml += `<mxCell id="e${e1}" value="Gagal" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="n${t_val}" target="n${t_err}">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>\n`;
    let e2 = g();
    xml += `<mxCell id="e${e2}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="n${t_err}" target="n${t_input}">
      <mxGeometry relative="1" as="geometry">
        <Array as="points">
            <mxPoint x="${tx-130}" y="${oy+495}" />
        </Array>
      </mxGeometry>
    </mxCell>\n`;
    xml += createEdge(g(), t_val, t_save, "Sukses");

    let ex = ox - 20;
    xml += createElement(e_pilih, `Pilih ${crud.name} yang diedit`, "rounded=1;whiteSpace=wrap;html=1;", ex, oy+380, 140, 50);
    xml += createElement(e_form, "Tampilkan form dengan data existing", "rounded=1;whiteSpace=wrap;html=1;", ex, oy+470, 140, 50);
    xml += createElement(e_input, "Admin mengubah data", "shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fixedSize=1;", ex, oy+560, 140, 50);
    xml += createElement(e_val, "Validasi input?", "rhombus;whiteSpace=wrap;html=1;", ex, oy+650, 140, 80);
    xml += createElement(e_err, "Error validasi", "rounded=1;whiteSpace=wrap;html=1;", ex+200, oy+665, 140, 50);
    xml += createElement(e_save, "Update data", "rounded=1;whiteSpace=wrap;html=1;", ex, oy+770, 140, 50);

    xml += createEdge(g(), action, e_pilih, "Edit");
    xml += createEdge(g(), e_pilih, e_form, "");
    xml += createEdge(g(), e_form, e_input, "");
    xml += createEdge(g(), e_input, e_val, "");
    let e3 = g();
    xml += `<mxCell id="e${e3}" value="Gagal" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="n${e_val}" target="n${e_err}">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>\n`;
    let e4 = g();
    xml += `<mxCell id="e${e4}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="n${e_err}" target="n${e_input}">
      <mxGeometry relative="1" as="geometry">
        <Array as="points">
            <mxPoint x="${ex+270}" y="${oy+585}" />
        </Array>
      </mxGeometry>
    </mxCell>\n`;
    xml += createEdge(g(), e_val, e_save, "Sukses");

    let hx = ox + 350;
    xml += createElement(h_pilih, `Pilih ${crud.name} yang dihapus`, "rounded=1;whiteSpace=wrap;html=1;", hx, oy+380, 140, 50);
    xml += createElement(h_conf, "Konfirmasi hapus?", "rhombus;whiteSpace=wrap;html=1;", hx, oy+470, 140, 80);
    xml += createElement(h_relasi, "Cek penggunaan &lt;br&gt;di transaksi aktif?", "rhombus;whiteSpace=wrap;html=1;", hx, oy+600, 140, 100);
    xml += createElement(h_fail, `Data terpakai`, "rounded=1;whiteSpace=wrap;html=1;", hx+220, oy+625, 140, 50);
    xml += createElement(h_save, "Hapus data", "rounded=1;whiteSpace=wrap;html=1;", hx, oy+750, 140, 50);

    xml += createEdge(g(), action, h_pilih, "Hapus");
    xml += createEdge(g(), h_pilih, h_conf, "");
    
    let e5 = g();
    xml += `<mxCell id="e${e5}" value="Tidak" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="n${h_conf}" target="n${table}">
      <mxGeometry relative="1" as="geometry">
        <Array as="points">
            <mxPoint x="${hx+450}" y="${oy+510}" />
            <mxPoint x="${hx+450}" y="${oy+205}" />
        </Array>
      </mxGeometry>
    </mxCell>\n`;
    
    xml += createEdge(g(), h_conf, h_relasi, "Ya");
    xml += createEdge(g(), h_relasi, h_fail, "Ya (terpakai)");
    xml += createEdge(g(), h_relasi, h_save, "Tidak");

    let back_t = g();
    xml += `<mxCell id="e${back_t}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="n${t_save}" target="n${table}">
      <mxGeometry relative="1" as="geometry">
        <Array as="points">
            <mxPoint x="${tx-250}" y="${oy+705}" />
            <mxPoint x="${tx-250}" y="${oy+205}" />
        </Array>
      </mxGeometry>
    </mxCell>\n`;

    let back_e = g();
    xml += `<mxCell id="e${back_e}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0.75;entryDx=0;entryDy=0;" edge="1" parent="1" source="n${e_save}" target="n${table}">
      <mxGeometry relative="1" as="geometry">
        <Array as="points">
            <mxPoint x="${tx-100}" y="${oy+795}" />
            <mxPoint x="${tx-100}" y="${oy+218}" />
        </Array>
      </mxGeometry>
    </mxCell>\n`;

    let back_h = g();
    xml += `<mxCell id="e${back_h}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=1;entryY=0.75;entryDx=0;entryDy=0;" edge="1" parent="1" source="n${h_save}" target="n${table}">
      <mxGeometry relative="1" as="geometry">
        <Array as="points">
            <mxPoint x="${hx+420}" y="${oy+775}" />
            <mxPoint x="${hx+420}" y="${oy+218}" />
        </Array>
      </mxGeometry>
    </mxCell>\n`;

    let back_hf = g();
    xml += `<mxCell id="e${back_hf}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=1;entryY=0.25;entryDx=0;entryDy=0;" edge="1" parent="1" source="n${h_fail}" target="n${table}">
      <mxGeometry relative="1" as="geometry">
        <Array as="points">
            <mxPoint x="${hx+420}" y="${oy+650}" />
            <mxPoint x="${hx+420}" y="${oy+193}" />
        </Array>
      </mxGeometry>
    </mxCell>\n`;

    xml += `      </root>
    </mxGraphModel>
  </diagram>\n`;
});

xml += `</mxfile>\n`;

fs.writeFileSync('cruds.drawio', xml);
console.log('generated');
