/* ==========================================================
   HOUSE OF SAND: site.js
   the ONE place for my contact info, my checkout address,
   and the ON/OFF switches for my pages.
   change stuff here and it updates on every page.
   ========================================================== */

const SITE = {

  // my email. shows in every footer, the bookings form, and the "checkout broke" message
  email: 'you@example.com',                          // TODO: put my real email here

  // my instagram. the link goes to the url, the text shows the handle
  instagram: 'https://instagram.com/yourhandle',     // TODO: my real instagram link
  instagramHandle: '@yourhandle',                    // TODO: how it should read on the page

  // where the stickers page sends the cart when someone hits "checkout".
  //
  //  - hosting EVERYTHING on cloudflare pages?  leave this as '/api/checkout'
  //  - site is on github pages?  github can't run the checkout code, so paste the FULL
  //    address of my cloudflare function here instead, like:
  //      'https://house-of-sand.pages.dev/api/checkout'
  //    (see the readme for the setup steps)
  checkoutUrl: '/api/checkout',


  // ==========================================================
  //   PAGE ON/OFF SWITCHES  <-- the easy flip!
  //
  //   false = people see the cute "under construction" notice instead of the page
  //   true  = people see the real page
  //
  //   all the code for each page is still in its .html file, just hidden while
  //   it's false. when a page is ready: change its false to true, save this
  //   file, and upload it. that's it!
  //
  //   (the stickers page is always on, so it's not in this list)
  // ==========================================================
  live: {
    home: false,
    about: false,
    bookings: false
  }
};


/* ---------- is this page switched off? ----------
   every page's <html> tag says which page it is (data-page="home", "about", etc).
   if its switch above is false, we tag the page as "wip" (work in progress) and
   style.css hides the real content + shows the construction notice.
   this runs up in the <head> so you never see a flash of the real page first. */
const PAGE = document.documentElement.dataset.page;

// secret peek: add ?preview to the end of any page's address (like about.html?preview)
// to see the real page even while it's switched off. handy for checking my work
const PEEKING = location.search.includes('preview');

const IS_OFF = SITE.live[PAGE] === false;      // true only if this page is switched off

if (IS_OFF && !PEEKING) {
  document.documentElement.classList.add('wip');
}


/* everything below needs the page to be loaded first, so it waits for that */
document.addEventListener('DOMContentLoaded', () => {


  /* ---------- little "preview mode" tag ----------
     shows in the corner when i'm peeking at a switched-off page,
     so i don't forget it's still hidden from everyone else */
  if (IS_OFF && PEEKING) {
    const tag = document.createElement('div');
    tag.id = 'peek';
    tag.textContent = 'preview: this page is still switched off for visitors';
    document.body.appendChild(tag);
  }


  /* ---------- click-to-enlarge photos ----------
     tap a gallery photo, my about photo, or a sticker picture and it opens
     full screen. tap anywhere (or hit esc) to close.
     to turn this off, delete this whole section. the css for it is
     at the bottom of style.css under "CLICK-TO-ENLARGE" */
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-label', 'enlarged photo');
  const bigPhoto = document.createElement('img');
  lightbox.appendChild(bigPhoto);
  document.body.appendChild(lightbox);

  const closeLightbox = () => lightbox.classList.remove('show');

  document.addEventListener('click', e => {
    const img = e.target.closest('.photo img, .tile img');   // which photos can be enlarged
    if (img) {
      bigPhoto.src = img.currentSrc || img.src;
      bigPhoto.alt = img.alt;
      lightbox.classList.add('show');
    } else if (lightbox.contains(e.target)) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });


  /* ---------- fills in every email / instagram link on the page ----------
     any link with data-email or data-instagram in the html gets set up here,
     so i never have to hunt for them */
  document.querySelectorAll('[data-email]').forEach(a => {
    a.href = 'mailto:' + SITE.email;
    a.textContent = SITE.email;
  });

  document.querySelectorAll('[data-instagram]').forEach(a => {
    a.href = SITE.instagram;
    a.textContent = SITE.instagramHandle;
    a.target = '_blank';
    a.rel = 'noopener';
  });

});
