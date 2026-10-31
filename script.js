/**
 * Meenakshi Mandir Wedding Invitation
 * Interactive Scripts: Audio Player, Petal Shower, Countdown, Event Carousel, Frame Slider & RSVP
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. DATA & CONSTANTS
  // ==========================================================================
  const WEDDING_DATA = {
    targetDate: new Date('2027-03-12T09:00:00+05:30'),
    couple: {
      groom: 'Deepak Kumar',
      bride: 'Gomathi',
      hashtag: '#DeepakKumarWedsGomathi'
    },
    venue: {
      name: 'En Sesha Mahal',
      address: '71, Peter's Road, Royapettah, Chennai, Tamil Nadu',
      mapsUrl: 'https://share.google/9cDnaaYRR4evNU4Ec'
    },
    events: [
      {
        id: 'reception',
        title: 'Grand Wedding Reception',
        date: 'Thursday, 11 March 2027',
        time: '7:00 PM onwards',
        venue: 'En Sesha Mahal, Chennai',
        desc: 'Celebrate the eve of the wedding with musical blessings, meet the bride & groom, and enjoy a grand royal banquet.',
        image: 'assets/img/reception_blue.jpg',
        mapUrl: 'https://share.google/9cDnaaYRR4evNU4Ec'
      },
      {
        id: 'wedding',
        title: 'Wedding Ceremony (Muhurtham)',
        date: 'Friday, 12 March 2027',
        time: '9:00 AM – 10:30 AM (Muhurtham)',
        venue: 'En Sesha Mahal, Chennai',
        desc: 'Witness the sacred Vedic vows, Mangalya Dharanam, and Saptapadi as Deepak Kumar and Gomathi unite in holy matrimony.',
        image: 'assets/img/couple_muhurtham.jpg',
        mapUrl: 'https://share.google/9cDnaaYRR4evNU4Ec'
      }
    ]
  };

  // ==========================================================================
  // 2. BACKGROUND AUDIO PLAYER
  // ==========================================================================
  const audio = new Audio('assets/audio/music.mp3');
  audio.loop = true;
  audio.volume = 0.65;

  const musicBtn = document.getElementById('music-toggle');
  const audioHint = document.getElementById('audio-hint');
  let isPlaying = false;
  let hasInteracted = false;

  function setPlayingState(playing) {
    isPlaying = playing;
    if (musicBtn) {
      if (playing) {
        musicBtn.classList.add('playing');
        musicBtn.setAttribute('aria-label', 'Pause traditional wedding music');
      } else {
        musicBtn.classList.remove('playing');
        musicBtn.setAttribute('aria-label', 'Play traditional wedding music');
      }
    }
    if (audioHint) {
      audioHint.classList.add('hidden');
    }
  }

  function toggleMusic() {
    if (isPlaying) {
      audio.pause();
      setPlayingState(false);
    } else {
      audio.play().then(() => {
        setPlayingState(true);
      }).catch(err => {
        console.warn('Audio play restricted:', err);
      });
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', toggleMusic);
  }

  // Attempt gentle autoplay on user's first touch/click anywhere on document
  function onFirstUserGesture() {
    if (!hasInteracted) {
      hasInteracted = true;
      if (!isPlaying) {
        audio.play().then(() => {
          setPlayingState(true);
        }).catch(() => {
          // Keep paused if browser blocks
        });
      }
      window.removeEventListener('click', onFirstUserGesture);
      window.removeEventListener('touchstart', onFirstUserGesture);
    }
  }

  window.addEventListener('click', onFirstUserGesture, { passive: true });
  window.addEventListener('touchstart', onFirstUserGesture, { passive: true });

  // Hide audio hint pill after 6 seconds if not clicked
  setTimeout(() => {
    if (audioHint && !isPlaying) {
      audioHint.classList.add('hidden');
    }
  }, 7000);

  // ==========================================================================
  // 3. FALLING MARIGOLD & JASMINE PETALS (CANVAS)
  // ==========================================================================
  const canvas = document.getElementById('petals-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const PETAL_COUNT = 24;
    const petals = [];

    // Colors: Golden Marigold, Haldi Orange, Tender Jasmine White
    const petalColors = [
      { fill: '#f6aa1c', stroke: '#e28400' }, // Marigold orange
      { fill: '#ffd166', stroke: '#e8ac25' }, // Golden yellow
      { fill: '#ffebb3', stroke: '#edd38c' }, // Haldi cream
      { fill: '#fffef0', stroke: '#eedebb' }  // Jasmine white
    ];

    for (let i = 0; i < PETAL_COUNT; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * 8 + 6,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        speedY: Math.random() * 1.2 + 0.8,
        speedX: Math.random() * 1.0 - 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        oscAmp: Math.random() * 1.5 + 0.5,
        oscStep: Math.random() * 10
      });
    }

    function drawPetal(ctx, p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.beginPath();
      // Organic petal shape
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.4, p.size * 0.7, p.size * 0.7, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.7, -p.size * 0.8, -p.size * 0.4, 0, -p.size);
      ctx.fillStyle = p.color.fill;
      ctx.fill();
      ctx.strokeStyle = p.color.stroke;
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();
    }

    function animatePetals() {
      ctx.clearRect(0, 0, width, height);

      petals.forEach(p => {
        p.oscStep += 0.02;
        p.x += p.speedX + Math.sin(p.oscStep) * p.oscAmp;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        drawPetal(ctx, p);
      });

      requestAnimationFrame(animatePetals);
    }

    animatePetals();
  }

  // ==========================================================================
  // 4. COUNTDOWN TIMER ("Counting the Days")
  // ==========================================================================
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minsEl = document.getElementById('count-mins');
  const secsEl = document.getElementById('count-secs');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = WEDDING_DATA.targetDate.getTime() - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Add to Google Calendar button
  const addToCalBtn = document.getElementById('btn-add-calendar');
  if (addToCalBtn) {
    addToCalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Google Calendar URL formatting (UTC format)
      // Wedding is 2027-03-12 09:00 IST to 13:00 IST -> UTC is 20270312T033000Z / 20270312T073000Z
      const title = encodeURIComponent('Deepak Kumar & Gomathi Wedding Ceremony');
      const details = encodeURIComponent('With the blessings of our elders, join us to celebrate the auspicious wedding of Deepak Kumar and Gomathi.\nReception: 11 March 2027 (7:00 PM)\nWedding: 12 March 2027 (9:00 AM)\nVenue: En Sesha Mahal, Chennai, Tamil Nadu.\n#DeepakKumarWedsGomathi');
      const location = encodeURIComponent('En Sesha Mahal, 71, Peter's Road, Royapettah, Chennai, Tamil Nadu');
      const dates = '20270312T033000Z/20270312T073000Z';
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
      window.open(gcalUrl, '_blank');
    });
  }

  // ==========================================================================
  // 5. "MEET THE BRIDE & GROOM" FRAME SLIDER
  // ==========================================================================
  const frameSlides = document.querySelectorAll('.frame-slide');
  const sliderDots = document.querySelectorAll('.slider-dot');
  let currentSlide = 0;
  let slideInterval = null;

  function showSlide(index) {
    frameSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    sliderDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentSlide = index;
  }

  function nextSlide() {
    const next = (currentSlide + 1) % frameSlides.length;
    showSlide(next);
  }

  function startSlideShow() {
    stopSlideShow();
    slideInterval = setInterval(nextSlide, 3500);
  }

  function stopSlideShow() {
    if (slideInterval) clearInterval(slideInterval);
  }

  sliderDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      startSlideShow();
    });
  });

  const frameContainer = document.querySelector('.frame-container');
  if (frameContainer) {
    frameContainer.addEventListener('mouseenter', stopSlideShow);
    frameContainer.addEventListener('mouseleave', startSlideShow);
    frameContainer.addEventListener('touchstart', stopSlideShow, { passive: true });
    frameContainer.addEventListener('touchend', startSlideShow, { passive: true });
  }

  startSlideShow();

  // ==========================================================================
  // 6. WEDDING EVENTS CAROUSEL & TABS
  // ==========================================================================
  const eventTabs = document.querySelectorAll('.event-tab');
  const eventCard = document.getElementById('featured-event-card');
  const eventCounterEl = document.getElementById('event-counter');
  const eventImgEl = document.getElementById('event-img');
  const eventTitleEl = document.getElementById('event-title');
  const eventDateEl = document.getElementById('event-date');
  const eventTimeEl = document.getElementById('event-time');
  const eventVenueEl = document.getElementById('event-venue');
  const eventDescEl = document.getElementById('event-desc');
  const eventMapLink = document.getElementById('event-map-link');
  const prevEventBtn = document.getElementById('btn-prev-event');
  const nextEventBtn = document.getElementById('btn-next-event');

  let currentEventIndex = 0;

  function setEvent(index) {
    if (index < 0) index = WEDDING_DATA.events.length - 1;
    if (index >= WEDDING_DATA.events.length) index = 0;

    currentEventIndex = index;
    const evt = WEDDING_DATA.events[index];

    // Update active tab
    eventTabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
    });

    // Gentle card transition
    if (eventCard) {
      eventCard.style.opacity = '0.4';
      eventCard.style.transform = 'translateY(6px)';

      setTimeout(() => {
        if (eventCounterEl) eventCounterEl.textContent = `0${index + 1} / 0${WEDDING_DATA.events.length}`;
        if (eventImgEl) {
          eventImgEl.src = evt.image;
          eventImgEl.alt = evt.title;
        }
        if (eventTitleEl) eventTitleEl.textContent = evt.title;
        if (eventDateEl) eventDateEl.textContent = evt.date;
        if (eventTimeEl) eventTimeEl.textContent = evt.time;
        if (eventVenueEl) eventVenueEl.textContent = evt.venue;
        if (eventDescEl) eventDescEl.textContent = evt.desc;
        if (eventMapLink) eventMapLink.href = evt.mapUrl;

        eventCard.style.opacity = '1';
        eventCard.style.transform = 'translateY(0)';
      }, 160);
    }
  }

  eventTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.dataset.eventIndex, 10);
      setEvent(idx);
    });
  });

  if (prevEventBtn) {
    prevEventBtn.addEventListener('click', () => {
      setEvent(currentEventIndex - 1);
    });
  }

  if (nextEventBtn) {
    nextEventBtn.addEventListener('click', () => {
      setEvent(currentEventIndex + 1);
    });
  }

  // ==========================================================================
  // 7. INTERACTIVE RSVP MODAL & SUBMISSION
  // ==========================================================================
  const rsvpModal = document.getElementById('rsvp-modal');
  const openRsvpBtns = document.querySelectorAll('.btn-open-rsvp');
  const closeRsvpBtn = document.getElementById('btn-close-rsvp');
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpSuccess = document.getElementById('rsvp-success');
  const attendYesBtn = document.getElementById('attend-yes');
  const attendNoBtn = document.getElementById('attend-no');
  const guestsGroup = document.getElementById('guests-group');
  const ceremoniesGroup = document.getElementById('ceremonies-group');
  const whatsappShareBtn = document.getElementById('btn-whatsapp-share');

  let attendingState = 'yes'; // 'yes' or 'no'

  function openRsvp() {
    if (rsvpModal) {
      rsvpModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeRsvp() {
    if (rsvpModal) {
      rsvpModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  openRsvpBtns.forEach(btn => btn.addEventListener('click', openRsvp));
  if (closeRsvpBtn) closeRsvpBtn.addEventListener('click', closeRsvp);

  if (rsvpModal) {
    rsvpModal.addEventListener('click', (e) => {
      if (e.target === rsvpModal) closeRsvp();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && rsvpModal && rsvpModal.classList.contains('open')) {
      closeRsvp();
    }
  });

  if (attendYesBtn && attendNoBtn) {
    attendYesBtn.addEventListener('click', () => {
      attendingState = 'yes';
      attendYesBtn.classList.add('selected');
      attendNoBtn.classList.remove('selected');
      if (guestsGroup) guestsGroup.style.display = 'block';
      if (ceremoniesGroup) ceremoniesGroup.style.display = 'block';
    });

    attendNoBtn.addEventListener('click', () => {
      attendingState = 'no';
      attendNoBtn.classList.add('selected');
      attendYesBtn.classList.remove('selected');
      if (guestsGroup) guestsGroup.style.display = 'none';
      if (ceremoniesGroup) ceremoniesGroup.style.display = 'none';
    });
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('guest-name').value.trim();
      const phone = document.getElementById('guest-phone').value.trim();
      const guestCount = attendingState === 'yes' ? document.getElementById('guest-count').value : '0';
      const blessings = document.getElementById('guest-message').value.trim();

      const selectedCeremonies = [];
      document.querySelectorAll('input[name="ceremony"]:checked').forEach(c => {
        selectedCeremonies.push(c.value);
      });

      const rsvpEntry = {
        name,
        phone,
        attending: attendingState,
        guestCount,
        ceremonies: selectedCeremonies,
        blessings,
        submittedAt: new Date().toISOString()
      };

      // Store in localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
        stored.push(rsvpEntry);
        localStorage.setItem('wedding_rsvps', JSON.stringify(stored));
      } catch (err) {
        console.warn('Storage error:', err);
      }

      // Generate WhatsApp message link
      let waText = `Namaste! RSVP for Deepak Kumar & Gomathi Wedding (Chennai):\n\n`;
      waText += `*Name:* ${name}\n`;
      waText += `*Status:* ${attendingState === 'yes' ? 'Joyfully Attending 🎉' : 'Regretfully Declining 🌸'}\n`;
      if (attendingState === 'yes') {
        waText += `*Total Guests:* ${guestCount}\n`;
        waText += `*Events:* ${selectedCeremonies.join(', ')}\n`;
      }
      if (blessings) {
        waText += `*Blessings:* "${blessings}"\n`;
      }

      if (whatsappShareBtn) {
        whatsappShareBtn.href = `https://wa.me/?text=${encodeURIComponent(waText)}`;
      }

      // Switch view to success
      rsvpForm.style.display = 'none';
      if (rsvpSuccess) {
        rsvpSuccess.style.display = 'block';
        const msgEl = document.getElementById('success-guest-name');
        if (msgEl) msgEl.textContent = name;
      }
    });
  }

  // ==========================================================================
  // 8. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // ==========================================================================
  // 9. COPY INVITATION LINK
  // ==========================================================================
  const copyLinkBtn = document.getElementById('btn-copy-link');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      const url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          const origText = copyLinkBtn.innerHTML;
          copyLinkBtn.innerHTML = '<span>✓ Link Copied!</span>';
          setTimeout(() => { copyLinkBtn.innerHTML = origText; }, 2200);
        });
      } else {
        alert('Invitation link: ' + url);
      }
    });
  }

})();
