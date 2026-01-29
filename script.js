// ================= RTL / LTR Auto Direction =================
const isHebrew = (text) => /[\u0590-\u05FF]/.test(text);

document.querySelectorAll("input, textarea").forEach((el) => {
    el.addEventListener("input", () => {
        const val = el.value.trim();
        if (!val) return;
        el.dir = isHebrew(val) ? "rtl" : "ltr";
    });
});

// ================= Phone Normalize =================
const normalizePhone = (phone) => phone.replace(/[^\d]/g, "");

// ================= Toast =================
const toast = document.querySelector("#toast");
const showToast = (msg, type = "success") => {
    if (!toast) return;

    toast.style.display = "block";
    toast.textContent = msg;

    if (type === "error") {
        toast.style.borderColor = "rgba(239,68,68,.22)";
        toast.style.background = "rgba(239,68,68,.08)";
        toast.style.color = "#7F1D1D";
    } else {
        toast.style.borderColor = "rgba(22,163,74,.18)";
        toast.style.background = "rgba(22,163,74,.08)";
        toast.style.color = "#14532D";
    }

    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
        toast.style.display = "none";
    }, 4200);
};

// ================= Form Submit -> WhatsApp =================
const form = document.querySelector("#leadForm");

form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);

    const name = String(fd.get("name") || "").trim();
    const phone = normalizePhone(String(fd.get("phone") || ""));
    const service = String(fd.get("service") || "").trim();
    const message = String(fd.get("message") || "").trim();

    if (!name || !phone || !service) {
        showToast("חסר שם, טלפון או שירות — בדוק שוב", "error");
        return;
    }

    const waMessage =
        `היי SHABAT, אני רוצה לקבוע תור 💈\n\n` +
        `שם: ${name}\n` +
        `טלפון: ${phone}\n` +
        `שירות: ${service}\n` +
        (message ? `הודעה: ${message}\n` : "");

    const waUrl = `https://wa.me/972500000000?text=${encodeURIComponent(waMessage)}`;

    window.open(waUrl, "_blank", "noopener,noreferrer");

    showToast("נשלח! אם וואטסאפ לא נפתח — נסה שוב");
    form.reset();
});

// ================= Reveal On Scroll =================
const revealEls = document.querySelectorAll("[data-reveal]");

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const delay = Number(entry.target.getAttribute("data-delay") || 0);
            entry.target.style.transitionDelay = `${delay}ms`;
            entry.target.classList.add("revealed");

            revealObserver.unobserve(entry.target);
        });
    },
    {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px",
    }
);

revealEls.forEach((el) => revealObserver.observe(el));

// ================= Count Up Numbers (supports decimals + suffix) =================
const counters = document.querySelectorAll("[data-count]");

const formatNumber = (num, decimals) => {
    if (decimals > 0) return num.toFixed(decimals);
    return Math.round(num).toLocaleString();
};

const countObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            const target = Number(el.dataset.count || 0);
            const decimals = Number(el.dataset.decimals || 0);
            const suffix = String(el.dataset.suffix || "");

            const duration = 1100;
            const start = performance.now();

            const animate = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const value = target * progress;

                el.textContent = `${formatNumber(value, decimals)}${suffix}`;

                if (progress < 1) requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
            countObserver.unobserve(el);
        });
    },
    { threshold: 0.5 }
);

counters.forEach((el) => countObserver.observe(el));

// ================= Subtle Button Hover Lift =================
document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
        btn.style.transform = `translate(${x}px, ${y}px)`;
    });

    btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0, 0)";
    });
});

// ================= Team Carousel (3s) =================
const team = [
    { name: "לידור שבת", role: "בעלים • Barber" },
    { name: "שאול עסיס", role: "Barber" },
    { name: "נהוראי", role: "Barber" },
    { name: "רולן", role: "Barber" },
];

const teamCard = document.getElementById("teamCard");
const teamName = document.getElementById("teamName");
const teamRole = document.getElementById("teamRole");
const teamInitials = document.getElementById("teamInitials");
const teamDots = document.getElementById("teamDots");

const getInitials = (fullName) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2);
    return (parts[0].slice(0, 1) + parts[1].slice(0, 1));
};

let teamIndex = 0;
let teamTimer = null;

const renderDots = () => {
    if (!teamDots) return;
    teamDots.innerHTML = team
        .map((_, i) => `<button class="teamDot ${i === teamIndex ? "is-active" : ""}" type="button" aria-label="Team ${i + 1}" data-i="${i}"></button>`)
        .join("");

    teamDots.querySelectorAll(".teamDot").forEach((btn) => {
        btn.addEventListener("click", () => {
            const i = Number(btn.getAttribute("data-i"));
            goToMember(i);
            restartTeamTimer();
        });
    });
};

const setMember = (i) => {
    const m = team[i];
    if (!m || !teamCard || !teamName || !teamRole || !teamInitials) return;

    teamCard.classList.remove("is-showing");
    teamCard.classList.add("is-fading");

    setTimeout(() => {
        teamName.textContent = m.name;
        teamRole.textContent = m.role;
        teamInitials.textContent = getInitials(m.name);

        teamCard.classList.remove("is-fading");
        teamCard.classList.add("is-showing");

        teamIndex = i;
        renderDots();
    }, 220);
};

const goToMember = (i) => setMember(i);

const nextMember = () => {
    const i = (teamIndex + 1) % team.length;
    goToMember(i);
};

const restartTeamTimer = () => {
    if (teamTimer) clearInterval(teamTimer);
    teamTimer = setInterval(nextMember, 3000);
};

if (teamCard) {
    teamCard.classList.add("is-showing");
    renderDots();
    restartTeamTimer();
}

// ================= "Book in App" button (fallback to store) =================
document.getElementById("teamOpenAppBtn")?.addEventListener("click", () => {
    // אם אין deep link עדיין, שים את החנות
    const iosStore = "PASTE_APP_STORE_LINK_HERE";
    const androidStore = "PASTE_PLAY_STORE_LINK_HERE";

    // אם יהיה deep link מהאפליקציה בעתיד:
    const appScheme = "shabat://home";

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    // נסיון לפתוח אפליקציה
    window.location = appScheme;

    // fallback
    setTimeout(() => {
        if (isIOS) window.location = iosStore;
        else if (isAndroid) window.location = androidStore;
        else window.location = iosStore;
    }, 700);
});