// =====================================================================
// iSchool Skills Chatbot – Frontend Logic
// =====================================================================

(function () {
  "use strict";

  // ── DOM Elements ────────────────────────────────────────────────
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const typingIndicator = document.getElementById("typingIndicator");
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const attachBtn = document.getElementById("attachBtn");
  const fileInput = document.getElementById("fileInput");
  const attachmentPreview = document.getElementById("attachmentPreview");
  const previewImg = document.getElementById("previewImg");
  const removeAttachBtn = document.getElementById("removeAttachBtn");
  const skillCards = document.querySelectorAll(".skill-card");
  const chatMain = document.querySelector(".chat-main");
  const fullTimeCourseToggle = document.getElementById("fullTimeCourseToggle");
  const fullTimeCourseList = document.getElementById("fullTimeCourseList");
  const fullTimeCourse2Toggle = document.getElementById("fullTimeCourse2Toggle");
  const fullTimeCourse2List = document.getElementById("fullTimeCourse2List");
  const softSkillsToggle = document.getElementById("softSkillsToggle");
  const softSkillsList = document.getElementById("softSkillsList");
  const managementSkillsToggle = document.getElementById("managementSkillsToggle");
  const managementSkillsList = document.getElementById("managementSkillsList");
  const studentCasesToggle = document.getElementById("studentCasesToggle");
  const studentCasesList = document.getElementById("studentCasesList");

  const presentationSkillsToggle = document.getElementById("presentationSkillsToggle");
  const presentationSkillsList = document.getElementById("presentationSkillsList");

  const partTimeCourse1Toggle = document.getElementById("partTimeCourse1Toggle");
  const partTimeCourse1List = document.getElementById("partTimeCourse1List");

  // ── Full Time Course Accordion Toggle ───────────────────────────
  if (fullTimeCourseToggle && fullTimeCourseList) {
    fullTimeCourseToggle.addEventListener("click", () => {
      const isExpanded = fullTimeCourseToggle.getAttribute("aria-expanded") === "true";
      fullTimeCourseToggle.setAttribute("aria-expanded", String(!isExpanded));
      fullTimeCourseList.classList.toggle("open");
    });
  }

  // ── Full Time Course Part 2 Accordion Toggle ────────────────────
  if (fullTimeCourse2Toggle && fullTimeCourse2List) {
    fullTimeCourse2Toggle.addEventListener("click", () => {
      const isExpanded = fullTimeCourse2Toggle.getAttribute("aria-expanded") === "true";
      fullTimeCourse2Toggle.setAttribute("aria-expanded", String(!isExpanded));
      fullTimeCourse2List.classList.toggle("open");
    });
  }

  // ── Full Time Course Part 3 Accordion Toggle ────────────────────
  if (fullTimeCourse3Toggle && fullTimeCourse3List) {
    fullTimeCourse3Toggle.addEventListener("click", () => {
      const isExpanded = fullTimeCourse3Toggle.getAttribute("aria-expanded") === "true";
      fullTimeCourse3Toggle.setAttribute("aria-expanded", String(!isExpanded));
      fullTimeCourse3List.classList.toggle("open");
    });
  }

  // ── Part Time Course 1 Accordion Toggle ───────────────────────────
  if (partTimeCourse1Toggle && partTimeCourse1List) {
    partTimeCourse1Toggle.addEventListener("click", () => {
      const isExpanded = partTimeCourse1Toggle.getAttribute("aria-expanded") === "true";
      partTimeCourse1Toggle.setAttribute("aria-expanded", String(!isExpanded));
      partTimeCourse1List.classList.toggle("open");
    });
  }

  // ── Soft Skills Accordion Toggle ──────────────────────────────
  if (softSkillsToggle && softSkillsList) {
    softSkillsToggle.addEventListener("click", () => {
      const isExpanded = softSkillsToggle.getAttribute("aria-expanded") === "true";
      softSkillsToggle.setAttribute("aria-expanded", String(!isExpanded));
      softSkillsList.classList.toggle("open");
    });
  }

  // ── Presentation Skills Accordion Toggle ──────────────────────
  if (presentationSkillsToggle && presentationSkillsList) {
    presentationSkillsToggle.addEventListener("click", () => {
      const isExpanded = presentationSkillsToggle.getAttribute("aria-expanded") === "true";
      presentationSkillsToggle.setAttribute("aria-expanded", String(!isExpanded));
      presentationSkillsList.classList.toggle("open");
    });
  }

  // ── Management Skills Accordion Toggle ────────────────────────
  if (managementSkillsToggle && managementSkillsList) {
    managementSkillsToggle.addEventListener("click", () => {
      const isExpanded = managementSkillsToggle.getAttribute("aria-expanded") === "true";
      managementSkillsToggle.setAttribute("aria-expanded", String(!isExpanded));
      managementSkillsList.classList.toggle("open");
    });
  }

  // ── Student Cases Accordion Toggle ────────────────────────────
  if (studentCasesToggle && studentCasesList) {
    studentCasesToggle.addEventListener("click", () => {
      const isExpanded = studentCasesToggle.getAttribute("aria-expanded") === "true";
      studentCasesToggle.setAttribute("aria-expanded", String(!isExpanded));
      studentCasesList.classList.toggle("open");
    });
  }

  // ── State ───────────────────────────────────────────────────────
  let conversationHistory = [];
  let isStreaming = false;
  let currentAttachment = null;

  // ── Skill card prompt map ───────────────────────────────────────
  const skillPrompts = {
    "vision-structure":
      "Explain the iSchool Vision and the Education & Boarding Team Structure from Part Time course 1 (Education Head, Supervisors, Team Leaders, Mentors, Tutors, Boarding Specialists).",
    "working-hours":
      "What are the working days, shifts, operating hours, and time slots for tutors and mentors in Part Time course 1?",
    "required-assessments":
      "Explain the Required Assessments for Part Time course 1: what the assessment is, recording requirements (camera/mic on, screen sharing), submission rules, and module forms.",
    "k12-roadmap":
      "Explain the iSchool K12 Curriculum Roadmap across all grades (Grade 1 to 12) and levels (Level 1 to 6) from Part Time course 1.",
    "free-sessions":
      "Explain the purpose, structure, and details of iSchool Free Sessions (6 introductory sessions for non-subscribed students) from Part Time course 1.",
    "pt-dashboard-tabs":
      "Explain the iSchool Dashboard Tabs (Classes, Profile, Study, Requests, Policies, Help, Insights, community) and how to log in from Part Time course 1.",
    "session-setup":
      "Explain the Session Setup checklist (mic, camera, virtual background, internet) and Tone of Voice requirements from iSchool Onboarding Course 02.",
    icebreakers:
      "Explain the Icebreaking types (Question, Game, Creative, Funny, Digital, Reflection) and student engagement strategies from iSchool Onboarding Course 02.",
    "constructive-feedback":
      "Give concrete Constructive Feedback examples from iSchool Onboarding Course 02 for student coding and session work.",
    "c2-management":
      "Explain Time Management, Learn & Make execution, Planning, and Problem-Solving skills from iSchool Onboarding Course 02.",
    "zoom-tools":
      "Explain how to use Zoom tools in sessions, including Screen Sharing permissions, Whiteboard, Annotation, Reactions, Camera & Mic, and Virtual Background.",
    "struct-c3":
      "Explain the Session Structure in iSchool Teaching Course 03: 1-on-1 sessions last 1 hour, Group sessions last 1.5 hours (4-5 students). Both follow Learn (explain key concepts via slides), Make (student shares screen and builds the project), Share (student summarizes what they learned).",
    "before-session":
      "Explain everything a tutor must do BEFORE the session in iSchool Teaching Course 03: (1) Preparation: study slides, watch video, read Teacher's Guide, install software & practice the project. (2) Curriculum Prep: use Manual, Videos, Slides. (3) Lesson Planning: define lesson goals, plan pacing, anticipate challenges, brainstorm student questions. (4) Plan for scenarios: student already knows content (shorten Learn but keep engaging), student takes long to understand (use active engagement and simple questions). (5) Joining: review Dashboard schedule, join 10 minutes early, preload slides and files.",
    "during-session":
      "Explain everything that happens DURING the session in iSchool Teaching Course 03 — the 6-step Session Flow: (1) Welcome & Icebreaking: warmly welcome, brief icebreaker. (2) HW Review & Recap: student explains previous concepts, give hints, motivate with positive feedback, give clear definitions. (3) Explain New Concepts: start with Brainstorming (open-ended question, no right/wrong), use clarity & simplicity, right examples by age, adapt to student thinking, support with Annotation visuals, connect all concepts. Age delivery: Ages 6-10 use storytelling & short hands-on; Ages 11-14 use challenges & independent tasks; Ages 15-18 connect to professional careers. (4) Project & Make: show final result first, break into 2-3 step segments, demonstrate then guide student, connect to personal interests. (5) Q&A: every example answered by student, correct kindly. (6) Session Closure: student reflects 2-3 min (Presentation), explain homework, guide student to publish project on iSchool portfolio.",
    "post-feedback":
      "Explain everything a tutor must do AFTER the session in iSchool Teaching Course 03: (1) Feedback Submission: rate each criterion based on performance, write comment in English even for Arabic sessions, if 5 stars choose positive English comment, if not explain why. Mark absent students with the Absent toggle. Submit within 2 hours max. Use personalized comments — mention a specific moment from the session, avoid repeating generic templates. (2) Tutor Reflection: document any unexpected situations, challenges, disruptions, or important observations from the session in Arabic or English.",
    teaching:
      "Tell me about Teaching Skills and all its sub-skills in detail.",
    // ── Part Time course 1 sub-section prompts ───────────────────────
    "pt1-vision-structure":
      "Explain the iSchool Vision and the full Education & Boarding Team Structure from Part Time course 1 Training - Part 01. Include: the iSchool Vision statement, the hierarchy (Education Head → Supervisors → Team Leaders → Mentors → Tutors), the Boarding Team (Team Leader, Senior Boarding Specialists, Boarding Specialists), and all team member names listed in the slides.",
    "pt1-working-hours":
      "Explain all Working Hours, Working Days, and Time Slots for different roles from Part Time course 1 Training - Part 01. Include: Boarding Team & Team Leaders shifts (Sat-Wed 10AM-6PM, Fri-Tue 10AM-6PM), Mentors & Moderation shifts (2PM-10PM), Tutors time slots (Slot 1-5, 3PM-10PM Fri-Wed), and the Tier system (Tier 1: 6-10 slots / min 4 modules, Tier 2: 11-15 slots / min 5 modules, Tier 3: 16-25 slots / min 6 modules).",
    "pt1-assessments":
      "Explain the Required Assessments from Part Time course 1 Training - Part 01. Include: what the assessment is (video explaining the Make activity), recording rules (screen share on, camera on, mic on, good quality), submission rules (separate form per module, 4 forms total by end of training, submitted before deadline), and how to access the assessment form.",
    "pt1-k12-roadmap":
      "Explain the full iSchool K12 Curriculum Roadmap from Part Time course 1 Training - Part 01. Cover all 6 levels and grades: Level 1 (Age 6-7, G1-G2: Technology Around Us, Creative Computing, Coding with Minecraft, Space Exploration), Level 2 (Age 8-9, G3-G4: 2D Game Dev, Game Dev with AI, Chatbots L01/L02), Level 3 (Age 10-11, G5-G6: Chatbot Python L01/L02, UI/UX Design L01/L02), Level 4 (Age 12-13, G7-G8: Mobile App Dev L01/L02, Web Dev HTML/CSS L01/L02), Level 5 (Age 14-15, G9-G10: Game Dev Unity L1/L2, 2D Game Design L01/L02), Level 6 (Age 16-17, G11-G12: Advanced ML, Deep Learning, Data Science, Machine Learning).",
    "pt1-free-sessions":
      "Explain iSchool Free Sessions and Session Structure from Part Time course 1 Training - Part 01. Free Sessions: 6 introductory sessions for non-subscribed students, purpose (spark curiosity, sneak peek into content, introduce instructors, hands-on activities). Assigned by grade level (L1→Sessions 1-2, L2-L3→Sessions 3-4, L4-L5-L6→Sessions 5-6). Session Structure: 1-on-1 and group sessions are 1 hour each, divided into 3 parts — Learn (explain key concepts using slides + main project), Make (student shares screen and works on project), Share (student summarizes what they learned). How to study: study slides, try the project on software before the session, watch attached videos, use the Manual (Training Guide) for time management.",
    "pt1-dashboard":
      "Explain the full iSchool Dashboard from Part Time course 1 Training - Part 01. Cover: Login process, Main Screen (Navigation bar, Menu Tab, Notifications). Teaching Tab — Schedule (view today's sessions, Materials button, search by student name/ID, Join Now appears 10 min before, Ping Parent button), Projects (student projects reviewed within 24 working hours, marked late otherwise), Tasks (project reviews, session feedback, follow-up tasks). LMS Tab — completed modules, session materials, student resources, quiz at end of each module. Insights Tab — tutor performance overview. Requests Tab — all request types history, submit planned vacation/emergency/sick leave with date, reason and policy per type. Community Tab — main communication space between tutors and students, two channel types: Announcement channels (important updates, tutors reply only if mentioned directly) and Direct Channels (dedicated per student for Q&A and support). Profile Menu — personal details, team affiliations, payroll, Credentials section (all work accounts), Payroll tab (salary, payment history), Policies & Agreements tab (HR, meetings, communication, session protocols), Reports tab (monthly performance report: strengths, improvement areas, red flags), Quality Insights tab (session performance summary).",

    presentation:
      "Explain Presentation Skills and all its sub-categories and sub-skills.",
    communication:
      "What are the Communication Skills? Explain both Session-Based and General Communication frameworks.",
    management:
      "Describe Management Skills and all its categories and sub-skills in detail.",
    "time-priority":
      "Explain Time and Priority Control in Management Skills, including task prioritization, time allocation, and deadline adherence.",
    "session-flow":
      "Explain Session Flow Control in Management Skills, including session rhythm, transition timing, and distraction management.",
    "adaptability":
      "Explain Adaptability and Problem-Solving in Management Skills, including technical response, plan adjustment, decision control under pressure, and reset control.",
    "accountability":
      "Explain Accountability and Reliability in Management Skills, including commitment fulfillment, reporting accuracy, protocol adherence, and performance self-monitoring.",
    "structural-thinking":
      "Explain Structural Thinking in Presentation Skills and how to structure concept delivery using hooks and sequencing.",
    "nonverbal-presence":
      "Explain Visual and Nonverbal Presence in Presentation Skills, including eye contact, posture, and gestures.",
    "verbal-control":
      "Explain Verbal Control in Presentation Skills, including pacing, vocal modulation, clarity, and pause control.",
    "framing-positioning":
      "Explain Framing and Positioning in Presentation Skills and how to anchor value for audience understanding.",
    "attention-driven":
      "Explain the Attention-Driven Student Cases behavior model and how to handle disengagement or distraction in sessions.",
    "emotion-driven":
      "Explain the Emotion-Driven Student Cases behavior model, including handling anxiety, shyness, and emotional safety.",
    "motivation-driven":
      "Explain the Motivation-Driven Student Cases behavior model, including handling over-confident, validation-seeking, and goal-oriented students.",
    "cognitive-driven":
      "Explain the Cognitive-Driven Student Cases behavior model and how to adjust pacing for different processing speeds.",
  };

  // Arabic counterparts.
  const skillPromptsAr = {
    "vision-structure":
      "اشرحلي رؤية آي سكول وهيكل فريق التعليم وفريق البوردينج (رئيس قسم التعليم، المشرفين، قادة الفرق، الموجهين Mentors، المدربين Tutors، ومختصي البوردينج) من Part Time course 1.",
    "working-hours":
      "إيه هي أيام العمل الرسمية، الشفتات، ساعات التشغيل، ومواعيد الـ Time Slots للمدربين والـ Mentors في Part Time course 1؟",
    "required-assessments":
      "اشرحلي التقييمات المطلوبة Required Assessments في Part Time course 1: إيه هو التقييم، وشروط التسجيل (مشاركة الشاشة، تشغيل الكاميرا والمايك)، وقواعد التسليم لكل موديول.",
    "k12-roadmap":
      "اشرحلي خارطة منهج iSchool K12 Roadmap لكل الصفوف (من Grade 1 لحد Grade 12) والمستويات (Level 1 to 6) بالتفصيل من Part Time course 1.",
    "free-sessions":
      "اشرحلي الغرض من الجلسات المجانية Free Sessions وهيكلها المكون من 6 جلسات للفئات العمرية المختلفة من Part Time course 1.",
    "pt-dashboard-tabs":
      "اشرحلي أقسام لوحة التحكم iSchool Dashboard (الصفوف Classes، الملف الشخصي Profile، الدراسة Study، الطلبات Requests، السياسات Policies، المساعدة Help، والتقارير Insights والـ Community) وكيفية تسجيل الدخول من Part Time course 1.",
    "session-setup":
      "اشرحلي قائمة تجهيز الجلسة Session Setup (المايك، الكاميرا، الخلفية الافتراضية، الإنترنت) وقواعد نبرة الصوت Tone of Voice في iSchool Onboarding Course 02.",
    icebreakers:
      "اشرحلي أنواع أنشطة كسر الجليد Icebreakers واستراتيجيات تفاعل الطلاب Engagement من iSchool Onboarding Course 02.",
    "constructive-feedback":
      "اديني أمثلة رسمية على التغذية الراجعة البناءة Constructive Feedback من iSchool Onboarding Course 02.",
    "c2-management":
      "اشرحلي إدارة الوقت Time Management والتطبيق العملي Learn and Make والـ Planning وProblem-Solving من iSchool Onboarding Course 02.",
    "zoom-tools":
      "اشرحلي إزاي أستخدم أدوات زوم Zoom Tools في الحصة (مشاركة الشاشة Screen Sharing، السبورة Whiteboard، التوضيح Annotation، والتفاعلات Reactions، والكاميرا والمايك).",
    "struct-c3":
      "اشرحلي هيكل الحصة في iSchool Teaching Course 03: الحصص الفردية 1-on-1 مدتها ساعة، والحصص الجماعية مدتها ساعة ونصف (4-5 طلاب). كلاهم بيتبعوا نفس الهيكل: Learn (شرح المفاهيم من خلال السلايد)، Make (الطالب يشارك الشاشة ويطبق المشروع)، Share (الطالب يلخص اللي اتعلمه).",
    "before-session":
      "اشرحلي كل اللي المدرب لازم يعمله قبل الحصة في iSchool Teaching Course 03: (1) التجهيز: ادرس السلايد، شوف الفيديو، اقرأ دليل المعلم، حمل البرامج وجرب المشروع. (2) تحضير المنهج: باستخدام Manual وVideos وSlides. (3) تخطيط الدرس: حدد أهداف الدرس، خطط الوقت، توقع التحديات، وتخيل أسئلة الطلاب. (4) تجهيز للسيناريوهات: الطالب يعرف المحتوى (اختصر Learn بس افضل تجاوب)، الطالب بيأخد وقت (استخدم التفاعل والأسئلة البسيطة). (5) الانضمام: راجع الـ Dashboard، انضم 10 دقائق قبل الحصة، افتح السلايد والملفات قبل البدء.",
    "during-session":
      "اشرحلي كل اللي بيحصل خلال الحصة في iSchool Teaching Course 03 الـ 6 خطوات: (1) الترحيب وكسر الجليد: ترحيب حار ونشاط كسر جليد سريع. (2) مراجعة الواجب: الطالب يشرح المفاهيم، ادي له تلميحات لو وقف، حفزه بتفاعل ايجابي، واشرح تعريف واضح. (3) شرح مفاهيم جديدة: ابدأ بالعصف الذهني (Brainstorming) بسؤال مفتوح، بساطة ووضوح في الشرح، استخدم Annotation بالشاشة، أمثلة مناسبة للعمر: 6-10 سنة (قصص وأنشطة سريعة)، 11-14 (تحديات ومهام مستقلة)، 15-18 (ربط بالمجال المهني). (4) المشروع وMake: اعرض النتيجة النهائية أولاً، قسم لخطوات 2-3، اعمل ديمو ثم وجه الطالب، اربط باهتماماته. (5) الأسئلة والأجوبة: كل سلايد أسئلة يجاوب عليها الطالب، صحح بلطف. (6) ختام الحصة: الطالب يلخص لمدة 2-3 دقائق (Presentation)، شرح الواجب، وجه الطالب ينشر المشروع في النظام.",
    "post-feedback":
      "اشرحلي كل اللي لازم يتعمله المدرب بعد الحصة في iSchool Teaching Course 03: (1) تسليم التقييم Feedback: قيّم كل معيار حسب أداء الطالب، اكتب التعليق بالإنجليزي حتى لو الحصة بالعربي، لو 5 نجوم اختار تعليق إيجابي، لو متش فل اشرح ليه. حدد الغياب بال Absent toggle. سلم خلال ساعتين. اكتب تعليق مخصص من لحظة حقيقية في الحصة، متش تكرر نفس التعليق. (2) Tutor Reflection: وثّق أي موقف غير متوقع، تحديات، أو ملاحظات مهمة حصلت خلال الحصة بالعربي أو الإنجليزي.",
    teaching: "احكيلي عن Teaching Skills وكل المهارات الفرعية بتاعتها بالتفصيل.",
    // ── Part Time course 1 Arabic prompts ────────────────────────────
    "pt1-vision-structure":
      "اشرحلي رؤية iSchool وهيكل فريق التعليم والبوردينج الكامل من Part Time course 1 Training - Part 01. ابعت: رسالة رؤية iSchool، التسلسل الهرمي (Education Head → Supervisors → Team Leaders → Mentors → Tutors)، فريق البوردينج (Team Leader، Senior Boarding Specialists، Boarding Specialists)، وأسماء أعضاء الفريق المذكورين في السلايدات.",
    "pt1-working-hours":
      "اشرحلي كل أيام العمل وساعات العمل والـ Time Slots للأدوار المختلفة في Part Time course 1 Training - Part 01. ابعت: شفتات فريق البوردينج والـ Team Leaders (السبت-الأربعاء 10ص-6م، الجمعة-الثلاثاء 10ص-6م)، شفتات الـ Mentors والـ Moderation (2م-10م)، والـ Slots للـ Tutors (Slot 1-5، 3م-10م جمعة-أربعاء)، ونظام الـ Tiers (Tier 1: 6-10 slots / دقيقة 4 موديولز، Tier 2: 11-15 slots / دقيقة 5 موديولز، Tier 3: 16-25 slots / دقيقة 6 موديولز).",
    "pt1-assessments":
      "اشرحلي التقييمات المطلوبة Required Assessments من Part Time course 1 Training - Part 01. ابعت: إيه هو التقييم (فيديو بيشرح نشاط الـ Make)، قواعد التسجيل (مشاركة الشاشة، الكاميرا مشغلة، المايك مشغل، جودة عالية)، قواعد التسليم (نموذج منفصل لكل موديول، 4 نماذج إجمالاً بنهاية التدريب، قبل الـ deadline)، وإزاي توصل لنموذج التقييم.",
    "pt1-k12-roadmap":
      "اشرحلي خارطة طريق منهج iSchool K12 الكامل من Part Time course 1 Training - Part 01. غطي كل المستويات الـ 6 والصفوف: Level 1 (6-7 سنة، G1-G2: Technology Around Us، Creative Computing، Coding with Minecraft، Space Exploration)، Level 2 (8-9 سنة، G3-G4: 2D Game Dev، Game Dev with AI، Chatbots L01/L02)، Level 3 (10-11 سنة، G5-G6: Chatbot Python L01/L02، UI/UX Design L01/L02)، Level 4 (12-13 سنة، G7-G8: Mobile App Dev L01/L02، Web Dev HTML/CSS L01/L02)، Level 5 (14-15 سنة، G9-G10: Game Dev Unity L1/L2، 2D Game Design L01/L02)، Level 6 (16-17 سنة، G11-G12: Advanced ML، Deep Learning، Data Science، Machine Learning).",
    "pt1-free-sessions":
      "اشرحلي الجلسات المجانية iSchool Free Sessions وهيكل الجلسة Session Structure من Part Time course 1 Training - Part 01. الجلسات المجانية: 6 جلسات تعريفية للطلاب اللي لسه مشتركوش، الهدف (إثارة الفضول، لمحة عن المحتوى، تعريف بالمدربين، أنشطة تطبيقية). توزيع حسب المستوى (L1→جلسات 1-2، L2-L3→جلسات 3-4، L4-L5-L6→جلسات 5-6). هيكل الجلسة: الجلسات الفردية والجماعية مدتها ساعة، مقسمة لـ 3 أجزاء - Learn (شرح المفاهيم الأساسية بالسلايدات + المشروع الرئيسي)، Make (الطالب يشارك شاشته ويشتغل على المشروع)، Share (الطالب يلخص اللي اتعلمه). كيفية الدراسة: ادرس السلايدات، جرب المشروع على البرنامج قبل الجلسة، شوف الفيديوهات المرفقة، استخدم الـ Manual (Training Guide) لإدارة وقت الجلسة.",
    "pt1-dashboard":
      "اشرحلي لوحة التحكم الكاملة iSchool Dashboard من Part Time course 1 Training - Part 01. غطي: تسجيل الدخول، الشاشة الرئيسية (Navigation Bar، Menu Tab، Notifications). تبويب Teaching - الجدول Schedule (شوف جلساتك اليوم، زر المواد Materials، ابحث باسم الطالب أو ID، زر Join Now يظهر 10 دقائق قبل، زر Ping Parent)، المشاريع Projects (مراجعة مشاريع الطلاب خلال 24 ساعة عمل، أي مشروع بعد كده يتعتبر متأخر)، المهام Tasks (مراجعات المشاريع، تغذية راجعة للجلسة، مهام متابعة). تبويب LMS - الموديولز المكتملة، مواد الجلسة وموارد الطلاب، اختبار في نهاية كل موديول للتقدم. تبويب Insights - نظرة عامة على أداء المدرب. تبويب Requests - كل أنواع الطلبات وتاريخها، تقدر تطلب إجازة مخططة أو طارئة أو مرضية مع تاريخ وسبب وكل طلب ليه سياسته. تبويب Community - مساحة التواصل الرئيسية بين المدربين والطلاب، نوعان من القنوات: قنوات الإعلانات Announcement (تحديثات مهمة، المدرب يرد بس لو اتذكر مباشرة) وقنوات Direct (قناة مخصصة لكل طالب للأسئلة والدعم). قائمة Profile - البيانات الشخصية، الارتباطات الفريق، Credentials (كل الأكونتات المطلوبة)، Payroll (تفاصيل الراتب والمدفوعات)، Policies & Agreements (قواعد HR والاجتماعات والتواصل وبروتوكولات الجلسة)، Reports (تقرير شهري للأداء: نقاط قوة، مجالات تحسين، علامات تحذير)، Quality Insights (ملخص أداء الجلسة).",

    presentation: "اشرحلي Presentation Skills وكل التصنيفات والمهارات الفرعية بتاعتها.",
    communication:
      "إيه هي Communication Skills؟ اشرحلي إطار Session-Based وإطار General Communication.",
    management: "اشرحلي Management Skills وكل تصنيفاتها ومهاراتها الفرعية بالتفصيل.",
    "time-priority":
      "اشرحلي Time and Priority Control في Management Skills، وده يشمل Task Prioritization وTime Allocation وDeadline Adherence.",
    "session-flow":
      "اشرحلي Session Flow Control في Management Skills، وده يشمل Session Rhythm وTransition Timing وDistraction Management.",
    "adaptability":
      "اشرحلي Adaptability and Problem-Solving في Management Skills، وده يشمل Technical Response وPlan Adjustment وDecision Control Under Pressure وReset Control.",
    "accountability":
      "اشرحلي Accountability and Reliability في Management Skills، وده يشمل Commitment Fulfillment وReporting Accuracy وProtocol Adherence وPerformance Self-Monitoring.",
    "structural-thinking":
      "اشرحلي Structural Thinking في Presentation Skills وإزاي أرتب توصيل المفهوم باستخدام الـ hooks والتسلسل.",
    "nonverbal-presence":
      "اشرحلي Visual and Nonverbal Presence في Presentation Skills، وده يشمل التواصل البصري ووضعية الجسد والإيماءات.",
    "verbal-control":
      "اشرحلي Verbal Control في Presentation Skills، وده يشمل الإيقاع والتنوع الصوتي والوضوح والتحكم في الوقفات.",
    "framing-positioning":
      "اشرحلي Framing and Positioning في Presentation Skills وإزاي أرسّخ القيمة عشان الجمهور يفهم.",
    "attention-driven":
      "اشرحلي نموذج سلوك Attention-Driven في Student Cases وإزاي أتعامل مع عدم التفاعل أو التشتت في الحصة.",
    "emotion-driven":
      "اشرحلي نموذج سلوك Emotion-Driven في Student Cases، وده يشمل التعامل مع القلق والخجل والأمان النفسي.",
    "motivation-driven":
      "اشرحلي نموذج سلوك Motivation-Driven في Student Cases، وده يشمل التعامل مع الطالب الواثق أكتر من اللازم واللي بيدور على التقدير واللي موجّه للهدف.",
    "cognitive-driven":
      "اشرحلي نموذج سلوك Cognitive-Driven في Student Cases وإزاي أظبط الإيقاع حسب سرعة المعالجة المختلفة.",
  };

  // Falls back to English if the switcher hasn't loaded or a key is missing.
  function promptFor(skill) {
    const lang = window.iSchoolUILang ? window.iSchoolUILang.get() : "en";
    if (lang === "ar" && skillPromptsAr[skill]) return skillPromptsAr[skill];
    return skillPrompts[skill];
  }

  // ── Arabic detection ────────────────────────────────────────────
  function isArabic(text) {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
    return arabicRegex.test(text) && arabicChars > latinChars;
  }

  // Initialize Mermaid if available
  if (window.mermaid) {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        securityLevel: "loose",
        fontFamily: "'Somar Rounded', 'Alexandria', sans-serif",
        themeVariables: {
          fontFamily: "'Somar Rounded', 'Alexandria', sans-serif",
          fontSize: "13px",
        },
      });
    } catch (e) {
      console.warn("Mermaid init warning:", e);
    }
  }

  function formatMindmapBrackets(text) {
    if (!text || !text.trim().startsWith('mindmap')) return text;
    const lines = text.split('\n');
    const formattedLines = lines.map(line => {
      if (!line.trim() || line.trim().startsWith('mindmap')) return line;
      const leadingSpaces = line.search(/\S/);
      if (leadingSpaces === -1) return line;

      // Parse indentation, optional node ID (using lookahead to check for bracket), and text contents
      const match = line.match(/^(\s*)(?:([a-zA-Z0-9_-]+)(?=\(\(|\(|\[))?(?:\(\((.*)\)\)|\((.*)\)|\[(.*)\]|(.*))$/);
      if (!match) return line;

      const labelText = (match[3] || match[4] || match[5] || match[6] || "").trim();
      if (!labelText) return line;

      // Assign brackets by indentation level
      if (leadingSpaces <= 2) {
        return ' '.repeat(leadingSpaces) + `((${labelText}))`;
      } else if (leadingSpaces <= 4) {
        return ' '.repeat(leadingSpaces) + `(${labelText})`;
      } else {
        return ' '.repeat(leadingSpaces) + `[${labelText}]`;
      }
    });
    return formattedLines.join('\n');
  }

  // ── Render Mermaid diagrams ──────────────────────────────────────
  async function renderMermaid(container) {
    if (!window.mermaid || !container) return;
    const unrendered = container.querySelectorAll(".mermaid:not([data-processed='true'])");
    if (unrendered.length === 0) return;
    try {
      unrendered.forEach(node => {
        node.textContent = formatMindmapBrackets(node.textContent);
      });
      await mermaid.run({ nodes: Array.from(unrendered) });
    } catch (e) {
      console.warn("Mermaid rendering warning:", e);
    }
  }

  // ── Markdown-to-HTML converter ──────────────────────────
  function renderMarkdown(text) {
    let html = text;

    // 1. Preserve mermaid code blocks before HTML escaping
    const mermaidBlocks = [];
    html = html.replace(/```mermaid\s*\n([\s\S]*?)\n```/gi, (match, code) => {
      mermaidBlocks.push(code.trim());
      return `__MERMAID_BLOCK_${mermaidBlocks.length - 1}__`;
    });

    // 2. Escape HTML
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 3. Re-insert mermaid blocks as visual container divs
    mermaidBlocks.forEach((code, idx) => {
      html = html.replace(
        `__MERMAID_BLOCK_${idx}__`,
        `<div class="mermaid-container"><div class="mermaid">${code}</div></div>`
      );
    });

    // 4. Other code blocks ```...```
    html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, "<pre><code>$2</code></pre>");

    // 5. Headers (### h3, ## h2)
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h3>$1</h3>");

    // 6. Bold **text**
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // 7. Italic *text*
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");

    // Images: ![alt](url)
    html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px; margin: 10px 0;">');

    // 8. Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // 9. Unordered lists (- item or * item)
    html = html.replace(/^[\s]*[-*]\s+(.+)$/gm, "<li>$1</li>");

    // 10. Numbered lists
    html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, "<li>$1</li>");

    // 11. Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

    // 12. Paragraphs – split by double newlines
    html = html
      .split(/\n{2,}/)
      .map((block) => {
        block = block.trim();
        if (!block) return "";
        if (
          block.startsWith("<h") ||
          block.startsWith("<ul") ||
          block.startsWith("<ol") ||
          block.startsWith("<li") ||
          block.startsWith("<pre") ||
          block.startsWith("<div class=\"mermaid")
        ) {
          return block;
        }
        return `<p>${block.replace(/\n/g, "<br>")}</p>`;
      })
      .join("");

    return html;
  }

  // ── Launch feedback ─────────────────────────────────────────────
  // Retriggers cleanly on rapid sends by clearing the class first.
  function playLaunch() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    sendBtn.classList.remove("launching");
    void sendBtn.offsetWidth; // force reflow so the animation restarts
    sendBtn.classList.add("launching");
  }

  sendBtn.addEventListener("animationend", () => {
    sendBtn.classList.remove("launching");
  });

  // ── Busy state ──────────────────────────────────────────────────
  // Every interactive control reflects the streaming state, so nothing
  // looks clickable while a response is in flight.
  function setBusy(busy) {
    sendBtn.disabled = busy;
    chatInput.setAttribute("aria-busy", String(busy));
    skillCards.forEach((card) => {
      card.disabled = busy;
    });
  }

  // ── Avatars ─────────────────────────────────────────────────────
  const USER_AVATAR_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>`;
  const BOT_AVATAR_SVG = `<svg width="16" height="18" viewBox="0 0 192 229" fill="none" aria-hidden="true"><mask id="bot-mask-0" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="192" height="229"><path d="M191.753 0H0V229H191.753V0Z" fill="white"/></mask><g mask="url(#bot-mask-0)"><mask id="bot-mask-1" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="191" height="229"><path d="M190.134 0H0V229H190.134V0Z" fill="white"/></mask><g mask="url(#bot-mask-1)"><path d="M104.813 96.2036C72.4837 109.692 47.6786 128.836 35.5521 158.034C23.1265 188.307 48.9902 204.452 76.7407 196.918C96.0003 192.039 114.616 178.231 130.102 162.384C161.027 132.5 169.955 80.9522 139.076 48.2968C106.424 12.985 53.7303 26.0151 19.698 54.2737C13.163 59.3346 5.31648 49.8769 11.4833 44.4267C39.1878 19.7176 80.4913 1.67237 118.62 13.9926C158.404 25.7403 184.015 67.5328 181.07 108.043C178.907 149.125 152.859 183.018 120.944 206.513C90.3628 230.65 37.1628 240.863 10.2867 204.634C-11.0209 175.208 4.05091 135.408 24.6222 110.699C41.6038 89.6542 60.9325 72.2273 82.9765 59.014C105.112 46.7396 125.108 80.082 103.226 92.8602L104.813 96.2036Z" fill="#FFD700"/><path d="M115.857 126.133L117.951 181.848C118.365 192.382 112.451 199.138 102.419 199.527C92.4094 199.917 85.9895 193.642 85.5753 183.085L83.4813 127.37C83.0672 116.836 88.9808 110.08 99.0133 109.691C109.023 109.302 115.443 115.599 115.857 126.133Z" fill="#056FEC"/><path d="M95.5397 98.2869C107.549 98.2869 117.285 88.5981 117.285 76.6464C117.285 64.6946 107.549 55.0059 95.5397 55.0059C83.5304 55.0059 73.7949 64.6946 73.7949 76.6464C73.7949 88.5981 83.5304 98.2869 95.5397 98.2869Z" fill="#FF7F1C"/></g></g></svg>`;

  // ── Create message element ──────────────────────────────────────
  function createMessageElement(role, content, isRtl = false, attachment = null) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message animate-in ${role === "user" ? "user-message" : "bot-message"}`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    if (role === "user") {
      avatar.innerHTML = USER_AVATAR_SVG;
    } else {
      avatar.innerHTML = BOT_AVATAR_SVG;
    }

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    // lang, not just direction: without it a screen reader narrates Arabic
    // with an English voice, which is unintelligible (WCAG 3.1.2).
    if (isRtl) {
      bubble.classList.add("rtl");
      bubble.lang = "ar";
    }

    if (role === "user") {
      if (attachment && attachment.data && attachment.mimeType) {
        const img = document.createElement("img");
        img.className = "message-image";
        img.src = `data:${attachment.mimeType};base64,${attachment.data}`;
        img.alt = "User attached image";
        bubble.appendChild(img);
      }
      if (content) {
        const textNode = document.createTextNode(content);
        bubble.appendChild(textNode);
      }
    } else {
      bubble.innerHTML = renderMarkdown(content);
    }

    contentDiv.appendChild(bubble);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    return { messageDiv, bubble };
  }

  // ── Scroll to bottom ───────────────────────────────────────────
  function scrollToBottom() {
    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: "smooth",
    });
  }

  // ── Show/hide typing indicator ─────────────────────────────────
  function showTyping() {
    typingIndicator.classList.add("active");
    scrollToBottom();
  }

  function hideTyping() {
    typingIndicator.classList.remove("active");
  }

  // ── Send message ───────────────────────────────────────────────
  async function sendMessage(text) {
    if (isStreaming) return;
    const userText = (text || chatInput.value).trim();
    if (!userText && !currentAttachment) return;

    // Clear input
    chatInput.value = "";
    chatInput.style.height = "auto";
    playLaunch();

    // Detect language
    const userIsArabic = isArabic(userText);

    // Save attachment for this turn and reset global state
    const turnAttachment = currentAttachment;
    currentAttachment = null;
    if (attachmentPreview) {
      attachmentPreview.style.display = "none";
    }
    if (previewImg) {
      previewImg.src = "";
    }
    if (fileInput) {
      fileInput.value = "";
    }

    // Add user message to UI
    const { messageDiv: userMsgEl } = createMessageElement(
      "user",
      userText,
      userIsArabic,
      turnAttachment
    );
    chatMessages.appendChild(userMsgEl);
    scrollToBottom();

    // Add to history
    const userMsg = { role: "user", content: userText };
    if (turnAttachment) {
      userMsg.attachment = turnAttachment;
    }
    conversationHistory.push(userMsg);

    // Keep only last 6 messages to reduce payload size
    if (conversationHistory.length > 6) {
      conversationHistory = conversationHistory.slice(-6);
    }

    // Disable input while streaming
    isStreaming = true;
    setBusy(true);
    showTyping();

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      hideTyping();

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server error (${response.status})`
        );
      }

      // Create bot message element for streaming
      const { messageDiv: botMsgEl, bubble: botBubble } =
        createMessageElement("assistant", "", false);
      chatMessages.appendChild(botMsgEl);

      // Read the SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullResponse += parsed.content;

                // Check if response is Arabic for RTL
                if (isArabic(fullResponse) && !botBubble.classList.contains("rtl")) {
                  botBubble.classList.add("rtl");
                  botBubble.lang = "ar";
                }

                // Render progressively
                botBubble.innerHTML = renderMarkdown(fullResponse);
                scrollToBottom();
              }
            } catch {
              // Skip unparseable
            }
          }
        }
      }

      // Render any Mermaid diagrams in the completed message
      renderMermaid(botBubble);

      // Add to history
      conversationHistory.push({
        role: "assistant",
        content: fullResponse,
      });
    } catch (error) {
      hideTyping();
      console.error("Chat error:", error);

      let errorMsg = "Something went wrong. Please try again.";
      if (error.name === "AbortError") {
        errorMsg = "Request timed out. Please try again.";
      } else if (error.message === "Failed to fetch") {
        errorMsg = "Cannot connect to server. Make sure the server is running.";
      } else if (error.message) {
        errorMsg = error.message;
      }

      // Show error message
      const errorDiv = document.createElement("div");
      errorDiv.className = "message bot-message";
      errorDiv.className = "message bot-message animate-in";
      const errAvatar = document.createElement("div");
      errAvatar.className = "message-avatar";
      errAvatar.innerHTML = BOT_AVATAR_SVG;
      const errContent = document.createElement("div");
      errContent.className = "message-content";
      const errBubble = document.createElement("div");
      errBubble.className = "message-bubble error-bubble";
      errBubble.setAttribute("role", "alert");
      const errText = document.createElement("p");
      errText.textContent = errorMsg;
      errBubble.appendChild(errText);
      errContent.appendChild(errBubble);
      errorDiv.append(errAvatar, errContent);
      chatMessages.appendChild(errorDiv);
      scrollToBottom();
    } finally {
      isStreaming = false;
      setBusy(false);
      chatInput.focus();
    }
  }

  // ── Event Listeners ─────────────────────────────────────────────

  // Send button click
  sendBtn.addEventListener("click", () => sendMessage());

  // Enter to send, Shift+Enter for newline
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
  });

  // Attachment click triggers file upload
  if (attachBtn && fileInput) {
    attachBtn.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Restrict file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert(isArabic(chatInput.placeholder) 
          ? "حجم الصورة كبير جداً. يجب أن يكون أقل من 5 ميجابايت."
          : "Image size is too large. Please select an image under 5MB."
        );
        fileInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target.result;
        // Base64 data is formatted as "data:image/jpeg;base64,...."
        const base64Parts = result.split(",");
        const base64Data = base64Parts[1];
        
        currentAttachment = {
          mimeType: file.type,
          data: base64Data
        };

        // Update preview UI
        if (previewImg && attachmentPreview) {
          previewImg.src = result;
          attachmentPreview.style.display = "block";
        }
      };
      reader.readAsDataURL(file);
    });
  }

  if (removeAttachBtn) {
    removeAttachBtn.addEventListener("click", () => {
      currentAttachment = null;
      if (fileInput) fileInput.value = "";
      if (attachmentPreview) attachmentPreview.style.display = "none";
      if (previewImg) previewImg.src = "";
    });
  }

  // Skill card clicks
  skillCards.forEach((card) => {
    card.addEventListener("click", () => {
      const skill = card.dataset.skill;
      const prompt = promptFor(skill);
      if (prompt && !isStreaming) {
        skillCards.forEach((c) => c.removeAttribute("aria-current"));
        card.setAttribute("aria-current", "true");
        // Propagate the discipline to the chat surface so the header rule,
        // reply borders and headings all resolve to that hue.
        chatMain.dataset.skill = skill;
        sendMessage(prompt);

        // Close sidebar on mobile
        if (window.matchMedia("(max-width: 860px)").matches) {
          closeSidebar();
        }
      }
    });
  });

  // Sidebar toggle (mobile)
  function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.style.display = "block";
    // Next frame so the opacity transition has a starting value to animate from.
    requestAnimationFrame(() => sidebarOverlay.classList.add("active"));
    sidebarToggle.setAttribute("aria-expanded", "true");
    sidebarToggle.setAttribute("aria-label", "Close skills menu");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");
    sidebarToggle.setAttribute("aria-expanded", "false");
    sidebarToggle.setAttribute("aria-label", "Open skills menu");
    setTimeout(() => {
      sidebarOverlay.style.display = "none";
    }, 220);
  }

  sidebarToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  sidebarOverlay.addEventListener("click", closeSidebar);

  // Escape closes the mobile sidebar and returns focus to its trigger.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      closeSidebar();
      sidebarToggle.focus();
    }
  });

  // Focus input on load
  chatInput.focus();
})();
