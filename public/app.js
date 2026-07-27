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
  const skillCards = document.querySelectorAll(".skill-card");
  const chatMain = document.querySelector(".chat-main");
  const softSkillsToggle = document.getElementById("softSkillsToggle");
  const softSkillsList = document.getElementById("softSkillsList");
  const managementSkillsToggle = document.getElementById("managementSkillsToggle");
  const managementSkillsList = document.getElementById("managementSkillsList");
  const studentCasesToggle = document.getElementById("studentCasesToggle");
  const studentCasesList = document.getElementById("studentCasesList");

  const presentationSkillsToggle = document.getElementById("presentationSkillsToggle");
  const presentationSkillsList = document.getElementById("presentationSkillsList");

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

  // ── Skill card prompt map ───────────────────────────────────────
  const skillPrompts = {
    teaching:
      "Tell me about Teaching Skills and all its sub-skills in detail.",
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

  // Arabic counterparts. The server picks the reply language from the text of
  // the question itself, so sending the Arabic prompt is what makes the answer
  // come back in Arabic — framework names stay in English on purpose, matching
  // the rule the system prompt already follows.
  const skillPromptsAr = {
    teaching: "احكيلي عن Teaching Skills وكل المهارات الفرعية بتاعتها بالتفصيل.",
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
  function createMessageElement(role, content, isRtl = false) {
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
      bubble.textContent = content;
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
    if (!userText) return;

    // Clear input
    chatInput.value = "";
    chatInput.style.height = "auto";
    playLaunch();

    // Detect language
    const userIsArabic = isArabic(userText);

    // Add user message to UI
    const { messageDiv: userMsgEl } = createMessageElement(
      "user",
      userText,
      userIsArabic
    );
    chatMessages.appendChild(userMsgEl);
    scrollToBottom();

    // Add to history
    conversationHistory.push({ role: "user", content: userText });

    // Keep only last 10 messages
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    // Disable input while streaming
    isStreaming = true;
    setBusy(true);
    showTyping();

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

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
