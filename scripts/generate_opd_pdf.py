#!/usr/bin/env python3
"""
generate_opd_pdf.py
รับ JSON data ผ่าน stdin หรือ argument แล้ว overlay ข้อมูลลงบน OPD PDF template
Output: base64-encoded PDF string ไปยัง stdout
"""

import sys
import json
import base64
import io
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "OPD_template.pdf")
FONT_PATH     = os.path.join(os.path.dirname(__file__), "NotoSansThai-Regular.ttf")

PDF_W = 595.0
PDF_H = 842.0

def setup_fonts():
    candidates = [
        FONT_PATH,
        "/usr/share/fonts/truetype/thai/Garuda.ttf",
        "/usr/share/fonts/truetype/tlwg/Garuda.ttf",
        "/usr/share/fonts/truetype/noto/NotoSansThai-Regular.ttf",
    ]
    for fp in candidates:
        if os.path.exists(fp):
            try:
                pdfmetrics.registerFont(TTFont("Thai", fp))
                return "Thai"
            except Exception:
                continue
    return "Helvetica"

def y(top: float) -> float:
    """Convert PDF top-from-top coord to ReportLab bottom-from-bottom."""
    return PDF_H - top

def dt(c, x, top, text, font, size=7.5):
    """Draw text at (x, top) where top is measured from top of page."""
    if not text:
        return
    c.setFont(font, size)
    c.drawString(x, y(top + size), str(text))

def chk(c, cx, ctop, font, size=8):
    """Draw filled checkbox square at center position."""
    half = size / 2
    c.setFont(font, size)
    # Draw a small filled rectangle
    c.setFillColorRGB(0, 0, 0)
    c.rect(cx - half + 1, y(ctop + half + 1), size - 2, size - 2, fill=1, stroke=0)

