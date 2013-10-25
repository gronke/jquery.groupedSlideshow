/*!
 * Grouped slideshow with CSS3 animation
 * Licensed under the MIT license
 */

;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = "groupSlideshow",
        defaults = {
            data: null
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

            // Animarion Loop
            this.resetInterval();

        },

        addGroup: function(name) {
            var $group = $(document.createElement("div")).addClass("jq-gs-group").attr("group", name);
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
            $container.addClass("jq-gs-container");
            $group.append($container);
            
            if($group.children().length === 1) {
                this.setActiveContainer($group, $container);
            }
        },

        getGroups: function() {

            return this.$el.children('.jq-gs-group');

        },

        getGroupNames: function() {

            var groups = [];
            this.getGroups().each(function() {
                groups.push($(this).attr('group'));
            });
            return groups;

        },

        getActiveGroup: function() {
            return this.$el.find(".jq-gs-group-active");
        },

        getActiveContainer: function($group) {
            $group = $group || this.getActiveGroup();
            return $group.find(".jq-gs-container-active");
        },

        setActiveGroup: function($group) {
            console.log('set active group', $group);
            this.getActiveGroup().removeClass('jq-gs-group-active');
            $group.addClass('jq-gs-group-active');
        },

        setActiveContainer: function($group, $container) {
            this.getActiveContainer($group).removeClass('jq-gs-container-active');
            $container.addClass('jq-gs-container-active');
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
            
            setInterval(function() {
                self.next();
            }, this.options.delay);

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