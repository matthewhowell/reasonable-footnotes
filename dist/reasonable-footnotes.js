/*! reasonable footnotes v0.1.0 | MIT License | https://github.com/matthewhowell/reasonable-footnotes */
var reasonable_footnotes = (function () {
	// public methods and properties
	let exports = {};

	// private methods and properties
	let _ = {};

	exports.version = '0.1.0';
	exports.config = {
		debug: false,

		// IMPORTANT
		// reasonable footnotes begins by identifying all footnotes links in
		// the document, it does that by searching for any link element
		// which contains this class
		// so - either this class needs to be added to your footnote links
		// or you'll need to override this value with an existing class that
		// is already applied to your footnote links
		footnoteLinkClass: 'rfn-a',

		// NOT IMPLEMENTED YET
		// 'footnoteButtonClass': 'rfn-button',
		// 'footnoteContainerClass': 'rfn-inline-container',
		// 'footnoteSpanClass': 'rfn-content',

		// escapeKeyClosesFootnotes
		// default: true
		// toggle listener for the escape key
		// on escape key press, all open footnotes will be closed
		escapeKeyClosesFootnotes: true,

		// allowMultipleOpenFootnotes
		// default: false
		// false: allows multiple footnotes to be in open state
		// true: allows only a single footnotes to be in the open state
		allowMultipleOpenFootnotes: false,

		// showFootnoteLabel
		// default: true
		// true: creates a <span> element containing the footnote label
		// false: does not create <span> containing the footnote label
		showFootnoteLabel: true,
	};

	exports.getRfnId = function () {
		return _.rfnId;
	};

	// reasonable footnotes uuid
	_.rfnId = 1;

	// increment the rfnid
	_.incrementRfnId = function () {
		_.rfnId++;
		return _.rfnId;
	};

	// escape key handler to close open footnotes
	_.escapeKeyHandler = function (event) {
		event = event || window.event;
		// if keydown event was triggered by escape key
		if (event.keyCode == 27) {
			// close all open inline footnotes
			closeAllFootnotes();
		}
	};

	// returns collection of footnote links
	// this is primary unit that we operate on
	// assume footnote links to element that will contain the footnote content
	const getFootnoteLinks = function () {
		return document.getElementsByClassName(
			exports.config.footnoteLinkClass
		);
	};

	const getParagraphElement = function (containerElementId = false) {
		// if (containerElementId) {
		// 	// attempt to use the containerElementId
		// 	const paragraphContainer = document.getElementById(containerElementId);
		// } else {
		const paragraphContainer = document.getElementsByTagName('article')[0];
		// }

		if (paragraphContainer) {
			const paragraphElement = paragraphContainer.getElementsByTagName(
				'p'
			)[0];

			if (paragraphElement) {
				return paragraphElement;
			} else {
				return false;
			}
		}
	};

	// returns the width of the first <p> element within the <article> element
	// we use this to calculate the width of popover footnote elements
	// todo
	// allow passing of element that will determine width and position
	const getParagraphWidth = function () {
		const p = getParagraphElement();
		if (p) {
			return p.clientWidth;
		}
	};

	const getParagraphPosition = function () {
		const p = getParagraphElement();
		if (p) {
			let position = {};
			position.x = p.getBoundingClientRect().x;
			position.y = p.getBoundingClientRect().y;
			return position;
		}
		return false;
	};

	// resetElementWidth
	// resets the width style declaration to 0px
	// @element HTML element to remove width style declaration
	const resetElementWidth = function (element) {
		element.style.width = '0px';
		// element.removeAttribute('style');
	};

	// setElementWidth
	// calculates and sets the width style declaration
	// @element HTML element to set width style declaration
	const setElementWidth = function (element) {
		// find the paragraph width
		const currentParagraphWidth = parseInt(getParagraphWidth());

		// set the width of the footnote to match the paragraph width
		if (currentParagraphWidth) {
			element.style.width = currentParagraphWidth + 'px';
			return currentParagraphWidth;
		} else {
			return 0;
		}
	};

	// calculate and set the correct left margin for the footnote
	// the left margin will be negative
	// it's used to pull the note to the beginning of the line
	const setFootnotePosition = function (positionElement, element) {
		// compute distance from left edge of the screen to left edge of paragraph
		const paragraphPosition = getParagraphPosition();

		// compute distance from left edge of the paragraph to the left edge of the footnote button
		const footnoteX = Math.ceil(positionElement.getBoundingClientRect().x);

		footnoteOffset = paragraphPosition.x - footnoteX - 1;
		element.style.left = footnoteOffset + 'px';
	};

	// close a single footnote element
	const closeFootnote = function (element) {
		if (exports.config.debug) {
			console.log('Close footnote: ' + element.id);
		}

		// reset inline footnote element width
		resetElementWidth(element);

		// remove visible class to hide footnote element
		element.classList.remove('visible');
	};

	// close all open inline footnotes
	const closeAllFootnotes = function () {
		// find all open inline footnotes
		const openFootnotes = document.querySelectorAll('.rfn-content.visible');

		for (let ofn of openFootnotes) {
			closeFootnote(ofn);
		}
	};

	const wrapChildElement = function (childElement, parentElement) {
		childElement.insertAdjacentElement('beforebegin', parentElement);
		parentElement.appendChild(childElement);
	};

	const openFootnote = function (span, button) {
		if (exports.config.debug) {
			console.log('Open footnote: ' + button.id);
		}
		span.classList.add('visible');

		setElementWidth(span);
		setFootnotePosition(button, span);

		// toggle aria-expanded
		// https://atomiks.github.io/tippyjs/v6/accessibility/
		if (button.getAttribute('aria-expanded') == 'true') {
			button.setAttribute('aria-expanded', 'false');
		} else {
			button.setAttribute('aria-expanded', 'true');
		}
	};

	// add an element to the DOM
	// @element the type of HTML element
	// @parentElementId the ID of the preceding HTML element
	// @label (optional) text to be wrapped in a label span
	// @content (optional) the text content of the element
	const addFootnoteElement = function (parentElementId, label, content) {
		// create new element
		const newFootnoteContent = document.createElement('span');
		newFootnoteContent.classList.add('rfn-content');
		newFootnoteContent.setAttribute('id', 'rfn-content-' + label);

		// SETTING
		// optionally create and insert a <span> containing the footnote label
		if (exports.config.showFootnoteLabel) {
			const newFootnoteLabel = document.createElement('span');
			newFootnoteLabel.appendChild(document.createTextNode(label));
			newFootnoteLabel.classList.add('rfn-label');
			newFootnoteContent.appendChild(newFootnoteLabel);
		}

		newFootnoteContent.appendChild(document.createTextNode(content));

		const parentElement = document.getElementById(parentElementId);

		if (parentElement) {
			parentElement.appendChild(newFootnoteContent);
			return newFootnoteContent;
		} else {
			return false;
		}
	};

	// initialize reasonable footnotes
	// TODO @config {} allows an object literal of config overrides
	exports.init = function (config) {
		// override config settings
		Object.assign(exports.config, config);

		// find all footnote links
		const footnoteLinks = getFootnoteLinks();

		for (let fnl of footnoteLinks) {
			if (exports.config.debug) {
				console.log('Init footnote link: ' + fnl.getAttribute('href'));
			}

			const noteId = exports.getRfnId();
			_.incrementRfnId();

			const noteNumber = fnl.getAttribute('href').split('-')[1];

			// remove the href attribute
			fnl.removeAttribute('href');

			// move the link text, this will be move into the button
			fnl.innerText = '';

			// create container for the inline footnote
			const newNoteContainer = document.createElement('span');
			newNoteContainer.classList.add('rfn-inline-container');
			newNoteContainer.setAttribute(
				'id',
				'rfn-inline-container-' + noteNumber
			);
			newNoteContainer.setAttribute('data-rfn-id', noteId);

			// move original footnote link into the new container
			wrapChildElement(fnl, newNoteContainer);

			// create button for inline footnotes
			// buttons are used because because they're natively focusable elements
			const newNoteButton = document.createElement('button');
			newNoteButton.classList.add('rfn-buttonTEST');
			newNoteButton.setAttribute('id', 'rfn-button-' + noteNumber);
			newNoteButton.setAttribute(
				'aria-describedby',
				'rfn-content-' + noteNumber
			);
			newNoteButton.setAttribute('aria-expanded', 'false');

			// we explicitly set the tabindex, which ensures keyboard focus and click
			newNoteButton.setAttribute('tabindex', '0');
			newNoteButton.innerText = noteNumber;
			fnl.appendChild(newNoteButton);

			// noteButton.setAttribute("tabindex", "0");
			//button tabindex="0" aria-expanded="false" id="rfn-button-1" class="rfn-button inline-note"

			const noteContent = document.getElementById(
				'footnote-content-' + noteNumber
			);

			const newNoteSpan = addFootnoteElement(
				'rfn-inline-container-' + noteNumber,
				noteNumber,
				noteContent.innerText
			);

			// add id to footnote span element
			newNoteSpan.setAttribute('id', 'rfn-content-' + noteNumber);
			newNoteSpan.setAttribute('tabindex', '0');

			// create the buttonClickHandler function for each button
			const buttonClickHandler = function (e, button) {
				const noteNumber = button
					.getAttribute('id')
					.substring(button.getAttribute('id').length - 1);
				const noteSpan = document.getElementById(
					'rfn-content-' + noteNumber
				);
				const noteIsOpen = noteSpan.classList.contains('visible');

				// if open, close our footnote and exit
				if (noteIsOpen) {
					closeFootnote(noteSpan);
					return;
				}

				// OR the clicked note is currently not open

				// optionally, close all other open footnotes
				if (exports.config.allowMultipleOpenFootnotes === false) {
					closeAllFootnotes();
				}

				// then open the clicked footnote
				openFootnote(noteSpan, button);
			};

			// add onclick event to each footnote button
			newNoteButton.onclick = function (e) {
				buttonClickHandler(e, this);
			};
		} // end of loop through footnote links

		// hide each footnote section
		const footnotesContainer = document.getElementsByClassName('footnotes');
		for (let fnc of footnotesContainer) {
			// apply print-only class which will allow these to be printed
			// but hide them from the document
			fnc.classList.add('print-only');
		}

		// on escape keydown, close all open footnotes
		if (exports.config.escapeKeyClosesFootnotes) {
			// adds event listener to
			document.addEventListener('keydown', _.escapeKeyHandler);
		}
	};

	return exports;
})();

// ******************************
// initialize reasonable footnote
// documentation for available config values can be found
//
reasonable_footnotes.init({ debug: true });
