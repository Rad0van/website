Go to each `Website`, click `Edit` and click on menu item. The confirmation
will ask you to choose whether to go to that link or edit the menu.
If you select `Edit the menu` the enhanced menu editor will appear.

.. image:: https://raw.githubusercontent.com/Rad0van/website/website_menu_icon/website_menu_icon/static/description/edit_menu.png

For each menu item it shows preview of icon/image (if any was selected).
It also adds badge to those items that are to be opened in new window.

If you click the `Edit Menu Item` button enhanced menu item editing dialog.

.. image:: https://raw.githubusercontent.com/Rad0van/website/website_menu_icon/website_menu_icon/static/description/edit_item.png

Clicking on search icon will bring up `Select a Media` dialog that will allow
for selecting either image or font awesome icon.

The module itself does not alter rendering of the website menu. This can be achieved
be extending menu rendering in your theme. Something like this:

.. code-block:: XML

      <template id="submenu" inherit_id="website.submenu">
        <!-- append glyphicons -->
        <xpath expr="//li/a" position="attributes">
          <attribute name="t-attf-class" add="text-alpha" separator=" "/>
        </xpath>
        <xpath expr="//li/a/span[@t-field='submenu.name']" position="before">
          <t t-if="submenu.image_type == 'icon'">
            <span t-if="submenu.image" t-attf-class="menu-icon #{submenu.image  or ''}"/>
          </t>
          <t t-elif="submenu.image_type == 'image'">
            <img class="menu-image o_we_custom_image" t-att-src="submenu.image"/>
          </t>
          <t t-else="">
          </t>
        </xpath>
      </template>
