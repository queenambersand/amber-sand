/* ==========================================================
   HOUSE OF SAND: site.js
   the ONE place for my contact info + checkout address.
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
  checkoutUrl: '/api/checkout'
};


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
