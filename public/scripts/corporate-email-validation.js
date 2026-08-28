(() => {
  if (window.__globalEnterpriseFormValidationBound) return;
  window.__globalEnterpriseFormValidationBound = true;

  const consumerEmailRoots = new Set(['gmail.com', 'googlemail.com', 'hotmail.com', 'outlook.com', 'yahoo.com']);
  const consumerEmailVariants = new Set(['hotmail.co.uk', 'hotmail.fr', 'hotmail.de', 'hotmail.it', 'hotmail.es', 'hotmail.com.au', 'hotmail.co.jp', 'hotmail.co.in', 'hotmail.com.br', 'hotmail.com.mx', 'outlook.co.uk', 'outlook.fr', 'outlook.de', 'outlook.it', 'outlook.es', 'outlook.com.au', 'outlook.co.jp', 'outlook.co.in', 'outlook.com.br', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.com.au', 'yahoo.co.in', 'yahoo.fr', 'yahoo.de', 'yahoo.es', 'yahoo.it', 'yahoo.co.jp', 'yahoo.com.br', 'yahoo.com.mx', 'yahoo.co.nz', 'yahoo.com.sg', 'yahoo.com.hk', 'yahoo.com.ar', 'yahoo.com.tr']);
  const corporateEmailMessage = 'Please use your company email address. Gmail, Yahoo, Hotmail, and Outlook.com accounts are not eligible for this brief.';
  const corporateValidators = new WeakMap();

  const isConsumerEmail = (value) => {
    const domain = value.trim().toLowerCase().split('@').pop()?.replace(/\.+$/, '') || '';
    return consumerEmailRoots.has(domain) || consumerEmailVariants.has(domain) || [...consumerEmailRoots].some((root) => domain.endsWith('.' + root));
  };

  const isValidationControl = (control) => {
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement)) return false;
    if (!control.willValidate || control.disabled || control.name === '_honey') return false;
    return !(control instanceof HTMLInputElement && ['hidden', 'submit', 'button', 'reset', 'image'].includes(control.type));
  };

  const getControls = (form) => [...form.elements].filter(isValidationControl);

  const ensureId = (control, formIndex, controlIndex) => {
    if (control.id) return control.id;
    const base = `${formIndex}-${control.name || 'field'}-${controlIndex}`.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'field';
    let id = `lead-${base}`;
    let suffix = 2;
    while (document.getElementById(id)) id = `lead-${base}-${suffix++}`;
    control.id = id;
    return id;
  };

  const addDescribedBy = (element, id) => {
    const ids = new Set((element.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    ids.add(id);
    element.setAttribute('aria-describedby', [...ids].join(' '));
  };

  const getFieldLabel = (control) => {
    const label = control.labels?.[0] || control.closest('label');
    if (!label) return control.getAttribute('aria-label') || control.name || 'This field';
    const clone = label.cloneNode(true);
    clone.querySelectorAll('input, select, textarea, button, [data-form-field-error], [data-field-error], .form-field-error, .required-note, .optional-note').forEach((element) => element.remove());
    const text = clone.textContent?.replace(/\s+/g, ' ').replace(/\b(required|optional)\b/gi, '').trim().replace(/[\s:]+$/, '');
    return text || control.getAttribute('aria-label') || control.name || 'This field';
  };

  const getFieldError = (form, control) => {
    const existing = [...form.querySelectorAll('[data-form-field-error], [data-field-error], [data-corporate-email-error]')].find((element) => element.getAttribute('data-form-field-error-for') === control.id || element.getAttribute('data-field-error-for') === control.id || element.getAttribute('data-corporate-email-error-for') === control.id);
    const error = existing || document.createElement('span');

    if (!existing) {
      error.className = 'form-field-error';
      error.id = `${control.id}-error`;
      error.setAttribute('role', 'alert');
      error.setAttribute('aria-live', 'polite');
      error.hidden = true;
      const label = control.closest('label');
      if (label && control.type !== 'checkbox') label.append(error);
      else if (label) label.insertAdjacentElement('afterend', error);
      else control.parentElement?.insertAdjacentElement('afterend', error) || form.append(error);
    }

    error.classList.add('form-field-error');
    error.setAttribute('data-form-field-error', 'true');
    error.setAttribute('data-form-field-error-for', control.id);
    error.setAttribute('role', 'alert');
    error.setAttribute('aria-live', 'polite');
    if (!error.id) error.id = `${control.id}-error`;
    addDescribedBy(control, error.id);
    return error;
  };

  const getSummary = (form, formIndex) => {
    let summary = form.querySelector('[data-form-summary], [data-form-error-summary], .form-error-summary');
    if (!summary) {
      summary = document.createElement('div');
      summary.className = 'form-error-summary';
      form.prepend(summary);
    }
    summary.setAttribute('data-form-summary', 'true');
    summary.setAttribute('data-form-error-summary', 'true');
    summary.setAttribute('role', 'alert');
    summary.setAttribute('aria-live', 'assertive');
    summary.setAttribute('tabindex', '-1');
    if (!summary.id) summary.id = `lead-form-errors-${formIndex}`;
    addDescribedBy(form, summary.id);
    return summary;
  };

  const getValidationMessage = (control) => {
    const label = getFieldLabel(control);
    if (control.validity.customError && control.validationMessage) return control.validationMessage;
    if (control.validity.valueMissing) return control.type === 'checkbox' ? 'Select this option to continue.' : `${label} is required.`;
    if (control.validity.typeMismatch) return control.type === 'email' ? `Enter a valid email address for ${label}.` : `Enter a valid value for ${label}.`;
    if (control.validity.patternMismatch) return `Use the requested format for ${label}.`;
    if (control.validity.tooShort || control.validity.tooLong) return `Check the length of ${label}.`;
    if (control.validity.rangeUnderflow || control.validity.rangeOverflow) return `Choose an allowed value for ${label}.`;
    if (control.validity.badInput) return `Enter a valid value for ${label}.`;
    return control.validationMessage || `Check ${label}.`;
  };

  const setFieldState = (form, control, valid) => {
    const error = getFieldError(form, control);
    control.setAttribute('aria-invalid', valid ? 'false' : 'true');
    error.hidden = valid;
    if (!valid) error.textContent = getValidationMessage(control);
  };

  const updateSummary = (summary, invalidControls) => {
    if (invalidControls.length === 0) {
      summary.hidden = true;
      summary.replaceChildren();
      return;
    }

    summary.replaceChildren();
    const intro = document.createElement('p');
    intro.textContent = invalidControls.length === 1 ? 'Please correct the highlighted field.' : `Please correct the ${invalidControls.length} highlighted fields.`;
    summary.append(intro);

    const list = document.createElement('ul');
    list.className = 'form-error-summary-list';
    invalidControls.forEach((control) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${control.id}`;
      link.textContent = getValidationMessage(control);
      item.append(link);
      list.append(item);
    });
    summary.append(list);
    summary.hidden = false;
  };

  const validateControl = (form, control, summary) => {
    if (control.type === 'email') corporateValidators.get(form)?.();
    const valid = control.validity.valid;
    setFieldState(form, control, valid);
    if (!summary.hidden) updateSummary(summary, getControls(form).filter((candidate) => !candidate.validity.valid));
    return valid;
  };

  const validateForm = (form, summary, shouldFocusSummary = false) => {
    corporateValidators.get(form)?.();
    const controls = getControls(form);
    const invalidControls = controls.filter((control) => !control.validity.valid);
    controls.forEach((control) => setFieldState(form, control, !invalidControls.includes(control)));
    updateSummary(summary, invalidControls);

    if (invalidControls.length > 0 && shouldFocusSummary) {
      summary.focus({ preventScroll: true });
      summary.scrollIntoView?.({ block: 'nearest' });
    }
    return invalidControls;
  };

  const initializeCorporateEmailValidation = (form, formIndex) => {
    if (!form.matches('form[data-corporate-email-only]') || form.dataset.corporateEmailValidationBound === 'true') return;
    const email = form.querySelector('input[type="email"]');
    if (!email) return;

    const emailId = ensureId(email, `corporate-email-${formIndex}`, 1);
    const error = getFieldError(form, email);
    error.classList.add('corporate-email-error');
    error.setAttribute('data-corporate-email-error', 'true');
    error.setAttribute('data-corporate-email-error-for', emailId);
    error.textContent = corporateEmailMessage;
    error.hidden = true;

    const clearError = () => {
      email.setCustomValidity('');
      error.hidden = true;
    };
    const validate = () => {
      if (!isConsumerEmail(email.value)) {
        clearError();
        return true;
      }
      email.setCustomValidity(corporateEmailMessage);
      email.setAttribute('aria-invalid', 'true');
      error.hidden = false;
      error.textContent = corporateEmailMessage;
      return false;
    };

    corporateValidators.set(form, validate);
    email.addEventListener('blur', () => {
      email.dataset.formFieldTouched = 'true';
      validate();
    });
    email.addEventListener('input', () => {
      if (isConsumerEmail(email.value) || email.dataset.formFieldTouched === 'true') validate();
      else clearError();
    });
    form.dataset.corporateEmailValidationBound = 'true';
  };

  const initializeFormAccessibility = (form, formIndex) => {
    if (form.dataset.formAccessibilityBound === 'true') return;
    const summary = getSummary(form, formIndex);
    const controls = getControls(form);

    controls.forEach((control, controlIndex) => {
      ensureId(control, formIndex, controlIndex + 1);
      control.setAttribute('aria-required', control.required ? 'true' : 'false');
      control.setAttribute('aria-invalid', control.getAttribute('aria-invalid') === 'true' ? 'true' : 'false');
      getFieldError(form, control);

      control.addEventListener('blur', () => {
        control.dataset.formFieldTouched = 'true';
        validateControl(form, control, summary);
      });
      const validateAfterEdit = () => {
        if (control.dataset.formFieldTouched === 'true' || control.getAttribute('aria-invalid') === 'true') validateControl(form, control, summary);
      };
      control.addEventListener('input', validateAfterEdit);
      control.addEventListener('change', validateAfterEdit);
    });

    let invalidCheckScheduled = false;
    form.addEventListener('invalid', (event) => {
      const control = event.target;
      if (!isValidationControl(control)) return;
      control.dataset.formFieldTouched = 'true';
      corporateValidators.get(form)?.();
      setFieldState(form, control, false);
      if (invalidCheckScheduled) return;
      invalidCheckScheduled = true;
      window.setTimeout(() => {
        invalidCheckScheduled = false;
        validateForm(form, summary, true);
      }, 0);
    }, true);

    form.addEventListener('submit', (event) => {
      const invalidControls = validateForm(form, summary, true);
      if (invalidControls.length > 0) event.preventDefault();
    });

    form.addEventListener('reset', () => {
      window.setTimeout(() => {
        corporateValidators.get(form)?.();
        controls.forEach((control) => {
          delete control.dataset.formFieldTouched;
          control.setAttribute('aria-invalid', 'false');
          getFieldError(form, control).hidden = true;
        });
        summary.hidden = true;
        summary.replaceChildren();
      }, 0);
    });
    form.dataset.formAccessibilityBound = 'true';
  };

  const initializeLeadForms = () => {
    document.querySelectorAll('form[data-lead-form]').forEach((form, index) => {
      initializeCorporateEmailValidation(form, index + 1);
      initializeFormAccessibility(form, index + 1);
    });
  };

  initializeLeadForms();
  document.addEventListener('DOMContentLoaded', initializeLeadForms, { once: true });
  document.addEventListener('astro:page-load', initializeLeadForms);
})();
