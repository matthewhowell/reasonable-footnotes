/*
 reasonable footnotes v0.0.1 | MIT License | https://github.com/matthewhowell/reasonable-footnotes */
var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function (b) {
	var g = 0;
	return function () {
		return g < b.length ? { done: !1, value: b[g++] } : { done: !0 };
	};
};
$jscomp.arrayIterator = function (b) {
	return { next: $jscomp.arrayIteratorImpl(b) };
};
$jscomp.makeIterator = function (b) {
	var g =
		'undefined' != typeof Symbol && Symbol.iterator && b[Symbol.iterator];
	return g ? g.call(b) : $jscomp.arrayIterator(b);
};
var reasonable_footnotes = (function () {
	var b = {},
		g = { rfnId: 1 };
	b.version = '0.1.0';
	b.config = {
		debug: !1,
		footnoteLinkClass: 'rfn-a',
		escapeKeyClosesFootnotes: !0,
		allowMultipleOpenFootnotes: !1,
		showFootnoteLabel: !0,
	};
	b.getRfnId = function () {
		return g.rfnId;
	};
	g.incrementRfnId = function () {
		g.rfnId++;
		return g.rfnId;
	};
	var q = function (a) {
			if ((a = document.getElementsByTagName('article')[0]))
				return (a = a.getElementsByTagName('p')[0]) ? a : !1;
		},
		r = function (a) {
			b.config.debug && console.log('Close footnote: ' + a.id);
			a.style.width = '0px';
			a.classList.remove('visible');
		},
		t = function () {
			var a = document.querySelectorAll('.rfn-content.visible');
			a = $jscomp.makeIterator(a);
			for (var c = a.next(); !c.done; c = a.next()) r(c.value);
		},
		u = function (a, c) {
			a.insertAdjacentElement('beforebegin', c);
			c.appendChild(a);
		},
		v = function (a, c, e) {
			var d = document.createElement('span');
			d.classList.add('rfn-content');
			d.setAttribute('id', 'rfn-content-' + c);
			if (b.config.showFootnoteLabel) {
				var f = document.createElement('span');
				f.appendChild(document.createTextNode(c));
				f.classList.add('rfn-label');
				d.appendChild(f);
			}
			d.appendChild(document.createTextNode(e));
			return (a = document.getElementById(a))
				? (a.appendChild(d), d)
				: !1;
		};
	b.init = function (a) {
		Object.assign(b.config, a);
		var c = document.getElementsByClassName(b.config.footnoteLinkClass);
		a = {};
		c = $jscomp.makeIterator(c);
		for (
			var e = c.next();
			!e.done;
			a = {
				$jscomp$loop$prop$buttonClickHandler$4:
					a.$jscomp$loop$prop$buttonClickHandler$4,
			},
				e = c.next()
		) {
			var d = e.value;
			b.config.debug &&
				console.log('Init footnote link: ' + d.getAttribute('href'));
			var f = b.getRfnId();
			g.incrementRfnId();
			e = d.getAttribute('href').split('-')[1];
			d.removeAttribute('href');
			d.innerText = '';
			var p = document.createElement('span');
			p.classList.add('rfn-inline-container');
			p.setAttribute('id', 'rfn-inline-container-' + e);
			p.setAttribute('data-rfn-id', f);
			u(d, p);
			f = document.createElement('button');
			f.classList.add('rfn-buttonTEST');
			f.setAttribute('id', 'rfn-button-' + e);
			f.setAttribute('aria-describedby', 'rfn-content-' + e);
			f.setAttribute('aria-expanded', 'false');
			f.setAttribute('tabindex', '0');
			f.innerText = e;
			d.appendChild(f);
			d = document.getElementById('footnote-content-' + e);
			d = v('rfn-inline-container-' + e, e, d.innerText);
			d.setAttribute('id', 'rfn-content-' + e);
			d.setAttribute('tabindex', '0');
			a.$jscomp$loop$prop$buttonClickHandler$4 = function (n, h) {
				var m = h
					.getAttribute('id')
					.substring(h.getAttribute('id').length - 1);
				m = document.getElementById('rfn-content-' + m);
				if (m.classList.contains('visible')) r(m);
				else {
					!1 === b.config.allowMultipleOpenFootnotes && t();
					b.config.debug && console.log('Open footnote: ' + h.id);
					m.classList.add('visible');
					var k = parseInt;
					var l = (l = q()) ? l.clientWidth : void 0;
					if ((k = k(l))) m.style.width = k + 'px';
					(k = q())
						? ((l = {}),
						  (l.x = k.getBoundingClientRect().x),
						  (l.y = k.getBoundingClientRect().y),
						  (k = l))
						: (k = !1);
					l = Math.ceil(h.getBoundingClientRect().x);
					footnoteOffset = k.x - l - 1;
					m.style.left = footnoteOffset + 'px';
					'true' == h.getAttribute('aria-expanded')
						? h.setAttribute('aria-expanded', 'false')
						: h.setAttribute('aria-expanded', 'true');
				}
			};
			f.onclick = (function (n) {
				return function (h) {
					n.$jscomp$loop$prop$buttonClickHandler$4(h, this);
				};
			})(a);
		}
		a = document.getElementsByClassName('footnotes');
		a = $jscomp.makeIterator(a);
		for (c = a.next(); !c.done; c = a.next())
			c.value.classList.add('print-only');
		b.config.escapeKeyClosesFootnotes &&
			(document.onkeydown = function (n) {
				n = n || window.event;
				27 == n.keyCode && t();
			});
	};
	return b;
})();
reasonable_footnotes.init({ debug: !0 });
