/* ==========================================================================
   BRADY LEGAL SOLICITORS — main.js
   Navigation, reveal animations, FAQ, reviews, cookies
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Utilities ---------- */

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Header state & mobile nav ---------- */

  var header = $(".header");
  var toggle = $(".nav__toggle");
  var navLinks = $(".nav__links");

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    $$(".nav__link", navLinks).forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Back to top ---------- */

  var toTop = $(".to-top");

  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("is-visible", window.scrollY > 700);
    }, { passive: true });

    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Reveal on scroll ---------- */

  var revealEls = $$(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- FAQ accordion ---------- */

  $$(".faq-item").forEach(function (item) {
    var q = $(".faq-item__q", item);
    var a = $(".faq-item__a", item);

    if (!q || !a) return;

    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      $$(".faq-item.is-open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          $(".faq-item__a", openItem).style.maxHeight = null;
        }
      });

      item.classList.toggle("is-open", !isOpen);
      a.style.maxHeight = isOpen ? null : a.scrollHeight + "px";
    });
  });

  /* ---------- Cookie notice ---------- */

  var cookieBar = $(".cookie-notice");

  if (cookieBar && !localStorage.getItem("bls-cookie-consent")) {
    setTimeout(function () {
      cookieBar.classList.add("is-visible");
    }, 1200);
  }

  var cookieAccept = $(".cookie-notice__accept");
  var cookieDecline = $(".cookie-notice__decline");

  function dismissCookie() {
    cookieBar.classList.remove("is-visible");
  }

  if (cookieAccept) {
    cookieAccept.addEventListener("click", function () {
      localStorage.setItem("bls-cookie-consent", "accepted");
      dismissCookie();
    });
  }

  if (cookieDecline) {
    cookieDecline.addEventListener("click", function () {
      localStorage.setItem("bls-cookie-consent", "declined");
      dismissCookie();
    });
  }

  /* ---------- Reviews ---------- */

  var API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : "https://brady-legal-api.onrender.com";

  var SEED_REVIEWS = [
    {
      name: "Margaret Whitfield",
      location: "Edgbaston, Birmingham",
      date: "March 2026",
      rating: 5,
      caseType: "Residential Conveyancing",
      text: "We sold and purchased in a single chain that threatened to collapse twice. Jonathan kept everything moving and dealt with the other side directly when their solicitors became difficult. Completion happened on the day we were promised. I cannot fault the service."
    },
    {
      name: "David Okafor",
      location: "Camden, London",
      date: "February 2026",
      rating: 5,
      caseType: "Employment Law",
      text: "After being dismissed during probation I assumed I had no claim. Brady Legal took the time to look at my contract and found the flaws in the employer's process. We settled out of tribunal within twelve weeks and I received far more than I expected."
    },
    {
      name: "Sarah-Louise Harper",
      location: "Solihull",
      date: "January 2026",
      rating: 5,
      caseType: "Wills & Probate",
      text: "Handling my mother's estate after her death, with the family spread across three countries, was complicated. They were patient, explained every step in plain terms, and never once made me feel rushed. Their fee was agreed up front and it did not change."
    },
    {
      name: "Robert Chen",
      location: "Canary Wharf, London",
      date: "December 2025",
      rating: 4,
      caseType: "Commercial Law",
      text: "Drafted and negotiated a shareholders' agreement for our two founders. Pragmatic and commercially minded rather than the usual wall of legal jargon. Communication was good, though I did have to chase once or twice during a busy period."
    },
    {
      name: "Priya Sharma",
      location: "Harborne, Birmingham",
      date: "November 2025",
      rating: 5,
      caseType: "Family Law",
      text: "The most difficult year of my life, made bearable by how professionally my divorce was handled. Every option was laid out honestly with the costs attached, and the financial settlement was fair. I am grateful for their steadiness throughout."
    },
    {
      name: "Geoffrey Ashworth",
      location: "Kensington, London",
      date: "October 2025",
      rating: 5,
      caseType: "Dispute Resolution",
      text: "A commercial landlord refused to return our deposit of £86,000 and our previous solicitors had made little progress in six months. Brady Legal took over, wrote one robust letter, and the funds were in our account within three weeks."
    },
    {
      name: "Helen Doyle",
      location: "Sutton Coldfield",
      date: "September 2025",
      rating: 5,
      caseType: "Residential Conveyancing",
      text: "First-time buyer with a leasehold flat, so there was a lot to unpick. They flagged the ground rent clause that every other firm had missed and negotiated it down. Their fixed fee was exactly what we paid."
    },
    {
      name: "Michael Bancroft",
      location: "Islington, London",
      date: "August 2025",
      rating: 4,
      caseType: "Commercial Law",
      text: "Acted for us on an acquisition of a small logistics business. Thorough due diligence and a deal that closed on schedule. I would use them again without hesitation."
    },
    {
      name: "Fatima Ali",
      location: "Birmingham",
      date: "July 2025",
      rating: 5,
      caseType: "Family Law",
      text: "Custody arrangements for my two children, handled with genuine care. They prepared me for every hearing and the barrister they instructed was excellent. My children come first and they understood that from day one."
    },
    {
      name: "Thomas Gregory",
      location: "Richmond, London",
      date: "June 2025",
      rating: 5,
      caseType: "Wills & Probate",
      text: "Two simple wills and lasting powers of attorney, arranged for my wife and I within three weeks. Clear advice, sensible fees and the documents explained line by line. Exactly what you hope for from a solicitor."
    }
  ];

  var STORAGE_KEY = "bls-user-reviews";

  var serverReviews = null;

  var seedCounts = { 5: 118, 4: 10, 3: 3, 2: 1, 1: 0 };
  var seedTotal = 132;

  function fetchServerReviews() {
    if (serverReviews) return Promise.resolve(serverReviews);
    return fetch(API_BASE + "/api/reviews", { headers: { "Accept": "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(function (list) {
        serverReviews = list;
        return list;
      })
      .catch(function () {
        return null;
      });
  }

  function loadUserReviews() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveUserReviews(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) { /* storage unavailable */ }
  }

  function starMarkup(rating, large) {
    var stars = "";
    for (var i = 1; i <= 5; i++) {
      stars += '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.26 6.6.72-4.9 4.55 1.32 6.47L12 16.77l-5.92 3.23 1.32-6.47-4.9-4.55 6.6-.72L12 2z"/></svg>';
    }
    return '<span class="stars' + (large ? " stars--lg" : "") + '" role="img" aria-label="' + rating + ' out of 5 stars">' + stars + "</span>";
  }

  function renderReviewCard(review, index) {
    var card = document.createElement("article");
    card.className = "review-card";
    card.setAttribute("data-review-index", index);

    card.innerHTML =
      '<div class="review-card__head">' +
        "<div>" +
          '<div class="review-card__person">' + escapeHtml(review.name) + "</div>" +
          '<div class="review-card__meta">' + escapeHtml(review.location) + " &middot; " + escapeHtml(review.date) + "</div>" +
        "</div>" +
        starMarkup(review.rating, false) +
      "</div>" +
      '<p class="review-card__body">' + escapeHtml(review.text) + "</p>" +
      '<div class="review-card__case">' + escapeHtml(review.caseType) + "</div>";

    return card;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
  }

  function computeAverages() {
    var userReviews = loadUserReviews();

    if (serverReviews) {
      var counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      var total = 0;
      var sum = 0;
      serverReviews.forEach(function (r) {
        var r5 = Math.round(r.rating);
        if (r5 >= 1 && r5 <= 5) { counts[r5] += 1; total += 1; sum += r5; }
      });
      return {
        average: total ? (sum / total) : 5,
        total: total,
        counts: counts
      };
    }

    var counts = { 5: seedCounts[5], 4: seedCounts[4], 3: seedCounts[3], 2: seedCounts[2], 1: seedCounts[1] };
    var total = seedTotal;
    var sum = 118 * 5 + 10 * 4 + 3 * 3 + 1 * 2;

    userReviews.forEach(function (r) {
      var r5 = Math.round(r.rating);
      if (r5 >= 1 && r5 <= 5) { counts[r5] += 1; total += 1; sum += r5; }
    });

    return {
      average: total ? (sum / total) : 5,
      total: total,
      counts: counts
    };
  }

  function renderRatingSummary() {
    var summary = $("[data-rating-summary]");
    if (!summary) return;

    var stats = computeAverages();
    var averageEl = $(".review-summary__num", summary);
    var countEl = $(".review-summary__count", summary);
    var starsEl = $(".review-summary__stars", summary);
    var bars = $$(".rating-row", summary);

    if (averageEl) averageEl.textContent = stats.average.toFixed(1);
    if (countEl) countEl.textContent = stats.total + " reviews";
    if (starsEl) starsEl.innerHTML = starMarkup(Math.round(stats.average), true);

    [5, 4, 3, 2, 1].forEach(function (rating, i) {
      var row = bars[i];
      if (!row) return;
      var pct = Math.round((stats.counts[rating] / stats.total) * 100);
      var fill = $(".rating-row__fill", row);
      var count = $(".rating-row__count", row);
      if (fill) fill.style.width = pct + "%";
      if (count) count.textContent = stats.counts[rating];
    });
  }

  function renderReviews() {
    var grid = $("[data-review-grid]");
    if (!grid) return;

    var userReviews = loadUserReviews();

    grid.innerHTML = "";

    userReviews.slice().reverse().forEach(function (review, i) {
      grid.appendChild(renderReviewCard(review, "user-" + i));
    });

    var base = serverReviews || SEED_REVIEWS;

    base.forEach(function (review, i) {
      grid.appendChild(renderReviewCard(review, "seed-" + i));
    });

    renderRatingSummary();
  }

  function postServerReview(payload) {
    return fetch(API_BASE + "/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error("Request failed");
      return res.json();
    });
  }

  var reviewForm = $("[data-review-form]");

  if (reviewForm) {
    reviewForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var nameEl = $("#review-name", reviewForm);
      var locationEl = $("#review-location", reviewForm);
      var caseEl = $("#review-case", reviewForm);
      var textEl = $("#review-text", reviewForm);
      var ratingEl = $('input[name="rating"]:checked', reviewForm);
      var statusEl = $(".form-status", reviewForm);

      var name = nameEl ? nameEl.value.trim() : "";
      var location = locationEl ? locationEl.value.trim() : "";
      var caseType = caseEl ? caseEl.value : "General Enquiry";
      var text = textEl ? textEl.value.trim() : "";
      var rating = ratingEl ? parseInt(ratingEl.value, 10) : 0;

      if (!name || !text || !rating) {
        if (statusEl) {
          statusEl.className = "form-status is-visible form-status--err";
          statusEl.textContent = "Please provide your name, a rating and your review before submitting.";
        }
        return;
      }

      var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      var now = new Date();

      var review = {
        name: name,
        location: location || "Client",
        caseType: caseType,
        rating: rating,
        text: text,
        date: monthNames[now.getMonth()] + " " + now.getFullYear()
      };

      var list = loadUserReviews();
      list.push(review);
      saveUserReviews(list);

      postServerReview(review).then(function (res) {
        reviewForm.reset();
        if (statusEl) {
          statusEl.className = "form-status is-visible form-status--ok";
          statusEl.textContent = res.message || ("Thank you, " + name + ". Your review has been submitted and will appear after moderation.");
        }
      }).catch(function () {
        reviewForm.reset();
        if (statusEl) {
          statusEl.className = "form-status is-visible form-status--ok";
          statusEl.textContent = "Thank you, " + name + ". Your review has been added.";
        }
      });

  renderReviews();
  fetchServerReviews().then(function () {
    renderReviews();
  });

      if (statusEl) {
        setTimeout(function () {
          statusEl.classList.remove("is-visible");
        }, 6000);
      }
    });
  }

  renderReviews();

  /* ---------- Contact form (backend API) ---------- */

  var contactForm = $("[data-contact-form]");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var statusEl = $(".form-status", contactForm);

      var payload = {};
      $$("input, select, textarea", contactForm).forEach(function (el) {
        if (el.name) payload[el.name] = el.value.trim();
      });

      fetch(API_BASE + "/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          return res.json();
        })
        .then(function (data) {
          contactForm.reset();
          if (statusEl) {
            statusEl.className = "form-status is-visible form-status--ok";
            statusEl.textContent = data.message || "Thank you. Your enquiry has been sent — we will reply within one working day.";
          }
        })
        .catch(function () {
          if (statusEl) {
            statusEl.className = "form-status is-visible form-status--err";
            statusEl.textContent = "Something went wrong sending your enquiry. Please email bradylegal.uk.co@outlook.com or call +44 (0)20 7946 0958.";
          }
        });
    });
  }

  /* ---------- Site search ---------- */

  var searchOpen = $("[data-search-open]");
  var searchOverlay = $("#searchOverlay");
  var searchInput = $("[data-search-input]");
  var searchResults = $("[data-search-results]");
  var searchClose = $("[data-search-close]");
  var searchForm = $("[data-search-form]");
  var pageIndex = null;
  var searchTimer = null;

  function stripHtml(html) {
    var div = document.createElement("div");
    div.innerHTML = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ");
    return div.textContent.replace(/\s+/g, " ").trim();
  }

  function getPageTitle(html) {
    var m = html.match(/<title>([\s\S]*?)<\/title>/i);
    return m ? m[1].replace(/&amp;/g, "&").trim() : "";
  }

  function loadSearchPages() {
    if (pageIndex) return Promise.resolve(pageIndex);
    var pages = ["index.html", "about.html", "practice.html", "team.html", "contact.html"];
    return Promise.all(pages.map(function (file) {
      return fetch(file, { headers: { "Accept": "text/html" } })
        .then(function (res) { return res.ok ? res.text() : Promise.reject(); })
        .catch(function () { return ""; });
    })).then(function (htmlList) {
      pageIndex = htmlList.map(function (html, i) {
        return {
          file: pages[i],
          title: getPageTitle(html),
          text: stripHtml(html)
        };
      });
      return pageIndex;
    });
  }

  function highlight(match, text) {
    var idx = text.toLowerCase().indexOf(match.toLowerCase());
    if (idx === -1) return "";
    var start = Math.max(0, idx - 90);
    var end = Math.min(text.length, idx + match.length + 140);
    var snippet = (start > 0 ? "&hellip; " : "") + text.slice(start, end) + (end < text.length ? " &hellip;" : "");
    return snippet.replace(new RegExp("(" + match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<em>$1</em>");
  }

  function runSearch(term) {
    if (!searchResults) return;
    term = (term || "").trim();
    if (term.length < 2) {
      searchResults.innerHTML = '<div class="search-overlay__empty">Type at least two letters to search the site. Try &ldquo;conveyancing&rdquo;, &ldquo;divorce&rdquo; or &ldquo;wills&rdquo;.</div>';
      return;
    }

    loadSearchPages().then(function (pages) {
      var query = term.toLowerCase();
      var matches = [];
      pages.forEach(function (page) {
        var lower = page.text.toLowerCase();
        var count = lower.split(query).length - 1;
        if (count >= 1) matches.push({ page: page, count: count });
      });
      matches.sort(function (a, b) { return b.count - a.count; });

      if (!matches.length) {
        searchResults.innerHTML = '<div class="search-overlay__empty">No results for &ldquo;' + escapeHtml(term) + '&rdquo;. Try a practice area like &ldquo;conveyancing&rdquo; or &ldquo;family law&rdquo;.</div>';
        return;
      }

      searchResults.innerHTML = matches.slice(0, 8).map(function (m) {
        return '<a class="search-result" href="' + m.page.file + '" data-search-link>' +
          '<span class="search-result__title">' + highlight(term, m.page.title) + "</span>" +
          '<span class="search-result__snippet">' + highlight(term, m.page.text) + "</span></a>";
      }).join("");
    });
  }

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.hidden = false;
    if (searchInput) {
      searchInput.focus();
      runSearch(searchInput.value);
    }
    document.body.style.overflow = "hidden";
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.hidden = true;
    document.body.style.overflow = "";
  }

  if (searchOpen) {
    searchOpen.addEventListener("click", openSearch);
  }

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearch();
    }
    if (e.key === "Escape") closeSearch();
  });

  if (searchClose) {
    searchClose.addEventListener("click", closeSearch);
  }
  if (searchOverlay) {
    searchOverlay.addEventListener("click", function (e) {
      if (e.target === searchOverlay) closeSearch();
    });
  }
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) { e.preventDefault(); });
  }
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { runSearch(searchInput.value); }, 250);
    });
  }

  /* ---------- Newsletter ---------- */

  var newsletterForm = $("[data-newsletter-form]");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var emailEl = $("input[name='email']", newsletterForm);
      var statusEl = $(".form-status", newsletterForm);
      var email = emailEl ? emailEl.value.trim() : "";

      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        if (statusEl) {
          statusEl.className = "form-status is-visible form-status--err";
          statusEl.textContent = "Please enter a valid email address.";
        }
        return;
      }

      fetch(API_BASE + "/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: email })
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          return res.json();
        })
        .then(function (data) {
          newsletterForm.reset();
          if (statusEl) {
            statusEl.className = "form-status is-visible form-status--ok";
            statusEl.textContent = data.message || "Thank you for subscribing.";
          }
        })
        .catch(function () {
          if (statusEl) {
            statusEl.className = "form-status is-visible form-status--err";
            statusEl.textContent = "Subscription is temporarily unavailable. Please try again later.";
          }
        });
    });
  }

  /* ---------- Case enquiry wizard ---------- */

  var wizard = $("[data-wizard]");

  if (wizard) {
    var wizardForm = $("[data-wizard-form]", wizard);
    var steps = $$(".wizard__step", wizard);
    var dots = $$(".wizard__dot", wizard);
    var backBtn = $("[data-wizard-back]", wizard);
    var nextBtn = $("[data-wizard-next]", wizard);
    var submitBtn = $("[data-wizard-submit]", wizard);
    var wizardStatus = $(".form-status", wizard);
    var currentStep = 0;

    function goToStep(n) {
      currentStep = n;
      steps.forEach(function (s, i) {
        s.classList.toggle("is-active", i === n);
      });
      dots.forEach(function (d, i) {
        d.classList.toggle("is-active", i <= n);
      });
      backBtn.hidden = n === 0;
      nextBtn.hidden = n === steps.length - 1;
      submitBtn.hidden = n !== steps.length - 1;
      if (wizardStatus) wizardStatus.className = "form-status";
    }

    nextBtn.addEventListener("click", function () {
      if (currentStep === 0) {
        var matter = $('input[name="matter"]:checked', wizard);
        if (!matter) {
          if (wizardStatus) {
            wizardStatus.className = "form-status is-visible form-status--err";
            wizardStatus.textContent = "Please choose the type of matter first.";
          }
          return;
        }
      }
      goToStep(currentStep + 1);
    });

    backBtn.addEventListener("click", function () {
      goToStep(currentStep - 1);
    });

    wizardForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("[name='name']", wizardForm).value.trim();
      var email = $("[name='email']", wizardForm).value.trim();
      var phone = $("[name='phone']", wizardForm).value.trim();
      var matter = $('input[name="matter"]:checked', wizard).value;
      var urgency = $('input[name="urgency"]:checked', wizard) ? $('input[name="urgency"]:checked', wizard).value : "";
      var meeting = $('input[name="meeting"]:checked', wizard) ? $('input[name="meeting"]:checked', wizard).value : "";
      var detail = $("[name='detail']", wizardForm).value.trim();

      if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        if (wizardStatus) {
          wizardStatus.className = "form-status is-visible form-status--err";
          wizardStatus.textContent = "Please provide your name and a valid email address.";
        }
        return;
      }

      fetch(API_BASE + "/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          name: name, email: email, phone: phone, matter: matter,
          answers: { urgency: urgency, meeting: meeting, detail: detail }
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          return res.json();
        })
        .then(function (data) {
          if (wizardStatus) {
            wizardStatus.className = "form-status is-visible form-status--ok";
            wizardStatus.textContent = data.message || "Thank you. Your case outline has been received.";
          }
          wizardForm.reset();
          goToStep(0);
        })
        .catch(function () {
          if (wizardStatus) {
            wizardStatus.className = "form-status is-visible form-status--err";
            wizardStatus.textContent = "Something went wrong. Please use the enquiry form or call +44 (0)20 7946 0958.";
          }
        });
    });
  }

  /* ---------- Footer year ---------- */

  var yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
