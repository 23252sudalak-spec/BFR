import { Language, PermitType, PermitStatus } from '../types/permit';

export interface TranslationDictionary {
  appName: string;
  appSub: string;
  tagline: string;
  zeroAccidentBadge: string;
  zeroAccidentDays: string;
  zeroAccidentSubtitle: string;
  
  nav: {
    dashboard: string;
    permits: string;
    newPermit: string;
    reports: string;
    driveHub: string;
    notifications: string;
    switchRole: string;
    login: string;
    logout: string;
    isoStandard: string;
  };

  status: Record<PermitStatus, string>;
  
  permitTypes: Record<PermitType, {
    title: string;
    code: string;
    desc: string;
    warning: string;
  }>;

  ppe: {
    helmet: string;
    safetyGlasses: string;
    faceShield: string;
    safetyHarness: string;
    safetyBoots: string;
    earPlugs: string;
    gasDetector: string;
    leatherGloves: string;
    chemicalGloves: string;
    respirator: string;
    fireExtinguisher: string;
    weldingMask: string;
  };

  dashboard: {
    heroSubtitle: string;
    heroDesc: string;
    daysUnit: string;
    zeroLti: string;
    activeDesc: string;
    pendingDesc: string;
    approvedDesc: string;
    closedDesc: string;
    dailyAlertTitle: string;
    dailyAlertDesc: string;
    viewAlerts: string;
    filterByRisk: string;
    showAll: string;
    searchPlaceholder: string;
    statusFilterAll: string;
    tablePermitNo: string;
    tableRiskType: string;
    tableTitleZone: string;
    tableContractor: string;
    tableSchedule: string;
    tableStatus: string;
    tableSignatures: string;
    tableActions: string;
    btnInspect: string;
    emptyTitle: string;
    emptyDesc: string;
    btnCreateFirst: string;
    footerIso: string;
    footerDrive: string;
    footerPaperless: string;
  };

  form: {
    title: string;
    permitNumber: string;
    workType: string;
    workDetails: string;
    location: string;
    facilityZone: string;
    contractorCompany: string;
    validityPeriod: string;
    startTime: string;
    endTime: string;
    ppeRequired: string;
    ppeSubtitle: string;
    safetyChecklist: string;
    checklistMandatory: string;
    jsaTitle: string;
    workersTitle: string;
    workerSectionTitle: string;
    noWorkersMsg: string;
    workerNameLabel: string;
    workerIdLabel: string;
    workerRoleLabel: string;
    workerCertCheck: string;
    addWorker: string;
    workerName: string;
    workerId: string;
    workerCompany: string;
    workerCert: string;
    addStep: string;
    stepWork: string;
    hazard: string;
    controlMeasure: string;
    uploadJsa: string;
    uploadHint: string;
    btnSimulateUpload: string;
    digitalSign: string;
    applicantCertDeclaration: string;
    summaryTitle: string;
    submitPermit: string;
    saveDraft: string;
    cancel: string;
    btnBack: string;
    btnNext: string;
    zonePlaceholder: string;
  };

  detail: {
    tabOverview: string;
    tabChecklist: string;
    tabJsa: string;
    tabAudits: string;
    tabClosure: string;
    currentStatus: string;
    riskLevel: string;
    btnStartWork: string;
    btnSuspendWork: string;
    btnResumeWork: string;
    btnSoApprove: string;
    btnOwnerApprove: string;
    btnReject: string;
    gasTestTitle: string;
    gasTestSafe: string;
    sigMatrixTitle: string;
    roleRequester: string;
    roleSafetyOfficer: string;
    roleAreaOwner: string;
    sigSigned: string;
    sigNotSigned: string;
    btnSignNow: string;
    workersTitle: string;
    toolboxSigned: string;
    btnSignToolbox: string;
    btnNewAudit: string;
    noAudits: string;
    auditPassBadge: string;
    auditFailBadge: string;
    closureSuccessTitle: string;
    closureChecklistTitle: string;
    closureNotesLabel: string;
    btnSignToClose: string;
  };

  workflow: {
    reviewPending: string;
    safetyOfficerApproval: string;
    areaOwnerApproval: string;
    fieldAudit: string;
    closePermit: string;
    rejectPermit: string;
    suspendWork: string;
    resumeWork: string;
    rejectionReason: string;
    auditPassed: string;
    auditFailed: string;
    closureCheck: string;
    allToolsRemoved: string;
    areaCleaned: string;
    hazardsControlled: string;
    finalSignature: string;
    confirmClosure: string;
    signNow: string;
    clearSignature: string;
    undoSignature: string;
  };

  drive: {
    title: string;
    syncStatus: string;
    synced: string;
    syncing: string;
    pending: string;
    databaseSheet: string;
    downloadCsv: string;
    openDriveFolder: string;
    archiveFolder: string;
    lastSyncTime: string;
    gasWebhookActive: string;
    syncNow: string;
  };

  notify: {
    title: string;
    lineNotify: string;
    wechatWork: string;
    qqWebhook: string;
    tokenSettings: string;
    testTrigger: string;
    enterToken: string;
    saveToken: string;
    messageSent: string;
    unreadCount: string;
  };

  report: {
    title: string;
    selectMonth: string;
    totalPermits: string;
    activeWork: string;
    highRiskRate: string;
    safeManHours: string;
    incidentsCount: string;
    auditCompliance: string;
    exportPdf: string;
    saveToDrive: string;
    printReport: string;
    riskDistribution: string;
    monthlySummary: string;
  };

  roleSwitcher: {
    title: string;
    subtitle: string;
    loginVia: string;
    selectProfile: string;
    activeSession: string;
    switchTo: string;
  };

  checklists: Record<string, string>;
}

