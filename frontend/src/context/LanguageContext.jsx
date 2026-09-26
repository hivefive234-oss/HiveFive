import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // General & Profile
    settings: 'Settings & Profile',
    userProfile: 'User Profile Details',
    languageSupport: 'Language Support Options',
    selectLanguage: 'Select Preferred Language',
    saveChanges: 'Save Changes',
    user: 'User',
    role: 'Lead Beekeeper & Hive Inspector',
    apiary: 'Coorg Shola Apiary, Madikeri, Karnataka',
    org: 'KVIC Registered Honey Cooperative',
    memberId: 'HC-BEE-8821',
    email: 'beekeeper@honeychain.io',
    phone: '+91 98765 43210',
    certifiedStatus: 'Active Certified Beekeeper',
    displayName: 'Display Name',
    standardProfileIdentity: 'Standard system profile identity',
    emailAddress: 'Email Address',
    contactPhone: 'Contact Phone',
    roleDesignation: 'Role & Designation',
    primaryApiaryLoc: 'Primary Apiary Location',
    cooperativeOrg: 'Cooperative / Organization',
    saveChangesSuccess: 'Settings Saved Successfully!',
    securityKeys: 'Security & Blockchain Private Keys',
    cryptoSigningWallet: 'Cryptographic Signing Wallet',
    protectedPrivate: 'PROTECTED & PRIVATE',
    privateKeyDesc: 'Your blockchain private key is stored in a secure local vault. Private keys are NEVER displayed publicly or shared with consumers during verification.',
    colonyHealthAlerts: 'Colony Health Alerts',
    highRiskSms: 'High Risk Hive Telemetry SMS',
    dailyYieldSummary: 'Daily Honey Yield Summary',
    multilingualActive: 'Multilingual Support Active',
    multilingualDesc: 'Language choice updates the Beekeeper Dashboard, Navigation, Settings, and Consumer QR verification portal instantly.',
    
    // Sidebar & Nav
    dashboard: 'Beekeeper Dashboard',
    hives: 'Hives & Telemetry',
    apiaries: 'Apiaries & Correlation',
    recovery: 'Recovery Tracking',
    batches: 'Honey Batches & QR',
    settingsNav: 'Settings & Profile',
    adminNav: 'Admin / KVIC Oversight',
    consumerNav: 'Consumer Verification',
    backToDashboard: 'Back to Beekeeper Dashboard',

    // Dashboard Header & Buttons
    dashboardTitle: 'Beekeeper Intelligence Console',
    dashboardSub: 'Continuous multi-signal colony telemetry & predictive decision support',
    refresh: 'Refresh',
    simulateTick: 'Simulate Telemetry Tick',

    // KPI Cards
    totalHives: 'TOTAL HIVES',
    hivesMonitored: '2 Apiaries monitored',
    healthyColonies: 'HEALTHY COLONIES',
    lowRiskStatus: 'Low risk status',
    requireAttention: 'REQUIRE ATTENTION',
    medRiskAlerts: 'Medium risk alerts',
    highRiskHives: 'HIGH-RISK HIVES',
    inspectionNeeded: 'Inspection needed',
    expectedHarvest: 'EXPECTED HARVEST',
    baselineCapacity: 'Baseline capacity',
    estimatedYield: 'ESTIMATED YIELD',
    potentialDiff: 'potential diff*',

    // Alerts
    thermalAlertTitle: 'Colony Thermal Stress & Agitation Detected (Hive H004)',
    thermalAlertDesc: 'Internal brood temperature breached 38.5°C with elevated acoustic buzzing (345Hz) and -1.2kg weight decline. Immediate on-site check advised.',
    reviewHiveButton: 'Review Hive H004',

    // Insights Matrix
    whatHoneyChainUnderstands: 'What HoneyChain Understands',
    modelActive: 'Model Active',
    xgboostAttribution: 'Based on trained XGBoost model — HC-2026-001 Reference Batch',
    accuracyLabel: '98.97% Test Accuracy',
    f1Label: 'F1 Macro: 0.9831',
    hiveHealthMetric: '01 — Hive Health',
    hiveHealthDesc: 'Current predicted hive health. Overall model-estimated condition based on selected hive features.',
    beeActivityMetric: '02 — Bee Activity',
    beeActivityDesc: 'Observed/modelled activity indicator available from monitored telemetry data.',
    envStabilityMetric: '03 — Env Stability',
    envStabilityDesc: 'Stability based on monitored environmental and brood nest conditions.',
    traceabilityMetric: '04 — Traceability',
    traceabilityDesc: 'All required batch lifecycle events recorded in the prototype ledger.',
    aiConfidenceMetric: '05 — AI Confidence',
    aiConfidenceDesc: 'Indicates the model\'s confidence for this particular prediction.',

    // Telemetry Chart Section
    liveTelemetryStream: 'Live Multi-Signal Telemetry Stream',
    telemetryChartSub: 'Synchronized internal temperature, relative humidity, scale weight, and entrance flight traffic',
    viewingHive: 'Viewing Hive',

    // Colony Profiles
    activeColonyProfiles: 'Active Colony Profiles',
    viewAllHives: 'View All Hives Console',
    healthIndex: 'Health Index',
    colonyState: 'Colony State',
    installedDate: 'Installed',
    intelligenceConsole: 'Intelligence Console',
    disclaimer: '*Scientific Disclaimer: Model-estimated yields and health scores are statistical indicators designed for decision support.',

    // Hives & Hive Detail Page
    hiveConsoleTitle: 'Monitored Hives Console',
    hiveConsoleSub: 'Comprehensive multi-signal telemetry profiles across apiaries',
    searchHivePlaceholder: 'Search hive code or apiary...',
    allRiskLevels: 'All Risk Levels',
    lowRisk: 'Low Risk',
    mediumRisk: 'Medium Risk',
    highRisk: 'High Risk',
    hiveDetails: 'Hive Intelligence Console',
    colonyVigor: 'Colony Vigor & Health Index',
    queenStatus: 'Queen Status',
    broodTemp: 'Brood Nest Temp',
    weightScale: 'Hive Scale Weight',
    acousticHum: 'Acoustic Buzz Frequency',
    cameraInspection: 'Camera & Frame Visual Inspection',
    uploadFrameImage: 'Upload Brood Frame Image',
    dragDropImage: 'Drag & drop brood frame photo here or click to browse',
    analyzeFrame: 'Analyze Frame Photo',
    digitalPassport: 'Digital Passport',
    
    // 11 Detail Tabs
    tabOverview: 'Overview',
    tabSensors: 'Sensors',
    tabCamera: 'Camera',
    tabHealth: 'Health',
    tabPrediction: 'Prediction',
    tabExplainability: 'Explainability',
    tabSimulation: 'Action Simulator',
    tabProduction: 'Production',
    tabHistory: 'History',
    tabHarvest: 'Harvest',
    tabBlockchain: 'Blockchain',

    // Camera & Inspection
    entranceCameraTitle: 'Entrance Activity Camera & Visual Observation',
    entranceCameraSub: 'Sampled entrance traffic analysis and manual inspection uploads',
    sampleEntranceFrame: 'Sample Entrance Observation Frame',
    entranceCameraNote: 'Entrance camera samples visible flight density and pollen foraging. It does not track individual bees.',
    manualPhotoUpload: 'Manual Inspection Photo Upload',
    useWebcam: 'Use Live Camera',
    capturePhoto: 'Capture Photo',
    retakePhoto: 'Retake',
    useCapturedPhoto: 'Use This Photo',
    cancelWebcam: 'Cancel Camera',
    dragDropPhoto: 'Drag inspection photos here or browse',
    supportedFormats: 'Supports JPG, JPEG, PNG, WEBP hive & brood frame inspection photos',
    observationNotesPlaceholder: 'Enter observation notes (e.g. capped brood condition, queen spotted)...',
    logManualObservationBtn: 'Log Manual Observation',
    uploadSuccessMsg: 'Observation & Inspection Photo Logged Successfully!',
    uploadErrorMsg: 'Failed to upload photo. Please check file format or try again.',
    noVisionModelNotice: 'Vision Model Integration Interface Ready — Status: Manual Beekeeper Observation (Awaiting CV Model)',
    modelNotConnected: 'Vision Model Not Connected (Honest Labeling)',
    manualObservationLabel: 'Manual Beekeeper Observation',
    aiAnalysisLabel: 'AI / Model Analysis',

    // Apiaries Page
    apiariesTitle: 'Apiaries & Regional Correlation',
    apiariesSub: 'Geographic apiary clusters, environmental conditions, and cross-colony correlation',
    totalApiaries: 'Total Apiaries',
    activeHivesCount: 'Active Monitored Hives',
    avgHealthScore: 'Average Apiary Health',

    // Recovery Page
    recoveryTitle: 'Colony Recovery Tracker',
    recoverySub: 'Log beekeeper interventions and track how each colony responds over time.',
    logNewAction: 'Log New Action',
    logFollowUp: '+ Log Follow-up',
    totalActions: 'Total Actions',
    recovering: 'Recovering',
    stableRecovered: 'Stable / Recovered',
    needsAttention: 'Needs Attention',
    whyActionTaken: 'Why action was taken',
    whatBeekeeperDid: 'What the beekeeper did',
    healthProgress: 'Health Progress',
    beforeIntervention: 'Before Intervention',
    afterFollowUp: 'After Follow-up Check',
    saveAction: 'Save Action',
    saveCheck: 'Save Check',
    cancel: 'Cancel',

    // Honey Batches Page
    honeyBatchesTitle: 'Honey Batches & Traceability',
    honeyBatchesSub: 'Track honey from hive origin to final product with AI-powered quality and QR verification.',
    addNewBatch: 'Add New Batch',
    registerNewBatch: 'Register New Honey Batch',
    searchBatchPlaceholder: 'Search Batch ID, Hive, Type...',
    allStatus: 'All Status',
    verified: 'Verified',
    pending: 'Pending',
    sortNewest: 'Newest Harvest',
    sortQuantity: 'Quantity (High-Low)',
    sortHealth: 'AI Health Score',
    viewDetails: 'View Details',
    qrCode: 'QR Code',
    verifyBatch: 'Verify Batch',
    registering: 'Registering...',
    registerBatchBtn: 'Register Batch',

    // QR Dual Mode
    batchQRTitle: 'Batch QR Verification Code',
    officialMobileTag: 'Official Mobile Phone Tag',
    qrModeOnline: 'Online Live URL',
    qrModeOffline: 'Offline Cryptographic Stamp',
    onlineQRDesc: 'Scannable by any phone camera to open public HTTPS verification page.',
    offlineQRDesc: 'Embedded self-contained signed batch payload for scanning when network is unavailable.',
    simulateMobileScan: 'Simulate Mobile QR Scan Now',
    downloadQR: 'Download PNG',
    printQR: 'Print Tag',
    openLink: 'Open Link',
    copiedText: 'Copied!',
    copyLink: 'Copy URL',
    offlineSealStatus: 'Offline Cryptographic Seal Verified',
    liveSupabaseStatus: 'Live Supabase Verified',

    // Admin Page
    adminTitle: 'Admin & KVIC Oversight Portal',
    adminSub: 'National honey traceability registry, apiary compliance, and audit logs',
    totalRegisteredBatches: 'Total Registered Batches',
    blockchainRegistryStatus: 'Blockchain Registry Status',
    verifiedPurityRate: 'Verified Pure Honey Rate',

    // Landing & Login
    landingHeroTitle: 'Predictive Hive Health & Honey Traceability Platform',
    landingHeroSub: 'AI-driven colony intelligence combined with tamper-proof blockchain traceability from hive to jar.',
    signInTitle: 'Sign In to HoneyChain Portal',
    sihDemoAccess: 'SIH Demo Access',
    sihDemoSub: 'HiveFive SIH Prototype — Authorized Operator Access',
    zeroPasswordAccess: 'Single Operator & Demo Gateway',
    zeroPasswordDesc: 'Judges and authorized operators can explore full hive telemetry, AI predictions, and honey traceability.',
    continueToConsole: 'Continue to HiveFive Console',
    enteringConsole: 'Entering HiveFive...',
    choosePerspective: 'Or Choose Demo Perspective',
    beekeeperMode: 'Beekeeper Mode',
    adminMode: 'KVIC Admin Mode',
    allowedEmailOnly: 'Authorized Account Access Only',

    // Consumer Portal
    qrScannedTitle: 'Scanned via QR Code',
    authenticityVerified: 'Authenticity Verified',
    productPassport: 'Consumer Product Passport',
    pureHoneyGuarantee: '100% Pure Honey Guarantee',
    hiveOrigin: 'Hive Origin Telemetry',
    aiQualityScore: 'AI Quality & Health Index',
    traceabilityFlow: 'Origin to Jar Lifecycle Flow',
    batchId: 'Batch ID',
    harvestDate: 'Harvest Date',
    floraSource: 'Floral Source',
    quantity: 'Quantity',
    moisture: 'Moisture Content',
    location: 'Apiary Location',
    batchNotRegistered: 'Batch Not Registered',
    batchNotFoundDesc: 'No registered honey batch matching this ID was found.',
    trySampleBatch: 'Try sample batch:',
    verifying: 'Verifying...',
    verifyBtn: 'Verify',

    // Common States
    loadingMsg: 'Loading data...',
    errorMsg: 'An error occurred. Please try again.',
    retryBtn: 'Retry',
    emptyStateMsg: 'No records found.',
    closeBtn: 'Close',

    // Descriptions
    langDesc: 'Choose your preferred language for the HoneyChain platform interface (English, Tamil, Hindi).',
    qrDesc: 'This authentic honey batch record is cryptographically registered on the HoneyChain ledger.',
  },

  ta: {
    // General & Profile (Tamil)
    settings: 'அமைப்புகள் & சுயவிவரம்',
    userProfile: 'பயனர் விவரங்கள்',
    languageSupport: 'மொழி ஆதரவு (Language Options)',
    selectLanguage: 'விரும்பிய மொழியைத் தேர்ந்தெடுக்கவும்',
    saveChanges: 'மாற்றங்களைச் சேமிக்கவும்',
    user: 'User',
    role: 'முதன்மை தேனீ வளர்ப்பாளர் & கூண்டு ஆய்வாளர்',
    apiary: 'கூர்க் சோலை தேனீப் பண்ணை, மடிகேரி, கர்நாடகா',
    org: 'KVIC பதிவுசெய்யப்பட்ட தேன் கூட்டுறவு',
    memberId: 'HC-BEE-8821',
    email: 'beekeeper@honeychain.io',
    phone: '+91 98765 43210',
    certifiedStatus: 'சான்றளிக்கப்பட்ட தேனீ வளர்ப்பாளர்',
    displayName: 'காட்சி பெயர்',
    standardProfileIdentity: 'நிலையான கணினி சுயவிவர அடையாளம்',
    emailAddress: 'மின்னஞ்சல் முகவரி',
    contactPhone: 'தொடர்பு எண்',
    roleDesignation: 'பணி & பதவி',
    primaryApiaryLoc: 'முதன்மை தேனீப் பண்ணை இடம்',
    cooperativeOrg: 'கூட்டுறவு / அமைப்பு',
    saveChangesSuccess: 'அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!',
    securityKeys: 'பாதுகாப்பு & பிளாக்செயின் தனிப்பட்ட விசைகள்',
    cryptoSigningWallet: 'கிரிப்டோகிராஃபிக் கையொப்ப பணப்பை',
    protectedPrivate: 'பாதுகாக்கப்பட்டது & தனிப்பட்டது',
    privateKeyDesc: 'உங்கள் பிளாக்செயின் தனிப்பட்ட விசை பாதுகாப்பான உள்ளூர் பெட்டகத்தில் சேமிக்கப்பட்டுள்ளது. சரிபார்ப்பின் போது இது பகிரப்படாது.',
    colonyHealthAlerts: 'காலனி சுகாதார எச்சரிக்கைகள்',
    highRiskSms: 'அதிக ஆபத்துள்ள கூடு தொலை அளவீட்டு SMS',
    dailyYieldSummary: 'தினசரி தேன் மகசூல் சுருக்கம்',
    multilingualActive: 'பன்மொழி ஆதரவு செயலில் உள்ளது',
    multilingualDesc: 'மொழித் தேர்வு தேனீ வளர்ப்பாளர் டாஷ்போர்டு, வழிசெலுத்தல் மற்றும் நுகர்வோர் QR போர்ட்டலை உடனடியாக மாற்றும்.',

    // Sidebar & Nav
    dashboard: 'தேனீ வளர்ப்பாளர் டாஷ்போர்டு',
    hives: 'தேனீக் கூடுகள் & அளவீடுகள்',
    apiaries: 'தேனீப் பண்ணைகள்',
    recovery: 'மீட்பு கண்காணிப்பு',
    batches: 'தேன் பேட்ச்கள் & QR',
    settingsNav: 'அமைப்புகள் & சுயவிவரம்',
    adminNav: 'நிர்வாகம் & KVIC மேற்பார்வை',
    consumerNav: 'நுகர்வோர் சரிபார்ப்பு',
    backToDashboard: 'டாஷ்போர்டிற்குத் திரும்பு',

    // Dashboard Header & Buttons
    dashboardTitle: 'தேனீ வளர்ப்பாளர் நுண்ணறிவு பணியகம்',
    dashboardSub: 'தொடர்ச்சியான பல சமிக்ஞை தொலைத்தொடர்பு மற்றும் முன்கணிப்பு முடிவு ஆதரவு',
    refresh: 'புதுப்பி',
    simulateTick: 'சென்சார் அளவீடு உருவகப்படுத்து',

    // KPI Cards
    totalHives: 'மொத்த கூடுகள்',
    hivesMonitored: '2 பண்ணைகள் கண்காணிக்கப்படுகின்றன',
    healthyColonies: 'ஆரோக்கியமான கூட்டங்கள்',
    lowRiskStatus: 'குறைந்த ஆபத்து நிலை',
    requireAttention: 'கவனம் தேவை',
    medRiskAlerts: 'நடுத்தர ஆபத்து எச்சரிக்கைகள்',
    highRiskHives: 'அதிக ஆபத்துள்ள கூடுகள்',
    inspectionNeeded: 'நேரடி ஆய்வு தேவை',
    expectedHarvest: 'எதிர்பார்க்கப்படும் அறுவடை',
    baselineCapacity: 'அடிப்படை திறன்',
    estimatedYield: 'மதிப்பிடப்பட்ட விளைச்சல்',
    potentialDiff: 'சாத்தியமான வேறுபாடு*',

    // Alerts
    thermalAlertTitle: 'கூண்டு வெப்ப அழுத்தம் மற்றும் கிளர்ச்சி கண்டறியப்பட்டது (கூடு H004)',
    thermalAlertDesc: 'உள் வெப்பநிலை 38.5°C ஐத் தாண்டியது, அதிக இரைச்சல் (345Hz) மற்றும் -1.2 கிலோ எடை குறைவு. உடனடி நேரடி ஆய்வு தேவை.',
    reviewHiveButton: 'கூடு H004 ஐ ஆராய்க',

    // Insights Matrix
    whatHoneyChainUnderstands: 'HoneyChain புரிந்துகொள்வது என்ன',
    modelActive: 'மாதிரி செயலில் உள்ளது',
    xgboostAttribution: 'பயிற்சி பெற்ற XGBoost மாதிரி — HC-2026-001 குறிப்பு பேட்ச்',
    accuracyLabel: '98.97% துல்லியம்',
    f1Label: 'F1 மேக்ரோ: 0.9831',
    hiveHealthMetric: '01 — கூண்டு ஆரோக்கியம்',
    hiveHealthDesc: 'தேர்ந்தெடுக்கப்பட்ட அம்சங்களின் அடிப்படையில் மாதிரி கணித்த தற்போதைய ஆரோக்கியம்.',
    beeActivityMetric: '02 — தேனீ செயல்பாடு',
    beeActivityDesc: 'சென்சார் தரவிலிருந்து பெறப்பட்ட தேனீக்களின் பறக்கும் செயல்பாடு.',
    envStabilityMetric: '03 — சுற்றுச்சூழல் நிலைத்தன்மை',
    envStabilityDesc: 'சுற்றுச்சூழல் மற்றும் அடைகூடு நிலைமைகளின் அடிப்படையில் நிலைத்தன்மை.',
    traceabilityMetric: '04 — தடமறிதல்',
    traceabilityDesc: 'அனைத்து பேட்ச் வாழ்க்கைச் சுழற்சி நிகழ்வுகளும் லெட்ஜரில் பதிவு செய்யப்பட்டுள்ளன.',
    aiConfidenceMetric: '05 — AI நம்பிக்கை நிலை',
    aiConfidenceDesc: 'இந்த முன்கணிப்புக்கான மாதிரியின் நம்பிக்கை நிலை.',

    // Telemetry Chart Section
    liveTelemetryStream: 'நேரடி பல சமிக்ஞை அளவீடுகள்',
    telemetryChartSub: 'வெப்பநிலை, ஈரப்பதம், எடை மற்றும் நுழைவுப் போக்குவரத்து அளவீடுகள்',
    viewingHive: 'பார்க்கும் கூடு',

    // Colony Profiles
    activeColonyProfiles: 'செயலில் உள்ள கூண்டு சுயவிவரங்கள்',
    viewAllHives: 'அனைத்து கூடுகளையும் காண்க',
    healthIndex: 'ஆரோக்கிய குறியீடு',
    colonyState: 'கூட்டத்தின் நிலை',
    installedDate: 'நிறுவப்பட்டது',
    intelligenceConsole: 'நுண்ணறிவு பணியகம்',
    disclaimer: '*அறிவியல் அறிவிப்பு: மாதிரி கணக்கிட்ட விளைச்சல் மற்றும் ஆரோக்கிய மதிப்பெண்கள் முடிவெடுக்கும் ஆதரவிற்கான புள்ளிவிவரங்கள்.',

    // Hives & Hive Detail Page
    hiveConsoleTitle: 'கண்காணிக்கப்படும் கூடுகள் பணியகம்',
    hiveConsoleSub: 'பண்ணைகளில் உள்ள முழுமையான தொலைத்தொடர்பு சுயவிவரங்கள்',
    searchHivePlaceholder: 'கூடு குறியீடு அல்லது பண்ணையைத் தேடுக...',
    allRiskLevels: 'அனைத்து ஆபத்து நிலைகள்',
    lowRisk: 'குறைந்த ஆபத்து',
    mediumRisk: 'நடுத்தர ஆபத்து',
    highRisk: 'அதிக ஆபத்து',
    hiveDetails: 'கூடு நுண்ணறிவு பணியகம்',
    colonyVigor: 'கூட்டின் வலிமை மற்றும் ஆரோக்கிய குறியீடு',
    queenStatus: 'ராணி தேனீ நிலை',
    broodTemp: 'அடை அறை வெப்பநிலை',
    weightScale: 'கூட்டின் எடை அளவீடு',
    acousticHum: 'ஒலி அதிர்வெண் (Hz)',
    cameraInspection: 'கேமரா & சட்டக காட்சி ஆய்வு',
    uploadFrameImage: 'அடை சட்டக புகைப்படத்தை பதிவேற்றவும்',
    dragDropImage: 'புகைப்படத்தை இங்கே இழுத்து விடவும் அல்லது உலாவ கிளிக் செய்யவும்',
    analyzeFrame: 'புகைப்படத்தை ஆய்வு செய்க',
    digitalPassport: 'டிஜிட்டல் பாஸ்போர்ட்',

    // 11 Detail Tabs
    tabOverview: 'மேலோட்டம்',
    tabSensors: 'சென்சார்கள்',
    tabCamera: 'கேமரா',
    tabHealth: 'ஆரோக்கியம்',
    tabPrediction: 'முன்கணிப்பு',
    tabExplainability: 'விளக்கத்தன்மை',
    tabSimulation: 'செயல் உருவகப்படுத்துதல்',
    tabProduction: 'உற்பத்தி',
    tabHistory: 'வரலாறு',
    tabHarvest: 'அறுவடை',
    tabBlockchain: 'பிளாக்செயின்',

    // Camera & Inspection
    entranceCameraTitle: 'நுழைவு செயல்பாடு கேமரா & காட்சி கண்காணிப்பு',
    entranceCameraSub: 'நுழைவு போக்குவரத்து பகுப்பாய்வு மற்றும் நேரடி ஆய்வு புகைப்படங்கள்',
    sampleEntranceFrame: 'மாதிரி நுழைவு கண்காணிப்பு காட்சி',
    entranceCameraNote: 'நுழைவு கேமரா பறக்கும் அடர்த்தி மற்றும் மகரந்தச் சேர்க்கையை மாதிரியாகக் கண்காணிக்கிறது.',
    manualPhotoUpload: 'நேரடி ஆய்வு புகைப்படப் பதிவேற்றம்',
    useWebcam: 'நேரடி கேமராவைப் பயன்படுத்து',
    capturePhoto: 'புகைப்படம் எடு',
    retakePhoto: 'மீண்டும் எடு',
    useCapturedPhoto: 'இப்புகைப்படத்தைப் பயன்படுத்து',
    cancelWebcam: 'கேமராவை மூடு',
    dragDropPhoto: 'புகைப்படங்களை இங்கே இழுத்து விடவும் அல்லது தேர்ந்தெடுக்கவும்',
    supportedFormats: 'JPG, JPEG, PNG, WEBP வடிவங்களை ஆதரிக்கிறது',
    observationNotesPlaceholder: 'கண்காணிப்புக் குறிப்புகளை உள்ளிடவும் (எ.கா. அடை நிலை, ராணி காணப்பட்டது)...',
    logManualObservationBtn: 'நேரடி அவதானிப்பைப் பதிவு செய்',
    uploadSuccessMsg: 'ஆய்வுப் புகைப்படம் மற்றும் குறிப்புகள் வெற்றிகரமாகப் பதிவு செய்யப்பட்டன!',
    uploadErrorMsg: 'புகைப்படத்தைப் பதிவேற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    noVisionModelNotice: 'பார்வை மாதிரி இடைமுகம் தயார் — நிலை: தேனீ வளர்ப்பாளரின் நேரடி அவதானிப்பு (AI மாதிரி காத்திருக்கிறது)',
    modelNotConnected: 'பார்வை மாதிரி இணைக்கப்படவில்லை (நேர்மையான லேபிளிங்)',
    manualObservationLabel: 'தேனீ வளர்ப்பாளரின் நேரடி அவதானிப்பு',
    aiAnalysisLabel: 'AI / மாதிரி பகுப்பாய்வு',

    // Apiaries Page
    apiariesTitle: 'தேனீப் பண்ணைகள் & பிராந்திய தொடர்பு',
    apiariesSub: 'புவியியல் பண்ணைக் கூட்டங்கள், சுற்றுச்சூழல் நிலைமைகள் மற்றும் தொடர்பு',
    totalApiaries: 'மொத்தப் பண்ணைகள்',
    activeHivesCount: 'கண்காணிக்கப்படும் கூடுகள்',
    avgHealthScore: 'சராசரி பண்ணை ஆரோக்கியம்',

    // Recovery Page
    recoveryTitle: 'கூட்டம் மீட்பு கண்காணிப்பு',
    recoverySub: 'தேனீ வளர்ப்பாளர் நடவடிக்கைகளைப் பதிவு செய்து மீட்பு நிலையை கண்காணிக்கவும்.',
    logNewAction: 'புதிய நடவடிக்கை பதிவு செய்',
    logFollowUp: '+ பின்தொடர் ஆய்வு',
    totalActions: 'மொத்த நடவடிக்கைகள்',
    recovering: 'மீண்டு வருகிறது',
    stableRecovered: 'நிலையானது / குணமடைந்தது',
    needsAttention: 'கவனம் தேவை',
    whyActionTaken: 'நடவடிக்கைக்கான காரணம்',
    whatBeekeeperDid: 'தேனீ வளர்ப்பாளர் செய்தது',
    healthProgress: 'ஆரோக்கிய முன்னேற்றம்',
    beforeIntervention: 'நடவடிக்கைக்கு முன்',
    afterFollowUp: 'பின்தொடர் ஆய்வுக்குப் பின்',
    saveAction: 'நடவடிக்கையைச் சேமி',
    saveCheck: 'ஆய்வைச் சேமி',
    cancel: 'ரத்து செய்',

    // Honey Batches Page
    honeyBatchesTitle: 'தேன் பேட்ச்கள் & தடமறிதல்',
    honeyBatchesSub: 'கூட்டிலிருந்து இறுதி தயாரிப்பு வரை AI தரம் மற்றும் QR சரிபார்ப்புடன் கண்காணிக்கவும்.',
    addNewBatch: 'புதிய பேட்ச் சேர்க்க',
    registerNewBatch: 'புதிய தேன் பேட்சை பதிவு செய்',
    searchBatchPlaceholder: 'பேட்ச் ஐடி, கூடு, வகை தேடவும்...',
    allStatus: 'அனைத்து நிலைகளும்',
    verified: 'சரிபார்க்கப்பட்டது',
    pending: 'நிலுவையில் உள்ளது',
    sortNewest: 'புதிய அறுவடை',
    sortQuantity: 'அளவு (அதிகம்-குறைவு)',
    sortHealth: 'AI ஆரோக்கிய மதிப்பெண்',
    viewDetails: 'விவரங்களைக் காண்க',
    qrCode: 'QR குறியீடு',
    verifyBatch: 'பேட்சை சரிபார்',
    registering: 'பதிவு செய்யப்படுகிறது...',
    registerBatchBtn: 'பேட்சை பதிவு செய்',

    // QR Dual Mode
    batchQRTitle: 'பேட்ச் QR சரிபார்ப்புக் குறியீடு',
    officialMobileTag: 'அதிகாரப்பூர்வ மொபைல் குறிச்சொல்',
    qrModeOnline: 'நேரடி இணையதள QR (URL)',
    qrModeOffline: 'இணையமில்லா குறியாக்க முத்திரை (Offline Stamp)',
    onlineQRDesc: 'பொது HTTPS பக்கத்தைத் திறக்க எந்த கேமரா மூலமும் ஸ்கேன் செய்யலாம்.',
    offlineQRDesc: 'இணைய இணைப்பு இல்லாதபோதும் தகவல்களை அறிய பாதுகாப்பான மறைகுறியாக்கப்பட்ட முத்திரை.',
    simulateMobileScan: 'மொபைல் ஸ்கேனை உருவகப்படுத்து',
    downloadQR: 'PNG பதிவிறக்கு',
    printQR: 'அச்சிடு',
    openLink: 'இணைப்பைத் திற',
    copiedText: 'நகலெடுக்கப்பட்டது!',
    copyLink: 'URL ஐ நகலெடு',
    offlineSealStatus: 'இணையமில்லா குறியாக்க முத்திரை சரிபார்க்கப்பட்டது',
    liveSupabaseStatus: 'நேரடி Supabase சரிபார்க்கப்பட்டது',

    // Admin Page
    adminTitle: 'நிர்வாகம் & KVIC மேற்பார்வை போர்டல்',
    adminSub: 'தேசிய தேன் தடமறிதல் பதிவேடு, பண்ணை இணக்கம் மற்றும் தணிக்கை பதிவுகள்',
    totalRegisteredBatches: 'மொத்த பதிவுசெய்யப்பட்ட பேட்ச்கள்',
    blockchainRegistryStatus: 'பிளாக்செயின் பதிவேடு நிலை',
    verifiedPurityRate: 'சரிபார்க்கப்பட்ட தூய தேன் விகிதம்',

    // Landing & Login
    landingHeroTitle: 'முன்கணிப்பு கூண்டு ஆரோக்கியம் & தேன் தடமறிதல் தளம்',
    landingHeroSub: 'கூட்டிலிருந்து ஜார் வரை பிளாக்செயின் பாதுகாப்புடன் கூடிய AI தொழில்நுட்பம்.',
    signInTitle: 'HoneyChain போர்ட்டலில் உள்நுழைக',
    sihDemoAccess: 'SIH டெமோ அணுகல்',
    sihDemoSub: 'HiveFive SIH முன்மாதிரி — அங்கீகரிக்கப்பட்ட ஆபரேட்டர் அணுகல்',
    zeroPasswordAccess: 'ஒற்றை ஆபரேட்டர் & டெமோ நுழைவாயில்',
    zeroPasswordDesc: 'நடுவர்கள் மற்றும் ஆபரேட்டர்கள் கூண்டு தொலைத்தொடர்பு மற்றும் தேன் தடமறிதலை முழுமையாக ஆராயலாம்.',
    continueToConsole: 'HiveFive பணியகத்திற்குச் செல்க',
    enteringConsole: 'நுழைகிறது...',
    choosePerspective: 'டெமோ பார்வையைத் தேர்ந்தெடுக்கவும்',
    beekeeperMode: 'தேனீ வளர்ப்பாளர் பயன்முறை',
    adminMode: 'KVIC நிர்வாக பயன்முறை',
    allowedEmailOnly: 'அங்கீகரிக்கப்பட்ட கணக்கு அணுகல் மட்டுமே',

    // Consumer Portal
    qrScannedTitle: 'QR குறியீடு மூலம் ஸ்கேன் செய்யப்பட்டது',
    authenticityVerified: 'உண்மைத்தன்மை சரிபார்க்கப்பட்டது',
    productPassport: 'நுகர்வோர் தயாரிப்பு பாஸ்போர்ட்',
    pureHoneyGuarantee: '100% தூய தேன் உத்தரவாதம்',
    hiveOrigin: 'கூடு மூல அளவீடுகள்',
    aiQualityScore: 'AI தரம் மற்றும் ஆரோக்கிய குறியீடு',
    traceabilityFlow: 'கூட்டிலிருந்து ஜார் வரை சுழற்சி',
    batchId: 'பேட்ச் ஐடி',
    harvestDate: 'அறுவடை தேதி',
    floraSource: 'மலர் ஆதாரம்',
    quantity: 'அளவு',
    moisture: 'ஈரப்பதம்',
    location: 'பண்ணை இடம்',
    batchNotRegistered: 'பேட்ச் பதிவு செய்யப்படவில்லை',
    batchNotFoundDesc: 'இந்த ஐடிக்குரிய பதிவுசெய்யப்பட்ட தேன் பேட்ச் எதுவும் கிடைக்கவில்லை.',
    trySampleBatch: 'மாதிரி பேட்சை முயற்சிக்கவும்:',
    verifying: 'சரிபார்க்கப்படுகிறது...',
    verifyBtn: 'சரிபார்',

    // Common States
    loadingMsg: 'தரவு ஏற்றப்படுகிறது...',
    errorMsg: 'பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
    retryBtn: 'மீண்டும் முயற்சி செய்',
    emptyStateMsg: 'பதிவுகள் எதுவும் இல்லை.',
    closeBtn: 'மூடு',

    // Descriptions
    langDesc: 'HoneyChain தளத்திற்கான உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும் (ஆங்கிலம், தமிழ், இந்தி).',
    qrDesc: 'இந்த உண்மையான தேன் பேட்ச் பதிவு HoneyChain பிளாக்செயின் லெட்ஜரில் பதிவு செய்யப்பட்டுள்ளது.',
  },

  hi: {
    // General & Profile (Hindi)
    settings: 'सेटिंग्स और प्रोफ़ाइल',
    userProfile: 'उपयोगकर्ता प्रोफ़ाइल विवरण',
    languageSupport: 'भाषा समर्थन विकल्प (Language Options)',
    selectLanguage: 'पसंदीदा भाषा चुनें',
    saveChanges: 'परिवर्तन सहेजें',
    user: 'User',
    role: 'मुख्य मधुमक्खी पालक एवं छत्ता निरीक्षक',
    apiary: 'कूर्ग शोला मधुमक्खी फार्म, मडिकेरी, कर्नाटक',
    org: 'KVIC पंजीकृत शहद सहकारी समिति',
    memberId: 'HC-BEE-8821',
    email: 'beekeeper@honeychain.io',
    phone: '+91 98765 43210',
    certifiedStatus: 'सक्रिय प्रमाणित मधुमक्खी पालक',
    displayName: 'प्रदर्शन नाम',
    standardProfileIdentity: 'मानक प्रणाली प्रोफ़ाइल पहचान',
    emailAddress: 'ईमेल पता',
    contactPhone: 'संपर्क फ़ोन',
    roleDesignation: 'भूमिका और पद',
    primaryApiaryLoc: 'प्राथमिक मधुमक्खी पालन स्थान',
    cooperativeOrg: 'सहकारी / संगठन',
    saveChangesSuccess: 'सेटिंग्स सफलतापूर्वक सहेजी गईं!',
    securityKeys: 'सुरक्षा और ब्लॉकचेन निजी कुंजी',
    cryptoSigningWallet: 'क्रिप्टोग्राफ़िक हस्ताक्षर वॉलेट',
    protectedPrivate: 'संरक्षित और निजी',
    privateKeyDesc: 'आपकी ब्लॉकचेन निजी कुंजी एक सुरक्षित स्थानीय वॉल्ट में संग्रहीत है। सत्यापन के दौरान इसे कभी भी साझा नहीं किया जाता है।',
    colonyHealthAlerts: 'कॉलोनी स्वास्थ्य अलर्ट',
    highRiskSms: 'उच्च जोखिम छत्ता टेलीमेट्री एसएमएस',
    dailyYieldSummary: 'दैनिक शहद उपज सारांश',
    multilingualActive: 'बहुभाषी समर्थन सक्रिय',
    multilingualDesc: 'भाषा चयन तुरंत मधुमक्खी पालक डैशबोर्ड, नेविगेशन और उपभोक्ता क्यूआर पोर्टल को अपडेट करता है।',

    // Sidebar & Nav
    dashboard: 'मधुमक्खी पालक डैशबोर्ड',
    hives: 'छत्ते और टेलीमेट्री',
    apiaries: 'मधुमक्खी फार्म',
    recovery: 'रिकवरी ट्रैकिंग',
    batches: 'शहद बैच और QR',
    settingsNav: 'सेटिंग्स और प्रोफ़ाइल',
    adminNav: 'प्रशासक / KVIC निगरानी',
    consumerNav: 'उपभोक्ता सत्यापन',
    backToDashboard: 'डैशबोर्ड पर वापस जाएं',

    // Dashboard Header & Buttons
    dashboardTitle: 'मधुमक्खी पालक इंटेलिजेंस कंसोल',
    dashboardSub: 'निरंतर मल्टी-सिग्नल टेलीमेट्री और पूर्वानुमानात्मक निर्णय समर्थन',
    refresh: 'ताज़ा करें',
    simulateTick: 'सेंसर टिक का अनुकरण करें',

    // KPI Cards
    totalHives: 'कुल छत्ते',
    hivesMonitored: '2 फार्मों की निगरानी',
    healthyColonies: 'स्वस्थ कॉलोनियां',
    lowRiskStatus: 'कम जोखिम स्थिति',
    requireAttention: 'ध्यान देने की आवश्यकता',
    medRiskAlerts: 'मध्यम जोखिम चेतावनी',
    highRiskHives: 'उच्च जोखिम वाले छत्ते',
    inspectionNeeded: 'निरीक्षण आवश्यक',
    expectedHarvest: 'अपेक्षित कटाई',
    baselineCapacity: 'आधारभूत क्षमता',
    estimatedYield: 'अनुमानित उपज',
    potentialDiff: 'संभावित अंतर*',

    // Alerts
    thermalAlertTitle: 'कॉलोनी में अत्यधिक तापमान और हलचल दर्ज (छत्ता H004)',
    thermalAlertDesc: 'आंतरिक तापमान 38.5°C से अधिक हो गया है, अत्यधिक भनभनाहट (345Hz) और -1.2 किग्रा वजन में गिरावट। तत्काल निरीक्षण की सलाह।',
    reviewHiveButton: 'छत्ता H004 की समीक्षा करें',

    // Insights Matrix
    whatHoneyChainUnderstands: 'HoneyChain क्या समझता है',
    modelActive: 'मॉडल सक्रिय',
    xgboostAttribution: 'प्रशिक्षित XGBoost मॉडल पर आधारित — HC-2026-001 संदर्भ बैच',
    accuracyLabel: '98.97% सटीकता',
    f1Label: 'F1 मैक्रो: 0.9831',
    hiveHealthMetric: '01 — छत्ता स्वास्थ्य',
    hiveHealthDesc: 'चयनित सुविधाओं के आधार पर मॉडल द्वारा अनुमानित वर्तमान स्थिति।',
    beeActivityMetric: '02 — मधुमक्खी गतिविधि',
    beeActivityDesc: 'टेलीमेट्री डेटा से प्राप्त मधुमक्खियों की उड़ान गतिविधि।',
    envStabilityMetric: '03 — पर्यावरणीय स्थिरता',
    envStabilityDesc: 'पर्यावरणीय और छत्ते की आंतरिक स्थितियों की स्थिरता।',
    traceabilityMetric: '04 — पता लगाने की क्षमता',
    traceabilityDesc: 'सभी आवश्यक बैच जीवनचक्र घटनाएँ लेज़र में दर्ज हैं।',
    aiConfidenceMetric: '05 — AI विश्वास स्तर',
    aiConfidenceDesc: 'इस भविष्यवाणी के लिए मॉडल का आत्मविश्वास स्तर।',

    // Telemetry Chart Section
    liveTelemetryStream: 'लाइव मल्टी-सिग्नल टेलीमेट्री स्ट्रीम',
    telemetryChartSub: 'तापमान, आर्द्रता, वजन और उड़ान गतिविधि का रीयल-टाइम डेटा',
    viewingHive: 'वर्तमान छत्ता',

    // Colony Profiles
    activeColonyProfiles: 'सक्रिय कॉलोनी प्रोफ़ाइल',
    viewAllHives: 'सभी छत्ते देखें',
    healthIndex: 'स्वास्थ्य सूचकांक',
    colonyState: 'कॉलोनी की स्थिति',
    installedDate: 'स्थापना तिथि',
    intelligenceConsole: 'इंटेलिजेंस कंसोल',
    disclaimer: '*वैज्ञानिक अस्वीकरण: अनुमानित उपज और स्वास्थ्य स्कोर निर्णय समर्थन के लिए सांख्यिकीय संकेतक हैं।',

    // Hives & Hive Detail Page
    hiveConsoleTitle: 'निगरानी वाले छत्ते कंसोल',
    hiveConsoleSub: 'मधुमक्खी फार्मों का व्यापक मल्टी-सिग्नल टेलीमेट्री प्रोफ़ाइल',
    searchHivePlaceholder: 'छत्ता कोड या फार्म खोजें...',
    allRiskLevels: 'सभी जोखिम स्तर',
    lowRisk: 'कम जोखिम',
    mediumRisk: 'मध्यम जोखिम',
    highRisk: 'उच्च जोखिम',
    hiveDetails: 'छत्ता इंटेलिजेंस कंसोल',
    colonyVigor: 'कॉलोनी स्वास्थ्य सूचकांक',
    queenStatus: 'रानी मधुमक्खी की स्थिति',
    broodTemp: 'आंतरिक तापमान',
    weightScale: 'छत्ते का वजन',
    acousticHum: 'ध्वनि आवृत्ति (Hz)',
    cameraInspection: 'कैमरा और फ्रेम दृश्य निरीक्षण',
    uploadFrameImage: 'फ्रेम फोटो अपलोड करें',
    dragDropImage: 'फ्रेम फोटो यहाँ खींचें या ब्राउज़ करने के लिए क्लिक करें',
    analyzeFrame: 'फोटो का विश्लेषण करें',
    digitalPassport: 'डिजिटल पासपोर्ट',

    // 11 Detail Tabs
    tabOverview: 'अवलोकन',
    tabSensors: 'सेंसर',
    tabCamera: 'कैमरा',
    tabHealth: 'स्वास्थ्य',
    tabPrediction: 'भविष्यवाणी',
    tabExplainability: 'व्याख्यात्मकता',
    tabSimulation: 'कार्रवाई सिम्युलेटर',
    tabProduction: 'उत्पादन',
    tabHistory: 'इतिहास',
    tabHarvest: 'कटाई',
    tabBlockchain: 'ब्लॉकचेन',

    // Camera & Inspection
    entranceCameraTitle: 'प्रवेश द्वार कैमरा और दृश्य अवलोकन',
    entranceCameraSub: 'प्रवेश यातायात विश्लेषण और मैनुअल निरीक्षण फोटो अपलोड',
    sampleEntranceFrame: 'नमूना प्रवेश द्वार दृश्य',
    entranceCameraNote: 'प्रवेश कैमरा उड़ान घनत्व और पराग संग्रह की निगरानी करता है।',
    manualPhotoUpload: 'मैनुअल निरीक्षण फोटो अपलोड',
    useWebcam: 'लाइव कैमरे का उपयोग करें',
    capturePhoto: 'फोटो खींचे',
    retakePhoto: 'पुनः खींचे',
    useCapturedPhoto: 'इस फोटो का उपयोग करें',
    cancelWebcam: 'कैमरा बंद करें',
    dragDropPhoto: 'निरीक्षण फोटो यहाँ खींचें या चुनें',
    supportedFormats: 'JPG, JPEG, PNG, WEBP प्रारूप समर्थित हैं',
    observationNotesPlaceholder: 'अवलोकन नोट्स दर्ज करें (जैसे- ब्रूड स्थिति, रानी देखी गई)...',
    logManualObservationBtn: 'मैनुअल अवलोकन दर्ज करें',
    uploadSuccessMsg: 'निरीक्षण फोटो और नोट्स सफलतापूर्वक सहेजे गए!',
    uploadErrorMsg: 'फोटो अपलोड करने में विफल। कृपया पुनः प्रयास करें।',
    noVisionModelNotice: 'विज़न मॉडल इंटरफ़ेस तैयार — स्थिति: पालक का मैनुअल अवलोकन (AI मॉडल प्रतीक्षारत)',
    modelNotConnected: 'विज़न मॉडल कनेक्ट नहीं है (ईमानदार लेबलिंग)',
    manualObservationLabel: 'पालक का मैनुअल अवलोकन',
    aiAnalysisLabel: 'AI / मॉडल विश्लेषण',

    // Apiaries Page
    apiariesTitle: 'मधुमक्खी फार्म और क्षेत्रीय संबंध',
    apiariesSub: 'भौगोलिक फार्म क्लस्टर, पर्यावरणीय स्थिति और संबंध',
    totalApiaries: 'कुल मधुमक्खी फार्म',
    activeHivesCount: 'सक्रिय निगरानी छत्ते',
    avgHealthScore: 'औसत फार्म स्वास्थ्य',

    // Recovery Page
    recoveryTitle: 'कॉलोनी रिकवरी ट्रैकिंग',
    recoverySub: 'मधुमक्खी पालक की कार्रवाइयों को दर्ज करें और रिकवरी ट्रैक करें।',
    logNewAction: 'नई कार्रवाई दर्ज करें',
    logFollowUp: '+ फॉलो-अप जांच दर्ज करें',
    totalActions: 'कुल कार्रवाइयां',
    recovering: 'सुधार हो रहा है',
    stableRecovered: 'स्थिर / ठीक हो गया',
    needsAttention: 'ध्यान देने योग्य',
    whyActionTaken: 'कार्रवाई का कारण',
    whatBeekeeperDid: 'पालक ने क्या किया',
    healthProgress: 'स्वास्थ्य प्रगति',
    beforeIntervention: 'कार्रवाई से पहले',
    afterFollowUp: 'फॉलो-अप जांच के बाद',
    saveAction: 'कार्रवाई सहेजें',
    saveCheck: 'जांच सहेजें',
    cancel: 'रद्द करें',

    // Honey Batches Page
    honeyBatchesTitle: 'शहद बैच और पता लगाने की क्षमता',
    honeyBatchesSub: 'छत्ते से अंतिम उत्पाद तक शहद की गुणवत्ता को AI और QR द्वारा ट्रैक करें।',
    addNewBatch: 'नया बैच जोड़ें',
    registerNewBatch: 'नया शहद बैच पंजीकृत करें',
    searchBatchPlaceholder: 'बैच आईडी, छत्ता, प्रकार खोजें...',
    allStatus: 'सभी स्थितियां',
    verified: 'सत्यापित',
    pending: 'लंबित',
    sortNewest: 'नवीनतम कटाई',
    sortQuantity: 'मात्रा (उच्च-निम्न)',
    sortHealth: 'AI स्वास्थ्य स्कोर',
    viewDetails: 'विवरण देखें',
    qrCode: 'क्यूआर कोड',
    verifyBatch: 'बैच सत्यापित करें',
    registering: 'पंजीकृत हो रहा है...',
    registerBatchBtn: 'बैच पंजीकृत करें',

    // QR Dual Mode
    batchQRTitle: 'बैच QR सत्यापन कोड',
    officialMobileTag: 'आधिकारिक मोबाइल टैग',
    qrModeOnline: 'लाइव ऑनलाइन QR (URL)',
    qrModeOffline: 'ऑफ़लाइन क्रिप्टोग्राफ़िक स्टैम्प (Offline Stamp)',
    onlineQRDesc: 'सार्वजनिक HTTPS सत्यापन पृष्ठ खोलने के लिए किसी भी कैमरे से स्कैन करें।',
    offlineQRDesc: 'इंटरनेट न होने पर भी सुरक्षित सत्यापन के लिए अंतर्निहित हस्ताक्षरित डेटा।',
    simulateMobileScan: 'मोबाइल स्कैन का अनुकरण करें',
    downloadQR: 'PNG डाउनलोड करें',
    printQR: 'प्रिंट करें',
    openLink: 'लिंक खोलें',
    copiedText: 'कॉपी किया गया!',
    copyLink: 'URL कॉपी करें',
    offlineSealStatus: 'ऑफ़लाइन क्रिप्टोग्राफ़िक सील सत्यापित',
    liveSupabaseStatus: 'लाइव Supabase सत्यापित',

    // Admin Page
    adminTitle: 'प्रशासक एवं KVIC निगरानी पोर्टल',
    adminSub: 'राष्ट्रीय शहद रजिस्ट्री, फार्म अनुपालन और ऑडिट लॉग',
    totalRegisteredBatches: 'कुल पंजीकृत बैच',
    blockchainRegistryStatus: 'ब्लॉकचेन रजिस्ट्री स्थिति',
    verifiedPurityRate: 'सत्यापित शुद्धता दर',

    // Landing & Login
    landingHeroTitle: 'पूर्वानुमानित छत्ता स्वास्थ्य एवं शहद पता लगाने का मंच',
    landingHeroSub: 'छत्ते से जार तक ब्लॉकचेन सुरक्षा के साथ AI तकनीक।',
    signInTitle: 'HoneyChain पोर्टल में साइन इन करें',
    sihDemoAccess: 'SIH डेमो एक्सेस',
    sihDemoSub: 'HiveFive SIH प्रोटोटाइप — अधिकृत ऑपरेटर एक्सेस',
    zeroPasswordAccess: 'सिंगल ऑपरेटर एवं डेमो गेटवे',
    zeroPasswordDesc: 'जज और ऑपरेटर बिना पासवर्ड के पूर्ण टेलीमेट्री और शहद ट्रेसबिलिटी देख सकते हैं।',
    continueToConsole: 'HiveFive कंसोल पर आगे बढ़ें',
    enteringConsole: 'प्रवेश हो रहा है...',
    choosePerspective: 'डेमो परिप्रेक्ष्य चुनें',
    beekeeperMode: 'मधुमक्खी पालक मोड',
    adminMode: 'KVIC प्रशासक मोड',
    allowedEmailOnly: 'केवल अधिकृत खाते की पहुंच',

    // Consumer Portal
    qrScannedTitle: 'क्यूआर (QR) कोड द्वारा स्कैन किया गया',
    authenticityVerified: 'प्रामाणिकता सत्यापित',
    productPassport: 'उपभोक्ता उत्पाद पासपोर्ट',
    pureHoneyGuarantee: '100% शुद्ध शहद की गारंटी',
    hiveOrigin: 'छत्ता मूल टेलीमेट्री',
    aiQualityScore: 'AI गुणवत्ता एवं स्वास्थ्य सूचकांक',
    traceabilityFlow: 'छत्ते से जार तक जीवनचक्र',
    batchId: 'बैच आईडी',
    harvestDate: 'कटाई की तारीख',
    floraSource: 'पुष्प स्रोत',
    quantity: 'मात्रा',
    moisture: 'नमी की मात्रा',
    location: 'फार्म का स्थान',
    batchNotRegistered: 'बैच पंजीकृत नहीं है',
    batchNotFoundDesc: 'इस आईडी से मेल खाता कोई पंजीकृत शहद बैच नहीं मिला।',
    trySampleBatch: 'नमूना बैच आज़माएं:',
    verifying: 'सत्यापित हो रहा है...',
    verifyBtn: 'सत्यापित करें',

    // Common States
    loadingMsg: 'डेटा लोड हो रहा है...',
    errorMsg: 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
    retryBtn: 'पुनः प्रयास करें',
    emptyStateMsg: 'कोई रिकॉर्ड नहीं मिला।',
    closeBtn: 'बंद करें',

    // Descriptions
    langDesc: 'HoneyChain प्लेटफ़ॉर्म इंटरफ़ेस के लिए अपनी पसंदीदा भाषा चुनें (अंग्रेज़ी, तमिल, हिंदी)।',
    qrDesc: 'यह प्रामाणिक शहद बैच रिकॉर्ड HoneyChain ब्लॉकचेन बहीखाते पर पंजीकृत है।',
  }
};

function detectDeviceLanguage() {
  const manual = localStorage.getItem('honeychain_manual_lang');
  if (manual && TRANSLATIONS[manual]) {
    return manual;
  }

  const browserLangs = [
    ...(navigator.languages || []),
    navigator.language,
    navigator.userLanguage
  ].filter(Boolean);

  for (const lang of browserLangs) {
    const code = String(lang).toLowerCase();
    if (code.startsWith('ta')) return 'ta'; // Tamil
    if (code.startsWith('hi')) return 'hi'; // Hindi
    if (code.startsWith('en')) return 'en'; // English
  }

  return 'en'; // Fallback to English for any unsupported language
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => detectDeviceLanguage());

  const setLanguage = (newLang) => {
    if (TRANSLATIONS[newLang]) {
      localStorage.setItem('honeychain_manual_lang', newLang);
      localStorage.setItem('honeychain_lang', newLang);
      setLanguageState(newLang);
    }
  };

  useEffect(() => {
    localStorage.setItem('honeychain_lang', language);
  }, [language]);

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
