# Copyright 2020 Radovan Skolnik <radovan@skolnik.info>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class Menu(models.Model):

    _inherit = "website.menu"

    icon = fields.Char("Icon", required=False, translate=True)
    icon_type = fields.Selection(
        [("image", "Image"), ("icon", "Icon")],
        string="Type",
        required=False,
        translate=False,
    )

    # this is straight copy from original code as the set of attributes
    # is defined in sub-function

    # would be better to take a menu_id as argument
    @api.model
    def get_tree(self, website_id, menu_id=None):
        def make_tree(node):
            is_homepage = bool(
                node.page_id
                and self.env["website"].browse(website_id).homepage_id.id
                == node.page_id.id
            )
            menu_node = {
                "fields": {
                    "id": node.id,
                    "name": node.name,
                    "url": node.page_id.url if node.page_id else node.url,
                    "new_window": node.new_window,
                    "is_mega_menu": node.is_mega_menu,
                    "sequence": node.sequence,
                    "parent_id": node.parent_id.id,
                    "icon_type": node.icon_type,
                    "icon": node.icon,
                },
                "children": [],
                "is_homepage": is_homepage,
            }
            for child in node.child_id:
                menu_node["children"].append(make_tree(child))
            return menu_node

        menu = (
            menu_id
            and self.browse(menu_id)
            or self.env["website"].browse(website_id).menu_id
        )
        return make_tree(menu)
