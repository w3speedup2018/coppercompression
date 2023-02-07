Array.prototype.slice.call(document.querySelectorAll('.Accordion')).forEach(function (accordion) {

  // Allow for multiple accordion sections to be expanded at the same time
  let allowMultiple = accordion.hasAttribute('data-allow-multiple');
  // Allow for each toggle to both open and close individually
  let allowToggle = (allowMultiple) ? allowMultiple : accordion.hasAttribute('data-allow-toggle');

  // Create the array of toggle elements for the accordion group
  let triggers = Array.prototype.slice.call(accordion.querySelectorAll('.Accordion-trigger'));
  let panels = Array.prototype.slice.call(accordion.querySelectorAll('.Accordion-panel'));

  let hidePanelTrend = function (e) {
    e.target.setAttribute('hidden', '');
    e.target.classList.remove('animate-out');
    e.target.classList.remove('animate-in');
    e.target.removeEventListener('transitionend', hidePanelTrend);
  }

  let hidePanel = function (active) {
    // Set the expanded state on the triggering element
    active.setAttribute('aria-expanded', 'false');
    // Hide the accordion sections, using aria-controls to specify the desired section
    document.getElementById(active.getAttribute('aria-controls')).classList.add('animate-out');
    document.getElementById(active.getAttribute('aria-controls')).addEventListener('transitionend', hidePanelTrend);
  }


  accordion.addEventListener('click', function (event) {
    let target = event.target;

    if (target.classList.contains('Accordion-trigger')) {
      // Check if the current toggle is expanded.
      let isExpanded = target.getAttribute('aria-expanded') == 'true';
      let active = accordion.querySelector('[aria-expanded="true"]');

      // without allowMultiple, close the open accordion
      if (!allowMultiple && active && active !== target) {
        hidePanel(active);

        // When toggling is not allowed, clean up disabled state
        if (!allowToggle) {
          active.removeAttribute('aria-disabled');
        }
      }

      if (!isExpanded) {
        // Set the expanded state on the triggering element
        target.setAttribute('aria-expanded', 'true');
        // Hide the accordion sections, using aria-controls to specify the desired section
        document.getElementById(target.getAttribute('aria-controls')).classList.add('will-animate-in');
        document.getElementById(target.getAttribute('aria-controls')).removeAttribute('hidden');
        document.getElementById(target.getAttribute('aria-controls')).scrollTop;
        document.getElementById(target.getAttribute('aria-controls')).classList.remove('will-animate-in');
        document.getElementById(target.getAttribute('aria-controls')).classList.add('animate-in');
        // let eventListener = document.getElementById(active.getAttribute('aria-controls')).addEventListener('transitionend', function(e){
        //   document.getElementById(active.getAttribute('aria-controls')).removeEventListener('transitionend', eventListener);
        //   document.getElementById(active.getAttribute('aria-controls')).classList.remove('animate-in');
        // });

        // If toggling is not allowed, set disabled state on trigger
        if (!allowToggle) {
          target.setAttribute('aria-disabled', 'true');
        }
      }
      else if (allowToggle && isExpanded) {
        hidePanel(active);
      }

      event.preventDefault();
    }
  });

  // Bind keyboard behaviors on the main accordion container
  accordion.addEventListener('keydown', function (event) {
    let target = event.target;
    let key = event.which.toString();

    let isExpanded = target.getAttribute('aria-expanded') == 'true';
    let allowToggle = (allowMultiple) ? allowMultiple : accordion.hasAttribute('data-allow-toggle');

    // 33 = Page Up, 34 = Page Down
    let ctrlModifier = (event.ctrlKey && key.match(/33|34/));

    // Is this coming from an accordion header?
    if (target.classList.contains('Accordion-trigger')) {
      // Up/ Down arrow and Control + Page Up/ Page Down keyboard operations
      // 38 = Up, 40 = Down
      if (key.match(/38|40/) || ctrlModifier) {
        let index = triggers.indexOf(target);
        let direction = (key.match(/34|40/)) ? 1 : -1;
        let length = triggers.length;
        let newIndex = (index + length + direction) % length;

        triggers[newIndex].focus();

        event.preventDefault();
      }
      else if (key.match(/35|36/)) {
        // 35 = End, 36 = Home keyboard operations
        switch (key) {
          // Go to first accordion
          case '36':
            triggers[0].focus();
            break;
            // Go to last accordion
          case '35':
            triggers[triggers.length - 1].focus();
            break;
        }
        event.preventDefault();

      }

    }
  });

  // These are used to style the accordion when one of the buttons has focus
  accordion.querySelectorAll('.Accordion-trigger').forEach(function (trigger) {

    trigger.addEventListener('focus', function (event) {
      accordion.classList.add('focus');
    });

    trigger.addEventListener('blur', function (event) {
      accordion.classList.remove('focus');
    });

  });

  // Minor setup: will set disabled state, via aria-disabled, to an
  // expanded/ active accordion which is not allowed to be toggled close
  if (!allowToggle) {
    // Get the first expanded/ active accordion
    let expanded = accordion.querySelector('[aria-expanded="true"]');

    // If an expanded/ active accordion is found, disable
    if (expanded) {
      expanded.setAttribute('aria-disabled', 'true');
    }
  }

});