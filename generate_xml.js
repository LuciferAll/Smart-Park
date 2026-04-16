const fs = require('fs');

const tables = {
  tb_user: {
    x: 80, y: 40, width: 280,
    fields: [
      "id : varchar(191)", "name : varchar(191)", "username : varchar(191)", "password : varchar(191)", 
      "role : enum('ADMIN','PETUGAS','OWNER')", "id_area : varchar(191)", "createdAt : datetime(3)", "updatedAt : datetime(3)"
    ]
  },
  tb_log_aktivitas: {
    x: 80, y: 380, width: 280,
    fields: [
      "id : varchar(191)", "id_user : varchar(191)", "aksi : varchar(191)", "timestamp : datetime(3)"
    ]
  },
  tb_kendaraan: {
    x: 80, y: 560, width: 280,
    fields: [
      "id : varchar(191)", "plat_nomor : varchar(191)", "jenis_kendaraan : varchar(191)", "merk : varchar(191)", 
      "warna : varchar(191)", "pemilik : varchar(191)", "id_user : varchar(191)", "createdAt : datetime(3)"
    ]
  },
  tb_transaksi: {
    x: 480, y: 120, width: 320,
    fields: [
      "id : varchar(191)", "no_tiket : varchar(191)", "waktu_masuk : datetime(3)", "waktu_keluar : datetime(3)", 
      "durasi_jam : int(11)", "total_biaya : int(11)", "status_pembayaran : enum('PENDING','LUNAS','GAGAL')", 
      "midtrans_token : varchar(191)", "id_user : varchar(191)", "id_kendaraan : varchar(191)", "id_area : varchar(191)", 
      "id_tarif : varchar(191)", "createdAt : datetime(3)", "updatedAt : datetime(3)"
    ]
  },
  tb_area_parkir: {
    x: 480, y: 650, width: 320,
    fields: [
      "id : varchar(191)", "nama_area : varchar(191)", "max_kapasitas : int(11)", "terisi : int(11)"
    ]
  },
  tb_jenis_kendaraan: {
    x: 920, y: 380, width: 280,
    fields: [
      "id : varchar(191)", "nama : varchar(191)", "createdAt : datetime(3)"
    ]
  },
  tb_tarif: {
    x: 920, y: 560, width: 280,
    fields: [
      "id : varchar(191)", "jenis_kendaraan : varchar(191)", "tarif_per_jam : decimal(10,0)"
    ]
  }
};

const relations = [
  { source: "tb_log_aktivitas", target: "tb_user" },
  { source: "tb_user", target: "tb_area_parkir" },
  { source: "tb_transaksi", target: "tb_user" },
  { source: "tb_transaksi", target: "tb_area_parkir" },
  { source: "tb_transaksi", target: "tb_tarif" },
  { source: "tb_transaksi", target: "tb_kendaraan" },
  { source: "tb_kendaraan", target: "tb_user" }
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net">
  <diagram name="Page-1" id="diagram1">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
`;

for (const [tableName, tableData] of Object.entries(tables)) {
  const height = 30 + (tableData.fields.length * 30);
  xml += `        <!-- Table ${tableName} -->\n`;
  xml += `        <mxCell id="${tableName}" value="${tableName}" style="swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=30;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;fillColor=#f5f5f5;fontColor=#333333;strokeColor=#666666;" vertex="1" parent="1">\n`;
  xml += `          <mxGeometry x="${tableData.x}" y="${tableData.y}" width="${tableData.width}" height="${height}" as="geometry" />\n`;
  xml += `        </mxCell>\n`;
  
  tableData.fields.forEach((field, index) => {
    const isGray = index % 2 === 1;
    const fillColor = isGray ? "fillColor=#f9f9f9;" : "fillColor=none;";
    xml += `        <mxCell id="${tableName}_f${index}" value="${field}" style="text;strokeColor=none;${fillColor}align=left;verticalAlign=middle;spacingLeft=10;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;html=1;" vertex="1" parent="${tableName}">\n`;
    xml += `          <mxGeometry y="${30 + (index * 30)}" width="${tableData.width}" height="30" as="geometry" />\n`;
    xml += `        </mxCell>\n`;
  });
}

xml += `\n        <!-- Relations -->\n`;
relations.forEach((rel, idx) => {
  xml += `        <mxCell id="edge${idx}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=none;endFill=0;strokeWidth=1.5;strokeColor=#000000;" edge="1" parent="1" source="${rel.source}" target="${rel.target}">\n`;
  xml += `          <mxGeometry relative="1" as="geometry" />\n`;
  xml += `        </mxCell>\n`;
});

xml += `      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;

fs.writeFileSync('ERD_ClassDiagram_SmartPark.xml', xml);
console.log('XML Generated!');
