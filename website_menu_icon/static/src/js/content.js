odoo.define("website_menu_icon.menu_entry_dialog", function(require) {
    "use strict";

    var contentMenu = require("website.contentMenu");
    var MediaDialog = require("wysiwyg.widgets.MediaDialog");
    var Dialog = require("web.Dialog");
    var core = require("web.core");

    var MyMenuEntryDialog = contentMenu.MenuEntryDialog.extend({
        template: "website.contentMenu.entry.dialog.icon",
        xmlDependencies: (
            contentMenu.MenuEntryDialog.prototype.xmlDependencies || []
        ).concat(["/website_menu_icon/static/src/xml/website.contentMenu.xml"]),
        events: _.extend({}, contentMenu.MenuEntryDialog.prototype.events, {
            "click i.fa-search": "_onSearchButtonClick",
            "click i.fa-remove": "_onRemoveButtonClick",
        }),

        /**
         * @class
         */
        init: function(parent, options, editable, data) {
            this._super(
                parent,
                _.extend({}, options || {}),
                editable,
                _.extend(
                    {
                        image: data.image,
                        image_type: data.image_type,
                    },
                    data || {}
                )
            );
        },

        /**
         * @override
         */
        start: function() {
            // Ugly hack: rename the is_new_window checkbox to prevent its removal
            var isNewWindowElement = this.$('input[name="is_new_window"]')[0];
            isNewWindowElement.name = "protect_is_new_window";
            this._super.apply(this, arguments);
            // Rename it back
            isNewWindowElement.name = "is_new_window";
        },

        /**
         * Get the link's data (url, label and styles).
         *
         * @private
         * @returns {Object} {label: String, url: String, classes: String, isNewWindow: Boolean, image_type: String, image: String}
         */
        _getData: function() {
            var image = this.$('input[name="image"]').val();
            var image_type = this.$('input[name="image_type"]').val();
            var result = this._super.apply(this, arguments);
            if (result) {
                result.image = image;
                result.image_type = image_type;
            }
            return result;
        },

        _onSearchButtonClick: function() {
            var mediaDialog = new MediaDialog(this, {
                noDocuments: true,
                noIcons: false,
                noVideos: true,
            });
            mediaDialog.on("save", this, result => {
                var targetValueObj = this.$el.find("#o_icon_dialog_label_input_value");
                var targetTypeObj = this.$el.find("#o_icon_dialog_label_input_type");
                if (result instanceof HTMLSpanElement) {
                    targetValueObj.val(result.className);
                    targetTypeObj.val("icon");
                } else if (result instanceof HTMLImageElement) {
                    targetValueObj.val(result.attributes.getNamedItem("src").value);
                    targetTypeObj.val("image");
                } else {
                    targetValueObj.val("Unexpected return element");
                    targetTypeObj.val("none");
                }
            });
            mediaDialog.open();
        },

        _onRemoveButtonClick: function() {
            this.$el.find("#o_icon_dialog_label_input_value").val("");
            this.$el.find("#o_icon_dialog_label_input_type").val("none");
        },
    });

    var MyEditMenuDialog = contentMenu.EditMenuDialog.include({
        template: "website.contentMenu.dialog.edit.icon",
        xmlDependencies: (
            contentMenu.MenuEntryDialog.prototype.xmlDependencies || []
        ).concat(["/website_menu_icon/static/src/xml/website.contentMenu.xml"]),

        // --------------------------------------------------------------------------
        // Handlers
        // --------------------------------------------------------------------------

        /**
         * Called when the "add menu" button is clicked -> Opens the appropriate
         * dialog to edit this new menu.
         *
         * @private
         * @param {Event} ev
         */
        _onAddMenuButtonClick: function(ev) {
            var menuType = ev.currentTarget.dataset.type;
            var dialog = new MyMenuEntryDialog(this, {}, null, {
                menuType: menuType,
            });
            dialog.on("save", this, link => {
                // Hack to get added values - super's _getData() triggers save before we have chance
                // to add the image and image_type values into result, so we use data structure
                var data = dialog._getData();
                var newMenu = {
                    fields: {
                        id: _.uniqueId("new-"),
                        name: link.text,
                        url: link.url,
                        new_window: link.isNewWindow,
                        is_mega_menu: menuType === "mega",
                        sequence: 0,
                        parent_id: false,
                        image: data.image,
                        image_type: data.image_type,
                    },
                    children: [],
                    is_homepage: false,
                };
                this.flat[newMenu.fields.id] = newMenu;
                this.$(".oe_menu_editor").append(
                    core.qweb.render("website.contentMenu.dialog.submenu.icon", {
                        submenu: newMenu,
                    })
                );
            });
            dialog.open();
        },
        /**
         * Called when the "edit menu" button is clicked -> Opens the appropriate
         * dialog to edit this menu.
         *
         * @private
         */
        _onEditMenuButtonClick: function(ev) {
            var $menu = $(ev.currentTarget).closest("[data-menu-id]");
            var menuID = $menu.data("menu-id");
            var menu = this.flat[menuID];
            if (menu) {
                var dialog = new MyMenuEntryDialog(
                    this,
                    {},
                    null,
                    _.extend(
                        {
                            menuType: menu.fields.is_mega_menu ? "mega" : undefined,
                        },
                        menu.fields
                    )
                );
                dialog.on("save", this, link => {
                    // Hack to get added values - save chain prevents inserting it in save method
                    var data = dialog._getData();
                    _.extend(menu.fields, {
                        name: link.text,
                        url: link.url,
                        new_window: data.isNewWindow,
                        image: data.image,
                        image_type: data.image_type,
                    });
                    // Re-render the menu to show new name and image
                    $menu.replaceWith(
                        core.qweb.render("website.contentMenu.dialog.submenu.icon", {
                            submenu: menu,
                        })
                    );
                });
                dialog.open();
            } else {
                Dialog.alert(null, "Could not find menu entry");
            }
        },
    });

    return {
        MyMenuEntryDialog: MyMenuEntryDialog,
        MyEditMenuDialog: MyEditMenuDialog,
    };
});
