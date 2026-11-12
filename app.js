/* ==========================================================================
   BREAKING BARRIERS — BIRTHDAY LAB SPA APPLICATION (app.js)
   Dedicated to: Mr. Shakhzod Uralov / Ustoz Shahzod Uralov (November 12)
   Architecture:
   1. Constants, ASSETS (33 exact filenames), Safe Storage & Helpers
   2. Bilingual I18N Dictionary (EN default / UZ) & Segment Title Renderer
   3. Theme Controller (Dark Lab / Light Lab)
   4. Web Audio API Synthesizer Engine + Optional MP3 Player
   5. Fireworks Particle Engine (#fx-canvas, MAX_SPARKS = 280, lighter)
   6. 3D Hologram Tilt & Crop Position Manager (🎯)
   7. SPA Hash Router (#hero, #evidence, #characters, #cakes, #azizjon)
   8. Intro Envelope Overlay Controller
   9. Page 1 (Hero, 3-Slide Carousel, 3 Golden Rules + Video, Chem Mixer)
   10. Page 2 (Laser-Scanned Certificates & Albuquerque × Everest Archive)
   11. Page 3 (14 Breaking Bad Character Cards + Tio Hector's Golden Bell)
   12. Page 4 (2-Tier Cake, 5 Lab Candles, Mic Wind Meter + Puf!, 3 Cakes)
   13. Page 5 (@azizjondev Tribute, 6 Stickers, Crystal Game, Code Terminal)
   14. Lightbox Modal, Video Modal, Toast & App Initialization
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. CONSTANTS, ASSETS MANIFEST (33 UNIQUE IMAGES) & HELPERS
     ------------------------------------------------------------------------ */
  const TEACHER_NAME = {
    en: 'Mr. Shakhzod Uralov',
    uz: 'Ustoz Shahzod Uralov'
  };

  const STORAGE_KEYS = {
    lang: 'bb_lab_lang',
    theme: 'bb_lab_theme',
    muted: 'bb_lab_muted',
    crops: 'bb_lab_crops_v1',
    respect: 'bb_lab_respect_v1',
    wishes: 'bb_lab_cake_wishes_v1',
    channelLogo: 'bb_lab_channel_logo_v1'
  };

  /* All 33 exact image filenames from Section 2.2 + ustoz.jpg + optional audio/video */
  const ASSETS = {
    images: {
      /* Hero Slides (3) + Ustoz Portrait */
      hero1: 'photo_2026-11-11_14-26-47.jpg',
      hero2: 'islombek.jpg',
      hero3: 'photo_2026-11-11_14-17-50.jpg',
      ustozPortrait: 'ustoz.jpg',

      /* Certificates (4: 3 official TRFs + 1 Heisenberg Gift) */
      cert1: 'photo_2026-11-12_11-20-14.jpg',
      cert2: 'photo_2026-11-12_11-20-16.jpg',
      ielts1: 'ielts1.jpg',
      ielts2: 'ielts2.jpg',
      channelLogo: 'channel_logo.png',

      /* Characters Banner + 14 Cards + PIPs + Tio Block (22) */
      actorsBanner: 'breaking_bad_actors.jpg',
      waltMain: 'heisienberg1.jpg',
      waltPip: 'Walter_white.jpg',
      jesseMain: 'jesse_pinkman.jpg',
      jessePip: 'breaking_bad.jpg',
      fringMain: 'fring.jpg',
      fringPip: 'fring2.jpg',
      saulMain: 'saul_goodman.jpg',
      hankMain: 'hank1.jpg',
      hankPip: 'hank.jpg',
      tucoMain: 'Tuco_Salamanca.jpg',
      heisenbergSuit: 'heisenberg.jpg',
      profWalt: 'walter_white1.jpg',
      twinsMain: 'gemelos_salamanca _3.jpg',
      mikeMain: 'mike.jpg',
      huellMain: 'Instagram.jpg',
      galeMain: 'gale.jpg',
      apexDuo: 'Skinny Pete & Badger.jpg',
      skylerMain: 'skyler_white.jpg',
      laloMain: 'lalo.jpg',
      tioMain: 'Tio_Salamanca.jpg',
      losPollos: 'lospollos.jpg',

      /* Cakes & Scene Archive (6) */
      cake1Lab: 'Breaking bad themed cake_.jpg',
      cake2Crystal: 'cake.jpg',
      cake3Saul: 'cake1.jpg',
      archiveClass: 'breaking_bad1.jpg',
      archiveRv: 'car_scene.jpg',
      archiveLogo: 'breaking_font.jpg'
    },
    audio: {
      theme: 'assets/audio/breaking_bad_theme.mp3',
      birthday: 'assets/audio/happy_birthday.m4a'
    },
    video: {
      1: 'assets/video/rule1.mp4',
      2: 'assets/video/rule2.mp4',
      3: 'assets/video/rule3.mp4'
    }
  };

  /**
   * Builds encoded image path inside assets/images/ (or returns blob/data URL as-is)
   * @param {string} filename
   * @returns {string}
   */
  function img(filename) {
    if (!filename) return '';
    if (filename.indexOf('blob:') === 0 || filename.indexOf('data:') === 0 || filename.indexOf('assets/') === 0) {
      return filename;
    }
    return 'assets/images/' + encodeURI(filename);
  }

  /* Safe localStorage wrapper with in-memory fallback */
  const SafeStorage = (function () {
    const memory = {};
    return {
      get(key, fallback) {
        try {
          const val = localStorage.getItem(key);
          return val !== null ? val : fallback;
        } catch (e) {
          return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : fallback;
        }
      },
      set(key, value) {
        memory[key] = String(value);
        try {
          localStorage.setItem(key, String(value));
        } catch (e) {
          /* Ignore quota or security error */
        }
      },
      getJSON(key, fallback) {
        try {
          const raw = this.get(key, null);
          return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
          return fallback;
        }
      },
      setJSON(key, obj) {
        try {
          this.set(key, JSON.stringify(obj));
        } catch (e) {
          /* Ignore serialization error */
        }
      }
    };
  })();

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isTouchDevice() {
    return window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;
  }

  /**
   * Creates a periodic table element tile DOM node: <span class="el"><sup>num</sup>symbol</span>
   */
  function createElTile(num, symbol, extraClass) {
    const span = document.createElement('span');
    span.className = 'el' + (extraClass ? ' ' + extraClass : '');
    const sup = document.createElement('sup');
    sup.textContent = String(num);
    span.appendChild(sup);
    span.appendChild(document.createTextNode(String(symbol)));
    return span;
  }

  /**
   * Renders segmented periodic titles cleanly without string replacement
   * @param {HTMLElement|null} container
   * @param {Array<{prefix?: string, el?: [string|number, string], rest?: string}>} segments
   */
  function renderTitle(container, segments) {
    if (!container || !Array.isArray(segments)) return;
    container.textContent = '';
    const frag = document.createDocumentFragment();
    segments.forEach(function (seg) {
      if (seg.prefix) {
        frag.appendChild(document.createTextNode(seg.prefix));
      }
      if (Array.isArray(seg.el) && seg.el.length === 2) {
        const wordWrap = document.createElement('span');
        wordWrap.className = 'title-word';
        wordWrap.appendChild(createElTile(seg.el[0], seg.el[1]));
        let trailingText = '';
        if (seg.rest) {
          const splitMatch = seg.rest.match(/^(\S+)([\s\S]*)$/);
          if (splitMatch) {
            wordWrap.appendChild(document.createTextNode(splitMatch[1]));
            trailingText = splitMatch[2];
          } else {
            trailingText = seg.rest;
          }
        }
        frag.appendChild(wordWrap);
        if (trailingText) {
          frag.appendChild(document.createTextNode(trailingText));
        }
      } else if (seg.rest) {
        frag.appendChild(document.createTextNode(seg.rest));
      }
    });
    container.appendChild(frag);
  }

  /**
   * Startup developer check for all 33 required images
   */
  function verifyManifest() {
    const allFiles = Object.values(ASSETS.images);
    const missing = [];
    let checked = 0;
    allFiles.forEach(function (fileName) {
      const probe = new Image();
      const done = function (isMissing) {
        checked += 1;
        if (isMissing) missing.push(fileName);
        if (checked === allFiles.length && missing.length > 0) {
          console.warn(
            '[Breaking Barriers Dev Check] ' +
              missing.length +
              '/' +
              allFiles.length +
              ' image files not found in assets/images/ (using stylized lab fallbacks):',
            missing
          );
        }
      };
      probe.onload = function () { done(false); };
      probe.onerror = function () { done(true); };
      probe.src = img(fileName);
    });
  }

  /* ------------------------------------------------------------------------
     2. BILINGUAL I18N SYSTEM (EN DEFAULT -> UZ)
     ------------------------------------------------------------------------ */
  const TITLE_SEGMENTS = {
    en: {
      hero: [
        { el: [35, 'Br'], rest: 'eaking ' },
        { el: [56, 'Ba'], rest: 'rriers: ' },
        { el: [99, 'Sh'], rest: 'akhzod ' },
        { el: [90, 'Ur'], rest: 'alov' }
      ],
      rules: [
        { prefix: 'The 3 ', el: [79, 'Au'], rest: ' Golden Rules of ' },
        { el: [99, 'Sh'], rest: 'akhzod ' },
        { el: [90, 'Ur'], rest: 'alov' }
      ],
      mixer: [
        { el: [35, 'Br'], rest: 'eaking ' },
        { el: [56, 'Ba'], rest: 'nd 9.0 Chemical Synthesizer' }
      ],
      evidence: [
        { el: [53, 'I'], rest: 'ELTS 8.0 ' },
        { el: [35, 'Br'], rest: 'eaking ' },
        { el: [56, 'Ba'], rest: 'd Evidence Lab' }
      ],
      archive: [
        { el: [13, 'Al'], rest: 'buquerque × Everest Samarqand Scene ' },
        { el: [18, 'Ar'], rest: 'chive' }
      ],
      characters: [
        { prefix: '14 ', el: [35, 'Br'], rest: 'eaking ' },
        { el: [56, 'Ba'], rest: 'd Legends Salute Mr. Shakhzod Uralov' }
      ],
      /* Page 4 strictly built via segments array */
      cakes: [
        { el: [20, 'Ca'], rest: 'ndle Wish & ' },
        { el: [35, 'Br'], rest: 'eaking Bad Cakes' }
      ],
      azizjon: [
        { prefix: '@azizjondev & ', el: [35, 'Br'], rest: 'eaking ' },
        { el: [56, 'Ba'], rest: 'nd 9.0 Core' }
      ]
    },
    uz: {
      hero: [
        { el: [35, 'Br'], rest: 'eaking ' },
        { el: [56, 'Ba'], rest: 'rriers: Ustoz ' },
        { el: [99, 'Sh'], rest: 'ahzod ' },
        { el: [90, 'Ur'], rest: 'alov' }
      ],
      rules: [
        { prefix: 'Ustoz ', el: [99, 'Sh'], rest: 'ahzod ' },
        { el: [90, 'Ur'], rest: 'alovning 3 ta Oltin Qoidasi' }
      ],
      mixer: [
        { el: [35, 'Br'], rest: 'eaking ' },
        { el: [56, 'Ba'], rest: 'nd 9.0 Kimyoviy Sintezatori' }
      ],
      evidence: [
        { el: [53, 'I'], rest: 'ELTS 8.0 Lazer Skanerli ' },
        { el: [35, 'Br'], rest: 'eaking ' },
        { el: [56, 'Ba'], rest: 'd Dalillar' }
      ],
      archive: [
        { el: [13, 'Al'], rest: 'bukerke × Everest Samarqand Sahna ' },
        { el: [18, 'Ar'], rest: 'xivi' }
      ],
      characters: [
        { prefix: '14 ', el: [35, 'Br'], rest: 'eaking ' },
        { el: [56, 'Ba'], rest: 'd Qahramoni Tabrigi — Ustoz Shahzod Uralovga' }
      ],
      /* Page 4 strictly built via segments array: [56 Sh]amlar Tilagi va [35 Br]eaking Bad Tortlari */
      cakes: [
        { el: [56, 'Sh'], rest: 'amlar Tilagi va ' },
        { el: [35, 'Br'], rest: 'eaking Bad Tortlari' }
      ],
      azizjon: [
        { prefix: '@azizjondev ', el: [35, 'Br'], rest: 'eaking ' },
        { el: [56, 'Ba'], rest: 'nd 9.0 Tabrigi va Mini-O\'yin' }
      ]
    }
  };

  const I18N = {
    en: {
      page_titles: {
        hero: 'Heisenberg Lab — Mr. Shakhzod Uralov | Breaking Barriers',
        evidence: 'Laser Evidence 8.0 — Mr. Shakhzod Uralov | Breaking Barriers',
        characters: '14 Legends Tribute — Mr. Shakhzod Uralov | Breaking Barriers',
        cakes: 'Candle Wish & Cakes — Mr. Shakhzod Uralov | Breaking Barriers',
        azizjon: '@azizjondev Band 9.0 Core — Mr. Shakhzod Uralov | Breaking Barriers'
      },
      intro_hud: '⚗️ TOP SECRET // ALBUQUERQUE × EVEREST SAMARQAND LAB',
      intro_headline: 'CONFIDENTIAL BIRTHDAY DOSSIER FOR MR. SHAKHZOD URALOV',
      intro_age_pill: '🎂 BORN 2003 · HAPPY 23RD BIRTHDAY · 12 NOVEMBER',
      intro_theme_dark: 'Dark Lab',
      intro_theme_light: 'Light Lab',
      intro_open_aria: 'Open Classified Laboratory Invitation for Mr. Shakhzod Uralov',
      intro_seal_text: 'OPEN LAB',
      intro_recipient: 'TO: MR. SHAKHZOD URALOV',
      intro_body:
        'Happy 23rd Birthday & Welcome to the Breaking Barriers Laboratory! Your 3x IELTS Band 8.0 and Reading 9.0 formula has inspired hundreds of champions at Everest Samarqand. Born in 2003 and already an icon — today we celebrate your 23rd year and the unstoppable road to Overall Band 9.0!',
      intro_open_cta: 'OPEN SECRET LETTER & START CELEBRATION',
      intro_enter_btn: 'Enter the Laboratory',
      intro_hint: 'Tap the Br·Ba seal or button above to break the lock & start the soundtrack',
      intro_skip: 'Skip Intro →',

      nav_hero: 'Heisenberg Lab',
      nav_evidence: 'Evidence 8.0',
      nav_characters: '14 Legends',
      nav_cakes: 'Candles & Cakes',
      nav_azizjon: 'Band 9.0 Core',
      respect_total_title: 'Total Respect Points for Mr. Shakhzod Uralov',
      theme_toggle_aria: 'Toggle Dark or Light theme',
      audio_toggle_aria: 'Toggle sound effects',
      crop_btn_aria: 'Adjust photo framing (top / upper-center / center)',

      hero_chip_1: '🧪 3x BAND 8.0 & 99.1% PURE FORMULA',
      hero_chip_2: '💎 EVEREST SAMARQAND',
      hero_chip_3: '🎂 NOV 12 · HAPPY 23RD BIRTHDAY (2003)',
      hero_lead:
        'Happy 23rd Birthday to Mr. Shakhzod Uralov (born 2003) — master chemist of English & IELTS at Everest Samarqand! Turning relentless study into 99.1% pure Band 8.0 and Reading 9.0 excellence.',
      metric_reading_label: 'Reading Score',
      metric_reading_sub: 'Maximum Perfection',
      metric_listening_label: 'Listening Score',
      metric_listening_sub: 'Crystal Precision',
      metric_master_label: '3x Master',
      metric_master_sub: '3x Overall Band 8.0',
      metric_empire_label: 'Everest Empire',
      metric_empire_sub: '99.1% Pure Knowledge',
      hero_salute_btn: 'Launch Birthday Salute',
      hero_go_chars_btn: '14 Character Wishes →',

      slideshow_badge: '📸 LIVE LAB FEED // 03 ARCHIVES',
      slide_prev_aria: 'Previous slide',
      slide_next_aria: 'Next slide',

      rules_eyebrow: 'THE URALOV CODEX // THREE GOLDEN LAWS OF IELTS',
      rules_desc:
        'Every high-scoring Everest Samarqand student knows Mr. Shakhzod Uralov\'s 3 golden rules by heart. Activate each interactive lab module below or attach a video clip!',
      rule1_tag: 'PROTOCOL #01 // IGNITION',
      rule1_title: '"JUST DO IT!"',
      rule1_quote: '"Don\'t look for excuses, don\'t hesitate — JUST DO IT!"',
      rule1_status_idle: 'Discipline Reactor: Standby (15%)',
      rule1_status_active: '⚡ 100% DISCIPLINE IGNITED — NO EXCUSES, JUST DO IT!',
      rule1_btn: '⚡ Ignite Power',

      rule2_tag: 'PROTOCOL #02 // PURE TRUTH',
      rule2_title: '"NO SECRET INGREDIENT!"',
      rule2_quote: '"There is no secret ingredient at all — you simply have to sit down and study!"',
      rule2_scroll_badge: '📜 GOLDEN FORMULA REVEALED:',
      rule2_formula: '0% Magic + 100% Sitting Down & Studying = 3x Band 8.0 & Band 9.0!',
      rule2_btn: '📜 Unroll Secret Scroll',
      rule2_btn_close: '📜 Fold Secret Scroll',

      rule3_tag: 'PROTOCOL #03 // CRITICAL MASS',
      rule3_title: '"WORK, WORK... THEN SUDDENLY — BOOM!"',
      rule3_quote:
        '"You study, study, study — no result. Study, study — no result. Then suddenly — BOOM! — you see the breakthrough!"',
      rule3_pressure_label: 'Breakthrough Pressure:',
      rule3_status_0: 'Press button 5 times to build pressure to 100%!',
      rule3_status_building: 'No visible result yet... Don\'t stop!',
      rule3_status_boom: '💥 BOOM! YOU SEE THE RESULT — BAND 8.0 / BAND 9.0!',
      rule3_btn: '💥 Study Hard (Build Pressure)',
      rule3_reset_btn: '🔄 Reset Simulator',

      video_watch_btn: '🎬 Watch Video',
      video_attach_btn: '📂 Attach .mp4',
      video_missing_msg:
        'Default video file (assets/video/ruleN.mp4) was not found on disk. Click below to attach any .mp4 video from your device for this session!',
      video_invalid_toast: '⚠️ Please choose a valid video file (.mp4, .webm, .mov).',
      video_loaded_toast: '🎬 Custom video attached and ready to play!',

      mixer_eyebrow: 'HEISENBERG CHEMICAL SYNTHESIZER // INTERACTIVE LAB',
      telemetry_target_label: '🎯 NEXT TARGET:',
      mixer_hint:
        'Click each glass flask below to pump pure IELTS reagents through the glass pipes into the central Band 9.0 Reactor!',
      mixer_btn_1: 'Reading 9.0 Flask',
      mixer_btn_2: 'Listening 8.5 Flask',
      mixer_btn_3: '3x Band 8.0 Flask',
      mixer_btn_all: 'Synthesize All (Band 9.0)',
      mixer_btn_reset: 'Reset Synthesizer',
      mixer_status_idle: 'Reagents active: 0 / 3 — Click flasks to start synthesis.',
      mixer_status_partial: 'Reagents active: {n} / 3 — Keep pumping into the reactor!',
      mixer_status_done: '⚡ SYNTHESIS COMPLETE (3/3): OVERALL BAND 9.0 FORMULA UNLOCKED!',

      evidence_eyebrow: 'VERIFIED LAB RECORDS // LASER AUTHENTICATION ACTIVE',
      evidence_desc:
        'Inspect Mr. Shakhzod Uralov\'s laser-scanned IELTS 8.0 credentials and the Albuquerque × Everest Samarqand visual archive. Click any image to open in full-screen Lightbox.',
      archive_eyebrow: 'ALBUQUERQUE × EVEREST SAMARQAND // VISUAL VAULT',

      chars_eyebrow: 'BREAKING BAD UNIVERSE // VIP BIRTHDAY DELEGATION',
      chars_desc:
        '14 iconic characters from Breaking Bad & Better Call Saul salute Mr. Shakhzod Uralov\'s 3x Band 8.0 mastery, echo his 3 Golden Rules, and wish him Overall Band 9.0!',
      chars_banner_caption:
        '🎩 THE ALBUQUERQUE DELEGATION — Gathered on November 12 to honor Mr. Shakhzod Uralov (3x Band 8.0 & Reading 9.0)',
      char_featured_badge: '👑 FEATURED LEGEND // LOS POLLOS STANDARD',
      char_read_more: 'Read more ▾',
      char_show_less: 'Show less ▴',
      respect_btn_label: 'Respect (+1)',
      tio_eyebrow: 'LA FAMILIA ES TODO // GOLDEN BELL TELEGRAPH',
      tio_title: '🛎️ Tio Hector Salamanca\'s Golden Bell',
      tio_desc:
        'Ring Tio Hector\'s golden bell! Every "DING!" lights up the next periodic letter in "HAPPY BIRTHDAY USTOZ SHAHZOD 9.0!"',
      tio_reset_btn: '🔄 Reset Bell',
      tio_complete_toast: '🛎️ DING! DING! DING! "HAPPY BIRTHDAY USTOZ SHAHZOD 9.0!" complete!',

      cakes_eyebrow: 'NOVEMBER 12 CEREMONY // MAKE A BAND 9.0 WISH',
      cakes_desc:
        'Blow into your microphone or press the "💨 Puf!" button to extinguish all 5 laboratory candles, launch fireworks, and play the Happy Birthday melody!',
      cakes_wish_accepted: '🎉 Wish Accepted! Happy 23rd Birthday & Onward to Overall Band 9.0, Mr. Shakhzod Uralov!',
      wind_panel_title: '💨 Live Wind & Candle Telemetry',
      wind_https_note:
        'Note: Microphone access requires HTTPS or localhost. On file:// or without a mic, use the instant "💨 Puf!" button below!',
      wind_power_label: '💨 Blow Power:',
      wind_status_ready: '5 / 5 Candles Burning — Make a wish and blow strongly!',
      wind_status_calibrating: '🎙️ Calibrating room ambient noise (1s)... Hold on!',
      wind_status_listening: '🎙️ Microphone ready! Blow strongly into the mic to blow out the candles...',
      wind_status_out: '🕯️ All 5 candles blown out! Happy 23rd Birthday, Mr. Shakhzod Uralov!',
      wind_status_mic_denied: 'ℹ️ Microphone unavailable or blocked — press "💨 Puf!" button to blow out the candles!',
      mic_enable_btn: '🎤 Enable Microphone',
      mic_active_btn: '🎙️ Mic Listening...',
      manual_blow_btn: '💨 Puf! (Blow Candles)',
      relight_btn: '🔥 Relight Candles',
      student_cakes_eyebrow: 'SWEET GRATITUDE // EVEREST SAMARQAND STUDENTS',
      student_cakes_title: '🎂 3 Custom Breaking Bad Cakes from Students',
      cake_wish_btn: '🕯️ Send Birthday Wish',
      cake_wish_toast: '🕯️ Birthday wish sent to Mr. Shakhzod Uralov!',

      aziz_eyebrow: 'DEVELOPER TRIBUTE & BAND 9.0 SIMULATION // @AZIZJONDEV',
      aziz_from_label: 'PERSONAL DEDICATION FROM @AZIZJONDEV',
      aziz_letter_title: 'To Mr. Shakhzod Uralov — Architect of Champions',
      aziz_p1:
        'Dear Mr. Shakhzod Uralov, happy birthday! Watching your work at Everest Samarqand is like witnessing pure chemistry in action. Achieving an official IELTS Overall Band 8.0 three separate times—crowned by a flawless Reading 9.0 and Listening 8.5—is not luck; it is the result of relentless discipline, crystal-clear methodology, and genuine care for every learner who walks into your classroom.',
      aziz_p2:
        'Thank you for giving us three timeless life lessons that reach far beyond exams. Whenever hesitation creeps in, your voice echoes: "Don\'t look for excuses — JUST DO IT!" Whenever someone searches for shortcuts, you remind us: "There is no secret ingredient — you simply have to sit down and study!" And when progress feels invisible, you keep us going: "You work, work, work — no result... and then suddenly — BOOM! — you see the breakthrough!"',
      aziz_p3:
        'On this special November 12 celebration, wishing you the happiest 23rd birthday (2003–2026) — may your health, family happiness, and energy shine brighter than ever. Our entire community looks forward to celebrating your next historic milestone: conquering the official Overall IELTS Band 9.0 (Listening 9.0, Reading 9.0, Writing 9.0, Speaking 9.0)! Happy 23rd Birthday, Teacher!',
      aziz_sig_respect: 'With deepest respect & gratitude,',
      aziz_tg_btn: 'Connect on Telegram (@azizjondev)',

      music_toggle_aria: 'Pause or resume background music',
      stickers_title: '⚗️ Heisenberg Band 9.0 Fortune Reactor',
      stickers_sub: 'Tap a lab capsule to trigger a reaction & reveal a fun Birthday Fortune:',
      sticker_default_tip: '🧪 Choose any reaction capsule above to brew a Birthday Fortune & Band 9.0 prediction for Mr. Shakhzod Uralov!',

      game_title: '🎯 MINI-GAME: COLLECT BAND 9.0 CRYSTALS',
      game_sub: 'Tap all 5 floating crystals to unlock the Band 9.0 Prediction Certificate!',
      crystal_default_rule: '💎 Tap any Band 9.0 crystal above to collect it and reveal Mr. Shakhzod Uralov\'s golden rule for that module!',
      cert_pred_disclaimer: '✨ JOYFUL BIRTHDAY WISH & PREDICTION (NOT AN OFFICIAL TEST DOCUMENT) ✨',
      cert_pred_title: '🏆 OFFICIAL BAND 9.0 PREDICTION CERTIFICATE',
      cert_pred_holder: 'PROUDLY PRESENTED TO: MR. SHAKHZOD URALOV',
      cert_pred_meta: 'Date: November 12 · Issued by: Everest Students & @azizjondev',
      game_replay_btn: '🔄 Play Again',

      replace_photo_aria: 'Replace this photo with an image from your device',
      photo_replaced_toast: '📷 Photo updated!',
      add_class_photo_btn: '+ Attach Classroom Photo',
      class_photo_added_toast: '📸 Classroom photo added to the archive!',
      channel_logo_title: 'Click to upload @azizjondev channel logo',
      channel_logo_updated_toast: '✨ @azizjondev channel logo updated!',

      terminal_run_btn: '▶ Run Code',
      pager_prev: '← Previous Page',
      pager_next: 'Next Page →',
      footer_text: 'Breaking Barriers — Birthday Gift Edition for Mr. Shakhzod Uralov (November 12)'
    },

    uz: {
      page_titles: {
        hero: 'Heisenberg Lab — Ustoz Shahzod Uralov | Breaking Barriers',
        evidence: 'Lazer Skanerli Sertifikatlar — Ustoz Shahzod Uralov | Breaking Barriers',
        characters: '14 Qahramon Tabrigi — Ustoz Shahzod Uralov | Breaking Barriers',
        cakes: 'Shamlar Tilagi va Tortlar — Ustoz Shahzod Uralov | Breaking Barriers',
        azizjon: '@azizjondev Band 9.0 Tabrigi — Ustoz Shahzod Uralov | Breaking Barriers'
      },
      intro_hud: '⚗️ MAXFIY HUJJAT // ALBUKERKE × EVEREST SAMARQAND LAB',
      intro_headline: 'USTOZ SHAHZOD URALOV UCHUN MAXFIY TUG\'ILGAN KUN HUJJATI',
      intro_age_pill: '🎂 2003-YIL · 23 YOSHINGIZ MUBORAK · 12-NOYABR',
      intro_theme_dark: 'Tungi Lab',
      intro_theme_light: 'Kunduzgi Lab',
      intro_open_aria: 'Ustoz Shahzod Uralov uchun maxfiy laboratoriya taklifnomasini ochish',
      intro_seal_text: 'OPEN LAB',
      intro_recipient: 'KIMGA: USTOZ SHAHZOD URALOV',
      intro_body:
        '23 yoshingiz muborak bo\'lsin va Breaking Barriers laboratoriyasiga xush kelibsiz! Sizning 3 karra IELTS Band 8.0 va Reading 9.0 formulangiz Everest Samarqanddagi yuzlab chempionlarga ilhom bag\'ishladi. Bugun sizning bilimingiz, 23 yoshlik shijoatingiz va navbatdagi Overall Band 9.0 cho\'qqisini bayram qilamiz!',
      intro_open_cta: 'MAXFIY MAKTUBNI OCHISH VA BAYRAMNI BOSHLASH',
      intro_enter_btn: 'Laboratoriyaga kirish',
      intro_hint: 'Muhrni sindirish va musiqani boshlash uchun Br·Ba tugmasini bosing',
      intro_skip: 'O\'tkazib yuborish →',

      nav_hero: 'Heisenberg Lab',
      nav_evidence: 'Dalillar 8.0',
      nav_characters: '14 Qahramon',
      nav_cakes: 'Shamlar va Tortlar',
      nav_azizjon: 'Band 9.0 Markazi',
      respect_total_title: 'Ustoz Shahzod Uralov uchun jami Ehtirom (Respect) ballari',
      theme_toggle_aria: 'Tungi yoki Kunduzgi mavzuni almashtirish',
      audio_toggle_aria: 'Ovoz effektlarini yoqish/o\'chirish',
      crop_btn_aria: 'Rasm kadrini moslash (tepa / markaz-tepa / markaz)',

      hero_chip_1: '🧪 3x BAND 8.0 & 99.1% SOF FORMULA',
      hero_chip_2: '💎 EVEREST SAMARQAND',
      hero_chip_3: '🎂 12-NOYABR · 23 YOSHINGIZ MUBORAK (2003)',
      hero_lead:
        'Everest Samarqandning ingliz tili va IELTS bo\'yicha bosh kimyogari — Ustoz Shahzod Uralovni 23 yoshingiz (2003–2026) va tug\'ilgan kuningiz bilan tabriklaymiz! Tinimsiz mehnatni 99.1% sof Band 8.0 va Reading 9.0 natijasiga aylantirgan ustozga cheksiz ehtirom!',
      metric_reading_label: 'Reading natijasi',
      metric_reading_sub: 'Maksimal mukammallik',
      metric_listening_label: 'Listening natijasi',
      metric_listening_sub: 'Kristall aniqlik',
      metric_master_label: '3x Master',
      metric_master_sub: '3 karra Overall 8.0',
      metric_empire_label: 'Everest Imperiyasi',
      metric_empire_sub: '99.1% Sof Bilim',
      hero_salute_btn: 'Bayram Salyutini Otish',
      hero_go_chars_btn: '14 Qahramon Tabrigi →',

      slideshow_badge: '📸 JONLI LAB EFIRI // 03 ARXIV',
      slide_prev_aria: 'Oldingi rasm',
      slide_next_aria: 'Keyingi rasm',

      rules_eyebrow: 'URALOV KODEKSI // IELTS MUVAFFAQIYATINING 3 OLTIN QOIDASI',
      rules_desc:
        'Everest Samarqandda yuqori ball olgan har bir shogird Ustoz Shahzod Uralovning ushbu 3 ta oltin qoidasini yoddan biladi. Quyidagi interaktiv modullarni ishga tushiring yoki .mp4 video biriktiring!',
      rule1_tag: 'PROTOKOL #01 // QUVVAT',
      rule1_title: '"JUST DO IT!"',
      rule1_quote: '"Bahona qidirma, ikkilanma — JUST DO IT!"',
      rule1_status_idle: 'Intizom reaktori: Kutish holatida (15%)',
      rule1_status_active: '⚡ 100% QUVVAT YOQILDI — BAHONA YO\'Q, JUST DO IT!',
      rule1_btn: '⚡ Quvvatni Yoqish',

      rule2_tag: 'PROTOKOL #02 // HAQIQAT',
      rule2_title: '"SIRLI MASALLIQ YO\'Q!"',
      rule2_quote: '"Hech qanday sirli masalliqning o\'zi yo\'q, shunchaki o\'tirib dars qilishing kerak!"',
      rule2_scroll_badge: '📜 MAXFIY OLTIN FORMULA OCHILDI:',
      rule2_formula: '0% Sehr + 100% O\'tirib Dars Qilish = 3x Band 8.0 & Band 9.0!',
      rule2_btn: '📜 Maxfiy O\'ramni Ochish',
      rule2_btn_close: '📜 Maxfiy O\'ramni Yopish',

      rule3_tag: 'PROTOKOL #03 // KRITIK MASSA',
      rule3_title: '"QILASAN, QILASAN... KEYIN BIRDAN — BUM!"',
      rule3_quote:
        '"Qilasan, qilasan, qilasan — natija yo\'q. Qilasan, qilasan — natija yo\'q. Keyin birdan — BUM! — natijani ko\'rasan!"',
      rule3_pressure_label: 'Portlash bosimi:',
      rule3_status_0: 'Bosimni 100% ga yetkazish uchun tugmani 5 marta bosing!',
      rule3_status_building: 'Hali natija yo\'q... To\'xtama!',
      rule3_status_boom: '💥 BUM! NATIJANI KO\'RASAN — BAND 8.0 / BAND 9.0!',
      rule3_btn: '💥 Dars Qilish (Bosimni Oshirish)',
      rule3_reset_btn: '🔄 Qayta boshlash',

      video_watch_btn: '🎬 Videoni Ko\'rish',
      video_attach_btn: '📂 .mp4 Biriktirish',
      video_missing_msg:
        'Standart video fayli (assets/video/ruleN.mp4) topilmadi. Quyidagi tugma orqali qurilmangizdan istalgan .mp4 videoni biriktirib tomosha qilishingiz mumkin!',
      video_invalid_toast: '⚠️ Iltimos, to\'g\'ri video fayl tanlang (.mp4, .webm, .mov).',
      video_loaded_toast: '🎬 Video muvaffaqiyatli biriktirildi!',

      mixer_eyebrow: 'HEISENBERG KIMYOVIY SINTEZATORI // INTERAKTIV LAB',
      telemetry_target_label: '🎯 KEYINGI NISHON:',
      mixer_hint:
        'Shisha kolbalar ustiga bosib, sof IELTS reagentlarini quvurlar orqali markaziy Band 9.0 reaktoriga quying!',
      mixer_btn_1: 'Reading 9.0 Kolbasi',
      mixer_btn_2: 'Listening 8.5 Kolbasi',
      mixer_btn_3: '3x Band 8.0 Kolbasi',
      mixer_btn_all: 'Hammasini Sintez Qilish (Band 9.0)',
      mixer_btn_reset: 'Sintezatorni Tozalash',
      mixer_status_idle: 'Faol kolbalar: 0 / 3 — Sintezni boshlash uchun kolbalarga bosing.',
      mixer_status_partial: 'Faol kolbalar: {n} / 3 — Reaktorga quyishda davom eting!',
      mixer_status_done: '⚡ SINTEZ YAKUNLANDI (3/3): OVERALL BAND 9.0 FORMULASI TAYYOR!',

      evidence_eyebrow: 'TASDIQLANGAN LAB HUJJATLARI // LAZER SKANER FAOL',
      evidence_desc:
        'Ustoz Shahzod Uralovning lazer skanerli IELTS 8.0 sertifikatlari hamda Albukerke × Everest Samarqand sahna arxivini ko\'zdan kechiring. Kattalashtirish uchun rasm ustiga bosing.',
      archive_eyebrow: 'ALBUKERKE × EVEREST SAMARQAND // SAHNA ARXIVI',

      chars_eyebrow: 'BREAKING BAD OLAMI // VIP TUG\'ILGAN KUN DELEGATSIYASI',
      chars_desc:
        'Breaking Bad va Better Call Saul olamining 14 afsonaviy qahramoni Ustoz Shahzod Uralovning 3x Band 8.0 natijasini olqishlab, 3 ta oltin qoidasini eslab, Overall Band 9.0 tilaydilar!',
      chars_banner_caption:
        '🎩 ALBUKERKE DELEGATSIYASI — 12-noyabr kuni Ustoz Shahzod Uralovni (3x Band 8.0 va Reading 9.0) qutlash uchun jam bo\'ldi',
      char_featured_badge: '👑 ENG ZO\'RI // LOS POLLOS STANDARTI',
      char_read_more: 'To\'liq o\'qish ▾',
      char_show_less: 'Yopish ▴',
      respect_btn_label: 'Ehtirom (+1)',
      tio_eyebrow: 'LA FAMILIA ES TODO // OLTIN QO\'NG\'IROQ TELEGRAFI',
      tio_title: '🛎️ Tio Gektor Salamankaning Oltin Qo\'ng\'irog\'i',
      tio_desc:
        'Tio Gektorning oltin qo\'ng\'irog\'ini chaling! Har bir "DING!" bosilganda "HAPPY BIRTHDAY USTOZ SHAHZOD 9.0!" yozuvining navbatdagi harfi yonadi!',
      tio_reset_btn: '🔄 Qayta boshlash',
      tio_complete_toast: '🛎️ DING! DING! DING! "HAPPY BIRTHDAY USTOZ SHAHZOD 9.0!" yozuvi to\'liq yondi!',

      cakes_eyebrow: '12-NOYABR MAROSIMI // BAND 9.0 TILAGINI BILDIRING',
      cakes_desc:
        '5 ta laboratoriya shamini o\'chirish, mushakbozlik va tug\'ilgan kun kuyini tinglash uchun mikrofonga puflang yoki "💨 Puf!" tugmasini bosing!',
      cakes_wish_accepted: '🎉 Tilak qabul qilindi! 23 yoshingiz muborak, Overall Band 9.0 sari olg\'a, Ustoz Shahzod Uralov!',
      wind_panel_title: '💨 Jonli Mikrofon Shamol O\'lchagichi',
      wind_https_note:
        'Izoh: Mikrofon ishlashi uchun HTTPS yoki localhost kerak (file:// da ishlamasligi mumkin). Istalgan vaqtda "💨 Puf! (tugma)" zaxira tugmasini bosishingiz mumkin!',
      wind_power_label: '💨 Puflash kuchi:',
      wind_status_ready: '5 / 5 sham yonmoqda — tilak o\'ylab qattiqroq puflang!',
      wind_status_calibrating: '🎙️ Xona shovqini o\'lchanmoqda (1s)... Biroz kuting!',
      wind_status_listening: '🎙️ Mikrofon tayyor! Shamlarni o\'chirish uchun mikrofonga qattiqroq puflang...',
      wind_status_out: '🕯️ Barcha 5 ta sham o\'chdi! 23 yoshingiz muborak, Ustoz Shahzod Uralov!',
      wind_status_mic_denied: 'ℹ️ Mikrofon ruxsati berilmadi yoki topilmadi — "💨 Puf! (tugma)" orqali shamlarni o\'chiring!',
      mic_enable_btn: '🎤 Mikrofonni yoqish',
      mic_active_btn: '🎙️ Mikrofon eshitmoqda...',
      manual_blow_btn: '💨 Puf! (tugma)',
      relight_btn: '🔥 Qayta yoqish',
      student_cakes_eyebrow: 'SHIRIN EHTIROM // EVEREST SAMARQAND SHOGIRDLARI',
      student_cakes_title: '🎂 Everest Shogirdlari Nomidan 3 ta Maxsus Tort',
      cake_wish_btn: '🕯️ Tilak bildirish',
      cake_wish_toast: '🕯️ Ustoz Shahzod Uralovga samimiy tilak yuborildi!',

      aziz_eyebrow: 'MUALLIF TABRIGI VA BAND 9.0 SIMULYATORI // @AZIZJONDEV',
      aziz_from_label: '@AZIZJONDEV TOMONIDAN MAXSUS TABRIK',
      aziz_letter_title: 'Ustoz Shahzod Uralovga — Chempionlar Me\'moriga Ehtirom',
      aziz_p1:
        'Qadrli Ustoz Shahzod Uralov, tug\'ilgan kuningiz muborak bo\'lsin! Everest Samarqand markazidagi faoliyatingizni kuzatish — haqiqiy ilm kimyosiga guvoh bo\'lish demakdir. Rasmiy IELTS imtihonida uch karra Overall Band 8.0 natijasini qayd etish, ayniqsa Reading 9.0 va Listening 8.5 cho\'qqilarini zabt etish tasodif emas — bu tinimsiz mehnat, temir intizom va har bir shogirdga berilgan chin yurakdan e\'tibor mevasidir.',
      aziz_p2:
        'Bizga faqat imtihon uchungina emas, balki butun hayot uchun dasturilamal bo\'ladigan 3 ta oltin o\'gitni o\'rgatganingiz uchun chuqur minnatdorchilik bildiramiz. Ikkilangan paytimizda: "Bahona qidirma — JUST DO IT!" degan so\'zingiz kuch beradi. Oson yo\'l izlaganlarga: "Hech qanday sirli masalliqning o\'zi yo\'q, shunchaki o\'tirib dars qilishing kerak!" deb haqiqatni ko\'rsatasiz. Natija ko\'rinmay charchaganda esa: "Qilasan, qilasan, qilasan — natija yo\'q... keyin birdan — BUM! — natijani ko\'rasan!" deya ruhlantirasiz.',
      aziz_p3:
        '12-noyabr — quvonchli ayyomingizda 23 yoshingiz muborak bo\'lsin (2003–2026)! Sizga mustahkam sog\'lik, oilaviy baxt va so\'nmas shijoat tilaymiz. Barcha shogirdlaringiz va yaqinlaringiz bilan birgalikda sizning navbatdagi tarixiy g\'alabangizni — rasmiy Overall IELTS Band 9.0 (Listening 9.0, Reading 9.0, Writing 9.0, Speaking 9.0) natijasini tantana qilish nasib etsin! Tug\'ilgan kuningiz bilan, Ustoz!',
      aziz_sig_respect: 'Chuqur hurmat va minnatdorchilik bilan,',
      aziz_tg_btn: 'Telegram orqali bog\'lanish (@azizjondev)',

      music_toggle_aria: 'Orqa fon musiqasini pauza qilish yoki davom ettirish',
      stickers_title: '⚗️ Heisenberg Band 9.0 Omad Reaktori',
      stickers_sub: 'Qiziqarli laboratoriya reaksiyasi va tug\'ilgan kun bashoratini ochish uchun kapsulani bosing:',
      sticker_default_tip: '🧪 Ustoz Shahzod Uralov uchun maxsus Tug\'ilgan Kun Omadi va Band 9.0 reaksiyasini ishga tushiring!',

      game_title: '🎯 MINI-O\'YIN: BAND 9.0 KRISTALLARINI YIG\'ISH',
      game_sub: 'Band 9.0 Prediction sertifikatini ochish uchun suzib yurgan 5 ta kristallni bosing!',
      crystal_default_rule: '💎 Ustoz Shahzod Uralovning har bir bo\'lim bo\'yicha oltin qoidasini ko\'rish va yig\'ish uchun yuqoridagi kristallardan biriga bosing!',
      cert_pred_disclaimer: '✨ QUVNOQ TUG\'ILGAN KUN TILAGI VA BASHORATI (RASMIY IELTS HUJJATI EMAS) ✨',
      cert_pred_title: '🏆 OFFICIAL BAND 9.0 PREDICTION CERTIFICATE',
      cert_pred_holder: 'SOHIBI: USTOZ SHAHZOD URALOV',
      cert_pred_meta: 'Sana: 12-noyabr · Taqdim etdi: Everest shogirdlari va @azizjondev',
      game_replay_btn: '🔄 Qayta o\'ynash',

      replace_photo_aria: 'Ushbu rasmni qurilmangizdagi boshqa rasmga almashtirish',
      photo_replaced_toast: '📷 Rasm muvaffaqiyatli almashtirildi!',
      add_class_photo_btn: '+ Dars jarayoni rasmini qo\'shish',
      class_photo_added_toast: '📸 Dars jarayoni rasmi arxivga qo\'shildi!',
      channel_logo_title: '@azizjondev kanal logotipini yuklash uchun bosing',
      channel_logo_updated_toast: '✨ @azizjondev kanal logotipi o\'rnatildi!',

      terminal_run_btn: '▶ Run Code',
      pager_prev: '← Oldingi sahifa',
      pager_next: 'Keyingi sahifa →',
      footer_text: 'Breaking Barriers — Ustoz Shahzod Uralovning 12-noyabr tug\'ilgan kuniga maxsus sovg\'a'
    }
  };

  /* ------------------------------------------------------------------------
     3. LANGUAGE, THEME & TOAST CONTROLLERS
     ------------------------------------------------------------------------ */
  let currentLang = SafeStorage.get(STORAGE_KEYS.lang, 'en');
  if (currentLang !== 'en' && currentLang !== 'uz') {
    currentLang = 'en';
  }

  function t(key) {
    const dict = I18N[currentLang] || I18N.en;
    return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : (I18N.en[key] || key);
  }

  function teacherName() {
    return TEACHER_NAME[currentLang] || TEACHER_NAME.en;
  }

  const Toast = {
    show(message) {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const item = document.createElement('div');
      item.className = 'toast-item';
      item.textContent = message;
      container.appendChild(item);
      while (container.children.length > 4) {
        container.removeChild(container.firstElementChild);
      }
      setTimeout(function () {
        if (item.parentNode) item.parentNode.removeChild(item);
      }, 3200);
    }
  };

  const Theme = {
    current: SafeStorage.get(STORAGE_KEYS.theme, 'dark') === 'light' ? 'light' : 'dark',
    init() {
      this.apply(this.current);
      const btn = document.getElementById('theme-toggle-btn');
      if (btn) {
        btn.addEventListener('click', function () {
          AudioEngine.playTick();
          Theme.toggle();
        });
      }
    },
    toggle() {
      this.apply(this.current === 'dark' ? 'light' : 'dark');
    },
    apply(mode) {
      this.current = mode === 'light' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', this.current);
      SafeStorage.set(STORAGE_KEYS.theme, this.current);
      const isLight = this.current === 'light';
      const icon = document.getElementById('theme-icon');
      if (icon) {
        icon.textContent = isLight ? '☀️' : '🌙';
      }
      const introIcon = document.getElementById('intro-theme-icon');
      if (introIcon) {
        introIcon.textContent = isLight ? '☀️' : '🌙';
      }
      const introLabel = document.getElementById('intro-theme-label');
      if (introLabel) {
        introLabel.textContent = t(isLight ? 'intro_theme_light' : 'intro_theme_dark');
      }
      const meta = document.getElementById('meta-theme-color');
      if (meta) {
        meta.setAttribute('content', isLight ? '#f8fafc' : '#060b11');
      }
    }
  };

  /* ------------------------------------------------------------------------
     4. WEB AUDIO API SYNTHESIZER ENGINE + REAL SOUNDTRACK PLAYER
     ------------------------------------------------------------------------ */
  const AudioEngine = (function () {
    let ctx = null;
    let masterGain = null;
    let noiseBuffer = null;
    let isMuted = SafeStorage.get(STORAGE_KEYS.muted, 'false') === 'true';
    let birthdayTimers = [];
    let themeTrack = null;
    let birthdayTrack = null;
    let activeTrackName = null;
    let isMusicPaused = false;
    let pausedByVideo = false;

    function getThemeTrack() {
      if (!themeTrack && typeof Audio === 'function') {
        themeTrack = new Audio(ASSETS.audio.theme);
        themeTrack.loop = true;
        themeTrack.volume = 0.42;
        themeTrack.preload = 'auto';
      }
      return themeTrack;
    }

    function getBirthdayTrack() {
      if (!birthdayTrack && typeof Audio === 'function') {
        birthdayTrack = new Audio(ASSETS.audio.birthday);
        birthdayTrack.loop = false;
        birthdayTrack.volume = 0.72;
        birthdayTrack.preload = 'auto';
        birthdayTrack.addEventListener('ended', function () {
          if (activeTrackName === 'birthday') {
            activeTrackName = null;
            updateMusicUI();
          }
        });
      }
      return birthdayTrack;
    }

    function isAnyMusicPlaying() {
      if (isMuted || isMusicPaused || pausedByVideo) return false;
      if (activeTrackName === 'theme' && themeTrack && !themeTrack.paused) return true;
      if (activeTrackName === 'birthday' && birthdayTrack && !birthdayTrack.paused && !birthdayTrack.ended) return true;
      return false;
    }

    function updateMusicUI() {
      const btn = document.getElementById('music-toggle-btn');
      const stateEl = document.getElementById('music-state-text');
      const playing = isAnyMusicPlaying();
      if (stateEl) {
        stateEl.textContent = playing ? '⏸' : '▶';
      }
      if (btn) {
        btn.classList.toggle('is-paused', !playing);
      }
    }

    function ensureContext() {
      if (isMuted) return null;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!ctx) {
        try {
          ctx = new AudioCtx();
          masterGain = ctx.createGain();
          masterGain.gain.value = isMuted ? 0 : 0.34;
          masterGain.connect(ctx.destination);

          /* Create reusable 1.2s white-noise buffer for explosions/hiss */
          const sampleRate = ctx.sampleRate;
          noiseBuffer = ctx.createBuffer(1, Math.floor(sampleRate * 1.2), sampleRate);
          const data = noiseBuffer.getChannelData(0);
          for (let i = 0; i < data.length; i += 1) {
            data[i] = Math.random() * 2 - 1;
          }
        } catch (e) {
          return null;
        }
      }
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(function () {});
      }
      return ctx;
    }

    function updateMuteUI() {
      const icon = document.getElementById('audio-icon');
      if (icon) {
        icon.textContent = isMuted ? '🔇' : '🔊';
      }
      if (masterGain && ctx) {
        masterGain.gain.setValueAtTime(isMuted ? 0 : 0.34, ctx.currentTime);
      }
      if (themeTrack) {
        themeTrack.muted = isMuted;
        if (isMuted || isMusicPaused || pausedByVideo) {
          try { themeTrack.pause(); } catch (e) {}
        } else if (activeTrackName === 'theme') {
          themeTrack.play().catch(function () {});
        }
      }
      if (birthdayTrack) {
        birthdayTrack.muted = isMuted;
        if (isMuted || isMusicPaused || pausedByVideo) {
          try { birthdayTrack.pause(); } catch (e) {}
        } else if (activeTrackName === 'birthday' && !birthdayTrack.ended) {
          birthdayTrack.play().catch(function () {});
        }
      }
      updateMusicUI();
    }

    function playNote(freq, startTime, duration, type, peakGain) {
      const ac = ensureContext();
      if (!ac || !masterGain) return;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type || 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(peakGain || 0.22, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.03);
    }

    function playSynthBirthday() {
      const ac = ensureContext();
      if (!ac || !masterGain) return;
      birthdayTimers.forEach(clearTimeout);
      birthdayTimers = [];

      const now = ac.currentTime + 0.05;
      const beat = 0.52;
      const melody = [
        { f: 261.63, b: 0.0, d: 0.35, c: 130.81 },
        { f: 261.63, b: 0.4, d: 0.25 },
        { f: 293.66, b: 0.7, d: 0.55, c: 196.00 },
        { f: 261.63, b: 1.3, d: 0.55 },
        { f: 349.23, b: 1.9, d: 0.55, c: 174.61 },
        { f: 329.63, b: 2.5, d: 1.00, c: 130.81 },
        { f: 261.63, b: 3.6, d: 0.35 },
        { f: 261.63, b: 4.0, d: 0.25 },
        { f: 293.66, b: 4.3, d: 0.55, c: 196.00 },
        { f: 261.63, b: 4.9, d: 0.55 },
        { f: 392.00, b: 5.5, d: 0.55, c: 196.00 },
        { f: 349.23, b: 6.1, d: 1.00, c: 174.61 },
        { f: 261.63, b: 7.2, d: 0.35 },
        { f: 261.63, b: 7.6, d: 0.25 },
        { f: 523.25, b: 7.9, d: 0.55, c: 130.81 },
        { f: 440.00, b: 8.5, d: 0.55 },
        { f: 349.23, b: 9.1, d: 0.55, c: 174.61 },
        { f: 329.63, b: 9.7, d: 0.55 },
        { f: 293.66, b: 10.3, d: 0.95, c: 196.00 },
        { f: 466.16, b: 11.4, d: 0.35, c: 233.08 },
        { f: 466.16, b: 11.8, d: 0.25 },
        { f: 440.00, b: 12.1, d: 0.55, c: 174.61 },
        { f: 349.23, b: 12.7, d: 0.55 },
        { f: 392.00, b: 13.3, d: 0.55, c: 196.00 },
        { f: 349.23, b: 13.9, d: 1.25, c: 174.61 }
      ];

      melody.forEach(function (n) {
        const start = now + n.b * beat;
        const dur = n.d * beat;
        playNote(n.f, start, dur, 'triangle', 0.22);
        if (n.c) {
          playNote(n.c, start, dur * 1.4, 'sine', 0.12);
          playNote(n.c * 1.5, start, dur * 1.4, 'sine', 0.08);
        }
      });
    }

    return {
      init() {
        updateMuteUI();
        const btn = document.getElementById('audio-toggle-btn');
        if (btn) {
          btn.addEventListener('click', function () {
            isMuted = !isMuted;
            SafeStorage.set(STORAGE_KEYS.muted, isMuted ? 'true' : 'false');
            updateMuteUI();
            if (!isMuted) {
              ensureContext();
              AudioEngine.playTick();
            }
          });
        }

        const musicBtn = document.getElementById('music-toggle-btn');
        if (musicBtn) {
          musicBtn.addEventListener('click', function () {
            AudioEngine.toggleMusic();
          });
        }

        /* Auto-start soundtrack on entry; if browser blocks initial autoplay, start synchronously on first user interaction */
        if (!isMuted) {
          this.playThemeSoundtrack();
        }
        const startOnFirstGesture = function (ev) {
          if (ev && ev.target && ev.target.closest && ev.target.closest('#music-toggle-btn, #audio-toggle-btn')) {
            return;
          }
          if (isMuted || isMusicPaused || pausedByVideo) return;
          if (!activeTrackName) activeTrackName = 'theme';
          if (activeTrackName === 'theme') {
            const tr = getThemeTrack();
            if (tr && tr.paused) {
              AudioEngine.playThemeSoundtrack();
            }
          }
          document.removeEventListener('pointerdown', startOnFirstGesture, true);
          document.removeEventListener('keydown', startOnFirstGesture, true);
        };
        document.addEventListener('pointerdown', startOnFirstGesture, { capture: true, passive: true });
        document.addEventListener('keydown', startOnFirstGesture, { capture: true, passive: true });
      },

      unlock() {
        ensureContext();
      },

      toggleMusic() {
        if (!activeTrackName) {
          activeTrackName = 'theme';
        }
        if (isMuted) {
          isMuted = false;
          SafeStorage.set(STORAGE_KEYS.muted, 'false');
          isMusicPaused = false;
        } else {
          isMusicPaused = !isMusicPaused;
        }
        pausedByVideo = false;
        const targetTrack = activeTrackName === 'birthday' ? getBirthdayTrack() : getThemeTrack();
        if (targetTrack && !isMusicPaused) {
          targetTrack.muted = false;
          targetTrack.play().then(updateMusicUI).catch(updateMusicUI);
        } else {
          if (themeTrack) { try { themeTrack.pause(); } catch (e) {} }
          if (birthdayTrack) { try { birthdayTrack.pause(); } catch (e) {} }
          updateMusicUI();
        }
        if (!isMuted) {
          ensureContext();
          AudioEngine.playTick();
        }
      },

      pauseForVideo() {
        pausedByVideo = true;
        if (themeTrack) { try { themeTrack.pause(); } catch (e) {} }
        if (birthdayTrack) { try { birthdayTrack.pause(); } catch (e) {} }
        updateMusicUI();
      },

      resumeAfterVideo() {
        pausedByVideo = false;
        if (isMuted || isMusicPaused || !activeTrackName) {
          updateMusicUI();
          return;
        }
        const targetTrack = activeTrackName === 'birthday' ? getBirthdayTrack() : getThemeTrack();
        if (targetTrack && !(activeTrackName === 'birthday' && targetTrack.ended)) {
          targetTrack.muted = false;
          targetTrack.play().then(updateMusicUI).catch(updateMusicUI);
        } else {
          updateMusicUI();
        }
      },

      stopMusic() {
        activeTrackName = null;
        isMusicPaused = false;
        pausedByVideo = false;
        birthdayTimers.forEach(clearTimeout);
        birthdayTimers = [];
        if (themeTrack) {
          try { themeTrack.pause(); themeTrack.currentTime = 0; } catch (e) {}
        }
        if (birthdayTrack) {
          try { birthdayTrack.pause(); birthdayTrack.currentTime = 0; } catch (e) {}
        }
        updateMusicUI();
      },

      /* Play real Breaking Bad theme soundtrack (falls back to riff on error) */
      playThemeSoundtrack() {
        activeTrackName = 'theme';
        isMusicPaused = false;
        pausedByVideo = false;
        if (isMuted) {
          updateMusicUI();
          return;
        }
        const bday = getBirthdayTrack();
        if (bday) {
          try { bday.pause(); bday.currentTime = 0; } catch (e) {}
        }
        const track = getThemeTrack();
        if (!track) {
          this.playIntroRiff();
          updateMusicUI();
          return;
        }
        track.muted = false;
        track.volume = 0.42;
        if (track.paused) {
          track.play().then(updateMusicUI).catch(function () {
            AudioEngine.playIntroRiff();
            updateMusicUI();
          });
        } else {
          updateMusicUI();
        }
      },

      /* 1. Original desert minor guitar/bass riff inspired by Breaking Bad atmosphere */
      playIntroRiff() {
        const ac = ensureContext();
        if (!ac || !masterGain) return;
        const now = ac.currentTime;
        const notes = [
          { f: 146.83, t: 0.0, d: 0.55 },  /* D3 */
          { f: 174.61, t: 0.42, d: 0.45 }, /* F3 */
          { f: 196.00, t: 0.78, d: 0.55 }, /* G3 */
          { f: 207.65, t: 1.18, d: 0.65 }, /* Ab3 */
          { f: 196.00, t: 1.65, d: 0.50 }, /* G3 */
          { f: 174.61, t: 2.05, d: 0.50 }, /* F3 */
          { f: 146.83, t: 2.45, d: 1.25 }  /* D3 sustain */
        ];

        const delay = ac.createDelay();
        const feedback = ac.createGain();
        const filter = ac.createBiquadFilter();
        delay.delayTime.value = 0.24;
        feedback.gain.value = 0.28;
        filter.type = 'lowpass';
        filter.frequency.value = 1350;

        filter.connect(masterGain);
        filter.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(masterGain);

        notes.forEach(function (n) {
          const osc = ac.createOscillator();
          const sub = ac.createOscillator();
          const g = ac.createGain();
          osc.type = 'sawtooth';
          sub.type = 'triangle';
          osc.frequency.setValueAtTime(n.f, now + n.t);
          sub.frequency.setValueAtTime(n.f * 0.5, now + n.t);

          g.gain.setValueAtTime(0.001, now + n.t);
          g.gain.linearRampToValueAtTime(0.24, now + n.t + 0.025);
          g.gain.exponentialRampToValueAtTime(0.0008, now + n.t + n.d);

          osc.connect(g);
          sub.connect(g);
          g.connect(filter);

          osc.start(now + n.t);
          sub.start(now + n.t);
          osc.stop(now + n.t + n.d + 0.05);
          sub.stop(now + n.t + n.d + 0.05);
        });
      },

      /* 2. Seal break, UI tick, Page hologram whoosh */
      playSealBreak() {
        const ac = ensureContext();
        if (!ac || !masterGain) return;
        const now = ac.currentTime;
        playNote(260, now, 0.14, 'sawtooth', 0.22);
        playNote(520, now + 0.06, 0.22, 'triangle', 0.25);
      },

      playTick() {
        const ac = ensureContext();
        if (!ac || !masterGain) return;
        playNote(880, ac.currentTime, 0.045, 'sine', 0.12);
      },

      playWhoosh() {
        const ac = ensureContext();
        if (!ac || !masterGain || !noiseBuffer) return;
        const now = ac.currentTime;
        const src = ac.createBufferSource();
        src.buffer = noiseBuffer;
        const filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(280, now);
        filter.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
        filter.frequency.exponentialRampToValueAtTime(220, now + 0.36);

        const g = ac.createGain();
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.18, now + 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        src.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        src.start(now);
        src.stop(now + 0.4);
      },

      /* 3. Rocket launch hiss & firework burst */
      playRocketLaunch() {
        const ac = ensureContext();
        if (!ac || !masterGain || !noiseBuffer) return;
        const now = ac.currentTime;
        const src = ac.createBufferSource();
        src.buffer = noiseBuffer;
        const filter = ac.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(900, now);

        const g = ac.createGain();
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.09, now + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        src.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        src.start(now);
        src.stop(now + 0.34);
      },

      playExplosion() {
        const ac = ensureContext();
        if (!ac || !masterGain || !noiseBuffer) return;
        const now = ac.currentTime;
        const src = ac.createBufferSource();
        src.buffer = noiseBuffer;
        const filter = ac.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, now);
        filter.frequency.exponentialRampToValueAtTime(140, now + 0.45);

        const g = ac.createGain();
        g.gain.setValueAtTime(0.24, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

        src.connect(filter);
        filter.connect(g);
        g.connect(masterGain);
        src.start(now);
        src.stop(now + 0.5);
      },

      /* 4. Tio Hector's Bell ("DING!" — multi-harmonic metallic bell) */
      playBellDing() {
        const ac = ensureContext();
        if (!ac || !masterGain) return;
        const now = ac.currentTime;
        const baseFreq = 1046.5; /* C6 */
        const ratios = [1, 2.0, 2.76, 4.07, 5.4];
        const gains = [0.28, 0.16, 0.11, 0.07, 0.04];
        const decays = [1.45, 1.1, 0.85, 0.55, 0.35];

        ratios.forEach(function (r, idx) {
          const osc = ac.createOscillator();
          const g = ac.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq * r, now);
          g.gain.setValueAtTime(0.001, now);
          g.gain.linearRampToValueAtTime(gains[idx], now + 0.008);
          g.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now);
          osc.stop(now + decays[idx] + 0.04);
        });
      },

      /* 5. Rule 3 BUM! Critical Explosion */
      playBoom() {
        const ac = ensureContext();
        if (!ac || !masterGain) return;
        const now = ac.currentTime;

        /* Deep sub-bass drop */
        const sub = ac.createOscillator();
        const subGain = ac.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(135, now);
        sub.frequency.exponentialRampToValueAtTime(28, now + 0.75);
        subGain.gain.setValueAtTime(0.45, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        sub.connect(subGain);
        subGain.connect(masterGain);
        sub.start(now);
        sub.stop(now + 0.85);

        /* Shockwave noise */
        if (noiseBuffer) {
          const src = ac.createBufferSource();
          src.buffer = noiseBuffer;
          const filter = ac.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1600, now);
          filter.frequency.exponentialRampToValueAtTime(90, now + 0.85);
          const g = ac.createGain();
          g.gain.setValueAtTime(0.38, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
          src.connect(filter);
          filter.connect(g);
          g.connect(masterGain);
          src.start(now);
          src.stop(now + 0.95);
        }
      },

      /* 6. Crystal Chime & Victory Fanfare */
      playChime(stepIndex) {
        const ac = ensureContext();
        if (!ac || !masterGain) return;
        const scale = [523.25, 587.33, 659.25, 783.99, 1046.5];
        const freq = scale[(stepIndex || 0) % scale.length];
        const now = ac.currentTime;
        playNote(freq, now, 0.32, 'triangle', 0.22);
        playNote(freq * 1.5, now + 0.06, 0.38, 'sine', 0.14);
      },

      playFanfare() {
        const ac = ensureContext();
        if (!ac || !masterGain) return;
        const now = ac.currentTime;
        const seq = [
          { f: 523.25, t: 0.0, d: 0.18 },
          { f: 659.25, t: 0.16, d: 0.18 },
          { f: 783.99, t: 0.32, d: 0.18 },
          { f: 1046.50, t: 0.50, d: 0.65 }
        ];
        seq.forEach(function (n) {
          playNote(n.f, now + n.t, n.d, 'triangle', 0.24);
          playNote(n.f * 0.5, now + n.t, n.d, 'sine', 0.15);
        });
      },

      /* 7. Play real Happy Birthday song after blowing out candles (synth fallback) */
      playHappyBirthday() {
        activeTrackName = 'birthday';
        isMusicPaused = false;
        pausedByVideo = false;
        if (themeTrack) {
          try { themeTrack.pause(); } catch (e) {}
        }
        if (isMuted) {
          updateMusicUI();
          return;
        }
        const bday = getBirthdayTrack();
        if (!bday) {
          playSynthBirthday();
          updateMusicUI();
          return;
        }
        bday.muted = false;
        try { bday.currentTime = 0; } catch (e) {}
        bday.play().then(updateMusicUI).catch(function () {
          playSynthBirthday();
          updateMusicUI();
        });
      }
    };
  })();

  /* ------------------------------------------------------------------------
     5. FIREWORKS PARTICLE ENGINE (#fx-canvas)
        - High-FPS additive blending (ctx.globalCompositeOperation = 'lighter')
        - const MAX_SPARKS = 280
        - Real rockets rising with gravity & trails
        - Stops rAF loop when idle or document.hidden
     ------------------------------------------------------------------------ */
  const Fireworks = (function () {
    const MAX_SPARKS = 280;
    const COLORS = ['#4aff83', '#00d2ff', '#f5c518', '#ff6b6b', '#a8ff78', '#ffffff'];
    let canvas = null;
    let ctx = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = null;

    const rockets = [];
    const sparks = [];
    const sparkPool = [];
    const finaleTimers = [];

    function getSpark() {
      return sparkPool.length > 0 ? sparkPool.pop() : {};
    }

    function releaseSpark(s) {
      if (sparkPool.length < MAX_SPARKS) {
        sparkPool.push(s);
      }
    }

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    function addSpark(x, y, vx, vy, color, radius, decay) {
      if (sparks.length >= MAX_SPARKS) {
        const oldest = sparks.shift();
        if (oldest) releaseSpark(oldest);
      }
      const s = getSpark();
      s.x = x;
      s.y = y;
      s.vx = vx;
      s.vy = vy;
      s.color = color;
      s.radius = radius || 2.4;
      s.alpha = 1;
      s.decay = decay || (0.014 + Math.random() * 0.014);
      sparks.push(s);
    }

    function explodeRocket(r) {
      AudioEngine.playExplosion();
      const reduced = prefersReducedMotion();
      const count = reduced ? 24 : 52;
      const pattern = r.pattern || 'radial';

      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count;
        let speed = 2.2 + Math.random() * 4.2;
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;

        if (pattern === 'ring') {
          speed = 4.2;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
        } else if (pattern === 'heart') {
          const hx = 16 * Math.pow(Math.sin(angle), 3);
          const hy = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
          vx = hx * 0.22;
          vy = hy * 0.22;
        }

        const color = i % 3 === 0 ? '#f5c518' : r.color;
        addSpark(r.x, r.y, vx, vy, color, 2.2 + Math.random() * 1.4, 0.013 + Math.random() * 0.012);
      }
    }

    function tick() {
      if (document.hidden || !ctx) {
        rafId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      /* Update rockets */
      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.14; /* Gravity */

        /* Rocket rising trail spark */
        addSpark(
          r.x + (Math.random() - 0.5) * 2,
          r.y + 4,
          (Math.random() - 0.5) * 0.6,
          0.8 + Math.random() * 0.8,
          '#f5c518',
          1.6,
          0.045
        );

        /* Draw rocket head */
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3.2, 0, Math.PI * 2);
        ctx.fill();

        if (r.vy >= -1.2 || r.y <= r.targetY) {
          explodeRocket(r);
          rockets.splice(i, 1);
        }
      }

      /* Update sparks */
      for (let j = sparks.length - 1; j >= 0; j -= 1) {
        const s = sparks[j];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.975;
        s.vy = s.vy * 0.975 + 0.065; /* Gravity */
        s.alpha -= s.decay;

        if (s.alpha <= 0.02) {
          sparks.splice(j, 1);
          releaseSpark(s);
          continue;
        }

        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (rockets.length > 0 || sparks.length > 0) {
        rafId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
        rafId = null;
      }
    }

    function startLoop() {
      if (!rafId && !document.hidden) {
        rafId = requestAnimationFrame(tick);
      }
    }

    return {
      init() {
        canvas = document.getElementById('fx-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize, { passive: true });
        document.addEventListener('visibilitychange', function () {
          if (document.hidden && rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          } else if (!document.hidden && (rockets.length > 0 || sparks.length > 0)) {
            startLoop();
          }
        });
      },

      launch(targetX, targetY) {
        if (!ctx || document.hidden) return;
        const startX = typeof targetX === 'number' ? targetX : width * (0.18 + Math.random() * 0.64);
        const destY = typeof targetY === 'number' ? targetY : height * (0.16 + Math.random() * 0.28);
        const dy = height - destY;
        const vy = -Math.sqrt(Math.max(12, 2 * 0.14 * dy));
        const patterns = ['radial', 'ring', 'heart'];

        rockets.push({
          x: startX,
          y: height,
          vx: (Math.random() - 0.5) * 1.8,
          vy: vy,
          targetY: destY,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          pattern: patterns[Math.floor(Math.random() * patterns.length)]
        });
        AudioEngine.playRocketLaunch();
        startLoop();
      },

      burst(count, x, y) {
        if (!ctx || document.hidden) return;
        const bx = typeof x === 'number' ? x : width * 0.5;
        const by = typeof y === 'number' ? y : height * 0.4;
        const total = Math.min(prefersReducedMotion() ? 14 : (count || 32), 64);
        const col = COLORS[Math.floor(Math.random() * COLORS.length)];

        for (let i = 0; i < total; i += 1) {
          const angle = (Math.PI * 2 * i) / total;
          const speed = 1.6 + Math.random() * 3.6;
          addSpark(bx, by, Math.cos(angle) * speed, Math.sin(angle) * speed, col, 2.2, 0.02);
        }
        startLoop();
      },

      finale() {
        finaleTimers.forEach(clearTimeout);
        finaleTimers.length = 0;
        const rocketCount = prefersReducedMotion() ? 2 : 7;
        for (let i = 0; i < rocketCount; i += 1) {
          const timer = setTimeout(function () {
            Fireworks.launch();
          }, i * 240);
          finaleTimers.push(timer);
        }
      }
    };
  })();

  /* ------------------------------------------------------------------------
     6. 3D TILT & CROP MANAGER (🎯) + FALLBACK BUILDER
     ------------------------------------------------------------------------ */
  const Tilt = (function () {
    let activeCard = null;
    let rafPending = false;
    let lastEvent = null;

    function updateCard() {
      rafPending = false;
      if (!activeCard || !lastEvent) return;
      const rect = activeCard.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = lastEvent.clientX - rect.left;
      const y = lastEvent.clientY - rect.top;
      const px = Math.max(0, Math.min(1, x / rect.width));
      const py = Math.max(0, Math.min(1, y / rect.height));
      const ry = ((px - 0.5) * 14).toFixed(2) + 'deg';
      const rx = ((0.5 - py) * 14).toFixed(2) + 'deg';

      activeCard.style.setProperty('--rx', rx);
      activeCard.style.setProperty('--ry', ry);
      activeCard.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      activeCard.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      activeCard.style.setProperty('--shimmer-opacity', '1');
    }

    function resetCard(card) {
      if (!card) return;
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--shimmer-opacity', '0');
    }

    return {
      init() {
        if (isTouchDevice() || prefersReducedMotion()) return;
        document.addEventListener('pointermove', function (e) {
          if (e.pointerType === 'touch') return;
          const overControl = e.target && e.target.closest
            ? e.target.closest('button, a, input, label, .char-readmore-btn, .respect-btn, .crop-btn, .replace-photo-btn, .btn, .sticker-btn, .crystal-node')
            : null;
          if (overControl) {
            if (activeCard) {
              resetCard(activeCard);
              activeCard = null;
            }
            return;
          }
          const card = e.target.closest('.tilt-card');
          if (activeCard && activeCard !== card) {
            resetCard(activeCard);
          }
          activeCard = card;
          if (!activeCard) return;
          lastEvent = e;
          if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(updateCard);
          }
        }, { passive: true });

        document.addEventListener('pointerleave', function (e) {
          if (e.target && e.target.classList && e.target.classList.contains('tilt-card')) {
            resetCard(e.target);
          }
        }, true);
      }
    };
  })();

  const CropManager = (function () {
    const POSITIONS = ['center 12%', 'top', 'center 18%', 'center 32%', 'center'];
    const DEFAULT_BY_FILE = {
      'islombek.jpg': 'center 32%',
      'photo_2026-11-11_14-17-50.jpg': 'center 32%',
      'ustoz.jpg': 'center 10%',
      'Skinny Pete & Badger.jpg': 'center 15%',
      'car_scene.jpg': 'center 58%',
      'skyler_white.jpg': 'center 18%',
      'breaking_font.jpg': 'center'
    };
    const saved = SafeStorage.getJSON(STORAGE_KEYS.crops, {});

    return {
      getPosition(imgKey) {
        return saved[imgKey] || DEFAULT_BY_FILE[imgKey] || POSITIONS[0];
      },
      cycle(imgKey, imgEl) {
        const current = saved[imgKey] || DEFAULT_BY_FILE[imgKey] || POSITIONS[0];
        const idx = POSITIONS.indexOf(current);
        const next = POSITIONS[(idx + 1) % POSITIONS.length];
        saved[imgKey] = next;
        SafeStorage.setJSON(STORAGE_KEYS.crops, saved);
        if (imgEl) {
          imgEl.style.objectPosition = next;
        }
        AudioEngine.playTick();
        Toast.show('🎯 ' + next);
      }
    };
  })();

  /* In-session custom image overrides when user clicks 📷 Replace Photo */
  const CustomPhotoOverrides = {};

  /**
   * Builds a portrait or evidence image element with:
   * - encodeURI path via img(fileName)
   * - saved 🎯 crop position & toggle button
   * - 📷 Replace Photo button (lets user swap any image from their device)
   * - stylized fallback on error (no broken icons or console spam)
   * - click to open in Lightbox
   */
  function createSmartPicture(opts) {
    const wrapper = document.createElement('div');
    wrapper.className = opts.wrapperClass || 'portrait-frame';

    let currentFileKey = CustomPhotoOverrides[opts.fileName] || opts.fileName;

    const imageEl = document.createElement('img');
    const useContain = Boolean(opts.fitContain || opts.fileName === ASSETS.images.archiveLogo);
    imageEl.className = (opts.imgClass || 'portrait-img') + (useContain ? ' portrait-img--contain' : '');
    imageEl.src = img(currentFileKey);
    imageEl.alt = opts.alt || teacherName();
    imageEl.width = opts.width || 600;
    imageEl.height = opts.height || 320;
    if (!opts.eager) {
      imageEl.loading = 'lazy';
    } else {
      imageEl.setAttribute('fetchpriority', 'high');
    }
    imageEl.decoding = 'async';
    imageEl.style.objectPosition = CropManager.getPosition(opts.fileName);

    imageEl.onerror = function () {
      imageEl.onerror = null;
      imageEl.style.display = 'none';
      const fb = document.createElement('div');
      fb.className = 'img-fallback';
      const initBadge = document.createElement('div');
      initBadge.className = 'img-fallback__initials';
      initBadge.textContent = opts.initials || 'Br';
      const lbl = document.createElement('div');
      lbl.className = 'img-fallback__label';
      lbl.textContent = opts.fallbackTitle || opts.alt || teacherName();
      const fileTag = document.createElement('div');
      fileTag.className = 'img-fallback__file';
      fileTag.textContent = opts.fileName;
      fb.appendChild(initBadge);
      fb.appendChild(lbl);
      fb.appendChild(fileTag);
      wrapper.appendChild(fb);
    };

    imageEl.addEventListener('click', function () {
      Lightbox.open(currentFileKey, opts.caption || opts.alt || teacherName(), opts.galleryGroup);
    });

    wrapper.appendChild(imageEl);

    if (opts.withCropBtn !== false) {
      /* 🎯 Crop Position Toggle Button */
      const cropBtn = document.createElement('button');
      cropBtn.type = 'button';
      cropBtn.className = 'crop-btn';
      cropBtn.textContent = '🎯';
      cropBtn.setAttribute('aria-label', t('crop_btn_aria'));
      cropBtn.setAttribute('data-i18n-attr', 'aria-label:crop_btn_aria');
      cropBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        CropManager.cycle(opts.fileName, imageEl);
      });
      wrapper.appendChild(cropBtn);

      /* 📷 Replace Photo Button */
      const replaceBtn = document.createElement('button');
      replaceBtn.type = 'button';
      replaceBtn.className = 'replace-photo-btn';
      replaceBtn.textContent = '📷';
      replaceBtn.title = t('replace_photo_aria');
      replaceBtn.setAttribute('aria-label', t('replace_photo_aria'));
      replaceBtn.setAttribute('data-i18n-attr', 'aria-label:replace_photo_aria|title:replace_photo_aria');

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.className = 'sr-only';

      replaceBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        fileInput.click();
      });

      fileInput.addEventListener('change', function () {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        const blobUrl = URL.createObjectURL(file);
        CustomPhotoOverrides[opts.fileName] = blobUrl;
        currentFileKey = blobUrl;
        const existingFb = wrapper.querySelector('.img-fallback');
        if (existingFb) existingFb.remove();
        imageEl.style.display = 'block';
        imageEl.src = blobUrl;
        if (Array.isArray(opts.galleryGroup)) {
          opts.galleryGroup.forEach(function (g) {
            if (g.file === opts.fileName) g.file = blobUrl;
          });
        }
        AudioEngine.playChime(3);
        Toast.show(t('photo_replaced_toast'));
        fileInput.value = '';
      });

      wrapper.appendChild(replaceBtn);
      wrapper.appendChild(fileInput);
    }

    if (opts.pipFileName) {
      const pipWrap = document.createElement('div');
      pipWrap.className = 'pip-frame';
      pipWrap.title = opts.pipAlt || '';
      const pipImg = document.createElement('img');
      pipImg.className = 'pip-img';
      pipImg.src = img(opts.pipFileName);
      pipImg.alt = opts.pipAlt || '';
      pipImg.width = 82;
      pipImg.height = 82;
      pipImg.loading = 'lazy';
      pipImg.decoding = 'async';
      pipImg.onerror = function () {
        pipImg.onerror = null;
        pipWrap.style.display = 'none';
      };
      pipWrap.addEventListener('click', function (e) {
        e.stopPropagation();
        Lightbox.open(opts.pipFileName, opts.pipAlt || opts.alt, opts.galleryGroup);
      });
      pipWrap.appendChild(pipImg);
      wrapper.appendChild(pipWrap);
    }

    return { wrapper: wrapper, img: imageEl };
  }

  /* ------------------------------------------------------------------------
     7. SPA HASH ROUTER & KEYBOARD NAVIGATION
     ------------------------------------------------------------------------ */
  const Router = (function () {
    const ROUTES = ['hero', 'evidence', 'characters', 'cakes', 'azizjon'];
    let currentRoute = 'hero';
    let isTransitioning = false;

    function normalizeHash(hash) {
      const clean = (hash || '').replace(/^#/, '').trim().toLowerCase();
      return ROUTES.indexOf(clean) !== -1 ? clean : 'hero';
    }

    function updateNavLinks(route) {
      const links = document.querySelectorAll('.lab-navbar__link');
      links.forEach(function (link) {
        const isMatch = link.getAttribute('data-route') === route;
        link.classList.toggle('active', isMatch);
        if (isMatch) {
          link.setAttribute('aria-current', 'page');
          try {
            link.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
          } catch (e) {
            /* Ignore older scrollIntoView options */
          }
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    function updateDocumentTitle(route) {
      const titles = (I18N[currentLang] && I18N[currentLang].page_titles) || I18N.en.page_titles;
      if (titles && titles[route]) {
        document.title = titles[route];
      }
    }

    function focusPageHeading(pageEl) {
      if (!pageEl) return;
      const heading = pageEl.querySelector('h1[tabindex="-1"]');
      if (heading) {
        heading.focus({ preventScroll: true });
      }
    }

    function switchTo(targetRoute, fromHashChange) {
      const route = ROUTES.indexOf(targetRoute) !== -1 ? targetRoute : 'hero';
      if (!fromHashChange && window.location.hash !== '#' + route) {
        window.location.hash = '#' + route;
        return;
      }

      updateNavLinks(route);
      updateDocumentTitle(route);

      if (route === currentRoute) return;

      /* Stop microphone stream if leaving Page 4 (#cakes) */
      if (currentRoute === 'cakes' && route !== 'cakes') {
        CakesModule.stopMicStream();
      }

      const oldPage = document.getElementById(currentRoute);
      const newPage = document.getElementById(route);
      if (!newPage) return;

      if (isTransitioning || prefersReducedMotion() || !oldPage) {
        ROUTES.forEach(function (r) {
          const el = document.getElementById(r);
          if (el) {
            el.classList.remove('active', 'hologram-exit', 'hologram-enter');
          }
        });
        newPage.classList.add('active');
        currentRoute = route;
        isTransitioning = false;
        window.scrollTo(0, 0);
        focusPageHeading(newPage);
        return;
      }

      isTransitioning = true;
      AudioEngine.playWhoosh();
      oldPage.classList.remove('hologram-enter');
      oldPage.classList.add('hologram-exit');

      setTimeout(function () {
        oldPage.classList.remove('active', 'hologram-exit');
        newPage.classList.add('active', 'hologram-enter');
        currentRoute = route;
        window.scrollTo(0, 0);
        focusPageHeading(newPage);
        if (route === 'characters') {
          requestAnimationFrame(function () {
            CharactersModule.syncReadMoreButtons();
          });
        }

        setTimeout(function () {
          newPage.classList.remove('hologram-enter');
          isTransitioning = false;
        }, 330);
      }, 240);
    }

    return {
      init() {
        const initial = normalizeHash(window.location.hash);
        if (window.location.hash !== '#' + initial) {
          try {
            history.replaceState(null, '', '#' + initial);
          } catch (e) {
            window.location.hash = '#' + initial;
          }
        }
        ROUTES.forEach(function (r) {
          const el = document.getElementById(r);
          if (el) el.classList.toggle('active', r === initial);
        });
        currentRoute = initial;
        updateNavLinks(initial);
        updateDocumentTitle(initial);

        window.addEventListener('hashchange', function () {
          const next = normalizeHash(window.location.hash);
          switchTo(next, true);
        });

        /* Keyboard navigation: Left / Right arrows for pages, Esc for modals */
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') {
            if (Lightbox.isOpen()) {
              Lightbox.close();
              return;
            }
            if (VideoModal.isOpen()) {
              VideoModal.close();
              return;
            }
            if (IntroOverlay.isVisible()) {
              IntroOverlay.dismiss();
              return;
            }
          }

          if (Lightbox.isOpen()) {
            if (e.key === 'ArrowLeft') Lightbox.prev();
            if (e.key === 'ArrowRight') Lightbox.next();
            return;
          }

          if (VideoModal.isOpen() || IntroOverlay.isVisible()) return;
          const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
          if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable)) {
            return;
          }

          if (e.key === 'ArrowLeft') {
            const idx = ROUTES.indexOf(currentRoute);
            if (idx > 0) {
              window.location.hash = '#' + ROUTES[idx - 1];
            }
          } else if (e.key === 'ArrowRight') {
            const idx = ROUTES.indexOf(currentRoute);
            if (idx !== -1 && idx < ROUTES.length - 1) {
              window.location.hash = '#' + ROUTES[idx + 1];
            }
          }
        });
      },
      getCurrentRoute() {
        return currentRoute;
      },
      refreshTitle() {
        updateDocumentTitle(currentRoute);
      }
    };
  })();

  /* ------------------------------------------------------------------------
     8. INTRO ENVELOPE OVERLAY CONTROLLER
     ------------------------------------------------------------------------ */
  const IntroOverlay = (function () {
    let overlayEl = null;
    let envelopeEl = null;
    let opened = false;
    let dismissed = false;

    function unlockMainContent() {
      const header = document.getElementById('site-header');
      const main = document.getElementById('app-main');
      if (header) header.removeAttribute('inert');
      if (main) main.removeAttribute('inert');
    }

    function openEnvelope() {
      if (opened) return;
      opened = true;
      AudioEngine.unlock();
      AudioEngine.playSealBreak();
      AudioEngine.playThemeSoundtrack();

      if (overlayEl) {
        overlayEl.classList.add('is-letter-open');
      }
      if (envelopeEl) {
        envelopeEl.classList.add('is-open');
      }
      Fireworks.finale();

      const enterBtn = document.getElementById('intro-enter-btn');
      if (enterBtn) {
        setTimeout(function () {
          enterBtn.focus();
        }, 380);
      }
    }

    function dismissOverlay() {
      if (dismissed) return;
      dismissed = true;
      unlockMainContent();
      if (overlayEl) {
        overlayEl.classList.add('is-hidden');
        setTimeout(function () {
          overlayEl.style.display = 'none';
        }, 540);
      }
      const activePage = document.getElementById(Router.getCurrentRoute());
      if (activePage) {
        const h1 = activePage.querySelector('h1[tabindex="-1"]');
        if (h1) h1.focus({ preventScroll: true });
      }
    }

    return {
      init() {
        overlayEl = document.getElementById('intro-overlay');
        envelopeEl = document.getElementById('intro-envelope');
        const enterBtn = document.getElementById('intro-enter-btn');
        const openCtaBtn = document.getElementById('intro-open-cta-btn');
        const introThemeBtn = document.getElementById('intro-theme-btn');
        const introLangBtn = document.getElementById('intro-lang-btn');
        const skipBtn = document.getElementById('intro-skip-btn');

        if (envelopeEl) {
          envelopeEl.addEventListener('click', function (e) {
            if (e.target && e.target.closest('#intro-enter-btn')) return;
            if (!opened) openEnvelope();
          });
          envelopeEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              if (!opened) {
                e.preventDefault();
                openEnvelope();
              }
            }
          });
        }

        if (openCtaBtn) {
          openCtaBtn.addEventListener('click', function () {
            if (!opened) openEnvelope();
          });
        }

        if (introThemeBtn) {
          introThemeBtn.addEventListener('click', function () {
            AudioEngine.playTick();
            Theme.toggle();
          });
        }

        if (introLangBtn) {
          introLangBtn.addEventListener('click', function () {
            AudioEngine.playTick();
            applyLanguage(currentLang === 'en' ? 'uz' : 'en');
          });
        }

        if (enterBtn) {
          enterBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            AudioEngine.playTick();
            AudioEngine.playThemeSoundtrack();
            Fireworks.launch();
            dismissOverlay();
          });
        }

        if (skipBtn) {
          skipBtn.addEventListener('click', function () {
            AudioEngine.unlock();
            AudioEngine.playThemeSoundtrack();
            dismissOverlay();
          });
        }
      },
      isVisible() {
        return !dismissed;
      },
      dismiss: dismissOverlay
    };
  })();

  /* ------------------------------------------------------------------------
     9. PAGE 1 MODULE: HERO, SLIDESHOW (3 IMAGES), 3 GOLDEN RULES & MIXER
     ------------------------------------------------------------------------ */
  const HeroModule = (function () {
    const SLIDES_DATA = [
      {
        file: ASSETS.images.hero1,
        initials: 'SU',
        en: 'Mr. Shakhzod Uralov — 3x Band 8.0 & Reading 9.0 Master',
        uz: 'Ustoz Shahzod Uralov — 3x Band 8.0 va Reading 9.0 Master'
      },
      {
        file: ASSETS.images.hero2,
        initials: 'IS',
        en: 'Mr. Shakhzod Uralov with his talented student Islombek (Everest Samarqand)',
        uz: 'Ustoz Shahzod Uralov o\'zining iqtidorli shogirdi Islombek bilan (Everest Samarqand)'
      },
      {
        file: ASSETS.images.hero3,
        initials: 'EV',
        en: 'Master of Champions — surrounded by high-scoring IELTS students',
        uz: 'Chempionlar Ustozi — yuqori ball olgan shogirdlar davrasida'
      }
    ];

    const TYPEWRITER_LINES = {
      en: [
        '"I AM THE ONE WHO TEACHES 3x BAND 8.0!"',
        '"NEXT TARGET: OVERALL BAND 9.0!"',
        '"READING 9.0 & 99.1% PURE METHODOLOGY!"'
      ],
      uz: [
        '"I AM THE ONE WHO TEACHES 3x BAND 8.0!"',
        '"KEYINGI NISHON: OVERALL BAND 9.0!"',
        '"READING 9.0 VA 99.1% SOF METODIKA!"'
      ]
    };

    let currentSlide = 0;
    let slideTimer = null;
    let isSlidePaused = false;
    let slideElements = [];

    /* Typewriter state */
    let twLineIndex = 0;
    let twCharIndex = 0;
    let twDeleting = false;
    let twTimer = null;

    /* Rules state */
    let rule1Ignited = false;
    let rule2Open = false;
    let boomStep = 0;
    const BOOM_PERCENTS = [0, 20, 45, 70, 95, 100];

    function renderSlides() {
      const viewport = document.getElementById('slideshow-viewport');
      if (!viewport) return;
      viewport.textContent = '';
      slideElements = [];

      const galleryList = SLIDES_DATA.map(function (s) {
        return { file: s.file, caption: s[currentLang] || s.en };
      });

      SLIDES_DATA.forEach(function (slide, idx) {
        const item = document.createElement('div');
        item.className = 'slide-item' + (idx === currentSlide ? ' active' : '');

        const pic = createSmartPicture({
          fileName: slide.file,
          alt: slide[currentLang] || slide.en,
          caption: slide[currentLang] || slide.en,
          initials: slide.initials,
          eager: idx === 0,
          width: 640,
          height: 360,
          galleryGroup: galleryList
        });

        /* Remove nested portrait-frame border inside slide */
        pic.wrapper.style.height = '100%';
        pic.wrapper.style.borderBottom = 'none';
        item.appendChild(pic.wrapper);
        viewport.appendChild(item);
        slideElements.push(item);
      });

      updateSlideUI();
    }

    function updateSlideUI() {
      slideElements.forEach(function (el, idx) {
        el.classList.toggle('active', idx === currentSlide);
      });
      const dots = document.querySelectorAll('#slideshow-dots .slideshow__dot');
      dots.forEach(function (dot, idx) {
        const active = idx === currentSlide;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      const counter = document.getElementById('slideshow-counter');
      if (counter) {
        counter.textContent = (currentSlide + 1) + ' / ' + SLIDES_DATA.length;
      }
      const cap = document.getElementById('slideshow-caption');
      if (cap) {
        const s = SLIDES_DATA[currentSlide];
        cap.textContent = s[currentLang] || s.en;
      }
    }

    function goToSlide(index) {
      currentSlide = (index + SLIDES_DATA.length) % SLIDES_DATA.length;
      updateSlideUI();
    }

    function startSlideTimer() {
      clearInterval(slideTimer);
      slideTimer = setInterval(function () {
        if (!isSlidePaused && !document.hidden && Router.getCurrentRoute() === 'hero') {
          goToSlide(currentSlide + 1);
        }
      }, 4500);
    }

    function stepTypewriter() {
      const el = document.getElementById('hero-typewriter-text');
      if (!el) return;
      if (document.hidden || prefersReducedMotion()) {
        const lines = TYPEWRITER_LINES[currentLang] || TYPEWRITER_LINES.en;
        el.textContent = lines[0];
        return;
      }

      const lines = TYPEWRITER_LINES[currentLang] || TYPEWRITER_LINES.en;
      const fullText = lines[twLineIndex % lines.length];

      if (!twDeleting) {
        twCharIndex = Math.min(fullText.length, twCharIndex + 1);
        el.textContent = fullText.slice(0, twCharIndex);
        if (twCharIndex >= fullText.length) {
          twDeleting = true;
          twTimer = setTimeout(stepTypewriter, 2400);
          return;
        }
        twTimer = setTimeout(stepTypewriter, 52);
      } else {
        twCharIndex = Math.max(0, twCharIndex - 1);
        el.textContent = fullText.slice(0, twCharIndex);
        if (twCharIndex === 0) {
          twDeleting = false;
          twLineIndex = (twLineIndex + 1) % lines.length;
          twTimer = setTimeout(stepTypewriter, 320);
          return;
        }
        twTimer = setTimeout(stepTypewriter, 26);
      }
    }

    function updateRulesLanguageUI() {
      const r1Status = document.getElementById('rule1-status');
      if (r1Status) {
        r1Status.textContent = rule1Ignited ? t('rule1_status_active') : t('rule1_status_idle');
      }
      const r2Btn = document.getElementById('rule2-action-btn');
      if (r2Btn) {
        r2Btn.textContent = rule2Open ? t('rule2_btn_close') : t('rule2_btn');
      }
      updateBoomUI();
    }

    function updateBoomUI() {
      const pct = BOOM_PERCENTS[boomStep] || 0;
      const pctLabel = document.getElementById('boom-percent-label');
      const bar = document.getElementById('boom-progress-bar');
      const msg = document.getElementById('boom-status-msg');
      const resetBtn = document.getElementById('boom-reset-btn');
      const triggerBtn = document.getElementById('boom-trigger-btn');

      if (pctLabel) pctLabel.textContent = pct + '%';
      if (bar) {
        bar.style.width = pct + '%';
        bar.setAttribute('data-step', String(boomStep));
      }
      if (msg) {
        if (boomStep === 0) {
          msg.textContent = t('rule3_status_0');
          msg.classList.remove('is-exploded');
        } else if (boomStep < 5) {
          msg.textContent = '[' + pct + '%] ' + t('rule3_status_building');
          msg.classList.remove('is-exploded');
        } else {
          msg.textContent = t('rule3_status_boom');
          msg.classList.add('is-exploded');
        }
      }
      if (resetBtn) {
        resetBtn.hidden = boomStep === 0;
      }
      if (triggerBtn) {
        triggerBtn.disabled = boomStep >= 5;
      }
    }

    return {
      init() {
        renderSlides();
        startSlideTimer();
        clearTimeout(twTimer);
        stepTypewriter();

        /* Metric cards count-up animation */
        if (!prefersReducedMotion()) {
          document.querySelectorAll('.metric-card__value[data-count-target]').forEach(function (el) {
            const target = parseFloat(el.getAttribute('data-count-target') || '0');
            const prefix = el.getAttribute('data-count-prefix') || '';
            const suffix = el.getAttribute('data-count-suffix') || '';
            const start = performance.now();
            const dur = 1100;
            function stepCount(now) {
              const p = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              const val = (target * eased).toFixed(1);
              el.textContent = prefix + val + suffix;
              if (p < 1) requestAnimationFrame(stepCount);
            }
            requestAnimationFrame(stepCount);
          });
        }

        /* Slideshow controls + hover/focus pause + touch swipe */
        const box = document.getElementById('hero-slideshow');
        if (box) {
          box.addEventListener('pointerenter', function () { isSlidePaused = true; });
          box.addEventListener('pointerleave', function () { isSlidePaused = false; });
          box.addEventListener('focusin', function () { isSlidePaused = true; });
          box.addEventListener('focusout', function () { isSlidePaused = false; });

          let touchStartX = 0;
          box.addEventListener('touchstart', function (e) {
            if (e.touches && e.touches[0]) touchStartX = e.touches[0].clientX;
          }, { passive: true });
          box.addEventListener('touchend', function (e) {
            if (!e.changedTouches || !e.changedTouches[0]) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 42) {
              AudioEngine.playTick();
              goToSlide(dx < 0 ? currentSlide + 1 : currentSlide - 1);
            }
          }, { passive: true });
        }

        const prevBtn = document.getElementById('slide-prev-btn');
        const nextBtn = document.getElementById('slide-next-btn');
        if (prevBtn) {
          prevBtn.addEventListener('click', function () {
            AudioEngine.playTick();
            goToSlide(currentSlide - 1);
          });
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', function () {
            AudioEngine.playTick();
            goToSlide(currentSlide + 1);
          });
        }

        const dotsWrap = document.getElementById('slideshow-dots');
        if (dotsWrap) {
          dotsWrap.addEventListener('click', function (e) {
            const dot = e.target.closest('.slideshow__dot');
            if (!dot) return;
            AudioEngine.playTick();
            goToSlide(Number(dot.getAttribute('data-slide')) || 0);
          });
        }

        /* Hero Salute Button */
        const saluteBtn = document.getElementById('hero-salute-btn');
        if (saluteBtn) {
          saluteBtn.addEventListener('click', function () {
            AudioEngine.playFanfare();
            Fireworks.finale();
          });
        }

        /* Rule 1: JUST DO IT */
        const r1Btn = document.getElementById('rule1-action-btn');
        if (r1Btn) {
          r1Btn.addEventListener('click', function (e) {
            rule1Ignited = true;
            const bar = document.getElementById('rule1-bar');
            if (bar) bar.style.width = '100%';
            updateRulesLanguageUI();
            AudioEngine.playFanfare();
            Fireworks.burst(34, e.clientX, e.clientY);
            if (!prefersReducedMotion()) {
              document.body.classList.remove('power-surge');
              void document.body.offsetWidth;
              document.body.classList.add('power-surge');
            }
          });
        }

        /* Rule 2: NO SECRET INGREDIENT */
        const r2Btn = document.getElementById('rule2-action-btn');
        if (r2Btn) {
          r2Btn.addEventListener('click', function (e) {
            rule2Open = !rule2Open;
            const scrollEl = document.getElementById('rule2-scroll');
            if (scrollEl) scrollEl.classList.toggle('is-open', rule2Open);
            updateRulesLanguageUI();
            AudioEngine.playChime(rule2Open ? 4 : 1);
            if (rule2Open) {
              Fireworks.burst(28, e.clientX, e.clientY);
            }
          });
        }

        /* Rule 3: 5-step BUM! Explosion Simulator (20 -> 45 -> 70 -> 95 -> 100%) */
        const boomBtn = document.getElementById('boom-trigger-btn');
        const boomReset = document.getElementById('boom-reset-btn');
        if (boomBtn) {
          boomBtn.addEventListener('click', function (e) {
            if (boomStep >= 5) return;
            boomStep += 1;
            updateBoomUI();

            if (boomStep < 5) {
              AudioEngine.playChime(boomStep - 1);
              Fireworks.burst(16, e.clientX, e.clientY);
            } else {
              /* Step 5 = 100% BOOM! */
              AudioEngine.playBoom();
              Fireworks.finale();
              if (!prefersReducedMotion()) {
                document.body.classList.remove('shake');
                void document.body.offsetWidth;
                document.body.classList.add('shake');
                setTimeout(function () {
                  document.body.classList.remove('shake');
                }, 650);
              }
            }
          });
        }

        if (boomReset) {
          boomReset.addEventListener('click', function () {
            boomStep = 0;
            AudioEngine.playTick();
            updateBoomUI();
          });
        }

        /* Video Watch & Attach .mp4 handlers on all 3 rules */
        document.querySelectorAll('.js-watch-rule-video').forEach(function (btn) {
          btn.addEventListener('click', function () {
            const ruleId = btn.getAttribute('data-rule-id') || '1';
            AudioEngine.playTick();
            VideoModal.openRuleVideo(ruleId);
          });
        });

        document.querySelectorAll('.js-attach-rule-video').forEach(function (btn) {
          btn.addEventListener('click', function () {
            const ruleId = btn.getAttribute('data-rule-id') || '1';
            const input = document.querySelector('.js-rule-file-input[data-rule-id="' + ruleId + '"]');
            if (input) input.click();
          });
        });

        document.querySelectorAll('.js-rule-file-input').forEach(function (input) {
          input.addEventListener('change', function () {
            const file = input.files && input.files[0];
            const ruleId = input.getAttribute('data-rule-id') || '1';
            if (!file) return;
            if (file.type && file.type.indexOf('video/') !== 0 && !/\.mp4$/i.test(file.name)) {
              Toast.show(t('video_invalid_toast'));
              input.value = '';
              return;
            }
            VideoModal.openWithBlobFile(ruleId, file);
            Toast.show(t('video_loaded_toast'));
            input.value = '';
          });
        });
      },

      onLangChange() {
        updateSlideUI();
        /* Update image alts inside slides */
        slideElements.forEach(function (item, idx) {
          const imgNode = item.querySelector('img');
          if (imgNode && SLIDES_DATA[idx]) {
            imgNode.alt = SLIDES_DATA[idx][currentLang] || SLIDES_DATA[idx].en;
          }
        });
        updateRulesLanguageUI();
      }
    };
  })();

  /* Interactive Heisenberg Chemical Synthesizer (#chem-mixer) */
  const MixerModule = (function () {
    const activeFlasks = { 1: false, 2: false, 3: false };
    let telemetryTimer = null;

    function countActive() {
      return (activeFlasks[1] ? 1 : 0) + (activeFlasks[2] ? 1 : 0) + (activeFlasks[3] ? 1 : 0);
    }

    function updateMixerVisuals(triggerFireworks) {
      const count = countActive();
      [1, 2, 3].forEach(function (id) {
        const on = activeFlasks[id];
        const group = document.getElementById('flask-group-' + id);
        const liq = document.getElementById('flask-liq-' + id);
        const pipe = document.getElementById('pipe-flow-' + id);
        if (group) group.classList.toggle('is-active', on);
        if (liq) {
          liq.setAttribute('y', on ? '125' : '195');
          liq.setAttribute('height', on ? '115' : '50');
        }
        if (pipe) {
          pipe.classList.toggle('is-flowing', on);
        }
      });

      const reactorGroup = document.getElementById('reactor-core-group');
      const reactorLiq = document.getElementById('reactor-liq');
      if (reactorLiq) {
        const yMap = [215, 185, 150, 105];
        const hMap = [30, 60, 95, 140];
        reactorLiq.setAttribute('y', String(yMap[count]));
        reactorLiq.setAttribute('height', String(hMap[count]));
      }
      if (reactorGroup) {
        reactorGroup.classList.toggle('is-complete', count === 3);
      }

      const statusEl = document.getElementById('mixer-status-text');
      if (statusEl) {
        if (count === 0) {
          statusEl.textContent = t('mixer_status_idle');
        } else if (count < 3) {
          statusEl.textContent = t('mixer_status_partial').replace('{n}', String(count));
        } else {
          statusEl.textContent = t('mixer_status_done');
        }
      }

      const allBtn = document.getElementById('mixer-all-btn');
      if (allBtn) {
        const span = allBtn.querySelector('[data-i18n]');
        if (span) {
          span.textContent = count === 3 ? t('mixer_btn_reset') : t('mixer_btn_all');
        }
      }

      if (count === 3 && triggerFireworks) {
        AudioEngine.playFanfare();
        Fireworks.finale();
      }
    }

    function toggleFlask(id) {
      activeFlasks[id] = !activeFlasks[id];
      AudioEngine.playChime(id);
      updateMixerVisuals(true);
    }

    function startTelemetry() {
      clearInterval(telemetryTimer);
      telemetryTimer = setInterval(function () {
        if (document.hidden || Router.getCurrentRoute() !== 'hero') return;
        const count = countActive();
        const baseTemp = 198.4 + count * 14.2;
        const basePress = 99.1 + count * 3.5;
        const tempJitter = (Math.random() - 0.5) * 0.9;
        const pressJitter = (Math.random() - 0.5) * 0.4;

        const tempEl = document.getElementById('telemetry-temp');
        const pressEl = document.getElementById('telemetry-pressure');
        if (tempEl) tempEl.textContent = (baseTemp + tempJitter).toFixed(1) + '°C';
        if (pressEl) pressEl.textContent = (basePress + pressJitter).toFixed(1) + ' PSI';
      }, 1100);
    }

    return {
      init() {
        [1, 2, 3].forEach(function (id) {
          const group = document.getElementById('flask-group-' + id);
          if (group) {
            group.addEventListener('click', function () { toggleFlask(id); });
            group.addEventListener('keydown', function (e) {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFlask(id);
              }
            });
          }
        });

        document.querySelectorAll('.js-flask-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            const id = Number(btn.getAttribute('data-flask')) || 1;
            toggleFlask(id);
          });
        });

        const allBtn = document.getElementById('mixer-all-btn');
        if (allBtn) {
          allBtn.addEventListener('click', function () {
            const allOn = countActive() === 3;
            activeFlasks[1] = !allOn;
            activeFlasks[2] = !allOn;
            activeFlasks[3] = !allOn;
            if (allOn) {
              AudioEngine.playTick();
            }
            updateMixerVisuals(!allOn);
          });
        }

        updateMixerVisuals(false);
        startTelemetry();
      },
      onLangChange() {
        updateMixerVisuals(false);
      }
    };
  })();

  /* ------------------------------------------------------------------------
     10. PAGE 2 MODULE: LASER-SCANNED CERTIFICATES & SCENE ARCHIVE
     ------------------------------------------------------------------------ */
  const EvidenceModule = (function () {
    const CERTS_DATA = [
      {
        file: ASSETS.images.cert1,
        initials: '8.0',
        badge: { en: '🏛️ OFFICIAL TRF #1 // 16 MAR 2025', uz: '🏛️ RASMIY SERTIFIKAT #1 // 16-MART 2025' },
        title: {
          en: 'Official IELTS Academic TRF #1 — Overall Band 8.0',
          uz: 'Haqiqiy IELTS Academic Sertifikati #1 — Overall Band 8.0'
        },
        desc: {
          en: 'Verified result of Mr. Shakhzod Uralov (TRF 24UZ507470URAS004A): Listening 9.0 (Maximum Score), Reading 8.5, Writing 6.5, Speaking 7.5, Overall Band 8.0 (CEFR C1).',
          uz: 'Ustoz Shahzod Uralovning haqiqiy natijasi (TRF 24UZ507470URAS004A): Listening 9.0 (maksimal ball), Reading 8.5, Writing 6.5, Speaking 7.5, Overall Band 8.0 (CEFR C1).'
        },
        disclaimer: {
          en: '✔ Authentic IELTS Test Report Form (UZ004 — 16/MAR/2025) — Laser Scanner Active',
          uz: '✔ Haqiqiy IELTS Test Report Form (UZ004 — 16/MAR/2025) — Lazer skaneri faol'
        }
      },
      {
        file: ASSETS.images.cert2,
        initials: '8.0',
        badge: { en: '🏛️ OFFICIAL TRF #2 // CENTER UZ004', uz: '🏛️ RASMIY SERTIFIKAT #2 // MARKAZ UZ004' },
        title: {
          en: 'Official IELTS Academic TRF #2 — Overall Band 8.0',
          uz: 'Haqiqiy IELTS Academic Sertifikati #2 — Overall Band 8.0'
        },
        desc: {
          en: 'Verified result of Mr. Shakhzod Uralov: Reading 9.0 (Maximum Score), Listening 8.5, Writing 7.0, Speaking 7.0, Overall Band 8.0 (CEFR C1, Center UZ004).',
          uz: 'Ustoz Shahzod Uralovning haqiqiy natijasi: Reading 9.0 (maksimal ball), Listening 8.5, Writing 7.0, Speaking 7.0, Overall Band 8.0 (CEFR C1, markaz UZ004).'
        },
        disclaimer: {
          en: '✔ Authentic IELTS Test Report Form (UZ004) — Laser Scanner Active',
          uz: '✔ Haqiqiy IELTS Test Report Form (UZ004) — Lazer skaneri faol'
        }
      },
      {
        file: ASSETS.images.ielts1,
        initials: '8.0',
        badge: { en: '🏛️ OFFICIAL TRF #3 // ONE SKILL RETAKE', uz: '🏛️ RASMIY SERTIFIKAT #3 // ONE SKILL RETAKE' },
        title: {
          en: 'Official IELTS Academic TRF #3 — Overall Band 8.0',
          uz: 'Haqiqiy IELTS Academic Sertifikati #3 — Overall Band 8.0'
        },
        desc: {
          en: 'Verified result of Mr. Shakhzod Uralov (TRF 26UZ541514URAS004A, Sep 2026): Reading 9.0 (Maximum Score), Listening 8.5 (Retake), Writing 7.5, Speaking 7.5, Overall Band 8.0.',
          uz: 'Ustoz Shahzod Uralovning haqiqiy natijasi (TRF 26UZ541514URAS004A, Sen 2026): Reading 9.0 (maksimal ball), Listening 8.5 (Retake), Writing 7.5, Speaking 7.5, Overall Band 8.0.'
        },
        disclaimer: {
          en: '✔ Authentic IELTS Test Report Form (UZ004 — 28/SEP/2026) — Laser Scanner Active',
          uz: '✔ Haqiqiy IELTS Test Report Form (UZ004 — 28/SEP/2026) — Lazer skaneri faol'
        }
      },
      {
        file: ASSETS.images.ielts2,
        initials: 'HB',
        badge: { en: '🧪 HEISENBERG LAB EDITION // GIFT', uz: '🧪 HEISENBERG LAB NASHRI // SOVG\'A' },
        title: {
          en: 'Heisenberg-Themed IELTS 8.0 Tribute Certificate',
          uz: 'Heisenberg Uslubidagi Tematik IELTS 8.0 Sertifikati'
        },
        desc: {
          en: 'Custom Breaking Bad laboratory artwork honoring Mr. Shakhzod Uralov\'s 3x Band 8.0 & 99.1% pure IELTS teaching formula.',
          uz: 'Ustoz Shahzod Uralovning 3x Band 8.0 natijasi sharafiga tayyorlangan Breaking Bad uslubidagi maxsus sovg\'a dizayni.'
        },
        disclaimer: {
          en: 'ℹ️ Thematic gift design created for birthday celebration (not an official test document).',
          uz: 'ℹ️ Tug\'ilgan kun uchun yaratilgan tematik sovg\'a dizayni (rasmiy hujjat emas).'
        }
      }
    ];

    const ARCHIVE_DATA = [
      {
        file: ASSETS.images.ustozPortrait,
        initials: 'SU',
        tag: 'ARCHIVE #01 // MASTER PORTRAIT',
        enTitle: 'Mr. Shakhzod Uralov — Master Portrait',
        uzTitle: 'Ustoz Shahzod Uralov — Maxsus Portret',
        enCap: 'Everest Samarqand English & IELTS Mentor: 3x Overall Band 8.0, Reading 9.0, Listening 8.5.',
        uzCap: 'Everest Samarqand IELTS va Ingliz tili ustozi: 3x Overall Band 8.0, Reading 9.0, Listening 8.5.'
      },
      {
        file: ASSETS.images.archiveClass,
        initials: 'CH',
        tag: 'ARCHIVE #02 // CLASSROOM REACTION',
        enTitle: 'Fiery Chemistry Lesson in the Classroom',
        uzTitle: 'Sinfxonadagi Olovli Kimyo va IELTS Darsi',
        enCap: 'When Mr. Shakhzod Uralov explains Reading 9.0 strategies, every sleepy excuse evaporates in seconds!',
        uzCap: 'Ustoz Shahzod Uralov Reading 9.0 sirlarini tushuntirganda, har qanday bahona soniyada yonib ketadi!'
      },
      {
        file: ASSETS.images.archiveRv,
        initials: 'RV',
        tag: 'ARCHIVE #03 // MOBILE LAB UNIT',
        enTitle: 'The Desert RV Mobile Prep Laboratory',
        uzTitle: 'Cho\'ldagi RV Mobil IELTS Laboratoriyasi',
        enCap: '"No secret ingredient — just sit down and study!" Even in the middle of the New Mexico desert.',
        uzCap: '"Hech qanday sirli masalliq yo\'q — shunchaki o\'tirib dars qilish kerak!" Hatto cho\'lning o\'rtasida ham.'
      },
      {
        file: ASSETS.images.profWalt,
        initials: 'PW',
        tag: 'ARCHIVE #04 // MASTER LECTURE',
        enTitle: 'Professor at the Blackboard: 99.1% Pure Formula',
        uzTitle: 'Doska Qarshisida Ustoz: 99.1% Sof Formula',
        enCap: 'Calculating the exact equation from Pre-IELTS to 3x Overall Band 8.0 and future Band 9.0 at Everest Samarqand.',
        uzCap: 'Everest Samarqandda Pre-IELTS dan 3x Overall Band 8.0 va Band 9.0 gacha bo\'lgan aniq tenglama.'
      },
      {
        file: ASSETS.images.archiveLogo,
        initials: 'Br',
        tag: 'ARCHIVE #05 // OFFICIAL EMBLEM',
        enTitle: '[35 Br] [56 Ba] — Breaking Barriers Emblem',
        uzTitle: '[35 Br] [56 Ba] — Breaking Barriers Rasmiy Logotipi',
        enCap: 'Respect the chemistry of hard work: you grind, grind, grind — and then suddenly BOOM! Band 8.0 / 9.0!',
        uzCap: 'Mehnat kimyosini hurmat qiling: qilasan, qilasan — keyin birdan BUM! Band 8.0 / 9.0!'
      }
    ];

    function render() {
      const certsGrid = document.getElementById('evidence-certs-grid');
      if (certsGrid) {
        certsGrid.textContent = '';
        const certGallery = CERTS_DATA.map(function (c) {
          return { file: c.file, caption: c.title[currentLang] + ' — ' + c.desc[currentLang] };
        });

        CERTS_DATA.forEach(function (cert) {
          const card = document.createElement('article');
          card.className = 'evidence-card card-surface tilt-card';

          const pic = createSmartPicture({
            fileName: cert.file,
            wrapperClass: 'evidence-img-box',
            alt: cert.title[currentLang],
            caption: cert.title[currentLang] + ' — ' + cert.desc[currentLang],
            initials: cert.initials,
            width: 620,
            height: 410,
            galleryGroup: certGallery
          });

          const meta = document.createElement('div');
          meta.className = 'evidence-card__meta';
          const chip = document.createElement('span');
          chip.className = 'lab-chip lab-chip--neon';
          chip.textContent = cert.badge[currentLang];
          meta.appendChild(chip);

          const h3 = document.createElement('h3');
          h3.className = 'evidence-card__title';
          h3.textContent = cert.title[currentLang];

          const p = document.createElement('p');
          p.className = 'evidence-card__desc';
          p.textContent = cert.desc[currentLang];

          const note = document.createElement('div');
          note.className = 'evidence-card__disclaimer';
          note.textContent = cert.disclaimer[currentLang];

          card.appendChild(pic.wrapper);
          card.appendChild(meta);
          card.appendChild(h3);
          card.appendChild(p);
          card.appendChild(note);
          certsGrid.appendChild(card);
        });
      }

      const archiveGrid = document.getElementById('archive-scenes-grid');
      if (archiveGrid) {
        archiveGrid.textContent = '';
        const archGallery = ARCHIVE_DATA.map(function (a) {
          const title = currentLang === 'uz' ? a.uzTitle : a.enTitle;
          const cap = currentLang === 'uz' ? a.uzCap : a.enCap;
          return { file: a.file, caption: title + ' — ' + cap };
        });

        ARCHIVE_DATA.forEach(function (item) {
          const title = currentLang === 'uz' ? item.uzTitle : item.enTitle;
          const cap = currentLang === 'uz' ? item.uzCap : item.enCap;

          const card = document.createElement('article');
          card.className = 'archive-card card-surface tilt-card';

          const pic = createSmartPicture({
            fileName: item.file,
            alt: title,
            caption: title + ' — ' + cap,
            initials: item.initials,
            width: 600,
            height: 320,
            galleryGroup: archGallery
          });

          const body = document.createElement('div');
          body.className = 'archive-card__body';

          const tag = document.createElement('span');
          tag.className = 'archive-card__tag';
          tag.textContent = item.tag;

          const h3 = document.createElement('h3');
          h3.className = 'archive-card__title';
          h3.textContent = title;

          const p = document.createElement('p');
          p.className = 'archive-card__caption';
          p.textContent = cap;

          body.appendChild(tag);
          body.appendChild(h3);
          body.appendChild(p);

          card.appendChild(pic.wrapper);
          card.appendChild(body);
          archiveGrid.appendChild(card);
        });
      }
    }

    return {
      init() {
        render();
        const addBtn = document.getElementById('add-classroom-photo-btn');
        const addInput = document.getElementById('add-classroom-photo-input');
        if (addBtn && addInput) {
          addBtn.addEventListener('click', function () {
            addInput.click();
          });
          addInput.addEventListener('change', function () {
            if (!addInput.files || !addInput.files.length) return;
            Array.from(addInput.files).forEach(function (fileObj) {
              const blobUrl = URL.createObjectURL(fileObj);
              const idx = ARCHIVE_DATA.length + 1;
              const numStr = idx < 10 ? '0' + idx : String(idx);
              const baseName = fileObj.name.replace(/\.[^/.]+$/, '');
              ARCHIVE_DATA.push({
                file: blobUrl,
                initials: 'CL',
                tag: 'ARCHIVE #' + numStr + ' // CLASSROOM SESSION',
                enTitle: 'Everest Samarqand Classroom — ' + baseName,
                uzTitle: 'Everest Samarqand Dars Jarayoni — ' + baseName,
                enCap: 'Live classroom atmosphere with Mr. Shakhzod Uralov: 0% excuses, 100% pure IELTS focus!',
                uzCap: 'Ustoz Shahzod Uralov bilan jonli dars jarayoni: 0% bahona, 100% haqiqiy IELTS mehnati!'
              });
            });
            addInput.value = '';
            render();
            AudioEngine.playChime(2);
            Toast.show(t('class_photo_added_toast'));
          });
        }
      },
      onLangChange: render
    };
  })();

  /* ------------------------------------------------------------------------
     11. PAGE 3 MODULE: 14 CHARACTERS + TIO HECTOR'S GOLDEN BELL
     ------------------------------------------------------------------------ */
  const CharactersModule = (function () {
    const TIO_MESSAGE = 'HAPPY BIRTHDAY USTOZ SHAHZOD 9.0!';

    const CHARACTERS = [
      {
        id: 'walter_white',
        num: '01',
        name: { en: 'Walter White', uz: 'Uolter Uayt (Walter White)' },
        role: { en: 'Master Chemist // The One Who Knocks', uz: 'Bosh Kimyogar // Eshik Qoquvchi Ustoz' },
        img: ASSETS.images.waltMain,
        pip: ASSETS.images.waltPip,
        initials: 'WW',
        quote: {
          en: '"I am not in danger of a low band score, Skyler. I AM the one who knocks! … Say my name."',
          uz: '"Men past ball xavfi ostida emasman, Skayler. Eshikni taqillatadigan — MENMAN! … Ismimni ayt."'
        },
        wish: {
          en: 'Listen to me very carefully, Shakhzod. People ask me if I\'m in the teaching business or the score business. Neither. I\'m in the EMPIRE business — and looking at your three separate Band 8.0 certificates and that flawless 9.0 in Reading, so are you. Most teachers settle for 60% or 70% grammar purity. Amateur hour! In my lab, anything less than 99.1% is unacceptable. At Everest Samarqand, you didn\'t just pass the exam — you became the standard. Next stop: a clean 9.0 across the board, and I never miss. Happy Birthday, Mr. Uralov.',
          uz: 'Menga juda diqqat bilan quloq soling, Shahzod. Odamlar mendan oddiy o\'qituvchimisiz yoki ball yig\'uvchimi, deb so\'rashadi. Hech qaysisi emas. Men — IMPERIYA qurish biznesidaman! Uchta haqiqiy IELTS 8.0 sertifikatingiz va Reading\'dagi benuqson 9.0 natijangizga qarab aytamanki, siz ham xuddi shunday imperiya sohibisiz. Ko\'pchilik 60–70% li o\'rtamiyona natija bilan kifoyalanadi. Havaskorlar! Mening laboratoriyamda 99.1% soflik qonun bo\'lsa, Everest Samarqanddagi darslaringizda ham bilim shunday sof — oltindek! Navbatdagi marra — mutlaq Band 9.0! Tug\'ilgan kuningiz muborak, Ustoz Shahzod Uralov!'
        }
      },
      {
        id: 'jesse_pinkman',
        num: '02',
        name: { en: 'Jesse Pinkman', uz: 'Jessi Pinkman (Jesse Pinkman)' },
        role: { en: 'Lab Partner // Captain Cook of Motivation', uz: 'Laboratoriya Hamkori // Motivatsiya Ustasi' },
        img: ASSETS.images.jesseMain,
        pip: ASSETS.images.jessePip,
        initials: 'JP',
        quote: {
          en: '"Yeah, Mr. Uralov! Yeah, ENGLISH! Pure 99.1% quality, yo!"',
          uz: '"Yeah, Ustoz Shahzod! Yeah, INGLIZ TILI, yo! 99.1% sof sifat!"'
        },
        wish: {
          en: 'Yo, yo, yo, Mr. Shakhzod! Are you kidding me right now, yo?! Getting Band 8.0 once is crazy, twice is insane, but THREE TIMES and a freaking 9.0 in Reading?! That\'s not just teaching — that\'s pure art, Mr. Uralov! Before your classes, students look at IELTS like it\'s an impossible fortress, and then you tell \'em \'Just do it!\', drop the truth — no secret ingredient, you just sit down and study — and boom, Band 8.0s everywhere! Next stop: Overall Band 9.0, yo — I\'m calling it right now! Have the sickest birthday ever, Ustoz! Respect, yo!',
          uz: 'Yo, yo, yo, Ustoz Shahzod! Hazillashayapsizmi, yo?! IELTS\'dan bir marta 8.0 olishning o\'zi daxshat, ikki marta — afsona, lekin UCH MARTA 8.0 va Reading\'dan 9.0 olish — bu haqiqiy san\'at-ku, brat! Darslaringizdan oldin o\'quvchilar IELTS\'ni zabt etib bo\'lmas qal\'adek ko\'rishadi, keyin siz \'Just do it!\' deysiz, \'sirli masalliq yo\'q, shunchaki o\'tirib dars qil\' deb haqiqatni aytasiz — va bum, hamma yoqda yuqori ballar! Navbatdagi marra — Overall Band 9.0, yo, men hozirdanoq ayta qolay! Tug\'ilgan kuningiz yorib yuboradigan darajada zo\'r o\'tsin, Ustoz! Hurmatdamiz, yo!'
        }
      },
      {
        id: 'gustavo_fring',
        num: '03',
        featured: true,
        name: { en: 'Gustavo Fring', uz: 'Gustavo Fring (Gus Fring)' },
        role: { en: 'Los Pollos Hermanos // Precision & Standards', uz: 'Los Pollos Hermanos // Temir Intizom va Yuqori Standart' },
        img: ASSETS.images.fringMain,
        pip: ASSETS.images.fringPip,
        initials: 'GF',
        quote: {
          en: '"I hide in plain sight, same as you. Everything I do is to build an empire of excellence."',
          uz: '"Men qilayotgan har bir ish — mukammallik imperiyasini qurish uchun. Siz bu standartga to\'liq javob berdingiz."'
        },
        wish: {
          en: 'Good evening, Mr. Shakhzod Uralov. Allow me to adjust my tie and offer my sincerest congratulations on your birthday. As a businessman, I have zero patience for amateurs who rely on luck. Luck does not produce three Band 8.0 certificates and a 9.0 in Reading. As you always tell your students, there is no secret ingredient — only relentless discipline, immaculate preparation, and sitting down to do the work. Your work at Everest Samarqand meets the highest standards of Los Pollos Hermanos. May your next milestone be an impeccable Overall Band 9.0.',
          uz: 'Xayrli kech, janob Shahzod Uralov. Galstugimni to\'g\'rilab, sizga eng samimiy tabrigimni izhor etishga ruxsat bering. Men omadga tayanadigan havaskorlarga sabr qilmayman. Tasodif bilan uch marta IELTS 8.0 va Reading 9.0 olib bo\'lmaydi. O\'zingiz doim aytganingizdek, hech qanday sirli masalliq yo\'q — faqat temir intizom, benuqson tayyorgarlik va o\'tirib ishlash bor. Everest Samarqanddagi faoliyatingiz Los Pollos Hermanos\'ning eng oliy standartlariga javob beradi. Sizga uzoq umr va navbatdagi mukammal Overall Band 9.0 zafarini tilayman.'
        }
      },
      {
        id: 'saul_goodman',
        num: '04',
        name: { en: 'Saul Goodman', uz: 'Sol Gudman (Saul Goodman)' },
        role: { en: 'Legal & Speaking Advocate // Better Call Ustoz', uz: 'Speaking Advokati // Ustozga Qo\'ng\'iroq Qiling' },
        img: ASSETS.images.saulMain,
        pip: null,
        initials: 'SG',
        quote: {
          en: '"Hi, I\'m Saul Goodman! Stuck at Band 6.0? Better Call Shakhzod! 👉 It\'s all good, man!"',
          uz: '"Salom, men Sol Gudmanman! Band 6.0 da qolib ketdingizmi? Yaxshisi — Shahzodga qo\'ng\'iroq qiling! 👉 It\'s all good, man!"'
        },
        wish: {
          en: 'Did you know that you have the right to a high IELTS score? The Constitution says you do, and so does Mr. Shakhzod Uralov! Listen, folks, if the Speaking or Writing examiner is grilling you like a DEA agent, who are you gonna call? Better Call Shakhzod! With three Band 8.0 certificates and a 9.0 in Reading in his briefcase, this man\'s Lexical Resource is so powerful it should be unconstitutional! Happy Birthday, Counselor of C2 Grammar — and may your next verdict be a unanimous Overall Band 9.0. It\'s all good, man!',
          uz: 'Bilasizmi, sizning IELTS\'dan yuqori ball olishga to\'liq qonuniy haqqingiz bor?! Konstitutsiya shunday deydi, Ustoz Shahzod Uralov ham shuni tasdiqlaydi! Agar Band 6.0 da qolib ketgan bo\'lsangiz va imtihon qo\'rquvi sizni burchakka qistayotgan bo\'lsa — kimga qo\'ng\'iroq qilasiz? Better Call Shakhzod! Portfelida uchta haqiqiy Band 8.0 va Reading 9.0 sertifikati bor bu insonning argumentlari oldida har qanday qo\'rquv 30 soniyada taslim bo\'ladi! Tug\'ilgan kuningiz muborak, Grammatika Qiroli — navbatdagi hukm esa Overall Band 9.0 bo\'lsin! It\'s all good, man!'
        }
      },
      {
        id: 'hank_schrader',
        num: '05',
        name: { en: 'Hank Schrader', uz: 'Xenkreyder (Hank Schrader)' },
        role: { en: 'ASAC Investigator // Mineral & Crystal Collector', uz: 'Maxsus Tergovchi // Kristall va Faktlar Ustasi' },
        img: ASSETS.images.hankMain,
        pip: ASSETS.images.hankPip,
        initials: 'HS',
        quote: {
          en: '"Marie, they\'re not just Band Scores — they\'re MINERALS!"',
          uz: '"Mari, bular shunchaki ball emas — bular haqiqiy MINERALLAR!"'
        },
        wish: {
          en: 'Haha! Hold the phone and look at this guy right here, Gomie! We\'ve been hunting the mastermind behind all those 7.5 and 8.0 IELTS results coming out of Everest Samarqand, and boom — it\'s Shakhzod Uralov! Three Band 8.0s and a 9.0 in Reading?! Marie, for the last time, those aren\'t just \'good results,\' they\'re rare, flawless academic MINERALS! Raising a cold glass of mineral water — get it? — to the sharpest teacher in town. Next case to close: Overall Band 9.0. Happy Birthday, Champ!',
          uz: 'Xaxa! To\'xtang-to\'xtang, Gomi, mana bu yigitga qara! Biz Everest Samarqanddan chiqayotgan barcha 7.5 va 8.0 IELTS natijalari ortidagi dahoni qidirib yurgandik va bum — bu Shahzod Uralov ekan! Uch marta Band 8.0 va Reading 9.0 deysanmi?! Mari, eshitib qo\'y — bular oddiy qog\'oz emas, bular har qanday kolleksionerning orzusi bo\'lgan noyob minerallar! Shaharning eng zo\'r ustozi sharafiga mineral suv bilan qadah ko\'taramiz. Navbatdagi yopiladigan ish — Overall Band 9.0! Tug\'ilgan kuningiz bilan, Chempion!'
        }
      },
      {
        id: 'tuco_salamanca',
        num: '06',
        name: { en: 'Tuco Salamanca', uz: 'Tuko Salamanka (Tuco Salamanca)' },
        role: { en: 'High-Voltage Energy // Pure Impact Tester', uz: 'Yuqori Quvvat // Explosive Natija Sinovchisi' },
        img: ASSETS.images.tucoMain,
        pip: null,
        initials: 'TS',
        quote: {
          en: '"TIGHT! TIGHT! TIGHT! YEAH! Academic or General — whatever, man!"',
          uz: '"DAXSHAT! DAXSHAT! TIGHT, TIGHT, TIGHT! YEAH!"'
        },
        wish: {
          en: 'WHOA! Look at that Reading 9.0 and 3x Band 8.0! TIGHT! TIGHT! TIGHT! YEAH! Man, this C1 teaching hits like a thunderclap! Reading, Listening, Writing, Speaking — Academic or General, whatever man, just keep bringing that high-band fire! You study, study, and then BOOM — nobody in Samarkand teaches English like Shakhzod Uralov! Next target: Overall Band 9.0 — make it TIGHT! Happy Birthday, homes!',
          uz: 'VOOOY! Anavi Reading 9.0 va 3 karra Band 8.0 ga qaranglar! DAXSHAT! DAXSHAT! TIGHT! TIGHT! TIGHT! Bu C1–C2 darajadagi darslar momaqaldiroqdek ta\'sir qiladi-ku! Reading, Listening, Writing, Speaking — Academic ham, General ham, farqi yo\'q, Ustoz Shahzod Uralov har doim eng olovli bilimlarni beradi! Qilasan, qilasan va birdan — BUM! Navbatdagi nishon — Overall Band 9.0, TIGHT bo\'lsin! Tug\'ilgan kuningiz muborak, brat!'
        }
      },
      {
        id: 'heisenberg_hazmat',
        num: '07',
        name: { en: 'Heisenberg (Lab Mode)', uz: 'Xayzenberg (Laboratoriya Rejimi)' },
        role: { en: '99.1% Pure Formula // Professor Walter White', uz: '99.1% Sof Formula // Professor Uolter Uayt' },
        img: ASSETS.images.heisenbergSuit,
        pip: ASSETS.images.profWalt,
        initials: 'HB',
        quote: {
          en: '"Chemistry is the study of change and transformation. And you transform students into winners."',
          uz: '"Kimyo — bu o\'zgarishlar haqidagi fan. Siz esa o\'quvchilarni g\'oliblarga aylantirasiz."'
        },
        wish: {
          en: 'From one educator to another: teaching requires patience, authority, and an unshakeable belief in reaction kinetics. You tell your students: \'You work, you work — no result. Then suddenly — BOOM!\' That is pure thermodynamics, Mr. Uralov! Energy accumulates silently until a phase transition occurs. Every student who walks into your classroom at Everest Samarqand undergoes that exact catalytic transformation — fear turns into confidence, hesitation into Band 8.0 fluency. May your own next reaction be the ultimate one: Overall Band 9.0. Happy Birthday, Professor.',
          uz: 'Bir ustozdan ikkinchi ustozga ehtirom: siz shogirdlaringizga \'Qilasan, qilasan — natija yo\'q, keyin birdan — BUM — natijani ko\'rasan!\' deb aytar ekansiz. Bu — sof termodinamika qonuni, janob Uralov! Energiya ko\'zga ko\'rinmasdan to\'planib boradi va kritik nuqtada ulkan portlash yuz beradi. Everest Samarqanddagi xonangizga kirgan har bir o\'quvchi aynan shunday katalitik reaksiyadan o\'tadi: qo\'rquv ishonchga, ikkilanish Band 8.0 ravonligiga aylanadi. Sizning keyingi katta reaksiyangiz — Overall Band 9.0 bo\'lsin! Bilim imperiyangiz abadiy bo\'lsin, tug\'ilgan kuningiz muborak!'
        }
      },
      {
        id: 'salamanca_twins',
        num: '08',
        name: { en: 'The Salamanca Cousins', uz: 'Salamanka Egizaklari (Leonel va Marko)' },
        role: { en: 'Silent Focus // Unstoppable Discipline', uz: 'So\'zsiz Diqqat // To\'xtatib Bo\'lmas Intizom' },
        img: ASSETS.images.twinsMain,
        pip: null,
        initials: 'SC',
        quote: {
          en: '"… (silent nod of absolute respect — La Familia es Todo)"',
          uz: '"… (mutlaq hurmat bilan bosh irg\'ash — Oila hammadan ustun)"'
        },
        wish: {
          en: 'We do not waste words. Neither do your three Band 8.0 certificates. We walked all the way in silver-tipped boots for one purpose: to stand guard outside Mr. Shakhzod Uralov\'s classroom at Everest Samarqand so no noise ever disturbs a Band 8.0 lecture. For you, Ustoz, we break our silence just once: Just do it. Conquer Band 9.0. Happy Birthday. La Familia de Everest es Todo.',
          uz: 'Biz ortiqcha so\'z sarflamaymiz — sizning uchta IELTS 8.0 sertifikatingiz ham ortiqcha izohga muhtoj emas. Kumush uchli etiklarimizda bu yerga faqat bir maqsadda keldik: Ustoz Shahzod Uralovning darslariga hech qanday shovqin xalaqit bermasligi uchun eshik oldida faxriy qorovul bo\'lib turishga. Siz uchun, Ustoz, sukutimizni bir marta buzamiz: Just do it. Band 9.0 ni zabt eting. Tug\'ilgan kuningiz muborak. Everest oilasi — hammadan ustun.'
        }
      },
      {
        id: 'mike_ehrmantraut',
        num: '09',
        name: { en: 'Mike Ehrmantraut', uz: 'Mayk Ermantraut (Mike Ehrmantraut)' },
        role: { en: 'No Half-Measures // Veteran Strategist', uz: 'Yarim Chora Yo\'q // Tajribali Strateg' },
        img: ASSETS.images.mikeMain,
        pip: null,
        initials: 'ME',
        quote: {
          en: '"No more half measures, Walter. Sit down and do the work."',
          uz: '"Yarim-yorti ish ketmaydi, Uolter. O\'tirib dars qilish kerak."'
        },
        wish: {
          en: 'All right, Shakhzod, here\'s what\'s gonna happen. Today, you\'re gonna put down the red grading pen, eat a piece of birthday cake, and let Everest Samarqand celebrate you. I\'ve seen a lot of guys who look for shortcuts, but you tell it like it is: \'There is no secret ingredient — you just sit down and study.\' Three Band 8.0s means you never took a half measure in your life. You do the job right, every single time. Now go get that Overall Band 9.0. Happy Birthday, kid.',
          uz: 'Demak, Shahzod, hozir mana bunday bo\'ladi: bugun qizil ruchkani bir chetga qo\'yasiz, bayram tortidan kesasiz va Everest Samarqand sizni olqishlashiga yo\'l qo\'yasiz. Men hayotda oson yo\'l qidiradigan ko\'p odamlarni ko\'rdim, ammo siz haqiqatni aytasiz: \'Hech qanday sirli masalliq yo\'q — shunchaki o\'tirib dars qilish kerak!\' Uch marta Band 8.0 — hech qachon yarim kuch bilan ishlamaganingizning isboti. Endi Overall Band 9.0 ni ham oling. Haqiqiy ustozsiz. Tug\'ilgan kuningiz muborak bo\'lsin.'
        }
      },
      {
        id: 'huell_babineaux',
        num: '10',
        name: { en: 'Huell Babineaux', uz: 'Xyuell Babino (Huell Babineaux)' },
        role: { en: 'Chief Security of High Scores // Reasonably Happy', uz: 'Yuqori Ballar Qo\'riqchisi // Xotirjam Chempion' },
        img: ASSETS.images.huellMain,
        pip: null,
        initials: 'HB',
        quote: {
          en: '"Reasonably comfortable?! Man, I\'m laying on a mountain of Band 8.0 certificates!"',
          uz: '"Qulayligimni so\'rayapsanmi?! Birodar, bu Band 8.0 sertifikatlar tog\'iga qara!"'
        },
        wish: {
          en: 'Saul asked me if I\'m reasonably comfortable. Man, how could I NOT be?! Mr. Shakhzod Uralov has produced so many C1, Band 8.0, and Reading 9.0 results at Everest Samarqand that we stacked \'em up in the vault like a mountain of gold! I\'m taking a nap right on top of pure academic success! And when that Overall Band 9.0 arrives, we\'re gonna need a second vault. Best birthday ever, Boss!',
          uz: 'Sol mendan qulayman-mi deb so\'radi. Birodar, qanday qilib qulay bo\'lmay?! Ustoz Shahzod Uralov Everest Samarqandda shunchalik ko\'p C1, Band 8.0 va Reading 9.0 natijalarini chiqardiki, ularni xuddi oltin tog\'idek ustma-ust taxlab qo\'ydik, men esa ustida mazza qilib yotibman! Overall Band 9.0 ham kelsa, ikkinchi omborxona kerak bo\'ladi! Tug\'ilgan kuningiz muborak bo\'lsin, Boss!'
        }
      },
      {
        id: 'gale_boetticher',
        num: '11',
        name: { en: 'Gale Boetticher', uz: 'Geyl Bettiker (Gale Boetticher)' },
        role: { en: 'Analytical Chemist // Precision Coffee & Reading 9.0', uz: 'Tahliliy Kimyogar // 99.1% Aniqlik Muxlisi' },
        img: ASSETS.images.galeMain,
        pip: null,
        initials: 'GB',
        quote: {
          en: '"That last 0.5 between 8.5 and 9.0 is where true genius lives!"',
          uz: '"8.5 bilan 9.0 orasidagi o\'sha oxirgi 0.5 ballda haqiqiy daholik yashiringan!"'
        },
        wish: {
          en: 'I pride myself on academic perfection and brewing the finest laboratory coffee, Mr. Uralov. I once believed 96% accuracy was my absolute limit — and that the extra 3.1% was a tremendous gulf. When I examined your flawless Reading 9.0, your Listening 8.5 and three Band 8.0 certificates, I was completely humbled! You are the true Maestro of English syntax. Raising my finest cup of Ethiopian roast to your birthday and your future Overall Band 9.0!',
          uz: 'Men har bir ilmiy detalning aniqligiga va eng sof laboratoriya qahvasini damlashga e\'tibor beraman, janob Uralov. Bir paytlar 96% aniqlikni o\'z chegaram deb bilardim, qolgan 3.1% esa oshib bo\'lmas jarlikdek tuyulardi. Sizning benuqson Reading 9.0, Listening 8.5 va uchta Band 8.0 natijangizni ko\'rib, haqiqiy til maestrosi kim ekaniga tan berdim! Bunday aniqlik — haqiqiy mo\'jiza. Eng sara efiopiya qahvamni sizning tug\'ilgan kuningiz va kelajakdagi Overall Band 9.0 g\'alabangiz uchun ko\'taraman, Ustoz!'
        }
      },
      {
        id: 'apex_duo',
        num: '12',
        name: { en: 'Skinny Pete & Badger', uz: 'Skinni Pit va Badjer (Apex Duo)' },
        role: { en: 'The Apex Duo // Streetwise Grammar Bros', uz: 'Eng Sodiq Do\'stlar // Quvnoq Shogirdlar Dueti' },
        img: ASSETS.images.apexDuo,
        pip: null,
        initials: 'PB',
        quote: {
          en: '"Church, yo! You study, study, no result, and then BOOM — Band 8.0! Straight-up apex, man!"',
          uz: '"Aniq gap, yo (church, yo)! Qilasan, qilasan va birdan — BUM — Band 8.0! Eng cho\'qqisi, brat!"'
        },
        wish: {
          en: 'Yo, Mr. Shakhzod! Badger and I were sitting on the couch arguing for five hours about who could write the ultimate Star Trek script without a single grammar mistake, and Skinny Pete goes: \'Man, only Ustoz Shakhzod Uralov at Everest Samarqand has that level of C2 vocabulary — church, yo!\' Like you always tell the crew: you grind, you grind, no result, and then suddenly — BOOM — Band 8.0! You\'re the Beethoven of English, man! Next up: Overall Band 9.0 — we already know you got it. Have the most epic birthday ever, Legend!',
          uz: 'Yo, Ustoz Shahzod! Badjer ikkalamiz divanda o\'tirib, besh soat tortishdik: bitta ham grammatik xatosiz eng zo\'r Star Trek ssenariysini kim yozadi? Shunda Skinni Pit aytdi: \'Brat, bu faqat Everestdagi Ustoz Shahzod Uralov — aniq gap (church, yo)!\' O\'zingiz aytganingizdek: qilasan, qilasan — natija yo\'q, keyin birdan — BUM — natijani ko\'rasan! Ingliz tilining haqiqiy Betxovenisiz, brat! Navbatdagi marra — Overall Band 9.0, bunga shubha yo\'q! Tug\'ilgan kuningiz yorib yuborsin, Afsona!'
        }
      },
      {
        id: 'skyler_white',
        num: '13',
        name: { en: 'Skyler White', uz: 'Skayler Uayt (Skyler White)' },
        role: { en: 'Executive Auditor // Keeper of the Numbers', uz: 'Moliyaviy Auditor // Raqamlar va Natijalar Nazoratchisi' },
        img: ASSETS.images.skylerMain,
        pip: null,
        initials: 'SW',
        quote: {
          en: '"Shakhzod, do you have any idea how many Band 8.0 certificates we have to stack?!"',
          uz: '"Shahzod, bunchalik ko\'p Band 8.0 sertifikatni qanday sanab ulguraman?!"'
        },
        wish: {
          en: 'Listen to me, Shakhzod. Have you seen the size of this storage unit lately?! Every single month, more and more students walk out of Everest Samarqand with Band 7.5s and 8.0s because of your classes! How on earth am I supposed to audit and stack this many high scores?! Even my accounting books can\'t keep up with your success rate — we\'re gonna need a bigger building when you hit Overall Band 9.0! Happy Birthday, Shakhzod!',
          uz: 'Menga qarang, Shahzod, omborxonadagi sertifikatlar uyumi qanchalik katta bo\'lib ketganini ko\'rdingizmi?! Everest Samarqandda har oy sizning qo\'lingizdan chiqayotgan 7.5 va 8.0 olgan shogirdlar soni shunchalik ko\'pki, hatto mening buxgalteriya daftarlarim ham ularni hisoblashga ulgurmayapti! Yaqinda Overall Band 9.0 olsangiz, sertifikatlarni taxlashga alohida bino kerak bo\'ladi! Tug\'ilgan kuningiz muborak bo\'lsin!'
        }
      },
      {
        id: 'lalo_salamanca',
        num: '14',
        name: { en: 'Lalo Salamanca', uz: 'Lalo Salamanka (Lalo Salamanca)' },
        role: { en: 'Charismatic Mastermind // Tell Me Again', uz: 'Xarizmatik Ustoz // Natijani Qayta Eshitaylik' },
        img: ASSETS.images.laloMain,
        pip: null,
        initials: 'LS',
        quote: {
          en: '"Tell me again... Three Band 8.0s AND a 9.0 in Reading?! Just do it, right?!"',
          uz: '"Qani, yana bir marta ayt-chi... Uch marta Band 8.0 VA Reading\'dan 9.0?! Just do it, shundaymi?!"'
        },
        wish: {
          en: 'Well, well, well... Mr. Shakhzod Uralov! Wait a second — tell me again! You walked into that test center, smiled at the examiners, and pulled off Band 8.0 three separate times with a 9.0 in Reading?! Haha, I love it! And when your students ask how you do it, you just look at them and say: \'Just do it!\' Pure style, pure charisma, pure genius. Raising a glass to your birthday and your inevitable Overall Band 9.0, amigo!',
          uz: 'Oho, janob Shahzod Uralov! To\'xtang-to\'xtang... Qani, menga yana bir marta aytib bering-chi! Imtihon markaziga jilmayib kirib, uch marta Band 8.0 va Reading\'dan 9.0 olib chiqdingizmi?! Xaxa, qoyilmaqom! Shogirdlaringiz buni qanday uddaladingiz deb so\'rasa, shunchaki \'Just do it!\' deb qo\'yasiz-a?! Haqiqiy xarizma, haqiqiy iste\'dod! Tug\'ilgan kuningiz va navbatdagi muqarrar Overall Band 9.0 g\'alabangiz uchun qadah ko\'taraman, amigo!'
        }
      }
    ];

    let respectMap = SafeStorage.getJSON(STORAGE_KEYS.respect, {});
    let tioIndex = 0;
    let tioNonSpaceIndices = [];
    const expandedChars = {};
    let wishRefs = [];

    function syncReadMoreButtons() {
      wishRefs.forEach(function (ref) {
        const isExpanded = Boolean(expandedChars[ref.id]);
        ref.wishEl.classList.toggle('is-expanded', isExpanded);
        const needsToggle = isExpanded || ref.wishEl.scrollHeight > ref.wishEl.clientHeight + 1;
        ref.readBtn.hidden = !needsToggle;
        ref.readBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        ref.readBtn.textContent = isExpanded ? t('char_show_less') : t('char_read_more');
      });
    }

    function updateGlobalRespectUI() {
      let sum = 0;
      Object.keys(respectMap).forEach(function (k) {
        sum += Number(respectMap[k]) || 0;
      });
      const badge = document.getElementById('global-respect-count');
      if (badge) badge.textContent = String(sum);
    }

    function addRespect(charId, btnEl, event) {
      respectMap[charId] = (Number(respectMap[charId]) || 0) + 1;
      SafeStorage.setJSON(STORAGE_KEYS.respect, respectMap);
      updateGlobalRespectUI();

      const countSpan = btnEl.querySelector('.respect-btn__count');
      if (countSpan) countSpan.textContent = String(respectMap[charId]);

      AudioEngine.playChime(respectMap[charId] % 5);
      if (event && typeof event.clientX === 'number') {
        Fireworks.burst(12, event.clientX, event.clientY);
      }

      /* Lightweight floating +1 indicator */
      const floater = document.createElement('span');
      floater.className = 'respect-float';
      floater.textContent = '+1 🔥';
      btnEl.appendChild(floater);
      setTimeout(function () {
        if (floater.parentNode) floater.parentNode.removeChild(floater);
      }, 650);
    }

    function renderBannerAndCards() {
      /* Top wide banner: breaking_bad_actors.jpg */
      const bannerBox = document.getElementById('characters-banner-box');
      if (bannerBox) {
        bannerBox.textContent = '';
        const pic = createSmartPicture({
          fileName: ASSETS.images.actorsBanner,
          alt: t('chars_banner_caption'),
          caption: t('chars_banner_caption'),
          initials: 'BB',
          width: 1200,
          height: 340
        });
        const bar = document.createElement('div');
        bar.className = 'chars-banner__bar';
        bar.textContent = t('chars_banner_caption');
        bannerBox.appendChild(pic.wrapper);
        bannerBox.appendChild(bar);
      }

      /* 14 Character cards grid */
      const grid = document.getElementById('characters-grid');
      if (!grid) return;
      grid.textContent = '';
      wishRefs = [];

      const galleryGroup = CHARACTERS.map(function (c) {
        return {
          file: c.img,
          caption: c.name[currentLang] + ' — ' + c.quote[currentLang]
        };
      });

      CHARACTERS.forEach(function (c) {
        const card = document.createElement('article');
        card.className = 'char-card card-surface tilt-card' + (c.featured ? ' char-card--featured' : '');

        const pic = createSmartPicture({
          fileName: c.img,
          alt: c.name[currentLang],
          caption: c.name[currentLang] + ' — ' + c.wish[currentLang],
          initials: c.initials,
          pipFileName: c.pip,
          pipAlt: c.name[currentLang] + ' (PIP)',
          width: 500,
          height: 320,
          galleryGroup: galleryGroup
        });

        if (c.featured) {
          const ribbon = document.createElement('span');
          ribbon.className = 'char-card__featured-ribbon';
          ribbon.textContent = t('char_featured_badge');
          pic.wrapper.appendChild(ribbon);
        }

        const body = document.createElement('div');
        body.className = 'char-card__body';

        const header = document.createElement('div');
        header.className = 'char-card__header';

        const titleWrap = document.createElement('div');
        const h3 = document.createElement('h3');
        h3.className = 'char-card__name';
        h3.textContent = c.name[currentLang];
        const role = document.createElement('span');
        role.className = 'char-card__role';
        role.textContent = c.role[currentLang];
        titleWrap.appendChild(h3);
        titleWrap.appendChild(role);

        const numBadge = document.createElement('span');
        numBadge.className = 'char-card__num';
        numBadge.textContent = '#' + c.num;

        header.appendChild(titleWrap);
        header.appendChild(numBadge);

        const quoteEl = document.createElement('blockquote');
        quoteEl.className = 'char-card__quote';
        quoteEl.textContent = c.quote[currentLang];

        const wishEl = document.createElement('p');
        wishEl.className = 'char-card__wish';
        wishEl.textContent = c.wish[currentLang];

        const readBtn = document.createElement('button');
        readBtn.type = 'button';
        readBtn.className = 'char-readmore-btn';
        readBtn.hidden = true;
        readBtn.setAttribute('aria-expanded', expandedChars[c.id] ? 'true' : 'false');
        readBtn.textContent = expandedChars[c.id] ? t('char_show_less') : t('char_read_more');
        readBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          expandedChars[c.id] = !expandedChars[c.id];
          syncReadMoreButtons();
          AudioEngine.playTick();
        });

        wishRefs.push({ id: c.id, wishEl: wishEl, readBtn: readBtn });

        const footer = document.createElement('div');
        footer.className = 'char-card__footer';

        const respectBtn = document.createElement('button');
        respectBtn.type = 'button';
        respectBtn.className = 'respect-btn';
        const fireIcon = document.createElement('span');
        fireIcon.textContent = '🔥';
        const btnText = document.createElement('span');
        btnText.textContent = t('respect_btn_label');
        const countBadge = document.createElement('span');
        countBadge.className = 'respect-btn__count';
        countBadge.textContent = String(Number(respectMap[c.id]) || 0);

        respectBtn.appendChild(fireIcon);
        respectBtn.appendChild(btnText);
        respectBtn.appendChild(countBadge);

        respectBtn.addEventListener('click', function (e) {
          addRespect(c.id, respectBtn, e);
        });

        footer.appendChild(respectBtn);

        body.appendChild(header);
        body.appendChild(quoteEl);
        body.appendChild(wishEl);
        body.appendChild(readBtn);
        body.appendChild(footer);

        card.appendChild(pic.wrapper);
        card.appendChild(body);
        grid.appendChild(card);
      });

      requestAnimationFrame(syncReadMoreButtons);
    }

    function renderTioMediaAndGrid() {
      const mediaBox = document.getElementById('tio-media-box');
      if (mediaBox) {
        mediaBox.textContent = '';
        const pair = document.createElement('div');
        pair.className = 'tio-media-pair';

        const tioPic = createSmartPicture({
          fileName: ASSETS.images.tioMain,
          alt: 'Tio Hector Salamanca',
          caption: 'Tio Hector Salamanca — DING! DING! DING!',
          initials: 'TH',
          width: 340,
          height: 280
        });

        const pollosPic = createSmartPicture({
          fileName: ASSETS.images.losPollos,
          alt: 'Los Pollos Hermanos',
          caption: 'Los Pollos Hermanos & Salamanca Bell',
          initials: 'LP',
          width: 340,
          height: 280
        });

        pair.appendChild(tioPic.wrapper);
        pair.appendChild(pollosPic.wrapper);
        mediaBox.appendChild(pair);
      }

      const lettersGrid = document.getElementById('tio-letters-grid');
      if (!lettersGrid) return;
      lettersGrid.textContent = '';
      tioNonSpaceIndices = [];

      for (let i = 0; i < TIO_MESSAGE.length; i += 1) {
        const ch = TIO_MESSAGE[i];
        const tile = document.createElement('span');
        if (ch === ' ') {
          tile.className = 'tio-tile tio-tile--space';
          tile.setAttribute('aria-hidden', 'true');
        } else {
          tile.className = 'tio-tile';
          tile.textContent = ch;
          tioNonSpaceIndices.push(tile);
        }
        lettersGrid.appendChild(tile);
      }

      updateTioVisuals();
    }

    function updateTioVisuals() {
      tioNonSpaceIndices.forEach(function (tile, idx) {
        tile.classList.toggle('is-lit', idx < tioIndex);
      });
      const label = document.getElementById('tio-progress-label');
      if (label) {
        label.textContent = tioIndex + ' / ' + tioNonSpaceIndices.length;
      }
    }

    return {
      init() {
        updateGlobalRespectUI();
        renderBannerAndCards();
        renderTioMediaAndGrid();

        const dingBtn = document.getElementById('tio-ding-btn');
        const resetBtn = document.getElementById('tio-reset-btn');

        if (dingBtn) {
          dingBtn.addEventListener('click', function (e) {
            AudioEngine.playBellDing();
            dingBtn.classList.remove('is-ringing');
            void dingBtn.offsetWidth;
            dingBtn.classList.add('is-ringing');

            if (tioIndex >= tioNonSpaceIndices.length) {
              tioIndex = 0;
            } else {
              tioIndex += 1;
            }
            updateTioVisuals();

            if (tioIndex === tioNonSpaceIndices.length) {
              Fireworks.finale();
              Toast.show(t('tio_complete_toast'));
            } else {
              Fireworks.burst(10, e.clientX, e.clientY);
            }
          });
        }

        if (resetBtn) {
          resetBtn.addEventListener('click', function () {
            tioIndex = 0;
            AudioEngine.playTick();
            updateTioVisuals();
          });
        }

        let resizeTimer = null;
        window.addEventListener('resize', function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(syncReadMoreButtons, 120);
        });
      },
      onLangChange() {
        renderBannerAndCards();
      },
      syncReadMoreButtons: function () {
        requestAnimationFrame(syncReadMoreButtons);
      }
    };
  })();

  /* ------------------------------------------------------------------------
     12. PAGE 4 MODULE: 2-TIER CAKE, 5 CANDLES, MIC WIND METER & 3 CAKES
     ------------------------------------------------------------------------ */
  const CakesModule = (function () {
    const STUDENT_CAKES = [
      {
        id: 'cake_foundation',
        file: ASSETS.images.cake1Lab,
        initials: 'C1',
        badge: {
          en: '🎓 From Foundation & Pre-IELTS Students',
          uz: '🎓 Foundation va Pre-IELTS shogirdlaridan'
        },
        title: {
          en: 'Heisenberg Lab & RV Birthday Cake',
          uz: 'Heisenberg Lab va RV Maxsus Torti'
        },
        text: {
          en: 'Thank you for turning grammar and reading fundamentals into an exciting adventure, Mr. Shakhzod Uralov! You taught us never to fear big goals — JUST DO IT!',
          uz: 'Ingliz tili poydevorini eng qiziqarli kimyoviy tajribadek o\'rgatganingiz uchun rahmat, Ustoz Shahzod Uralov! Siz bizga "Bahona qidirma — JUST DO IT!" deb katta maqsadlar qo\'yishni o\'rgatdingiz!'
        }
      },
      {
        id: 'cake_band8',
        file: ASSETS.images.cake2Crystal,
        initials: 'C2',
        badge: {
          en: '💎 From Band 7.5–8.0 Achievers',
          uz: '💎 Band 7.5–8.0 olgan shogirdlardan'
        },
        title: {
          en: '99.1% Blue Crystal & Hat Tribute Cake',
          uz: '99.1% Moviy Kristall va Shlyapa Torti'
        },
        text: {
          en: 'Every 7.5, 8.0, and Reading 9.0 score we achieved carries your signature formula: "0% Magic + 100% Sitting Down & Studying!" Wishing you an official Overall Band 9.0!',
          uz: 'Biz erishgan har bir Band 7.5, 8.0 va Reading 9.0 natijasida sizning "Sirli masalliq yo\'q — 100% o\'tirib dars qilish!" formulangiz bor. Sizga rasmiy Overall Band 9.0 tilaymiz!'
        }
      },
      {
        id: 'cake_everest',
        file: ASSETS.images.cake3Saul,
        initials: 'C3',
        badge: {
          en: '🏛️ On Behalf of Everest Samarqand Students',
          uz: '🏛️ Everest Samarqand shogirdlari nomidan'
        },
        title: {
          en: '"Better Call Ustoz Shahzod!" Celebration Cake',
          uz: '"Better Call Saul & Ustoz Shahzod!" Bayram Torti'
        },
        text: {
          en: 'From the entire Everest Samarqand family: Happy November 12 Birthday! Keep inspiring thousands of learners until — BOOM! — every dream turns into reality!',
          uz: 'Butun Everest Samarqand oilasi nomidan 12-noyabr tug\'ilgan kuningiz muborak bo\'lsin! Qilasan, qilasan — keyin birdan BUM! — barcha ezgu tilaklaringiz ro\'yobga chiqsin!'
        }
      }
    ];

    let candlesBlown = false;
    let micStream = null;
    let micSource = null;
    let analyser = null;
    let micRafId = null;
    let noiseFloor = 0.02;
    let calibrating = false;
    let blowProgress = 0;
    let candleTimers = [];
    let wishCounts = SafeStorage.getJSON(STORAGE_KEYS.wishes, {});

    function setWindUI(powerPercent, statusKey) {
      const clamped = Math.max(0, Math.min(100, Math.round(powerPercent)));
      const valEl = document.getElementById('wind-power-val');
      const barEl = document.getElementById('wind-power-bar');
      const statusEl = document.getElementById('wind-status-text');

      if (valEl) valEl.textContent = clamped + '%';
      if (barEl) barEl.style.width = clamped + '%';
      if (statusEl && statusKey) {
        statusEl.textContent = t(statusKey);
      }

      /* Bend flames dynamically according to wind strength */
      const angle = (clamped * 0.34).toFixed(1) + 'deg';
      document.querySelectorAll('#lab-candles-row .lab-flame').forEach(function (flame) {
        flame.style.setProperty('--wind-angle', angle);
      });
    }

    function stopMicStream() {
      if (micRafId) {
        cancelAnimationFrame(micRafId);
        micRafId = null;
      }
      if (micSource) {
        try { micSource.disconnect(); } catch (e) {}
        micSource = null;
      }
      if (micStream) {
        try {
          micStream.getTracks().forEach(function (track) {
            track.stop();
          });
        } catch (e) {}
        micStream = null;
      }
      analyser = null;
      calibrating = false;
      const micBtn = document.getElementById('mic-start-btn');
      if (micBtn) {
        micBtn.disabled = candlesBlown;
        const span = micBtn.querySelector('[data-i18n]');
        if (span) span.textContent = t('mic_enable_btn');
      }
    }

    function extinguishAllCandles() {
      if (candlesBlown) return;
      candlesBlown = true;
      stopMicStream();
      setWindUI(100, 'wind_status_out');

      const candles = document.querySelectorAll('#lab-candles-row .lab-candle');
      candleTimers.forEach(clearTimeout);
      candleTimers = [];

      candles.forEach(function (candle, idx) {
        const timer = setTimeout(function () {
          candle.classList.add('is-out');
          AudioEngine.playWhoosh();
        }, idx * 105);
        candleTimers.push(timer);
      });

      setTimeout(function () {
        const banner = document.getElementById('wish-celebration-banner');
        if (banner) banner.hidden = false;
        const relightBtn = document.getElementById('relight-candles-btn');
        if (relightBtn) relightBtn.hidden = false;
        const manualBtn = document.getElementById('manual-blow-btn');
        if (manualBtn) manualBtn.disabled = true;

        Fireworks.finale();
        AudioEngine.playHappyBirthday();
        Toast.show(t('cakes_wish_accepted'));
      }, candles.length * 105 + 120);
    }

    function relightCandles() {
      candleTimers.forEach(clearTimeout);
      candleTimers = [];
      candlesBlown = false;
      blowProgress = 0;

      document.querySelectorAll('#lab-candles-row .lab-candle').forEach(function (c) {
        c.classList.remove('is-out');
      });

      const banner = document.getElementById('wish-celebration-banner');
      if (banner) banner.hidden = true;
      const relightBtn = document.getElementById('relight-candles-btn');
      if (relightBtn) relightBtn.hidden = true;
      const manualBtn = document.getElementById('manual-blow-btn');
      if (manualBtn) manualBtn.disabled = false;
      const micBtn = document.getElementById('mic-start-btn');
      if (micBtn) micBtn.disabled = false;

      setWindUI(0, 'wind_status_ready');
      AudioEngine.stopMusic();
      AudioEngine.playChime(2);
    }

    function startMicrophoneDetection() {
      if (candlesBlown || micStream) return;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setWindUI(0, 'wind_status_mic_denied');
        Toast.show(t('wind_status_mic_denied'));
        return;
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        setWindUI(0, 'wind_status_mic_denied');
        return;
      }

      const preferredAudio = {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      };

      const micRequest = navigator.mediaDevices.getUserMedia(preferredAudio).catch(function () {
        return navigator.mediaDevices.getUserMedia({ audio: true });
      });

      micRequest
        .then(function (stream) {
          if (candlesBlown || Router.getCurrentRoute() !== 'cakes') {
            stream.getTracks().forEach(function (tr) { tr.stop(); });
            return;
          }
          micStream = stream;
          const micCtx = new AudioCtx();
          if (micCtx.state === 'suspended') {
            micCtx.resume().catch(function () {});
          }
          micSource = micCtx.createMediaStreamSource(stream);
          analyser = micCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.45;
          micSource.connect(analyser);

          const freqData = new Uint8Array(analyser.frequencyBinCount);
          const timeData = new Uint8Array(analyser.fftSize);
          calibrating = true;
          const floorSamples = [];
          const calibStart = performance.now();
          let lastFrameTime = calibStart;

          const micBtn = document.getElementById('mic-start-btn');
          if (micBtn) {
            const span = micBtn.querySelector('[data-i18n]');
            if (span) span.textContent = t('mic_active_btn');
          }
          setWindUI(0, 'wind_status_calibrating');

          function sampleMic() {
            if (!analyser || candlesBlown || Router.getCurrentRoute() !== 'cakes') {
              try { micCtx.close(); } catch (e) {}
              stopMicStream();
              return;
            }
            analyser.getByteFrequencyData(freqData);
            analyser.getByteTimeDomainData(timeData);

            /* Low-frequency breath rumble (bins 1..12, skipping DC bin 0) */
            let lowSum = 0;
            const startBin = 1;
            const endBin = Math.min(12, freqData.length);
            for (let i = startBin; i <= endBin; i += 1) {
              lowSum += freqData[i];
            }
            const lowAvg = lowSum / (Math.max(1, endBin - startBin + 1) * 255);

            /* Time-domain RMS excursion for strong airflow burst */
            let sqSum = 0;
            for (let j = 0; j < timeData.length; j += 1) {
              const centered = (timeData[j] - 128) / 128;
              sqSum += centered * centered;
            }
            const rms = Math.sqrt(sqSum / timeData.length);
            const windEnergy = lowAvg * 0.65 + Math.min(1, rms * 1.45) * 0.35;

            const now = performance.now();
            const dtSec = Math.min(0.1, Math.max(0.008, (now - lastFrameTime) / 1000));
            lastFrameTime = now;

            if (calibrating) {
              const elapsed = now - calibStart;
              /* Ignore initial 250ms hardware mic activation transient */
              if (elapsed >= 250) {
                floorSamples.push(windEnergy);
              }
              if (elapsed >= 950) {
                calibrating = false;
                const sorted = floorSamples.slice().sort(function (a, b) { return a - b; });
                const p85Idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.85));
                const baseline = sorted.length ? sorted[p85Idx] : 0.06;
                noiseFloor = Math.max(0.12, Math.min(0.45, baseline + 0.085));
                blowProgress = 0;
                setWindUI(0, 'wind_status_listening');
              }
              micRafId = requestAnimationFrame(sampleMic);
              return;
            }

            /* Require a genuine sustained strong blow clearly above ambient room level */
            const excess = Math.max(0, windEnergy - noiseFloor);
            if (excess > 0.11) {
              blowProgress = Math.min(100, blowProgress + excess * 95 * (dtSec * 60) * 0.32);
            } else {
              blowProgress = Math.max(0, blowProgress - 22 * dtSec);
            }

            setWindUI(blowProgress, 'wind_status_listening');

            if (blowProgress >= 100) {
              extinguishAllCandles();
              try { micCtx.close(); } catch (e) {}
              return;
            }

            micRafId = requestAnimationFrame(sampleMic);
          }

          micRafId = requestAnimationFrame(sampleMic);
        })
        .catch(function () {
          setWindUI(0, 'wind_status_mic_denied');
          Toast.show(t('wind_status_mic_denied'));
        });
    }

    function renderStudentCakes() {
      const grid = document.getElementById('cakes-cards-grid');
      if (!grid) return;
      grid.textContent = '';

      const gallery = STUDENT_CAKES.map(function (c) {
        return {
          file: c.file,
          caption: c.title[currentLang] + ' — ' + c.badge[currentLang]
        };
      });

      STUDENT_CAKES.forEach(function (cake) {
        const card = document.createElement('article');
        card.className = 'cake-card card-surface tilt-card';

        const pic = createSmartPicture({
          fileName: cake.file,
          alt: cake.title[currentLang],
          caption: cake.title[currentLang] + ' — ' + cake.text[currentLang],
          initials: cake.initials,
          width: 500,
          height: 320,
          galleryGroup: gallery
        });

        const body = document.createElement('div');
        body.className = 'cake-card__body';

        const top = document.createElement('div');
        const badge = document.createElement('span');
        badge.className = 'cake-card__badge';
        badge.textContent = cake.badge[currentLang];

        const h3 = document.createElement('h3');
        h3.className = 'cake-card__title';
        h3.textContent = cake.title[currentLang];

        const p = document.createElement('p');
        p.className = 'cake-card__text';
        p.textContent = cake.text[currentLang];

        top.appendChild(badge);
        top.appendChild(h3);
        top.appendChild(p);

        const wishBtn = document.createElement('button');
        wishBtn.type = 'button';
        wishBtn.className = 'btn btn--sm btn--outline';
        const currentCount = Number(wishCounts[cake.id]) || 0;
        wishBtn.textContent = t('cake_wish_btn') + (currentCount > 0 ? ' (' + currentCount + ')' : '');

        wishBtn.addEventListener('click', function (e) {
          wishCounts[cake.id] = (Number(wishCounts[cake.id]) || 0) + 1;
          SafeStorage.setJSON(STORAGE_KEYS.wishes, wishCounts);
          wishBtn.textContent = t('cake_wish_btn') + ' (' + wishCounts[cake.id] + ')';
          AudioEngine.playChime(3);
          Fireworks.burst(18, e.clientX, e.clientY);
          Toast.show(t('cake_wish_toast'));
        });

        body.appendChild(top);
        body.appendChild(wishBtn);

        card.appendChild(pic.wrapper);
        card.appendChild(body);
        grid.appendChild(card);
      });
    }

    return {
      init() {
        renderStudentCakes();

        const micBtn = document.getElementById('mic-start-btn');
        const manualBtn = document.getElementById('manual-blow-btn');
        const relightBtn = document.getElementById('relight-candles-btn');

        if (micBtn) {
          micBtn.addEventListener('click', function () {
            AudioEngine.unlock();
            AudioEngine.playTick();
            startMicrophoneDetection();
          });
        }

        if (manualBtn) {
          manualBtn.addEventListener('click', function () {
            if (candlesBlown) return;
            AudioEngine.unlock();
            /* Smooth quick ramp to 100% then blow out */
            let p = 25;
            const ramp = setInterval(function () {
              p += 25;
              setWindUI(p);
              if (p >= 100) {
                clearInterval(ramp);
                extinguishAllCandles();
              }
            }, 70);
          });
        }

        if (relightBtn) {
          relightBtn.addEventListener('click', relightCandles);
        }
      },
      stopMicStream: stopMicStream,
      onLangChange() {
        renderStudentCakes();
        const statusEl = document.getElementById('wind-status-text');
        if (statusEl) {
          statusEl.textContent = candlesBlown ? t('wind_status_out') : t('wind_status_ready');
        }
      }
    };
  })();

  /* ------------------------------------------------------------------------
     13. PAGE 5 MODULE: @AZIZJONDEV TRIBUTE, FORTUNE REACTOR, CRYSTALS, IDE
     ------------------------------------------------------------------------ */
  const AzizjonModule = (function () {
    const STICKERS = [
      {
        id: 'fortune_23',
        icon: '🎂',
        enLabel: 'Age 23 Elixir',
        uzLabel: '23 Yosh Eliksiri',
        enTip: '🧪 Reaction Complete! Age 23 Forecast: Zero stress, endless proud students at Everest Samarqand, and an unstoppable Overall Band 9.0 streak ahead!',
        uzTip: '🧪 Reaksiya Yakunlandi! 23 Yosh Bashorati: Everest Samarqandda faxrli shogirdlar soni ortib, Overall Band 9.0 cho\'qqisi shu yil zabt etiladi!'
      },
      {
        id: 'fortune_energy',
        icon: '⚡',
        enLabel: 'Heisenberg Spark',
        uzLabel: 'Heisenberg Quvvati',
        enTip: '⚡ 99.1% Pure Classroom Energy Detected! One lesson with Mr. Shakhzod Uralov melts Band 5.5 fears straight into Band 8.0+ confidence.',
        uzTip: '⚡ Darsxonada 99.1% Sof Energiya! Ustoz Shahzod Uralovning bitta darsi Band 5.5 qo\'rquvini soniyada Band 8.0+ ishonchiga aylantiradi.'
      },
      {
        id: 'fortune_reading',
        icon: '📖',
        enLabel: 'Reading 9.0 Rune',
        uzLabel: 'Reading 9.0 Sirli Kaliti',
        enTip: '📖 Lab Decryption: True/False/Not Given traps tremble before a Reading 9.0 Grandmaster — every passage surrenders in half the time!',
        uzTip: '📖 Lab Dekoderi: True/False/Not Given tuzoqlari Reading 9.0 ustasi qarshisida taslim bo\'ladi — har bir matn siri yarim vaqtda ochiladi!'
      },
      {
        id: 'fortune_rule',
        icon: '💥',
        enLabel: 'BUM! Catalyst',
        uzLabel: 'BUM! Katalizator',
        enTip: '💥 Law #3 Activated: Keep grinding silently until the critical mass explodes — BOOM! Sudden 2.0 Band jump unlocked!',
        uzTip: '💥 3-Qonun Faollashdi: Sabr bilan harakat qilasan, qilasan — va kritik nuqtada BIRDAN BUM! Kutilmagan katta sakrash tayyor!'
      },
      {
        id: 'fortune_luck',
        icon: '🍀',
        enLabel: 'Golden Luck Potion',
        uzLabel: 'Oltin Omad Reaktori',
        enTip: '🍀 Special Birthday Luck Synthesis: May every new group at Everest hit record high IELTS averages while your smile never fades!',
        uzTip: '🍀 Tug\'ilgan Kun Omad Sintezi: Har bir yangi guruhingiz rekord natija qayd etsin, yuzingizdan esa hech qachon tabassum arimasin!'
      },
      {
        id: 'fortune_crown',
        icon: '👑',
        enLabel: 'Band 9.0 Prophecy',
        uzLabel: 'Band 9.0 Bashorati',
        enTip: '👑 Heisenberg Official Verdict: Listening 9.0 · Reading 9.0 · Writing 9.0 · Speaking 9.0. Date: Soon. Formula: 100% Earned!',
        uzTip: '👑 Heisenberg Rasmiy Hukmi: Listening 9.0 · Reading 9.0 · Writing 9.0 · Speaking 9.0. Sana: Yaqin kunlarda. Formula: 100% Halol Mehnat!'
      }
    ];

    const CRYSTALS = [
      {
        id: 'c_reading',
        label: '💎 Reading 9.0',
        enRule: '💎 Reading 9.0 Rule: Never hunt for identical words — scan for structural and conceptual paraphrases, and verify every True / False / Not Given claim against exact evidence!',
        uzRule: '💎 Reading 9.0 Qoidasi: Matndan aynan bir xil so\'zni qidirmang — ma\'nodosh (paraphrase) fikrlarni ushlang va True / False / Not Given shartlarini zargarona aniqlik bilan tahlil qiling!'
      },
      {
        id: 'c_listening',
        label: '💎 Listening 9.0',
        enRule: '💎 Listening 9.0 Rule: Use the 30-second pause to predict word types, watch out for speaker self-corrections (distractors), and lock in spelling accuracy!',
        uzRule: '💎 Listening 9.0 Qoidasi: 30 soniyalik tanaffusda javob turini oldindan taxmin qiling, chalg\'ituvchi tuzoqlarga (distractors) aldanmang va diqqatni 1 soniya ham uzmang!'
      },
      {
        id: 'c_writing',
        label: '💎 Writing 9.0',
        enRule: '💎 Writing 9.0 Rule: Spend 5 minutes planning before writing a single word — build a crystal-clear thesis, logical topic sentences, and natural academic collocations!',
        uzRule: '💎 Writing 9.0 Qoidasi: Yozishdan oldin 5 daqiqa aniq reja tuzing — har bir paragraf bitta markaziy g\'oyani ochib bersin va tabiiy akademik birikmalardan foydalaning!'
      },
      {
        id: 'c_speaking',
        label: '💎 Speaking 9.0',
        enRule: '💎 Speaking 9.0 Rule: Drop robotic memorized scripts — speak with natural rhythm, idiomatic precision, and fearless confidence. No excuses — JUST DO IT!',
        uzRule: '💎 Speaking 9.0 Qoidasi: Yodlangan shablonlarni unuting — fikringizni tabiiy ohang, boy lug\'at va ishonch bilan yetkazing. Bahona qidirmang — JUST DO IT!'
      },
      {
        id: 'c_overall',
        label: '👑 Overall Band 9.0',
        enRule: '👑 Overall Band 9.0 Law (Uralov Formula): "There is NO secret ingredient — sit down and study! You grind, grind, grind... and then suddenly BOOM: Band 9.0!"',
        uzRule: '👑 Overall Band 9.0 Qonuni (Uralov Formulasi): "Hech qanday sirli masalliq yo\'q — o\'tirib dars qilish kerak! Qilasan, qilasan... keyin birdaniga BUM: Band 9.0!"'
      }
    ];

    const TERMINAL_CODE = {
      en: [
        '// Breaking Barriers — Band 9.0 Synthesis Engine',
        'const teacher = "Mr. Shakhzod Uralov";',
        'const rules = ["JUST DO IT", "NO SECRET INGREDIENT", "WORK -> BOOM!"];',
        'function synthesizeBand9(mentor) {',
        '  return { reading: 9.0, listening: 9.0, writing: 9.0, speaking: 9.0, overall: 9.0 };',
        '}'
      ].join('\n'),
      uz: [
        '// Breaking Barriers — Band 9.0 Sintez Dvigateli',
        'const ustoz = "Ustoz Shahzod Uralov";',
        'const qoidalar = ["JUST DO IT", "SIRLI MASALLIQ YO\'Q", "QILASAN -> BUM!"];',
        'function sintezBand9(mentor) {',
        '  return { reading: 9.0, listening: 9.0, writing: 9.0, speaking: 9.0, overall: 9.0 };',
        '}'
      ].join('\n')
    };

    const TERMINAL_OUTPUT = {
      en: [
        '> Compiling Everest Samarqand 99.1% Pure Formula...',
        '✔ reading   = 9.0 (Verified Master)',
        '✔ listening = 9.0 (Crystal Clarity)',
        '✔ writing   = 9.0 (Flawless Coherence)',
        '✔ speaking  = 9.0 (Natural Authority)',
        '🎉 RESULT: OVERALL BAND 9.0 UNLOCKED FOR MR. SHAKHZOD URALOV!'
      ],
      uz: [
        '> Everest Samarqand 99.1% Sof Formulasi ishga tushmoqda...',
        '✔ reading   = 9.0 (Maksimal Natija)',
        '✔ listening = 9.0 (Kristall Aniqlik)',
        '✔ writing   = 9.0 (Mukammal Mantiq)',
        '✔ speaking  = 9.0 (Erkin va Ravon)',
        '🎉 NATIJA: USTOZ SHAHZOD URALOV UCHUN OVERALL BAND 9.0 OCHILDI!'
      ]
    };

    let activeStickerId = null;
    const triggeredStickers = {};
    let activeCrystalId = null;
    const collectedCrystals = {};
    let termTimers = [];
    let hasRunTerminal = false;

    function updateReactorPurityPill() {
      const pill = document.getElementById('reactor-streak-pill');
      if (!pill) return;
      const done = Object.keys(triggeredStickers).filter(function (k) { return triggeredStickers[k]; }).length;
      const purity = Math.min(100, 99.1 + done * 0.15).toFixed(1);
      pill.textContent = done >= STICKERS.length ? '👑 100.0% PURE!' : ('⚗️ ' + purity + '% (' + done + '/' + STICKERS.length + ')');
    }

    function renderStickers() {
      const grid = document.getElementById('stickers-grid');
      if (!grid) return;
      grid.textContent = '';

      STICKERS.forEach(function (st, idx) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sticker-btn' + (activeStickerId === st.id ? ' active' : '');
        const iconSpan = document.createElement('span');
        iconSpan.textContent = st.icon;
        const lblSpan = document.createElement('span');
        lblSpan.textContent = currentLang === 'uz' ? st.uzLabel : st.enLabel;
        btn.appendChild(iconSpan);
        btn.appendChild(lblSpan);

        btn.addEventListener('click', function (e) {
          activeStickerId = st.id;
          triggeredStickers[st.id] = true;
          updateReactorPurityPill();
          document.querySelectorAll('#stickers-grid .sticker-btn').forEach(function (b) {
            b.classList.remove('active');
          });
          btn.classList.add('active');
          const tipBox = document.getElementById('sticker-tip-box');
          if (tipBox) {
            tipBox.textContent = currentLang === 'uz' ? st.uzTip : st.enTip;
          }
          AudioEngine.playChime(idx);
          Fireworks.burst(18, e.clientX, e.clientY);
        });

        grid.appendChild(btn);
      });

      updateReactorPurityPill();

      const tipBox = document.getElementById('sticker-tip-box');
      if (tipBox) {
        if (activeStickerId) {
          const found = STICKERS.find(function (s) { return s.id === activeStickerId; });
          if (found) tipBox.textContent = currentLang === 'uz' ? found.uzTip : found.enTip;
        } else {
          tipBox.textContent = t('sticker_default_tip');
        }
      }
    }

    function countCollected() {
      return Object.keys(collectedCrystals).filter(function (k) { return collectedCrystals[k]; }).length;
    }

    function updateCrystalRuleBox() {
      const ruleBox = document.getElementById('crystal-rule-box');
      if (!ruleBox) return;
      if (activeCrystalId) {
        const found = CRYSTALS.find(function (c) { return c.id === activeCrystalId; });
        if (found) {
          ruleBox.textContent = currentLang === 'uz' ? found.uzRule : found.enRule;
          ruleBox.classList.add('is-highlighted');
          return;
        }
      }
      ruleBox.textContent = t('crystal_default_rule');
      ruleBox.classList.remove('is-highlighted');
    }

    function renderCrystalArena() {
      const arena = document.getElementById('crystal-arena');
      if (!arena) return;
      arena.textContent = '';

      CRYSTALS.forEach(function (cr, idx) {
        const btn = document.createElement('button');
        btn.type = 'button';
        const isDone = Boolean(collectedCrystals[cr.id]);
        btn.className = 'crystal-node' + (isDone ? ' is-collected' : '');
        btn.textContent = cr.label;

        btn.addEventListener('click', function (e) {
          const wasCollected = Boolean(collectedCrystals[cr.id]);
          activeCrystalId = cr.id;
          collectedCrystals[cr.id] = true;
          btn.classList.add('is-collected');
          updateCrystalRuleBox();

          const score = countCollected();
          const scoreEl = document.getElementById('crystal-score-text');
          if (scoreEl) scoreEl.textContent = score + ' / ' + CRYSTALS.length;

          AudioEngine.playChime(idx);
          Fireworks.burst(24, e.clientX, e.clientY);

          if (!wasCollected && score === CRYSTALS.length) {
            const cert = document.getElementById('prediction-certificate');
            if (cert) cert.hidden = false;
            AudioEngine.playFanfare();
            Fireworks.finale();
          }
        });

        arena.appendChild(btn);
      });

      const score = countCollected();
      const scoreEl = document.getElementById('crystal-score-text');
      if (scoreEl) scoreEl.textContent = score + ' / ' + CRYSTALS.length;
      const cert = document.getElementById('prediction-certificate');
      if (cert) cert.hidden = score < CRYSTALS.length;
      updateCrystalRuleBox();
    }

    function resetCrystals() {
      CRYSTALS.forEach(function (cr) {
        collectedCrystals[cr.id] = false;
      });
      activeCrystalId = null;
      AudioEngine.playTick();
      renderCrystalArena();
    }

    function buildSyntaxLine(lineText) {
      const spanWrap = document.createElement('span');
      spanWrap.className = 'tcode-txt';
      if (lineText.trim().indexOf('//') === 0) {
        const cmt = document.createElement('span');
        cmt.className = 'tok-cmt';
        cmt.textContent = lineText;
        spanWrap.appendChild(cmt);
        return spanWrap;
      }
      const tokenRe = new RegExp('("[^"]*")|\\b(const|function|return)\\b|\\b(9\\.0)\\b|\\b(synthesizeBand9|sintezBand9)\\b', 'g');
      let lastIdx = 0;
      let match = tokenRe.exec(lineText);
      while (match) {
        if (match.index > lastIdx) {
          spanWrap.appendChild(document.createTextNode(lineText.slice(lastIdx, match.index)));
        }
        const tok = document.createElement('span');
        if (match[1]) tok.className = 'tok-str';
        else if (match[2]) tok.className = 'tok-kw';
        else if (match[3]) tok.className = 'tok-num';
        else if (match[4]) tok.className = 'tok-fn';
        tok.textContent = match[0];
        spanWrap.appendChild(tok);
        lastIdx = tokenRe.lastIndex;
        match = tokenRe.exec(lineText);
      }
      if (lastIdx < lineText.length) {
        spanWrap.appendChild(document.createTextNode(lineText.slice(lastIdx)));
      }
      return spanWrap;
    }

    function renderTerminalCode() {
      const codeEl = document.getElementById('terminal-code-display');
      if (!codeEl) return;
      codeEl.textContent = '';
      const raw = TERMINAL_CODE[currentLang] || TERMINAL_CODE.en;
      raw.split('\n').forEach(function (lineText, idx) {
        const lineRow = document.createElement('div');
        lineRow.className = 'tcode-line';
        const ln = document.createElement('span');
        ln.className = 'tcode-ln';
        ln.textContent = idx < 9 ? '0' + (idx + 1) : String(idx + 1);
        lineRow.appendChild(ln);
        lineRow.appendChild(buildSyntaxLine(lineText));
        codeEl.appendChild(lineRow);
      });

      const outEl = document.getElementById('terminal-output-display');
      if (!outEl) return;
      outEl.textContent = '';
      if (hasRunTerminal) {
        setTerminalStatus('done');
        const lines = TERMINAL_OUTPUT[currentLang] || TERMINAL_OUTPUT.en;
        lines.forEach(function (line) {
          const div = document.createElement('div');
          div.textContent = line;
          outEl.appendChild(div);
        });
      } else {
        setTerminalStatus('idle');
        const placeholder = document.createElement('div');
        placeholder.className = 'terminal-output__empty';
        placeholder.textContent = currentLang === 'uz'
          ? '> Kodni ishga tushirish uchun "▶ Run Code" tugmasini bosing...'
          : '> Press "▶ Run Code" to execute Band 9.0 formula...';
        outEl.appendChild(placeholder);
      }
    }

    function setTerminalStatus(state) {
      const pill = document.getElementById('terminal-status-pill');
      if (!pill) return;
      pill.classList.remove('is-running', 'is-done');
      if (state === 'running') {
        pill.classList.add('is-running');
        pill.textContent = currentLang === 'uz' ? 'ISHLAMOQDA...' : 'RUNNING...';
      } else if (state === 'done') {
        pill.classList.add('is-done');
        pill.textContent = 'BAND 9.0 ✔';
      } else {
        pill.textContent = currentLang === 'uz' ? 'TAYYOR' : 'READY';
      }
    }

    function runTerminalSimulation() {
      const outEl = document.getElementById('terminal-output-display');
      if (!outEl) return;
      termTimers.forEach(clearTimeout);
      termTimers = [];
      outEl.textContent = '';
      hasRunTerminal = true;
      setTerminalStatus('running');

      const lines = TERMINAL_OUTPUT[currentLang] || TERMINAL_OUTPUT.en;
      lines.forEach(function (line, idx) {
        const timer = setTimeout(function () {
          const row = document.createElement('div');
          row.textContent = line;
          outEl.appendChild(row);
          if (idx < lines.length - 1) {
            AudioEngine.playTick();
          } else {
            setTerminalStatus('done');
            AudioEngine.playFanfare();
            Fireworks.launch();
          }
        }, idx * 240);
        termTimers.push(timer);
      });
    }

    return {
      init() {
        renderStickers();
        renderCrystalArena();
        renderTerminalCode();

        const replayBtn = document.getElementById('crystal-replay-btn');
        if (replayBtn) {
          replayBtn.addEventListener('click', resetCrystals);
        }

        const runBtn = document.getElementById('terminal-run-btn');
        if (runBtn) {
          runBtn.addEventListener('click', runTerminalSimulation);
        }
      },
      onLangChange() {
        renderStickers();
        updateCrystalRuleBox();
        renderTerminalCode();
      }
    };
  })();

  /* ------------------------------------------------------------------------
     14. LIGHTBOX MODAL, VIDEO MODAL & GLOBAL INITIALIZATION
     ------------------------------------------------------------------------ */
  const Lightbox = (function () {
    let modal = null;
    let imgEl = null;
    let captionEl = null;
    let counterEl = null;
    let gallery = [];
    let currentIndex = 0;
    let lastFocused = null;

    function showCurrent() {
      if (!gallery.length || !imgEl) return;
      const item = gallery[currentIndex];
      imgEl.style.display = 'block';
      imgEl.src = img(item.file);
      imgEl.alt = item.caption || teacherName();
      if (captionEl) captionEl.textContent = item.caption || teacherName();
      if (counterEl) counterEl.textContent = (currentIndex + 1) + ' / ' + gallery.length;
    }

    return {
      init() {
        modal = document.getElementById('lightbox-modal');
        imgEl = document.getElementById('lightbox-img');
        captionEl = document.getElementById('lightbox-caption');
        counterEl = document.getElementById('lightbox-counter');

        const closeBtn = document.getElementById('lightbox-close-btn');
        const backdrop = document.getElementById('lightbox-backdrop');
        const prevBtn = document.getElementById('lightbox-prev-btn');
        const nextBtn = document.getElementById('lightbox-next-btn');

        if (closeBtn) closeBtn.addEventListener('click', function () { Lightbox.close(); });
        if (backdrop) backdrop.addEventListener('click', function () { Lightbox.close(); });
        if (prevBtn) prevBtn.addEventListener('click', function () { Lightbox.prev(); });
        if (nextBtn) nextBtn.addEventListener('click', function () { Lightbox.next(); });
      },

      open(fileName, caption, groupArray) {
        if (!modal) return;
        lastFocused = document.activeElement;
        if (Array.isArray(groupArray) && groupArray.length > 0) {
          gallery = groupArray;
          const idx = gallery.findIndex(function (g) { return g.file === fileName; });
          currentIndex = idx !== -1 ? idx : 0;
        } else {
          gallery = [{ file: fileName, caption: caption || teacherName() }];
          currentIndex = 0;
        }

        modal.hidden = false;
        document.body.classList.add('modal-open');
        showCurrent();
        AudioEngine.playTick();
        const closeBtn = document.getElementById('lightbox-close-btn');
        if (closeBtn) closeBtn.focus();
      },

      close() {
        if (!modal || modal.hidden) return;
        modal.hidden = true;
        if (!VideoModal.isOpen()) {
          document.body.classList.remove('modal-open');
        }
        if (lastFocused && typeof lastFocused.focus === 'function') {
          lastFocused.focus();
        }
      },

      prev() {
        if (!gallery.length) return;
        currentIndex = (currentIndex - 1 + gallery.length) % gallery.length;
        AudioEngine.playTick();
        showCurrent();
      },

      next() {
        if (!gallery.length) return;
        currentIndex = (currentIndex + 1) % gallery.length;
        AudioEngine.playTick();
        showCurrent();
      },

      isOpen() {
        return Boolean(modal && !modal.hidden);
      }
    };
  })();

  const VideoModal = (function () {
    let modal = null;
    let videoEl = null;
    let stageEl = null;
    let missingBox = null;
    let titleEl = null;
    let closeBtnEl = null;
    let activeRuleId = '1';
    let currentBlobUrl = null;
    let lastFocused = null;
    const ruleBlobs = {};

    function cleanupBlob() {
      if (currentBlobUrl) {
        try { URL.revokeObjectURL(currentBlobUrl); } catch (e) {}
        currentBlobUrl = null;
      }
    }

    return {
      init() {
        modal = document.getElementById('video-modal');
        videoEl = document.getElementById('rule-video-player');
        stageEl = document.getElementById('video-player-stage');
        missingBox = document.getElementById('video-missing-box');
        titleEl = document.getElementById('video-modal-title');
        closeBtnEl = document.getElementById('video-modal-close');

        const backdrop = document.getElementById('video-modal-backdrop');
        const attachBtn = document.getElementById('video-modal-attach-btn');

        if (closeBtnEl) closeBtnEl.addEventListener('click', function () { VideoModal.close(); });
        if (backdrop) backdrop.addEventListener('click', function () { VideoModal.close(); });
        if (attachBtn) {
          attachBtn.addEventListener('click', function () {
            const input = document.querySelector('.js-rule-file-input[data-rule-id="' + activeRuleId + '"]');
            if (input) input.click();
          });
        }
      },

      openRuleVideo(ruleId) {
        if (!modal || !videoEl) return;
        AudioEngine.pauseForVideo();
        activeRuleId = String(ruleId);
        lastFocused = document.activeElement;
        modal.hidden = false;
        document.body.classList.add('modal-open');
        if (titleEl) {
          titleEl.textContent = t('rule' + activeRuleId + '_title');
        }
        if (closeBtnEl) {
          closeBtnEl.focus();
        }

        if (ruleBlobs[activeRuleId]) {
          this.openWithBlobFile(activeRuleId, ruleBlobs[activeRuleId]);
          return;
        }

        const src = ASSETS.video[activeRuleId] || ('assets/video/rule' + activeRuleId + '.mp4');
        missingBox.hidden = true;
        if (stageEl) stageEl.hidden = false;
        videoEl.hidden = false;
        videoEl.src = src;

        videoEl.onerror = function () {
          videoEl.onerror = null;
          videoEl.hidden = true;
          if (stageEl) stageEl.hidden = true;
          missingBox.hidden = false;
        };

        videoEl.play().catch(function () {
          /* Autoplay or missing file handled gracefully */
        });
      },

      openWithBlobFile(ruleId, fileObj) {
        if (!modal || !videoEl) return;
        AudioEngine.pauseForVideo();
        activeRuleId = String(ruleId);
        ruleBlobs[activeRuleId] = fileObj;
        cleanupBlob();
        currentBlobUrl = URL.createObjectURL(fileObj);

        if (modal.hidden) {
          lastFocused = document.activeElement;
          modal.hidden = false;
        }
        document.body.classList.add('modal-open');
        if (titleEl) {
          titleEl.textContent = t('rule' + activeRuleId + '_title') + ' — ' + fileObj.name;
        }
        if (closeBtnEl) {
          closeBtnEl.focus();
        }
        missingBox.hidden = true;
        if (stageEl) stageEl.hidden = false;
        videoEl.hidden = false;
        videoEl.onerror = null;
        videoEl.src = currentBlobUrl;
        videoEl.play().catch(function () {});
      },

      close() {
        if (!modal || modal.hidden) return;
        if (videoEl) {
          try { videoEl.pause(); } catch (e) {}
          videoEl.removeAttribute('src');
          videoEl.load();
        }
        cleanupBlob();
        modal.hidden = true;
        AudioEngine.resumeAfterVideo();
        if (!Lightbox.isOpen()) {
          document.body.classList.remove('modal-open');
        }
        if (lastFocused && typeof lastFocused.focus === 'function') {
          lastFocused.focus();
        }
      },

      isOpen() {
        return Boolean(modal && !modal.hidden);
      }
    };
  })();

  /* Apply translations across the entire DOM without breaking state */
  function applyLanguage(lang) {
    currentLang = lang === 'uz' ? 'uz' : 'en';
    document.documentElement.setAttribute('lang', currentLang);
    SafeStorage.set(STORAGE_KEYS.lang, currentLang);

    /* Update EN | UZ toggle button visual state (navbar + intro overlay) */
    const enOpt = document.getElementById('lang-opt-en');
    const uzOpt = document.getElementById('lang-opt-uz');
    if (enOpt) enOpt.classList.toggle('active', currentLang === 'en');
    if (uzOpt) uzOpt.classList.toggle('active', currentLang === 'uz');

    const introEnOpt = document.getElementById('intro-lang-en');
    const introUzOpt = document.getElementById('intro-lang-uz');
    if (introEnOpt) introEnOpt.classList.toggle('active', currentLang === 'en');
    if (introUzOpt) introUzOpt.classList.toggle('active', currentLang === 'uz');

    const introThemeLabel = document.getElementById('intro-theme-label');
    if (introThemeLabel && typeof Theme !== 'undefined') {
      introThemeLabel.textContent = t(Theme.current === 'light' ? 'intro_theme_light' : 'intro_theme_dark');
    }

    /* 1. Update all [data-i18n] text nodes */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key);
      }
    });

    /* 2. Update all [data-i18n-attr] attributes */
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      const spec = el.getAttribute('data-i18n-attr') || '';
      spec.split('|').forEach(function (pair) {
        const parts = pair.split(':');
        if (parts.length === 2) {
          const attrName = parts[0].trim();
          const key = parts[1].trim();
          el.setAttribute(attrName, t(key));
        }
      });
    });

    /* 3. Render segmented periodic titles for all sections */
    const segs = TITLE_SEGMENTS[currentLang] || TITLE_SEGMENTS.en;
    renderTitle(document.getElementById('hero-page-title'), segs.hero);
    renderTitle(document.getElementById('rules-section-title'), segs.rules);
    renderTitle(document.getElementById('mixer-section-title'), segs.mixer);
    renderTitle(document.getElementById('evidence-page-title'), segs.evidence);
    renderTitle(document.getElementById('archive-section-title'), segs.archive);
    renderTitle(document.getElementById('characters-page-title'), segs.characters);
    renderTitle(document.getElementById('cakes-page-title'), segs.cakes);
    renderTitle(document.getElementById('azizjon-page-title'), segs.azizjon);

    /* 4. Refresh dynamic modules */
    Router.refreshTitle();
    HeroModule.onLangChange();
    MixerModule.onLangChange();
    EvidenceModule.onLangChange();
    CharactersModule.onLangChange();
    CakesModule.onLangChange();
    AzizjonModule.onLangChange();
  }

  function initNavbarLogo() {
    const logoImg = document.getElementById('navbar-logo-img');
    if (!logoImg) return;
    logoImg.src = img(ASSETS.images.archiveLogo);
    logoImg.onerror = function () {
      logoImg.onerror = null;
      const wrap = logoImg.closest('.lab-navbar__logo-wrap');
      if (wrap) wrap.classList.add('is-fallback');
    };
  }

  function initChannelLogo() {
    const logoBtn = document.getElementById('channel-logo-btn');
    const logoImg = document.getElementById('channel-logo-img');
    const logoInput = document.getElementById('channel-logo-input');
    const footerLogo = document.getElementById('footer-channel-logo');
    if (!logoBtn || !logoImg || !logoInput) return;

    function applyChannelLogoSrc(src) {
      if (!src) return;
      logoImg.onload = function () {
        logoBtn.classList.add('has-custom-logo');
        if (footerLogo) {
          footerLogo.src = src;
          footerLogo.hidden = false;
        }
      };
      logoImg.onerror = function () {
        logoImg.onerror = null;
        logoBtn.classList.remove('has-custom-logo');
        if (footerLogo) {
          footerLogo.hidden = true;
        }
      };
      logoImg.src = src;
    }

    const savedLogo = SafeStorage.get(STORAGE_KEYS.channelLogo, null);
    if (savedLogo) {
      applyChannelLogoSrc(savedLogo);
    } else {
      applyChannelLogoSrc(img(ASSETS.images.channelLogo));
    }

    logoBtn.addEventListener('click', function () {
      logoInput.click();
    });

    logoInput.addEventListener('change', function () {
      const fileObj = logoInput.files && logoInput.files[0];
      if (!fileObj) return;
      const reader = new FileReader();
      reader.onload = function (ev) {
        const dataUrl = ev.target && ev.target.result ? String(ev.target.result) : URL.createObjectURL(fileObj);
        SafeStorage.set(STORAGE_KEYS.channelLogo, dataUrl);
        applyChannelLogoSrc(dataUrl);
        AudioEngine.playChime(3);
        Toast.show(t('channel_logo_updated_toast'));
      };
      reader.onerror = function () {
        const blobUrl = URL.createObjectURL(fileObj);
        applyChannelLogoSrc(blobUrl);
        AudioEngine.playChime(3);
        Toast.show(t('channel_logo_updated_toast'));
      };
      reader.readAsDataURL(fileObj);
      logoInput.value = '';
    });
  }

  function init() {
    verifyManifest();
    initNavbarLogo();
    initChannelLogo();
    Theme.init();
    AudioEngine.init();
    Fireworks.init();
    Tilt.init();
    Lightbox.init();
    VideoModal.init();
    IntroOverlay.init();
    Router.init();

    HeroModule.init();
    MixerModule.init();
    EvidenceModule.init();
    CharactersModule.init();
    CakesModule.init();
    AzizjonModule.init();

    applyLanguage(currentLang);

    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        AudioEngine.playTick();
        applyLanguage(currentLang === 'en' ? 'uz' : 'en');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