def generate_pdf(data: dict, template_path: str, font_path: str = None) -> bytes:
    font = setup_fonts()

    overlay_buf = io.BytesIO()
    c = canvas.Canvas(overlay_buf, pagesize=A4)
    c.setFillColorRGB(0, 0, 0)

    # ── Patient info (top-right box) ──────────────────────────────────────
    dt(c, 415, 28,  data.get("patientName", ""), font, 7)
    dt(c, 415, 40,  data.get("dob", ""),          font, 7)
    dt(c, 415, 51,  data.get("age", ""),           font, 7)
    dt(c, 358, 61,  data.get("hn", ""),            font, 7)
    dt(c, 454, 61,  data.get("vn", ""),            font, 7)
    dt(c, 400, 73,  data.get("visitDate", ""),     font, 7)
    dt(c, 502, 73,  data.get("gender", ""),        font, 7)
    dt(c, 355, 85,  data.get("allergies", ""),     font, 7)

    # ── Date/Time/Doctor/VN (top=113) ─────────────────────────────────────
    dt(c, 38,  116, data.get("date", ""),   font, 7)
    dt(c, 97,  116, data.get("time", ""),   font, 7)
    dt(c, 162, 116, data.get("doctor", ""), font, 7)
    dt(c, 232, 116, data.get("vn", ""),     font, 7)

    # ── Transportation (top=125) ─────────────────────────────────────────
    transport = data.get("transportation", "")
    t_map = {"walk": (79, 126), "wheelchair": (115, 126), "Stretcher": (165, 126)}
    if transport in t_map:
        chk(c, *t_map[transport], font)
    elif transport:
        chk(c, 208, 126, font)
        dt(c, 222, 128, transport, font, 7)

    # ── Vital signs (top=139) ─────────────────────────────────────────────
    dt(c, 30,  142, data.get("pr",   ""), font, 7)
    dt(c, 90,  142, data.get("rr",   ""), font, 7)
    dt(c, 157, 142, data.get("bp",   ""), font, 7)
    dt(c, 222, 142, data.get("spo2", ""), font, 7)

    # ── Chief complaint (two lines, top=152 / 167) ────────────────────────
    chief = data.get("chief", "")
    dt(c, 82,  155, chief[:60], font, 7)
    if len(chief) > 60:
        dt(c, 20, 169, chief[60:120], font, 7)

    # ── Diagnosis (top=179) ───────────────────────────────────────────────
    dt(c, 57, 182, data.get("diagnosis", ""), font, 7)

    # ── Physio Precaution (top=193) ───────────────────────────────────────
    dt(c, 121, 196, data.get("physio_precaution", ""), font, 7)

    # ── Underlying disease (top=207 / 220) ───────────────────────────────
    underlying = data.get("underlying", [])
    und_map = {
        "None":              (100, 210),
        "Heart Disease":     (152, 210),
        "Cancer":            (224, 210),
        "Diabetes Mellitus": (22,  222),
        "Hypertension":      (103, 222),
    }
    other_und = []
    for u in underlying:
        if u in und_map:
            chk(c, *und_map[u], font)
        elif u != "Other":
            other_und.append(u)
    if other_und or "Other" in underlying:
        chk(c, 188, 222, font)
        dt(c, 200, 225, ", ".join(other_und), font, 6.5)

    # ── Pain Score + Location (top=237) ──────────────────────────────────
    dt(c, 60,  240, data.get("pain_score",    ""), font, 7)
    dt(c, 150, 240, data.get("pain_location", ""), font, 7)

    # ── Pain assessment tool (top=251/263) ───────────────────────────────
    pain_tool = data.get("pain_assessment", "")
    pain_map = {
        "Newborn - 1 year (NIPS)": (22,  253),
        ">1-3 years (FLACC)":      (107, 253),
        "3-8 years (FRS)":         (22,  265),
        ">8 years (NRS)":          (84,  265),
        "CPOT (Critical care Pain Observation Tool)": (140, 265),
    }
    for key, pos in pain_map.items():
        if pain_tool and key in pain_tool:
            chk(c, *pos, font)

    # ── Characteristic (top=278/291) ─────────────────────────────────────
    chars = data.get("characteristic", [])
    char_map = {
        "Prick":        (68,  280),
        "Sharp":        (98,  280),
        "Dull":         (127, 280),
        "Burning":      (150, 280),
        "Tight":        (193, 280),
        "Throbbing":    (22,  292),
        "Radiating":    (73,  292),
        "Pin & Needles":(128, 292),
    }
    other_char = []
    for ch in chars:
        if ch in char_map:
            chk(c, *char_map[ch], font)
        elif ch != "Other":
            other_char.append(ch)
    if other_char or "Other" in chars:
        dt(c, 194, 294, ", ".join(other_char), font, 6.5)

    # ── Duration + Frequency (top=304) ───────────────────────────────────
    dt(c, 30, 307, data.get("duration", ""), font, 7)
    freq = data.get("frequency", "")
    if freq == "Constant":    chk(c, 181, 305, font)
    elif freq == "Intermittent": chk(c, 220, 305, font)

    # ── Fall risk (top=316) ───────────────────────────────────────────────
    fall_risk = data.get("fall_risk", "")
    fr_map = {"standard": (22, 318), "strict": (109, 318), "highly": (188, 318)}
    if fall_risk in fr_map:
        chk(c, *fr_map[fall_risk], font)

    # ── Precaution (top=376/390) ─────────────────────────────────────────
    precautions = data.get("precautions", [])
    prec_map = {
        "Standard Precaution": (22,  377),
        "Airborne":            (90,  377),
        "Droplet":             (145, 377),
        "drug-Resistance":     (22,  390),
        "Contact":             (99,  390),
        "Protective":          (145, 390),
    }
    for p in precautions:
        if p in prec_map:
            chk(c, *prec_map[p], font)

    # ── Barthel Index (top=402) ──────────────────────────────────────────
    barthel = data.get("barthel", "")
    if barthel == "yes":   chk(c, 117, 403, font)
    elif barthel == "no":  chk(c, 147, 403, font)

    # ── Visit # (top=406) ────────────────────────────────────────────────
    dt(c, 148, 408, data.get("visit_number", ""), font, 7)

    # ── Physical Examination sections ────────────────────────────────────
    exam = data.get("assessment", {})
    FIELD_H = 11.5  # px per field row
    exam_layout = {
        "orthopedics": {
            "na_pos": (248, 415),
            "fields": ["Observation","Palpation","Muscle power","Range of Motion","Sensation","Functional movement"],
            "start_top": 420,
        },
        "cardiopulmonary": {
            "na_pos": (248, 490),
            "fields": ["Observation","Palpation","Percussion","Auscultation"],
            "start_top": 495,
        },
        "neurology": {
            "na_pos": (248, 544),
            "fields": ["Observation","Muscle Tone","Balance","Bad mobility and Transfering","Muscle Power","Sensation"],
            "start_top": 550,
        },
    }
    for sec_id, layout in exam_layout.items():
        sec = exam.get(sec_id, {})
        if sec.get("checked"):
            for i, field in enumerate(layout["fields"]):
                val = sec.get("fields", {}).get(field, "")
                if val:
                    dt(c, 38, layout["start_top"] + i * FIELD_H, val[:60], font, 6.5)

    # ── Treatment Plan (top=621) ──────────────────────────────────────────
    treatment = data.get("treatment_plan", "")
    if treatment:
        lines = treatment.replace("\\n", "\n").split("\n")
        for i, line in enumerate(lines[:5]):
            dt(c, 22, 630 + i * 11, line[:110], font, 7)

    # ── Participatory Goal Setting ────────────────────────────────────────
    dt(c, 84,  706, data.get("short_goal", ""), font, 7)
    dt(c, 84,  718, "", font, 7)
    dt(c, 84,  728, data.get("long_goal",  ""), font, 7)

    # ════════════════════════════════════════════════════════════════════
    # RIGHT COLUMN — Physiotherapy Treatment
    # ════════════════════════════════════════════════════════════════════
    ti = data.get("treatment_items", {})

    def t_item(key, chk_pos, sub_map=None, field_map=None):
        item = ti.get(key, {})
        if not item.get("checked"):
            return
        chk(c, *chk_pos, font)
        if sub_map:
            for sub, pos in sub_map.items():
                if sub in item.get("subOptions", []):
                    chk(c, *pos, font)
        if field_map:
            fields = item.get("fields", {})
            for fname, (fx, fy) in field_map.items():
                val = fields.get(fname, "")
                if val:
                    dt(c, fx, fy, val, font, 6.5)

    # Ultrasound (top~117)
    t_item("ultrasound", (302, 119),
        sub_map={"Pulse": (354, 117), "Continuous": (385, 117)},
        field_map={"minutes": (432, 121), "area": (486, 121)})

    # Manual Therapy (top~131)
    t_item("Manual", (302, 133))

    # Paraffin
    t_item("paraffin", (374, 133))

    # Tilt Table
    t_item("tilt", (429, 133),
        field_map={"minutes": (468, 135), "Degree": (536, 135)})

    # Electrical
    t_item("electrical", (302, 145),
        field_map={"minutes": (383, 147), "area": (428, 147)})

    # Cryotherapy
    t_item("cryotherapy", (302, 172),
        field_map={"minutes": (363, 174), "area": (406, 174)})

    # Traction
    t_item("traction", (302, 185),
        sub_map={"Cervical": (352, 182), "Lumbar": (394, 182)},
        field_map={"kilograms": (440, 187), "minutes": (502, 187)})

    # Laser
    t_item("laser", (302, 196),
        sub_map={"Pulse": (337, 196), "Continuous": (368, 196)},
        field_map={"minutes": (418, 198), "area": (456, 198)})

    # Shockwave
    t_item("shockwave", (302, 210),
        field_map={"area": (390, 212)})

    # Peripheral Diathermy
    t_item("peripheral", (302, 222),
        field_map={"Mode": (378, 224), "minutes": (418, 224), "area": (462, 224)})

    # Shortwave
    t_item("shortwave", (302, 239),
        sub_map={"Pulse": (330, 241), "Continuous": (362, 241)},
        field_map={"minutes": (418, 243), "area": (462, 243)})

    # Exercise checkboxes (top~253)
    t_item("motion exercise", (302, 253))
    t_item("hand",            (367, 253))
    t_item("strengh",         (418, 253))

    # Balance + Bicycle (top~265)
    t_item("balance",      (302, 266))
    t_item("balance test", (354, 266))
    t_item("Bicycle",      (408, 266),
        field_map={"Intensity": (450, 268), "minutes": (490, 268)})

    # Treadmill (top~277)
    t_item("treadmill", (302, 278),
        field_map={"speed(km/h)": (368, 280), "minutes": (430, 280), "distance": (486, 280)})

    # Continuous Passive Motion (top~290)
    t_item("continuous", (302, 291),
        field_map={"minutes": (363, 293), " Flexion/Extentsion": (414, 293)})

    # Percussion/Vibration/Chest/Breathing (top~303)
    t_item("percussion", (302, 304))
    t_item("vibration",  (340, 304))
    t_item("chest",      (383, 304))
    t_item("breath",     (444, 304))

    # Suction (top~315)
    t_item("suction", (302, 316),
        field_map={"suction": (330, 318)})

    # Ambulation (top~327)
    amb_item = ti.get("am", {})
    if amb_item.get("checked"):
        chk(c, 302, 328, font)
        amb_sub = amb_item.get("subOptions", [])
        amb_sub_map = {
            "Partial Weight Bearing": (318, 339),
            "Non Weight Bearing":     (381, 339),
            "Full Weight Bearing":    (444, 339),
        }
        for s, pos in amb_sub_map.items():
            if s in amb_sub:
                chk(c, *pos, font)

    # Other treatment
    t_item("othercheck", (302, 352),
        field_map={"other": (325, 354)})

    # Treatment Detail text (top~362)
    detail = data.get("treatment_detail_text", "")
    if detail:
        dt(c, 302, 373, detail[:100], font, 6.5)

    c.save()
    overlay_buf.seek(0)

    # ── Merge overlay onto template ────────────────────────────────────────
    template_reader = PdfReader(template_path)
    overlay_reader  = PdfReader(overlay_buf)
    writer = PdfWriter()
    page = template_reader.pages[0]
    page.merge_page(overlay_reader.pages[0])
    writer.add_page(page)

    out_buf = io.BytesIO()
    writer.write(out_buf)
    out_buf.seek(0)
    return out_buf.read()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        with open(sys.argv[1]) as f:
            data = json.load(f)
    else:
        data = json.load(sys.stdin)

    template_path = sys.argv[2] if len(sys.argv) > 2 else TEMPLATE_PATH
    pdf_bytes = generate_pdf(data, template_path)
    print(base64.b64encode(pdf_bytes).decode("utf-8"))