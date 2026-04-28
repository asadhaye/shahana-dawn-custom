(function(){
  // Simple focus trap for accessibility
  function trap(container){
    var focusables = container.querySelectorAll('a[href], button, input, textarea, select');
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    first.focus();
    document.addEventListener('keydown', function(e){
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  document.addEventListener('DOMContentLoaded', function(){
    var panel = document.querySelector('.immersive-checkout-shell__panel');
    if (!panel) return;
    trap(panel);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') { window.location.href = '/pages/immersive'; } });
  });
})();
