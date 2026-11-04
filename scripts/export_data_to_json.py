# -*- coding: utf-8 -*-
"""
Extractor exacto y limpio desde Datos_PISA_Lectura_Chile_PowerBI.xlsx hacia JSON y JS
sin alteraciones en los nombres de las hojas y columnas.
"""
import openpyxl
import json
import math

def clean_val(val):
    if val is None:
        return None
    if isinstance(val, float):
        if math.isnan(val) or math.isinf(val):
            return None
        return round(val, 4)
    if isinstance(val, int):
        return val
    txt = str(val).strip()
    txt = txt.replace('M\ufffdxico', 'México').replace('Per\ufffd', 'Perú')
    txt = txt.replace('Rep\ufffdblica Dominicana', 'República Dominicana')
    txt = txt.replace('Latinoam\ufffdrica', 'Latinoamérica')
    txt = txt.replace('C\ufffdlculo', 'Cálculo')
    txt = txt.replace('Canad\ufffd', 'Canadá').replace('Panam\ufffd', 'Panamá')
    return txt

def clean_header(h):
    if h is None:
        return ""
    txt = str(h).strip()
    # Normalizaciones seguras sólo para acentos comunes
    txt = txt.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
    txt = txt.replace('Á', 'A').replace('É', 'E').replace('Í', 'I').replace('Ó', 'O').replace('Ú', 'U')
    txt = txt.replace('ñ', 'n').replace('Ñ', 'N')
    txt = txt.replace('Año', 'Anio').replace('Ao', 'Anio').replace('Ao', 'Anio')
    txt = txt.replace('Matrícula', 'Matricula').replace('Matrcula', 'Matricula').replace('Matrcula', 'Matricula')
    txt = txt.replace('Población', 'Poblacion').replace('Poblacin', 'Poblacion').replace('Poblacin', 'Poblacion')
    txt = txt.replace('%', 'pct').replace('°', 'deg').replace('7º', '7mo').replace('7°', '7mo').replace('7', '7mo')
    txt = txt.replace(' ', '_').replace('+', '_mas').replace('-', '_').replace('(', '').replace(')', '').replace('/', '_')
    txt = txt.replace('__', '_').strip('_')
    return txt

def main():
    excel_path = 'Datos_PISA_Lectura_Chile_PowerBI.xlsx'
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    all_data = {}

    for sheet in wb.sheetnames:
        ws = wb[sheet]
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            continue
        headers = [clean_header(c) for c in rows[0]]
        records = []
        for r in rows[1:]:
            if all(c is None for c in r):
                continue
            row_dict = {}
            for h, v in zip(headers, r):
                if h:
                    row_dict[h] = clean_val(v)
            records.append(row_dict)
        all_data[sheet] = records
        print(f"Hoja '{sheet}': {len(records)} registros exportados.")

    out_json = 'web_mistrall_pisa/data/pisa_data.json'
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)

    out_js = 'web_mistrall_pisa/data/pisa_data.js'
    with open(out_js, 'w', encoding='utf-8') as f:
        f.write('window.PISA_DATA = ' + json.dumps(all_data, ensure_ascii=False) + ';')

    print(f"\nGenerados correctamente:\n  {out_json}\n  {out_js}")

if __name__ == '__main__':
    main()
