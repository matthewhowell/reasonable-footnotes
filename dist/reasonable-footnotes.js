/*! reasonable footnotes v0.1.0 | MIT License | https://github.com/matthewhowell/reasonable-footnotes */
var reasonable_footnotes = (function () {
	// private methods and properties
	let rfn = {};

	// public methods and properties
	let exports = {};
	exports.version = '0.1.0';

	// default config settings
	// each of these values can be overwritten when instantiating reasonable footnotes
	// by passing an object literal with alternative config values
	exports.config = {
		// default: false
		// false: do not show debug console messages
		// true: show debug console messages
		debug: false,

		// define where the footnote will be displayed when open
		// default: top
		// top: displays the footnote outside of the flow of the text, sits on top of the page
		// inline: displays the footnote in the flow of the text, reflow when opened/closed
		// bottom: displays the footnote at the bottom of the window, static when scrolling
		display: 'top',

		// IMPORTANT
		// reasonable footnotes begins by identifying all footnotes links in
		// the document, it does that by searching for any link element
		// which contains this class
		// so - either this class needs to be added to your footnote links
		// or you'll need to override this value with an existing class that
		// is already applied to your footnote links
		footnoteLinkClass: 'rfn-a',

		// footnoteLinkText
		// define the text for the footnote link
		// default: original
		// original: uses the original link text
		// number: uses the footnote number as the link text
		// ellipsis: uses an ellipsis as the link text
		footnoteLinkText: 'original',

		// IMPORTANT
		// these classes are applied to some of the footnote markup
		// feel free to change these, but you'll need to update the provided
		// CSS rules that use these classes
		// or if you change these, the default CSS selectors will no longer work
		footnoteContainerClass: 'rfn-inline-container',
		footnoteButtonClass: 'rfn-button',
		footnoteSpanClass: 'rfn-content',

		// escapeKeyClosesFootnotes
		// default: true
		// true: when the escape key is pressed, all open footnotes will be closed
		// false: when escape key is pressed, no action
		escapeKeyClosesFootnotes: true,

		// allowMultipleOpenFootnotes
		// only works for inline or top display, bottom display is always single footnote open
		// default: false
		// false: allows multiple footnotes to be in open state
		// true: allows only a single footnotes to be in the open state
		allowMultipleOpenFootnotes: false,

		// showFootnoteLabel
		// add the footnote label into the footnote content
		// default: true
		// true: creates a <span> element containing the footnote label
		// false: does not create <span> containing the footnote label
		showFootnoteLabel: true,

		// hideOriginalFootnotes
		// default: true
		// true: removes the original footnotes from the page, still allows printing
		// false: leaves the original footnotes on the page
		hideOriginalFootnotes: true,
	};

	// return the current internal next rfnId
	// this can be thought of as the uuid for footnotes within the entire document
	exports.getRfnId = function () {
		return rfn.rfnId;
	};

	// a reasonable beginning footnotes uuid
	// needs to be an integer
	rfn.rfnId = 1;

	// increment the rfnid
	// returns the new rfnid
	rfn.incrementRfnId = function () {
		rfn.rfnId++;
		return rfn.rfnId;
	};

	// escape key handler to close open footnotes
	rfn.escapeKeyHandler = function (event) {
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
	rfn.getFootnoteLinks = function () {
		return document.getElementsByClassName(
			exports.config.footnoteLinkClass
		);
	};

	// returns the first paragraph element in the document
	// why?
	// this is used to determine the width of the text flow
	// top and inline displayed footnotes will inherit this width
	// and it will be used to position the footnote
	rfn.getParagraphElement = function () {
		const paragraphContainer = document.getElementsByTagName('article')[0];
		if (paragraphContainer) {
			const paragraphElement = paragraphContainer.getElementsByTagName(
				'p'
			)[0];

			if (paragraphElement) {
				return paragraphElement;
			}
		}
		return false;
	};

	// returns the width of the first <p> element within the <article> element
	// we use this to calculate the width of popover footnote elements
	rfn.getParagraphWidth = function () {
		const p = rfn.getParagraphElement();
		if (p) {
			return p.clientWidth;
		}
		return 0;
	};

	// returns a position object
	// x: the x position of the element
	// y: the y position of the element
	// @element HTML element to find position values
	rfn.getElementPosition = function (element) {
		if (element) {
			let position = {};
			position.x = Math.round(element.getBoundingClientRect().x);
			position.y = Math.round(element.getBoundingClientRect().y);
			return position;
		}
		return false;
	};

	// resetElementWidth
	// resets the width style declaration to 0px
	// @element HTML element to remove width style declaration
	rfn.resetElementWidth = function (element) {
		element.style.width = '0px';
	};

	// setElementWidth
	// calculates and sets the width style declaration
	// @element HTML element to set width style declaration
	rfn.setElementWidth = function (element) {
		// find the paragraph width
		const currentParagraphWidth = parseInt(rfn.getParagraphWidth());

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
	rfn.setFootnotePosition = function (positionElement, element) {
		// compute distance from left edge of the screen to left edge of paragraph
		const paragraphPosition = rfn.getElementPosition(
			rfn.getParagraphElement()
		);

		// compute position of button
		const buttonPosition = rfn.getElementPosition(positionElement);

		// the footnote is a child element of its button
		// so the footnote must move left to meet the paragraph x position
		// <p left:2px> <button left:8px> = <footnote left:-6px>
		footnoteOffset = paragraphPosition.x - buttonPosition.x;
		element.style.left = footnoteOffset + 'px';
	};

	// calculate and set the correct left margin for the footnote arrow marker
	rfn.setArrowPosition = function (positionElement, element) {
		// compute distance from left edge of the screen to left edge of paragraph
		const paragraphPosition = rfn.getElementPosition(
			rfn.getParagraphElement()
		);

		// compute position of button
		const buttonPosition = rfn.getElementPosition(positionElement);

		arrowOffset = buttonPosition.x - paragraphPosition.x - 1;
		element.style.left = arrowOffset + 'px';
	};

	// close a single footnote element
	const closeFootnote = function (element) {
		// reset inline footnote element width
		if (exports.config.display == 'top') {
			rfn.resetElementWidth(element);
		}

		console.log('here');
		// update aria-expanded attribute
		const noteNumber = element.getAttribute('id').split('-')[2];
		const button = document.getElementById('rfn-button-' + noteNumber);
		button.setAttribute('aria-expanded', 'false');

		// remove visible class to hide footnote element
		element.classList.remove('visible');
	};

	// close all open inline footnotes
	const closeAllFootnotes = function () {
		// find all open inline footnotes
		const openFootnotesSelector =
			'.' + exports.config.footnoteSpanClass + '.visible';
		const openFootnotes = document.querySelectorAll(openFootnotesSelector);
		for (let ofn of openFootnotes) {
			closeFootnote(ofn);
		}
	};

	const wrapChildElement = function (childElement, parentElement) {
		childElement.insertAdjacentElement('beforebegin', parentElement);
		parentElement.appendChild(childElement);
	};

	const openFootnote = function (span, button) {
		span.classList.add('visible');

		if (exports.config.display == 'top') {
			rfn.setElementWidth(span);
			rfn.setFootnotePosition(button, span);
		}

		// toggle aria-expanded
		// https://atomiks.github.io/tippyjs/v6/accessibility/
		button.setAttribute('aria-expanded', 'true');
	};

	// add an element to the DOM
	// @element the type of HTML element
	// @parentElementId the ID of the preceding HTML element
	// @label (optional) text to be wrapped in a label span
	// @content (optional) the text content of the element
	const addFootnoteElement = function (parentElementId, label, content) {
		// create new element
		const newFootnoteContent = document.createElement('span');

		// use markup from original footnote
		newFootnoteContent.innerHTML = content;

		newFootnoteContent.classList.add(exports.config.footnoteSpanClass);
		newFootnoteContent.setAttribute('id', 'rfn-content-' + label);

		const buttonElement = document.getElementById('rfn-button-' + label);
		const newFootnoteArrow = document.createElement('span');
		newFootnoteArrow.classList.add('rfn-arrow');
		// newFootnoteArrow.style.left = buttonPosition.x + 'px';
		rfn.setArrowPosition(buttonElement, newFootnoteArrow);
		newFootnoteContent.appendChild(newFootnoteArrow);

		// SETTING
		// optionally create and insert a <span> containing the footnote label
		if (exports.config.showFootnoteLabel) {
			const newFootnoteLabel = document.createElement('span');
			newFootnoteLabel.appendChild(document.createTextNode(label));
			newFootnoteLabel.classList.add('rfn-label');
			newFootnoteContent.appendChild(newFootnoteLabel);
		}

		const parentElement = document.getElementById(parentElementId);

		if (parentElement) {
			parentElement.appendChild(newFootnoteContent);
			return newFootnoteContent;
		} else {
			return false;
		}
	};

	// initialize reasonable footnotes
	// @config {} allows an object literal of config overrides
	exports.init = function (config) {
		// override config settings
		Object.assign(exports.config, config);

		// find all footnote links
		const footnoteLinks = rfn.getFootnoteLinks();

		for (let fnl of footnoteLinks) {
			const noteId = exports.getRfnId();
			rfn.incrementRfnId();

			const noteNumber = fnl.getAttribute('href').split('-')[1];

			// remove the href attribute
			fnl.removeAttribute('href');

			// move the link text, this will be move into the button
			const originalLinkText = fnl.innerText;
			fnl.innerText = '';

			// create container for the inline footnote
			const newNoteContainer = document.createElement('span');
			newNoteContainer.classList.add(
				exports.config.footnoteContainerClass
			);
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
			newNoteButton.classList.add(exports.config.footnoteButtonClass);
			newNoteButton.setAttribute('id', 'rfn-button-' + noteNumber);
			newNoteButton.setAttribute(
				'aria-describedby',
				'rfn-content-' + noteNumber
			);
			newNoteButton.setAttribute('aria-expanded', 'false');

			// we explicitly set the tabindex, which ensures keyboard focus and click
			newNoteButton.setAttribute('tabindex', '0');

			// assume original link text
			let buttonText = originalLinkText;

			if (exports.config.footnoteLinkText == 'ellipsis') {
				buttonText = '…';
			} else if (exports.config.footnoteLinkText == 'number') {
				buttonText = noteNumber;
			}

			newNoteButton.innerText = buttonText;
			fnl.appendChild(newNoteButton);

			const noteContent = document.getElementById(
				'footnote-content-' + noteNumber
			);

			const newNoteSpan = addFootnoteElement(
				'rfn-inline-container-' + noteNumber,
				noteNumber,
				noteContent.innerHTML
			);

			// add id to footnote span element
			newNoteSpan.setAttribute('id', 'rfn-content-' + noteNumber);
			newNoteSpan.classList.add(exports.config.display);
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
				if (
					exports.config.allowMultipleOpenFootnotes === false ||
					exports.config.display === 'bottom'
				) {
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

		// optionally hide each footnote section
		if (exports.config.hideOriginalFootnotes) {
			const footnotesContainer = document.getElementsByClassName(
				'footnotes'
			);
			for (let fnc of footnotesContainer) {
				// apply print-only class which will allow these to be printed
				// but hide them from the document
				fnc.classList.add('print-only');
			}
		}

		// on escape keydown, close all open footnotes
		if (exports.config.escapeKeyClosesFootnotes) {
			// adds event listener to
			document.addEventListener('keydown', rfn.escapeKeyHandler);
		}

		// print some helpful info in the console
		if (exports.config.debug) {
			console.log('Reasonable Footnotes initialized.');
			console.log(
				'Found and transformed ' + (rfn.rfnId - 1) + ' footnotes.'
			);
			console.log('Display: ' + exports.config.display);
			console.log(
				'CSS class for footnote buttons: ' +
					exports.config.footnoteButtonClass
			);
			console.log(
				'CSS class for footnote content: ' +
					exports.config.footnoteSpanClass
			);
		}
	};

	return exports;
})();
