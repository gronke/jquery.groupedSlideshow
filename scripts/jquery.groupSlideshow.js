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
            cssTransitionsEnabled: true
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.el = element;
        this.$el = $(element);

        this.options = $.extend( {}, defaults, options) ;

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
                    self.addImage($group, src);
                });
            });

            // prepare for CSS3 Transitions
            this.$style = $(document.createElement('style')).attr('type', 'text/css');
            this.$el.append(this.$style);
            this.setTransitions();

            // Animarion Loop
            this.resetInterval();

        },

        addGroup: function(name) {
            var $group = $(document.createElement("div")).addClass(this.options.classNames.group).attr("group", name);
            this.$el.append($group);

            if(this.$el.children().length === 1) {
                this.setActiveGroup($group);
            }

            return $group;
        },

        addImage: function($group, src) {
            var $img = $(document.createElement("img")).attr("src", src);
            return this.addContainer($group, $img);
        },

        addContainer: function($group, $container) {
            $container.addClass(this.options.classNames.container);
            $group.append($container);
            
            if($group.children().length === 1) {
                this.setActiveContainer($group, $container);
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

        getActiveContainer: function($group) {
            $group = $group || this.getActiveGroup();
            return $group.find('.' + this.options.classNames.container + '-active');
        },

        setActiveGroup: function($group) {
            this.getActiveGroup().removeClass(this.options.classNames.group + '-active');
            $group.addClass(this.options.classNames.group + '-active');
            this.resetInterval();
        },

        setActiveContainer: function($group, $container) {
            this.getActiveContainer($group).removeClass(this.options.classNames.container + '-active');
            $container.addClass(this.options.classNames.container + '-active');
            this.resetInterval();
        },

        next: function() {

            var $nextContainer = this.getActiveContainer().next();

            if ($nextContainer.length===0) {
                $nextContainer = this.getActiveGroup().children(":first");
            }

            this.setActiveContainer(this.getActiveGroup(), $nextContainer);

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

        setTransitions: function() {

            var css = '';

            if(this.options.cssTransitionsEnabled) {
                var transition = 'opacity ' + (this.options.duration/1000) + 's';
                css = '.' + this.options.classNames.container + ' { -webkit-transition: '+transition+'; -moz-transition: '+transition+'; -o-transition: '+transition+'; transition: '+transition+'; }';
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

                }

            }
        });

    };

})( jQuery, window, document );