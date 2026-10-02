(function ($) {

	"use strict";

	var $window = $(window);
	var $header = $('#siteHeader');
	var i18n = window.ATOYA_I18N;

	document.documentElement.classList.add('js');

	function t(key) {
		return i18n ? i18n.t(key) : key;
	}

	function headerOffset() {
		return ($header.outerHeight() || 0) + 12;
	}


	// Product carousels (curtains, clothing, blinds)
	var carouselOptions = {
		items: 3,
		loop: true,
		dots: false,
		nav: true,
		margin: 24,
		responsive: {
			0: {
				items: 1,
				stagePadding: 36,
				margin: 16
			},
			600: {
				items: 2
			},
			1000: {
				items: 3
			}
		}
	};

	$('.owl-men-item, .owl-women-item, .owl-kid-item').each(function () {
		var $carousel = $(this).owlCarousel(carouselOptions);
		// Owl renders nav buttons with role="presentation"; make them real, labelled buttons
		$carousel.find('.owl-prev').removeAttr('role').attr({ 'aria-label': t('owl.prev'), 'data-i18n-attr': 'aria-label:owl.prev', 'data-i18n-uz-aria-label': 'Oldingi' });
		$carousel.find('.owl-next').removeAttr('role').attr({ 'aria-label': t('owl.next'), 'data-i18n-attr': 'aria-label:owl.next', 'data-i18n-uz-aria-label': 'Keyingi' });
	});


	// Header shadow on scroll
	function updateHeader() {
		$header.toggleClass('is-scrolled', $window.scrollTop() > 10);
	}
	$window.on('scroll', updateHeader);
	updateHeader();


	// Mobile / tablet menu
	var $navToggle = $('.nav-toggle');

	function closeMenu() {
		$('body').removeClass('nav-open');
		$navToggle.attr('aria-expanded', 'false');
	}

	$navToggle.on('click', function () {
		var open = !$('body').hasClass('nav-open');
		$('body').toggleClass('nav-open', open);
		$navToggle.attr('aria-expanded', open ? 'true' : 'false');
	});


	// "Pages" dropdown: click/tap toggles it (hover also opens it on desktop via CSS)
	$('.sub-toggle').on('click', function (e) {
		e.stopPropagation();
		var $item = $(this).closest('.has-sub');
		var open = !$item.hasClass('open');
		$item.toggleClass('open', open);
		$(this).attr('aria-expanded', open ? 'true' : 'false');
	});

	$(document).on('click', function (e) {
		if (!$(e.target).closest('.has-sub').length) {
			$('.has-sub').removeClass('open').find('.sub-toggle').attr('aria-expanded', 'false');
		}
	});

	$(document).on('keydown', function (e) {
		if (e.key === 'Escape') {
			$('.has-sub').removeClass('open').find('.sub-toggle').attr('aria-expanded', 'false');
			if ($('body').hasClass('nav-open')) {
				closeMenu();
				$navToggle.trigger('focus');
			}
		}
	});

	$window.on('resize', function () {
		if ($window.width() >= 1200) {
			closeMenu();
		}
	});


	// Smooth scroll for same-page anchors (with fixed-header offset)
	$(document).on('click', 'a[href^="#"]', function (e) {
		var hash = this.getAttribute('href');
		if (hash === '#') {
			// placeholder link (e.g. social network not set up yet) — don't jump to the top
			e.preventDefault();
			return;
		}
		if ($(this).hasClass('skip-link')) {
			return;
		}
		var $target = $(document.getElementById(hash.slice(1)));
		if (!$target.length) {
			return;
		}
		e.preventDefault();
		closeMenu();
		var top = hash === '#top' ? 0 : $target.offset().top - headerOffset();
		$('html, body').stop().animate({ scrollTop: top }, 600, 'swing');
		if (window.history && history.replaceState) {
			history.replaceState(null, '', hash);
		}
	});

	// Coming from another page with a hash (e.g. index.html#men): correct for the fixed header
	$window.on('load', function () {
		if (window.location.hash.length > 1) {
			var $target = $(document.getElementById(window.location.hash.slice(1)));
			if ($target.length) {
				$window.scrollTop($target.offset().top - headerOffset());
			}
		}
	});


	// Highlight the menu item of the section currently in view (home page only)
	var $spyLinks = $('.nav-list a.nav-link[href^="#"]').filter(function () {
		return this.getAttribute('href').length > 1 && document.getElementById(this.getAttribute('href').slice(1));
	});

	function updateActiveLink() {
		if (!$spyLinks.length) {
			return;
		}
		var pos = $window.scrollTop() + headerOffset() + 40;
		var $current = $spyLinks.first();
		$spyLinks.each(function () {
			var section = document.getElementById(this.getAttribute('href').slice(1));
			if ($(section).offset().top <= pos) {
				$current = $(this);
			}
		});
		$spyLinks.removeClass('active');
		$current.addClass('active');
	}
	$window.on('scroll', updateActiveLink);
	updateActiveLink();


	// Scroll animation init (template plugin)
	if (typeof window.scrollReveal === 'function') {
		window.sr = new scrollReveal();
	}


	// Reveal-on-scroll animation
	var revealEls = document.querySelectorAll('.reveal');
	if ('IntersectionObserver' in window) {
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });
		Array.prototype.forEach.call(revealEls, function (el) { observer.observe(el); });
	} else {
		Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('is-visible'); });
	}


	// Lead forms: not connected to a backend yet, so don't reload the page — show a note instead
	$('.js-lead-form').on('submit', function (e) {
		e.preventDefault();
		var $note = $(this).find('.form-note');
		$note.text(t('form.note')).prop('hidden', false);
	});


	// Products page: catalog rendered from assets/js/products-data.js
	// (category filter + "show more" + gallery modal; supports products.html#curtains etc.)
	var $grid = $('#productGrid');
	if ($grid.length && window.ATOYA_PRODUCTS) {
		var products = window.ATOYA_PRODUCTS;
		var PAGE_SIZE = 12;
		var tagKeys = { curtains: 'tag.curtains', blinds: 'tag.blinds', women: 'tag.women', men: 'tag.men', kids: 'tag.kids' };
		var $filterButtons = $('.filter-btn');
		var $more = $('#catalogMore');
		var $soon = $('#catalogSoon');
		var soonCollectionKeys = { men: 'tile2.title', kids: 'tile3.title' };
		var currentFilter = 'all';
		var visibleCount = PAGE_SIZE;

		var $modal = $('#productModal');
		var $mImage = $('#pmImage');
		var $mThumbs = $modal.find('.pm-thumbs');
		var $mCounter = $modal.find('.pm-counter');
		var modalProduct = null;
		var modalIndex = 0;
		var lastFocus = null;

		var escapeHtml = function (s) {
			var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
			return String(s).replace(/[&<>"']/g, function (c) { return map[c]; });
		};

		var productName = function (p) {
			var name = t(p.nameKey);
			return p.number ? name + ' ' + (p.number < 10 ? '0' : '') + p.number : name;
		};

		var filtered = function () {
			return currentFilter === 'all' ? products : products.filter(function (p) { return p.category === currentFilter; });
		};

		var cardHtml = function (p) {
			var name = escapeHtml(productName(p));
			var count = p.images.length;
			var badge = count > 1
				? '<span class="photo-badge"><i class="fa fa-camera" aria-hidden="true"></i> ' + count + ' <span class="sr-only">' + escapeHtml(t('catalog.photos')) + '</span></span>'
				: '';
			var link = p.link
				? '<a class="product-link" href="' + p.link + '"><span>' + escapeHtml(t('btn.more')) + '</span> <i class="fa fa-long-arrow-right" aria-hidden="true"></i></a>'
				: '<a class="product-link" href="contact.html"><span>' + escapeHtml(t('card.order')) + '</span> <i class="fa fa-long-arrow-right" aria-hidden="true"></i></a>';
			return '<div class="col-lg-4 col-sm-6" data-category="' + p.category + '">' +
				'<article class="product-card">' +
					'<button type="button" class="product-media product-open" data-id="' + p.id + '" aria-label="' + escapeHtml(t('pm.view')) + ': ' + name + '">' +
						'<img src="' + p.images[0] + '" alt="' + name + '" loading="lazy">' +
						badge +
						'<span class="product-zoom" aria-hidden="true"><i class="fa fa-search-plus"></i></span>' +
					'</button>' +
					'<div class="product-body">' +
						'<span class="product-tag">' + escapeHtml(t(tagKeys[p.category])) + '</span>' +
						'<h3>' + name + '</h3>' +
						'<p class="product-price">' + escapeHtml(t('card.price')) + '</p>' +
						link +
					'</div>' +
				'</article>' +
			'</div>';
		};

		var renderCatalog = function () {
			var list = filtered();
			// Collections without products yet (men's, kids') show an elegant "coming soon" panel instead
			var empty = list.length === 0;
			$grid.prop('hidden', empty);
			$soon.prop('hidden', !empty);
			if (empty) {
				$('#catalogSoonCollection').text(soonCollectionKeys[currentFilter] ? t(soonCollectionKeys[currentFilter]) : 'ATOYA');
				$grid.empty();
				$more.prop('hidden', true);
				return;
			}
			$grid.html(list.slice(0, visibleCount).map(cardHtml).join(''));
			var rest = list.length - visibleCount;
			$more.prop('hidden', rest <= 0).find('.catalog-more-count').text(rest > 0 ? '(' + rest + ')' : '');
		};

		var renderFilterCounts = function () {
			$filterButtons.each(function () {
				var f = this.getAttribute('data-filter');
				var n = f === 'all' ? products.length : products.filter(function (p) { return p.category === f; }).length;
				var $count = $(this).find('.filter-count');
				if (!$count.length) {
					$count = $('<span class="filter-count"></span>').appendTo(this);
				}
				$count.text(n).prop('hidden', n === 0);
			});
		};

		var applyFilter = function (filter) {
			if (!$filterButtons.filter('[data-filter="' + filter + '"]').length) {
				filter = 'all';
			}
			currentFilter = filter;
			visibleCount = PAGE_SIZE;
			$filterButtons.each(function () {
				this.setAttribute('aria-pressed', this.getAttribute('data-filter') === filter ? 'true' : 'false');
			});
			renderCatalog();
		};

		var showImage = function (index) {
			var imgs = modalProduct.images;
			modalIndex = (index + imgs.length) % imgs.length;
			$mImage.attr({
				src: imgs[modalIndex],
				alt: productName(modalProduct) + (imgs.length > 1 ? ' — ' + t('pm.photo') + ' ' + (modalIndex + 1) : '')
			});
			$mCounter.text(imgs.length > 1 ? (modalIndex + 1) + ' / ' + imgs.length : '');
			$mThumbs.find('button').each(function (i) {
				this.setAttribute('aria-current', i === modalIndex ? 'true' : 'false');
			});
		};

		var fillModalText = function () {
			$('#pmTitle').text(productName(modalProduct));
			$('#pmTag').text(t(tagKeys[modalProduct.category]));
			showImage(modalIndex);
		};

		var openModal = function (id) {
			modalProduct = products.filter(function (p) { return p.id === id; })[0];
			if (!modalProduct) {
				return;
			}
			lastFocus = document.activeElement;
			var multi = modalProduct.images.length > 1;
			$modal.toggleClass('is-single', !multi);
			$mThumbs.html(multi ? modalProduct.images.map(function (src, i) {
				return '<button type="button" class="pm-thumb" data-index="' + i + '" aria-label="' + escapeHtml(t('pm.photo')) + ' ' + (i + 1) + '"><img src="' + src + '" alt=""></button>';
			}).join('') : '');
			modalIndex = 0;
			fillModalText();
			$modal.prop('hidden', false);
			$('body').addClass('modal-open');
			$modal.find('.pm-close').trigger('focus');
		};

		var closeModal = function () {
			$modal.prop('hidden', true);
			$('body').removeClass('modal-open');
			modalProduct = null;
			if (lastFocus) {
				lastFocus.focus();
			}
		};

		$filterButtons.on('click', function () {
			var filter = this.getAttribute('data-filter');
			applyFilter(filter);
			if (window.history && history.replaceState) {
				history.replaceState(null, '', filter === 'all' ? window.location.pathname + window.location.search : '#' + filter);
			}
		});

		$('#catalogSoonBack').on('click', function () {
			applyFilter('all');
			if (window.history && history.replaceState) {
				history.replaceState(null, '', window.location.pathname + window.location.search);
			}
			$filterButtons.filter('[data-filter="all"]').trigger('focus');
		});

		$more.on('click', function () {
			visibleCount += PAGE_SIZE;
			renderCatalog();
		});

		// i18n.js replaces the filter buttons' content when the language changes — re-add counts and re-render
		$(document).on('atoya:langchange', function () {
			renderFilterCounts();
			renderCatalog();
			if (modalProduct) {
				fillModalText();
			}
		});

		$grid.on('click', '.product-open', function () {
			openModal(this.getAttribute('data-id'));
		});
		$modal.on('click', '[data-pm-close]', closeModal);
		$modal.on('click', '.pm-prev', function () { showImage(modalIndex - 1); });
		$modal.on('click', '.pm-next', function () { showImage(modalIndex + 1); });
		$modal.on('click', '.pm-thumb', function () { showImage(+this.getAttribute('data-index')); });

		$(document).on('keydown', function (e) {
			if (!modalProduct) {
				return;
			}
			var multi = modalProduct.images.length > 1;
			if (e.key === 'Escape') {
				closeModal();
			} else if (e.key === 'ArrowLeft' && multi) {
				showImage(modalIndex - 1);
			} else if (e.key === 'ArrowRight' && multi) {
				showImage(modalIndex + 1);
			} else if (e.key === 'Tab') {
				// keep keyboard focus inside the dialog
				var $focusable = $modal.find('button:visible, a[href]:visible');
				var first = $focusable.get(0);
				var last = $focusable.get($focusable.length - 1);
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		});

		// Swipe between photos on touch screens
		var touchX = null;
		$modal.find('.pm-stage').on('touchstart', function (e) {
			touchX = e.originalEvent.touches[0].clientX;
		}).on('touchend', function (e) {
			if (touchX === null || !modalProduct || modalProduct.images.length < 2) {
				return;
			}
			var dx = e.originalEvent.changedTouches[0].clientX - touchX;
			if (Math.abs(dx) > 40) {
				showImage(modalIndex + (dx < 0 ? 1 : -1));
			}
			touchX = null;
		});

		renderFilterCounts();
		applyFilter(window.location.hash.slice(1) || 'all');
	}


	// Single product page: thumbnail gallery
	$('.thumb-btn').on('click', function () {
		var $main = $('#productMainImage');
		$main.attr('src', this.getAttribute('data-src'));
		$('.thumb-btn').attr('aria-current', 'false');
		this.setAttribute('aria-current', 'true');
	});


	// Page loading animation
	function hidePreloader() {
		var $preloader = $('#preloader');
		if (!$preloader.length || $preloader.data('hidden')) {
			return;
		}
		$preloader.data('hidden', true).animate({ 'opacity': '0' }, 500, function () {
			$preloader.css('visibility', 'hidden').hide();
		});
	}
	$window.on('load', hidePreloader);
	// Safety net: never keep the page hidden for long if a slow image delays the load event
	setTimeout(hidePreloader, 3000);

})(window.jQuery);
