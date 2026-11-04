/*
 * Client-side validation for forms marked [data-validate].
 * Each control's error text lives in the element referenced by aria-describedby
 * with class .ds-field__error. Custom messages via data-msg-required / data-msg-invalid.
 *
 * Submission:
 *   - Forms with [data-endpoint] submit for real: a valid form is POSTed to that
 *     URL, the submit button is disabled while the request is in flight, and a
 *     success message is shown only for a 2xx response. An empty data-endpoint
 *     means no backend is connected, so the form says nothing was sent.
 *   - Forms without it keep the original placeholder behaviour (confirmation +
 *     reset, nothing is sent) until the real HubSpot form is available.
 */
(function (DS) {
  "use strict";

  var DEFAULT_MESSAGES = {
    required: "Please fill in this field.",
    email: "Please enter a valid email address.",
    tel: "Please enter a valid phone number.",
    invalid: "Please check this field."
  };

  function errorEl(control) {
    var ids = (control.getAttribute("aria-describedby") || "").split(/\s+/);
    for (var i = 0; i < ids.length; i++) {
      var el = ids[i] && document.getElementById(ids[i]);
      if (el && el.classList.contains("ds-field__error")) return el;
    }
    return null;
  }

  function messageFor(control) {
    var v = control.validity;
    if (v.valueMissing) {
      return control.getAttribute("data-msg-required") || DEFAULT_MESSAGES.required;
    }
    if (v.typeMismatch || v.patternMismatch || v.tooShort) {
      return (
        control.getAttribute("data-msg-invalid") ||
        DEFAULT_MESSAGES[control.type] ||
        DEFAULT_MESSAGES.invalid
      );
    }
    return "";
  }

  function validateControl(control) {
    // Trim whitespace-only input so "   " does not pass a required check.
    if (control.value && !control.value.trim()) control.value = "";

    var message = control.checkValidity() ? "" : messageFor(control);
    var error = errorEl(control);

    control.classList.toggle("is-invalid", !!message);
    control.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
    return !message;
  }

  function setStatus(status, type, text) {
    if (!status) return;
    status.className = "ds-form-status" + (type ? " is-" + type : "");
    status.textContent = text || "";
  }

  function clearInvalid(controls) {
    controls.forEach(function (control) {
      control.classList.remove("is-invalid");
      control.removeAttribute("aria-invalid");
    });
  }

  // Real submission for forms with [data-endpoint].
  function send(form, controls, status, submit, done) {
    var endpoint = form.getAttribute("data-endpoint");
    if (!endpoint) {
      setStatus(status, "error", form.getAttribute("data-msg-unavailable") ||
        "Online submissions are not available yet, so your details have not been sent.");
      return;
    }

    var label = submit ? submit.textContent : "";
    if (submit) {
      submit.disabled = true;
      submit.textContent = submit.getAttribute("data-busy-label") || "Sending…";
    }
    form.setAttribute("aria-busy", "true");

    var finish = function () {
      form.removeAttribute("aria-busy");
      if (submit) {
        submit.disabled = false;
        submit.textContent = label;
      }
    };

    window.fetch(endpoint, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    }).then(function (response) {
      finish();
      if (!response.ok) throw new Error("HTTP " + response.status);
      setStatus(status, "success", form.getAttribute("data-success") ||
        "Thank you — your details have been received.");
      form.reset();
      clearInvalid(controls);
      done();
    }).catch(function () {
      finish();
      setStatus(status, "error", form.getAttribute("data-msg-failed") ||
        "Sorry, your details could not be sent. Please try again.");
    });
  }

  function initForm(form) {
    var controls = DS.qsa("input, select, textarea", form).filter(function (c) {
      return c.type !== "hidden" && c.type !== "submit";
    });
    var status = DS.qs(".ds-form-status", form);
    var submit = DS.qs("[type='submit']", form);
    var attempted = false;
    var realSubmit = form.hasAttribute("data-endpoint");

    form.setAttribute("novalidate", "");

    controls.forEach(function (control) {
      var revalidate = function () {
        if (attempted || control.classList.contains("is-invalid")) validateControl(control);
      };
      control.addEventListener("input", revalidate);
      control.addEventListener("blur", function () {
        if (control.value) validateControl(control);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      attempted = true;

      var firstInvalid = null;
      controls.forEach(function (control) {
        if (!validateControl(control) && !firstInvalid) firstInvalid = control;
      });

      if (status) {
        status.className = "ds-form-status";
        status.textContent = "";
      }

      if (firstInvalid) {
        firstInvalid.focus();
        if (status) {
          status.classList.add("is-error");
          status.textContent = "Please correct the highlighted fields.";
        }
        return;
      }

      if (realSubmit) {
        if (submit && submit.disabled) return; // a request is already in flight
        send(form, controls, status, submit, function () { attempted = false; });
        return;
      }

      // Placeholder success state until a real endpoint is connected.
      if (submit) submit.disabled = true;
      window.setTimeout(function () {
        if (status) {
          status.classList.add("is-success");
          status.textContent =
            form.getAttribute("data-success") || "Thank you — your details have been received.";
        }
        form.reset();
        attempted = false;
        controls.forEach(function (control) {
          control.classList.remove("is-invalid");
          control.removeAttribute("aria-invalid");
        });
        if (submit) submit.disabled = false;
      }, 400);
    });
  }

  // Country-code picker: a native <select> sits invisibly over the visual box.
  // Only the Australian flag exists as an asset, so other codes show as text.
  function initPhoneCountry(select) {
    var box = select.parentNode;
    var flag = DS.qs("[data-phone-cc-flag]", box);
    var code = DS.qs("[data-phone-cc-code]", box);
    var update = function () {
      var isAu = select.value === "+61";
      if (flag) flag.hidden = !isAu;
      if (code) {
        code.hidden = isAu;
        code.textContent = select.value;
      }
    };
    select.addEventListener("change", update);
    // form.reset() restores the default option after the reset event fires.
    if (select.form) select.form.addEventListener("reset", function () { window.setTimeout(update, 0); });
    update();
  }

  DS.initForms = function () {
    DS.qsa("form[data-validate]").forEach(initForm);
    DS.qsa("[data-phone-cc]").forEach(initPhoneCountry);
  };
})(window.DS);
