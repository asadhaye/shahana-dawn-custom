// Lightweight focus trap for immersive cart modal-like shell
(function () {
  function trapFocus(container) {
    var focusable = container.querySelectorAll(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    first.focus();
    document.addEventListener(
      'keydown',
      function (e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      },
      true,
    );
  }

  document.addEventListener('DOMContentLoaded', function () {
    var shell = document.querySelector('.immersive-cart-shell__panel');
    if (!shell) return;
    trapFocus(shell);

    // Close button — navigate to href stored in data attribute
    var closeBtn = document.querySelector('[data-close-href]');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        window.location.href = closeBtn.getAttribute('data-close-href');
      });
    }

    // Close on Escape — return to 3D store
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        window.location.href = '/pages/immersive';
      }
    });
  });
})();
