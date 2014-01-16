/*!
 * Grouped slideshow with CSS3 animation
 * Licensed under the MIT license
 */

;(function ( $, window, document, undefined ) {

	// Create the defaults once
	var pluginName = "groupSlideshow",
		defaults = {
			data: null,
			classNames: {
				group: 'jq-gs-group',
				container: 'jq-gs-container'
			},
			delay: 5000,
			duration: 500,
			cssTransitions: true,
			centered: true,
			spacerImage: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
		};

	// The actual plugin constructor
	function Plugin( element, options ) {
		this.el = element;
		this.$el = $(element);

		this.options = $.extend( {}, defaults, options) ;
		this.preventAnimation = true;
		this.initialized = false;

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

	Plugin.prototype = {

		init: function() {
			
			var self = this;

			this.$el.addClass('jq-gs');

			$.each(this.options.data, function(groupName, images) {

				var $group = self.addGroup(groupName);
				$.each(images, function(index, src) {
					if(self.options.centered) {
						self.addCenteredImage($group, src);
					} else {
						self.addImage($group, src);
					}
				});
			});

			// prepare for CSS3 Transitions
			this.$style = $(document.createElement('style')).attr('type', 'text/css');
			this.$el.append(this.$style);
			this.updateStylesheet();

			// re-arm JS Animation fallback
			this.preventAnimation = false;

			// Animarion Loop
			this.resetInterval();

			this.initialized = true;

		},

		addGroup: function(name) {
			var $group = $(document.createElement('div')).addClass(this.options.classNames.group).attr('group', name);
			this.$el.append($group);
			
			if(this.$el.children().length === 1) {
				this.setActiveGroup($group);
			}

			return $group;
		},

		createImage: function(src) {
			var $img = $(document.createElement('img')).attr('jq-gs-src', src);
			return $img;
		},

		addImage: function($group, src) {
			var $img = this.createImage(src);

			// trigger caching event
			$img.bind('load', function() {
				$img.trigger('loaded');
			});

			return this.addContainer($group, $img);
		},

		addCenteredImage: function($group, src) {

			var self = this,
				$img = $(document.createElement('div')).attr('jq-gs-src', src)
				.addClass('jq-gs-centered-image');

			var $cache = this.createImage(src).addClass('jq-gs-cache');
			$img.append($cache);

			$cache.bind('load', function() {
				if($cache.attr('src') === src) {
					$img.css('background-image', 'url(' + src + ')');
					$img.trigger('load');
					$cache.trigger('loaded');
				}
			});

			$cache.bind('loaded', function() {
				$img.attr('loaded', true);
				$img.trigger('loaded');
			});

			// bind events
			$img.bind('cache', function() {
				if(src === $cache.attr('src')) {
					$img.trigger('load');
					$cache.trigger('loaded');
				} else {
					setTimeout(function() {
						$cache.attr('src', src);
					},0);
				}
			});

			$img.bind('purge', function() {

				// do not purge active image
				if($img.hasClass(self.options.classNames.container + '-active')) {
					return;
				}

				// replace with 1x1px spacer
				$cache.attr('src', self.options.spacerImage);
				$img.css('background-image', 'url(' + self.options.spacerImage + ')');
				$img.attr('loaded', false);

			});

			return this.addContainer($group, $img);

		},

		addContainer: function($group, $container) {
			$container.addClass(this.options.classNames.container);
			$group.append($container);
			
			if($group.children().length === 1) {
				$container.css({
					opacity: 1
				});

				// activate first container only if this is the first added group
				if(this.getGroups().length === 1) {
					this.setActiveContainer($group, $container);
				}
			}
		},

		getGroups: function() {
			return this.$el.children('.' + this.options.classNames.group);
		},

		getGroupNames: function() {

			var groups = [];
			this.getGroups().each(function() {
				groups.push($(this).attr('group'));
			});
			return groups;

		},

		getActiveGroup: function() {
			return this.$el.find('.' + this.options.classNames.group + '-active');
		},

		getContainer: function($group) {
			$group = $group || this.getActiveGroup();
			return $group.find('.' + this.options.classNames.container);
		},

		getActiveContainer: function($group) {
			$group = $group || this.getActiveGroup();

			var $activeContainer = $group.find('.' + this.options.classNames.container + '-active');

			if($activeContainer.length === 0) {
				// no container in this group is active, grab the first
				$activeContainer = $group.find('.' + this.options.classNames.container).first();
			}

			return $activeContainer;
		},

		setActiveGroup: function($group) {

			var self = this,
				$oldGroup = this.getActiveGroup(),
				$newActiveContainer = this.getActiveContainer($group);

			// activate when there was no other active group before
			if(this.getActiveGroup().length===0) {
				$group.addClass(this.options.classNames.group + '-active');
			}

			var onLoadContainer = function() { // when grouo switch was successfull

				$oldGroup.removeClass(self.options.classNames.group + '-active');
				self.getContainer($oldGroup).removeClass(self.options.classNames.container).trigger('purge');
				
				$group.addClass(self.options.classNames.group + '-active');

				$newActiveContainer.addClass(self.options.classNames.container + '-active');

				self.resetInterval();

			};

			$newActiveContainer.find('img').bind('load', function() {
				var $this = $(this);
				if($this.attr('src')===$this.attr('jq-gs-src')) {
					onLoadContainer();
				}
			});

			// start caching
			this.setActiveContainer($group, $newActiveContainer);

			if($newActiveContainer.attr('loaded')==='true') {
				// image is already loaded, bypass the loaded event
				onLoadContainer();
			}
		},

		setActiveContainer: function($group, $newContainer) {

			var self = this,
				$oldContainer = this.getActiveContainer($group);

			// bind events
			$oldContainer.unbind('loaded');
			$newContainer.bind('loaded', function() {

				// set $newContainer active
				$newContainer.addClass(self.options.classNames.container + '-active');

				if($oldContainer.attr('jq-gs-src') === $newContainer.attr('jq-gs-src'))
					return; // container is already active

				var done = function() {
					// purge old container when done
					$oldContainer.trigger('purge');
					$oldContainer.removeClass(self.options.classNames.container + '-active');
				}

				if(self.preventAnimation)
					return;

				// JS Fallback if CSS Transitions are not enabled
				if(!self.options.cssTransitions) {

					$newContainer.animate({
						opacity: 1
					}, self.options.duration, function() {
						done();
					});

					$oldContainer.animate({
						opacity: 0
					}, self.options.duration);
					
				} else {
					
					$newContainer.css({
						opacity: 1
					});
					$oldContainer.css({
						opacity: 0
					});

					setTimeout(done, self.options.duration); // suppose css transition wasn't modified

				}

				self.resetInterval();

			});

			// start loading
			$newContainer.trigger('cache');
			
		},

		next: function() {

			var $nextContainer = this.getActiveContainer().next();

			if ($nextContainer.length===0) {
				$nextContainer = this.getActiveGroup().children(":first");
			}

			this.setActiveContainer(this.getActiveGroup(), $nextContainer);

		},

		stop: function() {
			return this.clearInterval();
		},

		start: function() {
			return this.resetInterval();
		},

		clearInterval: function() {
			if(this.interval)
				clearInterval(this.interval);
		},

		resetInterval: function() {

			var self = this;

			this.clearInterval();

			this.interval = setInterval(function() {
				self.next();
			}, this.options.delay);

		},

		updateStylesheet: function() {

			var css = '';

			if(this.options.cssTransitions) {
				var transition = 'opacity ' + (this.options.duration/1000) + 's';
				css = '.' + this.options.classNames.container + ' { -webkit-transition: '+transition+'; -moz-transition: '+transition+'; -o-transition: '+transition+'; transition: '+transition+'; filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=0); opacity: 0; }\n';
				css += '.' + this.options.classNames.container + '-active { filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100); opacity: 1; }';
			}

			this.$style.html(css);

		}

	};

	$.fn[pluginName] = function ( options ) {

		var args = arguments;

		return this.each(function () {

			if (!$.data(this, "plugin_" + pluginName)) {

				$.data(this, "plugin_" + pluginName,
				new Plugin( this, options ));

			} else {

				var plugin = $.data(this, "plugin_" + pluginName);

				// Command
				switch(args[0]) {

					case 'getGroups':

						if(typeof(args[1]) === 'function') {
							args[1](plugin.getGroupNames());
						}

						break;

					case 'switchGroup':

						var $group = plugin.getGroups().filter('.jq-gs-group[group="'+args[1]+'"]');
						plugin.setActiveGroup($group);

						break;

					case 'stop':
						plugin.stop();
						break;

					case 'start':
						plugin.start();
						break;

				}

			}
		});

	};

})( jQuery, window, document );