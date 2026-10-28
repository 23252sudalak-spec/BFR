# คู่มือการตั้งค่า Cloudflare Workers เชื่อมต่อ Google Sheets API (e-PTW)

ระบบใบอนุญาตทำงานปลอดภัยดิจิทัล (e-PTW) เชื่อมต่อไปยัง Google Sheets โดยตรงผ่าน **Cloudflare Workers** ด้วย **Google Service Account (JWT Authentication via Web Crypto API)** โดยไม่ต้องพึ่งพา External Library ที่หนัก ทำให้ประมวลผลเร็ว ปลอดภัย และไม่ฝังรหัสผ่านหรือ Private Key ลงในซอร์สโค้ด

---

## 📌 ขั้นตอนที่ 1: สร้าง Google Service Account และเปิดใช้งาน Google Sheets API

1. เข้าสู่ **[Google Cloud Console](https://console.cloud.google.com/)**
2. เลือกหรือสร้างโปรเจกต์ใหม่ (เช่น `e-ptw-system`)
3. ไปที่เมนู **APIs & Services > Library**
4. ค้นหา **Google Sheets API** แล้วคลิก **Enable (เปิดใช้งาน)**
5. ไปที่เมนู **IAM & Admin > Service Accounts**
6. คลิก **+ Create Service Account**
   - ตั้งชื่อ เช่น `eptw-sheets-worker`
   - Role: กำหนดเป็น Editor หรือปล่อยว่างได้
   - คลิก **Done**
7. คลิกที่ Service Account ที่เพิ่งสร้าง > ไปที่แท็บ **Keys**
8. คลิก **Add Key > Create new key** > เลือกชนิด **JSON** > คลิก **Create**
9. ไฟล์ `.json` จะถูกดาวน์โหลดลงเครื่องคอมพิวเตอร์ของคุณ เก็บไฟล์นี้ไว้เป็นความลับ

---

## 📌 ขั้นตอนที่ 2: แชร์สิทธิ์ใน Google Sheets ให้ Service Account

1. เปิด Google Sheets ที่ต้องการใช้เก็บข้อมูลใบงาน (หรือสร้างชีตใหม่)
2. คลิกปุ่ม **Share (แชร์)** ที่มุมขวาบนของ Google Sheets
3. นำอีเมลของ Service Account (อยู่ในไฟล์ JSON ตรงฟิลด์ `"client_email"` เช่น `eptw-sheets-worker@xxxx.iam.gserviceaccount.com`)
4. วางอีเมลลงในช่องแชร์ แล้วกำหนดสิทธิ์เป็น **Editor (ผู้แก้ไข)**
5. คลิก **Send / Save**
6. ดูที่ URL ของ Google Sheets เพื่อคัดลอก **Spreadsheet ID**:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                         นี่คือ SPREADSHEET_ID ของคุณ
   ```
7. ตั้งชื่อแท็บแผ่นงาน (Sheet Tab) เช่น `WorkPermits` (หรือ `Sheet1`)

---

## 📌 ขั้นตอนที่ 3: นำรหัสไปกรอกในระบบตั้งค่าของ Cloudflare (Settings > Variables)

เมื่อคุณเชื่อมต่อ GitHub Repository กับ Cloudflare Workers เรียบร้อยแล้ว ให้ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables & Secrets) ดังนี้:

### เข้าสู่หน้าตั้งค่าใน Cloudflare Dashboard:
1. เข้าไปที่ **[Cloudflare Dashboard](https://dash.cloudflare.com/)**
2. ไปที่เมนู **Workers & Pages**
3. เลือก Worker ของคุณ (เช่น `eptw-sheets-sync`)
4. ไปที่แท็บ **Settings (การตั้งค่า)**
5. เลือกหัวข้อ **Variables and Secrets**
6. ในส่วน **Environment Variables** หรือ **Secrets** ให้คลิก **Add variable / Add secret**

---

### 🔑 ตัวเลือกที่ 1: ใส่แบบ JSON_KEY ทั้งไฟล์ (แนะนำ - ง่ายที่สุด)

| Variable Name | Type | Value ที่ต้องกรอก |
| :--- | :--- | :--- |
| **`JSON_KEY`** | **Secret (Encrypt)** | เปิดไฟล์ `.json` ที่ดาวน์โหลดมาด้วย Notepad หรือ Text Editor แล้ว **คัดลอกเนื้อหาทั้งหมด** มาวางลงในช่องนี้ |
| **`SPREADSHEET_ID`** | Plain Text หรือ Secret | รหัส Spreadsheet ID ที่ได้จาก URL Google Sheets |
| **`SHEET_NAME`** | Plain Text | ชื่อแท็บใน Google Sheets เช่น `WorkPermits` (ค่าเริ่มต้นหากไม่ใส่) |
| **`ALLOWED_ORIGIN`** | Plain Text | `*` หรือระบุ URL ของเว็บ e-PTW เช่น `https://ais-dev-...run.app` |

---

### 🔑 ตัวเลือกที่ 2: ใส่แยกฟิลด์แบบละเอียด (Alternative)

หากต้องการแยกฟิลด์ ให้เปิดดูไฟล์ `.json` แล้วนำค่ามากรอกดังนี้:

| Variable Name | Type | ตัวอย่างข้อมูลที่ต้องกรอก |
| :--- | :--- | :--- |
| **`CLIENT_EMAIL`** | Plain Text / Secret | คัดลอกค่าจากฟิลด์ `"client_email"` เช่น `eptw-sheets-worker@my-project.iam.gserviceaccount.com` |
| **`PRIVATE_KEY`** | **Secret (Encrypt)** | คัดลอกค่าจากฟิลด์ `"private_key"` ตั้งแต่ `-----BEGIN PRIVATE KEY-----\n...` จนถึง `\n-----END PRIVATE KEY-----\n` (Cloudflare รองรับทั้งขึ้นบรรทัดใหม่และ `\n`) |
| **`SPREADSHEET_ID`** | Plain Text | รหัส ID ของ Google Sheets |
| **`SHEET_NAME`** | Plain Text | `WorkPermits` |
| **`API_SECRET_KEY`** | Secret (Optional) | ตั้งรหัสผ่านเสริมเพื่อป้องกันไม่ให้ผู้อื่นยิง API เข้า Worker |

> ⚠️ **คำแนะนำความปลอดภัย**: สำหรับ `JSON_KEY` หรือ `PRIVATE_KEY` แนะนำให้กดเลือกเป็น **"Encrypt" (Secret)** เสมอ เพื่อไม่ให้ผู้อื่นสามารถมองเห็นรหัสผ่านได้จากหน้าจอ Cloudflare

7. เมื่อกรอกครบแล้ว ให้กดปุ่ม **Deploy** หรือ **Save and deploy**

---

## 📌 ขั้นตอนที่ 4: ตรวจสอบการทำงาน (Verification)

1. เมื่อ Deploy เสร็จ Cloudflare จะให้ URL ของ Worker มา เช่น:
   ```
   https://eptw-sheets-sync.yourname.workers.dev
   ```
2. ทดสอบเปิด URL ผ่านเบราว์เซอร์:
   `https://eptw-sheets-sync.yourname.workers.dev/api/health`
   ระบบจะตอบกลับเป็น JSON:
   ```json
   {
     "status": "ok",
     "service": "e-PTW Google Sheets Cloudflare Worker",
     "configured": true,
     "spreadsheetId": "1BxiMV...",
     "sheetName": "WorkPermits",
     "clientEmail": "ept***@...",
     "timestamp": "2026-10-28T07:30:00.000Z"
   }
   ```
3. ทดสอบดึงข้อมูลใบงานทั้งหมดจากชีต:
   `https://eptw-sheets-sync.yourname.workers.dev/api/permits`
   ระบบจะอ่านข้อมูลทุกแถวใน Google Sheets แล้วแปลงกลับเป็นรายการใบอนุญาตทำงาน (e-PTW):
   ```json
   {
     "success": true,
     "count": 5,
     "totalRows": 6,
     "permits": [...],
     "spreadsheetId": "1QsME3...",
     "sheetName": "Sheet1"
   }
   ```
4. นำ Worker URL นี้ไปใส่ในหน้าเว็บ e-PTW ที่เมนู **Google Drive/Sheets Sync Hub** หรือระบุใน `.env` เพื่อให้ระบบดึงข้อมูลใบงานทั้งหมดจากชีตมาแสดงในตารางอัตโนมัติทุกครั้งที่เปิดเว็บหรือรีเฟรชหน้าจอ

---

## 📊 โครงสร้างคอลัมน์ใน Google Sheets (Columns A - S)

เมื่อมีใบงานใหม่ถูกบันทึก Worker จะทำการส่งข้อมูลไปต่อท้าย (Append Row) อัตโนมัติ:

| คอลัมน์ | ชื่อหัวตาราง | ข้อมูลที่ส่ง |
| :---: | :--- | :--- |
| **A** | Sync Timestamp | วันที่และเวลาที่ซิงค์ (UTC/Local) |
| **B** | Permit Number | เลขที่ใบอนุญาต เช่น `HW-20261028-001` |
| **C** | Risk Category | ประเภทความเสี่ยง (งานร้อน, งานที่สูง, อับอากาศ ฯลฯ) |
| **D** | Risk Level | ระดับความเสี่ยง (High, Critical, Moderate) |
| **E** | Title | ชื่องาน / ขอบเขตงาน |
| **F** | Facility Zone | โซน / อาคารในโรงงาน |
| **G** | Location | จุดปฏิบัติงานระบุเจาะจง |
| **H** | Contractor | บริษัทผู้รับเหมา / แผนก |
| **I** | Start Date & Time | วันที่และเวลาเริ่มงาน |
| **J** | End Date & Time | วันที่และเวลาสิ้นสุด |
| **K** | Status | สถานะใบงาน (PENDING, APPROVED, ACTIVE, CLOSED) |
| **L** | Requester | ผู้ขออนุญาต |
| **M** | Safety Officer | จป.วิชาชีพ (นางสาวสุดาลักษ์ พิมพ์พันธ์) |
| **N** | Approver | ผู้อนุมัติ / เจ้าของพื้นที่ |
| **O** | Workers Count | จำนวนผู้ปฏิบัติงาน |
| **P** | Gas Test Results | ผลตรวจวัดก๊าซ (O2%, LEL%) |
| **Q** | Signatures | การลงนามดิจิทัลที่บันทึกแล้ว |
| **R** | Action | Create / Update / Close |
| **S** | Notes | แผนฉุกเฉิน / หมายเหตุ |