export const translations: Record<Language, TranslationDictionary> = {
  // ==========================================
  // THAI (ภาษาไทย)
  // ==========================================
  th: {
    appName: "ระบบใบอนุญาตทำงานปลอดภัยดิจิทัล",
    appSub: "e-PTW Digital Permit-to-Work System",
    tagline: "ระบบควบคุมงานความเสี่ยงสูงแบบไร้กระดาษ ปลอดภัย ตรวจสอบได้แบบเรียลไทม์",
    zeroAccidentBadge: "สถิติความปลอดภัยระดับโรงงาน",
    zeroAccidentDays: "วันทำงานปลอดภัยต่อเนื่อง",
    zeroAccidentSubtitle: "เป้าหมายอุบัติเหตุเป็นศูนย์ (Zero Accident Goal)",
    
    nav: {
      dashboard: "แดชบอร์ดควบคุม",
      permits: "รายการใบอนุญาต",
      newPermit: "ขอใบอนุญาตใหม่",
      reports: "รายงานสถิติประจำเดือน",
      driveHub: "Google Drive คลังข้อมูล",
      notifications: "แจ้งเตือนอัตโนมัติ",
      switchRole: "สลับบทบาทผู้ใช้งาน",
      login: "เข้าสู่ระบบ",
      logout: "ออกจากระบบ",
      isoStandard: "ISO 45001 Enterprise"
    },

    status: {
      draft: "ฉบับร่าง",
      pending: "รอตรวจสอบและอนุมัติ",
      approved: "อนุมัติแล้ว (พร้อมเริ่มงาน)",
      active: "กำลังปฏิบัติงาน",
      closed: "ปิดงานเรียบร้อย",
      rejected: "ไม่อนุมัติ / ปฏิเสธ",
      suspended: "สั่งระงับงานชั่วคราว"
    },

    permitTypes: {
      hot_work: {
        title: "งานร้อน (Hot Work)",
        code: "HW-01",
        desc: "งานเชื่อม ตัด เจียร เปลวไฟ หรือก่อประกายไฟในพื้นที่",
        warning: "ตรวจวัดก๊าซไวไฟ (LEL < 10%) มีผู้เฝ้าระวังไฟและถังดับเพลิงในระยะ 5 เมตร"
      },
      height_work: {
        title: "งานที่สูง (Working at Height)",
        code: "WH-02",
        desc: "งานบนที่สูงตั้งแต่ 2.0 เมตรขึ้นไป นั่งร้าน หรือกระเช้าลอย",
        warning: "ต้องสวม Full Body Harness ยึดติดจุด Anchor point 100% ตรวจสอบนั่งร้านมีป้ายเขียว"
      },
      confined_space: {
        title: "งานอับอากาศ (Confined Space)",
        code: "CS-03",
        desc: "ถัง ไซโล บ่อ ท่อ หรือพื้นที่จำกัดการเข้าออกและการระบายอากาศ",
        warning: "ตรวจวัดก๊าซ 4 ชนิด (O2 19.5-23.5%) มีผู้ช่วยเหลือ ผู้ควบคุม และระบายอากาศต่อเนื่อง"
      },
      electrical_work: {
        title: "งานไฟฟ้าและตัดต่อวงจร (Electrical Work)",
        code: "EW-04",
        desc: "งานตู้สวิตช์เกียร์ ซ่อมบำรุงไฟฟ้าแรงสูงหรือไฟฟ้ากระแสสลับ",
        warning: "ต้องตัดแยกระบบพลังงาน (LOTO) แขวนป้ายเตือน และตรวจวัดแรงดันตกค้างให้เป็นศูนย์"
      },
      chemical_handling: {
        title: "งานสัมผัสสารเคมีอันตราย (Chemical Handling)",
        code: "CH-05",
        desc: "ถ่ายเทสารเคมี ซ่อมบำรุงท่อสารเคมี หรือทำความสะอาดสารกัดกร่อน",
        warning: "ต้องมี SDS หน้างาน ตรวจสอบจุดล้างตานิุกเฉิน และสวมชุด PPE ป้องกันสารเคมีเฉพาะทาง"
      },
      excavation: {
        title: "งานขุดเจาะและเปิดหน้าดิน (Excavation)",
        code: "EX-06",
        desc: "ขุดดินลึกเกิน 1.2 เมตร วางท่อใต้ดิน หรืองานเจาะเสาเข็ม",
        warning: "สแกนท่อสายไฟใต้ดิน ติดตั้งค้ำยันดินพัง และจัดบันไดทางขึ้นลงทุกระยะ 7.5 เมตร"
      },
      lifting: {
        title: "งานยกและเคลื่อนย้ายของหนัก (Lifting)",
        code: "LF-07",
        desc: "ใช้เครน ปั้นจั่น รอกยกโครงสร้างเหล็ก หรือเครื่องจักรหนัก",
        warning: "คนขับเครนและผู้ส่งสัญญาณต้องมีใบรับรอง (ปจ.2) กั้นเขตอันตรายห้ามเข้าใต้รัศมียก"
      },
      cold_work: {
        title: "งานซ่อมบำรุงทั่วไป (Cold Work)",
        code: "CW-08",
        desc: "งานประกอบเครื่องจักร ขันน็อต ทาสี หรือซ่อมแซมที่ไม่เกิดประกายไฟ",
        warning: "จัดระเบียบ 5ส พื้นที่ เคลียร์สิ่งกีดขวาง และสวมใส่อุปกรณ์คุ้มครองความปลอดภัยมาตรฐาน"
      }
    },

    ppe: {
      helmet: "หมวกนิรภัย (Safety Helmet)",
      safetyGlasses: "แว่นตานิรภัย (Safety Glasses)",
      faceShield: "กระบังหน้าป้องกันสะเก็ด (Face Shield)",
      safetyHarness: "เข็มขัดนิรภัยเต็มตัว (Safety Harness)",
      safetyBoots: "รองเท้าหัวเหล็ก (Safety Boots)",
      earPlugs: "ที่อุดหู/ครอบหูลดเสียง (Ear Protection)",
      gasDetector: "เครื่องตรวจวัดก๊าซ 4 Gas (Gas Detector)",
      leatherGloves: "ถุงมือหนังกันความร้อน (Leather Gloves)",
      chemicalGloves: "ถุงมือป้องกันสารเคมี (Chemical Gloves)",
      respirator: "หน้ากากกรองอากาศ/SCBA (Respirator)",
      fireExtinguisher: "ถังดับเพลิงประจำจุด (Fire Extinguisher)",
      weldingMask: "หน้ากากงานเชื่อม (Welding Mask)"
    },

    dashboard: {
      heroSubtitle: "มาตรฐานระบบความปลอดภัยระดับสากล (Paperless EHS)",
      heroDesc: "ควบคุมและอนุมัติงานความเสี่ยงสูง 8 ประเภท (งานร้อน, งานที่สูง, งานอับอากาศ, งานไฟฟ้า, งานเคมี, งานขุด, งานยก, งานซ่อมบำรุง) ด้วยระบบอนุมัติและลายเซ็นดิจิทัลพร้อมบันทึกถาวรบน Google Drive",
      daysUnit: "วัน",
      zeroLti: "Zero Lost-Time Injury (LTI)",
      activeDesc: "มี จป. สุ่มตรวจ",
      pendingDesc: "รอ จป. / เจ้าของพื้นที่",
      approvedDesc: "พร้อมเริ่มงาน",
      closedDesc: "เคลียร์พื้นที่ 5S 100%",
      dailyAlertTitle: "Safety Alert ประจำวัน",
      dailyAlertDesc: "เตือนภัยงานร้อนและงานอับอากาศ: บังคับตรวจวัดก๊าซ 4 ชนิด (O2 ระหว่าง 19.5-23.5%, LEL < 10%) และมีผู้เฝ้าระวังไฟ (Fire Watch) ประจำจุดตลอดเวลาการทำงาน",
      viewAlerts: "ดูแจ้งเตือน LINE/WeChat →",
      filterByRisk: "คัดกรองตามประเภทงานความเสี่ยง (8 High-Risk Categories)",
      showAll: "แสดงทั้งหมด",
      searchPlaceholder: "ค้นหาเลขที่ใบงาน, ชื่องาน, ผู้รับเหมา, โซน...",
      statusFilterAll: "ทั้งหมด",
      tablePermitNo: "เลขที่ใบงาน (Permit No.)",
      tableRiskType: "ประเภทความเสี่ยง",
      tableTitleZone: "ชื่องาน & โซนโรงงาน",
      tableContractor: "ผู้รับเหมา / ผู้ขอ",
      tableSchedule: "วัน-เวลา",
      tableStatus: "สถานะ",
      tableSignatures: "ลายเซ็น",
      tableActions: "ดำเนินการ",
      btnInspect: "ตรวจสอบ / ดำเนินการ",
      emptyTitle: "ยังไม่มีข้อมูลใบขออนุญาตทำงานในระบบ",
      emptyDesc: "ระบบพร้อมใช้งาน เริ่มต้นสร้างใบขออนุญาตทำงานความเสี่ยง (e-PTW) ใบแรกได้ทันที",
      btnCreateFirst: "+ ขอใบอนุญาตใหม่",
      footerIso: "© 2026 Apex Industrial Safety Solutions. ISO 45001 & OHSAS 18001 Compliant.",
      footerDrive: "Google Drive Vault Active",
      footerPaperless: "e-PTW Paperless System"
    },

    form: {
      title: "แบบฟอร์มขออนุญาตทำงานความเสี่ยง (Work Permit Application)",
      permitNumber: "เลขที่ใบอนุญาต (Permit No.)",
      workType: "ประเภทงานอันตราย",
      workDetails: "ชื่องานและรายละเอียดลักษณะงาน",
      location: "สถานที่ปฏิบัติงานอย่างละเอียด",
      facilityZone: "โซน / อาคารในโรงงาน",
      contractorCompany: "บริษัทผู้รับเหมา / แผนกผู้ขอ",
      validityPeriod: "ระยะเวลาที่ขอปฏิบัติงาน",
      startTime: "เวลาเริ่มต้น",
      endTime: "เวลาสิ้นสุด",
      ppeRequired: "อุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคล (PPE)",
      ppeSubtitle: "เลือกอุปกรณ์ความปลอดภัยที่จำเป็นสำหรับงานนี้",
      safetyChecklist: "รายการตรวจสอบความปลอดภัยก่อนเริ่มงาน (Safety Checklist)",
      checklistMandatory: "บังคับผ่านเกณฑ์ 100% ก่อนเริ่มงาน",
      jsaTitle: "การวิเคราะห์ความปลอดภัยในงาน (JSA - Job Safety Analysis)",
      workersTitle: "รายชื่อผู้ปฏิบัติงานที่ผ่านการอบรม",
      workerSectionTitle: "รายชื่อผู้ปฏิบัติงานที่ผ่านการอบรมและตรวจสุขภาพ",
      noWorkersMsg: "ยังไม่มีรายชื่อผู้ปฏิบัติงาน กรุณากรอกชื่อ-ตำแหน่งด้านล่าง แล้วกด '+ เพิ่มรายชื่อผู้ปฏิบัติงาน'",
      workerNameLabel: "ชื่อ-นามสกุล ผู้ปฏิบัติงาน",
      workerIdLabel: "เลขประจำตัว / Passport / รหัสพนักงาน",
      workerRoleLabel: "ตำแหน่ง / หน้าที่ในงาน",
      workerCertCheck: "ผ่านการอบรมความปลอดภัย & ตรวจสุขภาพความพร้อมแล้ว (Certified & Health Checked)",
      addWorker: "+ เพิ่มรายชื่อผู้ปฏิบัติงาน",
      workerName: "ชื่อ-นามสกุล",
      workerId: "เลขบัตรประชาชน / พาสปอร์ต",
      workerCompany: "สังกัดบริษัท",
      workerCert: "ผ่านการอบรมความปลอดภัย",
      addStep: "+ เพิ่มขั้นตอนงาน",
      stepWork: "ขั้นตอนการทำงาน",
      hazard: "อันตรายที่อาจเกิดขึ้น",
      controlMeasure: "มาตรการควบคุมและป้องกัน",
      uploadJsa: "แนบเอกสาร JSA / รูปถ่ายหน้างาน",
      uploadHint: "รองรับ PDF, PNG, JPG (เชื่อมต่อ Google Drive Vault อัตโนมัติ)",
      btnSimulateUpload: "แนบไฟล์จำลอง",
      digitalSign: "ลงนามดิจิทัลผู้ขออนุญาต",
      applicantCertDeclaration: "ข้าพเจ้าขอรับรองว่าได้ตรวจสอบพื้นที่ และผู้ปฏิบัติงานทุกคนได้ผ่านการอบรมรับทราบอันตรายและมาตรการป้องกันเรียบร้อยแล้ว",
      summaryTitle: "สรุปข้อมูลใบขออนุญาต:",
      submitPermit: "ส่งใบขออนุญาตเพื่อพิจารณา",
      saveDraft: "บันทึกฉบับร่าง",
      cancel: "ยกเลิก",
      btnBack: "ย้อนกลับ",
      btnNext: "ขั้นตอนถัดไป",
      zonePlaceholder: "กรอกโซน / อาคาร เช่น อาคารผลิต 1, โซนบอยเลอร์, อาคาร B..."
    },

    detail: {
      tabOverview: "ภาพรวม & ลายเซ็น",
      tabChecklist: "Checklist & PPE",
      tabJsa: "JSA & รายชื่อคนงาน",
      tabAudits: "บันทึกสุ่มตรวจหน้างาน",
      tabClosure: "ตรวจปิดงาน (Closure)",
      currentStatus: "สถานะปัจจุบัน:",
      riskLevel: "ระดับความเสี่ยง:",
      btnStartWork: "เริ่มปฏิบัติงาน (Start Work)",
      btnSuspendWork: "สั่งระงับงานชั่วคราว",
      btnResumeWork: "อนุญาตให้ทำงานต่อ",
      btnSoApprove: "จป. อนุมัติ (Safety Sign)",
      btnOwnerApprove: "เจ้าของพื้นที่อนุมัติ",
      btnReject: "ปฏิเสธ / ส่งกลับแก้ไข",
      gasTestTitle: "ผลการตรวจวัดก๊าซในบรรยากาศ (Gas Test Calibration Results)",
      gasTestSafe: "ตรวจวัดแล้ว ปลอดภัย 100%",
      sigMatrixTitle: "ลายเซ็นดิจิทัลรับรองตามลำดับชั้น (Chain of Approval Signatures)",
      roleRequester: "1. ผู้ขออนุญาต / ผู้รับเหมา",
      roleSafetyOfficer: "2. จป.วิชาชีพ ตรวจสอบ",
      roleAreaOwner: "3. เจ้าของพื้นที่อนุมัติ (Area Owner)",
      sigSigned: "ลงนามแล้ว",
      sigNotSigned: "ยังไม่ลงนาม",
      btnSignNow: "เซ็นชื่ออนุมัติทันที",
      workersTitle: "รายชื่อผู้ปฏิบัติงานในพื้นที่",
      toolboxSigned: "Toolbox Signed",
      btnSignToolbox: "เซ็นรับทราบอันตราย",
      btnNewAudit: "+ บันทึกสุ่มตรวจหน้างาน",
      noAudits: "ยังไม่มีประวัติการสุ่มตรวจหน้างานสำหรับใบงานนี้",
      auditPassBadge: "PASSED 100%",
      auditFailBadge: "VIOLATION DETECTED",
      closureSuccessTitle: "ใบอนุญาตนี้ปิดงานสมบูรณ์แล้ว (Permit Closed)",
      closureChecklistTitle: "รายการตรวจสอบก่อนปิดใบงานอย่างเป็นทางการ",
      closureNotesLabel: "หมายเหตุสรุปสภาพพื้นที่หลังเลิกงาน",
      btnSignToClose: "ลงนามตรวจพื้นที่และปิดใบงาน (Sign to Close Permit)"
    },

    workflow: {
      reviewPending: "รอการตรวจสอบและอนุมัติ",
      safetyOfficerApproval: "การตรวจสอบโดย จป.วิชาชีพ",
      areaOwnerApproval: "การอนุมัติโดยเจ้าของพื้นที่ / ผู้ควบคุมงาน",
      fieldAudit: "บันทึกการสุ่มตรวจความปลอดภัยหน้างาน",
      closePermit: "ตรวจสอบพื้นที่และปิดใบงาน (Permit Closure)",
      rejectPermit: "ปฏิเสธ / ส่งกลับแก้ไข",
      suspendWork: "สั่งระงับงานทันที (พบความไม่ปลอดภัย)",
      resumeWork: "อนุญาตให้ทำงานต่อ",
      rejectionReason: "ระบุเหตุผลในการไม่อนุมัติหรือสั่งแก้ไข",
      auditPassed: "ผลการตรวจ: ปลอดภัยตามมาตรฐาน 100%",
      auditFailed: "ผลการตรวจ: ไม่ผ่านเกณฑ์ความปลอดภัย",
      closureCheck: "รายการตรวจสอบก่อนปิดใบงานอย่างเป็นทางการ",
      allToolsRemoved: "เก็บเครื่องมือ อุปกรณ์ และสายไฟเรียบร้อย",
      areaCleaned: "ทำความสะอาดพื้นที่และกำจัดขยะอันตราย",
      hazardsControlled: "ไม่มีความร้อนสะสม หรือแหล่งกำเนิดอันตรายหลงเหลือ",
      finalSignature: "ลายเซ็นเจ้าหน้าที่ตรวจปิดงาน",
      confirmClosure: "ยืนยันการปิดใบอนุญาต",
      signNow: "ลงนามดิจิทัล",
      clearSignature: "ล้างลายเซ็น",
      undoSignature: "ย้อนกลับ"
    },

    drive: {
      title: "Google Drive Cloud Storage Architecture",
      syncStatus: "สถานะการซิงค์ข้อมูล Google Drive",
      synced: "ซิงค์ข้อมูลบนคลาวด์เรียบร้อย (ISO 45001 Compliant)",
      syncing: "กำลังเชื่อมต่อและบันทึกข้อมูล...",
      pending: "มีข้อมูลรอการซิงค์",
      databaseSheet: "Google Sheets ฐานข้อมูลหลัก (WorkPermit_Database.csv)",
      downloadCsv: "ดาวน์โหลดไฟล์ CSV ฐานข้อมูลใบงาน",
      openDriveFolder: "เปิดโฟลเดอร์ Google Drive Archive",
      archiveFolder: "Safety_Reports_Archive/ (จัดเก็บรายงานและ JSA)",
      lastSyncTime: "เวลาที่ซิงค์ล่าสุด",
      gasWebhookActive: "Google Apps Script Webhook: เชื่อมต่อสมบูรณ์",
      syncNow: "ซิงค์ข้อมูลกับ Google Drive ทันที"
    },

    notify: {
      title: "ระบบจำลองการแจ้งเตือนหลายช่องทาง (Webhook Engine)",
      lineNotify: "LINE Notify",
      wechatWork: "WeChat Work",
      qqWebhook: "QQ Safety Bot",
      tokenSettings: "ตั้งค่า LINE Notify Token",
      testTrigger: "ทดสอบส่งแจ้งเตือน (Test Trigger)",
      enterToken: "กรอก LINE Notify Personal Access Token",
      saveToken: "บันทึกการตั้งค่า",
      messageSent: "ส่งสัญญาณแจ้งเตือนสำเร็จแล้ว",
      unreadCount: "ข้อความแจ้งเตือนใหม่"
    },

    report: {
      title: "รายงานสรุปสถิติความปลอดภัยประจำเดือน (Safety Monthly Analytics)",
      selectMonth: "เลือกเดือนและปีที่ต้องการแสดงผล",
      totalPermits: "ใบอนุญาตที่ออกทั้งหมด",
      activeWork: "งานที่กำลังปฏิบัติการ",
      highRiskRate: "สัดส่วนงานความเสี่ยงวิกฤต",
      safeManHours: "ชั่วโมงทำงานปลอดภัยสะสม",
      incidentsCount: "อุบัติเหตุถึงขั้นหยุดงาน (Lost Time)",
      auditCompliance: "อัตราผ่านการสุ่มตรวจ จป.",
      exportPdf: "พิมพ์รายงาน / ส่งออก PDF",
      saveToDrive: "บันทึกลง Google Drive Archive",
      printReport: "พิมพ์แบบฟอร์มเอกสารทางการ",
      riskDistribution: "การกระจายตัวของประเภทงานความเสี่ยงสูง",
      monthlySummary: "บันทึกสรุปผลการประเมินความปลอดภัยประจำเดือน"
    },

    roleSwitcher: {
      title: "สลับบทบาทผู้ใช้งาน",
      subtitle: "Multi-Channel Auth & RBAC Persona Switcher",
      loginVia: "เข้าสู่ระบบผ่านช่องทาง:",
      selectProfile: "เลือกโปรไฟล์บทบาทเพื่อทดสอบโฟลว์งาน (คลิกเพื่อสลับทันที):",
      activeSession: "(Active Session)",
      switchTo: "สลับเป็นบทบาทนี้ →"
    },

    checklists: {
      hw_1: "เคลียร์วัสดุติดไฟในรัศมี 10 เมตร หรือคลุมด้วยผ้ากันไฟ (Fire Blanket)",
      hw_2: "จัดเตรียมถังดับเพลิงพร้อมใช้งานในระยะเอื้อมถึง (ไม่เกิน 5 เมตร)",
      hw_3: "มอบหมายผู้เฝ้าระวังไฟ (Fire Watch) ประจำหน้างานตลอดเวลาและหลังเสร็จ 30 นาที",
      hw_4: "ตรวจวัดก๊าซไวไฟและไอระเหย (LEL < 10%) และบันทึกค่าลงแบบฟอร์ม",
      hw_5: "อุปกรณ์สายเชื่อมและสายดินอยู่ในสภาพสมบูรณ์ ไม่ชำรุด",

      wh_1: "นั่งร้านผ่านการตรวจรับรองและติดป้ายสีเขียว (Green Scaffolding Tag)",
      wh_2: "สวมใส่ Full Body Harness พร้อมสายช่วยชีวิตคู่ (Twin Lanyard with Absorber)",
      wh_3: "มีจุดยึดเกาะที่มั่นคงแข็งแรง (Anchor Point รับแรงอย่างน้อย 2,200 กก.)",
      wh_4: "ติดตั้งตาข่ายกันตก (Safety Net) หรือแผงกั้นกันของตก (Toe Board)",
      wh_5: "สภาพอากาศเหมาะสม ไม่มีฝนตกหนักหรือลมกระโชกแรง",

      cs_1: "ตรวจวัดบรรยากาศ 4 ก๊าซ (O2 ระหว่าง 19.5-23.5%, LEL < 10%, CO < 25ppm, H2S < 10ppm)",
      cs_2: "ติดตั้งพัดลมระบายอากาศแบบเป่า-ดูดต่อเนื่อง (Forced Mechanical Ventilation)",
      cs_3: "จัดเตรียมอุปกรณ์กู้ภัย ขาหยั่ง 3 ขา (Rescue Tripod) และรอกชูชีพหน้าทางเข้า",
      cs_4: "มีผู้ช่วยเหลือและผู้เฝ้าปากทางเข้า (Standby Person) บันทึกรายชื่อคนเข้า-ออกตลอดเวลา",
      cs_5: "ระบบสื่อสารระหว่างภายในและภายนอกพื้นที่อับอากาศใช้งานได้ชัดเจน",

      ew_1: "ตัดกระแสไฟฟ้าและติดตั้งระบบตัดแยกพลังงาน (Lockout / Tagout - LOTO)",
      ew_2: "ใช้เครื่องวัดแรงดันไฟฟ้าตรวจสอบให้แน่ใจว่าแรงดันไฟฟ้าเป็นศูนย์ (Zero Energy Verification)",
      ew_3: "สวมถุงมือและรองเท้าฉนวนไฟฟ้าที่ผ่านการทดสอบตามพิกัดแรงดัน",
      ew_4: "มีป้ายเตือนอันตรายและกั้นเขตห้ามบุคคลภายนอกเข้าใกล้แผงวงจร",

      ch_1: "เอกสารข้อมูลความปลอดภัยสารเคมี (SDS) อยู่ประจำจุดทำงานและเข้าใจง่าย",
      ch_2: "ตรวจสอบอ่างล้างตาและฝักบัวฉุกเฉิน (Emergency Eyewash & Shower) น้ำไหลพร้อมใช้",
      ch_3: "สวมชุดป้องกันสารเคมี ถุงมือไนไตรล์ และแว่นครอบตากันสารเคมีกระเด็น",
      ch_4: "มีอุปกรณ์ดูดซับสารเคมีหกหรือรั่วไหล (Spill Response Kit) พร้อมใช้งาน",

      ex_1: "ตรวจสอบแผนผังระบบสาธารณูปโภคใต้ดิน (สายไฟ ท่อก๊าซ ท่อน้ำ) ก่อนเริ่มขุด",
      ex_2: "ติดตั้งระบบค้ำยันดินพัง (Shoring / Trench Box) สำหรับหลุมลึกเกิน 1.2 เมตร",
      ex_3: "จัดวางดินที่ขุดและเครื่องจักรห่างจากขอบหลุมอย่างน้อย 1.0 เมตร",
      ex_4: "มีบันไดทางขึ้น-ลงห่างกันไม่เกิน 7.5 เมตร และโผล่พ้นปากหลุมอย่างน้อย 1 เมตร",

      lf_1: "ตรวจสอบสภาพสลิง ห่วงโอเมก้า (Shackles) และสายรัด ไม่มีการแตกร้าวหรือชำรุด",
      lf_2: "น้ำหนักชิ้นงานไม่เกินพิกัดความสามารถการยกของเครน (Safe Working Load - SWL)",
      lf_3: "ผู้บังคับปั้นจั่นและผู้ให้สัญญาณมือมีใบรับรองตามกฎหมายกำหนด",
      lf_4: "กั้นเขตพื้นที่รัศมีวงสวิงของบูมเครน ห้ามบุคคลที่ไม่เกี่ยวข้องเดินผ่านใต้ของยก",

      cw_1: "ทำความสะอาดจัดพื้นที่ทำงานให้เป็นระเบียบ ปราศจากคราบน้ำมันและสิ่งสะดุด",
      cw_2: "เครื่องมือช่างและเครื่องมือกลอยู่ในสภาพพร้อมใช้งาน มีการ์ดครอบป้องกันใบมีด",
      cw_3: "ติดตั้งป้ายเตือนการซ่อมบำรุงและกั้นเขตพื้นที่ชัดเจน",
      cw_4: "ผู้ปฏิบัติงานทุกคนสวมใส่อุปกรณ์ป้องกันพื้นฐานครบถ้วน"
    }
  },

  // ==========================================
  // CHINESE (中文)
  // ==========================================
  zh: {
    appName: "数字安全工作许可证系统",
    appSub: "e-PTW 数字化电子作业票系统",
    tagline: "无纸化高风险作业安全许可与实时合规追踪系统",
    zeroAccidentBadge: "工厂安全里程碑",
    zeroAccidentDays: "连续安全运行天数",
    zeroAccidentSubtitle: "零事故安全目标 (Zero Accident Target)",

    nav: {
      dashboard: "监控仪表板",
      permits: "工作许可证列表",
      newPermit: "申请新许可证",
      reports: "月度安全分析报告",
      driveHub: "Google Drive 云归档",
      notifications: "多渠道预警通知",
      switchRole: "切换用户角色",
      login: "登录系统",
      logout: "退出登录",
      isoStandard: "ISO 45001 企业版"
    },

    status: {
      draft: "草稿",
      pending: "待审核审批",
      approved: "已批准 (准备施工)",
      active: "正在施工作业",
      closed: "已验收关闭",
      rejected: "已驳回 / 拒绝",
      suspended: "已叫停作业"
    },

    permitTypes: {
      hot_work: {
        title: "动火作业 (Hot Work)",
        code: "HW-01",
        desc: "焊接、切割、打磨、喷灯等产生明火或火花的作业",
        warning: "可燃气体检测 LEL < 10%，5米范围内配备灭火器及指定专职看火人"
      },
      height_work: {
        title: "高处作业 (Working at Height)",
        code: "WH-02",
        desc: "基准面2米及以上高处作业、脚手架或高空作业车",
        warning: "必须佩戴双钩五点式安全带挂牢，脚手架须挂绿色合格标牌"
      },
      confined_space: {
        title: "受限空间作业 (Confined Space)",
        code: "CS-03",
        desc: "储罐、料仓、深坑、管道等出入受限且通风不良区域",
        warning: "强制检测四合一气体(氧气 19.5-23.5%)，持续机械通风并设专职监护人"
      },
      electrical_work: {
        title: "临时用电与电气作业 (Electrical Work)",
        code: "EW-04",
        desc: "配电柜检修、高低压回路接拆线及带电测试作业",
        warning: "严格执行能量隔离上锁挂牌(LOTO)，验电确认零能量残留"
      },
      chemical_handling: {
        title: "危险化学品作业 (Chemical Handling)",
        code: "CH-05",
        desc: "酸碱腐蚀品倒灌、有毒介质管线拆卸及储罐清洗作业",
        warning: "现场配备SDS安全技术说明书，洗眼器完好，穿戴防化服及耐酸碱手套"
      },
      excavation: {
        title: "动土开挖作业 (Excavation)",
        code: "EX-06",
        desc: "开挖深度超过1.2米、地埋管线挖掘或打桩作业",
        warning: "开工前地下管线物探核对，超过深度设支撑护坡，每7.5米设安全爬梯"
      },
      lifting: {
        title: "起重吊装作业 (Lifting)",
        code: "LF-07",
        desc: "使用汽车吊、行车或卷扬机起吊重型钢构或机械设备",
        warning: "起重工与司索工持证上岗，划定警戒区严禁人员在吊臂及重物下方停留"
      },
      cold_work: {
        title: "通用机械冷态检修 (Cold Work)",
        code: "CW-08",
        desc: "机械装配、紧固螺栓、无火花涂漆与常规清洁维保",
        warning: "落实5S现场整理，清除杂物通道顺畅，规范佩戴基础防护用品"
      }
    },

    ppe: {
      helmet: "安全帽 (Safety Helmet)",
      safetyGlasses: "护目镜 (Safety Glasses)",
      faceShield: "防冲击面罩 (Face Shield)",
      safetyHarness: "全身双钩安全带 (Safety Harness)",
      safetyBoots: "钢头防砸安全鞋 (Safety Boots)",
      earPlugs: "防噪音耳塞/耳罩 (Ear Protection)",
      gasDetector: "四合一气体检测仪 (4-Gas Detector)",
      leatherGloves: "耐磨隔热皮手套 (Leather Gloves)",
      chemicalGloves: "丁腈防化手套 (Chemical Gloves)",
      respirator: "防毒面具/空气呼吸器 (SCBA)",
      fireExtinguisher: "便携式干粉灭火器 (Fire Extinguisher)",
      weldingMask: "自动变光电焊面罩 (Welding Mask)"
    },

    dashboard: {
      heroSubtitle: "国际化无纸化EHS安全管理标准",
      heroDesc: "通过数字化审批与电子签名全流程闭环控制8类高风险作业（动火、高处、受限空间、电气、危化品、动土开挖、起重吊装、常规检修），并实时同步归档至谷歌企业云盘。",
      daysUnit: "天",
      zeroLti: "零工伤事故 (Zero Lost-Time Injury)",
      activeDesc: "安全工程师巡检中",
      pendingDesc: "待安全员/属地审批",
      approvedDesc: "准予施工作业",
      closedDesc: "现场5S清理完毕已闭环",
      dailyAlertTitle: "今日安全生产特别警示",
      dailyAlertDesc: "动火与受限空间作业强制进行四合一气体检测（O2 19.5-23.5%, LEL < 10%），动火点现场必须设立专职看火人监护并在5米内备齐灭火器材。",
      viewAlerts: "查看预警推送记录 →",
      filterByRisk: "按高风险作业类型筛选 (8类特种作业)",
      showAll: "显示全部",
      searchPlaceholder: "搜索许可证编号、作业名称、施工单位、厂区车间...",
      statusFilterAll: "全部状态",
      tablePermitNo: "许可证编号",
      tableRiskType: "风险类型",
      tableTitleZone: "作业名称与区域",
      tableContractor: "施工单位 / 申请人",
      tableSchedule: "作业时限",
      tableStatus: "状态",
      tableSignatures: "会签进度",
      tableActions: "操作",
      btnInspect: "核查 / 审批",
      emptyTitle: "系统内暂无作业许可证记录",
      emptyDesc: "系统已就绪，立即创建第一张数字化安全作业许可 (e-PTW)",
      btnCreateFirst: "+ 申请新许可证",
      footerIso: "© 2026 Apex Industrial Safety Solutions. 符合 ISO 45001 & OHSAS 18001 标准体系。",
      footerDrive: "谷歌云端企业加密归档已生效",
      footerPaperless: "e-PTW 无纸化电子工作票系统"
    },

    form: {
      title: "高危作业许可申请表 (Work Permit Form)",
      permitNumber: "许可证编号",
      workType: "作业风险类型",
      workDetails: "作业名称及施工内容",
      location: "作业具体地点",
      facilityZone: "厂区 / 装置车间",
      contractorCompany: "承包商单位 / 申请部门",
      validityPeriod: "作业有效许可时限",
      startTime: "开始时间",
      endTime: "结束时间",
      ppeRequired: "强制个人劳动防护用品 (PPE)",
      ppeSubtitle: "请勾选本次作业所必需的个人安全防护装备",
      safetyChecklist: "作业前安全检查表 (Pre-work Safety Checklist)",
      checklistMandatory: "开工前各项措施必须100%核对达标",
      jsaTitle: "工作安全分析 (JSA - Job Safety Analysis)",
      workersTitle: "持证作业人员名单",
      workerSectionTitle: "持证及体检合格作业人员名单",
      noWorkersMsg: "暂无作业人员，请在下方输入姓名及岗位后点击“+ 添加作业人员”",
      workerNameLabel: "作业人员姓名",
      workerIdLabel: "身份证号 / 护照号 / 工号",
      workerRoleLabel: "工种岗位 / 现场职责",
      workerCertCheck: "已通过专项安全技术交底与健康体检 (Certified & Health Checked)",
      addWorker: "+ 添加作业人员",
      workerName: "姓名",
      workerId: "身份证号 / 护照号",
      workerCompany: "所属单位",
      workerCert: "已接受安全培训",
      addStep: "+ 添加作业工序",
      stepWork: "工序步骤",
      hazard: "潜在危险源",
      controlMeasure: "防范控制措施",
      uploadJsa: "上传JSA文件 / 现场踏勘照片",
      uploadHint: "支持 PDF, PNG, JPG 格式 (自动同步保存至企业云盘)",
      btnSimulateUpload: "上传模拟附件",
      digitalSign: "申请人电子签名确认",
      applicantCertDeclaration: "本人郑重承诺：已严格核实施工现场，所有作业人员均已接受专项安全交底与健康确认，防护措施已全部就绪。",
      summaryTitle: "申请信息摘要:",
      submitPermit: "提交许可证申请",
      saveDraft: "保存为草稿",
      cancel: "取消",
      btnBack: "返回上一步",
      btnNext: "下一步",
      zonePlaceholder: "输入厂区/车间 例如: 1号生产车间, 锅炉装置B, 库区..."
    },

    detail: {
      tabOverview: "总览与会签",
      tabChecklist: "Checklist 与 PPE",
      tabJsa: "JSA 与 作业人员",
      tabAudits: "现场巡检抽查记录",
      tabClosure: "完工关闭验收",
      currentStatus: "当前状态:",
      riskLevel: "风险等级:",
      btnStartWork: "开始施工作业 (Start Work)",
      btnSuspendWork: "立即叫停作业",
      btnResumeWork: "批准恢复施工",
      btnSoApprove: "安全工程师审核签字",
      btnOwnerApprove: "属地负责人批准签字",
      btnReject: "驳回申请 / 退回整改",
      gasTestTitle: "现场气体检测分析数据 (Gas Test Calibration Results)",
      gasTestSafe: "气体分析合格，环境安全 100%",
      sigMatrixTitle: "逐级电子审批会签矩阵 (Chain of Approval Signatures)",
      roleRequester: "1. 申请人 / 承包商负责人",
      roleSafetyOfficer: "2. 安全工程师 (HSE) 审核",
      roleAreaOwner: "3. 区域属地负责人审批",
      sigSigned: "已签署",
      sigNotSigned: "待签署",
      btnSignNow: "立即签署确认",
      workersTitle: "现场作业人员列表与交底确认",
      toolboxSigned: "已签认班前交底",
      btnSignToolbox: "工人签署交底",
      btnNewAudit: "+ 登记现场抽查记录",
      noAudits: "本作业票暂无现场抽查记录",
      auditPassBadge: "巡检达标 100%",
      auditFailBadge: "发现安全违章项",
      closureSuccessTitle: "本作业许可证已验收并正式闭环关闭 (Closed)",
      closureChecklistTitle: "许可证关闭前最终现场验收清单",
      closureNotesLabel: "工完料净场地清总结备注",
      btnSignToClose: "签署现场验收并关闭作业票 (Sign to Close)"
    },

    workflow: {
      reviewPending: "等待审查与审批",
      safetyOfficerApproval: "安全工程师 (HSE) 审核",
      areaOwnerApproval: "区域属地负责人审批确认",
      fieldAudit: "现场巡检与安全抽查记录",
      closePermit: "作业完工验收与许可证关闭 (Closure)",
      rejectPermit: "驳回申请 / 退回整改",
      suspendWork: "立即叫停作业 (发现重大隐患)",
      resumeWork: "恢复施工作业",
      rejectionReason: "请输入驳回原因或整改意见",
      auditPassed: "抽查结果: 现场安全措施完全达标",
      auditFailed: "抽查结果: 存在违章违规项",
      closureCheck: "许可证关闭前验收核查清单",
      allToolsRemoved: "工器具、临时电缆及气瓶已撤离现场",
      areaCleaned: "作业现场清理完毕，无易燃废弃物",
      hazardsControlled: "无暗火余温，工艺管线盲板恢复正常",
      finalSignature: "验收人电子签名",
      confirmClosure: "确认闭环关闭",
      signNow: "立即签署",
      clearSignature: "清空重签",
      undoSignature: "撤销笔画"
    },

    drive: {
      title: "Google Drive 企业云存储架构",
      syncStatus: "Google Drive 云端同步状态",
      synced: "已完成云端加密归档 (符合ISO 45001体系规范)",
      syncing: "正在同步数据至谷歌云端...",
      pending: "有未同步数据待处理",
      databaseSheet: "Google Sheets 主数据库 (WorkPermit_Database.csv)",
      downloadCsv: "导出下载全量许可证 CSV 数据库",
      openDriveFolder: "浏览企业 Google Drive 归档目录",
      archiveFolder: "Safety_Reports_Archive/ (存储月报与JSA档案)",
      lastSyncTime: "最后同步时间",
      gasWebhookActive: "Google Apps Script Webhook: 通讯正常",
      syncNow: "立即同步至 Google Drive"
    },

    notify: {
      title: "多渠道即时预警推送模拟 (Webhook Engine)",
      lineNotify: "LINE Notify 警报",
      wechatWork: "企业微信机器人",
      qqWebhook: "QQ群安全警报机器人",
      tokenSettings: "配置 LINE Notify Token",
      testTrigger: "触发测试报警 (Test Trigger)",
      enterToken: "输入 LINE Notify Personal Access Token",
      saveToken: "保存配置",
      messageSent: "模拟推送消息已发出",
      unreadCount: "条新未读通知"
    },

    report: {
      title: "月度安全生产与合规分析报告 (Safety Analytics)",
      selectMonth: "选择统计月份",
      totalPermits: "作业票总核发数",
      activeWork: "当前在建作业数",
      highRiskRate: "重大风险作业占比",
      safeManHours: "累计安全人工工时",
      incidentsCount: "损失工时工伤事故 (LTI)",
      auditCompliance: "安全巡检合规达标率",
      exportPdf: "导出打印完整 PDF 报表",
      saveToDrive: "保存至 Google Drive 企业档案库",
      printReport: "打印正式工作票文件",
      riskDistribution: "作业票风险类型分布情况",
      monthlySummary: "月度安全绩效综合评价"
    },

    roleSwitcher: {
      title: "切换用户角色",
      subtitle: "Multi-Channel Auth & RBAC 多渠道多角色模拟",
      loginVia: "快速模拟登录渠道:",
      selectProfile: "选择测试用户身份 (点击立即切换):",
      activeSession: "(当前在线)",
      switchTo: "切换为该角色 →"
    },

    checklists: {
      hw_1: "动火点周围10米范围内易燃物已彻底清理或使用防火毯遮盖",
      hw_2: "动火现场配备有效适用的灭火器材(距离小于5米)",
      hw_3: "落实指定现场看火人，作业期间及结束后30分钟持续监护",
      hw_4: "进行可燃气体分析检测(LEL<10%)并将数值填入记录表",
      hw_5: "电焊机接地良好，二次线无破损绝缘老化现象",

      wh_1: "脚手架经安全检验合格并挂有有效绿色合格标牌",
      wh_2: "作业人员正确佩戴五点双大钩安全带并高挂低用",
      wh_3: "系挂生命绳或牢固锚固点(锚点承重不少于2200kg)",
      wh_4: "下方设置防坠安全网或踢脚板防物体飞溅坠落",
      wh_5: "作业天气良好，无雷雨大风恶劣气象条件",

      cs_1: "严格执行四种气体分析检测(O2: 19.5-23.5%, LEL<10%, 有毒气体合规)",
      cs_2: "接通防爆机械风机实施持续强制通风排气",
      cs_3: "入口处备妥三脚架救援提升装置及防坠缓降器",
      cs_4: "设置专职监护人员，出入口实行登记卡逐人核实",
      cs_5: "空间内外双向防爆对讲通信畅通无死角",

      ew_1: "实施电源断开并在配电盘上加装安全锁具与警告牌(LOTO)",
      ew_2: "使用合格验电器进行三相验电，确认系统零能量残留",
      ew_3: "作业人员穿戴符合耐压等级的绝缘手套与电工绝缘鞋",
      ew_4: "作业区域拉设红白相间安全警示带，无关人员禁入",

      ch_1: "施工现场张贴对应化学品中文MSDS/SDS安全标签",
      ch_2: "就近应急洗眼喷淋器试水检验，出水通畅合格",
      ch_3: "穿戴耐酸碱防化围裙、防化靴、丁腈手套及防喷溅面罩",
      ch_4: "备有足量化学品吸附棉和中和处置应急沙箱",

      ex_1: "与厂区图纸核实，已完成地下隐蔽电缆管线探测确认",
      ex_2: "开挖深度大于1.2米处已按规程设置防塌方钢板桩或木支护",
      ex_3: "出土堆放及重型挖机离沟槽边缘保持1米以上安全距离",
      ex_4: "槽坑内每隔7.5米设置牢固人行爬梯，梯顶高出槽边1米",

      lf_1: "起重钢丝绳、卸扣、吊带完好无断丝变形，符合探伤标准",
      lf_2: "吊装载荷核算无误，严禁超过起重机额定起重量(SWL)",
      lf_3: "起重机操作司机与指挥信号工均持有特种设备作业证",
      lf_4: "吊装作业回转半径内设置硬质隔离，悬臂下严禁站人",

      cw_1: "检修工作面清理干净，无油污积水及易滑绊倒障碍物",
      cw_2: "工器具完好绝缘，手持电动工具装有漏电保护器",
      cw_3: "检修设备已停机切断动力源，挂牌警示检修中",
      cw_4: "全员正确穿戴反光背心、防砸鞋及防护手套"
    }
  },

  // ==========================================
  // ENGLISH (English)
  // ==========================================
  en: {
    appName: "Digital Work Permit System",
    appSub: "e-PTW Electronic Permit-to-Work System",
    tagline: "Paperless High-Risk Work Safety Permit & Real-time Traceability Platform",
    zeroAccidentBadge: "Facility Safety Milestone",
    zeroAccidentDays: "Safe Work Days Continuous",
    zeroAccidentSubtitle: "Zero Lost-Time Injury (Zero Accident Target)",

    nav: {
      dashboard: "Dashboard",
      permits: "Work Permits",
      newPermit: "New Permit",
      reports: "Safety Monthly Report",
      driveHub: "Google Drive Vault",
      notifications: "Notifications",
      switchRole: "Switch Role",
      login: "Login",
      logout: "Logout",
      isoStandard: "ISO 45001 Enterprise"
    },

    status: {
      draft: "Draft",
      pending: "Pending Review",
      approved: "Approved (Ready)",
      active: "Active (Working)",
      closed: "Closed (Verified)",
      rejected: "Rejected",
      suspended: "Suspended"
    },

    permitTypes: {
      hot_work: {
        title: "Hot Work",
        code: "HW-01",
        desc: "Welding, torch cutting, grinding, or spark-generating activities",
        warning: "Combustible gas check (LEL < 10%), dedicated Fire Watch and extinguisher within 5m"
      },
      height_work: {
        title: "Working at Height",
        code: "WH-02",
        desc: "Work at or above 2.0m, scaffolding, or elevated mobile platforms",
        warning: "Full body harness with 100% tie-off mandatory; scaffolding must bear green inspection tag"
      },
      confined_space: {
        title: "Confined Space",
        code: "CS-03",
        desc: "Tanks, silos, pits, pipelines, or spaces with restricted ingress and egress",
        warning: "Mandatory 4-gas testing (O2 19.5-23.5%), continuous mechanical ventilation, and standby rescuer"
      },
      electrical_work: {
        title: "Electrical Work",
        code: "EW-04",
        desc: "Switchgear maintenance, high/low voltage wiring, or live equipment testing",
        warning: "Strict Lockout/Tagout (LOTO) isolation, three-phase zero energy verification required"
      },
      chemical_handling: {
        title: "Chemical Handling",
        code: "CH-05",
        desc: "Hazardous chemical transfer, corrosive pipe maintenance, or vessel cleaning",
        warning: "MSDS/SDS on site, verified emergency eyewash station, chemical splash apron & nitrile gloves"
      },
      excavation: {
        title: "Excavation & Trenching",
        code: "EX-06",
        desc: "Digging deeper than 1.2m, underground utility trenching, or piling",
        warning: "Underground utility scan verified, trench box/shoring installed, egress ladder every 7.5m"
      },
      lifting: {
        title: "Lifting Operations",
        code: "LF-07",
        desc: "Mobile crane, gantry, or hoist lifting heavy structural loads or equipment",
        warning: "Certified crane operator & rigger, barricaded exclusion swing zone; never stand under loads"
      },
      cold_work: {
        title: "Cold Work Maintenance",
        code: "CW-08",
        desc: "Mechanical assembly, bolt torquing, non-sparking painting, and general maintenance",
        warning: "5S housekeeping maintained, obstacles cleared, and standard mandatory PPE donned"
      }
    },

    ppe: {
      helmet: "Safety Helmet (Hard Hat)",
      safetyGlasses: "Safety Glasses",
      faceShield: "Impact Face Shield",
      safetyHarness: "Full Body Safety Harness",
      safetyBoots: "Steel-Toe Safety Boots",
      earPlugs: "Ear Plugs / Earmuffs",
      gasDetector: "4-Gas Portable Detector",
      leatherGloves: "Heat-Resistant Leather Gloves",
      chemicalGloves: "Nitrile Chemical Gloves",
      respirator: "Air-Purifying Respirator / SCBA",
      fireExtinguisher: "Portable Fire Extinguisher",
      weldingMask: "Auto-Darkening Welding Helmet"
    },

    dashboard: {
      heroSubtitle: "Global Paperless EHS Safety Standard",
      heroDesc: "Control and approve 8 high-risk work categories (Hot Work, Height, Confined Space, Electrical, Chemical, Excavation, Lifting, Cold Work) with digital approval workflows, cryptographic signatures, and real-time cloud archiving.",
      daysUnit: "Days",
      zeroLti: "Zero Lost-Time Injury (LTI)",
      activeDesc: "Safety Patrol Active",
      pendingDesc: "Awaiting HSE / Area Review",
      approvedDesc: "Ready to Commence",
      closedDesc: "5S Cleaned & Formally Closed",
      dailyAlertTitle: "Daily Safety Advisory",
      dailyAlertDesc: "Hot Work & Confined Space operations mandate continuous 4-gas testing (O2 19.5-23.5%, LEL < 10%). A dedicated Fire Watch must remain on site during and 30 minutes after completion.",
      viewAlerts: "View Webhook Stream →",
      filterByRisk: "Filter by High-Risk Categories (8 Types)",
      showAll: "Show All",
      searchPlaceholder: "Search by permit no, work title, contractor, zone...",
      statusFilterAll: "All Statuses",
      tablePermitNo: "Permit No.",
      tableRiskType: "Risk Type",
      tableTitleZone: "Work Title & Zone",
      tableContractor: "Contractor / Applicant",
      tableSchedule: "Schedule",
      tableStatus: "Status",
      tableSignatures: "Signatures",
      tableActions: "Actions",
      btnInspect: "Inspect & Process",
      emptyTitle: "No Work Permits Found in System",
      emptyDesc: "System is initialized and ready. Click below to create your first digital work permit (e-PTW).",
      btnCreateFirst: "+ New Work Permit",
      footerIso: "© 2026 Apex Industrial Safety Solutions. ISO 45001 & OHSAS 18001 Compliant.",
      footerDrive: "Google Drive Cloud Vault Active",
      footerPaperless: "e-PTW Digital Permit System"
    },

    form: {
      title: "High-Risk Work Permit Application",
      permitNumber: "Permit Number",
      workType: "Hazard Category",
      workDetails: "Work Scope & Description",
      location: "Specific Work Location",
      facilityZone: "Facility Zone / Building",
      contractorCompany: "Contractor Company / Department",
      validityPeriod: "Permit Validity Period",
      startTime: "Start Time",
      endTime: "End Time",
      ppeRequired: "Mandatory Personal Protective Equipment (PPE)",
      ppeSubtitle: "Select all required personal safety protective gear for this task",
      safetyChecklist: "Pre-Work Safety Checklist",
      checklistMandatory: "100% compliance mandatory prior to starting work",
      jsaTitle: "Job Safety Analysis (JSA)",
      workersTitle: "Trained & Certified Workforce",
      workerSectionTitle: "Trained & Health-Screened Personnel",
      noWorkersMsg: "No workers added yet. Enter worker details below and click '+ Add Worker'.",
      workerNameLabel: "Worker Full Name",
      workerIdLabel: "National ID / Passport / Badge ID",
      workerRoleLabel: "Job Role / Trade Skill",
      workerCertCheck: "Safety Trained & Medically Screened (Certified & Health Checked)",
      addWorker: "+ Add Worker",
      workerName: "Full Name",
      workerId: "ID / Passport No.",
      workerCompany: "Company Name",
      workerCert: "Safety Certified",
      addStep: "+ Add Job Step",
      stepWork: "Task Sequence Step",
      hazard: "Potential Hazard",
      controlMeasure: "Control & Preventive Measure",
      uploadJsa: "Attach JSA Document / Field Photos",
      uploadHint: "Supports PDF, PNG, JPG (Automatically archived to Google Drive Vault)",
      btnSimulateUpload: "Attach Mock File",
      digitalSign: "Applicant Digital Signature",
      applicantCertDeclaration: "I hereby certify that the site has been thoroughly inspected, and all workers have completed safety briefings, hazard awareness talks, and mandatory PPE checks.",
      summaryTitle: "Application Summary:",
      submitPermit: "Submit for Approval",
      saveDraft: "Save Draft",
      cancel: "Cancel",
      btnBack: "Back",
      btnNext: "Next Step",
      zonePlaceholder: "Enter zone/building e.g. Building 1, Boiler Zone B, Tank Farm..."
    },

    detail: {
      tabOverview: "Overview & Signatures",
      tabChecklist: "Checklist & PPE",
      tabJsa: "JSA & Personnel",
      tabAudits: "Field Patrol & Audits",
      tabClosure: "Permit Closure",
      currentStatus: "Current Status:",
      riskLevel: "Risk Level:",
      btnStartWork: "Commence Work (Start)",
      btnSuspendWork: "Suspend Work",
      btnResumeWork: "Resume Work",
      btnSoApprove: "HSE Officer Sign-off",
      btnOwnerApprove: "Area Owner Approval",
      btnReject: "Reject / Return for Revision",
      gasTestTitle: "Atmospheric Gas Monitoring Results (Gas Test Calibration)",
      gasTestSafe: "Gas Test Passed - 100% Safe",
      sigMatrixTitle: "Chain of Digital Approval Signatures",
      roleRequester: "1. Applicant / Contractor Supervisor",
      roleSafetyOfficer: "2. Safety Officer (HSE) Verification",
      roleAreaOwner: "3. Facility Area Owner Approval",
      sigSigned: "Signed",
      sigNotSigned: "Pending Signature",
      btnSignNow: "Sign Approval Now",
      workersTitle: "Authorized Workforce & Toolbox Sign-off",
      toolboxSigned: "Toolbox Signed",
      btnSignToolbox: "Sign Hazard Briefing",
      btnNewAudit: "+ Log Field Safety Patrol",
      noAudits: "No field safety audits recorded for this permit yet",
      auditPassBadge: "PASSED 100%",
      auditFailBadge: "VIOLATION DETECTED",
      closureSuccessTitle: "Permit Formally Closed & Verified",
      closureChecklistTitle: "Mandatory Pre-Closure Inspection Checklist",
      closureNotesLabel: "Housekeeping & Site Restoration Notes",
      btnSignToClose: "Sign Site Clearance & Close Permit"
    },

    workflow: {
      reviewPending: "Awaiting Review & Approval",
      safetyOfficerApproval: "Safety Officer (HSE) Inspection",
      areaOwnerApproval: "Area Owner Final Approval",
      fieldAudit: "Field Safety Patrol Log",
      closePermit: "Permit Closure & Handback",
      rejectPermit: "Reject / Return for Revisions",
      suspendWork: "Suspend Work Immediately",
      resumeWork: "Resume Authorized Work",
      rejectionReason: "Reason for rejection or corrective actions",
      auditPassed: "Audit Result: 100% Compliant",
      auditFailed: "Audit Result: Non-compliance Detected",
      closureCheck: "Pre-Closure Site Handback Checklist",
      allToolsRemoved: "All tools, power cables, and cylinders cleared",
      areaCleaned: "Work area cleaned, combustible waste disposed",
      hazardsControlled: "No residual heat, blind flanges restored",
      finalSignature: "Closure Inspector Signature",
      confirmClosure: "Confirm Closure",
      signNow: "Sign Digitally",
      clearSignature: "Clear",
      undoSignature: "Undo"
    },

    drive: {
      title: "Google Drive Enterprise Cloud Storage",
      syncStatus: "Google Drive Cloud Sync Status",
      synced: "Encrypted Cloud Archive Synced (ISO 45001 Compliant)",
      syncing: "Synchronizing data with Google Cloud...",
      pending: "Pending changes to sync",
      databaseSheet: "Google Sheets Primary Database (WorkPermit_Database.csv)",
      downloadCsv: "Download Full CSV Database",
      openDriveFolder: "Browse Google Drive Archive",
      archiveFolder: "Safety_Reports_Archive/ (Reports & JSA Repository)",
      lastSyncTime: "Last Synced Time",
      gasWebhookActive: "Google Apps Script Webhook: Connected",
      syncNow: "Sync to Google Drive Now"
    },

    notify: {
      title: "Multi-Channel Real-time Notification Engine",
      lineNotify: "LINE Notify Alerts",
      wechatWork: "WeChat Work Bot",
      qqWebhook: "QQ Safety Bot",
      tokenSettings: "Configure LINE Notify Token",
      testTrigger: "Trigger Test Alert (Webhook)",
      enterToken: "Enter LINE Notify Personal Access Token",
      saveToken: "Save Token",
      messageSent: "Simulated Webhook Alert Dispatched",
      unreadCount: "New Unread Notifications"
    },

    report: {
      title: "Monthly Safety Performance & Compliance Analytics",
      selectMonth: "Select Month",
      totalPermits: "Total Permits Issued",
      activeWork: "Active Operations",
      highRiskRate: "Critical Risk Percentage",
      safeManHours: "Cumulative Safe Man-Hours",
      incidentsCount: "Lost-Time Injuries (LTI)",
      auditCompliance: "HSE Patrol Pass Rate",
      exportPdf: "Export / Print PDF Report",
      saveToDrive: "Save to Google Drive Archive",
      printReport: "Print Formal Document",
      riskDistribution: "Permits by Risk Category Distribution",
      monthlySummary: "Monthly Safety Performance Evaluation"
    },

    roleSwitcher: {
      title: "Switch User Role",
      subtitle: "Multi-Channel Auth & RBAC Persona Switcher",
      loginVia: "Simulate Login Channel:",
      selectProfile: "Select Persona to Test Workflow Lifecycle:",
      activeSession: "(Active Session)",
      switchTo: "Switch to this role →"
    },

    checklists: {
      hw_1: "Combustibles within 10 meters cleared or shielded with certified Fire Blankets",
      hw_2: "Applicable fire extinguishers ready for immediate use within 5 meters",
      hw_3: "Dedicated Fire Watch stationed during work and for 30 minutes post-completion",
      hw_4: "Combustible gas testing verified (LEL < 10%) and logged on permit",
      hw_5: "Welding machine properly grounded; cables and leads free from defects",

      wh_1: "Scaffolding inspected and tagged with active Green Inspection Tag",
      wh_2: "Full body harness equipped with twin shock-absorbing lanyards worn properly",
      wh_3: "Anchored to certified anchor point rated for at least 2,200 kg (5,000 lbs)",
      wh_4: "Debris catch safety nets and toe boards installed to prevent falling objects",
      wh_5: "Favorable weather conditions; no heavy rain or high wind gusts",

      cs_1: "Strict 4-gas testing verified (O2 19.5-23.5%, LEL < 10%, toxic gases compliant)",
      cs_2: "Continuous forced mechanical positive-pressure ventilation maintained",
      cs_3: "Rescue tripod with mechanical retrieval winch positioned at entrance",
      cs_4: "Dedicated Standby Attendant logging every entrant in and out continuously",
      cs_5: "Intrinsically safe two-way radio communication verified between inside and outside",

      ew_1: "Power disconnected; Lockout/Tagout (LOTO) locks and warning tags applied",
      ew_2: "Calibrated voltage detector used to verify complete Zero Energy state",
      ew_3: "Dielectric insulated gloves and boots rated for the system voltage worn",
      ew_4: "Red/white barricade tape and electrical hazard warning signs posted",

      ch_1: "Chemical Safety Data Sheets (SDS) posted on site and reviewed with workers",
      ch_2: "Emergency eyewash and safety shower tested with unobstructed water flow",
      ch_3: "Chemical splash apron, chemical boots, nitrile gloves, and face shield donned",
      ch_4: "Chemical spill response kit and neutralizing absorbents available on site",

      ex_1: "Underground utilities (electric, gas, water) traced and verified against drawings",
      ex_2: "Trench shoring or trench boxes installed for excavations exceeding 1.2 meters",
      ex_3: "Excavated spoil and heavy machinery kept at least 1.0 meter from trench edge",
      ex_4: "Safe access and egress ladders provided every 7.5 meters extending 1m above grade",

      lf_1: "Wire rope slings, shackles, and webbing slings inspected with zero defects",
      lf_2: "Load weight calculated; does not exceed Safe Working Load (SWL) of the crane",
      lf_3: "Crane operator and rigger/signalman possess valid statutory licenses",
      lf_4: "Crane swing radius barricaded; personnel strictly prohibited under suspended loads",

      cw_1: "Work surface cleaned, free from oil spills and slip/trip hazards",
      cw_2: "Hand and power tools in good condition with safety guards in place",
      cw_3: "Equipment de-energized, tagged out, and area warning signs posted",
      cw_4: "All personnel equipped with high-vis vest, safety boots, and gloves"
    }
  },

  // ==========================================
  // BURMESE (မြန်မာဘာသာ)
  // ==========================================
  my: {
    appName: "ဒစ်ဂျစ်တယ် အလုပ်လုပ်ကိုင်ခွင့်မိန့် စနစ်",
    appSub: "e-PTW Digital Permit-to-Work System",
    tagline: "စက္ကူမလို အန္တရာယ်ရှိလုပ်ငန်းခွင့်ပြုမိန့်နှင့် ဘေးအန္တရာယ်ကင်းရှင်းရေး စနစ်",
    zeroAccidentBadge: "စက်ရုံ ဘေးအန္တရာယ်ကင်းရှင်းရေး မှတ်တမ်း",
    zeroAccidentDays: "ဆက်တိုက် မတော်တဆမှုကင်းမဲ့သည့်ရက်ပေါင်း",
    zeroAccidentSubtitle: "မတော်တဆမှု သုည ရည်မှန်းချက် (Zero Accident Target)",

    nav: {
      dashboard: "ဒက်ရှ်ဘုတ်",
      permits: "ခွင့်ပြုမိန့် စာရင်းများ",
      newPermit: "ခွင့်ပြုမိန့် အသစ်လျှောက်ထားရန်",
      reports: "လစဉ် အစီရင်ခံစာ",
      driveHub: "Google Drive မှတ်တမ်းတိုက်",
      notifications: "သတိပေးချက်များ",
      switchRole: "အသုံးပြုသူ အခန်းကဏ္ဍ ပြောင်းရန်",
      login: "အကောင့်ဝင်ရန်",
      logout: "ထွက်ရန်",
      isoStandard: "ISO 45001 စံနှုန်း"
    },

    status: {
      draft: "မူကြမ်း",
      pending: "စိစစ်အတည်ပြုရန်စောင့်ဆိုင်းနေသည်",
      approved: "ခွင့်ပြုပြီး (စတင်လုပ်ဆောင်နိုင်သည်)",
      active: "လက်ရှိ လုပ်ကိုင်နေဆဲ",
      closed: "လုပ်ငန်းပြီးစီး၍ ပိတ်သိမ်းပြီး",
      rejected: "ငြင်းပယ်သည် / မအောင်မြင်ပါ",
      suspended: "လုပ်ငန်းယာယီရပ်ဆိုင်းထားသည်"
    },

    permitTypes: {
      hot_work: {
        title: "အပူပေးလုပ်ငန်း (Hot Work)",
        code: "HW-01",
        desc: "ဂဟေဆော်ခြင်း၊ သံဖြတ်ခြင်းနှင့် မီးပွားထွက်စေသော အလုပ်များ",
        warning: "မီးလောင်လွယ်ဓာတ်ငွေ့တိုင်းတာစစ်ဆေးပါ (LEL < 10%)၊ မီးသတ်ဆေးဘူး အနီးတွင်ထားပါ"
      },
      height_work: {
        title: "မြင့်သောနေရာလုပ်ငန်း (Working at Height)",
        code: "WH-02",
        desc: "၂ မီတာထက်မြင့်သောနေရာ၊ ငြမ်း သို့မဟုတ် ကရိန်းခြင်းတောင်း လုပ်ငန်း",
        warning: "ခါးပတ်ကြိုး (Safety Harness) ပြည့်စုံစွာဝတ်ဆင်ပြီး ငြမ်းစိမ်းကတ် ရှိရမည်"
      },
      confined_space: {
        title: "အကန့်အသတ်ရှိနေရာလုပ်ငန်း (Confined Space)",
        code: "CS-03",
        desc: "ကန်၊ ပိုက်လိုင်း၊ မြေအောက်တွင်းနှင့် လေဝင်လေထွက်နည်းသောနေရာများ",
        warning: "ဓာတ်ငွေ့ ၄ မျိုး စစ်ဆေးပါ၊ လေမှုတ်စက်တပ်ဆင်ထားပြီး အပြင်လူ စောင့်ကြည့်ရမည်"
      },
      electrical_work: {
        title: "လျှပ်စစ်လုပ်ငန်း (Electrical Work)",
        code: "EW-04",
        desc: "လျှပ်စစ်ခလုတ်ခုံ ပြုပြင်ခြင်းနှင့် ဓာတ်အားလိုင်း ဆက်သွယ်ခြင်း",
        warning: "မီးခလုတ် သော့ခတ်တံဆိပ်ကပ်ပါ (LOTO)၊ ဓာတ်အားကျန်မရှိကြောင်း စစ်ဆေးပါ"
      },
      chemical_handling: {
        title: "ဓာတုပစ္စည်းလုပ်ငန်း (Chemical Handling)",
        code: "CH-05",
        desc: "အက်ဆစ်၊ အဆိပ်ရှိသောဓာတုပစ္စည်းများ ကိုင်တွယ်ခြင်းနှင့် ဆေးကြောခြင်း",
        warning: "SDS စာရွက်စာတမ်းရှိရမည်၊ မျက်စိဆေးရေပန်းစစ်ဆေးပါ၊ အကာအကွယ်ဝတ်ဆင်ပါ"
      },
      excavation: {
        title: "တူးဖော်ရေးလုပ်ငန်း (Excavation)",
        code: "EX-06",
        desc: "မြေပြင်အနက် ၁.၂ မီတာထက်ကျော်၍ တူးဖော်ခြင်း လုပ်ငန်း",
        warning: "မြေအောက်ကြိုးများ စစ်ဆေးပါ၊ မြေပြိုကာကွယ်ကန့်လန့်ကာ တပ်ဆင်ပါ"
      },
      lifting: {
        title: "ဝန်ချီစက်လုပ်ငန်း (Lifting)",
        code: "LF-07",
        desc: "ကရိန်း၊ ပူလီများဖြင့် လေးလံသောစက်ပစ္စည်းများ မ ချီရွှေ့ပြောင်းခြင်း",
        warning: "ကရိန်းမောင်းသူ လက်မှတ်ရှိရမည်၊ မ ချီနေစဉ် အောက်တွင် မနေရ"
      },
      cold_work: {
        title: "အထွေထွေပြင်ဆင်ရေး (Cold Work)",
        code: "CW-08",
        desc: "စက်တပ်ဆင်ခြင်း၊ သုတ်ဆေးသုတ်ခြင်းနှင့် ပုံမှန် ပြင်ဆင်ထိန်းသိမ်းမှု",
        warning: "လုပ်ငန်းခွင်သန့်ရှင်းရေး (5S) ပြုလုပ်ပါ၊ အခြေခံအကာအကွယ်ပစ္စည်းများ ဝတ်ဆင်ပါ"
      }
    },

    ppe: {
      helmet: "ဦးထုပ် (Safety Helmet)",
      safetyGlasses: "မျက်မှန် (Safety Glasses)",
      faceShield: "မျက်နှာအကာ (Face Shield)",
      safetyHarness: "ဘေးကင်းလုံခြုံရေးခါးပတ် (Safety Harness)",
      safetyBoots: "သံခေါင်းပါဘွတ်ဖိနပ် (Safety Boots)",
      earPlugs: "နားကြပ်အကာ (Ear Protection)",
      gasDetector: "ဓာတ်ငွေ့တိုင်းကိရိယာ (Gas Detector)",
      leatherGloves: "သားရေလက်အိတ် (Leather Gloves)",
      chemicalGloves: "ဓာတုကာလက်အိတ် (Chemical Gloves)",
      respirator: "အသက်ရှူအကာ/SCBA (Respirator)",
      fireExtinguisher: "မီးသတ်ဆေးဘူး (Fire Extinguisher)",
      weldingMask: "ဂဟေဆော်မျက်နှာဖုံး (Welding Mask)"
    },

    dashboard: {
      heroSubtitle: "စက္ကူမလို EHS ဘေးကင်းရေး စံနှုန်း",
      heroDesc: "အလွန်အန္တရာယ်များသော အလုပ် ၈ မျိုးကို ဒစ်ဂျစ်တယ်စနစ်ဖြင့် စိစစ်အတည်ပြုပြီး Google Drive တွင် တရားဝင် သိမ်းဆည်းပါသည်။",
      daysUnit: "ရက်",
      zeroLti: "မတော်တဆမှု ကင်းစင် (Zero LTI)",
      activeDesc: "စစ်ဆေးမှု ပြုလုပ်နေဆဲ",
      pendingDesc: "စိစစ်အတည်ပြုချက် စောင့်ဆိုင်းနေသည်",
      approvedDesc: "စတင်လုပ်ဆောင်နိုင်သည်",
      closedDesc: "သန့်ရှင်းရေးပြီးစီး၍ ပိတ်သိမ်းပြီး",
      dailyAlertTitle: "ယနေ့ အထူးသတိပေးချက်",
      dailyAlertDesc: "အပူပေးလုပ်ငန်းနှင့် အကန့်အသတ်ရှိနေရာများတွင် ဓာတ်ငွေ့ ၄ မျိုး တိုင်းတာစစ်ဆေးပြီး မီးစောင့်ကြည့်သူ အမြဲရှိရမည်။",
      viewAlerts: "သတိပေးချက်များ ကြည့်ရန် →",
      filterByRisk: "အန္တရာယ်အမျိုးအစားအလိုက် ခွဲခြားကြည့်ရန် (၈ မျိုး)",
      showAll: "အားလုံးပြပါ",
      searchPlaceholder: "ခွင့်ပြုမိန့်အမှတ်၊ လုပ်ငန်း၊ ကန်ထရိုက်တာ ရှာရန်...",
      statusFilterAll: "အားလုံး",
      tablePermitNo: "ခွင့်ပြုမိန့်အမှတ်",
      tableRiskType: "အန္တရာယ်အမျိုးအစား",
      tableTitleZone: "လုပ်ငန်းအမည်နှင့် နေရာ",
      tableContractor: "ကုမ္ပဏီ / လျှောက်ထားသူ",
      tableSchedule: "အချိန်ကာလ",
      tableStatus: "အခြေအနေ",
      tableSignatures: "လက်မှတ်များ",
      tableActions: "လုပ်ဆောင်ချက်",
      btnInspect: "စစ်ဆေး / အတည်ပြု",
      emptyTitle: "ခွင့်ပြုမိန့်မှတ်တမ်း မရှိသေးပါ",
      emptyDesc: "ခွင့်ပြုမိန့် အသစ် စတင်လျှောက်ထားနိုင်ပါသည်",
      btnCreateFirst: "+ ခွင့်ပြုမိန့် အသစ်",
      footerIso: "© 2026 Apex Industrial Safety Solutions. ISO 45001 စံနှုန်းနှင့် ကိုက်ညီပါသည်။",
      footerDrive: "Google Drive သိမ်းဆည်းမှု ကောင်းမွန်ပါသည်",
      footerPaperless: "e-PTW စက္ကူမလို ခွင့်ပြုမိန့်စနစ်"
    },

    form: {
      title: "အလုပ်လုပ်ကိုင်ခွင့် လျှောက်လွှာဖောင် (Work Permit Form)",
      permitNumber: "ခွင့်ပြုမိန့်အမှတ်",
      workType: "လုပ်ငန်းအန္တရာယ် အမျိုးအစား",
      workDetails: "လုပ်ငန်းအမည်နှင့် အသေးစိတ်အချက်အလက်",
      location: "လုပ်ကိုင်မည့်နေရာ",
      facilityZone: "စက်ရုံဇုန် / အဆောက်အအုံ",
      contractorCompany: "ကန်ထရိုက်တာကုမ္ပဏီ / ဌာန",
      validityPeriod: "ခွင့်ပြုသည့် အချိန်ကာလ",
      startTime: "စတင်ချိန်",
      endTime: "ပြီးဆုံးချိန်",
      ppeRequired: "လိုအပ်သော ကိုယ်ရေးကိုယ်တာအကာအကွယ်ပစ္စည်းများ (PPE)",
      ppeSubtitle: "လုပ်ငန်းအတွက် လိုအပ်သော အကာအကွယ်ပစ္စည်းများ ရွေးချယ်ပါ",
      safetyChecklist: "မလုပ်မီ စစ်ဆေးရမည့် ဘေးအန္တရာယ်ကင်းရှင်းရေးစာရင်း",
      checklistMandatory: "၁၀၀% စစ်ဆေးပြီးမှသာ စတင်လုပ်ကိုင်ရမည်",
      jsaTitle: "လုပ်ငန်းခွင် အန္တရာယ်ဆန်းစစ်ချက် (JSA)",
      workersTitle: "လေ့ကျင့်သင်ကြားပြီး လုပ်သားများစာရင်း",
      workerSectionTitle: "ဆေးစစ်ထားပြီး သင်တန်းဆင်း လုပ်သားများစာရင်း",
      noWorkersMsg: "လုပ်သားစာရင်း မရှိသေးပါ၊ အောက်တွင် အမည်ရိုက်ထည့်ပြီး '+ လုပ်သားအမည် ထည့်သွင်းရန်' ကို နှိပ်ပါ",
      workerNameLabel: "လုပ်သား အမည်",
      workerIdLabel: "မှတ်ပုံတင်အမှတ် / ပတ်စပို့",
      workerRoleLabel: "ရာထူး / တာဝန်",
      workerCertCheck: "ဘေးကင်းရေးသင်တန်းဆင်းပြီး ကျန်းမာရေးစစ်ဆေးပြီးဖြစ်သည်",
      addWorker: "+ လုပ်သားအမည် ထည့်သွင်းရန်",
      workerName: "အမည်",
      workerId: "မှတ်ပုံတင်အမှတ် / နိုင်ငံကူးလက်မှတ်",
      workerCompany: "ကုမ္ပဏီအမည်",
      workerCert: "ဘေးကင်းရေးသင်တန်း တက်ရောက်ပြီး",
      addStep: "+ လုပ်ငန်းအဆင့် ထည့်ရန်",
      stepWork: "လုပ်ငန်းအဆင့်",
      hazard: "ဖြစ်ပေါ်နိုင်သောအန္တရာယ်",
      controlMeasure: "ကာကွယ်ထိန်းချုပ်နည်း",
      uploadJsa: "JSA စာရွက်စာတမ်း / ဓာတ်ပုံ ပူးတွဲရန်",
      uploadHint: "PDF, PNG, JPG လက်ခံပါသည်",
      btnSimulateUpload: "ဖိုင် ပူးတွဲမည်",
      digitalSign: "လျှောက်ထားသူ ဒစ်ဂျစ်တယ်လက်မှတ်",
      applicantCertDeclaration: "လုပ်ငန်းခွင်ကို စစ်ဆေးပြီး လုပ်သားများအားလုံးကို သတိပေးချက်များ ပြုလုပ်ပြီးဖြစ်ကြောင်း အတည်ပြုပါသည်",
      summaryTitle: "အကျဉ်းချုပ် အချက်အလက်များ:",
      submitPermit: "ခွင့်ပြုမိန့် တင်သွင်းရန်",
      saveDraft: "မူကြမ်းသိမ်းရန်",
      cancel: "မလုပ်တော့ပါ",
      btnBack: "နောက်သို့",
      btnNext: "ရှေ့သို့",
      zonePlaceholder: "အဆောက်အအုံ / ဇုန် ရိုက်ထည့်ပါ"
    },

    detail: {
      tabOverview: "အကျဉ်းချုပ်နှင့် လက်မှတ်",
      tabChecklist: "Checklist နှင့် PPE",
      tabJsa: "JSA နှင့် လုပ်သားများ",
      tabAudits: "စစ်ဆေးမှု မှတ်တမ်း",
      tabClosure: "ပိတ်သိမ်းခြင်း (Closure)",
      currentStatus: "လက်ရှိ အခြေအနေ:",
      riskLevel: "အန္တရာယ် အဆင့်:",
      btnStartWork: "လုပ်ငန်း စတင်မည် (Start Work)",
      btnSuspendWork: "လုပ်ငန်း ရပ်ဆိုင်းမည်",
      btnResumeWork: "လုပ်ငန်း ပြန်လည်စတင်မည်",
      btnSoApprove: "လုံခြုံရေးအရာရှိ လက်မှတ်ထိုးမည်",
      btnOwnerApprove: "နေရာတာဝန်ခံ အတည်ပြုမည်",
      btnReject: "ငြင်းပယ်မည် / ပြင်ဆင်ရန်",
      gasTestTitle: "ဓာတ်ငွေ့တိုင်းတာမှု ရလဒ်များ",
      gasTestSafe: "ဓာတ်ငွေ့စစ်ဆေးပြီး ဘေးကင်းပါသည်",
      sigMatrixTitle: "အတည်ပြုလက်မှတ်များ စာရင်း",
      roleRequester: "၁။ လျှောက်ထားသူ / ကန်ထရိုက်တာ",
      roleSafetyOfficer: "၂။ လုံခြုံရေးအရာရှိ (Safety Officer)",
      roleAreaOwner: "၃။ နေရာတာဝန်ခံ (Area Owner)",
      sigSigned: "လက်မှတ်ထိုးပြီး",
      sigNotSigned: "မထိုးရသေးပါ",
      btnSignNow: "ချက်ချင်း လက်မှတ်ထိုးမည်",
      workersTitle: "လုပ်ငန်းခွင် လုပ်သားများ",
      toolboxSigned: "Toolbox Signed",
      btnSignToolbox: "သတိပေးချက် လက်မှတ်ထိုးမည်",
      btnNewAudit: "+ စစ်ဆေးမှု မှတ်တမ်းတင်မည်",
      noAudits: "စစ်ဆေးမှု မှတ်တမ်း မရှိသေးပါ",
      auditPassBadge: "စံနှုန်းပြည့် ၁၀၀%",
      auditFailBadge: "ချို့ယွင်းချက် တွေ့ရှိသည်",
      closureSuccessTitle: "ခွင့်ပြုမိန့် အောင်မြင်စွာ ပိတ်သိမ်းပြီး",
      closureChecklistTitle: "မပိတ်သိမ်းမီ စစ်ဆေးရမည့် အချက်များ",
      closureNotesLabel: "ရှင်းလင်းပြီးစီးမှု မှတ်ချက်",
      btnSignToClose: "စစ်ဆေးပြီး ခွင့်ပြုမိန့် ပိတ်သိမ်းမည်"
    },

    workflow: {
      reviewPending: "စစ်ဆေးအတည်ပြုရန် စောင့်ဆိုင်းနေသည်",
      safetyOfficerApproval: "လုံခြုံရေးအရာရှိ (Safety Officer) စစ်ဆေးချက်",
      areaOwnerApproval: "နေရာတာဝန်ခံ အတည်ပြုချက်",
      fieldAudit: "လုပ်ငန်းခွင် စစ်ဆေးမှုမှတ်တမ်း",
      closePermit: "နေရာစစ်ဆေးပြီး ခွင့်ပြုမိန့် ပိတ်သိမ်းခြင်း",
      rejectPermit: "ငြင်းပယ်သည် / ပြန်လည်ပြင်ဆင်ရန်",
      suspendWork: "လုပ်ငန်း ချက်ချင်းရပ်တန့်ရန် အမိန့်ထုတ်သည်",
      resumeWork: "လုပ်ငန်း ပြန်လည်စတင်ခွင့်ပြုသည်",
      rejectionReason: "ငြင်းပယ်ရသည့် အကြောင်းအရင်း",
      auditPassed: "စစ်ဆေးမှုရလဒ်: စံချိန်စံညွှန်းပြည့်မီပါသည်",
      auditFailed: "စစ်ဆေးမှုရလဒ်: မပြည့်မီပါ",
      closureCheck: "လုပ်ငန်းမပိတ်သိမ်းမီ စစ်ဆေးရမည့်အချက်များ",
      allToolsRemoved: "စက်ကိရိယာများနှင့် ဝါယာကြိုးများ အားလုံးသိမ်းဆည်းပြီး",
      areaCleaned: "နေရာသန့်ရှင်းရေး ပြုလုပ်ပြီး စွန့်ပစ်ပစ္စည်းမရှိပါ",
      hazardsControlled: "အပူနှင့် အန္တရာယ်ဖြစ်စေနိုင်သောအရာများ မရှိတော့ပါ",
      finalSignature: "ပိတ်သိမ်းစစ်ဆေးသူ လက်မှတ်",
      confirmClosure: "ခွင့်ပြုမိန့် ပိတ်သိမ်းခြင်း အတည်ပြုပါ",
      signNow: "လက်မှတ်ရေးထိုးမည်",
      clearSignature: "လက်မှတ်ပြန်ဖျက်မည်",
      undoSignature: "နောက်သို့ပြန်သွားမည်"
    },

    drive: {
      title: "Google Drive မိုးတိမ်ဒေတာ သိမ်းဆည်းမှု စနစ်",
      syncStatus: "Google Drive ချိတ်ဆက်မှု အခြေအနေ",
      synced: "Google Drive ပေါ်တွင် သိမ်းဆည်းပြီးပါပြီ (ISO 45001 စံနှုန်း)",
      syncing: "ဒေတာ ချိတ်ဆက်သိမ်းဆည်းနေပါသည်...",
      pending: "သိမ်းဆည်းရန် ကျန်ရှိနေသေးသည်",
      databaseSheet: "Google Sheets ပင်မဒေတာဘေ့စ် (WorkPermit_Database.csv)",
      downloadCsv: "CSV ဒေတာဖိုင် အပြည့်အစုံကို ဒေါင်းလုဒ်လုပ်ရန်",
      openDriveFolder: "Google Drive ဖိုဒါကို ကြည့်ရှုရန်",
      archiveFolder: "Safety_Reports_Archive/ (လစဉ်အစီရင်ခံစာများ)",
      lastSyncTime: "နောက်ဆုံး ချိတ်ဆက်သိမ်းဆည်းချိန်",
      gasWebhookActive: "Google Apps Script Webhook: ချိတ်ဆက်မှု အဆင်ပြေပါသည်",
      syncNow: "Google Drive နှင့် ချက်ချင်းချိတ်ဆက်မည်"
    },

    notify: {
      title: "အလိုအလျောက် သတိပေးချက် စနစ် (Webhook Engine)",
      lineNotify: "LINE Notify",
      wechatWork: "WeChat Work",
      qqWebhook: "QQ Safety Bot",
      tokenSettings: "LINE Notify Token ချိန်ညှိချက်",
      testTrigger: "စမ်းသပ် သတိပေးချက် ပေးပို့ရန် (Test Trigger)",
      enterToken: "LINE Notify Token ရိုက်ထည့်ပါ",
      saveToken: "သိမ်းဆည်းမည်",
      messageSent: "သတိပေးချက် အောင်မြင်စွာ ပို့ပြီးပါပြီ",
      unreadCount: "မဖတ်ရသေးသော သတိပေးချက်များ"
    },

    report: {
      title: "လစဉ် ဘေးအန္တရာယ်ကင်းရှင်းရေး စာရင်းအင်း အစီရင်ခံစာ",
      selectMonth: "လ ရွေးချယ်ပါ",
      totalPermits: "ထုတ်ပေးခဲ့သော ခွင့်ပြုမိန့်စုစုပေါင်း",
      activeWork: "လက်ရှိ လုပ်ဆောင်နေသော အလုပ်များ",
      highRiskRate: "အလွန်အန္တရာယ်များသော အလုပ် ရာခိုင်နှုန်း",
      safeManHours: "ဘေးကင်းလုံခြုံစွာ လုပ်ကိုင်ခဲ့သော နာရီပေါင်း",
      incidentsCount: "မတော်တဆမှုကြောင့် အလုပ်ပျက်ကွက်ခြင်း (LTI)",
      auditCompliance: "ဘေးကင်းရေး စစ်ဆေးမှု အောင်မြင်မှုနှုန်း",
      exportPdf: "PDF အဖြစ် ထုတ်ယူမည် / ပရင့်ထုတ်မည်",
      saveToDrive: "Google Drive တွင် သိမ်းဆည်းမည်",
      printReport: "တရားဝင် ဖောင်ပုံစံ ပရင့်ထုတ်ရန်",
      riskDistribution: "အန္တရာယ်အမျိုးအစားအလိုက် ခွဲခြမ်းစိတ်ဖြာမှု",
      monthlySummary: "လစဉ် ဘေးကင်းလုံခြုံရေး သုံးသပ်ချက် အကျဉ်းချုပ်"
    },

    roleSwitcher: {
      title: "အသုံးပြုသူ အခန်းကဏ္ဍ ပြောင်းရန်",
      subtitle: "Multi-Channel Auth & RBAC Persona Switcher",
      loginVia: "အကောင့်ဝင်ရောက်ရန် ချန်နယ်:",
      selectProfile: "စမ်းသပ်ရန် အခန်းကဏ္ဍ ရွေးချယ်ပါ:",
      activeSession: "(လက်ရှိ အသုံးပြုနေသည်)",
      switchTo: "ဤအခန်းကဏ္ဍသို့ ပြောင်းမည် →"
    },

    checklists: {
      hw_1: "မီးလောင်လွယ်သောအရာများကို ၁၀ မီတာအကွာတွင် ရှင်းလင်းထားပါ သို့မဟုတ် မီးခံစောင်ဖြင့် အုပ်ထားပါ",
      hw_2: "မီးသတ်ဆေးဘူး အနီးတွင် အဆင်သင့်ထားပါ (၅ မီတာအတွင်း)",
      hw_3: "မီးစောင့်ကြည့်သူ (Fire Watch) ကို အလုပ်ချိန်တစ်လျှောက်နှင့် ပြီးနောက် မိနစ် ၃၀ ထားရှိပါ",
      hw_4: "မီးလောင်လွယ်ဓာတ်ငွေ့ စစ်ဆေးပါ (LEL < 10%)",
      hw_5: "ဂဟေဆော်ကြိုးနှင့် မြေစိုက်ကြိုးများ ကောင်းမွန်မှုရှိပါစေ",

      wh_1: "ငြမ်းကို စစ်ဆေးပြီး အစိမ်းရောင်ကတ် (Green Scaffolding Tag) ချိတ်ဆွဲထားပါ",
      wh_2: "ခါးပတ်ကြိုး (Full Body Harness) ကို ချိတ်နှစ်ခုဖြင့် စနစ်တကျ ဝတ်ဆင်ပါ",
      wh_3: "ခိုင်ခံ့သော ချိတ်တွယ်ရာနေရာ (Anchor Point အနည်းဆုံး ၂၂၀၀ ကီလို ခံနိုင်ရည်) တွင် ချိတ်ပါ",
      wh_4: "ပစ္စည်းပြုတ်ကျခြင်းမှ ကာကွယ်ရန် ပိုက်ကွန်နှင့် အောက်ခြေကာများ တပ်ဆင်ပါ",
      wh_5: "မိုးသက်လေပြင်းမရှိသော ကောင်းမွန်သည့်ရာသီဥတု ဖြစ်ရမည်",

      cs_1: "ဓာတ်ငွေ့ ၄ မျိုး တိုင်းတာစစ်ဆေးပါ (အောက်ဆီဂျင် ၁၉.၅ - ၂၃.၅% ရှိရမည်)",
      cs_2: "လေမှုတ်စက်ဖြင့် စဉ်ဆက်မပြတ် လေဝင်လေထွက် ပြုလုပ်ပါ",
      cs_3: "အရေးပေါ်ကယ်ဆယ်ရေး ၃ ချောင်းထောက်နှင့် အသက်ကယ်ကြိုး အဆင်သင့်ထားပါ",
      cs_4: "အဝင်ဝတွင် အစောင့်ထားရှိပြီး ဝင်ထွက်သူစာရင်းကို အမြဲမှတ်တမ်းတင်ပါ",
      cs_5: "အတွင်းနှင့် အပြင် ဆက်သွယ်ရေးစကားပြောစက် ကောင်းမွန်ပါစေ",

      ew_1: "လျှပ်စစ်ဓာတ်အား ဖြတ်တောက်ပြီး သော့ခတ်တံဆိပ်ကပ်ပါ (LOTO စနစ်)",
      ew_2: "လျှပ်စစ်မကျန်တော့ကြောင်း တိုင်းတာစစ်ဆေးပါ (Zero Energy Verification)",
      ew_3: "လျှပ်စစ်ကာ လက်အိတ်နှင့် ဘွတ်ဖိနပ်များ ဝတ်ဆင်ပါ",
      ew_4: "အန္တရာယ်သတိပေးဆိုင်းဘုတ်နှင့် တားမြစ်ကြိုးများ ကာရံထားပါ",

      ch_1: "ဓာတုပစ္စည်းဆိုင်ရာ ဘေးကင်းရေးအချက်အလက် (SDS) ကို နားလည်အောင်ဖတ်ပါ",
      ch_2: "အရေးပေါ် မျက်စိဆေးရေပန်းနှင့် ရေချိုးခန်း ကောင်းမွန်စွာ အသုံးပြုနိုင်ပါစေ",
      ch_3: "ဓာတုကာဝတ်စုံ၊ မျက်နှာဖုံးနှင့် လက်အိတ်များ ဝတ်ဆင်ပါ",
      ch_4: "ဓာတုပစ္စည်းယိုဖိတ်မှု သန့်ရှင်းရေးပစ္စည်း (Spill Kit) အဆင်သင့်ထားပါ",

      ex_1: "မတူးမီ မြေအောက်လျှပ်စစ်ကြိုး၊ ရေပိုက်နှင့် ဓာတ်ငွေ့ပိုက်များကို ရှာဖွေစစ်ဆေးပါ",
      ex_2: "၁.၂ မီတာထက်နက်ပါက မြေပြိုကာကွယ်ရေးဘောင် (Shoring) တပ်ဆင်ပါ",
      ex_3: "တူးထားသောမြေနှင့် စက်ယန္တရားများကို အနားစွန်းမှ ၁ မီတာအကွာတွင် ထားပါ",
      ex_4: "၇.၅ မီတာတိုင်းတွင် တက်ဆင်းလှေကား ထားရှိပါ",

      lf_1: "မ ချီမည့်ကြိုး၊ သံကွင်း (Shackles) များ ချို့ယွင်းချက်မရှိစေရ",
      lf_2: "ဝန်အလေးချိန်သည် ကရိန်း၏ သတ်မှတ်ဝန်ထက် မကျော်လွန်စေရ (SWL)",
      lf_3: "ကရိန်းမောင်းသူနှင့် အချက်ပြသူများသည် ကျွမ်းကျင်လက်မှတ်ရှိရမည်",
      lf_4: "ကရိန်းလှည့်လည်ရာ အချင်းဝက်အတွင်း ကြိုးတားပြီး လူမဝင်ရ",

      cw_1: "လုပ်ငန်းခွင်အတွင်း ချော်လဲနိုင်သောအရာများ ရှင်းလင်းထားပါ (5S)",
      cw_2: "လက်ကိုင်စက်ပစ္စည်းများ အကာအကွယ်ပါရှိပြီး အဆင်သင့်ဖြစ်ပါစေ",
      cw_3: "ပြင်ဆင်နေသည်ဟူသော သတိပေးဆိုင်းဘုတ် ချိတ်ဆွဲပါ",
      cw_4: "အလုပ်သမားအားလုံး အခြေခံဘေးကင်းရေးပစ္စည်းများ ဝတ်ဆင်ပါ"
    }
  }
};
