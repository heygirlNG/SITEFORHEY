(function () {
  const INBOXES = {
    support: 'support@heychathq.com',
    partnerships: 'partnerships@heychathq.com'
  };

  document.querySelectorAll('form[data-contact-form]').forEach((form) => {
    const status = form.querySelector('.form-status');

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const values = Object.fromEntries(formData.entries());
      const email = String(values.email || '').trim();
      const inbox = INBOXES[form.dataset.inbox] || INBOXES.support;

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (status) {
          status.className = 'form-status err';
          status.textContent = 'Please enter a valid email address.';
        }
        return;
      }

      const subject = encodeURIComponent(values.subject || 'Heychat contact request');
      const body = encodeURIComponent(
        Object.entries(values)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      );

      window.location.href = `mailto:${inbox}?subject=${subject}&body=${body}`;

      if (status) {
        status.className = 'form-status ok';
        status.textContent = 'Opening your email app to send the message...';
      }
    });
  });
})();
