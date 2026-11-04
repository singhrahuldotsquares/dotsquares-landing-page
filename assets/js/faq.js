/*
 * FAQ accordion, matching the live reference: one item open at a time,
 * clicking the open question closes it, and "Load More" reveals the
 * remaining questions once and then disappears.
 *
 * Markup hooks:
 *   [data-faq]          section root
 *   [data-faq-item]     each item (.is-open when expanded)
 *   [data-faq-btn]      question button (aria-expanded / aria-controls)
 *   [data-faq-extra]    items hidden until "Load More"
 *   [data-faq-more]     the Load More button
 */
(function (DS) {
  "use strict";

  function setOpen(item, open) {
    item.classList.toggle("is-open", open);
    DS.qs("[data-faq-btn]", item).setAttribute("aria-expanded", open ? "true" : "false");
  }

  function initFaq(root) {
    var items = DS.qsa("[data-faq-item]", root);

    items.forEach(function (item) {
      DS.qs("[data-faq-btn]", item).addEventListener("click", function () {
        var open = !item.classList.contains("is-open");
        items.forEach(function (other) {
          if (other !== item) setOpen(other, false);
        });
        setOpen(item, open);
      });
    });

    var more = DS.qs("[data-faq-more]", root);
    var extra = DS.qsa("[data-faq-extra]", root);
    if (!more) return;
    if (!extra.length) {
      more.parentNode.hidden = true;
      return;
    }
    more.addEventListener("click", function () {
      extra.forEach(function (item) { item.hidden = false; });
      more.parentNode.hidden = true;
      // The button is gone, so move focus to the first newly shown question.
      DS.qs("[data-faq-btn]", extra[0]).focus();
    });
  }

  DS.initFaq = function () {
    DS.qsa("[data-faq]").forEach(initFaq);
  };
})(window.DS);
