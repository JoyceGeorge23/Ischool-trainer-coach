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
  };

  // ── Arabic detection ────────────────────────────────────────────
  function isArabic(text) {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
    return arabicRegex.test(text) && arabicChars > latinChars;
  }

  // ── Markdown-to-HTML converter (basic) ──────────────────────────
  function renderMarkdown(text) {
    let html = text;

    // Escape HTML first
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headers (### h3, ## h2)
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h3>$1</h3>");

    // Bold **text**
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Italic *text*
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Unordered lists (- item or * item)
    html = html.replace(/^[\s]*[-*]\s+(.+)$/gm, "<li>$1</li>");

    // Numbered lists
    html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, "<li>$1</li>");

    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

    // Paragraphs – split by double newlines
    html = html
      .split(/\n{2,}/)
      .map((block) => {
        block = block.trim();
        if (!block) return "";
        if (
          block.startsWith("<h") ||
          block.startsWith("<ul") ||
          block.startsWith("<ol") ||
          block.startsWith("<li")
        ) {
          return block;
        }
        return `<p>${block.replace(/\n/g, "<br>")}</p>`;
      })
      .join("");

    return html;
  }

  // ── Create message element ──────────────────────────────────────
  function createMessageElement(role, content, isRtl = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${role === "user" ? "user-message" : "bot-message"}`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = role === "user" ? "👤" : "🤖";

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    if (isRtl) bubble.classList.add("rtl");

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
    sendBtn.disabled = true;
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
      errorDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <div class="message-bubble error-bubble">
            <p>⚠️ ${errorMsg}</p>
          </div>
        </div>
      `;
      chatMessages.appendChild(errorDiv);
      scrollToBottom();
    } finally {
      isStreaming = false;
      sendBtn.disabled = false;
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
      const prompt = skillPrompts[skill];
      if (prompt && !isStreaming) {
        chatInput.value = prompt;
        sendMessage(prompt);

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
          closeSidebar();
        }
      }
    });
  });

  // Sidebar toggle (mobile)
  function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("active");
    sidebarOverlay.style.display = "block";
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");
    setTimeout(() => {
      sidebarOverlay.style.display = "none";
    }, 350);
  }

  sidebarToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  sidebarOverlay.addEventListener("click", closeSidebar);

  // Focus input on load
  chatInput.focus();
})();
